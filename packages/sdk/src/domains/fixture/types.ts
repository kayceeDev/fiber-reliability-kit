import type { DiagnosticCode } from '../diagnostics/types.js'
import type { PaymentIntent } from '../payment-intent/types.js'

export type ReliabilityFixture = {
  schemaVersion: 1
  id: string
  title: string
  description: string
  input: {
    intent: PaymentIntent
  }
  expected: {
    diagnostics: readonly DiagnosticCode[]
  }
}
