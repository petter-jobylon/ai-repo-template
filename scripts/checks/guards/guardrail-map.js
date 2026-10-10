#!/usr/bin/env node
// Guard: every row of docs/agents/guardrails.md has a valid "Adopted here" value
// (not yet | yes | n/a), so the map stays a usable adoption record.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.env.GUARD_ROOT || process.cwd();
const violation = (id, msg) => { console.log(`${id}\t${msg}`); process.exitCode = 1; };
const DOC = 'docs/agents/guardrails.md';
if (!fs.existsSync(path.join(ROOT, DOC))) { console.log('#scanned 0'); process.exit(0); }
console.log('#scanned 1');
const ALLOWED = new Set(['not yet', 'yes', 'n/a']);
let col = -1;
fs.readFileSync(path.join(ROOT, DOC), 'utf8').split('\n').forEach((line, i) => {
  if (!line.startsWith('|') || /^\|\s*-/.test(line)) return;
  const cells = line.split('|').slice(1, -1).map((c) => c.trim());
  if (cells.includes('Adopted here')) { col = cells.indexOf('Adopted here'); return; }
  if (col < 0) return;
  if (!ALLOWED.has(cells[col])) violation(`${DOC}:${i + 1}`, `${DOC}:${i + 1}: "${cells[col]}" for "${cells[0]}": use not yet, yes or n/a`);
});
