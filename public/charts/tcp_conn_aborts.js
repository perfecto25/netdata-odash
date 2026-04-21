window.CHARTS = window.CHARTS || {};
window.CHARTS.tcp_conn_aborts = {
  id:      'tcp_conn_aborts',
  title:   'TCP Connection Aborts',
  sub:     'ip.tcpconnaborts',
  chart:   'ip.tcpconnaborts',
  unit:    'conns/s',
  stacked: false,
  colors:  ['#ef4444', '#22c55e', '#f97316', '#eab308', '#00d4ff', '#a855f7'],
  nav:     { group: 'Protocol', section: 'TCP' },
};
