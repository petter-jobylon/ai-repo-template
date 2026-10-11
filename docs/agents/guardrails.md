# Guardrails map

Every guardrail this template carries: where it lives, how strong it is, and whether this repo has adopted it. Most come from research on [erp-mafia/accounted](https://github.com/erp-mafia/accounted), a codebase written almost entirely by AI agents.

- **Strength**: hard means a check, a test or a constraint refuses; soft means an instruction the agent should follow; process means a skill or flow step.
- **Adopted here**: edit to `yes` or `n/a` as this repo takes each one on.

| Area | Guardrail | When | Where | Strength | Adopted here |
|---|---|---|---|---|---|
| Context | Keep the always-on instruction file short | day one | `CLAUDE.md` § Rules | soft | not yet |
| Context | Load detailed rules only where they apply | day one | `.claude/rules/*.md` | soft | not yet |
| Context | Write each rule in exactly one place | day one | `AGENTS.md` (pointer), `CLAUDE.md` § Rules | soft | not yet |
| Context | List where agents must stop and ask | day one | `CLAUDE.md` § Stop and ask | soft | not yet |
| Context | Require proof that new work is switched on | day one | `CLAUDE.md` § Definition of Done; PR template § Not live yet | soft | not yet |
| Context | Ask for first-principles answers in every PR | day one | `CLAUDE.md` § Fix from first principles; PR template | soft | not yet |
| Refuse | Turn every must-hold rule into a CI gate | day one | `scripts/checks/` guard runner, `make guards` | hard | not yet |
| Tests | Prove every check can fail | first month | guard runner self-tests, `scripts/checks/fixtures/` | hard | not yet |
| Guards | Run lint and typecheck in CI from day one | day one | `make lint`, `make typecheck`, CI workflow | hard | not yet |
| Guards | Adopt strict rules with a baseline | first month | `scripts/checks/baselines/`, `add-baseline` skill | hard | not yet |
| Guards | Make every failure message print the fix | day one | guard contract (`scripts/checks/README.md`) | hard | not yet |
| Guards | Sweep agent instructions for stale claims regularly | first month | `instruction-refs` guard; `claim-sweep` skill (planned, PR 3) | hard + process | not yet |
| CI | Require passing checks before merge | day one | `.github/rulesets/main.json`, README step | hard | not yet |
| CI | Add one always-run job that sums up CI | day one | CI workflow `ci-summary` job | hard | not yet |
| CI | Lock down the CI supply chain | day one | SHA-pinned actions, zizmor job | hard | not yet |
| CI | Pin fragile dependencies exactly, with the reason beside the pin | first month | stack recipe | soft | not yet |
| CI | Build every shipped configuration in PR CI | as you grow | CI workflow `build` job (`make build`) | hard | not yet |
| Review | Record what happened to each AI review finding | first month | `CLAUDE.md` § Decisions, `next-step` review step | soft | not yet |
| Review | Assign human reviewers to the guardrail files | first month | `.github/CODEOWNERS` | hard | not yet |
| Review | Make production scripts dry-run by default | first month | `.claude/rules/prod-scripts.md`, recipe example | soft | not yet |
| Loops | Make local checks call the same scripts as CI | as you grow | `Makefile` targets shared by CI, hooks and loops | hard | not yet |
| Memory | Keep a one-line decision log in the repo | day one | `DECISIONS.md`, `CLAUDE.md` § Decisions | soft | not yet |
| Memory | Commit the agent setup the team depends on | day one | `CLAUDE.md` § Workflow, `.gitignore` | soft | not yet |
