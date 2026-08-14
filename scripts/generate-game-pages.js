// Generates one SEO landing page per game (from games.json) + sitemap.xml.
// Rich EN/RU content for known games lives in KNOWN; unknown games fall back to API data.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const games = JSON.parse(fs.readFileSync(path.join(ROOT, 'games.json'), 'utf8'));
const DOMAIN = 'https://babahwork.is-a.dev';

const FAVICON = "favicon.png";
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Unbounded:wght@600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">';

const KNOWN = {
    'toy-deceiver': {
        chips: ['PSYCHOLOGICAL HORROR', 'STRATEGY', 'WINDOWS'],
        en: {
            desc: 'A psychological horror and detective story about lies, observation and inevitability. Every night the toys come alive — watch them, find the deceiver among them, and survive until dawn.',
            feats: [
                'Day / night investigation loop — watch the toys while the light lasts',
                'Unique toy AI and deception logic — anyone can be the deceiver',
                'Atmosphere-driven horror without cheap jumpscares'
            ]
        },
        ru: {
            desc: 'Психологический хоррор и детектив о лжи, наблюдении и неотвратимости. Каждую ночь игрушки оживают — следи за ними, найди обманщика среди них и доживи до рассвета.',
            feats: [
                'Цикл расследования день / ночь',
                'Уникальный ИИ игрушек и логика обмана',
                'Атмосферный хоррор без дешёвых скримеров'
            ]
        }
    },
    'behind-the-threshold': {
        chips: ['ADVENTURE', 'PSYCHOLOGICAL HORROR', 'PSX'],
        en: {
            desc: 'A slow, relentless PSX-style descent into madness. Your own home becomes a trap, and the familiar everyday life bleeds with inexplicable anxiety.',
            feats: [
                'PSX aesthetic with modern lighting',
                'Procedural dread: the house changes every night',
                'No combat — only observation and decisions'
            ]
        },
        ru: {
            desc: 'Медленное и неумолимое погружение в безумие в стиле PSX. Собственный дом превращается в ловушку, а привычный быт сочится необъяснимой тревогой.',
            feats: [
                'Эстетика PSX с современным светом',
                'Процедурный ужас: дом меняется каждую ночь',
                'Без боя — только наблюдение и выборы'
            ]
        }
    },
    'voices-of-silence': {
        chips: ['PSYCHOLOGICAL HORROR', 'WINDOWS', 'LINUX'],
        en: {
            desc: 'Five days in an old house. Distant whispers grow closer with every dawn — a journey into sensory deprivation, silence and paranoia.',
            feats: [
                'Five-day narrative structure',
                'Dynamic audio: whispers react to your actions',
                'Minimalist visuals, maximum tension'
            ]
        },
        ru: {
            desc: 'Пять дней в старом доме. С каждым рассветом далёкие шёпоты всё ближе — путешествие в сенсорную депривацию, тишину и паранойю.',
            feats: [
                'Пятидневная структура сюжета',
                'Динамичный звук: шёпот реагирует на ваши действия',
                'Минималистичная графика, максимальное напряжение'
            ]
        }
    },
    'echoes-of-fears': {
        chips: ['HORROR', 'NARRATIVE', 'PSX'],
        en: {
            desc: 'A short PSX-style horror at a mysterious gas station. Three endings, a story mode and full EN/RU localization.',
            feats: [
                'Three distinct endings',
                'Story mode with full EN/RU localization',
                'Short session — one sitting, one nightmare'
            ]
        },
        ru: {
            desc: 'Короткий хоррор в стиле PSX на загадочной заправке. Три концовки, сюжетный режим и локализация EN/RU.',
            feats: [
                'Три разных концовки',
                'Сюжетный режим с полной локализацией EN/RU',
                'Короткая сессия — один вечер, один кошмар'
            ]
        }
    },
    'echoes-of-fears-unburied': {
        chips: ['HORROR', 'PSYCHOLOGICAL HORROR', 'PSX'],
        en: {
            desc: 'The maniac is back. A new PSX-style nightmare picks up where the original Echoes of Fears left off — deeper in the dark, closer to the truth.',
            feats: [
                'Direct continuation of the Echoes of Fears story',
                'New locations and a more twisted investigation',
                'Atmosphere-driven horror, PSX aesthetic'
            ]
        },
        ru: {
            desc: 'Маньяк вернулся. Новый кошмар в стиле PSX продолжает историю Echoes of Fears — глубже во тьме, ближе к правде.',
            feats: [
                'Прямое продолжение истории Echoes of Fears',
                'Новые локации и более мрачное расследование',
                'Атмосферный хоррор с эстетикой PSX'
            ]
        }
    }
};

const escapeHtml = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const chipsFor = g => {
    const p = g.platforms || {};
    const list = [];
    if (p.windows) list.push('WINDOWS');
    if (p.linux) list.push('LINUX');
    if (p.mac) list.push('MAC');
    if (p.android) list.push('ANDROID');
    if (p.web) list.push('WEB');
    return list.length ? list : ['ITCH.IO'];
};

const kindFor = chips => {
    const c = chips.join(' ');
    if (c.includes('PSX')) return 'PSX Horror Game';
    if (c.includes('PSYCHOLOGICAL')) return 'Psychological Horror Game';
    if (c.includes('HORROR')) return 'Horror Game';
    return 'Indie Game';
};

const slugOf = g => (g.slug || (g.url || '').split('/').filter(Boolean).pop() || 'game').toLowerCase();

function buildLdJson(title, kind, enDesc, cover, itchUrl, pageUrl, chips, g) {
    const plats = ['windows', 'mac', 'linux', 'android', 'web']
        .filter(p => (g.platforms || {})[p])
        .map(p => p.toUpperCase());
    const data = {
        '@context': 'https://schema.org',
        '@type': 'VideoGame',
        name: title,
        description: enDesc,
        url: itchUrl,
        image: cover || undefined,
        genre: (chips && chips.length ? chips.join(', ') : kind),
        gamePlatform: plats.length ? plats : ['Windows'],
        operatingSystem: plats.join(', ') || 'Windows',
        applicationCategory: 'Game',
        inLanguage: 'EN',
        author: { '@type': 'Organization', name: 'BABAH WORK', url: DOMAIN + '/' },
        publisher: { '@type': 'Organization', name: 'BABAH WORK', url: DOMAIN + '/' },
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: itchUrl
        }
    };
    return '<script type="application/ld+json">' + JSON.stringify(data) + '</script>';
}

function buildPage(g) {
    const slug = slugOf(g);
    const known = KNOWN[slug] || {};
    const chips = known.chips || chipsFor(g);
    const kind = kindFor(chips);
    const title = g.title || 'Game';
    const year = g.year || '';
    const cover = escapeHtml(g.cover || '');
    const artBg = cover
    ? "linear-gradient(180deg, rgba(6,7,12,0.15) 0%, rgba(6,7,12,0.55) 100%), url('" + cover + "')"
    : "linear-gradient(135deg, rgba(77,217,255,0.25) 0%, rgba(157,107,255,0.22) 55%, rgba(255,107,214,0.18) 100%)";
    const itchUrl = escapeHtml(g.url || '');
    const pageUrl = DOMAIN + '/' + slug + '.html';

    const enDesc = known.en ? known.en.desc : (g.short || 'An atmospheric horror experience by BABAH WORK.');
    const enFeats = known.en ? known.en.feats : [];
    const ruDesc = known.ru ? known.ru.desc : '';
    const ruFeats = known.ru ? known.ru.feats : [];

    const metaDesc = (enDesc.length > 148 ? enDesc.slice(0, 148) + '…' : enDesc) + ' Unity / C#. Play it free on itch.io.';
    const featsHtml = enFeats.map(f => '<li><span class="gpage-feat-text">' + escapeHtml(f) + '</span></li>').join('\n                ');
    const ruFeatsHtml = ruFeats.length
        ? '<div class="gpage-ru-chips">' + ruFeats.map(f => '<span>' + escapeHtml(f) + '</span>').join('') + '</div>'
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} — ${kind} by BABAH WORK</title>
    <meta name="description" content="${escapeHtml(metaDesc)}">
    <meta name="theme-color" content="#050506">
    <link rel="canonical" href="${pageUrl}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(title)} — BABAH WORK">
    <meta property="og:description" content="${escapeHtml(enDesc)}">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:image" content="${cover}">
    <meta name="twitter:card" content="summary_large_image">
    ${buildLdJson(title, kind, enDesc, cover, itchUrl, pageUrl, chips, g)}
    <link rel="icon" href="${FAVICON}" type="image/png">
    <link rel="apple-touch-icon" href="${FAVICON}">
    ${FONTS}
    <link rel="stylesheet" href="style.css">
    <script>
    (function () {
        if (/bot|crawl|spider|slurp|googlebot|bingbot|yandex|baidu|duckduckbot|facebookexternalhit|twitterbot|whatsapp|telegram|linkedinbot|pinterest|ahrefs|semrush|mj12|dotbot/i.test(navigator.userAgent)) return;
        try {
            var a = JSON.parse(localStorage.getItem('bw-access') || 'null');
            if (!a || !a.exp || a.exp < Date.now()) {
                location.replace('lock.html?ref=${slug}.html');
            }
        } catch (e) {
            location.replace('lock.html?ref=${slug}.html');
        }
    })();
    </script>
</head>
<body class="game-page">
    <div class="noise" aria-hidden="true"></div>

    <nav class="gpage-nav">
        <a class="logo" href="index.html">BABAH<span>//</span>WORK</a>
        <a class="gpage-back" href="index.html">&larr;&nbsp;BACK</a>
    </nav>

    <main>
        <section class="gpage-hero">
            <div class="gpage-art" style="background-image:${artBg};"></div>
            <div class="gpage-hero-grad" aria-hidden="true"></div>
            <div class="gpage-hero-inner">
                <div class="gpage-topline">
                    <span class="gpage-label">BABAH&nbsp;WORK${year ? '&nbsp;&middot;&nbsp;' + escapeHtml(year) : ''}</span>
                </div>
                <h1 class="gpage-title">${escapeHtml(title)}</h1>
                <div class="gpage-chips">
                    ${chips.map(c => '<span>' + escapeHtml(c) + '</span>').join('')}
                </div>
                <p class="gpage-desc">${escapeHtml(enDesc)}</p>
                <div class="gpage-cta">
                    <a class="btn-cta" href="${itchUrl}" target="_blank" rel="noopener">PLAY&nbsp;ON&nbsp;ITCH.IO&nbsp;&nbsp;&rarr;</a>
                    <button type="button" class="gpage-share">SHARE&nbsp;&#8599;</button>
                </div>
            </div>
        </section>

        <section class="gpage-feats">
            <div class="gpage-sec-head">
                <span class="gpage-sec-label">GAMEPLAY</span>
                <h2 class="gpage-h2">FEATURES</h2>
            </div>
            <ul>
                ${featsHtml}
            </ul>
        </section>

        <section class="gpage-ru">
            <div class="gpage-sec-head">
                <span class="gpage-sec-label">&#1056;&#1091;&#1089;.</span>
                <h2 class="gpage-h2">О&nbsp;игре&nbsp;на&nbsp;русском</h2>
            </div>
            <div class="gpage-ru-body">
                <p>${escapeHtml(ruDesc)}</p>
                ${ruFeatsHtml}
            </div>
        </section>

        <section class="gpage-cta-band">
            <h2 class="gpage-cta-band-title">READY&nbsp;TO&nbsp;PLAY?</h2>
            <div class="gpage-cta-band-actions">
                <a class="btn-cta" href="${itchUrl}" target="_blank" rel="noopener">PLAY&nbsp;ON&nbsp;ITCH.IO&nbsp;&nbsp;&rarr;</a>
                <a class="gpage-cta-band-back" href="index.html">BACK&nbsp;TO&nbsp;PORTFOLIO&nbsp;&larr;</a>
            </div>
        </section>
    </main>

    <footer class="gpage-foot">
        <span>&copy;&nbsp;BABAH&nbsp;WORK&nbsp;2026</span>
        <span>MADE&nbsp;WITH&nbsp;PRIDE&nbsp;IN&nbsp;BELARUS</span>
        <a href="mailto:babahworkcompany@gmail.com">babahworkcompany@gmail.com</a>
    </footer>
    <script>
        (function () {
            var btn = document.querySelector('.gpage-share');
            if (!btn) return;
            btn.addEventListener('click', function () {
                var url = location.href;
                if (navigator.share) {
                    navigator.share({ title: document.title, url: url }).catch(function () {});
                } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(function () {
                        var old = btn.innerHTML;
                        btn.innerHTML = 'COPIED!';
                        setTimeout(function () { btn.innerHTML = old; }, 1600);
                    });
                }
            });
        })();
    </script>
</body>
</html>
`;
}

function buildSitemap(games) {
    const today = new Date().toISOString().slice(0, 10);
    const entries = [
        { loc: DOMAIN + '/', prio: '1.0' },
        ...games.map(g => ({ loc: DOMAIN + '/' + slugOf(g) + '.html', prio: '0.9' }))
    ];
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        entries.map(u =>
            '  <url>\n' +
            '    <loc>' + u.loc + '</loc>\n' +
            '    <lastmod>' + today + '</lastmod>\n' +
            '    <changefreq>monthly</changefreq>\n' +
            '    <priority>' + u.prio + '</priority>\n' +
            '  </url>'
        ).join('\n') + '\n' +
        '</urlset>\n';
}

if (!Array.isArray(games) || !games.length) {
    console.error('games.json is empty — nothing to generate.');
    process.exit(0);
}

games.forEach(g => {
    const file = path.join(ROOT, slugOf(g) + '.html');
    fs.writeFileSync(file, buildPage(g));
});

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap(games));
console.log('game pages generated: ' + games.length + ' + sitemap.xml');
