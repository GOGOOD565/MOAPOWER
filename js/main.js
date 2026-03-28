/* ============================================================
   MOA POWER — Main JS
   Language switcher + Mobile nav + Inquiry Form
   ============================================================ */

(function () {
  'use strict';

  // ── Language detection & switcher ──────────────────────────
  function detectLang() {
    const path = window.location.pathname;
    if (path.includes('/ar/') || path.includes('/ar\\')) return 'ar';
    if (path.includes('/es/') || path.includes('/es\\')) return 'es';
    return 'en';
  }

  function getBasePath() {
    const path = window.location.pathname;
    // find the root (strip /es/ or /ar/ prefix if present)
    const match = path.match(/^(.*?)(\/es\/|\/ar\/|\/es\\|\/ar\\)/);
    if (match) return match[1] || '/';
    // strip trailing filename
    return path.replace(/\/[^/]*$/, '') || '/';
  }

  function setActiveLang() {
    const lang = detectLang();
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  function buildLangUrl(targetLang) {
    // Always resolve from site root based on current page structure
    const path = window.location.pathname;
    // strip /es/ or /ar/ prefix to get root path
    let rootPath = path.replace(/^(\/es\/|\/ar\/)/, '/');
    // if index.html not there, keep as-is
    if (!rootPath || rootPath === '/') rootPath = '/index.html';

    if (targetLang === 'en') return rootPath;
    if (targetLang === 'es') return '/es' + (rootPath.startsWith('/') ? rootPath : '/' + rootPath);
    if (targetLang === 'ar') return '/ar' + (rootPath.startsWith('/') ? rootPath : '/' + rootPath);
    return '/';
  }

  function initLangSwitcher() {
    setActiveLang();
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const target = btn.dataset.lang;
        localStorage.setItem('moaLang', target);
        const url = buildLangUrl(target);
        window.location.href = url;
      });
    });
  }

  // ── Mobile nav toggle ──────────────────────────────────────
  function initMobileNav() {
    const toggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
      });
    });
  }

  // ── Smooth scroll for anchor links ────────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ── Inquiry Form ───────────────────────────────────────────
  function initForm() {
    const form = document.getElementById('inquiryForm');
    if (!form) return;

    const successDiv = document.getElementById('formSuccess');
    const lang = detectLang();

    const successMessages = {
      en: { title: 'Inquiry Sent!', body: 'Thank you. Our engineers will respond within 24 business hours.' },
      es: { title: '¡Consulta Enviada!', body: 'Gracias. Nuestros ingenieros responderán en menos de 24 horas hábiles.' },
      ar: { title: 'تم إرسال الاستفسار!', body: 'شكراً لك. سيرد مهندسونا خلال 24 ساعة عمل.' }
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      const email = form.querySelector('[name="email"]');
      const output = form.querySelector('[name="outputReq"]');

      let valid = true;
      [email, output].forEach(function (field) {
        if (!field || !field.value.trim()) {
          if (field) field.style.borderColor = '#ff4d4d';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (!valid) return;

      // Simulate submission (replace with real endpoint / EmailJS / Formspree)
      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = '...';

      setTimeout(function () {
        form.style.display = 'none';
        if (successDiv) {
          const msg = successMessages[lang] || successMessages.en;
          successDiv.querySelector('h4').textContent = msg.title;
          successDiv.querySelector('p').textContent = msg.body;
          successDiv.style.display = 'block';
        }
      }, 800);
    });

    // Remove red border on input
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('input', function () { this.style.borderColor = ''; });
    });
  }

  // ── Scroll-in animation (IntersectionObserver) ─────────────
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    const style = document.createElement('style');
    style.textContent = '.reveal{opacity:0;transform:translateY(24px);transition:opacity 0.55s ease,transform 0.55s ease}.reveal.visible{opacity:1;transform:none}';
    document.head.appendChild(style);

    const targets = document.querySelectorAll(
      '.product-card, .why-card, .industry-card, .regional-card, .stat-badge'
    );
    targets.forEach(function (el) { el.classList.add('reveal'); });

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  // ── Product Image Gallery ──────────────────────────────────
  function initGalleries() {
    document.querySelectorAll('.prod-gallery').forEach(function (gallery) {
      var imgs   = gallery.querySelectorAll('img');
      var dots   = gallery.querySelectorAll('.gallery-dot');
      var label  = gallery.querySelector('.gallery-label');
      var labels = gallery.dataset.labels ? gallery.dataset.labels.split('|') : [];
      var current = 0;
      var timer;

      function show(idx) {
        imgs[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (idx + imgs.length) % imgs.length;
        imgs[current].classList.add('active');
        dots[current].classList.add('active');
        if (label && labels[current]) label.textContent = labels[current];
      }

      function startAuto() {
        timer = setInterval(function () { show(current + 1); }, 3500);
      }
      function stopAuto() { clearInterval(timer); }

      // Dot clicks
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function (e) {
          e.stopPropagation();
          stopAuto(); show(i); startAuto();
        });
      });

      // Arrow clicks
      var prev = gallery.querySelector('.gallery-arrow.prev');
      var next = gallery.querySelector('.gallery-arrow.next');
      if (prev) prev.addEventListener('click', function (e) {
        e.stopPropagation(); stopAuto(); show(current - 1); startAuto();
      });
      if (next) next.addEventListener('click', function (e) {
        e.stopPropagation(); stopAuto(); show(current + 1); startAuto();
      });

      // Touch swipe
      var touchStartX = 0;
      gallery.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].clientX;
      }, { passive: true });
      gallery.addEventListener('touchend', function (e) {
        var diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) { stopAuto(); show(diff > 0 ? current + 1 : current - 1); startAuto(); }
      }, { passive: true });

      // Init
      show(0);
      startAuto();
    });
  }

  // ── Init ───────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    initLangSwitcher();
    initMobileNav();
    initSmoothScroll();
    initForm();
    initScrollReveal();
    initGalleries();
  });

}());
