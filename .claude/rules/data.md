---
paths:
  - "__fill-in__/**"  # replace with the globs this rule covers, e.g. "migrations/**" or "*/models.py"
---

# Data model and migrations

<!-- Name the system of record (e.g. PostgreSQL), the caches and queues beside it (e.g. Redis), and where migrations live. -->

- **Schema changes are new migrations.** A shipped migration is never edited; a fix is the next migration.
- **The store enforces the rule** (`CLAUDE.md` § Hard rules 1). A rule that must hold for every writer becomes a constraint, trigger, schema validation or permission in the migration that introduces it, and its error message names the lawful path ("use X instead"). Application code may check it too, for a friendlier error; the store is what refuses.
- **No exception for admin roles.** Scripts, workers and admin tools hit the same rules as users. A real exception is a named, logged path, not a bypass role.
- **A data-store rule ships with a real-store test**: one that runs against the real engine, makes the bad write and asserts the refusal (`.claude/rules/tests.md`). The `db-test-required` guard fails a migration change without one, unless the migration carries `db-test: covered-by <test path>` or `db-test: skip <reason>`.
- **Caches and queues hold nothing that must survive a flush.** A value whose loss breaks a rule belongs in the system of record.

## Enforced by

- `db-test-required` guard (`scripts/checks/guards/db-test-required.js`), configured in `scripts/checks/db-test-required.json`.
<!-- The catalog sweep tests (.claude/rules/tests.md) that check every table, function or collection, one line each. -->
