#!/usr/bin/env node
// Guard runner: runs every guard in scripts/checks/guards/ and every pattern in
// scripts/checks/patterns.json under the contract in scripts/checks/README.md.
// Self-tests first (each guard must fail on its fixture), then the real run.
//
//   node scripts/checks/run.js                  self-tests, then all guards
//   node scripts/checks/run.js --only <name>    one guard or pattern
//   node scripts/checks/run.js --shrink         lower every baseline to today's counts
//   node scripts/checks/run.js --init-baseline <name>   create a missing baseline
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const DIR = path.join(ROOT, 'scripts', 'checks');
const GUARDS = path.join(DIR, 'guards');
const BASELINES = path.join(DIR, 'baselines');
const FIXTURES = path.join(DIR, 'fixtures');
const PATTERNS = path.join(DIR, 'patterns.json');
const FIX_SHRINK = 'run `node scripts/checks/run.js --shrink` to tighten the baseline';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

// ---- guards --------------------------------------------------------------
const INTERPRETERS = { '.js': process.execPath, '.mjs': process.execPath, '.cjs': process.execPath,
  '.py': 'python3', '.sh': 'bash', '.php': 'php', '.ps1': 'pwsh', '.rb': 'ruby' };

function listGuards() {
  if (!fs.existsSync(GUARDS)) return [];
  // A guard is a file with a known interpreter extension, or an executable with none.
  const isGuard = (f) => INTERPRETERS[path.extname(f)]
    || (!path.extname(f) && (fs.statSync(path.join(GUARDS, f)).mode & 0o111));
  return fs.readdirSync(GUARDS).filter((f) => !f.startsWith('.') && isGuard(f)).sort()
    .map((f) => ({ name: path.parse(f).name, file: path.join(GUARDS, f), kind: 'guard' }));
}

function runGuard(guard, root) {
  const interp = INTERPRETERS[path.extname(guard.file)];
  const cmd = interp || guard.file;
  const argv = interp ? [guard.file] : [];
  const r = spawnSync(cmd, argv, { cwd: root, env: { ...process.env, GUARD_ROOT: root }, encoding: 'utf8' });
  return parseOutput(r.status, r.stdout || '', (r.stderr || '') + (r.error ? String(r.error) : ''));
}

function parseOutput(status, stdout, stderr) {
  let scanned = null;
  const counts = new Map();
  const messages = new Map();
  for (const line of stdout.split('\n')) {
    if (!line.trim()) continue;
    const m = line.match(/^#scanned\s+(\d+)/);
    if (m) { scanned = Number(m[1]); continue; }
    if (line.startsWith('#')) continue;
    const tab = line.indexOf('\t');
    const id = tab >= 0 ? line.slice(0, tab) : line;
    counts.set(id, (counts.get(id) || 0) + 1);
    if (!messages.has(id)) messages.set(id, tab >= 0 ? line.slice(tab + 1) : '');
  }
  return { status, stdout, stderr, scanned, counts, messages };
}

// ---- patterns (guards without code) ----------------------------------------
function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') { re += glob[i + 2] === '/' ? '(?:.*/)?' : '.*'; i += glob[i + 2] === '/' ? 2 : 1; }
    else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

function listPatterns() {
  if (!fs.existsSync(PATTERNS)) return [];
  const data = JSON.parse(fs.readFileSync(PATTERNS, 'utf8'));
  return (data.patterns || []).map((p) => ({ ...p, kind: 'pattern', name: `pattern-${p.name}` }));
}

function trackedFiles() {
  return execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean);
}

function runPattern(p) {
  const regex = new RegExp(p.regex, p.flags || '');
  const inc = (p.include || ['**']).map(globToRegExp);
  const exc = [...(p.exclude || []), 'scripts/checks/fixtures/**'].map(globToRegExp); // fixtures are bad on purpose
  const files = trackedFiles().filter((f) => inc.some((r) => r.test(f)) && !exc.some((r) => r.test(f)));
  let out = `#scanned ${files.length}\n`;
  for (const f of files) {
    let text;
    try { text = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch { continue; }
    text.split('\n').forEach((line, i) => {
      if (regex.test(line)) out += `${f}\t${f}:${i + 1}: ${p.message}\n`;
    });
  }
  return parseOutput(out.includes('\t') ? 1 : 0, out, '');
}

function selfTestPattern(p) {
  if (!p.failing_example) return `pattern needs a "failing_example" the regex must match`;
  if (!new RegExp(p.regex, p.flags || '').test(p.failing_example)) return `regex does not match its failing_example`;
  if (!p.message) return `pattern needs a "message" that ends with the fix`;
  return null;
}

// ---- baselines -----------------------------------------------------------
const baselinePath = (name) => path.join(BASELINES, `${name}.json`);
function readBaseline(name) {
  const f = baselinePath(name);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}
function writeBaseline(name, obj) {
  fs.mkdirSync(BASELINES, { recursive: true });
  const sorted = Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(baselinePath(name), JSON.stringify(sorted, null, 2) + '\n');
}

function evaluate(name, res) {
  const problems = [];
  if (res.status !== 0 && res.status !== 1) problems.push(`guard crashed (exit ${res.status}): ${res.stderr.trim().slice(0, 300)}`);
  if (res.scanned === null) problems.push('guard printed no "#scanned <n>" line, so it may have checked nothing');
  else if (res.scanned === 0) problems.push('guard scanned 0 items; a check that checks nothing fails');
  const baseline = readBaseline(name) || {};
  const added = [];
  const stale = [];
  for (const [id, n] of res.counts) if (n > (baseline[id] || 0)) added.push(`${id}: ${res.messages.get(id)}${baseline[id] ? ` (baseline allows ${baseline[id]}, found ${n})` : ''}`);
  for (const [id, n] of Object.entries(baseline)) if ((res.counts.get(id) || 0) < n) stale.push(`${id}: fixed, ${FIX_SHRINK}`);
  if (res.status === 1 && res.counts.size === 0) problems.push('guard exited 1 without printing a violation line');
  return { problems, added, stale, ok: !problems.length && !added.length && !stale.length };
}

// ---- main ----------------------------------------------------------------
function main() {
  const guards = listGuards();
  const patterns = listPatterns();
  const only = value('--only');
  const all = [...guards, ...patterns].filter((g) => !only || g.name === only);
  if (only && !all.length) { console.error(`no guard or pattern named ${only}`); process.exit(1); }
  const results = (g) => (g.kind === 'pattern' ? runPattern(g) : runGuard(g, ROOT));

  if (value('--init-baseline')) {
    const g = all.find((x) => x.name === value('--init-baseline'));
    if (!g) { console.error(`no guard or pattern named ${value('--init-baseline')}`); process.exit(1); }
    if (readBaseline(g.name)) { console.error(`${g.name} already has a baseline; it may only shrink (--shrink). Raising it is a reviewed edit with a DECISIONS.md line.`); process.exit(1); }
    writeBaseline(g.name, Object.fromEntries(results(g).counts));
    console.log(`wrote ${path.relative(ROOT, baselinePath(g.name))}`);
    return;
  }
  if (flag('--shrink')) {
    for (const g of all) {
      const base = readBaseline(g.name);
      if (!base) continue;
      const counts = results(g).counts;
      const next = {};
      for (const [id, n] of Object.entries(base)) { const c = Math.min(n, counts.get(id) || 0); if (c > 0) next[id] = c; }
      writeBaseline(g.name, next);
      console.log(`shrunk ${g.name}: ${Object.keys(base).length} -> ${Object.keys(next).length} entries`);
    }
    return;
  }

  let failed = 0;
  console.log('Self-tests (each guard must fail on its fixture):');
  for (const g of all) {
    let problem = null;
    if (g.kind === 'pattern') problem = selfTestPattern(g);
    else {
      const fx = path.join(FIXTURES, g.name);
      if (!fs.existsSync(fx)) problem = `no fixture: add scripts/checks/fixtures/${g.name}/ with input that must make this guard fail`;
      else {
        const r = runGuard(g, fx);
        if (r.status !== 1 || r.counts.size === 0) problem = `did not fail on its fixture (exit ${r.status}, ${r.counts.size} violations) ${r.stderr.trim().slice(0, 200)}`;
      }
    }
    console.log(`  ${problem ? 'FAIL' : 'PASS'}  ${g.name}${problem ? `: ${problem}` : ''}`);
    if (problem) failed++;
  }

  console.log('Guards:');
  for (const g of all) {
    const res = results(g);
    const ev = evaluate(g.name, res);
    console.log(`  ${ev.ok ? 'PASS' : 'FAIL'}  ${g.name} (scanned ${res.scanned ?? '?'})`);
    for (const p of ev.problems) console.log(`        ! ${p}`);
    for (const a of ev.added) console.log(`        + ${a}`);
    for (const s of ev.stale) console.log(`        - ${s}`);
    for (const note of res.stderr.split('\n').filter((l) => l.trim() && ev.problems.length === 0)) console.log(`        note: ${note}`);
    if (!ev.ok) failed++;
  }
  if (!all.length) { console.log('  FAIL  no guards found in scripts/checks/guards/'); failed++; }
  console.log(failed ? `\n${failed} failing. Each message above ends with its fix.` : '\nAll guards pass.');
  process.exit(failed ? 1 : 0);
}

main();
