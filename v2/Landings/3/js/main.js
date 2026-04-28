/**
 * Spacios MB – Landing 3  |  main.js
 * Features:
 *   - Scroll-reveal animations via IntersectionObserver
 *   - Stagger delays from data-delay attribute
 *   - Smooth anchor scroll (polyfill for Safari)
 *   - Bootstrap Carousel auto-init (handled by Bootstrap itself)
 *   - Parallax subtle effect on gallery fan images
 */

(function () {
  'use strict';

  /* =========================================================
     1. SCROLL REVEAL – IntersectionObserver
     Adds .is-visible to [data-animate] elements as they
     enter the viewport. Stagger delay via data-delay (ms).
  ========================================================= */
  function initScrollReveal() {
    const elements = document.querySelectorAll('[data-animate]');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.delay || '0', 10);
            el.style.setProperty('--anim-delay', delay + 'ms');

            // Small timeout ensures the CSS transition-delay applies
            setTimeout(function () {
              el.classList.add('is-visible');
            }, 10);

            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }


  /* =========================================================
     2. SMOOTH SCROLL for anchor links (Safari fallback)
     Modern browsers handle scroll-behavior: smooth via CSS,
     but we add JS polyfill for older Safari.
  ========================================================= */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Update URL without triggering scroll jump
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      });
    });
  }


  /* =========================================================
     3. GALLERY FAN – Subtle entrance animation
     The fan images animate in with a staggered scale-up
     when the gallery section enters the viewport.
  ========================================================= */
  function initGalleryEntrance() {
    const fanWrap = document.querySelector('.gallery-fan-wrap');
    if (!fanWrap) return;

    const images = fanWrap.querySelectorAll('.gfi');
    if (!images.length) return;

    // Apply initial state
    images.forEach(function (img) {
      img.style.opacity = '0';
      img.style.transform = 'scale(0.92) translateY(20px)';
      img.style.transition = 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)';
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // The stagger order: center → large → medium → small
            const order = [
              '.gfi--center',
              '.gfi--l1', '.gfi--l2',
              '.gfi--m1', '.gfi--m2',
              '.gfi--s2', '.gfi--s1',
            ];

            order.forEach(function (selector, i) {
              const img = fanWrap.querySelector(selector);
              if (!img) return;
              setTimeout(function () {
                // Restore computed opacity from CSS
                img.style.opacity = '';
                img.style.transform = '';
              }, i * 80);
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(fanWrap);
  }


  /* =========================================================
     4. HERO – Preload critical image
     Force-loads hero background so there's no flash.
  ========================================================= */
  function preloadHero() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    const img = new Image();
    img.src = 'assets/img/hero-bg.jpg';
    img.onload = function () {
      heroSection.classList.add('hero--loaded');
    };
  }


  /* =========================================================
     5. CAROUSEL ACCESSIBILITY
     Add keyboard navigation hints to Bootstrap Carousel.
  ========================================================= */
  function enhanceCarousel() {
    const carouselEl = document.getElementById('galleryCarousel');
    if (!carouselEl) return;

    // Pause on keyboard focus inside the carousel
    carouselEl.addEventListener('focusin', function () {
      const carousel = bootstrap.Carousel.getInstance(carouselEl);
      if (carousel) carousel.pause();
    });
    carouselEl.addEventListener('focusout', function () {
      const carousel = bootstrap.Carousel.getInstance(carouselEl);
      if (carousel) carousel.cycle();
    });
  }


  /* =========================================================
     6. SECTION BACKGROUNDS – Lazy parallax hint for
        background-attachment: fixed fallback on iOS.
     iOS doesn't support background-attachment: fixed well,
     so we disable it via JS feature detect.
  ========================================================= */
  function fixParallaxOnIOS() {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
      document.querySelectorAll('.espacios-section').forEach(function (el) {
        el.style.backgroundAttachment = 'scroll';
      });
    }
  }


  /* =========================================================
     INIT – run when DOM is ready
  ========================================================= */
  function init() {
    preloadHero();
    initScrollReveal();
    initSmoothScroll();
    initGalleryEntrance();
    enhanceCarousel();
    fixParallaxOnIOS();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
