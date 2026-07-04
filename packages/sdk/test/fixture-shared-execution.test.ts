import { describe, expect, it } from 'vitest'

import {
  executeFixtureCchInspection,
  executeFixturePaymentExplanation,
  loadReliabilityFixture
} from '../src/index.js'

describe('shared fixture execution helpers', () => {
  it('computes a retryable payment explanation from fixture-backed attempts', async () => {
    const fixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/payment-retryable-failure.json', import.meta.url)
    )

    const report = executeFixturePaymentExplanation(fixture)

    expect(report.failureKind).toBe('retryable')
    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'PAYMENT_RETRYABLE_FAILURE'
    ])
  })

  it('computes a successful retried payment explanation from fixture-backed attempts', async () => {
    const fixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/payment-succeeded-after-retry.json', import.meta.url)
    )

    const report = executeFixturePaymentExplanation(fixture)

    expect(report.summary).toContain('succeeded')
    expect(report.timeline.events.map((event) => event.kind)).toEqual([
      'PAYMENT_STARTED',
      'ATTEMPT_STARTED',
      'ATTEMPT_FAILED_RETRYABLE',
      'ATTEMPT_STARTED',
      'ATTEMPT_SUCCEEDED',
      'PAYMENT_SUCCEEDED'
    ])
  })

  it('rejects fixtures that do not contain payment timeline context', async () => {
    const fixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/happy-payment.json', import.meta.url)
    )

    expect(() => executeFixturePaymentExplanation(fixture)).toThrow(
      'Fixture payment timeline context is required for payment explanation execution.'
    )
  })

  it('computes CCH inspection from fixture-backed CCH context', async () => {
    const fixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/cch-order-stuck.json', import.meta.url)
    )

    const report = executeFixtureCchInspection(fixture)

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'CCH_ORDER_STUCK'
    ])
    expect(report.summary).toContain('stuck')
  })

  it('rejects fixtures that do not contain CCH context', async () => {
    const fixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/graph-not-synced.json', import.meta.url)
    )

    expect(() => executeFixtureCchInspection(fixture)).toThrow(
      'Fixture CCH context is required for CCH inspection execution.'
    )
  })
})
