import { sdk } from './sdk'

export const rpcInterfaceId = 'rpc'
export const peerInterfaceId = 'peer'

export const rpcPort = 7041
export const peerPortExternal = 7042
export const peerPortInternal = 57042

export const rpcbind = `0.0.0.0:${rpcPort}`
export const rpcallowip = '0.0.0.0/0' // restringido a la red interna de StartOS por el firewall del SO

export const rootDir = '/root/.elements'
export const rpccookiefile = 'liquidv1/.cookie'

// Peer RPC de la mainchain (Bitcoin Core) que valida los peg-ins
export const mainchainRpcHost = 'bitcoind.startos'
export const mainchainRpcPort = 8332

// Límites de recursos — el box comparte RAM entre bitcoind archival (IBD), un
// indexador, Lightning y este nodo, y llegaba a agotarse (OOM/thrashing → cuelgue).
// Estos acotan la huella de elementsd. Liquid mainnet es una cadena pequeña, así que
// un dbcache modesto apenas afecta a la velocidad de sincronización.
export const dbcache = 200 // MiB (por defecto 450)
export const maxmempool = 64 // MB (por defecto 300)
export const maxconnections = 25 // (por defecto 125)
export const par = 2 // hilos de verificación de scripts (menos contención de CPU)

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
    `-chain=liquidv1`,
    `-rpccookiefile=${rootDir}/${rpccookiefile}`,
  ]
}

export function elementsCliArgs(): string[] {
  return ['elements-cli', ...elementsRpcArgs()]
}
