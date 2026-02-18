const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const membraneSections = document.querySelectorAll('.mem');

if (reduceMotion) {
  document.querySelectorAll('.rev').forEach((el) => el.classList.add('vis'));
  membraneSections.forEach((section) => section.classList.add('in-view'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('vis');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.rev').forEach((el) => revealObserver.observe(el));

  const memObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('in-view', entry.isIntersecting);
    });
  }, { threshold: 0.15, rootMargin: '-10% 0px -10% 0px' });

  membraneSections.forEach((section) => memObserver.observe(section));
}

const sectionIds = ['who', 'mission', 'principles', 'roadmap'];
const navLinks = document.querySelectorAll('.about-local-nav a[data-section]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.section === id);
    });
  });
}, { threshold: 0.5, rootMargin: '-30% 0px -42% 0px' });

sectionIds.forEach((id) => {
  const section = document.getElementById(id);
  if (section) sectionObserver.observe(section);
});

const scrollProgressBar = document.getElementById('scroll-progress-bar');

if (scrollProgressBar) {
  let ticking = false;

  const updateProgress = () => {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const scrollRange = doc.scrollHeight - window.innerHeight;
    const progress = scrollRange > 0 ? Math.min(1, scrollTop / scrollRange) : 0;
    scrollProgressBar.style.transform = `scaleX(${progress.toFixed(4)})`;
    ticking = false;
  };

  const queueProgress = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateProgress);
  };

  window.addEventListener('scroll', queueProgress, { passive: true });
  window.addEventListener('resize', queueProgress);
  queueProgress();
}

const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (navToggle && mobileMenu) {
  const menuLinks = Array.from(mobileMenu.querySelectorAll('a[href]'));
  const menuLabelOpen = 'Open menu';
  const menuLabelClose = 'Close menu';

  const isMenuOpen = () => navToggle.getAttribute('aria-expanded') === 'true';

  const setMenuOpen = (open, options = {}) => {
    const { restoreFocus = false, focusFirstLink = false } = options;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? menuLabelClose : menuLabelOpen);
    mobileMenu.hidden = !open;
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('nav-open', open);

    if (open && focusFirstLink && menuLinks.length > 0) {
      menuLinks[0].focus();
    }

    if (!open && restoreFocus) {
      navToggle.focus();
    }
  };

  const trapFocus = (event) => {
    if (!isMenuOpen() || event.key !== 'Tab' || menuLinks.length === 0) return;
    const first = menuLinks[0];
    const last = menuLinks[menuLinks.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  navToggle.addEventListener('click', () => {
    setMenuOpen(!isMenuOpen(), { focusFirstLink: true });
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('click', (event) => {
    if (!isMenuOpen()) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!mobileMenu.contains(target) && !navToggle.contains(target)) {
      setMenuOpen(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) setMenuOpen(false);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isMenuOpen()) {
      event.preventDefault();
      setMenuOpen(false, { restoreFocus: true });
    }
  });

  window.addEventListener('keydown', trapFocus);
  setMenuOpen(false);
}
