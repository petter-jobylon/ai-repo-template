---
name: add-baseline
description: Adopts a strict rule while existing violations stay, with a baseline that only shrinks. Use when a rule keeps being broken, after a defect class is found, or when asked to stop a pattern from spreading.
---

# Add a guard with a baseline

A guard with a baseline fails every new violation of a rule and lets today's violations stay, listed in a baseline that only shrinks. The guard contract is in `scripts/checks/README.md`.

1. **Write the rule first**, in its one home: `CLAUDE.md` § Hard rules, or the `.claude/rules/` file for the paths it covers. Add the guard to that rule's § Enforced by. Done when the rule reads as an instruction with its reason.
2. **Pick the shape.** A rule a regex can find (a forbidden call, import or literal) becomes an entry in `scripts/checks/patterns.json`. Anything needing real parsing becomes a guard in `scripts/checks/guards/`, in any language, following the contract. Done when the shape is chosen and the other one is ruled out in a sentence.
3. **Write the failure message as the fix.** It names the exact replacement: the helper to call, the lines to add, the command to run. Done when someone who has never seen the rule can fix a violation from the message alone.
4. **Prove it can fail.** A pattern gets a `failing_example`; a guard gets `scripts/checks/fixtures/<name>/`, laid out like a repo, that makes it fail. Done when `make guards` shows the self-test PASS.
5. **Create the baseline**: `node scripts/checks/run.js --init-baseline <name>`. Done when the real run passes with today's violations listed.
6. **Record it**: a `DECISIONS.md` line naming the rule, the guard and today's count, plus the guard's files in `.github/CODEOWNERS`.
7. **Plan the burn-down.** Baselines shrink fast only in deliberate campaigns. Put the count and a proposed campaign (one PR per area, `--shrink` after each) in the PR body. Done when the PR says when the count reaches zero, or why it stays.
