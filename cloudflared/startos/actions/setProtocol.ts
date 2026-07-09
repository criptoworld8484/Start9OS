import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'

const { InputSpec, Value } = sdk

export const setProtocol = sdk.Action.withInput(
  'set-protocol',

  // metadata
  async ({ effects }) => {
    const current = await store
      .read((conf) => conf.protocol ?? 'auto')
      .const(effects)
    return {
      name: `Connection Protocol: ${current}`,
      description:
        'Transport cloudflared uses to reach the Cloudflare edge. If your network blocks or degrades UDP/QUIC (port 7844) — symptom: repeated "QUIC handshake did not complete" errors — set this to HTTP/2.',
      warning: 'Restart the service after saving for the change to take effect.',
      allowedStatuses: 'any',
      group: 'Configuration',
      visibility: 'enabled',
    }
  },

  // input spec
  InputSpec.of({
    protocol: Value.select({
      name: 'Protocol',
      description:
        'Auto tries QUIC first and is the cloudflared default. Choose HTTP/2 if UDP port 7844 is filtered on your network.',
      default: 'auto',
      values: {
        auto: 'Auto (QUIC, fall back to HTTP/2)',
        http2: 'HTTP/2 (use if QUIC is blocked)',
        quic: 'QUIC (force)',
      },
    }),
  }),

  // prefill with current selection
  async ({ effects }) => {
    const current =
      (await store.read((conf) => conf.protocol ?? 'auto').const(effects)) ??
      'auto'
    return { protocol: current }
  },

  // execute
  async ({ effects, input }) => {
    await store.merge(effects, { protocol: input.protocol })
    console.info(`Cloudflare tunnel protocol set to: ${input.protocol}`)
  },
)
