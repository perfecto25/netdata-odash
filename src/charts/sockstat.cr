module Charts
  module SockstatFragMem
    JS = {{ read_file("#{__DIR__}/../../public/charts/sockstat_frag_mem.js") }}
  end
  
  module SockstatFragSockets
    JS = {{ read_file("#{__DIR__}/../../public/charts/sockstat_frag_sockets.js") }}
  end
  
  module SockstatRawSockets
    JS = {{ read_file("#{__DIR__}/../../public/charts/sockstat_raw_sockets.js") }}
  end
  
  module SockstatSockets
    JS = {{ read_file("#{__DIR__}/../../public/charts/sockstat_sockets.js") }}
  end
  
  module SockstatTcpMem
    JS = {{ read_file("#{__DIR__}/../../public/charts/sockstat_tcp_mem.js") }}
  end
  
  module SockstatTcpSockets
    JS = {{ read_file("#{__DIR__}/../../public/charts/sockstat_tcp_sockets.js") }}
  end
  
  module SockstatUdpMem
    JS = {{ read_file("#{__DIR__}/../../public/charts/sockstat_udp_mem.js") }}
  end
  
  module SockstatUdpSockets
    JS = {{ read_file("#{__DIR__}/../../public/charts/sockstat_udp_sockets.js") }}
  end
  
  module SockstatUdpliteSockets
    JS = {{ read_file("#{__DIR__}/../../public/charts/sockstat_udplite_sockets.js") }}
  end
  
  
end
