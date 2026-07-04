import { createLocalRpcModeConfig } from '../config/local-rpc-mode.js'
import {
  buildPaymentExplanationViewModel,
  buildRouteLiquidityViewModel
} from '../explanations/explanation-view-models.js'
import { buildDiagnosticReport } from '../reports/diagnostic-report.js'
import { createScenarioPickerState, selectScenario } from '../scenarios/scenario-picker.js'

export type RenderReliabilityLabAppInput = {
  scenarioId: string
  paymentHash?: string
}

function renderScenarioOptions(selectedScenarioId: string, scenarioIds: readonly string[]): string {
  return scenarioIds
    .map((scenarioId) =>
      scenarioId === selectedScenarioId ? `* ${scenarioId}` : `- ${scenarioId}`
    )
    .join('\n')
}

function renderDiagnosticsSection(report: Awaited<ReturnType<typeof buildDiagnosticReport>>): string {
  const cards = report.diagnostics
    .map(
      (diagnostic) =>
        [
          `- ${diagnostic.code} [${diagnostic.severity}]`,
          `  Summary: ${diagnostic.summary}`,
          `  Evidence: ${diagnostic.evidence.length === 0 ? 'No concrete evidence attached yet' : diagnostic.evidence.join(', ')}`,
          `  Recovery actions: ${diagnostic.recoveryActions.map((action) => action.label).join(', ')}`
        ].join('\n')
    )
    .join('\n')

  return [
    'Diagnostic report',
    `Scenario: ${report.scenarioId}`,
    cards || 'No diagnostics'
  ].join('\n')
}

export async function renderReliabilityLabApp(
  input: RenderReliabilityLabAppInput
): Promise<string> {
  const pickerState = await createScenarioPickerState()
  const selectedState = selectScenario(pickerState, input.scenarioId)
  const diagnosticReport = await buildDiagnosticReport(input.scenarioId)
  const rpcMode = createLocalRpcModeConfig({})

  const sections = [
    'Fiber Reliability Lab',
    ['Scenario picker', `Selected scenario: ${selectedState.selectedScenarioId}`, renderScenarioOptions(
      selectedState.selectedScenarioId,
      selectedState.scenarios.map((scenario) => scenario.id)
    )].join('\n'),
    renderDiagnosticsSection(diagnosticReport),
    ['Data mode', `Mode label: ${rpcMode.label}`, 'Local RPC status: disabled by default for hosted fixture-first flows'].join('\n')
  ]

  if (input.paymentHash) {
    const paymentExplanation = buildPaymentExplanationViewModel(input.paymentHash)

    sections.push(
      [
        'Payment explanation',
        `Summary: ${paymentExplanation.summary}`,
        `Failure kind: ${paymentExplanation.failureKind ?? 'none'}`,
        `Timeline events: ${paymentExplanation.eventKinds.join(', ')}`
      ].join('\n')
    )
  }

  try {
    const routeLiquidity = await buildRouteLiquidityViewModel(input.scenarioId)

    sections.push(
      [
        'Route and liquidity',
        `assetId: ${routeLiquidity.assetId}`,
        `Diagnostic codes: ${routeLiquidity.diagnosticCodes.join(', ') || 'none'}`
      ].join('\n')
    )
  } catch {
    // Not every scenario has a route/liquidity panel.
  }

  return sections.join('\n\n')
}
