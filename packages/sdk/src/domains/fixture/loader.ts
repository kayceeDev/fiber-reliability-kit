import { z } from 'zod'

import { diagnosticCodes, type DiagnosticCode } from '../diagnostics/types.js'
import type { ReliabilityFixture } from './types.js'

export const fixtureSchemaVersion = 1

function createRequiredStringSchema(message: string) {
  return z.preprocess(
    (value) => (typeof value === 'string' ? value : ''),
    z.string().min(1, message)
  )
}

const invoiceIntentSchema = z.object({
  kind: z.literal('invoice'),
  invoice: createRequiredStringSchema('Fixture invoice intent must include a non-empty invoice string.')
})

const manualIntentSchema = z.object({
  kind: z.literal('manual'),
  amount: createRequiredStringSchema('Fixture manual intent must include a non-empty amount string.'),
  assetId: createRequiredStringSchema('Fixture manual intent must include a non-empty assetId string.'),
  targetPubkey: createRequiredStringSchema(
    'Fixture manual intent must include a non-empty targetPubkey string.'
  )
})

const readinessNodeSchema = z.object({
  nodeName: createRequiredStringSchema('Fixture readiness nodeName must be a non-empty string.'),
  peerId: createRequiredStringSchema('Fixture readiness peerId must be a non-empty string.'),
  network: z.enum(['mainnet', 'testnet', 'devnet']),
  graphSynced: z.boolean(),
  blockHeight: createRequiredStringSchema('Fixture readiness blockHeight must be a non-empty string.')
})

const readinessPeerSchema = z.object({
  peerId: createRequiredStringSchema('Fixture readiness peerId must be a non-empty string.'),
  connected: z.boolean()
})

const readinessChannelSchema = z.object({
  channelId: createRequiredStringSchema('Fixture readiness channelId must be a non-empty string.'),
  state: createRequiredStringSchema('Fixture readiness channel state must be a non-empty string.'),
  localBalance: createRequiredStringSchema('Fixture readiness localBalance must be a non-empty string.'),
  remoteBalance: createRequiredStringSchema('Fixture readiness remoteBalance must be a non-empty string.'),
  assetId: createRequiredStringSchema('Fixture readiness assetId must be a non-empty string.'),
  peerId: createRequiredStringSchema('Fixture readiness peerId must be a non-empty string.')
})

const readinessContextSchema = z.object({
  node: readinessNodeSchema,
  peers: z.array(readinessPeerSchema),
  channels: z.array(readinessChannelSchema),
  routeAvailable: z.boolean(),
  targetPeerId: createRequiredStringSchema('Fixture readiness targetPeerId must be a non-empty string.'),
  routeFee: z.string().optional(),
  feeCap: z.string().optional(),
  routeExpiryDelta: z.number().optional(),
  minSafeExpiryDelta: z.number().optional()
})

const cchContextSchema = z.object({
  paymentHash: createRequiredStringSchema('Fixture CCH paymentHash must be a non-empty string.'),
  direction: z.enum(['incoming', 'outgoing']),
  orderStatus: z.enum(['PENDING', 'IN_FLIGHT', 'COMPLETED']),
  expiryDelta: z.number(),
  minSafeExpiryDelta: z.number(),
  feeBudget: createRequiredStringSchema('Fixture CCH feeBudget must be a non-empty string.'),
  minSafeFeeBudget: createRequiredStringSchema('Fixture CCH minSafeFeeBudget must be a non-empty string.')
})

const paymentAttemptSchema = z.object({
  id: createRequiredStringSchema('Fixture payment attempt id must be a non-empty string.'),
  status: z.enum(['SUCCEEDED', 'FAILED_RETRYABLE', 'FAILED_TERMINAL', 'IN_FLIGHT']),
  startedAtIso: createRequiredStringSchema('Fixture payment attempt startedAtIso must be a non-empty string.'),
  finishedAtIso: z.string().optional(),
  failureReason: z.string().optional()
})

const paymentTimelineContextSchema = z.object({
  paymentHash: createRequiredStringSchema('Fixture payment timeline paymentHash must be a non-empty string.'),
  paymentFlow: z.enum(['outbound', 'inbound']),
  attempts: z.array(paymentAttemptSchema)
})

const fixtureSchema = z.object({
  schemaVersion: z.literal(fixtureSchemaVersion),
  id: createRequiredStringSchema('Fixture id must be a non-empty string.'),
  title: createRequiredStringSchema('Fixture title must be a non-empty string.'),
  description: createRequiredStringSchema('Fixture description must be a non-empty string.'),
  input: z.object({
    intent: z.union([invoiceIntentSchema, manualIntentSchema])
  }),
  context: z
    .object({
      readiness: readinessContextSchema.optional(),
      cch: cchContextSchema.optional(),
      paymentTimeline: paymentTimelineContextSchema.optional()
    })
    .optional(),
  expected: z.object({
    diagnostics: z
      .array(z.string())
      .refine(
        (diagnostics): diagnostics is DiagnosticCode[] =>
          diagnostics.every((code) => diagnosticCodes.includes(code as DiagnosticCode)),
        'Fixture expected diagnostics must use known diagnostic codes.'
      )
      .transform((diagnostics) => diagnostics as DiagnosticCode[])
  })
})

export function parseReliabilityFixtureData(parsedFixture: unknown): ReliabilityFixture {
  const result = fixtureSchema.safeParse(parsedFixture)

  if (result.success) {
    return result.data as ReliabilityFixture
  }

  const firstIssue = result.error.issues[0]

  if (!firstIssue) {
    throw new Error('Fixture validation failed.')
  }

  throw new Error(firstIssue.message)
}

export async function loadReliabilityFixture(path: URL | string): Promise<ReliabilityFixture> {
  const { readFile } = await import('node:fs/promises')
  const fileContents = await readFile(path, 'utf8')
  const parsedFixture = JSON.parse(fileContents) as unknown

  return parseReliabilityFixtureData(parsedFixture)
}
