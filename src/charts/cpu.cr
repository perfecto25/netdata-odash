module Charts
  module Cpu
    JS = {{ read_file("#{__DIR__}/../../public/charts/cpu.js") }}
  end

  module CpuInterrupts
    JS = {{ read_file("#{__DIR__}/../../public/charts/cpu_interrupts.js") }}
  end

end
