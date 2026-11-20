# Lumen: AI Research Assistant

A animated research-assistant website. `index.html` is the front end, and `api/research.js` is a Vercel serverless function that calls the Claude API so your key stays secret.

## Deploy to Vercel

### Option A: Vercel CLI (recommended)
1. Install Node.js, then run: `npm i -g vercel`
2. In this folder, run: `vercel`, and follow the prompts (accept defaults).
3. Add your API key (get one at console.anthropic.com):
   `vercel env add ANTHROPIC_API_KEY production`
   Paste the key when asked.
4. Deploy to production: `vercel --prod`

You'll get a public URL like `https://your-project.vercel.app`.

### Option B: Dashboard drag-and-drop
1. Go to vercel.com/new and create a new project from a Git repo (push this folder to GitHub first), or use the CLI above.
2. In Project Settings → Environment Variables, add `ANTHROPIC_API_KEY`.
3. Redeploy.

## Customize
- Research behavior: edit `SYSTEM_PROMPT` in `api/research.js`.
- Model: change `model` in `api/research.js` to any current Claude model string.
- Branding, colors, and copy: edit the CSS variables at the top of `index.html`.

## Note
Lumen answers from the model's training knowledge. It does not browse the web yet. Adding live web search is a good next step for time-sensitive questions.
