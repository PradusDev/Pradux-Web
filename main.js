/* ==========================================================================
   PRADUX GROUP - INTERACTIVE JAVASCRIPT SYSTEM
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
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

  // 2. INTERACTIVE TESTIMONIALS CAROUSEL
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
        dot.setAttribute('aria-label', `Ir al testimonio ${idx + 1}`);
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
      }, 4500);
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

  // 3. SCROLL REVEAL ANIMATION SYSTEM (INTERSECTION OBSERVER)
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Optionally unobserve after animating once
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((el) => revealObserver.observe(el));
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

  // 5. MOUSE TRACKING GLOW EFFECT ON CARDS
  const cards = document.querySelectorAll('.card, .value-card, .process-step, .testimonial-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 6. WHATSAPP CLICK HANDLER
  const whatsappBtns = document.querySelectorAll('.btn-whatsapp-action');
  
  whatsappBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const defaultMessage = encodeURIComponent(
        "Hola Pradux Group 👋 me interesa solicitar un diagnóstico/soporte para mi negocio. ¿Me pueden brindar asesoría?"
      );
      const phoneNumber = "573000000000";
      window.open(`https://wa.me/${phoneNumber}?text=${defaultMessage}`, '_blank');
    });
  });

  // 7. NAVBAR SCROLL SHADOW EFFECT
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 82, 255, 0.2)';
      } else {
        navbar.style.boxShadow = 'none';
      }
    });
  }

  // 8. CONTACT FORM HANDLER
  const contactForm = document.getElementById('contact-form');
  const formResponse = document.getElementById('form-response');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name')?.value || '';
      const phone = document.getElementById('contact-phone')?.value || '';
      const email = document.getElementById('contact-email')?.value || '';
      const company = document.getElementById('contact-company')?.value || 'No especificada';
      const sector = document.getElementById('contact-sector')?.value || 'No especificado';
      const service = document.getElementById('contact-service')?.value || 'Diagnóstico General';
      const message = document.getElementById('contact-message')?.value || '';

      if (formResponse) {
        formResponse.className = 'form-response success';
        formResponse.innerHTML = `
          <strong><i class="fa-solid fa-circle-check"></i> ¡Gracias, ${name}!</strong><br>
          Hemos recibido la información de tu empresa (<em>${company} - ${sector}</em>). Un especialista se pondrá en contacto contigo a la brevedad al correo <strong>${email}</strong> o WhatsApp.<br><br>
          <a href="https://wa.me/573000000000?text=${encodeURIComponent(
            `Hola Pradux Group 👋 mi nombre es ${name} de ${company} (Sector: ${sector}). Solicité un diagnóstico para ${service}. Mi teléfono/WhatsApp es ${phone}.`
          )}" target="_blank" class="btn btn-whatsapp" style="padding: 0.6rem 1.2rem; font-size: 0.88rem; margin-top: 0.5rem; display: inline-flex;">
            <i class="fa-brands fa-whatsapp"></i> Enviar resumen por WhatsApp
          </a>
        `;
      }

      contactForm.reset();
    });
  }
});
