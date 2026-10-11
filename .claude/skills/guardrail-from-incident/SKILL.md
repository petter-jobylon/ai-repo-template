---
name: guardrail-from-incident
description: Fixes the whole class behind a bug or incident: finds every sibling of the defect and leaves a guard, so the same mistake fails a check next time. Use after a bug fix, a production incident, an audit or review finding that could recur, or a rule an agent broke.
---

# Guardrail from an incident

One PR carries the fix, its fixed siblings, a guard sized to the whole class and a `DECISIONS.md` line. A guard that waits for a second occurrence arrives weeks late.

1. **Name the mechanism**, not the symptom. Done when you can say in one sentence why this code allowed the defect.
2. **Find the siblings**: state the defect as a search (a code shape, call, query or missing check) that finds the original, then read the near misses by hand. Done when each hit is marked sibling or not, with a reason for each "not".
3. **Fix the class** in this branch; a sibling too big for this PR gets a ticket.
4. **Pick the cheapest guard that covers the whole class**, in this order, and name the rejected options in the PR body:
   1. a type that makes the defect unrepresentable;
   2. a schema or data-store constraint, where the stack has one;
   3. a sweep test that enumerates the set (`.claude/rules/tests.md`);
   4. a guard in `scripts/checks/`, with a baseline if old violations remain (`add-baseline`);
   5. a rule line, only when nothing above can express it.
5. **Prove the guard fires**: it fails on the defect before the fix. Done when you have seen it red.
6. **Log it**: `[YYYY-MM-DD] <defect class> now caught by <guard>: <mechanism>, <n> siblings fixed`.
