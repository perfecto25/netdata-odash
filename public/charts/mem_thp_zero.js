window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_thp_zero = {
  id:      'mem_thp_zero',
  title:   'Transparent Hugepages Zero Page Allocations',
  sub:     'mem.thp_zero',
  chart:   'mem.thp_zero',
  unit:    'events/s',
  stacked: false,
  statDim: 'alloc',
  colors:  ['#22c55e', '#ef4444'],
  nav:     { group: 'System', section: 'Memory' },
};
