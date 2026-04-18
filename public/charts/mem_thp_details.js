window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_thp_details = {
  id:      'mem_thp_details',
  title:   'Transparent Hugepages Details',
  sub:     'mem.thp_details',
  chart:   'mem.thp_details',
  unit:    'MiB',
  stacked: false,
  statDim: 'ShmemPmdMapped',
  colors:  ['#22c55e', '#ef4444', '#00d4ff'],
  nav:     { group: 'System', section: 'Memory' },
};
