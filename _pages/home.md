---
layout: default
title: Home
order: 0
permalink: /home/
---
<div align="center">
	<a href="https://vshymanskyy.github.io/StandWithUkraine">
		<img src="https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg">
	</a>
	<br>
</div>    


{% assign categoryA_posts = site.posts | where: "category", "general" %}
{% assign zorg = categoryA_posts.size %}

{% assign categoryB_posts = site.posts | where: "category", "method" %}
{% assign categoryC_posts = site.posts | where_exp: "post", "post.category contains 'section'" %}
{% assign categoryD_posts = site.posts | where: "category", "modeling" %}
{% assign categoryE_posts = site.posts | where: "category", "agile" %}
{% assign categoryF_posts = site.posts | where: "category", "tools" %}
{% assign categoryG_posts = site.posts | where: "category", "versions" %}
{% assign categoryH_posts = site.posts | where: "category", "traceability" %}
{% assign categoryJ_posts = site.posts | where: "category", "management" %}
{% assign categoryK_posts = site.posts | where: "category", "customizing" %}


On this site you find answers to (currently {{ site.posts | size }}) questions
regarding arc42, organized in the following categories:

| Category         | Topics                   |
|:-----------------|:----------------------------|
| [**General questions**](/category_a/) ({{ zorg }}) | Cost, license, contributing |
|-----------------|----------------------------|
| [Questions on **methodology**](/category_b/) ({{ categoryB_posts | size }})  | Minimal amount of documentation, where-does-what-info-belong, notations, UML|
|-----------------|----------------------------|
| [Questions on **arc42 sections**](/category_c/) ({{ categoryC_posts | size }})  | How to treat the various arc42 sections, stakeholder, quality requirements, context, building blocks, runtime scenarios, deployment, concepts etc.|
|-----------------|----------------------------|
| [Questions on **modelling**](/category_d) ({{ categoryD_posts | size }}) | UML and alternative notations, consistency, clarity, understandability, diagrams, interfaces, ports,|
|-----------------|----------------------------|
| [Questions on **arc42 and agility**](/category_e/) ({{ categoryE_posts | size }}) | Scrum, Kanban, definition-of-done, minimal, lean, economical documentation|
|-----------------|----------------------------|
| [Questions on **tools**](/category_f) ({{ categoryF_posts | size }})  | Tools and their application, source code and documentation|
|-----------------|----------------------------|
| [Questions on **versioning and variants**](/category_g) ({{ categoryG_posts | size }})  | Versioning documents, versions and variants of systems|
|-----------------|----------------------------|
| [Questions on **traceability**](/category_h/) ({{ categoryH_posts | size }})  |  Tracing requirements to solution decisions and vice-versa|
|-----------------|----------------------------|
| [Questions on **managing (documentation)**](/category_j/) ({{ categoryJ_posts | size }}) |  Very large systems, standardization, governance, checklists, access-rights|
|-----------------|----------------------------|
| [Questions on **customizing arc42**](/category_k) ({{ categoryK_posts | size }}) | Tailoring and customizing, known adaptions of arc42|
|-----------------|----------------------------|



#### If you have additional questions...

Just in case **your** question(s) regarding arc42 and its usage in
practical situations are still missing ... please let us [**know here**](/contact/).


## <font color="#dd354b">We're offering architecture training!</font>

The _dynamic duo_, always two trainers in parallel, practically applicable
knowledge from Peter Hruschka and Gernot Starke. See [arc42.de](https://www.arc42.de/termine) for details, and schedule.

We've successfully trained more than 1000 developers in software architecture,
many of them passed the [iSAQB CPSA-F](https://isaqb.org) certification.
(sorry - public training currently German-only, English for inhouse trainings.)
