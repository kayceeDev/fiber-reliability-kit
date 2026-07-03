import { describe, expect, it } from 'vitest'

import { executeCliCommand } from '../../src/index.js'

describe('fiber-doctor remaining command execution', () => {
  it('renders explain-payment as JSON when requested', async () => {
    const output = await executeCliCommand([
      'explain-payment',
      '0xretry',
      '--json'
    ])

    const parsed = JSON.parse(output)

    expect(parsed.command).toBe('explain-payment')
    expect(parsed.paymentHash).toBe('0xretry')
    expect(parsed.failureKind).toBe('retryable')
  })

  it('renders explain-payment as human-readable text by default', async () => {
    const output = await executeCliCommand(['explain-payment', '0xterminal'])

    expect(output).toContain('fiber-doctor explain-payment')
    expect(output).toContain('terminal')
  })

  it('renders cch as JSON when requested', async () => {
    const output = await executeCliCommand(['cch', '0xstuck', '--json'])

    const parsed = JSON.parse(output)

    expect(parsed.command).toBe('cch')
    expect(parsed.paymentHash).toBe('0xstuck')
    expect(parsed.diagnostics).toContain('CCH_ORDER_STUCK')
  })

  it('renders cch as human-readable text by default', async () => {
    const output = await executeCliCommand(['cch', '0xhealthy'])

    expect(output).toContain('fiber-doctor cch')
    expect(output).toContain('healthy')
  })

  it('renders liquidity as JSON when requested', async () => {
    const output = await executeCliCommand(['liquidity', '--json', '--fixture', 'manual-peer-missing'])

    const parsed = JSON.parse(output)

    expect(parsed.command).toBe('liquidity')
    expect(parsed.fixtureId).toBe('manual-peer-missing')
    expect(parsed.assetId).toBe('CKB')
  })

  it('renders liquidity as human-readable text by default', async () => {
    const output = await executeCliCommand(['liquidity', '--fixture', 'manual-peer-missing'])

    expect(output).toContain('fiber-doctor liquidity')
    expect(output).toContain('manual-peer-missing')
    expect(output).toContain('CKB')
  })

  it('rejects explain-payment and cch invocations that omit the payment hash', async () => {
    await expect(executeCliCommand(['explain-payment'])).rejects.toThrow(
      'explain-payment requires a payment hash argument'
    )

    await expect(executeCliCommand(['cch'])).rejects.toThrow(
      'cch requires a payment hash argument'
    )
  })
})
