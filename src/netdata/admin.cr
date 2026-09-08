# GET /admin/nodes — pending (unclassified) nodes awaiting approval, and the
# currently approved node list (for the delete dropdown).
def handle_admin_nodes(ctx : HTTP::Server::Context)
  cors(ctx)

  begin
    raw = fetch_raw_nodes
    store = NodeStore.ensure_initialized(raw)
    known = (store.approved.keys + store.rejected.keys).to_set
    pending = raw.reject { |n| known.includes?(n.id) }
    approved = store.approved.map { |id, hostname| {id: id, hostname: hostname} }
    ctx.response.print({pending: pending, approved: approved}.to_json)
  rescue ex
    ctx.response.status = HTTP::Status::BAD_GATEWAY
    ctx.response.print({error: ex.message}.to_json)
  end
end

private def read_node_id_hostname(ctx : HTTP::Server::Context)
  raw_body = ctx.request.body.try(&.gets_to_end) || ""
  parsed = JSON.parse(raw_body)
  id = parsed["id"].as_s
  hostname = parsed["hostname"]?.try(&.as_s) || id
  {id, hostname}
end

def handle_admin_approve(ctx : HTTP::Server::Context)
  cors(ctx)
  begin
    id, hostname = read_node_id_hostname(ctx)
    NodeStore.approve(id, hostname)
    ctx.response.print({ok: true}.to_json)
  rescue ex
    ctx.response.status = HTTP::Status::BAD_REQUEST
    ctx.response.print({error: ex.message}.to_json)
  end
end

def handle_admin_reject(ctx : HTTP::Server::Context)
  cors(ctx)
  begin
    id, hostname = read_node_id_hostname(ctx)
    NodeStore.reject(id, hostname)
    ctx.response.print({ok: true}.to_json)
  rescue ex
    ctx.response.status = HTTP::Status::BAD_REQUEST
    ctx.response.print({error: ex.message}.to_json)
  end
end

def handle_admin_delete(ctx : HTTP::Server::Context)
  cors(ctx)
  begin
    id, _hostname = read_node_id_hostname(ctx)
    NodeStore.delete(id)
    ctx.response.print({ok: true}.to_json)
  rescue ex
    ctx.response.status = HTTP::Status::BAD_REQUEST
    ctx.response.print({error: ex.message}.to_json)
  end
end
