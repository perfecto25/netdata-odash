window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_busy = {
  id:          'disk_busy',
  title:       'Disk Busy Time',
  sub:         'disk.busy',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_busy',
  unit:        'ms',
  stacked:     false,
  colors:      ['#eab308'],
  nav:         { group: 'Storage', section: 'Utilization' },
};
