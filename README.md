# Start9OS

Monorepo of personal [StartOS](https://start9.com) (Start9) service packages.
Each subdirectory is a self-contained package that builds its own `.s9pk` for
sideloading on a Start9 node.

## Packages

| Package | Service | Arch | Description | Prebuilt `.s9pk` |
|---------|---------|------|-------------|------------------|
| [`bitcoind-testnet4/`](./bitcoind-testnet4) | Bitcoin Core (Testnet4) — id `bitcoind` | `x86_64` | Bitcoin Core full node running on **testnet4**. Drop-in `bitcoind` so dependents (Fulcrum, electrs) recognize it. | — |
| [`sparrow-frigate/`](./sparrow-frigate) | Frigate — id `frigate` | `x86_64`, `aarch64` | Electrum server for Silent Payments (BIP352). | — |
| [`broadcast-pool/`](./broadcast-pool) | Broadcast Pool — id `broadcast-pool` | `x86_64` | Schedule and delay Bitcoin broadcasts from Sparrow/Liana. | [Release `startos-v0.3.19`](https://github.com/criptoworld8484/broadcast-pool/releases/tag/startos-v0.3.19) |
| [`cloudflared/`](./cloudflared) | Cloudflare Tunnel — id `cloudflared` | `x86_64`, `aarch64` | Token-based cloudflared: expose StartOS services on your own domain via Cloudflare, no inbound ports. Routing managed in the Cloudflare dashboard. | — |
| [`liquidd/`](./liquidd) | Liquid (Elements) — id `liquidd` | `x86_64`, `aarch64` | Elements full node on the **Liquid** mainnet sidechain. Peers to a `bitcoind` dependency for mainchain RPC. | — |
| [`liquid-electrs/`](./liquid-electrs) | Liquid Electrs — id `liquid-electrs` | `x86_64` | Esplora + Electrum indexer for Liquid, built with `--features liquid`. Hard dependency on `liquidd`. | — |
| [`liquidd-testnet/`](./liquidd-testnet) | Liquid Testnet — id `liquidd-testnet` | `x86_64`, `aarch64` | Elements node on **Liquid testnet**. Separate package so it can run alongside mainnet `liquidd`. | — |
| [`liquid-electrs-testnet/`](./liquid-electrs-testnet) | Liquid Testnet Electrs — id `liquid-electrs-testnet` | `x86_64` | Esplora + Electrum indexer for Liquid testnet. Hard dependency on `liquidd-testnet`. | — |

## Building a package

These are StartOS **0.4** packages (TypeScript SDK). From a package directory:

```bash
cd <package>
make x86_64        # builds <id>_x86_64.s9pk
# or, where supported:
make aarch64
```

Build host needs: `docker` + `docker-buildx`, `squashfs-tools-ng` (provides
`tar2sqfs`), Node, `make`, `jq`, and `start-cli` (0.4.x).

Install the resulting `.s9pk` on a node via the StartOS UI (Sideload) or
`start-cli package install --sideload <file>.s9pk`.

## License

MIT — see [LICENSE](./LICENSE). Individual packages retain their own `LICENSE`.
