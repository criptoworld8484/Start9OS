import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  electrumInterfaceId,
  electrumPort,
  esploraInterfaceId,
  esploraPort,
} from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  /**
   * Esplora REST API — HTTP, LAN only.
   * protocol: 'http' uses BindOptionsByKnownProtocol; addSsl and secure are
   * not part of that variant's shape and must be omitted.
   */
  const esploraMultihost = sdk.MultiHost.of(effects, esploraInterfaceId)
  const esploraOrigin = await esploraMultihost.bindPort(esploraPort, {
    protocol: 'http',
    preferredExternalPort: esploraPort,
  })
  const esploraIface = sdk.createInterface(effects, {
    name: 'Esplora REST API',
    id: esploraInterfaceId,
    description: 'Liquid Esplora block-explorer REST API',
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const esploraReceipt = await esploraOrigin.export([esploraIface])

  /**
   * Electrum TCP interface — plain TCP, LAN only.
   * protocol: null uses BindOptions which requires preferredExternalPort,
   * addSsl (null = no SSL wrapper), and secure (null = not SSL-secured).
   */
  const electrumMultihost = sdk.MultiHost.of(effects, electrumInterfaceId)
  const electrumOrigin = await electrumMultihost.bindPort(electrumPort, {
    protocol: null,
    preferredExternalPort: electrumPort,
    addSsl: null,
    secure: null,
  })
  const electrumIface = sdk.createInterface(effects, {
    name: i18n('Electrum Server'),
    id: electrumInterfaceId,
    description: 'Electrum TCP interface for the Liquid Network',
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const electrumReceipt = await electrumOrigin.export([electrumIface])

  return [esploraReceipt, electrumReceipt]
})
