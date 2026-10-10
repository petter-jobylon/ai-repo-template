---
paths:
  - "__fill-in__/**"  # replace with where scripts that touch shared or production data live, e.g. "scripts/ops/**" or "*/management/commands/**"
---

# Scripts that change shared or production data

Every such script follows one contract, whatever its language:

1. **Dry run by default.** With no flags it changes nothing: it prints the plan, each row or object it would change and how, in a stable order.
2. **Execute only the reviewed plan.** `--execute` needs `--approved-hash=<sha256 of the dry-run output>`. The script recomputes the plan and refuses if the hash differs, so what runs is exactly what a person reviewed.
3. **Target named explicitly.** The environment comes from a required flag or variable, never a default; the script prints it first. A local `.env` that points at production is a stop-and-ask (`CLAUDE.md` § Stop and ask).
4. **Leave a record.** After executing, write who ran it, the hash, and the counts to the log or audit trail named in § Enforced by.

The recipe in `docs/agents/recipes/` shows a working example for its stack.

## Enforced by

<!-- The check, test or review step that fails when a script skips this contract. "None yet" marks it soft. -->
