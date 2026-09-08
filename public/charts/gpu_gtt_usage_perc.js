window.CHARTS = window.CHARTS || {};
window.CHARTS.gpu_gtt_usage_perc = {
  id:          'gpu_gtt_usage_perc',
  title:       'GTT Usage %',
  sub:         'amdgpu.gpu_mem_gtt_usage_perc',
  endpoint:    '/gpudata',
  chartPrefix: 'amdgpu.gpu_mem_gtt_usage_perc',
  requires:    'gpu.amd',
  unit:        '%',
  yMax:        100,
  colors:      [],
  nav:         { group: 'GPU', section: 'GTT' },
};
