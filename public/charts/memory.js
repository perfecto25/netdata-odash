window.CHARTS = window.CHARTS || {};
window.CHARTS.memory = {
  id:      'memory',
  title:   'Memory Usage',
  sub:     'system.ram',
  chart:   'system.ram',
  unit:    'MiB',
  yMax:    'ram',   // resolved at render time from the selected node's total RAM
  stacked: true,
  statDim: 'used',   // dimension name to use for Current/Avg/Max stats
  colors:  ['#00d4ff', '#22c55e', '#eab308', '#6b7280'],
  nav:     { group: 'System', section: 'Memory' },
};
