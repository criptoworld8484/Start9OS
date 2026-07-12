import { sdk } from './sdk'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('main').setOptions({
    exclude: [
      // liquidtestnet datadir (re-downloadable chain data)
      'liquidtestnet/blocks/',
      'liquidtestnet/chainstate/',
      'liquidtestnet/chainstate.old/',
      'liquidtestnet/indexes/',
      'liquidtestnet/.cookie',
      '**/*-journal',
    ],
  }),
)
