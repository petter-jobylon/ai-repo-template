#!/usr/bin/env node
// Says whether this branch's changes are low-risk, so an agent may turn on auto-merge once
// ci-summary passes. Low-risk: every changed file matches "low_risk" in scripts/low-risk-paths.json
// and none matches "never". Anything else needs the user's explicit go-ahead for that PR.
// Compares with $GUARD_BASE, else origin/main.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const ROOT = git('rev-parse', '--show-toplevel');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'low-risk-paths.json'), 'utf8'));
const any = (globs) => (f) => (globs || []).some((g) => path.matchesGlob(f, g));
const isLow = any(cfg.low_risk);
const isNever = any(cfg.never);

const base = process.env.GUARD_BASE || 'origin/main';
const from = git('merge-base', base, 'HEAD');
// --no-renames: a moved file counts at both its old and new path, so moving CLAUDE.md into docs/ is not low-risk.
const files = git('diff', '--name-only', '--no-renames', from, 'HEAD').split('\n').filter(Boolean);
if (!files.length) { console.log(`No changes against ${base}.`); process.exit(1); }
const blocking = files.filter((f) => isNever(f) || !isLow(f));
for (const f of files) console.log(`  ${blocking.includes(f) ? 'needs permission' : 'low-risk        '}  ${f}`);
if (blocking.length) {
  console.log(`NEEDS PERMISSION: ${blocking.length} of ${files.length} files are outside the low-risk list. Leave the merge to the user unless they said in this session that you may merge this PR.`);
  process.exit(1);
}
console.log('LOW-RISK: you may turn on auto-merge; it merges once ci-summary passes.');
