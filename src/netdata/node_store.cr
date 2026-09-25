# Persists node approval state across restarts. New nodes reported by Netdata
# must be explicitly approved before they appear in the node dropdown.
#
# The file is a best-effort mirror of in-memory state: if it cannot be written
# (read-only path, wrong owner) approvals still work for the life of the
# process and the dashboard keeps serving — they just will not survive a
# restart. Losing persistence must never take /nodes down with it.
module NodeStore
  # Default under systemd's StateDirectory=netdata-odash, which systemd creates
  # with the right ownership. A CWD-relative default is wrong for a service:
  # systemd runs with WorkingDirectory=/.
  PATH = ENV["ODASH_NODES_STORE"]? ||
         ENV["STATE_DIRECTORY"]?.try { |d| File.join(d.split(':').first, "nodes.json") } ||
         "/var/lib/netdata-odash/nodes.json"

  @@mutex = Mutex.new
  @@cache : Data? = nil
  @@write_failed = false

  # A class, not a struct: the cached instance is mutated in place, and struct
  # copy semantics would silently drop `seeded = true`.
  class Data
    include JSON::Serializable
    property seeded : Bool = false
    property approved : Hash(String, String) = {} of String => String
    property rejected : Hash(String, String) = {} of String => String

    def initialize
    end
  end

  private def self.data : Data
    if cached = @@cache
      return cached
    end
    loaded =
      begin
        File.exists?(PATH) ? Data.from_json(File.read(PATH)) : Data.new
      rescue ex
        Log.warn { "Node store unreadable (#{PATH}): #{ex.message} — starting fresh" }
        Data.new
      end
    @@cache = loaded
    loaded
  end

  private def self.persist(data : Data)
    Dir.mkdir_p(File.dirname(PATH))
    File.write(PATH, data.to_json)
    @@write_failed = false
  rescue ex
    unless @@write_failed
      Log.error { "Cannot write node store (#{PATH}): #{ex.message} — node approvals will not survive a restart. Set ODASH_NODES_STORE to a writable path." }
      @@write_failed = true
    end
  end

  # On first run, grandfather in every currently-connected node as approved so
  # existing nodes don't disappear from the dropdown.
  def self.ensure_initialized(raw : Array(NodeInfo)) : Data
    @@mutex.synchronize do
      d = data
      unless d.seeded
        raw.each { |n| d.approved[n.id] = n.hostname }
        d.seeded = true
        persist(d)
      end
      d
    end
  end

  def self.approve(id : String, hostname : String)
    @@mutex.synchronize do
      d = data
      d.rejected.delete(id)
      d.approved[id] = hostname
      persist(d)
    end
  end

  def self.reject(id : String, hostname : String)
    @@mutex.synchronize do
      d = data
      d.approved.delete(id)
      d.rejected[id] = hostname
      persist(d)
    end
  end

  def self.delete(id : String)
    @@mutex.synchronize do
      d = data
      d.approved.delete(id)
      d.rejected.delete(id)
      persist(d)
    end
  end
end
