# Copilot Instructions for faq.arc42.org-site

## Repository Overview

This repository is the source for the [arc42 FAQ site](https://faq.arc42.org), a Jekyll-based static website that answers frequently asked questions about [arc42](https://arc42.org) — a practical, proven template for software architecture documentation.

## Tech Stack

- **Static site generator**: [Jekyll](https://jekyllrb.com/)
- **Hosting**: GitHub Pages with a custom domain (`faq.arc42.org`)
- **Theme**: Modified [jekyll-ttskch-theme](https://github.com/ttskch/jekyll-ttskch-theme)
- **Markdown**: kramdown with GFM input and Rouge syntax highlighting
- **Templating**: Liquid (Jekyll's default)
- **Key plugins**: `jekyll-sitemap`, `jekyll-seo-tag`, `jekyll-github-metadata`

## Running Locally

Use Docker Compose to serve the site locally at `http://localhost:4000`:

```bash
docker-compose up
```

Or run Jekyll directly (requires Ruby/Bundler):

```bash
bundle install
bundle exec jekyll serve
```

## Content Structure

All FAQ posts live under `_posts/`, organized into subdirectories by category:

| Directory        | Category slug            | Topic                               |
|------------------|--------------------------|-------------------------------------|
| `A-general/`     | `general`                | General questions (cost, license, contributing) |
| `B-method/`      | `method`                 | Methodology questions               |
| `C-arc42/`       | `section-<name>`         | arc42 sections (requirements, context, building blocks, etc.) |
| `D-modeling/`    | `modeling`               | Modelling and notation questions    |
| `E-agile/`       | `agile`                  | arc42 and agility                   |
| `F-tools/`       | `tools`                  | Tools questions                     |
| `G-versioning/`  | `versions`               | Versioning and variants             |
| `H-traceability/`| `traceability`           | Traceability questions              |
| `J-management/`  | `management`             | Managing documentation              |
| `K-customizing/` | `customizing`            | Customizing arc42                   |

The `C-arc42/` category is further divided into subdirectories matching arc42 template sections (e.g., `01-requirements/`, `03-context/`, `05-buildingblocks/`, etc.).

## Post Conventions

### File Naming

Post files follow this pattern:

```
YYYY-MM-DD-q-{category-letter}-{number}.md
```

Examples:
- `2015-01-01-q-a-1.md` → Question A-1
- `2016-03-01-q-c-1-1.md` → Question C-1-1

### Front Matter

Every post requires this front matter:

```yaml
---
layout: post
title: "Question {ID}: {Question text}"
tags: {space-separated tags}
category: {category-slug}
permalink: /questions/{ID}/
---
```

Examples:
- `category: general` for A questions
- `category: method` for B questions
- `category: section-requirements` for C-1 questions
- `category: section-context` for C-3 questions

### Content Format

- Write content in Markdown (kramdown/GFM dialect)
- Use `{{ site.imageurl }}/images/...` for images (not relative paths)
- Resize images with `{:width="30%"}` after the image tag
- Use `{% raw %}...{% endraw %}` when showing Liquid template code

## Site Configuration

`_config.yml` is the main configuration file. Key settings:
- `url`: `https://faq.arc42.org`
- `permalink: pretty`
- `excerpt_separator: <!--more-->`

## Pages

Static pages live in `_pages/` and are written in Markdown or HTML with Jekyll front matter.

## Adding a New FAQ Question

1. Determine the appropriate category (A–K) and next available question number.
2. Create the file in the corresponding `_posts/{Category}/` directory.
3. Use the correct file naming convention and front matter (see above).
4. Write the answer in Markdown.
5. If the question belongs to a new arc42 sub-section (C category), create the subdirectory under `C-arc42/` first.
