window.CHARTS = window.CHARTS || {};
window.CHARTS.mem_hwcorrupt = {
  id:      'mem_hwcorrupt',
  title:   'Corrupted Memory (ECC)',
  sub:     'mem.hwcorrupt',
  chart:   'mem.hwcorrupt',
  unit:    'MiB',
  stacked: false,
  statDim: 'HardwareCorrupted',
  colors:  ['#22c55e'],
  nav:     { group: 'System', section: 'Memory' },
};
