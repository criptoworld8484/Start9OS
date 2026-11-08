import {
  archivalMin,
  bitcoinConfFile,
  diskUsage,
  fullConfigSpec,
  minPrune,
} from '../../fileModels/bitcoin.conf'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'

export const autoconfig = sdk.Action.withInput(
  // id
  'autoconfig',

  // metadata
  async ({ effects }) => ({
    name: i18n('Auto-Configure'),
    description: i18n(
      'Automatically configure bitcoin.conf for the needs of a another service',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'hidden',
  }),

  // input spec
  async ({ effects, prefill }) => {
    if (!prefill) return fullConfigSpec

    // Un task puede forzar valores que violan las restricciones dinámicas del
    // propio spec (p. ej. un dependiente pidiendo prune=0 en un disco pequeño,
    // donde el mínimo es minPrune). Mostrar ese campo deshabilitado dejaría el
    // formulario sin confirmar posible, así que lo excluimos del prefill: no se
    // renderiza, el validador lo elimina del input y el prune configurado se
    // conserva.
    const pre = { ...(prefill as Record<string, unknown>) }
    const disk = await diskUsage()
    const smallDisk = disk.total < archivalMin
    const maxPrune = Math.floor((disk.total * 0.75) / (1024 * 1024))
    const minAllowed = smallDisk ? minPrune : 0
    if (
      typeof pre.prune === 'number' &&
      (pre.prune < minAllowed || pre.prune > maxPrune)
    ) {
      delete pre.prune
    }

    return fullConfigSpec
      .filterFromPartial(pre as typeof fullConfigSpec._PARTIAL)
      .disableFromPartial(
        pre as typeof fullConfigSpec._PARTIAL,
        i18n('These fields were provided by a task and cannot be edited'),
      )
  },

  // optionally pre-fill form
  async ({ effects }) => bitcoinConfFile.read().once(),

  // execution function
  ({ effects, input }) => bitcoinConfFile.merge(effects, input),
)
