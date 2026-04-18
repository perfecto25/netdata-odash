window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_ops = {
  id:          'disk_ops',
  title:       'Disk Completed I/O Operations',
  sub:         'disk.ops',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_ops',
  unit:        'ops/s',
  stacked:     false,
  colors:      ['#22c55e', '#ef4444'],
  nav:         { group: 'Storage', section: 'IOPS' },
};
