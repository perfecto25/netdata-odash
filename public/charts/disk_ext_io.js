window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_ext_io = {
  id:          'disk_ext_io',
  title:       'Discarded Data',
  sub:         'disk_ext.io',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_ext',
  unit:        'KiB/s',
  stacked:     false,
  colors:      ['#a855f7'],
  nav:         { group: 'Storage', section: 'Discard Rate' },
};
