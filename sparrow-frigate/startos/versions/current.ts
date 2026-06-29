import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.6.0:2',
  releaseNotes: {
    en_US: 'Use official Frigate icon (PNG) for StartOS UI.',
    es_ES: 'Usa el icono oficial de Frigate (PNG) en la UI de StartOS.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
