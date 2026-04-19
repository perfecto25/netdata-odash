CHARTS_CACHE     = {} of String => {Time, Hash(String, JSON::Any)}
CHARTS_CACHE_MTX = Mutex.new

def cached_charts(node : String) : Hash(String, JSON::Any)
  CHARTS_CACHE_MTX.synchronize do
    entry = CHARTS_CACHE[node]?
    return entry[1] if entry && (Time.utc - entry[0]).total_seconds < 30
  end

  charts_path = node.empty? ? "/api/v1/charts" : "/host/#{node}/api/v1/charts"
  hash = JSON.parse(netdata_get(charts_path))["charts"]?.try(&.as_h) || {} of String => JSON::Any

  CHARTS_CACHE_MTX.synchronize { CHARTS_CACHE[node] = {Time.utc, hash} }
  hash
end

def cached_chart_keys(node : String) : Array(String)
  cached_charts(node).keys
end

def handle_diskdata(ctx : HTTP::Server::Context)
  cors(ctx)
  params = ctx.request.query_params
  node   = params["node"]?   || ""
  prefix = params["prefix"]? || "disk_ops"
  after  = params["after"]?  || "-600"
  points = params["points"]? || "300"

  ctx.response.headers["Content-Type"] = "application/json"

  devices = cached_chart_keys(node)
    .select { |k| k.starts_with?("#{prefix}.") }
    .map    { |k| k.sub("#{prefix}.", "") }
    .uniq
    .first(12)

  if devices.empty?
    ctx.response.print(%({"labels":["time"],"data":[]}))
    return
  end

  data_base = node.empty? ? "/api/v1/data" : "/host/#{node}/api/v1/data"

  # Fetch all devices in parallel via spawned fibers
  channel = Channel({Int32, String}).new(devices.size)
  devices.each_with_index do |dev, i|
    spawn do
      begin
        qs = URI::Params.build do |q|
          q.add "chart",   "#{prefix}.#{dev}"
          q.add "after",   after
          q.add "points",  points
          q.add "format",  "json"
          q.add "options", "ms"
        end
        channel.send({i, netdata_get("#{data_base}?#{qs}")})
      rescue
        channel.send({i, ""})
      end
    end
  end

  results = Array(String).new(devices.size, "")
  devices.size.times { i, body = channel.receive; results[i] = body }

  ref_labels = [] of String
  ref_times  = [] of Float64
  dims_sums  = [] of Array(Float64)
  n_rows     = 0
  n_dims     = 0

  results.each do |body|
    next if body.empty?
    begin
      parsed     = JSON.parse(body)
      raw_labels = parsed["labels"]?.try(&.as_a.map(&.as_s)) || [] of String
      raw_data   = parsed["data"]?.try(&.as_a) || [] of JSON::Any
      next if raw_data.empty?

      if ref_labels.empty?
        ref_labels = raw_labels
        n_dims     = raw_labels.size - 1
        n_rows     = raw_data.size
        ref_times  = raw_data.map { |r| v = r.as_a[0]; v.as_f? || v.as_i64?.try(&.to_f) || 0.0 }
        dims_sums  = Array.new(n_dims) { Array.new(n_rows, 0.0) }
      end

      raw_data.each_with_index do |row, ri|
        next if ri >= n_rows
        row_a = row.as_a
        (0...n_dims).each do |di|
          ci = di + 1
          next if ci >= row_a.size
          v = row_a[ci].as_f? || row_a[ci].as_i64?.try(&.to_f)
          dims_sums[di][ri] += v.abs if v
        end
      end
    rescue
      next
    end
  end

  if ref_times.empty?
    ctx.response.print(%({"labels":["time"],"data":[]}))
    return
  end

  rows = ref_times.each_with_index.map { |ts, ri| [ts] + dims_sums.map(&.[ri]) }.to_a
  ctx.response.print({labels: ref_labels, data: rows}.to_json)
rescue ex
  ctx.response.status = HTTP::Status::BAD_GATEWAY
  ctx.response.print({error: ex.message}.to_json)
end
