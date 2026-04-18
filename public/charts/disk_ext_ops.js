window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_ext_ops = {
  id:          'disk_ext_ops',
  title:       'Disk Extended I/O Operations',
  sub:         'disk_ext.ops',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_ext_ops',
  unit:        'ops/s',
  stacked:     false,
  colors:      ['#22c55e', '#00d4ff'],
  nav:         { group: 'Storage', section: 'Extended IOPS' },
};
