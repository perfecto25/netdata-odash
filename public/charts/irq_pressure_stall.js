window.CHARTS = window.CHARTS || {};
window.CHARTS.irq_pressure_stall = {
  id:      'irq_pressure_stall',
  title:   'IRQ Full Pressure Stall Time',
  sub:     'system.irq_full_pressure_stall_time',
  chart:   'system.irq_full_pressure_stall_time',
  unit:    'ms',
  stacked: false,
  colors:  ['#22c55e'],
  row:     true,
  nav:     { group: 'System', section: 'Pressure' },
};
