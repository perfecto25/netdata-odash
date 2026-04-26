module Charts
  module Ipv4Bandwidth
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv4_bandwidth.js") }}
  end

  module Ipv4Bcast
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv4_bcast.js") }}
  end

  module Ipv4Bcastpkts
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv4_bcastpkts.js") }}
  end

  module Ipv4Ecnpkts
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv4_ecnpkts.js") }}
  end

  module Ipv4Errors
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv4_errors.js") }}
  end

  module Ipv4Fragsin
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv4_fragsin.js") }}
  end

  module Ipv4Fragsout
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv4_fragsout.js") }}
  end

  module Ipv4Icmp
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv4_icmp.js") }}
  end

  module Ipv4IcmpErrors
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv4_icmp_errors.js") }}
  end

  module Ipv4Icmpmsg
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv4_icmpmsg.js") }}
  end

  module Ipv4Mcast
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv4_mcast.js") }}
  end

  module Ipv4Mcastpkts
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv4_mcastpkts.js") }}
  end

  module Ipv4Packets
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv4_packets.js") }}
  end

  module Ipv4UdpErrors
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv4_udp_errors.js") }}
  end

  module Ipv4UdpPackets
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv4_udp_packets.js") }}
  end

  module Ipv4Udplite
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipv4_udplite.js") }}
  end
end
