export const sdkPackageName = '@fiber-reliability/sdk'

export {
  diagnosticCodes,
  diagnosticSeverities,
  diagnosticSources,
  type DiagnosticCode,
  type DiagnosticEvidence,
  type DiagnosticItem,
  type DiagnosticSeverity,
  type DiagnosticSource,
  type RecoveryAction
} from './domains/diagnostics/types.js'
export {
  createDiagnostic,
  diagnosticMetadataByCode,
  type CreateDiagnosticOptions,
  type DiagnosticMetadata
} from './domains/diagnostics/taxonomy.js'
export { fixtureSchemaVersion, loadReliabilityFixture } from './domains/fixture/loader.js'
export { analyzePaymentIntent } from './domains/payment-intent/analyze-payment-intent.js'
export { checkReadiness } from './domains/readiness/check-readiness.js'
export { createFiberRpcClient } from './rpc/fiber-client.js'
export {
  normalizeFiberChannels,
  normalizeFiberNodeInfo,
  normalizeFiberPeers
} from './rpc/normalizers/fiber-normalizers.js'
export type {
  FiberNetwork,
  InvoiceAnalysisInput,
  InvoiceAnalysisReport,
  InvoiceAsset,
  ParsedInvoice,
  PaymentIntent
} from './domains/payment-intent/types.js'
export type { CheckReadinessInput, ReadinessReport } from './domains/readiness/types.js'
export type { ReliabilityFixture } from './domains/fixture/types.js'
export type {
  FiberChannelRpc,
  FiberJsonRpcMethod,
  FiberNodeInfoRpc,
  FiberPeerRpc,
  FiberRpcTransport,
  NormalizedFiberChannel,
  NormalizedFiberNodeInfo,
  NormalizedFiberPeer
} from './rpc/fiber-types.js'
