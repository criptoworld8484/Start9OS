import { setupManifest } from '@start9labs/start-sdk'
import { CLOUDFLARED_VERSION } from '../versions'

export const manifest = setupManifest({
  id: 'cloudflared',
  title: 'Cloudflare Tunnel',
  license: 'Apache 2.0',
  packageRepo: 'https://github.com/cloudflare/cloudflared',
  upstreamRepo: 'https://github.com/cloudflare/cloudflared',
  marketingUrl: 'https://www.cloudflare.com/products/tunnel/',
  donationUrl: null,
  description: {
    short: {
      en_US: 'Cloudflare Tunnel client',
      es_ES: 'Cliente de túnel de Cloudflare',
    },
    long: {
      en_US:
        'Cloudflare Tunnel (cloudflared) creates an outbound-only connection from your StartOS server to the Cloudflare edge network, letting you expose services publicly on your own domain without opening any inbound ports. You provide a Tunnel Token and manage routing from the Cloudflare Zero Trust dashboard.',
      es_ES:
        'Cloudflare Tunnel (cloudflared) crea una conexión saliente desde tu servidor StartOS hacia la red de Cloudflare, permitiéndote exponer servicios públicamente en tu propio dominio sin abrir ningún puerto de entrada. Tú proporcionas un Tunnel Token y gestionas el enrutado desde el panel de Cloudflare Zero Trust.',
    },
  },
  volumes: ['main'],
  images: {
    main: {
      source: {
        dockerBuild: {
          dockerfile: 'Dockerfile',
          buildArgs: {
            CLOUDFLARED_IMAGE: 'cloudflare/cloudflared:' + CLOUDFLARED_VERSION,
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
      emulateMissingAs: 'aarch64',
    },
  },
  dependencies: {},
})
