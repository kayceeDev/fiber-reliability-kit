import { buildPaymentTimeline } from './build-payment-timeline.js'
import type {
  BuildPaymentTimelineInput,
  PaymentFailureKind,
  PaymentTimeline
} from './types.js'

export type PaymentExplanationReport = {
  paymentHash: string
  summary: string
  failureKind: PaymentFailureKind
  timeline: PaymentTimeline
  diagnostics: PaymentTimeline['diagnostics']
}

function summarizeTimeline(timeline: PaymentTimeline): string {
  if (timeline.status === 'SUCCEEDED') {
    return `Payment ${timeline.paymentHash} succeeded.`
  }

  if (timeline.failureKind === 'retryable') {
    return `Payment ${timeline.paymentHash} failed with a retryable condition.`
  }

  if (timeline.failureKind === 'terminal') {
    return `Payment ${timeline.paymentHash} failed with a terminal condition.`
  }

  return `Payment ${timeline.paymentHash} remains inflight and appears stuck.`
}

export function explainPayment(input: BuildPaymentTimelineInput): PaymentExplanationReport {
  const timeline = buildPaymentTimeline(input)

  return {
    paymentHash: input.paymentHash,
    summary: summarizeTimeline(timeline),
    failureKind: timeline.failureKind,
    timeline,
    diagnostics: timeline.diagnostics
  }
}
