import type { DiagnosticItem } from '../diagnostics/types.js'
import type { PaymentIntent } from '../payment-intent/types.js'

export type ReadinessReport = {
  intent: PaymentIntent
  diagnostics: readonly DiagnosticItem[]
}
