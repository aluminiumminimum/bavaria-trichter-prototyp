# KI-Integration (Kimi) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-optimized:subagent-driven-development (recommended) or superpowers-optimized:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Echte KI (Kimi via Proxy `ai.quintia.de`) in den Prototyp: Fundament + F1 Anfrage-Analyse → F3 Kurzbericht → F2 Scan→Falldaten → F4 Copilot.
**Architecture:** `index.html` (`.ki-*`, kein Key) → `fetch` → Node-Proxy auf Hostinger (`KIMI_API_KEY` als Env) → `api.moonshot.ai/v1`. Graceful Degradation + gescriptetes Pitch-Fallback pro Funktion; Human-in-the-loop (Übernehmen/Verwerfen). Spec: `docs/superpowers-optimized/specs/2026-07-23-ki-integration-design.md`.
**Tech Stack:** Vanilla JS inline (keine Dependencies im Client) · Node ≥18 ohne npm-Deps im Proxy (`node:http`) · Hostinger Node.js Web App · curl für Proxy-Tests.
**Assumptions:**
- `ai.quintia.de` lässt sich im User-hPanel als Node.js-Web-App mit TLS anlegen — geht das NICHT (z. B. Shared-Plan ohne Node), stoppt Welle 0 an T2 (USER-GATE) und alles Weitere läuft im Fallback-Modus weiter baubar.
- Kimi-Account hat Text-Modelle; Vision wird in T2 verifiziert — ohne Vision wird F2 (T6) übersprungen, Rest unberührt.
- Cofounder pusht parallel auf `main` — Branch `feat/ki`, vor jedem Push `git pull`; wird NICHT auf seinen Namespaces (`.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `openReferrer`, `#refOverlay`) gearbeitet.
- Zeilennummern = Stand **`f443785`** (Anker-Update 23.07. abends nach Cofounder-Runden 5+6, 80 Commits); **Anker immer per grep verifizieren**, nie blind per Zeile editieren.

**Anker-Update `f443785` (Runden 5+6 — was sich für diesen Plan geändert hat):**
- `#egDetail` hat jetzt ein **Triage-Modell** (`klassifiziereEingang()` auto/entscheidung/passiv, `egVollstaendigkeit()`-Checkliste, klickbares Sterne-Override-Widget `egtSterneHtml` mit **numerischem** `m.sterne`, **Gruppen**-Zuweisung `GRUPPEN=["Orthopädie","Neuro-Geri"]` + `egGruppe`/`egFreigeben()` statt Personen-Owner). `egOwner`/`egSetOwner`/`ownerVorschlag` **existieren nicht mehr** → T4 ist darauf umgeschrieben.
- Fall-Schublade `#ovDetail` **entfernt** — Fallakte ist Vollansicht `#view-fallakte`; `openDetail(id)` bleibt als Alias auf `openFallakte(id)`. `dArbeitHtml(f)` (Z.~6641) baut die Werkbank; Kosten-Zweig enthält `kzChain(f)+kzActions(f)` in `#dKZ` → T6-Anker.
- Overlay-Schließmechanik: `_closeSiblingDetailRails` iteriert `["dbDetail","egDetail"]` (Z.~4410); `_DETAIL_IDS=["dbDetail","rsDetail","egDetail"]` (Z.~7432) → T7 registriert `kiChat` an BEIDEN Stellen.
- Neue Cofounder-Heuristiken (deterministisch): `fallFakten()`, `egZusammenfassung()`, `m.zusammenfassung`-Seeds — F1 ersetzt sie NICHT, sondern liefert den KI-Vorschlag additiv daneben.

**Harte Regeln (HANDOVER §2, in jede Task-Spec kopieren):** additiv; eigener Namespace `.ki-*`; geteilte Daten (v. a. `inReha[]`) nur erweitern; CSS als kommentierter Block vor `</style>`; beide Breiten 390/1440 mit 0 Console-Errors + 0 Overflow; reduced-motion-safe; `STERNE`-Keys sind Strings `"1"`–`"5"`.

---

## Datei-Struktur

| Datei | Verantwortung |
|---|---|
| `ai-proxy/server.js` | kompletter Proxy (health, /ai, /ai/vision, CORS, Token, Rate-Limit) — dependency-frei |
| `ai-proxy/package.json` | Start-Script für Hostinger Node App |
| `ai-proxy/.env.example` + `ai-proxy/README.md` | Ops-Doku (hPanel-Schritte, Deploy, curl-Tests) — KEINE echten Secrets |
| `index.html` | 1 CSS-Block `/* KI · .ki-* */` vor `</style>` + 1 JS-Block `/* ===== KI (Kimi) ===== */` vor `</script>` + minimale 1-Zeilen-Hooks in `openEgDetail`/`renderMtProtokolle`/Fall-Drawer |

---

### Task 0: Branch + Spec/Plan committen

**Files:** Modify: — (nur git)

- [x] **Step 1:** `git checkout -b feat/ki` (Basis: aktueller `main` = `25b9783` oder neuer — vorher `git pull origin main`).
- [x] **Step 2:** Commit Spec + Plan:
```bash
git add docs/superpowers-optimized/specs/2026-07-23-ki-integration-design.md docs/superpowers-optimized/plans/2026-07-23-ki-integration.md
git commit -m "docs: Spec + Plan KI-Integration (Kimi via Proxy, F1-F4)"
```
- [x] **Step 3:** Verify: `git log --oneline -1` zeigt den docs-Commit; `git branch --show-current` = `feat/ki`.

---

### Task 1: Proxy-Code (`ai-proxy/`)

**Files:** Create: `ai-proxy/server.js`, `ai-proxy/package.json`, `ai-proxy/.env.example`, `ai-proxy/README.md`, `ai-proxy/.gitignore`

**Does NOT cover:** Deployment (T2). Kein npm-Paket — nur `node:http`/`node:https`, damit Hostinger ohne Build läuft.

- [x] **Step 1: server.js schreiben** — vollständiger Inhalt:

```js
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
  cors(req, res);
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  if (req.method === "GET" && req.url === "/health") return send(res, 200, { ok: true, model: MODEL });
  if (req.method !== "POST" || !(req.url === "/ai" || req.url === "/ai/vision")) return send(res, 404, { error: "not found" });
  if ((req.headers["x-ki-token"] || "") !== SHARED) return send(res, 401, { error: "token" });
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "?";
  if (limited(String(ip).split(",")[0])) return send(res, 429, { error: "rate limit" });
  if (!KEY) return send(res, 503, { error: "no api key configured" });

  let raw = ""; req.on("data", c => { raw += c; if (raw.length > 8e6) req.destroy(); });
  req.on("end", async () => {
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
```

- [x] **Step 2: package.json**:
```json
{ "name": "kb-ai-proxy", "private": true, "version": "1.0.0", "main": "server.js", "scripts": { "start": "node server.js" }, "engines": { "node": ">=18" } }
```
- [x] **Step 3: `.env.example`** (`KIMI_API_KEY=`, `KI_SHARED_TOKEN=`, `KIMI_MODEL=`, `KIMI_VISION_MODEL=`) + **`.gitignore`** (`.env`, `node_modules/`).
- [x] **Step 4: README.md** — Ops-Runbook: (a) hPanel: Node.js-Web-App für Subdomain `ai.quintia.de` anlegen, Startdatei `server.js`, Env-Vars aus `.env.example` setzen; (b) Deploy per SSH/git aus diesem Repo-Ordner; (c) Smoke-Tests (curl-Zeilen aus T2); (d) Hinweis Spend-Cap im Kimi-Konto setzen. Keine Secrets ins Repo.
- [x] **Step 5: Lokaler Smoke** (ohne Key — health muss trotzdem gehen):
```bash
node ai-proxy/server.js & sleep 1
curl -s localhost:3000/health            # → {"ok":true,...}
curl -s -X POST localhost:3000/ai -H 'Content-Type: application/json' -H 'X-KI-Token: kb-demo' -d '{"messages":[]}'   # → {"error":"no api key configured"} (503)
kill %1
```
Expected: beide Antworten wie kommentiert; Prozess sauber beendet.
- [x] **Step 6: Commit** `git add ai-proxy && git commit -m "feat(ai-proxy): Kimi-Proxy — /health, /ai, /ai/vision, CORS+Token+Rate-Limit"`.

---

### Task 2: Proxy-Deploy + Verify-Gates ⚠ USER-GATE

**Files:** — (Ops; ggf. Modify `ai-proxy/README.md` mit verifizierten Modell-IDs)

**Does NOT cover:** Client-Code. Ohne abgeschlossenes T2 laufen T3–T8 trotzdem — alles degradiert auf „KI offline"/Fallback.

- [ ] **Step 1 (USER):** hPanel — Node.js-Web-App auf `ai.quintia.de` anlegen; `KIMI_API_KEY` + `KI_SHARED_TOKEN` (frei gewählter Wert) als Env setzen. *(Claude fragt aktiv nach, wenn unklar ist, ob quintia.de am selben Hostinger-Account hängt / welcher SSH-Zugang gilt.)*
- [ ] **Step 2:** Code auf den Server bringen (SSH; Weg gemäß hPanel-Vorgabe — git clone des Repos ODER scp von `ai-proxy/`), App starten.
- [ ] **Step 3: Verify-Gate HTTPS:** `curl -s https://ai.quintia.de/health` → `{"ok":true,...}` über TLS.
- [ ] **Step 4: Verify-Gate Modelle (auf dem Server, Key bleibt dort):**
```bash
curl -s https://api.moonshot.ai/v1/models -H "Authorization: Bearer $KIMI_API_KEY" | head -c 2000
```
Expected: Modell-Liste; Text-Modell-ID notieren; prüfen ob ein Vision-fähiges Modell dabei ist → `KIMI_MODEL`/`KIMI_VISION_MODEL` Env entsprechend setzen. **Kein Vision-Modell → T6 (F2) wird übersprungen** (im Plan abhaken als „entfällt", Spec-§11-Gate).
- [ ] **Step 5: Verify-Gate End-to-End:**
```bash
curl -s -X POST https://ai.quintia.de/ai -H 'Content-Type: application/json' -H "X-KI-Token: <token>" -d '{"messages":[{"role":"user","content":"Antworte nur: OK"}]}'
```
Expected: `{"text":"OK"...}`. Danach CORS-Preflight: `curl -s -i -X OPTIONS https://ai.quintia.de/ai -H 'Origin: https://aluminiumminimum.github.io' -H 'Access-Control-Request-Method: POST'` → 204 mit `Access-Control-Allow-Origin`-Echo.
- [ ] **Step 6:** Verifizierte Modell-IDs in `ai-proxy/README.md` nachtragen; Commit `docs(ai-proxy): verifizierte Modell-IDs + Deploy-Protokoll`.

---

### Task 3: Client-Fundament `.ki-*` in `index.html`

**Files:** Modify: `index.html` (CSS-Block vor `</style>` ~Z.3100; JS-Block vor `</script>` ~Z.6817)

**Does NOT cover:** Feature-Buttons (T4–T7). Kein Aufruf-Ort außer dem Health-Ping.

- [x] **Step 1: CSS-Block** vor `</style>` (Anker: `grep -n '</style>'`):
```css
/* ===== KI (Kimi) · .ki-* — additiv, Jade-Etikett-Optik ===== */
.ki-panel{position:relative;background:var(--paper);border:1px solid var(--jade-line);border-radius:4px;padding:12px 14px;margin-top:10px}
.ki-panel::before{content:"";position:absolute;inset:3px;border:1px solid var(--gold-faint);border-radius:2px;pointer-events:none}
.ki-kicker{font-family:"Fragment Mono",monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--brass-deep);display:flex;align-items:center;gap:6px;margin-bottom:8px}
.ki-kicker .dot{width:7px;height:7px;border-radius:50%;background:var(--sage-deep)}
.ki-panel.ki-off .dot{background:var(--faint)}
.ki-body{font-size:13.5px;color:var(--ink);white-space:pre-wrap}
.ki-fields{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:13px;margin:6px 0}
.ki-fields b{font-family:"Fragment Mono",monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:500;align-self:center}
.ki-cta{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.ki-note{font-size:11.5px;color:var(--muted);margin-top:8px}
.ki-spin{display:inline-block;width:12px;height:12px;border:2px solid var(--brass-line);border-top-color:var(--sage-deep);border-radius:50%;animation:kiSpin .8s linear infinite}
@keyframes kiSpin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion: reduce){.ki-spin{animation:none;border-top-color:var(--brass-line)}}
```
*(Hinweis: `kiSpin` ist funktionaler Lade-Indikator, RM-Block deckt ihn ab — Endzustand statischer Ring, korrekt.)*
- [x] **Step 2: JS-Block** vor `</script>`:
```js
/* ===== KI (Kimi via Proxy ai.quintia.de) — Fundament =====
   Kein Key im Client. Degradiert graceful: Proxy weg → "KI offline" bzw. Pitch-Fallback. */
const KI_CONFIG={endpoint:"https://ai.quintia.de",token:"kb-demo"};
let KI_ONLINE=null; /* null=ungeprüft, true/false nach Health-Ping */
async function kiFetch(path,body,timeoutMs){
 const c=new AbortController();const t=setTimeout(()=>c.abort(),timeoutMs||20000);
 try{
  const r=await fetch(KI_CONFIG.endpoint+path,{method:"POST",signal:c.signal,
   headers:{"Content-Type":"application/json","X-KI-Token":KI_CONFIG.token},body:JSON.stringify(body)});
  if(!r.ok)throw new Error("HTTP "+r.status);
  return await r.json();
 }finally{clearTimeout(t);}
}
async function kiComplete(messages,opts){opts=opts||{};
 const out=await kiFetch("/ai",{messages:messages,json:!!opts.json,model:opts.model,max_tokens:opts.max_tokens},opts.timeoutMs);
 if(opts.json&&!out.data){ /* defensiver Zweit-Parse */
  try{out.data=JSON.parse(String(out.text||"").replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/,"$1"));}catch(e){}
  if(!out.data)throw new Error("KI-Antwort nicht als JSON lesbar");
 }
 return out;
}
async function kiVision(image,prompt,opts){opts=opts||{};
 const out=await kiFetch("/ai/vision",{image:image,prompt:prompt,json:!!opts.json},opts.timeoutMs||40000);
 if(opts.json&&!out.data){try{out.data=JSON.parse(String(out.text||"").replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/,"$1"));}catch(e){}
  if(!out.data)throw new Error("KI-Antwort nicht als JSON lesbar");}
 return out;
}
(function kiHealth(){ /* einmaliger Ping; Fehler sind erwartbar und leise */
 try{fetch(KI_CONFIG.endpoint+"/health",{method:"GET"}).then(r=>{KI_ONLINE=r.ok;}).catch(()=>{KI_ONLINE=false;});}
 catch(e){KI_ONLINE=false;}
})();
/* Pitch-Fallbacks: pro Funktion ein plausibles gescriptetes Ergebnis (Spec §4). */
const KI_FALLBACK={
 analyse:{achse:"Orthopädie",gruppe:"Orthopädie",kt:"PKV",diagnose:"Z. n. Hüft-TEP rechts",dringlichkeit:"hoch",
  sterne:5,sterneGrund:"Privat versichert, konkreter OP-Termin, Angehörige aktiv eingebunden",
  hinweis:"Rückruf priorisieren — OP-Termin steht, Komfortzimmer-Wunsch ansprechen."},
 kurzbericht:{kurzbericht:"Patientin macht gute Fortschritte: Barthel-Index von 45 auf 70 gestiegen, FIM deutlich verbessert. Schmerzen unter Belastung rückläufig, Gehstrecke am Rollator auf 200 m gesteigert. Motivation hoch, Teilnahme an allen Therapieeinheiten.",
  verlaufPlan:"Belastung schrittweise steigern, Treppentraining ab kommender Woche. Entlassung zum geplanten Termin realistisch; ambulante Anschlussversorgung einleiten."},
 vision:{versicherung:"Allianz Private Krankenversicherung",kostentraeger:"PKV",
  diagnose:"M16.1 Coxarthrose, Z. n. Hüft-TEP",leistung:"Stationäre Anschlussheilbehandlung, 21 Tage",gueltigBis:"31.10.2026"},
 chat:"(Demo-Fallback) Aktuell 3 offene PKV-Fälle: L. Bauer (Unterlagen), S. Meier-Benecke (Kostenzusage angefragt), T. Eggers (Wiedervorlage). Empfehlung: Eggers heute nachfassen — Frist läuft."
};
/* UI-Bausteine */
function kiSpinnerHtml(label){return "<div class='ki-kicker'><span class='ki-spin'></span>"+escapeHtml(label||"KI arbeitet …")+"</div>";}
function kiHeadHtml(off){return "<div class='ki-kicker"+(off?" ki-off":"")+"'><span class='dot'></span>KI"+(off?" · offline (Demo-Fallback)":" · Kimi")+"</div>";}
/* Generischer Runner: rendert Spinner in Container, ruft fn(), rendert via render(result, offline) */
async function kiRun(containerId,fn,fallback,render){
 const el=document.getElementById(containerId);if(!el)return;
 el.innerHTML="<div class='ki-panel'>"+kiSpinnerHtml()+"</div>";
 let data=null,off=false;
 try{data=await fn();}catch(e){console.warn("KI-Fallback:",e.message);data=fallback;off=true;}
 el.innerHTML="<div class='ki-panel"+(off?" ki-off":"")+"'>"+kiHeadHtml(off)+render(data,off)+"</div>";
}
```
- [x] **Step 3: Syntax-Gate:** Script-Block extrahieren und parsen:
```bash
node -e 'const s=require("fs").readFileSync("index.html","utf8");const m=[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)];new (require("vm").Script)(m[m.length-1][1]);console.log("JS OK")'
```
Expected: `JS OK`.
- [x] **Step 4: Browser-Gate:** Preview `bavaria-proto` @1440 + @390 — 0 Console-Errors (der Health-Ping darf im Netz-Tab fehlschlagen, aber KEIN uncaught error), App rendert unverändert, Cofounder-Checks (Matrix 6 Zellen, `openReferrer('portal','Leopoldina-Krankenhaus')`, `rsp`-Charts) intakt.
- [x] **Step 5: Commit** `feat(ki): Fundament — kiComplete/kiVision, Health-Ping, Fallback-Registry, .ki-Panel-UI`.

---

### Task 4: F1 — Anfrage → Felder + Sterne (im `#egDetail`)

**Files:** Modify: `index.html` (Hook in `openEgDetail` ~Z.4394 + neue Funktionen im KI-Block)

**Does NOT cover:** Passiv-Zweig (`m.typ==="passiv"`), bereits verteilte (`m.gruppe`) und erledigte (`m.done`) Anfragen — nur der Entscheidungs-Zweig (die `else`-Kaskade mit Checkliste+Gruppen). Das **Freigeben bleibt beim Menschen** (`egFreigeben` unangetastet).

- [x] **Step 1: Hook (1 Einfügung).** In `openEgDetail` (Anker: `grep -n "function openEgDetail" index.html`, Z.~4462), im letzten `else`-Zweig die `actions`-Zuweisung **vorn** ergänzen — vor der `egVollstaendigkeit`-Checkliste:
```js
actions="<button type='button' class='btn-ghost' style='width:100%' onclick='kiAnalyse("+m.id+")'>✦ KI: Anfrage analysieren</button><div id='kiPanelEg'></div>"
 +"<div class='egt-check'>"+check.map(function(c){ /* … bestehender Code unverändert weiter … */
```
*(Konkret: das String-Literal `"<div class='egt-check'>"` um das vorangestellte Button+Container-Fragment erweitern — 1 zusammenhängende Einfügung, kein Umbau.)*
- [x] **Step 2: `kiAnalyse` im KI-Block** ergänzen (angepasst an Triage-Modell: numerische Sterne, Gruppen, Hinweis-Feld):
```js
function kiAnalyse(id){
 const m=eingang.find(x=>x.id===id);if(!m)return;
 kiRun("kiPanelEg",async()=>{
  const out=await kiComplete([
   {role:"system",content:"Du bist Triage-Assistent einer Premium-Reha-Klinik (Achsen: Orthopädie, Neurologie, Geriatrie, Innere, SalutoCare; Belegungs-Gruppen: Orthopädie, Neuro-Geri). Antworte NUR mit einem JSON-Objekt: {achse, gruppe (Orthopädie|Neuro-Geri), kt (PKV|Selbstzahler|Beihilfe|GKV + Komfort|GKV), diagnose, dringlichkeit (hoch|mittel|niedrig), sterne (1-5 als Zahl; 5=PKV+konkret+dringend), sterneGrund, hinweis (1 Satz Bearbeitungshinweis)}. Keine erfundenen Fakten — fehlt etwas, lass das Feld leer."},
   {role:"user",content:"Kanal: "+m.kanal+"\nBetreff: "+(m.tit||"")+"\nText: "+(m.txt||"")+(m.originalTxt?"\nOriginal:\n"+m.originalTxt:"")}
  ],{json:true});
  return out.data;
 },KI_FALLBACK.analyse,(d,off)=>{
  m.kiVorschlag=d;
  return "<div class='ki-fields'>"
   +"<b>Achse</b><span>"+escapeHtml(d.achse||"—")+"</span>"
   +"<b>Gruppe</b><span>"+escapeHtml(d.gruppe||"—")+"</span>"
   +"<b>Kostenträger</b><span>"+escapeHtml(d.kt||"—")+"</span>"
   +"<b>Diagnose</b><span>"+escapeHtml(d.diagnose||"—")+"</span>"
   +"<b>Dringlichkeit</b><span>"+escapeHtml(d.dringlichkeit||"—")+"</span>"
   +"<b>Einstufung</b><span>"+sterneHtml(parseInt(d.sterne||3,10))+" — "+escapeHtml(d.sterneGrund||"")+"</span>"
   +"</div><div class='ki-cta'>"
   +"<button class='btn-brass btn-sm' onclick='kiAnalyseUebernehmen("+m.id+")'>Übernehmen</button>"
   +"<button class='btn-ghost btn-sm' onclick='document.getElementById(\"kiPanelEg\").innerHTML=\"\"'>Verwerfen</button>"
   +"</div><div class='ki-note'>KI schlägt vor — Übernahme füllt Sterne, Gruppe und Hinweis; freigeben tust weiterhin du.</div>";
 });
}
function kiAnalyseUebernehmen(id){
 const m=eingang.find(x=>x.id===id),d=m&&m.kiVorschlag;if(!d)return;
 if(d.achse)m.achse=d.achse;                                   /* bestehende Felder, neue Werte */
 if(d.sterne)m.sterne=parseInt(d.sterne,10);                   /* numerisches Override-Feld (egtSterneHtml) */
 if(d.gruppe&&GRUPPEN.includes(d.gruppe))egGruppe=d.gruppe;    /* Gruppen-Button vorwählen */
 if(d.hinweis&&!m.hinweis)m.hinweis=d.hinweis+(d.sterneGrund?" ("+d.sterneGrund+")":"");
 rpToast("KI-Vorschlag übernommen — "+(m.sterne||"?")+"★, Gruppe "+(egGruppe||"?"));
 openEgDetail(id); /* Re-Render zeigt Sterne-Widget, vorgewählte Gruppe + Hinweis */
}
```
- [x] **Step 3: Syntax-Gate** (Befehl aus T3 Step 3) → `JS OK`.
- [x] **Step 4: Browser-Gate** @1440+@390: `go('faelle','anfragen')` → Anfrage öffnen → „KI: analysieren" → (a) MIT laufendem Proxy: echtes Ergebnis; (b) OHNE (Proxy-Endpoint temporär auf `https://invalid.local` biegen ODER offline): Fallback-Panel mit „offline (Demo-Fallback)". Beidesmal: Übernehmen setzt Sterne-Widget (numerisch), wählt Gruppe vor, füllt Hinweis-Feld + Toast — Freigeben bleibt manuell; 0 Console-Errors; Cofounder-Checks.
- [x] **Step 5: Commit** `feat(ki): F1 — Anfrage-Analyse im egDetail (Felder+Sterne+Übernehmen)`. **→ Welle vorzeigbar.**

---

### Task 5: F3 — Kurzbericht-Generator (Protokoll-Board)

**Files:** Modify: `index.html` (Hook in `renderMtProtokolle` ~Z.6499 + Funktion im KI-Block)

**Does NOT cover:** Direktes Schreiben in `p.kurzbericht` — der KI-Text landet in den **Textareas**; speichern tut weiterhin der Mensch über den bestehenden `rsSaveZwischenstand(i)`-Button (Human-in-the-loop, geteiltes `inReha[]` bleibt unberührt bis zum bewussten Save).

- [x] **Step 1: Hook.** In `renderMtProtokolle()` (Anker: `grep -n "renderMtProtokolle" index.html`), direkt VOR `"<label class='mtp-lbl'>Kurzbericht</label>"` einfügen:
```js
+"<button type='button' class='btn-ghost btn-sm' onclick='kiKurzbericht("+i+")'>✦ KI: Kurzbericht entwerfen</button><div id='kiPanelMtp"+i+"'></div>"
```
- [x] **Step 2: `kiKurzbericht` im KI-Block:**
```js
function kiKurzbericht(i){
 const p=inReha[i];if(!p)return;
 kiRun("kiPanelMtp"+i,async()=>{
  const notizen=(p.eintraege||[]).map(e=>e.d+": "+e.txt).join("\n");
  const out=await kiComplete([
   {role:"system",content:"Du bist Case-Manager-Assistent einer Reha-Klinik. Erzeuge aus Verlaufsdaten einen Wochen-Kurzbericht. Antworte NUR mit JSON: {kurzbericht (3-4 Sätze, sachlich, deutsch), verlaufPlan (2-3 Sätze: nächste Schritte)}. Nur Fakten aus den Daten."},
   {role:"user",content:"Patient: "+p.name+", Achse "+p.achse+", ICD "+(p.icd||"?")+", Tag "+p.verweildauer.ist+"/"+p.verweildauer.plan
    +"\nBarthel: Aufnahme "+p.barthel.auf+" → aktuell "+p.barthel.akt+"\nFIM: Aufnahme "+p.fim.auf+" → aktuell "+p.fim.akt
    +"\nZiel: "+(p.ziel||"?")+"\nTagesnotizen:\n"+notizen}
  ],{json:true});
  return out.data;
 },KI_FALLBACK.kurzbericht,(d,off)=>{
  return "<div class='ki-body'><b>Kurzbericht:</b>\n"+escapeHtml(d.kurzbericht||"")+"\n\n<b>Weiterer Verlauf:</b>\n"+escapeHtml(d.verlaufPlan||"")+"</div>"
   +"<div class='ki-cta'><button class='btn-brass btn-sm' onclick='kiKurzberichtUebernehmen("+i+")'>In Felder übernehmen</button>"
   +"<button class='btn-ghost btn-sm' onclick='document.getElementById(\"kiPanelMtp"+i+"\").innerHTML=\"\"'>Verwerfen</button></div>"
   +"<div class='ki-note'>Übernahme füllt die Textfelder — gespeichert wird erst über „Speichern".</div>";
 });
}
function kiKurzberichtUebernehmen(i){
 const p=inReha[i];if(!p||!p._kiKb){/* Ergebnis aus dem Panel lesen */}
 /* Einfachster robuster Weg: Ergebnis beim Render zwischenspeichern */
}
```
**Präzisierung (statt Platzhalter):** `kiRun`-Render-Callback speichert das Ergebnis vor dem Return: `inReha[i]._kiKb=d;` (Unterstrich-Feld = flüchtig, additiv, wird nie umbenannt/gespeichert). `kiKurzberichtUebernehmen` wird damit:
```js
function kiKurzberichtUebernehmen(i){
 const p=inReha[i],d=p&&p._kiKb;if(!d)return;
 const kb=document.getElementById("mtpKb"+i),vp=document.getElementById("mtpVp"+i);
 if(kb&&d.kurzbericht)kb.value=d.kurzbericht;
 if(vp&&d.verlaufPlan)vp.value=d.verlaufPlan;
 rpToast("KI-Entwurf in die Felder übernommen — bitte prüfen und speichern.");
}
```
- [x] **Step 3: Syntax-Gate** → `JS OK`.
- [x] **Step 4: Browser-Gate** @1440+@390: Rollen-Schalter → `ma-mode` → Reiter „Protokolle" → Button je Zeile → Live + Fallback-Pfad; Übernehmen füllt beide Textareas, „Speichern" schreibt wie bisher (`p.kurzbericht` → Leitungs-Overlay `#rsErfolg` + `.rp-kurz` im Zuweiserportal zeigen den Text); 0 Console-Errors; Cofounder-Checks (v. a. `.rp-kurz` liest unverändert!).
- [x] **Step 5: Commit** `feat(ki): F3 — Kurzbericht-Generator im Protokoll-Board (Entwurf in Felder, Save bleibt manuell)`. **→ Welle vorzeigbar.**

---

### Task 6: F2 — Scan/Foto → Falldaten (Vision) — *entfällt, falls T2-Gate „kein Vision-Modell"*

**Files:** Modify: `index.html` (Hook im Fall-Drawer-Werkzeug „Kostenklärung"/`kzChain`-Umfeld + Funktionen im KI-Block)

**Does NOT cover:** Cofounder-`rpUpload` (Portal, tabu). Kein echter Dokument-Speicher — das Bild lebt nur im Moment der Analyse.

- [x] **Step 1: Anker:** `dArbeitHtml(f)` (Anker: `grep -n "function dArbeitHtml" index.html`, Z.~6641) — im **kosten**-Zweig (`return fakten+"<div id='dKZ' class='kz-block'>…kzChain(f)+kzActions(f)+"</div>"`) direkt NACH `kzActions(f)` und VOR dem schließenden `</div>` additiv anhängen. Hinweis: Die Fallakte ist seit R5 eine **Vollansicht** (`#view-fallakte`); `openDetail(id)` ist Alias auf `openFallakte(id)` — der Re-Render-Aufruf im Code unten funktioniert unverändert:
```js
+"<div class='ki-scan'><label class='btn-ghost btn-sm' style='display:inline-block;cursor:pointer'>✦ KI: Dokument scannen<input type='file' accept='image/*' style='display:none' onchange='kiScan(event,"+f.id+")'></label><div id='kiPanelScan'></div></div>"
```
- [x] **Step 2: `kiScan` + Übernahme im KI-Block:**
```js
function kiScan(ev,fallId){
 const file=ev.target.files&&ev.target.files[0];if(!file)return;
 const rd=new FileReader();
 rd.onload=function(){
  const dataUrl=rd.result;
  kiRun("kiPanelScan",async()=>{
   const out=await kiVision(dataUrl,
    "Dies ist ein Dokument aus dem Klinik-Alltag (z. B. Bewilligungsbescheid, Arztbrief, Fax). Extrahiere als JSON: {versicherung, kostentraeger (PKV|Selbstzahler|Beihilfe|GKV + Komfort|GKV), diagnose, leistung, gueltigBis}. Nur was wirklich im Dokument steht — fehlende Felder leer lassen.",
    {json:true});
   return out.data;
  },KI_FALLBACK.vision,(d,off)=>{
   const f=faelle.find(x=>x.id===fallId);if(f)f._kiScan=d;
   return "<div class='ki-fields'>"
    +"<b>Versicherung</b><span>"+escapeHtml(d.versicherung||"—")+"</span>"
    +"<b>Kostenträger</b><span>"+escapeHtml(d.kostentraeger||"—")+"</span>"
    +"<b>Diagnose</b><span>"+escapeHtml(d.diagnose||"—")+"</span>"
    +"<b>Leistung</b><span>"+escapeHtml(d.leistung||"—")+"</span>"
    +"<b>Gültig bis</b><span>"+escapeHtml(d.gueltigBis||"—")+"</span></div>"
    +"<div class='ki-cta'><button class='btn-brass btn-sm' onclick='kiScanUebernehmen("+fallId+")'>Übernehmen</button>"
    +"<button class='btn-ghost btn-sm' onclick='document.getElementById(\"kiPanelScan\").innerHTML=\"\"'>Verwerfen</button></div>"
    +"<div class='ki-note'>Setzt Kostenträger im Fall und vermerkt den Extrakt im Verlauf.</div>";
  });
 };
 rd.readAsDataURL(file);
}
function kiScanUebernehmen(fallId){
 const f=faelle.find(x=>x.id===fallId),d=f&&f._kiScan;if(!d)return;
 if(d.kostentraeger){f.kt=d.kostentraeger;const sel=document.getElementById("dKT");if(sel)sel.value=d.kostentraeger;}
 f.log=f.log||[];f.log.push([dstr(0),"KI-Scan: "+[d.versicherung,d.diagnose,d.leistung].filter(Boolean).join(" · ")]);
 rpToast("Dokument-Daten übernommen — Kostenträger "+(f.kt||"?"));
 openDetail(fallId); /* Drawer re-rendern */
}
```
- [x] **Step 3: Demo-Asset:** ein synthetisches Bewilligungs-Demo-Bild (selbst generiert/gerendert, KEIN echtes Dokument) unter `assets/demo-bewilligung.png` ablegen fürs Vorführen.
- [x] **Step 4: Syntax-Gate** → `JS OK`; **Browser-Gate** @1440+@390: Fall mit Aufgabentyp Kostenklärung öffnen → Scan mit Demo-Asset (live) + Fallback-Pfad; Übernehmen setzt `f.kt`+`#dKT`+Log-Eintrag; 0 Console-Errors; Cofounder-Checks.
- [x] **Step 5: Commit** `feat(ki): F2 — Dokument-Scan (Vision) im Kostenklärungs-Werkzeug`. **→ Welle vorzeigbar.**

---

### Task 7: F4 — KI-Copilot (Chat-Overlay)

**Files:** Modify: `index.html` (Overlay-Markup vor `#egDetail`-Nachbarschaft, Öffner in Sidebar + FAB, Funktionen + CSS im KI-Block)

**Does NOT cover:** Schreibende Aktionen aus dem Chat (nur Antworten/Entwürfe als Text). Kein Verlauf über Reload hinaus.

- [x] **Step 1: CSS ergänzen** (im `.ki-*`-Block):
```css
.ki-fab{position:fixed;right:18px;bottom:84px;z-index:60;width:48px;height:48px;border-radius:50%;background:var(--espresso-grad);color:var(--ivory-tx);border:1px solid var(--jade-line);box-shadow:var(--shadow);font-size:20px;cursor:pointer}
@media (min-width:1024px){.ki-fab{bottom:24px}}
#kiChat{align-items:stretch;justify-content:flex-end}
#kiChat .modal{width:420px;max-width:92vw;height:100dvh;max-height:100dvh;border-radius:0;display:flex;flex-direction:column}
.ki-log{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
.ki-msg{max-width:88%;padding:9px 12px;border-radius:4px;font-size:13.5px;white-space:pre-wrap}
.ki-msg.user{align-self:flex-end;background:var(--sage-soft);border:1px solid var(--jade-hair)}
.ki-msg.ai{align-self:flex-start;background:var(--paper);border:1px solid var(--hair)}
.ki-inrow{display:flex;gap:8px;padding:12px;border-top:1px solid var(--hair)}
.ki-inrow input{flex:1;font:inherit;padding:10px 12px;border:1px solid var(--hair);border-radius:8px;background:var(--paper2);color:var(--ink)}
```
- [x] **Step 2: Markup** — direkt nach dem `#egDetail`-Div (Anker: `grep -n 'id="egDetail"'`):
```html
<div class="overlay" id="kiChat" role="dialog" aria-modal="true" aria-label="KI-Copilot">
  <div class="modal">
    <div class="mhead"><div class="ava" style="background:var(--espresso-grad);color:var(--ivory-tx)">✦</div><div><h2>KI-Copilot</h2><div class="msub2" id="kiChatSub">Fragen zu Fällen, Zuweisern, Belegung</div></div></div>
    <div class="ki-log" id="kiLog"></div>
    <div class="ki-inrow"><input id="kiInput" placeholder="z. B. Fasse offene PKV-Fälle zusammen" onkeydown="if(event.key==='Enter')kiChatSend()"><button class="btn-brass btn-sm" onclick="kiChatSend()">Senden</button></div>
    <div class="mfoot"><button class="btn-ghost" onclick="dismissDetail()">‹ Zurück</button></div>
  </div>
</div>
<button class="ki-fab" onclick="kiChatOpen()" aria-label="KI-Copilot öffnen">✦</button>
```
- [x] **Step 3: Registrierung + Logik im KI-Block:**
```js
/* kiChat an die bestehende Detail-Mechanik hängen (Anker: _closeSiblingDetailRails / _rawCloseDetails):
   1-Zeilen-Erweiterung dort, wo ["ovDetail","dbDetail","egDetail"] iteriert wird → "kiChat" ergänzen.
   Gleiches im _rawCloseDetails-Pendant (grep '_eg=document.getElementById("egDetail")' → kiChat analog schließen). */
let _kiChatHist=[];
function kiSnapshot(){
 const of=faelle.filter(f=>f.status!=="Aufgenommen"&&f.status!=="Verloren");
 return "OFFENE FÄLLE:\n"+of.map(f=>"- "+f.name+" ("+f.achse+", "+f.kt+", Status "+f.status+", Aufgabe: "+(f.aufgabe||"—")+", Owner "+f.owner+")").join("\n")
  +"\n\nEINGANG (offen):\n"+eingang.filter(m=>!m.done).map(m=>"- "+(m.tit||m.kanal)+" ["+m.kanal+"]").join("\n")
  +"\n\nIN REHA:\n"+inReha.map(p=>"- "+p.name+" ("+p.achse+", Tag "+p.verweildauer.ist+"/"+p.verweildauer.plan+", Barthel "+p.barthel.akt+")").join("\n")
  +"\n\nTOP-ZUWEISER:\n"+zuweiser.slice(0,6).map(z=>"- "+z.name+" ("+z.faelle+" Fälle, letzter Kontakt "+(z.letzter||"?")+")").join("\n");
}
function kiChatOpen(){
 _closeSiblingDetailRails&&_closeSiblingDetailRails("kiChat");
 document.getElementById("kiChat").classList.add("open");
 document.body.classList.add("detail-open");
 if(!matchMedia("(min-width:1024px)").matches)document.body.classList.add("locked");
 pushDetailState();
 if(!_kiChatHist.length)kiChatAppend("ai","Guten Tag! Ich kenne den aktuellen Demo-Datenstand — fragen Sie mich z. B. nach offenen PKV-Fällen, stockenden Vorgängen oder einem Antwort-Entwurf.");
}
function kiChatAppend(who,txt){
 _kiChatHist.push({who:who,txt:txt});
 const el=document.getElementById("kiLog");
 el.innerHTML=_kiChatHist.map(m=>"<div class='ki-msg "+m.who+"'>"+escapeHtml(m.txt)+"</div>").join("");
 el.scrollTop=el.scrollHeight;
}
async function kiChatSend(){
 const inp=document.getElementById("kiInput"),q=(inp.value||"").trim();if(!q)return;
 inp.value="";kiChatAppend("user",q);kiChatAppend("ai","…");
 let antwort;
 try{
  const out=await kiComplete([
   {role:"system",content:"Du bist der Copilot eines Klinik-CRM (Demo, synthetische Daten). Antworte knapp, deutsch, konkret; nur auf Basis des Datenstands. Entwürfe (Mails etc.) direkt ausformulieren.\n\nDATENSTAND:\n"+kiSnapshot()},
   ..._kiChatHist.filter(m=>m.txt!=="…").slice(-8).map(m=>({role:m.who==="user"?"user":"assistant",content:m.txt}))
  ]);
  antwort=out.text||"(keine Antwort)";
 }catch(e){console.warn("KI-Fallback:",e.message);antwort=KI_FALLBACK.chat;}
 _kiChatHist.pop();kiChatAppend("ai",antwort);
}
```
- [x] **Step 4: 2 Arrayeinträge setzen:** (a) `_closeSiblingDetailRails` (Anker: `grep -n '\["dbDetail","egDetail"\]'`, Z.~4410): Array zu `["dbDetail","egDetail","kiChat"]`; (b) `_DETAIL_IDS` (Anker: `grep -n '_DETAIL_IDS='`, Z.~7432): zu `["dbDetail","rsDetail","egDetail","kiChat"]` — damit schließen Escape/Zurück/popstate den Chat wie die anderen Rails. Grep-verifizieren, sonst nichts anfassen.
- [x] **Step 5: Syntax-Gate** → `JS OK`; **Browser-Gate** @1440+@390: FAB sichtbar (kollidiert nicht mit Tabbar @390 — `bottom:84px`), Chat auf/zu via Button/Escape/Zurück (History-Mechanik!), Frage live + Fallback; 0 Console-Errors; Cofounder-Checks.
- [x] **Step 6: Commit** `feat(ki): F4 — KI-Copilot-Overlay mit Daten-Snapshot`. **→ Welle vorzeigbar.**

---

### Task 8: Abschluss — Doku, Merge, Deploy

**Files:** Modify: `CLAUDE.md`, `HANDOVER.md`, `session-log.md`

- [ ] **Step 1: CLAUDE.md** — im Konventionen-Block Namespace-Liste um `.ki-*` (KI/Kimi) ergänzen + 1 Satz unter „Harte Regeln": KI läuft über Proxy `ai.quintia.de`, Key nie im Repo, Fallback-Pflicht.
- [ ] **Step 2: HANDOVER.md** — §3-Tabelle um Zeile „KI | kiComplete/kiVision/kiRun, kiAnalyse/kiKurzbericht/kiScan/kiChat* | `.ki-*` | eingang/faelle/inReha (additiv: `kiVorschlag`,`_kiKb`,`_kiScan`)" + §4-Absatz „4d KI-Integration" (3 Sätze) ergänzen.
- [ ] **Step 3: Voll-Verifikation** (HANDOVER §5): beide Breiten, alle 6 Views, alle 3 Overlays + `kiChat`, `openReferrer`, `rsp`-Charts, Matrix; Screenshots.
- [ ] **Step 4: Merge:** `git pull origin main` (Cofounder!) → Konflikte lösen (unwahrscheinlich: eigener Namespace) → FF-Merge `feat/ki` → `main` → Push. Live-Check nach ~1 min (`gh api repos/aluminiumminimum/bavaria-trichter-prototyp/pages/builds/latest`).
- [ ] **Step 5:** session-log `[saved]`-Eintrag (context-management) + Branch löschen.

---

## Self-Review (durchgeführt)

- **Spec-Coverage:** §3 Proxy→T1/T2 · §4 Fundament→T3 · §6 F1→T4, F3→T5, F2→T6, F4→T7 · §9 Verifikation→in jedem Task + T8 · §10 Rollout→T0/T8 · §11 Gates→T2. Lücken: keine.
- **Platzhalter:** einer gefunden (T5 `kiKurzberichtUebernehmen`-Skizze) → direkt im Task präzisiert (`_kiKb`-Zwischenspeicher).
- **Typ-/Namens-Konsistenz:** `kiRun(containerId,fn,fallback,render)` überall gleich; Sterne durchgehend String-Keys; `_ki*`-Felder additiv/flüchtig; `KI_CONFIG.token` muss dem Server-`KI_SHARED_TOKEN` entsprechen (T2↔T3 — bei Abweichung Client-Konstante anpassen).
