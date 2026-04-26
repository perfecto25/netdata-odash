module Charts
  module Clock
    JS = {{ read_file("#{__DIR__}/../../public/charts/clock.js") }}
  end

  module ClockOffset
    JS = {{ read_file("#{__DIR__}/../../public/charts/clock_offset.js") }}
  end

  module ClockSyncState
    JS = {{ read_file("#{__DIR__}/../../public/charts/clock_sync_state.js") }}
  end

end
