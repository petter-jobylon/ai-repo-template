# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- One paragraph: what this repo is, and where its glossary (CONTEXT.md) and decisions (docs/adr/) live. -->

## Commands

<!-- The commands an agent runs, from the repo root: install, full test suite, one test, lint/typecheck. -->
<!-- Preview (used by /next-step's screenshot step): the one command that serves the app locally with demo data, and its URL. Delete this line if the repo has no UI. -->

## Architecture

<!-- The big picture an agent can't get from one file: the main modules, how data flows between them, where state lives. -->

## Tests

<!-- The seams tests go through (e.g. "HTTP request → rendered response"), one line each with its test file. /tdd, /to-spec and /next-step's Bug flow test only at these; name which seam covers rendered output. -->

Don't mock our own modules or add tests at other seams. A new seam needs this section updated through `/grill-with-docs` first.

## Workflow

<!-- Branch naming, e.g. "<issue-id>-<slug>, or <slug> without an issue". -->
<!-- Where research goes, e.g. "docs/research/<topic>.md". -->
<!-- What deploys the default branch, if anything. -->

- Mark deliberate shortcuts with a `ponytail:` comment naming the limit and the upgrade path.
- When a skill (e.g. `/tdd`'s seam check, the grilling skills) or the org's rules say to ask first, ask: that outranks ponytail's "never stall on an answer you can default".
- Ponytail's "one runnable check" here is one test at one of the seams (§ Tests), run by the repo's test runner: no `demo()`, `__main__` or stray test files.
- Output a loaded skill or `/next-step` flow asks for (a checklist, a ranked list, a command and its output) counts as explicitly requested, so ponytail's three-line limit doesn't apply to it.
- A design-it-twice brief (`codebase-design`) outranks ponytail for that subagent: its job is to explore a different shape.

## Where the skills come from

Everything under `.claude/skills/`, `.claude/agents/impeccable-*` and `.claude/hooks/ponytail-*` is vendored by `scripts/vendor-skills.sh` (see `skills-lock.json`); never edit those files, since a re-run replaces them. Only `next-step` is hand-written, and it is model-invoked on purpose so the agent can pick a flow itself.

<!-- UI repos: "UI work follows DESIGN.md and PRODUCT.md", once Impeccable has written them. -->

<!-- /setup-matt-pocock-skills adds the "## Agent skills" section below (issue tracker, triage labels, domain docs). -->
