window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_slab = {
  id:      'mem_slab',
  title:   'Reclaimable Kernel Memory',
  sub:     'mem.slab',
  chart:   'mem.slab',
  unit:    'MiB',
  stacked: true,
  statDim: 'reclaimable',
  colors:  ['#22c55e', '#ef4444'],
  nav:     { group: 'System', section: 'Memory' },
};
