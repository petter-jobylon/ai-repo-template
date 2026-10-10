---
name: claim-sweep
description: Tests what the agent docs claim about the code against the code, and fixes the stale claims. Use on a schedule, after a large refactor or cleanup, or when an agent followed a doc into a wrong turn.
---

# Claim sweep

The `instruction-refs` guard catches broken paths and make targets. A **claim** is what it can't catch: a statement about code that still exists but no longer says what the doc says. Examples are a function signature in a sample, a table a rule lists, a default value, a command's flags, the number of something.

1. **List the docs**: `CLAUDE.md`, `AGENTS.md`, every `.claude/rules/` file, every hand-written skill (folders `skills-lock.json` doesn't list) and `docs/agents/`. Done when the list matches what `instruction-refs` scans.
2. **Extract every claim** about this repo's code: names, signatures, tables, fields, defaults, counts, flags and behaviour. Vendored skills and links to outside docs are out of scope. Done when each doc has its claims listed with line numbers.
3. **Check each claim against the code** by reading the file it describes, not by memory. Mark it holds, stale (with what the code says now) or unverifiable.
4. **Fix every stale claim in its one home** (`CLAUDE.md` § Rules). Where the doc restated something the code already says, delete the restatement and point to the code. Done when no stale claim is left, or each one left has a ticket.
5. **Record the sweep**: one `DECISIONS.md` line with the date, the number of claims checked and the number fixed. Schedule the next one while there is still sediment.
