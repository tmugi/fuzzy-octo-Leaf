/* =====================================================
   1. SCROLL REVEAL
   ===================================================== */
const revIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('vis');
      revIO.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });
document.querySelectorAll('.rev').forEach(el => revIO.observe(el));

// Above-fold immediate reveal
requestAnimationFrame(() => {
  document.querySelectorAll('.rev').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      el.classList.add('vis');
    }
  });
});

/* =====================================================
   2. VEIN DIVIDER DRAW-IN
   ===================================================== */
const veinIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.vp, .vb').forEach((p, i) => {
        setTimeout(() => p.classList.add('drawn'), i * 150);
      });
      veinIO.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.vdiv').forEach(el => veinIO.observe(el));

/* Hero membrane vein draw + show */
setTimeout(() => {
  document.querySelectorAll('#hm .vp, #hm .vb').forEach((p, i) => {
    setTimeout(() => p.classList.add('drawn'), 800 + i * 170);
  });
  document.getElementById('hm').classList.add('vis');
}, 100);

/* Loop diagram background veins */
const loopVeinIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('#bg-veins .vb').forEach((p, i) => {
        setTimeout(() => p.classList.add('drawn'), i * 130);
      });
      loopVeinIO.unobserve(e.target);
    }
  });
}, { threshold: 0.25 });
const loopSvg = document.getElementById('loop-svg');
if (loopSvg) loopVeinIO.observe(loopSvg);

/* =====================================================
   3. LOOP DIAGRAM — connector draw + signal pulse
   Cross-browser: getPointAtLength() for dot animation
   ===================================================== */
const path1 = document.getElementById('path-1-2');
const path2 = document.getElementById('path-2-3');
const dot   = document.getElementById('sig-dot');
const n3Pulse = document.getElementById('n3-pulse');
const n3Core  = document.getElementById('n3-core');
const n1m1    = document.getElementById('n1-m1');
const n1m3    = document.getElementById('n1-m3');

// Node 1 membrane breathing (CSS-equivalent via JS requestAnimationFrame)
function breatheNode1(t) {
  const s1 = 64 + Math.sin(t * 0.0008) * 3.5;
  const s3 = 36 + Math.sin(t * 0.0012 + 1) * 2.5;
  if (n1m1) n1m1.setAttribute('r', s1.toFixed(2));
  if (n1m3) n1m3.setAttribute('r', s3.toFixed(2));
}

let loopActive = false;
let loopStartTime = null;
const CYCLE = 3400; // ms per full Sense→Understand→Respond cycle

function animLoop(ts) {
  if (!loopActive) return;

  // Node 1 breathing
  breatheNode1(ts);

  // Signal dot travels both segments in sequence
  if (!loopStartTime) loopStartTime = ts;
  const elapsed = (ts - loopStartTime) % CYCLE;
  const half = CYCLE / 2;

  let x, y, dotOpacity = 1;

  if (elapsed < half) {
    // Segment 1: Sense → Understand
    const t = elapsed / half;
    const eased = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; // ease-in-out
    const len = path1.getTotalLength();
    const pt  = path1.getPointAtLength(eased * len);
    x = pt.x; y = pt.y;
    dotOpacity = t < 0.05 ? t / 0.05 : t > 0.9 ? (1 - t) / 0.1 : 1;
  } else {
    // Segment 2: Understand → Respond
    const t = (elapsed - half) / half;
    const eased = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2;
    const len = path2.getTotalLength();
    const pt  = path2.getPointAtLength(eased * len);
    x = pt.x; y = pt.y;
    dotOpacity = t < 0.05 ? t / 0.05 : t > 0.9 ? (1 - t) / 0.1 : 1;

    // Respond node activation at arrival
    const activation = Math.max(0, Math.sin((t - 0.85) * Math.PI / 0.15));
    if (t > 0.85 && t < 1) {
      const pulseR = 72 + (t - 0.85) / 0.15 * 18;
      const pulseOp = activation * 0.35;
      if (n3Pulse) {
        n3Pulse.setAttribute('r', pulseR.toFixed(1));
        n3Pulse.setAttribute('stroke', `rgba(38,107,67,${pulseOp.toFixed(3)})`);
        n3Pulse.setAttribute('opacity', '1');
      }
      if (n3Core) n3Core.setAttribute('r', (14 + activation * 5).toFixed(1));
    } else {
      if (n3Pulse) n3Pulse.setAttribute('opacity', '0');
      if (n3Core) n3Core.setAttribute('r', '14');
    }
  }

  if (dot) {
    dot.setAttribute('cx', x.toFixed(2));
    dot.setAttribute('cy', y.toFixed(2));
    dot.setAttribute('opacity', dotOpacity.toFixed(3));
  }

  requestAnimationFrame(animLoop);
}

// Connector paths draw, then start dot animation
const loopTriggerIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !loopActive) {
      // Draw connectors first
      setTimeout(() => {
        if (path1) path1.style.transition = 'stroke-dashoffset 700ms cubic-bezier(.25,.46,.45,.94)';
        if (path1) path1.style.strokeDashoffset = '0';
      }, 300);
      setTimeout(() => {
        if (path2) path2.style.transition = 'stroke-dashoffset 700ms 200ms cubic-bezier(.25,.46,.45,.94)';
        if (path2) path2.style.strokeDashoffset = '0';
      }, 500);
      // Start pulse after paths drawn
      setTimeout(() => {
        loopActive = true;
        requestAnimationFrame(animLoop);
      }, 1200);
      loopTriggerIO.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
if (loopSvg) loopTriggerIO.observe(loopSvg);

/* =====================================================
   4. FAQ ACCORDION
   ===================================================== */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    // Toggle clicked
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* =====================================================
   5. NAV ACTIVE STATE — highlight current section
   ===================================================== */
const sections = ['signals','response','comfort','privacy','platform','cta'];
const navLinks = document.querySelectorAll('.nav-links a[data-section]');

const sectionIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navLinks.forEach(a => {
        a.classList.toggle('active', a.dataset.section === id);
      });
    }
  });
}, { threshold: 0.55, rootMargin: '-30% 0px -45% 0px' });

sections.forEach(id => {
  const section = document.getElementById(id);
  if (section) sectionIO.observe(section);
});
