window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_avgsz = {
  id:          'disk_avgsz',
  title:       'Avg I/O Op Size',
  sub:         'disk.avgsz',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_avgsz',
  unit:        'KiBy',
  stacked:     false,
  colors:      ['#22c55e', '#ef4444'],
  nav:         { group: 'Storage', section: 'Avg Op Size' },
};
