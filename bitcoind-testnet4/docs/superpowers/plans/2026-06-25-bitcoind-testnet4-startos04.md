# Bitcoin Core Testnet4 para StartOS 0.4 — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Producir un `.s9pk` instalable en StartOS 0.4 que arranca Bitcoin Core 31.x siempre en testnet4, partiendo del paquete oficial `Start9Labs/bitcoin-core-startos` rama `31.x`.

**Architecture:** Se clona el paquete oficial 0.4 (SDK TypeScript) como base. La red testnet4 y los *binds* de red (RPC/P2P/ZMQ) se inyectan por **línea de comandos en `startos/main.ts`** —que siempre se aplican a la red activa, sin tocar el frágil `fileModel` de `bitcoin.conf`—, y se corrige la ruta de la cookie RPC al subdirectorio `testnet4/`. Se cambia la identidad del paquete a `bitcoind-testnet4` y se compila solo para amd64.

**Tech Stack:** TypeScript, `@start9labs/start-sdk` 1.5.3, `start-cli`, Docker, Node ≥ 22, Make.

## Global Constraints

- StartOS objetivo: **0.4** (formato s9pk nuevo). Verbatim del spec.
- Arquitectura: **x86_64 (amd64) únicamente**.
- Red: **testnet4 fija (hardcoded)**. Sin selector de red.
- Identidad del paquete: id **`bitcoind-testnet4`**, título **`Bitcoin Core (Testnet4)`**.
- Versión de Bitcoin Core: **31.x** (la del paquete base, sin cambios).
- Puertos pin (heredados del paquete, aplicados sobre testnet4): RPC `8332` (pruned `58332`), P2P externo `8333`, P2P interno `58333`, ZMQ `28332`/`28333`.
- Datadir contenedor: `/root/.bitcoin`; subdir de red testnet4: `/root/.bitcoin/testnet4`; cookie RPC en `/root/.bitcoin/testnet4/.cookie`.
- No tocar `startos/fileModels/bitcoin.conf.ts` (decisión de menor riesgo).
- Verificación automática rápida tras cada edición de código: `npm run check` (`tsc --noEmit`).

---

### Task 0: Prerrequisitos de toolchain

**Files:** ninguno (entorno).

- [ ] **Step 1: Verificar herramientas presentes**

Run:
```bash
for t in docker node npm make jq yq start-cli; do printf '%-10s ' "$t"; command -v "$t" || echo "FALTA"; done
node --version; docker --version
```
Expected: todas con ruta; `node` ≥ v22. Si falta `start-cli`, instalar la CLI de StartOS 0.4 (binario oficial de Start9 / `cargo install`), `docker` (con permisos para el usuario), y `yq`/`jq` vía gestor de paquetes. No continuar hasta que `start-cli`, `docker` y `node` respondan.

- [ ] **Step 2: Verificar que Docker funciona sin sudo**

Run: `docker info >/dev/null 2>&1 && echo OK || echo "Docker no accesible"`
Expected: `OK`. Si no, añadir el usuario al grupo `docker` y reabrir sesión.

---

### Task 1: Scaffold — clonar el paquete oficial 31.x preservando los docs

**Files:**
- Create: `/home/criptoworld/Documents/OpenCode/bitcointestStart9/**` (árbol del paquete)
- Preserve: `bitcointestStart9/docs/superpowers/specs/2026-06-25-bitcoind-testnet4-startos04-design.md` y este plan.

**Interfaces:**
- Produces: árbol del paquete con `startos/`, `Makefile`, `s9pk.mk`, `package.json`, `Dockerfile`, etc., y un repo git local inicializado.

- [ ] **Step 1: Clonar a un temporal**

Run:
```bash
SRC=/tmp/claude-1000/-home-criptoworld-Documents-OpenCode/1357eede-0898-4806-8b06-dd43d9b35372/scratchpad/bcsrc
rm -rf "$SRC"
git clone --branch 31.x --depth 1 https://github.com/Start9Labs/bitcoin-core-startos.git "$SRC"
```
Expected: clon correcto, `"$SRC/startos/main.ts"` existe.

- [ ] **Step 2: Copiar el contenido al directorio del proyecto (sin pisar docs)**

Run:
```bash
rsync -a --exclude='.git' "$SRC"/ /home/criptoworld/Documents/OpenCode/bitcointestStart9/
ls /home/criptoworld/Documents/OpenCode/bitcointestStart9/startos/main.ts \
   /home/criptoworld/Documents/OpenCode/bitcointestStart9/docs/superpowers/specs/2026-06-25-bitcoind-testnet4-startos04-design.md
```
Expected: ambas rutas existen (el paquete y nuestros docs conviven).

- [ ] **Step 3: Inicializar git e instalar dependencias**

Run:
```bash
cd /home/criptoworld/Documents/OpenCode/bitcointestStart9
git init -q && git add -A
npm install
```
Expected: `npm install` termina sin errores; `node_modules/@start9labs/start-sdk` existe.

- [ ] **Step 4: Baseline typecheck (paquete sin modificar compila)**

Run: `cd /home/criptoworld/Documents/OpenCode/bitcointestStart9 && npm run check`
Expected: `tsc --noEmit` termina con código 0, sin errores. Esto confirma la base antes de tocar nada.

- [ ] **Step 5: Commit baseline**

```bash
cd /home/criptoworld/Documents/OpenCode/bitcointestStart9
printf 'node_modules/\njavascript/\n*.s9pk\n' > .gitignore
git add -A
git commit -q -m "chore: import Start9 bitcoin-core-startos 31.x baseline"
```

---

### Task 2: Identidad del paquete (manifest + versión + arch amd64)

**Files:**
- Modify: `startos/manifest/index.ts`
- Modify: `startos/versions/current.ts`

**Interfaces:**
- Produces: paquete con `id: 'bitcoind-testnet4'`, título `Bitcoin Core (Testnet4)`, imágenes solo `x86_64`. `PACKAGE_ID` del Makefile pasa a `bitcoind-testnet4`, por lo que el artefacto será `bitcoind-testnet4_x86_64.s9pk`.

- [ ] **Step 1: Cambiar id y título en el manifest**

En `startos/manifest/index.ts`, reemplazar:
```ts
  id: 'bitcoind',
  title: 'Bitcoin Core',
```
por:
```ts
  id: 'bitcoind-testnet4',
  title: 'Bitcoin Core (Testnet4)',
```

- [ ] **Step 2: Reducir las imágenes a x86_64**

En el mismo archivo, en `images`, fijar `arch: ['x86_64']` en las cuatro imágenes (`bitcoind`, `proxy`, `python`, `i2pd`). Para `i2pd`, eliminar la línea `emulateMissingAs: 'x86_64'` (ya no aplica). Resultado de cada bloque `arch`:
```ts
      arch: ['x86_64'],
```

- [ ] **Step 3: Ajustar versión y nota de release**

En `startos/versions/current.ts`, reemplazar:
```ts
  version: '31.0:14',
```
por:
```ts
  version: '31.0:0',
```
y reemplazar el objeto `releaseNotes` completo por:
```ts
  releaseNotes: {
    en_US: 'Initial Testnet4 build based on Bitcoin Core 31.x.',
    es_ES: 'Compilación inicial de Testnet4 basada en Bitcoin Core 31.x.',
  },
```

- [ ] **Step 4: Typecheck**

Run: `cd /home/criptoworld/Documents/OpenCode/bitcointestStart9 && npm run check`
Expected: código 0, sin errores.

- [ ] **Step 5: Commit**

```bash
git add startos/manifest/index.ts startos/versions/current.ts
git commit -q -m "feat: brand package as bitcoind-testnet4 (amd64 only)"
```

---

### Task 3: utils.ts — ruta de cookie testnet4 y args de lanzamiento

**Files:**
- Modify: `startos/utils.ts`

**Interfaces:**
- Consumes: constantes ya existentes en el archivo (`rootDir`, `rpccookiefile`, `rpcbind`, `rpcbindPruned`, `peerPortInternal`, `peerPortExternal`, `rpcPort`, `rpcPortPruned`).
- Produces:
  - `export const networkSubdir = 'testnet4'`
  - `export function testnet4LaunchArgs(opts: { prune: boolean }): string[]` — devuelve `['-testnet4', '-rpcbind=...', '-bind=0.0.0.0:58333', '-whitebind=0.0.0.0:8333']`.
  - `rpcArgs(opts)` actualizado para que `-rpccookiefile` apunte a `/root/.bitcoin/testnet4/.cookie`.

- [ ] **Step 1: Añadir `networkSubdir` junto a las rutas**

En `startos/utils.ts`, justo debajo de la línea `export const rpccookiefile = '.cookie'`, añadir:
```ts
// Bitcoin Core escribe los datos de testnet4 (incluida la cookie RPC) en
// este subdirectorio dentro del datadir.
export const networkSubdir = 'testnet4'
```

- [ ] **Step 2: Corregir la ruta de cookie en `rpcArgs`**

En `startos/utils.ts`, en la función `rpcArgs`, reemplazar:
```ts
    `-rpccookiefile=${rootDir}/.cookie`,
```
por:
```ts
    `-rpccookiefile=${rootDir}/${networkSubdir}/.cookie`,
```

- [ ] **Step 3: Añadir el helper de args de lanzamiento testnet4**

En `startos/utils.ts`, justo después de la función `bitcoinCliArgs`, añadir:
```ts
/**
 * Args de línea de comandos para forzar testnet4 y aplicar los binds de red.
 * Se pasan por CLI (no por bitcoin.conf) porque las opciones de red sólo se
 * aplican a la red activa cuando vienen por CLI; en el archivo de config, al
 * estar en la sección por defecto, Bitcoin Core las ignora en testnet4.
 */
export function testnet4LaunchArgs(opts: { prune: boolean }): string[] {
  return [
    '-testnet4',
    `-rpcbind=${opts.prune ? rpcbindPruned : rpcbind}`,
    `-bind=0.0.0.0:${peerPortInternal}`,
    `-whitebind=0.0.0.0:${peerPortExternal}`,
  ]
}
```

- [ ] **Step 4: Typecheck**

Run: `cd /home/criptoworld/Documents/OpenCode/bitcointestStart9 && npm run check`
Expected: código 0. (`rpcbind`, `rpcbindPruned`, `peerPortInternal`, `peerPortExternal` ya están definidos arriba en el mismo archivo.)

- [ ] **Step 5: Commit**

```bash
git add startos/utils.ts
git commit -q -m "feat: testnet4 cookie path + launch args helper in utils"
```

---

### Task 4: main.ts — inyectar red testnet4, binds, ZMQ y cookie

**Files:**
- Modify: `startos/main.ts`

**Interfaces:**
- Consumes de Task 3: `networkSubdir`, `testnet4LaunchArgs`, `zmqBundle` (ya exportado en utils).
- Produces: `bitcoind` se lanza con `-testnet4` + binds + ZMQ; `rpcCookiePath` apunta a `${rootDir}/${networkSubdir}/.cookie`; el proxy de pruning y los health checks heredan la ruta correcta vía `rpcCookiePath` y `bitcoinCliArgs`.

- [ ] **Step 1: Importar los nuevos símbolos de utils**

En `startos/main.ts`, en el bloque `import { ... } from './utils'`, añadir `networkSubdir`, `testnet4LaunchArgs` y `zmqBundle` a la lista (junto a `bitcoinCliArgs`, `rootDir`, `rpccookiefile`, etc.). El bloque queda:
```ts
import {
  bitcoinCliArgs,
  bitcoinMounts,
  GetBlockchainInfo,
  i2pControlPort,
  ipcSocketPath,
  networkSubdir,
  rootDir,
  rpccookiefile,
  rpcPort,
  rpcPortPruned,
  testnet4LaunchArgs,
  zmqBundle,
} from './utils'
```

- [ ] **Step 2: Inyectar args de red/bind/ZMQ en `bitcoinArgs`**

En `startos/main.ts`, después del bloque `if (reindexBlockchain) { ... } else if (reindexChainstate) { ... }` y **antes** de `const bitcoindSub = await sdk.SubContainer.of(`, insertar:
```ts
  // Forzar testnet4 y aplicar los binds de red (no se aplican vía bitcoin.conf
  // en una red no-mainnet; deben ir por CLI).
  bitcoinArgs.push(...testnet4LaunchArgs({ prune: !!bitcoinConf.prune }))

  // ZMQ: igual que los binds, en testnet4 hay que pasarlo por CLI.
  if (bitcoinConf.zmqEnabled) {
    bitcoinArgs.push(
      `-zmqpubrawblock=${zmqBundle.zmqpubrawblock}`,
      `-zmqpubhashblock=${zmqBundle.zmqpubhashblock}`,
      `-zmqpubrawtx=${zmqBundle.zmqpubrawtx}`,
      `-zmqpubhashtx=${zmqBundle.zmqpubhashtx}`,
      `-zmqpubsequence=${zmqBundle.zmqpubsequence}`,
    )
  }
```

- [ ] **Step 3: Corregir `rpcCookiePath` al subdir testnet4**

En `startos/main.ts`, reemplazar:
```ts
  const rpcCookiePath = `${rootDir}/${rpccookiefile}`
```
por:
```ts
  const rpcCookiePath = `${rootDir}/${networkSubdir}/${rpccookiefile}`
```
(Esto propaga la ruta correcta al `rm` inicial de la cookie, al health check `access(...)`, y al `config.toml` del proxy de pruning, todos los cuales ya usan `rpcCookiePath`.)

- [ ] **Step 4: Typecheck**

Run: `cd /home/criptoworld/Documents/OpenCode/bitcointestStart9 && npm run check`
Expected: código 0, sin errores. (`bitcoinConf.zmqEnabled` y `bitcoinConf.prune` existen en el form devuelto por `fileToForm`.)

- [ ] **Step 5: Build JS bundle (ncc) como verificación extra**

Run: `cd /home/criptoworld/Documents/OpenCode/bitcointestStart9 && npm run build`
Expected: genera `./javascript` sin errores. Confirma que el grafo de imports resuelve en runtime, no solo en tipos.

- [ ] **Step 6: Commit**

```bash
git add startos/main.ts
git commit -q -m "feat: launch bitcoind on testnet4 with pinned binds, zmq and cookie path"
```

---

### Task 5: Compilar el s9pk (amd64)

**Files:**
- Produces: `bitcoind-testnet4_x86_64.s9pk`

- [ ] **Step 1: Empaquetar**

Run:
```bash
cd /home/criptoworld/Documents/OpenCode/bitcointestStart9
make x86_64
```
Expected: termina con el banner "✅ Build Complete!" y `bitcoind-testnet4_x86_64.s9pk` en el directorio. (La primera vez construye la imagen Docker de bitcoind 31.0; puede tardar.)

- [ ] **Step 2: Inspeccionar el manifest del s9pk**

Run:
```bash
cd /home/criptoworld/Documents/OpenCode/bitcointestStart9
start-cli s9pk inspect bitcoind-testnet4_x86_64.s9pk manifest | jq '{id, title, version, arch: [.images[].arch]|flatten|unique}'
```
Expected: `id: "bitcoind-testnet4"`, `title: "Bitcoin Core (Testnet4)"`, `version: "31.0:0"`, `arch: ["x86_64"]`.

- [ ] **Step 3: Commit (registro del estado, el .s9pk está en .gitignore)**

```bash
cd /home/criptoworld/Documents/OpenCode/bitcointestStart9
git add -A && git commit -q -m "build: package bitcoind-testnet4 amd64 s9pk" --allow-empty
```

---

### Task 6: Sideload y verificación en StartOS 0.4

**Files:** ninguno (verificación en el nodo).

Esta es la prueba de aceptación real: no hay test unitario que valide el arranque en testnet4, así que se verifica en el servidor.

- [ ] **Step 1: Sideload**

En la interfaz web de tu StartOS 0.4: **System → Sideload**, subir `bitcoind-testnet4_x86_64.s9pk`. Instalar y arrancar el servicio.
Expected: aparece "Bitcoin Core (Testnet4)" con id `bitcoind-testnet4`; el servicio pasa a *Starting* → *Running*.

- [ ] **Step 2: Health check de RPC en verde**

Observar los health checks del servicio en la UI.
Expected: "RPC" pasa a *ready/success* (implica que la cookie en `testnet4/.cookie` se creó y el puerto 8332 escucha) y "Blockchain Sync" muestra "Syncing blocks...X%".

- [ ] **Step 3: Confirmar la red en los logs**

En la UI del servicio, abrir *Logs*.
Expected: líneas de Bitcoin Core indicando testnet4 (p. ej. `Using the 'testnet4' chain` / rutas bajo `.../testnet4/`). No deben aparecer errores fatales de arranque. (Advertencias del tipo "Config setting for -rpcbind only applied on ... [testnet4] section" son **esperadas e inocuas**: provienen de las opciones de bind en la sección por defecto de `bitcoin.conf`; los binds reales los aplican los args de CLI.)

- [ ] **Step 4: Confirmar sincronización efectiva**

Dejar el nodo unos minutos y comprobar que el porcentaje de "Blockchain Sync" avanza y/o que el número de bloques sube (testnet4 sincroniza rápido).
Expected: progreso de sincronización visible; eventualmente "Bitcoin is fully synced".

---

## Self-Review

- **Cobertura del spec:**
  - Base oficial 31.x → Task 1. ✓
  - Testnet4 fijo → Task 3 (`testnet4LaunchArgs`) + Task 4 (inyección). ✓
  - id `bitcoind-testnet4` / título → Task 2. ✓
  - Cookie en `testnet4/.cookie` → Task 3 (rpcArgs) + Task 4 (`rpcCookiePath`). ✓
  - Health check de sync apuntando a testnet4 → cubierto vía `bitcoinCliArgs` (cookie+puerto corregidos) en Task 3/4. ✓
  - Build solo amd64 → Task 2 (arch) + Task 5. ✓
  - Entrega por Sideload → Task 6. ✓
  - Criterios de éxito del spec (1–5) → Task 5 Step 2 (id/arch/version) y Task 6 (running, RPC, chain testnet4, sync). ✓
- **Desviación consciente respecto al spec:** el spec contemplaba usar una sección `[testnet4]` en `bitcoin.conf`; el plan inyecta los binds por CLI en su lugar (mismo efecto, sin tocar el `fileModel`, menor riesgo). Documentado en "Architecture" y en Task 6 Step 3.
- **Limitación conocida (fuera de alcance):** opciones de red específicas que el usuario fije por la UI y que sean *network-only* (p. ej. `addnode`/`connect`/`whitelist`) se escriben en la sección por defecto de `bitcoin.conf` y Bitcoin Core las ignora en testnet4. Para testnet4 con semillas por defecto no es bloqueante; si se necesitaran, se migraría a una sección `[testnet4]` en el `fileModel` en una iteración posterior.
- **Placeholder scan:** sin TBD/TODO; todos los pasos con comandos/código concretos.
- **Consistencia de tipos:** `networkSubdir`, `testnet4LaunchArgs`, `zmqBundle`, `rpcCookiePath` usados con los mismos nombres en utils y main.

---

## Notas de implementación (correcciones tras verificación en el nodo)

El enfoque de "inyectar binds por CLI" del plan original resultó **incorrecto**
contra Bitcoin Core 31; se corrigió durante la ejecución (debugging sistemático
con los logs del servicio):

1. **Intento 1 (binds por CLI + conf):** `Error: Duplicate binding configuration
   for address 0.0.0.0:8333`. El `bitcoin.conf` del paquete YA define los binds y
   Bitcoin Core los aplica a la red activa, así que repetirlos por CLI duplica.
2. **Intento 2 (solo `-testnet4`, sin binds CLI):** `Error: Config setting for
   -bind / -rpcbind only applied on testnet4 network when in [testnet4] section`
   (fatal). En testnet4, `-bind` y `-rpcbind` en la sección por defecto del conf
   son error fatal.
3. **Solución final (verificada):** mover `rpcbind`, `rpcallowip`, `bind`,
   `whitebind` y ZMQ a una sección **`[testnet4]`** generada por el `fileModel`
   (`startos/fileModels/bitcoin.conf.ts` → `formToFile`), y seleccionar la red con
   `-testnet4` por CLI (`startos/utils.ts` → `testnet4LaunchArgs`). La cookie se
   lee de `testnet4/.cookie`. Resultado: arranca en testnet4 y sincroniza sin
   errores.

### Dependencias de build del host (StartOS 0.4) descubiertas

- `docker` + `docker-buildx`
- `squashfs-tools-ng` (provee `tar2sqfs`, que `start-cli s9pk pack` necesita)
- `start-cli` 0.4.x, `node`, `make`, `jq`

### Estado

Build OK (`bitcoind-testnet4_x86_64.s9pk`), sideload OK, nodo sincronizando
testnet4 en modo pruned por defecto (proxy RPC del paquete en el puerto 8332).
