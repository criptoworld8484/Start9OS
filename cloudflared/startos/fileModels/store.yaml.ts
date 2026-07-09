import { z, FileHelper, T } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  tunnelToken: z.string().nullable().catch(null),
  protocol: z.enum(['auto', 'http2', 'quic']).catch('auto'),
})

export type StoreType = z.infer<typeof shape>

export const store = FileHelper.yaml(
  {
    base: sdk.volumes.main,
    subpath: '/start9/config.yaml',
  },
  shape,
)

export const createDefaultStore = async (effects: T.Effects) => {
  const conf = await store.read().once()
  if (!conf) {
    await store.write(effects, {
      tunnelToken: null,
      protocol: 'auto',
    })
  }
}
