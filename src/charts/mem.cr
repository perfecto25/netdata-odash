module Charts
  module MemAvailable
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_available.js") }}
  end

  module MemCommitted
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_committed.js") }}
  end

  module MemSwap
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_swap.js") }}
  end

  module MemSwapCached
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_swap_cached.js") }}
  end

  module MemSwapio
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_swapio.js") }}
  end
  
  module MemBalloon
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_balloon.js") }}
  end
  
  module MemHugepages
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_hugepages.js") }}
  end
  
  module MemHwcorrupt
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_hwcorrupt.js") }}
  end
  
  module MemKernel
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_kernel.js") }}
  end
  
  module MemPgfaults
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_pgfaults.js") }}
  end
  
  module MemPgpgio
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_pgpgio.js") }}
  end
  
  module MemReclaiming
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_reclaiming.js") }}
  end
  
  module MemSlab
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_slab.js") }}
  end
  
  module MemThpCollapse
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_thp_collapse.js") }}
  end
  
  module MemThpCompact
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_thp_compact.js") }}
  end
  
  module MemThpDetails
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_thp_details.js") }}
  end
  
  module MemThpFaults
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_thp_faults.js") }}
  end
  
  module MemThpFile
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_thp_file.js") }}
  end
  
  module MemThpSplit
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_thp_split.js") }}
  end
  
  module MemThpSwapout
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_thp_swapout.js") }}
  end
  
  module MemThpZero
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_thp_zero.js") }}
  end
  
  module MemWriteback
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_writeback.js") }}
  end
  
  module Memory
    JS = {{ read_file("#{__DIR__}/../../public/charts/memory.js") }}
  end
end
