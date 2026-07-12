import { setupManifest } from '@start9labs/start-sdk'
import {
  alertRestore,
  alertUninstall,
  long,
  short,
} from './i18n'

export const manifest = setupManifest({
  id: 'liquidd-testnet',
  title: 'Liquid Testnet',
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
  dependencies: {},
})
