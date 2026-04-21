window.CHARTS = window.CHARTS || {};
window.CHARTS.ipc_shm_bytes = {
  id:      'ipc_shm_bytes',
  title:   'IPC Shared Memory Used Bytes',
  sub:     'system.shared_memory_bytes',
  chart:   'system.shared_memory_bytes',
  unit:    'B',
  stacked: false,
  colors:  ['#00d4ff'],
  nav:     { group: 'Processes', section: 'Shared Memory' },
};
