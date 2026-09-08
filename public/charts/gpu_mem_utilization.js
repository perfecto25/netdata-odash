window.CHARTS = window.CHARTS || {};
window.CHARTS.gpu_mem_utilization = {
  id:          'gpu_mem_utilization',
  title:       'GPU Memory Utilization',
  sub:         'amdgpu.gpu_mem_utilization',
  endpoint:    '/gpudata',
  chartPrefix: 'amdgpu.gpu_mem_utilization',
  requires:    'gpu.amd',
  unit:        '%',
  yMax:        100,
  colors:      [],
  nav:         { group: 'GPU', section: 'Utilization' },
};
