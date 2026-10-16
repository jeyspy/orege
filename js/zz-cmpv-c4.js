(function () {
  setTimeout(function () {
    document.querySelector('.tdb-cmp-btn--header').click();
    setTimeout(function () {
      var r = document.querySelector('.tdb-cmp-list input[type=radio]');
      r.click(); r.dispatchEvent(new Event('change', { bubbles: true }));
      document.getElementById('tdb-cmp-validate').click();
      document.documentElement.style.scrollBehavior = 'auto';
      setTimeout(function () {
        [0, 200, 400].forEach(function (y, i) {
          setTimeout(function () {
            window.scrollTo(0, y);
            setTimeout(function () {
              var col = document.querySelector('.tdb-elu2-compare__col');
              var h = col.querySelector('.tdb-elu2-compare__head').getBoundingClientRect();
              var fr = col.querySelector('iframe');
              var fb = fr.getBoundingClientRect();
              var d = fr.contentDocument;
              var first = d && d.querySelector('#tdb-elu2-content .tdb-elu2-card, #tdb-elu2-content [class*="card"]');
              var fRect = first ? first.getBoundingClientRect() : null;
              var title = d && Array.from(d.querySelectorAll('h2,h3,.tdb-elu2-section-title,[class*="title"]')).find(function (e) { return /mograph/i.test(e.textContent) && e.offsetParent; });
              var tr = title ? title.getBoundingClientRect() : null;
              console.log('y', y, 'head', Math.round(h.top) + '-' + Math.round(h.bottom), 'iframeTop', Math.round(fb.top),
                'firstCard', fRect ? Math.round(fb.top + fRect.top) : '-', 'demoTitle', tr ? Math.round(fb.top + tr.top) + ' ' + title.className.slice(0, 40) : '-',
                'sectionPad', d ? getComputedStyle(d.querySelector('.tdb-elu2-section')).paddingTop : '-');
            }, 700);
          }, i * 1500);
        });
      }, 4000);
    }, 800);
  }, 3500);
})();
