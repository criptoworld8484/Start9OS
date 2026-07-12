import { sdk } from '../sdk'

// Liquid Electrs is configured entirely via CLI flags — no user-facing
// config action is needed for v1.
export const actions = sdk.Actions.of()
