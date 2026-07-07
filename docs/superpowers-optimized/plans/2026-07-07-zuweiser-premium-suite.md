# Zuweiser-Premium-Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-optimized:subagent-driven-development (recommended) or superpowers-optimized:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die drei B2B-Screens (Zuweiser-Portal / Behandlungs-Einblick / Abschlusspaket) im `#refOverlay` zu einer Premium-Suite mit gemeinsamem Hero, personalisierter Begrüßung und Sub-Nav aufwerten — Investor-Pitch morgen, Desktop 1440 primär.
**Architecture:** `openReferrer(screen,zName)` rendert neu `renderSuite(screen,zName)` = Hero (Persona aus `zuweiser`-Datensatz) + 3 Tabs + Screen-Body. Die drei Body-Renderer (`renderPortal/renderEinblick/renderAbschluss`) werden ersetzt, Ausgabe nutzt neuen CSS-Namespace `.rp-*` (kommentierter Block vor `</style>`). Overlay-Mechanik (Esc/Zurück/z-90/`body.locked`) unverändert.
**Tech Stack:** Vanilla JS + CSS in `index.html`; Verifikation via Script-Extrakt + `node --check` und Chrome MCP (1440 + 390).
**Assumptions:** Kollege arbeitet parallel auf `main` an Matrix/Datenbank — dieser Plan ändert NUR Referrer-Renderfunktionen, neue Demo-Datenblöcke und einen neuen CSS-Block; wird NICHT funktionieren, falls der Kollege zeitgleich die Referrer-Funktionen umbaut (vor Merge `git pull` + Diff prüfen). Annahme: `zuweiser`, `belegung`, `inReha`, `entlassDoc`, `initialen()`, `kpiRing()`, `escapeHtml()`, `refToast()`, `dstr()` existieren unverändert (Stand `508b555`).

**Ausführung: SEQUENZIELL** (ein File, Tasks bauen aufeinander auf — keine parallelen Waves).
Nach Task 3–6 fährt der Orchestrator je ein Visual-Gate (Chrome MCP 1440+390).

---

## Verifikations-Kommandos (in jedem Task identisch)

**JS-Parse:**
```bash
python3 -c "
import re
html = open('index.html', encoding='utf-8').read()
scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
open('/tmp/_rp.js','w').write('\n'.join(scripts))
" && node --check /tmp/_rp.js && echo "JS OK"
```
Expected: `JS OK`

---

### Task 1: Branch + Demo-Daten + Persona-Helper

**Files:** Modify: `index.html`

- [x] **Step 1: Branch anlegen**
```bash
git checkout -b feat/zuweiser-premium
```

- [x] **Step 2: Demo-Daten + Persona-Helper einfügen** — direkt NACH der Zeile `const TEAM=["S. Koordination","M. Belegung","T. Abrechnung","Recovery Manager"];`:

```js
/* ----- Zuweiser-Premium-Suite: Demo-Daten (synthetisch) ----- */
const portalNews=[
 {d:"07.07.",t:"+4 SalutoCare-Suiten ab September",s:"Erweiterung der Privatstation · jetzt für Ihre Patienten vormerkbar"},
 {d:"01.07.",t:"AHB-Fast-Lane: Rückmeldung < 24 h",s:"Verbindliche Reaktionszusage für Partnerhäuser"},
 {d:"24.06.",t:"Neues EPZ-Kooperationsmodul Orthopädie",s:"Direktübernahme nach Endoprothetik, verkürzte Wege"}
];
const portalTeam=[
 {name:"Dr. Miriam Bergmann",rolle:"Ärztliche Koordination",tel:"0971 0000-181",mail:"bergmann@demo-bavaria.local"},
 {name:"Tobias Klein",rolle:"Belegungsmanagement",tel:"0971 0000-182",mail:"klein@demo-bavaria.local"}
];
const portalFaelle=[
 {name:"Karl Beispiel",achse:"Orthopädie",status:"Aufnahme geplant",phase:"vor",d:dstr(-2)},
 {name:"Heinz Vogel",achse:"SalutoCare",status:"in Klärung",phase:"vor",d:dstr(-4)},
 {name:"Dieter Franke",achse:"Orthopädie",status:"in Reha · Tag 6",phase:"in",d:dstr(-6)}
];
function rpPersona(zName){
 const z=zuweiser.find(x=>x.name===zName);
 let ap=z&&z.ap?z.ap.replace(/\s*\(.*\)$/,"").trim():"";
 if(!/^(Hr\.|Fr\.|Dr\.|Prof\.)/.test(ap)) ap="";
 ap=ap.replace(/^Hr\.\s*/,"Herr ").replace(/^Fr\.\s*/,"Frau ");
 return {name:ap,inst:zName,typ:z?z.typ:""};
}
```

Zusätzlich im bestehenden `entlassDoc`-Objekt das Feld `barthel:{auf:45,ent:85},` ergänzen (nach `aufenthalt:"21 Tage",`).

- [x] **Step 3: Verifizieren**
JS-Parse (siehe oben) + `grep -c "portalNews\|rpPersona" index.html` → ≥2 Treffer. Manuelle Logik-Probe (node): `rpPersona`-Regex mit "Hr. Brenner (Privatstation)" → "Herr Brenner"; "noch offen" → ""; "Portal-Anfragen" → "".

- [x] **Step 4: Commit**
```bash
git add index.html && git commit -m "feat(zuweiser-suite): Demo-Daten (News/Team/Fälle) + rpPersona-Helper"
```

---

### Task 2: CSS-Block `.rp-*`

**Files:** Modify: `index.html`

- [x] **Step 1: Kommentierten CSS-Block direkt vor `</style>` einfügen:**

```css
/* ===== ZUWEISER-PREMIUM-SUITE (.rp-*) — Hero, Tabs, Screens ===== */
.ref-body{max-width:1100px}
.rp-hero{background:var(--espresso-grad);border-radius:20px;padding:30px 26px 0;margin:2px 0 20px;color:#f4eee3;position:relative;overflow:hidden}
.rp-hero::after{content:"";position:absolute;top:0;left:24px;right:24px;height:2px;background:linear-gradient(90deg,transparent,#cdb083 30%,#cdb083 70%,transparent);opacity:.6}
.rp-mark{font:600 12.5px/1 Inter;letter-spacing:.22em;text-transform:uppercase;color:#cdb083;margin-bottom:14px}
.rp-greet{font:italic 600 30px/1.12 'Cormorant Garamond',Georgia,serif;margin:0 0 6px;color:#f4eee3}
.rp-sub{font:400 14.5px/1.5 Inter;color:#cbc2b4;margin:0 0 20px}
.rp-tabs{display:flex;gap:4px;margin:0 -6px}
.rp-tab{flex:1;background:transparent;border:none;border-bottom:2px solid transparent;padding:10px 6px 14px;text-align:center;cursor:pointer;color:#a89e8f;transition:color .18s ease}
.rp-tab small{display:block;font:600 10.5px/1 Inter;letter-spacing:.14em;text-transform:uppercase;margin-bottom:4px;color:inherit}
.rp-tab span{font:600 14px/1.2 Inter;color:inherit}
.rp-tab.on{color:#f4eee3;border-bottom-color:#cdb083}
@media(hover:hover){.rp-tab:hover{color:#e8dfd0}}
.rp-lead{font:400 15px/1.55 Inter;color:var(--muted);margin:0 0 16px;max-width:64ch}
.rp-card{background:var(--paper);border:1px solid var(--hair);border-radius:16px;padding:20px;margin-bottom:16px;box-shadow:var(--shadow-soft);position:relative}
.rp-card::before{content:"";position:absolute;top:0;left:18px;right:18px;height:2px;border-radius:0 0 3px 3px;background:linear-gradient(90deg,transparent,#cdb083 30%,#cdb083 70%,transparent);opacity:.4}
.rp-card h3{font:600 17px/1.2 Inter;margin:0 0 12px;color:var(--ink)}
.rp-two{display:grid;grid-template-columns:1fr;gap:16px}
.rp-two .rp-card{margin-bottom:0}
.rp-two{margin-bottom:16px}
/* News */
.rp-newsrow{display:flex;gap:12px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--hair2)}
.rp-newsrow:last-child{border-bottom:none;padding-bottom:0}
.rp-date{flex:0 0 auto;font:700 11.5px/1 Inter;color:var(--brass-deep);background:var(--brass-soft);border-radius:99px;padding:5px 9px;margin-top:2px}
.rp-newsrow b{font:600 14.5px/1.3 Inter;display:block}
.rp-newsrow small{font:400 13px/1.4 Inter;color:var(--muted)}
/* Belegung */
.rp-hint{font:400 13px/1.4 Inter;color:var(--muted);margin:-4px 0 12px}
.rp-belgrid{display:grid;grid-template-columns:1.3fr repeat(4,1fr);gap:7px;align-items:center}
.rp-belgrid .hd{font:600 11.5px/1 Inter;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}
.rp-belgrid .hd.c{text-align:center}
.rp-achse{font:600 13.5px/1.2 Inter}
.rp-bel{display:block;width:100%;text-align:center;border:none;border-radius:10px;padding:11px 0;font:700 15px/1 Inter;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease}
.rp-bel.free{background:var(--sage-soft);color:var(--sage-deep)}
.rp-bel.tight{background:#f6ecd9;color:#b58a3e}
.rp-bel.none{background:#f0ece6;color:#b0a89c;cursor:default}
@media(hover:hover){.rp-bel.free:hover,.rp-bel.tight:hover{transform:translateY(-2px);box-shadow:0 6px 14px rgba(31,28,28,.12)}}
.rp-legend{display:flex;gap:14px;margin-top:12px;font:600 11.5px/1 Inter}
.rp-legend span{display:inline-flex;align-items:center;gap:5px}
.rp-legend span::before{content:"";width:10px;height:10px;border-radius:3px}
.rp-legend .free{color:var(--sage-deep)}.rp-legend .free::before{background:var(--sage-soft);border:1px solid var(--sage)}
.rp-legend .tight{color:#b58a3e}.rp-legend .tight::before{background:#f6ecd9;border:1px solid #d8b87a}
.rp-legend .none{color:#b0a89c}.rp-legend .none::before{background:#f0ece6;border:1px solid #d8d2c8}
/* Team / Avatare / Fälle */
.rp-badge{position:absolute;top:18px;right:18px;font:700 11px/1 Inter;letter-spacing:.04em;color:var(--sage-deep);background:var(--sage-soft);border-radius:99px;padding:6px 10px}
.rp-team{display:grid;grid-template-columns:1fr;gap:12px}
.rp-person{display:flex;gap:12px;align-items:center;padding:10px;border:1px solid var(--hair2);border-radius:13px;background:#fff}
.rp-ava{flex:0 0 auto;width:46px;height:46px;border-radius:50%;background:var(--brass-grad);color:#fff;display:flex;align-items:center;justify-content:center;font:600 16px/1 'Cormorant Garamond',serif}
.rp-ava.s{width:38px;height:38px;font-size:14px}
.rp-person b{font:600 15px/1.25 Inter;display:block}
.rp-person small{font:400 12.5px/1.45 Inter;color:var(--muted);display:block}
.rp-fall{display:flex;gap:11px;align-items:center;padding:10px 0;border-bottom:1px solid var(--hair2)}
.rp-fall:last-child{border-bottom:none;padding-bottom:0}
.rp-fall b{font:600 14.5px/1.2 Inter;display:block}
.rp-fall small{font:400 12.5px/1.3 Inter;color:var(--muted)}
.rp-fall>div{flex:1}
.rp-pill{font:700 11.5px/1 Inter;border-radius:99px;padding:6px 10px;white-space:nowrap}
.rp-pill.vor{background:#f6ecd9;color:#b58a3e}
.rp-pill.in{background:var(--sage-soft);color:var(--sage-deep)}
/* Formular */
.rp-form{display:grid;grid-template-columns:1fr;gap:10px}
.rp-field label{font:600 12.5px/1 Inter;color:var(--muted);display:block;margin-bottom:5px}
.rp-field input,.rp-field select{width:100%;font-size:16px;padding:12px;border:1px solid var(--brass-soft);border-radius:11px;min-height:46px;background:#fff}
.rp-check{display:flex;align-items:center;gap:8px;font:500 13.5px/1.3 Inter;margin:12px 0}
.rp-check input{width:auto;min-height:0}
.rp-upload{border:1.5px dashed #bca37d;border-radius:12px;padding:18px;text-align:center;color:#9B8573;font:500 13.5px/1.3 Inter;margin-bottom:14px;background:#fdfbf7}
.rp-cta{display:block;width:100%;background:var(--brass-grad);color:#fff;border:none;border-radius:99px;padding:14px 18px;font:600 15px/1 Inter;min-height:48px;cursor:pointer;box-shadow:0 4px 14px rgba(155,133,115,.35)}
.rp-cta.ghost{background:var(--ink);box-shadow:none;margin-top:10px}
@keyframes rpFlash{0%{box-shadow:0 0 0 3px rgba(205,176,131,.9)}100%{box-shadow:0 0 0 3px rgba(205,176,131,0)}}
.rp-card.flash{animation:rpFlash 1.2s ease-out 1}
/* Kontakt */
.rp-kontakt p{font:400 14px/1.5 Inter;color:var(--ink-soft);margin:0 0 4px}
/* Einblick */
.rp-pat{display:grid;grid-template-columns:1fr;gap:16px}
.rp-pathead{display:flex;gap:12px;align-items:center;margin-bottom:12px}
.rp-pathead>div{flex:1}
.rp-pathead b{font:600 16.5px/1.2 Inter;display:block}
.rp-pathead small{font:400 12.5px/1.35 Inter;color:var(--muted)}
.rp-tag{font:700 11.5px/1 Inter;background:var(--brass-soft);color:var(--brass-deep);border-radius:99px;padding:6px 10px;white-space:nowrap}
.rp-tag.ok{background:var(--sage-soft);color:var(--sage-deep)}
.rp-stay{position:relative;height:8px;background:#EFEAE3;border-radius:99px;margin:0 0 14px}
.rp-stay .fill{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#bca37d,#9B8573);border-radius:99px}
.rp-kurz{font:400 14.5px/1.55 Inter;color:var(--ink-soft);margin:0 0 12px}
.rp-labs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
.rp-lab{background:#fff;border:1px solid var(--hair2);border-radius:11px;padding:10px;text-align:center}
.rp-lab span{display:block;font:600 10.5px/1 Inter;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);margin-bottom:4px}
.rp-lab b{font:700 15px/1 Inter}
.rp-tl{border-left:2px solid #cdb083;padding:2px 0 10px 12px;margin-left:3px}
.rp-tl small{color:var(--brass-deep);font:700 11.5px/1 Inter}
.rp-tl p{font:400 13.5px/1.45 Inter;margin:3px 0 0}
.rp-call{display:inline-block;margin-top:6px;background:var(--sage);color:#fff;border-radius:99px;padding:11px 16px;font:600 13.5px/1 Inter;text-decoration:none}
.rp-patrings{display:flex;flex-direction:row;gap:14px;align-items:flex-start;justify-content:flex-start}
/* Abschluss */
.rp-outcome{display:flex;flex-direction:column;gap:2px;background:#fdf6e8;border:1px solid var(--brass-line);border-radius:14px;padding:16px 18px;margin:12px 0 16px}
.rp-outcome .k{font:600 11.5px/1 Inter;letter-spacing:.1em;text-transform:uppercase;color:var(--brass-deep)}
.rp-outcome .v{font:700 34px/1.1 'Cormorant Garamond',serif;color:var(--ink)}
.rp-outcome .v i{font-style:normal;color:#cdb083}
.rp-outcome .s{font:500 13px/1.4 Inter;color:var(--muted)}
.rp-docs{display:grid;grid-template-columns:1fr;gap:10px;margin:0 0 16px}
.rp-doc{display:flex;flex-direction:column;align-items:flex-start;gap:2px;background:#fff;border:1px solid var(--hair);border-radius:13px;padding:14px;cursor:pointer;text-align:left;transition:transform .15s ease,box-shadow .15s ease}
.rp-doc span{font-size:20px}
.rp-doc b{font:600 14.5px/1.2 Inter}
.rp-doc small{font:400 12px/1 Inter;color:var(--faint)}
@media(hover:hover){.rp-doc:hover{transform:translateY(-2px);box-shadow:0 8px 18px rgba(31,28,28,.1);border-color:var(--brass-line)}}
.rp-recs h4,.rp-med h4{font:600 12px/1 Inter;letter-spacing:.1em;text-transform:uppercase;color:var(--brass-deep);margin:0 0 8px}
.rp-rec{font:400 14px/1.5 Inter;padding:7px 0;border-bottom:1px solid var(--hair2);color:var(--ink-soft)}
.rp-rec:last-child{border-bottom:none}
.rp-recs{margin-bottom:14px}
.rp-med p{font:400 14px/1.5 Inter;color:var(--ink-soft);margin:0 0 10px}
/* Motion (reduced-motion-safe: opacity 0 NUR im from) */
@keyframes rpUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.rp-body>*{animation:rpUp .45s cubic-bezier(.4,0,.2,1) both}
.rp-body>*:nth-child(2){animation-delay:.06s}
.rp-body>*:nth-child(3){animation-delay:.12s}
.rp-body>*:nth-child(4){animation-delay:.18s}
.rp-body>*:nth-child(n+5){animation-delay:.24s}
.rp-hero{animation:rpUp .4s cubic-bezier(.4,0,.2,1) both}
/* Desktop ≥900px */
@media(min-width:900px){
 .rp-hero{padding:40px 40px 0}
 .rp-greet{font-size:42px}
 .rp-sub{font-size:15.5px}
 .rp-tab{padding:12px 8px 16px}
 .rp-tab span{font-size:15px}
 .rp-two{grid-template-columns:1fr 1fr}
 .rp-form{grid-template-columns:1fr 1fr}
 .rp-team{grid-template-columns:1fr 1fr}
 .rp-docs{grid-template-columns:repeat(3,1fr)}
 .rp-pat{grid-template-columns:1fr 220px}
 .rp-patrings{flex-direction:column;gap:18px;align-items:center;border-left:1px solid var(--hair2);padding-left:20px;justify-content:center}
 .rp-labs{grid-template-columns:repeat(3,220px)}
 .rp-card{padding:24px}
}
```

- [x] **Step 2: Verifizieren**
`grep -c "ZUWEISER-PREMIUM-SUITE" index.html` → 1. JS-Parse OK (CSS-only, Sanity). Seite laden: keine visuellen Änderungen an bestehenden Views (Namespace ungenutzt).

- [x] **Step 3: Commit**
```bash
git add index.html && git commit -m "feat(zuweiser-suite): CSS-Namespace .rp-* — Hero, Tabs, Karten, Belegung, Formular, Motion"
```

---

### Task 3: Suite-Rahmen — `renderSuite` + Tabs + `openReferrer`-Umbau

**Files:** Modify: `index.html`

**Does NOT cover:** Inhalt der drei Screens (Tasks 4–6); bis dahin rendern die ALTEN Body-Funktionen innerhalb des neuen Rahmens (funktional OK, optisch gemischt — akzeptiert bis Task 6).

- [x] **Step 1: `openReferrer` ersetzen und `renderSuite`/`rpTab` davor einfügen** — bestehende Funktion `openReferrer` (beginnt `function openReferrer(screen,zName){`) komplett ersetzen durch:

```js
function renderSuite(screen,zName){
 const p=rpPersona(zName);
 const greet=p.name?"Herzlich willkommen, "+escapeHtml(p.name):"Herzlich willkommen";
 const tabs=[["portal","vor der Reha","Portal"],["einblick","in der Reha","Behandlungs-Einblick"],["abschluss","nach der Reha","Abschlusspaket"]];
 const body=screen==="einblick"?renderEinblick(zName):screen==="abschluss"?renderAbschluss(zName):renderPortal(zName);
 return `<section class="rp-hero">
   <div class="rp-mark">Klinik Bavaria · Zuweiser-Portal</div>
   <h1 class="rp-greet">${greet}</h1>
   <p class="rp-sub">${escapeHtml(p.inst)} · Schön, dass Sie bei uns sind.</p>
   <nav class="rp-tabs">${tabs.map(([k,ph,t])=>`<button class="rp-tab${k===screen?" on":""}" onclick="rpTab('${k}','${escapeHtml(zName)}')"><small>${ph}</small><span>${t}</span></button>`).join("")}</nav>
  </section>
  <div class="rp-body">${body}</div>`;
}
function rpTab(screen,zName){
 document.getElementById("refBody").innerHTML=renderSuite(screen,zName);
 document.getElementById("refOverlay").scrollTop=0;
}
function openReferrer(screen,zName){
 const ov=document.getElementById("refOverlay");
 document.getElementById("refWho").textContent="Zuweiser-Ansicht · "+zName;
 document.getElementById("refBody").innerHTML=renderSuite(screen||"portal",zName);
 ov.classList.add("open");ov.setAttribute("aria-hidden","false");document.body.classList.add("locked");
 ov.scrollTop=0;
}
```

(`closeReferrer` und der Esc-Listener bleiben unverändert.)

- [x] **Step 2: Verifizieren**
JS-Parse OK. Chrome: Matrix → jede der 3 B2B-Zellen öffnet Overlay mit Hero „Herzlich willkommen, Herr Brenner" + korrektem aktiven Tab; Tab-Wechsel funktioniert; Esc schließt. Zuweiser-Karte „Privatpraxis Dr. Neumann" → Begrüßung „…, Dr. Neumann". „Reha-Technik Müller" (`ap:"noch offen"`) → nur „Herzlich willkommen" + Institution.

- [x] **Step 3: Commit**
```bash
git add index.html && git commit -m "feat(zuweiser-suite): Suite-Rahmen — Hero mit Persona-Begrüßung, Sub-Nav-Tabs, openReferrer-Umbau"
```

---

### Task 4: Portal-Screen + Prefill

**Files:** Modify: `index.html`

- [x] **Step 1: `renderPortal` komplett ersetzen** (alte Funktion beginnt `function renderPortal(zName){`) **und `rpPrefill` dahinter einfügen:**

```js
function renderPortal(zName){
 const wk=["KW 1","KW 2","KW 3","KW 4"];
 const news=`<div class="rp-card rp-news"><h3>Aktuelles von Klinik Bavaria</h3>`
  +portalNews.map(n=>`<div class="rp-newsrow"><span class="rp-date">${n.d}</span><div><b>${escapeHtml(n.t)}</b><small>${escapeHtml(n.s)}</small></div></div>`).join("")+`</div>`;
 const cls=n=>n===0?"none":n<=1?"tight":"free";
 const bel=`<div class="rp-card"><h3>Freie Plätze</h3><p class="rp-hint">Tippen Sie auf eine freie Woche — die Anmeldung wird vorausgefüllt.</p>
  <div class="rp-belgrid"><span class="hd">Achse</span>${wk.map(w=>`<span class="hd c">${w}</span>`).join("")}
  ${belegung.map(b=>`<span class="rp-achse">${escapeHtml(b.achse)}</span>`+b.frei.map((n,i)=>n>0?`<button class="rp-bel ${cls(n)}" onclick="rpPrefill('${escapeHtml(b.achse)}','KW ${i+1}')">${n}</button>`:`<span class="rp-bel none">0</span>`).join("")).join("")}</div>
  <div class="rp-legend"><span class="free">frei</span><span class="tight">knapp</span><span class="none">belegt</span></div></div>`;
 const team=`<div class="rp-card"><h3>Ihre Ansprechpartner</h3><span class="rp-badge">Rückmeldung &lt; 24 h</span><div class="rp-team">`
  +portalTeam.map(t=>`<div class="rp-person"><span class="rp-ava">${initialen(t.name)}</span><div><b>${escapeHtml(t.name)}</b><small>${escapeHtml(t.rolle)}</small><small>${escapeHtml(t.tel)} · ${escapeHtml(t.mail)}</small></div></div>`).join("")+`</div></div>`;
 const form=`<div class="rp-card" id="rpAnmeldung"><h3>Patient anmelden</h3>
  <div class="rp-form">
   <div class="rp-field"><label>Name des Patienten</label><input id="rpName" placeholder="z. B. Max Mustermann"></div>
   <div class="rp-field"><label>Fachbereich</label><select id="rpFach"><option>Orthopädie</option><option>Neurologie</option><option>Geriatrie</option><option>SalutoCare</option></select></div>
   <div class="rp-field"><label>Wunschtermin</label><input id="rpTermin" placeholder="KW / Datum"></div>
   <div class="rp-field"><label>Kostenträger</label><select><option>PKV</option><option>GKV + Komfort</option><option>Beihilfe</option><option>Selbstzahler</option></select></div>
  </div>
  <label class="rp-check"><input type="checkbox" checked> Dieser Patient kommt direkt von mir</label>
  <div class="rp-upload">📎 Unterlagen hierher ziehen oder tippen (Demo)</div>
  <button class="rp-cta" onclick="refToast()">Patient anmelden</button></div>`;
 const faelleRows=`<div class="rp-card"><h3>Meine angemeldeten Fälle</h3>`
  +portalFaelle.map(f=>`<div class="rp-fall"><span class="rp-ava s">${initialen(f.name)}</span><div><b>${escapeHtml(f.name)}</b><small>${escapeHtml(f.achse)} · seit ${f.d}</small></div><span class="rp-pill ${f.phase}">${escapeHtml(f.status)}</span></div>`).join("")+`</div>`;
 const kontakt=`<div class="rp-card rp-kontakt"><h3>Kontakt</h3><p>Direktdurchwahl 0971 0000-180<br>zuweiser@demo-bavaria.local</p><button class="rp-cta ghost" onclick="refToast()">Wir rufen Sie zurück</button></div>`;
 return news+`<div class="rp-two">${bel}${team}</div>`+form+`<div class="rp-two">${faelleRows}${kontakt}</div>`;
}
function rpPrefill(achse,kw){
 const f=document.getElementById("rpFach"),t=document.getElementById("rpTermin"),card=document.getElementById("rpAnmeldung");
 if(f)f.value=achse; if(t)t.value=kw;
 if(card){card.scrollIntoView({behavior:"smooth",block:"center"});card.classList.remove("flash");void card.offsetWidth;card.classList.add("flash");}
}
```

- [x] **Step 2: Verifizieren**
JS-Parse OK. Chrome 1440: Portal zeigt News → (Plätze | Team) 2-spaltig → Formular 2-spaltig → (Fälle | Kontakt); Klick „Geriatrie · KW 2" setzt `rpFach`=Geriatrie + `rpTermin`=„KW 2", scrollt, Gold-Flash sichtbar; 0-Zellen nicht klickbar. 390: alles einspaltig, kein Overflow.

- [x] **Step 3: Commit**
```bash
git add index.html && git commit -m "feat(zuweiser-suite): Portal — News, klickbare Belegung mit Prefill, Ansprechpartner, Anmeldung, Fälle, Kontakt"
```

---

### Task 5: Behandlungs-Einblick

**Files:** Modify: `index.html`

- [x] **Step 1: `renderEinblick` komplett ersetzen:**

```js
function renderEinblick(zName){
 return `<p class="rp-lead">Die ärztliche Sicht auf Ihre Patienten — Kurzbericht, Verlauf und aktuelle Werte, ohne interne Steuerungs-KPIs.</p>`
 +inReha.map(p=>{
  const stayPct=Math.min(100,p.verweildauer.ist/p.verweildauer.plan*100);
  return `<div class="rp-card rp-pat">
   <div class="rp-patmain">
    <div class="rp-pathead"><span class="rp-ava">${initialen(p.name)}</span><div><b>${escapeHtml(p.name)} (${p.alter})</b><small>${escapeHtml(p.achse)} · ${escapeHtml(p.icd)}</small></div><span class="rp-tag">Reha-Tag ${p.verweildauer.ist}/${p.verweildauer.plan}</span></div>
    <div class="rp-stay"><div class="fill" style="width:${stayPct}%"></div></div>
    <p class="rp-kurz">${escapeHtml(p.kurzbericht)}</p>
    <div class="rp-labs">${p.labor.map(l=>`<div class="rp-lab"><span>${escapeHtml(l.k)}</span><b>${escapeHtml(l.v)}</b></div>`).join("")}</div>
    <div class="rp-verlauf">${p.eintraege.map(e=>`<div class="rp-tl"><small>${escapeHtml(e.d)}</small><p>${escapeHtml(e.txt)}</p></div>`).join("")}</div>
    <a class="rp-call" href="#" onclick="refToast();return false">☎ Rücksprache mit dem Behandlungsteam</a>
   </div>
   <div class="rp-patrings">${kpiRing(p.barthel.akt,100,"Barthel","▲ "+(p.barthel.akt-p.barthel.auf))}${kpiRing(p.fim.akt,126,"FIM","▲ "+(p.fim.akt-p.fim.auf))}</div>
  </div>`;}).join("");
}
```

- [x] **Step 2: Verifizieren**
JS-Parse OK. Chrome 1440: 3 Patienten-Karten, Ringe rechts in eigener Spalte mit Trennlinie; 390: Ringe unter dem Text nebeneinander, kein Overflow. Tab „Behandlungs-Einblick" direkt aus Matrix-Zelle öffnet korrekt.

- [x] **Step 3: Commit**
```bash
git add index.html && git commit -m "feat(zuweiser-suite): Behandlungs-Einblick — Premium-Patientenkarten mit KPI-Ringen, Laborkacheln, Zeitleiste"
```

---

### Task 6: Abschlusspaket

**Files:** Modify: `index.html`

- [x] **Step 1: `renderAbschluss` komplett ersetzen:**

```js
function renderAbschluss(zName){
 const d=entlassDoc;
 return `<p class="rp-lead">Was Sie als zuweisendes Haus zum Reha-Abschluss erhalten — kompakt, vollständig, ohne Nachtelefonieren.</p>
 <div class="rp-card">
  <div class="rp-pathead"><span class="rp-ava">${initialen(d.pat)}</span><div><b>${escapeHtml(d.pat)}</b><small>${escapeHtml(d.achse)} · ${escapeHtml(d.diagnose)} · Aufenthalt ${escapeHtml(d.aufenthalt)}</small></div><span class="rp-tag ok">entlassen ${escapeHtml(d.entlassen)}</span></div>
  <div class="rp-outcome"><span class="k">Barthel-Index</span><span class="v">${d.barthel.auf} <i>→</i> ${d.barthel.ent}</span><span class="s">Reha-Ziel erreicht · Entlassung nach Hause mit ambulanter Anschlussversorgung</span></div>
  <div class="rp-docs">
   <button class="rp-doc" onclick="refToast()"><span>📄</span><b>Arztbrief</b><small>PDF · Demo</small></button>
   <button class="rp-doc" onclick="refToast()"><span>📄</span><b>Kurzbericht</b><small>PDF · Demo</small></button>
   <button class="rp-doc" onclick="refToast()"><span>📄</span><b>Medikationsplan</b><small>PDF · Demo</small></button>
  </div>
  <div class="rp-recs"><h4>Empfehlungen</h4>${d.empfehlungen.map(r=>`<div class="rp-rec">✓ ${escapeHtml(r)}</div>`).join("")}</div>
  <div class="rp-med"><h4>Medikation</h4><p>${escapeHtml(d.medikation)}</p></div>
  <a class="rp-call" href="#" onclick="refToast();return false">☎ Rücksprache: ${escapeHtml(d.ruecksprache)}</a>
 </div>`;
}
```

- [x] **Step 2: Verifizieren**
JS-Parse OK. Chrome 1440: Ergebnis-Highlight „45 → 85" groß in Gold-Karte, 3 Dokument-Kacheln nebeneinander mit Hover-Lift; 390: Kacheln gestapelt, kein Overflow.

- [x] **Step 3: Commit**
```bash
git add index.html && git commit -m "feat(zuweiser-suite): Abschlusspaket — Outcome-Highlight, Dokument-Kacheln, Empfehlungen, Rücksprache"
```

---

### Task 7: Cross-Screen-Verifikation (Orchestrator)

**Files:** keine Änderung (nur bei Findings)

- [x] **Step 1: Voll-Durchlauf Chrome MCP** — bei **1440** und **390 (emulate 390x844x3,mobile,touch)**:
  - Alle 3 Matrix-B2B-Zellen → richtige Tabs aktiv, Hero korrekt.
  - Zuweiser-Karten-Button (Leopoldina → „Herr Brenner"; Dr. Neumann → „Dr. Neumann"; Reha-Technik Müller → Fallback ohne Namen).
  - Belegungs-Klick-Prefill, Tab-Wechsel in beide Richtungen, Esc + Zurück-Button.
  - 0 horizontaler Overflow auf beiden Breiten, 0 Console-Errors.
  - Interne Views (Heute/Fälle/Netzwerk/Matrix/System) unverändert.
- [x] **Step 2: Findings fixen + amend/fixup-Commit,** dann finishing-a-development-branch (pull → merge→main → Live-Deploy).

---

## Self-Review
- **Spec-Coverage:** Hero+Persona (T1/T3), Sub-Nav (T3), News (T1/T4), klickbare Belegung+Prefill (T4), Ansprechpartner (T1/T4), Formular (T4), Fälle-Zeilen (T1/T4), Kontakt (T4), Einblick-KPI-Ringe (T5), Outcome+Dokument-Kacheln (T6), Motion/reduced-motion (T2), Fallback-Persona (T1/T3-Verify), Verifikation (T7). ✓ vollständig.
- **Platzhalter:** keine. Aller Code ausgeschrieben.
- **Konsistenz:** `rpPersona/rpTab/rpPrefill/renderSuite`-Namen, IDs `rpFach/rpTermin/rpAnmeldung`, Datenfelder (`portalNews.d/t/s`, `portalTeam.name/rolle/tel/mail`, `portalFaelle.phase` ∈ {vor,in}, `entlassDoc.barthel.auf/ent`) stimmen taskübergreifend überein. `initialen()`/`kpiRing()`/`escapeHtml()`/`refToast()` existieren im Bestand. ✓
