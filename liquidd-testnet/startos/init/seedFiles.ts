import { elementsConfFile } from '../fileModels/elements.conf'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (!kind) return

  // install, update, restore: seed store + create/refresh elements.conf.
  // The enforced z.literal defaults in the FileModel fill in all required
  // fields; main.ts re-merges the enforced settings on every boot.
  await storeJson.merge(effects, {})
  await elementsConfFile.merge(effects, {})
})
