---
name: guardrail-from-incident
description: Turns a fixed bug or incident into a guard for its whole class, so the same mistake fails a check next time. Use after a bug fix, a production incident, a review finding that could recur, or a rule an agent broke.
---

# Guardrail from an incident

One PR carries three things: the fix, a guard sized to the whole class of the defect, and a `DECISIONS.md` line. A guard that waits for a second occurrence arrives weeks late.

1. **Name the mechanism**, not the symptom (`CLAUDE.md` § Fix from first principles, question 1). Done when you can say in one sentence why this code allowed the defect.
2. **Find the class**: every place the same mechanism could produce the same defect. Many siblings → run `sibling-sweep` first. Done when the class has a boundary you can write a check for.
3. **Pick the cheapest guard that covers the whole class**, in this order:
   1. a type that makes the defect unrepresentable;
   2. a data-store constraint (`CLAUDE.md` § Hard rules 1);
   3. a sweep test that enumerates the set (`.claude/rules/tests.md`);
   4. a pattern or guard in `scripts/checks/`, with a baseline if old violations remain (`add-baseline`);
   5. a rule line, only when nothing above can express it.

   Done when the choice is made and the rejected options are named in the PR body.
4. **Prove the guard fires**: it fails on the defect before the fix (a fixture, a `failing_example`, or the regression test run red). Done when you have seen it red.
5. **Its message names the fix**, and the rule it enforces names it under § Enforced by.
6. **Log it**: `[YYYY-MM-DD] <defect class> now caught by <guard>: <mechanism>`.
