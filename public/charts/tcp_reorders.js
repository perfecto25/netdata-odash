window.CHARTS = window.CHARTS || {};
window.CHARTS.tcp_reorders = {
  id:      'tcp_reorders',
  title:   'TCP Reordered Packets by Detection Method',
  sub:     'ip.tcpreorders',
  chart:   'ip.tcpreorders',
  unit:    'packets/s',
  stacked: false,
  colors:  ['#00d4ff', '#ef4444', '#eab308', '#a855f7'],
  nav:     { group: 'Protocol', section: 'TCP' },
};
