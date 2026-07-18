import { store } from './fileModels/store.yaml'
import { sdk } from './sdk'

// Loopback-only: nothing outside the subcontainer needs to reach the metrics
// listener, and it serves unauthenticated pprof handlers.
const METRICS_ADDR = '127.0.0.1:20241'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info('Starting cloudflared...')

  const conf = await store
    .read((c) => ({
      token: c.tunnelToken ?? null,
      protocol: c.protocol ?? 'auto',
    }))
    .const(effects)
  const token = conf?.token ?? null
  const protocol = conf?.protocol ?? 'auto'

  if (!token) {
    throw new Error(
      'No Cloudflare tunnel token configured. Run the "Set Tunnel Token" action.',
    )
  }

  const command: [string, ...string[]] = [
    '/usr/local/bin/cloudflared',
    'tunnel',
    '--no-autoupdate',
    '--metrics',
    METRICS_ADDR,
  ]
  if (protocol !== 'auto') {
    command.push('--protocol', protocol)
  }
  command.push('run')

  const subcontainer = await sdk.SubContainer.of(
    effects,
    {
      imageId: 'main',
    },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/root/data',
      readonly: false,
    }),
    'main',
  )

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer,
    exec: {
      command,
      env: {
        TUNNEL_TOKEN: token,
      },
    },
    ready: {
      display: 'Cloudflare tunnel',
      // /ready answers 200 only while at least one connection to the Cloudflare
      // edge is registered, and 503 otherwise, so the status code is the signal.
      // The check runs inside the subcontainer because METRICS_ADDR is loopback.
      fn: async () => {
        const res = await subcontainer.exec([
          'curl',
          '-s',
          '-o',
          '/dev/null',
          '-w',
          '%{http_code}',
          '-m',
          '3',
          `http://${METRICS_ADDR}/ready`,
        ])

        if (res.exitCode !== 0) {
          return {
            result: 'starting',
            message: 'Waiting for cloudflared to start',
          }
        }

        const status = res.stdout.toString().trim()
        if (status === '200') {
          return {
            result: 'success',
            message: 'Cloudflare tunnel is connected',
          }
        }

        return {
          result: 'failure',
          message: `Cloudflare tunnel is not connected to the Cloudflare edge (readiness endpoint returned HTTP ${status})`,
        }
      },
    },
    requires: [],
  })
})
