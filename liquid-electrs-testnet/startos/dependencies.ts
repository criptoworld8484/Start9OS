import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  return {
    'liquidd-testnet': {
      kind: 'running',
      versionRange: '>=23.3.3:0',
      // Require only 'sync-progress': it calls getblockchaininfo over RPC and only
      // succeeds when the node's RPC is reachable AND the chain is fully synced —
      // exactly what the indexer needs. (The node's 'elementsd' daemon-ready check
      // is not surfaced to dependents the same way, so requiring it blocked the dep.)
      healthChecks: ['sync-progress'],
    },
  }
})
