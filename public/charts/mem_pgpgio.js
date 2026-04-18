window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_pgpgio = {
  id:      'mem_pgpgio',
  title:   'Paging I/O',
  sub:     'system.pgpgio',
  chart:   'system.pgpgio',
  unit:    'KiB/s',
  stacked: false,
  statDim: 'in',
  colors:  ['#22c55e', '#ef4444'],
  nav:     { group: 'Storage', section: 'Total I/O' },
};
