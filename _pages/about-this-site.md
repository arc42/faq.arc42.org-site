---
layout: page
title: About this site
permalink: /aboutthissite/
order: 16
share: false
---

### Content
The content of this site is primarily based upon a Leanpub book on arc42, that contains an FAQ chapter. The questions in this book and on this website should be identical.

Both are written in Markdown, but not in a completely identical dialect, sigh... (see below for differences).

### Tooling
This page is based upon [Jekyll](), a static website generator, using the [TtskchTheme](https://github.com/ttskch/jekyll-ttskch-theme) theme.

It's maintained on Github - published via github-pages.

### Markdown and Jekyll

Some issues occured during the migration of questions from the Leanpub markdown:

#### Images size

Use the standard markdown image tag, append Jekyll-specific with-attributes:

{% highlight markdown %}
![](/images/faq/B-Method/whitebox-sample.png){:width="30%"}
{% endhighlight %}

#### Image location

In contrast to the plain markdown (e.g. used at LeanPub), we have to prepend
a ```/``` to the image path:

{% highlight markdown %}
![](/images/...)
{% endhighlight %}

The image directory is located in the root of the site, parallel to the Jekyll
standard directories ```_posts``` etc.

#### Crossreferences

I still have **NOT** found out how to crossreference questions...


#### Source code

The Liquid processor used by Jekyll to generate the site is peculiar with source
code - making especially difficult to display Liquid code itself :-(




### Sorting questions

To loop through a collection called `collection_name`
and sorts it by the front matter variable `date` and than filters
the collection with `reverse` in reverse order

{% highlight html %}
{% raw  %}
    <ul>
    {% assign sorted = (site.collection_name | sort: 'date') | reverse %}
    {% for item in sorted %}
    <li>{{ item.title }}</li>
    {% endfor %}
    </ul>
{% endraw  %}
{% endhighlight %}

Thanx to [Phlow](https://gist.github.com/Phlow/1f27dfafdf2bbcc5c48e)
