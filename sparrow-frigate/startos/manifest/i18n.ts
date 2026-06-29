export const short = {
  en_US: 'Electrum server for Silent Payments (BIP352)',
  es_ES: 'Servidor Electrum para Silent Payments (BIP352)',
}

export const long = {
  en_US:
    'Frigate indexes and scans Silent Payments on your Bitcoin mainnet node (BIP352). It connects automatically to Bitcoin Core and Electrs on StartOS and exposes a plain TCP Electrum interface for Sparrow and other wallets.',
  es_ES:
    'Frigate indexa y escanea Silent Payments en tu nodo Bitcoin mainnet (BIP352). Se conecta automáticamente a Bitcoin Core y Electrs en StartOS y expone una interfaz Electrum TCP para Sparrow y otras billeteras.',
}

export const alertInstall = {
  en_US:
    'Frigate requires Bitcoin Core (archival, txindex, ZMQ) and Electrs on mainnet. The initial Silent Payments index build can take a long time.',
  es_ES:
    'Frigate requiere Bitcoin Core (archival, txindex, ZMQ) y Electrs en mainnet. La indexación inicial de Silent Payments puede tardar mucho.',
}

export const alertStart = {
  en_US:
    'Frigate will connect to Bitcoin Core and Electrs. Ensure both dependencies are running and synced before expecting wallet connections to work.',
  es_ES:
    'Frigate se conectará a Bitcoin Core y Electrs. Asegúrate de que ambas dependencias estén en ejecución y sincronizadas.',
}

export const bitcoindDescription = {
  en_US: 'Provides blockchain data, RPC, and cookie authentication',
  es_ES: 'Proporciona datos de blockchain, RPC y autenticación por cookie',
}

export const electrsDescription = {
  en_US: 'Provides the Electrum index backend for address lookups',
  es_ES: 'Proporciona el backend de índice Electrum para búsquedas de direcciones',
}
