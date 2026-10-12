#!/usr/bin/env node
// Guard: DECISIONS.md holds one dated line per decision, at most 300 characters.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.env.GUARD_ROOT || process.cwd();
const FILE = 'DECISIONS.md';
const MAX = 300;
const violation = (where, msg) => { console.log(`${where}\t${where}: ${msg}`); process.exitCode = 1; };
const exists = fs.existsSync(path.join(ROOT, FILE));
console.log(`#scanned ${exists ? 1 : 0}`);
let started = false;
if (exists) fs.readFileSync(path.join(ROOT, FILE), 'utf8').split('\n').forEach((line, i) => {
  if (!line.trim() || (!started && !line.startsWith('['))) return; // header text before the first entry
  started = true;
  const where = `${FILE}:${i + 1}`;
  if (!/^\[\d{4}-\d{2}-\d{2}\] ./.test(line)) violation(where, 'not a decision line: write it as "[YYYY-MM-DD] <decision>: <why>"');
  else if (line.length > MAX) violation(where, `${line.length} characters (cap ${MAX}): keep the decision and why here, move detail to the PR body`);
});
