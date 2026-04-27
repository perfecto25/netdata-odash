def handle_nodeinfo(ctx : HTTP::Server::Context)
  cors(ctx)

  node = ctx.request.query_params["node"]? || ""
  path = node.empty? ? "/api/v1/info" : "/host/#{node}/api/v1/info"

  begin
    body   = netdata_get(path)
    parsed = JSON.parse(body)

    swap_total_mib = nil
    begin
      swap_path   = node.empty? ? "/api/v1/data?chart=mem.swap&points=1&format=json" : "/host/#{node}/api/v1/data?chart=mem.swap&points=1&format=json"
      swap_parsed = JSON.parse(netdata_get(swap_path))
      labels      = swap_parsed["labels"]?.try(&.as_a.map(&.as_s)) || [] of String
      data_row    = swap_parsed["data"]?.try(&.as_a.last?.try(&.as_a))
      if data_row
        used_idx = labels.index("used")
        free_idx = labels.index("free")
        if used_idx && free_idx
          used_val = data_row[used_idx]?.try(&.as_f?) || 0.0
          free_val = data_row[free_idx]?.try(&.as_f?) || 0.0
          swap_total_mib = (used_val.abs + free_val.abs).round.to_i64
        end
      end
    rescue
    end

    result = {
      hostname:       parsed["hostname"]?.try(&.as_s),
      os_name:        parsed["os_name"]?.try(&.as_s),
      os_version:     parsed["os_version"]?.try(&.as_s),
      architecture:   parsed["architecture"]?.try(&.as_s),
      cores_total:    parsed["cores_total"]?.try(&.as_s),
      ram_total:      parsed["ram_total"]?.try(&.as_s),
      swap_total_mib: swap_total_mib,
    }
    ctx.response.headers["Content-Type"] = "application/json"
    ctx.response.print result.to_json
  rescue ex
    ctx.response.status = HTTP::Status::BAD_GATEWAY
    ctx.response.print({error: ex.message}.to_json)
  end
end
