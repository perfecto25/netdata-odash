window.CHARTS = window.CHARTS || {};
window.CHARTS.processes_oom_line = {
  id:      'processes_oom_line',
  title:   'Out of Memory Kills',
  sub:     'mem.oom_kill',
  chart:   'mem.oom_kill',
  unit:    'kills/s',
  stacked: false,
  colors:  ['#ef4444'],
  nav:     { group: 'Processes', section: 'Overview' },
};
