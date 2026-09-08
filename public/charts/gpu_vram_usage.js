window.CHARTS = window.CHARTS || {};
window.CHARTS.gpu_vram_usage = {
  id:          'gpu_vram_usage',
  title:       'VRAM Usage',
  sub:         'amdgpu.gpu_mem_vram_usage',
  endpoint:    '/gpudata',
  chartPrefix: 'amdgpu.gpu_mem_vram_usage',
  requires:    'gpu.amd',
  unit:         'MiB',
  divisor:      1048576,
  stacked:      true,
  statDim:      'used',
  // Netdata returns [free, used]; reversing puts used (red) on the bottom.
  reverseStack: true,
  colors:       ['#22c55e', '#ef4444'],
  nav:         { group: 'GPU', section: 'VRAM' },
};
