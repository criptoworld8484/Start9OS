import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '32.1:7',
  releaseNotes: {
    en_US:
      'Fixes service readiness and config drift: the RPC health check now follows the port bitcoin.conf actually binds (a mismatched rpcbind no longer leaves the service stuck at "not ready"), bitcoin.conf is re-normalized on every start so pruning, txindex and the RPC binding cannot disagree, and prune values are written numerically. Also includes the full-archival default from 32.1:6 (pruning disabled, txindex enabled; automatic pruning only for disks below 25 GB).',
    es_ES:
      'Corrige la disponibilidad del servicio y la deriva de configuración: la health check de RPC ahora sigue el puerto que bitcoin.conf realmente usa (un rpcbind desalineado ya no deja el servicio en "not ready"), bitcoin.conf se re-normaliza en cada arranque para que poda, txindex y el bind de RPC no puedan discrepar, y los valores de prune se escriben numéricos. Incluye también el default archival completo de 32.1:6 (poda deshabilitada, txindex habilitado; poda automática solo en discos de menos de 25 GB).',
  },
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
