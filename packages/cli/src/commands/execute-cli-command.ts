import {
  explainPayment,
  inspectCchOrder,
  loadReliabilityFixture
} from '@fiber-reliability/sdk'

import { createCliShell } from './cli-shell.js'

type CanPayJsonOutput = {
  command: 'can-pay'
  fixtureId: string | null
  diagnostics: string[]
}

type NodeHealthJsonOutput = {
  command: 'node-health'
  mode: 'rpc' | 'fixtureless'
  rpcUrl: string | null
}

type ExplainPaymentJsonOutput = {
  command: 'explain-payment'
  paymentHash: string
  failureKind: string | null
  diagnostics: string[]
}

type CchJsonOutput = {
  command: 'cch'
  paymentHash: string
  diagnostics: string[]
}

type LiquidityJsonOutput = {
  command: 'liquidity'
  fixtureId: string | null
  assetId: string | null
}

function formatCanPayHuman(output: CanPayJsonOutput): string {
  return [
    'fiber-doctor can-pay',
    `fixture: ${output.fixtureId ?? 'none'}`,
    `diagnostics: ${output.diagnostics.join(', ') || 'none'}`
  ].join('\n')
}

function formatNodeHealthHuman(output: NodeHealthJsonOutput): string {
  return [
    'fiber-doctor node-health',
    `mode: ${output.mode}`,
    `rpcUrl: ${output.rpcUrl ?? 'none'}`
  ].join('\n')
}

function formatExplainPaymentHuman(output: ExplainPaymentJsonOutput): string {
  return [
    'fiber-doctor explain-payment',
    `paymentHash: ${output.paymentHash}`,
    `failureKind: ${output.failureKind ?? 'none'}`,
    `diagnostics: ${output.diagnostics.join(', ') || 'none'}`
  ].join('\n')
}

function formatCchHuman(output: CchJsonOutput): string {
  return [
    'fiber-doctor cch',
    `paymentHash: ${output.paymentHash}`,
    `diagnostics: ${output.diagnostics.join(', ') || 'none'}`
  ].join('\n')
}

function formatLiquidityHuman(output: LiquidityJsonOutput): string {
  return [
    'fiber-doctor liquidity',
    `fixture: ${output.fixtureId ?? 'none'}`,
    `assetId: ${output.assetId ?? 'none'}`
  ].join('\n')
}

async function executeCanPay(
  args: string[],
  options: { json: boolean; fixture: string | undefined }
): Promise<string> {
  const [invoice] = args

  if (!invoice) {
    throw new Error('can-pay requires an invoice argument')
  }

  let diagnostics: string[] = []
  let fixtureId: string | null = null

  if (options.fixture) {
    const fixture = await loadReliabilityFixture(
      new URL(`../../../../fixtures/scenarios/${options.fixture}.json`, import.meta.url)
    )

    diagnostics = [...fixture.expected.diagnostics]
    fixtureId = fixture.id
  }

  const output: CanPayJsonOutput = {
    command: 'can-pay',
    fixtureId,
    diagnostics
  }

  return options.json ? JSON.stringify(output) : formatCanPayHuman(output)
}

function executeNodeHealth(options: { json: boolean; rpcUrl: string | undefined }): string {
  const output: NodeHealthJsonOutput = {
    command: 'node-health',
    mode: options.rpcUrl ? 'rpc' : 'fixtureless',
    rpcUrl: options.rpcUrl ?? null
  }

  return options.json ? JSON.stringify(output) : formatNodeHealthHuman(output)
}

function executeExplainPayment(
  args: string[],
  options: { json: boolean }
): string {
  const [paymentHash] = args

  if (!paymentHash) {
    throw new Error('explain-payment requires a payment hash argument')
  }

  const report =
    paymentHash === '0xretry'
      ? explainPayment({
          paymentHash,
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
      : explainPayment({
          paymentHash,
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

  const output: ExplainPaymentJsonOutput = {
    command: 'explain-payment',
    paymentHash,
    failureKind: report.failureKind,
    diagnostics: report.diagnostics.map((diagnostic) => diagnostic.code)
  }

  return options.json ? JSON.stringify(output) : formatExplainPaymentHuman(output)
}

function executeCch(args: string[], options: { json: boolean }): string {
  const [paymentHash] = args

  if (!paymentHash) {
    throw new Error('cch requires a payment hash argument')
  }

  const report =
    paymentHash === '0xstuck'
      ? inspectCchOrder({
          paymentHash,
          direction: 'outgoing',
          orderStatus: 'IN_FLIGHT',
          expiryDelta: 120,
          minSafeExpiryDelta: 60,
          feeBudget: '200',
          minSafeFeeBudget: '100'
        })
      : inspectCchOrder({
          paymentHash,
          direction: 'incoming',
          orderStatus: 'PENDING',
          expiryDelta: 120,
          minSafeExpiryDelta: 60,
          feeBudget: '200',
          minSafeFeeBudget: '100'
        })

  const output: CchJsonOutput = {
    command: 'cch',
    paymentHash,
    diagnostics: report.diagnostics.map((diagnostic) => diagnostic.code)
  }

  return options.json ? JSON.stringify(output) : formatCchHuman(output)
}

async function executeLiquidity(
  options: { json: boolean; fixture: string | undefined }
): Promise<string> {
  let fixtureId: string | null = null
  let assetId: string | null = null

  if (options.fixture) {
    const fixture = await loadReliabilityFixture(
      new URL(`../../../../fixtures/scenarios/${options.fixture}.json`, import.meta.url)
    )

    fixtureId = fixture.id

    if (fixture.input.intent.kind === 'manual') {
      assetId = fixture.input.intent.assetId
    }
  }

  const output: LiquidityJsonOutput = {
    command: 'liquidity',
    fixtureId,
    assetId
  }

  return options.json ? JSON.stringify(output) : formatLiquidityHuman(output)
}

export async function executeCliCommand(argv: string[]): Promise<string> {
  const invocation = createCliShell().parse(argv)

  if (invocation.command === 'can-pay') {
    return executeCanPay(invocation.args, invocation.options)
  }

  if (invocation.command === 'node-health') {
    return executeNodeHealth(invocation.options)
  }

  if (invocation.command === 'explain-payment') {
    return executeExplainPayment(invocation.args, invocation.options)
  }

  if (invocation.command === 'cch') {
    return executeCch(invocation.args, invocation.options)
  }

  if (invocation.command === 'liquidity') {
    return executeLiquidity(invocation.options)
  }

  throw new Error(`Command is not implemented yet: ${invocation.command}`)
}
