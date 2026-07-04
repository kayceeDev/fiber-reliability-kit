import {
  executeFixturePaymentExplanation,
  executeFixtureReadiness,
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
  const fixture =
    paymentHash === '0xretry'
      ? {
          schemaVersion: 1 as const,
          id: 'payment-retryable-failure',
          title: 'Payment retryable failure',
          description: 'The latest payment attempt failed in a retryable way.',
          input: {
            intent: {
              kind: 'invoice' as const,
              invoice: 'fiber-fixture:network=testnet;asset=CKB;amount=700;expiresAt=2026-07-05T00:00:00.000Z'
            }
          },
          context: {
            paymentTimeline: {
              paymentHash,
              paymentFlow: 'outbound' as const,
              attempts: [
                {
                  id: 'attempt-1',
                  status: 'FAILED_RETRYABLE' as const,
                  startedAtIso: '2026-07-04T00:00:00.000Z',
                  finishedAtIso: '2026-07-04T00:00:05.000Z',
                  failureReason: 'Temporary route failure'
                }
              ]
            }
          },
          expected: {
            diagnostics: ['PAYMENT_RETRYABLE_FAILURE' as const]
          }
        }
      : paymentHash === '0xmulti'
        ? {
            schemaVersion: 1 as const,
            id: 'payment-succeeded-after-retry',
            title: 'Payment succeeded after retry',
            description: 'A retryable first attempt is followed by a successful payment completion.',
            input: {
              intent: {
                kind: 'invoice' as const,
                invoice: 'fiber-fixture:network=testnet;asset=CKB;amount=700;expiresAt=2026-07-05T00:00:00.000Z'
              }
            },
            context: {
              paymentTimeline: {
                paymentHash,
                paymentFlow: 'outbound' as const,
                attempts: [
                  {
                    id: 'attempt-1',
                    status: 'FAILED_RETRYABLE' as const,
                    startedAtIso: '2026-07-04T00:00:00.000Z',
                    finishedAtIso: '2026-07-04T00:00:05.000Z',
                    failureReason: 'Path not found'
                  },
                  {
                    id: 'attempt-2',
                    status: 'SUCCEEDED' as const,
                    startedAtIso: '2026-07-04T00:00:06.000Z',
                    finishedAtIso: '2026-07-04T00:00:12.000Z'
                  }
                ]
              }
            },
            expected: {
              diagnostics: [] as const
            }
          }
        : undefined

  if (fixture) {
    const report = executeFixturePaymentExplanation(fixture)

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
    fixture = await loadReliabilityFixture(
      new URL(`../../../../fixtures/scenarios/${scenarioId}.json`, import.meta.url)
    )
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
