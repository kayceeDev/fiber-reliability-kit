## Coding Style & Principles

### Test-Driven Development

- Scaffold tests first: define failing tests, passing tests, and edge case scenarios
- Before writing code, simulate runs with sample data to verify all passing/failing tests account for edge cases
- Use tests as a checklist while coding to ensure coverage

### Function Design

- **Naming:** Use existing domain vocabulary for consistency
- **Size:** Small and testable
- **Composability:** Prefer small, composable, testable functions over monolithic ones
- **Language:** Modern TypeScript exclusively
- **Comments:** Only for critical caveats — code should be self-explanatory
- **Extraction:** Extract a new function only if (a) it will be reused elsewhere, OR (b) it's the only way to unit test it

### Database Interactions

- Always show the raw SQL query and rationale
- Explain join choices (LEFT vs INNER vs RIGHT) and why
- Provide context for query design decisions

### Module Organization

- Use **Actor + Domain** construct for module breakdown
- Don't create modules without clear context or purpose
- Module structure must align with the overall paradigm

### Code Review Checklist

Before submitting code, verify:

1. **Readability** — Can you easily follow what the function does?
2. **Cyclomatic Complexity** — Is nesting/branching excessive? High complexity = suspect
3. **Data Structures & Algorithms** — Could common DSA patterns simplify this?
4. **Parameters** — No unnecessary type casts or unused parameters; values that should be arguments?
5. **Testability** — Can it be unit tested without mocking core deps (SQL, Redis)? If not, is it suitable for integration testing?
6. **Dependencies** — Are there hidden, untested dependencies? Can values be factored out as arguments?
7. **Naming** — Brainstorm 3 alternatives; is the current name the best and consistent with the codebase?
8. **Extraction Rationale** — Don't extract unless: reused in multiple places, enables unit testing, or original is too complex without comments

### General Principles

- **DRY:** Everything should be composable and reusable
- **Extensibility:** Write with future extension in mind
- **Scalability & Reliability:** Design for scale and robustness from the start

---

## Workflow & Planning

### Pre-Implementation Planning

**Never start coding without a solid plan.** For any feature — trivial or complex:

1. **Gather Context** — Understand the feature, review integration points, check architectural consistency
2. **Plan Architecture** — Define data structures, function signatures, types, system components, and schema changes
3. **Simulate Edge Cases** — Walk through failing and passing scenarios, identify boundary conditions, test against current behavior
4. **Check for Breaking Changes** — Does this break existing functionality? Do new data structures conflict with current schema? If breaking: plan migration scripts or refactor current database state
5. **Clarify Before Acting** — Ask all clarification questions upfront. Do not make assumptions.

### Planning Loop (Iterative Validation)

Cycle through checks like backpropagation:

- **Internal consistency:** Will this break existing flows?
- **Data flow:** Will data propagate correctly through the system?
- **Integration points:** How does this interact with dependent systems?
- **Edge cases:** Have we covered all failure modes?

### Usability & Completeness

- Consider user workflows: What if someone abandons mid-flow?
- Can the system resume from abandonment points?
- Design for graceful state recovery, not just happy paths
- Incomplete actions should not block future actions

### Milestone-Driven Delivery

Every task — no matter how small — must be broken into **tiny, single-commit-sized milestones**. Each milestone is a discrete, testable unit of work.

**Milestone structure:**

1. **Define** — Clear description of what this milestone delivers
2. **Test criteria** — Split into:
   - **Automated** (Claude runs): unit tests, integration tests, linting, type checks
   - **Manual** (Engineer verifies): API behavior, UI flow, data correctness, edge cases in real environment
3. **Implement** — Write the code for this milestone only
4. **Verify** — Claude runs all automated tests and reports results
5. **Gate** — Engineer manually verifies and gives explicit approval
6. **Commit** — Single commit for this milestone
7. **Proceed** — Only after both automated and manual tests pass

**Rules:**
- Never skip ahead to the next milestone without approval on the current one
- If automated tests fail, fix before requesting manual verification
- If manual verification fails, fix and re-run automated tests before re-requesting
- Each milestone should be independently deployable where possible
- Milestones should be ordered so earlier ones don't depend on later ones

### Validation Gate

Only begin implementation after confirming:

- Edge case simulations
- Breaking change analysis
- Integration consistency
- Usability scenarios
- Milestone breakdown with test criteria for each

---