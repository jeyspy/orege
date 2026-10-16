/**
 * page-transition.js
 * Splash screen de transition entre pages – Observatoire de l'Eau Grand Est
 *
 * Affiche une overlay sobre avec la goutte d'eau animée (niveau d'eau montant)
 * lors de chaque navigation interne. Se dissout à l'arrivée sur la nouvelle page.
 */

(function () {
  'use strict';

  /* ── Créer l'overlay une seule fois ─────────────────────────────── */
  function creerOverlay() {
    if (document.getElementById('page-transition-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    overlay.innerHTML = [
      '<div class="pt-inner">',
      '  <!-- Goutte SVG avec niveau eau animé -->',
      '  <div class="pt-drop-wrap">',
      '    <svg class="pt-drop-svg" viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg">',
      '      <!-- Defs : clip-path en forme de goutte -->',
      '      <defs>',
      '        <clipPath id="pt-drop-clip">',
      '          <path d="M40 4 C26 20 8 30 8 52 C8 72.4 22.6 88 40 88 C57.4 88 72 72.4 72 52 C72 30 54 20 40 4Z"/>',
      '        </clipPath>',
      '      </defs>',
      '      <!-- Contour de la goutte -->',
      '      <path d="M40 4 C26 20 8 30 8 52 C8 72.4 22.6 88 40 88 C57.4 88 72 72.4 72 52 C72 30 54 20 40 4Z"',
      '            fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>',
      '      <!-- Fond sombre de la goutte -->',
      '      <path d="M40 4 C26 20 8 30 8 52 C8 72.4 22.6 88 40 88 C57.4 88 72 72.4 72 52 C72 30 54 20 40 4Z"',
      '            fill="rgba(255,255,255,.07)"/>',
      '      <!-- Rectangle eau (monte via animation) – clippé par la goutte -->',
      '      <g clip-path="url(#pt-drop-clip)">',
      '        <!-- Niveau d\'eau -->',
      '        <rect class="pt-water-fill" x="0" y="88" width="80" height="88"',
      '              fill="rgba(41,182,246,.75)" rx="0"/>',
      '        <!-- Vague sur l\'eau -->',
      '        <path class="pt-water-wave" d="M-20 0 Q0 -6 20 0 Q40 6 60 0 Q80 -6 100 0 L100 20 L-20 20 Z"',
      '              fill="rgba(255,255,255,.25)"/>',
      '      </g>',
      '    </svg>',
      '  </div>',
      '</div>'
    ].join('\n');

    /* Styles inline pour ne pas dépendre d'un fichier CSS externe */
    var style = document.createElement('style');
    style.textContent = [

      /* Overlay global */
      '#page-transition-overlay {',
      '  position: fixed; inset: 0; z-index: 99999;',
      '  background: rgba(10, 28, 72, 0.82);',
      '  backdrop-filter: blur(3px);',
      '  display: flex; align-items: center; justify-content: center;',
      '  opacity: 0; pointer-events: none;',
      '  transition: opacity .28s ease;',
      '}',
      '#page-transition-overlay.is-visible {',
      '  opacity: 1; pointer-events: all;',
      '}',
      '#page-transition-overlay.is-leaving {',
      '  opacity: 0;',
      '}',

      /* Centre */
      '.pt-inner {',
      '  display: flex; flex-direction: column; align-items: center; gap: 0;',
      '}',

      /* Wrapper goutte */
      '.pt-drop-wrap {',
      '  position: relative;',
      '  width: 72px; height: 86px;',
      '}',
      '.pt-drop-svg { width: 72px; height: 86px; overflow: visible; }',

      /* Animation : le rectangle eau monte de y=88 à y=4 (hauteur totale ≈ 84px) */
      '@keyframes pt-water-rise {',
      '  0%   { transform: translateY(0); }',
      '  100% { transform: translateY(-84px); }',
      '}',

      /* Animation vague oscillante */
      '@keyframes pt-wave-oscillate {',
      '  0%   { transform: translateX(0); }',
      '  50%  { transform: translateX(20px); }',
      '  100% { transform: translateX(0); }',
      '}',

      /* Eau */
      '.pt-water-fill {',
      '  transform-origin: bottom center;',
      '  animation: pt-water-rise .65s cubic-bezier(.4,0,.2,1) forwards;',
      '}',

      /* Vague sur le dessus */
      '.pt-water-wave {',
      '  transform-origin: center;',
      '  animation:',
      '    pt-water-rise .65s cubic-bezier(.4,0,.2,1) forwards,',
      '    pt-wave-oscillate 1.2s ease-in-out infinite;',
      '}',

      /* Pulse discret sur la goutte entière */
      '@keyframes pt-drop-pulse {',
      '  0%, 100% { transform: scale(1); }',
      '  50%       { transform: scale(1.04); }',
      '}',
      '.pt-drop-wrap {',
      '  animation: pt-drop-pulse 1.4s ease-in-out infinite;',
      '}'

    ].join('\n');

    document.head.appendChild(style);
    document.body.appendChild(overlay);
  }

  /* ── Afficher l'overlay ──────────────────────────────────────────── */
  function afficher() {
    var ov = document.getElementById('page-transition-overlay');
    if (!ov) return;
    /* Réinitialiser l'animation eau */
    var fill = ov.querySelector('.pt-water-fill');
    var wave = ov.querySelector('.pt-water-wave');
    if (fill) { fill.style.animation = 'none'; fill.offsetHeight; fill.style.animation = ''; }
    if (wave) { wave.style.animation = 'none'; wave.offsetHeight; wave.style.animation = ''; }
    ov.classList.remove('is-leaving');
    ov.classList.add('is-visible');
  }

  /* ── Masquer l'overlay ───────────────────────────────────────────── */
  function masquer() {
    var ov = document.getElementById('page-transition-overlay');
    if (!ov) return;
    ov.classList.add('is-leaving');
    setTimeout(function () {
      ov.classList.remove('is-visible', 'is-leaving');
    }, 300);
  }

  /* ── Intercepter les clics sur liens internes ────────────────────── */
  function intercepterLiens() {
    document.addEventListener('click', function (e) {
      /* Trouver l'ancre la plus proche */
      var el = e.target;
      while (el && el.tagName !== 'A') el = el.parentElement;
      if (!el) return;

      var href = el.getAttribute('href');
      if (!href) return;

      /* Ignorer : ancres #, javascript:, liens externes, nouvel onglet */
      if (
        href === '#' ||
        href.startsWith('#') ||
        href.startsWith('javascript') ||
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        el.target === '_blank'
      ) return;

      /* Navigation interne → afficher l'overlay */
      e.preventDefault();
      afficher();

      var destination = href;
      setTimeout(function () {
        window.location.href = destination;
      }, 520); /* légèrement avant la fin de l'animation eau */
    });
  }

  /* ── À l'arrivée sur la page : dissoudre l'overlay ──────────────── */
  function dissolveAtLoad() {
    /* L'overlay est invisible au départ (opacity:0, pointer-events:none)
       On le rend visible 1 frame pour déclencher la transition de sortie */
    var ov = document.getElementById('page-transition-overlay');
    if (!ov) return;

    /* Si on arrive via navigation (performance.navigation.type === 1 ou 2 dans les anciens browsers)
       ou simplement toujours : on fait un fondu sortant discret */
    ov.style.transition = 'none';
    ov.style.opacity = '0';
    ov.style.pointerEvents = 'none';
  }

  /* ── Init ────────────────────────────────────────────────────────── */
  function init() {
    creerOverlay();
    intercepterLiens();
    dissolveAtLoad();
  }

  /* Attendre que le DOM soit prêt */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
