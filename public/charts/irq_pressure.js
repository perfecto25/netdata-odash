window.CHARTS = window.CHARTS || {};
window.CHARTS.irq_pressure = {
  id:      'irq_pressure',
  title:   'IRQ Full Pressure',
  sub:     'system.irq_full_pressure',
  chart:   'system.irq_full_pressure',
  unit:    '%',
  stacked: false,
  colors:  ['#ef4444', '#00d4ff', '#22c55e'],
  row:     true,
  nav:     { group: 'System', section: 'Pressure' },
};
