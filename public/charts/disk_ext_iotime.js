window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_ext_iotime = {
  id:          'disk_ext_iotime',
  title:       'Disk Extended I/O Time',
  sub:         'disk_ext.iotime',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_ext_iotime',
  unit:        'ms/s',
  stacked:     false,
  colors:      ['#22c55e', '#00d4ff'],
  nav:         { group: 'Storage', section: 'Ext I/O Time' },
};
