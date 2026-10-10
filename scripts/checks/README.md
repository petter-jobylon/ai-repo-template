# Guards

`make guards` runs `run.js`: first a self-test of every guard, then the real run. Any language works; `run.js` picks the interpreter by extension (`.js`, `.py`, `.sh`, `.php`, `.ps1`, `.rb`) or runs an executable with no extension.

## The guard contract

A guard is one file in `guards/`. It:

1. Scans from `$GUARD_ROOT` (the repo root, or a fixture folder during the self-test).
2. Prints `#scanned <n>`, the number of files or items it checked. A missing line or 0 fails, so a guard that checks nothing can't pass.
3. Prints one line per violation: `<stable id><TAB><message>`. The message ends with the exact fix: the helper to use, the lines to add, the command to run.
4. Exits 1 when it printed a violation, 0 otherwise. Anything on stderr shows as a note.

Every guard has a fixture, `fixtures/<guard name>/`, laid out like a repo, that must make it fail. The self-test runs the guard there first.

## Baselines

A baseline (`baselines/<name>.json`, `{ "<id>": <allowed count> }`) lets a guard adopt a strict rule while existing violations stay. A new violation, or a higher count, fails. A fixed one also fails until the baseline shrinks, so the list only gets shorter:

- `node scripts/checks/run.js --init-baseline <name>` creates a missing baseline from today's violations.
- `node scripts/checks/run.js --shrink` lowers every baseline to today's counts.
- Raising a baseline is a hand edit, reviewed by the owners in `.github/CODEOWNERS`, with a `DECISIONS.md` line saying why.

The `add-baseline` skill walks through adding one.

## Patterns

`patterns.json` turns a regex into a guard with no code, and it can take a baseline like any other guard. Each entry is `{ "name", "regex", "flags"?, "include": [globs], "exclude": [globs], "message", "failing_example" }`. It runs as the guard `pattern-<name>`:

- Its violation id is the file path.
- `failing_example` must match the regex, which is its self-test.
- An `include` that matches no file fails.
