window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_thp_file = {
  id:      'mem_thp_file',
  title:   'Transparent Hugepage File Allocations',
  sub:     'mem.thp_file',
  chart:   'mem.thp_file',
  unit:    'events/s',
  stacked: false,
  statDim: 'alloc',
  colors:  ['#22c55e', '#ef4444', '#00d4ff', '#f97316'],
  nav:     { group: 'System', section: 'Memory' },
};
