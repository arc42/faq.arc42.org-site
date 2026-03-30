.DEFAULT_GOAL := help

COMPOSE ?= docker compose
SITE_DIR ?= _site

.PHONY: help dev down clean check

help: ## Show available targets
	@awk 'BEGIN {FS = ":.*## "; printf "Usage: make <target>\n\nTargets:\n"} /^[a-zA-Z0-9_.-]+:.*## / {printf "  %-10s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start the local Jekyll site with Docker Compose
	$(COMPOSE) up

down: ## Stop the local Jekyll site and remove containers
	$(COMPOSE) down

clean: ## Remove generated site output
	rm -rf $(SITE_DIR)

check: ## Run basic project plausibility checks
	@test -f docker-compose.yml
	@test -f _config.yml
	@test -f Gemfile
	@test -d _pages
	@test -d _posts
	@$(COMPOSE) config --quiet
	@printf "Basic checks passed.\n"
