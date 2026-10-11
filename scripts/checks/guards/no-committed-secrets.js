#!/usr/bin/env node
// Guard: no secrets in the repo. Fails on committed .env files (except .env.example) and on
// strings shaped like common credentials. A hit means: remove it, rotate the secret, and load
// it from the environment instead.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = process.env.GUARD_ROOT || process.cwd();
const violation = (id, msg) => { console.log(`${id}\t${msg}`); process.exitCode = 1; };

const KINDS = [
  ['an AWS access key', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['a GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{60,})\b/],
  ['a Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['a private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['an Anthropic API key', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['a Stripe live key', /\b[rs]k_live_[A-Za-z0-9]{20,}/],
  ['a Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
];
const ENV_FILE = /(^|\/)\.env(\.[^/]+)?$/;
const ENV_TEMPLATE = /(^|\/)\.env\.(example|sample|template)$/;

const list = execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter((f) => f && !f.startsWith('scripts/checks/fixtures/'));
console.log(`#scanned ${list.length}`);
for (const f of list) {
  if (ENV_FILE.test(f) && !ENV_TEMPLATE.test(f)) violation(f, `${f}: an environment file is committed: remove it from git, rotate anything secret in it, and keep only .env.example`);
  const abs = path.join(ROOT, f);
  let stat;
  try { stat = fs.statSync(abs); } catch { continue; }
  if (!stat.isFile() || stat.size > 1024 * 1024) continue;
  const text = fs.readFileSync(abs, 'utf8');
  if (text.includes('\u0000')) continue; // binary
  text.split('\n').forEach((line, i) => {
    for (const [kind, re] of KINDS) {
      if (re.test(line)) violation(f, `${f}:${i + 1}: looks like ${kind}: remove it, rotate the secret, and read it from the environment`);
    }
  });
}
