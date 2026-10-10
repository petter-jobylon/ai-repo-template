#!/usr/bin/env node
// Guard: every external action in .github/workflows and .github/actions is pinned to a
// 40-character commit SHA, and every workflow sets top-level permissions.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.env.GUARD_ROOT || process.cwd();
const violation = (id, msg) => { console.log(`${id}\t${msg}`); process.exitCode = 1; };
function walk(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
const files = [...walk('.github/workflows'), ...walk('.github/actions')].filter((f) => /\.ya?ml$/.test(f));
console.log(`#scanned ${files.length}`);
for (const f of files) {
  const text = fs.readFileSync(path.join(ROOT, f), 'utf8');
  text.split('\n').forEach((line, i) => {
    const m = line.match(/^\s*-?\s*uses:\s*["']?([^"'\s#]+)/);
    if (!m) return;
    const ref = m[1];
    if (ref.startsWith('./') || ref.startsWith('$/')) return; // local actions
    if (ref.startsWith('docker://') ? /@sha256:[0-9a-f]{64}$/.test(ref) : /@[0-9a-f]{40}$/.test(ref)) return;
    violation(`${f}:${ref}`, `${f}:${i + 1}: \`${ref}\` is not pinned: use owner/repo@<40-character commit SHA> # vX.Y.Z (a moved tag cannot change a SHA)`);
  });
  if (f.startsWith(path.join('.github', 'workflows')) && !/^permissions:/m.test(text)) {
    violation(`${f}:permissions`, `${f}: no top-level permissions: add "permissions: { contents: read }" and widen per job only where needed`);
  }
}
