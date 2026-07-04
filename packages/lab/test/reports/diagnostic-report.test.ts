import { describe, expect, it } from 'vitest'

import {
  buildDiagnosticReport,
  type DiagnosticReportViewModel
} from '../../src/index.js'

describe('lab diagnostic report view-model', () => {
  it('builds a diagnostic card list from a readiness fixture using computed diagnostics', async () => {
    const report = await buildDiagnosticReport('graph-not-synced')

    expect(report.scenarioId).toBe('graph-not-synced')
    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'GRAPH_NOT_SYNCED'
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
      'graph-not-synced'
    )

    expect(report).toMatchObject({
      scenarioId: 'graph-not-synced',
      title: 'Graph not synced'
    })
  })

  it('rejects unknown scenarios when building a diagnostic report', async () => {
    await expect(buildDiagnosticReport('unknown-scenario')).rejects.toThrow(
      'Unknown lab scenario: unknown-scenario'
    )
  })
})
