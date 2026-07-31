.DEFAULT_GOAL := help

COMPOSE ?= docker compose
SITE_DIR ?= _site

.PHONY: help dev build down clean check install update shell logs

help: ## Show available targets
	@awk 'BEGIN {FS = ":.*## "; printf "Usage: make <target>\n\nTargets:\n"} /^[a-zA-Z0-9_.-]+:.*## / {printf "  %-10s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start the local Jekyll dev server with live reload (http://localhost:4000)
	@echo "==> Open http://localhost:4000  (NOT http://0.0.0.0:4000 — Firefox refuses to connect to 0.0.0.0)"
	$(COMPOSE) up --build

build: ## Build the Docker dev image (faq-arc42-site:latest) from the Gemfile-pinned gems
	$(COMPOSE) build

down: ## Stop the local Jekyll site and remove containers
	$(COMPOSE) down

clean: ## Remove generated site output AND the Docker cache volumes (a true reset)
	rm -rf $(SITE_DIR) .sass-cache .jekyll-cache .jekyll-metadata
	@# .jekyll-cache/.sass-cache live in named Docker volumes, not on the host,
	@# so a host rm alone leaves them stale — wipe the volumes too.
	-$(COMPOSE) down -v --remove-orphans

install: build ## Install/refresh gems into the dev image after editing the Gemfile
	$(COMPOSE) run --rm jekyll bundle install

update: build ## Update gems to their latest allowed versions (rewrites Gemfile.lock)
	$(COMPOSE) run --rm jekyll bundle update

shell: build ## Open a shell inside the dev container for debugging
	$(COMPOSE) run --rm jekyll bash

logs: ## Tail logs from the running dev container
	$(COMPOSE) logs -f jekyll

check: ## Run basic project plausibility checks
	@test -f docker-compose.yml
	@test -f _config.yml
	@test -f Gemfile
	@test -d _pages
	@test -d _posts
	@$(COMPOSE) config --quiet
	@printf "Basic checks passed.\n"
