---
layout: page
title: About this site
permalink: /aboutthissite/
order: 25
share: false
---

## Imprint and Privacy

Imprint and privacy information is contained on its own [page](/imprint-privacy/).
 

## You like what you see?

> In case you like what you read here, share your experience with colleagues and friends...

## Support

[INNOQ](https://innoq.com) supports creation and maintenance of this site.

## Content
The content of this site is primarily based upon a Leanpub book on arc42, that contains an FAQ chapter. The questions in this book and on this website are identical to a large extend.

Both are written in Markdown, but not in a completely identical dialect, sigh... (see below for differences).

## Tooling
This page is based upon [Jekyll](), a static website generator, using the [TtskchTheme](https://github.com/ttskch/jekyll-ttskch-theme) theme.
It's maintained on [Github](https://github.com/arc42/faq/) and published via github-pages.


### Markdown and Jekyll

Some issues occured during the migration of questions from Leanpub markdown (the dialect in which we originally authored the content...):

### Images size

Use the standard markdown image tag, append Jekyll-specific with-attributes:

{% highlight markdown %}
{% raw %}
![]({{ site.imageurl }}/images/faq/B-Method/whitebox-sample.png){:width="30%"}
{% endraw %}
{% endhighlight %}

### Image location

In contrast to the plain markdown (e.g. used at LeanPub), we have to prepend
a ```/``` to the image path:

{% highlight markdown %}
{% raw %}
![]({{ site.imageurl }}/images/...)
{% endraw %}
{% endhighlight %}

The image directory is located in the root of the site, parallel to the Jekyll
standard directories ```_posts``` etc.

### Crossreferences

I still have **NOT** found out how to crossreference questions...


### Source code

The Liquid processor used by Jekyll to generate the site is peculiar with source
code - making especially difficult to display Liquid code itself :-(

### Include markdown in html

See for example "category_F.html" for an example:

{% highlight html %}
{% raw  %}

{% capture my-include %}{% include category_F_preface.md %}{% endcapture %}
{{ my-include | markdownify }}

{% endraw  %}
{% endhighlight %}

Thanx to [Mono](https://wolfslittlestore.be/2013/10/rendering-markdown-in-jekyll/).


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

### List Posts sorted by Tags

Needed for the "Keywords" page:

{% highlight html %}
{% raw %}

{% capture site_tags %}{% for tag in site.tags %}{{ tag | first }}{% unless forloop.last %},{%endunless %}{% endfor %}{% endcapture %}
{% assign tag_words = site_tags | split:',' | sort %}

<div id="tags">
  <ul class="tag-box inline">
  {% for tag in tag_words %}
    <li><a href="#{{ tag | cgi_escape }}">{{ tag }} <span>{{ site.tags[tag] | size }}</span></a></li>
  {% endfor %}
  </ul>

  {% for item in (0..site.tags.size) %}{% unless forloop.last %}
    {% capture this_word %}{{ tag_words[item] | strip_newlines }}{% endcapture %}
  <h2 id="{{ this_word | cgi_escape }}">{{ this_word }}</h2>
  <ul class="posts">
    {% assign sorted_posts = (site.tags[this_word] | sort_by: 'title' ) | reverse %}
    {% for post in sorted_posts %}{% if post.title != null %}
    <li> <a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endif %}{% endfor %}
  </ul>
  {% endunless %}{% endfor %}
</div>

{% endraw %}
{% endhighlight %}

Thanx to [LanyonM](https://github.com/LanyonM/lanyonm.github.io/blob/master/tags.html)


