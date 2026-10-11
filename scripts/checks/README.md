# Guards

`make guards` runs `run.js`: first a self-test of every guard, then the real run. A guard is a `.js` file, run with Node, or an executable file in any language, run through its shebang.

## The guard contract

A guard is one file in `guards/`. It:

1. Scans from `$GUARD_ROOT` (the repo root, or a fixture folder during the self-test).
2. Prints `#scanned <n>`, the number of files or items it checked. A missing line or 0 fails, so a guard that checks nothing can't pass.
3. Prints one line per violation: `<stable id><TAB><message>`. The message ends with the exact fix: the helper to use, the lines to add, the command to run.
4. Exits 1 when it printed a violation, 0 otherwise. Anything on stderr shows as a note.

Every guard has a fixture, `fixtures/<guard name>/`, laid out like a repo, that must make it fail. The self-test runs the guard there first.

## Baselines

A baseline (`baselines/<name>.json`, `{ "<id>": <allowed count> }`) lets a guard adopt a strict rule while existing violations stay. A new violation, or a higher count, fails. A fixed one also fails until its count is lowered, so the list only gets shorter. `node scripts/checks/run.js --init-baseline <name>` creates a missing baseline from today's violations. Raising a baseline is a hand edit, reviewed by the owners in `.github/CODEOWNERS`, with a `DECISIONS.md` line saying why. The `add-baseline` skill walks through adding one.

## Example

A guard that keeps `print()` out of Python app code, so logging goes through the repo's one logger (`ARCHITECTURE.md` § Cross-cutting concerns). Its fixture is `fixtures/no-print/app.py` holding `print(order)`.

```js
#!/usr/bin/env node
// Guard: no print() in app code; log through <your logging module>.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = process.env.GUARD_ROOT || process.cwd();
const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '*.py'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter((f) => f && !f.startsWith('scripts/checks/fixtures/') && !f.includes('tests/'));
console.log(`#scanned ${files.length}`);
for (const f of files) fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').forEach((line, i) => {
  if (/^\s*print\(/.test(line)) { console.log(`${f}\t${f}:${i + 1}: use the logger from <your logging module> instead of print()`); process.exitCode = 1; }
});
```
