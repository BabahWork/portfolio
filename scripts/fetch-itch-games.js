// Fetches the game list from the itch.io API and writes games.json.
// Requires the ITCH_API_KEY env var (or --key=<key>).
// Runs locally or in GitHub Actions — the key never lands in the repo.
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const argKey = (args.find(a => a.startsWith('--key=')) || '').split('=')[1];
const KEY = process.env.ITCH_API_KEY || argKey;

if (!KEY) {
    console.error('ITCH_API_KEY is not set. Aborting.');
    process.exit(1);
}

const headers = { Authorization: 'Bearer ' + KEY, Accept: 'application/json' };

async function fetchJson(url) {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(url + ' -> HTTP ' + res.status);
    return res.json();
}

async function hiResCover(url) {
    try {
        const res = await fetch(url, { headers: { Accept: 'text/html' } });
        const html = await res.text();
        const m = html.match(/content="([^"]+)" property="og:image"/);
        return m ? m[1] : '';
    } catch (e) {
        console.warn('cover fetch failed for ' + url + ': ' + e.message);
        return '';
    }
}

async function main() {
    let data;
    try {
        data = await fetchJson('https://api.itch.io/profile/games');
    } catch (e) {
        console.warn('Modern API failed, falling back to legacy: ' + e.message);
        data = await fetchJson('https://itch.io/api/1/' + KEY + '/my-games');
    }

    const raw = data && Array.isArray(data.games) ? data.games : [];
    const games = raw.map(g => ({
        id: g.id,
        title: g.title,
        slug: (g.url || '').split('/').filter(Boolean).pop(),
        url: g.url,
        short: (g.short_text || '').trim(),
        cover: (g.cover_url || '').trim(),
        year: g.published_at ? String(g.published_at).slice(0, 4) : '',
        platforms: {
            windows: !!g.windows,
            mac: !!g.mac,
            linux: !!g.linux,
            android: !!g.android,
            web: !!g.web
        },
        genre: g.genre || 'GAME'
    }));

    await Promise.all(games.map(async g => {
        const hi = await hiResCover(g.url);
        if (hi) g.cover = hi;
    }));

    games.sort((a, b) =>
        String(b.year).localeCompare(String(a.year)) || String(a.title).localeCompare(String(b.title))
    );

    fs.writeFileSync(
        path.join(__dirname, '..', 'games.json'),
        JSON.stringify(games, null, 2) + '\n'
    );
    console.log('games.json written: ' + games.length + ' game(s)');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
