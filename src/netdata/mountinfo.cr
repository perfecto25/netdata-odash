def mount_dims(node : String, chart : String) : Hash(String, Float64)
  path = node.empty? ? "/api/v1/data" : "/host/#{node}/api/v1/data"
  qs = URI::Params.build do |q|
    q.add "chart",  chart
    q.add "after",  "-30"
    q.add "points", "2"
    q.add "format", "json"
  end
  body   = netdata_get("#{path}?#{qs}")
  parsed = JSON.parse(body)
  labels = parsed["labels"]?.try(&.as_a.map(&.as_s)) || [] of String
  rows   = parsed["data"]?.try(&.as_a) || [] of JSON::Any
  result = {} of String => Float64
  return result if rows.empty?
  row = rows.last.as_a
  labels.each_with_index do |label, i|
    next if i == 0 || i >= row.size
    v = row[i].as_f? || row[i].as_i64?.try(&.to_f)
    result[label] = v.abs if v
  end
  result
rescue
  {} of String => Float64
end

def handle_mountinfo(ctx : HTTP::Server::Context)
  cors(ctx)
  node = ctx.request.query_params["node"]? || ""
  ctx.response.headers["Content-Type"] = "application/json"

  charts_hash = cached_charts(node)

  space_keys = charts_hash.keys
    .select { |k| k.starts_with?("disk_space.") }
    .sort

  mounts = space_keys.map do |chart_id|
    chart_meta = charts_hash[chart_id]?
    title   = chart_meta.try { |m| m["title"]?.try(&.as_s) } || ""
    mount   = title.includes?(" for ") ? title.split(" for ").last : chart_id.sub("disk_space.", "")
    fs_type = chart_meta.try { |m| m["labels"]?.try { |l| l.as_h["filesystem"]?.try(&.as_s) } } || "—"

    space  = mount_dims(node, chart_id)
    inodes = mount_dims(node, chart_id.sub("disk_space.", "disk_inodes."))

    {
      mount:           mount,
      filesystem:      fs_type,
      avail_gib:       space["avail"]? || 0.0,
      used_gib:        space["used"]? || 0.0,
      reserved_gib:    space["reserved_for_root"]? || 0.0,
      avail_inodes:    inodes["avail"]? || 0.0,
      used_inodes:     inodes["used"]? || 0.0,
      reserved_inodes: inodes["reserved_for_root"]? || 0.0,
    }
  end

  ctx.response.print({
    mounts:             mounts,
    total_avail_gib:    mounts.sum(0.0) { |m| m[:avail_gib] },
    total_used_gib:     mounts.sum(0.0) { |m| m[:used_gib] },
    total_avail_inodes: mounts.sum(0.0) { |m| m[:avail_inodes] },
    total_used_inodes:  mounts.sum(0.0) { |m| m[:used_inodes] },
  }.to_json)
rescue ex
  ctx.response.status = HTTP::Status::BAD_GATEWAY
  ctx.response.print({error: ex.message}.to_json)
end
