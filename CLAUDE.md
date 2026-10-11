# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- One paragraph: what this repo is, and where its glossary (CONTEXT.md) and decisions (docs/adr/, DECISIONS.md) live. -->

## Hard rules

1. **What must never break is refused, not requested**: a data-store constraint, a type or a guard enforces it, with no exception for admin roles. A cache or queue never holds such a rule.
2. **One way in per dangerous action** (deletion, permission changes, anything sent outside): one function or endpoint, and a guard or constraint refuses every other path.
3. **Fail closed**: when a check that decides access or correctness can't run, refuse and say why. Failing open needs a visible trace.
4. **Closed sets are exhaustive**: a new value fails the typecheck, or a test that enumerates the set, until every place handles it.
5. **A fact lives in one place**: a second copy is generated from it (`make generate`), or a parity test reads both and names the side to edit.
6. **Secrets stay out of the repo**: none in code, committed settings or `.env` files (only `.env.example`), and cloud environments hold only low-risk, tightly scoped tokens. Enforced by the `no-committed-secrets` guard.

<!-- After each rule above, name what enforces it in this repo (a guard, a test, a constraint), or "soft: no check yet". Then add this repo's own invariants, one numbered line each with its reason. Promote a soft rule to a check once it has been skipped. -->

## Stop and ask

Stop and ask; do not guess. How agents reach tickets, logs, errors and metrics, and what they may not touch there: `docs/agents/agent-access.md`. <!-- The areas where a wrong guess is expensive (e.g. production data, auth, payments) and who decides each. -->

## Commands

`make help` lists the targets, and `make check` runs what CI runs. CI, hooks and loops call only make targets, so a target's body is the one place a command lives.

<!-- Commands make doesn't cover, from the repo root: how to run one test while iterating. -->
`make up` serves the app with its services (run it in the background), and `make seed` loads demo data. <!-- The URL `make up` serves, used by /next-step's screenshot step. Delete this line if the repo has no UI. -->

## Architecture

Layers, dependency direction and the one interface per cross-cutting concern: `ARCHITECTURE.md`, enforced by the `layers` guard.

<!-- The big picture an agent can't get from one file: the main modules, how data flows between them, where state lives. -->

## Tests

<!-- The seams tests go through (e.g. "HTTP request → rendered response"), one line each with its test file. /tdd, /to-spec and /next-step's Bug flow test only at these; name which seam covers rendered output. -->

Don't mock our own modules or add tests at other seams. A new seam needs this section updated through `/grill-with-docs` first.

## Fix from first principles

A reported problem usually arrives with a proposed fix. Treat that fix as evidence about the pain, not the plan: before implementing, answer the three questions under First principles in `.github/pull_request_template.md`. The answers go in the PR body.

## Definition of Done

A change is done when all of these hold; iterate until they do:

1. `make check` passes.
2. New or changed behaviour has tests at the seams in § Tests.
3. Every rule, guard and agent doc the change made stale is updated in the same change.
4. Each non-obvious choice has its line in `DECISIONS.md` (§ Decisions).
5. Switched on: confirmed live in its target environment, or the PR's Not live yet section names what isn't and who turns it on.

## Decisions

- **ADR** (`docs/adr/`, via `/domain-modeling`): a choice that is hard to reverse, surprising without context and a real trade-off.
- **`DECISIONS.md` line** (format in its header; the `decisions-format` guard checks it) for every other non-obvious choice: picked A over B, declined a dependency or a review finding, stopped because a rule forbade something, diverged from the issue's proposal. The detail goes in the PR body.

Grep both before reopening a past choice.

## Rules

This file holds what every session needs; keep it under about 120 lines. A rule for part of the tree lives in `.claude/rules/<area>.md`, loaded when a file matching its `paths:` header is touched. Each rule has one home, here or in one rule file; `AGENTS.md` and other docs link to it. A rule that must always hold gets a guard (`add-baseline` skill).

<!-- One line per rule file: `.claude/rules/<area>.md`: what it covers (the paths it loads for). Delete rule files this repo doesn't need. -->

## Workflow

<!-- Branch naming, e.g. "<issue-id>-<slug>, or <slug> without an issue". -->
<!-- Where research goes, e.g. "docs/research/<topic>.md". -->
<!-- What deploys the default branch, if anything. -->

- Shared agent setup lives in the repo: settings, hooks, skills, rules and plans. A method the team relies on gets committed as one of those; personal settings stay in `.claude/settings.local.json`.
- Merging: turn on auto-merge only when `make merge-check` says `LOW-RISK`; any other merge waits for the user's go-ahead for that PR. Nothing enforces this, since agents act as the user on GitHub.
- Scheduled agents (loops) follow `.claude/loops.md`: they propose, and merge only under the rule above.
- Guardrail work outranks ponytail: a test, check, rule update or `DECISIONS.md` line that the Definition of Done, a rule or a guard requires is part of the change. Ponytail decides how much product code to write.
- Mark deliberate shortcuts with a `ponytail:` comment naming the limit and the upgrade path.
- When a skill (e.g. `/tdd`'s seam check, the grilling skills) or the org's rules say to ask first, ask: that outranks ponytail's "never stall on an answer you can default".
- Ponytail's "one runnable check" here is one test at one of the seams (§ Tests), run by the repo's test runner: no `demo()`, `__main__` or stray test files.
- Output a loaded skill or `/next-step` flow asks for (a checklist, a ranked list, a command and its output) counts as explicitly requested, so ponytail's three-line limit doesn't apply to it.
- A design-it-twice brief (`codebase-design`) outranks ponytail for that subagent: its job is to explore a different shape.

## Where the skills come from

Everything under `.claude/skills/`, `.claude/agents/impeccable-*` and `.claude/hooks/ponytail-*` is vendored by `scripts/vendor-skills.sh` (see `skills-lock.json`); never edit those files, since a re-run replaces them. The hand-written skills are the folders `skills-lock.json` doesn't list, among them `next-step` (model-invoked on purpose so the agent can pick a flow itself); a re-vendor leaves them alone.

<!-- UI repos: "UI work follows DESIGN.md and PRODUCT.md", once Impeccable has written them. -->

<!-- /setup-matt-pocock-skills adds the "## Agent skills" section below (issue tracker, triage labels, domain docs). -->
