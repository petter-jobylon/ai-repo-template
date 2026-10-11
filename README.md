# ai-repo-template

A Claude Code setup to copy into a repo: vendored skills, agents and hooks, plus `/next-step`, which picks and runs a flow of those skills (Feature, Small change, Bug, New view…) with gates before every commit, push or PR. It also carries guardrails for repos written mostly by AI agents, taken from what worked in [erp-mafia/accounted](https://github.com/erp-mafia/accounted); `docs/agents/guardrails.md` lists each one, where it lives and how strong it is. It assumes no language, framework or database; the hooks need Node.

## What's in it

| Path | What |
|---|---|
| `.claude/skills/` | 20 skills from [mattpocock/skills](https://github.com/mattpocock/skills) (planning, tdd, review, debugging), 6 from [ponytail](https://github.com/DietrichGebert/ponytail) (always-on minimal-code mode), [impeccable](https://github.com/pbakaus/impeccable) (UI design), [playwright-cli](https://github.com/microsoft/playwright-cli) (screenshots), [linearis](https://github.com/linearis-oss/linearis) (Linear from the CLI), and the hand-written `next-step`, `add-baseline`, `claim-sweep`, `guardrail-from-incident` and `skeptic-pass` |
| `.claude/agents/`, `.claude/hooks/` | Impeccable's subagents, ponytail's hooks |
| `.claude/settings.json` | Hook wiring |
| `.claude/launch.json` | Empty; add your app's dev server |
| `CLAUDE.md` | Skeleton with the sections `next-step` reads, plus hard rules, stop-and-ask, Definition of Done, first-principles questions and the decision tiers |
| `AGENTS.md` | Pointer to `CLAUDE.md` for other agent tools, so each rule keeps one home |
| `.claude/rules/` | Path-scoped rules (`api`, `data`, `tests`, `security`, `prod-scripts`, and `agent-tools` for products that expose AI agents), each loaded only for the paths in its header |
| `.claude/loops.md` | Policy and registry for scheduled agents: propose, never merge, one branch each |
| `DECISIONS.md` | One-line decision log, beside ADRs in `docs/adr/` |
| `.github/pull_request_template.md` | First-principles answers, what is not live yet, Definition of Done |
| `docs/agents/guardrails.md` | Every guardrail, where it lives, its strength, and whether this repo has adopted it |
| `Makefile` | The one command interface (`make help`); CI, hooks and loops call only these targets, and an unfilled one fails |
| `scripts/checks/` | Guard runner, guards (contract in its `README.md`), fixtures that prove each guard can fail, and baselines |
| `.github/workflows/ci.yml` | The make targets, a zizmor job, and `ci-summary`, the one check to require |
| `.github/actions/setup/` | The one CI step each repo fills in: its toolchain |
| `.github/rulesets/main.json` | Ruleset to import: `ci-summary` required, code owner review, no force push |
| `.github/CODEOWNERS` | Owners for guardrail files (fill in) |
| `docs/agents/optional/` | Opt-in pieces to copy in when they apply: `docs/agents/optional/write-domain-skill/` into `.claude/skills/` when agents need facts set by law, tax or a standard |
| `docs/agents/recipes/` | How to fill each stack slot; today Python, Django, PostgreSQL and Redis |
| `scripts/vendor-skills.sh` | Re-vendors every third-party skill to latest and self-tests the hooks |
| `scripts/cloud-tools.sh` | Cloud sessions only: installs `playwright-cli` and `linearis`, and trusts the egress proxy's CAs |
| `scripts/impeccable-scope.js` | Tells ponytail to leave design completeness to Impeccable |

Skills are vendored rather than installed as plugins because cloud sessions ignore plugins a repo declares.

## Adopting it

1. Copy everything except this README and `.github/workflows/template-self-test.yml` into the repo (merge `.gitignore` and any existing `.claude/settings.json` by hand). Needs Node for the hooks and guards, and make (on Windows through Git Bash or WSL).
2. Fill in `CLAUDE.md`: every `<!-- -->` prompt, then delete the prompts. Keep the section names: `next-step` refers to § Stop and ask, § Commands, § Tests, § Definition of Done, § Decisions, § Workflow and § Where the skills come from.
3. Fill in the `.claude/rules/` files this repo needs (their `paths:` globs and conventions) and delete the rest; list the ones you keep in `CLAUDE.md` § Rules.
4. Run `/setup-matt-pocock-skills`: it picks the issue tracker, triage labels and doc layout, writes `docs/agents/`, and adds `## Agent skills` to `CLAUDE.md`. On Linear, set `LINEAR_API_TOKEN` (a Linear personal API key) in the environment; `linearis` reads it and `Bash(linearis:*)` is pre-allowed.
5. Add the dev server to `.claude/launch.json`, e.g. `{ "name": "app", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 3000 }`.
6. UI repos: run `/impeccable init` for `PRODUCT.md`, and `/impeccable document` for `DESIGN.md` if the UI already exists.
7. Fill in every `Makefile` target from the recipe for your stack (`docs/agents/recipes/`), or set it to `@echo "n/a: <reason>"`, and add your toolchain to `.github/actions/setup/action.yml`. To require a real-store test with each migration, add `scripts/checks/db-test-required.json` (the recipe has one). `make check` passing locally is the bar.
8. Fill in `.github/CODEOWNERS`, then import the ruleset: `gh api -X POST repos/<owner>/<repo>/rulesets --input .github/rulesets/main.json`. It requires `ci-summary`, so a red CI blocks the merge.
9. Go through `docs/agents/guardrails.md`: mark each guardrail `yes` or `n/a` under Adopted here as the repo takes it on.
10. Try it: `/next-step` with a small change.

## This template repo's own CI

The template's make targets are unfilled on purpose. With the repository variable `TEMPLATE_SELF=true` (Settings, Secrets and variables, Actions, Variables), set only in this repo, CI skips the make jobs and `.github/workflows/template-self-test.yml` runs instead. Adopting repos leave the variable unset and don't copy that workflow.

## Updating the skills

`bash scripts/vendor-skills.sh` from the repo root, then review and commit the diff. Never edit vendored files by hand; the next run replaces them.
