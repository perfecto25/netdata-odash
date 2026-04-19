def net_latest(node : String, chart : String, dim : String) : Float64
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

def handle_netinfo(ctx : HTTP::Server::Context)
  cors(ctx)
  node = ctx.request.query_params["node"]? || ""

  interfaces = cached_chart_keys(node)
    .select { |k| k.starts_with?("net.") }
    .map    { |k| k.sub("net.", "") }
    .uniq
    .first(20)

  result = interfaces.map do |iface|
    {
      name:        iface,
      recv_kbps:   net_latest(node, "net.#{iface}",         "received"),
      sent_kbps:   net_latest(node, "net.#{iface}",         "sent"),
      recv_pkts:   net_latest(node, "net_packets.#{iface}", "received"),
      sent_pkts:   net_latest(node, "net_packets.#{iface}", "sent"),
      mcast_pkts:  net_latest(node, "net_packets.#{iface}", "multicast"),
      errors_in:   net_latest(node, "net_errors.#{iface}",  "inbound"),
      errors_out:  net_latest(node, "net_errors.#{iface}",  "outbound"),
      drops_in:    net_latest(node, "net_drops.#{iface}",   "inbound"),
      drops_out:   net_latest(node, "net_drops.#{iface}",   "outbound"),
    }
  end

  ctx.response.headers["Content-Type"] = "application/json"
  ctx.response.print({
    interfaces:       result,
    total_recv_kbps:  result.sum(0.0) { |i| i[:recv_kbps] },
    total_sent_kbps:  result.sum(0.0) { |i| i[:sent_kbps] },
    total_errors:     result.sum(0.0) { |i| i[:errors_in] + i[:errors_out] },
    total_drops:      result.sum(0.0) { |i| i[:drops_in]  + i[:drops_out] },
  }.to_json)
rescue ex
  ctx.response.status = HTTP::Status::BAD_GATEWAY
  ctx.response.print({error: ex.message}.to_json)
end
