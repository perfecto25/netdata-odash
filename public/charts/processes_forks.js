window.CHARTS = window.CHARTS || {};
window.CHARTS.processes_forks = {
  id:      'processes_forks',
  title:   'Forks',
  sub:     'system.forks',
  chart:   'system.forks',
  unit:    'processes/s',
  display: 'gaugetable',
  stacked: false,
  colors:  ['#22c55e'],
  row:     true,
  nav:     { group: 'Processes', section: 'Overview' },
};
