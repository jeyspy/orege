(function () {
  setTimeout(function () {
    document.querySelector('.tdb-cmp-btn--header').click();
    setTimeout(function () {
      var r = document.querySelector('.tdb-cmp-list input[type=radio]');
      r.click(); r.dispatchEvent(new Event('change', { bubbles: true }));
      document.getElementById('tdb-cmp-validate').click();
      document.documentElement.style.scrollBehavior = 'auto';
      setTimeout(function () { window.scrollTo(0, window.__zzY || 0); document.body.setAttribute('data-zz', 'ok'); }, 3500);
    }, 800);
  }, 3500);
})();
