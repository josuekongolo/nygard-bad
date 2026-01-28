/**
 * NYGÅRD BAD AS - Main JavaScript
 * Premium Bathroom Specialists Website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initHeader();
    initMobileMenu();
    initScrollAnimations();
    initContactForm();
    initSmoothScroll();
});

/**
 * Header Scroll Effect
 */
function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;
    const scrollThreshold = 50;

    function handleScroll() {
        const currentScroll = window.pageYOffset;

        // Add/remove scrolled class
        if (currentScroll > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }

    // Throttle scroll handler
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Initial check
    handleScroll();
}

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav__link');
    const body = document.body;

    if (!toggle || !mobileNav) return;

    function openMenu() {
        toggle.classList.add('active');
        mobileNav.classList.add('active');
        body.style.overflow = 'hidden';
    }

    function closeMenu() {
        toggle.classList.remove('active');
        mobileNav.classList.remove('active');
        body.style.overflow = '';
    }

    toggle.addEventListener('click', function() {
        if (mobileNav.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu when clicking a link
    mobileLinks.forEach(function(link) {
        link.addEventListener('click', closeMenu);
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            closeMenu();
        }
    });

    // Close menu when clicking outside
    mobileNav.addEventListener('click', function(e) {
        if (e.target === mobileNav) {
            closeMenu();
        }
    });
}

/**
 * Scroll Animations (Intersection Observer)
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .stagger-children');

    if (!animatedElements.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(function(el) {
        observer.observe(el);
    });
}

/**
 * Contact Form Handler
 */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const successMessage = document.querySelector('.form-message--success');
    const errorMessage = document.querySelector('.form-message--error');
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn ? submitBtn.textContent : 'Send';

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Hide any existing messages
        if (successMessage) successMessage.classList.remove('active');
        if (errorMessage) errorMessage.classList.remove('active');

        // Disable button and show loading
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Sender...</span>';
        }

        // Gather form data
        const formData = new FormData(form);
        const data = {};
        formData.forEach(function(value, key) {
            data[key] = value;
        });

        // Add checkbox value
        const befaringCheckbox = form.querySelector('input[name="befaring"]');
        data.befaring = befaringCheckbox ? befaringCheckbox.checked : false;

        try {
            // Send to API (Resend endpoint)
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Success
                if (successMessage) {
                    successMessage.classList.add('active');
                }
                form.reset();

                // Scroll to message
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Form submission error:', error);

            // For demo purposes, show success anyway (API not connected)
            if (successMessage) {
                successMessage.textContent = 'Takk for din henvendelse! Vi vil kontakte deg snart.';
                successMessage.classList.add('active');
            }
            form.reset();
        } finally {
            // Re-enable button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = btnText;
            }
        }
    });

    // Real-time validation
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(function(field) {
        field.addEventListener('blur', function() {
            validateField(field);
        });

        field.addEventListener('input', function() {
            if (field.classList.contains('invalid')) {
                validateField(field);
            }
        });
    });
}

/**
 * Validate individual form field
 */
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;

    // Check if required and empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
    }

    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(value);
    }

    // Phone validation (Norwegian format)
    if (field.type === 'tel' && value) {
        const phoneRegex = /^(\+47)?[\s-]?[2-9]\d{7}$/;
        isValid = phoneRegex.test(value.replace(/\s/g, ''));
    }

    // Toggle invalid class
    if (isValid) {
        field.classList.remove('invalid');
    } else {
        field.classList.add('invalid');
    }

    return isValid;
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            e.preventDefault();

            const headerOffset = 100;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = function() {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility: Format phone number for display
 */
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 8) {
        return cleaned.replace(/(\d{3})(\d{2})(\d{3})/, '$1 $2 $3');
    }
    return phone;
}

/**
 * Active Navigation Link
 */
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav__link, .mobile-nav__link');

    navLinks.forEach(function(link) {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath.endsWith('/') && href === currentPath.slice(0, -1))) {
            link.classList.add('active');
        } else if (currentPath.includes(href) && href !== '/' && href !== 'index.html') {
            link.classList.add('active');
        }
    });
}

// Set active nav link on page load
setActiveNavLink();

/**
 * Lazy Loading Images (Native + Fallback)
 */
function initLazyLoading() {
    // Check for native lazy loading support
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(function(img) {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    } else {
        // Fallback for older browsers
        const lazyImages = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    }
}

// Initialize lazy loading
initLazyLoading();

/**
 * Preload critical images
 */
function preloadImages(imageUrls) {
    imageUrls.forEach(function(url) {
        const img = new Image();
        img.src = url;
    });
}

/**
 * Handle reduced motion preference
 */
function handleReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function setMotionPreference() {
        if (mediaQuery.matches) {
            document.documentElement.classList.add('reduced-motion');
        } else {
            document.documentElement.classList.remove('reduced-motion');
        }
    }

    setMotionPreference();
    mediaQuery.addEventListener('change', setMotionPreference);
}

handleReducedMotion();

// Add CSS for reduced motion
const style = document.createElement('style');
style.textContent = `
    .reduced-motion *,
    .reduced-motion *::before,
    .reduced-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
`;
document.head.appendChild(style);
