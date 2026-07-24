// ai-proxy — Kimi(Moonshot)-Proxy für den Klinik-Bavaria-Demo-Prototyp.
// Hält KIMI_API_KEY serverseitig. Wegwerf-Demo-Infra, kein Produktionsanspruch.
const http = require("node:http");
const https = require("node:https");

const PORT = process.env.PORT || 3000;
const KEY = process.env.KIMI_API_KEY || "";
const SHARED = process.env.KI_SHARED_TOKEN || "kb-demo";
const MODEL = process.env.KIMI_MODEL || "kimi-k2-turbo-preview";
const VISION_MODEL = process.env.KIMI_VISION_MODEL || MODEL;
const ORIGINS = ["https://aluminiumminimum.github.io", "http://localhost:8765", "http://127.0.0.1:8765"];

// simples Rate-Limit: max 30 Requests / 5 min / IP
const hits = new Map();
function limited(ip) {
  const now = Date.now(), w = hits.get(ip) || [];
  const fresh = w.filter(t => now - t < 5 * 60 * 1000);
  fresh.push(now); hits.set(ip, fresh);
  return fresh.length > 30;
}

function cors(req, res) {
  const o = req.headers.origin || "";
  if (ORIGINS.includes(o)) res.setHeader("Access-Control-Allow-Origin", o);
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-KI-Token");
}

function send(res, code, obj) { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); }

function kimi(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const rq = https.request({
      hostname: "api.moonshot.ai", path: "/v1/chat/completions", method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + KEY, "Content-Length": Buffer.byteLength(body) },
      timeout: 45000
    }, r => { let d = ""; r.on("data", c => d += c); r.on("end", () => { try { resolve(JSON.parse(d)); } catch (e) { reject(new Error("bad upstream json: " + d.slice(0, 200))); } }); });
    rq.on("error", reject); rq.on("timeout", () => rq.destroy(new Error("upstream timeout")));
    rq.end(body);
  });
}

http.createServer(async (req, res) => {
  req.on("error", () => {});
  res.on("error", () => {});
  cors(req, res);
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  if (req.method === "GET" && req.url === "/health") return send(res, 200, { ok: true, model: MODEL });
  if (req.method !== "POST" || !(req.url === "/ai" || req.url === "/ai/vision")) return send(res, 404, { error: "not found" });
  if ((req.headers["x-ki-token"] || "") !== SHARED) return send(res, 401, { error: "token" });
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "?";
  if (limited(String(ip).split(",").pop().trim())) return send(res, 429, { error: "rate limit" });
  if (!KEY) return send(res, 503, { error: "no api key configured" });

  let raw = "", over = false;
  req.on("data", c => { raw += c; if (raw.length > 16e6 && !over) { over = true; send(res, 413, { error: "body too large" }); req.destroy(); } });
  req.on("end", async () => {
    if (over) return;
    try {
      const b = JSON.parse(raw || "{}");
      let payload;
      if (req.url === "/ai/vision") {
        payload = { model: VISION_MODEL, temperature: 0.2, messages: [{ role: "user", content: [
          { type: "image_url", image_url: { url: b.image } },
          { type: "text", text: b.prompt || "" } ] }] };
      } else {
        payload = { model: b.model || MODEL, temperature: b.temperature ?? 0.3, max_tokens: b.max_tokens || 1200, messages: b.messages || [] };
      }
      if (b.json) payload.response_format = { type: "json_object" };
      const out = await kimi(payload);
      const text = out?.choices?.[0]?.message?.content || "";
      if (!text) return send(res, 502, { error: "empty upstream", detail: out?.error?.message || "" });
      const resp = { text };
      if (b.json) { try { resp.data = JSON.parse(text.replace(/^```json?\s*|\s*```$/g, "")); } catch (e) { /* Client parst defensiv nach */ } }
      send(res, 200, resp);
    } catch (e) { send(res, 500, { error: String(e.message || e) }); }
  });
}).listen(PORT, () => console.log("ai-proxy on :" + PORT));
