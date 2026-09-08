SENSOR_CATEGORIES = ["temperature", "voltage", "fan", "power"]

# Optional chart groups are gated on the node actually reporting the context.
# Charts declare `requires: '<capability>'` and are never rendered otherwise —
# see chartAvailable() in app.js.
GPU_PROBE_CONTEXT = "amdgpu.gpu_utilization"

def sensor_context(category : String) : String
  "system.hw.sensor.#{category}.input"
end

def handle_capabilities(ctx : HTTP::Server::Context)
  cors(ctx)
  node = ctx.request.query_params["node"]? || ""

  begin
    contexts = Set(String).new
    cached_charts(node).each_value do |meta|
      if c = meta["context"]?.try(&.as_s)
        contexts << c
      end
    end

    caps = {} of String => Bool
    SENSOR_CATEGORIES.each { |cat| caps["sensor.#{cat}"] = contexts.includes?(sensor_context(cat)) }
    caps["gpu.amd"] = contexts.includes?(GPU_PROBE_CONTEXT)

    ctx.response.print({capabilities: caps}.to_json)
  rescue ex
    ctx.response.status = HTTP::Status::BAD_GATEWAY
    ctx.response.print({error: ex.message}.to_json)
  end
end
