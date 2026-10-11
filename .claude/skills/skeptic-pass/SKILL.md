---
name: skeptic-pass
description: Has two or three independent agents try to refute a finished change before its PR, each through one lens. Use before the PR on changes that touch a stop-and-ask area, auth, payments, data deletion, or anything hard to undo.
---

# Skeptic pass

A **skeptic** tries to prove the change wrong. Agreement is not its job, so each one gets a different lens and no view of the others' answers.

1. **Freeze the head**: commit, and note the SHA every skeptic reviews.
2. **Start two or three subagents in parallel**, each with the diff against the merge base, the spec or ticket, `CLAUDE.md`, the matching `.claude/rules/` files and one lens:
   - **correctness**: inputs and states where the new code gives a wrong result;
   - **regression**: existing behaviour or callers the change breaks;
   - **safety**: auth, data loss, payments, personal data, or a stop-and-ask rule.

   Each returns counterexamples as concrete inputs or sequences, or "none found" with what it tried.
3. **Turn each valid counterexample into a test** that fails at the frozen SHA, then fix it. A counterexample you reject is a declined finding (`CLAUDE.md` § Decisions).
4. **Stop after two rounds**: if round two still finds valid counterexamples, stop and ask the user; the design probably needs another look.
