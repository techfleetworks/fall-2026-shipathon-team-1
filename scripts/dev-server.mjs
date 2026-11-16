/**
 * Lightweight dev server that serves public/ and routes POST /api/detect
 * to the Vercel function handler. No Vercel CLI login required.
 *
 * Usage: node scripts/dev-server.mjs
 * Reads .env if present (KEY=VALUE, no quotes needed).
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..", "public");
const PORT = process.env.PORT || 3000;

/* ---- load .env ---- */
const envPath = join(fileURLToPath(import.meta.url), "..", "..", ".env");
try {
  const text = await readFile(envPath, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch { /* no .env, that's fine */ }

/* ---- import the detect handler ---- */
const { default: detectHandler } = await import("../api/detect.js");

const MIME = {
  ".html": "text/html",
  ".js":   "application/javascript",
  ".css":  "text/css",
  ".json": "application/json",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
};

function serveStatic(filePath, res) {
  return readFile(filePath).then((buf) => {
    res.writeHead(200, { "content-type": MIME[extname(filePath)] || "application/octet-stream" });
    res.end(buf);
  });
}

const server = createServer(async (req, res) => {
  /* ---- API route ---- */
  if (req.url === "/api/detect") {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    let body;
    try { body = JSON.parse(Buffer.concat(chunks).toString()); } catch { body = {}; }

    const mockRes = {
      _status: 200,
      _body: null,
      status(code) { this._status = code; return this; },
      json(data) {
        this._body = data;
        res.writeHead(this._status, { "content-type": "application/json" });
        res.end(JSON.stringify(data));
        return this;
      },
    };
    try {
      await detectHandler({ method: req.method, headers: req.headers, body }, mockRes);
    } catch (e) {
      if (!res.headersSent) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "server_error" }));
      }
    }
    return;
  }

  /* ---- Static files ---- */
  let filePath = join(ROOT, req.url === "/" ? "index.html" : req.url);
  try {
    const s = await stat(filePath);
    if (s.isDirectory()) filePath = join(filePath, "index.html");
    await serveStatic(filePath, res);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => console.log(`Dev server: http://localhost:${PORT}`));
