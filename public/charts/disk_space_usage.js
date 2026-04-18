window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_space_usage = {
  id:          'disk_space_usage',
  title:       'Disk Space Usage',
  sub:         'disk.space',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_space',
  unit:        'GiBy',
  stacked:     true,
  colors:      ['#22c55e', '#ef4444', '#6b7280'],
  nav:         { group: 'Storage', section: 'Used Space' },
};
