SENSOR_CATEGORIES = ["temperature", "voltage", "fan", "power"]

# Optional chart groups are gated on the node actually reporting the context.
# Charts declare `requires: '<capability>'` and are never rendered otherwise —
# see chartAvailable() in app.js.
GPU_PROBE_CONTEXT = "amdgpu.gpu_utilization"

# Sensor data comes from different collectors depending on the agent version
# and which one is enabled, each with its own context and chip label:
#   debugfs.plugin libsensors (v2.x)  → system.hw.sensor.<cat>.input, chip_id
#   go.d sensors (v2.x)               → sensors.chip_sensor_<cat>,    chip_id
#   go.d sensors (v1.4x)              → sensors.sensor_<cat>,         chip
# The first one the node reports wins.
SENSOR_SOURCES = {
  "temperature" => [{"system.hw.sensor.temperature.input", "chip_id"},
                    {"sensors.chip_sensor_temperature", "chip_id"},
                    {"sensors.sensor_temperature", "chip"}],
  "voltage"     => [{"system.hw.sensor.voltage.input", "chip_id"},
                    {"sensors.chip_sensor_voltage", "chip_id"},
                    {"sensors.sensor_voltage", "chip"}],
  "fan"         => [{"system.hw.sensor.fan.input", "chip_id"},
                    {"sensors.chip_sensor_fan", "chip_id"},
                    {"sensors.sensor_fan_speed", "chip"}],
  "power"       => [{"system.hw.sensor.power.input", "chip_id"},
                    {"sensors.chip_sensor_power", "chip_id"},
                    {"sensors.sensor_power", "chip"}],
}

# Only debugfs.plugin produces the temperature histogram.
SENSOR_HISTOGRAM_CONTEXT = "system.hw.sensor.temperature.histogram"

def node_contexts(node : String) : Set(String)
  contexts = Set(String).new
  cached_charts(node).each_value do |meta|
    if c = meta["context"]?.try(&.as_s)
      contexts << c
    end
  end
  contexts
end

# {context, group_label} of the first sensor source this node reports, if any.
def sensor_source(contexts : Set(String), category : String) : Tuple(String, String)?
  SENSOR_SOURCES[category]?.try(&.find { |(ctx, _)| contexts.includes?(ctx) })
end

def handle_capabilities(ctx : HTTP::Server::Context)
  cors(ctx)
  node = ctx.request.query_params["node"]? || ""

  begin
    contexts = node_contexts(node)

    caps = {} of String => Bool
    SENSOR_CATEGORIES.each { |cat| caps["sensor.#{cat}"] = !sensor_source(contexts, cat).nil? }
    caps["sensor.temperature_histogram"] = contexts.includes?(SENSOR_HISTOGRAM_CONTEXT)
    caps["gpu.amd"] = contexts.includes?(GPU_PROBE_CONTEXT)

    ctx.response.print({capabilities: caps}.to_json)
  rescue ex
    ctx.response.status = HTTP::Status::BAD_GATEWAY
    ctx.response.print({error: ex.message}.to_json)
  end
end
