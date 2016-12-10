---
layout: page
title: About this site
permalink: /aboutthissite/
order: 16
share: false
---

> This site does **NOT** use cookies or other means to track or analyze your visit.
> In case you like what you read here, share your experience with colleagues and friends...

### About Gernot Starke

I'm:

* happily married with two (nearly grown-up) kids and a few cats in Cologne, Germany,
* fellow at innoQ,
* quite busy coaching and consulting medium and large-scale enterprises on topics around software architecture and methodical software engineering,
* co-founder and maintainer of <a href="http://arc42.de">arc42</a>, the template for pragmatic and systematic software architecture documentation,
* founder of <a href="http://aim42.org">aim42</a>, the open source framework for systematic _software architecture improvement_,
* active member and working group lead within the <a href="http://isaqb.org">iSAQB</a>,
* regular presenter at IT-conferences,
* author and co-author of more than a dozen books on software architecture, patterns, SOA, and the like. I'm really sorry - most of these books are written in German. Have a look at <a href="http://leanpub.com">Leanpub</a> for some of my English books.


### Content
The content of this site is primarily based upon a Leanpub book on arc42, that contains an FAQ chapter. The questions in this book and on this website are identical to a large extend.

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
