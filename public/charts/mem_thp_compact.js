window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_thp_compact = {
  id:      'mem_thp_compact',
  title:   'Transparent Hugepages Compaction',
  sub:     'mem.thp_compact',
  chart:   'mem.thp_compact',
  unit:    'events/s',
  stacked: false,
  statDim: 'success',
  colors:  ['#22c55e', '#ef4444', '#00d4ff'],
  nav:     { group: 'System', section: 'Memory' },
};
