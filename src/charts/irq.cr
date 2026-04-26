module Charts
  module IrqPressure
    JS = {{ read_file("#{__DIR__}/../../public/charts/irq_pressure.js") }}
  end

  module IrqPressureStall
    JS = {{ read_file("#{__DIR__}/../../public/charts/irq_pressure_stall.js") }}
  end

  module CpuSomePressure
    JS = {{ read_file("#{__DIR__}/../../public/charts/cpu_some_pressure.js") }}
  end

  module CpuSomePressureStall
    JS = {{ read_file("#{__DIR__}/../../public/charts/cpu_some_pressure_stall.js") }}
  end

  module MemSomePressure
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_some_pressure.js") }}
  end

  module MemSomePressureStall
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_some_pressure_stall.js") }}
  end

  module MemFullPressure
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_full_pressure.js") }}
  end

  module MemFullPressureStall
    JS = {{ read_file("#{__DIR__}/../../public/charts/mem_full_pressure_stall.js") }}
  end

  module IoSomePressure
    JS = {{ read_file("#{__DIR__}/../../public/charts/io_some_pressure.js") }}
  end

  module IoSomePressureStall
    JS = {{ read_file("#{__DIR__}/../../public/charts/io_some_pressure_stall.js") }}
  end

  module IoFullPressure
    JS = {{ read_file("#{__DIR__}/../../public/charts/io_full_pressure.js") }}
  end

  module IoFullPressureStall
    JS = {{ read_file("#{__DIR__}/../../public/charts/io_full_pressure_stall.js") }}
  end
end
