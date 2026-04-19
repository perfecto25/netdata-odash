window.CHARTS = window.CHARTS || {};
window.CHARTS.net_drops = {
  id:          'net_drops',
  title:       'Interface Drops',
  sub:         'net_drops.*',
  endpoint:    '/diskdata',
  chartPrefix: 'net_drops',
  unit:        'drops/s',
  stacked:     false,
  colors:      ['#ef4444', '#f97316'],
  nav:         { group: 'Network', section: 'Drops' },
};
