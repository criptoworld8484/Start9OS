import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { dbcache, maxconnections, maxmempool, par } from '../utils'

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
  // Network — enforced to Liquid testnet
  chain: z.literal('liquidtestnet').catch('liquidtestnet'),

  // Peg-in validation — disabled on this testnet build (no Bitcoin node dependency).
  // Liquid testnet syncs from its own peers; peg-ins are not exercised here.
  validatepegin: z.literal(false).catch(false),

  // RPC server — enforced (global option, safe outside a network section)
  server: z.literal(true).catch(true),

  // P2P listen — enforced (global option, safe outside a network section)
  listen: z.literal(true).catch(true),

  // Memory limits (global options) — avoid the OOM killer on small boxes.
  dbcache: z.literal(dbcache).catch(dbcache),
  maxmempool: z.literal(maxmempool).catch(maxmempool),
  maxconnections: z.literal(maxconnections).catch(maxconnections),
  par: z.literal(par).catch(par),

  // NOTE: network-specific options (port, rpcport, rpcbind, rpcallowip) are NOT
  // written here. On a non-default network (liquidtestnet) Elements Core rejects
  // them in the global section ("only applied ... when in [liquidtestnet] section")
  // and aborts. They are passed as command-line args to elementsd instead (see main.ts).

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
