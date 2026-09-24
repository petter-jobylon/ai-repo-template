# ai-repo-template

A Claude Code setup to copy into a repo: vendored skills, agents and hooks, plus `/next-step`, which picks and runs a flow of those skills (Feature, Small change, Bug, New view…) with gates before every commit, push or PR.

## What's in it

| Path | What |
|---|---|
| `.claude/skills/` | 20 skills from [mattpocock/skills](https://github.com/mattpocock/skills) (planning, tdd, review, debugging), 6 from [ponytail](https://github.com/DietrichGebert/ponytail) (always-on minimal-code mode), [impeccable](https://github.com/pbakaus/impeccable) (UI design), [playwright-cli](https://github.com/microsoft/playwright-cli) (screenshots), and the hand-written `next-step` |
| `.claude/agents/`, `.claude/hooks/` | Impeccable's subagents, ponytail's hooks |
| `.claude/settings.json` | Hook wiring |
| `.claude/launch.json` | Empty; add your app's dev server |
| `CLAUDE.md` | Skeleton with the sections `next-step` reads |
| `scripts/vendor-skills.sh` | Re-vendors every third-party skill to latest and self-tests the hooks |
| `scripts/cloud-tools.sh` | Cloud sessions only: installs `playwright-cli` and trusts the egress proxy's CAs |
| `scripts/impeccable-scope.js` | Tells ponytail to leave design completeness to Impeccable |

Skills are vendored rather than installed as plugins because cloud sessions ignore plugins a repo declares.

## Adopting it

1. Copy everything except this README into the repo (merge `.gitignore` and any existing `.claude/settings.json` by hand). Needs Node on the machine for the hooks.
2. Fill in `CLAUDE.md`: every `<!-- -->` prompt, then delete the prompts. Keep the section names: `next-step` refers to § Commands, § Tests, § Workflow and § Where the skills come from.
3. Run `/setup-matt-pocock-skills`: it picks the issue tracker, triage labels and doc layout, writes `docs/agents/`, and adds `## Agent skills` to `CLAUDE.md`.
4. Add the dev server to `.claude/launch.json`, e.g. `{ "name": "app", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 3000 }`.
5. UI repos: run `/impeccable init` for `PRODUCT.md`, and `/impeccable document` for `DESIGN.md` if the UI already exists.
6. Try it: `/next-step` with a small change.

## Updating the skills

`bash scripts/vendor-skills.sh` from the repo root, then review and commit the diff. Never edit vendored files by hand; the next run replaces them.
