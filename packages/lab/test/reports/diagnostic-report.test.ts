import { describe, expect, it } from 'vitest'

import {
  buildDiagnosticReport,
  type DiagnosticReportViewModel
} from '../../src/index.js'

describe('lab diagnostic report view-model', () => {
  it('builds a diagnostic card list from the invoice-missing-amount fixture', async () => {
    const report = await buildDiagnosticReport('invoice-missing-amount')

    expect(report.scenarioId).toBe('invoice-missing-amount')
    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'INVOICE_AMOUNT_MISSING'
    ])
  })

  it('includes severity, source, summary, and recovery actions from the taxonomy', async () => {
    const report = await buildDiagnosticReport('manual-peer-missing')
    const diagnostic = report.diagnostics[0]

    expect(diagnostic?.severity).toBe('error')
    expect(diagnostic?.source).toBe('peer')
    expect(diagnostic?.summary).toContain('peer')
    expect(diagnostic?.recoveryActions.length).toBeGreaterThan(0)
  })

  it('exposes raw fixture metadata for the selected scenario', async () => {
    const report = await buildDiagnosticReport('manual-peer-missing')

    expect(report.title).toBe('Manual payment target peer missing')
    expect(report.description).toContain('disconnected')
  })

  it('returns a stable view-model shape for rendering layers', async () => {
    const report: DiagnosticReportViewModel = await buildDiagnosticReport(
      'invoice-missing-amount'
    )

    expect(report).toMatchObject({
      scenarioId: 'invoice-missing-amount',
      title: 'Invoice missing amount'
    })
  })

  it('rejects unknown scenarios when building a diagnostic report', async () => {
    await expect(buildDiagnosticReport('unknown-scenario')).rejects.toThrow(
      'Unknown lab scenario: unknown-scenario'
    )
  })
})
