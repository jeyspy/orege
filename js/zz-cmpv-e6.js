(function () {
  setTimeout(function () {
    document.querySelector('.tdb-cmp-btn--header').click();
    setTimeout(function () {
      var r = document.querySelector('.tdb-cmp-list input[type=radio]');
      r.click(); r.dispatchEvent(new Event('change', { bubbles: true }));
      document.getElementById('tdb-cmp-validate').click();
      document.documentElement.style.scrollBehavior = 'auto';
      setTimeout(function () {
        [0, 20, 60, 100, 140].forEach(function (y, i) {
          setTimeout(function () {
            window.scrollTo(0, y);
            setTimeout(function () {
              var col = document.querySelector('.tdb-elu2-compare__col');
              var h = col.querySelector('.tdb-elu2-compare__head').getBoundingClientRect();
              var fr = col.querySelector('iframe');
              var fb = fr.getBoundingClientRect();
              var d = fr.contentDocument;
              var card = d.querySelector('#tdb-elu2-section-body > *, .tdb-elu2-section > *');
              var cr = card.getBoundingClientRect();
              var ph = document.getElementById('tdb-page-header');
              console.log('y', y, 'scrollY', Math.round(window.scrollY), 'head', Math.round(h.top) + '-' + Math.round(h.bottom), 'iframeTop', Math.round(fb.top), 'firstChild', Math.round(fb.top + cr.top), card.className.slice(0, 40), (card.textContent || '').trim().slice(0, 30), 'phHidden', ph.classList.contains('is-hidden'), 'docH', document.documentElement.scrollHeight);
            }, 800);
          }, i * 1300);
        });
      }, 4000);
    }, 800);
  }, 3500);
})();
