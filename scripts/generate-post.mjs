// Generates one draft Insights post using the Groq API (OpenAI-compatible).
// Groq has a free tier and is the same provider the job_hunter bot uses.
// Writes a new markdown file in posts/ and prepends an entry to posts/posts.json.
// The GitHub Action opens a pull request with these changes for review.

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

function noEmDash(s) {
  return String(s).replace(/\s*[\u2014\u2013]\s*/g, ', ');
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const recentTitles = (manifest.posts || []).slice(0, 8).map((p) => p.title);
const brief = fs.readFileSync(PROMPT_FILE, 'utf8');

const system = 'You are a careful writing assistant drafting a short blog post for the personal academic site of Morris Brako. Follow the editorial brief exactly. Return only a single JSON object and nothing else.';

const user =
  brief +
  '\n\nRecent post titles to avoid repeating:\n' +
  (recentTitles.length ? recentTitles.map((t) => '- ' + t).join('\n') : '(none yet)') +
  '\n\nReturn only JSON with keys: title, slug, summary, body_markdown.';

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: MODEL,
    temperature: 0.7,
    max_tokens: 1600,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
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
const title = noEmDash(post.title || 'Untitled').trim();
const summary = noEmDash(post.summary || '').trim();
const body = noEmDash(post.body_markdown || '').trim();
const slug = slugify(post.slug || title);

if (!slug || !body) {
  console.error('Model output was missing a slug or body.');
  process.exit(1);
}

const filename = `${date}-${slug}.md`;
const frontmatter =
  '---\n' +
  'title: ' + JSON.stringify(title) + '\n' +
  'date: ' + date + '\n' +
  'summary: ' + JSON.stringify(summary) + '\n' +
  '---\n\n';

fs.writeFileSync(path.join(POSTS_DIR, filename), frontmatter + body + '\n');

manifest.posts.unshift({
  slug,
  title,
  date,
  summary,
  file: 'posts/' + filename,
  status: 'published'
});

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

console.log('Created draft:', filename);
