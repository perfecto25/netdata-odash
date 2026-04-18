window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_balloon = {
  id:      'mem_balloon',
  title:   'Memory Ballooning Operations',
  sub:     'mem.balloon',
  chart:   'mem.balloon',
  unit:    'KiB/s',
  stacked: false,
  statDim: 'inflate',
  colors:  ['#22c55e', '#ef4444', '#00d4ff'],
  nav:     { group: 'System', section: 'Memory' },
};
