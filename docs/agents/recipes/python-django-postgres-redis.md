# Recipe: Python, Django, PostgreSQL and Redis

How to fill the template's stack slots for a Django app with PostgreSQL as the system of record and Redis for cache and queues. Each section names the slot it fills. The tool choices (uv, ruff, mypy with django-stubs, pytest) are this recipe's defaults; swap any of them as long as the make target keeps its meaning.

## Makefile targets

```make
setup: ## Install dependencies and tools
	uv sync --frozen

up: ## Start the app with its services and migrations applied
	scripts/ensure-docker.sh
	[ -f .env ] || cp .env.example .env
	docker compose up -d --wait
	uv run --env-file .env python manage.py migrate
	uv run --env-file .env python manage.py runserver 0.0.0.0:8000

down: ## Stop what `make up` started
	docker compose down

seed: ## Load demo data into the local app
	uv run --env-file .env python manage.py loaddata seed/demo.json

lint: ## Lint and format check
	uv run ruff check .
	uv run ruff format --check .

typecheck: ## Full typecheck, test files included
	uv run mypy .

test: ## Unit and integration tests
	uv run pytest -m "not db"

generate: ## Regenerate every generated file
	uv run python manage.py makemigrations

generate-check: ## Fail when a generated file is stale
	uv run python manage.py makemigrations --check --dry-run || { echo "models changed without a migration: run make generate" >&2; exit 1; }

build: ## Build every configuration this repo ships
	docker build --tag app:ci .
	uv run python manage.py check --deploy

test-db: ## Tests against the real data stores
	scripts/ensure-docker.sh
	docker compose -f compose.test.yml -p $(notdir $(CURDIR))-test up -d --wait
	DATABASE_URL=postgres://postgres:test@127.0.0.1:55432/app_test REDIS_URL=redis://127.0.0.1:56379/0 \
	  uv run pytest -m db; status=$$?; \
	  docker compose -f compose.test.yml -p $(notdir $(CURDIR))-test down -v; exit $$status
```

The test settings read `DATABASE_URL` and `REDIS_URL` (for example with `dj-database-url`). pytest-django builds the test database from every migration, so each run replays the schema from empty.

## compose.yml and .env.example (local app)

```yaml
# Local stores for `make up`. Same mirror as compose.test.yml.
services:
  postgres:
    image: mirror.gcr.io/library/postgres:16-alpine
    environment: { POSTGRES_PASSWORD: dev, POSTGRES_DB: app }
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck: { test: ["CMD", "pg_isready", "-U", "postgres"], interval: 1s, retries: 30 }
  redis:
    image: mirror.gcr.io/library/redis:7-alpine
    ports: ["6379:6379"]
    healthcheck: { test: ["CMD", "redis-cli", "ping"], interval: 1s, retries: 30 }
volumes:
  pgdata:
```

Lines for `.env.example`, each a working local default:

```sh
DATABASE_URL=postgres://postgres:dev@127.0.0.1:5432/app
REDIS_URL=redis://127.0.0.1:6379/0
DJANGO_SECRET_KEY=local-only-not-secret
DEBUG=1
ENVIRONMENT=local
```

Seed data is a fixture built for demos (`seed/demo.json`), never an export of production.

## compose.test.yml

```yaml
# Real stores for `make test-db`. Images come from Google's Docker Hub mirror because
# anonymous Docker Hub pulls are rate-limited in cloud sessions (429).
services:
  postgres:
    image: mirror.gcr.io/library/postgres:16-alpine
    environment: { POSTGRES_PASSWORD: test, POSTGRES_DB: app_test }
    ports: ["55432:5432"]
    tmpfs: ["/var/lib/postgresql/data"]
    healthcheck: { test: ["CMD", "pg_isready", "-U", "postgres"], interval: 1s, retries: 30 }
  redis:
    image: mirror.gcr.io/library/redis:7-alpine
    ports: ["56379:6379"]
    healthcheck: { test: ["CMD", "redis-cli", "ping"], interval: 1s, retries: 30 }
```

Match the image versions to production.

## Docker in cloud sessions

Some cloud images ship the Docker daemon stopped, and a session with more than one repo runs no repo's hooks, so the targets that need Docker start it themselves. `scripts/ensure-docker.sh`:

```bash
#!/usr/bin/env bash
# Makes sure the Docker daemon answers; starts it in a Claude Code cloud session.
docker info >/dev/null 2>&1 && exit 0
if [ "$CLAUDE_CODE_REMOTE" = "true" ] && command -v dockerd >/dev/null; then
  (nohup dockerd >/tmp/dockerd.log 2>&1 &)
  for _ in $(seq 1 20); do docker info >/dev/null 2>&1 && exit 0; sleep 1; done
  echo "dockerd did not start: see /tmp/dockerd.log" >&2; exit 1
fi
echo "Docker isn't running: start Docker Desktop or the docker service, then rerun" >&2
exit 1
```

## Cloud environment setup script

Paste into the cloud environment's setup script (its settings, under Setup script). It runs before any session, without the repo checked out, and can be cached between sessions, so the slow, rarely changing steps go here:

```bash
set -euo pipefail
pip install --quiet uv
uv python install 3.12
if command -v dockerd >/dev/null; then
  docker info >/dev/null 2>&1 || (nohup dockerd >/tmp/dockerd.log 2>&1 &)
  for _ in $(seq 1 20); do docker info >/dev/null 2>&1 && break; sleep 1; done
  docker pull mirror.gcr.io/library/postgres:16-alpine
  docker pull mirror.gcr.io/library/redis:7-alpine
fi
```

## db-test-required guard

`scripts/checks/db-test-required.json`:

```json
{
  "migrations": ["**/migrations/*.py"],
  "tests": ["**/tests/db/**", "**/test_*_db.py"]
}
```

Mark real-store tests with `@pytest.mark.db` and keep them where those globs find them. A migration that needs no test of its own says so in a comment: `# db-test: skip only renames a help text`.

## Sweep and parity tests

A sweep test reads the catalog, so a new table is checked without anyone adding it to a list (this one checks single-column foreign keys):

```python
import pytest
from django.db import connection

@pytest.mark.db
def test_every_foreign_key_has_an_index():
    with connection.cursor() as cur:
        cur.execute("""
            select c.conrelid::regclass::text, a.attname
            from pg_constraint c
            join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
            where c.contype = 'f'
              and not exists (select 1 from pg_index i
                              where i.indrelid = c.conrelid and i.indkey[0] = c.conkey[1])
        """)
        missing = cur.fetchall()
    assert not missing, f"add an index for each foreign key: {missing}"
```

A second sweep fails when a Django REST framework view is neither permission-gated nor on an explicit free list:

```python
from django.urls import get_resolver
from rest_framework.permissions import AllowAny

FREE = {"health", "login", "public-job-list"}  # URL names that are open on purpose

def views(patterns=None):
    for p in patterns or get_resolver().url_patterns:
        if hasattr(p, "url_patterns"):
            yield from views(p.url_patterns)
        else:
            yield p

def test_every_api_view_is_gated_or_listed_free():
    open_views = [
        p.name for p in views()
        if hasattr(p.callback, "cls")  # DRF views; permission_classes falls back to the settings default
        and p.name not in FREE
        and AllowAny in p.callback.cls.permission_classes
    ]
    assert not open_views, f"gate these views, or add them to FREE with a reason: {open_views}"
```

A parity test reads both sides and names the one to edit:

```python
import polib
from django.conf import settings

def test_every_language_has_every_message():
    ids = {code: {e.msgid for e in polib.pofile(f"locale/{code}/LC_MESSAGES/django.po")} for code, _ in settings.LANGUAGES}
    every = set().union(*ids.values())
    missing = {code: sorted(every - have) for code, have in ids.items() if every - have}
    assert not missing, f"add these messages to each locale: {missing}"
```

## Exhaustive closed sets

Model a closed set as an `Enum` and end each `match` with `assert_never`, so mypy fails until a new member is handled everywhere:

```python
from enum import Enum
from typing import assert_never

class Stage(Enum):
    APPLIED = "applied"
    INTERVIEW = "interview"
    HIRED = "hired"

def next_action(stage: Stage) -> str:
    match stage:
        case Stage.APPLIED: return "screen"
        case Stage.INTERVIEW: return "schedule"
        case Stage.HIRED: return "onboard"
        case _: assert_never(stage)
```

## Layers

A common Django split: models hold data and its rules, services hold the use cases, and views and serializers call services, never models directly. `scripts/checks/layers.json`:

```json
{
  "import_patterns": { ".py": ["^\\s*from\\s+([\\w.]+)\\s+import", "^\\s*import\\s+([\\w.]+)"] },
  "layers": [
    { "name": "models", "paths": ["**/models.py", "**/models/**"], "modules": ["\\.models(\\.|$)"], "may_import": [] },
    { "name": "services", "paths": ["**/services.py", "**/services/**"], "modules": ["\\.services(\\.|$)"], "may_import": ["models"] },
    { "name": "api", "paths": ["**/views.py", "**/serializers.py", "**/api/**"], "modules": ["\\.(views|serializers|api)(\\.|$)"], "may_import": ["services"] }
  ]
}
```

Name the same three layers in `ARCHITECTURE.md`. Logging goes through one logger; the guard in `scripts/checks/README.md` § Example keeps `print()` out of app code.

## Low-risk paths

Add `uv.lock` to `low_risk` in `scripts/low-risk-paths.json`, so a lockfile-only dependency bump can auto-merge once CI is green. A change to `pyproject.toml` still needs the user's go-ahead.

## CI toolchain step

In `.github/actions/setup/action.yml`, replace the `TOOLCHAIN` comment with:

```yaml
    - uses: astral-sh/setup-uv@c18668ad3cf93ea998bef934396af7bb5c839dc7 # v10.2.0
      with:
        python-version: "3.12"
        enable-cache: true
```

Use the Python version the project pins. Keep the SHA pin and its version comment.

## Redis

Redis holds caches, sessions and queue messages, never a value that must survive a flush. A rule that has to hold (a unique email, an allowed state change) lives in PostgreSQL as a constraint or trigger, so a Redis outage or eviction can't break it.

## Pinned dependencies

A dependency held at an exact version on purpose gets `==` in `pyproject.toml` and the reason in a comment on the same line. `make setup` runs `uv sync --frozen`, which refuses a lockfile that no longer matches.

## Production scripts as Django management commands

The contract in `.claude/rules/prod-scripts.md`, as a management command. It assumes a `settings.ENVIRONMENT` value that names where the process runs.

```python
import hashlib
import json

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from accounts.models import Account  # example model


class Command(BaseCommand):
    help = "Deactivate accounts unused for two years. Dry run unless --execute with the reviewed hash."

    def add_arguments(self, parser):
        parser.add_argument("--target", required=True, choices=["local", "staging", "production"])
        parser.add_argument("--execute", action="store_true")
        parser.add_argument("--approved-hash")

    def plan(self):
        rows = Account.objects.stale().order_by("pk").values_list("pk", flat=True)
        return [{"pk": pk, "change": "deactivate"} for pk in rows]  # ids only, no personal data

    def handle(self, *args, **opts):
        if settings.ENVIRONMENT != opts["target"]:
            raise CommandError(f"--target {opts['target']} but this process runs in {settings.ENVIRONMENT}")
        self.stdout.write(f"target: {opts['target']}")
        plan = self.plan()
        text = json.dumps(plan, sort_keys=True, indent=1)
        digest = hashlib.sha256(text.encode()).hexdigest()
        self.stdout.write(text)
        self.stdout.write(f"plan sha256: {digest}")
        if not opts["execute"]:
            self.stdout.write("dry run, nothing changed. After review: --execute --approved-hash=<sha256>")
            return
        if opts["approved_hash"] != digest:
            raise CommandError("the plan changed since it was reviewed: review the new dry run")
        with transaction.atomic():
            Account.objects.filter(pk__in=[p["pk"] for p in plan]).update(is_active=False)
        self.stdout.write(f"executed {len(plan)} changes, plan {digest}")
```

Log the executed line to the audit trail your `.claude/rules/prod-scripts.md` names.
