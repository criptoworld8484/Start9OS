import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '31.0:1',
  releaseNotes: {
    en_US:
      'Testnet4 fixes: expose RPC cookie at volume root for dependents (Fulcrum/electrs) and lower the archival disk threshold so prune=0 is allowed.',
    es_ES:
      'Correcciones testnet4: expone la cookie RPC en la raíz del volumen para dependientes (Fulcrum/electrs) y baja el umbral de disco archival para permitir prune=0.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {
      // v31 changed CURRENT_FEES_FILE_VERSION (149900 → 309900) and the
      // fee estimator bucket size; ≤30 hard-fails on a v31-written file.
      await rm('/media/startos/volumes/main/fee_estimates.dat', {
        force: true,
      }).catch(console.error)
    },
  },
})
