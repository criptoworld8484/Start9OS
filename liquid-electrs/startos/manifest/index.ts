import { setupManifest } from '@start9labs/start-sdk'
import { liquiddDescription, long, short } from './i18n'

export const manifest = setupManifest({
  id: 'liquid-electrs',
  title: 'Liquid Electrs',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9-Community/electrs-startos',
  upstreamRepo: 'https://github.com/Blockstream/electrs',
  marketingUrl: 'https://github.com/Blockstream/electrs',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    electrs: {
      source: {
        dockerBuild: {
          dockerfile: 'Dockerfile',
          workdir: '.',
        },
      },
      arch: ['x86_64'],
    },
  },
  dependencies: {
    liquidd: {
      description: liquiddDescription,
      optional: false,
      metadata: {
        title: 'Liquid (Elements)',
        icon: 'dep-icon.svg',
      },
    },
  },
})
