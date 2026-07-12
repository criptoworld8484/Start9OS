import { FileHelper } from '@start9labs/start-sdk'
import { manifest as bitcoindManifest } from 'bitcoin-core-startos/startos/manifest'
import { elementsConfFile } from './fileModels/elements.conf'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  dbcache,
  elementsMounts,
  elementsCliArgs,
  GetBlockchainInfo,
  mainchainRpcHost,
  mainchainRpcPort,
  maxconnections,
  maxmempool,
  par,
  peerPortInternal,
  rootDir,
  rpcallowip,
  rpcbind,
  rpcPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.log('Starting Liquid (Elements)!')

  // get store.json (no watch needed)
  const store = await storeJson.read().once()
  if (!store) {
    throw new Error('No store.json')
  }

  // get elements.conf and watch for changes
  const elementsConf = await elementsConfFile.read().const(effects)
  if (!elementsConf) {
    throw new Error('No elements.conf')
  }

  // merge enforced settings into elements.conf
  await elementsConfFile.merge(effects, {
    chain: 'liquidv1',
    validatepegin: true,
    server: true,
    listen: true,
    rpcport: rpcPort,
    rpcbind: rpcbind,
    rpcallowip: rpcallowip,
    port: peerPortInternal,
    dbcache,
    maxmempool,
    maxconnections,
    par,
    mainchainrpchost: mainchainRpcHost,
    mainchainrpcport: mainchainRpcPort,
    mainchainrpccookiefile: '/mnt/bitcoind/.cookie',
  })

  // create subcontainer mounting own datadir RW + bitcoind volume RO
  const sub = await sdk.SubContainer.of(
    effects,
    { imageId: 'liquidd' },
    elementsMounts.mountDependency<typeof bitcoindManifest>({
      dependencyId: 'bitcoind',
      volumeId: 'main',
      subpath: null,
      mountpoint: '/mnt/bitcoind',
      readonly: true,
    }),
    'liquidd-sub',
  )

  // restart if bitcoind cookie changes (cookie-mount pattern)
  await FileHelper.string(`${sub.rootfs}/mnt/bitcoind/.cookie`)
    .read()
    .const(effects)

  return sdk.Daemons.of(effects)
    .addDaemon('elementsd', {
      subcontainer: sub,
      exec: {
        command: ['elementsd', `-datadir=${rootDir}`],
        sigtermTimeout: 300_000,
      },
      ready: {
        display: 'RPC',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, rpcPort, {
            successMessage: i18n('The Liquid RPC Interface is ready'),
            errorMessage: i18n('The Liquid RPC Interface is not ready'),
          }),
      },
      requires: [],
    })
    .addHealthCheck('sync-progress', {
      ready: {
        display: i18n('Blockchain Sync'),
        trigger: sdk.trigger.statusTrigger(30_000, {
          starting: 5_000,
          failure: 5_000,
        }),
        fn: async () => {
          const res = await sub.exec([
            ...elementsCliArgs(),
            '-rpcconnect=127.0.0.1',
            'getblockchaininfo',
          ])

          if (
            res.exitCode === 0 &&
            res.stdout !== '' &&
            typeof res.stdout === 'string'
          ) {
            const info: GetBlockchainInfo = JSON.parse(res.stdout)

            if (info.initialblockdownload) {
              const percentage = (info.verificationprogress * 100).toFixed(2)
              return {
                message: i18n('Syncing blocks...${percentage}%', {
                  percentage,
                }),
                result: 'loading',
              }
            }

            return {
              message: i18n('Liquid is fully synced'),
              result: 'success',
            }
          }

          return {
            message: i18n('Liquid is starting…'),
            result: 'starting',
          }
        },
      },
      requires: ['elementsd'],
    })
    .addOneshot('synced-true', {
      subcontainer: null,
      exec: {
        fn: async () => {
          if (!store.fullySynced) {
            await sdk.notification.create(effects, {
              level: 'success',
              title: i18n('Sync Complete'),
              message: i18n('The blockchain is fully synced.'),
            })
            await storeJson.merge(effects, { fullySynced: true })
            store.fullySynced = true
          }
          return null
        },
      },
      requires: ['sync-progress'],
    })
})
