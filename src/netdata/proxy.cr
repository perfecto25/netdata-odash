def handle_proxy(ctx : HTTP::Server::Context)
  cors(ctx)

  params  = ctx.request.query_params
  nd_path = params["path"]? || ""
  extra_q = params["q"]? || ""

  unless nd_path.starts_with?("/api/")
    ctx.response.status = HTTP::Status::BAD_REQUEST
    ctx.response.print({error: "invalid path"}.to_json)
    return
  end

  forward = NETDATA_URL + nd_path
  forward += "?#{extra_q}" unless extra_q.empty?

  begin
    response = HTTP::Client.get(URI.parse(forward))
    ctx.response.print response.body
  rescue ex
    ctx.response.status = HTTP::Status::BAD_GATEWAY
    ctx.response.print({error: ex.message}.to_json)
  end
end
