// Generates one SEO landing page per game (from games.json) + sitemap.xml.
// Rich EN/RU content for known games lives in KNOWN; unknown games fall back to API data.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const games = JSON.parse(fs.readFileSync(path.join(ROOT, 'games.json'), 'utf8'));
const DOMAIN = 'https://babahwork.is-a.dev';

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%234dd9ff'/%3E%3Cstop offset='1' stop-color='%239d6bff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='14' fill='%23050506'/%3E%3Cpath d='M18 20h28v6H26v8h18v6H26v10h-8z' fill='url(%23g)'/%3E%3C/svg%3E";
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
    const featsHtml = enFeats.map(f => '<li>' + escapeHtml(f) + '</li>').join('\n                ');
    const ruFeatsHtml = ruFeats.length
        ? '<ul>\n' + ruFeats.map(f => '<li>' + escapeHtml(f) + '</li>').join('\n') + '\n            </ul>'
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
    <link rel="icon" href="${FAVICON}">
    ${FONTS}
    <link rel="stylesheet" href="style.css">
</head>
<body class="game-page">
    <div class="noise" aria-hidden="true"></div>

    <nav class="gpage-nav">
        <a class="logo" href="index.html">BABAH<span>//</span>WORK</a>
        <a class="gpage-back" href="index.html">BACK&nbsp;TO&nbsp;PORTFOLIO&nbsp;&larr;</a>
    </nav>

    <main>
        <section class="gpage-hero">
            <div class="gpage-art" style="background-image:${artBg};"></div>
            <div class="gpage-info">
                <span class="gpage-label">BABAH&nbsp;WORK${year ? '&nbsp;&middot;&nbsp;' + escapeHtml(year) : ''}</span>
                <h1 class="gpage-title">${escapeHtml(title)}</h1>
                <div class="gpage-chips">
                    ${chips.map(c => '<span>' + escapeHtml(c) + '</span>').join('')}
                </div>
                <p class="gpage-desc">${escapeHtml(enDesc)}</p>
                <div class="gpage-cta"><a class="btn-cta" href="${itchUrl}" target="_blank" rel="noopener">PLAY&nbsp;ON&nbsp;ITCH.IO&nbsp;&nbsp;&rarr;</a></div>
            </div>
        </section>

        <section class="gpage-feats">
            <h2 class="gpage-h2">FEATURES</h2>
            <ul>
                ${featsHtml}
            </ul>
        </section>

        <section class="gpage-ru">
            <h2>О&nbsp;игре&nbsp;на&nbsp;русском</h2>
            <p>${escapeHtml(ruDesc)}</p>
            ${ruFeatsHtml}
        </section>
    </main>

    <footer class="gpage-foot">
        <span>&copy;&nbsp;BABAH&nbsp;WORK&nbsp;2026</span>
        <span>MADE&nbsp;WITH&nbsp;PRIDE&nbsp;IN&nbsp;BELARUS</span>
        <a href="mailto:babahworkcompany@gmail.com">babahworkcompany@gmail.com</a>
    </footer>
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
