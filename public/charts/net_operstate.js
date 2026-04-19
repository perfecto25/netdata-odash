window.CHARTS = window.CHARTS || {};
window.CHARTS.net_operstate = {
  id:          'net_operstate',
  title:       'Interface Operational State',
  sub:         'net_operstate.*',
  endpoint:    '/diskdata',
  chartPrefix: 'net_operstate',
  unit:        'state',
  stacked:     false,
  colors:      ['#22c55e', '#ef4444'],
  nav:         { group: 'Network', section: 'State' },
};
