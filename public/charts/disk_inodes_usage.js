window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_inodes_usage = {
  id:          'disk_inodes_usage',
  title:       'Disk Files (inodes) Usage',
  sub:         'disk.inodes',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_inodes',
  unit:        'M inodes',
  divisor:     1e6,
  stacked:     true,
  colors:      ['#22c55e', '#ef4444', '#6b7280'],
  nav:         { group: 'Storage', section: 'Used Files' },
};
