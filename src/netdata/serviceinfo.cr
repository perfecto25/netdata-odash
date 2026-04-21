def handle_serviceinfo(ctx : HTTP::Server::Context)
  cors(ctx)
  node = ctx.request.query_params["node"]? || ""

  services = cached_chart_keys(node)
    .select { |k| k.starts_with?("app.") && k.ends_with?("_cpu_utilization") }
    .map    { |k| k.sub(/^app\./, "").sub(/_cpu_utilization$/, "") }
    .uniq
    .sort
    .first(200)

  result = services.map do |svc|
    {
      name:       svc,
      cpu_user:   net_latest(node, "app.#{svc}_cpu_utilization",   "user"),
      cpu_system: net_latest(node, "app.#{svc}_cpu_utilization",   "system"),
      mem_mib:    net_latest(node, "app.#{svc}_mem_private_usage", "mem"),
      disk_read:  net_latest(node, "app.#{svc}_disk_physical_io",  "reads"),
      disk_write: net_latest(node, "app.#{svc}_disk_physical_io",  "writes"),
    }
  end

  ctx.response.headers["Content-Type"] = "application/json"
  ctx.response.print({services: result}.to_json)
rescue ex
  ctx.response.status = HTTP::Status::BAD_GATEWAY
  ctx.response.print({error: ex.message}.to_json)
end
