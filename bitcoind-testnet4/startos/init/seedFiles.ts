import {
  archivalMin,
  bitcoinConfFile,
  defaultDbbatchsize,
  defaultDbcache,
  diskUsage,
  minPrune,
} from '../fileModels/bitcoin.conf'
import { i2pdConfFile } from '../fileModels/i2pd.conf'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { i2PSamAddress } from '../utils'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  // install, update, restore AND regular startup: merge() rewrites only when
  // the serialization changed, so a drifted bitcoin.conf (e.g. hand-edited
  // rpcbind) is normalized before the daemons read it.
  await storeJson.merge(effects, {})
  await i2pdConfFile.merge(effects, {})

  if (kind === 'install') {
    await bitcoinConfFile.merge(effects, {
      zmqEnabled: true,
      txindex: true,
      blockfilters: { blockfilterindex: true },
      dbcache: defaultDbcache(),
      dbbatchsize: defaultDbbatchsize(),
      prune: (await diskUsage()).total < archivalMin ? minPrune : 0,
      raw: {
        i2psam: i2PSamAddress,
      },
    })
  } else {
    await bitcoinConfFile.merge(effects, {})
  }
})
