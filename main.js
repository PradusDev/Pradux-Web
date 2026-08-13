/* ==========================================================================
   PRADUX GROUP - INTERACTIVE JAVASCRIPT (AGC CYBER SYSTEM)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. MOBILE MENU TOGGLE
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        if (navMenu.classList.contains('active')) {
          icon.className = 'fa-solid fa-xmark';
        } else {
          icon.className = 'fa-solid fa-bars';
        }
      }
    });

    // Close mobile menu when clicking a link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      });
    });
  }

  // 2. FAQ ACCORDION INTERACTION
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

  // 3. MOUSE TRACKING GLOW EFFECT ON CARDS
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

  // 4. WHATSAPP CLICK HANDLER
  const whatsappBtns = document.querySelectorAll('.btn-whatsapp-action');
  
  whatsappBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Professional default message tailored for local business owners
      const defaultMessage = encodeURIComponent(
        "Hola Pradux Group 👋 me interesa solicitar un diagnóstico/soporte para mi negocio. ¿Me pueden brindar asesoría?"
      );
      const phoneNumber = "573000000000"; // Provisional WhatsApp Number
      window.open(`https://wa.me/${phoneNumber}?text=${defaultMessage}`, '_blank');
    });
  });

  // 5. NAVBAR SCROLL EFFECT
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 82, 255, 0.2)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });
});
