import { store } from './fileModels/store.yaml'
import { sdk } from './sdk'

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
    '0.0.0.0:20241',
  ]
  if (protocol !== 'auto') {
    command.push('--protocol', protocol)
  }
  command.push('run')

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: await sdk.SubContainer.of(
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
    ),
    exec: {
      command,
      env: {
        TUNNEL_TOKEN: token,
      },
    },
    ready: {
      display: 'Cloudflare tunnel',
      fn: () =>
        sdk.healthCheck.checkWebUrl(
          effects,
          'http://cloudflared.startos:20241/ready',
          {
            successMessage: 'Cloudflare tunnel is connected',
            errorMessage: 'Cloudflare tunnel is not connected',
          },
        ),
    },
    requires: [],
  })
})
