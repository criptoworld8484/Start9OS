<p align="center">
  <img src="icon.svg" alt="Liquid Network Logo" width="21%">
</p>

# Liquid (Elements) on StartOS

> **Upstream docs:** <https://elementsproject.org/>
>
> This package runs Elements 23.3.3 as a Liquid mainnet full node. Everything not listed here behaves the same as upstream Elements. See the [upstream repo](https://github.com/ElementsProject/elements) for general documentation.

---

## Table of Contents

- [Overview](#overview)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Default Networking](#default-networking)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions](#actions)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)

---

## Overview

[Liquid](https://liquid.net/) is a Bitcoin sidechain operated by the Liquid Federation. It enables fast, confidential transactions, and the issuance of digital assets (securities, stablecoins, NFTs). This package runs `liquidd` (the Elements daemon) on Liquid mainnet (`liquidv1`).

Key capabilities:
- Full Liquid chain validation
- Peg-in verification against Bitcoin Core (mainchain)
- RPC endpoint for wallets (e.g. Aqua, Marina) and indexers

---

## Volume and Data Layout

| Path (inside container) | Contents |
|---|---|
| `/root/.elements/liquidv1/` | Blockchain data, wallet, configuration |
| `/mnt/bitcoind/` | Bitcoin Core data directory (read-only mount) |

---

## Installation and First-Run Flow

1. Install **Bitcoin Core** (archival, non-pruned) and wait for it to fully sync.
2. Install this package. It will auto-configure Bitcoin Core to serve as the mainchain RPC source.
3. Liquid will begin syncing. Initial sync takes several hours on typical hardware.

---

## Default Networking

| Interface | Port | Protocol |
|---|---|---|
| RPC | 7041 | HTTP (JSON-RPC) |
| P2P | 7042 | TCP |

---

## Configuration Management

`elements.conf` is managed by StartOS. The following values are enforced and cannot be overridden:

- `chain=liquidv1`
- `validatepegin=1`
- `server=1`
- `listen=1`
- `rpcport=7041`
- `port=7042`
- `mainchainrpcconnect=<bitcoind host>`
- `mainchainrpcport=<bitcoind rpc port>`
- `mainchainrpccookiefile=/mnt/bitcoind/.cookie`

---

## Network Access and Interfaces

- **RPC Interface** — JSON-RPC on port 7041. Use this to connect wallets or indexers.
- **Peer Interface** — P2P on port 7042 for Liquid network peers.

---

## Actions

Actions available in the StartOS UI:

- Generate RPC User Credentials
- Delete RPC User
- Reindex Blockchain / Chainstate
- Delete Peer List / Transaction Index / Coinstats Index
- Runtime Information

---

## Backups and Restore

Backups include wallet data and configuration. Blockchain data (blocks, chainstate, indexes) is excluded — it is re-downloaded on restore.

---

## Health Checks

| Check | Description |
|---|---|
| RPC | Verifies the RPC port is listening |
| Blockchain Sync | Reports sync progress; turns green when IBD completes |

---

## Dependencies

| Package | Requirement |
|---|---|
| bitcoind | Archival (non-pruned), fully synced |

Liquid reads the Bitcoin Core cookie file directly (`/mnt/bitcoind/.cookie`) for RPC authentication.
