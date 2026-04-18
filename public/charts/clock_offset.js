window.CHARTS = window.CHARTS || {};
window.CHARTS.clock_offset = {
  id:      'clock_offset',
  title:   'Computed Time Offset Between Local System and Reference Clock',
  sub:     'system.clock_sync_offset',
  chart:   'system.clock_sync_offset',
  unit:    'ms',
  stacked: false,
  noStats: true,
  colors:  ['#22c55e'],
  nav:     { group: 'System', section: 'Clock' },
};
