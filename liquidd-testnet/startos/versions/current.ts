import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '23.3.3:3',
  releaseNotes: {
    en_US:
      'Cap memory usage (dbcache=100, maxmempool=50, maxconnections=20, par=1) to avoid the Linux OOM killer terminating elementsd on low-RAM boxes. Builds on the testnet config fix (liquidtestnet, no peg-in, network options passed on the command line).',
    es_ES:
      'Limita el uso de memoria (dbcache=100, maxmempool=50, maxconnections=20, par=1) para evitar que el OOM killer de Linux mate a elementsd en equipos con poca RAM. Se apoya en el arreglo previo de config de testnet (liquidtestnet, sin peg-in, opciones de red por línea de comandos).',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
