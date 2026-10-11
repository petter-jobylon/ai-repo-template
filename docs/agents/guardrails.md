# Guardrails map

Every guardrail this template carries: where it lives, how strong it is, and whether this repo has adopted it. Most come from research on [erp-mafia/accounted](https://github.com/erp-mafia/accounted), a codebase written almost entirely by AI agents.

- **Strength**: hard means a check, a test or a constraint refuses; soft means an instruction the agent should follow; process means a skill or flow step.
- **Adopted here**: edit to `yes` or `n/a` as this repo takes each one on.

| Area | Guardrail | Why | When | Where | Strength | Adopted here |
|---|---|---|---|---|---|---|
| Context | Keep the always-on instruction file short | a long file buries the rules that matter, and every session loads it | day one | `CLAUDE.md` § Rules | soft | not yet |
| Context | Load detailed rules only where they apply | detail loads only when the agent touches matching files, so context stays small | day one | `.claude/rules/*.md` | soft | not yet |
| Context | Write each rule in exactly one place | two copies drift apart, and agents follow whichever they read | day one | `AGENTS.md` (pointer), `CLAUDE.md` § Rules | soft | not yet |
| Context | List where agents must stop and ask | a wrong guess in a costly area is worse than a question | day one | `CLAUDE.md` § Stop and ask | soft | not yet |
| Context | Require proof that new work is switched on | work that is built but never switched on fails silently | day one | `CLAUDE.md` § Definition of Done; PR template § Not live yet | soft | not yet |
| Context | Ask for first-principles answers in every PR | a fix aimed at the proposed patch instead of the cause comes back | day one | `CLAUDE.md` § Fix from first principles; PR template | soft | not yet |
| Refuse | Turn every must-hold rule into a CI gate | agents follow a gate every time and an instruction only most of the time | day one | `scripts/checks/` guard runner, `make guards` | hard | not yet |
| Refuse | Put rules that must never break in the data store | every writer, scripts and workers included, hits the same wall | day one | `CLAUDE.md` § Hard rules 1, `.claude/rules/data.md`, stack recipe | hard | not yet |
| Refuse | Give each dangerous action one way in | one path to guard instead of many to audit | first month | `CLAUDE.md` § Hard rules 2, a guard in `scripts/checks/` | hard | not yet |
| Refuse | Let the compiler force every case | a new value can't be forgotten in some branch | first month | `CLAUDE.md` § Hard rules 4, stack recipe | hard | not yet |
| Refuse | Fail closed when a check cannot run | a swallowed error read as 'allowed' lets the wrong thing through | first month | `CLAUDE.md` § Hard rules 3 | soft | not yet |
| Tests | Add a real-database test layer early | mocks accept writes the real store refuses, so a dropped constraint ships green | day one | `make test-db`, `db-test-required` guard, `.claude/rules/tests.md`, stack recipe | hard | not yet |
| Tests | Write tests that sweep the whole set | a new table, route or tool is checked even if its author never opens the test | first month | `.claude/rules/tests.md`, stack recipe (sweep example) | hard | not yet |
| Tests | Prove every check can fail | a check that scans nothing passes forever | first month | guard runner self-tests, `scripts/checks/fixtures/` | hard | not yet |
| Guards | Run lint and typecheck in CI from day one | unchecked errors pile up until there are too many to fix | day one | `make lint`, `make typecheck`, CI workflow | hard | not yet |
| Guards | Adopt strict rules with a baseline | a strict rule can start today without fixing every old violation first | first month | `scripts/checks/baselines/`, `add-baseline` skill | hard | not yet |
| Guards | Make every failure message print the fix | an agent fixes what the message says; a vague message gets a guess | day one | guard contract (`scripts/checks/README.md`) | hard | not yet |
| Guards | Generate copies and fail CI when stale | a hand-kept copy drifts without anyone noticing | first month | `make generate-check`, `CLAUDE.md` § Hard rules 5 | hard | not yet |
| Guards | Test both sides when code cannot be shared | two ways into the same action drift into different results | as you grow | `.claude/rules/tests.md`, `CLAUDE.md` § Hard rules 5, stack recipe | hard | not yet |
| Guards | Sweep agent instructions for stale claims regularly | a stale instruction sends agents the wrong way, and no check catches a wrong claim | first month | `instruction-refs` guard, `claim-sweep` skill | hard + process | not yet |
| CI | Require passing checks before merge | without it, a red PR can still merge | day one | `.github/rulesets/main.json`, README step | hard | not yet |
| CI | Add one always-run job that sums up CI | a skipped required check counts as passing | day one | CI workflow `ci-summary` job | hard | not yet |
| CI | Lock down the CI supply chain | a moved tag can swap the code an action runs | day one | SHA-pinned actions, zizmor job | hard | not yet |
| CI | Pin fragile dependencies exactly, with the reason beside the pin | an unreviewed version bump can take down a feature | first month | stack recipe | soft | not yet |
| CI | Build every shipped configuration in PR CI | a configuration first built after merge breaks after merge | as you grow | CI workflow `build` job (`make build`) | hard | not yet |
| Review | Record what happened to each AI review finding | the next session doesn't reopen a finding someone already declined | first month | `CLAUDE.md` § Decisions, `next-step` review step | soft | not yet |
| Review | Assign human reviewers to the guardrail files | loosening a guard or raising a baseline gets a person's eyes | first month | `.github/CODEOWNERS` | hard | not yet |
| Review | Make production scripts dry-run by default | what runs against production is what a person reviewed | first month | `.claude/rules/prod-scripts.md`, recipe example | soft | not yet |
| Review | Track escalated decisions until someone resolves them | questions parked for a person get lost without a list to grep | as you grow | `CLAUDE.md` § Decisions (ESCALATED / RESOLVED) | soft | not yet |
| Domain | Keep domain facts in a sourced skill, pinned by tests | training data is often wrong or out of date on law, tax and standards | regulated domain | `docs/agents/optional/write-domain-skill/` (copy into `.claude/skills/`) | soft | not yet |
| Loops | Make local checks call the same scripts as CI | a hand-copied check drifts and stops checking anything | as you grow | `Makefile` targets shared by CI, hooks and loops | hard | not yet |
| Memory | Keep a one-line decision log in the repo | agents keep no memory, so the reasons have to live in the repo | day one | `DECISIONS.md`, `CLAUDE.md` § Decisions | soft | not yet |
| Memory | Commit the agent setup the team depends on | a method that lives in a personal setup can't be reproduced | day one | `CLAUDE.md` § Workflow, `.gitignore` | soft | not yet |
