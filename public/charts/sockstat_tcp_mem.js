window.CHARTS = window.CHARTS || {};
window.CHARTS.sockstat_tcp_mem = {
  id:      'sockstat_tcp_mem',
  title:   'TCP Sockets Memory',
  sub:     'ipv4.sockstat_tcp_mem',
  chart:   'ipv4.sockstat_tcp_mem',
  unit:    'KiB',
  stacked: false,
  colors:  ['#22c55e'],
  nav:     { group: 'Network', section: 'Sockets' },
};
