import { describe, expect, it } from 'vitest'

import { explainPayment } from '../../src/index.js'

describe('explainPayment', () => {
  it('returns a succeeded public report when the timeline succeeds', () => {
    const report = explainPayment({
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

    expect(report.paymentHash).toBe('0xsuccess')
    expect(report.summary).toContain('succeeded')
    expect(report.timeline.status).toBe('SUCCEEDED')
    expect(report.diagnostics).toEqual([])
  })

  it('surfaces retryable failure diagnostics through the public boundary', () => {
    const report = explainPayment({
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

    expect(report.summary).toContain('retryable')
    expect(report.failureKind).toBe('retryable')
    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'PAYMENT_RETRYABLE_FAILURE'
    ])
  })

  it('surfaces terminal failure diagnostics through the public boundary', () => {
    const report = explainPayment({
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

    expect(report.summary).toContain('terminal')
    expect(report.failureKind).toBe('terminal')
    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'PAYMENT_TERMINAL_FAILURE'
    ])
  })

  it('surfaces stuck inflight diagnostics through the public boundary', () => {
    const report = explainPayment({
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

    expect(report.summary).toContain('inflight')
    expect(report.failureKind).toBe('stuck')
    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'PAYMENT_STUCK_INFLIGHT'
    ])
  })

  it('preserves the underlying timeline events in the explanation report', () => {
    const report = explainPayment({
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

    expect(report.timeline.events.map((event) => event.kind)).toEqual([
      'PAYMENT_STARTED',
      'ATTEMPT_STARTED',
      'ATTEMPT_FAILED_RETRYABLE',
      'ATTEMPT_STARTED',
      'ATTEMPT_SUCCEEDED',
      'PAYMENT_SUCCEEDED'
    ])
    expect(report.summary).toContain('succeeded')
  })
})
