(function() {
    'use strict';

    const STAR_COUNT = 400;
    const STAR_COLORS = ['#ffffff', '#fff8e7', '#ffe8d0', '#e8f0ff', '#f0f8ff'];

    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let stars = [];
    let animationId = null;
    let cursorX = 0;
    let cursorY = 0;
    let cursorVisible = false;
    const cursorGlow = document.querySelector('.cursor-glow');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
                opacity: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinkleOffset: Math.random() * Math.PI * 2,
                depth: Math.random(),
                velocityX: (Math.random() - 0.5) * 0.1,
                velocityY: (Math.random() - 0.5) * 0.1
            });
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const time = Date.now() * 0.001;

        stars.forEach(star => {
            const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
            const currentOpacity = star.opacity * twinkle;

            star.x += star.velocityX * star.depth * 0.5;
            star.y += star.velocityY * star.depth * 0.5;

            if (star.x < 0) star.x = canvas.width;
            if (star.x > canvas.width) star.x = 0;
            if (star.y < 0) star.y = canvas.height;
            if (star.y > canvas.height) star.y = 0;

            const dx = star.x - cursorX;
            const dy = star.y - cursorY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 300;

            let cursorBoost = 1;
            if (cursorVisible && dist < maxDist) {
                cursorBoost = 1 + (1 - dist / maxDist) * 2;
            }

            const finalSize = star.size * star.depth * cursorBoost;
            const finalOpacity = Math.min(currentOpacity * cursorBoost, 1);

            ctx.beginPath();
            ctx.arc(star.x, star.y, Math.max(finalSize, 0.5), 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = finalOpacity;
            ctx.fill();

            if (finalSize > 1.5 && finalOpacity > 0.6) {
                ctx.shadowColor = star.color;
                ctx.shadowBlur = finalSize * 2;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });

        ctx.globalAlpha = 1;
    }

    function animateStars() {
        drawStars();
        animationId = requestAnimationFrame(animateStars);
    }

    function initStarfield() {
        resizeCanvas();
        createStars();
        animateStars();
    }

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        cursorVisible = true;

        if (cursorGlow) {
            cursorGlow.style.left = cursorX + 'px';
            cursorGlow.style.top = cursorY + 'px';
        }
    });

    document.addEventListener('mouseleave', () => {
        cursorVisible = false;
    });

    window.addEventListener('resize', () => {
        resizeCanvas();
    });

    const statValues = document.querySelectorAll('.stat-value[data-count]');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                animateCount(el, target);
                statsObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statValues.forEach(el => statsObserver.observe(el));

    function animateCount(element, target) {
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * eased);

            if (target >= 1000) {
                element.textContent = current.toLocaleString();
            } else {
                element.textContent = current;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('aria-controls');

            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                panel.hidden = true;
            });

            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
                targetPanel.hidden = false;
            }
        });
    });

    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    navToggle?.addEventListener('click', () => {
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !expanded);
        navLinks.classList.toggle('open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    const header = document.querySelector('.header');
    let lastScroll = 0;
    let ticking = false;

    function updateHeader() {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });

    const carouselBtns = document.querySelectorAll('.carousel-btn');
    const carouselDots = document.querySelectorAll('.dot');
    const discoveryCards = document.querySelectorAll('.discovery-card');
    let currentSlide = 0;
    const totalSlides = discoveryCards.length;

    function showSlide(index) {
        discoveryCards.forEach((card, i) => {
            card.style.display = i === index ? 'grid' : 'none';
        });

        carouselDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
            dot.setAttribute('aria-selected', i === index);
        });

        carouselBtns[0].disabled = index === 0;
        carouselBtns[1].disabled = index === totalSlides - 1;
    }

    carouselBtns.forEach((btn, i) => {
        btn.addEventListener('click', () => {
            if (i === 0 && currentSlide > 0) {
                currentSlide--;
            } else if (i === 1 && currentSlide < totalSlides - 1) {
                currentSlide++;
            }
            showSlide(currentSlide);
        });
    });

    carouselDots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            currentSlide = i;
            showSlide(currentSlide);
        });
    });

    const joinForm = document.querySelector('.join-form');
    joinForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = joinForm.querySelector('input[type="email"]');
        const submitBtn = joinForm.querySelector('button[type="submit"]');
        const email = emailInput.value.trim();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailInput.style.borderColor = 'var(--mars-red)';
            return;
        }

        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Joining...</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31.4 31.4" style="animation: spin 1s linear infinite"/></svg>';

        const style = document.createElement('style');
        style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
        document.head.appendChild(style);

        await new Promise(resolve => setTimeout(resolve, 1500));

        submitBtn.innerHTML = '<span>Welcome to Mission Control!</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
        submitBtn.style.background = 'linear-gradient(135deg, var(--europa-teal) 0%, var(--europa-teal-dim) 100%)';
        emailInput.value = '';

        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '';
            style.remove();
        }, 3000);
    });

    function initSolarSystem() {
        const container = document.getElementById('solar-system');
        if (!container) return;

        const planets = [
            { name: 'mercury', distance: 40, size: 6, speed: 4.15, color: '#b5b5b5', angle: Math.random() * Math.PI * 2 },
            { name: 'venus', distance: 60, size: 10, speed: 1.62, color: '#e6c87a', angle: Math.random() * Math.PI * 2 },
            { name: 'earth', distance: 85, size: 11, speed: 1, color: '#4a90d9', angle: Math.random() * Math.PI * 2 },
            { name: 'mars', distance: 115, size: 8, speed: 0.53, color: '#e85d3a', angle: Math.random() * Math.PI * 2 },
            { name: 'jupiter', distance: 170, size: 35, speed: 0.084, color: '#d4a574', angle: Math.random() * Math.PI * 2 },
            { name: 'saturn', distance: 230, size: 30, speed: 0.034, color: '#f4e4bc', angle: Math.random() * Math.PI * 2, ring: true },
            { name: 'uranus', distance: 280, size: 18, speed: 0.012, color: '#7de3f4', angle: Math.random() * Math.PI * 2 },
            { name: 'neptune', distance: 320, size: 17, speed: 0.006, color: '#4b70dd', angle: Math.random() * Math.PI * 2 }
        ];

        const sun = document.createElement('div');
        sun.className = 'sun';
        sun.style.cssText = `
            position: absolute;
            top: 50%; left: 50%;
            width: 40px; height: 40px;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle at 30% 30%, #fff8e7 0%, #ffd700 40%, #e85d3a 100%);
            border-radius: 50%;
            box-shadow: 0 0 60px rgba(255,215,0,0.6), inset 0 0 20px rgba(255,255,255,0.3);
            z-index: 10;
        `;
        container.appendChild(sun);

        const planetElements = planets.map(planet => {
            const orbit = document.createElement('div');
            orbit.className = 'orbit';
            orbit.style.cssText = `
                position: absolute;
                top: 50%; left: 50%;
                width: ${planet.distance * 2}px; height: ${planet.distance * 2}px;
                transform: translate(-50%, -50%);
                border: 1px dashed rgba(124,77,255,0.08);
                border-radius: 50%;
                pointer-events: none;
            `;
            container.appendChild(orbit);

            const planetEl = document.createElement('div');
            planetEl.className = `planet-${planet.name}`;
            planetEl.style.cssText = `
                position: absolute;
                top: 50%; left: 50%;
                width: ${planet.size}px; height: ${planet.size}px;
                transform: translate(-50%, -50%);
                background: ${planet.color};
                border-radius: 50%;
                box-shadow: inset -${planet.size * 0.3}px -${planet.size * 0.3}px ${planet.size * 0.6}px rgba(0,0,0,0.5);
            `;

            if (planet.ring) {
                const ring = document.createElement('div');
                ring.style.cssText = `
                    position: absolute;
                    top: 50%; left: 50%;
                    width: ${planet.size * 2.2}px; height: ${planet.size * 0.8}px;
                    transform: translate(-50%, -50%) rotateX(75deg) rotateZ(-15deg);
                    border: 2px solid rgba(244,228,188,0.6);
                    border-radius: 50%;
                    pointer-events: none;
                `;
                planetEl.appendChild(ring);
            }

            orbit.appendChild(planetEl);
            return { element: planetEl, orbit, ...planet };
        });

        let time = 0;

        function animateSolarSystem() {
            time += 0.01;

            planetElements.forEach(planet => {
                planet.angle += planet.speed * 0.01;
                const x = Math.cos(planet.angle) * planet.distance;
                const y = Math.sin(planet.angle) * planet.distance * 0.3;

                planet.element.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

                const scale = 0.8 + (planet.distance / 350) * 0.4;
                planet.element.style.zIndex = Math.round(10 + y * 10);
            });

            requestAnimationFrame(animateSolarSystem);
        }

        animateSolarSystem();
    }

    async function fetchISSPosition() {
        try {
            const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
            if (!response.ok) throw new Error('ISS API failed');
            return await response.json();
        } catch (e) {
            return null;
        }
    }

    async function fetchISSCrew() {
        try {
            const response = await fetch('https://api.open-notify.org/astros.json');
            if (!response.ok) throw new Error('Crew API failed');
            const data = await response.json();
            return data.people.filter(p => p.craft === 'ISS').length;
        } catch (e) {
            return null;
        }
    }

    function updateISSDisplay(data) {
        if (!data) {
            document.getElementById('iss-lat').textContent = '—';
            document.getElementById('iss-lon').textContent = '—';
            document.getElementById('iss-alt').textContent = '—';
            document.getElementById('iss-vel').textContent = '—';
            return;
        }

        document.getElementById('iss-lat').textContent = data.latitude.toFixed(2) + '°';
        document.getElementById('iss-lon').textContent = data.longitude.toFixed(2) + '°';
        document.getElementById('iss-alt').textContent = (data.altitude / 1000).toFixed(1) + ' km';
        document.getElementById('iss-vel').textContent = data.velocity.toFixed(1) + ' km/h';

        const map = document.getElementById('iss-map');
        if (map) {
            const x = ((data.longitude + 180) / 360) * 100;
            const y = ((90 - data.latitude) / 180) * 100;

            let marker = map.querySelector('.iss-marker');
            if (!marker) {
                marker = document.createElement('div');
                marker.className = 'iss-marker';
                marker.style.cssText = `
                    position: absolute;
                    width: 12px; height: 12px;
                    background: var(--europa-teal);
                    border: 2px solid var(--space-black);
                    border-radius: 50%;
                    box-shadow: 0 0 12px var(--europa-teal-glow);
                    transform: translate(-50%, -50%);
                    z-index: 5;
                    animation: pulse-dot 1.5s ease-in-out infinite;
                `;
                map.appendChild(marker);
            }
            marker.style.left = x + '%';
            marker.style.top = y + '%';
        }
    }

    async function updateISS() {
        const [position, crew] = await Promise.all([
            fetchISSPosition(),
            fetchISSCrew()
        ]);

        updateISSDisplay(position);

        if (crew !== null) {
            document.getElementById('iss-crew').textContent = crew + ' astronauts';
        }
    }

    function initAuroraMap() {
        const map = document.getElementById('aurora-map');
        if (!map) return;

        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        canvas.style.cssText = 'width: 100%; height: 100%;';
        map.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        function drawAurora() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#030307');
            gradient.addColorStop(0.5, '#0a0a1a');
            gradient.addColorStop(1, '#030307');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const time = Date.now() * 0.0005;

            for (let i = 0; i < 3; i++) {
                const y = 30 + i * 50 + Math.sin(time + i) * 15;
                const intensity = 0.15 + Math.sin(time * 2 + i) * 0.1;

                const auroraGrad = ctx.createRadialGradient(
                    canvas.width / 2, y, 0,
                    canvas.width / 2, y, canvas.width * 0.6
                );
                auroraGrad.addColorStop(0, `rgba(0, 212, 184, ${intensity})`);
                auroraGrad.addColorStop(0.5, `rgba(0, 212, 184, ${intensity * 0.3})`);
                auroraGrad.addColorStop(1, 'rgba(0, 212, 184, 0)');

                ctx.fillStyle = auroraGrad;
                ctx.beginPath();
                ctx.ellipse(canvas.width / 2, y, canvas.width * 0.5, 30, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            for (let i = 0; i < 50; i++) {
                const x = (i * 7 + time * 10) % canvas.width;
                const y = 10 + (i * 3.7) % 180;
                ctx.beginPath();
                ctx.arc(x, y, 0.5, 0, Math.PI * 2);
                ctx.fill();
            }

            requestAnimationFrame(drawAurora);
        }

        drawAurora();
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section > .container > *:not(.section-header)').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        revealObserver.observe(el);
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                target.focus({ preventScroll: true });
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            navLinks.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.focus();
        }
    });

    function init() {
        initStarfield();
        initSolarSystem();
        initAuroraMap();
        updateISS();
        setInterval(updateISS, 10000);

        showSlide(0);

        document.body.classList.add('loaded');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('beforeunload', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });
})();