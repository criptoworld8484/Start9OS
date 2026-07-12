export const DEFAULT_LANG = 'en_US'

const dict = {
  'Starting Electrs!': 0,
  'Electrum Server': 1,
  'Electrum server is ready and accepting connections': 2,
  'Electrum server is starting': 3,
  'Electrs is building its address index. This can take several hours on first run.': 25,
  'Fully synced': 26,
  'Sync Progress': 4,
  Main: 5,
  'The main interface for accessing electrs': 6,
  'Electrs requires an archival bitcoin node.': 7,
  Error: 18,
  Warning: 19,
  Info: 20,
  Debug: 21,
  Trace: 22,
  Default: 27,
  'no limit': 28,
  'Sync Complete': 29,
  'Electrs has finished building its address index. The Electrum server is ready.': 30,
  'Esplora REST API': 31,
} as const

export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
