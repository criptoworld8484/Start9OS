import { VersionGraph } from '@start9labs/start-sdk'
import { current, CLOUDFLARED_VERSION } from './current'

export const versionGraph = VersionGraph.of({
  current,
  other: [],
})

export { CLOUDFLARED_VERSION }
