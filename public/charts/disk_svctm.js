window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_svctm = {
  id:          'disk_svctm',
  title:       'Average Service Time',
  sub:         'disk.svctm',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_svctm',
  unit:        'ms',
  stacked:     false,
  colors:      ['#22c55e'],
  nav:         { group: 'Storage', section: 'Utilization' },
};
