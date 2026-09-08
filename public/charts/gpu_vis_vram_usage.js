window.CHARTS = window.CHARTS || {};
window.CHARTS.gpu_vis_vram_usage = {
  id:          'gpu_vis_vram_usage',
  title:       'Visible VRAM Usage',
  sub:         'amdgpu.gpu_mem_vis_vram_usage',
  endpoint:    '/gpudata',
  chartPrefix: 'amdgpu.gpu_mem_vis_vram_usage',
  requires:    'gpu.amd',
  unit:         'MiB',
  divisor:      1048576,
  stacked:      true,
  statDim:      'used',
  reverseStack: true,
  colors:       ['#22c55e', '#ef4444'],
  nav:         { group: 'GPU', section: 'VRAM' },
};
