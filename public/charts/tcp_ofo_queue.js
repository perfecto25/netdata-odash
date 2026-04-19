window.CHARTS = window.CHARTS || {};
window.CHARTS.tcp_ofo_queue = {
  id:      'tcp_ofo_queue',
  title:   'TCP Out-Of-Order Queue',
  sub:     'ip.tcpofo',
  chart:   'ip.tcpofo',
  unit:    'packets/s',
  stacked: false,
  colors:  ['#00d4ff', '#ef4444', '#22c55e', '#f97316'],
  nav:     { group: 'Network', section: 'TCP' },
};
