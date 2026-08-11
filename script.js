document.documentElement.classList.add('js');

window.addEventListener('error', (e) => console.error('[site] JS error:', e.message, e.filename + ':' + e.lineno));
window.addEventListener('unhandledrejection', (e) => console.error('[site] unhandled promise rejection:', e.reason));

document.addEventListener('DOMContentLoaded', () => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lenis = null;

    if (!isMobile && !reduceMotion && typeof Lenis !== 'undefined') {
        lenis = new Lenis({ duration: 1.15, wheelMultiplier: 1 });
        const raf = (time) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
    }

    const progressBar = document.querySelector('.scroll-progress');
    const spySections = ['top', 'work', 'wip', 'contact'].map(id => document.getElementById(id));

    const onScroll = () => {
        const scrolled = isMobile || !lenis ? window.scrollY : lenis.scroll;
        document.querySelector('header').classList.toggle('is-scrolled', scrolled > 40);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (progressBar) {
            progressBar.style.transform = `scaleX(${Math.min(1, max > 0 ? scrolled / max : 0)})`;
        }
        const vh = window.innerHeight;
        let activeId = 'top';
        spySections.forEach(sec => {
            if (sec && sec.getBoundingClientRect().top <= vh * 0.4) activeId = sec.id;
        });
        document.querySelectorAll('.nav-links a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + activeId);
        });
        document.querySelectorAll('.mobile-menu-nav a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + activeId);
        });
        if (!reduceMotion && !isMobile) parallax();
    };

    if (isMobile || !lenis) {
        window.addEventListener('scroll', onScroll, { passive: true });
    } else {
        lenis.on('scroll', onScroll);
    }

    // Aurora background (low-res buffer, static frame when reduced motion)
    const canvas = document.getElementById('aurora');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const scale = isMobile ? 0.4 : 0.5;
        let width, height;
        let mouse = { x: 0, y: 0 };
        let blobs;
        const palettes = [
            { r: 77, g: 217, b: 255 },
            { r: 157, g: 107, b: 255 },
            { r: 255, g: 107, b: 214 }
        ];

        function seed() {
            const base = Math.min(width, height);
            blobs = Array.from({ length: isMobile ? 2 : 4 }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                r: (Math.random() * 0.3 + 0.3) * base,
                dx: (Math.random() - 0.5) * 0.35,
                dy: (Math.random() - 0.5) * 0.35,
                phase: Math.random() * Math.PI * 2,
                pal: palettes[Math.floor(Math.random() * palettes.length)],
                alpha: 0.09 + Math.random() * 0.07
            }));
        }

        function resize() {
            width = canvas.width = Math.floor(window.innerWidth * scale);
            height = canvas.height = Math.floor(window.innerHeight * scale);
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';
            seed();
        }

        function paint(time) {
            ctx.clearRect(0, 0, width, height);
            const t = time * 0.001;
            blobs.forEach((b) => {
                const gx = b.x + (mouse.x * scale - width / 2) * 0.02;
                const gy = b.y + (mouse.y * scale - height / 2) * 0.02;
                const radius = b.r * (1 + 0.06 * Math.sin(t * 0.5 + b.phase * 2));
                const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius);
                g.addColorStop(0, `rgba(${b.pal.r},${b.pal.g},${b.pal.b},${b.alpha})`);
                g.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = g;
ctx.beginPath();
                        ctx.arc(gx, gy, radius, 0, Math.PI * 2);
                        ctx.fill();
                    });
        }

        function loop(t) {
            if (t - loop.last >= 32) {
                paint(t);
                loop.last = t;
            }
            requestAnimationFrame(loop);
        }
        loop.last = 0;

        window.addEventListener('resize', resize);
        if (!isMobile) {
            window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
        }
        resize();
        if (reduceMotion) {
            paint(0);
        } else {
            requestAnimationFrame(loop);
        }
    }

    // Custom cursor
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (dot && ring && !isMobile && !reduceMotion) {
        dot.style.display = 'block';
        ring.style.display = 'block';
        let tx = -100, ty = -100, rx = -100, ry = -100;
        document.addEventListener('mousemove', (e) => {
            tx = e.clientX;
            ty = e.clientY;
            dot.style.transform = `translate(${tx - 3}px, ${ty - 3}px)`;
        });
        const lerpRing = () => {
            rx += (tx - rx) * 0.16;
            ry += (ty - ry) * 0.16;
            ring.style.transform = `translate(${rx - 17}px, ${ry - 17}px)`;
            requestAnimationFrame(lerpRing);
        };
        requestAnimationFrame(lerpRing);

        document.querySelectorAll('a, button, .project, .proj-visual').forEach(el => {
            el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
            el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
        });
    }

    // Magnetic buttons
    function initMagnetic(scope) {
        if (isMobile || reduceMotion) return;
        scope.querySelectorAll('.magnetic').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                el.style.transform = `translate(${(x * 0.18).toFixed(1)}px, ${(y * 0.18).toFixed(1)}px)`;
            });
            el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        });
    }

    // Card tilt
    function initTilt(scope) {
        if (isMobile || reduceMotion) return;
        scope.querySelectorAll('.proj-visual').forEach(v => {
            v.addEventListener('mousemove', (e) => {
                const r = v.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                v.style.transform = `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg)`;
            });
            v.addEventListener('mouseleave', () => { v.style.transform = ''; });
        });
    }

    initMagnetic(document);
    initTilt(document);

    // Lazy background covers (cards)
    const lazyBg = (() => {
        if (!('IntersectionObserver' in window)) return el => { el.classList.remove('lazy-bg'); };
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                el.style.backgroundImage = el.dataset.bg || '';
                el.classList.remove('lazy-bg');
                io.unobserve(el);
            });
        }, { rootMargin: '300px 0px' });
        return (el) => {
            const bg = getComputedStyle(el).backgroundImage;
            if (!bg || bg === 'none') return;
            el.dataset.bg = bg;
            el.style.backgroundImage = 'none';
            el.classList.add('lazy-bg');
            io.observe(el);
        };
    })();

    document.querySelectorAll('.proj-visual').forEach(lazyBg);

    // Mobile menu (burger)
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    function closeMenu() {
        if (!menuToggle || !mobileMenu) return;
        mobileMenu.classList.remove('is-open');
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        if (lenis) lenis.start();
    }
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            const open = mobileMenu.classList.toggle('is-open');
            menuToggle.classList.toggle('is-open', open);
            menuToggle.setAttribute('aria-expanded', open);
            mobileMenu.setAttribute('aria-hidden', !open);
            if (lenis) open ? lenis.stop() : lenis.start();
        });
        mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) closeMenu();
        });
    }

    // Smooth anchors (Lenis-aware)
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if (id.length < 2) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            if (lenis) {
                lenis.scrollTo(target, { duration: 1.2 });
            } else {
                target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
            }
        });
    });

    // Reveal on scroll
    let io = null;
    const reveals = document.querySelectorAll('.reveal');
    if (reduceMotion) {
        reveals.forEach(el => el.classList.add('in'));
    } else if ('IntersectionObserver' in window) {
        io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    if (entry.target.hasAttribute('data-par')) {
                        setTimeout(() => { entry.target.style.transition = 'none'; }, 1100);
                    }
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
        reveals.forEach(el => io.observe(el));
    } else {
        reveals.forEach(el => el.classList.add('in'));
    }

    function observeReveal(el) {
        if (reduceMotion || !io) { el.classList.add('in'); return; }
        io.observe(el);
    }

    // Parallax drift
    function parallax() {
        const vh = window.innerHeight;
        document.querySelectorAll('[data-par]').forEach(el => {
            const par = parseFloat(el.getAttribute('data-par')) || 0;
            const rect = el.getBoundingClientRect();
            const progress = (vh / 2 - (rect.top + rect.height / 2)) / vh * 100;
            const y = -Math.min(130, Math.abs(progress) * par * 0.045);
            el.style.transform = `translateY(${y}px)`;
        });
    }

    // ---- i18n (EN / RU) ----
    const i18n = {
        en: {
            'nav.work': 'WORK',
            'nav.now': 'NOW',
            'nav.contact': 'CONTACT',
            'hero.eyebrow': 'OPEN FOR COMMISSIONS&nbsp;&middot;&nbsp;UNITY / C#',
            'hero.line1': 'PLAYABLE.',
            'hero.line2': 'EXPERIENCES.',
            'hero.sub': 'BABAH WORK is an indie studio turning sharp ideas into polished Unity games — gameplay, tools and prototypes.',
            'stat.1': 'YEARS&nbsp;IN&nbsp;UNITY',
            'stat.2': 'PROJECTS',
            'stat.3': 'PLATFORMS',
            'stat.4': 'ORIGIN&nbsp;·&nbsp;BELARUS',
            'origin.bel': 'З&nbsp;ГОНАРАМ&nbsp;ЗРОБЛЕНА&nbsp;Ў&nbsp;БЕЛАРУСІ',
            'origin.meta': '&middot;&nbsp;INDIE&nbsp;GAMES&nbsp;FROM&nbsp;MINSK',
            'work.label': '01&nbsp;&middot;&nbsp;GAMES',
            'work.head': 'SELECTED&nbsp;PROJECTS',
            'wip.label': '02&nbsp;&middot;&nbsp;IN&nbsp;DEVELOPMENT',
            'wip.head': 'NEXT&nbsp;PROJECT',
            'wip.desc': 'A dark atmospheric prototype is on the workbench right now. One more sleepless night — and one more nightmare ready to ship.',
            'wip.current': 'CURRENT&nbsp;STAGE',
            'wip.stage1': 'IDEA',
            'wip.stage2': 'PROTOTYPE',
            'wip.stage3': 'POLISH',
            'wip.stage4': 'RELEASE',
            'games.case': 'CASE&nbsp;&#8599;',
            'games.play': 'PLAY&nbsp;ON&nbsp;ITCH.IO&nbsp;&nbsp;&rarr;',
            'games.toy.cat': 'PSYCHOLOGICAL&nbsp;HORROR&nbsp;/&nbsp;STRATEGY',
            'games.toy.desc': 'A psychological horror and detective story about lies, observation and inevitability. Watch the toys, find the deceiver among them — and survive the night.',
            'games.toy.chip2': 'RELEASED',
            'games.threshold.cat': 'ADVENTURE&nbsp;/&nbsp;PSYCHOLOGICAL&nbsp;HORROR',
            'games.threshold.desc': 'A slow, relentless PSX-style descent into madness. Your own home becomes a trap, and the familiar everyday life bleeds with inexplicable anxiety.',
            'games.threshold.chip3': 'RELEASED',
            'games.voices.cat': 'PSYCHOLOGICAL&nbsp;HORROR',
            'games.voices.desc': 'Five days in an old house. Distant whispers grow closer with every dawn — a journey into sensory deprivation, silence and paranoia.',
            'games.echoes.cat': 'HORROR&nbsp;/&nbsp;NARRATIVE',
            'games.echoes.desc': 'A short PSX-style horror at a mysterious gas station. Three endings, a story mode and EN/RU localization.',
            'games.echoes.chip3': '3&nbsp;ENDINGS',
            'stack.1': 'GAMEPLAY&nbsp;PROGRAMMING',
            'stack.2': 'SYSTEMS&nbsp;&amp;&nbsp;TOOLS',
            'stack.3': 'OPTIMIZATION',
            'stack.4': 'CROSS-PLATFORM',
            'contact.title1': 'LET\'S&nbsp;MAKE&nbsp;SOMETHING',
            'contact.title2': 'PLAYABLE.',
            'contact.cta': 'START&nbsp;A&nbsp;CONVERSATION&nbsp;&rarr;',
            'footer.copyright': '&copy;&nbsp;BABAH&nbsp;WORK&nbsp;2026',
            'footer.made': 'MADE&nbsp;WITH&nbsp;PRIDE&nbsp;IN&nbsp;BELARUS&nbsp;&#127463;&#127478;',
            'modal.close': 'Close',
            'modal.play': 'PLAY&nbsp;ON&nbsp;ITCH.IO&nbsp;&nbsp;&rarr;',
            'modal.page': 'OPEN&nbsp;GAME&nbsp;PAGE&nbsp;&#8599;',
            'meta.title': 'BABAH WORK // INDIE GAME STUDIO',
            'meta.desc': 'BABAH WORK — indie game studio. Unity / C#. Playable experiences, tools and prototypes.'
        },
        ru: {
            'nav.work': 'РАБОТЫ',
            'nav.now': 'СЕЙЧАС',
            'nav.contact': 'КОНТАКТ',
            'hero.eyebrow': 'ОТКРЫТ&nbsp;ДЛЯ&nbsp;ЗАКАЗОВ&nbsp;&middot;&nbsp;UNITY / C#',
            'hero.line1': 'ИГРАБЕЛЬНЫЕ.',
            'hero.line2': 'ПЕРЕЖИВАНИЯ.',
            'hero.sub': 'BABAH WORK — инди-студия, превращающая смелые идеи в полированные игры на Unity: геймплей, инструменты и прототипы.',
            'stat.1': 'ГОДА&nbsp;В&nbsp;UNITY',
            'stat.2': 'ПРОЕКТА',
            'stat.3': 'ПЛАТФОРМЫ',
            'stat.4': 'РОДИНА&nbsp;·&nbsp;БЕЛАРУСЬ',
            'origin.bel': 'З&nbsp;ГОНАРАМ&nbsp;ЗРОБЛЕНА&nbsp;Ў&nbsp;БЕЛАРУСІ',
            'origin.meta': '&middot;&nbsp;ИНДИ-ИГРЫ&nbsp;ИЗ&nbsp;МИНСКА',
            'work.label': '01&nbsp;&middot;&nbsp;ИГРЫ',
            'work.head': 'ИЗБРАННЫЕ&nbsp;ПРОЕКТЫ',
            'wip.label': '02&nbsp;&middot;&nbsp;В&nbsp;РАЗРАБОТКЕ',
            'wip.head': 'СЛЕДУЮЩИЙ&nbsp;ПРОЕКТ',
            'wip.desc': 'Тёмный атмосферный прототип — уже на верстаке. Ещё одна бессонная ночь — и ещё один кошмар готов к релизу.',
            'wip.current': 'ТЕКУЩИЙ&nbsp;ЭТАП',
            'wip.stage1': 'ИДЕЯ',
            'wip.stage2': 'ПРОТОТИП',
            'wip.stage3': 'ПОЛИРОВКА',
            'wip.stage4': 'РЕЛИЗ',
            'games.case': 'КЕЙС&nbsp;&#8599;',
            'games.play': 'ИГРАТЬ&nbsp;НА&nbsp;ITCH.IO&nbsp;&nbsp;&rarr;',
            'games.toy.cat': 'ПСИХОЛОГИЧЕСКИЙ&nbsp;ХОРРОР&nbsp;/&nbsp;СТРАТЕГИЯ',
            'games.toy.desc': 'Психологический хоррор и детектив о лжи, наблюдении и неотвратимости. Следи за игрушками, найди обманщика среди них — и переживи ночь.',
            'games.toy.chip2': 'РЕЛИЗ',
            'games.threshold.cat': 'ПРИКЛЮЧЕНИЕ&nbsp;/&nbsp;ПСИХОЛОГИЧЕСКИЙ&nbsp;ХОРРОР',
            'games.threshold.desc': 'Медленное и неумолимое погружение в безумие в стиле PSX. Собственный дом превращается в ловушку, а привычный быт сочится необъяснимой тревогой.',
            'games.threshold.chip3': 'РЕЛИЗ',
            'games.voices.cat': 'ПСИХОЛОГИЧЕСКИЙ&nbsp;ХОРРОР',
            'games.voices.desc': 'Пять дней в старом доме. С каждым рассветом далёкие шёпоты всё ближе — путешествие в сенсорную депривацию, тишину и паранойю.',
            'games.echoes.cat': 'ХОРРОР&nbsp;/&nbsp;НАРРАТИВ',
            'games.echoes.desc': 'Короткий хоррор в стиле PSX на загадочной заправке. Три концовки, сюжетный режим и локализация EN/RU.',
            'games.echoes.chip3': '3&nbsp;КОНЦОВКИ',
            'stack.1': 'ГЕЙМПЛЕЙ&nbsp;ПРОГРАММИРОВАНИЕ',
            'stack.2': 'СИСТЕМЫ&nbsp;&amp;&nbsp;ИНСТРУМЕНТЫ',
            'stack.3': 'ОПТИМИЗАЦИЯ',
            'stack.4': 'КРОСС-ПЛАТФОРМА',
            'contact.title1': 'ДАВАЙ СОЗДАДИМ ЧТО-ТО',
            'contact.title2': 'ИГРАБЕЛЬНОЕ.',
            'contact.cta': 'НАЧАТЬ&nbsp;РАЗГОВОР&nbsp;&rarr;',
            'footer.copyright': '&copy;&nbsp;BABAH&nbsp;WORK&nbsp;2026',
            'footer.made': 'СДЕЛАНО&nbsp;С&nbsp;ГОРДОСТЬЮ&nbsp;В&nbsp;БЕЛАРУСИ&nbsp;&#127463;&#127478;',
            'modal.close': 'Закрыть',
            'modal.play': 'ИГРАТЬ&nbsp;НА&nbsp;ITCH.IO&nbsp;&nbsp;&rarr;',
            'modal.page': 'СТРАНИЦА&nbsp;ИГРЫ&nbsp;&#8599;',
            'meta.title': 'BABAH WORK // ИНДИ-СТУДИЯ',
            'meta.desc': 'BABAH WORK — инди-студия игр. Unity / C#. Играбельные проекты, инструменты и прототипы.'
        }
    };

    // ---- Project cases data ----
    const caseData = {
        toy: {
            img: 'https://img.itch.zone/aW1nLzIzNjAzNDkxLnBuZw==/original/VBySlA.png',
            year: '2025',
            link: 'https://babahwork.itch.io/toy-deceiver',
            page: 'toy-deceiver.html',
            en: {
                title: 'TOY DECEIVER',
                genre: 'PSYCHOLOGICAL HORROR / STRATEGY',
                engine: 'Unity / C#',
                desc: 'A psychological horror and detective story about lies, observation and inevitability. Every night the toys come alive — watch them, find the deceiver among them, and survive until dawn.',
                feats: ['Day / night investigation loop', 'Unique toy AI and deception logic', 'Atmosphere-driven horror without cheap jumpscares']
            },
            ru: {
                title: 'TOY DECEIVER',
                genre: 'ПСИХОЛОГИЧЕСКИЙ ХОРРОР / СТРАТЕГИЯ',
                engine: 'Unity / C#',
                desc: 'Психологический хоррор и детектив о лжи, наблюдении и неотвратимости. Каждую ночь игрушки оживают — следи за ними, найди обманщика среди них и доживи до рассвета.',
                feats: ['Цикл расследования день / ночь', 'Уникальный ИИ игрушек и логика обмана', 'Атмосферный хоррор без дешёвых скримеров']
            }
        },
        threshold: {
            img: 'https://img.itch.zone/aW1nLzI1OTc4NzA3LnBuZw==/original/SjQ85R.png',
            year: '2026',
            link: 'https://babahwork.itch.io/behind-the-threshold',
            page: 'behind-the-threshold.html',
            en: {
                title: 'BEHIND THE THRESHOLD',
                genre: 'ADVENTURE / PSYCHOLOGICAL HORROR',
                engine: 'Unity / C#',
                desc: 'A slow, relentless PSX-style descent into madness. Your own home becomes a trap, and the familiar everyday life bleeds with inexplicable anxiety.',
                feats: ['PSX aesthetic with modern lighting', 'Procedural dread: the house changes every night', 'No combat — only observation and decisions']
            },
            ru: {
                title: 'BEHIND THE THRESHOLD',
                genre: 'ПРИКЛЮЧЕНИЕ / ПСИХОЛОГИЧЕСКИЙ ХОРРОР',
                engine: 'Unity / C#',
                desc: 'Медленное и неумолимое погружение в безумие в стиле PSX. Собственный дом превращается в ловушку, а привычный быт сочится необъяснимой тревогой.',
                feats: ['Эстетика PSX с современным светом', 'Процедурный ужас: дом меняется каждую ночь', 'Без боя — только наблюдение и выборы']
            }
        },
        voices: {
            img: 'https://img.itch.zone/aW1nLzIzNzY0ODc5LnBuZw==/original/X18zHq.png',
            year: '2025',
            link: 'https://babahwork.itch.io/voices-of-silence',
            page: 'voices-of-silence.html',
            en: {
                title: 'VOICES OF SILENCE',
                genre: 'PSYCHOLOGICAL HORROR',
                engine: 'Unity / C#',
                desc: 'Five days in an old house. Distant whispers grow closer with every dawn — a journey into sensory deprivation, silence and paranoia.',
                feats: ['Five-day narrative structure', 'Dynamic audio: whispers react to your actions', 'Minimalist visuals, maximum tension']
            },
            ru: {
                title: 'VOICES OF SILENCE',
                genre: 'ПСИХОЛОГИЧЕСКИЙ ХОРРОР',
                engine: 'Unity / C#',
                desc: 'Пять дней в старом доме. С каждым рассветом далёкие шёпоты всё ближе — путешествие в сенсорную депривацию, тишину и паранойю.',
                feats: ['Пятидневная структура сюжета', 'Динамичный звук: шёпот реагирует на ваши действия', 'Минималистичная графика, максимальное напряжение']
            }
        },
        echoes: {
            img: 'https://img.itch.zone/aW1nLzIxMjQxMTU2LnBuZw==/original/yOACfH.png',
            year: '2025',
            link: 'https://babahwork.itch.io/echoes-of-fears',
            page: 'echoes-of-fears.html',
            en: {
                title: 'ECHOES OF FEARS',
                genre: 'HORROR / NARRATIVE',
                engine: 'Unity / C#',
                desc: 'A short PSX-style horror at a mysterious gas station. Three endings, a story mode and EN/RU localization.',
                feats: ['Three distinct endings', 'Story mode with full EN/RU localization', 'Short session — one sitting, one nightmare']
            },
            ru: {
                title: 'ECHOES OF FEARS',
                genre: 'ХОРРОР / НАРРАТИВ',
                engine: 'Unity / C#',
                desc: 'Короткий хоррор в стиле PSX на загадочной заправке. Три концовки, сюжетный режим и локализация EN/RU.',
                feats: ['Три разных концовки', 'Сюжетный режим с полной локализацией EN/RU', 'Короткая сессия — один вечер, один кошмар']
            }
        }
    };

    let currentLang = 'en';
    try { currentLang = localStorage.getItem('bw-lang') || 'en'; } catch (e) {}
    if (!i18n[currentLang]) currentLang = 'en';

    const modal = document.getElementById('case-modal');
    const modalBody = document.getElementById('modal-body');
    let modalGame = null;
    let lastFocus = null;

    function renderCase(id, lang) {
        const c = caseData[id];
        if (!c) return;
        const t = c[lang] || c.en;
        modalGame = id;
        modalBody.innerHTML =
            '<div class="case-hero">' +
                '<img class="case-img" src="' + c.img + '" alt="' + t.title + '" loading="lazy">' +
                '<div class="case-hero-grad" aria-hidden="true"></div>' +
                '<div class="case-hero-head">' +
                    '<h3 class="case-title">' + t.title + '</h3>' +
                    '<span class="case-year">' + c.year + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="case-body">' +
                '<div class="case-meta">' +
                    '<span class="case-chip case-genre">' + t.genre + '</span>' +
                    '<span class="case-chip case-engine"><span class="chip-dot" aria-hidden="true"></span>' + t.engine + '</span>' +
                '</div>' +
                '<p class="case-desc">' + t.desc + '</p>' +
                '<ul class="case-feats">' + t.feats.map(f => '<li><span class="feat-mark" aria-hidden="true"></span><span>' + f + '</span></li>').join('') + '</ul>' +
                '<div class="case-foot">' +
                    '<a class="case-play" href="' + c.link + '" target="_blank" rel="noopener"><span class="play-label">' + (i18n[lang] ? i18n[lang]['modal.play'] : i18n.en['modal.play']) + '</span></a>' +
                    (c.page ? '<a class="case-page" href="' + c.page + '">' + (i18n[lang] ? i18n[lang]['modal.page'] : i18n.en['modal.page']) + '</a>' : '') +
                '</div>' +
            '</div>';
    }

    function applyLang(lang) {
        const dict = i18n[lang] || i18n.en;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key] != null) el.innerHTML = dict[key];
        });
        document.documentElement.lang = lang;
        document.title = dict['meta.title'];
        const mDesc = document.querySelector('meta[name="description"]');
        if (mDesc) mDesc.setAttribute('content', dict['meta.desc']);
        const og = document.querySelector('meta[property="og:title"]');
        if (og) og.setAttribute('content', dict['meta.title']);
        const tw = document.querySelector('meta[name="twitter:title"]');
        if (tw) tw.setAttribute('content', dict['meta.title']);
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.setAttribute('aria-label', dict['modal.close']);
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
        });
        if (modal.classList.contains('is-open') && modalGame) {
            renderCase(modalGame, lang);
        }
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.getAttribute('data-lang');
            applyLang(currentLang);
            try { localStorage.setItem('bw-lang', currentLang); } catch (e) {}
        });
    });

    // ---- Project cases modal ----
    function openCase(id) {
        lastFocus = document.activeElement;
        renderCase(id, currentLang);
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        if (lenis) lenis.stop();
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
    }

    function closeCase() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (lenis) lenis.start();
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.querySelectorAll('.case-open').forEach(btn => {
        btn.addEventListener('click', () => openCase(btn.getAttribute('data-game')));
    });
    modal.querySelectorAll('[data-close]').forEach(el => {
        el.addEventListener('click', closeCase);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeCase();
    });

    // ---- itch.io feed (games.json) ----
    const KNOWN_GAME_KEYS = {
        'toy-deceiver': 'toy',
        'behind-the-threshold': 'threshold',
        'voices-of-silence': 'voices',
        'echoes-of-fears': 'echoes'
    };
    const workSection = document.getElementById('work');
    const stackRow = document.querySelector('.stack-row');

    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function keyForGame(g) {
        const slug = String(g.slug || (g.url || '').split('/').filter(Boolean).pop() || '').toLowerCase();
        return KNOWN_GAME_KEYS[slug] || slug;
    }

    function buildGameCard(g, index) {
        const key = keyForGame(g);
        if (document.querySelector('.project[data-game="' + key + '"]')) return null;

        const rev = (document.querySelectorAll('#work .project').length + index) % 2 === 1;
        const chipDefs = [
            ['windows', 'WINDOWS'], ['linux', 'LINUX'], ['mac', 'MAC'], ['android', 'ANDROID'], ['web', 'WEB']
        ];
        const chips = chipDefs.filter(([k]) => g.platforms && g.platforms[k]).map(([, l]) => l);
        if (!chips.length) chips.push('ITCH.IO');
        const tag = String(g.genre || 'GAME').toUpperCase();
        const cover = g.cover || '';
        const slug = String(g.slug || (g.url || '').split('/').filter(Boolean).pop() || '').toLowerCase();
        const playLabel = (i18n[currentLang] || i18n.en)['games.play'];

        const el = document.createElement('article');
        el.className = 'project reveal' + (rev ? ' project-rev' : '');
        el.innerHTML =
            '<div class="proj-visual" style="background-image:linear-gradient(180deg, rgba(6,7,12,0.2) 0%, rgba(6,7,12,0.72) 100%), url(\'' + escapeHtml(cover) + '\');background-size:cover;background-position:center;">' +
                '<div class="proj-art"><span class="proj-art-title">' + escapeHtml(g.title) + '</span><span class="proj-art-tag">' + escapeHtml(tag) + '</span></div>' +
            '</div>' +
            '<div class="proj-info">' +
                '<div class="proj-meta"><span class="proj-cat">' + escapeHtml(tag) + '</span><span class="proj-year">' + escapeHtml(g.year) + '</span></div>' +
                '<h3><a class="proj-title-link" href="' + escapeHtml(slug) + '.html">' + escapeHtml(g.title) + '</a></h3>' +
                '<p>' + escapeHtml(g.short) + '</p>' +
                '<div class="chip-row">' + chips.map(c => '<span class="chip">' + escapeHtml(c) + '</span>').join('') + '</div>' +
                '<div class="link-row"><a class="text-link magnetic" href="' + escapeHtml(g.url) + '" target="_blank" rel="noopener">' + playLabel + '</a></div>' +
            '</div>';
        return el;
    }

    function applyGames(list) {
        if (!Array.isArray(list) || !list.length || !workSection || !stackRow) return;
        console.log('[itch feed] loaded ' + list.length + ' game(s) from games.json');
        let added = 0;
        list.forEach((g, i) => {
            const key = keyForGame(g);
            const card = document.querySelector('.project[data-game="' + key + '"]');
            if (card) {
                const yr = card.querySelector('.proj-year');
                if (yr && g.year) yr.textContent = g.year;
                return;
            }
            const el = buildGameCard(g, i);
            if (el) {
                workSection.insertBefore(el, stackRow);
                lazyBg(el.querySelector('.proj-visual'));
                initMagnetic(el);
                initTilt(el);
                observeReveal(el);
                added++;
            }
        });
        if (added) {
            const stats = document.querySelectorAll('.hero-stats .stat');
            const num = stats[1] && stats[1].querySelector('.stat-num');
            if (num) num.textContent = String(list.length).padStart(2, '0');
        }
    }

    function loadGames() {
        fetch('games.json?v=' + Date.now(), { headers: { 'Accept': 'application/json' } })
            .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(applyGames)
            .catch(() => { console.warn('[itch feed] games.json unavailable, using static cards'); });
    }
    loadGames();

    applyLang(currentLang);

    onScroll();
});

const hideLoader = () => {
    const loader = document.getElementById('loader');
    if (!loader || loader.dataset.hidden) return;
    loader.dataset.hidden = '1';
    loader.style.transform = 'translateY(-100%)';
    setTimeout(() => { loader.style.visibility = 'hidden'; }, 800);
};

window.addEventListener('load', () => setTimeout(hideLoader, 600));
setTimeout(hideLoader, 3500);