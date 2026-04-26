module Charts
  module TcpAcceptQueue
    JS = {{ read_file("#{__DIR__}/../../public/charts/tcp_accept_queue.js") }}
  end

  module TcpConnAborts
    JS = {{ read_file("#{__DIR__}/../../public/charts/tcp_conn_aborts.js") }}
  end

  module TcpConnections
    JS = {{ read_file("#{__DIR__}/../../public/charts/tcp_connections.js") }}
  end

  module TcpErrors
    JS = {{ read_file("#{__DIR__}/../../public/charts/tcp_errors.js") }}
  end

  module TcpHandshake
    JS = {{ read_file("#{__DIR__}/../../public/charts/tcp_handshake.js") }}
  end

  module TcpMemPressures
    JS = {{ read_file("#{__DIR__}/../../public/charts/tcp_mem_pressures.js") }}
  end

  module TcpOfoQueue
    JS = {{ read_file("#{__DIR__}/../../public/charts/tcp_ofo_queue.js") }}
  end

  module TcpOpens
    JS = {{ read_file("#{__DIR__}/../../public/charts/tcp_opens.js") }}
  end

  module TcpPackets
    JS = {{ read_file("#{__DIR__}/../../public/charts/tcp_packets.js") }}
  end

  module TcpReorders
    JS = {{ read_file("#{__DIR__}/../../public/charts/tcp_reorders.js") }}
  end

  module TcpSynCookies
    JS = {{ read_file("#{__DIR__}/../../public/charts/tcp_syn_cookies.js") }}
  end

  module TcpSynQueue
    JS = {{ read_file("#{__DIR__}/../../public/charts/tcp_syn_queue.js") }}
  end
end
