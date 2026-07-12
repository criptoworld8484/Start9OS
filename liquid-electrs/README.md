<p align="center">
  <img src="icon.svg" alt="Liquid Electrs Logo" width="21%">
</p>

# Liquid Electrs on StartOS

> **Upstream:** <https://github.com/Blockstream/electrs>
>
> Blockstream's `electrs` fork with Liquid Network support, packaged for StartOS.

`liquid-electrs` indexes the Liquid (Elements) sidechain and exposes:

- **Esplora REST API** — block-explorer queries on port `3000` (LAN)
- **Electrum server** — wallet protocol on port `50001` (LAN, plain TCP)

---

## Dependencies

| Dependency | Required | Purpose |
|------------|----------|---------|
| `liquidd` (Liquid/Elements) | Yes | Provides the full Liquid chain for indexing |

The indexer connects automatically to the `liquidd` service via its RPC interface and cookie authentication. No manual configuration is needed.

---

## Volume and Data Layout

| Volume | Mount point | Contents |
|--------|-------------|----------|
| `main` | `/data` | RocksDB index (`/data/db`) + seed files |
| `liquidd` (dependency) | `/mnt/liquidd` | Read-only access to liquidd cookie |

The RocksDB index at `/data/db` is **excluded from backups** — it rebuilds automatically from the Liquid node on restore.

---

## Network Access and Interfaces

| Interface | Internal port | Protocol | Purpose |
|-----------|---------------|----------|---------|
| Esplora REST API | 3000 | HTTP | Block explorer API (LAN only) |
| Electrum Server | 50001 | TCP | Wallet connections (LAN only) |

Connect wallets (e.g. Blockstream Green) to:
- **Esplora:** `http://<lan-ip>:3000`
- **Electrum:** `<lan-ip>:50001`

---

## Backups and Restore

- **Backed up:** configuration files in `main` volume
- **Excluded:** `/data/db` (RocksDB index — rebuilds from the node automatically)
- **Restore:** configuration is restored; the index re-syncs on first start

---

## Health Checks

| Check | Display | Method |
|-------|---------|--------|
| Electrum Server | Electrum Server | Port 50001 listening |
| Esplora REST API | Esplora REST API | `GET /blocks/tip/height` returns a block height |

---

## Quick Reference for AI Consumers

```yaml
package_id: liquid-electrs
upstream: https://github.com/Blockstream/electrs
volumes:
  main: /data
ports:
  esplora: 3000 (HTTP, LAN)
  electrum: 50001 (TCP, LAN)
dependencies:
  - liquidd (required)
fixed_config:
  network: liquid
  daemon_rpc_addr: liquidd.startos:7041
  daemon_dir: /mnt/liquidd
  db_dir: /data/db
  http_addr: 0.0.0.0:3000
  electrum_rpc_addr: 0.0.0.0:50001
backup_volumes:
  - main (excludes /db)
```
