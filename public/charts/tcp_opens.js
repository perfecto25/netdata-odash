window.CHARTS = window.CHARTS || {};
window.CHARTS.tcp_opens = {
  id:      'tcp_opens',
  title:   'IPv4 TCP Opens',
  sub:     'ip.tcpopens',
  chart:   'ip.tcpopens',
  unit:    'conns/s',
  stacked: false,
  colors:  ['#22c55e', '#f97316'],
  nav:     { group: 'Network', section: 'TCP' },
};
