# Persists node approval state across restarts. New nodes reported by Netdata
# must be explicitly approved before they appear in the node dropdown.
module NodeStore
  PATH = ENV["ODASH_NODES_STORE"]? || "./odash_nodes.json"

  @@mutex = Mutex.new

  struct Data
    include JSON::Serializable
    property seeded : Bool = false
    property approved : Hash(String, String) = {} of String => String
    property rejected : Hash(String, String) = {} of String => String

    def initialize
    end
  end

  def self.load : Data
    return Data.new unless File.exists?(PATH)
    Data.from_json(File.read(PATH))
  rescue ex
    Log.warn { "Failed to read node store, starting fresh: #{ex.message}" }
    Data.new
  end

  def self.save(data : Data)
    File.write(PATH, data.to_json)
  end

  # On first run, grandfather in every currently-connected node as approved so
  # existing nodes don't disappear from the dropdown.
  def self.ensure_initialized(raw : Array(NodeInfo)) : Data
    @@mutex.synchronize do
      data = load
      unless data.seeded
        raw.each { |n| data.approved[n.id] = n.hostname }
        data.seeded = true
        save(data)
      end
      data
    end
  end

  def self.approve(id : String, hostname : String)
    @@mutex.synchronize do
      data = load
      data.rejected.delete(id)
      data.approved[id] = hostname
      save(data)
    end
  end

  def self.reject(id : String, hostname : String)
    @@mutex.synchronize do
      data = load
      data.approved.delete(id)
      data.rejected[id] = hostname
      save(data)
    end
  end

  def self.delete(id : String)
    @@mutex.synchronize do
      data = load
      data.approved.delete(id)
      data.rejected.delete(id)
      save(data)
    end
  end
end
