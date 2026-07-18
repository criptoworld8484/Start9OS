import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.7.1:0',
  releaseNotes: {
    en_US:
      'Update cloudflared to 2026.7.1. Fix the health check, which reported the tunnel as connected whenever cloudflared was running, even while it was disconnected from the Cloudflare edge. Stop exposing cloudflared\'s metrics endpoint, which served unauthenticated Go pprof handlers on the LAN and over Tor; it is now bound to loopback inside the container.',
    es_ES:
      'Actualiza cloudflared a 2026.7.1. Corrige el chequeo de salud, que daba el túnel por conectado siempre que cloudflared estuviera en marcha, incluso estando desconectado del edge de Cloudflare. Deja de exponer el endpoint de métricas de cloudflared, que servía handlers pprof de Go sin autenticar en la LAN y por Tor; ahora escucha sólo en loopback dentro del contenedor.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

export const CLOUDFLARED_VERSION = '2026.7.1'
