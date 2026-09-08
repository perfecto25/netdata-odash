window.CHARTS = window.CHARTS || {};
window.CHARTS.gpu_clk_frequency = {
  id:          'gpu_clk_frequency',
  title:       'GPU Clock Frequency',
  sub:         'amdgpu.gpu_clk_frequency',
  endpoint:    '/gpudata',
  chartPrefix: 'amdgpu.gpu_clk_frequency',
  requires:    'gpu.amd',
  unit:        'MHz',
  colors:      [],
  nav:         { group: 'GPU', section: 'Frequency' },
};
