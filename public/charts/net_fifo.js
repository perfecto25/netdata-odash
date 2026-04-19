window.CHARTS = window.CHARTS || {};
window.CHARTS.net_fifo = {
  id:          'net_fifo',
  title:       'Interface FIFO Buffer Errors',
  sub:         'net_fifo.*',
  endpoint:    '/diskdata',
  chartPrefix: 'net_fifo',
  unit:        'errors',
  stacked:     false,
  colors:      ['#ef4444', '#f97316'],
  nav:         { group: 'Network', section: 'FIFO' },
};
