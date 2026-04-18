window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_hugepages = {
  id:      'mem_hugepages',
  title:   'Transparent Hugepages',
  sub:     'mem.thp',
  chart:   'mem.thp',
  unit:    'MiB',
  stacked: false,
  statDim: 'anonymous',
  colors:  ['#22c55e', '#eab308'],
  nav:     { group: 'System', section: 'Memory' },
};
