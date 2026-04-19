window.CHARTS = window.CHARTS || {};
window.CHARTS.tcp_syn_queue = {
  id:      'tcp_syn_queue',
  title:   'TCP SYN Queue Issues',
  sub:     'ip.tcp_syn_queue',
  chart:   'ip.tcp_syn_queue',
  unit:    'packets/s',
  stacked: false,
  colors:  ['#ef4444', '#eab308'],
  nav:     { group: 'Network', section: 'TCP' },
};
