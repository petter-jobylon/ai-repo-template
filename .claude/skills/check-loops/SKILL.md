---
name: check-loops
description: Checks that every scheduled agent (loop) in .claude/loops.md is actually running, and starts the ones that are not. Use at the start of a session in a repo with loops, after changing a loop, or when a loop seems quiet.
---

# Check loops

A loop that was built but never switched on fails silently. This check makes it visible.

1. **Read the registry** in `.claude/loops.md`: each loop's name, schedule and how to see its last run. Done when you have the list.
2. **Classify each loop** by its last run against its schedule:
   - **live**: ran within its interval;
   - **due**: not yet expected to run;
   - **dead**: missed its interval;
   - **never ran**: no run at all.
3. **Run each dead or never-ran loop once by hand**, then re-check it. A loop that still won't run is reported with its error.
4. **End with one line**: `ALL LOOPS LIVE`, or `NOT LIVE: <loop>, <loop>` and what each one needs (a schedule created, a secret, a permission). Done when that line is your final output.
