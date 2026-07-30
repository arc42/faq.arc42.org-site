// ============================================================================
// header-link.js — permalink anchors on headings.
//
// Plain ES5, no dependencies. Was jQuery + a FontAwesome `<i class="fa fa-link">`;
// the glyph now comes from assets/icons/ui.svg, same as every other icon.
// Same block as docs.arc42.org-site/assets/js/site.js §1.
//
// h1 is left alone on purpose: a permalink to the top of the page you are
// already on is noise, and the scoped selector also keeps the anchor off the
// masthead wordmark.
// ============================================================================

(function () {
    'use strict';

    // Reuse whatever sprite path the page already emitted (icon.html runs it
    // through `relative_url`), so this keeps working if a baseurl ever appears.
    function spriteHref(name) {
        var existing = document.querySelector('svg use[href]');
        var base = existing
            ? String(existing.getAttribute('href')).split('#')[0]
            : '/assets/icons/ui.svg';
        return base + '#' + name;
    }

    var scope = document.querySelector('.site-content') || document.body;
    var headings = scope.querySelectorAll('h2[id], h3[id], h4[id], h5[id], h6[id]');
    var href = spriteHref('link');

    Array.prototype.slice.call(headings).forEach(function (h) {
        if (h.querySelector('.header-link')) return;

        var a = document.createElement('a');
        a.className = 'header-link';
        a.href = '#' + h.id;
        a.setAttribute('aria-label', 'Permalink to “' + h.textContent.trim() + '”');
        a.innerHTML = '<svg class="icon icon--link" aria-hidden="true" focusable="false">'
            + '<use href="' + href + '"></use></svg>';
        h.appendChild(a);
    });
})();
