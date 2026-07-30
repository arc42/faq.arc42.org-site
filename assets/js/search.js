// Site search over the 136 FAQ questions.
//
// Engine: docs.arc42.org's — vendored lunr 2.3.9, lazy-loaded on first focus,
// index built in the browser from /search.json. 136 short documents index in a
// few milliseconds, which is why this site has no Node build step.
// Ranking: exact > trailing-wildcard > fuzzy, title > tags > category > body.
//
// Ergonomics: quality.arc42.org's — hotkeys, ARIA combobox, "show all" row,
// aria-live count.
//
// Deliberately NOT ported from those two sites: type grouping and the coloured
// type rails. faq has exactly one content type, so a badge on every row would
// carry no information.
//
// Keyboard:
//   Cmd/Ctrl + K      focus search from anywhere
//   /                 focus search from anywhere (ignored while typing in a field)
//   Up / Down         walk the suggestions; Home / End jump to the ends
//   Enter             open the highlighted question (or submit the form)
//   Cmd/Ctrl + Enter  open the full result list at /search/?q=…
//   Esc               close the panel; a second Esc clears the field, a third blurs
//
// Vanilla — no jQuery. Runs deferred, so the DOM is parsed before it executes.
(function () {
    'use strict';

    // The include ships this script alongside its markup; if the include is ever
    // rendered twice, only the first copy may bind.
    if (window.__arc42FaqSearch) return;
    window.__arc42FaqSearch = true;

    var PANEL_LIMIT = 8;      // suggestions shown before the "show all" row
    var DEBOUNCE_MS = 120;
    var MIN_QUERY = 2;
    var EXCERPT_BEFORE = 60;
    var EXCERPT_AFTER = 120;

    var root = document.querySelector('[data-faq-search]');
    var pagePane = document.getElementById('search-page-results');
    if (!root && !pagePane) return;

    var baseurl = (root && root.getAttribute('data-baseurl')) ||
        (pagePane && pagePane.getAttribute('data-baseurl')) || '';
    baseurl = baseurl.replace(/\/$/, '');

    var form = root && root.querySelector('form');
    var input = root && root.querySelector('#search');
    var panel = root && root.querySelector('#faq-search-panel');
    var status = root && root.querySelector('[data-faq-search-status]');

    // ---- index ---------------------------------------------------------------

    var idx = null;
    var byRef = null;
    var loading = null;

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = function () { reject(new Error('failed to load ' + src)); };
            document.head.appendChild(s);
        });
    }

    function normalizeTags(tags) {
        if (Array.isArray(tags)) return tags.join(' ');
        return tags || '';
    }

    // Depending on Jekyll's render order, `content` arrives either as rendered
    // HTML with the tags already stripped, or as raw Markdown with Liquid still
    // in it. Scrub the raw case so neither pollutes the index nor the excerpts.
    function cleanContent(text) {
        return (text || '')
            .replace(/\{%.*?%\}/g, ' ')
            .replace(/\{\{.*?\}\}/g, ' ')
            .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/[#*_`|>]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Lazy: readers who never search pay for neither lunr nor the corpus.
    function ensureIndex() {
        if (!loading) {
            loading = loadScript(baseurl + '/assets/lib/lunr/lunr.min.js')
                .then(function () { return fetch(baseurl + '/search.json'); })
                .then(function (res) {
                    if (!res.ok) throw new Error('search.json ' + res.status);
                    return res.json();
                })
                .then(function (docs) {
                    byRef = {};
                    idx = lunr(function () {
                        this.ref('url');
                        this.field('title', { boost: 10 });
                        this.field('tags', { boost: 5 });
                        this.field('category', { boost: 2 });
                        this.field('content');
                        docs.forEach(function (d) {
                            d.content = cleanContent(d.content);
                            byRef[d.url] = d;
                            this.add({
                                url: d.url,
                                title: d.title || '',
                                tags: normalizeTags(d.tags),
                                category: d.category || '',
                                content: d.content
                            });
                        }, this);
                    });
                })
                .catch(function (err) {
                    loading = null;   // let the next keystroke retry
                    throw err;
                });
        }
        return loading;
    }

    // Three-tier query: exact (stemmed) beats prefix beats fuzzy. The wildcard
    // and fuzzy clauses skip the pipeline — stemming a prefix breaks it.
    function runQuery(raw, fields) {
        var tokens = lunr.tokenizer(raw).map(String);
        if (!tokens.length) return [];
        function clause(opts) {
            if (fields) opts.fields = fields;
            return opts;
        }
        return idx.query(function (q) {
            tokens.forEach(function (t) {
                q.term(t, clause({ boost: 100 }));
                q.term(t, clause({ boost: 10, usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING }));
                if (t.length > 3) {
                    q.term(t, clause({ boost: 1, usePipeline: false, editDistance: t.length > 5 ? 2 : 1 }));
                }
            });
        });
    }

    function termsOf(raw) {
        return raw.toLowerCase().split(/\s+/).filter(Boolean);
    }

    // Appends `text` to `el`, wrapping every occurrence of a query term in
    // <mark>. Built from nodes rather than innerHTML: the corpus is site-owned
    // but the query is not, and this way neither can ever be parsed as markup.
    function appendHighlighted(el, text, terms) {
        var value = String(text == null ? '' : text);
        var pattern = terms
            .map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); })
            .filter(Boolean)
            .join('|');
        if (!pattern) {
            el.appendChild(document.createTextNode(value));
            return;
        }
        var re = new RegExp(pattern, 'gi');
        var last = 0;
        var m;
        while ((m = re.exec(value)) !== null) {
            if (m[0].length === 0) { re.lastIndex++; continue; }   // no zero-width loops
            if (m.index > last) {
                el.appendChild(document.createTextNode(value.slice(last, m.index)));
            }
            var mark = document.createElement('mark');
            mark.textContent = m[0];
            el.appendChild(mark);
            last = m.index + m[0].length;
        }
        if (last < value.length) {
            el.appendChild(document.createTextNode(value.slice(last)));
        }
    }

    // ---- the incremental panel ----------------------------------------------

    var currentOptions = [];
    var activeIndex = -1;
    var scrollEl = null;
    var debounceTimer = null;
    var lastQuery = '';
    var suppressNextOpen = false;

    var isMac = typeof navigator !== 'undefined' &&
        /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');
    var chordLabel = isMac ? '⌘⏎' : 'Ctrl ⏎';

    function setStatus(message) {
        if (status) status.textContent = message || '';
    }

    function closePanel() {
        if (!panel) return;
        panel.hidden = true;
        panel.textContent = '';
        input.setAttribute('aria-expanded', 'false');
        input.removeAttribute('aria-activedescendant');
        currentOptions = [];
        activeIndex = -1;
        scrollEl = null;
    }

    function applyActive() {
        currentOptions.forEach(function (el, i) {
            var on = i === activeIndex;
            el.setAttribute('aria-selected', on ? 'true' : 'false');
            el.classList.toggle('is-active', on);
        });
        if (activeIndex >= 0 && currentOptions[activeIndex]) {
            var el = currentOptions[activeIndex];
            input.setAttribute('aria-activedescendant', el.id);
            var view = scrollEl || panel;
            var top = el.offsetTop;
            var bottom = top + el.offsetHeight;
            if (top < view.scrollTop) view.scrollTop = top;
            else if (bottom > view.scrollTop + view.clientHeight) {
                view.scrollTop = bottom - view.clientHeight;
            }
        } else {
            input.removeAttribute('aria-activedescendant');
        }
    }

    function moveActive(delta) {
        if (!currentOptions.length) return;
        activeIndex = (activeIndex + delta + currentOptions.length) % currentOptions.length;
        applyActive();
    }

    function option(index, href) {
        var li = document.createElement('li');
        li.className = 'faq-search__item';
        li.id = 'faq-search-opt-' + index;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        li.setAttribute('data-href', href);
        return li;
    }

    function renderPanel(results, raw) {
        var terms = termsOf(raw);
        panel.textContent = '';
        currentOptions = [];
        activeIndex = -1;
        scrollEl = null;

        if (!results.length) {
            var none = document.createElement('div');
            none.className = 'faq-search__empty';
            none.setAttribute('role', 'status');
            none.textContent = 'No matches for “' + raw + '”.';
            panel.appendChild(none);
            panel.hidden = false;
            input.setAttribute('aria-expanded', 'false');
            return 0;
        }

        scrollEl = document.createElement('div');
        scrollEl.className = 'faq-search__scroll';
        scrollEl.setAttribute('role', 'presentation');

        var list = document.createElement('ul');
        list.className = 'faq-search__list';
        list.setAttribute('role', 'presentation');

        results.slice(0, PANEL_LIMIT).forEach(function (r, i) {
            var d = byRef[r.ref];
            if (!d) return;
            var li = option(i, baseurl + d.url);
            var title = document.createElement('span');
            title.className = 'faq-search__item-title';
            appendHighlighted(title, d.title, terms);
            li.appendChild(title);
            var meta = document.createElement('span');
            meta.className = 'faq-search__item-meta';
            meta.setAttribute('aria-hidden', 'true');
            meta.textContent = d.qid || '';
            li.appendChild(meta);
            list.appendChild(li);
            currentOptions.push(li);
        });

        scrollEl.appendChild(list);

        // Selectable "show all" row: Arrow-Down past the last suggestion lands
        // on it, Enter then routes to /search/ through the same data-href path.
        if (results.length > currentOptions.length) {
            var moreList = document.createElement('ul');
            moreList.className = 'faq-search__list faq-search__list--all';
            moreList.setAttribute('role', 'presentation');
            var all = option(currentOptions.length, baseurl + '/search/?q=' + encodeURIComponent(raw));
            all.classList.add('faq-search__item--all');
            var allLabel = document.createElement('span');
            allLabel.className = 'faq-search__item-title';
            allLabel.textContent = 'Show all ' + results.length + ' results for “' + raw + '”';
            all.appendChild(allLabel);
            moreList.appendChild(all);
            scrollEl.appendChild(moreList);
            currentOptions.push(all);
        }

        panel.appendChild(scrollEl);

        // Decorative: the aria-live status region carries the count for AT.
        var footer = document.createElement('div');
        footer.className = 'faq-search__footer';
        footer.setAttribute('aria-hidden', 'true');
        [['↵', 'open'], [chordLabel, 'all results'], ['↑↓', 'navigate'], ['esc', 'close']]
            .forEach(function (pair, i) {
                if (i) footer.appendChild(document.createTextNode(' · '));
                var k = document.createElement('kbd');
                k.textContent = pair[0];
                footer.appendChild(k);
                footer.appendChild(document.createTextNode(' ' + pair[1]));
            });
        panel.appendChild(footer);

        panel.hidden = false;
        input.setAttribute('aria-expanded', 'true');
        activeIndex = currentOptions.length ? 0 : -1;
        applyActive();
        return currentOptions.length;
    }

    function search(raw) {
        if (!raw || raw.trim().length < MIN_QUERY) {
            closePanel();
            setStatus('');
            return;
        }
        var q = raw.trim();
        ensureIndex().then(function () {
            if (q !== lastQuery.trim()) return;   // a newer query is in flight
            var results = runQuery(q);
            renderPanel(results, q);
            setStatus(results.length
                ? results.length + (results.length === 1 ? ' result for ' : ' results for ') + q + '.'
                : 'No results for ' + q + '.');
        }).catch(function () {
            closePanel();
            setStatus('Search is unavailable right now. Press Enter to open the results page.');
        });
    }

    function isTypingTarget(el) {
        if (!el) return false;
        if (el.isContentEditable) return true;
        var tag = el.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    }

    if (input && panel) {
        input.addEventListener('input', function () {
            lastQuery = input.value;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () { search(lastQuery); }, DEBOUNCE_MS);
        });

        input.addEventListener('focus', function () {
            ensureIndex().catch(function () { /* surfaced on the next query */ });
            if (suppressNextOpen) {
                suppressNextOpen = false;
                return;
            }
            if (input.value.trim().length >= MIN_QUERY && panel.hidden) {
                lastQuery = input.value;
                search(lastQuery);
            }
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown') {
                if (panel.hidden && input.value.trim().length >= MIN_QUERY) {
                    e.preventDefault();
                    lastQuery = input.value;
                    search(lastQuery);
                    return;
                }
                if (!panel.hidden) {
                    e.preventDefault();
                    moveActive(1);
                }
            } else if (e.key === 'ArrowUp') {
                if (!panel.hidden) {
                    e.preventDefault();
                    moveActive(-1);
                }
            } else if (e.key === 'Home' && !panel.hidden && currentOptions.length) {
                e.preventDefault();
                activeIndex = 0;
                applyActive();
            } else if (e.key === 'End' && !panel.hidden && currentOptions.length) {
                e.preventDefault();
                activeIndex = currentOptions.length - 1;
                applyActive();
            } else if (e.key === 'Escape') {
                // Two-stage: first close the panel, then clear the field.
                if (!panel.hidden) {
                    e.preventDefault();
                    closePanel();
                } else if (input.value !== '') {
                    e.preventDefault();
                    input.value = '';
                    lastQuery = '';
                    setStatus('');
                } else {
                    input.blur();
                }
            } else if (e.key === 'Enter') {
                // Cmd/Ctrl/Shift + Enter always opens the full result list,
                // whatever row happens to be highlighted.
                if (e.metaKey || e.ctrlKey || e.shiftKey) {
                    var q = input.value.trim();
                    if (q.length >= MIN_QUERY) {
                        e.preventDefault();
                        window.location.assign(baseurl + '/search/?q=' + encodeURIComponent(q));
                        return;
                    }
                }
                if (!panel.hidden && activeIndex >= 0 && currentOptions[activeIndex]) {
                    var href = currentOptions[activeIndex].getAttribute('data-href');
                    if (href) {
                        e.preventDefault();
                        window.location.assign(href);
                        return;
                    }
                }
                // Otherwise the form submits to /search/?q=… — the no-JS path.
            }
        });

        panel.addEventListener('mousedown', function (e) {
            var item = e.target.closest ? e.target.closest('.faq-search__item') : null;
            if (!item) return;
            var href = item.getAttribute('data-href');
            if (href) {
                e.preventDefault();
                window.location.assign(href);
            }
        });

        panel.addEventListener('mousemove', function (e) {
            var item = e.target.closest ? e.target.closest('.faq-search__item') : null;
            if (!item) return;
            var i = currentOptions.indexOf(item);
            if (i >= 0 && i !== activeIndex) {
                activeIndex = i;
                applyActive();
            }
        });

        document.addEventListener('mousedown', function (e) {
            if (!form || !form.contains(e.target)) closePanel();
        });

        // ---- hotkeys ---------------------------------------------------------
        // `/` used to live in the jQuery script.js; it belongs here now.
        document.addEventListener('keydown', function (e) {
            if ((e.metaKey || e.ctrlKey) && e.key && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                input.focus();
                input.select();
                return;
            }
            if (e.key === '/' && !isTypingTarget(e.target) && !e.metaKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                suppressNextOpen = true;
                input.focus();
                input.select();
                suppressNextOpen = false;
            }
        });

        // The hint is filled in from JS because it is platform-dependent and
        // meaningless without the key handlers above.
        var hint = root.querySelector('[data-faq-search-hint]');
        if (hint) {
            hint.textContent = isMac ? '⌘K' : '/';
            hint.setAttribute('title', isMac ? 'Press Command-K to focus search' : 'Press / to focus search');
        }
        var hintDesc = root.querySelector('[data-faq-search-hint-desc]');
        if (hintDesc) {
            hintDesc.textContent = isMac
                ? 'Press Command-K to focus this search. Press Command-Enter to open all results.'
                : 'Press slash to focus this search. Press Control-Enter to open all results.';
        }
    }

    // ---- the /search/ results page ------------------------------------------

    function excerpt(content, raw) {
        if (!content) return '';
        var probe = raw.split(/\s+/)[0].toLowerCase();
        var pos = probe ? content.toLowerCase().indexOf(probe) : -1;
        if (pos < 0) {
            return content.slice(0, 180) + (content.length > 180 ? '…' : '');
        }
        var start = Math.max(0, pos - EXCERPT_BEFORE);
        var end = Math.min(content.length, pos + EXCERPT_AFTER);
        return (start > 0 ? '…' : '') + content.slice(start, end) +
            (end < content.length ? '…' : '');
    }

    // ?t= is an exact tag filter, not a lunr query. lunr's tokenizer splits on
    // hyphens, so asking its `tags` field for "quality-tree" also returns every
    // question tagged "quality" — nine hits where the pill promises one. A pill
    // must land on exactly the questions that carry it; free-text recall is what
    // ?q= is for. If nothing matches exactly (hand-typed or half-remembered
    // tag), fall back to the lunr field query rather than showing nothing.
    function tagResults(tag) {
        var needle = tag.toLowerCase();
        var hits = [];
        Object.keys(byRef).forEach(function (url) {
            var d = byRef[url];
            var tags = Array.isArray(d.tags) ? d.tags : String(d.tags || '').split(/\s+/);
            var match = tags.some(function (t) { return String(t).toLowerCase() === needle; });
            if (match) hits.push({ ref: url });
        });
        hits.sort(function (a, b) {
            return String(byRef[a.ref].qid || '')
                .localeCompare(String(byRef[b.ref].qid || ''), undefined, { numeric: true });
        });
        return hits.length ? hits : runQuery(tag, ['tags']);
    }

    function tagPill(tag) {
        var a = document.createElement('a');
        a.className = 'search-tag';
        a.href = baseurl + '/search/?t=' + encodeURIComponent(tag);
        a.textContent = '#' + tag;
        return a;
    }

    function note(text, className) {
        var p = document.createElement('p');
        p.className = className || 'search-count';
        p.textContent = text;
        return p;
    }

    function renderPage(results, raw, mode) {
        var terms = termsOf(raw);
        pagePane.textContent = '';

        var count = document.createElement('p');
        count.className = 'search-count';
        count.setAttribute('role', 'status');
        count.setAttribute('aria-live', 'polite');
        count.textContent = (results.length === 1 ? '1 question' : results.length + ' questions') +
            (mode === 'tag' ? ' tagged “' : ' for “') + raw + '”';
        pagePane.appendChild(count);

        if (!results.length) {
            pagePane.appendChild(note(
                'Try fewer or different words, or browse the categories in the navigation.',
                'search-empty'));
            return;
        }

        var list = document.createElement('div');
        list.className = 'search-hits';

        results.forEach(function (r) {
            var d = byRef[r.ref];
            if (!d) return;

            var hit = document.createElement('article');
            hit.className = 'search-hit';

            var h = document.createElement('h2');
            var a = document.createElement('a');
            a.href = baseurl + d.url;
            appendHighlighted(a, d.title, terms);
            h.appendChild(a);
            hit.appendChild(h);

            var ex = excerpt(d.content, raw);
            if (ex) {
                var p = document.createElement('p');
                p.className = 'search-excerpt';
                appendHighlighted(p, ex, terms);
                hit.appendChild(p);
            }

            var meta = document.createElement('p');
            meta.className = 'search-meta';
            if (d.category) {
                var cat = document.createElement('span');
                cat.className = 'search-category';
                cat.textContent = d.category;
                meta.appendChild(cat);
            }
            var tags = Array.isArray(d.tags) ? d.tags : (d.tags ? String(d.tags).split(/\s+/) : []);
            tags.filter(Boolean).forEach(function (t) { meta.appendChild(tagPill(t)); });
            if (meta.childNodes.length) hit.appendChild(meta);

            list.appendChild(hit);
        });

        pagePane.appendChild(list);
    }

    if (pagePane) {
        var params = new URLSearchParams(window.location.search);
        var pq = params.get('q');
        var pt = params.get('t');
        var raw = (pq || pt || '').trim();
        var mode = pq ? 'query' : (pt ? 'tag' : '');

        if (raw) {
            if (input) input.value = raw;
            ensureIndex()
                .then(function () {
                    renderPage(mode === 'tag' ? tagResults(raw) : runQuery(raw), raw, mode);
                })
                .catch(function () {
                    pagePane.textContent = '';
                    pagePane.appendChild(note(
                        'Search is unavailable right now. Please use the category navigation instead.',
                        'search-empty'));
                });
        } else {
            pagePane.appendChild(note(
                'Type into the search box to find questions by title, tag, category, or answer text.'));
            ensureIndex().catch(function () { /* nothing to show yet */ });
        }
    }
})();
