import { readFile } from 'node:fs/promises'

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

const fixtureSchema = z.object({
  schemaVersion: z.literal(fixtureSchemaVersion),
  id: createRequiredStringSchema('Fixture id must be a non-empty string.'),
  title: createRequiredStringSchema('Fixture title must be a non-empty string.'),
  description: createRequiredStringSchema('Fixture description must be a non-empty string.'),
  input: z.object({
    intent: z.union([invoiceIntentSchema, manualIntentSchema])
  }),
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

export async function loadReliabilityFixture(path: URL | string): Promise<ReliabilityFixture> {
  const fileContents = await readFile(path, 'utf8')
  const parsedFixture = JSON.parse(fileContents) as unknown
  const result = fixtureSchema.safeParse(parsedFixture)

  if (result.success) {
    return result.data
  }

  const firstIssue = result.error.issues[0]

  if (!firstIssue) {
    throw new Error('Fixture validation failed.')
  }

  throw new Error(firstIssue.message)
}
