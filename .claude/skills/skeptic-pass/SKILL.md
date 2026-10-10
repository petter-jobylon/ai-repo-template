---
name: skeptic-pass
description: Has two or three independent agents try to refute a finished change before its PR, each through one lens. Use before the PR on changes that touch a stop-and-ask area, money, auth, data deletion, or anything hard to undo.
---

# Skeptic pass

A **skeptic** tries to prove the change wrong. Agreement is not its job, so each one gets a different lens and no view of the others' answers.

1. **Freeze the head**: commit the change and note the SHA. Every skeptic reviews that SHA, and nothing is pushed until the pass ends. Done when the SHA is in your notes.
2. **Start two or three subagents in parallel**, each with the diff against the merge base, the spec or ticket, `CLAUDE.md` and the matching `.claude/rules/` files, and one lens:
   - **correctness**: inputs and states where the new code gives a wrong result;
   - **regression**: existing behaviour or callers the change breaks;
   - **safety**: auth, data loss, money, personal data, or a stop-and-ask rule.

   Each returns counterexamples as concrete inputs or sequences, or "none found" with what it tried.
3. **Turn each valid counterexample into a test** that fails at the frozen SHA, then fix it. Done when every valid counterexample has a red-then-green test.
4. **Answer the rest**: a counterexample you reject gets a `DECISIONS.md` line with the reason.
5. **Stop rule**: at most two rounds. If round two still finds valid counterexamples, stop and ask the user; the design probably needs another look.
