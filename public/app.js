(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  // ── Time range presets ────────────────────────────────────────────────────────
  const TIME_RANGES = [
    { label: "1m", seconds: 60, poll: 5000 },
    { label: "5m", seconds: 300, poll: 5000 },
    { label: "10m", seconds: 600, poll: 5000 },
    { label: "1h", seconds: 3600, poll: 15000 },
    { label: "6h", seconds: 21600, poll: 30000 },
    { label: "1d", seconds: 86400, poll: 60000 },
    { label: "7d", seconds: 604800, poll: 0 },
    { label: "30d", seconds: 2592000, poll: 0 },
    { label: "120d", seconds: 10368000, poll: 0 },
    { label: "360d", seconds: 31104000, poll: 0 },
  ];

  const POINTS = 300;

  const DEFAULT_COLORS = [
    '#00d4ff', '#22c55e', '#f97316', '#ef4444', '#eab308',
    '#a855f7', '#06b6d4', '#84cc16', '#fb923c', '#f43f5e',
    '#8b5cf6', '#10b981', '#fbbf24', '#60a5fa', '#e879f9',
    '#34d399', '#fb7185', '#38bdf8',
  ];

  const CHART_HELP = {
    // System – Compute
    cpu:                    'Breaks down CPU time by mode: user (applications), system (kernel), iowait (waiting for disk), steal (hypervisor), and others. High iowait points to a storage bottleneck; high system suggests excessive syscalls or kernel overhead. Correlates with load average — sustained high CPU plus high load means the system is genuinely saturated.',
    cpu_interrupts:         'Per-IRQ interrupt rate broken down by device (NIC queues, NVMe, timers, etc.), stacked so you can see which source dominates. The largest slice is usually LOC (local timer) or a busy NIC queue. Sudden spikes in a single device indicate heavy I/O on that path; a new top contributor after a config change often points to an IRQ affinity or driver issue.',
    load:                   '1-, 5-, and 15-minute load averages. Values at or below CPU core count mean the system is keeping up; sustained values above core count mean tasks are queuing for CPU. A rising 15-minute average with a falling 1-minute average indicates a fading spike rather than an ongoing problem.',
    uptime:                 'Time since last boot. Unexpectedly low uptime signals an unplanned restart — check kernel logs for the reason. Very high uptime may mean the system has missed critical security patches. Provides context for other metrics: a fresh boot has cold caches and lower baseline memory use.',

    // System – Pressure (PSI)
    cpu_some_pressure:      'PSI — percentage of time at least one task was delayed waiting for CPU (10 s, 1 m, 5 m averages). Values consistently above 5–10% signal CPU saturation and task queuing. Correlates with load average and user/system CPU time.',
    cpu_some_pressure_stall:'Accumulated milliseconds tasks spent stalled on CPU. Rising stall time alongside high PSI % confirms real saturation rather than momentary bursts. Compare with per-mode CPU usage to decide whether to add cores or identify and kill a runaway process.',
    mem_some_pressure:      'PSI — time at least one task was stalled waiting for memory pages. Even low values (1–2%) indicate the working set is spilling into swap or triggering reclaim. Correlates with swap usage, page faults, and available memory.',
    mem_some_pressure_stall:'Accumulated stall time from memory pressure. Rising values alongside swap activity and page faults means tasks are paying the latency cost of active reclaim. A clear signal to add RAM or reduce the application working set.',
    mem_full_pressure:      'PSI full — time all tasks were simultaneously stalled on memory. Unlike "some", any non-zero value here is serious: the entire system froze waiting for memory pages. Investigate OOM kills, swap exhaustion, and committed memory immediately.',
    mem_full_pressure_stall:'Accumulated time the system was completely frozen on memory exhaustion. Non-trivial values indicate the host experienced total stalls. Investigate OOM events, swap space, and processes with the largest RSS.',
    io_some_pressure:       'PSI — time at least one task was stalled waiting for disk I/O. Values consistently above 10–20% signal storage is a bottleneck. Correlates directly with disk utilization, await latency, and CPU iowait.',
    io_some_pressure_stall: 'Accumulated I/O stall time. Rising values alongside high disk utilization and latency confirm storage is limiting throughput. Consider faster storage, more spindles, or a caching layer if chronically elevated.',
    io_full_pressure:       'PSI full — all tasks simultaneously blocked on disk I/O. Any non-zero value indicates a total system stall from storage saturation. Correlates with 100% disk utilization and can cause application timeouts and system-wide freezes.',
    io_full_pressure_stall: 'Accumulated time the system was completely frozen waiting on I/O. A severe storage bottleneck indicator — investigate disk utilization, queue depth, and per-device latency immediately.',
    irq_pressure:           'PSI full — time all tasks were stalled due to interrupt handling. Normally near zero; elevated values suggest a device (often a NIC) is monopolizing CPU interrupt time and starving other tasks.',
    irq_pressure_stall:     'Accumulated time lost to interrupt saturation. Usually negligible on healthy systems. Non-trivial values point to an overloaded NIC, a misconfigured driver, or hardware generating excessive interrupts.',

    // System – Memory
    memory:                 'RAM breakdown: used, cached, buffers, and free. Linux uses spare RAM as disk cache — low "free" is normal and healthy. Watch "used" trending toward total RAM capacity and watch for swap usage rising in parallel, which indicates genuine memory pressure.',
    mem_available:          'RAM available for new allocations without swapping, including reclaimable cache. More accurate than "free" because cache can be reclaimed instantly. Values consistently below 10% of total RAM mean you are close to swap pressure and OOM territory.',
    mem_committed:          'Virtual memory committed by all processes — what they have been promised but may not yet have physically allocated. Exceeding physical RAM plus swap means the system is overcommitted and OOM kills will occur if all processes claim their allocation simultaneously.',
    mem_swap:               'Swap space partitioned into used and free. Some usage is normal; constantly rising "used" means RAM is insufficient for the workload. Swap access is orders of magnitude slower than RAM and will cause noticeable application slowdowns and latency spikes.',
    mem_swap_cached:        'Pages read back from swap into RAM that are still tracked in swap, so they can be dropped without a write. Low values while swap is in use means pages are being actively churned between RAM and disk, which is costly.',
    mem_swapio:             'Rate of data paging in (from disk to RAM) and out (from RAM to disk). Any significant activity indicates active paging — a strong signal of memory pressure. Persistent swap-in means the working set does not fit in RAM.',
    mem_hugepages:          'Huge page (2 MiB) allocation. Databases and large in-memory workloads benefit greatly by reducing TLB pressure and improving memory access latency. Low allocation with high memory usage can mean a missed performance opportunity — configure HugePages or enable THP.',
    mem_balloon:            'Memory balloon driver activity (KVM/VMware/Xen). The hypervisor uses this to reclaim memory from VMs under host pressure. Rising balloon means your VM is being squeezed even if its own memory metrics look fine — the host is memory-starved.',
    mem_hwcorrupt:          'Memory pages marked bad due to hardware errors. Any non-zero value indicates faulty RAM — even a single bad page can cause kernel panics, data corruption, or silent calculation errors. Replace the affected DIMM immediately.',
    mem_kernel:             'Memory consumed by the kernel itself for data structures, modules, and mappings. Gradual growth may indicate a kernel memory leak. Sudden spikes often correspond to large file caches, network socket buffers, or heavy module use.',
    mem_pgfaults:           'Page fault rate: minor (page in physical memory but not yet mapped) and major (page must be read from disk). High major faults indicate heavy paging or memory-mapped file access. Correlates with swap I/O and memory pressure PSI.',
    mem_pgpgio:             'Pages read from and written to swap or memory-mapped files per second. High values mean the kernel is actively moving pages between RAM and disk. Correlates with swap I/O, page faults, and memory pressure — a sign the working set exceeds available RAM.',
    mem_reclaiming:         'Rate at which the kernel reclaims used memory pages (cache, inactive). High reclaim rates mean memory is scarce and the kernel is working hard to free pages before resorting to swap. Sustained high values will increase latency for applications that hit the reclaimed cache.',
    mem_slab:               'Kernel slab allocator usage — memory pools for frequently-allocated kernel objects (dentries, inodes, socket buffers). Gradual growth may indicate a kernel memory leak. Heavy filesystem or network workloads naturally increase slab usage; it can be reclaimed under pressure.',
    mem_writeback:          'Pages currently being written back to disk (dirty cache being flushed). Large writeback means the kernel is flushing buffered writes. Sudden spikes in writeback latency can cause application write stalls when dirty ratio thresholds are hit.',
    mem_thp_faults:         'Transparent huge page faults — the rate at which 2 MiB anonymous pages are being allocated. High fault rates are generally positive; failures mean memory is too fragmented for contiguous 2 MiB allocation and the kernel falls back to 4 KiB pages.',
    mem_thp_details:        'Detailed THP counters: allocations, fallbacks, and splits. Frequent fallbacks indicate memory fragmentation. Consider enabling compaction or disabling THP for latency-sensitive applications that suffer from the occasional compaction pause.',
    mem_thp_collapse:       'Rate at which khugepaged collapses 4 KiB pages into 2 MiB huge pages. Low but non-zero is healthy background activity. Very high rates mean khugepaged is very active and may briefly pause processes during page collapsing.',
    mem_thp_compact:        'Memory compaction rate triggered by THP allocation failures. High values indicate fragmented memory. Compaction can cause latency spikes — consider disabling THP if this is affecting latency-sensitive workloads.',
    mem_thp_file:           'Transparent huge pages used for file-backed mappings (shared libraries, mmap files). Reduces TLB pressure for frequently accessed files. Requires filesystem support. Beneficial for databases that mmap large data files.',
    mem_thp_split:          'Rate at which 2 MiB huge pages are split back into 4 KiB pages, triggered by copy-on-write or partial unmapping. High split rates negate THP benefits and indicate the workload is incompatible with huge pages.',
    mem_thp_swapout:        'Rate at which huge pages are swapped out. Swapping a 2 MiB page requires writing 512× more data than a 4 KiB page — THP swap is extremely expensive. High values alongside swap activity indicate severe memory pressure.',
    mem_thp_zero:           'Reuse rate of the shared zero huge page for anonymous memory. The kernel maps unmodified anonymous allocations to a single zero page to save RAM. High values indicate processes allocating but not yet touching large amounts of memory.',

    // Storage
    disktable:              'Summary of all block devices: throughput, IOPS, latency, and utilization in one view. High utilization (above 80% sustained) means the disk is near saturation. High await (above 20 ms for HDDs, above 2 ms for SSDs) indicates queue buildup and will directly cause application slowdowns.',
    disk:                   'Aggregate read/write throughput across all block devices (system.io). Shows total storage bandwidth. Sustained high throughput approaching device limits will cause rising await and utilization. Correlates with CPU iowait and I/O pressure PSI.',
    disk_ops:               'I/O operations per second per device. High IOPS with low throughput indicates many small random I/Os (typical of databases). Low IOPS with high throughput means large sequential transfers (backups, streaming). Each device has an IOPS ceiling — exceeding it causes latency to climb.',
    disk_await:             'Average I/O request latency from submission to completion. Under 10 ms for HDDs and under 1 ms for SSDs is healthy. Rising await directly causes application slowdowns. High await alongside high utilization means the disk queue is building — operations are waiting to be serviced.',
    disk_util:              'Percentage of time the disk is busy with I/O. Above 80% sustained means the disk is near saturation. At 100% the disk can no longer increase throughput and latency climbs. Correlates directly with I/O PSI pressure values.',
    disk_iotime:            'Cumulative time spent doing I/O (can exceed 100% on multi-queue SSDs). Measures total disk load. A consistently rising trend confirms sustained storage load even if utilization % appears moderate on multi-queue devices.',
    disk_busy:              'Time each disk spent actively processing requests, broken out per device. Use this to identify which specific device is the hotspot when overall I/O pressure is high.',
    disk_mops:              'Merged I/O operations — the kernel batches adjacent requests to improve efficiency. High merge rates indicate sequential access (efficient). Low merge rates with high IOPS indicate random access, which is much harder on spinning HDDs.',
    disk_qops:              'I/O operations currently in the device queue. A growing queue means the disk cannot drain requests as fast as they arrive. Deep queues on SSDs can improve throughput via NCQ; on HDDs they increase latency as seek time dominates.',
    disk_backlog:           'Outstanding I/O requests waiting to be serviced. A non-zero backlog means requests are queuing up. Correlates with await latency — a large backlog causes high latency and can trigger application timeouts, especially for databases and real-time workloads.',
    disk_svctm:             'Estimated time the disk takes to process each request, excluding queue wait time. Rising service time indicates the disk hardware itself is struggling. If service time and await converge, the queue is empty and the raw device is the bottleneck.',
    disk_avgsz:             'Average size of individual I/O requests. Large sizes (above 64 KiB) indicate sequential access. Small sizes (below 8 KiB) indicate random access. Helps tune I/O schedulers and identify workload patterns that may benefit from read-ahead or write coalescing.',
    disk_ext_io:            'Extended disk I/O including discard (TRIM/UNMAP) operations. Discards allow SSDs and thin-provisioned storage to reclaim freed blocks and maintain consistent write performance. Excessive discard rates on some SSDs can briefly impact write throughput.',
    disk_ext_ops:           'Extended operation counts including discard operations per second. On SSDs, regular TRIM discards maintain consistent write performance over time. High discard rates are normal on VMs with thin provisioning or systems with frequent large file deletions.',
    disk_ext_await:         'Latency for extended operations including discards. Discard latency on healthy SSDs should be very low. High discard latency indicates the SSD garbage collector is struggling, which can delay regular write operations.',
    disk_ext_avgsz:         'Average size of extended I/O operations including discards. Large discard sizes indicate bulk block reclamation (deleting large files or VM snapshots). Helps understand whether TRIM activity is interfering with regular I/O.',
    disk_ext_iotime:        'Total I/O time including all extended operations. Accounts for full disk activity beyond standard reads and writes. Compare with regular iotime to understand what fraction of disk load comes from maintenance operations like TRIM.',
    disk_space_usage:       'Disk space used vs. available per filesystem. A full filesystem causes all writes to fail with "no space left on device", crashing applications. Alert at 80–85% to allow time to react. Inodes can also be exhausted independently of space — check both.',
    disk_inodes_usage:      'Inode utilization per filesystem. Every file, directory, and symlink consumes one inode. Exhausting inodes while space remains causes "no space left on device" errors. Common on systems with millions of small files such as mail spools, container image layers, or large caches.',
    mountpoints:            'All mounted filesystems at a glance with space and inode totals shown as donut charts. A quick capacity health check — any filesystem approaching full capacity will cause write failures across every application using it.',

    // Network
    network:                'Total inbound and outbound throughput across all network interfaces combined (system.net). Approaching NIC saturation causes packet drops and TCP retransmissions, increasing application latency. Check the interfaces table to identify which NIC is responsible.',
    nettable:               'Per-interface statistics: bandwidth, packet rates, errors, and drops. Errors and drops should be zero on healthy links — any non-zero values indicate hardware problems, duplex mismatches, or buffer exhaustion. Drops cause TCP retransmissions and increased latency.',
    net_packets:            'Packet rate per interface. High packet rates with low bandwidth indicate many small packets (ACKs, keepalives). Packet rate can hit CPU processing limits before bandwidth limits on fast NICs without RSS/RPS configured.',
    net_errors:             'Transmit and receive errors per interface. Any errors indicate a problem: duplex mismatch, bad cable, overloaded buffer, or faulty NIC or switch port. Even one error per minute warrants investigation on a production link.',
    net_drops:              'Dropped packets per interface. RX drops mean the receive buffer is full (CPU cannot drain fast enough). TX drops mean the send queue is full. Drops cause TCP retransmissions, increased latency, and reduced throughput.',
    net_events:             'Network events: collisions, carrier changes, and FIFO overruns. Collisions on a modern switched network indicate a duplex mismatch. FIFO overruns mean the kernel interrupt handler cannot keep up with packet rate — tune ring buffer sizes with ethtool.',
    net_fifo:               'FIFO buffer overruns on transmit and receive. Overruns mean the kernel ring buffer is too small or the interrupt handler is too slow to drain it. Tune with ethtool ring parameters. Correlates with packet drops and high interrupt rates.',
    net_mcast:              'Multicast traffic volume per interface. Expected for routing protocols (OSPF, RIP), mDNS, and IGMP. Unexpectedly high multicast can indicate a multicast storm, misconfigured application, or faulty switch flooding the LAN.',
    net_mcastpkts:          'Multicast packet rate per interface. High rates with low bandwidth mean many small multicast packets — possible storm or routing protocol keepalive flood. Correlates with net_mcast for context.',
    net_carrier:            'Link carrier state per interface. Any carrier drops on a production interface indicate cable issues, switch port problems, or NIC negotiation failures. Flapping carrier resets TCP connections and makes services unreachable.',
    net_speed:              'Negotiated link speed per interface. Unexpected lower speed (100 Mbps instead of 1 Gbps) indicates auto-negotiation failure, a bad cable, or a faulty switch port. Directly affects available bandwidth headroom.',
    net_duplex:             'Full or half duplex per interface. Half duplex on a switched network means a duplex mismatch with the switch, causing severe performance degradation and error storms. All production links should be full duplex.',
    net_mtu:                'Maximum Transmission Unit per interface. Standard Ethernet is 1500 bytes; jumbo frames are 9000 bytes. MTU mismatches across a path cause fragmentation or mysterious connection failures for packets at or near the MTU size.',
    net_operstate:          'Operational state of each interface (up, down, unknown). Useful for monitoring bond members or physical links that may be administratively up but not carrying traffic. Correlates with carrier state for diagnosing link failures.',

    // IPv4
    ipv4_bandwidth:         'Total IPv4 data throughput (system.ip). Aggregate of all IP-layer traffic, distinct from raw interface bandwidth which includes non-IP frames. Useful for accounting pure IP overhead versus interface-level totals.',
    ipv4_packets:           'IPv4 packets sent and received. Low bandwidth with high packet rate indicates many small packets. Very high packet rates can stress CPU interrupt handling — ensure RSS/RPS is configured on high-throughput servers.',
    ipv4_errors:            'IPv4 protocol errors: discards, no-route, and reassembly failures. Sustained errors indicate routing problems, MTU issues, or fragmentation failures. Each error type points to a different root cause — no-route means missing routes, reassembly failures indicate fragmentation problems.',
    ipv4_bcast:             'IPv4 broadcast traffic volume. High broadcast traffic wastes bandwidth and forces every host on the subnet to process each frame. Excessive broadcasts may indicate ARP flooding, DHCP storms, or broadcast-heavy legacy protocols.',
    ipv4_bcastpkts:         'IPv4 broadcast packet rate. High rates stress all hosts on the subnet. Correlates with broadcast volume to distinguish many small broadcasts from fewer large ones. ARP for large flat subnets is a common source.',
    ipv4_mcast:             'IPv4 multicast traffic volume. Expected on networks using routing protocols (OSPF, RIP), mDNS, or application multicast. Sudden unexplained increases can indicate a multicast storm or misconfigured streaming application.',
    ipv4_mcastpkts:         'IPv4 multicast packet rate. High rates with low bandwidth indicate many small multicast packets — possible storm or routing protocol keepalive flood. Investigate which multicast groups are active with ip maddr.',
    ipv4_ecnpkts:           'ECN (Explicit Congestion Notification) marked packets. ECN lets routers signal congestion without dropping packets. High ECN rates indicate upstream network congestion. Correlates with TCP retransmissions and connection latency.',
    ipv4_fragsin:           'IPv4 fragments received for reassembly. High rates indicate a path MTU problem — a link between source and destination has a smaller MTU than the packet size. Reassembly consumes CPU and memory and fragment loss drops the whole original datagram.',
    ipv4_fragsout:          'IPv4 fragments sent by this host. This host is generating packets larger than a downstream link MTU. Better to fix with Path MTU Discovery than fragment — fragmentation adds overhead and any fragment loss drops the entire original packet.',
    ipv4_icmp:              'ICMP messages sent and received (ping, unreachable, redirect). Moderate ICMP is normal for health checking. A spike may indicate a ping flood, network scan, or a routing loop generating streams of "host unreachable" messages.',
    ipv4_icmp_errors:       'ICMP error messages: destination unreachable, time exceeded. High rates indicate routing problems, firewalled hosts, TTL expiry, or port-unreachable responses from closed UDP ports. Useful for diagnosing connectivity failures.',
    ipv4_icmpmsg:           'Breakdown of ICMP messages by type. Helps distinguish normal traffic (echo request/reply) from error conditions (unreachable, redirect, time exceeded). High redirect rates indicate suboptimal routing configuration.',
    ipv4_udp_packets:       'UDP packets sent and received. UDP carries DNS, NTP, DHCP, and many streaming protocols. High error rates alongside high packet rates indicate packet loss — UDP has no retransmission so data is silently discarded.',
    ipv4_udp_errors:        'UDP errors: no receive buffer space, checksum failures, receive errors. Buffer errors mean the receiving application is not reading fast enough — tune socket buffer sizes. Checksum failures indicate data corruption on the network path.',
    ipv4_udplite:           'UDPLite traffic — a UDP variant allowing partial checksumming for streaming media where partial delivery is preferable to discard. Normally zero on most systems. Non-zero values are expected only with specialized multimedia streaming applications.',

    // IPv6
    ipv6_bandwidth:         'Total IPv6 data throughput. Tracks IPv6 traffic separately from IPv4. On dual-stack hosts, rising IPv6 bandwidth may indicate applications preferring IPv6 or IPv6 tunneling overhead.',
    ipv6_packets:           'IPv6 packets sent and received. Compare with IPv4 packets to understand the protocol mix. On dual-stack or IPv6-only networks this should be the primary traffic metric.',
    ipv6_errors:            'IPv6 protocol errors. Similar to IPv4 errors — routing problems, header issues, or reassembly failures. Sustained errors warrant checking IPv6 routing tables, MTU configuration, and neighbor discovery health.',
    ipv6_errors_line:       'Same IPv6 error data shown as lines rather than stacked areas for clearer reading of individual error types over time.',
    ipv6_mcast:             'IPv6 multicast traffic volume. IPv6 uses multicast heavily for neighbor discovery (NDP, replacing ARP) and router advertisements. High unexplained multicast may indicate NDP storms or excessive RA frequency on large subnets.',
    ipv6_mcastpkts:         'IPv6 multicast packet rate. High rates without a corresponding application need can indicate NDP issues, excessive Router Advertisement frequency, or a misconfigured MLD querier flooding the subnet.',
    ipv6_bcast:             'IPv6 does not use broadcast — this counter typically represents limited broadcast equivalents or is always zero. Non-zero values are unusual and may indicate tunneling or legacy protocol encapsulation.',
    ipv6_packets:           'IPv6 packets sent and received. On dual-stack networks, compare with IPv4 to understand protocol distribution. High IPv6 packet rates without configured IPv6 services may indicate tunneling or misconfigured applications.',
    ipv6_packets_line:      'Same IPv6 packet data shown as lines for easier comparison of send vs. receive rates over time.',
    ipv6_udppackets:        'UDP packets over IPv6. DNS and NTP on IPv6, plus application UDP traffic. Compare with IPv4 UDP to understand protocol preference. High error rates alongside high packet counts indicate packet loss.',
    ipv6_udppackets_line:   'Same IPv6 UDP packet data in line chart form for clearer trend visibility of send vs. receive separately.',
    ipv6_udperrors:         'IPv6 UDP errors: receive buffer overflow, checksum failures. Buffer overflows mean the application is not draining its socket fast enough — increase socket buffer sizes with sysctl or application configuration.',
    ipv6_udperrors_line:    'Same IPv6 UDP error data in line chart form. Useful for spotting gradual increases in error rates that a stacked chart might obscure.',
    ipv6_udplitepackets:    'IPv6 UDPLite packet rate. Normally zero unless running specialized multimedia streaming applications using UDPLite over IPv6.',
    ipv6_udplitepackets_line:'IPv6 UDPLite data as a line chart. Typically a flat zero line on most systems.',
    ipv6_fragsin:           'IPv6 fragments received. Unlike IPv4, IPv6 does not fragment at routers — only at the source. Fragmented IPv6 traffic indicates the source is not respecting Path MTU Discovery. Reassembly consumes memory and CPU.',
    ipv6_fragsout:          'IPv6 fragments sent. This host is sending oversized packets that should have been limited by Path MTU Discovery. Should be zero on a properly configured host — fix by ensuring PMTUD is working and not blocked by firewalls.',

    // TCP
    tcp_connections:        'Active TCP connections by state: established, time-wait, close-wait. High time-wait is normal for busy HTTP servers (connections drain naturally). High close-wait indicates an application not closing sockets — a resource leak that can exhaust file descriptors.',
    tcp_packets:            'TCP segment send and receive rate. High packet rate with low data volume indicates ACK-heavy or chatty workloads. Compare bytes and segments to understand effective payload efficiency. Correlates with CPU interrupt and context switch rates.',
    tcp_errors:             'TCP error counters: RSTs, checksum errors. RSTs are normal for connection teardown but spikes indicate connection refusals, port scans, or broken half-open connections. Checksum errors indicate data corruption on the network path.',
    tcp_handshake:          'TCP connection establishment rate (SYN, SYN-ACK, ACK). High rates indicate many short-lived connections — consider persistent connections or connection pooling. Correlates with syn_queue — if handshake rate is high and syn queue is full, the server cannot accept connections fast enough.',
    tcp_opens:              'Rate of new TCP connections opening, split into active (this host initiating) and passive (remote host connecting). High passive open rates indicate a busy server. Rising active opens indicate this host is making more outbound connections — normal for a proxy or client workload.',
    tcp_conn_aborts:        'TCP connection abort rate by reason: out of memory, timeout, data abort. Aborts mean connections were forcibly terminated. High abort rates indicate resource exhaustion, network timeouts, or applications crashing with sockets open. Each abort type points to a specific cause.',
    tcp_accept_queue:       'Backlog of connections the kernel has accepted (completed 3-way handshake) but the application has not yet called accept() on. A full accept queue silently drops new connections. Increase via somaxconn sysctl or application listen() backlog parameter.',
    tcp_syn_queue:          'Incomplete TCP connections waiting for the final handshake step. A full SYN queue during normal traffic means clients are slow. A full queue during high connection rates indicates a SYN flood attack — SYN cookies (next chart) are the defense.',
    tcp_syn_cookies:        'SYN cookie usage — a defense against SYN flood attacks. The kernel uses cookies when the SYN queue is full, allowing valid connections without holding state. Any SYN cookie activity means the SYN queue is overflowing, either from an attack or a legitimately high connection rate.',
    tcp_reorders:           'TCP segment reordering events. Some reordering is normal on bonded interfaces or multi-path networks. High reorder rates cause unnecessary TCP retransmissions and reduced throughput. Indicates uneven ECMP hashing or network path changes.',
    tcp_ofo_queue:          'Out-of-order TCP segments held in the receive queue waiting for missing segments. High out-of-order queues indicate network reordering or loss — both cause flow control to kick in and reduce throughput.',
    tcp_mem_pressures:      'TCP memory pressure events — the kernel entered pressure mode because TCP socket buffers consumed too much memory. In pressure mode, buffer sizes are reduced to conserve RAM, hurting throughput. Increase TCP memory limits via net.ipv4.tcp_mem sysctl if frequent.',

    // Sockets
    sockstat_sockets:       'Total sockets open across all protocols. Growing socket counts indicate open connections or socket leaks. Very high values may exhaust file descriptors. Correlates with process FD usage — investigate with ss -s or lsof.',
    sockstat_tcp_sockets:   'TCP sockets by state. Large time-wait counts are normal for HTTP servers — connections drain naturally. Large close-wait counts indicate applications not closing connections, a common socket leak pattern that can exhaust FDs.',
    sockstat_tcp_mem:       'Memory consumed by TCP socket buffers. Directly competes with application memory. High TCP memory from many high-bandwidth connections can trigger TCP memory pressure mode and reduce throughput. Tune with net.ipv4.tcp_mem sysctl.',
    sockstat_udp_sockets:   'UDP sockets currently open. DNS resolvers, NTP clients, DHCP clients, and VPN connections each hold UDP sockets. Unexpected growth indicates a UDP socket leak — investigate with ss -u or lsof.',
    sockstat_udp_mem:       'Memory consumed by UDP receive buffers. High usage often means sockets with large buffers that are not being drained promptly. Applications using UDP for high-throughput data should tune their receive buffer sizes.',
    sockstat_raw_sockets:   'Raw IP sockets open. Used by ping, traceroute, and packet capture tools. Unexpected raw sockets may indicate unauthorized network monitoring, a security scanner, or an IDS/IPS agent. Should be a small constant on a normal server.',
    sockstat_frag_sockets:  'IP fragment reassembly queue depth. Non-zero values mean fragmented packets are being received and held for reassembly. High values indicate fragmentation on the network path, consuming memory and adding latency.',
    sockstat_frag_mem:      'Memory consumed by fragment reassembly buffers. High memory use means a lot of fragmented traffic is arriving. If not expected, find and fix the source — fragmentation is inefficient and the root MTU issue should be addressed.',
    sockstat_udplite_sockets:'UDPLite sockets open. Normally zero on most servers. Non-zero values indicate a specialized multimedia or IoT application using UDPLite protocol for partial-checksum streaming.',

    // Processes
    processes_all:          'Total number of processes and threads. Sudden spikes can indicate a fork bomb or runaway spawner. Gradual growth may indicate a process leak. Correlates with load average — more processes means more potential CPU contention and context switching.',
    processes_running:      'Processes currently running on a CPU or waiting in the run queue (R state). Values consistently above CPU core count mean tasks are queuing for CPU. This is the primary driver of load average.',
    processes_active:       'Actively running or runnable processes. High values relative to core count directly cause high load average and increased context switching. The clearest indicator that you need more CPU capacity.',
    processes_forks:        'Process creation rate. High rates indicate an application spawning many short-lived processes — consider a thread pool or worker process model. Apache prefork and shell-script-heavy workflows are common causes. Correlates with high context switch rates.',
    processes_ctxt:         'Context switch rate (voluntary and involuntary). Some switching is normal. Millions per second indicate lock contention, too many runnable threads, or excessive sleep/wake cycles. Correlates with high system CPU time. Involuntary switches mean CPU saturation.',
    processes_ctxt_line:    'Context switch data as separate lines for voluntary (process yielded) vs. involuntary (process preempted). Involuntary switches indicate CPU saturation. Voluntary switches indicate I/O waiting — normal but high rates may mean too many threads sleeping on locks.',
    processes_fds:          'Total file descriptors open system-wide. Approaching the system-wide limit (fs.file-max) causes "too many open files" errors across all processes. Correlates with socket counts. A steady increase over time indicates an FD leak.',
    processes_fds_line:     'FD usage shown as a line for trend analysis. A steadily rising line without a corresponding increase in workload indicates a slow FD leak — find it with lsof | wc -l per process.',
    processes_fds_util:     'File descriptor utilization as a percentage of the system-wide limit. Values above 80% risk hitting the limit and causing EMFILE errors. Either increase fs.file-max or identify and fix the leaking process.',
    processes_oom:          'OOM (Out of Memory) kill events. Any OOM kill means the kernel ran out of memory and killed a process to survive — this causes data loss and service outages. Correlates with memory pressure PSI full and swap exhaustion.',
    processes_oom_line:     'OOM kill events as a line chart. Any non-zero value is a production incident requiring immediate attention. Check which process was killed, the total RSS at the time, and whether swap was exhausted.',
    processes_started:      'Processes started per second. A spike indicates a process spawning event — cron jobs, deployment scripts, or a fork bomb. Compare with processes_forks and system CPU to understand the impact.',
    processes_swap:         'Per-application swap usage breakdown. Shows which services are consuming swap. Processes with high swap usage are the likely cause of swap pressure — consider increasing their memory limits or adding more RAM.',

    // IPC
    ipc_semaphores:         'System V semaphores in use. Heavily used by databases (PostgreSQL, Oracle) for IPC synchronization. A growing count indicates more concurrent processes using semaphore-based locking. Approaching the kernel limit causes allocation errors for new semaphore requests.',
    ipc_semaphore_arrays:   'System V semaphore arrays (sets) allocated. Each array can hold multiple semaphores. Approaching the kernel.sem limit causes "no space left on device" for new semaphore allocations. Common in heavily-used database installations with many concurrent connections.',
    ipc_shm_bytes:          'System V shared memory in use. Databases (PostgreSQL shared_buffers, Oracle SGA) rely heavily on shared memory. High usage is expected for database workloads. Approaching limits causes "cannot allocate shared memory segment" errors for new instances.',
    ipc_shm_segments:       'Number of System V shared memory segments. Each database instance typically uses several segments. Approaching the kernel.shmmni limit causes errors for new segment creation. Monitor alongside shm_bytes for capacity planning.',

    // Clock
    clock:                  'NTP synchronization status and clock state. A synchronized clock is critical for log correlation, SSL certificate validation, distributed consensus, and cron job accuracy. Any status other than synchronized warrants immediate investigation of NTP configuration and connectivity.',
    clock_offset:           'Difference between the local clock and the NTP reference time in milliseconds. Under 10 ms is healthy; over 100 ms may cause issues with Kerberos authentication, SSL, and distributed databases. Large offsets suggest NTP is not correcting fast enough or the system clock hardware is drifting.',
    clock_sync_state:       'Whether the system clock is synchronized to an NTP source. A value of 0 means unsynchronized — this breaks Kerberos authentication, SSL certificates, distributed system consensus, and log correlation. Should always be synchronized on a production server.',

    // NFS
    nfs_rpc:                'NFS Remote Procedure Call rate — operations per second for all NFS requests. High rates indicate heavy NFS usage. NFS performance is highly sensitive to server latency — high call rates combined with server-side latency will directly degrade application performance on this client.',
    nfs_proc4:              'NFSv4 operations broken out by procedure: read, write, open, close, rename, and others. Heavy write operations with high latency indicate NFS server saturation. High open/close rates suggest many short-lived file accesses — consider local caching with CacheFS or an overlayfs cache layer.',

    // Services
    servicetable:           'Per-service resource breakdown: CPU, memory, disk I/O. Shows which services are the top consumers at a glance. Use this to quickly correlate system-wide CPU or memory spikes to the responsible application without needing to run top or ps.',
  };

  let activeHelpBtn = null;

  function showChartHelp(btn, text) {
    let popup = document.getElementById('chart-help-popup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'chart-help-popup';
      document.body.appendChild(popup);
      document.addEventListener('click', function() {
        popup.style.display = 'none';
        activeHelpBtn = null;
      });
    }
    if (activeHelpBtn === btn) {
      popup.style.display = 'none';
      activeHelpBtn = null;
      return;
    }
    activeHelpBtn = btn;
    popup.textContent = text;
    popup.style.display = 'block';
    const rect = btn.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + 6;
    if (left + 336 > window.innerWidth - 8) left = window.innerWidth - 344;
    if (top + popup.offsetHeight > window.innerHeight - 8) top = rect.top - popup.offsetHeight - 6;
    popup.style.left = Math.max(8, left) + 'px';
    popup.style.top = Math.max(8, top) + 'px';
  }

  const GAUGE_DEFS = [
    { id: 'uptime',  title: 'Uptime',     chart: 'system.uptime', dim: 'uptime', display: 'text',               color: '#00d4ff' },
    { id: 'load',    title: 'Load Avg',   chart: 'system.load',   dim: 'load1',  unit: '',       max: 'cores',  color: '#22c55e' },
    { id: 'cpu',     title: 'CPU',        chart: 'system.cpu',    dim: null,     unit: '%',      max: 100,      color: '#00d4ff' },
    { id: 'ram',     title: 'Used RAM',   chart: 'system.ram',    dim: 'used',   unit: '%',      max: 'ram%',   color: '#eab308' },
    { id: 'swap',    title: 'Used Swap',  chart: 'mem.swap',      dim: 'used',   unit: '%',      max: 'swap%',  color: '#a855f7' },
    { id: 'disk_r',  title: 'Disk Read',  chart: 'system.io',     dim: 'in',     unit: 'KiB/s',  max: 'auto',   color: '#22c55e' },
    { id: 'disk_w',  title: 'Disk Write', chart: 'system.io',     dim: 'out',    unit: 'KiB/s',  max: 'auto',   color: '#ef4444' },
    { id: 'net_in',  title: 'Net In',  chart: 'system.net', dim: 'received', unit: 'kbit/s', max: 'auto', color: '#00d4ff' },
    { id: 'net_out', title: 'Net Out', chart: 'system.net', dim: 'sent',     unit: 'kbit/s', max: 'auto', color: '#f97316' },
  ];

  let currentNode = null;
  let nodeMap = {};
  let currentRange = TIME_RANGES[0];
  let charts = {};
  let pollTimer = null;
  let fetchGen = 0;
  let activeNav = null; // { group, section } or null = show all
  let searchFilter = "";
  let gaugeMaxes = {};
  let diskGaugeMaxes = {};
  let netGaugeMaxes = {};
  let gaugeTableMaxes = {};
  let nodeCores = {};
  let rawRefs = {};
  let scrollHighlightHandler = null;

  // ── Scroll highlight ─────────────────────────────────────────────────────────

  function setupScrollHighlight() {
    const main = $("main");
    if (scrollHighlightHandler) main.removeEventListener("scroll", scrollHighlightHandler);

    const cardNavMap = {};
    Object.values(window.CHARTS || {}).forEach((def) => {
      if (def.nav) cardNavMap["card-" + def.id] = def.nav;
    });

    function highlight() {
      const mainRect = main.getBoundingClientRect();
      let bestCard = null;
      let bestScore = Infinity;
      main.querySelectorAll(".card").forEach((card) => {
        const rect = card.getBoundingClientRect();
        const visible = Math.min(rect.bottom, mainRect.bottom) - Math.max(rect.top, mainRect.top);
        if (visible < 20) return;
        // Cards scrolled above the viewport get a large penalty so in-view cards always win
        const score = rect.top >= mainRect.top ? rect.top : rect.top + 1e6;
        if (score < bestScore) {
          bestScore = score;
          bestCard = card.id;
        }
      });
      document.querySelectorAll(".nav-item").forEach((el) => el.classList.remove("scroll-active"));
      const nav = bestCard && cardNavMap[bestCard];
      if (nav) {
        document.querySelectorAll(".nav-item").forEach((el) => {
          if (el.dataset.group === nav.group && el.dataset.section === nav.section)
            el.classList.add("scroll-active");
        });
      }
    }

    scrollHighlightHandler = highlight;
    main.addEventListener("scroll", highlight);
    highlight();
  }

  // ── Sidebar ───────────────────────────────────────────────────────────────────

  function getVisibleCharts() {
    const all = Object.values(window.CHARTS || {});
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return all.filter((d) => d.title && d.title.toLowerCase().includes(q));
    }
    if (!activeNav) return all;
    return all.filter(
      (d) =>
        d.nav &&
        d.nav.group === activeNav.group &&
        d.nav.section === activeNav.section,
    );
  }

  function buildSidebar() {
    const sidebar = $("sidebar");
    sidebar.innerHTML = "";
    const all = Object.values(window.CHARTS || {});
    // Collect groups → sections in order
    const groups = {};
    all.forEach((d) => {
      if (!d.nav) return;
      const g = d.nav.group;
      const s = d.nav.section;
      if (!groups[g]) groups[g] = [];
      if (!groups[g].includes(s)) groups[g].push(s);
    });

    Object.entries(groups).forEach(([group, sections]) => {
      const groupEl = document.createElement("div");
      groupEl.className = "nav-group";

      const header = document.createElement("div");
      header.className = "nav-group-header";
      header.innerHTML =
        "<span>" + group + "</span>" + '<span class="nav-arrow">▾</span>';
      header.addEventListener("click", () => {
        groupEl.classList.toggle("collapsed");
      });

      const items = document.createElement("div");
      items.className = "nav-items";

      sections.forEach((section) => {
        const item = document.createElement("div");
        item.className = "nav-item";
        item.textContent = section;
        item.dataset.group = group;
        item.dataset.section = section;
        item.addEventListener("click", () => setActiveNav(group, section, item));
        items.appendChild(item);
      });

      groupEl.appendChild(header);
      groupEl.appendChild(items);
      sidebar.appendChild(groupEl);
    });
  }

  function setActiveNav(group, section, clickedEl) {
    // Toggle off if clicking the already-active item
    const same =
      activeNav &&
      activeNav.group === group &&
      activeNav.section === section;
    activeNav = same ? null : { group, section };

    document
      .querySelectorAll(".nav-item")
      .forEach((el) => el.classList.remove("active"));
    if (!same && clickedEl) clickedEl.classList.add("active");

    if (currentNode) {
      fetchGen++;
      resetCharts();
      startPolling();
    }
  }

  // ── Time range UI ─────────────────────────────────────────────────────────────

  function buildTimeRangeUI() {
    const container = $("time-ranges");
    TIME_RANGES.forEach((tr, i) => {
      const btn = document.createElement("button");
      btn.className = "tr-btn" + (i === 0 ? " active" : "");
      btn.textContent = tr.label;
      btn.addEventListener("click", () => selectRange(i));
      container.appendChild(btn);
    });
  }

  function selectRange(index) {
    currentRange = TIME_RANGES[index];
    document
      .querySelectorAll(".tr-btn")
      .forEach((b, i) => b.classList.toggle("active", i === index));
    if (currentNode) {
      fetchGen++;
      resetCharts();
      startPolling();
    }
  }

  // ── Status ────────────────────────────────────────────────────────────────────

  function setStatus(msg, cls) {
    const el = $("status");
    el.textContent = msg;
    el.className = cls || "";
  }

  // ── API ───────────────────────────────────────────────────────────────────────

  async function apiFetch(path, qs) {
    const params = qs ? new URLSearchParams(qs).toString() : "";
    const r = await fetch(path + (params ? "?" + params : ""));
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  }

  // ── Nodes ─────────────────────────────────────────────────────────────────────

  async function loadNodes() {
    try {
      const nodes = (await apiFetch("/nodes")).sort((a, b) => a.hostname.localeCompare(b.hostname));
      const sel = $("node-select");
      sel.innerHTML = '<option value="">— Select a node —</option>';
      nodeMap = {};
      nodes.forEach((n) => {
        nodeMap[n.hostname] = n;
        const o = document.createElement("option");
        o.value = n.hostname;
        o.textContent = n.hostname;
        sel.appendChild(o);
      });
      const nc = $("node-count");
      nc.textContent = nodes.length + " nodes up";
      nc.style.display = "inline";
      setStatus(nodes.length + " node(s) found", "ok");
      if (nodes.length > 0) {
        sel.value = nodes[0].hostname;
        selectNode(nodes[0].hostname);
      }
    } catch (e) {
      setStatus("Cannot reach Netdata", "err");
      console.error(e);
    }
  }

  // ── Chart lifecycle ───────────────────────────────────────────────────────────

  function selectNode(nodeId) {
    currentNode = nodeId;
    gaugeMaxes = {};
    diskGaugeMaxes = {};
    netGaugeMaxes = {};
    gaugeTableMaxes = {};
    fetchGen++;
    resetCharts();
    startPolling();
  }

  function resetCharts() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
    Object.values(charts).forEach((c) => c.destroy());
    charts = {};
    rawRefs = {};
    buildGauges();
    if (currentNode) loadNodeInfo(currentNode);
    const main = $("main");
    main.classList.toggle("zoomed", activeNav !== null);
    main.innerHTML = "";
    let rowWrapper = null;
    let rowCount = 0;
    getVisibleCharts().forEach((def) => {
      const card = document.createElement("div");
      card.className = "card";
      card.id = "card-" + def.id;
      if (def.row) {
        if (!rowWrapper || rowCount >= 2) {
          rowWrapper = document.createElement("div");
          rowWrapper.style.cssText = 'grid-column:1/-1;display:flex;gap:16px;align-items:stretch;';
          main.appendChild(rowWrapper);
          rowCount = 0;
        }
        card.style.cssText = 'flex:1 1 0;min-width:0;';
        rowWrapper.appendChild(card);
        rowCount++;
      } else {
        rowWrapper = null;
        rowCount = 0;
        if (def.display === 'mountpoints' || def.display === 'nettable' || def.display === 'servicetable') card.style.gridColumn = '1 / -1';
        main.appendChild(card);
      }
      card.innerHTML =
        '<div class="card-header">' +
        '<span class="card-title">' + def.title + '</span>' +
        '<span class="card-sub">' + def.sub + '</span>' +
        '<div style="margin-left:auto;display:flex;align-items:center;gap:4px">' +
        (CHART_HELP[def.id] ? '<button class="card-help-btn" title="About this chart">?</button>&nbsp;' : '') +
        '<button class="card-expand-btn" title="Expand">⛶</button>' +
        '</div>' +
        '</div>' +
        '<div class="stat-row" id="stats-' + def.id + '"></div>' +
        '<div class="chart-wrap" id="wrap-' + def.id + '"></div>';

      const helpBtn = card.querySelector('.card-help-btn');
      if (helpBtn) {
        helpBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          showChartHelp(helpBtn, CHART_HELP[def.id]);
        });
      }

      card.querySelector('.card-expand-btn').addEventListener('click', function() {
        const expanding = !card.classList.contains('expanded');
        document.querySelectorAll('.card.expanded').forEach(function(c) {
          c.classList.remove('expanded');
          c.querySelector('.card-expand-btn').textContent = '⛶';
        });
        if (expanding) {
          card.classList.add('expanded');
          this.textContent = '✕';
        }
        const ch = charts[def.id];
        if (ch) {
          setTimeout(function() {
            const wrap = document.getElementById('wrap-' + def.id);
            if (!wrap) return;
            const w = wrap.clientWidth || 500;
            const h = expanding ? Math.max(400, window.innerHeight - 180) : 220;
            ch.setSize({ width: w, height: h });
          }, 0);
        }
      });
    });
    setupScrollHighlight();
  }

  function startPolling() {
    refreshCharts();
    if (currentRange.poll > 0)
      pollTimer = setInterval(refreshCharts, currentRange.poll);
  }

  // ── Data fetch ────────────────────────────────────────────────────────────────

  async function refreshCharts() {
    if (!currentNode) return;
    const gen = fetchGen;
    const node = currentNode;
    setStatus("fetching…");
    refreshGauges();

    const after = "-" + currentRange.seconds;
    const defs = getVisibleCharts();
    let ok = 0;

    const regularDefs       = defs.filter((d) => d.display !== 'disktable' && d.display !== 'mountpoints' && d.display !== 'nettable' && d.display !== 'servicetable');
    const disktableDefs     = defs.filter((d) => d.display === 'disktable');
    const mountDefs         = defs.filter((d) => d.display === 'mountpoints');
    const nettableDefs      = defs.filter((d) => d.display === 'nettable');
    const servicetableDefs  = defs.filter((d) => d.display === 'servicetable');

    const allTasks = regularDefs.map(async (def) => {
      try {
        const url = def.endpoint || "/data";
        const qs = def.chartPrefix
          ? { node, prefix: def.chartPrefix, after, points: POINTS }
          : { node, chart: def.chart, after, points: POINTS };
        const raw = await apiFetch(url, qs);
        if (fetchGen !== gen) return;
        const parsed = netdataToUplot(raw);
        if (parsed) {
          renderCard(def, parsed);
          ok++;
        } else {
          const wrap = document.getElementById("wrap-" + def.id);
          if (wrap && !wrap.dataset.hasChart)
            wrap.innerHTML = '<div style="color:var(--muted);padding:30px;text-align:center;font-size:12px">No data</div>';
        }
      } catch (e) {
        if (!(e instanceof SyntaxError)) console.warn(def.id, e);
      }
    });

    if (disktableDefs.length) {
      allTasks.push((async () => {
        try {
          const diskInfo = await apiFetch("/diskinfo", { node });
          if (fetchGen !== gen) return;
          disktableDefs.forEach((def) => { renderDiskTable(def, diskInfo); ok++; });
        } catch (e) {
          console.warn('diskinfo', e);
        }
      })());
    }

    if (mountDefs.length) {
      allTasks.push((async () => {
        try {
          const mountInfo = await apiFetch("/mountinfo", { node });
          if (fetchGen !== gen) return;
          mountDefs.forEach((def) => { renderMountPoints(def, mountInfo); ok++; });
        } catch (e) {
          console.warn('mountinfo', e);
        }
      })());
    }

    if (nettableDefs.length) {
      allTasks.push((async () => {
        try {
          const netInfo = await apiFetch("/netinfo", { node });
          if (fetchGen !== gen) return;
          nettableDefs.forEach((def) => { renderNetTable(def, netInfo); ok++; });
        } catch (e) {
          console.warn('netinfo', e);
        }
      })());
    }

    if (servicetableDefs.length) {
      allTasks.push((async () => {
        try {
          const serviceInfo = await apiFetch("/serviceinfo", { node });
          if (fetchGen !== gen) return;
          servicetableDefs.forEach((def) => { renderServiceTable(def, serviceInfo); ok++; });
        } catch (e) {
          console.warn('serviceinfo', e);
        }
      })());
    }

    await Promise.allSettled(allTasks);

    if (fetchGen !== gen) return;
    const label = currentRange.poll > 0 ? "" : " (no auto-refresh)";
    setStatus(
      "updated " + new Date().toLocaleTimeString() + label,
      ok > 0 ? "ok" : "err",
    );
  }

  // ── Data transforms ───────────────────────────────────────────────────────────

  function netdataToUplot(raw) {
    if (!raw || !raw.data || raw.data.length === 0) return null;
    const labels = (raw.labels || []).slice(1);
    const times = raw.data.map((r) => r[0] / 1000);
    const series = labels.map((_, i) =>
      raw.data.map((r) => {
        const v = r[i + 1];
        return v == null ? null : Math.abs(v);
      }),
    );
    return { labels, times, series };
  }

  // Scale MiB → GiB when max value exceeds 1000. Returns scaled series + effective unit.
  function autoScale(series, unit) {
    if (unit !== "MiB") return { series, unit };
    const maxVal = Math.max(
      ...series.flatMap((s) => s.filter((v) => v != null)),
      0,
    );
    if (maxVal <= 1000) return { series, unit };
    return {
      series: series.map((s) => s.map((v) => (v == null ? null : v / 1024))),
      unit: "GiB",
    };
  }

  // Compute cumulative stacked series and reverse draw order so that:
  // the largest fill is drawn first (background) and the smallest last (foreground),
  // revealing correct per-metric color bands.
  function stackSeries(series, labels, colors) {
    if (!series.length) return { series, labels, colors };
    const len = series[0].length;
    const running = new Array(len).fill(0);
    const cumulative = series.map((s) =>
      s.map((v, i) => {
        running[i] += v == null ? 0 : v;
        return running[i];
      }),
    );
    // Reverse: largest cumulative drawn first, smallest drawn last (on top)
    return {
      series: cumulative.slice().reverse(),
      labels: labels.slice().reverse(),
      colors: colors.slice().reverse(),
    };
  }

  function formatUptime(totalSeconds) {
    totalSeconds = Math.floor(totalSeconds);
    const days  = Math.floor(totalSeconds / 86400); totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);  totalSeconds %= 3600;
    const mins  = Math.floor(totalSeconds / 60);
    const secs  = totalSeconds % 60;
    const parts = [];
    if (days  > 0) parts.push(days  + (days  === 1 ? ' day'  : ' days'));
    if (hours > 0) parts.push(hours + (hours === 1 ? ' hour' : ' hours'));
    if (mins  > 0) parts.push(mins  + ' min');
    parts.push(secs + ' sec');
    return parts.join(', ');
  }

  function computeStats(series, idx) {
    const s = series[idx || 0] || series[0];
    if (!s || !s.length) return { cur: 0, avg: 0, max: 0 };
    const vals = s.filter((v) => v != null);
    if (!vals.length) return { cur: 0, avg: 0, max: 0 };
    const cur = s[s.length - 1] ?? 0;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const max = Math.max(...vals);
    return { cur, avg, max };
  }

  // ── uPlot ─────────────────────────────────────────────────────────────────────

  function tooltipPlugin(displayUnit, seriesColors, rawRef) {
    let tooltip = null;
    return {
      hooks: {
        init: function(u) {
          tooltip = document.createElement('div');
          tooltip.style.cssText = 'position:fixed;background:#1a1d27;border:1px solid #2a2d3a;border-radius:6px;padding:8px 12px;font-size:12px;pointer-events:none;display:none;z-index:1000;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.5)';
          document.body.appendChild(tooltip);

          u.over.addEventListener('mousemove', function(e) {
            const rect  = u.over.getBoundingClientRect();
            const xPx   = e.clientX - rect.left;
            const xVal  = u.posToVal(xPx, 'x');
            const times = u.data[0];

            let idx = 0, minDist = Infinity;
            for (let i = 0; i < times.length; i++) {
              const dist = Math.abs(times[i] - xVal);
              if (dist < minDist) { minDist = dist; idx = i; }
            }

            const ts = times[idx];
            const d  = new Date(ts * 1000);
            const hh = d.getHours().toString().padStart(2, '0');
            const mm = d.getMinutes().toString().padStart(2, '0');
            const ss = d.getSeconds().toString().padStart(2, '0');
            const dp = displayUnit === 'GiB' ? 2 : 1;

            let html = '<div style="color:#6b7280;margin-bottom:5px;font-size:11px">' + hh + ':' + mm + ':' + ss + '</div>';
            u.series.slice(1).forEach(function(s, i) {
              const col = (seriesColors && seriesColors[i]) || '#00d4ff';
              const dataArr = rawRef ? rawRef.series[i] : u.data[i + 1];
              const v   = dataArr && dataArr[idx];
              const val = v == null ? '—' : v.toFixed(dp);
              html += '<div style="display:flex;align-items:center;gap:6px;margin-top:3px">' +
                '<span style="display:inline-block;width:8px;height:8px;border-radius:2px;flex-shrink:0;background:' + col + '"></span>' +
                '<span style="color:#9ca3af">' + s.label + '</span>' +
                '<span style="font-weight:600;padding-left:10px;color:#e2e8f0">' + val + '</span>' +
                '<span style="color:#6b7280;font-size:11px;margin-left:2px">' + displayUnit + '</span>' +
                '</div>';
            });

            tooltip.innerHTML = html;
            tooltip.style.display = 'block';

            let tx = e.clientX + 14;
            if (tx + tooltip.offsetWidth > window.innerWidth - 8) tx = e.clientX - tooltip.offsetWidth - 14;
            let ty = e.clientY - 10;
            if (ty + tooltip.offsetHeight > window.innerHeight - 8) ty = e.clientY - tooltip.offsetHeight - 4;
            tooltip.style.left = tx + 'px';
            tooltip.style.top  = ty + 'px';
          });

          u.over.addEventListener('mouseleave', function() { tooltip.style.display = 'none'; });
        },
        destroy: function() {
          if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
          tooltip = null;
        },
      },
    };
  }

  function makeSeriesDef(label, color, stacked) {
    return {
      label,
      stroke: color,
      fill: stacked ? color + "cc" : undefined,
      width: 1.5,
      points: { show: false },
    };
  }

  function buildChart(
    container,
    def,
    data,
    dims,
    displayUnit,
    chartYMax,
    chartColors,
    rawRef,
  ) {
    const W = container.clientWidth || 500;

    const palette = chartColors || def.colors || [];
    const resolvedColors = dims.map((_, i) =>
      i < palette.length ? palette[i] : DEFAULT_COLORS[i % DEFAULT_COLORS.length]
    );
    const series = [{}].concat(
      dims.map((d, i) => makeSeriesDef(d, resolvedColors[i], def.stacked)),
    );

    function fmtTime(u, vals) {
      const rangeS = (u.scales.x.max || 0) - (u.scales.x.min || 0);
      return vals.map((v) => {
        if (v == null) return "";
        const d = new Date(v * 1000);
        if (rangeS > 86400) return d.getMonth() + 1 + "/" + d.getDate();
        return (
          d.getHours().toString().padStart(2, "0") +
          ":" +
          d.getMinutes().toString().padStart(2, "0")
        );
      });
    }

    const opts = {
      width: W,
      height: 220,
      series,
      axes: [
        {
          stroke: "#6b7280",
          ticks: { stroke: "#2a2d3a" },
          grid: { stroke: "#2a2d3a" },
          values: fmtTime,
        },
        {
          stroke: "#6b7280",
          grid: { stroke: "#2a2d3a" },
          ticks: { stroke: "#2a2d3a" },
          size: 95,
          values: (u, vals) =>
            vals.map((v) =>
              v == null
                ? ""
                : v.toFixed(displayUnit === "GiB" ? 2 : 1) + " " + displayUnit,
            ),
        },
      ],
      scales: {
        x: { time: true },
        y: chartYMax
          ? { range: [0, chartYMax] }
          : (def.stacked ? { range: (u, min, max) => [0, max] } : {}),
      },
      plugins: [tooltipPlugin(displayUnit, resolvedColors, rawRef)],
      cursor: { stroke: "#ffffff33" },
      legend: { show: true },
      padding: [10, 10, 0, 0],
    };

    return new uPlot(opts, data, container);
  }

  // ── Donut chart ───────────────────────────────────────────────────────────────

  function drawDonut(canvas, used, total, usedColor) {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth  || 160;
    const H = canvas.clientHeight || 160;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const c = canvas.getContext('2d');
    c.scale(dpr, dpr);
    const cx = W / 2, cy = H / 2;
    const r  = Math.min(W, H) * 0.36;
    const lw = r * 0.4;
    c.lineWidth = lw;
    c.lineCap   = 'butt';
    c.beginPath();
    c.arc(cx, cy, r, 0, Math.PI * 2);
    c.strokeStyle = '#22c55e';
    c.stroke();
    const ratio = total > 0 ? Math.min(1, used / total) : 0;
    if (ratio > 0.001) {
      c.beginPath();
      c.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2);
      c.strokeStyle = usedColor;
      c.stroke();
    }
  }

  // ── Mount points rendering ────────────────────────────────────────────────────

  function renderMountPoints(def, info) {
    const wrap = document.getElementById('wrap-' + def.id);
    if (!wrap) return;
    const { mounts, total_avail_gib, total_used_gib, total_avail_inodes, total_used_inodes } = info;
    const totalSpace  = total_used_gib    + total_avail_gib;
    const totalInodes = total_used_inodes + total_avail_inodes;

    function donutCard(canvasId, label, usedLabel, availLabel) {
      return '<div style="text-align:center">' +
        '<div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">' + label + '</div>' +
        '<canvas id="' + canvasId + '" style="width:160px;height:160px;display:block;margin:0 auto"></canvas>' +
        '<div style="margin-top:6px;font-size:12px">' +
          '<span style="color:#ef4444">' + usedLabel + '</span>' +
          '&emsp;<span style="color:#22c55e">' + availLabel + '</span>' +
        '</div>' +
      '</div>';
    }

    const donutRow =
      '<div style="display:flex;gap:60px;justify-content:center;margin-bottom:20px;flex-wrap:wrap">' +
        donutCard(
          'mp-space-'  + def.id, 'Space Usage',
          'used '  + total_used_gib.toFixed(2)  + ' GiBy',
          'avail ' + total_avail_gib.toFixed(2) + ' GiBy'
        ) +
        donutCard(
          'mp-inodes-' + def.id, 'Files Usage',
          'used '  + (total_used_inodes  / 1e6).toFixed(2) + ' M inodes',
          'avail ' + (total_avail_inodes / 1e6).toFixed(2) + ' M inodes'
        ) +
      '</div>';

    const rows = (mounts || []).map(function(m) {
      return '<tr>' +
        '<td style="text-align:left;color:var(--accent);font-family:monospace">' + m.mount + '</td>' +
        '<td style="text-align:left">' + m.filesystem + '</td>' +
        '<td>' + m.avail_gib.toFixed(2) + '</td>' +
        '<td>' + m.used_gib.toFixed(2) + '</td>' +
        '<td>' + m.reserved_gib.toFixed(2) + '</td>' +
        '<td>' + (m.avail_inodes / 1e6).toFixed(2) + '</td>' +
        '<td>' + (m.used_inodes  / 1e6).toFixed(2) + '</td>' +
        '<td>' + (m.reserved_inodes / 1e6).toFixed(2) + '</td>' +
      '</tr>';
    }).join('');

    wrap.innerHTML = donutRow +
      '<table class="disk-table"><thead><tr>' +
        '<th style="text-align:left">Mount Point</th>' +
        '<th style="text-align:left">Filesystem</th>' +
        '<th>Avail GiBy</th><th>Used GiBy</th><th>Reserved GiBy</th>' +
        '<th>Avail M inodes</th><th>Used M inodes</th><th>Reserved M inodes</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>';

    const sc = document.getElementById('mp-space-'  + def.id);
    const ic = document.getElementById('mp-inodes-' + def.id);
    if (sc) drawDonut(sc, total_used_gib,    totalSpace,  '#ef4444');
    if (ic) drawDonut(ic, total_used_inodes, totalInodes, '#ef4444');
  }

  // ── Gauges ────────────────────────────────────────────────────────────────────

  function niceMax(val) {
    if (val <= 0) return 1;
    const mag = Math.pow(10, Math.floor(Math.log10(val)));
    const n = val / mag;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
  }

  function drawGauge(canvas, value, max, color) {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth  || 110;
    const H = canvas.clientHeight || 74;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = W / 2;
    const cy = H * 0.66;
    const r  = Math.min(W * 0.38, H * 0.56);
    const lw = r * 0.24;
    const start = Math.PI * 5 / 6;  // 150°
    const sweep = Math.PI * 4 / 3;  // 240°
    const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;

    ctx.lineCap = 'round';
    ctx.lineWidth = lw;

    ctx.beginPath();
    ctx.arc(cx, cy, r, start, start + sweep, false);
    ctx.strokeStyle = '#2a2d3a';
    ctx.stroke();

    if (ratio > 0.005) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + ratio * sweep, false);
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }

  function buildGauges() {
    var sysInfoHtml =
      '<div class="gauge-card gauge-sysinfo" id="gauge-sysinfo">' +
      '<div class="gauge-title">System</div>' +
      '<div class="sysinfo-lines">—</div>' +
      '</div>';
    var gaugeHtml = sysInfoHtml + GAUGE_DEFS.map(function(def) {
      if (def.display === 'text') {
        return '<div class="gauge-card" id="gauge-' + def.id + '">' +
          '<div class="gauge-title">' + def.title + '</div>' +
          '<div class="gauge-text-body" style="color:' + def.color + '">—</div>' +
          '</div>';
      }
      return '<div class="gauge-card" id="gauge-' + def.id + '">' +
        '<div class="gauge-title">' + def.title + '</div>' +
        '<canvas class="gauge-canvas"></canvas>' +
        '<div class="gauge-val" style="color:' + def.color + '">—</div>' +
        '</div>';
    }).join('');
    $('gauges').innerHTML = gaugeHtml;
  }

  async function loadNodeInfo(node) {
    const card = document.getElementById('gauge-sysinfo');
    if (!card) return;
    try {
      const info = await apiFetch('/nodeinfo', { node: node });
      if (info.cores_total) nodeCores[node] = parseInt(info.cores_total) || 1;
      const ramGib = info.ram_total ? (parseInt(info.ram_total) / (1024 * 1024 * 1024)).toFixed(0) + ' GiB' : '—';
      const swapMib = info.swap_total_mib || 0;
      const swapStr = swapMib === 0 ? '—' : swapMib < 1024 ? swapMib + ' MiB' : (swapMib / 1024).toFixed(0) + ' GiB';
      const osLabel = [info.os_name, info.os_version].filter(Boolean).join(' ') || '—';
      card.querySelector('.sysinfo-lines').innerHTML =
        '<div class="si-name">' + (info.hostname || node) + '</div>' +
        '<div class="si-row"><span class="si-label">OS</span>'   + osLabel              + '</div>' +
        '<div class="si-row"><span class="si-label">Arch</span>' + (info.architecture || '—') + '</div>' +
        '<div class="si-row"><span class="si-label">CPUs</span>' + (info.cores_total  || '—') + '</div>' +
        '<div class="si-row"><span class="si-label">RAM</span>'  + ramGib               + '</div>' +
        '<div class="si-row"><span class="si-label">Swap</span>' + swapStr              + '</div>';
    } catch(e) {}
  }

  function renderGauges(dataMap, diskInfo) {
    GAUGE_DEFS.forEach(function(def) {
      const card = document.getElementById('gauge-' + def.id);
      if (!card) return;

      // Disk gauges: always use /diskinfo totals (system.io dim names vary across Netdata builds)
      if ((def.id === 'disk_r' || def.id === 'disk_w') && diskInfo) {
        const value = def.id === 'disk_r' ? (diskInfo.total_reads_kib || 0) : (diskInfo.total_writes_kib || 0);
        gaugeMaxes[def.id] = Math.max(gaugeMaxes[def.id] || 0, value);
        const max = niceMax(gaugeMaxes[def.id] || 1);
        const canvas = card.querySelector('canvas');
        const valEl  = card.querySelector('.gauge-val');
        if (canvas && valEl) {
          drawGauge(canvas, value, max, def.color);
          const dp = value >= 100 ? 0 : value >= 10 ? 1 : 2;
          valEl.innerHTML = value.toFixed(dp) + '<small> ' + def.unit + '</small>';
        }
        return;
      }

      const raw = dataMap[def.chart];
      if (!raw || !raw.data || !raw.data.length) return;

      const labels = (raw.labels || []).slice(1);
      const latest = raw.data[raw.data.length - 1];
      let value, max;

      if (def.max === 'ram%') {
        const ramMib = nodeMap[currentNode] && nodeMap[currentNode].ram_mib;
        if (!ramMib) return;
        const idx = labels.indexOf('used');
        if (idx < 0) return;
        value = (Math.abs(latest[idx + 1] || 0) / ramMib) * 100;
        max = 100;
      } else if (def.max === 'swap%') {
        const usedIdx = labels.indexOf('used');
        const freeIdx = labels.indexOf('free');
        if (usedIdx < 0) return;
        const usedVal = Math.abs(latest[usedIdx + 1] || 0);
        const freeVal = freeIdx >= 0 ? Math.abs(latest[freeIdx + 1] || 0) : 0;
        const total = usedVal + freeVal;
        if (total === 0) return;
        value = (usedVal / total) * 100;
        max = 100;
      } else if (def.max === 'cores') {
        const idx = labels.indexOf(def.dim);
        if (idx < 0) return;
        value = Math.abs(latest[idx + 1] || 0);
        max = nodeCores[currentNode] || niceMax(value || 1);
      } else if (def.dim === null) {
        value = latest.slice(1).reduce(function(s, v) { return s + Math.abs(v || 0); }, 0);
        max = def.max;
      } else {
        const idx = labels.indexOf(def.dim);
        if (idx < 0) return;
        value = Math.abs(latest[idx + 1] || 0);
        if (def.max === 'auto') {
          const wmax = Math.max.apply(null, raw.data.map(function(r) { return Math.abs(r[idx + 1] || 0); }));
          gaugeMaxes[def.id] = Math.max(gaugeMaxes[def.id] || 0, wmax);
          max = niceMax(gaugeMaxes[def.id] || 1);
        } else {
          max = def.max;
        }
      }

      if (def.display === 'text') {
        card.querySelector('.gauge-text-body').textContent = formatUptime(value);
        return;
      }

      const canvas = card.querySelector('canvas');
      const valEl  = card.querySelector('.gauge-val');
      drawGauge(canvas, value, max, def.color);
      const dp = value >= 100 ? 0 : value >= 10 ? 1 : 2;
      valEl.innerHTML = value.toFixed(dp) + '<small> ' + def.unit + '</small>';
    });
  }

  async function refreshGauges() {
    if (!currentNode) return;
    const chartIds = [];
    GAUGE_DEFS.forEach(function(d) { if (chartIds.indexOf(d.chart) < 0) chartIds.push(d.chart); });
    const dataMap = {};
    let diskInfo = null;

    await Promise.allSettled([
      ...chartIds.map(async function(chart) {
        try {
          const raw = await apiFetch('/data', { node: currentNode, chart: chart, after: '-300', points: 60 });
          if (raw && raw.data && raw.data.length) dataMap[chart] = raw;
        } catch(e) {}
      }),
      (async function() {
        try { diskInfo = await apiFetch('/diskinfo', { node: currentNode }); } catch(e) {}
      })(),
    ]);

    renderGauges(dataMap, diskInfo);
  }

  // ── Disk table rendering ──────────────────────────────────────────────────────

  const DISK_GAUGE_DEFS = [
    { dim: 'total_reads_ops',  label: 'Read IOPS',  unit: 'ops/s', color: '#22c55e' },
    { dim: 'total_writes_ops', label: 'Write IOPS', unit: 'ops/s', color: '#ef4444' },
    { dim: 'total_reads_kib',  label: 'Read I/O',   unit: 'KiB/s', color: '#22c55e' },
    { dim: 'total_writes_kib', label: 'Write I/O',  unit: 'KiB/s', color: '#ef4444' },
    { dim: 'max_util',         label: 'Max Util',   unit: '%',     color: '#f97316', fixedMax: 100 },
  ];

  function renderDiskTable(def, diskInfo) {
    const wrap = document.getElementById("wrap-" + def.id);
    if (!wrap) return;
    if (!diskInfo || !diskInfo.devices || !diskInfo.devices.length) {
      wrap.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center">No disk data</div>';
      return;
    }

    // Build inline speedometer row HTML
    const gaugeCards = DISK_GAUGE_DEFS.map(function(g, i) {
      return '<div class="gauge-card" style="min-width:110px" data-dg="' + i + '">' +
        '<div class="gauge-title">' + g.label + '</div>' +
        '<canvas class="gauge-canvas"></canvas>' +
        '<div class="gauge-val" style="color:' + g.color + '">—</div>' +
        '</div>';
    }).join('');

    const rows = diskInfo.devices.map(function(d) {
      return '<tr>' +
        '<td>' + d.name + '</td>' +
        '<td>' + d.reads_kib.toFixed(1) + '</td>' +
        '<td>' + d.writes_kib.toFixed(1) + '</td>' +
        '<td>' + d.reads_ms.toFixed(1) + '</td>' +
        '<td>' + d.writes_ms.toFixed(1) + '</td>' +
        '<td>' + d.reads_ops.toFixed(1) + '</td>' +
        '<td>' + d.writes_ops.toFixed(1) + '</td>' +
        '<td>' + d.util_pct.toFixed(1) + '</td>' +
        '</tr>';
    }).join('');

    wrap.innerHTML =
      '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">' + gaugeCards + '</div>' +
      '<table class="disk-table"><thead><tr>' +
      '<th>Device</th><th>Reads KiB/s</th><th>Writes KiB/s</th>' +
      '<th>Lat Read ms</th><th>Lat Write ms</th>' +
      '<th>IOPS Read</th><th>IOPS Write</th><th>Util %</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>';

    // Draw gauges after DOM is ready
    wrap.querySelectorAll('[data-dg]').forEach(function(card) {
      const i = parseInt(card.dataset.dg, 10);
      const g = DISK_GAUGE_DEFS[i];
      const value = diskInfo[g.dim] || 0;
      let max;
      if (g.fixedMax) {
        max = g.fixedMax;
      } else {
        diskGaugeMaxes[g.dim] = Math.max(diskGaugeMaxes[g.dim] || 0, value);
        max = niceMax(diskGaugeMaxes[g.dim] || 1);
      }
      const canvas = card.querySelector('canvas');
      const valEl  = card.querySelector('.gauge-val');
      drawGauge(canvas, value, max, g.color);
      const dp = value >= 100 ? 0 : value >= 10 ? 1 : 2;
      valEl.innerHTML = value.toFixed(dp) + '<small style="font-size:10px;color:var(--muted);font-weight:400;margin-left:2px"> ' + g.unit + '</small>';
    });
  }

  // ── Network table rendering ───────────────────────────────────────────────────

  const NET_GAUGE_DEFS = [
    { key: 'total_recv_kbps', label: 'Total Inbound',  unit: 'Mb/s',     color: '#22c55e', scale: 1/1000 },
    { key: 'total_sent_kbps', label: 'Total Outbound', unit: 'Mb/s',     color: '#ef4444', scale: 1/1000 },
    { key: 'total_errors',    label: 'Total Errors',   unit: 'errors/s', color: '#eab308', scale: 1 },
    { key: 'total_drops',     label: 'Total Drops',    unit: 'drops/s',  color: '#a855f7', scale: 1 },
  ];

  function renderNetTable(def, netInfo) {
    const wrap = document.getElementById('wrap-' + def.id);
    if (!wrap) return;
    if (!netInfo || !netInfo.interfaces || !netInfo.interfaces.length) {
      wrap.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center">No interface data</div>';
      return;
    }

    const gaugeCards = NET_GAUGE_DEFS.map(function(g, i) {
      return '<div class="gauge-card" style="min-width:110px" data-ng="' + i + '">' +
        '<div class="gauge-title">' + g.label + '</div>' +
        '<canvas class="gauge-canvas"></canvas>' +
        '<div class="gauge-val" style="color:' + g.color + '">—</div>' +
        '</div>';
    }).join('');

    const rows = netInfo.interfaces.map(function(iface) {
      return '<tr>' +
        '<td>' + iface.name + '</td>' +
        '<td>' + (iface.recv_kbps / 1000).toFixed(2) + '</td>' +
        '<td>' + (iface.sent_kbps / 1000).toFixed(2) + '</td>' +
        '<td>' + (iface.recv_pkts  / 1000).toFixed(2) + '</td>' +
        '<td>' + (iface.sent_pkts  / 1000).toFixed(2) + '</td>' +
        '<td>' + (iface.mcast_pkts / 1000).toFixed(2) + '</td>' +
        '<td>' + iface.errors_in.toFixed(1)  + '</td>' +
        '<td>' + iface.drops_in.toFixed(1)   + '</td>' +
        '</tr>';
    }).join('');

    wrap.innerHTML =
      '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">' + gaugeCards + '</div>' +
      '<table class="disk-table"><thead><tr>' +
        '<th style="text-align:left">Interface</th>' +
        '<th>Recv Mb/s</th><th>Sent Mb/s</th>' +
        '<th>Recv K pps</th><th>Sent K pps</th><th>Mcast K pps</th>' +
        '<th>Errors/s</th><th>Drops/s</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>';

    wrap.querySelectorAll('[data-ng]').forEach(function(card) {
      const i   = parseInt(card.dataset.ng, 10);
      const g   = NET_GAUGE_DEFS[i];
      const val = (netInfo[g.key] || 0) * g.scale;
      netGaugeMaxes[g.key] = Math.max(netGaugeMaxes[g.key] || 0, val);
      const max   = niceMax(netGaugeMaxes[g.key] || 1);
      const canvas = card.querySelector('canvas');
      const valEl  = card.querySelector('.gauge-val');
      drawGauge(canvas, val, max, g.color);
      const dp = val >= 100 ? 0 : val >= 10 ? 1 : 2;
      valEl.innerHTML = val.toFixed(dp) + '<small style="font-size:10px;color:var(--muted);font-weight:400;margin-left:2px"> ' + g.unit + '</small>';
    });
  }

  // ── Service table rendering ───────────────────────────────────────────────────

  function renderServiceTable(def, serviceInfo) {
    const wrap = document.getElementById('wrap-' + def.id);
    if (!wrap) return;
    if (!serviceInfo || !serviceInfo.services || !serviceInfo.services.length) {
      wrap.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center">No service data</div>';
      return;
    }

    const cols = [
      { label: 'Service',          key: '_name',       left: true,  def: 1  },
      { label: 'CPU %',            key: '_cpu',        left: false, def: -1 },
      { label: 'Mem MiB',          key: 'mem_mib',     left: false, def: -1 },
      { label: 'Disk Read KiB/s',  key: 'disk_read',   left: false, def: -1 },
      { label: 'Disk Write KiB/s', key: 'disk_write',  left: false, def: -1 },
    ];

    const data = serviceInfo.services.map(function(svc) {
      return {
        _name:      svc.name,
        _cpu:       (svc.cpu_user || 0) + (svc.cpu_system || 0),
        mem_mib:    svc.mem_mib    || 0,
        disk_read:  svc.disk_read  || 0,
        disk_write: svc.disk_write || 0,
      };
    });

    let sortCol = 1;
    let sortDir = -1;

    function buildTable() {
      const sorted = data.slice().sort(function(a, b) {
        const av = a[cols[sortCol].key];
        const bv = b[cols[sortCol].key];
        return sortDir * (typeof av === 'string' ? av.localeCompare(bv) : (av - bv));
      });

      const headers = cols.map(function(col, i) {
        const arrow = i === sortCol ? (sortDir === 1 ? ' ▲' : ' ▼') : '';
        const align = col.left ? 'text-align:left;' : '';
        return '<th style="' + align + 'cursor:pointer;user-select:none" data-ci="' + i + '">' + col.label + arrow + '</th>';
      }).join('');

      const rows = sorted.map(function(svc) {
        return '<tr>' + cols.map(function(col) {
          const v = svc[col.key];
          const style = col.left ? 'text-align:left;color:var(--accent);font-family:monospace' : '';
          const disp  = col.left ? v : (col.key === 'mem_mib' ? v.toFixed(1) : v.toFixed(2));
          return '<td style="' + style + '">' + disp + '</td>';
        }).join('') + '</tr>';
      }).join('');

      wrap.innerHTML =
        '<div style="max-height:420px;overflow-y:auto">' +
        '<table class="disk-table"><thead><tr>' + headers + '</tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>';

      wrap.querySelectorAll('th[data-ci]').forEach(function(th) {
        th.addEventListener('click', function() {
          const ci = parseInt(th.dataset.ci, 10);
          sortDir = ci === sortCol ? -sortDir : cols[ci].def;
          sortCol = ci;
          buildTable();
        });
      });
    }

    buildTable();
  }

  // ── Gauge table rendering ─────────────────────────────────────────────────────

  function renderGaugeTable(def, parsed) {
    const statsEl = document.getElementById("stats-" + def.id);
    const wrap = document.getElementById("wrap-" + def.id);
    if (!wrap) return;
    if (statsEl) statsEl.innerHTML = '';

    const palette = def.colors || DEFAULT_COLORS;
    const lastVals = parsed.series.map(function(s) {
      const v = s[s.length - 1];
      return v == null ? 0 : v;
    });
    const total = lastVals.reduce(function(a, b) { return a + b; }, 0);

    gaugeTableMaxes[def.id] = Math.max(gaugeTableMaxes[def.id] || 0, total);
    const gaugeMax = niceMax(gaugeTableMaxes[def.id] || 1);

    const canvasId = 'gtc-' + def.id;

    const rows = parsed.labels.map(function(lbl, i) {
      const color = i < palette.length ? palette[i] : DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      const val = lastVals[i];
      return '<tr>' +
        '<td style="text-align:left;padding:3px 12px 3px 0">' +
          '<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + color + ';margin-right:6px"></span>' +
          lbl +
        '</td>' +
        '<td style="text-align:right;padding:3px 0;color:var(--text)">' + val.toFixed(1) + '</td>' +
        '<td style="text-align:right;padding:3px 0 3px 8px;color:var(--muted);font-size:11px">' + def.unit + '</td>' +
      '</tr>';
    }).join('');

    wrap.innerHTML =
      '<div style="display:flex;gap:28px;align-items:center;flex-wrap:wrap">' +
        '<div style="text-align:center;flex-shrink:0">' +
          '<canvas id="' + canvasId + '" style="width:110px;height:74px;display:block"></canvas>' +
          '<div style="font-size:18px;font-weight:700;color:' + (palette[0] || '#00d4ff') + ';margin-top:4px">' +
            total.toFixed(1) +
            '<small style="font-size:11px;color:var(--muted);font-weight:400;margin-left:3px">' + def.unit + '</small>' +
          '</div>' +
        '</div>' +
        '<table style="font-size:12px;color:var(--text);border-collapse:collapse">' +
          '<thead><tr>' +
            '<th style="text-align:left;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.5px;padding-bottom:6px">Dimension</th>' +
            '<th style="text-align:right;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.5px;padding-bottom:6px;padding-left:12px" colspan="2">Value ' + def.unit + '</th>' +
          '</tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>';

    const canvas = document.getElementById(canvasId);
    if (canvas) drawGauge(canvas, total, gaugeMax, palette[0] || '#00d4ff');
  }

  // ── Card rendering ────────────────────────────────────────────────────────────

  function renderCard(def, parsed) {
    const statsEl = document.getElementById("stats-" + def.id);
    const wrap = document.getElementById("wrap-" + def.id);
    if (!statsEl || !wrap) return;

    // Special: gauge + dimension table
    if (def.display === 'gaugetable') {
      renderGaugeTable(def, parsed);
      return;
    }

    // Special: uptime text display
    if (def.display === 'uptime') {
      const s = parsed.series[0];
      const latestVal = s && s[s.length - 1];
      wrap.innerHTML =
        '<div style="text-align:center;padding:48px 0;font-size:24px;font-weight:700;color:var(--accent)">' +
        formatUptime(latestVal || 0) +
        '</div>';
      return;
    }

    // Scale values (MiB → GiB if needed). Stats and chart use the same scaled values.
    const preDivSeries = def.divisor
      ? parsed.series.map(s => s.map(v => v == null ? null : v / def.divisor))
      : parsed.series;
    const { series: scaledSeries, unit: displayUnit } = autoScale(
      preDivSeries,
      def.unit,
    );

    // Stats use raw (non-stacked) scaled values.
    // If the chart specifies a statDim, use that dimension; otherwise use series[0].
    if (!def.noStats) {
      const statIdx = def.statDim
        ? Math.max(0, parsed.labels.indexOf(def.statDim))
        : 0;
      const statPalette = def.colors && def.colors.length ? def.colors : DEFAULT_COLORS;
      const statColor = statPalette[statIdx % statPalette.length];
      const { cur, avg, max } = computeStats(scaledSeries, statIdx);
      const dp = displayUnit === "GiB" ? 2 : 1;

      function stat(label, val, color) {
        return (
          '<div class="stat"><div class="stat-label">' +
          label +
          "</div>" +
          '<div class="stat-value"' +
          (color ? ' style="color:' + color + '"' : "") +
          ">" +
          val.toFixed(dp) +
          '<small style="font-size:12px;color:var(--muted)"> ' +
          displayUnit +
          "</small>" +
          "</div></div>"
        );
      }

      statsEl.innerHTML =
        stat("Current", cur, statColor) +
        stat("Avg", avg, null) +
        stat("Max", max, "var(--yellow)");
    }

    // Chart uses stacked series (cumulative, reversed) for stacked charts
    let chartSeries = scaledSeries;
    let chartLabels = parsed.labels;
    let chartColors = def.colors;
    let rawRef = null;
    if (def.stacked) {
      // reverseStack: reverse dim order before stacking so that the first dim
      // ends up on top (foreground) after the internal reversal in stackSeries.
      // Needed for partition charts (e.g. free+used=total) where the dim order
      // from the API is opposite to the desired visual stacking order.
      const preStackSeries = def.reverseStack ? scaledSeries.slice().reverse() : scaledSeries;
      const preStackLabels = def.reverseStack ? parsed.labels.slice().reverse() : parsed.labels;
      const preStackColors = def.reverseStack ? def.colors.slice().reverse() : def.colors;
      const stacked = stackSeries(preStackSeries, preStackLabels, preStackColors);
      chartSeries = stacked.series;
      chartLabels = stacked.labels;
      chartColors = stacked.colors;
      // rawRef: original values aligned with chartLabels order for tooltip
      const rawForTooltip = def.reverseStack ? scaledSeries : scaledSeries.slice().reverse();
      if (!rawRefs[def.id]) rawRefs[def.id] = { series: rawForTooltip };
      else rawRefs[def.id].series = rawForTooltip;
      rawRef = rawRefs[def.id];
    }

    // Resolve Y axis max in display units
    let chartYMax = null;
    if (def.yMax === "ram") {
      const ramMib = nodeMap[currentNode] && nodeMap[currentNode].ram_mib;
      if (ramMib) chartYMax = displayUnit === "GiB" ? ramMib / 1024 : ramMib;
    } else if (typeof def.yMax === "number") {
      chartYMax = displayUnit === "GiB" ? def.yMax / 1024 : def.yMax;
    }

    const udata = [parsed.times, ...chartSeries];

    if (charts[def.id]) {
      charts[def.id].setData(udata);
    } else {
      wrap.innerHTML = "";
      charts[def.id] = buildChart(
        wrap,
        def,
        udata,
        chartLabels,
        displayUnit,
        chartYMax,
        chartColors,
        rawRef,
      );
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────────

  $("node-select").addEventListener("change", (e) => {
    if (e.target.value) selectNode(e.target.value);
  });

  $("refresh-btn").addEventListener("click", () => {
    if (currentNode) {
      fetchGen++;
      resetCharts();
      startPolling();
    }
  });

  $("chart-search").addEventListener("input", (e) => {
    searchFilter = e.target.value.trim();
    if (currentNode) {
      fetchGen++;
      resetCharts();
      startPolling();
    }
  });

  buildTimeRangeUI();
  buildSidebar();
  loadNodes();
})();
