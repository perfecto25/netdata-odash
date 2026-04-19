window.CHARTS = window.CHARTS || {};
window.CHARTS.net_events = {
  id:          'net_events',
  title:       'Network Interface Events',
  sub:         'net_events.*',
  endpoint:    '/diskdata',
  chartPrefix: 'net_events',
  unit:        'events/s',
  stacked:     false,
  colors:      ['#22c55e', '#ef4444', '#eab308'],
  nav:         { group: 'Network', section: 'Events' },
};
