import { describe, expect, it } from 'vitest'

import { executeCliCommand } from '../../src/index.js'

describe('fiber-doctor remaining command execution', () => {
  it('renders explain-payment as computed JSON when requested', async () => {
    const output = await executeCliCommand(['explain-payment', '0xretry', '--json'])

    const parsed = JSON.parse(output)

    expect(parsed.command).toBe('explain-payment')
    expect(parsed.paymentHash).toBe('0xretry')
    expect(parsed.failureKind).toBe('retryable')
    expect(parsed.diagnostics).toEqual(['PAYMENT_RETRYABLE_FAILURE'])
  })

  it('renders explain-payment as human-readable text by default', async () => {
    const output = await executeCliCommand(['explain-payment', '0xmulti'])

    expect(output).toContain('fiber-doctor explain-payment')
    expect(output).toContain('succeeded')
  })

  it('renders cch as computed JSON when requested', async () => {
    const output = await executeCliCommand([
      'cch',
      '0xstuck',
      '--json',
      '--fixture',
      'cch-order-stuck'
    ])

    const parsed = JSON.parse(output)

    expect(parsed.command).toBe('cch')
    expect(parsed.paymentHash).toBe('0xstuck')
    expect(parsed.fixtureId).toBe('cch-order-stuck')
    expect(parsed.summary).toContain('stuck')
    expect(parsed.diagnostics).toContain('CCH_ORDER_STUCK')
  })

  it('renders cch as human-readable text by default', async () => {
    const output = await executeCliCommand([
      'cch',
      '0xfee',
      '--fixture',
      'cch-fee-budget-unsafe'
    ])

    expect(output).toContain('fiber-doctor cch')
    expect(output).toContain('unsafe fee budget')
    expect(output).toContain('CCH_FEE_BUDGET_UNSAFE')
  })

  it('renders liquidity as computed JSON when requested', async () => {
    const output = await executeCliCommand([
      'liquidity',
      '--json',
      '--fixture',
      'insufficient-outbound-liquidity'
    ])

    const parsed = JSON.parse(output)

    expect(parsed.command).toBe('liquidity')
    expect(parsed.fixtureId).toBe('insufficient-outbound-liquidity')
    expect(parsed.assetId).toBe('CKB')
    expect(parsed.diagnostics).toEqual(['INSUFFICIENT_OUTBOUND_LIQUIDITY'])
    expect(parsed.localBalance).toBe('600')
  })

  it('renders liquidity as human-readable text by default', async () => {
    const output = await executeCliCommand([
      'liquidity',
      '--fixture',
      'insufficient-outbound-liquidity'
    ])

    expect(output).toContain('fiber-doctor liquidity')
    expect(output).toContain('insufficient-outbound-liquidity')
    expect(output).toContain('CKB')
    expect(output).toContain('INSUFFICIENT_OUTBOUND_LIQUIDITY')
    expect(output).toContain('localBalance: 600')
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
