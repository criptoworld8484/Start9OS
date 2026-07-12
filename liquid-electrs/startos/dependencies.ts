import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  return {
    liquidd: {
      kind: 'running',
      versionRange: '>=23.3.3:0',
      healthChecks: ['elementsd', 'sync-progress'],
    },
  }
})
