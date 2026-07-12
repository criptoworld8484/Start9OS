import { setupManifest } from '@start9labs/start-sdk'
import {
  alertRestore,
  alertUninstall,
  long,
  short,
} from './i18n'

export const manifest = setupManifest({
  id: 'liquidd',
  title: 'Liquid (Elements)',
  license: 'MIT',
  donationUrl: null,
  packageRepo:
    'https://github.com/Start9-Community/liquidd-startos',
  upstreamRepo: 'https://github.com/ElementsProject/elements',
  marketingUrl: 'https://liquid.net/',
  description: { short, long },
  volumes: ['main'],
  images: {
    liquidd: {
      source: {
        dockerBuild: {
          buildArgs: {
            VERSION: '23.3.3',
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    uninstall: alertUninstall,
    restore: alertRestore,
  },
  dependencies: {
    bitcoind: {
      description: 'Liquid valida los peg-ins contra un nodo Bitcoin Core completo.',
      optional: false,
      metadata: {
        title: 'Bitcoin Core',
        icon: 'https://raw.githubusercontent.com/Start9Labs/bitcoind-startos/31.x/icon.svg',
      },
    },
  },
})
