# Morris Brako, personal site

A static personal and academic site, plus a weekly Insights pipeline that drafts a
post for review.

## Files

- `index.html` is the whole site. It reads posts from `posts/posts.json`.
- `Morris_grey.png` is the portrait, `Brako_Morris_CV.docx` is the linked CV.
- `posts/` holds the post manifest and one markdown file per post.
- `scripts/generate-post.mjs` drafts a post using the Anthropic API.
- `scripts/prompt.md` is the editorial brief. Edit it to steer topics and voice.
- `.github/workflows/weekly-draft.yml` runs the drafter weekly and opens a pull request.

## Publish the site

1. Create a free account at github.com and make a new repository.
2. Upload every file and folder here to that repository, keeping the structure.
3. Create a free account at netlify.com and choose "Import from Git".
4. Pick the repository. No build command is needed. Set the publish directory to the
   repository root. Deploy.
5. In Netlify, add your custom domain `morrisbrako.com` under Domain settings, then
   set the DNS records it gives you at Porkbun. Ask Claude for the exact records.

After this, any change merged into the main branch publishes automatically.

## Turn on the weekly drafts

1. Get a free Groq API key at console.groq.com, or reuse the one already in
   the job_hunter config. Groq has a free tier, so this costs nothing.
2. In the GitHub repository, go to Settings, then Secrets and variables, then Actions.
   Add a secret named `GROQ_API_KEY` with your key as the value.
3. In Settings, then Actions, then General, under "Workflow permissions", enable
   "Allow GitHub Actions to create and approve pull requests".
4. That is it. Every Monday the workflow drafts a post and opens a pull request.

## How the weekly flow works

1. The workflow drafts a post and opens a pull request. Nothing is public yet.
2. You read the draft, edit it if needed, and merge to publish, or close to skip.
3. Merging triggers a Netlify deploy and the post goes live.

Nothing is ever published without your merge. That review step is intentional.

## Change the schedule

Edit the `cron` line in `.github/workflows/weekly-draft.yml`. The format is
minute hour day-of-month month day-of-week, in UTC. `0 13 * * 1` is Mondays at 13:00 UTC.

## Add a post by hand

Add a markdown file to `posts/` with the same frontmatter shape as the existing one,
then add an entry at the top of the `posts` list in `posts/posts.json`. Commit and merge.
