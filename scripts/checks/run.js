#!/usr/bin/env node
// Guard runner: runs every guard in scripts/checks/guards/ under the contract in
// scripts/checks/README.md. Self-tests first (each guard must fail on its fixture), then the real run.
//
//   node scripts/checks/run.js                          self-tests, then all guards
//   node scripts/checks/run.js --init-baseline <name>   create a missing baseline
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const DIR = path.join(ROOT, 'scripts', 'checks');
const GUARDS = path.join(DIR, 'guards');
const FIXTURES = path.join(DIR, 'fixtures');
const baselinePath = (name) => path.join(DIR, 'baselines', `${name}.json`);
const readBaseline = (name) => (fs.existsSync(baselinePath(name)) ? JSON.parse(fs.readFileSync(baselinePath(name), 'utf8')) : null);

// A guard is a .js file, run with this Node, or an executable file, run through its shebang.
const guards = (fs.existsSync(GUARDS) ? fs.readdirSync(GUARDS) : []).filter((f) => !f.startsWith('.')).sort()
  .map((f) => ({ name: path.parse(f).name, file: path.join(GUARDS, f) }));

function runGuard(guard, root) {
  const js = guard.file.endsWith('.js');
  const r = spawnSync(js ? process.execPath : guard.file, js ? [guard.file] : [],
    { cwd: root, env: { ...process.env, GUARD_ROOT: root }, encoding: 'utf8' });
  let scanned = null;
  const counts = new Map();
  const messages = new Map();
  for (const line of (r.stdout || '').split('\n')) {
    const m = line.match(/^#scanned\s+(\d+)/);
    if (m) scanned = Number(m[1]);
    if (!line.trim() || line.startsWith('#')) continue;
    const [id, ...message] = line.split('\t');
    counts.set(id, (counts.get(id) || 0) + 1);
    if (!messages.has(id)) messages.set(id, message.join('\t'));
  }
  return { status: r.status, stderr: (r.stderr || '') + (r.error ? String(r.error) : ''), scanned, counts, messages };
}

function evaluate(name, res) {
  const problems = [];
  if (res.status !== 0 && res.status !== 1) problems.push(`guard crashed (exit ${res.status}): ${res.stderr.trim().slice(0, 300)}`);
  if (!res.scanned) problems.push(`guard scanned ${res.scanned ?? 'nothing'}: it must print "#scanned <n>" with n > 0, so a check that checks nothing fails`);
  if (res.status === 1 && res.counts.size === 0) problems.push('guard exited 1 without printing a violation line');
  const baseline = readBaseline(name) || {};
  const added = [...res.counts].filter(([id, n]) => n > (baseline[id] || 0))
    .map(([id, n]) => `${id}: ${res.messages.get(id)}${baseline[id] ? ` (baseline allows ${baseline[id]}, found ${n})` : ''}`);
  const stale = Object.entries(baseline).filter(([id, n]) => (res.counts.get(id) || 0) < n)
    .map(([id]) => `${id}: fixed; lower it to ${res.counts.get(id) || 0} in ${path.relative(ROOT, baselinePath(name))} (0 means delete the entry)`);
  return { problems, added, stale, ok: !problems.length && !added.length && !stale.length };
}

const init = process.argv.indexOf('--init-baseline');
if (init >= 0) {
  const name = process.argv[init + 1];
  const g = guards.find((x) => x.name === name);
  if (!g) { console.error(`no guard named ${name}`); process.exit(1); }
  if (readBaseline(name)) { console.error(`${name} already has a baseline; it may only shrink. Raising it is a reviewed edit with a DECISIONS.md line.`); process.exit(1); }
  fs.mkdirSync(path.dirname(baselinePath(name)), { recursive: true });
  const counts = [...runGuard(g, ROOT).counts].sort(([a], [b]) => a.localeCompare(b));
  fs.writeFileSync(baselinePath(name), JSON.stringify(Object.fromEntries(counts), null, 2) + '\n');
  console.log(`wrote ${path.relative(ROOT, baselinePath(name))}`);
  process.exit(0);
}

let failed = 0;
console.log('Self-tests (each guard must fail on its fixture):');
for (const g of guards) {
  const fx = path.join(FIXTURES, g.name);
  let problem = null;
  if (!fs.existsSync(fx)) problem = `no fixture: add scripts/checks/fixtures/${g.name}/ with input that must make this guard fail`;
  else {
    const r = runGuard(g, fx);
    if (r.status !== 1 || r.counts.size === 0) problem = `did not fail on its fixture (exit ${r.status}, ${r.counts.size} violations) ${r.stderr.trim().slice(0, 200)}`;
  }
  console.log(`  ${problem ? 'FAIL' : 'PASS'}  ${g.name}${problem ? `: ${problem}` : ''}`);
  if (problem) failed++;
}

console.log('Guards:');
for (const g of guards) {
  const res = runGuard(g, ROOT);
  const ev = evaluate(g.name, res);
  console.log(`  ${ev.ok ? 'PASS' : 'FAIL'}  ${g.name} (scanned ${res.scanned ?? '?'})`);
  for (const p of ev.problems) console.log(`        ! ${p}`);
  for (const a of ev.added) console.log(`        + ${a}`);
  for (const s of ev.stale) console.log(`        - ${s}`);
  if (!ev.problems.length) for (const note of res.stderr.split('\n').filter((l) => l.trim())) console.log(`        note: ${note}`);
  if (!ev.ok) failed++;
}
if (!guards.length) { console.log('  FAIL  no guards found in scripts/checks/guards/'); failed++; }
console.log(failed ? `\n${failed} failing. Each message above ends with its fix.` : '\nAll guards pass.');
process.exit(failed ? 1 : 0);
