import {
  diagnosticMetadataByCode,
  executeFixtureCchInspection,
  executeFixturePaymentExplanation,
  executeFixtureReadiness,
  loadReliabilityFixture,
  type DiagnosticCode,
  type DiagnosticSeverity,
  type DiagnosticSource,
  type RecoveryAction,
  type ReliabilityFixture
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

function computeDiagnosticCodes(fixture: ReliabilityFixture): readonly DiagnosticCode[] {
  if (fixture.context?.readiness) {
    return executeFixtureReadiness(fixture).diagnostics.map((diagnostic) => diagnostic.code)
  }

  if (fixture.context?.paymentTimeline) {
    return executeFixturePaymentExplanation(fixture).diagnostics.map(
      (diagnostic) => diagnostic.code
    )
  }

  if (fixture.context?.cch) {
    return executeFixtureCchInspection(fixture).diagnostics.map((diagnostic) => diagnostic.code)
  }

  return fixture.expected.diagnostics
}

export async function buildDiagnosticReport(
  scenarioId: string
): Promise<DiagnosticReportViewModel> {
  let fixture: ReliabilityFixture

  try {
    fixture = await loadReliabilityFixture(
      new URL(`../../../../fixtures/scenarios/${scenarioId}.json`, import.meta.url)
    )
  } catch {
    throw new Error(`Unknown lab scenario: ${scenarioId}`)
  }

  return {
    scenarioId: fixture.id,
    title: fixture.title,
    description: fixture.description,
    diagnostics: computeDiagnosticCodes(fixture).map(toDiagnosticCard)
  }
}
