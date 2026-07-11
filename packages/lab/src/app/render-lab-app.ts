import type { DiagnosticSeverity } from '@fiber-reliability/sdk'

import { createLocalRpcModeConfig } from '../config/local-rpc-mode.js'
import {
  buildPaymentExplanationViewModel,
  buildRouteLiquidityViewModel
} from '../explanations/explanation-view-models.js'
import { buildDiagnosticReport, type DiagnosticReportViewModel } from '../reports/diagnostic-report.js'
import { createScenarioPickerState, selectScenario } from '../scenarios/scenario-picker.js'

export type RenderReliabilityLabAppInput = {
  scenarioId: string
  paymentHash?: string
}

type ScenarioListItem = {
  id: string
  title: string
  description: string
}

const severityRank: Record<DiagnosticSeverity, number> = {
  informational: 0,
  warning: 1,
  error: 2,
  critical: 3
}

const severityLabels: Record<DiagnosticSeverity, string> = {
  informational: 'Info',
  warning: 'Warning',
  error: 'Error',
  critical: 'Critical'
}

const severityClasses: Record<DiagnosticSeverity, string> = {
  informational: 'bg-cyan-100 text-cyan-800 ring-cyan-200',
  warning: 'bg-amber-100 text-amber-800 ring-amber-200',
  error: 'bg-rose-100 text-rose-800 ring-rose-200',
  critical: 'bg-red-100 text-red-800 ring-red-200'
}

const severityAccentClasses: Record<DiagnosticSeverity, string> = {
  informational: 'border-cyan-200 bg-cyan-50/70',
  warning: 'border-amber-200 bg-amber-50/70',
  error: 'border-rose-200 bg-rose-50/70',
  critical: 'border-red-200 bg-red-50/70'
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function getHighestSeverity(report: DiagnosticReportViewModel): DiagnosticSeverity | 'healthy' {
  if (report.diagnostics.length === 0) {
    return 'healthy'
  }

  return report.diagnostics.reduce<DiagnosticSeverity>(
    (highest, diagnostic) =>
      severityRank[diagnostic.severity] > severityRank[highest] ? diagnostic.severity : highest,
    'informational'
  )
}

function renderSeverityBadge(severity: DiagnosticSeverity): string {
  return [
    `<span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${severityClasses[severity]}">`,
    escapeHtml(severityLabels[severity]),
    '</span>'
  ].join('')
}

function renderScenarioCard(
  scenario: ScenarioListItem,
  selectedScenarioId: string
): string {
  const isSelected = scenario.id === selectedScenarioId
  const selectedClasses = isSelected
    ? 'border-emerald-300 bg-emerald-50 shadow-sm'
    : 'border-slate-200 bg-white/80 hover:border-cyan-300 hover:bg-cyan-50/60'

  return [
    `<button type="button" data-scenario-id="${escapeHtml(scenario.id)}" aria-current="${isSelected ? 'true' : 'false'}" class="w-full rounded-2xl border p-4 text-left transition ${selectedClasses}">`,
    '<span class="block text-sm font-semibold text-slate-950">',
    escapeHtml(scenario.title),
    '</span>',
    '<span class="mt-1 block text-xs leading-5 text-slate-600">',
    escapeHtml(scenario.description),
    '</span>',
    '</button>'
  ].join('')
}

function renderScenarioRail(
  scenarios: readonly ScenarioListItem[],
  selectedScenarioId: string
): string {
  return [
    '<aside data-testid="scenario-rail" class="hidden rounded-3xl border border-white/70 bg-white/80 p-4 shadow-xl shadow-slate-200/60 backdrop-blur lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-auto">',
    '<div class="mb-4">',
    '<p class="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">Scenario library</p>',
    '<h2 class="mt-2 text-xl font-bold text-slate-950">Choose a failure story</h2>',
    '<p class="mt-2 text-sm leading-6 text-slate-600">Each fixture is a reproducible Fiber payment or CCH condition.</p>',
    '</div>',
    '<div class="grid gap-3">',
    scenarios.map((scenario) => renderScenarioCard(scenario, selectedScenarioId)).join('\n'),
    '</div>',
    '</aside>'
  ].join('\n')
}

function renderDataModeBanner(): string {
  const rpcMode = createLocalRpcModeConfig({})

  return [
    '<section data-testid="data-mode-banner" class="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">',
    '<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">',
    '<div>',
    '<p class="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Data mode</p>',
    `<p class="mt-1 text-lg font-semibold text-emerald-950">${escapeHtml(rpcMode.label)}</p>`,
    '<p class="mt-1 text-sm text-emerald-800">Local RPC disabled by default for hosted fixture-first flows.</p>',
    '</div>',
    '<span class="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">Hosted demo safe</span>',
    '</div>',
    '</section>'
  ].join('\n')
}

function renderDiagnostics(report: DiagnosticReportViewModel): string {
  if (report.diagnostics.length === 0) {
    return [
      '<section class="rounded-3xl border border-emerald-200 bg-white p-6 shadow-xl shadow-slate-200/60">',
      '<p class="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Diagnostic report</p>',
      '<h2 class="mt-2 text-2xl font-bold text-slate-950">No blocking diagnostics</h2>',
      '<p class="mt-3 text-sm text-slate-600">This fixture does not report warnings or errors.</p>',
      '</section>'
    ].join('\n')
  }

  const cards = report.diagnostics
    .map((diagnostic) => {
      const evidence = diagnostic.evidence.length
        ? diagnostic.evidence
            .map(
              (item) =>
                `<li class="rounded-xl bg-white/80 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">${escapeHtml(item)}</li>`
            )
            .join('\n')
        : '<li class="rounded-xl bg-white/80 px-3 py-2 text-sm text-slate-500 ring-1 ring-slate-200">No concrete evidence attached yet</li>'

      const recoveryActions = diagnostic.recoveryActions
        .map(
          (action) =>
            `<li class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">${escapeHtml(action.label)}</li>`
        )
        .join('\n')

      return [
        `<article data-testid="diagnostic-card" class="rounded-2xl border p-5 ${severityAccentClasses[diagnostic.severity]}">`,
        '<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">',
        '<div>',
        `<p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">${escapeHtml(diagnostic.source)}</p>`,
        `<h3 class="mt-2 break-words font-mono text-lg font-bold text-slate-950">${escapeHtml(diagnostic.code)}</h3>`,
        '</div>',
        renderSeverityBadge(diagnostic.severity),
        '</div>',
        `<p class="mt-4 text-sm leading-6 text-slate-700">${escapeHtml(diagnostic.summary)}</p>`,
        '<div class="mt-5 grid gap-4 lg:grid-cols-2">',
        '<div>',
        '<h4 class="text-sm font-semibold text-slate-950">Evidence</h4>',
        `<ul class="mt-2 grid gap-2">${evidence}</ul>`,
        '</div>',
        '<div>',
        '<h4 class="text-sm font-semibold text-slate-950">Recovery actions</h4>',
        `<ul class="mt-2 flex flex-wrap gap-2">${recoveryActions}</ul>`,
        '</div>',
        '</div>',
        '</article>'
      ].join('\n')
    })
    .join('\n')

  return [
    '<section class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70">',
    '<div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">',
    '<div>',
    '<p class="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">Diagnostic report</p>',
    '<h2 class="mt-2 text-2xl font-bold text-slate-950">Findings and next actions</h2>',
    '</div>',
    `<span class="text-sm font-medium text-slate-500">${report.diagnostics.length} diagnostic${report.diagnostics.length === 1 ? '' : 's'}</span>`,
    '</div>',
    `<div class="mt-5 grid gap-4">${cards}</div>`,
    '</section>'
  ].join('\n')
}

function renderRouteLiquidityPanel(scenarioId: string): Promise<string> {
  return buildRouteLiquidityViewModel(scenarioId)
    .then((routeLiquidity) =>
      [
        '<section data-testid="route-liquidity-panel" class="rounded-3xl border border-cyan-200 bg-cyan-50 p-6 shadow-sm">',
        '<p class="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">Route and liquidity</p>',
        '<div class="mt-4 grid gap-4 sm:grid-cols-2">',
        '<div class="rounded-2xl bg-white/80 p-4 ring-1 ring-cyan-100">',
        '<p class="text-sm font-medium text-slate-500">Asset</p>',
        `<p class="mt-1 font-mono text-2xl font-bold text-cyan-950">${escapeHtml(routeLiquidity.assetId)}</p>`,
        '</div>',
        '<div class="rounded-2xl bg-white/80 p-4 ring-1 ring-cyan-100">',
        '<p class="text-sm font-medium text-slate-500">Diagnostic codes</p>',
        `<p class="mt-2 text-sm font-semibold text-cyan-900">${routeLiquidity.diagnosticCodes.map(escapeHtml).join(', ') || 'none'}</p>`,
        '</div>',
        '</div>',
        '</section>'
      ].join('\n')
    )
    .catch(() => '')
}

function renderPaymentTimelinePanel(paymentHash: string): string {
  const paymentExplanation = buildPaymentExplanationViewModel(paymentHash)

  return [
    '<section data-testid="payment-timeline-panel" class="rounded-3xl border border-violet-200 bg-violet-50 p-6 shadow-sm">',
    '<p class="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">Payment explanation</p>',
    `<h2 class="mt-2 text-2xl font-bold text-violet-950">${escapeHtml(paymentExplanation.summary)}</h2>`,
    `<p class="mt-2 text-sm text-violet-800">Failure kind: ${escapeHtml(paymentExplanation.failureKind ?? 'none')}</p>`,
    '<div class="mt-4 flex flex-wrap gap-2">',
    paymentExplanation.eventKinds
      .map(
        (kind) =>
          `<span class="rounded-full bg-white px-3 py-1 font-mono text-xs font-semibold text-violet-800 ring-1 ring-violet-200">${escapeHtml(kind)}</span>`
      )
      .join('\n'),
    '</div>',
    '<p class="mt-4 text-sm font-semibold text-violet-900">Timeline events</p>',
    '</section>'
  ].join('\n')
}

function renderHero(report: DiagnosticReportViewModel): string {
  const highestSeverity = getHighestSeverity(report)
  const statusLabel =
    highestSeverity === 'healthy' ? 'Healthy fixture' : `${severityLabels[highestSeverity]} scenario`
  const statusClasses =
    highestSeverity === 'healthy'
      ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
      : severityClasses[highestSeverity]

  return [
    '<section class="overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 text-white shadow-2xl shadow-slate-300/60">',
    '<div class="bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.35),transparent_32%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.26),transparent_30%)] p-6 sm:p-8 lg:p-10">',
    '<div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">',
    '<div class="max-w-3xl">',
    '<p class="text-xs font-bold uppercase tracking-[0.26em] text-cyan-200">Fiber Reliability Lab</p>',
    '<h1 class="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">Diagnose Fiber payments before users get stuck.</h1>',
    '<p class="mt-5 max-w-2xl text-base leading-7 text-slate-200">A fixture-first reliability console for payment readiness, route issues, liquidity gaps, and CCH order risk.</p>',
    '</div>',
    `<span class="inline-flex w-fit rounded-full px-4 py-2 text-sm font-bold ring-1 ${statusClasses}">${escapeHtml(statusLabel)}</span>`,
    '</div>',
    '<div class="mt-8 grid gap-3 sm:grid-cols-3">',
    '<div class="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">',
    '<p class="text-sm text-slate-300">Selected scenario</p>',
    `<p class="mt-1 break-words font-semibold text-white">${escapeHtml(report.title)}</p>`,
    '</div>',
    '<div class="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">',
    '<p class="text-sm text-slate-300">Diagnostics</p>',
    `<p class="mt-1 text-2xl font-black text-white">${report.diagnostics.length}</p>`,
    '</div>',
    '<div class="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">',
    '<p class="text-sm text-slate-300">Mode</p>',
    '<p class="mt-1 font-semibold text-emerald-200">Fixture-first</p>',
    '</div>',
    '</div>',
    '</div>',
    '</section>'
  ].join('\n')
}

export async function renderReliabilityLabApp(
  input: RenderReliabilityLabAppInput
): Promise<string> {
  const pickerState = await createScenarioPickerState()
  const selectedState = selectScenario(pickerState, input.scenarioId)
  const diagnosticReport = await buildDiagnosticReport(input.scenarioId)
  const routeLiquidityPanel = await renderRouteLiquidityPanel(input.scenarioId)

  return [
    '<div data-testid="lab-shell" class="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">',
    '<div class="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">',
    renderScenarioRail(selectedState.scenarios, selectedState.selectedScenarioId),
    '<div class="grid gap-6">',
    renderHero(diagnosticReport),
    renderDataModeBanner(),
    '<section class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70">',
    '<p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Selected scenario</p>',
    `<h2 class="mt-2 text-3xl font-bold text-slate-950">${escapeHtml(diagnosticReport.title)}</h2>`,
    `<p class="mt-3 text-base leading-7 text-slate-600">${escapeHtml(diagnosticReport.description)}</p>`,
    `<p class="mt-4 font-mono text-sm text-slate-500">${escapeHtml(diagnosticReport.scenarioId)}</p>`,
    '</section>',
    renderDiagnostics(diagnosticReport),
    routeLiquidityPanel,
    input.paymentHash ? renderPaymentTimelinePanel(input.paymentHash) : '',
    '</div>',
    '</div>',
    '</div>'
  ].join('\n')
}
