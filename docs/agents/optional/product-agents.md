---
paths:
  - "__fill-in__/**"  # replace with where the product's AI-agent tools and their approval flow live, e.g. "app/agents/**" or "*/mcp/**"
---

# The product's own AI agents

Copy this file into `.claude/rules/` when the product lets AI agents act for customers, for example through an MCP server, an API for agents or an in-app assistant.

1. **Agents propose; people approve.** An agent's write tool stages a pending operation (type, payload, a readable preview, risk tier, which agent and key asked, expiry). A person approves it. One commit function executes every approved operation, whichever way the approval came in: web, API or agent.
2. **Every operation type has a risk tier, and an unknown type counts as high.** A high-risk operation needs its own explicit confirmation, never a pre-ticked box or a batch approval. Unattended agents have a hard ceiling on what they may do.
3. **The server enforces what the prompt asks.** Text in a prompt can be overridden by whatever the agent reads next. A rule that must hold, such as "this routine never approves", becomes a server-side refusal keyed on something the agent can't change.
4. **Errors are an envelope**: a stable code, a plain message and an explicit `retryable` flag. Raw database or stack text never reaches the agent. An agent retries only what says it is retryable.
5. **Every approval and rejection records who acted and through which way in**, so a human click and an approval relayed by an agent are told apart in the audit trail.
6. **Every way in is gated**: permission and entitlement checks run at each route and agent tool. A completeness test fails when a new route or tool is in neither the gated list nor an explicit free list.

## Enforced by

<!-- The tests and guards that fail when a rule above is broken, e.g. the completeness test for rule 6, the risk-tier default test for rule 2. -->
