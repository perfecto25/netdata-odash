window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_swap = {
  id:      'mem_swap',
  title:   'System Swap',
  sub:     'mem.swap',
  chart:   'mem.swap',
  unit:    'MiB',
  stacked: true,
  colors:  ['#22c55e', '#ef4444'],
  reverseStack: true,
  nav:     { group: 'System', section: 'Memory' },
};
