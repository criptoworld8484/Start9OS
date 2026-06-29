# Bitcoin Core Testnet4 para StartOS 0.4 — Diseño

Fecha: 2026-06-25
Estado: aprobado (pendiente de plan de implementación)

## Objetivo

Disponer de un nodo **Bitcoin Core en testnet4** instalable como paquete
`.s9pk` en un servidor **StartOS 0.4**, para uso personal / desarrollo. Será el
único bitcoind del servidor. Arquitectura objetivo: **x86_64 (amd64)**.

## Contexto y motivación

- El proyecto de referencia `k0gen/bitcoind-testnet4-startos` apunta a
  **StartOS 0.3.x** (`manifest.yaml` + embassy-sdk). Sus s9pk **no son
  compatibles** con 0.4.
- StartOS **0.4** introduce un sistema de empaquetado nuevo: SDK de TypeScript
  (`@start9labs/start-sdk`), directorio `startos/`, build con la toolchain de
  start-cli, y un formato s9pk nuevo (firma, descargas parciales, multi-arch).
- El paquete **oficial** `Start9Labs/bitcoin-core-startos` (rama `31.x`) ya
  apunta a 0.4 y está mantenido (Bitcoin Core 31.x), pero **solo soporta
  mainnet**: no hay ninguna referencia a testnet/testnet4/signet/regtest en su
  código.

Decisión: **partir del paquete oficial `31.x`** y aplicar el conjunto mínimo de
cambios para arrancar siempre en testnet4. No se porta el paquete de k0gen
(0.3), porque sería reconstruir todo sobre una base obsoleta.

## Decisiones de diseño

1. **Base**: clon de `Start9Labs/bitcoin-core-startos`, rama `31.x`.
2. **Red**: **testnet4 fijo (hardcoded)**. No se expone selector de red.
3. **Identidad del paquete**: id `bitcoind-testnet4`, título
   "Bitcoin Core (Testnet4)". Evita que el paquete oficial mainnet lo
   sobrescriba en updates y deja claro en la UI que es testnet4. Se mantiene la
   versión upstream de Bitcoin Core (31.x).
4. **Convivencia**: será el único bitcoind; no se exige aislamiento estricto de
   puertos frente a un mainnet, pero el id propio ya evita colisiones de
   instalación.

## Hechos técnicos de testnet4 que condicionan el diseño

- Bitcoin Core ≥ 28 soporta testnet4 nativamente vía `testnet4=1` en
  `bitcoin.conf` (opciones específicas de red en sección `[testnet4]`).
- En testnet4, bitcoind usa el **subdirectorio de datos `datadir/testnet4/`**.
- La **cookie RPC** pasa a `datadir/testnet4/.cookie`.
- Puertos por defecto en testnet4: **RPC 48332**, **P2P 48333** (distintos de
  mainnet 8332/8333). El paquete oficial asume puertos mainnet en interfaces,
  ZMQ y health checks.

## Cambios técnicos (alcance mínimo)

1. **`startos/fileModels/bitcoin.conf.ts`**
   - Añadir `testnet4=1` siempre.
   - En sección `[testnet4]`, **fijar `rpcport` y `port`** a las mismas
     constantes que el paquete ya usa (`rpcPort`, `peerPort` en
     `startos/utils.ts`), de modo que interfaces, ZMQ y health-checks de puertos
     sigan funcionando sin tocarlos.

2. **Ruta de la cookie RPC**
   - bitcoind en testnet4 escribe la cookie en `datadir/testnet4/.cookie`.
   - Ajustar la construcción de la ruta de cookie en `startos/main.ts` (borrado
     inicial de la cookie y health check de RPC que comprueba su existencia) y
     en cualquier otro punto que la referencie (p. ej. proxy de pruning), para
     incluir el subdirectorio `testnet4/`.

3. **Health check de sincronización (`startos/main.ts`)**
   - La llamada a `bitcoin-cli ... getblockchaininfo` debe operar sobre
     testnet4 (flag `-testnet4` y/o cookie correcta) para conectar al datadir y
     puerto adecuados.

4. **Identidad y limpieza**
   - `startos/manifest/index.ts`: id `bitcoind-testnet4`, título y descripción
     orientados a testnet4.
   - Simplificar/desactivar lo que no aporta en un nodo testnet4 personal si
     estorba (p. ej. I2P, proxy de pruning), manteniendo el paquete simple.
     Decisión fina a resolver en el plan, sin romper el build.

## Build y entrega

- **Prerrequisitos** en el PC x86_64: Docker y la toolchain de
  start-cli/start-sdk. Se verifica/instala al inicio de la implementación.
- **Compilación**: solo amd64 → artefacto `bitcoind-testnet4.s9pk`.
- **Instalación**: vía **Sideload** en StartOS 0.4 (Sistema → Sideload). Arranca
  directamente en testnet4.

## Criterios de éxito

1. El s9pk compila para amd64 sin errores con la toolchain 0.4.
2. Tras Sideload e instalación, el servicio arranca y queda "running".
3. El health check de RPC pasa (cookie en `testnet4/.cookie` accesible).
4. `getblockchaininfo` reporta `chain: "testnet4"` y comienza a sincronizar.
5. El paquete aparece con id `bitcoind-testnet4` y no colisiona con el oficial.

## Fuera de alcance (YAGNI)

- Selector de red configurable (mainnet/signet/regtest).
- Multi-arquitectura (arm64/riscv64).
- i18n/traducciones más allá de lo que herede del paquete base.
- Dependientes (electrs, mempool, LND) conectándose automáticamente.

## Riesgos / puntos a validar en implementación

- Sincronización exacta entre los puertos fijados en `[testnet4]` y las
  constantes de `utils.ts`.
- Que todos los puntos que construyen la ruta de cookie incluyan `testnet4/`.
- Compatibilidad de flags de `bitcoin-cli` (`-testnet4` vs `-chain=testnet4`)
  con la versión 31.x del binario empaquetado.
