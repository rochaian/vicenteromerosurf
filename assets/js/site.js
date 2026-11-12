/* ==========================================================================
   Vicente Romero Surf — JS compartido (sin frameworks, sin build)
   Este archivo se carga en el <head> de todas las páginas y se encarga de:
     1. Configuración (contactos, idiomas)         -> CONFIG
     2. Cabecera, pie y botón de WhatsApp           -> renderChrome()
     3. Traducciones (assets/i18n/<idioma>.json)    -> setLang()
     4. Enlaces de WhatsApp / email                 -> updateLinks()
     5. Vídeos de YouTube (auto)                    -> loadVideos()
     6. Galería (lightbox), animaciones, formulario
   ========================================================================== */
(function () {
  'use strict';

  /* 1. Configuración ------------------------------------------------------- */
  var CONFIG = {
    whatsapp: '34657158352',
    phoneLabel: '+34 657 158 352',
    email: ['vicentejrsurf', 'hotmail.com'], // se une en el navegador (anti-spam)
    instagram: 'https://www.instagram.com/vicente_romero/',
    youtube: 'https://www.youtube.com/user/blsvicente/videos',
    facebook: 'https://www.facebook.com/romerovicentesurf',
    defaultLang: 'es',
    langs: { es: 'ES', en: 'EN', pt: 'PT', fr: 'FR', de: 'DE' },
    nav: [
      { href: '/atleta/', key: 'nav.atleta', label: 'Atleta' },
      { href: '/academy/', key: 'nav.academy', label: 'Academy' },
      { href: '/surf-trip/', key: 'nav.trip', label: 'Surf Trip' },
      { href: '/#contacto', key: 'nav.contact', label: 'Contacto' }
    ]
  };

  var ICONS = {
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.97L2 22l5.17-1.5A9.93 9.93 0 1 0 12.04 2Zm0 1.8a8.12 8.12 0 0 1 6.9 12.42 8.13 8.13 0 0 1-11.1 2.7l-.32-.19-3.02.88.9-2.94-.2-.33A8.12 8.12 0 0 1 12.04 3.8Zm-3.2 3.9c-.2 0-.5.07-.76.35-.26.29-1 1-1 2.4 0 1.42 1.03 2.79 1.17 2.98.15.2 2.03 3.1 4.92 4.34.69.3 1.22.47 1.64.6.69.22 1.32.19 1.81.12.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.2-.55-.34-.29-.14-1.7-.84-1.96-.93-.27-.1-.46-.15-.65.14-.2.29-.75.93-.92 1.12-.17.2-.34.22-.63.08-.29-.15-1.22-.45-2.32-1.44a8.7 8.7 0 0 1-1.6-2c-.17-.29-.02-.44.12-.59.13-.13.3-.34.44-.5.14-.18.19-.3.29-.5.1-.19.05-.36-.03-.5-.07-.15-.65-1.57-.9-2.15-.23-.56-.47-.48-.65-.49l-.53-.01Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46h1.5V4.46A21 21 0 0 0 14.3 4.3c-2.2 0-3.7 1.34-3.7 3.8v2.4H8v3h2.6V21h2.9Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>'
  };

  var root = document.documentElement;
  var dict = {};       // traducciones del idioma activo (vacío = español del HTML)
  var videos = null;   // caché de vídeos de YouTube
  root.classList.add('js');

  /* Idioma inicial: ?lang= > guardado > navegador > español */
  function initialLang() {
    var q = new URLSearchParams(location.search).get('lang');
    var saved = null;
    try { saved = localStorage.getItem('lang'); } catch (e) {}
    var nav = (navigator.language || '').slice(0, 2).toLowerCase();
    var pick = [q, saved, nav].filter(function (l) { return l && CONFIG.langs[l]; })[0];
    if (q && CONFIG.langs[q]) { try { localStorage.setItem('lang', q); } catch (e) {} }
    return pick || CONFIG.defaultLang;
  }
  var lang = initialLang();
  if (lang !== CONFIG.defaultLang) {
    root.classList.add('i18n-wait');                       // evita el "parpadeo" en español
    setTimeout(function () { root.classList.remove('i18n-wait'); }, 1500);
  }

  function t(key, fallback) { return dict[key] != null ? dict[key] : fallback; }
  function email() { return CONFIG.email.join('@'); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* 2. Cabecera, pie y botón flotante ------------------------------------- */
  function renderChrome() {
    var path = location.pathname.replace(/index\.html$/, '');
    var links = CONFIG.nav.map(function (n) {
      var current = n.href === path ? ' aria-current="page"' : '';
      return '<a href="' + n.href + '" data-i18n="' + n.key + '"' + current + '>' + n.label + '</a>';
    }).join('');
    var options = Object.keys(CONFIG.langs).map(function (l) {
      return '<option value="' + l + '">' + CONFIG.langs[l] + '</option>';
    }).join('');

    var header = document.getElementById('site-header');
    if (header) {
      header.className = 'site-header';
      header.innerHTML =
        '<div class="container site-header__inner">' +
          '<a class="brand" href="/"><img src="/assets/img/logo-vr-white.png" width="42" height="42" alt="Vicente Romero"><span>Vicente Romero</span></a>' +
          '<nav class="nav" id="nav" aria-label="Principal">' + links + '</nav>' +
          '<div class="header-tools">' +
            '<select class="lang" id="lang" aria-label="Idioma / Language">' + options + '</select>' +
            '<button class="menu-btn" id="menu-btn" aria-label="Menú" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>' +
          '</div>' +
        '</div>';
    }

    var footer = document.getElementById('site-footer');
    if (footer) {
      footer.className = 'site-footer';
      footer.innerHTML =
        '<div class="container">' +
          '<div class="site-footer__top">' +
            '<div><a class="brand" href="/"><img src="/assets/img/logo-vr-white.png" width="42" height="42" alt=""><span>Vicente Romero</span></a>' +
              '<p class="muted mt-m" data-i18n="footer.tagline">Surfista profesional y entrenador. Romero Surf Academy, Ericeira.</p></div>' +
            '<div><h4 data-i18n="footer.pages">Páginas</h4><ul>' +
              CONFIG.nav.map(function (n) { return '<li><a href="' + n.href + '" data-i18n="' + n.key + '">' + n.label + '</a></li>'; }).join('') +
            '</ul></div>' +
            '<div><h4 data-i18n="footer.follow">Sígueme</h4><ul>' +
              '<li><a href="' + CONFIG.instagram + '" target="_blank" rel="noopener">Instagram</a></li>' +
              '<li><a href="' + CONFIG.youtube + '" target="_blank" rel="noopener">YouTube</a></li>' +
              '<li><a href="' + CONFIG.facebook + '" target="_blank" rel="noopener">Facebook</a></li>' +
            '</ul></div>' +
            '<div><h4 data-i18n="footer.contact">Contacto</h4><ul>' +
              '<li><a data-wa="general">WhatsApp ' + CONFIG.phoneLabel + '</a></li>' +
              '<li><a data-email></a></li>' +
            '</ul></div>' +
          '</div>' +
          '<div class="site-footer__bottom"><span>© ' + new Date().getFullYear() + ' Vicente Romero</span><span data-i18n="footer.rights">Todos los derechos reservados.</span></div>' +
        '</div>';
      var wa = document.createElement('a');
      wa.className = 'wa-float';
      wa.setAttribute('data-wa', 'general');
      wa.setAttribute('aria-label', 'WhatsApp');
      wa.innerHTML = ICONS.whatsapp;
      document.body.appendChild(wa);
    }

    $all('[data-icon]').forEach(function (el) {
      el.insertAdjacentHTML('afterbegin', ICONS[el.getAttribute('data-icon')] || '');
    });

    var select = document.getElementById('lang');
    if (select) {
      select.value = lang;
      select.addEventListener('change', function () { setLang(select.value); });
    }
    var btn = document.getElementById('menu-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        var open = document.body.classList.toggle('nav-open');
        btn.setAttribute('aria-expanded', open);
      });
      $all('#nav a').forEach(function (a) {
        a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
      });
    }
    var onScroll = function () { if (header) header.classList.toggle('is-solid', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* 3. Traducciones --------------------------------------------------------
     El español vive en el HTML. Cada texto traducible lleva el atributo data-i18n con su clave.
     Los demás idiomas están en /assets/i18n/<idioma>.json con las mismas claves. */
  function applyI18n() {
    $all('[data-i18n]').forEach(function (el) {
      if (el._es == null) el._es = el.innerHTML;
      el.innerHTML = t(el.getAttribute('data-i18n'), el._es);
    });
    $all('[data-i18n-placeholder]').forEach(function (el) {
      if (el._esPh == null) el._esPh = el.getAttribute('placeholder') || '';
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder'), el._esPh));
    });
    $all('meta[data-i18n-content]').forEach(function (el) {
      if (el._esC == null) el._esC = el.getAttribute('content') || '';
      el.setAttribute('content', t(el.getAttribute('data-i18n-content'), el._esC));
    });
    root.lang = lang;
    updateLinks();
    renderVideos();
    root.classList.remove('i18n-wait');
  }

  function setLang(next) {
    lang = CONFIG.langs[next] ? next : CONFIG.defaultLang;
    try { localStorage.setItem('lang', lang); } catch (e) {}
    var select = document.getElementById('lang');
    if (select) select.value = lang;
    if (lang === CONFIG.defaultLang) { dict = {}; applyI18n(); return; }
    fetch('/assets/i18n/' + lang + '.json')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (json) { dict = json; })
      .catch(function () { dict = {}; })
      .then(applyI18n);
  }

  /* 4. Enlaces de contacto -------------------------------------------------
     Un enlace con data-wa (clave) y data-wa-text (mensaje en español) abre WhatsApp
     con el mensaje ya escrito; se traduce con la clave "wa.<clave>" del JSON. */
  function waUrl(text) {
    return 'https://wa.me/' + CONFIG.whatsapp + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  function updateLinks() {
    $all('a[data-wa]').forEach(function (a) {
      var text = t('wa.' + a.getAttribute('data-wa'), a.getAttribute('data-wa-text') || '');
      a.href = waUrl(text);
      a.target = '_blank';
      a.rel = 'noopener';
    });
    $all('a[data-email]').forEach(function (a) {
      a.href = 'mailto:' + email();
      if (!a.querySelector('span') && !a.textContent.trim()) a.textContent = email();
      var slot = a.querySelector('[data-email-text]');
      if (slot) slot.textContent = email();
    });
    $all('[data-phone]').forEach(function (el) { el.textContent = CONFIG.phoneLabel; });
  }

  /* 5. Vídeos de YouTube ---------------------------------------------------
     /api/videos (función de Vercel) lee el feed del canal y se actualiza solo.
     Si no está disponible (p. ej. en local) usa /assets/data/videos.json. */
  function loadVideos() {
    if (!document.querySelector('[data-videos]')) return;
    var getJson = function (url) {
      return fetch(url).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      }).then(function (j) {
        if (!j.videos || !j.videos.length) throw new Error('empty');
        return j.videos;
      });
    };
    getJson('/api/videos')
      .catch(function () { return getJson('/assets/data/videos.json'); })
      .then(function (list) { videos = list; renderVideos(); })
      .catch(function () {});
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function renderVideos() {
    if (!videos) return;
    $all('[data-videos]').forEach(function (box) {
      var count = parseInt(box.getAttribute('data-videos'), 10) || 6;
      var featured = box.hasAttribute('data-featured');
      box.innerHTML = videos.slice(0, count).map(function (v, i) {
        var date = '';
        try { date = new Date(v.published).toLocaleDateString(lang, { year: 'numeric', month: 'long' }); } catch (e) {}
        var big = featured && i === 0;
        return '<article class="video' + (big ? ' video--featured' : '') + '">' +
          '<button class="video__frame" data-video-id="' + esc(v.id) + '" aria-label="' + esc(v.title) + '">' +
            '<img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + esc(v.id) + '/' + (big ? 'maxresdefault' : 'hqdefault') + '.jpg">' +
            '<span class="video__play"></span>' +
          '</button>' +
          '<div><div class="video__title">' + esc(v.title) + '</div><div class="video__date">' + esc(date) + '</div></div>' +
        '</article>';
      }).join('');
    });
  }
  document.addEventListener('click', function (e) {
    var frame = e.target.closest && e.target.closest('[data-video-id]');
    if (!frame) return;
    var id = frame.getAttribute('data-video-id');
    var holder = document.createElement('div');
    holder.className = 'video__frame';
    holder.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
      '?autoplay=1&rel=0" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    frame.replaceWith(holder);
  });

  /* 6. Galería, animaciones y formulario ---------------------------------- */
  function initLightbox() {
    var items = $all('.gallery button');
    if (!items.length) return;
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML = '<button class="lightbox__close" aria-label="Cerrar">×</button>' +
      '<button class="lightbox__prev" aria-label="Anterior">‹</button><img alt="">' +
      '<button class="lightbox__next" aria-label="Siguiente">›</button>';
    document.body.appendChild(box);
    var img = box.querySelector('img');
    var index = 0;
    var show = function (i) {
      index = (i + items.length) % items.length;
      var src = items[index].querySelector('img');
      img.src = src.src; img.alt = src.alt;
      box.classList.add('is-open');
    };
    var close = function () { box.classList.remove('is-open'); };
    items.forEach(function (b, i) { b.addEventListener('click', function () { show(i); }); });
    box.addEventListener('click', function (e) {
      if (e.target.classList.contains('lightbox__prev')) show(index - 1);
      else if (e.target.classList.contains('lightbox__next')) show(index + 1);
      else if (e.target !== img) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
  }

  function initReveal() {
    var els = $all('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* El formulario no necesita servidor: abre WhatsApp o el correo con el mensaje listo. */
  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var via = (e.submitter && e.submitter.value) || 'wa';
      var name = form.elements.name.value.trim();
      var interest = form.elements.interest.selectedOptions[0].textContent.trim();
      var message = form.elements.message.value.trim();
      var tpl = t('contact.tpl', 'Hola Vicente, soy {name}. Me interesa: {interest}.');
      var text = tpl.replace('{name}', name).replace('{interest}', interest) + (message ? '\n\n' + message : '');
      if (via === 'email') {
        location.href = 'mailto:' + email() + '?subject=' + encodeURIComponent(interest) + '&body=' + encodeURIComponent(text);
      } else {
        window.open(waUrl(text), '_blank', 'noopener');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderChrome();
    updateLinks();
    initLightbox();
    initReveal();
    initForm();
    loadVideos();
    if (lang !== CONFIG.defaultLang) setLang(lang); else root.lang = lang;
  });
})();
