module Charts
  module IpcSemaphoreArrays
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipc_semaphore_arrays.js") }}
  end
  
  module IpcSemaphores
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipc_semaphores.js") }}
  end
  
  module IpcShmBytes
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipc_shm_bytes.js") }}
  end
  
  module IpcShmSegments
    JS = {{ read_file("#{__DIR__}/../../public/charts/ipc_shm_segments.js") }}
  end
end