---
name: claim-sweep
description: Tests what the agent docs claim about the code against the code, and fixes the stale claims. Use on a schedule, after a large refactor or cleanup, or when an agent followed a doc into a wrong turn.
---

# Claim sweep

The `instruction-refs` guard catches broken paths and make targets. A **claim** is what it can't catch: a statement about code that still exists but no longer says what the doc says, such as a signature, a default, a flag or a count.

1. **List the claims** each agent doc that `instruction-refs` scans makes about this repo's code, with line numbers. Vendored skills and outside docs are out of scope.
2. **Check each claim by reading the code it describes**, not from memory: it holds, is stale (say what the code says now) or can't be verified.
3. **Fix each stale claim in its one home** (`CLAUDE.md` § Rules), and delete restatements of what the code already says. Done when no stale claim is left, or each one left has a ticket.
