window.CHARTS = window.CHARTS || {};
window.CHARTS.cpu_interrupts = {
  id:      'cpu_interrupts',
  title:   'CPU Interrupts',
  sub:     'system.intr',
  chart:   'system.intr',
  unit:    'interrupts/s',
  stacked: false,
  colors:  ['#22c55e'],
  nav:     { group: 'System', section: 'Compute' },
};
