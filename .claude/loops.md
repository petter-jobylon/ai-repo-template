# Loops

A **loop** is a scheduled agent: a routine, a scheduled CI job or a cron-started session that works without a person watching. Every loop follows this policy.

## Propose, never merge

- A loop may open PRs on a `loop/<loop name>-<ref>` branch, comment, label and file issues. It never merges, pushes to the default branch or approves. The ruleset backs this up: a PR and `ci-summary` are required for every change, and no bypass actor is listed.
- Ticket-only areas get an issue from a loop, never a PR. <!-- List this repo's ticket-only areas, e.g. migrations, auth, money, deletion of user data; usually the CLAUDE.md § Stop and ask areas. -->
- A finding that already has an open issue gets a comment on it. One that was closed comes back as a reopen with the new evidence, never a duplicate.
- Each loop run works on its own branch, so two loops or a loop and a person never push to the same one.
- Before pushing, a loop runs the same make targets CI runs (`make check`, or the subset its registry row names), never a hand-written copy of a check.

## Registry

One row per loop. `check-loops` reads this table to tell which loops are live.

| Loop | Schedule | What it does | May write | How to see its last run |
|---|---|---|---|---|
<!-- e.g. | dependency-review | Mondays 06:00 | reviews dependency updates against docs/agents/pinned-deps.md | PRs on loop/dependency-review-*, comments | the routine's run history, or `gh run list --workflow dependency-review.yml` | -->
