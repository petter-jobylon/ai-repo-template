---
name: next-step
description: Picks and runs the flow of this repo's skills for a piece of work, in order, with gates. Use when starting a feature, a bug fix, a new page, component or visual change, when resuming a tracker issue, or when asked what to do next. Not for one-off edits or questions.
---

# Next step

Routes a situation to a **flow** (an ordered checklist of this repo's skills) and runs it. Typed as `/next-step [situation | <issue-id>]`, or loaded by the agent when a request matches its description. With no situation or issue given, read the conversation so far, or resume from the tracker (§ Tickets and resuming).

Repo specifics live in `CLAUDE.md` and `docs/agents/`; this skill names the sections it needs. A section missing → ask the user for the fact, and suggest adding it there.

## Running a flow

1. Pick the flow from § Pick a flow and name it with one line on why. Nothing fits → say so and suggest working without a skill.
2. Copy the flow's checklist into your reply. Tick steps off as they finish and repost it at every gate.
3. Run each skill step through the Skill tool, so its hooks fire. If the Skill tool refuses it (a user-invoked skill), read `.claude/skills/<skill>/SKILL.md` and follow it instead: resolve its relative links from that folder, and treat what the user typed after the command as its arguments.
4. Go from step to step without asking, except at a gate ⏸.
5. Only the user can type `/clear` and `/compact`. Where a flow needs one, stop and end with the exact next command, e.g. "Type `/clear`, then `/next-step <issue-id>`."

## Gates ⏸

Stop and wait for the user:

- during an interview or a question a skill asks (`grill-with-docs`, `impeccable shape`, `impeccable` choices such as the decision page or `quieter`'s questions, `triage`, `wayfinder`)
- at `to-spec`'s and `tdd`'s seam checks, unless the spec already agreed the seams
- after `to-tickets`: the user approves the tickets
- before every commit, push or PR
- the environment's stop hook asking to commit and push (`stop-hook-git-check.sh` in cloud sessions) doesn't open this gate: stay stopped and tell the user it fired
- when a step fails twice, or a skill or `CLAUDE.md` says to ask first

## Shared steps

The flows below name these:

- **branch**: before the first edit, if on the default branch, branch from it up to date, named by `CLAUDE.md` § Workflow's convention (the spec's or issue's id where there is one). Never commit to the default branch.
- **implement**: follow `implement`, with two overrides: its `/code-review` is the **review** step below, and its commit waits for the commit gate.
- **review**: `code-review` against `git merge-base origin/<default branch> HEAD`. The work is not committed yet, so diff the working tree (`git diff <merge-base>`), not `...HEAD`. Give it the ticket or spec as the spec, and `CLAUDE.md` (plus `DESIGN.md` if the repo has one) as the standards. Fix what it finds that holds up; list anything you disagree with for the user.
- **commit ⏸**, then **pr ⏸**: `pr` writes the body. The PR names every ticket it closes, with the tracker's closing keyword (`docs/agents/issue-tracker.md`).
- **screenshot**: start the preview command from `CLAUDE.md` § Commands in the background, then `playwright-cli` at the widths the change can reach (390px phone, 1280px desktop; a change scoped to one breakpoint needs only that width). Save any login state only as `.playwright-cli/<name>.json`.

## Tickets and resuming

A flow's state lives in the tracker (`docs/agents/issue-tracker.md`) and git, never in the session. Tracker not reachable → stop.

- **`/next-step <issue-id>`**: work on that issue only. Read it, its comments, parent, sub-issues and blockers, then:
  - a spec (it has sub-issues) → list its open tickets with their blockers and ask which
  - a ticket with a parent spec → Feature, at the per-ticket step
  - `ready-for-agent` with no parent → Small change from implement, or Bug if it's labelled a bug (`docs/agents/triage-labels.md`)
  - `needs-triage` or `needs-info` → Incoming issue
  - `ready-for-human` → say it's marked for a human; don't build it
  - an open blocker → ask: proceed anyway, or the blocker first? A blocker in review counts as done only if its commits are on the current branch.
- **Bare `/next-step` in a fresh session**: find an issue id in the branch name and recent commits, list the parent spec's open tickets with their blockers, suggest an order and ask which. Never start one unasked.
- **Status**: when implement starts, assign yourself and move the issue to in progress; after its commit, to in review, if the tracker has those states. Merging the PR that names a ticket closes it.
- Every ticket of a spec in review or done → next is pr.

## Pick a flow

| Situation | Flow |
|---|---|
| New feature or behaviour needing more than one session | Feature |
| A change that fits one session | Small change |
| Something broken | Bug |
| A raw tracker issue you didn't write | Incoming issue |
| A new page or screen | New view |
| A new part inside an existing page | New component |
| Spacing, type, colour, motion or copy | Visual tweak |
| Tidying structure or finding what to delete | Code health |
| Too big or foggy to plan in one session | Huge effort |
| Mid-merge or mid-rebase; a question to research; editing a skill or `CLAUDE.md` | One-skill flows |

The UI flows (New view, New component, Visual tweak) apply only to repos with a UI.

## Flows

### Feature

```
- [ ] grill-with-docs ⏸
- [ ] research, only for an unverified external fact (an API, a third-party behaviour); wait for its file before the grilling closes
- [ ] to-spec (seam check ⏸)
- [ ] to-tickets ⏸
- [ ] per ticket: /clear, /next-step <issue-id> → branch → implement → review → commit ⏸ → in review
- [ ] pr ⏸
```

### Small change

```
- [ ] grill-with-docs ⏸ (skip when the ask is already precise)
- [ ] branch → implement → review, in this session
- [ ] commit ⏸ → pr ⏸
```

### Bug

```
- [ ] branch
- [ ] diagnosing-bugs: one command that goes red on this bug, before any theory
- [ ] tdd: regression test at the seam the bug shows through (CLAUDE.md § Tests)
- [ ] fix → full suite green → review
- [ ] commit ⏸ → pr ⏸
```

No seam to pin the bug to → stop and propose Code health instead of patching around it.

### Incoming issue

```
- [ ] triage ⏸ → ready-for-agent
- [ ] /clear, /next-step <issue-id>
```

Triage only issues you didn't create; `to-tickets` output is already agent-ready.

### New view

Impeccable's full sequence: shape, then new-work for a whole surface in the established world, through its finish.

```
- [ ] branch
- [ ] grill-with-docs ⏸: what the page shows, and why
- [ ] impeccable shape ⏸: its interview, then the brief you confirm
- [ ] impeccable new-work §1-5 ⏸: the dealt structures; you lock one on the decision page
- [ ] tdd at the rendering seam (CLAUDE.md § Tests): what the page renders (the data, not the look)
- [ ] impeccable new-work §6: build it
- [ ] impeccable new-work §7: screenshot round (screenshot step), finish reviewer, documenter
- [ ] review → commit ⏸ → pr ⏸
```

In a cloud session you can't open a page served in the container: present the decision page's choices in chat.

### New component

```
- [ ] branch
- [ ] impeccable shape ⏸ (skip for a variant of an existing part)
- [ ] tdd at the rendering seam, if it changes what renders
- [ ] impeccable: build it inside the existing surface (new-work "Extend an existing surface")
- [ ] impeccable audit → impeccable polish
- [ ] screenshot
- [ ] review → commit ⏸
```

### Visual tweak

```
- [ ] branch
- [ ] screenshot: "before"
- [ ] the one impeccable command that fits (layout, typeset, colorize, quieter, bolder, clarify, animate…); its questions ⏸
- [ ] screenshot: "after"; show both
- [ ] commit ⏸
```

No tickets, and no new test unless the rendered content changes.

### Code health

```
- [ ] improve-codebase-architecture (structure) or ponytail-audit (what to delete)
- [ ] pick one ⏸
- [ ] a deepening pick is grilled inside improve-codebase-architecture itself → to-spec (Feature) or branch → implement (Small change); a deletion → Small change
```

### Huge effort

```
- [ ] wayfinder ⏸: resolve the map's decision tickets one at a time
- [ ] map clear: read the map issue and its done tickets into the session (to-spec works from the conversation)
- [ ] Feature, from to-spec
```

Never go from the map straight to implement unless the effort turned out small. `/prototype` isn't installed: build a `wayfinder:prototype` ticket's throwaway by hand on a `prototype/<name>` branch.

### One-skill flows

- Mid-merge or mid-rebase → `resolving-merge-conflicts`.
- A question to answer from primary sources → `research`; where the file goes is in CLAUDE.md § Workflow.
- Writing or editing a skill, `CLAUDE.md` or another agent doc → `writing-for-agents`; vendored skills are never edited (CLAUDE.md § Where the skills come from).

## Between steps

- Keep a Feature flow up to `to-tickets` in one unbroken session, so the grilling, spec and tickets share the same reasoning. Each ticket's implement then starts fresh after `/clear`.
- Near the smart zone (about 150k tokens) before that, `/compact` at the nearest phase boundary, never mid-step.
- At a phase boundary the first that fits wins: **continue** (the next step needs this context verbatim and there's room) → **`/clear`** (nothing here matters next) → **`/handoff`** (a new directory, harness or colleague, or forking a side task) → **subagent** (runs without steering, e.g. a review) → **`/compact`** with an instruction on what to keep.
- `/wait-what` whenever a message didn't land.

## Guide the user on ponytail

Ponytail's hooks have two quirks; tell the user when they bite:

- **After `/ponytail-review`**: it leaves the session in review mode, and subagents then get a one-line stub instead of ponytail's rules. Tell the user: "Type `/ponytail full` to leave review mode. `stop ponytail-review` isn't recognised, and `stop ponytail` switches ponytail off entirely."
- **Before a `/clear` or `/compact`**, if the session's ponytail level isn't the default (the `PONYTAIL MODE ACTIVE — level:` line): the level resets to the default. Add to the instruction: "then `/ponytail <level>` again, or `/ponytail default <level>` to keep it for every session".

## All skills

- **Planning**: `grill-with-docs` (interview that records terms in `CONTEXT.md` and ADRs in `docs/adr/`), `grilling` (the bare interview), `to-spec` (spec as a tracker issue), `to-tickets` (tracer-bullet tickets with blocking edges), `wayfinder` (map of decision tickets), `triage` (raw issues to agent-ready ones).
- **Building**: `implement` (per ticket, test-first, closes with review), `tdd` (red-green at the agreed seams), `code-review` (Standards and Spec axes against a fixed point), `pr` (the PR body).
- **Debugging**: `diagnosing-bugs` (feedback loop first, then a regression test), `resolving-merge-conflicts` (by intent; never `--abort`).
- **UI**: `impeccable` (the design workflow, briefed by `PRODUCT.md` from `impeccable init` and `DESIGN.md` from `impeccable document` or new-work; `live` is local-only), `playwright-cli` (open pages served by the preview command and screenshot them).
- **Code health**: `improve-codebase-architecture` (deepening opportunities), `codebase-design` (deep-module vocabulary), `domain-modeling` (sharpen a `CONTEXT.md` term or record an ADR), `ponytail-review` (over-engineering in a diff), `ponytail-audit` (in the whole repo), `ponytail-debt` (every `ponytail:` comment), `ponytail`, `ponytail-help`, `ponytail-gain` (the always-on lazy mode, its command card, its benchmarks).
- **Research and writing**: `research` (cited Markdown from primary sources), `writing-for-agents` (skills, `CLAUDE.md`, agent docs).
- **Session**: `wait-what` (re-explain the last message), `handoff` (a handoff document for another agent or directory).
- **Setup**: `setup-matt-pocock-skills` (tracker, triage labels, doc layout into `docs/agents/`; run once when adopting this template).
