import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import {
  dbcache,
  mainchainRpcHost,
  mainchainRpcPort,
  maxconnections,
  maxmempool,
  par,
  peerPortInternal,
  rpcPort,
  rpcallowip,
  rpcbind,
} from '../utils'

// INI coercion helpers: INI parsing returns strings, with duplicate keys producing arrays.
// Each uses .catch(undefined) to match the old optional(t) = t.optional().onMismatch(undefined)

const iniBoolean = z
  .union([
    z.string().transform((s) => !!Number(s)),
    z.number().transform((n) => !!n),
    z.boolean(),
  ])
  .optional()
  .catch(undefined)

export const shape = z.object({
  // Network — enforced to Liquid mainnet
  chain: z.literal('liquidv1').catch('liquidv1'),

  // Peg-in validation — enforced (requires Bitcoin Core dependency)
  validatepegin: z.literal(true).catch(true),

  // RPC server — enforced
  server: z.literal(true).catch(true),
  rpcport: z.literal(rpcPort).catch(rpcPort),
  rpcbind: z.literal(rpcbind).catch(rpcbind),
  rpcallowip: z.literal(rpcallowip).catch(rpcallowip),

  // P2P — enforced
  listen: z.literal(true).catch(true),
  port: z.literal(peerPortInternal).catch(peerPortInternal),

  // Resource limits (global options) — bound RAM/CPU on a shared, memory-tight box.
  dbcache: z.literal(dbcache).catch(dbcache),
  maxmempool: z.literal(maxmempool).catch(maxmempool),
  maxconnections: z.literal(maxconnections).catch(maxconnections),
  par: z.literal(par).catch(par),

  // Mainchain RPC (Bitcoin Core) — cookie auth, no user/password.
  // NOTE: Elements names this option `mainchainrpchost` (NOT the Bitcoin Core
  // `mainchainrpcconnect`, which elementsd silently ignores).
  mainchainrpchost: z.literal(mainchainRpcHost).catch(mainchainRpcHost),
  mainchainrpcport: z.literal(mainchainRpcPort).catch(mainchainRpcPort),
  mainchainrpccookiefile: z
    .literal('/mnt/bitcoind/.cookie')
    .catch('/mnt/bitcoind/.cookie'),

  // User-configurable
  txindex: iniBoolean,
})

function stringifyPrimitives(a: unknown): any {
  if (a && typeof a === 'object') {
    if (Array.isArray(a)) {
      return a.map(stringifyPrimitives)
    }
    return Object.fromEntries(
      Object.entries(a).map(([k, v]) => [k, stringifyPrimitives(v)]),
    )
  } else if (typeof a === 'boolean') {
    return a ? 1 : 0
  }
  return a
}

export const elementsConfFile = FileHelper.ini(
  {
    base: sdk.volumes.main,
    subpath: '/elements.conf',
  },
  shape,
  { bracketedArray: false },
  {
    onRead: (a) => shape.parse(a),
    onWrite: (a) => stringifyPrimitives(a),
  },
)
