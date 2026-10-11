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
| Review | Record what happened to each AI review finding | the next session doesn't reopen a finding someone already declined | first month | `CLAUDE.md` § Decisions, `next-step` review step | soft | not yet |
| Review | Track escalated decisions until someone resolves them | questions parked for a person get lost without a list to grep | as you grow | `CLAUDE.md` § Decisions (ESCALATED / RESOLVED) | soft | not yet |
| Memory | Keep a one-line decision log in the repo | agents keep no memory, so the reasons have to live in the repo | day one | `DECISIONS.md`, `CLAUDE.md` § Decisions | soft | not yet |
| Memory | Commit the agent setup the team depends on | a method that lives in a personal setup can't be reproduced | day one | `CLAUDE.md` § Workflow, `.gitignore` | soft | not yet |
