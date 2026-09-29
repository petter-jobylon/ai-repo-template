#!/usr/bin/env bash
# scripts/vendor-skills.sh
# Vendors third-party skills, agents and hooks into .claude/, because cloud sessions don't install
# plugins a repo declares. Re-run from the repo root to update everything to latest, then review
# and commit the diff. Everything a previous run vendored is removed first, so dropped skills go.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
node -v

POCOCK=(code-review codebase-design diagnosing-bugs domain-modeling
  grill-with-docs grilling handoff implement improve-codebase-architecture pr research
  resolving-merge-conflicts setup-matt-pocock-skills tdd to-spec to-tickets triage wait-what
  wayfinder writing-for-agents)
PONYTAIL=(ponytail ponytail-audit ponytail-debt ponytail-gain ponytail-help ponytail-review)

# ---- 1. Clean out the previous run -----------------------------------------
[ -f skills-lock.json ] && node -e '
  for (const n of Object.keys(require("./skills-lock.json").skills))
    require("fs").rmSync(".claude/skills/" + n, { recursive: true, force: true })'
rm -f skills-lock.json .claude/agents/impeccable-*.md .claude/hooks/ponytail-*
rm -rf .claude/vendor .claude/skills/impeccable .claude/skills/playwright-cli   # vendored outside the lock by earlier versions

# ---- 2. Skills, all through the skills CLI so each lands in skills-lock.json --
add() { npx -y skills@latest add "$1" -a claude-code --copy -y --skill "${@:2}"; }
add mattpocock/skills "${POCOCK[@]}"
add DietrichGebert/ponytail "${PONYTAIL[@]}"
add pbakaus/impeccable impeccable   # no engine binary: its launcher downloads a verified one per platform
add microsoft/playwright-cli playwright-cli
add linearis-oss/linearis linearis

# ---- 3. Plugin parts the skills CLI doesn't carry ---------------------------
git clone --depth 1 -q https://github.com/DietrichGebert/ponytail "$T/pony"
git clone --depth 1 -q https://github.com/pbakaus/impeccable "$T/imp"
# ponytail-instructions.js reads hooks/../skills/ponytail/SKILL.md, so .claude/hooks/ finds the vendored skill.
mkdir -p .claude/hooks .claude/agents
cp "$T"/pony/hooks/ponytail-*.js "$T"/pony/hooks/ponytail-statusline.* .claude/hooks/
cp "$T"/imp/plugin/agents/*.md .claude/agents/
# Agents aren't hook manifests, so point their engine calls at the vendored skill here.
sed -i.bak 's|${CLAUDE_PLUGIN_ROOT}/skills/impeccable|.claude/skills/impeccable|g' .claude/agents/impeccable-*.md && rm .claude/agents/impeccable-*.md.bak

# ---- 4. Hooks into the committed .claude/settings.json ----------------------
PONY="$T/pony/hooks/claude-codex-hooks.json" IMP="$T/imp/plugin/hooks/hooks.json" node - <<'JS'
const fs = require('fs');
const f = '.claude/settings.json';
const S = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
S.hooks ??= {};
// Drop every group this script (or its earlier versions) added, so re-runs never duplicate.
const ours = /\.claude\/(skills\/impeccable|hooks\/ponytail-|vendor\/ponytail)/;
for (const ev of Object.keys(S.hooks)) {
  S.hooks[ev] = S.hooks[ev].filter(g => !ours.test(JSON.stringify(g)));
  if (!S.hooks[ev].length) delete S.hooks[ev];
}
const put = (manifest, from, to, prefix = {}) => {
  const hooks = JSON.parse(fs.readFileSync(manifest, 'utf8').replaceAll(from, to)).hooks;
  if (!hooks) throw new Error(`no hooks in ${manifest}`);
  for (const [ev, groups] of Object.entries(hooks)) for (const g of groups) {
    for (const h of g.hooks) h.command = (prefix[ev] ?? '') + h.command;
    (S.hooks[ev] ??= []).push(g);
  }
};
put(process.env.IMP, '${CLAUDE_PLUGIN_ROOT}/skills/impeccable', '${CLAUDE_PROJECT_DIR}/.claude/skills/impeccable');
// Fresh cloud VMs have an empty ~/.claude, so ponytail would re-issue its
// "set up a statusline" nudge every session. Pre-create its "already nudged" flag.
put(process.env.PONY, '${CLAUDE_PLUGIN_ROOT}/hooks', '${CLAUDE_PROJECT_DIR}/.claude/hooks', {
  SessionStart: 'mkdir -p "${CLAUDE_CONFIG_DIR:-$HOME/.claude}" && touch "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/.ponytail-statusline-nudged"; ',
});
fs.writeFileSync(f, JSON.stringify(S, null, 2) + '\n');
JS

# ---- 5. Self-test: run every vendored hook the way Claude Code would --------
node - <<'JS'
const { spawnSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const S = JSON.parse(fs.readFileSync('.claude/settings.json', 'utf8'));
const home = fs.mkdtempSync(path.join(os.tmpdir(), 'hooktest-home-'));  // also empties the impeccable engine cache
const probe = path.resolve('hooktest-probe.html');
fs.writeFileSync(probe, '<!doctype html><body style="background:#fff"><p style="color:#ccc;font-size:14px">x</p></body>');
const payload = {
  SessionStart: { hook_event_name: 'SessionStart', source: 'startup' },
  UserPromptSubmit: { hook_event_name: 'UserPromptSubmit', prompt: 'hello' },
  SubagentStart: { hook_event_name: 'SubagentStart', agent_type: 'general-purpose' },
  PostToolUse: { hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: probe }, tool_response: { success: true } },
  Stop: { hook_event_name: 'Stop', stop_hook_active: false },
};
const expect = { SessionStart: 'PONYTAIL MODE ACTIVE', SubagentStart: 'PONYTAIL MODE ACTIVE', PostToolUse: 'low-contrast' };
let fail = 0;
for (const [ev, groups] of Object.entries(S.hooks)) for (const g of groups) for (const h of g.hooks) {
  if (!/\.claude\/(skills\/impeccable|hooks\/ponytail-)/.test(h.command)) continue;   // vendored hooks only
  const t0 = Date.now();
  const r = spawnSync('bash', ['-c', h.command], {
    input: JSON.stringify({ session_id: 'selftest', cwd: process.cwd(), ...payload[ev] }),
    env: { ...process.env, HOME: home, CLAUDE_CONFIG_DIR: path.join(home, '.claude'), CLAUDE_PROJECT_DIR: process.cwd() },
    encoding: 'utf8', timeout: 30000,
  });
  const ms = Date.now() - t0;
  const ok = r.status === 0 && (!expect[ev] || (r.stdout || '').includes(expect[ev])) && ms < (h.timeout ?? 60) * 1000;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${ev.padEnd(16)} ${String(ms).padStart(5)}ms (limit ${h.timeout ?? '-'}s)  ${(h.command.match(/(ponytail-[a-z-]+\.js|impeccable\S*)/) || [''])[0]}`);
  if (!ok) console.log('      exit=' + r.status + ' ' + (r.stderr || r.stdout || '').slice(0, 200));
}
fs.unlinkSync(probe);
console.log(fail ? `\n${fail} HOOK(S) FAILED - do not commit yet` : '\nAll hooks passed');
process.exit(fail ? 1 : 0);
JS

echo "--- skills: $(ls .claude/skills | wc -l) dirs | agents: $(ls .claude/agents | wc -l)"
git check-ignore -q .claude/settings.json && echo "WARNING: .claude/settings.json is gitignored"
du -sh .claude
git status --short | head -20 || true   # head closes the pipe early (SIGPIPE under pipefail)
