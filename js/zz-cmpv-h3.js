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
    if (b) {
      var br = b.getBoundingClientRect();
      var top = document.elementFromPoint(fb.left + br.left + 60, fb.top + br.top + br.height / 2);
      var inner = fr.contentDocument.elementFromPoint(br.left + 60, br.top + br.height / 2);
      o.textContent += ' BANH=' + Math.round(br.height) + ' TOPEL=' + (top && (top.tagName + '.' + (top.className || '')).slice(0, 30)) + ' INEL=' + (inner && (inner.tagName + '.' + (inner.className || '')).slice(0, 30));
      var pts = [3, 12, 22, 32, 42].map(function (dy) {
        var p = document.elementFromPoint(fb.left + br.left + 60, fb.top + br.top + dy);
        var q = fr.contentDocument.elementFromPoint(br.left + 60, br.top + dy);
        return dy + ':' + (p && p.tagName) + '/' + (q && (q.className || q.tagName)).toString().slice(0, 18);
      });
      console.log('PTS', pts.join(' | '), 'bannerText', b.textContent.trim(), 'lh', getComputedStyle(b).lineHeight, 'ov', getComputedStyle(b).overflow);
      var nx = b.nextElementSibling; var nr = nx.getBoundingClientRect();
      console.log('next', nx.className.slice(0, 40), Math.round(nr.top), 'bannerBottom', Math.round(br.bottom), 'colOverflow', getComputedStyle(col).overflow);
      var fixedIn = Array.from(fr.contentDocument.querySelectorAll('body *')).filter(function (e) { var p = getComputedStyle(e).position; return (p === 'fixed' || p === 'sticky') && e.offsetHeight > 0; }).map(function (e) { var r = e.getBoundingClientRect(); return (e.id || e.className).toString().slice(0, 25) + '@' + Math.round(r.top) + '/' + Math.round(r.height); });
      console.log('fixed/sticky in iframe', fixedIn.join(' | '));
      document.body.setAttribute('data-zz', 'ok');
    }
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
