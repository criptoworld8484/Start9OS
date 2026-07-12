import { sdk } from './sdk'

export const rpcInterfaceId = 'rpc'
export const peerInterfaceId = 'peer'

export const rpcPort = 7041
export const peerPortExternal = 7042
export const peerPortInternal = 57042

export const rpcbind = `0.0.0.0:${rpcPort}`
export const rpcallowip = '0.0.0.0/0' // restringido a la red interna de StartOS por el firewall del SO

export const rootDir = '/root/.elements'
export const rpccookiefile = 'liquidtestnet/.cookie'

// Memory limits — elementsd defaults (dbcache 450 MiB, mempool 300 MB, CT caches)
// were OOM-killed on the target. Keep the footprint small; Liquid testnet is tiny.
export const dbcache = 100 // MiB
export const maxmempool = 50 // MB
export const maxconnections = 20
export const par = 1 // script-verification threads

export const elementsMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  subpath: null,
  mountpoint: rootDir,
  readonly: false,
})

export type GetBlockchainInfo = {
  chain: string
  blocks: number
  headers: number
  bestblockhash: string
  verificationprogress: number
  initialblockdownload: boolean
  size_on_disk: number
  pruned: boolean
  warnings: string | string[]
}

/** Args de conexión compartidos por elements-cli. */
export function elementsRpcArgs(): string[] {
  return [
    `-datadir=${rootDir}`,
    `-chain=liquidtestnet`,
    `-rpccookiefile=${rootDir}/${rpccookiefile}`,
  ]
}

export function elementsCliArgs(): string[] {
  return ['elements-cli', ...elementsRpcArgs()]
}
