export const labPackageName = 'fiber-reliability-lab'

export {
  createScenarioPickerState,
  listFixtureScenarios,
  selectScenario,
  type ScenarioPickerState,
  type ScenarioSummary
} from './scenarios/scenario-picker.js'
export {
  buildDiagnosticReport,
  type DiagnosticCardViewModel,
  type DiagnosticReportViewModel
} from './reports/diagnostic-report.js'
export {
  buildPaymentExplanationViewModel,
  buildRouteLiquidityViewModel,
  type PaymentExplanationViewModel,
  type RouteLiquidityViewModel
} from './explanations/explanation-view-models.js'
export {
  createLocalRpcModeConfig,
  type CreateLocalRpcModeInput,
  type LocalRpcModeConfig
} from './config/local-rpc-mode.js'
export {
  renderReliabilityLabApp,
  type RenderReliabilityLabAppInput
} from './app/render-lab-app.js'
export { renderReliabilityLabDocument } from './app/render-lab-document.js'
