module Charts
  module GpuUtilization
    JS = {{ read_file("#{__DIR__}/../../public/charts/gpu_utilization.js") }}
  end

  module GpuMemUtilization
    JS = {{ read_file("#{__DIR__}/../../public/charts/gpu_mem_utilization.js") }}
  end

  module GpuClkFrequency
    JS = {{ read_file("#{__DIR__}/../../public/charts/gpu_clk_frequency.js") }}
  end

  module GpuMemClkFrequency
    JS = {{ read_file("#{__DIR__}/../../public/charts/gpu_mem_clk_frequency.js") }}
  end

  module GpuVramUsagePerc
    JS = {{ read_file("#{__DIR__}/../../public/charts/gpu_vram_usage_perc.js") }}
  end

  module GpuVramUsage
    JS = {{ read_file("#{__DIR__}/../../public/charts/gpu_vram_usage.js") }}
  end

  module GpuVisVramUsagePerc
    JS = {{ read_file("#{__DIR__}/../../public/charts/gpu_vis_vram_usage_perc.js") }}
  end

  module GpuVisVramUsage
    JS = {{ read_file("#{__DIR__}/../../public/charts/gpu_vis_vram_usage.js") }}
  end

  module GpuGttUsagePerc
    JS = {{ read_file("#{__DIR__}/../../public/charts/gpu_gtt_usage_perc.js") }}
  end

  module GpuGttUsage
    JS = {{ read_file("#{__DIR__}/../../public/charts/gpu_gtt_usage.js") }}
  end
end
