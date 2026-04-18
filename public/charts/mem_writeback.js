window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_writeback = {
  id:      'mem_writeback',
  title:   'Writeback Memory',
  sub:     'mem.writeback',
  chart:   'mem.writeback',
  unit:    'MiB',
  stacked: false,
  statDim: 'Dirty',
  colors:  ['#22c55e', '#ef4444'],
  nav:     { group: 'System', section: 'Memory' },
};
