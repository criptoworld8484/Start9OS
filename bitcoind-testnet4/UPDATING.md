# Updating the upstream version

The `bitcoind` image is built locally from `Dockerfile`: it downloads the upstream Guix-built release tarball from `bitcoincore.org`, verifies `SHA256SUMS.asc` against a pinned 5-of-10 quorum of Bitcoin Core release signers, and copies the binaries into a slim Debian runtime. This branch tracks **Bitcoin Core 32.x** releases only.

## Determining the upstream version

- **Bitcoin Core 32.x** — [bitcoin/bitcoin](https://github.com/bitcoin/bitcoin)
  - Latest 32.x release tag:
    ```sh
    gh release list -R bitcoin/bitcoin --limit 50 --json tagName -q '.[].tagName' | grep -E '^v32\.' | head -1
    ```
  - Current pin: `VERSION` build-arg under `images.bitcoind.source.dockerBuild.buildArgs` in `startos/manifest/index.ts`.

## Applying the bump

1. Bump `VERSION` in `startos/manifest/index.ts` under `images.bitcoind.source.dockerBuild.buildArgs`.
2. If upstream rotated release signers, update `PINNED_FINGERPRINTS` in `Dockerfile` and refresh the keys in `assets/release-keys/` (`.asc` files named by fingerprint). Verify the `SHA256SUMS.asc` signers of the new release first and keep at least `REQUIRED_QUORUM` pinned signers who actually signed it — the 32.x series rotated in new release signers (Kung, Provoost, Clark), so the pinned set spans historical and current signers.

> Bump the StartOS `:N` revision suffix only for packaging changes at the same upstream version (e.g. `32.1:0` → `32.1:1`); a pure upstream bump starts at `:0`.
