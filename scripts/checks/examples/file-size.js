#!/usr/bin/env node
// Example guard (inactive here): fails a source file longer than MAX_LINES. To use it, copy it
// into scripts/checks/guards/, set INCLUDE to this repo's source globs, add a fixture
// (scripts/checks/fixtures/file-size/ with one long file), and create a baseline for the files
// that are already too long: node scripts/checks/run.js --init-baseline file-size
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = process.env.GUARD_ROOT || process.cwd();
const MAX_LINES = 500;
const INCLUDE = /\.(py|ts|tsx|js|php|cs)$/; // this repo's source files
const violation = (id, msg) => { console.log(`${id}\t${msg}`); process.exitCode = 1; };
let files;
try {
  files = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n');
} catch {
  const walk = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
  files = walk('.').map((f) => f.replace(/^\.\//, ''));
}
files = files.filter((f) => INCLUDE.test(f) && !f.startsWith('scripts/checks/fixtures/'));
console.log(`#scanned ${files.length}`);
for (const f of files) {
  const n = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').length;
  if (n > MAX_LINES) violation(f, `${f} has ${n} lines (max ${MAX_LINES}): split it along a seam in ARCHITECTURE.md, one responsibility per file`);
}
