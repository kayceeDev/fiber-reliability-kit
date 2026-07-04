import { explainPayment } from './explain-payment.js'
import type { PaymentExplanationReport } from './explain-payment.js'
import type { ReliabilityFixture } from '../fixture/types.js'

export function executeFixturePaymentExplanation(
  fixture: ReliabilityFixture
): PaymentExplanationReport {
  const paymentTimeline = fixture.context?.paymentTimeline

  if (!paymentTimeline) {
    throw new Error('Fixture payment timeline context is required for payment explanation execution.')
  }

  return explainPayment(paymentTimeline)
}
