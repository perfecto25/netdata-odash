require "http/server"
require "http/client"
require "json"
require "uri"
require "log"

require "./netdata/client"
require "./netdata/cors"
require "./netdata/nodes"
require "./netdata/data"
require "./netdata/proxy"
require "./netdata/nodeinfo"
require "./netdata/diskinfo"
require "./netdata/diskdata"
require "./netdata/mountinfo"
require "./netdata/netinfo"
require "./charts/cpu"
require "./charts/memory"
require "./charts/load"
require "./charts/clock"
require "./charts/clock_offset"
require "./charts/clock_sync_state"
require "./charts/disk"
require "./charts/network"
require "./charts/uptime"
require "./charts/mem_available"
require "./charts/mem_pgfaults"
require "./charts/mem_reclaiming"
require "./charts/mem_writeback"
require "./charts/mem_pgpgio"
require "./charts/mem_hugepages"
require "./charts/mem_thp_collapse"
require "./charts/mem_thp_compact"
require "./charts/mem_thp_details"
require "./charts/mem_thp_faults"
require "./charts/mem_thp_file"
require "./charts/mem_thp_split"
require "./charts/mem_thp_swapout"
require "./charts/mem_thp_zero"
require "./charts/mem_balloon"
require "./charts/mem_kernel"
require "./charts/mem_slab"
require "./charts/mem_hwcorrupt"
require "./charts/disktable"
require "./charts/disk_ext_io"
require "./charts/disk_avgsz"
require "./charts/disk_ext_avgsz"
require "./charts/disk_ops"
require "./charts/disk_ext_ops"
require "./charts/disk_mops"
require "./charts/disk_await"
require "./charts/disk_ext_await"
require "./charts/disk_svctm"
require "./charts/disk_util"
require "./charts/disk_busy"
require "./charts/disk_backlog"
require "./charts/disk_space_usage"
require "./charts/disk_inodes_usage"
require "./charts/mountpoints"
require "./charts/disk_iotime"
require "./charts/disk_ext_iotime"
require "./charts/disk_qops"
require "./charts/nettable"
require "./charts/nfs_rpc"
require "./charts/nfs_proc4"
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
  when "/charts/nfs_rpc.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::NfsRpc::JS
  when "/charts/nfs_proc4.js"
    ctx.response.headers["Content-Type"] = "application/javascript"
    ctx.response.print Charts::NfsProc4::JS
  else
    ctx.response.headers["Content-Type"] = "text/html; charset=utf-8"
    ctx.response.print Frontend::INDEX_HTML
  end
end

# ── Boot ───────────────────────────────────────────────────────────────────────

puts "Netdata Dash running at http://localhost:#{PORT}"
puts "Proxying Netdata at #{NETDATA_URL}"

server.bind_tcp("0.0.0.0", PORT)
server.listen
