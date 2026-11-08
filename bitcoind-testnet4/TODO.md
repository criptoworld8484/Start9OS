# TODO

- Upstream `assets/btc-rpc-proxy.patch` to Start9Labs/btc-rpc-proxy (getblock boolean/named verbosity forms must be intercepted, not forwarded) so the package can go back to the pinned `dockerTag` image.
- `@start9labs/start-sdk` 1.5.3 bug: `VersionRange.normalize()` is revision-blind — unioning several revisions of the same upstream collapses them, so a version graph with many historical nodes mangles `canMigrateFrom` (reported as `<=32.1:0` for 32.1:2). Keep only migration-bearing nodes in `versions/index.ts` until fixed upstream.
- If the Fulcrum auto-config task keeps reappearing on pruned nodes, relax its `accept` in fulcrum-startos (`accept: [{ prune: 0, txindex: true, zmqEnabled: true }, { zmqEnabled: true }]`) — the first alternative is unsatisfiable when pruning is forced on small disks.
- Add a low-disk-space health check or notification: bitcoind dies with a fatal "Disk space is too low!" below 50 MiB free and the service crash-loops with no useful warning beforehand.
- Expose new Bitcoin Core 32.1 settings in the config actions: `rpcmaxconnections`, `prevoutfetchthreads`, `inboundrelaypercent`, `txsendrate`, `txospenderindex`.
- Fix the assumeutxo action for testnet4: it waits on mainnet block `840_000` (`block_840_000` in `startos/actions/assumeutxo.ts`), so on testnet4 the wait loop never completes; point it at a testnet4 snapshot block instead (or hide the action).
- Consider aligning `@start9labs/start-sdk` (currently 1.5.3) with upstream `bitcoin-core-startos` (3.1.1) and refreshing `start-cli`.
