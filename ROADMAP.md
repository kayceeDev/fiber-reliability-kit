# Near-term roadmap

1. Expand the canonical fixture corpus further for pending TLC settlement, CCH recovery, and broader multi-hop routing cases.
2. Improve diagnostic evidence generation so reports expose richer observed state instead of minimal placeholders.
3. Deepen local read-only live checks against operator-provided Fiber RPC nodes.
4. Add a richer browser-facing Lab presentation layer if the packaged HTML shell proves too limiting.
5. Finalize hosted demo packaging and final submission polish.

# Current limitations

- The Reliability Lab is now rendered and packaged as HTML, but it is still a lightweight document surface rather than a full browser framework app.
- Some CLI command paths still rely on curated fixture selection for known payment hashes instead of generalized fixture lookup.
- Real Fiber invoice decoding is not yet wired to upstream protocol parsing.
- Payment explanation and CCH inspection are domain-level classifiers, not full live-node history reconstructions.
- Rebalance planning is dry-run only and does not execute any routing action.
- Local RPC mode is explicitly limited to localhost / 127.0.0.1 endpoints.
