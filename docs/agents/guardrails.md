# Guardrails map

Every guardrail this template carries: where it lives, how strong it is, and whether this repo has adopted it. Most come from research on [erp-mafia/accounted](https://github.com/erp-mafia/accounted), a codebase written almost entirely by AI agents; the rest from Matt Ferrante's AI-Enabled Repository Checklist and from running agents in Claude Code cloud sessions.

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
| Refuse | Put rules that must never break in the data store | day one | `CLAUDE.md` § Hard rules 1, `.claude/rules/data.md`, stack recipe | hard | not yet |
| Refuse | Give each dangerous action one way in | first month | `CLAUDE.md` § Hard rules 2, a guard in `scripts/checks/` | hard | not yet |
| Refuse | Let the compiler force every case | first month | `CLAUDE.md` § Hard rules 4, stack recipe | hard | not yet |
| Refuse | Fail closed when a check cannot run | first month | `CLAUDE.md` § Hard rules 3 | soft | not yet |
| Refuse | Write the layers down and enforce their direction | first month | `ARCHITECTURE.md`, `layers` guard, stack recipe | hard | not yet |
| Refuse | Parse input once at the boundary | first month | `.claude/rules/api.md` | soft | not yet |
| Tests | Add a real-database test layer early | day one | `make test-db`, `db-test-required` guard, `.claude/rules/tests.md`, stack recipe | hard | not yet |
| Tests | Write tests that sweep the whole set | first month | `.claude/rules/tests.md`, stack recipe (sweep example) | hard | not yet |
| Tests | Prove every check can fail | first month | guard runner self-tests, `scripts/checks/fixtures/` | hard | not yet |
| Tests | Performance budgets as tests | as you grow | `.claude/rules/tests.md` | soft | not yet |
| Tests | Fix flaky tests, never silence them | first month | `.claude/rules/tests.md` | soft | not yet |
| Guards | Run lint and typecheck in CI from day one | day one | `make lint`, `make typecheck`, CI workflow | hard | not yet |
| Guards | Adopt strict rules with a baseline | first month | `scripts/checks/baselines/`, `add-baseline` skill | hard | not yet |
| Guards | Make every failure message print the fix | day one | guard contract (`scripts/checks/README.md`) | hard | not yet |
| Guards | Generate copies and fail CI when stale | first month | `make generate-check`, `CLAUDE.md` § Hard rules 5 | hard | not yet |
| Guards | Test both sides when code cannot be shared | as you grow | `.claude/rules/tests.md`, `CLAUDE.md` § Hard rules 5, stack recipe | hard | not yet |
| Guards | Sweep agent instructions for stale claims regularly | first month | `instruction-refs` guard, `claim-sweep` skill | hard + process | not yet |
| CI | Require passing checks before merge | day one | `.github/rulesets/main.json`, README step | hard | not yet |
| CI | Add one always-run job that sums up CI | day one | CI workflow `ci-summary` job | hard | not yet |
| CI | Lock down the CI supply chain | day one | SHA-pinned actions, zizmor job | hard | not yet |
| CI | Pin fragile dependencies exactly, with the reason beside the pin | first month | stack recipe | soft | not yet |
| CI | Build every shipped configuration in PR CI | as you grow | CI workflow `build` job (`make build`) | hard | not yet |
| CI | Auto-merge only low-risk paths | first month | `scripts/low-risk-paths.json`, `make merge-check`, `CLAUDE.md` § Workflow | soft | not yet |
| Review | Record what happened to each AI review finding | first month | `CLAUDE.md` § Decisions, `next-step` review step | soft | not yet |
| Review | Run an adversarial second-agent pass before the PR | as you grow | `skeptic-pass` skill, `next-step` Feature flow | process | not yet |
| Review | Assign human reviewers to the guardrail files | first month | `.github/CODEOWNERS` | hard | not yet |
| Review | Make production scripts dry-run by default | first month | `.claude/rules/prod-scripts.md`, recipe example | soft | not yet |
| Review | Commit freely, ship one small PR per ticket | day one | `next-step` (commit step, Feature flow) | process | not yet |
| Domain | Keep domain facts in a sourced skill, pinned by tests | regulated domain | `docs/agents/optional/write-domain-skill/` (copy into `.claude/skills/`) | soft | not yet |
| Loops | Let loops propose, and merge only low-risk paths | as you grow | `.claude/loops.md`, ruleset | soft | not yet |
| Loops | Check at session start that every loop runs | as you grow | `.claude/loops.md` § Checking loops | process | not yet |
| Loops | Make local checks call the same scripts as CI | as you grow | `Makefile` targets shared by CI, hooks and loops | hard | not yet |
| Memory | Keep a one-line decision log in the repo | day one | `DECISIONS.md`, `CLAUDE.md` § Decisions | soft | not yet |
| Memory | Fix the whole class: siblings, a guard and a log line | day one | `guardrail-from-incident` skill, `next-step` Bug flow | process | not yet |
| Memory | Commit the agent setup the team depends on | day one | `CLAUDE.md` § Workflow, `.gitignore` | soft | not yet |
| Product agents | Agents propose, people approve, the server enforces | product agents | `docs/agents/optional/product-agents.md` (copy into `.claude/rules/`) | hard | not yet |
| Cloud | Make targets work without hooks | day one | `Makefile` targets, stack recipe | hard | not yet |
| Cloud | Keep env blocks out of committed settings | day one | `.claude/settings.json`, `scripts/vendor-skills.sh` | soft | not yet |
| Cloud | Put slow setup in the environment's setup script | first month | README § Cloud sessions, stack recipe | process | not yet |
| Cloud | Boot the app with one command and seed data | first month | `make up`, `make seed`, `.env.example`, stack recipe | soft | not yet |
| Cloud | Write down what agents can reach | first month | `docs/agents/agent-access.md` | soft | not yet |
| Cloud | Keep secrets out of the repo | day one | `CLAUDE.md` § Hard rules 6, `no-committed-secrets` guard | hard | not yet |
