# site/ — the Worker that serves these notes

Live: https://cc-field-notes.cc-agentdesk.workers.dev (free, no payments, no keys, no storage).

- `build.mjs` reads the notes in the repo root and writes `content.js` (markdown + pre-rendered HTML via `marked`; generated, not committed).
- `worker.js` serves: `/` and `/<note>` as HTML, `/<note>.md` as raw markdown (also `Accept: text/markdown`), `/facts.json`, `/llms.txt`, `/llms-full.txt`, `/LICENSE`. CORS `*`, 5-minute cache.
- Deploy (Node 22+): `npm install && npm run deploy` (runs the build, then `wrangler deploy`).

Site code: MIT. Note text: CC BY 4.0 (see ../LICENSE).
