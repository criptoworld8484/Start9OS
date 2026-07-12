# Liquid (Elements) Full Node

This package runs **liquidd** (Elements 23.3.3), a full node for the [Liquid Network](https://liquid.net/) — a Bitcoin sidechain operated by the Liquid Federation.

## What it does

- Validates all Liquid blocks and transactions
- Verifies peg-in transactions against your local Bitcoin Core node
- Exposes an RPC interface (port 7041) for wallets, indexers, and other services

## Requirements

- **Bitcoin Core** (archival, non-pruned) must be installed and fully synced. Liquid needs access to the Bitcoin mainchain to validate peg-ins.

## Data

Block data and chainstate are excluded from backups (they can be re-downloaded). Wallet data and configuration are included.
