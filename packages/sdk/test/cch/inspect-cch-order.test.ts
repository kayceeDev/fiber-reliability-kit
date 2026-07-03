import { describe, expect, it } from 'vitest'

import { inspectCchOrder } from '../../src/index.js'

describe('inspectCchOrder', () => {
  it('classifies an outgoing order stuck in an inflight state', () => {
    const report = inspectCchOrder({
      paymentHash: '0xstuck',
      direction: 'outgoing',
      orderStatus: 'IN_FLIGHT',
      expiryDelta: 120,
      minSafeExpiryDelta: 60,
      feeBudget: '200',
      minSafeFeeBudget: '100'
    })

    expect(report.paymentHash).toBe('0xstuck')
    expect(report.status).toBe('IN_FLIGHT')
    expect(report.summary).toContain('stuck')
    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'CCH_ORDER_STUCK'
    ])
  })

  it('classifies unsafe expiry windows for otherwise healthy orders', () => {
    const report = inspectCchOrder({
      paymentHash: '0xexpiry',
      direction: 'incoming',
      orderStatus: 'PENDING',
      expiryDelta: 20,
      minSafeExpiryDelta: 60,
      feeBudget: '200',
      minSafeFeeBudget: '100'
    })

    expect(report.summary).toContain('expiry')
    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'CCH_EXPIRY_UNSAFE'
    ])
  })

  it('classifies insufficient fee budgets for otherwise healthy orders', () => {
    const report = inspectCchOrder({
      paymentHash: '0xfee',
      direction: 'incoming',
      orderStatus: 'PENDING',
      expiryDelta: 120,
      minSafeExpiryDelta: 60,
      feeBudget: '50',
      minSafeFeeBudget: '100'
    })

    expect(report.summary).toContain('fee budget')
    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'CCH_FEE_BUDGET_UNSAFE'
    ])
  })

  it('orders stuck, expiry, and fee warnings when multiple CCH issues apply', () => {
    const report = inspectCchOrder({
      paymentHash: '0xmulti',
      direction: 'outgoing',
      orderStatus: 'IN_FLIGHT',
      expiryDelta: 20,
      minSafeExpiryDelta: 60,
      feeBudget: '50',
      minSafeFeeBudget: '100'
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'CCH_ORDER_STUCK',
      'CCH_EXPIRY_UNSAFE',
      'CCH_FEE_BUDGET_UNSAFE'
    ])
  })

  it('returns no diagnostics for a healthy pending order', () => {
    const report = inspectCchOrder({
      paymentHash: '0xhealthy',
      direction: 'incoming',
      orderStatus: 'PENDING',
      expiryDelta: 120,
      minSafeExpiryDelta: 60,
      feeBudget: '200',
      minSafeFeeBudget: '100'
    })

    expect(report.diagnostics).toEqual([])
    expect(report.summary).toContain('healthy')
  })
})
