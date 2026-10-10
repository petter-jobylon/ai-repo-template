---
name: sibling-sweep
description: Finds every sibling of a defect across the codebase, fixes the whole class and leaves a detector behind. Use when a bug's mechanism could exist elsewhere, after an audit finding, or when one fix reveals a pattern.
---

# Sibling sweep

A **sibling** is another place where the same mechanism can produce the same defect. Fixing one instance while siblings remain is how the defect comes back.

1. **State the defect as a search**: the code shape, query, call or missing check that produces it. Done when the search finds the original instance.
2. **List every sibling** with that search, then read the near misses by hand. Done when each hit is marked sibling or not, with a reason for each "not".
3. **Fix the class.**
   - Under about ten siblings: fix them in this branch.
   - More: give each sibling or area its own subagent with the same brief. Each fix keeps its regression test, and the merge happens in waves so the branches stay reviewable.

   Done when every sibling is fixed or has a ticket.
4. **Leave a detector** so the next sibling fails a check (`guardrail-from-incident` step 3 picks which kind). Done when the detector's self-test fails on a planted sibling.
5. **Log it**: one `DECISIONS.md` line with the search, the count found and the count fixed.
