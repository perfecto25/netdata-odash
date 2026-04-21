window.CHARTS = window.CHARTS || {};
window.CHARTS.tcp_packets = {
  id:      'tcp_packets',
  title:   'IPv4 TCP Packets',
  sub:     'ip.tcppackets',
  chart:   'ip.tcppackets',
  unit:    'packets/s',
  stacked: false,
  colors:  ['#22c55e', '#ef4444'],
  nav:     { group: 'Protocol', section: 'TCP' },
};
