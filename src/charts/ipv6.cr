module Charts
  module Ipv6Bandwidth
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv6_bandwidth.js") }}
  end

  module Ipv6Bcast
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv6_bcast.js") }}
  end

  module Ipv6Errors
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv6_errors.js") }}
  end

  module Ipv6ErrorsLine
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv6_errors_line.js") }}
  end

  module Ipv6Fragsin
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv6_fragsin.js") }}
  end

  module Ipv6Fragsout
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv6_fragsout.js") }}
  end

  module Ipv6Mcast
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv6_mcast.js") }}
  end

  module Ipv6Mcastpkts
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv6_mcastpkts.js") }}
  end

  module Ipv6Packets
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv6_packets.js") }}
  end

  module Ipv6PacketsLine
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv6_packets_line.js") }}
  end

  module Ipv6Udperrors
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv6_udperrors.js") }}
  end

  module Ipv6UdperrorsLine
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv6_udperrors_line.js") }}
  end

  module Ipv6Udplitepackets
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv6_udplitepackets.js") }}
  end

  module Ipv6UdplitepacketsLine
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv6_udplitepackets_line.js") }}
  end

  module Ipv6Udppackets
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv6_udppackets.js") }}
  end

  module Ipv6UdppacketsLine
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv6_udppackets_line.js") }}
  end
end
