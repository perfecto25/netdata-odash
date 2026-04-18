window.CHARTS = window.CHARTS || {};
window.CHARTS.load = {
  id:      'load',
  title:   'Load Average',
  sub:     'system.load',
  chart:   'system.load',
  unit:    'threads',
  stacked: false,
  statDim: 'load1',
  colors:  ['#22c55e', '#ef4444', '#00d4ff'],
  nav:     { group: 'System', section: 'Compute' },
};
