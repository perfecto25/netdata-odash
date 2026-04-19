window.CHARTS = window.CHARTS || {};
window.CHARTS.net_duplex = {
  id:          'net_duplex',
  title:       'Interface Duplex State',
  sub:         'net_duplex.*',
  endpoint:    '/diskdata',
  chartPrefix: 'net_duplex',
  unit:        'state',
  stacked:     false,
  colors:      ['#00d4ff', '#22c55e', '#eab308'],
  nav:         { group: 'Network', section: 'State' },
};
