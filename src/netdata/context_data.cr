# Netdata's own sensor dashboards aggregate temperature with MAX (the hottest
# probe on a chip is the signal); everything else reads better as an average.
SENSOR_AGGREGATION = {"temperature" => "max"}

GPU_CONTEXTS = [
  "amdgpu.gpu_utilization",
  "amdgpu.gpu_mem_utilization",
  "amdgpu.gpu_clk_frequency",
  "amdgpu.gpu_mem_clk_frequency",
  "amdgpu.gpu_mem_vram_usage_perc",
  "amdgpu.gpu_mem_vram_usage",
  "amdgpu.gpu_mem_vis_vram_usage_perc",
  "amdgpu.gpu_mem_vis_vram_usage",
  "amdgpu.gpu_mem_gtt_usage_perc",
  "amdgpu.gpu_mem_gtt_usage",
]

EMPTY_SERIES = {labels: ["time"], data: [] of Array(Float64?)}

# v2 returns each point as [value, anomaly_rate, annotations]; v1 returns a bare number.
private def point_value(cell : JSON::Any) : Float64?
  if (arr = cell.as_a?)
    return nil if arr.empty?
    arr[0].as_f? || arr[0].as_i64?.try(&.to_f)
  else
    cell.as_f? || cell.as_i64?.try(&.to_f)
  end
end

# Pulls every instance of a context in a single v2 query and reshapes it into
# the same {labels, data} shape /data returns, so the regular chart path can
# consume it unchanged. Instance chart ids are unusable as chart= keys here —
# they embed device names (spaces and all), and there can be 100+ of them.
#
# Multi-dimension contexts (e.g. free/used) group by dimension to keep those
# apart; single-dimension ones group by `group_label` so each device gets a line.
def context_series(node : String, context : String, group_label : String,
                   aggregation : String, after : String, points : String)
  charts_hash = cached_charts(node)
  match = charts_hash.find { |_, meta| meta["context"]?.try(&.as_s) == context }
  return EMPTY_SERIES unless match
  dim_count = match[1]["dimensions"]?.try(&.as_h.size) || 1

  qs = URI::Params.build do |q|
    q.add "contexts", context
    q.add "nodes", node unless node.empty?
    q.add "after", after
    q.add "points", points
    q.add "aggregation", aggregation
    if dim_count > 1
      q.add "group_by", "dimension"
    else
      q.add "group_by", "label"
      q.add "group_by_label", group_label
    end
  end

  parsed = JSON.parse(netdata_get("/api/v2/data?#{qs}"))
  result = parsed["result"]?
  labels = result.try(&.["labels"]?).try(&.as_a.map(&.as_s)) || [] of String
  raw    = result.try(&.["data"]?).try(&.as_a) || [] of JSON::Any
  return EMPTY_SERIES if labels.size < 2 || raw.empty?

  rows = raw.map do |row|
    cells = row.as_a
    out = Array(Float64?).new(cells.size)
    cells.each_with_index do |cell, i|
      if i == 0
        # v2 timestamps are seconds; /data (v1) uses ms and the frontend divides by 1000
        out << ((cell.as_f? || cell.as_i64?.try(&.to_f) || 0.0) * 1000)
      else
        out << point_value(cell)
      end
    end
    out
  end

  {labels: labels, data: rows}
end

def handle_sensordata(ctx : HTTP::Server::Context)
  cors(ctx)
  params   = ctx.request.query_params
  node     = params["node"]?   || ""
  category = params["prefix"]? || "temperature"
  after    = params["after"]?  || "-600"
  points   = params["points"]? || "300"

  begin
    unless SENSOR_CATEGORIES.includes?(category)
      ctx.response.print EMPTY_SERIES.to_json
      return
    end

    ctx.response.print context_series(
      node, sensor_context(category), "chip_id",
      SENSOR_AGGREGATION[category]? || "avg", after, points).to_json
  rescue ex
    ctx.response.status = HTTP::Status::BAD_GATEWAY
    ctx.response.print({error: ex.message}.to_json)
  end
end

def handle_gpudata(ctx : HTTP::Server::Context)
  cors(ctx)
  params  = ctx.request.query_params
  node    = params["node"]?   || ""
  context = params["prefix"]? || ""
  after   = params["after"]?  || "-600"
  points  = params["points"]? || "300"

  begin
    unless GPU_CONTEXTS.includes?(context)
      ctx.response.print EMPTY_SERIES.to_json
      return
    end

    ctx.response.print context_series(node, context, "product_name", "avg", after, points).to_json
  rescue ex
    ctx.response.status = HTTP::Status::BAD_GATEWAY
    ctx.response.print({error: ex.message}.to_json)
  end
end
