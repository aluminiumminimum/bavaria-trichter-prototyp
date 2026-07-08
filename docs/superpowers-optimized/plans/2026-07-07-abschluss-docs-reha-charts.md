# Abschluss-Dokumente + QR + Reha-Charts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-optimized:subagent-driven-development (recommended) or superpowers-optimized:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dokument-Kacheln im Abschlusspaket öffnen echte Premium-Mock-Dokumente (Arztbrief/Kurzbericht/Medikationsplan mit QR-Code = Live-Demo-URL), plus Verlaufsgrafiken im Reha-Board und Reha-Detail.
**Architecture:** Lazy `#rpDocView`-Overlay (z-110) mit Papierbogen `.rpd-*`; QR als build-zeit-generierte SVG-Konstante `RP_QR` (Python-Skript im Plan, deterministisch, Matrix-verifiziert); Reha-Grafiken als reine Zusatz-Funktionen `rsSeries/rsPath/rsSpark/rsChart` mit exakt 2 Einfüge-Zeilen in Kollegen-Code (`renderInReha`, `openRsDetail`).
**Tech Stack:** Vanilla JS/CSS in `index.html`; Python3 + `qrcode` (lokal installiert) nur als Build-Werkzeug.
**Assumptions:** Stand nach `b96a225` (Kollegen-WS1–WS7). Esc-Listener-Zeile existiert wörtlich wie in Task 3 zitiert — falls der Kollege sie heute Nacht ändert, Task 3 Schritt „Esc-Guard" manuell anpassen. `rpPersona`, `escapeHtml`, `initialen`, `entlassDoc`, `inReha`, `.ir-card`/`rsErfolg`-Strukturen wie zitiert.

**Ausführung: SEQUENZIELL.** Visual-Gates nach Task 3 und 4 (Orchestrator).

**JS-Parse-Check (jeder Task):**
```bash
cd /Users/andreschlender/Projects/Arasch && python3 -c "
import re
html = open('index.html', encoding='utf-8').read()
scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
open('/tmp/_rp.js','w').write('\n'.join(scripts))
" && node --check /tmp/_rp.js && echo "JS OK"
```

---

### Task 1: Branch + Demo-Daten + RP_QR-Injektion

**Files:** Modify: `index.html`

- [ ] **Step 1:** `git checkout -b feat/abschluss-docs` (von main, HEAD ≥ `b96a225`).

- [ ] **Step 2 — entlassDoc erweitern.** (a) Nach der Zeile ` barthel:{auf:45,ent:85},` einfügen: ` fim:{auf:78,ent:104},`. (b) Die Zeile
```
 ruecksprache:"0971 0000-100 (Recovery-Line, Mo–Fr 8–16 Uhr)"};
```
ersetzen durch:
```js
 ruecksprache:"0971 0000-100 (Recovery-Line, Mo–Fr 8–16 Uhr)",
 medis:[
  {m:"Ramipril",st:"5 mg",d:"1 – 0 – 0",h:"RR-Kontrolle beim Hausarzt"},
  {m:"ASS",st:"100 mg",d:"1 – 0 – 0",h:"dauerhaft"},
  {m:"Atorvastatin",st:"20 mg",d:"0 – 0 – 1",h:"Lipidprofil in 8 Wochen"},
  {m:"Colecalciferol",st:"20.000 I.E.",d:"1 × / Woche",h:"Sturzprophylaxe"},
  {m:"Ibuprofen",st:"400 mg",d:"bei Bedarf",h:"max. 3 × täglich, zu den Mahlzeiten"}
 ],
 epikrise:"Die stationäre geriatrische Komplexrehabilitation nach Beckenringfraktur verlief komplikationslos. Unter intensiver Physio- und Ergotherapie erreichte der Patient eine sichere, selbstständige Mobilität am Rollator; Transfers gelingen ohne personelle Hilfe. Die Belastungsschmerzen sind unter bedarfsgerechter Analgesie rückläufig (NRS 1–2).",
 prozeduren:["Physiotherapie einzeln, 5 ×/Woche · Gangschule und Kraftaufbau","Ergotherapie inkl. Hilfsmittel- und Wohnraumberatung","Geriatrische Komplexbehandlung (OPS 8-550)"]};
```

- [ ] **Step 3 — RP_QR generieren + injizieren** (Skript verbatim ausführen; fügt `const RP_QR=...;` direkt vor `function rpDate(iso)` ein):
```bash
cd /Users/andreschlender/Projects/Arasch && python3 - <<'EOF'
import qrcode, io, re
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=4)
qr.add_data('https://aluminiumminimum.github.io/bavaria-trichter-prototyp/')
qr.make(fit=True)
m = qr.modules; n = len(m)
paths=[]
for y,row in enumerate(m):
    x=0
    while x<n:
        if row[x]:
            x0=x
            while x<n and row[x]: x+=1
            paths.append(f"M{x0+4} {y+4}h{x-x0}v1h-{x-x0}z")
        else: x+=1
size=n+8
svg=f'<svg viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="{size}" height="{size}" fill="#fff"/><path d="{"".join(paths)}" fill="#000"/></svg>'
html=open('index.html',encoding='utf-8').read()
anchor='function rpDate(iso)'
assert anchor in html and 'const RP_QR' not in html
html=html.replace(anchor, "const RP_QR='"+svg+"';\n"+anchor, 1)
open('index.html','w',encoding='utf-8').write(html)
print("RP_QR injiziert · Module:",n,"· Bytes:",len(svg))
EOF
```
Expected: `RP_QR injiziert · Module: 33 · Bytes: 4058`

- [ ] **Step 4 — Verifizieren:** JS-Parse OK; `grep -c "const RP_QR" index.html` → 1; `grep -c "medis:" index.html` → 1; `grep -c "fim:{auf:78,ent:104}" index.html` → 1.

- [ ] **Step 5:** `git add index.html && git commit -m "feat(abschluss-docs): Demo-Daten (Medikation/Epikrise/Prozeduren/FIM) + RP_QR-SVG (Live-URL, Matrix-verifiziert)"`

---

### Task 2: CSS — Dokument-Viewer, QR-Zeile, Reha-Charts

**Files:** Modify: `index.html`

- [ ] **Step 1:** Direkt vor `</style>` einfügen (verbatim):

```css
/* ===== ABSCHLUSS-DOKUMENTE + QR + REHA-CHARTS ===== */
#rpDocView{position:fixed;inset:0;z-index:110;display:none;align-items:flex-start;justify-content:center;background:rgba(31,28,28,.55);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);overflow-y:auto;padding:4vh 14px}
#rpDocView.open{display:flex}
.rpd-paper{position:relative;background:#fff;width:100%;max-width:660px;border-radius:6px;box-shadow:0 30px 80px rgba(20,16,12,.45);padding:34px 38px 30px;margin:auto 0;animation:rpUp .4s cubic-bezier(.4,0,.2,1) both;overflow:hidden}
.rpd-close{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;border:1px solid var(--hair);background:#fff;font:400 18px/1 Inter;color:#6b6460;cursor:pointer;z-index:2}
.rpd-close:hover{background:#f4f0e9}
.rpd-water{position:absolute;top:38%;left:-8%;right:-8%;text-align:center;font:700 92px/1 Inter;letter-spacing:.18em;color:#1F1C1C;opacity:.05;transform:rotate(-28deg);pointer-events:none;user-select:none}
.rpd-head{display:flex;align-items:center;gap:13px;padding-bottom:14px;border-bottom:2px solid #cdb083;margin-bottom:6px}
.rpd-mono{width:44px;height:44px;flex:0 0 auto;border-radius:50%;border:1.5px solid #cdb083;color:#8f7448;display:flex;align-items:center;justify-content:center;font:600 17px/1 'Cormorant Garamond',serif}
.rpd-head b{display:block;font:700 21px/1.1 'Cormorant Garamond',serif;color:#1F1C1C}
.rpd-head small{font:500 11px/1.4 Inter;letter-spacing:.12em;text-transform:uppercase;color:#9B8573}
.rpd-meta{display:flex;justify-content:space-between;gap:10px;font:400 12.5px/1.5 Inter;color:#766f64;margin:12px 0 4px;flex-wrap:wrap}
.rpd-title{font:700 17px/1.25 Inter;margin:14px 0 4px}
.rpd-sub{font:400 13px/1.5 Inter;color:#766f64;margin:0 0 12px}
.rpd-p{font:400 14px/1.65 Inter;color:#2e2a28;margin:0 0 12px}
.rpd-h{font:700 11.5px/1 Inter;letter-spacing:.12em;text-transform:uppercase;color:#8f7448;margin:16px 0 7px}
.rpd-li{font:400 13.5px/1.55 Inter;color:#2e2a28;padding:5px 0 5px 2px;border-bottom:1px solid #f0ebe3}
.rpd-li:last-child{border-bottom:none}
.rpd-table{width:100%;border-collapse:collapse;font:400 13px/1.45 Inter;margin:6px 0 4px}
.rpd-table th{font:700 10.5px/1.2 Inter;letter-spacing:.09em;text-transform:uppercase;color:#8f7448;text-align:left;padding:7px 8px;border-bottom:2px solid #cdb083}
.rpd-table td{padding:8px;border-bottom:1px solid #f0ebe3;vertical-align:top}
.rpd-table td.c{white-space:nowrap;font-variant-numeric:tabular-nums}
.rpd-sig{margin-top:22px;padding-top:14px;border-top:1px solid #e6ded2;display:flex;justify-content:space-between;align-items:flex-end;gap:14px;flex-wrap:wrap}
.rpd-sig .s{font:600 16px/1.2 'Cormorant Garamond',serif;font-style:italic}
.rpd-sig small{display:block;font:400 11.5px/1.5 Inter;color:#766f64;font-style:normal}
.rpd-demo{font:500 10.5px/1.4 Inter;letter-spacing:.06em;color:#b0a89c}
.rpd-qr{float:right;width:112px;margin:0 0 10px 14px;border:1px solid #cdb083;border-radius:8px;padding:6px;background:#fff}
.rpd-qr svg{display:block;width:100%;height:auto}
/* QR-Zeile in der Abschluss-Karte */
.rp-qrrow{display:flex;gap:16px;align-items:center;background:#fdf8ee;border:1px solid var(--brass-line);border-radius:14px;padding:14px 16px;margin:0 0 16px}
.rp-qrrow .q{flex:0 0 auto;width:104px;border:1px solid var(--brass-line);border-radius:9px;padding:5px;background:#fff}
.rp-qrrow .q svg{display:block;width:100%;height:auto}
.rp-qrrow b{display:block;font:600 15px/1.3 Inter;margin-bottom:3px}
.rp-qrrow small{font:400 13px/1.5 Inter;color:var(--muted)}
/* Reha-Verlaufsgrafiken */
.rsp-spark{margin:2px 0 12px}
.rsp-spark svg{display:block;width:100%;height:44px}
.rsp-cap{font:600 10px/1 Inter;letter-spacing:.09em;text-transform:uppercase;color:var(--faint);margin-top:3px}
.rsp-chart{margin:14px 0 6px}
.rsp-chart svg{display:block;width:100%;height:130px}
.rsp-legend{display:flex;gap:14px;margin-top:6px;font:600 11px/1 Inter}
.rsp-legend span{display:inline-flex;align-items:center;gap:5px;color:var(--muted)}
.rsp-legend i{width:14px;height:3px;border-radius:2px}
.rsp-legend .b i{background:#bca37d}.rsp-legend .f i{background:#9B8573}
@keyframes rspDraw{from{stroke-dashoffset:1}}
.rsp-chart path.line{stroke-dasharray:1;animation:rspDraw 1.1s ease-out both}
.rsp-chart path.line.f{animation-delay:.15s}
@media(min-width:900px){.rpd-paper{padding:44px 52px 36px}}
```

- [ ] **Step 2:** Verifizieren: `grep -c "ABSCHLUSS-DOKUMENTE + QR" index.html` → 1; `grep -c "</style>" index.html` → 1; JS-Parse OK.
- [ ] **Step 3:** `git add index.html && git commit -m "feat(abschluss-docs): CSS — Papier-Viewer, MUSTER-Wasserzeichen, QR-Zeile, Reha-Chart-Styles"`

---

### Task 3: Dokument-Viewer + Esc-Guard + renderAbschluss

**Files:** Modify: `index.html`

**Does NOT cover:** Reha-Grafiken (Task 4). Kein anderer Esc-Listener wird angefasst (WS1-`dismissDetail` bleibt).

- [ ] **Step 1 — rpDoc/rpDocClose einfügen**, direkt VOR `function renderAbschluss(zName){`:

```js
function rpDocClose(){const v=document.getElementById("rpDocView");if(v)v.classList.remove("open");}
function rpDoc(type,zName){
 let v=document.getElementById("rpDocView");
 if(!v){v=document.createElement("div");v.id="rpDocView";
  v.addEventListener("click",e=>{if(e.target===v)rpDocClose();});
  document.body.appendChild(v);}
 const d=entlassDoc,p=rpPersona(zName||"");
 const head=`<div class="rpd-head"><span class="rpd-mono">KB</span><div><b>Klinik Bavaria</b><small>Concierge Rehabilitation · Bad Kissingen</small></div></div>`;
 const meta=`<div class="rpd-meta"><span>Patient: <b>${escapeHtml(d.pat)}</b> · ${escapeHtml(d.achse)}</span><span>Aufenthalt ${escapeHtml(d.aufenthalt)} · entlassen ${escapeHtml(d.entlassen)}</span></div>`;
 const sig=`<div class="rpd-sig"><span class="s">Dr. med. M. Bergmann<small>Ärztliche Koordination · Klinik Bavaria</small></span><span class="rpd-demo">Synthetisches Demo-Dokument · kein echter Patient</span></div>`;
 let body="";
 if(type==="arztbrief"){
  const anrede=p.name?(p.name.indexOf("Frau")===0?`Sehr geehrte Frau Kollegin ${escapeHtml(p.name.replace(/^Frau\s*/,""))},`:`Sehr geehrter Herr Kollege ${escapeHtml(p.name.replace(/^(Herr|Dr\.|Prof\.)\s*/,""))},`):"Sehr geehrte Kolleginnen und Kollegen,";
  body=`<div class="rpd-title">Ärztlicher Entlassbrief</div><div class="rpd-sub">${escapeHtml(p.inst||"")}</div>${meta}
   <p class="rpd-p" style="margin-top:10px">${anrede}</p>
   <p class="rpd-p">wir berichten über den o. g. Patienten, der sich für ${escapeHtml(d.aufenthalt)} bis zum ${escapeHtml(d.entlassen)} in unserer stationären Behandlung befand.</p>
   <div class="rpd-h">Diagnose</div><p class="rpd-p">${escapeHtml(d.diagnose)}</p>
   <div class="rpd-h">Epikrise</div><p class="rpd-p">${escapeHtml(d.epikrise)}</p>
   <div class="rpd-h">Durchgeführte Therapie</div>${d.prozeduren.map(x=>`<div class="rpd-li">${escapeHtml(x)}</div>`).join("")}
   <div class="rpd-h">Empfehlungen</div>${d.empfehlungen.map(x=>`<div class="rpd-li">${escapeHtml(x)}</div>`).join("")}
   <p class="rpd-p" style="margin-top:14px">Mit freundlichen kollegialen Grüßen</p>${sig}`;
 } else if(type==="kurzbericht"){
  body=`<div class="rpd-title">Reha-Kurzbericht</div>${meta}
   <div class="rpd-h">Ergebnis</div>
   <table class="rpd-table"><tr><th>Parameter</th><th>Aufnahme</th><th>Entlassung</th><th>Δ</th></tr>
    <tr><td>Barthel-Index</td><td class="c">${d.barthel.auf}</td><td class="c">${d.barthel.ent}</td><td class="c">+${d.barthel.ent-d.barthel.auf}</td></tr>
    <tr><td>FIM</td><td class="c">${d.fim.auf}</td><td class="c">${d.fim.ent}</td><td class="c">+${d.fim.ent-d.fim.auf}</td></tr>
    <tr><td>Verweildauer</td><td class="c" colspan="3">${escapeHtml(d.aufenthalt)} · im Plan</td></tr></table>
   <div class="rpd-h">Kurzbeurteilung</div><p class="rpd-p">${escapeHtml(d.kurz)}</p>
   <div class="rpd-h">Empfehlungen</div>${d.empfehlungen.map(x=>`<div class="rpd-li">${escapeHtml(x)}</div>`).join("")}${sig}`;
 } else {
  body=`<div class="rpd-title">Medikationsplan</div>
   <div class="rpd-qr">${RP_QR}</div>
   <p class="rpd-sub">Stand: ${escapeHtml(d.entlassen)} · QR-Code scannen für die digitale Ansicht</p>${meta}
   <table class="rpd-table"><tr><th>Wirkstoff</th><th>Stärke</th><th>Dosierung</th><th>Hinweis</th></tr>
   ${d.medis.map(x=>`<tr><td><b>${escapeHtml(x.m)}</b></td><td class="c">${escapeHtml(x.st)}</td><td class="c">${escapeHtml(x.d)}</td><td>${escapeHtml(x.h)}</td></tr>`).join("")}</table>
   <div class="rpd-h">Hinweis</div><p class="rpd-p">${escapeHtml(d.medikation)}</p>${sig}`;
 }
 v.innerHTML=`<div class="rpd-paper"><button class="rpd-close" onclick="rpDocClose()" aria-label="Schließen">×</button><div class="rpd-water">MUSTER</div>${head}${body}</div>`;
 v.classList.add("open");v.scrollTop=0;
 const c=v.querySelector(".rpd-close");if(c)c.focus();
}
```

- [ ] **Step 2 — Esc-Guard.** Die exakte Zeile
```js
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.getElementById("refOverlay").classList.contains("open"))closeReferrer();});
```
ersetzen durch:
```js
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;
 const dv=document.getElementById("rpDocView");
 if(dv&&dv.classList.contains("open")){rpDocClose();return;}
 if(document.getElementById("refOverlay").classList.contains("open"))closeReferrer();});
```

- [ ] **Step 3 — renderAbschluss ersetzen** (komplette Funktion) durch:

```js
function renderAbschluss(zName){
 const d=entlassDoc;
 return `<p class="rp-lead">Was Sie als zuweisendes Haus zum Reha-Abschluss erhalten — kompakt, vollständig, ohne Nachtelefonieren.</p>
 <div class="rp-card">
  <div class="rp-pathead"><span class="rp-ava">${initialen(d.pat)}</span><div><b>${escapeHtml(d.pat)}</b><small>${escapeHtml(d.achse)} · ${escapeHtml(d.diagnose)} · Aufenthalt ${escapeHtml(d.aufenthalt)}</small></div><span class="rp-tag ok">entlassen ${escapeHtml(d.entlassen)}</span></div>
  <div class="rp-outcome"><span class="k">Barthel-Index</span><span class="v"><b data-to="${d.barthel.auf}">0</b> <i>→</i> <b data-to="${d.barthel.ent}">0</b></span><span class="s">Reha-Ziel erreicht · Entlassung nach Hause mit ambulanter Anschlussversorgung</span></div>
  <div class="rp-docs">
   <button class="rp-doc" onclick="rpDoc('arztbrief','${escapeHtml(zName)}')"><span>📄</span><b>Arztbrief</b><small>Ansehen · Demo</small></button>
   <button class="rp-doc" onclick="rpDoc('kurzbericht','${escapeHtml(zName)}')"><span>📄</span><b>Kurzbericht</b><small>Ansehen · Demo</small></button>
   <button class="rp-doc" onclick="rpDoc('mediplan','${escapeHtml(zName)}')"><span>📄</span><b>Medikationsplan</b><small>Ansehen · Demo</small></button>
  </div>
  <div class="rp-recs"><h4>Empfehlungen</h4>${d.empfehlungen.map(r=>`<div class="rp-rec">✓ ${escapeHtml(r)}</div>`).join("")}</div>
  <div class="rp-med"><h4>Medikation</h4><p>${escapeHtml(d.medikation)}</p></div>
  <div class="rp-qrrow"><span class="q">${RP_QR}</span><div><b>Medikationsplan aufs Handy</b><small>QR-Code mit der Kamera scannen — öffnet die digitale Ansicht (Demo: Prototyp-Link).</small></div></div>
  <a class="rp-call" href="#" onclick="rpToast('Rückruf angefragt — Recovery-Line meldet sich');return false">☎ Rücksprache: ${escapeHtml(d.ruecksprache)}</a>
 </div>`;
}
```

- [ ] **Step 4:** Verifizieren: JS-Parse OK; `grep -c "function rpDoc(" index.html` → 1; `grep -c "rp-qrrow" index.html` → ≥2; `grep -c "rpDoc('arztbrief'" index.html` → 1; Esc-Guard: `grep -c "rpDocClose();return;" index.html` → 1.
- [ ] **Step 5:** `git add index.html && git commit -m "feat(abschluss-docs): Dokument-Viewer (Arztbrief/Kurzbericht/Mediplan mit QR) + Esc-Kaskade + Abschluss-QR-Zeile"`

---

### Task 4: Reha-Verlaufsgrafiken (Sparkline + Detail-Chart)

**Files:** Modify: `index.html`

**Does NOT cover:** Änderungen an Kollegen-Layout/Wirtschaftlichkeits-Spalte — NUR die 2 genannten Einfüge-Zeilen plus neue Funktionen.

- [ ] **Step 1 — Chart-Funktionen einfügen**, direkt VOR `function renderInReha(){`:

```js
function rsSeries(from,to,n){
 const pts=[];
 for(let i=0;i<n;i++){const t=n===1?1:i/(n-1);const e=1-Math.pow(1-t,2.2);
  let v=from+(to-from)*e+Math.sin(i*2.1)*(to-from)*0.03;
  v=Math.max(Math.min(from,to),Math.min(Math.max(from,to),v));
  pts.push(v);}
 pts[0]=from;pts[n-1]=to;return pts;
}
function rsPath(pts,w,h,max){
 const n=pts.length;
 return pts.map((v,i)=>`${i?"L":"M"}${(i/(n-1)*w).toFixed(1)} ${(h-v/max*h).toFixed(1)}`).join(" ");
}
function rsSpark(p){
 const n=Math.max(3,Math.min(12,p.verweildauer.ist+1));
 const pts=rsSeries(p.barthel.auf,p.barthel.akt,n);
 const w=200,h=38,line=rsPath(pts,w,h,100);
 const lastY=(h-pts[n-1]/100*h).toFixed(1);
 return `<div class="rsp-spark"><svg viewBox="0 0 ${w} 44" preserveAspectRatio="none">
   <defs><linearGradient id="rspg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bca37d"/><stop offset="1" stop-color="#bca37d" stop-opacity="0"/></linearGradient></defs>
   <path d="${line} L${w} 44 L0 44 Z" fill="url(#rspg)" opacity=".18" stroke="none"/>
   <path d="${line}" fill="none" stroke="#bca37d" stroke-width="2"/>
   <circle cx="${w-1}" cy="${lastY}" r="3" fill="#8f7448"/></svg>
  <div class="rsp-cap">Barthel-Verlauf seit Aufnahme</div></div>`;
}
function rsChart(p){
 const n=Math.max(3,Math.min(12,p.verweildauer.ist+1));
 const w=460,h=104,cw=w-46;
 const b=rsSeries(p.barthel.auf,p.barthel.akt,n),f=rsSeries(p.fim.auf,p.fim.akt,n);
 const pb=rsPath(b,cw,h,100),pf=rsPath(f,cw,h,126);
 const grid=[0.25,0.5,0.75].map(g=>`<line x1="0" y1="${(h*g).toFixed(1)}" x2="${cw}" y2="${(h*g).toFixed(1)}" stroke="#eee8de" stroke-width="1"/>`).join("");
 const eyB=(h-b[n-1]/100*h+4).toFixed(1),eyF=(h-f[n-1]/126*h+4).toFixed(1);
 return `<div class="rsp-chart"><svg viewBox="0 0 ${w} 130">
   ${grid}
   <path class="line" pathLength="1" d="${pb}" fill="none" stroke="#bca37d" stroke-width="2.5" stroke-linecap="round"/>
   <path class="line f" pathLength="1" d="${pf}" fill="none" stroke="#9B8573" stroke-width="2.5" stroke-linecap="round"/>
   <text x="${cw+4}" y="${eyB}" font-family="Inter" font-size="12" font-weight="700" fill="#8f7448">${p.barthel.akt}</text>
   <text x="${cw+4}" y="${eyF}" font-family="Inter" font-size="12" font-weight="700" fill="#9B8573">${p.fim.akt}</text>
   <text x="0" y="122" font-family="Inter" font-size="10" fill="#948c80">Aufnahme</text>
   <text x="${cw}" y="122" text-anchor="end" font-family="Inter" font-size="10" fill="#948c80">Tag ${p.verweildauer.ist}</text>
  </svg><div class="rsp-legend"><span class="b"><i></i>Barthel</span><span class="f"><i></i>FIM</span></div></div>`;
}
```

- [ ] **Step 2 — Sparkline einfügen.** In `renderInReha`, im Karten-Template, direkt VOR der Zeile, die `<div class="ir-stay">` beginnt, die Zeile `    ${rsSpark(p)}` einfügen (innerhalb des Template-Literals).

- [ ] **Step 3 — Detail-Chart einfügen.** In `openRsDetail`, nach der Zeile
```js
  +"<div class='rs-dev'>"+devBar("Barthel-Index (0–100)",p.barthel.auf,p.barthel.akt,100)+devBar("FIM (18–126)",p.fim.auf,p.fim.akt,126)+"</div>"
```
die Zeile `  +rsChart(p)` einfügen.

- [ ] **Step 4:** Verifizieren: JS-Parse OK; `grep -c "function rsSpark\|function rsChart\|function rsSeries" index.html` → 3; `grep -c 'rsSpark(p)' index.html` → 2 (Def+Aufruf); `grep -c "rsChart(p)" index.html` → 2.
- [ ] **Step 5:** `git add index.html && git commit -m "feat(reha-charts): Verlaufs-Sparkline auf Board-Karten + Barthel/FIM-Liniendiagramm im Detail (deterministisch, additiv)"`

---

### Task 5: Cross-Verifikation + Merge/Deploy (Orchestrator)

- [ ] 1440: Abschluss → 3 Dokumente öffnen (Briefkopf/Wasserzeichen/Tabellen/Signatur), Mediplan mit QR; Esc-Kaskade (1× Esc schließt Doc, Suite bleibt; 2× Esc schließt Suite); Backdrop-Klick + ×; QR-Zeile in Karte; Arztbrief-Anrede „Herr Kollege Brenner" (Leopoldina) vs. Fallback (Reha-Technik Müller). Reha-Board: 3 Sparklines; Detail: Chart mit Draw-in, Wirtschaftlichkeits-Spalte unverändert.
- [ ] 390: Papier full-width ohne Overflow; Charts skaliert; alle 3 Dokumente scrollbar.
- [ ] 0 Console-Errors; interne Views intakt.
- [ ] `git pull origin main` (Kollege!), merge→main, push, Live-Marker `rpDocView` pollen. Empfehlung an User: QR einmal real mit dem Handy scannen.

---

## Self-Review
- **Coverage:** Viewer+3 Dokumente (T3), QR 2 Platzierungen (T1-Konstante, T3-Nutzung), Esc-Kaskade (T3), Demo-Daten (T1), CSS inkl. Wasserzeichen/Draw (T2), Sparkline+Chart+2 Einfüge-Zeilen (T4), Sweep+Deploy (T5). ✓
- **Platzhalter:** keine.
- **Konsistenz:** `rpDoc('mediplan',…)` ↔ else-Zweig; `RP_QR` T1→T3; `d.fim.ent` T1→T3-Kurzbericht; `.rsp-chart path.line` (T2) ↔ `class="line" pathLength="1"` (T4); rsSpark-Gradient-ID mehrfach im DOM = gleicher Verlauf, unkritisch. ✓
