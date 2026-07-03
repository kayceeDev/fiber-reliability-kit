import { describe, expect, it } from 'vitest'

import {
  createLocalRpcModeConfig,
  type LocalRpcModeConfig
} from '../../src/index.js'

describe('lab local RPC mode boundary', () => {
  it('disables local RPC mode by default for hosted and fixture-first flows', () => {
    const config = createLocalRpcModeConfig({})

    expect(config).toEqual({
      enabled: false,
      rpcUrl: null,
      mode: 'fixture-only',
      label: 'Mocked fixture data only'
    })
  })

  it('enables local RPC mode only when explicitly requested with an rpcUrl', () => {
    const config: LocalRpcModeConfig = createLocalRpcModeConfig({
      enableLocalRpc: true,
      rpcUrl: 'http://127.0.0.1:8227'
    })

    expect(config.enabled).toBe(true)
    expect(config.mode).toBe('local-rpc')
    expect(config.rpcUrl).toBe('http://127.0.0.1:8227')
  })

  it('rejects enabling local RPC mode without an rpcUrl', () => {
    expect(() => createLocalRpcModeConfig({ enableLocalRpc: true })).toThrow(
      'Local RPC mode requires an rpcUrl.'
    )
  })

  it('rejects non-local rpc URLs for the lab safety boundary', () => {
    expect(() =>
      createLocalRpcModeConfig({
        enableLocalRpc: true,
        rpcUrl: 'https://public.example.com/fiber'
      })
    ).toThrow('Local RPC mode only supports localhost or 127.0.0.1 URLs.')
  })

  it('keeps fixture-only mode when an rpcUrl is present but local RPC was not enabled', () => {
    const config = createLocalRpcModeConfig({
      rpcUrl: 'http://127.0.0.1:8227'
    })

    expect(config.enabled).toBe(false)
    expect(config.mode).toBe('fixture-only')
  })
})
