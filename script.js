// Ждем полной загрузки DOM, чтобы не было ошибок "null"
document.addEventListener('DOMContentLoaded', () => {

    // 1. Инициализация Lenis (Плавный скролл)
    const lenis = new Lenis({ 
        duration: 1.2, 
        wheelMultiplier: 1.1,
        smoothWheel: true
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. CANVAS BACKGROUND
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];
        let mouse = { x: -100, y: -100 };

        function initCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            createParticles();
        }

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.5 + 0.5;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;
                this.opacity = Math.random() * 0.4;
            }
            update() {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let maxDistance = 150;

                if (distance < maxDistance) {
                    let force = (maxDistance - distance) / maxDistance;
                    this.x -= (dx / distance) * force * this.density;
                    this.y -= (dy / distance) * force * this.density;
                } else {
                    if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 20;
                    if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 20;
                }
            }
            draw() {
                ctx.fillStyle = `rgba(212, 255, 0, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function createParticles() {
            particles = [];
            for (let i = 0; i < 150; i++) particles.push(new Particle());
        }

        function animate() {
            ctx.fillStyle = '#070707';
            ctx.fillRect(0, 0, width, height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', initCanvas);
        window.addEventListener('mousemove', (e) => { 
            mouse.x = e.clientX; 
            mouse.y = e.clientY; 
        });

        initCanvas();
        animate();
    }

    // 3. КУРСОР И МАГНИТНЫЕ ЭФФЕКТЫ
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        document.querySelectorAll('.magnetic, .pj-image-wrapper, .nav-links a').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    // 4. СКРОЛЛ-АНИМАЦИИ (Lenis)
    lenis.on('scroll', ({ scroll }) => {
        // Параллакс заголовков
        document.querySelectorAll('.parallax-line').forEach(line => {
            const speed = line.getAttribute('data-speed');
            line.style.transform = `translateX(${scroll * speed}px)`;
        });

        // Параллакс изображений
        document.querySelectorAll('.pj-image-wrapper img').forEach(img => {
            const rect = img.parentElement.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const move = (rect.top - window.innerHeight / 2) * 0.15;
                img.style.transform = `translateY(${move}px) scale(1.15)`;
            }
        });

        // Футер
        const fTitle = document.querySelector('.parallax-footer');
        if (fTitle) {
            const fRect = fTitle.closest('footer').getBoundingClientRect();
            if (fRect.top < window.innerHeight) {
                const progress = (window.innerHeight - fRect.top) / window.innerHeight;
                fTitle.style.transform = `translateX(${(1 - progress) * -200}px)`;
                fTitle.style.opacity = Math.min(progress * 1.5, 1);
            }
        }
    });

    // 5. МАГНИТНЫЙ ЭФФЕКТ ДЛЯ КНОПОК
    document.querySelectorAll('.magnetic').forEach((el) => {
        el.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            this.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        el.addEventListener('mouseleave', function() {
            this.style.transform = `translate(0px, 0px)`;
        });
    });

    // 6. ПРОГРЕСС-БАР (Создаем безопасно)
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    progressBar.style.cssText = `
        position: fixed; top: 0; left: 0; width: 0%; height: 3px;
        background: var(--accent); z-index: 10002; pointer-events: none;
    `;
    document.body.appendChild(progressBar);

    lenis.on('scroll', (e) => {
        const scrollPercent = (e.scroll / (document.body.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
});

// 7. LOADER (вынесен за пределы DOMContentLoaded для надежности)
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.style.transform = 'translateY(-100%)';
        }, 800);
    }
});