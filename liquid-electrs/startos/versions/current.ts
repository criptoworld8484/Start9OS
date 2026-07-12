import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.4.1:0',
  releaseNotes: {
    en_US:
      'Initial release of Liquid Electrs — Esplora REST API and Electrum TCP interface for the Liquid Network. Config is provided via CLI flags; no manual configuration required.',
    es_ES:
      'Primera versión de Liquid Electrs — API REST Esplora e interfaz TCP Electrum para la red Liquid. La configuración se proporciona mediante argumentos de línea de comandos; no se requiere configuración manual.',
  },
  migrations: {
    up: async ({ effects: _effects }) => {},
    down: IMPOSSIBLE,
  },
})
