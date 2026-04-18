window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_thp_faults = {
  id:      'mem_thp_faults',
  title:   'Transparent Hugepage Fault Allocations',
  sub:     'mem.thp_faults',
  chart:   'mem.thp_faults',
  unit:    'events/s',
  stacked: false,
  statDim: 'alloc',
  colors:  ['#22c55e'],
  nav:     { group: 'System', section: 'Memory' },
};
