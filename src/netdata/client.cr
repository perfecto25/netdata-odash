NETDATA_URL = (ENV["NETDATA_URL"]? || "http://localhost:19999").rstrip('/')

def netdata_get(path : String) : String
  uri = URI.parse(NETDATA_URL + path)
  response = HTTP::Client.get(uri)
  raise "Netdata error #{response.status_code}: #{path}" unless response.success?
  response.body
end
