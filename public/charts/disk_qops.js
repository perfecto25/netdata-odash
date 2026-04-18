window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_qops = {
  id:          'disk_qops',
  title:       'Disk Current I/O Operations',
  sub:         'disk.qops',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_qops',
  unit:        'operations',
  stacked:     false,
  colors:      ['#22c55e'],
  nav:         { group: 'Storage', section: 'Queue Ops' },
};
