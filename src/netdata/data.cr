def handle_data(ctx : HTTP::Server::Context)
  cors(ctx)

  params = ctx.request.query_params
  node   = params["node"]? || ""
  chart  = params["chart"]? || "system.cpu"
  after  = params["after"]? || "-600"
  points = params["points"]? || "300"

  qs = URI::Params.build do |q|
    q.add "chart",  chart
    q.add "after",  after
    q.add "points", points
    q.add "format", "json"
    q.add "options", "ms"
  end

  # /host/<hostname>/api/v1/data routes to the specific node on a Netdata parent.
  # The nodes= query param in v1/data is ignored by Netdata v2.x.
  base_path = node.empty? ? "/api/v1/data" : "/host/#{node}/api/v1/data"

  begin
    uri = URI.parse("#{NETDATA_URL}#{base_path}?#{qs}")
    response = HTTP::Client.get(uri)
    ctx.response.print response.body
  rescue ex
    ctx.response.status = HTTP::Status::BAD_GATEWAY
    ctx.response.print({error: ex.message}.to_json)
  end
end
