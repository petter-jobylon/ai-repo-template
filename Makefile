# The one command interface: CI, hooks, loops and agents call only these targets.
# Fill each body for this repo's stack (docs/agents/recipes/). An unfilled target fails,
# so CI never passes while checking nothing. A target that does not apply here becomes
# `@echo "n/a: <reason>"`, which records the choice.
.DEFAULT_GOAL := help
.PHONY: help setup check lint typecheck test test-db guards generate generate-check build

unconfigured = @echo "make $(1): not configured yet. Fill in this target for your stack (docs/agents/recipes/)." >&2; exit 1

help: ## List the targets
	@awk 'BEGIN {FS = ":.*## "} /^[a-z-]+:.*## / {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Install dependencies and tools
	$(call unconfigured,setup)

lint: ## Lint and format check
	$(call unconfigured,lint)

typecheck: ## Full typecheck, test files included
	$(call unconfigured,typecheck)

test: ## Unit and integration tests
	$(call unconfigured,test)

test-db: ## Tests against the real data stores (the target starts and stops them)
	$(call unconfigured,test-db)

guards: ## Guard scripts, self-tests first (scripts/checks/README.md)
	node scripts/checks/run.js

generate: ## Regenerate every generated file
	$(call unconfigured,generate)

generate-check: ## Fail when a generated file is stale, printing the command that fixes it
	$(call unconfigured,generate-check)

build: ## Build every configuration this repo ships
	$(call unconfigured,build)

check: lint typecheck test test-db guards generate-check build ## Everything CI runs
