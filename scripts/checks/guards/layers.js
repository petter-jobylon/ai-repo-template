#!/usr/bin/env node
// Guard: imports point down the layers in ARCHITECTURE.md. Adopted by adding scripts/checks/layers.json
// (the stack recipe has one); without it the guard is off.
//   import_patterns: { "<file extension>": ["<regex whose group 1 is the imported module>"] }
//   layers: [{ "name", "paths": [globs of files in the layer], "modules": [regexes matching
//            module names that belong to the layer], "may_import": [layer names] }]
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = process.env.GUARD_ROOT || process.cwd();
const CONFIG = 'scripts/checks/layers.json';

if (!fs.existsSync(path.join(ROOT, CONFIG))) {
  console.log('#scanned 1');
  console.error(`not adopted: add ${CONFIG} to enforce the dependency direction in ARCHITECTURE.md`);
  process.exit(0);
}
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, CONFIG), 'utf8'));
const layers = cfg.layers.map((l) => ({ ...l, modRes: (l.modules || []).map((m) => new RegExp(m)) }));
const layerOfFile = (f) => layers.find((l) => (l.paths || []).some((g) => path.matchesGlob(f, g)));
const layerOfModule = (m) => layers.find((l) => l.modRes.some((r) => r.test(m)));
const patterns = Object.fromEntries(Object.entries(cfg.import_patterns).map(([ext, list]) => [ext, list.map((p) => new RegExp(p))]));

const inLayers = execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' }).split('\n')
  .filter((f) => f && !f.startsWith('scripts/checks/fixtures/') && patterns[path.extname(f)] && layerOfFile(f));
console.log(`#scanned ${inLayers.length}`);
for (const f of inLayers) {
  const from = layerOfFile(f);
  fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').forEach((line, i) => {
    for (const re of patterns[path.extname(f)]) {
      const m = line.match(re);
      if (!m || !m[1]) continue;
      const to = layerOfModule(m[1]);
      if (!to || to.name === from.name || (from.may_import || []).includes(to.name)) continue;
      const allowed = (from.may_import || []).join(', ') || 'nothing';
      console.log(`${f}:${to.name}\t${f}:${i + 1}: the ${from.name} layer imports ${m[1]} from the ${to.name} layer: ${from.name} may import ${allowed} (ARCHITECTURE.md); move the code or go through a layer it may use`);
      process.exitCode = 1;
    }
  });
}
