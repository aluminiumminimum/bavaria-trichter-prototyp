# Desktop-App-Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-optimized:subagent-driven-development (recommended) or superpowers-optimized:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ab ≥1024px wird der Prototyp eine vollwertige Desktop-App (fixe Sidebar + Topbar, Master-Detail-Schienen für Fälle & Datenbank, Multi-Column-Reflow, Animationen); unter 1024px bleibt die Mobile-Ansicht byte-for-byte unverändert.

**Architecture:** Single-file `index.html` (inline `<style>` + `<script>`, keine Build-Tools). Alle Desktop-Regeln liegen in zusätzlichen `@media(min-width:1024px)`-Blöcken; neue Chrome-Elemente (Sidebar/Topbar/DB-Inspector) sind auf Mobile `display:none`. Sidebar+Topbar sind `position:fixed` → kein DOM-Umbau. Master-Detail = das bestehende Vollbild-Modal `#ovDetail` wird auf Desktop per CSS zur angedockten rechten Schiene; Content weicht per `margin-right` aus. Scroll-Lock wird getrennt: Detail nutzt neue Body-Klasse `detail-open` (ohne Lock auf Desktop), Sheet/Referrer behalten `body.locked`.

**Tech Stack:** HTML5, CSS3 (Custom Properties, Grid, `@media`, `position:fixed`), Vanilla JS (`matchMedia`, `classList`). Keine Dependencies.

**Assumptions:**
- Assumes `index.html` hat **genau einen** `<style>`- und **genau einen** `<script>`-Block — will NOT work cleanly if mehrere existieren (CSS-Blöcke werden vor `</style>` eingefügt, JS-Edits ankern an eindeutigen Strings).
- Assumes `bestand[]`-Items haben immer `name`, `achse`, `consent`; `alter`/`stufe`/`quelle`/`entl`/`anlass`/`owner` sind optional — Inspector guarded gegen fehlende Felder. Will NOT work korrekt wenn `name` fehlt.
- Assumes „Desktop" == `matchMedia('(min-width:1024px)').matches`. Rail/Inspector sind desktop-only: auf Mobile no-op'd `openDbDetail`, `#ovDetail` bleibt Vollbild-Modal. Will NOT show docked rails unter 1024px (Absicht).
- Assumes der globale `prefers-reduced-motion`-Block (bereits in der Datei, ~Zeile 608/677) neutralisiert neue Animationen/Transitions automatisch.

---

## File Structure

- **Modify only:** `/Users/andreschlender/Projects/Arasch/index.html`
  - HTML: 2 neue Chrome-Blöcke (`.dsidebar` + `.dtopbar`) vor `<div class="app">`; 1 neues Rail-Element (`#dbDetail`) bei den Overlays.
  - CSS: mehrere zusätzliche `@media(min-width:1024px)`-Blöcke vor `</style>`, jeder mit Task-Kommentar-Marker.
  - JS: minimale Edits in `go()`, `openDetail()`, `closeDetail()`, `renderBestand()` + neue Funktionen `openDbDetail()`/`closeDbDetail()` + Init-Zeile.

Jeder Task fügt einen eigenen, klar markierten `@media`-Block hinzu (keine Edits *innerhalb* fremder Blöcke) → Tasks bleiben unabhängig.

## Verifikations-Helfer (in mehreren Tasks genutzt)

**JS-Syntax-Parse (kein Ausführen, nur Syntax):**
```bash
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const m=h.match(/<script>([\s\S]*)<\/script>/);if(!m){console.error('no script block');process.exit(1);}new Function(m[1]);console.log('JS OK')"
```
Expected: `JS OK` (wirft bei Syntaxfehler).

**Visual-Gate (Orchestrator, nicht Subagent):** Chrome MCP — `emulate 1440x900` (Desktop-Shell) **und** `emulate 390x844x3,mobile` (Mobile-Regression). Pro sichtbarem Task beide Viewports prüfen: 0 Console-Errors, kein horizontaler Scroll.

---

### Task 1: Desktop App-Shell — Sidebar + Topbar + Layout + Nav-Sync

**Files:**
- Modify: `index.html`

**Does NOT cover:** Master-Detail-Schienen (Task 2/3), Content-Reflow innerhalb der Views (Task 4/5), Animationen über die Basis-Hover/Active hinaus (Task 6). Sidebar zeigt **keinen** Fälle-Badge (bewusst weggelassen). Unter 1024px ändert dieser Task nichts (Chrome ist `display:none`, `go()`-Selektor trifft nur die sichtbare Tabbar).

- [ ] **Step 1: Shell-DOM einfügen** — direkt **vor** der Zeile `<div class="app">` einfügen. Die fünf `<svg>…</svg>` jeweils **verbatim aus dem passenden `.tabbar [data-nav="…"]`-Button** kopieren (gleiche Icons):

```html
<!-- ============ DESKTOP SHELL (≥1024px) ============ -->
<aside class="dsidebar" aria-label="Desktop-Navigation">
  <div class="ds-brand"><span class="ds-mono serif">KB</span><span class="ds-brandtxt"><b class="serif">Klinik Bavaria</b><small>Concierge OS</small></span></div>
  <nav class="ds-nav">
    <button data-nav="heute"><!-- SVG aus tabbar [data-nav=heute] --><span>Heute</span></button>
    <button data-nav="faelle"><!-- SVG aus tabbar [data-nav=faelle] --><span>Fälle</span></button>
    <button data-nav="netzwerk"><!-- SVG aus tabbar [data-nav=netzwerk] --><span>Netzwerk</span></button>
    <button data-nav="matrix"><!-- SVG aus tabbar [data-nav=matrix] --><span>Matrix</span></button>
    <button data-nav="system"><!-- SVG aus tabbar [data-nav=system] --><span>System</span></button>
  </nav>
  <button class="ds-cta btn-brass" onclick="openSheetNeu()">＋ Neue Anfrage</button>
</aside>
<header class="dtopbar">
  <div class="dt-titles"><h2 id="dtopTitle" class="serif">Heute</h2><span id="dtopSub"></span></div>
  <div class="dt-actions"><span id="dtopDate" class="dt-date num"></span><button class="btn-brass btn-sm" onclick="openSheetNeu()">Neue Anfrage</button><span class="dt-ava serif">KB</span></div>
</header>
```

- [ ] **Step 2: CSS einfügen** — direkt **vor** `</style>`:

```css
/* ===== DESKTOP TASK 1 — App-Shell (Sidebar + Topbar + Layout) ===== */
.dsidebar,.dtopbar{display:none}
@media(min-width:1024px){
  .dsidebar{display:flex;flex-direction:column;gap:4px;position:fixed;left:0;top:0;bottom:0;width:248px;z-index:75;
    background:linear-gradient(180deg,#272320,#1f1c1c);color:#e9e1d3;
    padding:22px 16px calc(18px + env(safe-area-inset-bottom));border-right:1px solid #322c28}
  .ds-brand{display:flex;align-items:center;gap:11px;padding:2px 6px 16px;margin-bottom:8px;border-bottom:1px solid rgba(188,163,125,.18)}
  .ds-mono{width:40px;height:40px;flex-shrink:0;border-radius:11px;background:radial-gradient(circle at 35% 30%,#3a332e,#262220);
    border:1px solid #8f7448;color:#d3b78a;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;letter-spacing:.05em}
  .ds-brandtxt{display:flex;flex-direction:column;line-height:1.2}
  .ds-brandtxt b{font-size:18px;color:#f4eee3;font-weight:700}
  .ds-brandtxt small{font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:#b29a76}
  .ds-nav{display:flex;flex-direction:column;gap:3px;margin-top:2px}
  .ds-nav button{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:11px 12px;border-radius:11px;
    color:#cbbfae;font-size:14.5px;font-weight:600;letter-spacing:.02em;position:relative;
    transition:background .16s ease,color .16s ease,transform .16s ease}
  .ds-nav button svg{width:22px;height:22px;stroke-width:1.9;opacity:.82;flex-shrink:0}
  .ds-nav button:hover{background:rgba(188,163,125,.10);color:#f1e7d6;transform:translateX(2px)}
  .ds-nav button.active{background:linear-gradient(90deg,rgba(188,163,125,.22),rgba(188,163,125,.05));color:#f6edda}
  .ds-nav button.active svg{opacity:1;color:#d3b78a}
  .ds-nav button.active::before{content:"";position:absolute;left:-16px;top:9px;bottom:9px;width:3px;border-radius:0 3px 3px 0;background:var(--brass-grad)}
  .ds-cta{margin-top:auto;width:100%}
  .dtopbar{display:flex;align-items:center;justify-content:space-between;gap:16px;position:fixed;top:0;left:248px;right:0;height:64px;z-index:70;
    background:rgba(251,250,248,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
    border-bottom:1px solid var(--hair);padding:0 30px;transition:right .28s cubic-bezier(.4,0,.2,1)}
  .dt-titles{display:flex;flex-direction:column;line-height:1.15}
  .dt-titles h2{margin:0;font-size:23px;font-weight:700;color:var(--ink)}
  .dt-titles span{font-size:12px;letter-spacing:.04em;color:var(--muted)}
  .dt-actions{display:flex;align-items:center;gap:16px}
  .dt-date{font-size:13px;color:var(--muted);letter-spacing:.03em;text-transform:capitalize}
  .dt-ava{width:38px;height:38px;flex-shrink:0;border-radius:50%;background:var(--espresso-grad);color:#d3b78a;
    display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;border:1px solid #8f7448}
  /* Layout-Shift: Content rechts neben der Sidebar, Tabbar weg */
  .app{max-width:none;margin-left:248px}
  .content{max-width:1240px;margin:0 auto;padding:calc(64px + 26px) 40px 64px}
  .tabbar{display:none}
}
```

- [ ] **Step 3: JS — Nav-Sync + Topbar-Titel + Datum**

3a) In `function go(dest,seg)`: Selektor breiter fassen, damit Sidebar **und** Tabbar synchron aktiv werden. Ersetze
```js
  document.querySelectorAll(".tabbar [data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav===dest));
```
durch
```js
  document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav===dest));
  const TITLES={heute:["Heute","Cockpit · Überblick"],faelle:["Fälle","Anfragen · Board · In Reha"],netzwerk:["Netzwerk","Zuweiser · Datenbank"],system:["System","Idee · Auswertung · SOPs"],matrix:["Matrix","Patienten-Reise B2B / B2C"]};
  const _t=TITLES[dest]||TITLES.heute;
  const _tt=document.getElementById("dtopTitle");if(_tt)_tt.textContent=_t[0];
  const _ts=document.getElementById("dtopSub");if(_ts)_ts.textContent=_t[1];
```

3b) Click-Handler an Sidebar binden — denselben Handler wie die Tabbar nutzen. Ersetze
```js
document.querySelectorAll(".tabbar [data-nav]").forEach(b=>b.addEventListener("click",()=>{
```
durch
```js
document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>{
```

3c) Topbar-Datum einmalig setzen — direkt **nach** `applyHash();` (im Start-Block am Skriptende):
```js
(function(){const el=document.getElementById("dtopDate");if(el)el.textContent=heute.toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long"});})();
```

- [ ] **Step 4: Verify — Syntax-Parse**

Run: (Parse-Befehl oben)
Expected: `JS OK`

- [ ] **Step 5: Verify — Marker**

Run: `grep -c 'class="dsidebar"' index.html && grep -c 'DESKTOP TASK 1' index.html && grep -c 'id="dtopTitle"' index.html`
Expected: jeweils `1` (bzw. ≥1)

- [ ] **Step 6: Visual-Gate (Orchestrator)**
  - 1440×900: linke Sidebar + Topbar sichtbar, Tabbar weg. Klick auf jedes der 5 Sidebar-Items wechselt die View; aktiver Zustand **gleichzeitig** in Sidebar (Mobile-Tabbar versteckt); Topbar-Titel/Subtitel ändern sich; Datum steht rechts. Kein H-Scroll, 0 Errors.
  - 390×844: Sidebar/Topbar **unsichtbar**, Bottom-Tabbar sichtbar, Navigation unverändert. Identisch zu vorher.

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat(desktop): App-Shell — fixe Sidebar + Topbar + Nav-Sync ab 1024px"
```

---

### Task 2: Fälle Master-Detail — `#ovDetail` als angedockte Schiene + Scroll-Lock-Trennung

**Files:**
- Modify: `index.html`

**Does NOT cover:** Datenbank-Inspector (Task 3). Auf Mobile (<1024px) bleibt `#ovDetail` exakt das bisherige Vollbild-Modal **inkl.** `body.locked` — dieser Task ändert das Mobile-Verhalten nicht. Sheet (`#sheetNeu`) und Referrer (`#refOverlay`) bleiben überall Vollflächen-Modals (nutzen weiter `body.locked`).

- [ ] **Step 1: CSS — Rail + Content-Shift** — neuer Block **vor** `</style>`:

```css
/* ===== DESKTOP TASK 2 — Fälle Master-Detail (angedockte Schiene) ===== */
@media(min-width:1024px){
  /* #ovDetail: kein Vollbild-Dimmer, sondern rechte Schiene */
  #ovDetail{align-items:stretch;justify-content:flex-end;background:transparent;pointer-events:none}
  #ovDetail.open{pointer-events:none}              /* Backdrop fängt keine Klicks → Liste bleibt nutzbar */
  #ovDetail .modal{width:460px;max-width:460px;height:100dvh;max-height:100dvh;border-radius:0;
    border-left:1px solid var(--hair);box-shadow:-12px 0 44px rgba(31,28,28,.16);transform:translateX(28px)}
  #ovDetail.open .modal{transform:none;pointer-events:auto}
  #ovDetail .mbody.two-track{display:block}        /* in schmaler Schiene gestapelt statt 2-spaltig */
  #ovDetail .mbody.two-track .d-track-wrap{margin-top:18px}
  /* Content weicht aus → kein Overlap */
  .app{transition:margin-right .28s cubic-bezier(.4,0,.2,1)}
  body.detail-open .app{margin-right:460px}
  body.detail-open .dtopbar{right:460px}
}
```

- [ ] **Step 2: JS — `openDetail` lockt auf Desktop nicht** — in `function openDetail(id)` ersetze
```js
  document.getElementById("ovDetail").classList.add("open");
  document.body.classList.add("locked");
```
durch
```js
  const _db=document.getElementById("dbDetail");if(_db)_db.classList.remove("open");
  document.getElementById("ovDetail").classList.add("open");
  document.body.classList.add("detail-open");
  if(!matchMedia("(min-width:1024px)").matches)document.body.classList.add("locked");
```

- [ ] **Step 3: JS — `closeDetail` räumt `detail-open` mit auf** — ersetze den Body von `function closeDetail()`
```js
  document.getElementById("ovDetail").classList.remove("open");
  document.body.classList.remove("locked");
```
durch
```js
  document.getElementById("ovDetail").classList.remove("open");
  document.body.classList.remove("locked","detail-open");
```

- [ ] **Step 4: Verify — Syntax-Parse** → Expected: `JS OK`

- [ ] **Step 5: Verify — Marker**

Run: `grep -c 'DESKTOP TASK 2' index.html && grep -c 'detail-open' index.html`
Expected: `1` bzw. ≥`3` (CSS-Regeln + JS add/remove)

- [ ] **Step 6: Visual-Gate (Orchestrator)**
  - 1440×900: View „Fälle" → Klick auf einen Fall ⇒ Detail dockt als 460px-Schiene **rechts** an (kein Vollbild, kein Dimmer), Content + Topbar weichen nach links aus, Fall-Liste bleibt sichtbar & klickbar. „Speichern" funktioniert (Status ändern → Liste aktualisiert). „Schließen" entfernt Schiene + Shift. Werdegang+Felder in der Schiene gestapelt. 0 Errors, kein H-Scroll.
  - 390×844: Klick auf Fall ⇒ **Vollbild-Modal** wie bisher, Hintergrund gelockt. Unverändert.

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat(desktop): Fälle Master-Detail — #ovDetail als angedockte Inspector-Schiene"
```

---

### Task 3: Datenbank Master-Detail — read-only Inspector `#dbDetail`

**Files:**
- Modify: `index.html`

**Does NOT cover:** Schreiben/Editieren von Datenbank-Feldern (read-only; einzige Aktion = bestehende „Nachsorge vormerken" via `wiedervorlage`). Auf Mobile (<1024px) ist `#dbDetail` `display:none` **und** `openDbDetail` no-op't früh → Klick auf einen Datenbank-Namen tut auf Mobile nichts (wie heute). Inspector erscheint nur ab 1024px.

- [ ] **Step 1: DOM — Rail-Element einfügen** — direkt **nach** dem schließenden `</div>` des `#ovDetail`-Overlays (also nach `</div>` der Fall-Detail, vor `<script>`):

```html
<!-- ============ DATENBANK-INSPECTOR (Desktop) ============ -->
<div class="overlay dbrail" id="dbDetail" role="dialog" aria-modal="false" aria-label="Datenbank-Detail">
  <div class="modal">
    <div class="mhead"><div class="ava" id="dbAva"></div><div><h2 id="dbName"></h2><div class="msub2" id="dbSub"></div></div></div>
    <div class="mbody" id="dbBody"></div>
    <div class="mfoot"><button class="btn-ghost" onclick="closeDbDetail()">Schließen</button></div>
  </div>
</div>
```

- [ ] **Step 2: CSS — Inspector-Schiene** — neuer Block **vor** `</style>`:

```css
/* ===== DESKTOP TASK 3 — Datenbank Master-Detail (read-only Inspector) ===== */
.dbrail{display:none}
@media(min-width:1024px){
  #dbDetail{display:flex;align-items:stretch;justify-content:flex-end;background:transparent;pointer-events:none}
  #dbDetail .modal{width:460px;max-width:460px;height:100dvh;max-height:100dvh;border-radius:0;
    border-left:1px solid var(--hair);box-shadow:-12px 0 44px rgba(31,28,28,.16);transform:translateX(28px)}
  #dbDetail.open .modal{transform:none;pointer-events:auto}
  .db-openable{cursor:pointer;transition:color .15s ease}
  .db-openable:hover{color:var(--brass-deep)}
  .db-insp{display:flex;flex-direction:column;gap:14px}
  .di-auto{background:var(--brass-soft);border:1px solid var(--brass-line);border-radius:12px;padding:12px 14px;
    font-size:14px;font-weight:500;color:var(--brass-deep);line-height:1.4}
  .di-auto.blocked{background:#eeeae0;border-color:#ddd6ca;color:#8a8076}
  .di-rows{display:flex;flex-direction:column}
  .di-row{display:flex;justify-content:space-between;gap:14px;padding:9px 0;border-top:1px solid var(--hair2);font-size:14px}
  .di-row:first-child{border-top:0}
  .di-k{color:var(--muted);font-weight:600}
}
```

- [ ] **Step 3: JS — `openDbDetail` / `closeDbDetail`** — direkt **nach** `function wiedervorlage(i){…}` einfügen:

```js
function openDbDetail(i){
  if(!matchMedia("(min-width:1024px)").matches)return;          // Inspector nur Desktop
  const p=bestand[i];if(!p)return;
  const ov=document.getElementById("ovDetail");if(ov)ov.classList.remove("open");
  document.getElementById("dbAva").textContent=initialen(p.name);
  document.getElementById("dbName").textContent=p.name+(p.alter?" ("+p.alter+")":"");
  document.getElementById("dbSub").textContent=p.achse+" · Stufe "+(p.stufe||1)+(p.quelle?" · "+p.quelle:"");
  const cons=p.consent==="ja"?"<span class='status-pill ok'>freigegeben</span>":p.consent==="widerruf"?"<span class='status-pill bad'>Widerruf</span>":"<span class='status-pill lock'>gesperrt</span>";
  const action=p.consent==="ja"
    ?(p.wv?"<span class='wv'>Wiedervorlage gesetzt</span>":"<button class='btn-ghost btn-sm' onclick='wiedervorlage("+i+");openDbDetail("+i+")'>Nachsorge vormerken</button>")
    :"<button class='btn-brass btn-sm' disabled>Kontaktfreigabe fehlt</button>";
  document.getElementById("dbBody").innerHTML=
     "<div class='db-insp'>"
    +"<div class='di-auto"+(p.consent!=="ja"?" blocked":"")+"'>⟳ "+escapeHtml(autoFor(p))+"</div>"
    +"<div class='di-rows'>"
    +"<div class='di-row'><span class='di-k'>Einwilligung</span><span>"+cons+"</span></div>"
    +"<div class='di-row'><span class='di-k'>Achse</span><span>"+escapeHtml(p.achse)+"</span></div>"
    +"<div class='di-row'><span class='di-k'>Lead-Stufe</span><span>"+(p.stufe||1)+" · "+escapeHtml((typeof STUFE_LBL!=='undefined'&&STUFE_LBL[p.stufe])||"")+"</span></div>"
    +"<div class='di-row'><span class='di-k'>Quelle</span><span>"+escapeHtml(p.quelle||"Altpatient")+"</span></div>"
    +(p.entl&&p.entl!=="—"?"<div class='di-row'><span class='di-k'>Entlassen</span><span>"+escapeHtml(p.entl)+"</span></div>":"")
    +"<div class='di-row'><span class='di-k'>Verantwortlich</span><span>"+escapeHtml(p.owner||"—")+"</span></div>"
    +"</div>"
    +(p.anlass?"<div class='patient-reason'>"+escapeHtml(p.anlass)+"</div>":"")
    +"<div class='patient-actions'>"+action+"</div>"
    +"</div>";
  document.getElementById("dbDetail").classList.add("open");
  document.body.classList.add("detail-open");
}
function closeDbDetail(){
  document.getElementById("dbDetail").classList.remove("open");
  document.body.classList.remove("detail-open");
}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.getElementById("dbDetail").classList.contains("open"))closeDbDetail();});
```

- [ ] **Step 4: JS — Trigger in `renderBestand` verdrahten** (zwei surgische String-Edits):

4a) Listen-Modus Patientenname — ersetze
```js
        +"<h3>"+escapeHtml(p.name)+(p.alter?" <span class='alter'>("+p.alter+")</span>":"")+"</h3>"
```
durch
```js
        +"<h3 class='db-openable' onclick='openDbDetail("+i+")'>"+escapeHtml(p.name)+(p.alter?" <span class='alter'>("+p.alter+")</span>":"")+"</h3>"
```

4b) Board-Modus Lead-Name — ersetze
```js
       return "<div class='db-lead'><b>"+escapeHtml(p.name)+(p.alter?" · "+p.alter+" J.":"")+"</b><small>"+escapeHtml(p.achse)+" · Stufe "+p.stufe+" · "+escapeHtml(p.quelle)+"</small>"
```
durch
```js
       return "<div class='db-lead'><b class='db-openable' onclick='openDbDetail("+i+")'>"+escapeHtml(p.name)+(p.alter?" · "+p.alter+" J.":"")+"</b><small>"+escapeHtml(p.achse)+" · Stufe "+p.stufe+" · "+escapeHtml(p.quelle)+"</small>"
```

- [ ] **Step 5: Verify — Syntax-Parse** → Expected: `JS OK`

- [ ] **Step 6: Verify — Marker**

Run: `grep -c 'function openDbDetail' index.html && grep -c 'id="dbDetail"' index.html && grep -c 'db-openable' index.html`
Expected: `1`, `1`, ≥`3` (CSS + 2 Trigger)

- [ ] **Step 7: Visual-Gate (Orchestrator)**
  - 1440×900: Netzwerk → Datenbank. Klick auf einen Patientennamen (Liste **und** Board) ⇒ rechte Inspector-Schiene mit Automation (`autoFor`), Einwilligung/Achse/Stufe/Quelle/Verantwortlich, Anlass, Aktion. „Nachsorge vormerken" (bei Freigabe) setzt Wiedervorlage und aktualisiert. „Schließen"/Esc schließt. Content weicht aus (kein Overlap). 0 Errors.
  - 390×844: Datenbank-Karten unverändert; Klick auf Namen ⇒ **nichts** passiert (no-op). Wiedervorlage-Button in der Karte funktioniert wie bisher.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat(desktop): Datenbank Master-Detail — read-only Inspector via autoFor()"
```

---

### Task 4: Heute-Dashboard — Multi-Column-Reflow (CSS-only)

**Files:**
- Modify: `index.html`

**Does NOT cover:** Markup-Änderungen (rein CSS, keine DOM-Edits). Greift nur ab 1024px; <1024px bleibt Heute gestapelt. Nutzt `:nth-of-type` der drei `.chap`-Divs unter `#view-heute` — **gültig nur solange die Reihenfolge `header.greet` → `.chap`(Logik/Funnel) → `.chap`(idea-mini) → `.chap`(Heute wichtig) bleibt.** Bei geänderter Reihenfolge Selektoren anpassen.

- [ ] **Step 1: CSS einfügen** — neuer Block **vor** `</style>`:

```css
/* ===== DESKTOP TASK 4 — Heute-Dashboard (Multi-Column) ===== */
@media(min-width:1024px){
  #view-heute.view.active{display:grid;grid-template-columns:1fr 1fr;gap:26px 30px;align-items:start}
  #view-heute>.greet{grid-column:1/-1;margin:0}
  #view-heute>.chap:nth-of-type(1){grid-column:1/-1}   /* Logik + Funnel volle Breite */
  #view-heute>.chap{margin-top:0}                       /* idea-mini + Heute-wichtig je 1 Spalte */
}
```

- [ ] **Step 2: Verify — Marker**

Run: `grep -c 'DESKTOP TASK 4' index.html`
Expected: `1`

- [ ] **Step 3: Visual-Gate (Orchestrator)**
  - 1440×900: Heute = Dashboard: Begrüßungs-Hero volle Breite, darunter Logik/Funnel volle Breite, darunter „Nordstern/idea-mini" **und** „Heute wichtig" **nebeneinander** (2 Spalten). Kein H-Scroll, 0 Errors.
  - 390×844: Heute **gestapelt** wie bisher (keine Grid-Spalten). Unverändert.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(desktop): Heute als Multi-Column-Dashboard ab 1024px"
```

---

### Task 5: Netzwerk / System / Matrix — breitere Grids + 1320er Feinbreakpoint (CSS-only)

**Files:**
- Modify: `index.html`

**Does NOT cover:** Markup-Änderungen. Die Basis-Multi-Spalten (2–3 Spalten) existieren bereits ab 900px; dieser Task verbreitert Abstände ab 1024px und schaltet die dichten Grids ab 1320px auf 3 Spalten. Keine Änderung <1024px.

- [ ] **Step 1: CSS einfügen** — neuer Block **vor** `</style>`:

```css
/* ===== DESKTOP TASK 5 — breitere Grids + Feinbreakpoint ===== */
@media(min-width:1024px){
  .bestand-grid,.zgrid,.module-grid,.idea-grid{gap:18px}
  .matrix-grid{gap:16px}
}
@media(min-width:1320px){
  .zgrid,.bestand-grid{grid-template-columns:1fr 1fr 1fr}
  .module-grid{grid-template-columns:1fr 1fr 1fr}
}
```

- [ ] **Step 2: Verify — Marker**

Run: `grep -c 'DESKTOP TASK 5' index.html && grep -c 'min-width:1320px' index.html`
Expected: `1`, ≥`1`

- [ ] **Step 3: Visual-Gate (Orchestrator)**
  - 1440×900: Netzwerk (Zuweiser-Grid) & Datenbank-Liste **3-spaltig**; System→Auswertung Module 3-spaltig; Matrix 3-spaltig sauber. Kein H-Scroll, 0 Errors.
  - 1024–1280 (z.B. 1100): Grids 2-spaltig (nicht zu eng). 390×844: unverändert.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(desktop): breitere View-Grids + 3-spaltig ab 1320px"
```

---

### Task 6: Animationen-Feinschliff + Sheet/Referrer-Desktop-Polish + finale Verifikation

**Files:**
- Modify: `index.html`

**Does NOT cover:** Keine Repositionierung des Sheets/Referrers zu zentrierten Karten (Risiko) — nur Innenbreite begrenzen. Keine neuen Interaktionen. Reduced-Motion wird vom bestehenden globalen Block neutralisiert.

- [ ] **Step 1: CSS einfügen** — neuer Block **vor** `</style>`:

```css
/* ===== DESKTOP TASK 6 — Polish ===== */
@keyframes dsIn{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
@media(min-width:1024px){
  .dsidebar{animation:dsIn .42s ease both}
  .sheet-body{max-width:680px;margin:0 auto;width:100%}   /* Formular im Vollbild-Sheet zentriert */
  .ref-body{max-width:980px}
}
```

- [ ] **Step 2: Verify — Marker**

Run: `grep -c 'DESKTOP TASK 6' index.html`
Expected: `1`

- [ ] **Step 3: Verify — Syntax-Parse** → Expected: `JS OK`

- [ ] **Step 4: Finale Visual-Gate (Orchestrator) — voller Sweep**
  - **1440×900:** alle 5 Views via Sidebar; Sidebar-Einblendung animiert; Topbar-Titel korrekt; Fälle-Schiene + Datenbank-Inspector docken rechts, Content weicht aus, kein Overlap, kein H-Scroll; „Neue Anfrage"-Sheet zeigt zentriertes Formular; Referrer-Overlay max 980px. 0 Console-Errors.
  - **390×844 (Mobile-Regression = 0):** alle 5 Views, Bottom-Tabbar, Fall-Detail Vollbild-Modal + Lock, Datenbank-Klick no-op, Sheet/Referrer Vollfläche. **Byte-for-byte wie vor dem Branch.**
  - **Resize 1023 ↔ 1024:** sauberer Umschalt ohne Layout-Bruch / ohne H-Scroll.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(desktop): Polish — Sidebar-Einblendung, Sheet/Referrer-Desktop-Feinschliff"
```

---

## Self-Review

**1. Spec-Coverage:**
- Shell (Sidebar+Topbar+Layout+Nav-Sync) → Task 1 ✓
- Master-Detail Fälle (`#ovDetail` docked + `detail-open`/Lock-Trennung) → Task 2 ✓
- Master-Detail Datenbank (`#dbDetail` read-only via `autoFor`) → Task 3 ✓
- Multi-Column Heute-Dashboard → Task 4 ✓
- Multi-Column Netzwerk/System/Matrix → Task 5 ✓
- Animationen/Polish + reduced-motion → Task 6 (+ Hover/Active in Task 1, Slide in Task 2/3) ✓
- Non-Goal „keine echte Suche" → keine Suche im Plan ✓
- Verifikation 390px **und** 1440px → in jedem sichtbaren Task + finaler Sweep ✓
- Breakpoint 1024 / iPad-Hochformat bleibt Mobile → alle Desktop-Regeln `min-width:1024px` ✓

**2. Placeholder-Scan:** Keine „TBD/TODO/handle edge cases". Die einzigen Kommentar-Stubs sind die fünf `<!-- SVG aus tabbar … -->`-Marker in Task 1 Step 1 — bewusst (verbatim-Kopie der existierenden Icons, exakte Quelle benannt), kein vager Platzhalter.

**3. Typ-/Namens-Konsistenz:** `detail-open` (Task 2 CSS + Task 2/3 JS) konsistent. `openDbDetail`/`closeDbDetail`/`#dbDetail`/`#dbBody`/`#dbName`/`#dbSub`/`#dbAva` konsistent zwischen DOM (Task 3 Step 1), CSS (Step 2) und JS (Step 3). `.db-openable` in CSS (Task 3 Step 2) == Trigger-Klasse (Step 4). `#dtopTitle`/`#dtopSub`/`#dtopDate` konsistent zwischen DOM (Task 1 Step 1) und JS (Step 3). `STUFE_LBL`/`TEAM`/`escapeHtml`/`initialen`/`wiedervorlage`/`autoFor` sind bestehende Symbole (verifiziert in `renderBestand`).

Keine offenen Lücken.
