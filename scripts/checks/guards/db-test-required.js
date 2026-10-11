#!/usr/bin/env node
// Guard: a change to a migration ships with a real-store test, or the migration says why not
// (`db-test: skip <reason>`). Adopted by adding scripts/checks/db-test-required.json,
// { "migrations": [globs], "tests": [globs] } (the stack recipe has one); without it the guard is off.
// Compares the branch with $GUARD_BASE (CI sets origin/<base branch>), else origin/main.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = process.env.GUARD_ROOT || process.cwd();
const CONFIG = 'scripts/checks/db-test-required.json';

if (!fs.existsSync(path.join(ROOT, CONFIG))) {
  console.log('#scanned 1');
  console.error(`not adopted: add ${CONFIG} to require a real-store test with each migration change`);
  process.exit(0);
}
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, CONFIG), 'utf8'));
const matches = (globs) => (f) => globs.some((g) => path.matchesGlob(f, g));

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
  const committed = git('diff', '--name-only', '--diff-filter=AMR', from, 'HEAD').split('\n');
  const working = git('diff', '--name-only', '--diff-filter=AMR', 'HEAD').split('\n');
  return [...new Set([...committed, ...working])].filter(Boolean);
}

const changed = changedFiles();
console.log(`#scanned ${changed.length + 1}`); // +1: the change set itself, which may be empty
if (changed.some(matches(cfg.tests))) process.exit();
for (const f of changed.filter(matches(cfg.migrations))) {
  const abs = path.join(ROOT, f);
  if (!fs.existsSync(abs) || /db-test:\s*skip\s+\S+/.test(fs.readFileSync(abs, 'utf8'))) continue;
  console.log(`${f}\t${f} changes the schema with no real-store test in this change: add one (.claude/rules/tests.md), or write \`db-test: skip <reason>\` in the migration`);
  process.exitCode = 1;
}
