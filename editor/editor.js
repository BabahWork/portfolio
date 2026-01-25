document.addEventListener('DOMContentLoaded', () => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    // 1. УПРАВЛЕНИЕ КУРСОРОМ
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        if (!isMobile) {
            document.addEventListener('mousemove', (e) => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });

            // Эффект наведения
            document.querySelectorAll('.magnetic').forEach(el => {
                el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
                el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
            });
        } else {
            cursor.style.display = 'none';
            document.body.style.cursor = 'default';
        }
    }

    // 2. ЭФФЕКТ ПЕЧАТИ КОДА
    const codeSnippet = `// Babah Systems v2.0
function initCore() {
    const status = "AESTHETIC_READY";
    console.log("Interface loading...");
    
    return {
        mode: "Futuristic",
        latency: 0,
        focus: "High"
    };
}

// System is online. 
// Ready to compile ideas_`;

    const typedTextElement = document.getElementById('typed-code');
    let index = 0;

    function typeCode() {
        if (typedTextElement && index < codeSnippet.length) {
            typedTextElement.textContent += codeSnippet.charAt(index);
            index++;
            // Случайная задержка для имитации живого человека
            setTimeout(typeCode, Math.random() * 40 + 20);
        }
    }

    // 3. ФОН (Оптимизированный холст)
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        function drawBackground() {
            ctx.fillStyle = '#070707';
            ctx.fillRect(0, 0, width, height);
            requestAnimationFrame(drawBackground);
        }
        drawBackground();
    }

    // 4. ПАРАЛЛАКС ПРИ СКРОЛЛЕ
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        document.querySelectorAll('.parallax-line').forEach(el => {
            const speed = el.getAttribute('data-speed') || 0.1;
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // 5. УДАЛЕНИЕ ЛОАДЕРА
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader) loader.style.transform = 'translateY(-100%)';
            // Запуск печати кода ПОСЛЕ того, как ушел лоадер
            setTimeout(typeCode, 800);
        }, 500);
    });
});