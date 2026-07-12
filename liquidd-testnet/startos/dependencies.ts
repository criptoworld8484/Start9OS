import { sdk } from './sdk'

// Testnet build: Liquid testnet syncs from its own peers and runs with
// validatepegin=0, so there is no Bitcoin Core dependency.
export const setDependencies = sdk.setupDependencies(async () => {
  return {}
})
