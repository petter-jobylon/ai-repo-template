---
paths:
  - "__fill-in__/**"  # replace with the globs this rule covers, e.g. "tests/**" or "**/test_*.py"
---

# Tests

<!-- How tests are named and laid out per seam (CLAUDE.md § Tests), and which helpers and fixtures to use. -->

Each layer below catches what the others can't. The file name or marker says which layer a test is in, so an agent picks the layer by naming the file.

- **Real-store tests** (`make test-db`) run against the real engine, not a mock: they catch what a mock accepts and the engine refuses, such as constraints, permissions and query shapes. A test that the store refuses a bad write is the normal case, not an extra.
- **Sweep tests** read the whole set from the source, such as the database catalog, the route table or the tool registry, and fail for any member that breaks a rule. A new table, route or tool is then checked even if its author never opens the test.
- **Parity tests** cover a fact that lives in two places that can't share code (two endpoints for one action, application code and a database rule, a translation key set per language). The test reads both sides, and its failure names the side to edit.
- **Performance budgets** are test assertions that fail when the code is slower, not sentences in a doc.
- **Flaky tests** get one rerun to confirm. A test that fails and then passes gets a ticket and a fix in this PR or the next; it is never skipped, quarantined or deleted to get green.

## Enforced by

<!-- The guards, sweep and parity tests this repo has, one line each with its file. -->
