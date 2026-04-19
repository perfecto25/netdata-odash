window.CHARTS = window.CHARTS || {};
window.CHARTS.tcp_handshake = {
  id:      'tcp_handshake',
  title:   'IPv4 TCP Handshake Issues',
  sub:     'ip.tcphandshake',
  chart:   'ip.tcphandshake',
  unit:    'events/s',
  stacked: false,
  colors:  ['#ef4444', '#f97316'],
  nav:     { group: 'Network', section: 'TCP' },
};
