window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_backlog = {
  id:          'disk_backlog',
  title:       'Disk Backlog',
  sub:         'disk.backlog',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_backlog',
  unit:        'ms',
  stacked:     false,
  colors:      ['#22c55e'],
  nav:         { group: 'Storage', section: 'Queue Ops' },
};
