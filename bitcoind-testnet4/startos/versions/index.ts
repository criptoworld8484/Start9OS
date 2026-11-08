import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_31_0_1 } from './v31_0_1'

// Solo los nodos con migraciones reales van en `other`: el VersionGraph del
// SDK es ciego a la revisión al normalizar rangos y amontonar nodos sin
// migraciones (32.1:0, 32.1:1, …) corrompe `canMigrateFrom`. Las versiones
// sin migración se cubren igualmente mediante los vértices de rango.
export const versionGraph = VersionGraph.of({
  current,
  other: [v_31_0_1],
})
