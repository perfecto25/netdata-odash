window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_thp_collapse = {
  id:      'mem_thp_collapse',
  title:   'Transparent Hugepages Collapsed',
  sub:     'mem.thp_collapse',
  chart:   'mem.thp_collapse',
  unit:    'events/s',
  stacked: false,
  statDim: 'alloc',
  colors:  ['#22c55e'],
  nav:     { group: 'System', section: 'Memory' },
};
