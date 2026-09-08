window.CHARTS = window.CHARTS || {};
window.CHARTS.gpu_vram_usage_perc = {
  id:          'gpu_vram_usage_perc',
  title:       'VRAM Usage %',
  sub:         'amdgpu.gpu_mem_vram_usage_perc',
  endpoint:    '/gpudata',
  chartPrefix: 'amdgpu.gpu_mem_vram_usage_perc',
  requires:    'gpu.amd',
  unit:        '%',
  yMax:        100,
  colors:      [],
  nav:         { group: 'GPU', section: 'VRAM' },
};
