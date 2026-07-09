import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'

const { InputSpec, Value } = sdk

export const setToken = sdk.Action.withInput(
  'set-token',

  // metadata
  async ({ effects }) => {
    const hasToken = await store
      .read((conf) => !!conf.tunnelToken)
      .const(effects)
    return {
      name: hasToken ? 'Tunnel Token: Configured' : 'Set Tunnel Token',
      description:
        'Paste the Tunnel Token from your Cloudflare Zero Trust dashboard (Networks → Tunnels → your tunnel → Install connector). The tunnel starts automatically once a token is saved.',
      warning: null,
      allowedStatuses: 'any',
      group: 'Configuration',
      visibility: 'enabled',
    }
  },

  // input spec
  InputSpec.of({
    token: Value.text({
      name: 'Tunnel Token',
      description:
        'The connector token for your Cloudflare tunnel. It usually starts with "eyJ".',
      required: true,
      default: null,
      masked: true,
      placeholder: 'eyJhIjoi...',
      inputmode: 'text',
    }),
  }),

  // prefill: do not echo the stored secret back into the form
  async ({ effects }) => ({}),

  // execute
  async ({ effects, input }) => {
    const token = input.token?.trim()
    if (!token) throw new Error('Tunnel Token is required.')
    await store.merge(effects, { tunnelToken: token })
    console.info('Cloudflare tunnel token saved.')
  },
)
