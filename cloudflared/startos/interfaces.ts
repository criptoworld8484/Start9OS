import { sdk } from './sdk'

/**
 * cloudflared exposes no interface of its own. The tunnel is outbound-only, and
 * its metrics/readiness listener stays on loopback inside the subcontainer: it
 * serves unauthenticated pprof handlers (heap, goroutine and CPU profiles) that
 * must not be reachable from the LAN or over Tor.
 */
export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => [])
