window.CHARTS = window.CHARTS || {};
window.CHARTS.cpu = {
  id:      'cpu',
  title:   'CPU Usage',
  sub:     'system.cpu',
  chart:   'system.cpu',
  unit:    '%',
  yMax:    100,
  stacked: true,
  colors:  ['#00d4ff', '#22c55e', '#eab308', '#ef4444', '#a855f7', '#f97316', '#06b6d4', '#84cc16'],
  nav:     { group: 'System', section: 'Compute' },
};
