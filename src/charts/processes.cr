module Charts
  module ProcessesActive
    JS = {{ read_file("#{__DIR__}/../../public/charts/processes_active.js") }}
  end

  module ProcessesAll
    JS = {{ read_file("#{__DIR__}/../../public/charts/processes_all.js") }}
  end

  module ProcessesCtxt
    JS = {{ read_file("#{__DIR__}/../../public/charts/processes_ctxt.js") }}
  end

  module ProcessesCtxtLine
    JS = {{ read_file("#{__DIR__}/../../public/charts/processes_ctxt_line.js") }}
  end

  module ProcessesFds
    JS = {{ read_file("#{__DIR__}/../../public/charts/processes_fds.js") }}
  end

  module ProcessesFdsLine
    JS = {{ read_file("#{__DIR__}/../../public/charts/processes_fds_line.js") }}
  end

  module ProcessesFdsUtil
    JS = {{ read_file("#{__DIR__}/../../public/charts/processes_fds_util.js") }}
  end

  module ProcessesForks
    JS = {{ read_file("#{__DIR__}/../../public/charts/processes_forks.js") }}
  end

  module ProcessesOom
    JS = {{ read_file("#{__DIR__}/../../public/charts/processes_oom.js") }}
  end

  module ProcessesOomLine
    JS = {{ read_file("#{__DIR__}/../../public/charts/processes_oom_line.js") }}
  end

  module ProcessesRunning
    JS = {{ read_file("#{__DIR__}/../../public/charts/processes_running.js") }}
  end

  module ProcessesStarted
    JS = {{ read_file("#{__DIR__}/../../public/charts/processes_started.js") }}
  end

  module ProcessesSwap
    JS = {{ read_file("#{__DIR__}/../../public/charts/processes_swap.js") }}
  end
end
