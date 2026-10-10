# Recipe: Python, Django, PostgreSQL and Redis

How to fill the template's stack slots for a Django app with PostgreSQL as the system of record and Redis for cache and queues. Each section names the slot it fills. The tool choices (uv, ruff, mypy with django-stubs, pytest) are this recipe's defaults; swap any of them as long as the make target keeps its meaning.

## Makefile targets

```make
setup: ## Install dependencies and tools
	uv sync --frozen

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
```

`test-db` arrives with the real-database layer: a compose file that starts PostgreSQL and Redis, runs the `db`-marked tests against them and stops them.

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

Redis holds caches, sessions and queue messages, never a value that must survive a flush. A rule that has to hold (a unique email, a balance, an allowed state change) lives in PostgreSQL as a constraint or trigger, so a Redis outage or eviction can't break it.

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
