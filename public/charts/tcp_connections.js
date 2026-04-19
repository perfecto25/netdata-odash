window.CHARTS = window.CHARTS || {};
window.CHARTS.tcp_connections = {
  id:      'tcp_connections',
  title:   'TCP Connections',
  sub:     'ip.tcpsock',
  chart:   'ip.tcpsock',
  unit:    'connections',
  stacked: false,
  colors:  ['#22c55e'],
  nav:     { group: 'Network', section: 'TCP' },
};
