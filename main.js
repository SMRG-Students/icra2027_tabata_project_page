(() => {
  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('.reading-progress span');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setNavigationOpen = (open) => {
    if (!navToggle || !navLinks) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navLinks.classList.toggle('is-open', open);
    header?.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  };

  navToggle?.addEventListener('click', () => {
    setNavigationOpen(navToggle.getAttribute('aria-expanded') !== 'true');
  });

  navLinks?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNavigationOpen(false));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 880) setNavigationOpen(false);
  });

  let ticking = false;
  const updateScrollUI = () => {
    const y = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(y / scrollable, 1) : 0;

    header?.classList.toggle('is-scrolled', y > 20);
    if (progress) progress.style.transform = `scaleX(${ratio})`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollUI);
  }, { passive: true });
  updateScrollUI();

  const reveals = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -55px' });

    reveals.forEach((element) => revealObserver.observe(element));
  }

  const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  const lightboxCaption = lightbox?.querySelector('p');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');
  let lastZoomTrigger = null;

  const closeLightbox = () => {
    if (!lightbox?.open) return;
    lightbox.close();
  };

  document.querySelectorAll('[data-zoom]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      if (!lightbox || typeof lightbox.showModal !== 'function') return;

      lastZoomTrigger = trigger;
      const sourceImage = trigger.querySelector('img');
      const imageRatio = sourceImage?.naturalHeight
        ? sourceImage.naturalWidth / sourceImage.naturalHeight
        : 0;
      lightbox.classList.toggle('is-panoramic', imageRatio > 2.6);
      lightboxImage.src = trigger.dataset.zoom;
      lightboxImage.alt = sourceImage?.alt || 'Expanded research figure';
      lightboxCaption.textContent = trigger.dataset.caption || sourceImage?.alt || '';
      lightbox.showModal();
      document.body.classList.add('lightbox-open');
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox?.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    lightbox.classList.remove('is-panoramic');
    if (lightboxImage) lightboxImage.src = '';
    lastZoomTrigger?.focus({ preventScroll: true });
  });
})();
