document.addEventListener('DOMContentLoaded', () => {
    // 1. Плавный скролл только для ПК
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    let lenis;

    if (!isMobile) {
        lenis = new Lenis({ duration: 1.2, wheelMultiplier: 1.1 });
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // 2. Оптимизированный Canvas
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];
        let mouse = { x: -100, y: -100 };

        function initCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            // На мобилках в 3 раза меньше частиц
            createParticles(isMobile ? 40 : 120);
        }

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * (isMobile ? 1 : 1.5) + 0.5;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 20) + 1;
                this.opacity = Math.random() * 0.3;
            }
            update() {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let maxDistance = isMobile ? 80 : 150; // Меньше радиус на телефоне

                if (distance < maxDistance) {
                    let force = (maxDistance - distance) / maxDistance;
                    this.x -= (dx / distance) * force * this.density;
                    this.y -= (dy / distance) * force * this.density;
                } else {
                    if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 30;
                    if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 30;
                }
            }
            draw() {
                ctx.fillStyle = `rgba(212, 255, 0, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function createParticles(count) {
            particles = [];
            for (let i = 0; i < count; i++) particles.push(new Particle());
        }

        function animate() {
            ctx.fillStyle = '#070707';
            ctx.fillRect(0, 0, width, height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', initCanvas);
        if (!isMobile) {
            window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
        }
        initCanvas();
        animate();
    }

    // 3. Параллакс (адаптивный)
    const handleScroll = () => {
        const scrollY = isMobile ? window.scrollY : lenis.scroll;

        document.querySelectorAll('.parallax-line').forEach(line => {
            const speed = line.getAttribute('data-speed');
            line.style.transform = `translateX(${scrollY * speed}px)`;
        });

        document.querySelectorAll('.pj-image-wrapper img').forEach(img => {
            const rect = img.parentElement.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const move = (rect.top - window.innerHeight / 2) * 0.1;
                img.style.transform = `translateY(${move}px) scale(1.1)`;
            }
        });
    };

    if (isMobile) {
        window.addEventListener('scroll', handleScroll);
    } else {
        lenis.on('scroll', handleScroll);
    }

    // 4. Скрытие курсора на мобилках
    if (isMobile) {
        document.querySelector('.cursor').style.display = 'none';
        document.body.style.cursor = 'default';
    } else {
        const cursor = document.querySelector('.cursor');
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    }
});

window.addEventListener('load', () => {
    setTimeout(() => { document.getElementById('loader').style.transform = 'translateY(-100%)'; }, 500);
});