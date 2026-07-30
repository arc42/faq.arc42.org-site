# CLAUDE.md — arc42 FAQ

Jekyll site answering 136 questions about arc42. Live at https://faq.arc42.org.

**Stack**: Jekyll 3.10 via the pinned `github-pages` gem (232) · no Node ·
GitHub Pages (Actions deploy). The Gemfile/Gemfile.lock pair is copied from
`docs.arc42.org-site` — keep them in sync with docs, don't drift.

---

## Deployment — read before touching anything

- Deploys run **only from `main`** via
  `.github/workflows/build-deploy-gh-pages.yml` (Pages `build_type:
  workflow`, mirrors quality.arc42.org-site). **Every push to `main`
  deploys.** Pushes to any other branch deploy nothing.
- The workflow installs from the committed `Gemfile.lock`
  (`bundler-cache: true`) — the lockfile must stay committed and
  resolvable on Ruby 3.3 / x86_64-linux.
- `_config.yml` sets `repository:` because jekyll-github-metadata needs it
  outside Actions. Don't remove it.

## Local build — no native Ruby

The github-pages stack does **not** install on Ruby ≥ 4 (commonmarker).
Build in a container:

```bash
docker run --rm -v $PWD:/faq -w /faq \
  -e BUNDLE_PATH=/tmp/bundle -e BUNDLE_FROZEN=true -e JEKYLL_ENV=production \
  ruby:3.3 bash -lc "bundle install --quiet && bundle exec jekyll build"
```

Sanity after building: `ls _site/questions | wc -l` → **136**.

---

## Content model

- Questions live in `_posts/<category-dir>/YYYY-MM-DD-q-<id>.md` (dates are
  fabricated — filename convention only). Front matter is exactly five keys
  on every file: `layout: post`, `title`, `tags`, `category`, `permalink`.
- `tags:` is a **space-separated string**, not a YAML list (legacy; changes
  only in migration WP-E).
- Category pages are hand-written: `_pages/category-{A..K}.html`.

## Critical gotchas

- **The 136 `/questions/<QID>/` permalinks are externally cited and
  non-negotiable.** Never rename, never redirect, never "clean up". Any
  content-model change must keep them byte-identical (ADR-0013/0014).
- `robots.txt` disallows `/search/` on purpose.
- `_layouts/post.html` is a passthrough to `page.html` — edit `page.html`.
- The site still uses jQuery + vendored FontAwesome; both are scheduled for
  removal (WP-D) — don't add new usages of either.
- Family colour rules: no new hex values outside the token file once WP-B
  lands; `#1675b9`, `#aee3f8`, `#397ab2`, `#5bbad5`, `#fe5a83` are on the
  deny-list (docs collisions / retired).

## Current migration (2026-07/08)

Branch **`family-styling`** rebuilds the site on the arc42 family brand
(signature hue: deep teal). The plan of record, work packages WP-A…WP-F,
sequencing and open decisions live in
**`meta.arc42.org/faq-migration-plan.md`** (sibling repo). Handover /
machine-setup instructions: `meta.arc42.org/handover-faq-migration.md`.
Family rules: `meta.arc42.org/BRAND.md`, `DESIGN.md`, `adr/`.

Reference implementations to copy from (assumed as sibling checkouts):
`../docs.arc42.org-site` (tokens, fonts, footer, callouts, search engine),
`../quality.arc42.org-site` (deploy workflow, search hotkey/combobox UX).

## Conventions

- Commits: imperative mood, explain the why in the body; small and
  reviewable. Stage files explicitly — no `git add -A`.
- Copy concepts from docs.arc42.org wherever possible. Consistency beats
  local invention.
