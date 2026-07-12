import { i18n } from './i18n'

export const esploraInterfaceId = 'esplora'
export const electrumInterfaceId = 'electrum'

// Distinct LAN ports so this testnet indexer can coexist with the mainnet one.
export const esploraPort = 3001
export const electrumPort = 50002

export const liquiddHost = 'liquidd-testnet.startos'
export const liquiddRpcPort = 7041
export const liquiddMountpoint = '/mnt/liquidd'
export const liquiddCookieFile = '/mnt/liquidd/liquidtestnet/.cookie'

// electrs rocksdb index lives on this package's own main volume
export const dbDir = '/data/db'

// Memory bounding for the initial index build. Default electrs settings spiked
// to ~3.4 GB and were OOM-killed alongside the ~2.6 GB node on a 6 GB box, in a
// restart loop that never finished indexing. These cap electrs to ~1-1.5 GB:
// --cache-index-filter-blocks keeps index/filter blocks in the bounded, evictable
// block cache instead of growing on the heap; small batches/buffers bound the rest.
export const dbBlockCacheMb = 200
export const dbWriteBufferMb = 64
export const initialSyncBatchSize = 20
export const daemonParallelism = 2

export const logFilters = {
  ERROR: i18n('Error'),
  WARN: i18n('Warning'),
  INFO: i18n('Info'),
  DEBUG: i18n('Debug'),
  TRACE: i18n('Trace'),
}
export type LogFilters = keyof typeof logFilters
