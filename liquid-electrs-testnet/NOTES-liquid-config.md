# Notas — config de Blockstream/electrs para Liquid (Task 1, RESUELTA)

Verificado leyendo la fuente vendorizada en `electrs/src/config.rs` y `electrs/src/chain.rs`
(Blockstream/electrs `new-index` @ `1c8d7f831e0c76ae41c837479cf9bbb270847118`).

## Flags CLI (nombres reales, confirmados en config.rs)

`--db-dir`, `--daemon-dir`, `--network`, `--electrum-rpc-addr`, `--http-addr`, `--daemon-rpc-addr`,
`--parent-network` (todos existen con la feature `liquid`).

## daemon-dir / blocks / cookie — comportamiento clave

- electrs **añade automáticamente** el subdir de red a `--daemon-dir`:
  `config.rs:473-474` → `if let Some(sub) = get_network_subdir(network) { daemon_dir.push(sub) }`,
  y `get_network_subdir(Network::Liquid) => "liquidv1"` (`config.rs:601`).
  → Con `--daemon-dir /mnt/liquidd`, electrs usa `/mnt/liquidd/liquidv1` y los bloques en
    `/mnt/liquidd/liquidv1/blocks` (`blocks_dir = daemon_dir.join("blocks")`, `config.rs:479`).
- **Cookie:** el flag es `--cookie` y es un STRING `USER:PASSWORD`, **NO** un path de fichero
  (a diferencia de romanz, que usa `--cookie-file`). Si NO se pasa `--cookie`, el cookie getter
  lee el fichero `daemon_dir/.cookie` (`config.rs:559-566`), es decir
  **`/mnt/liquidd/liquidv1/.cookie`** — exactamente donde elementsd genera su cookie y donde queda
  montado el volumen de liquidd en RO.
  → **NO pasar `--cookie` ni `--cookie-file`**; dejar que electrs lea la cookie del daemon-dir.

## Red

- `--network liquid` (mapea a `Network::Liquid`, subdir `liquidv1`). Confirmado.
- `--parent-network` tiene default por red (para Liquid, bitcoin). Se puede **omitir**; si se quiere
  explícito: `--parent-network bitcoin`.

## Comando final de electrs (para Task 5)

```
electrs \
  --network liquid \
  --daemon-dir /mnt/liquidd \
  --daemon-rpc-addr liquidd.startos:7041 \
  --db-dir /data/db \
  --http-addr 0.0.0.0:3000 \
  --electrum-rpc-addr 0.0.0.0:50001
```

- `/mnt/liquidd` = volumen `main` de liquidd montado en RO. electrs deriva `liquidv1/` solo.
- La cookie se lee automáticamente de `/mnt/liquidd/liquidv1/.cookie`.
- El índice rocksdb se escribe en `--db-dir /data/db` (volumen `main` propio del indexador).

## Corrección al plan

El plan (Task 3/5) mencionaba `--cookie-file liquiddCookieFile`. **Eliminarlo del comando** —
electrs no tiene `--cookie-file`. La constante `liquiddCookieFile = '/mnt/liquidd/liquidv1/.cookie'`
se conserva SOLO para el healthcheck/watch de reinicio-si-cambia-la-cookie (FileHelper), no como flag.
