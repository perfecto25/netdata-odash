window.CHARTS = window.CHARTS || {};
window.CHARTS.net_mtu = {
  id:          'net_mtu',
  title:       'Interface MTU',
  sub:         'net_mtu.*',
  endpoint:    '/diskdata',
  chartPrefix: 'net_mtu',
  unit:        'octets',
  stacked:     false,
  colors:      ['#00d4ff'],
  nav:         { group: 'Network', section: 'State' },
};
