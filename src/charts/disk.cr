module Charts
  module Disk
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk.js") }}
  end

  module DiskAvgsz
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_avgsz.js") }}
  end

  module DiskAwait
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_await.js") }}
  end

  module DiskBacklog
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_backlog.js") }}
  end

  module DiskBusy
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_busy.js") }}
  end

  module DiskExtAvgsz
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_ext_avgsz.js") }}
  end

  module DiskExtAwait
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_ext_await.js") }}
  end

  module DiskExtIo
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_ext_io.js") }}
  end

  module DiskExtIotime
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_ext_iotime.js") }}
  end

  module DiskExtOps
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_ext_ops.js") }}
  end

  module DiskInodesUsage
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_inodes_usage.js") }}
  end

  module DiskIotime
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_iotime.js") }}
  end

  module DiskMops
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_mops.js") }}
  end

  module DiskOps
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_ops.js") }}
  end

  module DiskQops
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_qops.js") }}
  end

  module DiskSpaceUsage
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_space_usage.js") }}
  end

  module DiskSvctm
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_svctm.js") }}
  end

  module DiskUtil
    JS = {{ read_file("#{__DIR__}/../../public/charts/disk_util.js") }}
  end

end
