export type LabScenarioManifestEntry = {
  id: string
  title: string
  description: string
}

const scenarioManifest: readonly LabScenarioManifestEntry[] = [
  {
    id: 'cch-fee-budget-unsafe',
    title: 'CCH fee budget unsafe',
    description: 'The cross-chain order fee budget is below the minimum safe budget.'
  },
  {
    id: 'cch-order-stuck',
    title: 'CCH order stuck',
    description: 'The cross-chain order is still inflight and requires operator attention.'
  },
  {
    id: 'channel-closed',
    title: 'Channel closed',
    description: 'The target peer channel is closed and cannot be used for the payment.'
  },
  {
    id: 'channel-not-ready',
    title: 'Channel not ready',
    description: 'The target peer channel is still negotiating and cannot forward payments yet.'
  },
  {
    id: 'expiry-unsafe',
    title: 'Expiry unsafe',
    description: 'The route expiry delta is too small for safe payment completion.'
  },
  {
    id: 'fee-cap-too-low',
    title: 'Fee cap too low',
    description: 'The route fee exceeds the configured fee cap for the payment.'
  },
  {
    id: 'graph-not-synced',
    title: 'Graph not synced',
    description: 'The graph is stale, so route decisions may be incomplete.'
  },
  {
    id: 'happy-payment',
    title: 'Happy payment',
    description: 'A ready CKB payment with connected peer, synced graph, ready channel, safe fee cap, and safe expiry.'
  },
  {
    id: 'insufficient-inbound-liquidity',
    title: 'Insufficient inbound liquidity',
    description: 'The receiver side does not have enough inbound liquidity to accept the invoice amount.'
  },
  {
    id: 'insufficient-outbound-liquidity',
    title: 'Insufficient outbound liquidity',
    description: 'The payer does not have enough local balance to send the invoice amount.'
  },
  {
    id: 'invoice-missing-amount',
    title: 'Invoice missing amount',
    description: 'A valid invoice requires the payer to specify the missing amount before payment.'
  },
  {
    id: 'manual-peer-missing',
    title: 'Manual payment target peer missing',
    description: 'A manual payment intent cannot proceed because the target peer is disconnected.'
  },
  {
    id: 'no-route',
    title: 'No route',
    description: 'The graph is synced but there is no viable route for the payment.'
  },
  {
    id: 'payment-retryable-failure',
    title: 'Payment retryable failure',
    description: 'The latest payment attempt failed in a retryable way.'
  },
  {
    id: 'payment-succeeded-after-retry',
    title: 'Payment succeeded after retry',
    description: 'A retryable first attempt is followed by a successful payment completion.'
  }
] as const

export function getLabScenarioManifest(): readonly LabScenarioManifestEntry[] {
  return scenarioManifest
}
