import { LangDict } from './default'

export default {
  es_ES: {
    0: 'Iniciando Frigate…',
    1: 'Electrum (TCP)',
    2: 'La interfaz Electrum está lista',
    3: 'La interfaz Electrum no está lista',
    4: 'Progreso de sincronización',
    5: 'Frigate está sincronizado',
    6: 'Frigate está construyendo su índice de Silent Payments. La primera ejecución puede tardar mucho.',
    7: 'Frigate está iniciando…',
    8: 'Sincronización completa',
    9: 'Frigate ha terminado de indexar. El servidor Electrum está listo para Sparrow.',
    10: 'Interfaz principal para acceder a Frigate vía protocolo Electrum (sin SSL)',
    11: 'El pruning debe estar desactivado, txindex y ZMQ deben estar habilitados para que Frigate funcione correctamente.',
  },
} satisfies Record<string, LangDict>
