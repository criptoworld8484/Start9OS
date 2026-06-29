# Frigate

## Documentation

- [Frigate upstream](https://github.com/sparrowwallet/frigate) — Silent Payments Electrum server (BIP352).
- [BIP352 Silent Payments](https://github.com/bitcoin/bips/blob/master/bip-0352.mediawiki) — specification.
- [StartOS Packaging Guide](https://docs.start9.com/packaging) — how StartOS service packages work.

## What you get on StartOS

- An **Electrum server for Silent Payments** on **mainnet**, indexing via your own Bitcoin Core node.
- Automatic wiring to **Bitcoin Core** (RPC + cookie) and **Electrs** (backend index).
- Dashboard health checks: **Electrum (TCP)** and **Sync Progress**, matching the native StartOS service UI.

## Getting set up

Frigate requires Bitcoin Core with `prune=0`, `txindex=true`, and ZMQ enabled, plus a running **Electrs** instance on mainnet. StartOS posts a critical task on Bitcoin Core to apply the required settings if they are not already in place.

1. Install **Bitcoin Core** and wait until it is fully synced.
2. Install **Electrs** and wait until its sync health check passes.
3. **Sideload** or install **Frigate** (`frigate.s9pk`).
4. Resolve any critical task on Bitcoin Core shown on the dashboard.
5. Start Frigate and watch **Sync Progress**. The initial Silent Payments index build can take a long time on first run.

## Connecting Sparrow (mainnet)

1. Open **Service Interfaces → Electrum (TCP)** on the Frigate dashboard.
2. Copy the host and port (default **57001**, plain TCP, no SSL).
3. In **Sparrow Wallet** → **Server** → **Private Electrum**:
   - Network: **Mainnet**
   - SSL: **Off**
   - Server: `your-server.local:57001:t` (or the Tor address shown by StartOS)

Use the **Electrum (TCP)** interface URL from the dashboard — do not connect Sparrow to Electrs directly when using Silent Payments.

## Limitations

- **Mainnet only** — signet and testnet are not supported on official StartOS Bitcoin/Electrs packages.
- **Experimental software** — Frigate is upstream experimental software for BIP352 scanning.
- **Index excluded from backups** — restoring from backup requires re-indexing Silent Payments data.
