window.CHARTS = window.CHARTS || {};
window.CHARTS.net_packets = {
  id:          'net_packets',
  title:       'Network Packets',
  sub:         'net_packets.*',
  endpoint:    '/diskdata',
  chartPrefix: 'net_packets',
  unit:        'packets/s',
  stacked:     false,
  colors:      ['#22c55e', '#f97316', '#00d4ff'],
  nav:         { group: 'Network', section: 'Packets' },
};
