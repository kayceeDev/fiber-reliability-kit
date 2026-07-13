import {
  createDiagnostic,
  executeFixtureCchInspection,
  executeFixturePaymentExplanation,
  executeFixtureReadiness,
  diagnosticMetadataByCode,
  type DiagnosticCode,
  type DiagnosticEvidence,
  type DiagnosticItem,
  type DiagnosticSeverity,
  type DiagnosticSource,
  type RecoveryAction,
  type ReliabilityFixture
} from '@nwobodoleonard/fiber-reliability-sdk'

import { getBrowserScenarioFixture } from '../data/scenario-fixtures.js'

export type DiagnosticCardViewModel = {
  code: DiagnosticCode
  severity: DiagnosticSeverity
  source: DiagnosticSource
  summary: string
  evidence: readonly string[]
  recoveryActions: readonly RecoveryAction[]
}

export type DiagnosticReportViewModel = {
  scenarioId: string
  title: string
  description: string
  diagnostics: readonly DiagnosticCardViewModel[]
}

function formatEvidence(evidence: readonly DiagnosticEvidence[]): string[] {
  return evidence.map((item) => `${item.label}: ${String(item.value)}`)
}

function toDiagnosticCard(diagnostic: DiagnosticItem): DiagnosticCardViewModel {
  const metadata = diagnosticMetadataByCode[diagnostic.code]

  return {
    code: diagnostic.code,
    severity: diagnostic.severity,
    source: diagnostic.source,
    summary: diagnostic.summary || metadata.summary,
    evidence: formatEvidence(diagnostic.evidence),
    recoveryActions: diagnostic.recoveryActions
  }
}

function computeDiagnostics(fixture: ReliabilityFixture): readonly DiagnosticItem[] {
  if (fixture.context?.readiness) {
    return executeFixtureReadiness(fixture).diagnostics
  }

  if (fixture.context?.paymentTimeline) {
    return executeFixturePaymentExplanation(fixture).diagnostics
  }

  if (fixture.context?.cch) {
    return executeFixtureCchInspection(fixture).diagnostics
  }

  return fixture.expected.diagnostics.map((code) => createDiagnostic(code))
}

export async function buildDiagnosticReport(
  scenarioId: string
): Promise<DiagnosticReportViewModel> {
  let fixture: ReliabilityFixture

  try {
    fixture = getBrowserScenarioFixture(scenarioId as never)
  } catch {
    throw new Error(`Unknown lab scenario: ${scenarioId}`)
  }

  return {
    scenarioId: fixture.id,
    title: fixture.title,
    description: fixture.description,
    diagnostics: computeDiagnostics(fixture).map(toDiagnosticCard)
  }
}
