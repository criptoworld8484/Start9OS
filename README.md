# Start9OS

Monorepo of personal [StartOS](https://start9.com) (Start9) service packages.
Each subdirectory is a self-contained package that builds its own `.s9pk` for
sideloading on a Start9 node.

## Packages

| Package | Service | Arch | Description |
|---------|---------|------|-------------|
| [`bitcoind-testnet4/`](./bitcoind-testnet4) | Bitcoin Core (Testnet4) — id `bitcoind` | `x86_64` | Bitcoin Core full node running on **testnet4**. Drop-in `bitcoind` so dependents (Fulcrum, electrs) recognize it. |
| [`sparrow-frigate/`](./sparrow-frigate) | Frigate — id `frigate` | `x86_64`, `aarch64` | Electrum server for Silent Payments (BIP352). |
| [`broadcast-pool/`](./broadcast-pool) | Broadcast Pool — id `broadcast-pool` | `x86_64` | Schedule and delay Bitcoin broadcasts from Sparrow/Liana. |
| [`cloudflared/`](./cloudflared) | Cloudflare Tunnel — id `cloudflared` | `x86_64`, `aarch64` | Token-based cloudflared: expose StartOS services on your own domain via Cloudflare, no inbound ports. Routing managed in the Cloudflare dashboard. |

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
