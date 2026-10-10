#!/usr/bin/env node
// Guard: each pin in docs/agents/pinned-deps.md (| package | version | file | reason |) is
// still the version in the named file.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.env.GUARD_ROOT || process.cwd();
const violation = (id, msg) => { console.log(`${id}\t${msg}`); process.exitCode = 1; };
const DOC = 'docs/agents/pinned-deps.md';
if (!fs.existsSync(path.join(ROOT, DOC))) { console.log('#scanned 0'); process.exit(0); }
console.log('#scanned 1');
const rows = fs.readFileSync(path.join(ROOT, DOC), 'utf8').replace(/<!--[\s\S]*?-->/g, '').split('\n')
  .filter((l) => l.startsWith('|') && !/^\|\s*-/.test(l)).slice(1); // drop the header row
for (const row of rows) {
  const [pkg, version, file, reason] = row.split('|').slice(1, -1).map((c) => c.trim().replace(/`/g, ''));
  if (!pkg) continue;
  const id = `${file}:${pkg}`;
  if (!reason) { violation(`${id}`, `${DOC}: ${pkg} has no reason: say why it is pinned, or remove the pin`); continue; }
  const abs = path.join(ROOT, file || '');
  if (!file || !fs.existsSync(abs)) { violation(`${id}`, `${DOC}: ${pkg} names a missing file "${file}": point it at the manifest or lockfile that holds the version`); continue; }
  const ok = fs.readFileSync(abs, 'utf8').split('\n').some((l) => l.includes(pkg) && l.includes(version));
  if (!ok) violation(`${id}`, `${file}: ${pkg} is no longer pinned at ${version}: restore the pin, or change it in ${DOC} with a DECISIONS.md line`);
}
