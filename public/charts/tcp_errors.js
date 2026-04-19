window.CHARTS = window.CHARTS || {};
window.CHARTS.tcp_errors = {
  id:      'tcp_errors',
  title:   'IPv4 TCP Errors',
  sub:     'ip.tcperrors',
  chart:   'ip.tcperrors',
  unit:    'packets/s',
  stacked: false,
  colors:  ['#ef4444'],
  nav:     { group: 'Network', section: 'TCP' },
};
