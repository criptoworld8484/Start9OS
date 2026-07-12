import { elementsConfFile } from './fileModels/elements.conf'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  dbcache,
  elementsMounts,
  elementsCliArgs,
  GetBlockchainInfo,
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

  // merge enforced settings into elements.conf (only global options; network-specific
  // ones are passed as CLI args below — Elements Core rejects them in the global
  // section when on the non-default liquidtestnet network)
  await elementsConfFile.merge(effects, {
    chain: 'liquidtestnet',
    validatepegin: false,
    server: true,
    listen: true,
    dbcache,
    maxmempool,
    maxconnections,
    par,
  })

  // create subcontainer mounting own datadir RW (no Bitcoin mainchain needed on testnet)
  const sub = await sdk.SubContainer.of(
    effects,
    { imageId: 'liquidd' },
    elementsMounts,
    'liquidd-sub',
  )

  return sdk.Daemons.of(effects)
    .addDaemon('elementsd', {
      subcontainer: sub,
      exec: {
        // Network-specific options must be on the command line (not in the
        // global config section) for the non-default liquidtestnet network.
        command: [
          'elementsd',
          `-datadir=${rootDir}`,
          `-port=${peerPortInternal}`,
          `-rpcport=${rpcPort}`,
          `-rpcbind=${rpcbind}`,
          `-rpcallowip=${rpcallowip}`,
        ],
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
