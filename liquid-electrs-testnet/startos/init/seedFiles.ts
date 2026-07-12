import { sdk } from '../sdk'

// Liquid Electrs reads config from CLI flags and writes its index to /data/db.
// No config files need to be seeded on first init.
export const seedFiles = sdk.setupOnInit(async (_effects) => {})
