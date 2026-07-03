import {
  diagnosticMetadataByCode,
  loadReliabilityFixture,
  type DiagnosticCode,
  type DiagnosticSeverity,
  type DiagnosticSource,
  type RecoveryAction
} from '@fiber-reliability/sdk'

export type DiagnosticCardViewModel = {
  code: DiagnosticCode
  severity: DiagnosticSeverity
  source: DiagnosticSource
  summary: string
  evidence: readonly []
  recoveryActions: readonly RecoveryAction[]
}

export type DiagnosticReportViewModel = {
  scenarioId: string
  title: string
  description: string
  diagnostics: readonly DiagnosticCardViewModel[]
}

function toDiagnosticCard(code: DiagnosticCode): DiagnosticCardViewModel {
  const metadata = diagnosticMetadataByCode[code]

  return {
    code,
    severity: metadata.severity,
    source: metadata.source,
    summary: metadata.summary,
    evidence: [],
    recoveryActions: metadata.recoveryActions
  }
}

export async function buildDiagnosticReport(
  scenarioId: string
): Promise<DiagnosticReportViewModel> {
  if (scenarioId !== 'invoice-missing-amount' && scenarioId !== 'manual-peer-missing') {
    throw new Error(`Unknown lab scenario: ${scenarioId}`)
  }

  const fixture = await loadReliabilityFixture(
    new URL(`../../../../fixtures/scenarios/${scenarioId}.json`, import.meta.url)
  )

  return {
    scenarioId: fixture.id,
    title: fixture.title,
    description: fixture.description,
    diagnostics: fixture.expected.diagnostics.map(toDiagnosticCard)
  }
}
