window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_util = {
  id:          'disk_util',
  title:       'Disk Utilization',
  sub:         'disk.util',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_util',
  unit:        '%',
  yMax:        100,
  stacked:     false,
  colors:      ['#22c55e'],
  nav:         { group: 'Storage', section: 'Utilization' },
};
