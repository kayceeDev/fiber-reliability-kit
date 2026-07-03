# Near-term roadmap

1. Expand fixture corpus for route-not-found, pending TLC settlement, CCH recovery, and force-close scenarios.
2. Add richer CLI output formatting, snapshots, and exit-code semantics.
3. Add Lab rendering components for diagnostic cards, timelines, and route/liquidity panels.
4. Add local read-only live checks against operator-provided Fiber RPC nodes.
5. Prepare final hosted demo packaging and hackathon submission assets.

# Current limitations

- The hosted/demo Lab currently exposes view-model scaffolding rather than a full rendered application.
- CLI command execution is still fixture-oriented and intentionally thin.
- Real Fiber invoice decoding is not yet wired to upstream protocol parsing.
- Payment explanation and CCH inspection are domain-level classifiers, not full live-node history reconstructions.
- Rebalance planning is dry-run only and does not execute any routing action.
- Local RPC mode is explicitly limited to localhost / 127.0.0.1 endpoints.
