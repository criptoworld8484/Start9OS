# Liquid Electrs

Liquid Electrs indexes the Liquid (Elements) sidechain and lets Liquid-compatible wallets query balances, transaction history, and UTXOs from your own StartOS device.

## Requirements

Install **Liquid (Elements)** from the StartOS marketplace and let it finish its initial block download before starting Liquid Electrs. Electrs will wait in a loading state until the Liquid node is fully synced.

## What you get

- An **Esplora REST API** at `http://<lan-ip>:3000` — compatible with Blockstream's open-source Esplora explorer.
- An **Electrum protocol server** at `<lan-ip>:50001` — for wallets that speak the Electrum protocol over the Liquid network.
- Automatic connection to your StartOS `liquidd` node — RPC and cookie authentication are wired up for you.
- A RocksDB address index stored on the `main` volume (excluded from backups; it rebuilds itself after a restore).

## Getting set up

1. Install **Liquid (Elements)** if it is not already installed.
2. Start Liquid Electrs. On first run it will sit in a loading state while the Liquid node finishes syncing.
3. Once the Liquid node is fully synced, Electrs will begin building its address index. This can take several hours on first run.
4. When the **Esplora REST API** and **Electrum Server** health checks both show success, the service is ready.

## Connecting a wallet

### Blockstream Green (Esplora)

In the app settings, set a custom Esplora server to:
```
http://<lan-ip>:3000
```

### Electrum-compatible wallets

Add a custom server pointing to:
```
<lan-ip>:50001
```
(plain TCP — no SSL wrapper on this port)
