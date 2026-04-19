window.CHARTS = window.CHARTS || {};
window.CHARTS.net_carrier = {
  id:          'net_carrier',
  title:       'Interface Physical Link State',
  sub:         'net_carrier.*',
  endpoint:    '/diskdata',
  chartPrefix: 'net_carrier',
  unit:        'state',
  stacked:     false,
  colors:      ['#22c55e', '#ef4444'],
  nav:         { group: 'Network', section: 'State' },
};
