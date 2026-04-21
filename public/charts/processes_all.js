window.CHARTS = window.CHARTS || {};
window.CHARTS.processes_all = {
  id:      'processes_all',
  title:   'Processes',
  sub:     'system.processes',
  chart:   'system.processes',
  unit:    'processes',
  display: 'gaugetable',
  stacked: false,
  colors:  ['#22c55e', '#00d4ff', '#eab308', '#ef4444', '#a855f7', '#f97316'],
  row:     true,
  nav:     { group: 'Processes', section: 'Overview' },
};
