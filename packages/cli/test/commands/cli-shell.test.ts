import { describe, expect, it } from 'vitest'

import { cliPackageName, createCliShell } from '../../src/index.js'

describe('fiber-doctor CLI shell', () => {
  it('exports the CLI package name', () => {
    expect(cliPackageName).toBe('fiber-doctor')
  })

  it('parses shared --json, --fixture, and --rpc-url flags', () => {
    const cli = createCliShell()
    const invocation = cli.parse([
      'can-pay',
      'fiber-fixture:network=testnet;asset=CKB;amount=700;expiresAt=2026-07-04T00:00:00.000Z',
      '--json',
      '--fixture',
      'invoice-missing-amount',
      '--rpc-url',
      'http://127.0.0.1:8227'
    ])

    expect(invocation.command).toBe('can-pay')
    expect(invocation.args).toEqual([
      'fiber-fixture:network=testnet;asset=CKB;amount=700;expiresAt=2026-07-04T00:00:00.000Z'
    ])
    expect(invocation.options).toEqual({
      json: true,
      fixture: 'invoice-missing-amount',
      rpcUrl: 'http://127.0.0.1:8227'
    })
  })

  it('supports commands without optional shared flags', () => {
    const cli = createCliShell()
    const invocation = cli.parse(['node-health'])

    expect(invocation).toEqual({
      command: 'node-health',
      args: [],
      options: {
        json: false,
        fixture: undefined,
        rpcUrl: undefined
      }
    })
  })

  it('rejects unknown commands', () => {
    const cli = createCliShell()

    expect(() => cli.parse(['unknown-command'])).toThrow(
      'Unknown fiber-doctor command: unknown-command'
    )
  })

  it('rejects shared flags that are missing a value', () => {
    const cli = createCliShell()

    expect(() => cli.parse(['can-pay', '--fixture'])).toThrow(
      'Missing value for --fixture'
    )
    expect(() => cli.parse(['can-pay', '--rpc-url'])).toThrow(
      'Missing value for --rpc-url'
    )
  })
})
