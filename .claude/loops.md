# Loops

A **loop** is a scheduled agent: a routine, a scheduled CI job or a cron-started session that works without a person watching. Every loop follows this policy.

## Propose; merge only what is low-risk

- A loop may open PRs on its own `loop/<loop name>-<ref>` branch, comment, label and file issues. It never pushes to the default branch or approves, and merges only under `CLAUDE.md` § Workflow's merge rule.
- Ticket-only areas (`CLAUDE.md` § Stop and ask) get an issue from a loop, never a PR.
- A finding that already has an open issue gets a comment on it; a closed one is reopened with the new evidence, never duplicated.
- Before pushing, a loop runs the make targets CI runs, never a hand-written copy of a check.

## Registry

One row per loop.

| Loop | Schedule | What it does | May write | How to see its last run |
|---|---|---|---|---|
<!-- e.g. | dependency-review | Mondays 06:00 | reviews dependency updates | PRs on loop/dependency-review-*, comments | the routine's run history, or `gh run list --workflow dependency-review.yml` | -->

## Checking loops

A loop that was built but never switched on fails silently. At the start of a session in a repo with loops, after changing one, or when one seems quiet: compare each row's last run with its schedule, run each loop that missed its interval or never ran once by hand, and end with `ALL LOOPS LIVE`, or `NOT LIVE: <loop>, <loop>` and what each one needs (a schedule, a secret, a permission).
