---
name: add-baseline
description: Adopts a strict rule while existing violations stay, with a baseline that only shrinks. Use when a rule keeps being broken, after a defect class is found, or when asked to stop a pattern from spreading.
---

# Add a guard with a baseline

A guard with a baseline fails every new violation of a rule and lets today's violations stay, listed in a baseline that only shrinks.

1. **Write the rule first**, in its one home: `CLAUDE.md` § Hard rules, or the `.claude/rules/` file for the paths it covers, and name the guard under that rule's § Enforced by. Done when the rule reads as an instruction with its reason.
2. **Write the guard** in `scripts/checks/guards/` under the contract in `scripts/checks/README.md`: its failure message is the fix, and its fixture makes it fail. Done when `make guards` shows the self-test PASS.
3. **Create the baseline**: `node scripts/checks/run.js --init-baseline <name>`. Done when the real run passes with today's violations listed.
4. **Record it**: a `DECISIONS.md` line naming the rule, the guard and today's count, and the guard's files in `.github/CODEOWNERS`. Baselines shrink fast only in deliberate campaigns, so the PR body says when the count should reach zero.
