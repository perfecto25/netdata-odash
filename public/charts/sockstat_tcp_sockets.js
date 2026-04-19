window.CHARTS = window.CHARTS || {};
window.CHARTS.sockstat_tcp_sockets = {
  id:      'sockstat_tcp_sockets',
  title:   'TCP Sockets',
  sub:     'ipv4.sockstat_tcp_sockets',
  chart:   'ipv4.sockstat_tcp_sockets',
  unit:    'sockets',
  stacked: false,
  colors:  ['#22c55e', '#f97316', '#00d4ff', '#eab308'],
  nav:     { group: 'Network', section: 'Sockets' },
};
