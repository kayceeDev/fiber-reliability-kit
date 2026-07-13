# @fiber-reliability/sdk

TypeScript diagnostics, readiness, and recovery primitives for Fiber Network payment infrastructure.

Fiber Reliability Kit helps wallets, merchants, LSPs, node operators, and CKB ecosystem developers answer:

> Can this Fiber payment succeed, and if not, what should happen next?

## Install

```bash
npm install @fiber-reliability/sdk
```

## Quick Usage

```ts
import {
  analyzePaymentIntent,
  checkReadiness,
  inspectCchOrder,
  explainPayment
} from '@fiber-reliability/sdk'

const intent = analyzePaymentIntent({
  intent: {
    kind: 'invoice',
    invoice:
      'fiber-fixture:network=testnet;asset=CKB;amount=100000000;expiresAt=2026-12-31T00:00:00.000Z'
  },
  nowIso: '2026-07-11T00:00:00.000Z',
  expectedNetwork: 'testnet'
})

const report = checkReadiness({
  intent: intent.intent,
  node: {
    nodeName: 'fiber-node',
    peerId: 'self',
    network: 'testnet',
    graphSynced: true,
    blockHeight: '42'
  },
  peers: [{ peerId: 'peer-1', connected: true }],
  channels: [],
  routeAvailable: false,
  targetPeerId: 'peer-1'
})

console.log(report.diagnostics)
```

## Public API

The SDK exports infrastructure-focused functions and types for:

- `analyzePaymentIntent(input)`
- `checkReadiness(input)`
- `explainPayment(input)`
- `inspectCchOrder(input)`
- `planRebalance(input)`
- `createFiberRpcClient(config)`
- Fiber RPC normalization helpers
- fixture execution helpers for hackathon/demo scenarios

Core exported types include:

- `PaymentIntent`
- `ReadinessReport`
- `DiagnosticCode`
- `RecoveryAction`
- `PaymentTimeline`
- `CchOrderReport`
- `ReliabilityFixture`

## Fixture And Live Boundaries

The hackathon demo uses fixture-backed Fiber scenarios by default. This keeps the hosted Lab safe because it does not expose public Fiber RPC access.

Live Fiber RPC usage should be operator-provided and local/private. Do not expose arbitrary Fiber node RPC endpoints from a public web demo.

## Hackathon Status

This package is a `0.1.0` hackathon release candidate. It includes typed diagnostics, readiness rules, payment explanation, CCH inspection, rebalance planning, fixture execution, and Fiber JSON-RPC client scaffolding.

Production deployments should add live-node compatibility testing, version tracking against upstream Fiber RPC changes, and stronger operational guardrails.
