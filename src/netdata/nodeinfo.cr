def handle_nodeinfo(ctx : HTTP::Server::Context)
  cors(ctx)

  node = ctx.request.query_params["node"]? || ""
  path = node.empty? ? "/api/v1/info" : "/host/#{node}/api/v1/info"

  begin
    body   = netdata_get(path)
    parsed = JSON.parse(body)
    result = {
      hostname:     parsed["hostname"]?.try(&.as_s),
      os_name:      parsed["os_name"]?.try(&.as_s),
      os_version:   parsed["os_version"]?.try(&.as_s),
      architecture: parsed["architecture"]?.try(&.as_s),
      cores_total:  parsed["cores_total"]?.try(&.as_s),
      ram_total:    parsed["ram_total"]?.try(&.as_s),
    }
    ctx.response.headers["Content-Type"] = "application/json"
    ctx.response.print result.to_json
  rescue ex
    ctx.response.status = HTTP::Status::BAD_GATEWAY
    ctx.response.print({error: ex.message}.to_json)
  end
end
