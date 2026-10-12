# What agents can reach

How an agent reaches each source it needs to work like an engineer, and what it may not do there. An agent looks here before saying it can't see something, and a source with no row is one it can't reach yet.

Access starts read-only; writing to a source is its own row with its own reason. Credentials follow `CLAUDE.md` § Hard rules 6, and production data stays stop-and-ask whatever a row says.

| Source | How an agent reaches it | Credential (name only, never the value) | May | May not |
|---|---|---|---|---|
<!-- One row per source, e.g. tickets, logs, errors, metrics, staging. How: a CLI the setup installs, an MCP server in .mcp.json, or a connector enabled on the account. -->
