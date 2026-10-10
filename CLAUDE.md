# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- One paragraph: what this repo is, and where its glossary (CONTEXT.md) and decisions (docs/adr/, DECISIONS.md) live. -->

## Hard rules

<!-- The few invariants every change must keep, one numbered line each with its reason. End each with what enforces it: a check, a test or a database constraint, or "soft: no check yet". Promote a soft rule to a check once it has been skipped. -->

## Stop and ask

Stop and ask; do not guess. <!-- The areas where a wrong guess is expensive (e.g. production data, money, auth, legal rules) and who decides each. -->

## Commands

`make help` lists the targets (`setup`, `check`, `lint`, `typecheck`, `test`, `test-db`, `guards`, `generate`, `generate-check`, `build`). CI, hooks and loops call only these, so a target's body is the one place a command lives.

<!-- Commands make doesn't cover, from the repo root: how to run one test while iterating. -->
<!-- Preview (used by /next-step's screenshot step): the one command that serves the app locally with demo data, and its URL. Delete this line if the repo has no UI. -->

## Architecture

<!-- The big picture an agent can't get from one file: the main modules, how data flows between them, where state lives. -->

## Tests

<!-- The seams tests go through (e.g. "HTTP request → rendered response"), one line each with its test file. /tdd, /to-spec and /next-step's Bug flow test only at these; name which seam covers rendered output. -->

Don't mock our own modules or add tests at other seams. A new seam needs this section updated through `/grill-with-docs` first.

## Fix from first principles

A reported problem usually arrives with a proposed fix. Treat that fix as evidence about the pain, and answer three questions before implementing; the answers go in the PR body:

1. **Why did the problem occur?** Name the mechanism, then fix at the level that stops the whole class of bug.
2. **What could be removed or simplified instead?** Fewer states and less code win unless something concrete needs more.
3. **Is this the best solution, or just the proposed one?** Write down the alternative you considered and why you did not take it.

When the chosen path differs from the one the issue proposed, log it (§ Decisions).

## Definition of Done

A change is done when all of these hold; iterate until they do:

1. `make check` passes: lint, typecheck, tests, real-data-store tests, guards, generated files and build.
2. New or changed behaviour has tests at the seams in § Tests.
3. Every rule, guard and agent doc the change made stale is updated in the same change.
4. Each non-obvious choice has its line in `DECISIONS.md` (§ Decisions).
5. The last mile is verified: whatever was built is confirmed switched on in its target environment (migration applied, scheduled job seen firing, script run, feature reachable). If switch-on has to wait, the final output names exactly what is not live yet and who turns it on.
6. The PR body answers the three questions in § Fix from first principles.

## Decisions

Two tiers, so every non-obvious choice is recorded somewhere:

- **ADR** (`docs/adr/`, via `/domain-modeling`): a choice that is hard to reverse, surprising without context and a real trade-off.
- **`DECISIONS.md` line** for every other non-obvious choice: picked A over B, declined a dependency, declined a review finding, stopped because a rule forbade something, diverged from the issue's proposal. One line of at most 300 characters: `[YYYY-MM-DD] <decision>: <why>`; the `decisions-format` guard fails any other shape or a longer line. The detail goes in the PR body.

The ADR criteria decide which tier a choice goes in; a choice that misses them gets a `DECISIONS.md` line. Grep `DECISIONS.md` and `docs/adr/` before reopening a past choice. A question parked for a person gets `[YYYY-MM-DD] ESCALATED: <question> -> <who>`, and later `[YYYY-MM-DD] RESOLVED <escalated date>: <answer>`. Completed months move to `docs/decisions/YYYY-MM.md`.

## Rules

This file holds what every session needs; keep it under about 120 lines. A rule that applies to part of the tree lives in `.claude/rules/<area>.md`, which loads automatically when a file matching its `paths:` header is touched. Each rule has one home: here or in one rule file. `AGENTS.md` and other docs link to it. A rule that must always hold gets a guard in `scripts/checks/` (contract in its `README.md`, steps in the `add-baseline` skill), and its failure message names the fix.

<!-- One line per rule file: `.claude/rules/<area>.md`: what it covers (the paths it loads for). Delete rule files this repo doesn't need. -->

## Workflow

<!-- Branch naming, e.g. "<issue-id>-<slug>, or <slug> without an issue". -->
<!-- Where research goes, e.g. "docs/research/<topic>.md". -->
<!-- What deploys the default branch, if anything. -->

- Shared agent setup lives in the repo: settings, hooks, skills, rules and plans. A method the team relies on gets committed as one of those; personal settings stay in `.claude/settings.local.json`.
- Guardrail work outranks ponytail: a test, check, rule update or `DECISIONS.md` line that the Definition of Done, a rule or a guard requires is part of the change. Ponytail decides how much product code to write.
- Mark deliberate shortcuts with a `ponytail:` comment naming the limit and the upgrade path.
- When a skill (e.g. `/tdd`'s seam check, the grilling skills) or the org's rules say to ask first, ask: that outranks ponytail's "never stall on an answer you can default".
- Ponytail's "one runnable check" here is one test at one of the seams (§ Tests), run by the repo's test runner: no `demo()`, `__main__` or stray test files.
- Output a loaded skill or `/next-step` flow asks for (a checklist, a ranked list, a command and its output) counts as explicitly requested, so ponytail's three-line limit doesn't apply to it.
- A design-it-twice brief (`codebase-design`) outranks ponytail for that subagent: its job is to explore a different shape.

## Where the skills come from

Everything under `.claude/skills/`, `.claude/agents/impeccable-*` and `.claude/hooks/ponytail-*` is vendored by `scripts/vendor-skills.sh` (see `skills-lock.json`); never edit those files, since a re-run replaces them. The hand-written skills are `next-step` (model-invoked on purpose so the agent can pick a flow itself) and `add-baseline`; their names stay out of `skills-lock.json`, so a re-vendor leaves them alone.

<!-- UI repos: "UI work follows DESIGN.md and PRODUCT.md", once Impeccable has written them. -->

<!-- /setup-matt-pocock-skills adds the "## Agent skills" section below (issue tracker, triage labels, domain docs). -->
