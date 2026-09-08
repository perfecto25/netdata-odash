window.CHARTS = window.CHARTS || {};
window.CHARTS.gpu_utilization = {
  id:          'gpu_utilization',
  title:       'GPU Utilization',
  sub:         'amdgpu.gpu_utilization',
  endpoint:    '/gpudata',
  chartPrefix: 'amdgpu.gpu_utilization',
  requires:    'gpu.amd',
  unit:        '%',
  yMax:        100,
  colors:      [],
  nav:         { group: 'GPU', section: 'Utilization' },
};
