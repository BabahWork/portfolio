// 1. Плавный скролл Lenis
const lenis = new Lenis({ duration: 1.2, wheelMultiplier: 1.1 });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// 2. CANVAS BACKGROUND (Оптимизированный)
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height, particles = [];
let mouse = { x: -100, y: -100 };

function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
}

class Particle {
    constructor() {
        this.reset();
    }
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
        // Реакция на мышь
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = 150;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < maxDistance) {
            this.x -= directionX;
            this.y -= directionY;
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 20;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 20;
            }
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
window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
initCanvas();
animate();

// 3. Параллакс и Курсор
const cursor = document.querySelector('.cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Эффект увеличения курсора на ссылках
document.querySelectorAll('.magnetic, .pj-image-wrapper').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

lenis.on('scroll', ({ scroll }) => {
    // Движение линий Hero
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

    // Плавное появление SAY HELLO в центре
    const footer = document.querySelector('.contact-footer');
    const fTitle = document.querySelector('.parallax-footer');
    const fRect = footer.getBoundingClientRect();
    if (fRect.top < window.innerHeight) {
        const progress = (window.innerHeight - fRect.top) / window.innerHeight;
        fTitle.style.transform = `translateX(${(1 - progress) * -200}px)`;
        fTitle.style.opacity = progress;
    }
});

window.onload = () => {
    setTimeout(() => { document.getElementById('loader').style.transform = 'translateY(-100%)'; }, 800);
};