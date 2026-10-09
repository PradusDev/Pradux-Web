/* ==========================================================================
   PRADUX GROUP - INTERACTIVE JAVASCRIPT SYSTEM
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 0. THEME TOGGLE (DARK / LIGHT)
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  const applyTheme = (theme) => {
    const isLight = theme === 'light';
    if (isLight) {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }

    if (themeToggle) {
      const label = isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
      themeToggle.setAttribute('aria-label', label);
      themeToggle.setAttribute('title', label);
      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
      }
    }
  };

  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try {
        localStorage.setItem('pradux-theme', next);
      } catch (e) { }
    });
  }

  // 1. MOBILE MENU TOGGLE WITH OVERFLOW LOCK
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const body = document.body;

  if (mobileToggle && navMenu) {
    const toggleMenu = (show) => {
      const isActive = typeof show === 'boolean' ? show : !navMenu.classList.contains('active');
      navMenu.classList.toggle('active', isActive);
      
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.className = isActive ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
      
      // Lock scroll on mobile when menu is active
      if (window.innerWidth <= 768) {
        body.style.overflow = isActive ? 'hidden' : '';
      }
    };

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close mobile menu when clicking a nav link
    const navLinks = navMenu.querySelectorAll('.nav-link, .mobile-menu-cta');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });

    // Close menu when clicking outside header
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        toggleMenu(false);
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        toggleMenu(false);
      }
    });
  }

  // 2. INTERACTIVE SERVICES CAROUSEL
  const carouselTrack = document.getElementById('carousel-track');
  const carouselPrevBtn = document.getElementById('carousel-prev');
  const carouselNextBtn = document.getElementById('carousel-next');
  const carouselDotsContainer = document.getElementById('carousel-dots');
  const carouselContainer = document.getElementById('carousel-container');

  if (carouselTrack) {
    const slides = carouselTrack.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    let currentIndex = 0;
    let autoPlayTimer = null;
    let touchStartX = 0;
    let touchEndX = 0;

    // Create dot indicators
    if (carouselDotsContainer) {
      carouselDotsContainer.innerHTML = '';
      slides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Ir al servicio ${idx + 1}`);
        dot.addEventListener('click', () => goToSlide(idx));
        carouselDotsContainer.appendChild(dot);
      });
    }

    const updateDots = () => {
      if (!carouselDotsContainer) return;
      const dots = carouselDotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    };

    const goToSlide = (index) => {
      if (index < 0) {
        currentIndex = totalSlides - 1;
      } else if (index >= totalSlides) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }

      carouselTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
      updateDots();
    };

    if (carouselPrevBtn) {
      carouselPrevBtn.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
        resetAutoPlay();
      });
    }

    if (carouselNextBtn) {
      carouselNextBtn.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
        resetAutoPlay();
      });
    }

    // Touch Swipe Support for Mobile
    if (carouselContainer) {
      carouselContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      carouselContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });

      const handleSwipe = () => {
        const swipeThreshold = 40;
        if (touchEndX < touchStartX - swipeThreshold) {
          goToSlide(currentIndex + 1);
          resetAutoPlay();
        } else if (touchEndX > touchStartX + swipeThreshold) {
          goToSlide(currentIndex - 1);
          resetAutoPlay();
        }
      };
    }

    // Auto-play feature
    const startAutoPlay = () => {
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        goToSlide(currentIndex + 1);
      }, 7000);
    };

    const stopAutoPlay = () => {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    };

    const resetAutoPlay = () => {
      stopAutoPlay();
      startAutoPlay();
    };

    // Pause auto-play on hover
    if (carouselContainer) {
      carouselContainer.addEventListener('mouseenter', stopAutoPlay);
      carouselContainer.addEventListener('mouseleave', startAutoPlay);
    }

    startAutoPlay();
  }

  // 3. SCROLL-LINKED HORIZONTAL REVEAL
  // Each element's horizontal offset is tied to its position in the viewport:
  // while it rises from the bottom edge (scrolling down) it slides toward the
  // center; when it sinks back (scrolling up) it slides outward again.
  const revealElements = Array.from(document.querySelectorAll('.reveal'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealElements.length > 0 && !reduceMotion) {
    // Direction: -1 = sits left of center (moves out to the left), 1 = right.
    const computeDirections = () => {
      const centerX = window.innerWidth / 2;
      revealElements.forEach((el, i) => {
        if (el.classList.contains('reveal-left')) {
          el._dir = -1;
          return;
        }
        if (el.classList.contains('reveal-right')) {
          el._dir = 1;
          return;
        }
        el.style.setProperty('--shift', '0px');
        const rect = el.getBoundingClientRect();
        const offset = (rect.left + rect.width / 2) - centerX;
        // Centered elements alternate sides so the motion stays horizontal.
        el._dir = Math.abs(offset) < window.innerWidth * 0.05 ? (i % 2 === 0 ? -1 : 1) : Math.sign(offset);
      });
    };

    let ticking = false;

    const updateReveal = () => {
      ticking = false;
      const vh = window.innerHeight;
      const maxShift = window.innerWidth <= 768 ? 40 : 110;
      // Distance (in px) the element travels upward to fully reach its place.
      const travel = vh * 0.55;

      revealElements.forEach((el) => {
        const top = el.getBoundingClientRect().top;
        const progress = Math.min(Math.max((vh - top) / travel, 0), 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.style.setProperty('--shift', `${(1 - eased) * maxShift * el._dir}px`);
        el.style.setProperty('--fade', (0.15 + 0.85 * eased).toFixed(3));
      });
    };

    const requestUpdate = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateReveal);
      }
    };

    computeDirections();
    updateReveal();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', () => {
      computeDirections();
      requestUpdate();
    });
  }

  // 4. FAQ ACCORDION INTERACTION
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all items
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
        });

        // Toggle current item if it wasn't active
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // 5. WHATSAPP CLICK HANDLER
  const whatsappBtns = document.querySelectorAll('.btn-whatsapp-action');
  
  whatsappBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const defaultMessage = encodeURIComponent(
        "Hola Pradux Group 👋 me interesa solicitar un diagnóstico/soporte para mi negocio. ¿Me pueden brindar asesoría?"
      );
      const phoneNumber = "573164882666";
      window.open(`https://wa.me/${phoneNumber}?text=${defaultMessage}`, '_blank');
    });
  });

  // 6. NAVBAR SCROLL SHADOW EFFECT
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // 7. CONTACT FORM HANDLER
  const contactForm = document.getElementById('contact-form');
  const formResponse = document.getElementById('form-response');

  // Correo de destino (servicio FormSubmit) y número de WhatsApp de Pradux
  const CONTACT_EMAIL = 'devsoluciones3@gmail.com';
  const WHATSAPP_NUMBER = '573164882666';

  if (contactForm) {
    const submitBtn = contactForm.querySelector('.submit-btn');
    const submitBtnHTML = submitBtn ? submitBtn.innerHTML : '';

    const showResponse = (type, title, text, waUrl) => {
      if (!formResponse) return;
      formResponse.className = `form-response ${type}`;
      formResponse.replaceChildren();

      const strong = document.createElement('strong');
      strong.textContent = title;
      formResponse.append(strong, document.createElement('br'), text);

      if (waUrl) {
        const link = document.createElement('a');
        link.href = waUrl;
        link.target = '_blank';
        link.rel = 'noopener';
        link.className = 'btn btn-whatsapp form-response-wa';
        link.innerHTML = '<i class="fa-brands fa-whatsapp"></i> Abrir WhatsApp con mi mensaje';
        formResponse.append(link);
      }
    };

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        name: document.getElementById('contact-name')?.value.trim() || '',
        email: document.getElementById('contact-email')?.value.trim() || '',
        sector: document.getElementById('contact-sector')?.value || 'No especificado',
        service: document.getElementById('contact-service')?.value || 'Diagnóstico General',
        message: document.getElementById('contact-message')?.value.trim() || 'Sin detalles adicionales'
      };

      // 1. WhatsApp: se abre en el mismo clic para que el navegador no bloquee la ventana
      const waText = [
        'Hola Pradux Group 👋 quiero solicitar un diagnóstico.',
        '',
        `*Nombre:* ${data.name}`,
        `*Correo:* ${data.email}`,
        `*Sector:* ${data.sector}`,
        `*Servicio de interés:* ${data.service}`,
        `*Detalles:* ${data.message}`
      ].join('\n');
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
      const waWindow = window.open(waUrl, '_blank');
      if (waWindow) waWindow.opener = null;

      // 2. Correo: se envía en segundo plano a través de FormSubmit
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
      }

      try {
        const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: `Nueva solicitud de diagnóstico - ${data.name}`,
            _template: 'table',
            _captcha: 'false',
            Nombre: data.name,
            email: data.email,
            Sector: data.sector,
            'Servicio de interés': data.service,
            Detalles: data.message
          })
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok || String(result.success) !== 'true') {
          throw new Error(result.message || `HTTP ${res.status}`);
        }

        showResponse(
          'success',
          `¡Gracias, ${data.name}!`,
          waWindow
            ? 'Recibimos tu solicitud por correo. En la pestaña de WhatsApp que se abrió solo tienes que presionar "Enviar" para hablar con nosotros de inmediato.'
            : 'Recibimos tu solicitud por correo. Si quieres hablar con nosotros de inmediato, envíanos tu mensaje por WhatsApp:',
          waWindow ? null : waUrl
        );
        contactForm.reset();
      } catch (err) {
        console.error('Error al enviar el formulario por correo:', err);
        showResponse(
          'error',
          'No pudimos enviar tu solicitud por correo.',
          'Por favor envíanos tu mensaje por WhatsApp para atenderte de inmediato:',
          waUrl
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = submitBtnHTML;
        }
      }
    });
  }
});
