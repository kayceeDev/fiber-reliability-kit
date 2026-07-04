# CLAUDE.md

## Project Mission

Build **Fiber Reliability Kit**, a TypeScript-first infrastructure toolkit for Fiber Network on Nervos CKB.

The project answers the question every wallet, merchant checkout, LSP, node operator, and developer integration will hit:

> Will this Fiber payment or cross-chain swap work, why might it fail, and what exact action should software or an operator take next?

This is a hackathon infrastructure submission for **Node, Routing, Cross-Chain, and Diagnostics Infrastructure**. The goal is not to build another wallet, desktop node manager, installer, or generic dashboard. The goal is to build a reusable reliability layer that future Fiber applications can adopt.

Primary deliverables:

- `@fiber-reliability/sdk`: reusable diagnostic and readiness engine.
- `fiber-doctor`: CLI for developers and node operators.
- Fiber Reliability Lab: hosted fixture-based demo that proves the SDK against realistic Fiber failure scenarios.

## Winning Thesis

Fiber already has product surfaces such as desktop/node managers, wallets, installers, and app demos. The missing layer is reusable infrastructure that translates Fiber RPC state into deterministic diagnoses and recovery actions.

Fiber Studio answers:

> How do I run Fiber and manage payments locally?

Fiber Reliability Kit answers:

> Will this payment or swap succeed, why not, and what should the integration do next?

The SDK and CLI are the core submission. The hosted UI is only a demo of the engine. Keep the project positioned as infrastructure that Fiber Studio, wallets, merchant SDKs, LSP tooling, dashboards, CCH operators, and test suites could all reuse.

## Non-Negotiable Engineering Rules

### Language And Style

- Use modern TypeScript exclusively.
- Use existing Fiber, CKB, and payment-channel domain vocabulary.
- Keep functions small, composable, and testable.
- Prefer clear data structures and simple algorithms over clever abstractions.
- Add comments only for critical caveats. Code should be self-explanatory.
- Extract a function only when it is reused, enables unit testing, or avoids complexity that would otherwise need comments.
- Avoid unnecessary type casts, unused parameters, hidden dependencies, and hard-coded values that should be explicit arguments.

### Test-Driven Development

- Scaffold tests before implementation.
- Define expected failing cases, passing cases, and edge cases before writing production code.
- Simulate sample data first to confirm the tests cover realistic Fiber flows.
- Use tests as the implementation checklist.
- Every diagnostic rule should be testable from fixture input without requiring a live Fiber node.

### Module Organization

- Use an **Actor + Domain** construct for module breakdown.
- Do not create modules without a clear actor, domain, and purpose.
- Prefer these conceptual boundaries:
  - SDK actor: integration developer.
  - CLI actor: node operator or developer.
  - Lab actor: hackathon judge or future integrator.
  - Domains: payment intent, readiness, route, liquidity, CCH, payment timeline, fixture.
- Module structure must reinforce the infrastructure thesis, not drift into wallet or dashboard product code.

### Data And Persistence

- No database in v1.
- Reports are computed from Fiber RPC responses and fixture data.
- If SQL is ever introduced later, always show the raw SQL query and rationale.
- If SQL joins are introduced later, explain each join choice, especially LEFT vs INNER vs RIGHT.

### Code Review Checklist

Before submitting any code, verify:

1. **Readability**: Can a future maintainer easily follow the function?
2. **Cyclomatic complexity**: Is nesting or branching excessive?
3. **Data structures and algorithms**: Could a common pattern simplify the logic?
4. **Parameters**: Are all parameters necessary, explicit, and correctly typed?
5. **Testability**: Can behavior be unit-tested from fixtures without mocking core dependencies?
6. **Dependencies**: Are there hidden or untested dependencies?
7. **Naming**: Brainstorm at least three alternatives for important names and choose the one most consistent with Fiber terminology.
8. **Extraction rationale**: Do not extract unless reuse, testability, or complexity reduction justifies it.

### General Principles

- Keep behavior DRY, composable, and reusable.
- Design for extensibility without overbuilding.
- Design reliability rules for scale and robustness from the start.
- User workflows matter: abandoned, partial, stuck, inflight, failed, and recovered states must be represented gracefully.
- Incomplete actions should not block future actions.

## Product Boundaries

### In Scope

- Typed Fiber JSON-RPC client wrappers.
- Payment intent analysis.
- Readiness checks before a payment or swap attempt.
- Route, graph, peer, channel, liquidity, asset, fee, and expiry diagnostics.
- Payment timeline explanation.
- CCH order inspection and cross-chain reliability warnings.
- Rebalancing suggestions through dry-run route planning.
- Fixture-based failure lab using realistic Fiber issue patterns.
- CLI commands that output both human-readable and JSON reports.

### Out Of Scope

- Wallet custody or hosted wallet features.
- Desktop app replacement for Fiber Studio.
- Node installer or fnn sidecar manager.
- Consumer merchant checkout product.
- Protocol fork or Rust Fiber core changes.
- Publicly hosted arbitrary Fiber RPC proxy.
- Persistent database or analytics warehouse in v1.

## Architecture

### `@fiber-reliability/sdk`

Reusable TypeScript package that owns diagnostic logic and public types.

Core responsibilities:

- Normalize Fiber RPC responses into stable internal domain objects.
- Analyze payment intents from invoices or explicit payment params.
- Compute readiness reports from node, graph, channel, route, payment, invoice, and CCH state.
- Classify diagnostics with consistent severity, evidence, and recovery actions.
- Support fixture execution so tests and demos do not require a live node.

Planned SDK functions:

- `analyzePaymentIntent(input)`
- `checkReadiness(intent)`
- `explainPayment(paymentHash)`
- `inspectCchOrder(paymentHash)`
- `planRebalance(target?)`

### `fiber-doctor` CLI

Operator and developer CLI built on top of the SDK.

Commands:

- `fiber-doctor can-pay <invoice>`: readiness score, diagnostic codes, evidence, and next actions.
- `fiber-doctor explain-payment <payment_hash>`: payment timeline and classified failure cause.
- `fiber-doctor cch <payment_hash>`: CCH order health and expiry, fee, stuck-state, or recovery warnings.
- `fiber-doctor liquidity`: asset-specific inbound and outbound liquidity summary.
- `fiber-doctor node-health`: peers, graph sync, pending or closed channels, unsafe states, and RPC reachability.

Every command should support:

- `--json`
- `--fixture <name-or-path>`
- `--rpc-url <url>`

### Fiber Reliability Lab

Hosted fixture-first demo. It must make the SDK's value visible without pretending to be a production wallet or node manager.

The Lab should show:

- Scenario picker.
- Raw-ish Fiber state.
- Diagnostic codes.
- Severity.
- Evidence.
- Recovery actions.
- Route or lifecycle visualization where useful.
- Clear labels for mocked fixture data vs optional live local RPC.

The hosted demo must not expose unsafe arbitrary Fiber RPC access.

## Public Interfaces

Planned exported types:

- `PaymentIntent`
- `ReadinessReport`
- `DiagnosticCode`
- `RecoveryAction`
- `LiquiditySnapshot`
- `RouteQuote`
- `PaymentTimeline`
- `CchOrderReport`
- `ReliabilityFixture`

Every diagnostic item should include:

- `code`: stable machine-readable diagnostic code.
- `severity`: informational, warning, error, or critical.
- `summary`: short human-readable description.
- `evidence`: concrete observed state from RPC or fixture data.
- `recoveryActions`: one or more concrete actions.
- `source`: which subsystem produced the finding, such as invoice, route, liquidity, channel, payment, or CCH.

Initial diagnostic taxonomy should cover:

- `MALFORMED_INVOICE`
- `INVOICE_EXPIRED`
- `INVOICE_AMOUNT_MISSING`
- `NETWORK_MISMATCH`
- `ASSET_MISMATCH`
- `PEER_NOT_CONNECTED`
- `GRAPH_NOT_SYNCED`
- `NO_ROUTE`
- `CHANNEL_NOT_READY`
- `CHANNEL_CLOSED`
- `INSUFFICIENT_OUTBOUND_LIQUIDITY`
- `INSUFFICIENT_INBOUND_LIQUIDITY`
- `FEE_CAP_TOO_LOW`
- `EXPIRY_UNSAFE`
- `PAYMENT_RETRYABLE_FAILURE`
- `PAYMENT_TERMINAL_FAILURE`
- `PAYMENT_STUCK_INFLIGHT`
- `CCH_ORDER_STUCK`
- `CCH_EXPIRY_UNSAFE`
- `CCH_FEE_BUDGET_UNSAFE`
- `FORCE_CLOSE_TLC_PENDING`

## Milestone Tasks

Every milestone must be a tiny, single-commit-sized unit of work. Do not skip ahead without approval on the current milestone.

Each milestone follows this gate:

1. Define the milestone.
2. Write or scaffold tests first.
3. Implement only that milestone.
4. Run automated verification.
5. Request manual verification from the engineer.
6. Commit with the prescribed message.
7. Proceed only after automated and manual checks pass.

### Milestone 1: Diagnostic Core

Define:

- Domain types.
- Fixture format.
- Fiber RPC normalization boundary.
- Invoice analysis.
- Diagnostic taxonomy.

Automated tests:

- Malformed invoice.
- Missing amount invoice.
- Expired invoice.
- CKB vs UDT detection.
- Network mismatch.
- Basic fixture loading.

Manual verification:

- Inspect sample fixture reports.
- Confirm terms match Fiber RPC and Fiber docs vocabulary.
- Confirm no wallet, installer, or dashboard scope was introduced.

Commit message:

```text
sdk: add Fiber reliability diagnostic core
```

### Milestone 2: Readiness Engine

Define:

- Route checks.
- Graph checks.
- Peer checks.
- Channel state checks.
- Asset-specific liquidity checks.
- Fee cap checks.
- Expiry safety checks.

Automated tests:

- Happy path.
- No route.
- Pending channel.
- Closed channel.
- Insufficient outbound liquidity.
- Receiver inbound liquidity gap.
- UDT mismatch.
- Unsafe CCH expiry.

Manual verification:

- Compare output against known Fiber issue patterns such as route-not-found and inbound-liquidity failures.
- Confirm each diagnostic includes code, severity, evidence, and next action.

Commit message:

```text
sdk: add Fiber payment readiness engine
```

### Milestone 3: Recovery + CLI

Define:

- Payment timeline explanation.
- CCH order inspection.
- Rebalancing suggestions.
- CLI commands.

CLI commands:

- `can-pay`
- `explain-payment`
- `cch`
- `liquidity`
- `node-health`

Automated tests:

- CLI JSON snapshots.
- Human output snapshots.
- Exit codes.
- Fixture-based classifications.
- CCH stuck-state scenario.
- Payment timeline retryable vs terminal failure scenario.

Manual verification:

- Run CLI against bundled fixtures.
- If a local or testnet FNN node is available, run one read-only live check.
- Confirm live RPC remains operator-provided and local, not publicly proxied.

Commit message:

```text
cli: expose Fiber doctor workflows
```

### Milestone 4: Reliability Lab + Submission

Define:

- Hosted fixture-based demo.
- README.
- Technical breakdown.
- Video script.
- Roadmap.
- Mocked-vs-live limitations.

Fixture scenarios:

- Happy payment.
- No route.
- Missing peer.
- Channel not ready.
- Insufficient outbound liquidity.
- Receiver inbound liquidity gap.
- UDT mismatch.
- Expired invoice.
- CCH stuck outgoing.
- Unsafe CCH expiry.
- Force-close or pending TLC settlement.

Automated tests:

- Typecheck.
- Build.
- Component smoke tests.
- Fixture rendering.
- Mobile and desktop layout checks.

Manual verification:

- Walk through hosted demo.
- Confirm all submission deliverables are present.
- Confirm the demo clearly labels mocked fixture data.
- Confirm the UI supports the SDK/CLI story instead of becoming the main product.

Commit message:

```text
demo: add Fiber Reliability Lab
```

### Milestone 5A: Canonical Fixture Expansion

Define:

- Expand the fixture schema beyond `input.intent` and `expected.diagnostics`.
- Add readiness context blocks for node, peers, channels, routing, fee cap, and expiry state.
- Build a broader canonical fixture corpus that can drive SDK, CLI, and Lab behavior.

Initial fixture scenarios:

- Happy payment.
- Graph not synced.
- No route.
- Channel not ready.
- Channel closed.
- Insufficient outbound liquidity.
- Receiver inbound liquidity gap.
- Fee cap too low.
- Unsafe expiry.

Automated tests:

- Schema validation for expanded readiness fixtures.
- Loader tests for readiness context blocks.
- Fixture inventory tests for the initial readiness scenario set.

Manual verification:

- Inspect representative readiness fixtures for realism and naming consistency.
- Confirm readiness fixtures are sufficient to drive SDK checks without live RPC.

Commit message:

```text
fixtures: expand canonical Fiber reliability scenario corpus
```

### Milestone 5B: SDK Fixture-Driven Scenario Engine

Define:

- Add shared fixture-to-SDK execution helpers.
- Compute readiness and related reports from fixture context instead of hand-authored test inputs.
- Validate that fixture expectations match computed SDK outputs.

Automated tests:

- Fixture-driven SDK integration tests.
- Regression tests for multi-diagnostic readiness scenarios.
- Assertions that computed diagnostics match fixture expectations.

Manual verification:

- Inspect sample computed reports for evidence, severity, and recovery quality.
- Confirm fixtures now act as the canonical scenario driver.

Commit message:

```text
sdk: drive reliability reports from canonical fixtures
```

### Milestone 5C: Real CLI Workflows From Shared Scenarios

Define:

- Replace curated branches in the CLI with fixture-driven SDK execution.
- Render `can-pay`, `explain-payment`, `cch`, `liquidity`, and `node-health` from shared computed results.
- Add command snapshots and exit-code behavior.

Automated tests:

- JSON snapshots.
- Human output snapshots.
- Exit-code tests.
- `--fixture` parity tests across all commands.

Manual verification:

- Run all CLI commands against bundled fixtures.
- Confirm outputs remain operator-friendly and local-RPC mode stays operator-controlled.

Commit message:

```text
cli: run fiber-doctor commands from shared reliability scenarios
```

### Milestone 5D: Rendered Reliability Lab Application

Define:

- Turn the Lab from view-model helpers into a rendered application.
- Render scenario picker, diagnostic cards, evidence, recovery actions, payment timeline, and route/liquidity panels.
- Preserve explicit mocked-vs-local-RPC labeling.

Automated tests:

- Component smoke tests.
- Scenario rendering tests.
- Mobile and desktop layout checks.
- Local-RPC mode guardrail tests.

Manual verification:

- Walk through a representative scenario set in the rendered Lab.
- Confirm the app reinforces the infrastructure thesis rather than drifting into wallet UX.

Commit message:

```text
lab: render the Fiber Reliability Lab app
```

### Milestone 5E: Final Acceptance + Submission Hardening

Define:

- Align docs with actual product behavior.
- Run end-to-end acceptance checks across SDK, CLI, and Lab.
- Finalize submission messaging with no scaffold/stub ambiguity.

Automated tests:

- Root typecheck.
- Full test suite.
- Lab smoke/build verification.
- Fixture coverage audit.

Manual verification:

- Compare one scenario across SDK, CLI JSON, CLI human output, and Lab output.
- Confirm working vs mocked vs optional-live messaging is accurate.

Commit message:

```text
docs: finalize product completion and submission positioning
```

## Test Plan

Automated tests must cover:

- Unit tests for every diagnostic rule.
- Fixture tests for real Fiber issue patterns.
- CLI snapshot tests for JSON and human output.
- Build and typecheck for SDK, CLI, and demo.
- Regression tests for every bug-like scenario added to the fixture library.

Required scenarios:

- Malformed invoice.
- No amount invoice.
- Expired invoice.
- CKB payment happy path.
- UDT asset mismatch.
- No route.
- Missing peer.
- Pending channel.
- Closed channel.
- Insufficient outbound liquidity.
- Receiver inbound liquidity gap.
- Fee cap too low.
- Unsafe expiry.
- CCH stuck order.
- CCH fee budget unsafe.
- CCH expiry unsafe.
- Force-close TLC pending.
- Payment retryable failure.
- Payment terminal failure.

Manual verification must confirm:

- Every diagnostic has cause, evidence, severity, and next action.
- CLI can run entirely from fixtures.
- Optional live RPC mode is clearly documented and operator-controlled.
- Hosted demo does not expose arbitrary public Fiber RPC access.
- README states what is working, what is mocked, and what would be required for production use.

## Submission Deliverables

Prepare these before hackathon submission:

- Project summary.
- Selected category: Node, Routing, Cross-Chain, and Diagnostics Infrastructure.
- Team members.
- Repository link with fully open-sourced code.
- Hosted demo link.
- Runnable demo instructions.
- Video demonstration.
- Technical breakdown.
- Explanation of the Fiber infrastructure gap addressed.
- Future roadmap.
- AI allowance claim, if applicable.

The submission should clearly say:

- Fully working: SDK fixture diagnostics, CLI fixture mode, hosted Reliability Lab.
- Optional live mode: local/operator-provided Fiber RPC.
- Mocked/simulated: public hosted demo data.
- Production requirements: hardened RPC access, version compatibility matrix, broader fixture corpus, live-node integration testing, and ongoing tracking of Fiber RPC changes.

## Research Anchors

Primary sources and context to preserve:

- Fiber repository: `https://github.com/nervosnetwork/fiber`
- Fiber RPC docs: `https://github.com/nervosnetwork/fiber/blob/develop/crates/fiber-lib/src/rpc/README.md`
- Fiber payment lifecycle: `https://github.com/nervosnetwork/fiber/blob/develop/docs/payment-lifecycle.md`
- CCH expiry dependency: `https://github.com/nervosnetwork/fiber/blob/develop/docs/specs/cch-expiry-dependency.md`
- Channel rebalancing: `https://github.com/nervosnetwork/fiber/blob/develop/docs/channel-rebalancing.md`
- Fiber invoice protocol: `https://github.com/nervosnetwork/fiber/blob/develop/docs/specs/payment-invoice.md`
- Fiber external funding: `https://github.com/nervosnetwork/fiber/blob/develop/docs/external-funding.md`

Important issue patterns to model as fixtures:

- CCH outgoing success or preimage recovery after downtime.
- CCH order stuck in outgoing/inflight states.
- CCH fee budget too low.
- Route failure with `PathFind error: no path found`.
- Inbound liquidity limitations for new channels.
- Channel stuck in negotiation or not ready.
- Channel close or force-close settlement problems.
- Pending TLC settlement after force close.

Before implementation, run the validation gate:

- Edge case simulations complete.
- Breaking change analysis complete.
- Integration consistency checked.
- Usability and abandonment scenarios considered.
- Milestone breakdown and test criteria confirmed.
