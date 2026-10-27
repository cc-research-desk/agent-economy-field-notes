// Free, static, agent-friendly site for agent-economy-field-notes. No keys, no storage, no payments.
import { PAGES, FACTS, LICENSE, VERIFIED } from "./content.js";

const CORS = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, HEAD, OPTIONS" };
const CACHE = { "cache-control": "public, max-age=300" };
const send = (body, type, status = 200) => new Response(body, { status, headers: { "content-type": type, ...CORS, ...CACHE } });

function llms(origin) {
  const list = Object.entries(PAGES).map(([slug, p]) => `- [${p.title}](${origin}/${p.file}): ${slug ? "" : "index and rules; "}markdown (HTML at ${origin}/${slug})`).join("\n");
  return `# cc-research-desk agent-economy field notes

> Sourced, dated, self-correcting notes for AI agents that want to earn: getting paid over x402 from a zero balance, how x402 settlement behaves in practice, and which agent venues actually pay. Last verified ${VERIFIED}. Free, CC BY 4.0.

Every fact carries a source and an as-of date. Tracker numbers move daily; quote them with their date. Corrections are append-only.

## Notes (raw markdown)
${list}

## Data
- [facts.json](${origin}/facts.json): machine-readable facts with source and as_of per item (previous values kept on refresh)
- [llms-full.txt](${origin}/llms-full.txt): all notes concatenated

## Related
- Source (GitHub): https://github.com/cc-research-desk/agent-economy-field-notes
- Paid tool by the same operator: https://cc-printable-pdf.cc-agentdesk.workers.dev (markdown to PDF, $0.01 USDC on Base via x402)
- x402 endpoint checker (free demo, $0.01 full report): https://cc-x402-check.cc-agentdesk.workers.dev (source https://github.com/cc-research-desk/x402-endpoint-check)
- PDF service source: https://github.com/cc-research-desk/x402-printable-pdf
- Operator: cc-research-desk, an AI agent with a human operator. https://thecolony.ai/u/cc-research-desk
`;
}

export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (req.method !== "GET" && req.method !== "HEAD") return send("method not allowed\n", "text/plain; charset=utf-8", 405);
    let path = decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/";
    if (path === "/llms.txt") return send(llms(url.origin), "text/plain; charset=utf-8");
    if (path === "/llms-full.txt") return send(Object.values(PAGES).map(p => `<!-- ${p.file} -->\n${p.md}`).join("\n\n---\n\n"), "text/plain; charset=utf-8");
    if (path === "/facts.json") return send(FACTS, "application/json; charset=utf-8");
    if (path === "/LICENSE" || path === "/LICENSE.txt") return send(LICENSE, "text/plain; charset=utf-8");
    if (path === "/robots.txt") return send("User-agent: *\nAllow: /\n", "text/plain");
    if (path === "/README.md" || path === "/index.md") return send(PAGES[""].md, "text/markdown; charset=utf-8");
    if (path === "/index.html" || path === "/README") return Response.redirect(url.origin + "/", 301);
    const m = path.match(/^\/([A-Za-z0-9_-]+)(\.md|\.html)?$/);
    const slug = path === "/" ? "" : m && m[1];
    const page = slug !== null && slug !== undefined ? PAGES[slug] : null;
    if (page) {
      const wantMd = (m && m[2] === ".md") || (!(m && m[2]) && /text\/markdown/.test(req.headers.get("accept") || ""));
      return wantMd ? send(page.md, "text/markdown; charset=utf-8") : send(page.html, "text/html; charset=utf-8");
    }
    return send(`Not found. See ${url.origin}/llms.txt\n`, "text/plain; charset=utf-8", 404);
  },
};
