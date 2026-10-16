(function () {
  function snap(tag) {
    var col = document.querySelector('.tdb-elu2-compare__col');
    if (!col) return;
    var h = col.querySelector('.tdb-elu2-compare__head').getBoundingClientRect();
    var fr = col.querySelector('iframe'); var fb = fr.getBoundingClientRect();
    var b = fr.contentDocument && fr.contentDocument.querySelector('.tdb-elu2-banner');
    var nav = document.getElementById('tdb-elu2-nav').getBoundingClientRect();
    var o = document.getElementById('zzo') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'zzo' }));
    o.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#000;color:#ff0;font:bold 18px monospace;padding:8px';
    o.textContent = 'VH=' + innerHeight + ' VW=' + innerWidth + ' NAVB=' + Math.round(nav.bottom) + ' HEADT=' + Math.round(h.top) + ' HEADB=' + Math.round(h.bottom) + ' IFR=' + Math.round(fb.top) + ' BAN=' + (b ? Math.round(fb.top + b.getBoundingClientRect().top) : '-') + ' SY=' + Math.round(scrollY);
    if (b) document.body.setAttribute('data-zz', 'ok');
    console.log(tag, 'scrollY', Math.round(scrollY), 'nav', Math.round(nav.top) + '-' + Math.round(nav.bottom), 'head', Math.round(h.top) + '-' + Math.round(h.bottom), 'banner', b ? Math.round(fb.top + b.getBoundingClientRect().top) : '-', 'headTopVar', getComputedStyle(document.documentElement).getPropertyValue('--tdb-cmp-head-top'), 'ph', document.getElementById('tdb-page-header').className);
  }
  setTimeout(function () {
    document.querySelector('.tdb-cmp-btn--header').click();
    setTimeout(function () {
      var r = document.querySelector('.tdb-cmp-list input[type=radio]');
      r.click(); r.dispatchEvent(new Event('change', { bubbles: true }));
      document.getElementById('tdb-cmp-validate').click();
      for (var t = 200; t <= 8000; t += 900) (function (t) { setTimeout(function () { snap('t' + t); }, t); })(t);
    }, 800);
  }, 3500);
})();
