#!/usr/bin/env node
// Guard: every repo path and `make <target>` named in an agent doc exists, and CLAUDE.md
// stays within its line cap. Agent docs: CLAUDE.md, AGENTS.md, README.md, .claude/rules/,
// hand-written skills (not in skills-lock.json) and docs/agents/ (minus the guardrails map
// and recipes). Paths created on first use go in scripts/checks/instruction-refs.ignore.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.env.GUARD_ROOT || process.cwd();
const violation = (id, msg) => { console.log(`${id}\t${msg}`); process.exitCode = 1; };
const MAX_CLAUDE_LINES = 120;
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const ignoreFile = path.join(__dirname, '..', 'instruction-refs.ignore');
const ignore = fs.existsSync(ignoreFile)
  ? fs.readFileSync(ignoreFile, 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean)
  : [];

function walk(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
let vendored = [];
if (exists('skills-lock.json')) vendored = Object.keys(JSON.parse(read('skills-lock.json')).skills || {});
const docs = [
  ...['CLAUDE.md', 'AGENTS.md', 'README.md'].filter(exists),
  ...walk('.claude/rules'),
  ...(exists('.claude/skills') ? fs.readdirSync(path.join(ROOT, '.claude/skills')) : [])
    .filter((d) => !vendored.includes(d)).flatMap((d) => walk(path.join('.claude/skills', d))),
  ...walk('docs/agents').filter((f) => !f.startsWith('docs/agents/recipes/') && f !== 'docs/agents/guardrails.md'),
].filter((f) => f.endsWith('.md'));

const makeTargets = exists('Makefile')
  ? new Set([...read('Makefile').matchAll(/^([a-zA-Z][\w-]*)\s*:/gm)].map((m) => m[1])) : new Set();
const PATHLIKE = /^[\w.@-]+(?:\/[\w.@-]*)+$|^[\w.-]+\.(?:md|json|ya?ml|sh|js|mjs|py|toml|txt)$/;

console.log(`#scanned ${docs.length}`);
for (const doc of docs) {
  const text = read(doc).replace(/<!--[\s\S]*?-->/g, '').replace(/```[\s\S]*?```/g, '');
  const dir = path.dirname(doc);
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/`([^`]+)`/g)) {
      const tok = m[1].trim();
      const make = tok.match(/^make ([a-z][\w-]*)/);
      if (make && !makeTargets.has(make[1])) violation(`${doc}:make ${make[1]}`, `${doc}:${i + 1}: \`make ${make[1]}\` is not a Makefile target: add the target or fix the doc`);
      if (!PATHLIKE.test(tok) || tok.includes('://') || /^\w\/\w$/.test(tok)) continue;
      const clean = tok.replace(/:\d+(-\d+)?$/, '');
      const ok = exists(clean) || exists(path.join(dir, clean)) || ignore.some((g) => clean === g || clean.startsWith(g.endsWith('/') ? g : g + '/'));
      if (!ok) violation(`${doc}:${clean}`, `${doc}:${i + 1}: \`${clean}\` does not exist: fix the path, or add it to scripts/checks/instruction-refs.ignore with the reason`);
    }
  });
}
if (exists('CLAUDE.md')) {
  const n = read('CLAUDE.md').split('\n').length;
  if (n > MAX_CLAUDE_LINES) violation(`CLAUDE.md:length`, `CLAUDE.md has ${n} lines (cap ${MAX_CLAUDE_LINES}): move path-specific detail into a .claude/rules/ file`);
}
