struct NodeInfo
  include JSON::Serializable
  property id : String
  property hostname : String
  property ram_mib : Int64?

  def initialize(@id, @hostname, @ram_mib = nil)
  end
end

def handle_nodes(ctx : HTTP::Server::Context)
  cors(ctx)

  # Try v2 nodes endpoint first (Netdata Parent / streaming setup)
  begin
    body = netdata_get("/api/v2/nodes")
    parsed = JSON.parse(body)
    nodes_json = parsed["nodes"]?
    if nodes_json && nodes_json.as_a.size > 0
      nodes = nodes_json.as_a.map do |n|
        id       = n["mg"]?.try(&.as_s) || n["nm"]?.try(&.as_s) || "unknown"
        hostname = n["nm"]?.try(&.as_s) || id
        ram_mib  = n["hw"]?.try(&.["memory"]?).try(&.as_s.to_i64?).try { |b| b // (1024_i64 * 1024_i64) }
        NodeInfo.new(id, hostname, ram_mib)
      end
      ctx.response.print nodes.to_json
      return
    end
  rescue ex
    Log.warn { "v2/nodes failed: #{ex.message}, falling back to v1/info" }
  end

  # Fallback: v1/info (local / standalone node)
  begin
    body = netdata_get("/api/v1/info")
    parsed = JSON.parse(body)
    hostname = parsed["hostname"]?.try(&.as_s) || "localhost"
    id       = parsed["uid"]?.try(&.as_s) || hostname
    ctx.response.print [NodeInfo.new(id, hostname)].to_json
  rescue ex
    ctx.response.status = HTTP::Status::BAD_GATEWAY
    ctx.response.print({error: ex.message}.to_json)
  end
end
