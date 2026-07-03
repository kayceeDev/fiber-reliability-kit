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

  it('builds a route/liquidity view-model from the manual peer fixture', async () => {
    const viewModel = await buildRouteLiquidityViewModel('manual-peer-missing')

    expect(viewModel.scenarioId).toBe('manual-peer-missing')
    expect(viewModel.assetId).toBe('CKB')
    expect(viewModel.diagnosticCodes).toEqual(['PEER_NOT_CONNECTED'])
  })

  it('exposes a stable route/liquidity shape for rendering', async () => {
    const viewModel: RouteLiquidityViewModel = await buildRouteLiquidityViewModel(
      'manual-peer-missing'
    )

    expect(viewModel).toMatchObject({
      scenarioId: 'manual-peer-missing',
      assetId: 'CKB'
    })
  })

  it('rejects unsupported scenarios for the route/liquidity view-model', async () => {
    await expect(buildRouteLiquidityViewModel('invoice-missing-amount')).rejects.toThrow(
      'Route/liquidity view is unavailable for scenario: invoice-missing-amount'
    )
  })
})
