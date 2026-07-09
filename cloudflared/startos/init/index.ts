import { sdk } from '../sdk'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { seedStore } from './seedStore'
import { setupTasks } from './setupTasks'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedStore,
  setInterfaces,
  actions,
  setupTasks,
)

export const uninit = sdk.setupUninit(versionGraph)
