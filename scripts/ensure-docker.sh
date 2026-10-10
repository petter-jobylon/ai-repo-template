#!/usr/bin/env bash
# Makes sure the Docker daemon answers. Called by the cloud SessionStart hook and by make
# targets that need Docker, so they work even in sessions where hooks don't run (a session
# with more than one repo runs no repo's hooks).
docker info >/dev/null 2>&1 && exit 0
if [ "$CLAUDE_CODE_REMOTE" = "true" ] && command -v dockerd >/dev/null; then
  (nohup dockerd >/tmp/dockerd.log 2>&1 &)
  for _ in $(seq 1 20); do docker info >/dev/null 2>&1 && exit 0; sleep 1; done
  echo "dockerd did not start: see /tmp/dockerd.log" >&2; exit 1
fi
echo "Docker isn't running: start Docker Desktop or the docker service, then rerun" >&2
exit 1
