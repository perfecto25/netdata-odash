window.CHARTS = window.CHARTS || {};
window.CHARTS.net_speed = {
  id:          'net_speed',
  title:       'Interface Speed',
  sub:         'net_speed.*',
  endpoint:    '/diskdata',
  chartPrefix: 'net_speed',
  unit:        'kbit/s',
  stacked:     false,
  colors:      ['#22c55e'],
  nav:         { group: 'Network', section: 'State' },
};
