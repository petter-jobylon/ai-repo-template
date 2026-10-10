#!/usr/bin/env bash
# Sample for a cloud environment's setup script (the environment's settings, under Setup script).
# It runs when the environment is prepared, before any session; a short script can be cached
# between sessions. Put slow, rarely changing steps here: the language toolchain and the Docker
# images that `make up` and `make test-db` start. Fast per-session steps stay in the repo's
# SessionStart hook (scripts/cloud-tools.sh). Don't rely on the repo being checked out here.
set -euo pipefail

# 1. Toolchain: this stack's runtime and package manager (see docs/agents/recipes/).

# 2. Docker images, pulled once so sessions don't wait on a registry.
if command -v dockerd >/dev/null; then
  docker info >/dev/null 2>&1 || (nohup dockerd >/tmp/dockerd.log 2>&1 &)
  for _ in $(seq 1 20); do docker info >/dev/null 2>&1 && break; sleep 1; done
  # docker pull <image>   # one line per image in compose.yml and compose.test.yml
fi
