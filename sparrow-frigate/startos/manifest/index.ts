import { setupManifest } from '@start9labs/start-sdk'
import {
  alertInstall,
  alertStart,
  bitcoindDescription,
  electrsDescription,
  long,
  short,
} from './i18n'

export const manifest = setupManifest({
  id: 'frigate',
  title: 'Frigate',
  license: 'MIT',
  packageRepo: 'https://github.com/criptoworld8484/sparrow-frigate-startos',
  upstreamRepo: 'https://github.com/sparrowwallet/frigate',
  marketingUrl: 'https://github.com/sparrowwallet/frigate',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    frigate: {
      source: {
        dockerBuild: {
          dockerfile: 'Dockerfile',
          workdir: '.',
          buildArgs: {
            FRIGATE_VERSION: '1.5.3',
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: alertInstall,
    update: null,
    uninstall: null,
    restore: null,
    start: alertStart,
    stop: null,
  },
  dependencies: {
    bitcoind: {
      description: bitcoindDescription,
      optional: false,
      metadata: {
        title: 'Bitcoin Core',
        icon: 'https://raw.githubusercontent.com/Start9Labs/bitcoin-core-startos/refs/heads/30.x/dep-icon.svg',
      },
    },
    electrs: {
      description: electrsDescription,
      optional: false,
      metadata: {
        title: 'Electrs',
        icon: 'https://raw.githubusercontent.com/Start9Labs/electrs-startos/refs/heads/master/icon.svg',
      },
    },
  },
})
