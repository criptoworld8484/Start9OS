import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.4.1:4',
  releaseNotes: {
    en_US:
      'Also bound memory of the initial block-header download: fetch headers in 10k chunks instead of 100k. The 100k batch was processed as one JSON-RPC call and spiked electrs (and the node serving it) to ~3.3 GB, OOM-killing the indexer before block indexing even began. Complements the index-build memory caps from 0.4.1:3.',
    es_ES:
      'Acota también la memoria de la descarga inicial de cabeceras de bloque: se piden en lotes de 10k en vez de 100k. El lote de 100k se procesaba como una sola llamada JSON-RPC y disparaba electrs (y el nodo al servirlo) a ~3.3 GB, provocando OOM antes incluso de empezar a indexar bloques. Complementa los límites de memoria del indexado de 0.4.1:3.',
  },
  migrations: {
    up: async ({ effects: _effects }) => {},
    down: IMPOSSIBLE,
  },
})
