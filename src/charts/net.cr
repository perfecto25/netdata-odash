module Charts
  module NetCarrier
    JS = {{ read_file("#{__DIR__}/../../public/charts/net_carrier.js") }}
  end

  module NetDrops
    JS = {{ read_file("#{__DIR__}/../../public/charts/net_drops.js") }}
  end

  module NetDuplex
    JS = {{ read_file("#{__DIR__}/../../public/charts/net_duplex.js") }}
  end

  module NetErrors
    JS = {{ read_file("#{__DIR__}/../../public/charts/net_errors.js") }}
  end

  module NetEvents
    JS = {{ read_file("#{__DIR__}/../../public/charts/net_events.js") }}
  end

  module NetFifo
    JS = {{ read_file("#{__DIR__}/../../public/charts/net_fifo.js") }}
  end

  module NetMtu
    JS = {{ read_file("#{__DIR__}/../../public/charts/net_mtu.js") }}
  end

  module NetOperstate
    JS = {{ read_file("#{__DIR__}/../../public/charts/net_operstate.js") }}
  end

  module NetPackets
    JS = {{ read_file("#{__DIR__}/../../public/charts/net_packets.js") }}
  end

  module NetSpeed
    JS = {{ read_file("#{__DIR__}/../../public/charts/net_speed.js") }}
  end

  module Nettable
    JS = {{ read_file("#{__DIR__}/../../public/charts/nettable.js") }}
  end

  module Network
    JS = {{ read_file("#{__DIR__}/../../public/charts/network.js") }}
  end
end
