# Morris Brako, personal site

A static personal and academic site for morrisbrako.com, plus a weekly Insights
pipeline that drafts a post for review and a daily inclusive training tip.

## Pages

| Page | File | URL |
| --- | --- | --- |
| Home | `index.html` | `/` |
| About | `about/index.html` | `/about/` |
| Research and publications | `research/index.html` | `/research/` |
| Insights list | `insights/index.html` | `/insights/` |
| Contact | `contact/index.html` | `/contact/` |
| Not found | `404.html` | any bad address |

Each post also gets its own real page, generated at `insights/<slug>/index.html`.

## Supporting files

- `assets/site.css` is the whole design system, including the dark theme.
- `assets/site.js` is the shared behaviour: theme toggle, mobile menu, tip of the day, contact form.
- `assets/tips.js` is the tip bank. One sentence per line. Edit it freely.
- `posts/` holds the post manifest and one markdown file per post.
- `scripts/build-site.mjs` turns the markdown into pages, and writes the feed and sitemap.
- `scripts/generate-post.mjs` drafts a post using the Groq API.
- `scripts/prompt.md` is the editorial brief. Edit it to steer topics and voice.
- `images/` holds the portrait, the link preview image, and post illustrations.

## The daily tip

`assets/tips.js` contains a list of one sentence tips. The site shows one per
calendar day, working through the list in order and starting over at the end,
so it changes on its own with no work from you. The full list is at
`/insights/#tips`.

To add a tip, put another quoted line in the list. To change one, edit it in
place. The list can be any length, and nothing else needs to be updated.

## Editing content

The five main pages are ordinary HTML, so you can open one and edit the words
directly. The header and footer are repeated in each file, so if you rename a
navigation item, change it in all of them.

## Adding a post by hand

1. Add a markdown file to `posts/` using the same frontmatter shape as the existing one.
2. Add an entry at the top of the `posts` list in `posts/posts.json`.
3. Run `node scripts/build-site.mjs`.
4. Commit and push.

## Previewing locally

Because the site uses real page addresses, opening `index.html` by double
clicking will not work properly. Start a small local server instead, from
inside this folder:

```
npx serve .
```

Then open the address it prints, usually `http://localhost:3000`.

## The contact form

The form on `/contact/` uses Netlify Forms, which is included on the free plan.
Netlify detects the form automatically on deploy. To get the messages:

1. In Netlify, open the site, then Forms.
2. Select the `contact` form, then Settings and notifications.
3. Add an email notification pointing at the address you want the messages sent to.

Submissions also stay visible in the Netlify dashboard. The form falls back to
showing your email address if a submission ever fails.

## The weekly drafts

1. Get a free Groq API key at console.groq.com, or reuse the one in the job_hunter config.
2. In the GitHub repository, go to Settings, then Secrets and variables, then Actions.
   Add a secret named `GROQ_API_KEY` with your key as the value.
3. In Settings, then Actions, then General, under "Workflow permissions", enable
   "Allow GitHub Actions to create and approve pull requests".

Every Monday the workflow drafts a post, rebuilds the pages, and opens a pull
request. You read the draft, edit it if needed, and merge to publish, or close
to skip. Nothing is ever published without your merge.

To change the schedule, edit the `cron` line in `.github/workflows/weekly-draft.yml`.
The format is minute hour day-of-month month day-of-week, in UTC. `0 13 * * 1`
is Mondays at 13:00 UTC.

## Deployment

Netlify builds from the `main` branch of this repository with no build command
and the repository root as the publish directory. Any change merged into `main`
deploys automatically. `netlify.toml` holds the caching and security headers.
