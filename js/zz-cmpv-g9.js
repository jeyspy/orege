(function () {
  setTimeout(function () {
    document.querySelector('.tdb-cmp-btn--header').click();
    setTimeout(function () {
      var r = document.querySelector('.tdb-cmp-list input[type=radio]');
      r.click(); r.dispatchEvent(new Event('change', { bubbles: true }));
      document.getElementById('tdb-cmp-validate').click();
      document.documentElement.style.scrollBehavior = 'auto';
      setTimeout(function () {
        window.scrollTo(0, 0);
        var col = document.querySelector('.tdb-elu2-compare__col');
        var h = col.querySelector('.tdb-elu2-compare__head').getBoundingClientRect();
        var fr = col.querySelector('iframe'); var fb = fr.getBoundingClientRect();
        var d = fr.contentDocument;
        var b = d.querySelector('.tdb-elu2-banner'); var br = b.getBoundingClientRect();
        var sec = d.querySelector('.tdb-elu2-section'); var sr = sec.getBoundingClientRect();
        var main = d.getElementById('main-content').getBoundingClientRect();
        console.log('head', Math.round(h.top), Math.round(h.bottom), 'iframe', Math.round(fb.top), 'main', Math.round(main.top), 'section', Math.round(sr.top), 'pad', getComputedStyle(sec).paddingTop, 'banner', Math.round(br.top), '->abs', Math.round(fb.top + br.top), 'iframe scrollY', fr.contentWindow.scrollY);
        var prev = [];
        var el = sec.firstElementChild; while (el && el !== b) { var rr = el.getBoundingClientRect(); prev.push(el.className.slice(0, 30) + ':' + Math.round(rr.top) + '/' + Math.round(rr.height) + '/' + getComputedStyle(el).display); el = el.nextElementSibling; }
        console.log('before banner', prev.join(' | '));
        document.body.setAttribute('data-zz', 'ok');
      }, 4500);
    }, 800);
  }, 3500);
})();
