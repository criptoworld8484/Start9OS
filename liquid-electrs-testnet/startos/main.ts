import { FileHelper } from '@start9labs/start-sdk'
import { manifest as liquiddManifest } from 'liquidd-testnet/startos/manifest'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  daemonParallelism,
  dbBlockCacheMb,
  dbDir,
  dbWriteBufferMb,
  electrumPort,
  esploraPort,
  initialSyncBatchSize,
  liquiddCookieFile,
  liquiddHost,
  liquiddMountpoint,
  liquiddRpcPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup ========================
   */
  console.info(i18n('Starting Electrs!'))

  const container = await sdk.SubContainer.of(
    effects,
    { imageId: 'electrs' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      })
      .mountDependency<typeof liquiddManifest>({
        dependencyId: 'liquidd-testnet',
        volumeId: 'main',
        subpath: null,
        mountpoint: '/mnt/liquidd',
        readonly: true,
      }),
    'electrs',
  )

  // Restart if the liquidd cookie changes (elementsd rotates it on restart)
  await FileHelper.string(`${container.rootfs}${liquiddCookieFile}`)
    .read()
    .const(effects)

  /**
   * ======================== Daemons ========================
   */
  return sdk.Daemons.of(effects)
    .addDaemon('electrs', {
      subcontainer: container,
      exec: {
        // electrs resolves --daemon-rpc-addr via DNS at startup and PANICS if it
        // can't (electrs/src/config.rs). On a freshly (re)created container there is
        // a window before the DHCP-assigned IP is applied to eth0, during which
        // `<node>.startos` does not resolve. The panic-restart loop is so fast the
        // container network never stabilizes → permanent deadlock (no IP → panic →
        // restart → no IP…). Wrap electrs in a wait loop: block until the node
        // hostname resolves (proof the container has network), THEN exec electrs.
        // This keeps the process alive so DHCP completes, and re-resolves the node
        // address on every (re)start (the node's container IP changes across restarts).
        // Once running, electrs handles RPC connection retries itself (backoff loop).
        command: [
          'sh',
          '-c',
          [
            `host=${liquiddHost}`,
            'i=0',
            // wait up to ~5 min for the container network / node DNS to come up
            'until getent hosts "$host" >/dev/null 2>&1; do',
            '  i=$((i+1))',
            '  echo "electrs: waiting for $host to resolve (container network coming up)… ($i)"',
            '  sleep 2',
            'done',
            'echo "electrs: $host resolved; starting indexer"',
            `exec electrs --network liquidtestnet --daemon-dir ${liquiddMountpoint} --daemon-rpc-addr ${liquiddHost}:${liquiddRpcPort} --db-dir ${dbDir} --http-addr 0.0.0.0:${esploraPort} --electrum-rpc-addr 0.0.0.0:${electrumPort} --cache-index-filter-blocks --db-block-cache-mb ${dbBlockCacheMb} --db-write-buffer-size-mb ${dbWriteBufferMb} --initial-sync-batch-size ${initialSyncBatchSize} --daemon-parallelism ${daemonParallelism}`,
          ].join('\n'),
        ],
      },
      ready: {
        display: i18n('Electrum Server'),
        fn: async () => {
          const result = await sdk.healthCheck.checkPortListening(
            effects,
            electrumPort,
            {
              successMessage: i18n(
                'Electrum server is ready and accepting connections',
              ),
              errorMessage: i18n('Electrum server is starting'),
            },
          )
          return result.result === 'success'
            ? result
            : {
                result: 'starting',
                message: i18n('Electrum server is starting'),
              }
        },
      },
      requires: [],
    })
    .addHealthCheck('esplora', {
      ready: {
        display: i18n('Esplora REST API'),
        fn: async () => {
          // Query the Esplora REST endpoint; returns the current block height
          // as a plain integer when the index is ready.
          const res = await container.exec(
            [
              'curl',
              '-sf',
              `http://127.0.0.1:${esploraPort}/blocks/tip/height`,
            ],
            {},
          )
          const height = res.stdout.toString().trim()
          if (res.exitCode === 0 && /^\d+$/.test(height)) {
            return {
              result: 'success',
              message: `Indexed to height ${height}`,
            }
          }
          return {
            result: 'loading',
            message: 'Indexing Liquid blockchain, follows the node',
          }
        },
      },
      requires: ['electrs'],
    })
})
