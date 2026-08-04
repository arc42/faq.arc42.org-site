# arc42 Frequently Asked Questions

Here we collect answers to frequently asked questions on arc42.

This is supposed to be the reference source for such questions, all other FAQ
(e.g. the [Leanpub arc42-FAQ]() or
the [Leanpub "Communicating Software Architectures with arc42"]())
might contain fewer questions or fixes as this site.

It's powered by Jekyll and a modified TTSCK theme (see below).

## License
As all of the arc42 content, this FAQ is free to use under a liberal Creative-Commons
license:

![](https://i.creativecommons.org/l/by-sa/4.0/88x31.png)
This work is licensed under a
[Creative Commons Attribution-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/).


## Jekyll TTSCK Theme

For documentation on this theme, see the [original documentation](https://ttskch.github.io/jekyll-ttskch-theme/).

## Training dates

The training block at the foot of every FAQ page is rendered at build time from
`_data/trainings.json` — an expiry-filtered copy of
<https://trainings.arc42.org/api/trainings.json> that
`.github/workflows/refresh-trainings.yml` refreshes weekly (Mondays 05:17 UTC,
or manually via workflow dispatch) and commits only when the dates actually
changed. Edit dates in the trainings repo's `_data/trainings.yml`, never here;
`_includes/training-dates.html` owns the rendering, `_sass/_utilities.scss` the
styling. This replaced the former runtime htmx fetch from the Vercel fragment
backend (see the integration spec in the arc42 workspace's
`docs/superpowers/specs/2026-08-04-docs-faq-training-dates-design.md`).
