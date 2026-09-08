window.CHARTS = window.CHARTS || {};
window.CHARTS.gpu_gtt_usage = {
  id:          'gpu_gtt_usage',
  title:       'GTT Usage',
  sub:         'amdgpu.gpu_mem_gtt_usage',
  endpoint:    '/gpudata',
  chartPrefix: 'amdgpu.gpu_mem_gtt_usage',
  requires:    'gpu.amd',
  unit:         'MiB',
  divisor:      1048576,
  stacked:      true,
  statDim:      'used',
  reverseStack: true,
  colors:       ['#22c55e', '#ef4444'],
  nav:         { group: 'GPU', section: 'GTT' },
};
