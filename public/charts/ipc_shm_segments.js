window.CHARTS = window.CHARTS || {};
window.CHARTS.ipc_shm_segments = {
  id:      'ipc_shm_segments',
  title:   'IPC Shared Memory Segments',
  sub:     'system.shared_memory_segments',
  chart:   'system.shared_memory_segments',
  unit:    'segments',
  stacked: false,
  colors:  ['#a855f7'],
  nav:     { group: 'Processes', section: 'Shared Memory' },
};
