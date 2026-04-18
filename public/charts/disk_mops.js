window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_mops = {
  id:          'disk_mops',
  title:       'Disk Merged Operations',
  sub:         'disk.mops',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_mops',
  unit:        'ops/s',
  stacked:     false,
  colors:      ['#22c55e', '#ef4444'],
  nav:         { group: 'Storage', section: 'Merged Ops' },
};
