window.CHARTS = window.CHARTS || {};
window.CHARTS.processes_started = {
  id:      'processes_started',
  title:   'Started Processes',
  sub:     'system.forks',
  chart:   'system.forks',
  unit:    'processes/s',
  stacked: false,
  colors:  ['#22c55e'],
  nav:     { group: 'Processes', section: 'Overview' },
};
