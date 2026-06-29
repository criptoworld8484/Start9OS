import { i18n } from './i18n'
import { sdk } from './sdk'
import { electrumPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multiHost = sdk.MultiHost.of(effects, 'electrum')
  const electrumOrigin = await multiHost.bindPort(electrumPort, {
    protocol: null,
    preferredExternalPort: electrumPort,
    addSsl: null,
    secure: { ssl: false },
  })

  const electrum = sdk.createInterface(effects, {
    id: 'main',
    name: i18n('Electrum (TCP)'),
    description: i18n(
      'The main interface for accessing Frigate via Electrum protocol (no SSL)',
    ),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  return [await electrumOrigin.export([electrum])]
})
