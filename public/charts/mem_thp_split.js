window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_thp_split = {
  id:      'mem_thp_split',
  title:   'Transparent Hugepage Splits',
  sub:     'mem.thp_split',
  chart:   'mem.thp_split',
  unit:    'events/s',
  stacked: false,
  statDim: 'split_pmd',
  colors:  ['#00d4ff', '#ef4444'],
  nav:     { group: 'System', section: 'Memory' },
};
