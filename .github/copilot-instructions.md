# Copilot Instructions for faq.arc42.org-site

## Project Overview

This repository contains the source for [faq.arc42.org](https://faq.arc42.org) — a FAQ site covering frequently asked questions about the [arc42](https://arc42.org) software architecture documentation template.

The site is a static website built with **Jekyll** and hosted via **GitHub Pages** with a custom domain (`faq.arc42.org`).

## Tech Stack

- **Static site generator**: [Jekyll](https://jekyllrb.com/)
- **Theme**: Modified [TTSCK theme](https://ttskch.github.io/jekyll-ttskch-theme/)
- **Markup**: Markdown (kramdown with GFM input) and HTML (Liquid templates)
- **Syntax highlighting**: Rouge
- **Plugins**: `jekyll-sitemap`, `jekyll-seo-tag`, `jekyll-github-metadata`
- **CSS preprocessor**: Sass (compressed output)
- **Local development**: Docker Compose (`docker-compose.yml` using `bretfisher/jekyll-serve`)
- **License**: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)

## Repository Structure

```
.
├── _config.yml          # Jekyll site configuration
├── _includes/           # Reusable Liquid partials (article headers, navigation, etc.)
├── _layouts/            # Page layout templates (default, page, post, index_default)
├── _pages/              # Static pages and category listing pages
├── _posts/              # FAQ entries, organised into category subdirectories
│   ├── A-general/       # Category A: General questions
│   ├── B-method/        # Category B: arc42 method questions
│   ├── C-arc42/         # Category C: arc42 template questions
│   ├── D-modeling/      # Category D: Modeling questions
│   ├── E-agile/         # Category E: Agile questions
│   ├── F-tools/         # Category F: Tooling questions
│   ├── G-versioning/    # Category G: Versioning questions
│   ├── H-traceability/  # Category H: Traceability questions
│   ├── J-management/    # Category J: Management questions
│   └── K-customizing/   # Category K: Customizing arc42 questions
├── _sass/               # Sass source files
├── assets/              # Static assets (CSS, JS, images)
├── Gemfile              # Ruby gem dependencies
├── docker-compose.yml   # Local development server
└── index.html           # Site home page
```

## FAQ Categories

| Category | Directory | Jekyll `category` value | Topic |
|----------|-----------|------------------------|-------|
| A | `_posts/A-general/` | `general` | General arc42 questions |
| B | `_posts/B-method/` | `method` | arc42 method |
| C | `_posts/C-arc42/` | `arc42` | arc42 template sections |
| D | `_posts/D-modeling/` | `modeling` | UML & modeling |
| E | `_posts/E-agile/` | `agile` | Agile & arc42 |
| F | `_posts/F-tools/` | `tools` | Tools support |
| G | `_posts/G-versioning/` | `versioning` | Versioning documentation |
| H | `_posts/H-traceability/` | `traceability` | Requirements traceability |
| J | `_posts/J-management/` | `management` | Management concerns |
| K | `_posts/K-customizing/` | `customizing` | Customizing arc42 |

## How to Add a New FAQ Entry

Each FAQ entry is a Markdown file in the appropriate `_posts/<category>/` subdirectory. Follow this naming convention and front matter format:

**File name**: `YYYY-MM-DD-q-<category-letter>-<number>.md`

**Front matter template**:
```yaml
---
layout: post
title: "Question X-N: <Short question title>"
category: <category-value>   # see table above
tags: <space-separated tags>
permalink: /questions/X-N/
---
```

**Example** (`_posts/A-general/2015-01-01-q-a-1.md`):
```yaml
---
layout: post
title: "Question A-1: What does 42 mean?"
tags: "42"
category: general
permalink: /questions/A-1/
---
```

The question number (`X-N`) must be unique within its category and should follow the existing sequence.

Use `<!--more-->` to define the excerpt boundary if the post is long.

## How to Build and Run Locally

### Using Docker (recommended)

```bash
docker-compose up
```

The site will be served at `http://localhost:4000`.

### Using Ruby/Bundler directly

```bash
bundle install
bundle exec jekyll serve
```

The site will be served at `http://localhost:4000`.

## Configuration Notes

- `_config.yml` contains environment-specific URL settings. The `url` and `baseurl` values differ between local development and GitHub Pages deployment.
- Sass files live in `_sass/`; variables are in `_sass/base/_variables.scss`.
- The `exclude` list in `_config.yml` prevents build/development files from being included in the generated site.

## Content Guidelines

- All content is in **English**.
- Answers should be concise and practical, focusing on arc42 usage.
- Use `**Short answer**` / `**Longer answer**` sections for complex topics (see existing posts for reference).
- Markdown definition list syntax (`: answer text`) is used for short/longer answer blocks.
- Prefer linking to official arc42 resources and authoritative external references.
- Images should be placed in the `images/` directory and referenced with the `{{ site.imageurl }}` Liquid variable.
