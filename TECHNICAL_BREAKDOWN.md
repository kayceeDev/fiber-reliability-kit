# Technical Breakdown

## Fiber Reliability Kit

Fiber Reliability Kit is organized as a TypeScript workspace with three layers:

## SDK

The SDK owns:
- invoice and payment intent analysis
- readiness checks over normalized Fiber state
- payment timeline explanation
- CCH order inspection
- rebalance planning
- fixture loading and taxonomy-backed diagnostics

The SDK is fixture-first and keeps a normalization boundary between raw Fiber RPC responses and stable internal types.

## CLI

The CLI exposes Fiber doctor workflows for operators and developers.

Current command surfaces:
- `can-pay`
- `explain-payment`
- `cch`
- `liquidity`
- `node-health`

The CLI shares a common shell for `--json`, `--fixture`, and `--rpc-url` handling.

## Reliability Lab

The Reliability Lab currently provides:
- scenario picker state
- diagnostic report view-models
- payment explanation view-models
- route/liquidity explanation view-models
- local RPC mode guardrails

The Lab remains fixture-driven and does not expose arbitrary public Fiber RPC access.

## Engineering approach

- modern TypeScript only
- fixture-first diagnostics
- small milestone slices with tests first
- deterministic diagnostic taxonomy with code, severity, source, summary, and recovery actions
- actor + domain separation between SDK, CLI, and Lab

## Current verification status

- `corepack pnpm test`
- `corepack pnpm typecheck`

Both pass at the current milestone state.
