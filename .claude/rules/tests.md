---
paths:
  - "__fill-in__/**"  # replace with the globs this rule covers, e.g. "tests/**" or "**/test_*.py"
---

# Tests

<!-- How tests are named and laid out per seam (CLAUDE.md § Tests), and which helpers and fixtures to use. -->

Each layer below catches what the others can't. The file name or marker says which layer a test is in, so an agent picks the layer by naming the file.

- **Unit and integration tests** (`make test`) run at the seams in `CLAUDE.md` § Tests.
- **Real-store tests** (`make test-db`) run against the real engines: every migration replayed from empty, then the test. They catch what a mock accepts and the engine refuses: constraints, triggers, permissions, query shapes. `make test-db` starts the stores and stops them, so it runs the same on a laptop, in CI and in a cloud session. A test that the store refuses a bad write is the normal case, not an extra.
- **Sweep tests** read the whole set from the source, such as the database catalog, the route table or the tool registry, and fail for any member that breaks a rule. A new table, route or tool is then checked even if its author never opens the test.
- **Parity tests** cover a fact that lives in two places that can't share code (two endpoints for one action, application code and a database rule, a translation key set per language). The test reads both sides, and its failure names the side to edit.
- **Pinned reference data**: official tables the product depends on (tax codes, country lists, rate tables) are stored as data files from the official source, with its date. A test checks every value the product emits against them, and another checks the facts a skill states against the code's constants.

## Enforced by

- `db-test-required` guard: a migration change needs a real-store test (`.claude/rules/data.md`).
<!-- The sweep and parity tests this repo has, one line each with its file. -->
