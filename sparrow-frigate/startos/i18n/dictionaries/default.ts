export const DEFAULT_LANG = 'en_US'

const dict = {
  'Starting Frigate!': 0,
  'Electrum (TCP)': 1,
  'The Electrum interface is ready': 2,
  'The Electrum interface is not ready': 3,
  'Sync Progress': 4,
  'Frigate is synced': 5,
  'Frigate is building its Silent Payments index. This can take a long time on first run.':
    6,
  'Frigate is starting…': 7,
  'Sync Complete': 8,
  'Frigate has finished indexing. The Electrum server is ready for Sparrow.': 9,
  'The main interface for accessing Frigate via Electrum protocol (no SSL)': 10,
  'Pruning must be disabled, txindex and ZMQ must be enabled for Frigate to function properly.':
    11,
} as const

export type LangDict = Record<number, string>

export default dict
