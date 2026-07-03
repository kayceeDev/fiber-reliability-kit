import { createDiagnostic } from '../diagnostics/taxonomy.js'
import type {
  BuildPaymentTimelineInput,
  PaymentFailureKind,
  PaymentTimeline,
  PaymentTimelineEvent,
  PaymentTimelineStatus
} from './types.js'

function buildEvents(input: BuildPaymentTimelineInput): PaymentTimelineEvent[] {
  const events: PaymentTimelineEvent[] = []
  const firstAttempt = input.attempts[0]

  if (!firstAttempt) {
    return events
  }

  events.push({
    kind: 'PAYMENT_STARTED',
    atIso: firstAttempt.startedAtIso
  })

  for (const attempt of input.attempts) {
    events.push({
      kind: 'ATTEMPT_STARTED',
      attemptId: attempt.id,
      atIso: attempt.startedAtIso
    })

    if (attempt.status === 'SUCCEEDED' && attempt.finishedAtIso) {
      events.push({
        kind: 'ATTEMPT_SUCCEEDED',
        attemptId: attempt.id,
        atIso: attempt.finishedAtIso
      })
      continue
    }

    if (attempt.status === 'FAILED_RETRYABLE' && attempt.finishedAtIso) {
      events.push({
        kind: 'ATTEMPT_FAILED_RETRYABLE',
        attemptId: attempt.id,
        atIso: attempt.finishedAtIso
      })
      continue
    }

    if (attempt.status === 'FAILED_TERMINAL' && attempt.finishedAtIso) {
      events.push({
        kind: 'ATTEMPT_FAILED_TERMINAL',
        attemptId: attempt.id,
        atIso: attempt.finishedAtIso
      })
    }
  }

  return events
}

function classifyTimeline(input: BuildPaymentTimelineInput): {
  diagnostics: PaymentTimeline['diagnostics']
  failureKind: PaymentFailureKind
  status: PaymentTimelineStatus
} {
  const latestAttempt = input.attempts[input.attempts.length - 1]

  if (!latestAttempt) {
    return {
      status: 'FAILED',
      failureKind: 'terminal',
      diagnostics: [createDiagnostic('PAYMENT_TERMINAL_FAILURE')]
    }
  }

  if (latestAttempt.status === 'SUCCEEDED') {
    return {
      status: 'SUCCEEDED',
      failureKind: null,
      diagnostics: []
    }
  }

  if (latestAttempt.status === 'FAILED_RETRYABLE') {
    return {
      status: 'FAILED',
      failureKind: 'retryable',
      diagnostics: [createDiagnostic('PAYMENT_RETRYABLE_FAILURE')]
    }
  }

  if (latestAttempt.status === 'FAILED_TERMINAL') {
    return {
      status: 'FAILED',
      failureKind: 'terminal',
      diagnostics: [createDiagnostic('PAYMENT_TERMINAL_FAILURE')]
    }
  }

  return {
    status: 'IN_FLIGHT',
    failureKind: 'stuck',
    diagnostics: [createDiagnostic('PAYMENT_STUCK_INFLIGHT')]
  }
}

export function buildPaymentTimeline(input: BuildPaymentTimelineInput): PaymentTimeline {
  const events = buildEvents(input)
  const classification = classifyTimeline(input)

  if (classification.status === 'SUCCEEDED') {
    const latestAttempt = input.attempts[input.attempts.length - 1]

    if (latestAttempt?.finishedAtIso) {
      events.push({
        kind: 'PAYMENT_SUCCEEDED',
        atIso: latestAttempt.finishedAtIso
      })
    }
  }

  if (classification.status === 'FAILED') {
    const latestAttempt = input.attempts[input.attempts.length - 1]

    if (latestAttempt?.finishedAtIso && classification.failureKind === 'terminal') {
      events.push({
        kind: 'PAYMENT_FAILED',
        atIso: latestAttempt.finishedAtIso
      })
    }
  }

  return {
    paymentHash: input.paymentHash,
    paymentFlow: input.paymentFlow,
    status: classification.status,
    failureKind: classification.failureKind,
    attempts: [...input.attempts],
    events,
    diagnostics: classification.diagnostics
  }
}
