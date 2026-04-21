def handle_appswapdata(ctx : HTTP::Server::Context)
  cors(ctx)
  params = ctx.request.query_params
  node   = params["node"]?   || ""
  after  = params["after"]?  || "-600"
  points = params["points"]? || "300"

  ctx.response.headers["Content-Type"] = "application/json"

  app_charts = cached_chart_keys(node)
    .select { |k| k.starts_with?("app.") && k.ends_with?("_swap_usage") }
    .first(60)

  if app_charts.empty?
    ctx.response.print(%({"labels":["time"],"data":[]}))
    return
  end

  app_names = app_charts.map { |k| k.sub(/^app\./, "").sub(/_swap_usage$/, "") }
  data_base = node.empty? ? "/api/v1/data" : "/host/#{node}/api/v1/data"

  channel = Channel({Int32, String}).new(app_charts.size)
  app_charts.each_with_index do |chart, i|
    spawn do
      begin
        qs = URI::Params.build do |q|
          q.add "chart",   chart
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

  results = Array(String).new(app_charts.size, "")
  app_charts.size.times { i, body = channel.receive; results[i] = body }

  ref_times = [] of Float64
  n_rows    = 0

  results.each do |body|
    next if body.empty?
    begin
      parsed   = JSON.parse(body)
      raw_data = parsed["data"]?.try(&.as_a) || [] of JSON::Any
      next if raw_data.empty?
      ref_times = raw_data.map { |r| v = r.as_a[0]; v.as_f? || v.as_i64?.try(&.to_f) || 0.0 }
      n_rows    = raw_data.size
      break
    rescue
    end
  end

  if ref_times.empty?
    ctx.response.print(%({"labels":["time"],"data":[]}))
    return
  end

  series = results.map do |body|
    if body.empty?
      Array.new(n_rows, 0.0)
    else
      begin
        parsed   = JSON.parse(body)
        raw_data = parsed["data"]?.try(&.as_a) || [] of JSON::Any
        if raw_data.empty?
          Array.new(n_rows, 0.0)
        else
          raw_data.first(n_rows).map do |row|
            row_a = row.as_a
            v = row_a[1]?.try { |x| x.as_f? || x.as_i64?.try(&.to_f) }
            v ? v.abs : 0.0
          end
        end
      rescue
        Array.new(n_rows, 0.0)
      end
    end
  end

  labels = ["time"] + app_names
  rows   = ref_times.each_with_index.map { |ts, ri| [ts] + series.map { |s| s[ri]? || 0.0 } }.to_a

  ctx.response.print({labels: labels, data: rows}.to_json)
rescue ex
  ctx.response.status = HTTP::Status::BAD_GATEWAY
  ctx.response.print({error: ex.message}.to_json)
end
