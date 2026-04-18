window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_available = {
  id:      'mem_available',
  title:   'Available RAM',
  sub:     'mem.available',
  chart:   'mem.available',
  unit:    'MiB',
  stacked: false,
  statDim: 'avail',
  colors:  ['#22c55e'],
  nav:     { group: 'System', section: 'Memory' },
};
