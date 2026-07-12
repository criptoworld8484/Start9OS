import { autoconfig } from 'bitcoin-core-startos/startos/actions/config/autoconfig'
import { i18n } from './i18n'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  await sdk.action.createTask(effects, 'bitcoind', autoconfig, 'critical', {
    input: {
      kind: 'partial',
      value: {
        prune: 0,
      },
    },
    when: { condition: 'input-not-matches', once: false },
    reason: i18n('Liquid requires an archival Bitcoin node for peg-in validation.'),
  })

  return {
    bitcoind: {
      healthChecks: ['bitcoind', 'sync-progress'],
      kind: 'running',
      versionRange: '>=28.3:8',
    },
  }
})
