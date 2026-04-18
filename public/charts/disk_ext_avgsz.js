window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_ext_avgsz = {
  id:          'disk_ext_avgsz',
  title:       'Avg Discarded Data Size',
  sub:         'disk_ext.avgsz',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_ext_avgsz',
  unit:        'KiBy',
  stacked:     false,
  colors:      ['#a855f7'],
  nav:         { group: 'Storage', section: 'Avg Discard Size' },
};
