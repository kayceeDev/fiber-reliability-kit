import {
  explainPayment,
  loadReliabilityFixture,
  type DiagnosticCode,
  type PaymentFailureKind,
  type PaymentTimelineEventKind
} from '@fiber-reliability/sdk'

export type PaymentExplanationViewModel = {
  paymentHash: string
  summary: string
  failureKind: PaymentFailureKind
  eventKinds: readonly PaymentTimelineEventKind[]
}

export type RouteLiquidityViewModel = {
  scenarioId: string
  assetId: string
  diagnosticCodes: readonly DiagnosticCode[]
}

export function buildPaymentExplanationViewModel(
  paymentHash: string
): PaymentExplanationViewModel {
  const report =
    paymentHash === '0xretry'
      ? explainPayment({
          paymentHash,
          paymentFlow: 'outbound',
          attempts: [
            {
              id: 'attempt-1',
              status: 'FAILED_RETRYABLE',
              startedAtIso: '2026-07-03T00:00:00.000Z',
              finishedAtIso: '2026-07-03T00:00:05.000Z',
              failureReason: 'Temporary route failure'
            }
          ]
        })
      : explainPayment({
          paymentHash,
          paymentFlow: 'outbound',
          attempts: [
            {
              id: 'attempt-1',
              status: 'FAILED_RETRYABLE',
              startedAtIso: '2026-07-03T00:00:00.000Z',
              finishedAtIso: '2026-07-03T00:00:05.000Z',
              failureReason: 'Path not found'
            },
            {
              id: 'attempt-2',
              status: 'SUCCEEDED',
              startedAtIso: '2026-07-03T00:00:06.000Z',
              finishedAtIso: '2026-07-03T00:00:12.000Z'
            }
          ]
        })

  return {
    paymentHash,
    summary: report.summary,
    failureKind: report.failureKind,
    eventKinds: report.timeline.events.map((event) => event.kind)
  }
}

export async function buildRouteLiquidityViewModel(
  scenarioId: string
): Promise<RouteLiquidityViewModel> {
  if (scenarioId !== 'manual-peer-missing') {
    throw new Error(`Route/liquidity view is unavailable for scenario: ${scenarioId}`)
  }

  const fixture = await loadReliabilityFixture(
    new URL(`../../../../fixtures/scenarios/${scenarioId}.json`, import.meta.url)
  )

  if (fixture.input.intent.kind !== 'manual') {
    throw new Error(`Route/liquidity view is unavailable for scenario: ${scenarioId}`)
  }

  return {
    scenarioId: fixture.id,
    assetId: fixture.input.intent.assetId,
    diagnosticCodes: fixture.expected.diagnostics
  }
}
