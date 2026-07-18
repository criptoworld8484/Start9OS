import { VersionInfo } from '@start9labs/start-sdk'

export const v2026_6_1 = VersionInfo.of({
  version: '2026.6.1:1',
  releaseNotes: {
    en_US:
      'Add "Connection Protocol" action (auto/http2/quic) to work around networks that block or degrade QUIC/UDP 7844.',
    es_ES:
      'Nueva acción "Protocolo de conexión" (auto/http2/quic) para redes que bloquean o degradan QUIC/UDP 7844.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
