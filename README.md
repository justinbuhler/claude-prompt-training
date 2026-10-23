# Claude Prompt Training - The Prompt Lab

## What you need

| | |
|---|---|
| **Node.js** | Use `nvm install` and `nvm use` for the version in `.nvmrc`. |
| **pnpm 10.28.2** | The package manager pinned in `package.json`. |
| **An Anthropic API key** | console.anthropic.com → API Keys. This is a *developer* key, separate from a Claude.ai subscription — it's billed per use. |
| **A terminal** | Run the setup commands below. |

That's it. No database, no accounts, no build step during use.

## Setup

```bash
nvm install
nvm use
pnpm install --frozen-lockfile
cp .env.example .env       # then open .env and paste your key in
pnpm dev
```

Open http://localhost:5173. Progress saves in the browser and survives refreshes.

## Why there's a proxy

The version of this file that runs inside Claude's artifact sandbox calls
`api.anthropic.com` with no key — the sandbox adds auth invisibly. That doesn't
work anywhere else, and **you must not put your API key in browser code**, since
anyone who opens devtools can read it and spend your money.

So `vite.config.js` runs a tiny proxy: the browser calls `/anthropic/v1/messages`,
the dev server attaches your key, and forwards it. The key never reaches the browser.

`src/shim.js` fills the other sandbox gap by implementing `window.storage` on top
of `localStorage`, and rewrites the API URL so **`PromptLab.jsx` never has to be
edited**. Re-download a newer version of the course file, drop it in `src/`, done.

## Choosing a model

Set `VITE_CLAUDE_MODEL` in `.env`. The artifact hardcodes a model ID that's
specific to that sandbox and may not be a valid public API model — the shim
overrides it with whatever you set here. Current model IDs are listed at
https://docs.claude.com/en/docs/about-claude/models — worth checking, since my
information about which IDs are current may be out of date.

Any capable model works. The grading step is the one that benefits most from a
stronger model; a smaller one will grade more erratically.

## What it costs

Each mission attempt makes **3 API calls**: run the broken prompt, run the
student's prompt, grade the result. Decision missions make 2. A student
completing all 100 missions with no retries is roughly 290 calls, with short
prompts and capped 1000-token responses.

Before putting it in front of a class, run a few missions yourself and check
the usage dashboard, then multiply. Set a **spend limit** on the key in the
console — that's the safety net if something loops.

## Putting it in front of a class

`pnpm dev` is fine for one machine or a classroom on the same network
(add `--host` to expose it on your LAN: `pnpm dev --host`).

For anything wider, `pnpm build` produces a static `dist/` — but static
hosting alone won't work, because the proxy disappears with the dev server.
You'd need a small server (or a serverless function) doing the same job:
receive the request, attach the key, forward to Anthropic. Keep the key
server-side no matter what.

## Files

```
index.html            page shell
vite.config.js        dev server + authenticated API proxy
.env                  your key (gitignored — never commit it)
src/main.jsx          mounts the app
src/shim.js           window.storage + API routing (the sandbox stand-in)
src/PromptLab.jsx     the course itself — 100 missions, unmodified
```
