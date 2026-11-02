// ============================================================================
// script.js — every behaviour on the site that is not search (rail toggle,
// external links, content images, the "42" family menu).
//
// Plain ES5, no dependencies, no build step. Replaces the jQuery 3.7.1 version
// (and the 87 KB of jQuery it existed to use). Mirrors the equivalent blocks in
// docs.arc42.org-site/assets/js/site.js — copy the concept, don't invent one.
//
// What was dropped on the way, and why:
//
//   · the `/` keyup handler that focused #search. It fired on ANY keyup of a
//     slash, including while the reader was typing one into a form field. The
//     search package (WP-C) owns hotkeys now and implements `/` and Cmd/Ctrl-K
//     properly, with a typing guard; two handlers racing for one key is worse
//     than none.
//
//   · the FontAwesome `<i>` glyphs. Icons come from assets/icons/ui.svg via
//     _includes/icon.html.
//
// What is a fix rather than a port: the jQuery version set `target="_blank"`
// on external links and never set `rel`, so every outbound link on this site
// has been opening with a live window.opener reference. Fixed below.
// ============================================================================

(function () {
    'use strict';

    function toArray(nodeList) {
        return Array.prototype.slice.call(nodeList);
    }

    // ========================================================================
    // 1. Navigation toggle (mobile)
    // ========================================================================
    // The control is a real <button data-target="…">, so Enter and Space come
    // from the UA and there is nothing to re-implement. `toggle` rather than
    // `e.target`: the button's only child is an <svg>, and a click on the glyph
    // reports the svg as the event target — which is why the jQuery version
    // could only ever have worked by accident of the FontAwesome ::before.

    (function navToggle() {
        toArray(document.querySelectorAll('.nav-toggle')).forEach(function (toggle) {
            var selector = toggle.getAttribute('data-target');
            var target = selector ? document.querySelector(selector) : null;
            if (!target) return;

            toggle.addEventListener('click', function (e) {
                e.preventDefault();
                var open = target.classList.toggle('active');
                // classList.toggle(name, force) is supported everywhere the
                // rest of this file is; passing the flag keeps button and panel
                // from drifting apart if anything else touches the class.
                toggle.classList.toggle('active', open);
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        });
    })();

    // ========================================================================
    // 2. External links
    // ========================================================================

    (function externalLinks() {
        toArray(document.querySelectorAll('a[href]')).forEach(function (a) {
            if (a.protocol !== 'http:' && a.protocol !== 'https:') return;
            if (!a.host || a.host === window.location.host) return;
            if (a.hasAttribute('download')) return;

            a.setAttribute('target', '_blank');

            var rel = a.getAttribute('rel') || '';
            if (rel.indexOf('noopener') === -1) rel += ' noopener';
            if (rel.indexOf('noreferrer') === -1) rel += ' noreferrer';
            a.setAttribute('rel', rel.replace(/^\s+|\s+$/g, ''));
        });
    })();

    // ========================================================================
    // 3. Content images: centred, and clickable through to full size
    // ========================================================================
    // Diagrams here are routinely wider than the column and get downscaled to
    // fit, so the full-size file is the only readable version of them.

    (function contentImages() {
        toArray(document.querySelectorAll('article img')).forEach(function (img) {
            if (img.classList.contains('emoji') || img.classList.contains('eye-catch')) return;
            if (img.closest && img.closest('a')) return;

            var src = img.getAttribute('src');
            if (!src) return;

            var p = img.closest ? img.closest('p') : null;
            if (p) p.style.textAlign = 'center';

            var a = document.createElement('a');
            a.href = src;
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
            // An image with no alt text would hand the link no accessible name
            // at all; where there is alt text it becomes the name by itself.
            if (!img.getAttribute('alt')) {
                a.setAttribute('aria-label', 'Open image at full size');
            }

            img.parentNode.insertBefore(a, img);
            a.appendChild(img);
        });
    })();

    // ========================================================================
    // 4. Family menu ("42" in the masthead)
    // ========================================================================
    // docs.arc42.org's block, verbatim. Contract with
    // _includes/family-menu.html: a .family-toggle button whose aria-controls
    // names the panel; the panel is closed while it carries `hidden`.
    // aria-expanded and the panel's state are flipped together and never
    // disagree.
    //
    // Closes on a click outside, on Escape (focus goes back to the button), and
    // when keyboard focus leaves the menu. Opened by keyboard, focus moves to
    // the first link; opened by mouse it stays put (e.detail is 0 for a
    // keyboard "click").

    (function familyMenu() {
        var btn = document.querySelector('.family-toggle');
        if (!btn) return;

        var panel = document.getElementById(btn.getAttribute('aria-controls') || 'family-panel');
        if (!panel) return;

        var wrap = btn.parentNode;

        function setOpen(open) {
            panel.hidden = !open;
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        btn.addEventListener('click', function (e) {
            var open = panel.hidden;
            setOpen(open);
            if (open && e.detail === 0) {
                var first = panel.querySelector('a');
                if (first) first.focus();
            }
        });

        document.addEventListener('click', function (e) {
            if (!panel.hidden && !wrap.contains(e.target)) setOpen(false);
        });

        wrap.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !panel.hidden) {
                setOpen(false);
                btn.focus();
            }
        });

        wrap.addEventListener('focusout', function (e) {
            if (!panel.hidden && e.relatedTarget && !wrap.contains(e.relatedTarget)) {
                setOpen(false);
            }
        });
    })();
})();
