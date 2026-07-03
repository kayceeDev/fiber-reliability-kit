# Fiber Reliability Kit

Fiber Reliability Kit is a TypeScript-first infrastructure toolkit for Fiber Network on Nervos CKB.

It answers a simple integration question:

> Will this Fiber payment or cross-chain swap work, why might it fail, and what exact action should software or an operator take next?

## Components

- **SDK** — reusable payment intent, readiness, payment timeline, CCH, and rebalance planning logic
- **fiber-doctor CLI** — fixture-first operator and developer command surface
- **Reliability Lab** — fixture-driven demo scaffold for scenario selection, diagnostic reports, and local RPC guardrails

## Fully working

- SDK fixture diagnostics
- SDK readiness engine
- SDK payment explanation, CCH inspection, and rebalance planning domains
- CLI fixture mode for `can-pay`, `explain-payment`, `cch`, `liquidity`, and `node-health`
- Hosted/demo-facing Reliability Lab scenario picker and report view-model scaffolding

## Optional live mode

- Local/operator-provided Fiber RPC only
- Lab local RPC mode must be explicitly enabled and only accepts `localhost` / `127.0.0.1` URLs
- CLI `--rpc-url` is intended for operator-provided local nodes

## Mocked/simulated

- Public hosted demo data
- Fixture-backed scenario rendering in the Reliability Lab
- Current CLI command execution examples that use fixture-derived SDK paths

## Production requirements

- Hardened RPC access controls
- Version compatibility matrix against upstream Fiber RPC changes
- Broader fixture corpus for payment, CCH, routing, and force-close edge cases
- Live-node integration testing
- Ongoing tracking of Fiber RPC and invoice protocol changes

## Runnable demo instructions

1. Install dependencies:

   ```bash
   corepack pnpm install
   ```

2. Run automated verification:

   ```bash
   corepack pnpm test
   corepack pnpm typecheck
   ```

3. Inspect fixture scenarios under [fixtures/scenarios/](fixtures/scenarios/).

4. Use the CLI package exports and Lab view-model helpers as the current runnable demo surfaces.

## Repository structure

- [packages/sdk/](packages/sdk/) — SDK domains and RPC normalization
- [packages/cli/](packages/cli/) — CLI shell and command execution
- [packages/lab/](packages/lab/) — Lab scenario, report, explanation, and local-RPC boundary scaffolding
- [fixtures/](fixtures/) — shared fixture scenarios and schema

## Category

Node, Routing, Cross-Chain, and Diagnostics Infrastructure

## Fiber infrastructure gap addressed

Fiber already has product surfaces for running nodes and managing payments. The missing layer is reusable infrastructure that translates Fiber RPC state into deterministic diagnoses, machine-readable failure classes, and concrete recovery actions. Fiber Reliability Kit focuses on that reliability layer so wallets, merchant integrations, LSP tooling, dashboards, and test suites can reuse it.
