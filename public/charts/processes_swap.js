window.CHARTS = window.CHARTS || {};
window.CHARTS.processes_swap = {
  id:       'processes_swap',
  title:    'Apps Swap Usage',
  sub:      'app.swap_usage',
  endpoint: '/appswapdata',
  chart:    'app.swap_usage',
  unit:     'MiB',
  stacked:  true,
  colors:   [],
  nav:      { group: 'Processes', section: 'Swap' },
};
