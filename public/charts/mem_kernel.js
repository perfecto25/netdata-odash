window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_kernel = {
  id:      'mem_kernel',
  title:   'Memory Used by Kernel',
  sub:     'mem.kernel',
  chart:   'mem.kernel',
  unit:    'MiB',
  stacked: true,
  statDim: 'Slab',
  colors:  ['#22c55e', '#ef4444', '#00d4ff', '#f97316', '#eab308', '#a855f7'],
  nav:     { group: 'System', section: 'Memory' },
};
