import { FileHelper } from '@start9labs/start-sdk'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { electrumPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Frigate!'))

  const store = await storeJson.read().once()
  if (!store) throw new Error('No store')

  let syncNotified = store.syncNotified ?? false

  const frigateContainer = await sdk.SubContainer.of(
    effects,
    { imageId: 'frigate' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      })
      .mountDependency({
        dependencyId: 'bitcoind',
        volumeId: 'main',
        subpath: null,
        mountpoint: '/mnt/bitcoind',
        readonly: true,
      }),
    'frigate',
  )

  await FileHelper.string(`${frigateContainer.rootfs}/mnt/bitcoind/.cookie`)
    .read()
    .const(effects)

  const electrumProbe = `exec 3<>/dev/tcp/127.0.0.1/${electrumPort} || exit 1
printf '%s\\n' '{"jsonrpc":"2.0","id":1,"method":"server.banner","params":[]}' >&3
IFS= read -t 10 -r line <&3 || exit 2
exec 3<&- 2>/dev/null
printf '%s' "$line"`

  return sdk.Daemons.of(effects)
    .addDaemon('frigate', {
      subcontainer: frigateContainer,
      exec: { command: ['/entrypoint.sh'] },
      ready: {
        display: i18n('Electrum (TCP)'),
        fn: async () => {
          const result = await sdk.healthCheck.checkPortListening(
            effects,
            electrumPort,
            {
              successMessage: i18n('The Electrum interface is ready'),
              errorMessage: i18n('The Electrum interface is not ready'),
            },
          )

          if (result.result === 'success') return result

          return {
            result: 'starting',
            message: i18n('The Electrum interface is not ready'),
          }
        },
      },
      requires: [],
    })
    .addHealthCheck('sync-progress', {
      ready: {
        display: i18n('Sync Progress'),
        fn: async () => {
          const res = await frigateContainer.exec(
            ['bash', '-c', electrumProbe],
            {},
          )

          if (
            res.exitCode === 0 &&
            res.stdout.toString().includes('"result"')
          ) {
            return {
              message: i18n('Frigate is synced'),
              result: 'success',
            }
          }

          return {
            message: i18n(
              'Frigate is building its Silent Payments index. This can take a long time on first run.',
            ),
            result: 'loading',
          }
        },
      },
      requires: ['frigate'],
    })
    .addOneshot('synced-true', {
      subcontainer: null,
      exec: {
        fn: async () => {
          if (syncNotified) return null
          await sdk.notification.create(effects, {
            level: 'success',
            title: i18n('Sync Complete'),
            message: i18n(
              'Frigate has finished indexing. The Electrum server is ready for Sparrow.',
            ),
          })
          await storeJson.merge(effects, { syncNotified: true })
          syncNotified = true
          return null
        },
      },
      requires: ['sync-progress'],
    })
})
