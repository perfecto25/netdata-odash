window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_await = {
  id:          'disk_await',
  title:       'Avg I/O Operation Time',
  sub:         'disk.await',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_await',
  unit:        'ms',
  stacked:     false,
  colors:      ['#22c55e', '#ef4444'],
  nav:         { group: 'Storage', section: 'Latency' },
};
