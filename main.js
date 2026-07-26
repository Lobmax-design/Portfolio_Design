/* ==========================================================================
   NAVEEN R — PORTFOLIO INTERACTIVITY
   GSAP Horizontal Slider
   ========================================================================== */

import gsap from 'gsap';

// --- CUSTOM CURSOR LOGIC ---
const cursor = document.querySelector('.custom-cursor');
const cursorText = document.querySelector('.cursor-text');

if (cursor && cursorText) {
  window.addEventListener('mousemove', (e) => {
    // offset by half the dot width (12px / 2 = 6px) to center it
    cursor.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
  });

  // Find all elements that have a custom cursor text
  const hoverElements = document.querySelectorAll('[data-cursor-text]');

  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      const text = el.getAttribute('data-cursor-text');
      cursorText.textContent = text;
      cursor.classList.add('has-text');
    });

    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('has-text');
      cursorText.textContent = '';
    });
  });
}

// ── DOM References ──
const scrollWrapper = document.getElementById('scroll-wrapper');
const panels = gsap.utils.toArray('.panel');

// ── Centralized Panel Navigation Function ──
function navigateToPanel(targetId, updateHistory = true, scrollToInner = true) {
  const targetElement = document.getElementById(targetId);
  if (!targetElement) return;

  const targetPanel = targetElement.classList.contains('panel') ? targetElement : targetElement.closest('.panel');
  if (!targetPanel) return;

  const panelIndex = panels.indexOf(targetPanel);
  if (panelIndex === -1) return;

  // Instant jump to target panel
  gsap.set(scrollWrapper, {
    x: -window.innerWidth * panelIndex
  });

  // Trigger entrance animations for the panel immediately
  triggerPanelAnimations(targetPanel);

  // If target element is an inner section (like contacts-section) AND scrollToInner is true, scroll to it inside panel-inner
  if (scrollToInner && targetElement !== targetPanel) {
    setTimeout(() => {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  } else {
    const inner = targetPanel.querySelector('.panel-inner');
    if (inner) inner.scrollTop = 0;
  }

  // Push target panel to browser history state if requested
  if (updateHistory && window.location.hash !== `#${targetId}`) {
    history.pushState({ panelId: targetId }, '', `#${targetId}`);
  }
}

// ── Navigation Click → Instant Jump to Target Panel ──
document.querySelectorAll('.nav-scroll').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('data-target');
    if (targetId) {
      navigateToPanel(targetId, true, true);
    }
  });
});

// ── Service Description Hover Accordion (Closes Previous on Hover Next) ──
const serviceToggleItems = document.querySelectorAll('.service-toggle-item');

serviceToggleItems.forEach(item => {
  const btn = item.querySelector('.service-toggle-btn');

  item.addEventListener('mouseenter', () => {
    serviceToggleItems.forEach(other => {
      if (other !== item) {
        other.classList.remove('active');
        const otherBtn = other.querySelector('.service-toggle-btn');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      }
    });

    item.classList.add('active');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  });

  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = item.classList.contains('active');
      if (isActive) {
        item.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        serviceToggleItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.service-toggle-btn');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  }
});

// ── Browser Back / Forward & Mobile Back Gesture Event Listener ──
if (document.getElementById('scroll-wrapper')) {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  window.addEventListener('popstate', (e) => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== 'panel-home' && document.getElementById(hash)) {
      navigateToPanel(hash, false, true);
    } else {
      navigateToPanel('panel-home', false, false);
    }
  });

  // ── Initial History & Hash Setup ──
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && initialHash !== 'panel-home' && document.getElementById(initialHash)) {
    navigateToPanel(initialHash, false, true);
    history.replaceState({ panelId: initialHash }, '', `#${initialHash}`);
  } else {
    // Force top scroll position on initial load of home hero page
    const homeInner = document.querySelector('.panel-home-inner');
    if (homeInner) {
      homeInner.scrollTop = 0;
    }
    navigateToPanel('panel-home', false, false);
    history.replaceState({ panelId: 'panel-home' }, '', window.location.pathname);
  }
}

// ── MagicUI "blurInUp" Text Animation System ──
function splitTextForBlurInUp(el, mode = 'character') {
  if (el.dataset.blurInited) return el.querySelectorAll('.blur-char, .blur-word');
  el.dataset.blurInited = 'true';

  const text = el.textContent.trim();
  el.innerHTML = ''; // clear original text node

  if (mode === 'character') {
    const chars = text.split('');
    const fragment = document.createDocumentFragment();
    chars.forEach(char => {
      const span = document.createElement('span');
      span.className = 'blur-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.filter = 'blur(16px)';
      span.style.transform = 'translateY(28px)';
      span.style.willChange = 'transform, opacity, filter';
      fragment.appendChild(span);
    });
    el.appendChild(fragment);
    return el.querySelectorAll('.blur-char');
  } else {
    const words = text.split(/\s+/);
    const fragment = document.createDocumentFragment();
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'blur-word';
      span.textContent = word;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.filter = 'blur(16px)';
      span.style.transform = 'translateY(28px)';
      span.style.willChange = 'transform, opacity, filter';
      fragment.appendChild(span);

      if (index < words.length - 1) {
        const space = document.createTextNode(' ');
        fragment.appendChild(space);
      }
    });
    el.appendChild(fragment);
    return el.querySelectorAll('.blur-word');
  }
}

export function animateBlurInUp(el, mode = 'character', delay = 0, totalDuration = 3.0) {
  if (!el) return;
  const units = splitTextForBlurInUp(el, mode);
  if (!units || units.length === 0) return;

  const count = units.length;
  // Distribute character entrance stagger over the total 3-second duration
  const staggerAmount = Math.max(totalDuration - 1, 0.5);

  gsap.to(units, {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    duration: 1, // Individual letter blur-in duration
    stagger: {
      amount: staggerAmount,
      ease: 'linear'
    },
    delay: delay,
    ease: 'power2.out',
    overwrite: 'auto'
  });
}

// ── Entrance Animations ──

// Hero title block animates in on page load
gsap.from('.hero-title-block', {
  opacity: 0,
  y: 60,
  duration: 1.4,
  ease: 'power3.out',
  delay: 0.2,
});

// Animate NAVEEN R letter-by-letter with 5-second duration on page load
const heroSubtitle = document.querySelector('.hero-subtitle');
if (heroSubtitle) {
  animateBlurInUp(heroSubtitle, 'character', 0.5, 5.0);
}

// Universal "THANKYOU-Style" Text Blur-In Animation (Whole text comes at the exact same time - slow and smooth)
function animateThankyouStyle(el) {
  if (!el || el.dataset.thankyouAnimated) return;
  
  const units = splitTextForBlurInUp(el, 'character');
  if (!units || units.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !el.dataset.thankyouAnimated) {
        el.dataset.thankyouAnimated = 'true';
        gsap.to(units, {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 2.8, // Slower, silky smooth transition over 2.8s
          stagger: 0, // Whole text comes at the exact same time
          ease: 'power3.out',
          overwrite: 'auto'
        });
      }
    });
  }, { threshold: 0.15 });

  observer.observe(el);
}

// Blur-In-Up Revealing Animation (Going UP like thankyou & naveen) for Project Details & Descriptions ONLY
function animateProjectDetailsBlurInUp(el) {
  if (!el || el.dataset.detailsAnimated) return;

  const units = splitTextForBlurInUp(el, 'character');
  if (!units || units.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !el.dataset.detailsAnimated) {
        el.dataset.detailsAnimated = 'true';
        gsap.to(units, {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 2.6, // Slower, smooth upward reveal over 2.6s
          stagger: 0, // Whole text comes at the exact same time
          ease: 'power3.out',
          overwrite: 'auto'
        });
      }
    });
  }, { threshold: 0.1 });

  observer.observe(el);
}

// Apply THANKYOU animation ONLY to .contact-thankyou
const thankyouEl = document.querySelector('.contact-thankyou');
if (thankyouEl) {
  animateThankyouStyle(thankyouEl);
}

// Apply Revealing BlurInUp (going UP like thankyou & naveen) to PROJECT DETAILS & DESCRIPTIONS ONLY
document.querySelectorAll('.project-details, .project-desc, .contact-description').forEach(el => {
  animateProjectDetailsBlurInUp(el);
});

// Universal Blur-In-Up Animation for Project Work Images (Triggers AFTER description text is revealed)
function initProjectWorksAnimation() {
  const containers = document.querySelectorAll('.project-panel-inner, .project-section, .project-gallery-container');

  containers.forEach(container => {
    const images = container.querySelectorAll('.layout-1-2-1 img, .layout-grid-3x3 img, .gallery-scattered .work-item, .poster-item, .project-gallery img');
    if (images.length === 0) return;

    images.forEach(img => {
      if (!img.dataset.workBlurInited) {
        img.dataset.workBlurInited = 'true';
        gsap.set(img, { opacity: 0, filter: 'blur(16px)', y: 40 });
      }
    });

    let animated = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          // Triggers after description text starts revealing (0.8s delay)
          gsap.to(images, {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            duration: 1.8,
            stagger: 0.15, // Smooth sequential reveal for images
            delay: 0.8,    // Starts after text reveals
            ease: 'power3.out',
            overwrite: 'auto'
          });
        }
      });
    }, { threshold: 0.08 });

    observer.observe(container);
  });
}

initProjectWorksAnimation();

// Animate SHALL WE WORK nav links on scroll into view (HOME & ABOUT come at the exact same time)
const shallWeNavs = document.querySelectorAll('.shall-we-work-nav');
shallWeNavs.forEach(nav => {
  const navLinks = nav.querySelectorAll('.shall-we-work-link');
  let animated = false;

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        gsap.fromTo(navLinks,
          { opacity: 0, y: 25, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.6, stagger: 0, ease: 'power3.out' }
        );
      }
    });
  }, { threshold: 0.2 });

  navObserver.observe(nav);
});

// Function to animate content inside Panel 2 and 3 when slid into view
function triggerPanelAnimations(panel) {
  const title = panel.querySelector('.panel-title');
  const sections = panel.querySelectorAll('.project-section');

  if (title && title.classList.contains('anim-hidden')) {
    title.classList.remove('anim-hidden');
    gsap.fromTo(title, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
  }

  sections.forEach((section, j) => {
    if (section.classList.contains('anim-hidden')) {
      section.classList.remove('anim-hidden');
      gsap.fromTo(section, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: j * 0.12 });
    }
  });
}

// ── Handle Window Resize ──
window.addEventListener('resize', () => {
  // Fix the slide position if the window is resized
  const currentScrollX = gsap.getProperty(scrollWrapper, 'x');
  const panelIndex = Math.round(Math.abs(currentScrollX) / window.innerWidth);
  gsap.set(scrollWrapper, { x: -window.innerWidth * panelIndex });
});

// Initial stacked & blurred setup for mockup cards (full opacity = 1, blur = 16px)
document.querySelectorAll('.service-showcase-grid').forEach(grid => {
  const cards = grid.querySelectorAll('.showcase-card');
  cards.forEach((card, idx) => {
    gsap.set(card, {
      opacity: 1,
      filter: 'blur(16px)',
      xPercent: idx > 0 ? -105 * idx : 0,
      rotation: idx > 0 ? -2.5 * idx : 0,
      scale: idx === 0 ? 0.95 : 1
    });
  });
});

// ── Buttery Smooth Parallax, Blur Fade-Out & Mockup Card Blur-Out on Scroll ──
document.querySelectorAll('.panel-inner').forEach(inner => {
  inner.addEventListener('scroll', () => {
    const scrollTop = inner.scrollTop;

    // 1. Progressive Blur Fade Out & Parallax Float for Top Hero Layer
    if (inner.classList.contains('panel-home-inner')) {
      const heroTitleBlock = inner.querySelector('.hero-title-block');
      if (heroTitleBlock) {
        const foldRatio = Math.min(scrollTop / (window.innerHeight * 0.65), 1);
        const blurAmount = foldRatio * 18; // Progressive blur up to 18px
        const opacityVal = Math.max(1 - (foldRatio * 1.15), 0);

        gsap.to(heroTitleBlock, {
          y: scrollTop * 0.35, // Smooth parallax float
          opacity: opacityVal,
          filter: `blur(${blurAmount}px)`,
          duration: 0.5,
          ease: 'power1.out',
          overwrite: 'auto'
        });
      }
    }

    // 2. Stack-to-Unfold Card Blur-Out & Fan-Out Animation for Service Mockups
    inner.querySelectorAll('.service-showcase-grid').forEach(grid => {
      const cards = grid.querySelectorAll('.showcase-card');
      if (cards.length < 1) return;

      const gridRect = grid.getBoundingClientRect();
      const innerRect = inner.getBoundingClientRect();

      const triggerDistance = innerRect.height * 0.85;
      const relativeTop = gridRect.top - innerRect.top;

      let progress = (triggerDistance - relativeTop) / (innerRect.height * 0.45);
      progress = Math.max(0, Math.min(1, progress));

      // Calculate blur out: 16px down to 0px as progress goes to 1
      const blurVal = (1 - progress) * 16;

      cards.forEach((card, idx) => {
        if (idx === 0) {
          gsap.to(card, {
            filter: `blur(${blurVal}px)`,
            scale: 0.95 + (progress * 0.05),
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        } else {
          // Card 2 and 3 start stacked over Card 1 (-105% * idx) and blur-out to crisp view as they move right
          const startX = -105 * idx;
          const currentX = startX * (1 - progress);
          const startRotate = -2.5 * idx;
          const currentRotate = startRotate * (1 - progress);

          gsap.to(card, {
            filter: `blur(${blurVal}px)`,
            xPercent: currentX,
            rotation: currentRotate,
            duration: 0.6 + (idx * 0.2),
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });
    });

    // 3. Bottom nav visibility
    const nav = inner.parentElement.querySelector('.panel-bottom-nav') || inner.querySelector('.panel-bottom-nav');
    if (nav) {
      const isAtBottom = scrollTop + inner.clientHeight >= inner.scrollHeight - 20;
      if (scrollTop <= 50 || isAtBottom) {
        nav.classList.remove('nav-hidden');
      } else {
        nav.classList.add('nav-hidden');
      }
    }
  });
});

// Universal window scroll handler for floating bottom nav on stand-alone project pages
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.panel-bottom-nav');
  if (!nav) return;

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const clientHeight = window.innerHeight;
  const scrollHeight = document.documentElement.scrollHeight;
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;

  if (scrollTop <= 50 || isAtBottom) {
    nav.classList.remove('nav-hidden');
  } else {
    nav.classList.add('nav-hidden');
  }
});

// ── Lightbox (Click-to-View) ──
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

if (lightbox && lightboxImg && lightboxClose) {
  // Attach click listeners to images inside project galleries on content panels
  document.querySelectorAll('.panel-content .project-gallery img, .panel-content .poster-item img, .panel-content .work-images img, .project-gallery-container img').forEach(img => {
    img.style.cursor = 'none';
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxImg.src = img.src;
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });

  // Close on X button
  lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
  });

  // Close on backdrop click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
    }
  });
}
