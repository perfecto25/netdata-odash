window.CHARTS = window.CHARTS || {};
window.CHARTS.gpu_vis_vram_usage_perc = {
  id:          'gpu_vis_vram_usage_perc',
  title:       'Visible VRAM Usage %',
  sub:         'amdgpu.gpu_mem_vis_vram_usage_perc',
  endpoint:    '/gpudata',
  chartPrefix: 'amdgpu.gpu_mem_vis_vram_usage_perc',
  requires:    'gpu.amd',
  unit:        '%',
  yMax:        100,
  colors:      [],
  nav:         { group: 'GPU', section: 'VRAM' },
};
