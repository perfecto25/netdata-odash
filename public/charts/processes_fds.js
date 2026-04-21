window.CHARTS = window.CHARTS || {};
window.CHARTS.processes_fds = {
  id:      'processes_fds',
  title:   'Used File Descriptors',
  sub:     'system.file_nr_used',
  chart:   'system.file_nr_used',
  unit:    'files',
  display: 'gaugetable',
  stacked: false,
  colors:  ['#f97316'],
  row:     true,
  nav:     { group: 'Processes', section: 'Overview' },
};
