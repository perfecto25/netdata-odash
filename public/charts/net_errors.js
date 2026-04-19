window.CHARTS = window.CHARTS || {};
window.CHARTS.net_errors = {
  id:          'net_errors',
  title:       'Interface Errors',
  sub:         'net_errors.*',
  endpoint:    '/diskdata',
  chartPrefix: 'net_errors',
  unit:        'errors/s',
  stacked:     false,
  colors:      ['#ef4444', '#f97316'],
  nav:         { group: 'Network', section: 'Errors' },
};
