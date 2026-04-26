window.CHARTS = window.CHARTS || {};
window.CHARTS.cpu_interrupts = {
  id:      'cpu_interrupts',
  title:   'CPU Interrupts',
  sub:     'system.interrupts',
  chart:   'system.interrupts',
  unit:    'K/s',
  divisor: 1000,
  stacked: true,
  colors:  [],
  noStats: true,
  nav:     { group: 'System', section: 'Compute' },
};
