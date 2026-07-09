import { sdk } from './sdk'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const metricsMulti = sdk.MultiHost.of(effects, 'metrics')
  const metricsOrigin = await metricsMulti.bindPort(20241, {
    protocol: 'http',
  })

  const metrics = sdk.createInterface(effects, {
    name: 'Metrics',
    id: 'metrics',
    description: 'Internal cloudflared metrics / readiness endpoint',
    type: 'api',
    schemeOverride: null,
    masked: false,
    username: null,
    path: '',
    query: {},
  })

  const metricsReceipt = await metricsOrigin.export([metrics])

  return [metricsReceipt]
})
