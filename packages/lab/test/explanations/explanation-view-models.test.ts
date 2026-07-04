import { describe, expect, it } from 'vitest'

import {
  buildPaymentExplanationViewModel,
  buildRouteLiquidityViewModel,
  type PaymentExplanationViewModel,
  type RouteLiquidityViewModel
} from '../../src/index.js'

describe('lab payment and route explanation view-models', () => {
  it('builds a payment explanation timeline view-model for a retryable payment', () => {
    const viewModel = buildPaymentExplanationViewModel('0xretry')

    expect(viewModel.paymentHash).toBe('0xretry')
    expect(viewModel.failureKind).toBe('retryable')
    expect(viewModel.eventKinds).toEqual([
      'PAYMENT_STARTED',
      'ATTEMPT_STARTED',
      'ATTEMPT_FAILED_RETRYABLE'
    ])
  })

  it('builds a payment explanation view-model for a successful retried payment', () => {
    const viewModel: PaymentExplanationViewModel = buildPaymentExplanationViewModel('0xmulti')

    expect(viewModel.summary).toContain('succeeded')
    expect(viewModel.eventKinds).toEqual([
      'PAYMENT_STARTED',
      'ATTEMPT_STARTED',
      'ATTEMPT_FAILED_RETRYABLE',
      'ATTEMPT_STARTED',
      'ATTEMPT_SUCCEEDED',
      'PAYMENT_SUCCEEDED'
    ])
  })

  it('builds a route/liquidity view-model from a readiness fixture using computed diagnostics', async () => {
    const viewModel = await buildRouteLiquidityViewModel('insufficient-outbound-liquidity')

    expect(viewModel.scenarioId).toBe('insufficient-outbound-liquidity')
    expect(viewModel.assetId).toBe('CKB')
    expect(viewModel.diagnosticCodes).toEqual(['INSUFFICIENT_OUTBOUND_LIQUIDITY'])
  })

  it('exposes a stable route/liquidity shape for rendering', async () => {
    const viewModel: RouteLiquidityViewModel = await buildRouteLiquidityViewModel(
      'insufficient-outbound-liquidity'
    )

    expect(viewModel).toMatchObject({
      scenarioId: 'insufficient-outbound-liquidity',
      assetId: 'CKB'
    })
  })

  it('rejects unsupported scenarios for the route/liquidity view-model', async () => {
    await expect(buildRouteLiquidityViewModel('invoice-missing-amount')).rejects.toThrow(
      'Route/liquidity view is unavailable for scenario: invoice-missing-amount'
    )
  })
})
