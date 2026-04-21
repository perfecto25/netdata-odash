window.CHARTS = window.CHARTS || {};
window.CHARTS.processes_fds_line = {
  id:      'processes_fds_line',
  title:   'File Descriptors',
  sub:     'system.file_nr_used',
  chart:   'system.file_nr_used',
  unit:    'files',
  stacked: false,
  colors:  ['#f97316'],
  nav:     { group: 'Processes', section: 'Overview' },
};
