def disk_latest(node : String, chart : String, dim : String) : Float64
  path = node.empty? ? "/api/v1/data" : "/host/#{node}/api/v1/data"
  qs = URI::Params.build do |q|
    q.add "chart",   chart
    q.add "after",   "-30"
    q.add "points",  "5"
    q.add "format",  "json"
    q.add "options", "ms"
  end
  body   = netdata_get("#{path}?#{qs}")
  parsed = JSON.parse(body)
  labels = parsed["labels"]?.try(&.as_a.map(&.as_s)) || [] of String
  rows   = parsed["data"]?.try(&.as_a) || [] of JSON::Any
  return 0.0 if rows.empty?
  idx = labels.index(dim)
  return 0.0 unless idx
  (rows.last.as_a?).try(&.[idx]?).try(&.as_f?).try(&.abs) || 0.0
rescue
  0.0
end

def handle_diskinfo(ctx : HTTP::Server::Context)
  cors(ctx)
  node = ctx.request.query_params["node"]? || ""

  charts_path = node.empty? ? "/api/v1/charts" : "/host/#{node}/api/v1/charts"
  body        = netdata_get(charts_path)
  parsed      = JSON.parse(body)
  chart_keys  = parsed["charts"]?.try(&.as_h.keys) || [] of String

  devices = chart_keys
    .select { |k| k.starts_with?("disk.") }
    .map    { |k| k.sub("disk.", "") }
    .uniq
    .first(12)

  result = devices.map do |dev|
    {
      name:       dev,
      reads_kib:  disk_latest(node, "disk.#{dev}",       "reads"),
      writes_kib: disk_latest(node, "disk.#{dev}",       "writes"),
      reads_ops:  disk_latest(node, "disk_ops.#{dev}",   "reads"),
      writes_ops: disk_latest(node, "disk_ops.#{dev}",   "writes"),
      reads_ms:   disk_latest(node, "disk_await.#{dev}", "reads"),
      writes_ms:  disk_latest(node, "disk_await.#{dev}", "writes"),
      util_pct:   disk_latest(node, "disk_util.#{dev}",  "utilization"),
    }
  end

  ctx.response.headers["Content-Type"] = "application/json"
  ctx.response.print({
    devices:          result,
    total_reads_ops:  result.sum { |d| d[:reads_ops] },
    total_writes_ops: result.sum { |d| d[:writes_ops] },
    total_reads_kib:  result.sum { |d| d[:reads_kib] },
    total_writes_kib: result.sum { |d| d[:writes_kib] },
    max_util:         result.map { |d| d[:util_pct] }.max? || 0.0,
  }.to_json)
rescue ex
  ctx.response.status = HTTP::Status::BAD_GATEWAY
  ctx.response.print({error: ex.message}.to_json)
end
