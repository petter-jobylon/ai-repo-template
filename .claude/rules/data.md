---
paths:
  - "__fill-in__/**"  # replace with the globs this rule covers, e.g. "migrations/**" or "*/models.py"
---

# Data model and migrations

<!-- Name the system of record (e.g. PostgreSQL), the caches and queues beside it (e.g. Redis), and where migrations live. Delete this file if the repo has no data store. -->

- **Schema changes are new migrations.** A shipped migration is never edited; a fix is the next migration.
- **The store enforces the rule** (`CLAUDE.md` § Hard rules 1) for every writer, scripts and workers included: a constraint, trigger, schema validation or permission in the migration that introduces it, whose error names the allowed path ("use X instead"). Application code may check it too, for a friendlier error; the store is what refuses. A real exception is a named, logged path, not a bypass role.
- **A data-store rule ships with a real-store test** that makes the bad write and asserts the refusal (`.claude/rules/tests.md`). A migration that needs none says `db-test: skip <reason>`.
- **Caches and queues hold nothing that must survive a flush.** A value whose loss breaks a rule belongs in the system of record.

## Enforced by

- `db-test-required` guard, once `scripts/checks/db-test-required.json` exists (the stack recipe has one).
<!-- The catalog sweep tests (.claude/rules/tests.md) that check every table, function or collection, one line each. -->
