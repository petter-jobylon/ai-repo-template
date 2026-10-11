# Guardrails map

Every guardrail this template carries, where it lives and how strong it is. Each comes from the public repo
[erp-mafia/accounted](https://github.com/erp-mafia/accounted), a Swedish accounting SaaS that AI agents almost
entirely coded; the evidence column says what happened there. The last two groups come from the AI-Enabled Repository Checklist and from running agents in cloud sessions.

- **Strength**: hard means a check, test or the data store refuses; soft means an instruction the agent should follow; process means a skill or flow step.
- **Template**: `in place`, the planned PR that adds it, or `deferred` (left out for now; the Where column says why).
- **Adopted here**: edit to `yes` or `n/a` as this repo takes each one on.

## Instructions and context

These files are what a coding agent reads before it writes. They protect against guessing, bloated context and rules that contradict each other.

| Guardrail | When | Where | Strength | Template | Adopted here | Evidence in Accounted |
|---|---|---|---|---|---|---|
| Keep the always-on instruction file short | day one | `CLAUDE.md` § Rules | soft | in place | not yet | CLAUDE.md peaked at 978 lines; it has stayed at 103 to 122 since 2026-07-03 |
| Load detailed rules only where they apply | day one | `.claude/rules/*.md` | soft | in place | not yet | path-scoped rule files cut CLAUDE.md from 504 to 196 lines |
| Write each rule in exactly one place | day one | `AGENTS.md` (pointer), `CLAUDE.md` § Rules | soft | in place | not yet | a full AGENTS.md copy drifted and was cut to a 36-line pointer |
| List where agents must stop and ask | day one | `CLAUDE.md` § Stop and ask | soft | in place | not yet | an agent stopped at a tax double count; the founder decided the same day |
| Require proof that new work is switched on | day one | `CLAUDE.md` § Definition of Done; PR template § Not live yet | soft | in place | not yet | added after cloud runs had silently done nothing for 19 days |
| Ask for first-principles answers in every PR | day one | `CLAUDE.md` § Fix from first principles; PR template | soft | in place | not yet | answers in visible PRs rose from 0 of 5 to 6 of 7 after the rule |

## Make the machine refuse bad changes

Agents skip text rules that leave no trace. These items move what must hold into CI, the database and the compiler, so a bad change fails.

| Guardrail | When | Where | Strength | Template | Adopted here | Evidence in Accounted |
|---|---|---|---|---|---|---|
| Turn every must-hold rule into a CI gate | day one | `scripts/checks/` guard runner, `make guards` | hard | in place | not yet | a test rule held in 72% of commits as text and 246 of 246 as a gate |
| Put rules that must never break in the database | day one | `CLAUDE.md` § Hard rules 1, `.claude/rules/data.md`, stack recipe | hard | in place | not yet | ledger triggers with no role exception, added in the first week |
| Give each dangerous action one way in | first month | `CLAUDE.md` § Hard rules 2, pattern guard (`scripts/checks/patterns.json`) | hard | in place | not yet | one posting function; triggers refuse direct writes around it |
| Let the compiler force every case | first month | `CLAUDE.md` § Hard rules 4, stack recipe | hard | in place | not yet | a typed map fails to compile until each new value has an entry |
| Fail closed when a check cannot run | first month | `CLAUDE.md` § Hard rules 3 | soft | in place | not yet | a swallowed query error was read as 'open' on three paths |

## Tests that see the real system

Mocks accept any query, so a change can pass every unit test and still be wrong against the real database. These layers aim at what mocks cannot see, and at guards that check nothing.

| Guardrail | When | Where | Strength | Template | Adopted here | Evidence in Accounted |
|---|---|---|---|---|---|---|
| Add a real-database test layer early | day one | `make test-db`, `db-test-required` guard, `.claude/rules/tests.md`, stack recipe | hard | in place | not yet | 364 real-Postgres test files; mocks let a dropped trigger ship green |
| Write tests that sweep the whole set | first month | `.claude/rules/tests.md`, stack recipe (sweep example) | hard | in place | not yet | about 85 test files sweep the database catalog |
| Prove every check can fail | first month | guard runner self-tests, `scripts/checks/fixtures/` | hard | in place | not yet | a test layer passed green while exercising nothing, twice |

## Guard scripts, baselines and drift checks

A guard with a baseline fails new violations and lets old ones stay. These scripts stop agents repeating old mistakes and stop copies of a fact drifting apart.

| Guardrail | When | Where | Strength | Template | Adopted here | Evidence in Accounted |
|---|---|---|---|---|---|---|
| Run lint and typecheck in CI from day one | day one | `make lint`, `make typecheck`, CI workflow | hard | in place | not yet | lint was never wired into CI and about 60 errors piled up |
| Adopt strict rules with a baseline | first month | `scripts/checks/baselines/`, `scripts/checks/patterns.json`, `add-baseline` skill | hard | in place | not yet | 2 raises in 46 baseline changes; route auth went from 171 files to 1 |
| Make every failure message print the fix | day one | guard contract (`scripts/checks/README.md`) | hard | in place | not yet | guards print the lines to add; database refusals name the lawful path |
| Generate copies and fail CI when stale | first month | `make generate-check`, `CLAUDE.md` § Hard rules 5 | hard | in place | not yet | hand-kept crontabs had lost 7 of 16 jobs |
| Test both sides when code cannot be shared | as you grow | `.claude/rules/tests.md`, `CLAUDE.md` § Hard rules 5, stack recipe | hard | in place | not yet | one bank match booked a different voucher through each way in |
| Sweep agent instructions for stale claims regularly | first month | `instruction-refs` guard, `claim-sweep` skill | hard + process | in place | not yet | a sweep found 28 stale claims across 279 agent files, none caught |

## CI and the merge

CI is the first place a coding agent's change is refused. It protects main only if a red check blocks the merge and the build chain is locked down.

| Guardrail | When | Where | Strength | Template | Adopted here | Evidence in Accounted |
|---|---|---|---|---|---|---|
| Require passing checks before merge | day one | `.github/rulesets/main.json`, README step | hard | in place | not yet | no required check; 8 PRs merged with red CI in 30 days |
| Add one always-run job that sums up CI | day one | CI workflow `ci-summary` job | hard | in place | not yet | a skipped required check counts as passing |
| Lock down the CI supply chain | day one | SHA-pinned actions, `workflow-pins` guard, zizmor job | hard | in place | not yet | all 56 external actions SHA-pinned after an action was exploited |
| Keep a checked list of pinned dependencies | first month | `docs/agents/pinned-deps.md`, `pinned-deps` guard | hard | in place | not yet | one dependency bump took down two features |
| Build every shipped configuration in PR CI | as you grow | CI workflow `build` job (`make build`) | hard | in place | not yet | an image build failed after merge in 16 publish runs |

## Review and human decisions

A second model catches what the author agent misses, and some calls belong to people. These items keep review findings, production access and open decisions on record.

| Guardrail | When | Where | Strength | Template | Adopted here | Evidence in Accounted |
|---|---|---|---|---|---|---|
| Record what happened to each AI review finding | first month | `CLAUDE.md` § Decisions, `next-step` review step | soft | in place | not yet | about 54 declines logged, 21 of them naming a review bot |
| Run an adversarial second-agent pass before the PR | as you grow | `skeptic-pass` skill, `next-step` Feature flow | process | in place | not yet | skeptic passes in 140 commits; counterexamples became tests |
| Assign human reviewers to the guardrail files | first month | `.github/CODEOWNERS` | hard | in place | not yet | no CODEOWNERS; both baseline raises went unexplained |
| Make production scripts dry-run by default | first month | `.claude/rules/prod-scripts.md`, recipe example | soft | in place | not yet | a repair script needs the hash of its reviewed dry run |
| Track escalated decisions until someone resolves them | as you grow | `CLAUDE.md` § Decisions (ESCALATED / RESOLVED) | soft | in place | not yet | 39 of 72 parked founder calls show no resolution |

## Domain knowledge

The failure here is a confident wrong fact, such as an account, a tax code or a rate, reaching production. These items keep domain facts in reviewed files and tie the risky ones to official sources.

| Guardrail | When | Where | Strength | Template | Adopted here | Evidence in Accounted |
|---|---|---|---|---|---|---|
| Put domain rules in skills agents must use | first month | `write-domain-skill` skill | soft | in place | not yet | 16 law skills tell agents to use them over training data |
| Add never-guess tables to domain skills | first month | `write-domain-skill` skill | soft | in place | not yet | 45 situation rows, 23 of them resolved by asking the user |
| Pin official reference tables in tests | first month | `.claude/rules/tests.md`, `write-domain-skill` skill, stack recipe | hard | in place | not yet | a wrong tax form code got two customers' filings rejected |
| Test the facts in skills against the code | as you grow | `.claude/rules/tests.md`, `write-domain-skill` skill | hard | in place | not yet | 9 of 36 sampled skill facts contradict the code |

## Autonomous loops and parallel agents

Scheduled agents (loops) and parallel sessions can overreach, collide or never start. These items keep loops proposing, isolated and visibly running.

| Guardrail | When | Where | Strength | Template | Adopted here | Evidence in Accounted |
|---|---|---|---|---|---|---|
| Let loops propose and never merge | as you grow | `.claude/loops.md`, ruleset | soft | in place | not yet | loops open PRs and never merge; risky areas are ticket-only |
| Check at session start that every loop runs | as you grow | `check-loops` skill | process | in place | not yet | 'check the pr comments' was typed 323 times before loops existed |
| Make local checks call the same scripts as CI | as you grow | `Makefile` targets shared by CI, hooks and loops | hard | in place | not yet | a hand-copied loop check greps moved folders and never fires |
| Give each parallel agent its own worktree | as you grow | not set up: each cloud session has its own checkout | process | deferred | not yet | shared checkouts corrupted commits across sessions |

## Memory and learning from incidents

Agents keep no memory between sessions, so the repo has to. These items record why choices were made and turn each incident into a standing check.

| Guardrail | When | Where | Strength | Template | Adopted here | Evidence in Accounted |
|---|---|---|---|---|---|---|
| Keep a one-line decision log in the repo | day one | `DECISIONS.md`, `CLAUDE.md` § Decisions | soft | in place | not yet | 2,521 entries in three months; 41% name a rejected option |
| Ship fix, class guard and log line together | day one | `guardrail-from-incident` skill, `next-step` Bug flow | process | in place | not yet | 22 of 23 guards shipped in the fix's own PR |
| Sweep for every sibling of a defect | as you grow | `sibling-sweep` skill, `next-step` Code health flow | process | in place | not yet | one sweep: about 150 findings, 28 defects, three new baseline guards |
| Commit the agent setup the team depends on | day one | `CLAUDE.md` § Workflow, `.gitignore` | soft | in place | not yet | only 4 of 10 working methods were in the repo |

## Guardrails for the product's own AI agents

Use these only if the product exposes AI agents to customers. They protect against an agent acting without a human decision, or being steered by text it reads.

| Guardrail | When | Where | Strength | Template | Adopted here | Evidence in Accounted |
|---|---|---|---|---|---|---|
| Stage every agent write for human approval | product agents | `.claude/rules/agent-tools.md` rule 1 | hard | in place | not yet | every agent write is staged for a human to approve |
| Tier every operation by risk; unknown is high | product agents | `.claude/rules/agent-tools.md` rule 2 | hard | in place | not yet | 156 risk types; an unknown type counts as high |
| Enforce on the server what the prompt asks | product agents | `.claude/rules/agent-tools.md` rule 3 | hard | in place | not yet | a prompt-only rule became a server-side refusal |
| Give agents stable error codes and a retry flag | product agents | `.claude/rules/agent-tools.md` rule 4 | hard | in place | not yet | 645 of 1,024 agent tool failures were UNKNOWN_ERROR |
| Record who approved and through which way in | product agents | `.claude/rules/agent-tools.md` rule 5 | hard | in place | not yet | web approvals left no processing-history event |
| Gate every way in and check the list | product agents | `.claude/rules/agent-tools.md` rule 6, stack recipe | hard | in place | not yet | the agent path bypassed the paywall one day after launch |

## From the AI-enabled repository checklist

These come from Matt Ferrante's AI-Enabled Repository Checklist (March 2026), not from Accounted.

| Guardrail | When | Where | Strength | Template | Adopted here | Why |
|---|---|---|---|---|---|---|
| Write the layers down and enforce their direction | first month | `ARCHITECTURE.md`, `layers` guard, stack recipe | hard | in place | not yet | agents follow structure a check enforces, not structure a doc describes |
| Give lint failures the exact fix | day one | guard contract (`scripts/checks/README.md`) | hard | in place | not yet | an agent fixes what the message tells it to; a vague message gets a guess |
| Commit freely, ship one small PR per ticket | day one | `next-step` (commit step, Feature flow) | process | in place | not yet | short-lived PRs are easier to review and to merge while green |
| Auto-merge only low-risk paths | first month | `scripts/low-risk-paths.json`, `make merge-check`, `CLAUDE.md` § Workflow | soft | in place | not yet | agents use your GitHub identity, so this is an instruction, not a CI check |
| Parse input once at the boundary | first month | `.claude/rules/api.md` | soft | in place | not yet | code past the boundary trusts a typed value instead of re-checking raw input |
| Performance budgets as tests | as you grow | `.claude/rules/tests.md` | soft | in place | not yet | a budget in a doc is never checked; a test fails when it is broken |
| Fix flaky tests, never silence them | first month | `.claude/rules/tests.md` | soft | in place | not yet | a skipped flaky test hides the bug it was flaking on |
| See what each baseline still allows | as you grow | `node scripts/checks/run.js --report` | process | in place | not yet | one view of where violations remain, with no extra file to keep current |

## Cloud sessions and secrets

These come from running agents in Claude Code cloud sessions, not from Accounted.

| Guardrail | When | Where | Strength | Template | Adopted here | Why |
|---|---|---|---|---|---|---|
| Make targets work without hooks | day one | `scripts/ensure-docker.sh`, `CLAUDE.md` § Workflow | hard | in place | not yet | a session with more than one repo runs no repo's hooks |
| Keep env blocks out of committed settings | day one | `.claude/settings.json`, `scripts/vendor-skills.sh` | soft | in place | not yet | self-hosted runners flag one and refuse the session in enforce mode |
| Put slow setup in the environment's setup script | first month | `scripts/cloud-env-setup.sh` | process | in place | not yet | a short setup script is cached between sessions; hooks run every session |
| Boot the app with one command and seed data | first month | `make up`, `make seed`, `.env.example`, stack recipe | soft | in place | not yet | an agent can only run and screenshot an app that boots with one command |
| Write down what agents can reach | first month | `docs/agents/agent-access.md` | soft | in place | not yet | without it an agent guesses where logs and errors live, or gives up |
| Keep secrets out of the repo | day one | `CLAUDE.md` § Hard rules 6, `no-committed-secrets` guard | hard | in place | not yet | anything in a cloud environment can be read by everyone who uses it |
