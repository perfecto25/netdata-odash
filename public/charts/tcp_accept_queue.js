window.CHARTS = window.CHARTS || {};
window.CHARTS.tcp_accept_queue = {
  id:      'tcp_accept_queue',
  title:   'TCP Accept Queue Issues',
  sub:     'ip.tcp_accept_queue',
  chart:   'ip.tcp_accept_queue',
  unit:    'packets/s',
  stacked: false,
  colors:  ['#ef4444', '#f97316'],
  nav:     { group: 'Network', section: 'TCP' },
};
