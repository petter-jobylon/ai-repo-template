#!/usr/bin/env node
// Guard: DECISIONS.md and docs/decisions/*.md hold one dated line per decision, at most 300
// characters. Open escalations (ESCALATED with no RESOLVED <date>) are listed as notes.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.env.GUARD_ROOT || process.cwd();
const violation = (id, msg) => { console.log(`${id}\t${msg}`); process.exitCode = 1; };
const MAX = 300;
const files = ['DECISIONS.md'].filter((f) => fs.existsSync(path.join(ROOT, f)));
const arch = path.join(ROOT, 'docs', 'decisions');
if (fs.existsSync(arch)) for (const f of fs.readdirSync(arch).sort()) if (f.endsWith('.md')) files.push(`docs/decisions/${f}`);
console.log(`#scanned ${files.length}`);
const escalated = new Map();
const resolved = new Set();
for (const f of files) {
  let started = false;
  fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').forEach((line, i) => {
    if (!line.trim()) return;
    if (!started && !line.startsWith('[')) return; // header text before the first entry
    started = true;
    const where = `${f}:${i + 1}`;
    const m = line.match(/^\[(\d{4}-\d{2}-\d{2})\] (.+)/);
    if (!m) { violation(`${where}`, `${where}: not a decision line: write it as "[YYYY-MM-DD] <decision>: <why>"`); return; }
    if (line.length > MAX) violation(`${where}`, `${where}: ${line.length} characters (cap ${MAX}): keep the decision and why here, move detail to the PR body`);
    if (/^ESCALATED:/.test(m[2])) escalated.set(m[1], `${where}: ${m[2].slice(0, 120)}`);
    const r = m[2].match(/^RESOLVED (\d{4}-\d{2}-\d{2}):/);
    if (r) resolved.add(r[1]);
  });
}
for (const [date, text] of escalated) if (!resolved.has(date)) console.error(`open escalation ${text}`);
