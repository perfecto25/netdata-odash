window.CHARTS = window.CHARTS || {};
window.CHARTS.tcp_syn_cookies = {
  id:      'tcp_syn_cookies',
  title:   'TCP SYN Cookies',
  sub:     'ip.tcpsyncookies',
  chart:   'ip.tcpsyncookies',
  unit:    'packets/s',
  stacked: false,
  colors:  ['#22c55e', '#f97316', '#ef4444'],
  nav:     { group: 'Protocol', section: 'TCP' },
};
