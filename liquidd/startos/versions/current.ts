import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '23.3.3:2',
  releaseNotes: {
    en_US:
      'Bound resource usage to prevent OOM/hangs on memory-tight boxes shared with other services: dbcache=200 (was 450), maxmempool=64 (was 300), maxconnections=25 (was 125), par=2 script-verification threads. Liquid mainnet is a small chain, so this barely affects sync speed.',
    es_ES:
      'Acota el uso de recursos para evitar OOM/cuelgues en equipos con poca RAM compartidos con otros servicios: dbcache=200 (antes 450), maxmempool=64 (antes 300), maxconnections=25 (antes 125), par=2 hilos de verificación de scripts. Liquid mainnet es una cadena pequeña, así que esto apenas afecta a la velocidad de sincronización.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
