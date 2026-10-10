#!/usr/bin/env node
// Guard: a change to a migration ships with a real-store test, or the migration says why not
// (`db-test: covered-by <test path>` or `db-test: skip <reason>`). Globs live in
// scripts/checks/db-test-required.json; set "n/a" to a reason if this repo has no data store.
// Compares the branch with $GUARD_BASE (CI sets origin/<base branch>), else origin/main.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = process.env.GUARD_ROOT || process.cwd();
const violation = (id, msg) => { console.log(`${id}\t${msg}`); process.exitCode = 1; };
const CONFIG = 'scripts/checks/db-test-required.json';

const cfgPath = fs.existsSync(path.join(ROOT, CONFIG)) ? path.join(ROOT, CONFIG) : path.join(__dirname, '..', 'db-test-required.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
if (cfg['n/a']) { console.log('#scanned 1'); console.error(`n/a: ${cfg['n/a']}`); process.exit(0); }
if (!cfg.migrations?.length || !cfg.tests?.length) {
  console.log('#scanned 1');
  if (process.env.TEMPLATE_SELF === 'true') { console.error('not configured (template self-test)'); process.exit(0); }
  violation(CONFIG, `${CONFIG} is not configured: list the migration globs and the real-store test globs, or set "n/a" to the reason this repo has no data store`);
  process.exit();
}

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
const matches = (globs) => { const res = globs.map(globToRegExp); return (f) => res.some((r) => r.test(f)); };

function changedFiles() {
  const listed = path.join(ROOT, '.guard-changed-files'); // fixtures list their "changed" files here
  if (fs.existsSync(listed)) return fs.readFileSync(listed, 'utf8').split('\n').filter(Boolean);
  const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  const base = process.env.GUARD_BASE || 'origin/main';
  let from;
  try { from = git('merge-base', base, 'HEAD'); } catch {
    console.error(`no ${base} to compare with; nothing checked (CI sets GUARD_BASE on pull requests)`);
    return [];
  }
  const committed = git('diff', '--name-only', '--diff-filter=AM', from, 'HEAD').split('\n');
  const working = git('diff', '--name-only', '--diff-filter=AM', 'HEAD').split('\n');
  return [...new Set([...committed, ...working])].filter(Boolean);
}

const changed = changedFiles();
console.log(`#scanned ${changed.length + 1}`);
const isMigration = matches(cfg.migrations);
const isTest = matches(cfg.tests);
if (changed.some(isTest)) process.exit();
for (const f of changed.filter(isMigration)) {
  const abs = path.join(ROOT, f);
  if (!fs.existsSync(abs)) continue;
  const text = fs.readFileSync(abs, 'utf8');
  const covered = text.match(/db-test:\s*covered-by\s+(\S+)/);
  if (covered && fs.existsSync(path.join(ROOT, covered[1]))) continue;
  if (/db-test:\s*skip\s+\S+/.test(text)) continue;
  violation(f, `${f} changes the schema with no real-store test in this change: add one (.claude/rules/tests.md), or write \`db-test: covered-by <test path>\` or \`db-test: skip <reason>\` in the migration`);
}
