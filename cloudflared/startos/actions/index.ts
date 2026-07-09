import { sdk } from '../sdk'
import { setToken } from './setToken'
import { setProtocol } from './setProtocol'

export const actions = sdk.Actions.of()
  .addAction(setToken)
  .addAction(setProtocol)
