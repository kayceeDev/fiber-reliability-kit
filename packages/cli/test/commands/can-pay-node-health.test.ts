import { describe, expect, it } from 'vitest'

import { executeCliCommand } from '../../src/index.js'

describe('fiber-doctor command execution', () => {
  it('renders can-pay fixture output as JSON when requested', async () => {
    const output = await executeCliCommand([
      'can-pay',
      'fiber-fixture:network=testnet;asset=CKB;amount=700;expiresAt=2026-07-04T00:00:00.000Z',
      '--json',
      '--fixture',
      'invoice-missing-amount'
    ])

    const parsed = JSON.parse(output)

    expect(parsed.command).toBe('can-pay')
    expect(parsed.fixtureId).toBe('invoice-missing-amount')
    expect(parsed.diagnostics).toEqual(['INVOICE_AMOUNT_MISSING'])
  })

  it('renders can-pay fixture output as human-readable text by default', async () => {
    const output = await executeCliCommand([
      'can-pay',
      'fiber-fixture:network=testnet;asset=CKB;amount=700;expiresAt=2026-07-04T00:00:00.000Z',
      '--fixture',
      'invoice-missing-amount'
    ])

    expect(output).toContain('fiber-doctor can-pay')
    expect(output).toContain('invoice-missing-amount')
    expect(output).toContain('INVOICE_AMOUNT_MISSING')
  })

  it('renders node-health as JSON with rpc metadata when requested', async () => {
    const output = await executeCliCommand([
      'node-health',
      '--json',
      '--rpc-url',
      'http://127.0.0.1:8227'
    ])

    const parsed = JSON.parse(output)

    expect(parsed.command).toBe('node-health')
    expect(parsed.rpcUrl).toBe('http://127.0.0.1:8227')
    expect(parsed.mode).toBe('rpc')
  })

  it('renders node-health as human-readable text by default', async () => {
    const output = await executeCliCommand(['node-health'])

    expect(output).toContain('fiber-doctor node-health')
    expect(output).toContain('mode: fixtureless')
  })

  it('rejects can-pay invocations that omit the invoice argument', async () => {
    await expect(executeCliCommand(['can-pay'])).rejects.toThrow(
      'can-pay requires an invoice argument'
    )
  })
})
