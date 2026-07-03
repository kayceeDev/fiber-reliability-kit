import type { DiagnosticItem } from '../diagnostics/types.js'

export type PaymentFlow = 'outbound' | 'inbound'

export type PaymentAttemptStatus = 'SUCCEEDED' | 'FAILED_RETRYABLE' | 'FAILED_TERMINAL' | 'IN_FLIGHT'

export type PaymentTimelineStatus = 'SUCCEEDED' | 'FAILED' | 'IN_FLIGHT'

export type PaymentFailureKind = 'retryable' | 'terminal' | 'stuck' | null

export type PaymentAttempt = {
  id: string
  status: PaymentAttemptStatus
  startedAtIso: string
  finishedAtIso?: string
  failureReason?: string
}

export type PaymentTimelineEventKind =
  | 'PAYMENT_STARTED'
  | 'ATTEMPT_STARTED'
  | 'ATTEMPT_SUCCEEDED'
  | 'ATTEMPT_FAILED_RETRYABLE'
  | 'ATTEMPT_FAILED_TERMINAL'
  | 'PAYMENT_SUCCEEDED'
  | 'PAYMENT_FAILED'

export type PaymentTimelineEvent = {
  kind: PaymentTimelineEventKind
  attemptId?: string
  atIso: string
}

export type BuildPaymentTimelineInput = {
  paymentHash: string
  paymentFlow: PaymentFlow
  attempts: readonly PaymentAttempt[]
}

export type PaymentTimeline = {
  paymentHash: string
  paymentFlow: PaymentFlow
  status: PaymentTimelineStatus
  failureKind: PaymentFailureKind
  attempts: readonly PaymentAttempt[]
  events: readonly PaymentTimelineEvent[]
  diagnostics: readonly DiagnosticItem[]
}
