import {
  analyzePaymentIntent,
  createFiberRpcClient,
  diagnosticMetadataByCode,
  executeFixtureCchInspection,
  executeFixturePaymentExplanation,
  executeFixtureReadiness,
  explainPayment,
  inspectCchOrder,
  loadReliabilityFixture,
  parseInvoiceFromRpcResult,
  type DiagnosticCode,
  type DiagnosticSeverity,
  type FiberJsonRpcMethod,
  type FiberRpcTransport
} from '@fiber-reliability/sdk'

import { createCliShell } from './cli-shell.js'

type CanPayJsonOutput = {
  command: 'can-pay'
  fixtureId: string | null
  diagnostics: string[]
}

type NodeHealthJsonOutput = {
  command: 'node-health'
  mode: 'rpc' | 'fixtureless' | 'fixture'
  rpcUrl: string | null
  fixtureId: string | null
  diagnostics: string[]
}

type ExplainPaymentJsonOutput = {
  command: 'explain-payment'
  paymentHash: string
  summary: string
  failureKind: string | null
  diagnostics: string[]
}

type CchJsonOutput = {
  command: 'cch'
  paymentHash: string
  fixtureId: string | null
  summary: string
  diagnostics: string[]
}

type LiquidityJsonOutput = {
  command: 'liquidity'
  fixtureId: string | null
  assetId: string | null
  diagnostics: string[]
  localBalance: string | null
  remoteBalance: string | null
}

type CommandRenderResult = {
  diagnostics: DiagnosticCode[]
  human: string
  json: string
}

export type CliExecutionResult = {
  exitCode: 0 | 1 | 2 | 3
  output: string
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
    `fixture: ${output.fixtureId ?? 'none'}`,
    `rpcUrl: ${output.rpcUrl ?? 'none'}`,
    `diagnostics: ${output.diagnostics.join(', ') || 'none'}`
  ].join('\n')
}

function formatExplainPaymentHuman(output: ExplainPaymentJsonOutput): string {
  return [
    'fiber-doctor explain-payment',
    `paymentHash: ${output.paymentHash}`,
    `summary: ${output.summary}`,
    `failureKind: ${output.failureKind ?? 'none'}`,
    `diagnostics: ${output.diagnostics.join(', ') || 'none'}`
  ].join('\n')
}

function formatCchHuman(output: CchJsonOutput): string {
  return [
    'fiber-doctor cch',
    `paymentHash: ${output.paymentHash}`,
    `fixture: ${output.fixtureId ?? 'none'}`,
    `summary: ${output.summary}`,
    `diagnostics: ${output.diagnostics.join(', ') || 'none'}`
  ].join('\n')
}

function formatLiquidityHuman(output: LiquidityJsonOutput): string {
  return [
    'fiber-doctor liquidity',
    `fixture: ${output.fixtureId ?? 'none'}`,
    `assetId: ${output.assetId ?? 'none'}`,
    `diagnostics: ${output.diagnostics.join(', ') || 'none'}`,
    `localBalance: ${output.localBalance ?? 'none'}`,
    `remoteBalance: ${output.remoteBalance ?? 'none'}`
  ].join('\n')
}

function highestSeverity(diagnostics: readonly DiagnosticCode[]): DiagnosticSeverity | null {
  if (diagnostics.length === 0) {
    return null
  }

  const rank: Record<DiagnosticSeverity, number> = {
    informational: 0,
    warning: 1,
    error: 2,
    critical: 3
  }

  let maxSeverity: DiagnosticSeverity = 'informational'

  for (const code of diagnostics) {
    const severity = diagnosticMetadataByCode[code].severity

    if (rank[severity] > rank[maxSeverity]) {
      maxSeverity = severity
    }
  }

  return maxSeverity
}

function toExitCode(diagnostics: readonly DiagnosticCode[]): 0 | 1 | 2 | 3 {
  const severity = highestSeverity(diagnostics)

  if (severity === 'warning') {
    return 1
  }

  if (severity === 'error') {
    return 2
  }

  if (severity === 'critical') {
    return 3
  }

  return 0
}

function analyzeParsedInvoiceForCli(parsedInvoice: {
  raw: string
  network: 'mainnet' | 'testnet' | 'devnet'
  asset: { kind: 'CKB' } | { kind: 'UDT'; assetId: string }
  amount: string | null
  expiresAtIso: string
}) {
  const diagnostics = analyzePaymentIntent({
    intent: {
      kind: 'invoice',
      invoice: `fiber-fixture:network=${parsedInvoice.network};asset=${parsedInvoice.asset.kind === 'CKB' ? 'CKB' : `UDT:${parsedInvoice.asset.assetId}`};${parsedInvoice.amount === null ? '' : `amount=${parsedInvoice.amount};`}expiresAt=${parsedInvoice.expiresAtIso}`
    },
    nowIso: '2026-07-04T00:00:00.000Z'
  }).diagnostics

  return diagnostics
}

function createHttpJsonRpcTransport(rpcUrl: string): FiberRpcTransport {
  return {
    async send(method: FiberJsonRpcMethod, params?: unknown) {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method,
          params
        })
      })

      if (!response.ok) {
        throw new Error(`Fiber RPC request failed: ${response.status}`)
      }

      const payload = (await response.json()) as {
        error?: { message?: string }
        result?: unknown
      }

      if (payload.error) {
        throw new Error(payload.error.message ?? 'Fiber RPC request returned an error.')
      }

      return payload.result
    }
  }
}

async function executeCanPay(
  args: string[],
  options: { json: boolean; fixture: string | undefined; rpcUrl: string | undefined }
): Promise<CommandRenderResult> {
  const [invoice] = args

  if (!invoice) {
    throw new Error('can-pay requires an invoice argument')
  }

  let diagnostics: DiagnosticCode[] = []
  let fixtureId: string | null = null

  if (options.fixture) {
    const fixture = await loadReliabilityFixture(
      new URL(`../../../../fixtures/scenarios/${options.fixture}.json`, import.meta.url)
    )

    fixtureId = fixture.id

    if (fixture.context?.readiness) {
      diagnostics = executeFixtureReadiness(fixture).diagnostics.map(
        (diagnostic) => diagnostic.code
      )
    } else {
      diagnostics = analyzePaymentIntent({
        intent: fixture.input.intent,
        nowIso: '2026-07-04T00:00:00.000Z'
      }).diagnostics.map((diagnostic) => diagnostic.code)
    }
  } else if (options.rpcUrl) {
    const transport = createHttpJsonRpcTransport(options.rpcUrl)
    const rpcResult = await transport.send('parse_invoice', { invoice })
    const parsedInvoice = parseInvoiceFromRpcResult(invoice, rpcResult as {
      invoice?: {
        currency?: string
        amount?: string | null
        data?: { attrs?: { expiry_time?: string; udt_script?: string } }
      }
    })

    diagnostics = (parsedInvoice
      ? analyzeParsedInvoiceForCli(parsedInvoice)
      : analyzePaymentIntent({
          intent: {
            kind: 'invoice',
            invoice
          },
          nowIso: '2026-07-04T00:00:00.000Z'
        }).diagnostics
    ).map((diagnostic) => diagnostic.code)
  }

  const output: CanPayJsonOutput = {
    command: 'can-pay',
    fixtureId,
    diagnostics
  }

  return {
    diagnostics,
    human: formatCanPayHuman(output),
    json: JSON.stringify(output)
  }
}

async function executeNodeHealth(
  options: { json: boolean; rpcUrl: string | undefined; fixture: string | undefined }
): Promise<CommandRenderResult> {
  let mode: NodeHealthJsonOutput['mode'] = options.rpcUrl ? 'rpc' : 'fixtureless'
  let fixtureId: string | null = null
  let diagnostics: DiagnosticCode[] = []

  if (options.fixture) {
    const fixture = await loadReliabilityFixture(
      new URL(`../../../../fixtures/scenarios/${options.fixture}.json`, import.meta.url)
    )

    fixtureId = fixture.id
    mode = 'fixture'

    if (fixture.context?.readiness) {
      diagnostics = executeFixtureReadiness(fixture).diagnostics.map(
        (diagnostic) => diagnostic.code
      )
    }
  } else if (options.rpcUrl) {
    const client = createFiberRpcClient(createHttpJsonRpcTransport(options.rpcUrl))
    const node = await client.getNodeInfo()
    const peers = await client.listPeers()
    const channels = await client.listChannels()

    if (!node.graphSynced) {
      diagnostics.push('GRAPH_NOT_SYNCED')
    }

    const hasClosedChannel = channels.some((channel) => channel.state === 'CHANNEL_CLOSED')

    if (hasClosedChannel) {
      diagnostics.push('CHANNEL_CLOSED')
    }

    const hasNoConnectedPeers = peers.length === 0 || peers.every((peer) => !peer.connected)

    if (hasNoConnectedPeers) {
      diagnostics.push('PEER_NOT_CONNECTED')
    }
  }

  const output: NodeHealthJsonOutput = {
    command: 'node-health',
    mode,
    rpcUrl: options.rpcUrl ?? null,
    fixtureId,
    diagnostics
  }

  return {
    diagnostics,
    human: formatNodeHealthHuman(output),
    json: JSON.stringify(output)
  }
}

async function executeExplainPayment(
  args: string[]
): Promise<CommandRenderResult> {
  const [paymentHash] = args

  if (!paymentHash) {
    throw new Error('explain-payment requires a payment hash argument')
  }

  const fixtureId =
    paymentHash === '0xretry'
      ? 'payment-retryable-failure'
      : paymentHash === '0xmulti'
        ? 'payment-succeeded-after-retry'
        : undefined

  const fixture = fixtureId
    ? await loadReliabilityFixture(
        new URL(`../../../../fixtures/scenarios/${fixtureId}.json`, import.meta.url)
      )
    : undefined

  if (!fixture?.context?.paymentTimeline) {
    throw new Error(
      'explain-payment currently supports fixture-backed known payment scenarios only.'
    )
  }

  const report = executeFixturePaymentExplanation(fixture)

  const diagnostics = report.diagnostics.map((diagnostic) => diagnostic.code)
  const output: ExplainPaymentJsonOutput = {
    command: 'explain-payment',
    paymentHash,
    summary: report.summary,
    failureKind: report.failureKind,
    diagnostics
  }

  return {
    diagnostics,
    human: formatExplainPaymentHuman(output),
    json: JSON.stringify(output)
  }
}

async function executeCch(
  args: string[],
  options: { json: boolean; fixture: string | undefined }
): Promise<CommandRenderResult> {
  const [paymentHash] = args

  if (!paymentHash) {
    throw new Error('cch requires a payment hash argument')
  }

  let fixtureId: string | null = null

  const fixture = options.fixture
    ? await loadReliabilityFixture(
        new URL(`../../../../fixtures/scenarios/${options.fixture}.json`, import.meta.url)
      )
    : undefined

  if (fixture) {
    fixtureId = fixture.id
  }

  if (!fixture?.context?.cch) {
    throw new Error('cch currently supports fixture-backed known CCH scenarios only.')
  }

  const report = executeFixtureCchInspection(fixture)

  const diagnostics = report.diagnostics.map((diagnostic) => diagnostic.code)
  const output: CchJsonOutput = {
    command: 'cch',
    paymentHash,
    fixtureId,
    summary: report.summary,
    diagnostics
  }

  return {
    diagnostics,
    human: formatCchHuman(output),
    json: JSON.stringify(output)
  }
}

async function executeLiquidity(
  options: { json: boolean; fixture: string | undefined }
): Promise<CommandRenderResult> {
  let fixtureId: string | null = null
  let assetId: string | null = null
  let diagnostics: DiagnosticCode[] = []
  let localBalance: string | null = null
  let remoteBalance: string | null = null

  if (options.fixture) {
    const fixture = await loadReliabilityFixture(
      new URL(`../../../../fixtures/scenarios/${options.fixture}.json`, import.meta.url)
    )

    fixtureId = fixture.id

    if (fixture.context?.readiness) {
      const channel = fixture.context.readiness.channels[0]

      assetId = channel?.assetId ?? null
      localBalance = channel?.localBalance ?? null
      remoteBalance = channel?.remoteBalance ?? null
      diagnostics = executeFixtureReadiness(fixture).diagnostics.map(
        (diagnostic) => diagnostic.code
      )
    } else if (fixture.input.intent.kind === 'manual') {
      assetId = fixture.input.intent.assetId
      diagnostics = [...fixture.expected.diagnostics]
    }
  }

  const output: LiquidityJsonOutput = {
    command: 'liquidity',
    fixtureId,
    assetId,
    diagnostics,
    localBalance,
    remoteBalance
  }

  return {
    diagnostics,
    human: formatLiquidityHuman(output),
    json: JSON.stringify(output)
  }
}

export async function executeCliCommandDetailed(argv: string[]): Promise<CliExecutionResult> {
  const invocation = createCliShell().parse(argv)

  const result =
    invocation.command === 'can-pay'
      ? await executeCanPay(invocation.args, invocation.options)
      : invocation.command === 'node-health'
        ? await executeNodeHealth(invocation.options)
        : invocation.command === 'explain-payment'
          ? await executeExplainPayment(invocation.args)
          : invocation.command === 'cch'
            ? await executeCch(invocation.args, invocation.options)
            : invocation.command === 'liquidity'
              ? await executeLiquidity(invocation.options)
              : undefined

  if (!result) {
    throw new Error(`Command is not implemented yet: ${invocation.command}`)
  }

  return {
    exitCode: toExitCode(result.diagnostics),
    output: invocation.options.json ? result.json : result.human
  }
}

export async function executeCliCommand(argv: string[]): Promise<string> {
  const result = await executeCliCommandDetailed(argv)

  return result.output
}
