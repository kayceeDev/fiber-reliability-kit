import {
  executeFixturePaymentExplanation,
  executeFixtureReadiness,
  explainPayment,
  type DiagnosticCode,
  type PaymentFailureKind,
  type PaymentTimelineEventKind
} from '@fiber-reliability/sdk'

import { getBrowserScenarioFixture } from '../data/scenario-fixtures.js'

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
  const fixtureId =
    paymentHash === '0xretry'
      ? 'payment-retryable-failure'
      : paymentHash === '0xmulti'
        ? 'payment-succeeded-after-retry'
        : undefined

  if (fixtureId) {
    const report = executeFixturePaymentExplanation(getBrowserScenarioFixture(fixtureId))

    return {
      paymentHash,
      summary: report.summary,
      failureKind: report.failureKind,
      eventKinds: report.timeline.events.map((event) => event.kind)
    }
  }

  const report = explainPayment({
    paymentHash,
    paymentFlow: 'outbound',
    attempts: [
      {
        id: 'attempt-1',
        status: 'FAILED_TERMINAL',
        startedAtIso: '2026-07-04T00:00:00.000Z',
        finishedAtIso: '2026-07-04T00:00:05.000Z',
        failureReason: 'Invoice rejected'
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
  let fixture

  try {
    fixture = getBrowserScenarioFixture(scenarioId as never)
  } catch {
    throw new Error(`Route/liquidity view is unavailable for scenario: ${scenarioId}`)
  }

  if (!fixture.context?.readiness) {
    throw new Error(`Route/liquidity view is unavailable for scenario: ${scenarioId}`)
  }

  const channel = fixture.context.readiness.channels[0]

  if (!channel) {
    throw new Error(`Route/liquidity view is unavailable for scenario: ${scenarioId}`)
  }

  return {
    scenarioId: fixture.id,
    assetId: channel.assetId,
    diagnosticCodes: executeFixtureReadiness(fixture).diagnostics.map(
      (diagnostic) => diagnostic.code
    )
  }
}
