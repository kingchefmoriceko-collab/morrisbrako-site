// Generates one Insights post using the Groq API (OpenAI-compatible).
// Writes a markdown file in posts/, assigns a themed header image, and prepends
// an entry to posts/posts.json. The auto-draft workflow then runs
// scripts/build-site.mjs and opens a pull request. The publish-held workflow
// merges that pull request automatically after 24 hours unless it was closed.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, 'posts');
const MANIFEST = path.join(POSTS_DIR, 'posts.json');
const PROMPT_FILE = path.join(ROOT, 'scripts', 'prompt.md');

const API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

if (!API_KEY) {
  console.error('GROQ_API_KEY is not set. Add it as a repository secret.');
  process.exit(1);
}

// Header images the post can use, keyed by theme. Add images to
// images/headers/ and list them here to widen the rotation.
const THEME_IMAGES = {
  inclusion:   'images/headers/inclusion.svg',
  clarity:     'images/headers/clarity.svg',
  temperature: 'images/headers/temperature.svg',
  hygiene:     'images/headers/hygiene.svg',
  workforce:   'images/headers/workforce.svg',
  culture:     'images/headers/culture.svg'
};
const THEMES = Object.keys(THEME_IMAGES);

// Normalise characters that read as em dashes or render oddly, per Morris's
// style rules: no em or en dashes, no non-breaking hyphens, plain spaces.
function clean(s) {
  return String(s)
    .replace(/\s*[—―]\s*/g, ', ')   // em dash, horizontal bar
    .replace(/\s*–\s*/g, ', ')            // en dash
    .replace(/[‐‑‒]/g, '-')     // hyphen, non-breaking hyphen, figure dash
    .replace(/ /g, ' ')                    // non-breaking space
    .replace(/[ \t]+\n/g, '\n');
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

// Deterministic fallback so a post always gets an image even if the model
// returns an unknown theme.
function hashPick(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return THEMES[h % THEMES.length];
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const recentTitles = (manifest.posts || []).slice(0, 20).map((p) => p.title);
const brief = fs.readFileSync(PROMPT_FILE, 'utf8');

const system = 'You are a careful writing assistant drafting a short blog post for the personal academic site of Morris Brako. Follow the editorial brief exactly. Return only a single JSON object and nothing else.';

const user =
  brief +
  '\n\nRecent post titles to avoid repeating:\n' +
  (recentTitles.length ? recentTitles.map((t) => '- ' + t).join('\n') : '(none yet)') +
  '\n\nAlso choose the single closest theme for a header image from this list: ' +
  THEMES.join(', ') +
  '.\n\nReturn only JSON with keys: title, slug, summary, body_markdown, theme.';

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: MODEL,
    temperature: 0.7,
    max_tokens: 1600,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
  })
});

if (!res.ok) {
  console.error('API request failed:', res.status, await res.text());
  process.exit(1);
}

const data = await res.json();
let text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || '').trim();
text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

let post;
try {
  post = JSON.parse(text);
} catch (e) {
  console.error('Could not parse model output as JSON:\n', text);
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
const title = clean(post.title || 'Untitled').trim();
const summary = clean(post.summary || '').trim();
const body = clean(post.body_markdown || '').trim();
let slug = slugify(post.slug || title);

if (!slug || !body) {
  console.error('Model output was missing a slug or body.');
  process.exit(1);
}

const theme = THEMES.includes(post.theme) ? post.theme : hashPick(slug);
const image = THEME_IMAGES[theme];

// Each post becomes its own page at /insights/<slug>/, so slugs have to be unique.
const taken = new Set((manifest.posts || []).map((p) => p.slug));
if (taken.has(slug)) {
  let n = 2;
  while (taken.has(`${slug}-${n}`)) n += 1;
  console.log(`Slug "${slug}" was already used, using "${slug}-${n}" instead.`);
  slug = `${slug}-${n}`;
}

const filename = `${date}-${slug}.md`;
const frontmatter =
  '---\n' +
  'title: ' + JSON.stringify(title) + '\n' +
  'date: ' + date + '\n' +
  'summary: ' + JSON.stringify(summary) + '\n' +
  '---\n\n';

// The header image leads the body so it shows on the post page.
const bodyWithImage = '![](' + image + ')\n\n' + body;

fs.writeFileSync(path.join(POSTS_DIR, filename), frontmatter + bodyWithImage + '\n');

manifest.posts.unshift({
  slug,
  title,
  date,
  summary,
  file: 'posts/' + filename,
  image,
  status: 'published'
});

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

console.log(`Created post: ${filename} (theme ${theme})`);
