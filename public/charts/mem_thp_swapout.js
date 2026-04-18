window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_thp_swapout = {
  id:      'mem_thp_swapout',
  title:   'Transparent Hugepages Swap Out',
  sub:     'mem.thp_swapout',
  chart:   'mem.thp_swapout',
  unit:    'events/s',
  stacked: false,
  statDim: 'swapout',
  colors:  ['#22c55e', '#ef4444'],
  nav:     { group: 'System', section: 'Memory' },
};
