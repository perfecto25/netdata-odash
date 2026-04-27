require "http/server"
require "http/client"
require "json"
require "uri"
require "log"
require "option_parser"

# ── Version ────────────────────────────────────────────────────────────────────

SHARD_YML = {{ read_file("#{__DIR__}/../shard.yml") }}
VERSION    = SHARD_YML.lines.find { |l| l.starts_with?("version:") }.not_nil!.split(": ", 2).last.strip

# ── CLI Options ────────────────────────────────────────────────────────────────

netdata_port_opt : String? = nil
odash_port_opt   : String? = nil

OptionParser.parse do |p|
  p.banner = "Usage: netdata-odash [options]"
  p.on("--netdata-port PORT", "Netdata parent port (env: NETDATA_PORT, default: 19999)") { |v| netdata_port_opt = v }
  p.on("--odash-port PORT",   "Dashboard listen port (env: ODASH_PORT, default: 8080)")  { |v| odash_port_opt = v }
  p.on("--help", "Show version and options") do
    puts "netdata-odash #{VERSION}"
    puts p
    exit 0
  end
  p.invalid_option { |flag| STDERR.puts "Unknown option: #{flag}"; STDERR.puts "Run with --help for usage."; exit 1 }
end

# CLI flag > env var > default. Set NETDATA_URL so client.cr picks up the right value.
if (port = netdata_port_opt || ENV["NETDATA_PORT"]?)
  base = ENV["NETDATA_URL"]? || "http://localhost:19999"
  uri  = URI.parse(base)
  ENV["NETDATA_URL"] = "#{uri.scheme}://#{uri.host}:#{port}"
end

ENV["ODASH_PORT"] = odash_port_opt if odash_port_opt

require "./netdata/client"
require "./netdata/cors"
require "./netdata/nodes"
require "./netdata/data"
require "./netdata/proxy"
require "./netdata/nodeinfo"
require "./netdata/diskdata"
require "./netdata/diskinfo"
require "./netdata/mountinfo"
require "./netdata/netinfo"
require "./charts/clock"
require "./charts/cpu"
require "./charts/disk"
require "./charts/disktable"
require "./charts/ipc"
require "./charts/ipv4"
require "./charts/ipv6"
require "./charts/irq"
require "./charts/load"
require "./charts/mem"
require "./charts/mountpoints"
require "./charts/net"
require "./charts/nfs"
require "./charts/processes"
require "./charts/servicetable"
require "./charts/sockstat"
require "./charts/tcp"
require "./charts/uptime"
require "./netdata/appswapdata"
require "./netdata/serviceinfo"
require "./frontend"

# ── Config ─────────────────────────────────────────────────────────────────────

PORT = (ENV["ODASH_PORT"]? || "8080").to_i

Log.setup_from_env

# ── Router ─────────────────────────────────────────────────────────────────────

server = HTTP::Server.new do |ctx|
  path = ctx.request.path

  case path
  when "/nodes"
    handle_nodes(ctx)
  when "/nodeinfo"
    handle_nodeinfo(ctx)
  when "/diskinfo"
    handle_diskinfo(ctx)
  when "/diskdata"
    handle_diskdata(ctx)
  when "/mountinfo"
    handle_mountinfo(ctx)
  when "/netinfo"
    handle_netinfo(ctx)
  when "/data"
    handle_data(ctx)
  when "/proxy"
    handle_proxy(ctx)
  when "/app.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Frontend::APP_JS
  when "/charts/cpu.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Cpu::JS
  when "/charts/cpu_interrupts.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::CpuInterrupts::JS
  when "/charts/irq_pressure.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::IrqPressure::JS
  when "/charts/irq_pressure_stall.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::IrqPressureStall::JS
  when "/charts/cpu_some_pressure.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::CpuSomePressure::JS
  when "/charts/cpu_some_pressure_stall.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::CpuSomePressureStall::JS
  when "/charts/mem_some_pressure.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemSomePressure::JS
  when "/charts/mem_some_pressure_stall.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemSomePressureStall::JS
  when "/charts/mem_full_pressure.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemFullPressure::JS
  when "/charts/mem_full_pressure_stall.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemFullPressureStall::JS
  when "/charts/io_some_pressure.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::IoSomePressure::JS
  when "/charts/io_some_pressure_stall.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::IoSomePressureStall::JS
  when "/charts/io_full_pressure.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::IoFullPressure::JS
  when "/charts/io_full_pressure_stall.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::IoFullPressureStall::JS
  when "/charts/processes_all.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::ProcessesAll::JS
  when "/charts/processes_forks.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::ProcessesForks::JS
  when "/charts/processes_ctxt.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::ProcessesCtxt::JS
  when "/charts/processes_fds.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::ProcessesFds::JS
  when "/charts/processes_oom.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::ProcessesOom::JS
  when "/charts/processes_active.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::ProcessesActive::JS
  when "/charts/processes_oom_line.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::ProcessesOomLine::JS
  when "/charts/processes_running.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::ProcessesRunning::JS
  when "/charts/processes_started.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::ProcessesStarted::JS
  when "/charts/processes_ctxt_line.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::ProcessesCtxtLine::JS
  when "/charts/processes_fds_line.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::ProcessesFdsLine::JS
  when "/charts/processes_fds_util.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::ProcessesFdsUtil::JS
  when "/charts/processes_swap.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::ProcessesSwap::JS
  when "/charts/ipc_semaphore_arrays.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::IpcSemaphoreArrays::JS
  when "/charts/ipc_semaphores.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::IpcSemaphores::JS
  when "/charts/ipc_shm_bytes.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::IpcShmBytes::JS
  when "/charts/ipc_shm_segments.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::IpcShmSegments::JS
  when "/charts/memory.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Memory::JS
  when "/charts/load.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Load::JS
  when "/charts/clock.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Clock::JS
  when "/charts/clock_offset.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::ClockOffset::JS
  when "/charts/clock_sync_state.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::ClockSyncState::JS
  when "/charts/disk.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Disk::JS
  when "/charts/network.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Network::JS
  when "/charts/uptime.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Uptime::JS
  when "/charts/mem_available.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemAvailable::JS
  when "/charts/mem_committed.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemCommitted::JS
  when "/charts/mem_swap.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemSwap::JS
  when "/charts/mem_swap_cached.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemSwapCached::JS
  when "/charts/mem_swapio.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemSwapio::JS
  when "/charts/mem_pgfaults.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemPgfaults::JS
  when "/charts/mem_reclaiming.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemReclaiming::JS
  when "/charts/mem_writeback.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemWriteback::JS
  when "/charts/mem_pgpgio.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemPgpgio::JS
  when "/charts/mem_hugepages.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemHugepages::JS
  when "/charts/mem_thp_collapse.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemThpCollapse::JS
  when "/charts/mem_thp_compact.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemThpCompact::JS
  when "/charts/mem_thp_details.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemThpDetails::JS
  when "/charts/mem_thp_faults.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemThpFaults::JS
  when "/charts/mem_thp_file.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemThpFile::JS
  when "/charts/mem_thp_split.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemThpSplit::JS
  when "/charts/mem_thp_swapout.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemThpSwapout::JS
  when "/charts/mem_thp_zero.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemThpZero::JS
  when "/charts/mem_balloon.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemBalloon::JS
  when "/charts/mem_kernel.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemKernel::JS
  when "/charts/mem_slab.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemSlab::JS
  when "/charts/mem_hwcorrupt.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::MemHwcorrupt::JS
  when "/charts/disktable.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Disktable::JS
  when "/charts/disk_ext_io.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskExtIo::JS
  when "/charts/disk_avgsz.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskAvgsz::JS
  when "/charts/disk_ext_avgsz.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskExtAvgsz::JS
  when "/charts/disk_ops.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskOps::JS
  when "/charts/disk_ext_ops.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskExtOps::JS
  when "/charts/disk_mops.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskMops::JS
  when "/charts/disk_await.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskAwait::JS
  when "/charts/disk_ext_await.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskExtAwait::JS
  when "/charts/disk_svctm.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskSvctm::JS
  when "/charts/disk_util.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskUtil::JS
  when "/charts/disk_busy.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskBusy::JS
  when "/charts/disk_backlog.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskBacklog::JS
  when "/charts/disk_space_usage.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskSpaceUsage::JS
  when "/charts/disk_inodes_usage.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskInodesUsage::JS
  when "/charts/mountpoints.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Mountpoints::JS
  when "/charts/disk_iotime.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskIotime::JS
  when "/charts/disk_ext_iotime.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskExtIotime::JS
  when "/charts/disk_qops.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::DiskQops::JS
  when "/charts/nettable.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Nettable::JS
  when "/charts/net_packets.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::NetPackets::JS
  when "/charts/net_errors.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::NetErrors::JS
  when "/charts/net_drops.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::NetDrops::JS
  when "/charts/net_events.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::NetEvents::JS
  when "/charts/net_fifo.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::NetFifo::JS
  when "/charts/net_carrier.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::NetCarrier::JS
  when "/charts/net_operstate.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::NetOperstate::JS
  when "/charts/net_duplex.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::NetDuplex::JS
  when "/charts/net_speed.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::NetSpeed::JS
  when "/charts/net_mtu.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::NetMtu::JS
  when "/charts/tcp_accept_queue.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::TcpAcceptQueue::JS
  when "/charts/tcp_syn_queue.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::TcpSynQueue::JS
  when "/charts/tcp_conn_aborts.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::TcpConnAborts::JS
  when "/charts/tcp_errors.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::TcpErrors::JS
  when "/charts/tcp_handshake.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::TcpHandshake::JS
  when "/charts/tcp_mem_pressures.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::TcpMemPressures::JS
  when "/charts/tcp_ofo_queue.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::TcpOfoQueue::JS
  when "/charts/tcp_opens.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::TcpOpens::JS
  when "/charts/tcp_packets.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::TcpPackets::JS
  when "/charts/tcp_reorders.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::TcpReorders::JS
  when "/charts/tcp_connections.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::TcpConnections::JS
  when "/charts/tcp_syn_cookies.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::TcpSynCookies::JS
  when "/charts/sockstat_sockets.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::SockstatSockets::JS
  when "/charts/ipv4_bandwidth.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv4Bandwidth::JS
  when "/charts/ipv4_packets.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv4Packets::JS
  when "/charts/ipv4_errors.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv4Errors::JS
  when "/charts/ipv4_udp_packets.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv4UdpPackets::JS
  when "/charts/ipv4_udp_errors.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv4UdpErrors::JS
  when "/charts/ipv4_mcast.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv4Mcast::JS
  when "/charts/ipv4_mcastpkts.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv4Mcastpkts::JS
  when "/charts/ipv4_bcast.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv4Bcast::JS
  when "/charts/ipv4_bcastpkts.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv4Bcastpkts::JS
  when "/charts/ipv4_fragsin.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv4Fragsin::JS
  when "/charts/ipv4_fragsout.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv4Fragsout::JS
  when "/charts/ipv4_udplite.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv4Udplite::JS
  when "/charts/ipv4_icmp.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv4Icmp::JS
  when "/charts/ipv4_icmp_errors.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv4IcmpErrors::JS
  when "/charts/ipv4_icmpmsg.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv4Icmpmsg::JS
  when "/charts/ipv4_ecnpkts.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv4Ecnpkts::JS
  when "/charts/sockstat_tcp_sockets.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::SockstatTcpSockets::JS
  when "/charts/sockstat_tcp_mem.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::SockstatTcpMem::JS
  when "/charts/sockstat_udp_sockets.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::SockstatUdpSockets::JS
  when "/charts/sockstat_udp_mem.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::SockstatUdpMem::JS
  when "/charts/sockstat_udplite_sockets.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::SockstatUdpliteSockets::JS
  when "/charts/sockstat_raw_sockets.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::SockstatRawSockets::JS
  when "/charts/sockstat_frag_sockets.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::SockstatFragSockets::JS
  when "/charts/sockstat_frag_mem.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::SockstatFragMem::JS
  when "/charts/ipv6_packets.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv6Packets::JS
  when "/charts/ipv6_errors.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv6Errors::JS
  when "/charts/ipv6_udppackets.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv6Udppackets::JS
  when "/charts/ipv6_udperrors.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv6Udperrors::JS
  when "/charts/ipv6_udplitepackets.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv6Udplitepackets::JS
  when "/charts/ipv6_udppackets_line.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv6UdppacketsLine::JS
  when "/charts/ipv6_udperrors_line.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv6UdperrorsLine::JS
  when "/charts/ipv6_udplitepackets_line.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv6UdplitepacketsLine::JS
  when "/charts/ipv6_bandwidth.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv6Bandwidth::JS
  when "/charts/ipv6_packets_line.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv6PacketsLine::JS
  when "/charts/ipv6_mcast.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv6Mcast::JS
  when "/charts/ipv6_mcastpkts.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv6Mcastpkts::JS
  when "/charts/ipv6_bcast.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv6Bcast::JS
  when "/charts/ipv6_errors_line.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv6ErrorsLine::JS
  when "/charts/ipv6_fragsin.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv6Fragsin::JS
  when "/charts/ipv6_fragsout.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Ipv6Fragsout::JS
  when "/charts/nfs_rpc.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::NfsRpc::JS
  when "/charts/nfs_proc4.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::NfsProc4::JS
  when "/appswapdata"
    handle_appswapdata(ctx)
  when "/serviceinfo"
    handle_serviceinfo(ctx)
  when "/charts/servicetable.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::Servicetable::JS
  else
    ctx.response.headers["Content-Type"] = "text/html; charset=utf-8"
    ctx.response.print Frontend::INDEX_HTML
  end
end

# ── Boot ───────────────────────────────────────────────────────────────────────

puts "Netdata Open Dashboardcd  running at http://localhost:#{PORT}"
puts "Proxying Netdata at #{NETDATA_URL}"

server.bind_tcp("0.0.0.0", PORT)
server.listen
