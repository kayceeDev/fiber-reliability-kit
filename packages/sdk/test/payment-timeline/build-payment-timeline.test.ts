import { describe, expect, it } from 'vitest'

import { buildPaymentTimeline } from '../../src/index.js'

describe('buildPaymentTimeline', () => {
  it('classifies a succeeded payment attempt timeline', () => {
    const timeline = buildPaymentTimeline({
      paymentHash: '0xsuccess',
      paymentFlow: 'outbound',
      attempts: [
        {
          id: 'attempt-1',
          status: 'SUCCEEDED',
          startedAtIso: '2026-07-03T00:00:00.000Z',
          finishedAtIso: '2026-07-03T00:00:10.000Z'
        }
      ]
    })

    expect(timeline.status).toBe('SUCCEEDED')
    expect(timeline.failureKind).toBeNull()
    expect(timeline.events.map((event) => event.kind)).toEqual([
      'PAYMENT_STARTED',
      'ATTEMPT_STARTED',
      'ATTEMPT_SUCCEEDED',
      'PAYMENT_SUCCEEDED'
    ])
  })

  it('classifies retryable failures when the latest attempt is retryable', () => {
    const timeline = buildPaymentTimeline({
      paymentHash: '0xretry',
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

    expect(timeline.status).toBe('FAILED')
    expect(timeline.failureKind).toBe('retryable')
    expect(timeline.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'PAYMENT_RETRYABLE_FAILURE'
    ])
  })

  it('classifies terminal failures when the latest attempt is terminal', () => {
    const timeline = buildPaymentTimeline({
      paymentHash: '0xterminal',
      paymentFlow: 'outbound',
      attempts: [
        {
          id: 'attempt-1',
          status: 'FAILED_TERMINAL',
          startedAtIso: '2026-07-03T00:00:00.000Z',
          finishedAtIso: '2026-07-03T00:00:05.000Z',
          failureReason: 'Invoice rejected'
        }
      ]
    })

    expect(timeline.status).toBe('FAILED')
    expect(timeline.failureKind).toBe('terminal')
    expect(timeline.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'PAYMENT_TERMINAL_FAILURE'
    ])
  })

  it('classifies inflight payments as stuck when the latest attempt remains pending', () => {
    const timeline = buildPaymentTimeline({
      paymentHash: '0xinflight',
      paymentFlow: 'outbound',
      attempts: [
        {
          id: 'attempt-1',
          status: 'IN_FLIGHT',
          startedAtIso: '2026-07-03T00:00:00.000Z'
        }
      ]
    })

    expect(timeline.status).toBe('IN_FLIGHT')
    expect(timeline.failureKind).toBe('stuck')
    expect(timeline.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'PAYMENT_STUCK_INFLIGHT'
    ])
  })

  it('preserves attempt ordering and emits events for each retry cycle', () => {
    const timeline = buildPaymentTimeline({
      paymentHash: '0xmulti',
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

    expect(timeline.attempts.map((attempt) => attempt.id)).toEqual(['attempt-1', 'attempt-2'])
    expect(timeline.events.map((event) => event.kind)).toEqual([
      'PAYMENT_STARTED',
      'ATTEMPT_STARTED',
      'ATTEMPT_FAILED_RETRYABLE',
      'ATTEMPT_STARTED',
      'ATTEMPT_SUCCEEDED',
      'PAYMENT_SUCCEEDED'
    ])
    expect(timeline.diagnostics).toEqual([])
  })
})
