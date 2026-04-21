window.CHARTS = window.CHARTS || {};
window.CHARTS.tcp_mem_pressures = {
  id:      'tcp_mem_pressures',
  title:   'TCP Memory Pressures',
  sub:     'ip.tcpmemorypressures',
  chart:   'ip.tcpmemorypressures',
  unit:    'events/s',
  stacked: false,
  colors:  ['#eab308'],
  nav:     { group: 'Protocol', section: 'TCP' },
};
