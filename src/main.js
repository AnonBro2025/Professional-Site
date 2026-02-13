const nav = document.querySelector('.topbar');
const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
const menuToggle = document.querySelector('[data-menu-toggle]');
const metricNodes = Array.from(document.querySelectorAll('[data-count]'));
const revealNodes = Array.from(document.querySelectorAll('.reveal'));
const trackedSections = Array.from(document.querySelectorAll('[data-section]')).filter((section) => section.id);

const formatNumber = new Intl.NumberFormat('en-US');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function markActiveLink(id) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('is-active', isActive);
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

if (trackedSections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          markActiveLink(entry.target.id);
        }
      });
    },
    {
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0
    }
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));
  markActiveLink(trackedSections[0].id);
}

if (!prefersReducedMotion && revealNodes.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  revealNodes.forEach((node) => revealObserver.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add('is-visible'));
}

function animateCount(node, durationMs = 1200) {
  const target = Number(node.dataset.value || 0);
  const prefix = node.dataset.prefix || '';
  const suffix = node.dataset.suffix || '';

  if (!Number.isFinite(target)) return;
  if (prefersReducedMotion) {
    node.textContent = `${prefix}${formatNumber.format(target)}${suffix}`;
    return;
  }

  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / durationMs, 1);
    const eased = 1 - (1 - progress) ** 3;
    const value = Math.round(target * eased);

    node.textContent = `${prefix}${formatNumber.format(value)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

if (metricNodes.length) {
  const metricObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.4
    }
  );

  metricNodes.forEach((node) => metricObserver.observe(node));
}
