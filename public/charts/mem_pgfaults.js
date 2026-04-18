window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_pgfaults = {
  id:      'mem_pgfaults',
  title:   'Memory Page Faults',
  sub:     'mem.pgfaults',
  chart:   'mem.pgfaults',
  unit:    'faults/s',
  stacked: false,
  statDim: 'minor',
  colors:  ['#22c55e', '#ef4444'],
  nav:     { group: 'System', section: 'Memory' },
};
