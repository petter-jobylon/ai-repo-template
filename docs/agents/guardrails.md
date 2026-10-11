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
| Review | Record what happened to each AI review finding | first month | `CLAUDE.md` § Decisions, `next-step` review step | soft | not yet |
| Memory | Keep a one-line decision log in the repo | day one | `DECISIONS.md`, `CLAUDE.md` § Decisions | soft | not yet |
| Memory | Commit the agent setup the team depends on | day one | `CLAUDE.md` § Workflow, `.gitignore` | soft | not yet |
