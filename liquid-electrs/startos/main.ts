import { FileHelper } from '@start9labs/start-sdk'
import { manifest as liquiddManifest } from 'liquidd/startos/manifest'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  dbDir,
  electrumPort,
  esploraPort,
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
        dependencyId: 'liquidd',
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
        command: [
          'electrs',
          '--network',
          'liquid',
          '--daemon-dir',
          liquiddMountpoint,
          '--daemon-rpc-addr',
          `${liquiddHost}:${liquiddRpcPort}`,
          '--db-dir',
          dbDir,
          '--http-addr',
          `0.0.0.0:${esploraPort}`,
          '--electrum-rpc-addr',
          `0.0.0.0:${electrumPort}`,
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
