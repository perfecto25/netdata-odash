window.CHARTS = window.CHARTS || {};
window.CHARTS.processes_oom = {
  id:      'processes_oom',
  title:   'OOM Kills',
  sub:     'mem.oom_kill',
  chart:   'mem.oom_kill',
  unit:    'kills/s',
  display: 'gaugetable',
  stacked: false,
  colors:  ['#ef4444'],
  row:     true,
  nav:     { group: 'Processes', section: 'Overview' },
};
