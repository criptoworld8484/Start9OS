import { i18n } from './i18n'

export const esploraInterfaceId = 'esplora'
export const electrumInterfaceId = 'electrum'

export const esploraPort = 3000
export const electrumPort = 50001

export const liquiddHost = 'liquidd.startos'
export const liquiddRpcPort = 7041
export const liquiddMountpoint = '/mnt/liquidd'
export const liquiddCookieFile = '/mnt/liquidd/liquidv1/.cookie'

// electrs rocksdb index lives on this package's own main volume
export const dbDir = '/data/db'

export const logFilters = {
  ERROR: i18n('Error'),
  WARN: i18n('Warning'),
  INFO: i18n('Info'),
  DEBUG: i18n('Debug'),
  TRACE: i18n('Trace'),
}
export type LogFilters = keyof typeof logFilters
