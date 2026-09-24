#!/usr/bin/env bash
# SessionStart hook: puts the Playwright CLI (skill: .claude/skills/playwright-cli) in cloud sessions.
[ "$CLAUDE_CODE_REMOTE" = "true" ] || exit 0
command -v playwright-cli >/dev/null || npm install -g @playwright/cli@latest >/dev/null 2>&1
# cdn.playwright.dev is off the cloud allowlist, so use the image's Chromium; the container runs as root, hence no sandbox.
# The egress proxy re-signs HTTPS with Anthropic CAs (in /root/.ccr/ca-bundle.crt) that Chromium's own
# trust store lacks; add only those, re-read each session because they rotate.
command -v certutil >/dev/null || { apt-get update -qq && apt-get install -y -qq libnss3-tools; } >/dev/null 2>&1
DB="sql:$HOME/.pki/nssdb"; mkdir -p "$HOME/.pki/nssdb"
[ -f "$HOME/.pki/nssdb/cert9.db" ] || certutil -N -d "$DB" --empty-password
python3 - "$DB" <<'PY'
import re, subprocess, sys
for i, pem in enumerate(re.findall(r"-----BEGIN CERTIFICATE-----.*?-----END CERTIFICATE-----", open("/root/.ccr/ca-bundle.crt").read(), re.S)):
    if "O = Anthropic" in subprocess.run(["openssl", "x509", "-noout", "-subject"], input=pem, capture_output=True, text=True).stdout:
        subprocess.run(["certutil", "-A", "-d", sys.argv[1], "-t", "C,,", "-n", f"ccr-proxy-{i}"], input=pem, text=True)
PY
[ -n "$CLAUDE_ENV_FILE" ] && cat >> "$CLAUDE_ENV_FILE" <<'ENV'
export PLAYWRIGHT_MCP_EXECUTABLE_PATH=/opt/pw-browsers/chromium
export PLAYWRIGHT_MCP_SANDBOX=false
ENV
exit 0
