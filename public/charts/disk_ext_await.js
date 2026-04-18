window.CHARTS = window.CHARTS || {};
window.CHARTS.disk_ext_await = {
  id:          'disk_ext_await',
  title:       'Avg Extended I/O Operation Time',
  sub:         'disk_ext.await',
  endpoint:    '/diskdata',
  chartPrefix: 'disk_ext_await',
  unit:        'ms',
  stacked:     false,
  colors:      ['#22c55e', '#00d4ff'],
  nav:         { group: 'Storage', section: 'Extended Latency' },
};
