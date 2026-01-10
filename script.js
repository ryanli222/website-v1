// ===== DOM Elements =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const modalOverlay = document.getElementById('modalOverlay');
const modals = document.querySelectorAll('.modal');
const projectExpandBtns = document.querySelectorAll('.project-expand');
const modalCloseBtns = document.querySelectorAll('.modal-close');
const contactForm = document.getElementById('contactForm');
const fadeElements = document.querySelectorAll('.fade-in');

// ===== Mobile Navigation Toggle =====
function toggleNav() {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('active');
}

navToggle.addEventListener('click', toggleNav);

// Close nav when clicking a link
navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
    });
});

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== Modal Functionality =====
let lastFocusedElement = null;

function openModal(projectId) {
    const modal = document.getElementById(`modal-${projectId}`);
    if (!modal) return;

    lastFocusedElement = document.activeElement;
    modalOverlay.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus the close button
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        setTimeout(() => closeBtn.focus(), 100);
    }
}

function closeModal() {
    modalOverlay.classList.remove('active');
    modals.forEach(modal => modal.classList.remove('active'));
    document.body.style.overflow = '';

    // Return focus to the element that opened the modal
    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

// Open modal on expand button click
projectExpandBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const projectId = btn.getAttribute('data-project');
        openModal(projectId);
    });
});

// Close modal on close button click
modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', closeModal);
});

// Close modal on overlay click
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// Focus trap for modals
modalOverlay.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    const activeModal = document.querySelector('.modal.active');
    if (!activeModal) return;

    const focusableElements = activeModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
    }
});

// ===== Fade-in on Scroll (Intersection Observer) =====
const observerOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.15
};

let fadeObserver = null;

function initFadeObserver() {
    fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        // Only observe elements that are NOT in the hero section
        // and NOT the about-content (which is animated explicitly)
        if (!el.closest('.hero') && !el.classList.contains('about-content')) {
            fadeObserver.observe(el);
        }
    });
}

// Delay observer initialization until after pop-in animations complete
// This prevents content below the fold from appearing prematurely
setTimeout(initFadeObserver, 1500);

// ===== Contact Form Validation =====
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = contactForm.querySelector('#name').value.trim();
    const email = contactForm.querySelector('#email').value.trim();
    const message = contactForm.querySelector('#message').value.trim();

    // Basic validation
    if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Form submission feedback (placeholder - no backend)
    alert('Thank you for your message! This is a demo - no message was actually sent.');
    contactForm.reset();
});

// ===== Initialize =====
// Staggered pop-in animation for hero elements
function initPopInAnimation() {
    const heroPopInElements = document.querySelectorAll('.hero .pop-in');
    const aboutTitle = document.getElementById('about-title');
    const baseDelay = 150; // milliseconds between each element

    // Animate hero elements first
    heroPopInElements.forEach((el, index) => {
        el.style.setProperty('--pop-delay', `${index * baseDelay}ms`);

        setTimeout(() => {
            el.classList.add('visible');
        }, 100 + (index * baseDelay));
    });

    // Animate About header at the very end
    if (aboutTitle) {
        const aboutDelay = heroPopInElements.length * baseDelay + 200;
        aboutTitle.style.setProperty('--pop-delay', `${aboutDelay}ms`);

        setTimeout(() => {
            aboutTitle.classList.add('visible');
        }, 100 + aboutDelay);

        // Animate About content AFTER the title
        const aboutContent = document.querySelector('.about-content');
        if (aboutContent) {
            setTimeout(() => {
                aboutContent.classList.add('visible');
            }, 100 + aboutDelay + 300); // 300ms after title starts
        }
    }
}

// Run pop-in animation when page loads
document.addEventListener('DOMContentLoaded', initPopInAnimation);

// Keep fade-in for elements below the fold
document.querySelectorAll('.hero .fade-in').forEach(el => {
    el.classList.add('visible');
});

// ===== Three.js Interactive 3D Hero =====
(function initHero3D() {
    const canvas = document.getElementById('hero3d');
    if (!canvas || typeof THREE === 'undefined') return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Light blue color (matches accent)
    const accentColor = 0x3b82f6;
    const accentColorLight = 0x93c5fd;

    // Create wireframe icosahedron (geometric, engineering feel)
    const geometry = new THREE.IcosahedronGeometry(2.5, 1);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: accentColor,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    const icosahedron = new THREE.Mesh(geometry, wireframeMaterial);
    scene.add(icosahedron);

    // Add inner solid icosahedron for depth
    const innerGeometry = new THREE.IcosahedronGeometry(1.8, 1);
    const innerMaterial = new THREE.MeshBasicMaterial({
        color: accentColorLight,
        wireframe: true,
        transparent: true,
        opacity: 0.4
    });
    const innerIcosahedron = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerIcosahedron);

    // Add floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 8;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        color: accentColor,
        size: 0.05,
        transparent: true,
        opacity: 0.6
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    camera.position.z = 7;

    // Mouse interaction
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;
    let isDragging = false;
    let previousMouseX = 0, previousMouseY = 0;

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousMouseX;
            const deltaY = e.clientY - previousMouseY;
            targetRotationY += deltaX * 0.01;
            targetRotationX += deltaY * 0.01;
            previousMouseX = e.clientX;
            previousMouseY = e.clientY;
        }
    });

    // Touch support for mobile
    canvas.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousMouseX = e.touches[0].clientX;
        previousMouseY = e.touches[0].clientY;
    });

    canvas.addEventListener('touchend', () => {
        isDragging = false;
    });

    canvas.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches[0]) {
            const deltaX = e.touches[0].clientX - previousMouseX;
            const deltaY = e.touches[0].clientY - previousMouseY;
            targetRotationY += deltaX * 0.01;
            targetRotationX += deltaY * 0.01;
            previousMouseX = e.touches[0].clientX;
            previousMouseY = e.touches[0].clientY;
        }
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Auto-rotate when not dragging
        if (!isDragging) {
            targetRotationY += 0.003;
            targetRotationX += 0.001;
        }

        // Smooth rotation
        icosahedron.rotation.x += (targetRotationX - icosahedron.rotation.x) * 0.05;
        icosahedron.rotation.y += (targetRotationY - icosahedron.rotation.y) * 0.05;

        // Inner rotates opposite direction
        innerIcosahedron.rotation.x = -icosahedron.rotation.x * 0.7;
        innerIcosahedron.rotation.y = -icosahedron.rotation.y * 0.7;

        // Particles float slowly
        particles.rotation.y += 0.001;

        renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
})();

// ===== Lightbox Functionality =====
(function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.querySelector('.lightbox-close');
    const galleryImages = document.querySelectorAll('.gallery-img');

    if (!lightbox || !lightboxImg) return;

    // Open lightbox when clicking a gallery image
    galleryImages.forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent modal from closing
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        // Only restore scroll if no modal is open
        if (!modalOverlay.classList.contains('active')) {
            document.body.style.overflow = '';
        }
    }

    // Close on button click
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
})();

// ===== Resume Modal Functionality =====
(function initResumeModal() {
    const resumeModal = document.getElementById('resumeModal');
    const resumeBtns = document.querySelectorAll('.resume-btn');
    const resumeClose = document.querySelector('.resume-modal-close');

    if (!resumeModal) return;

    // Open modal on button click
    resumeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            resumeModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close modal
    function closeResumeModal() {
        resumeModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Close on button click
    if (resumeClose) {
        resumeClose.addEventListener('click', closeResumeModal);
    }

    // Close on background click
    resumeModal.addEventListener('click', (e) => {
        if (e.target === resumeModal) {
            closeResumeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && resumeModal.classList.contains('active')) {
            closeResumeModal();
        }
    });
})();

// ===== UWFE Parts Modal Functionality =====
(function initUwfeModal() {
    const uwfeModal = document.getElementById('uwfeModal');
    const uwfeBtn = document.querySelector('.uwfe-parts-btn');
    const uwfeClose = document.querySelector('.uwfe-modal-close');

    if (!uwfeModal || !uwfeBtn) return;

    // Open modal on button click
    uwfeBtn.addEventListener('click', () => {
        uwfeModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close modal
    function closeUwfeModal() {
        uwfeModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Close on button click
    if (uwfeClose) {
        uwfeClose.addEventListener('click', closeUwfeModal);
    }

    // Close on background click
    uwfeModal.addEventListener('click', (e) => {
        if (e.target === uwfeModal) {
            closeUwfeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && uwfeModal.classList.contains('active')) {
            closeUwfeModal();
        }
    });
})();
