window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_iotime = {
  id:          'disk_iotime',
  title:       'Disk Total I/O Time',
  sub:         'disk.iotime',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_iotime',
  unit:        'ms/s',
  stacked:     false,
  colors:      ['#22c55e', '#ef4444'],
  nav:         { group: 'Storage', section: 'I/O Time' },
};
