---
paths:
  - "__fill-in__/**"  # replace with where scripts that touch shared or production data live, e.g. "scripts/ops/**" or "*/management/commands/**"
---

# Scripts that change shared or production data

Every such script follows one contract, whatever its language. Delete this file if the repo has none.

1. **Dry run by default.** With no flags it changes nothing: it prints the plan, each row or object it would change and how, in a stable order.
2. **Execute only the reviewed plan.** `--execute` refuses to run anything but the plan a person reviewed; the recipe in `docs/agents/recipes/` checks a hash of the dry run.
3. **Target named explicitly.** The environment comes from a required flag or variable, never a default; the script prints it first. A local `.env` that points at production is a stop-and-ask (`CLAUDE.md` § Stop and ask).
4. **Leave a record.** After executing, write who ran it, what ran and the counts to the repo's log or audit trail.

## Enforced by

<!-- The check, test or review step that fails when a script skips this contract. "None yet" marks it soft. -->
