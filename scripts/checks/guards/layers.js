#!/usr/bin/env node
// Guard: imports point down the layers in ARCHITECTURE.md. Config: scripts/checks/layers.json.
//   import_patterns: { "<file extension>": ["<regex whose group 1 is the imported module>"] }
//   layers: [{ "name", "paths": [globs of files in the layer], "modules": [regexes matching
//            module names that belong to the layer], "may_import": [layer names] }]
// Set "n/a" to the reason this repo has no layers worth enforcing.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = process.env.GUARD_ROOT || process.cwd();
const violation = (id, msg) => { console.log(`${id}\t${msg}`); process.exitCode = 1; };
const CONFIG = 'scripts/checks/layers.json';
const cfgPath = fs.existsSync(path.join(ROOT, CONFIG)) ? path.join(ROOT, CONFIG) : path.join(__dirname, '..', 'layers.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
if (cfg['n/a']) { console.log('#scanned 1'); console.error(`n/a: ${cfg['n/a']}`); process.exit(0); }
if (!cfg.layers?.length || !Object.keys(cfg.import_patterns || {}).length) {
  console.log('#scanned 1');
  if (process.env.TEMPLATE_SELF === 'true') { console.error('not configured (template self-test)'); process.exit(0); }
  violation(CONFIG, `${CONFIG} is not configured: list the layers from ARCHITECTURE.md and the import pattern per file extension, or set "n/a" to the reason`);
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
function files() {
  try {
    return execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').filter(Boolean);
  } catch {
    const walk = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
    return walk('.').map((f) => f.replace(/^\.\//, ''));
  }
}

const layers = cfg.layers.map((l) => ({ ...l, pathRes: (l.paths || []).map(globToRegExp), modRes: (l.modules || []).map((m) => new RegExp(m)) }));
const layerOfFile = (f) => layers.find((l) => l.pathRes.some((r) => r.test(f)));
const layerOfModule = (m) => layers.find((l) => l.modRes.some((r) => r.test(m)));
const patterns = Object.fromEntries(Object.entries(cfg.import_patterns).map(([ext, list]) => [ext, list.map((p) => new RegExp(p))]));

const inLayers = files().filter((f) => !f.startsWith('scripts/checks/fixtures/') && patterns[path.extname(f)] && layerOfFile(f));
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
      violation(`${f}:${to.name}`, `${f}:${i + 1}: the ${from.name} layer imports ${m[1]} from the ${to.name} layer: ${from.name} may import ${allowed} (ARCHITECTURE.md); move the code or go through a layer it may use`);
    }
  });
}
