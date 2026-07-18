import { VersionGraph } from '@start9labs/start-sdk'
import { current, CLOUDFLARED_VERSION } from './current'
import { v2026_6_1 } from './v2026_6_1'

export const versionGraph = VersionGraph.of({
  current,
  other: [v2026_6_1],
})

export { CLOUDFLARED_VERSION }
