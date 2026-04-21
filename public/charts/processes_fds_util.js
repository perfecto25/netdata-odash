window.CHARTS = window.CHARTS || {};
window.CHARTS.processes_fds_util = {
  id:      'processes_fds_util',
  title:   'File Descriptors Utilization',
  sub:     'system.file_nr_utilization',
  chart:   'system.file_nr_utilization',
  unit:    '%',
  stacked: false,
  colors:  ['#f97316'],
  nav:     { group: 'Processes', section: 'Overview' },
};
