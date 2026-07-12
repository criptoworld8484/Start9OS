# Notas de investigación — versión de Elements y patrón de dependencia (Task 1 + Task 2)

Resueltas a partir del código real de `Start9Labs/electrs-startos` y de los releases de Elements.

## Versión de Elements Core a empaquetar

- **Versión:** `elements-23.3.3` (última estable, 2026-04-13).
- **Binario x86_64:** `elements-23.3.3-x86_64-linux-gnu.tar.gz`
  - sha256: `90d6659a4f5d6d94bbf2321f6114e1286fbec8031cfc614b2f2319ddfcd9b3e1`
  - URL base: `https://github.com/ElementsProject/elements/releases/download/elements-23.3.3`
- **Binario aarch64 (opcional):** `elements-23.3.3-aarch64-linux-gnu.tar.gz` (existe, por si se empaqueta multi-arch).
- **Checksums/firma:** `SHA256SUMS` + `SHA256SUMS.asc`.
  - `SHA256SUMS.asc` es **clearsigned** (`-----BEGIN PGP SIGNED MESSAGE-----`), **no** una firma detached.
    Verificar con `gpg --verify SHA256SUMS.asc` (un solo argumento).
  - Firmante: clave RSA **`BD0F3062F87842410B06A0432F656B0610604482`**.
  - Importar esa clave pública en `assets/release-keys/` y fijar el fingerprint en el Dockerfile.

Diferencia clave vs la plantilla bitcoind: bitcoind usa firma **detached** (`gpg --verify SHA256SUMS.asc SHA256SUMS`)
y quorum 5-de-7. Elements usa **clearsigned** con **un** firmante → `REQUIRED_QUORUM=1` y `gpg --verify SHA256SUMS.asc`.

## Patrón de consumo del nodo Bitcoin (de electrs-startos)

electrs NO usa usuario/contraseña RPC. El patrón real:

1. **Dependencia npm:** `package.json` incluye `bitcoin-core-startos` (el paquete de bitcoind) como
   dependencia, lo que permite `import { manifest } from 'bitcoin-core-startos/startos/manifest'` y
   `import { autoconfig } from 'bitcoin-core-startos/startos/actions/config/autoconfig'`.

2. **setupDependencies** (`startos/dependencies.ts`):
   ```typescript
   await sdk.action.createTask(effects, 'bitcoind', autoconfig, 'critical', {
     input: { kind: 'partial', value: { prune: 0 } },
     when: { condition: 'input-not-matches', once: false },
     reason: i18n('Liquid requiere un nodo Bitcoin archival para validar peg-ins.'),
   })
   return {
     bitcoind: {
       healthChecks: ['bitcoind', 'sync-progress'],
       kind: 'running',
       versionRange: '>=28.3:8',
     },
   }
   ```

3. **Montaje del volumen de bitcoind + cookie** (en `main.ts`, al crear el SubContainer):
   ```typescript
   sdk.Mounts.of()
     .mountVolume({ volumeId: 'main', subpath: null, mountpoint: rootDir, readonly: false })
     .mountDependency<typeof bitcoindManifest>({
       dependencyId: 'bitcoind',
       volumeId: 'main',
       subpath: null,
       mountpoint: '/mnt/bitcoind',
       readonly: true,
     })
   ```
   Y se fuerza reinicio si cambia la cookie:
   ```typescript
   await FileHelper.string(`${container.rootfs}/mnt/bitcoind/.cookie`).read().const(effects)
   ```

## Aplicación a liquidd (mainchainrpc por cookie)

Elements soporta autenticación a la mainchain por cookie. En `elements.conf` (red liquidv1):
```
validatepegin=1
mainchainrpcconnect=bitcoind.startos
mainchainrpcport=8332
mainchainrpccookiefile=/mnt/bitcoind/.cookie
```
Esto evita manejar usuario/contraseña. El volumen de bitcoind se monta RO en `/mnt/bitcoind`
(misma técnica que electrs), de modo que `elementsd` lee la cookie y autentica contra
`bitcoind.startos:8332`.

> NOTA: confirmar el nombre exacto del fichero cookie de bitcoind dentro de su volumen `main`
> (electrs lo lee como `/mnt/bitcoind/.cookie`). Para la mainnet de Bitcoin Core el cookie suele
> estar en la raíz del datadir (`.cookie`). Verificar en runtime.
