const glow = document.getElementById('cursorGlow');

document.addEventListener('mousemove', (e) => {
    glow.animate({
        left: `${e.clientX}px`,
        top: `${e.clientY}px`
    }, { duration: 400, fill: "forwards" });
});

document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
});

const observerOptions = {
    threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            
            const numbers = entry.target.querySelectorAll('.stat-num');
            if (numbers.length > 0) {
                numbers.forEach(num => animateValue(num));
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

function animateValue(obj) {
    const target = +obj.getAttribute('data-target');
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16); 
    
    const updateCount = () => {
        start += step;
        if (start < target) {
            obj.innerText = Math.floor(start);
            requestAnimationFrame(updateCount);
        } else {
            obj.innerText = target;
        }
    };
    updateCount();
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

const logs = [
    "> Loading modules...",
    "> Connecting to database: OK",
    "> Optimization: 98%",
    "> Deploying CloudSnap...",
    "> Status: Online"
];
let logIdx = 0;
function typeLog() {
    if (logIdx < logs.length) {
        const p = document.createElement('p');
        p.className = "log-line";
        p.innerHTML = logs[logIdx];
        document.getElementById('terminalBody').appendChild(p);
        logIdx++;
        setTimeout(typeLog, 1500);
    }
}
typeLog();

window.onblur = () => document.title = "Вернись к BabahWork! 🚀";
window.onfocus = () => document.title = "BabahWork // Portfolio";