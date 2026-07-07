# Fiber Reliability Kit: Beginner Onboarding

This guide is for someone who has never used Fiber, CKB, payment channels, or this repo before.

By the end, you should understand:

- what Fiber is
- why Fiber payments can be hard to debug
- what Fiber Reliability Kit does
- what the SDK, CLI, Lab, and fixtures are
- how to run the basic checks
- how to explain the project to someone else

You do **not** need blockchain experience to read this.

---

## 1. The One-Minute Explanation

Fiber Reliability Kit is a tool that helps answer:

> Can this Fiber payment or cross-chain swap work? If not, why not, and what should I do next?

It does this by looking at payment-related information and turning it into:

- a clear problem name
- a seriousness level
- evidence for why the problem was detected
- suggested next steps

Think of it like a health check for Fiber payments.

It is **not** a wallet.
It is **not** a desktop app.
It is **not** a node installer.

It is a reliability and diagnostics layer that other tools can build on.

---

## 2. What Is Fiber?

Fiber is a payment network built around **payment channels**.

A normal blockchain payment is written directly to the blockchain. That can be slower and more expensive, especially for small payments.

Fiber lets people move value through channels so payments can be faster and cheaper.

A simple way to imagine it:

- A normal blockchain payment is like going to the bank counter for every tiny transaction.
- A Fiber payment is like opening a tab, making many quick updates, and settling later.

Fiber can be useful for:

- wallets
- merchants
- small payments
- routed payments
- payment infrastructure
- cross-chain payment experiments
- operators who run payment nodes

---

## 3. What Is CKB?

CKB is the blockchain that Fiber is built around.

You do not need to understand CKB deeply to understand this project. For onboarding, remember only this:

- CKB is the base blockchain.
- Fiber is a faster payment layer around it.
- Fiber nodes and channels make payments possible.
- This repo helps explain whether those payments are ready, risky, stuck, or failed.

---

## 4. What Is A Payment Channel?

A payment channel is a connection between two parties that lets them move value without putting every update directly on the blockchain.

Example:

1. Alice and Bob open a channel.
2. Alice can pay Bob quickly inside that channel.
3. They can update balances many times.
4. The final result can settle later.

Why channels are useful:

- faster payments
- lower fees
- better support for many small payments

Important words:

- **Node**: software that participates in Fiber.
- **Peer**: another node your node is connected to.
- **Channel**: a payment path between two nodes.
- **Route**: the full path a payment takes, possibly through multiple nodes.
- **Liquidity**: usable balance in the right direction.

---

## 5. Why Can Fiber Payments Fail?

A Fiber payment can fail for many reasons.

Some common examples:

- the invoice is invalid
- the invoice is expired
- the payer is on the wrong network
- the receiver is not connected
- the channel exists but is not ready
- the channel is closed
- there is no route through the network
- the payer does not have enough outbound balance
- the receiver does not have enough inbound capacity
- the fee limit is too low
- the expiry window is unsafe
- a payment is stuck
- a cross-chain order is stuck or unsafe

Without a tool like this, these problems can look like random errors.

Fiber Reliability Kit turns those vague failures into clear explanations.

---

## 6. What Problem Does This Repo Solve?

This repo helps Fiber developers and operators understand payment reliability.

Instead of only showing raw data, it produces diagnostics like:

- `NO_ROUTE`
- `CHANNEL_NOT_READY`
- `INSUFFICIENT_OUTBOUND_LIQUIDITY`
- `INSUFFICIENT_INBOUND_LIQUIDITY`
- `FEE_CAP_TOO_LOW`
- `CCH_ORDER_STUCK`

Each diagnostic should answer:

- What is wrong?
- How serious is it?
- What evidence caused the diagnosis?
- What should someone do next?

That is why this project is useful infrastructure.

Wallets, merchant tools, dashboards, testing tools, and node operators can all reuse the same reliability logic.

---

## 7. The Three Main Parts Of The Repo

The repo has three main surfaces:

1. SDK
2. CLI
3. Reliability Lab

### SDK

Location:

- [packages/sdk/](packages/sdk/)

The SDK is the main reusable engine.

It contains the logic that understands payment scenarios and creates diagnostics.

If another developer wants to build Fiber reliability checks into their own app, the SDK is the part they would use.

It can:

- analyze payment intent
- check readiness
- explain payment timelines
- inspect CCH orders
- plan dry-run rebalancing
- load fixture scenarios
- normalize Fiber-style data

### CLI

Location:

- [packages/cli/](packages/cli/)

The CLI is the command-style interface.

CLI means command-line interface. It is for developers and operators who like asking questions from a terminal.

The planned command name is:

```bash
fiber-doctor
```

The command concepts are:

- `can-pay`: check whether a payment looks ready
- `explain-payment`: explain what happened to a payment
- `cch`: inspect a cross-chain order
- `liquidity`: summarize balance direction problems
- `node-health`: check node-related readiness signals

Current status:

- command behavior is implemented and tested inside the package
- fixture mode is the safest path
- final global binary packaging may still need polish before public release

### Reliability Lab

Location:

- [packages/lab/](packages/lab/)

The Lab is the demo surface.

It helps people see example scenarios and understand the diagnostics visually or in rendered report form.

The Lab is meant to show the SDK's value. It is not meant to become the main product.

Safe default:

- use fixture data
- do not expose public live RPC access
- keep the hosted demo clearly labeled as simulated/demo data

---

## 8. What Is A Fixture?

A fixture is a saved example.

In this repo, a fixture describes a Fiber payment situation.

For example:

- a successful payment
- a payment with no route
- a payment where the graph is not synced
- a payment where the channel is closed
- a cross-chain order that is stuck

Fixtures live here:

- [fixtures/scenarios/](fixtures/scenarios/)

Fixtures are important because they let the project demonstrate real behavior without needing a live Fiber node every time.

They are used by:

- SDK tests
- CLI tests
- Lab scenarios
- demo explanations

The project is **fixture-first**. That means fixtures are the shared examples that keep the SDK, CLI, Lab, and tests aligned.

---

## 9. A Simple Example

Imagine you are trying to send a Fiber payment.

The payment fails.

Without this project, you might only see something like:

```text
PathFind error: no path found
```

That error is not very friendly.

Fiber Reliability Kit tries to turn it into something more useful:

```text
Diagnostic: NO_ROUTE
Severity: error
Meaning: The network does not currently have a usable path for this payment.
Evidence: routeAvailable is false for the target peer.
Next action: Check graph sync, peer connectivity, channel readiness, and liquidity.
```

That is the core idea.

---

## 10. What Is CCH?

CCH means Cross-Chain Hub.

For a beginner, think of CCH as a flow that helps connect payments across different networks.

Cross-chain flows can fail or become unsafe because:

- the order is stuck
- the fee budget is too low
- the expiry window is too short
- one side of the payment has moved but the other side has not recovered correctly

Fiber Reliability Kit includes CCH diagnostics so operators can see when a cross-chain order needs attention.

---

## 11. What Is RPC?

RPC means Remote Procedure Call.

That sounds fancy, but it simply means:

> one program asks another program for information or asks it to do something.

In Fiber, an RPC call might ask:

- what node am I?
- which peers am I connected to?
- what channels do I have?
- what payments exist?
- what invoices exist?
- what is the route status?

This repo can work with Fiber-style RPC data, but the safest beginner path is fixture mode.

Important safety rule:

Do not expose a Fiber node RPC endpoint publicly just to host a demo.

---

## 12. What You Can Run First

From the repo root:

```bash
corepack pnpm install
```

Then run:

```bash
corepack pnpm test
corepack pnpm typecheck
```

What these commands mean:

- `pnpm install` downloads the project dependencies
- `pnpm test` runs the automated tests
- `pnpm typecheck` checks TypeScript correctness

If tests and typecheck pass, the repo is in a healthy development state.

---

## 13. What To Read First

If you are new, read in this order:

1. [ONBOARDING.md](ONBOARDING.md)
2. [README.md](README.md)
3. [SUBMISSION_SUMMARY.md](SUBMISSION_SUMMARY.md)
4. [TECHNICAL_BREAKDOWN.md](TECHNICAL_BREAKDOWN.md)
5. [ROADMAP.md](ROADMAP.md)
6. [CLAUDE.md](CLAUDE.md)

You do not need to read every code file immediately.

Start by understanding the problem and the shape of the solution.

---

## 14. Beginner Tour Of The Repo

Start with these files and folders:

### Project overview

- [README.md](README.md)

This explains what the project is and what is currently working.

### Submission summary

- [SUBMISSION_SUMMARY.md](SUBMISSION_SUMMARY.md)

This is the short hackathon-facing explanation.

### Technical breakdown

- [TECHNICAL_BREAKDOWN.md](TECHNICAL_BREAKDOWN.md)

This explains the SDK, CLI, and Lab in more technical terms.

### Roadmap

- [ROADMAP.md](ROADMAP.md)

This lists current limitations and what should improve next.

### Fixtures

- [fixtures/scenarios/](fixtures/scenarios/)

This is the best folder for learning by example.

Good beginner fixtures:

- [fixtures/scenarios/happy-payment.json](fixtures/scenarios/happy-payment.json)
- [fixtures/scenarios/no-route.json](fixtures/scenarios/no-route.json)
- [fixtures/scenarios/graph-not-synced.json](fixtures/scenarios/graph-not-synced.json)
- [fixtures/scenarios/insufficient-outbound-liquidity.json](fixtures/scenarios/insufficient-outbound-liquidity.json)
- [fixtures/scenarios/cch-order-stuck.json](fixtures/scenarios/cch-order-stuck.json)

---

## 15. Important Code Areas

You do not need to understand all of these on day one. This list is here so you know where things live.

### SDK entry point

- [packages/sdk/src/index.ts](packages/sdk/src/index.ts)

### Diagnostics

- [packages/sdk/src/domains/diagnostics/taxonomy.ts](packages/sdk/src/domains/diagnostics/taxonomy.ts)

This is where diagnostic codes are described.

### Readiness checks

- [packages/sdk/src/domains/readiness/check-readiness.ts](packages/sdk/src/domains/readiness/check-readiness.ts)

This checks peer, graph, channel, liquidity, fee, expiry, and route readiness.

### Payment explanation

- [packages/sdk/src/domains/payment-timeline/explain-payment.ts](packages/sdk/src/domains/payment-timeline/explain-payment.ts)

This explains payment outcome timelines.

### CCH inspection

- [packages/sdk/src/domains/cch/inspect-cch-order.ts](packages/sdk/src/domains/cch/inspect-cch-order.ts)

This checks cross-chain order health.

### CLI command execution

- [packages/cli/src/commands/execute-cli-command.ts](packages/cli/src/commands/execute-cli-command.ts)

This is where command behavior is wired.

### Lab rendering

- [packages/lab/src/app/render-lab-app.ts](packages/lab/src/app/render-lab-app.ts)
- [packages/lab/src/app/render-lab-document.ts](packages/lab/src/app/render-lab-document.ts)

These build the demo output.

---

## 16. What The Diagnostics Mean

Here are some common diagnostic codes in plain English.

### `NO_ROUTE`

The payment cannot find a usable path through the network.

What to check:

- graph sync
- peer connection
- channel readiness
- liquidity

### `CHANNEL_NOT_READY`

There is a channel, but it is not ready to carry payments yet.

What to do:

- wait for the channel to finish opening
- check channel state

### `CHANNEL_CLOSED`

The channel is closed and cannot be used for this payment.

What to do:

- use another channel
- open a new channel if needed

### `INSUFFICIENT_OUTBOUND_LIQUIDITY`

The payer does not have enough usable balance to send the payment.

What to do:

- reduce the amount
- add liquidity
- rebalance channels

### `INSUFFICIENT_INBOUND_LIQUIDITY`

The receiver may not have enough capacity to receive the payment.

What to do:

- receiver may need inbound liquidity
- route through a better channel
- use a liquidity provider if available

### `FEE_CAP_TOO_LOW`

The payment route costs more than the allowed fee.

What to do:

- raise the fee cap
- find a cheaper route

### `EXPIRY_UNSAFE`

The payment does not have enough safe time margin.

What to do:

- use a safer route
- increase expiry limits if appropriate

### `CCH_ORDER_STUCK`

A cross-chain order appears stuck.

What to do:

- inspect order state
- check related payment state
- review operator recovery steps

---

## 17. How To Explain The Project To A Non-Technical Person

Use this:

> Fiber Reliability Kit is like a health-check tool for Fiber payments. It helps tell whether a payment is ready, why it might fail, and what someone should do next.

Even shorter:

> It turns confusing Fiber payment problems into clear explanations.

---

## 18. How To Explain The Project To A Developer

Use this:

> Fiber Reliability Kit is a TypeScript SDK, CLI, and demo Lab for converting Fiber RPC-style state and fixture scenarios into machine-readable diagnostics, severity, evidence, and recovery actions.

The key point:

> It is infrastructure that other Fiber tools can reuse.

---

## 19. How To Demo It

A simple demo order:

1. Start with the problem: Fiber payments can fail for many reasons.
2. Explain the solution: this repo turns failure states into diagnostics.
3. Show a happy fixture: `happy-payment`.
4. Show a route failure: `no-route`.
5. Show a liquidity failure: `insufficient-outbound-liquidity`.
6. Show a cross-chain issue: `cch-order-stuck`.
7. Explain that the same scenarios drive SDK tests, CLI behavior, and Lab output.

Keep the demo honest:

- fixture mode is the default
- live/local RPC is optional
- hosted demo data should be simulated
- this is not a public RPC gateway

---

## 20. Hosting The Lab Safely

If you host the Lab, host it as a fixture-driven demo.

Safe choices:

- use fixture/demo data
- label the data as simulated
- keep local RPC disabled by default
- do not expose a public Fiber node RPC bridge

Unsafe choices:

- letting public users query a private/local Fiber node
- pretending the demo is a production wallet
- enabling live RPC automatically

Before hosting, verify the current Lab build and deployment path in the repo. If the browser build needs more work, treat that as a pre-submission task rather than a beginner responsibility.

---

## 21. Current Limitations In Simple Terms

This project is useful, but it is not finished as a production system.

Current limitations include:

- fixture mode is more mature than live mode
- real Fiber invoice decoding still needs deeper upstream integration
- live RPC checks need more coverage
- the CLI behavior is tested, but final binary packaging may need polish
- the Lab is a demo surface, not a production app

This is normal for a hackathon infrastructure project.

The important thing is that the project has a clear direction and a reusable core.

---

## 22. Beginner Glossary

### Blockchain

A shared record of transactions.

### CKB

The blockchain ecosystem Fiber is built around.

### Fiber

A payment-channel network for faster, cheaper payments around CKB.

### Node

Software that connects to the network.

### Peer

Another node your node is connected to.

### Channel

A payment connection between nodes.

### Route

The path a payment takes through one or more channels.

### Liquidity

Usable balance in the right direction.

### Invoice

A payment request.

### Diagnostic

A named finding that explains a problem or status.

### Severity

How serious a diagnostic is.

### Evidence

The data that explains why a diagnostic appeared.

### Recovery action

A suggested next step.

### Fixture

A saved example scenario used for tests and demos.

### SDK

Reusable code that other developers can build with.

### CLI

A command-line tool.

### RPC

A way for one program to ask another program for data or actions.

### CCH

Cross-chain hub/order flow used for cross-chain payment scenarios.

---

## 23. If You Only Remember Five Things

1. Fiber helps payments move faster and cheaper through channels.
2. Fiber payments can fail for many reasons.
3. This repo explains those failures clearly.
4. Fixtures are saved scenarios used for tests, CLI output, and the Lab.
5. This project is infrastructure for other Fiber tools, not a wallet.

---

## 24. First 10 Minutes Checklist

If you only have 10 minutes:

1. Read the one-minute explanation at the top of this file.
2. Open [README.md](README.md).
3. Open [fixtures/scenarios/happy-payment.json](fixtures/scenarios/happy-payment.json).
4. Open [fixtures/scenarios/no-route.json](fixtures/scenarios/no-route.json).
5. Run:

   ```bash
   corepack pnpm test
   corepack pnpm typecheck
   ```

If you understand why `happy-payment` is good and `no-route` is bad, you already understand the heart of the project.
