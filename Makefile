.DEFAULT_GOAL := help

COMPOSE ?= docker compose
SITE_DIR ?= _site

# This site's fixed local dev port. Every arc42 site has its own so their dev
# servers can run side by side; see raw/port-assignment.md in meta.arc42.org.
# Changing it here is not enough: docker-compose.yml and the Dockerfile pass
# the same number to Jekyll so its startup banner names the real port.
SITE_PORT ?= 4220

.PHONY: help dev build down clean check install update shell logs

help: ## Show available targets
	@awk 'BEGIN {FS = ":.*## "; printf "Usage: make <target>\n\nTargets:\n"} /^[a-zA-Z0-9_.-]+:.*## / {printf "  %-10s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start the local Jekyll dev server with live reload (http://localhost:4220)
	@echo "==> Open http://localhost:$(SITE_PORT)  (NOT http://0.0.0.0:$(SITE_PORT) — Firefox refuses to connect to 0.0.0.0)"
	@holder=$$(docker ps --filter "publish=$(SITE_PORT)" --format '{{.Names}}'); \
	if [ -n "$$holder" ]; then \
		echo "==> Port $(SITE_PORT) is already in use by another container: $$holder"; \
		echo "==> That's likely a dev server from a sibling arc42 site repo. Stop it first, e.g.:"; \
		echo "==>   docker stop $$holder"; \
		exit 1; \
	fi
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
