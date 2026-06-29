# Frigate — StartOS Package

StartOS wrapper for [Frigate](https://github.com/sparrowwallet/frigate), an Electrum server for **Silent Payments (BIP352)** on **mainnet**.

The service uses the **native StartOS dashboard** (Status, Health Checks, Service Interfaces, Dependencies) — same layout as Fulcrum/Electrs packages.

## Prerequisites on StartOS

- **Bitcoin Core** (archival, `txindex`, ZMQ)
- **Electrs** (synced)

## Sideload install

1. Download from [GitHub Release v1.6.0-3](https://github.com/criptoworld8484/sparrow-frigate-startos/releases/tag/v1.6.0-3):
   - `frigate_x86_64.s9pk` — servidores x86_64
   - `frigate_aarch64.s9pk` — ARM (Raspberry Pi, etc.)
2. StartOS → **Sideload** → sube el `.s9pk`.
3. Open the Frigate dashboard and wait for green health checks.

## Build from source

Requires Docker, Node.js 22, `make`, `squashfs-tools`, and [start-cli](https://start9.com/start-cli/install.sh).

```bash
cd sparrow-frigate-startos
npm ci
npm run check
make
```

Produces `frigate_x86_64.s9pk` and `frigate_aarch64.s9pk`.

Install to a local StartOS node:

```bash
# ~/.startos/config.yaml must define host: http://your-server.local
make install
```

## Sparrow Wallet

| Field   | Value                          |
|---------|--------------------------------|
| Network | Mainnet                        |
| SSL     | Off                            |
| Server  | From **Electrum (TCP)** interface |

## Related

- Umbrel package: `../sparrow-frigate/`
- Upstream: https://github.com/sparrowwallet/frigate
