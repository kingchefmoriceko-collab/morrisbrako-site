/* Build step for morrisbrako.com
 *
 * Reads posts/posts.json plus the markdown in posts/, then writes:
 *   insights/<slug>/index.html   one real page per post
 *   insights/index.html          the post list, injected between markers
 *   index.html                   the three most recent posts, injected between markers
 *   feed.xml                     RSS feed
 *   sitemap.xml                  sitemap for search engines
 *
 * Run it with:  node scripts/build-site.mjs
 * It is safe to run as many times as you like. Nothing else is touched.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://morrisbrako.com';

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => {
  const full = path.join(ROOT, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, s);
};

/* ---------- small helpers ---------- */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function fmtDate(iso) {
  const d = new Date(iso + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function stripFrontmatter(text) {
  if (text.slice(0, 3) === '---') {
    const end = text.indexOf('\n---', 3);
    if (end !== -1) return text.slice(text.indexOf('\n', end + 1) + 1);
  }
  return text;
}

function readingTime(md) {
  const words = stripFrontmatter(md).replace(/[#>*_`\[\]()!-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function fixSrc(src) {
  if (/^(https?:)?\/\//.test(src) || src.startsWith('/')) return src;
  return '/' + src.replace(/^\.\//, '');
}

/* ---------- markdown ---------- */

function inlineMd(s) {
  s = esc(s);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, src) =>
    `<img src="${fixSrc(src)}" alt="${alt}">`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => {
    const ext = /^https?:\/\//.test(u) ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${u}"${ext}>${t}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/(^|\s)_([^_]+)_/g, '$1<em>$2</em>');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  return s;
}

function renderMarkdown(md) {
  return md.replace(/\r\n/g, '\n').trim().split(/\n{2,}/).map((block) => {
    const lines = block.split('\n');

    const img = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (img && lines.length === 1) {
      const cap = img[1] ? `<figcaption>${esc(img[1])}</figcaption>` : '';
      return `<figure><img src="${fixSrc(img[2])}" alt="${esc(img[1])}" loading="lazy">${cap}</figure>`;
    }

    const h = block.match(/^(#{1,6})\s+(.*)$/);
    if (h && lines.length === 1) {
      const tag = h[1].length <= 2 ? 'h2' : 'h3';
      return `<${tag}>${inlineMd(h[2])}</${tag}>`;
    }

    if (/^(-{3,}|\*{3,})$/.test(block.trim())) return '<hr>';

    if (lines.every((l) => /^>\s?/.test(l))) {
      const q = lines.map((l) => l.replace(/^>\s?/, '')).join(' ');
      return `<blockquote>${inlineMd(q)}</blockquote>`;
    }
    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      return '<ul>' + lines.map((l) => `<li>${inlineMd(l.replace(/^[-*]\s+/, ''))}</li>`).join('') + '</ul>';
    }
    if (lines.every((l) => /^\d+\.\s+/.test(l))) {
      return '<ol>' + lines.map((l) => `<li>${inlineMd(l.replace(/^\d+\.\s+/, ''))}</li>`).join('') + '</ol>';
    }
    return `<p>${inlineMd(lines.join(' '))}</p>`;
  }).join('\n');
}

/* ---------- shared chrome ---------- */

const NAV = [
  ['/', 'Home'],
  ['/about/', 'About'],
  ['/research/', 'Research'],
  ['/insights/', 'Insights'],
  ['/contact/', 'Contact']
];

function header(current) {
  const desktop = NAV.map(([href, label]) =>
    `      <a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a>`).join('\n');
  const mobile = NAV.map(([href, label]) =>
    `        <li><a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a></li>`).join('\n');
  return `<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/">Morris Brako</a>
    <nav class="nav-desktop" aria-label="Primary">
${desktop}
    </nav>
    <div class="header-actions">
      <button class="icon-btn theme-toggle" type="button" aria-label="Switch to dark theme">
        <svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/></svg>
        <svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.2 8.2 0 1 0 10.2 10.2z"/></svg>
      </button>
      <button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Menu">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path class="bar bar-1" d="M4 7h16"/><path class="bar bar-2" d="M4 12h16"/><path class="bar bar-3" d="M4 17h16"/></svg>
      </button>
    </div>
  </div>
  <div class="mobile-nav" id="mobile-nav" hidden>
    <div class="wrap">
      <ul>
${mobile}
        <li><a href="/Brako_Morris_CV.pdf">Curriculum vitae</a></li>
      </ul>
    </div>
  </div>
</header>`;
}

const FOOTER = `<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <p class="footer-brand">Morris Brako</p>
        <p class="footer-tag">Hospitality educator and researcher working on food safety training that serves every worker in foodservice.</p>
      </div>
      <div>
        <h4>Site</h4>
        <ul>
          <li><a href="/about/">About</a></li>
          <li><a href="/research/">Research</a></li>
          <li><a href="/insights/">Insights</a></li>
          <li><a href="/tips/">Daily tips</a></li>
          <li><a href="/contact/">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4>Elsewhere</h4>
        <ul>
          <li><a href="/Brako_Morris_CV.pdf">Curriculum vitae</a></li>
          <li><a href="https://orcid.org/0000-0002-1880-3042" target="_blank" rel="noopener">ORCID</a></li>
          <li><a href="https://www.researchgate.net/profile/Morris-Brako" target="_blank" rel="noopener">ResearchGate</a></li>
          <li><a href="https://www.linkedin.com/in/morris-brako-48779427b" target="_blank" rel="noopener">LinkedIn</a></li>
          <li><a href="/feed.xml">RSS feed</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bar">
      <span>&copy; <span data-year></span> Morris Brako</span>
      <span>Iowa State University, Ames, Iowa</span>
    </div>
  </div>
</footer>

<button class="to-top" type="button" aria-label="Back to top">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
</button>

<script src="/assets/site.js"></script>
</body>
</html>`;

/* ---------- post page ---------- */

function postPage(post, body, mins, prev, next) {
  const url = `${SITE}/insights/${post.slug}/`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary || '',
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: url,
    url,
    author: { '@type': 'Person', name: 'Morris Brako', url: SITE + '/' },
    publisher: { '@type': 'Person', name: 'Morris Brako' },
    image: `${SITE}/images/og-image.jpg`
  };

  const nav = (prev || next) ? `
      <nav class="prevnext" aria-label="More posts">
        ${prev ? `<a href="/insights/${prev.slug}/"><span class="dir">Previous</span><span class="ttl">${esc(prev.title)}</span></a>` : '<span></span>'}
        ${next ? `<a class="next" href="/insights/${next.slug}/"><span class="dir">Next</span><span class="ttl">${esc(next.title)}</span></a>` : '<span></span>'}
      </nav>` : '';

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(post.title)}, Morris Brako</title>
<meta name="description" content="${esc(post.summary || '')}">
<link rel="canonical" href="${url}">
<meta property="og:site_name" content="Morris Brako">
<meta property="og:title" content="${esc(post.title)}">
<meta property="og:description" content="${esc(post.summary || '')}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/images/og-image.jpg">
<meta property="article:published_time" content="${post.date}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="Morris Brako, Insights" href="/feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css">
<script>(function(){try{var t=localStorage.getItem('mb-theme');if(!t){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';}document.documentElement.setAttribute('data-theme',t);document.documentElement.classList.add('js');}catch(e){}})();</script>
<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

${header('/insights/')}

<main id="main">
  <article>
    <div class="post-wrap">
      <div class="post-header">
        <p class="post-meta">
          <span>${fmtDate(post.date)}</span>
          <span class="sep">/</span>
          <span class="read">${mins} minute read</span>
        </p>
        <h1>${esc(post.title)}</h1>
        ${post.summary ? `<p class="summary">${esc(post.summary)}</p>` : ''}
      </div>
      <div class="post-body">
${body}
      </div>
      <div class="post-foot">
        <a class="back-link" href="/insights/">All insights</a>
        <a class="back-link" style="text-decoration:none" href="/contact/">Get in touch</a>
      </div>${nav}
    </div>
  </article>
</main>

${FOOTER}
`;
}

/* ---------- cards and injection ---------- */

function card(post, mins) {
  return `        <a class="post-card" href="/insights/${post.slug}/">
          <p class="post-meta"><span>${fmtDate(post.date)}</span><span class="sep">/</span><span class="read">${mins} minute read</span></p>
          <h3>${esc(post.title)}</h3>
          <p>${esc(post.summary || '')}</p>
          <span class="go">Read the post</span>
        </a>`;
}

function inject(file, html) {
  const src = read(file);
  const start = '<!-- posts:start -->';
  const end = '<!-- posts:end -->';
  const a = src.indexOf(start);
  const b = src.indexOf(end);
  if (a === -1 || b === -1) {
    console.warn(`  ! markers not found in ${file}, skipped`);
    return;
  }
  write(file, src.slice(0, a + start.length) + '\n' + html + '\n' + src.slice(b));
}

/* ---------- feeds ---------- */

function rss(posts) {
  const items = posts.map((p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${SITE}/insights/${p.slug}/</link>
    <guid isPermaLink="true">${SITE}/insights/${p.slug}/</guid>
    <pubDate>${new Date(p.date + 'T12:00:00Z').toUTCString()}</pubDate>
    <description>${esc(p.summary || '')}</description>
  </item>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Morris Brako, Insights</title>
  <link>${SITE}/insights/</link>
  <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
  <description>Short writing on food safety, disability inclusion, and workforce practice in foodservice.</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>
`;
}

function sitemap(posts) {
  const urls = [
    ['/', '1.0'], ['/about/', '0.8'], ['/research/', '0.9'],
    ['/insights/', '0.8'], ['/tips/', '0.9'], ['/contact/', '0.6']
  ].map(([u, pr]) => `  <url><loc>${SITE}${u}</loc><priority>${pr}</priority></url>`);

  posts.forEach((p) => urls.push(
    `  <url><loc>${SITE}/insights/${p.slug}/</loc><lastmod>${p.date}</lastmod><priority>0.7</priority></url>`));

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

/* ---------- tips page ---------- */

function loadTips() {
  const win = {};
  new Function('window', read('assets/tips.js'))(win);
  return { groups: win.SITE_TIP_GROUPS || [], ordered: win.SITE_TIPS_ORDERED || [] };
}

function tipsPage(groups, ordered) {
  const total = ordered.length;
  const url = `${SITE}/tips/`;

  const jump = groups.map((g) =>
    `        <a class="chip" href="#${g.slug}">${esc(g.name)}</a>`).join('\n');

  const sections = groups.map((g) => {
    const items = g.tips.map((t) => {
      const n = ordered.indexOf(t) + 1;
      return `          <li id="tip-${n}"><span class="n">${n}</span><span class="t">${esc(t)}</span>` +
        `<a class="permalink" href="#tip-${n}" aria-label="Link to tip ${n}">#</a></li>`;
    }).join('\n');
    return `      <section class="reveal" id="${g.slug}">
        <h2 class="ruled">${esc(g.name)}</h2>
        <p>${esc(g.blurb || '')}</p>
        <ol class="tip-index">
${items}
        </ol>
      </section>`;
  }).join('\n');

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Inclusive food safety training tips',
    description: `A working list of ${total} practical ideas for training employees with disabilities on food safety in foodservice.`,
    url,
    numberOfItems: total,
    itemListElement: ordered.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, name: t, url: `${url}#tip-${i + 1}`
    }))
  };

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Inclusive food safety training tips, Morris Brako</title>
<meta name="description" content="A working list of ${total} practical, one sentence ideas for training employees with disabilities on food safety in foodservice, grouped by theme.">
<link rel="canonical" href="${url}">
<meta property="og:site_name" content="Morris Brako">
<meta property="og:title" content="Inclusive food safety training tips">
<meta property="og:description" content="${total} practical ideas for training employees with disabilities on food safety in foodservice.">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/images/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="Morris Brako, Insights" href="/feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css">
<script>(function(){try{var t=localStorage.getItem('mb-theme');if(!t){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';}document.documentElement.setAttribute('data-theme',t);document.documentElement.classList.add('js');}catch(e){}})();</script>
<script type="application/ld+json">
${JSON.stringify(ld)}
</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

${header('/insights/')}

<main id="main">

  <div class="page-hero">
    <div class="wrap">
      <p class="kicker">Daily tips</p>
      <h1>Inclusive food safety training tips</h1>
      <p class="lede">A working list of ${total} practical ideas for training employees with disabilities on food safety in foodservice. One appears on the <a href="/">home page</a> each day. All of them are here, grouped by theme.</p>
    </div>
  </div>

  <section class="reveal">
    <div class="wrap">
      <p>These come out of my research and teaching on food safety training, and they share one assumption. Most training is designed for an imagined average worker, and the people who fall outside that average are the ones who fall through. Nearly every idea below makes the training clearer for everyone on the line, not only for the employee it was written for. Take what fits your operation and ignore the rest.</p>
      <div class="filters tip-jump">
${jump}
      </div>
    </div>
  </section>

  <div class="wrap tip-sections">
${sections}
  </div>

  <section class="section-alt reveal">
    <div class="wrap">
      <h2 class="ruled">Using these</h2>
      <p>You are welcome to use these in your own training, briefings, or teaching. If you do, a link back to this page is appreciated but not required. If you disagree with one, or your operation has taught you something these miss, I would like to hear it, because the list gets better that way.</p>
      <div class="cta-row" style="margin-top:24px">
        <a class="btn btn-solid" href="/contact/">Send me a note</a>
        <a class="btn btn-ghost" href="/insights/">Longer writing on this</a>
      </div>
    </div>
  </section>

</main>

${FOOTER}
`;
}

/* ---------- run ---------- */

const manifest = JSON.parse(read('posts/posts.json'));
const posts = (manifest.posts || [])
  .filter((p) => p.status !== 'draft')
  .sort((a, b) => (a.date < b.date ? 1 : -1));

console.log(`Building ${posts.length} post${posts.length === 1 ? '' : 's'}.`);

const built = posts.map((post) => {
  const md = read(post.file);
  return { post, md, mins: readingTime(md) };
});

built.forEach(({ post, md, mins }, i) => {
  const body = renderMarkdown(stripFrontmatter(md));
  const next = built[i - 1] ? built[i - 1].post : null;   // newer
  const prev = built[i + 1] ? built[i + 1].post : null;   // older
  write(`insights/${post.slug}/index.html`, postPage(post, body, mins, prev, next));
  console.log(`  /insights/${post.slug}/`);
});

inject('insights/index.html', built.length
  ? built.map(({ post, mins }) => card(post, mins)).join('\n')
  : '        <p class="empty">First posts coming soon.</p>');

inject('index.html', built.length
  ? built.slice(0, 3).map(({ post, mins }) => card(post, mins)).join('\n')
  : '        <p class="empty">First posts coming soon.</p>');

const { groups, ordered } = loadTips();
if (ordered.length) {
  write('tips/index.html', tipsPage(groups, ordered));
  console.log(`  /tips/  (${ordered.length} tips in ${groups.length} themes)`);
} else {
  console.warn('  ! no tips found in assets/tips.js, skipped /tips/');
}

write('feed.xml', rss(posts));
write('sitemap.xml', sitemap(posts));

console.log('Wrote feed.xml and sitemap.xml. Done.');
