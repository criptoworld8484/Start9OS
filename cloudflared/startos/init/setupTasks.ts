import { sdk } from '../sdk'
import { store } from '../fileModels/store.yaml'
import { setToken } from '../actions/setToken'

/**
 * Reactively manage required tasks.
 * If no tunnel token is configured, prompt the user to set one.
 */
export const setupTasks = sdk.setupOnInit(async (effects) => {
  const hasToken = await store
    .read((conf) => !!conf.tunnelToken)
    .const(effects)

  if (!hasToken) {
    await sdk.action.createOwnTask(effects, setToken, 'critical', {
      reason: 'Set your Cloudflare Tunnel Token to start the tunnel',
    })
  }
})
