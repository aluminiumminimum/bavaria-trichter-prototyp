# Patienten-Matrix Expansion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-optimized:subagent-driven-development (recommended) or superpowers-optimized:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the single-file `index.html` prototype with Michael's 2×3 matrix as a new top-level view, a ClickUp-style Patient-Werdegang stepper, B2C lead-scoring (1–5), and clickable referrer-facing Zuweiser-Portal & -Dashboard demo screens.

**Architecture:** Additive changes to one self-contained file (`index.html`, inline CSS/JS). New data arrays at the top of `<script>`; new `render*()` functions wired through `renderAll()`; live numbers mirrored via `data-sync`/element ids. Existing 4 views and their renderers stay untouched. Mobile-first (390px); desktop ≥900px is the enhancement.

**Tech Stack:** Vanilla HTML/CSS/JS, no build, no dependencies. Hosted on GitHub Pages from `main` root. Fonts Cormorant Garamond + Inter; palette taupe `#9B8573` / sand `#bca37d` / beige `#E3D4C8` / espresso `#1F1C1C` / gold.

**Assumptions:**
- Assumes the repo has **no automated test runner** — verification is grep assertions + a manual/headless 390px browser smoke check. Will NOT apply if a test framework is later added (then convert checks to that).
- Assumes a 5-item bottom bar fits 390px. Will NOT hold if labels overflow → **fallback:** fold `System` into the Matrix view, returning to 4 visible nav items (see Task 2 gate).
- Assumes all data is synthetic/demo; no network, auth, or email is wired. Will NOT work as a real product without a backend (explicit non-goal).
- Assumes in-Reha / discharged patients are **new demo entities** (`tagesberichte`, `entlassDoc`), distinct from the pre-admission `faelle` pipeline — so matrix metrics never double-count.

---

## Verification approach (no-test-suite adaptation)

Each task's "test" is a **verification check** run before and after implementation:
- **Static:** `grep -c '<marker>' index.html` with an expected count, and `node --check` is not possible (HTML), so JS-syntax validity is confirmed by loading the page with no console error.
- **Render:** open `index.html` at a 390px viewport and confirm the listed visible outcomes. During execution this may be automated via the chrome-devtools MCP (resize 390px → screenshot/snapshot) or done manually.

Verify-first means: confirm the marker is **absent** (grep count 0 / feature missing) → implement → confirm **present** and rendering.

## File structure

Single file: **`index.html`**. Regions touched (current anchors):
- **Data block** (`let faelle` 1259 … `let zuweiser` 1294, ends ~1306): extend `bestand`/`faelle`, add `MATRIX`, `belegung`, `tagesberichte`, `entlassDoc`.
- **Views** (`<section id="view-…">`): add `view-matrix`; add `werdegang` sub to `view-faelle` (segments header ~962, sub-panels ~967-977).
- **Nav** (`.tabbar-inner` 1173-1176): add 5th button.
- **JS render/route** (`renderAll` 1649, `go` 1748, `SEGS`/`navState`): add renderers, extend `SEGS.faelle`, add referrer overlay fns.
- **CSS** (in `<style>`): add classes `.matrix*`, `.werdegang*`/`.stepper*`, `.tier*`, `.ref*` (referrer overlay).

Implementation order front-loads the highest-risk item (5th nav / 390px) right after the data it needs.

---

### Task 1: New + extended demo data

**Files:**
- Modify: `index.html` (data block, after `let zuweiser=[…];` ~line 1306)

**Does NOT cover:** rendering — these arrays are inert until later tasks read them. No `render*` change here, so existing views are unaffected.

- [ ] **Step 1: Confirm markers absent**

Run: `grep -cE 'const MATRIX|let belegung|let tagesberichte|const entlassDoc|stufe:' index.html`
Expected: `0`

- [ ] **Step 2: Extend `bestand[]` with scoring fields + passive leads**

Add `stufe` (1–5), `quelle`, `auto` to each existing `bestand` entry, and append 3 brochure/website passive leads. Replace the `let bestand=[…]` array (1283-1292) so every object has the new keys, e.g.:

```js
let bestand=[
 {name:"Margarete Wirth",alter:73,achse:"Orthopädie",entl:"vor 11 Monaten",consent:"ja",anlass:"Jahres-Check nach Knie-TEP steht an",wv:true, stufe:3,quelle:"Altpatient",auto:"Check-in-Mail alle 3 Monate"},
 {name:"Otto Brenner",alter:68,achse:"Neurologie",entl:"vor 14 Monaten",consent:"ja",anlass:"Nachsorge-Angebot Schlaganfall-Prävention",wv:false, stufe:3,quelle:"Altpatient",auto:"Halbjahres-Nachsorge-Mail"},
 {name:"Use Hartmann",alter:61,achse:"Innere",entl:"vor 8 Monaten",consent:"ja",anlass:"Einladung Gesundheitswoche möglich",wv:false, stufe:3,quelle:"Altpatient",auto:"Event-Einladung bei Belegungslücke"},
 {name:"Friedrich Lang",alter:77,achse:"Geriatrie",entl:"vor 6 Monaten",consent:"nein",anlass:"keine Einwilligung dokumentiert",wv:false, stufe:1,quelle:"Altpatient",auto:"gesperrt — keine Ansprache"},
 {name:"Hannelore Beck",alter:70,achse:"Orthopädie",entl:"vor 19 Monaten",consent:"nein",anlass:"keine Einwilligung dokumentiert",wv:false, stufe:1,quelle:"Altpatient",auto:"gesperrt — keine Ansprache"},
 {name:"Georg Steiner",alter:65,achse:"Neurologie",entl:"vor 9 Monaten",consent:"widerruf",anlass:"Widerruf am 03.05. dokumentiert",wv:false, stufe:1,quelle:"Altpatient",auto:"gesperrt — Widerruf"},
 {name:"Christa Mohr",alter:58,achse:"SalutoCare",entl:"vor 5 Monaten",consent:"ja",anlass:"Premium-Nachsorge, Recovery Manager kennt Fall",wv:true, stufe:4,quelle:"Altpatient",auto:"persönlicher Recovery-Manager-Kontakt"},
 {name:"Walter Simon",alter:80,achse:"Innere",entl:"vor 23 Monaten",consent:"nein",anlass:"keine Einwilligung dokumentiert",wv:false, stufe:1,quelle:"Altpatient",auto:"gesperrt — keine Ansprache"},
 {name:"Sabine Vogt",alter:54,achse:"Orthopädie",entl:"—",consent:"ja",anlass:"Reha-Broschüre geladen, Kontaktfreigabe erteilt, kein Anliegen",wv:false, stufe:2,quelle:"Broschüre-Download",auto:"1 Info-Mail nach 7 Tagen, dann ruhend"},
 {name:"Markus Pfeiffer",alter:60,achse:"SalutoCare",entl:"—",consent:"ja",anlass:"Premium-Broschüre geladen, Freigabe erteilt",wv:true, stufe:2,quelle:"Broschüre-Download",auto:"Premium-Nurture-Strecke (freigegeben)"},
 {name:"Unbekannt (Website)",alter:null,achse:"—",entl:"—",consent:"nein",anlass:"nur E-Mail hinterlegt, keine Freigabe angeklickt",wv:false, stufe:1,quelle:"Website-Mail",auto:"keine Ansprache erlaubt"}
];
```

- [ ] **Step 3: Add `schritte[]` to two exemplar `faelle` (active + passive)**

After the `let faelle=[…];` array (closes line 1272), append a helper that attaches canonical steps to two exemplar cases. Insert immediately after line 1272:

```js
/* Werdegang-Beispielschritte (nur für Demo-Fälle gesetzt; Rest wird generisch abgeleitet) */
faelle.find(f=>f.id===3).schritte=[
 {label:"Anfrage erhalten",who:"Website-Formular",ts:dstr(-2)+" 09:12",dauerMin:0,done:true},
 {label:"Empfang geprüft",who:"S. Koordination",ts:dstr(-2)+" 09:30",dauerMin:18,done:true},
 {label:"Erstkontakt raus",who:"S. Koordination",ts:dstr(-2)+" 12:14",dauerMin:164,done:true},
 {label:"Unterlagen vollständig",who:"T. Abrechnung",ts:dstr(-1)+" 16:00",dauerMin:null,done:false},
 {label:"Rehaplatz reserviert",who:"M. Belegung",ts:"",dauerMin:null,done:false},
 {label:"Antwort-Mail raus",who:"S. Koordination",ts:"",dauerMin:null,done:false}
];
/* Passiver Pfad: Broschüre + Freigabe, noch keine Anfrage → als Lead geführt */
const passivLead={id:201,name:"Sabine Vogt",alter:54,rolle:"Patient selbst",kanal:"Broschüre-Download",quelle:"Website (Broschüre)",achse:"Orthopädie",kt:"PKV",status:"Lead",owner:"—",aufgabe:"",frist:"",saluto:false,docs:[false,false,false,false],kosten:"—",consent:"Kontaktfreigabe erteilt",verlust:"",reaktion:null,
 schritte:[
  {label:"Broschüre geladen",who:"Website",ts:dstr(-3)+" 20:41",dauerMin:0,done:true},
  {label:"E-Mail hinterlegt + Freigabe angeklickt",who:"Patient",ts:dstr(-3)+" 20:41",dauerMin:0,done:true},
  {label:"Als Lead (Stufe 2) erfasst",who:"System",ts:dstr(-3)+" 20:42",dauerMin:1,done:true},
  {label:"Info-Mail geplant (nach 7 Tagen)",who:"Automation",ts:dstr(4),dauerMin:null,done:false}
 ],log:[]};
```

- [ ] **Step 4: Add `MATRIX`, `belegung`, `tagesberichte`, `entlassDoc`**

Append after the data block (after `let zuweiser=[…];`, line 1306):

```js
/* ----- Matrix-Konfiguration (2×3) ----- */
const MATRIX=[
 {row:"B2B",col:"vor",titel:"Zuweiser-Portal",zweck:"Anmeldung, Auslastung, Datei-Upload",metricId:"mxBBvor",status:"aufbau",route:["ref","portal"]},
 {row:"B2B",col:"in", titel:"Behandlungs-Einblick",zweck:"Tagesberichte für Zuweiser",metricId:"mxBBin", status:"geplant",route:["ref","dashboard"]},
 {row:"B2B",col:"nach",titel:"Abschluss-Paket",zweck:"Briefe, Empfehlungen, Rücksprache",metricId:"mxBBnach",status:"geplant",route:["ref","dashboard"]},
 {row:"B2C",col:"vor",titel:"Lead-Scoring & Bestand",zweck:"Stufe 1–5, Broschüren-Leads, Automation",metricId:"mxBCvor",status:"aufbau",route:["netzwerk","bestand"]},
 {row:"B2C",col:"in", titel:"Aufnahme-Trichter",zweck:"Anfrage → Aufnahme (live)",metricId:"mxBCin", status:"aktiv",route:["faelle","board"]},
 {row:"B2C",col:"nach",titel:"Nachsorge & Reaktivierung",zweck:"Wiedervorlagen, Altpatienten-Pflege",metricId:"mxBCnach",status:"aufbau",route:["netzwerk","bestand"]}
];
/* ----- Belegung je Achse × Woche (freie Plätze) — für Portal ----- */
let belegung=[
 {achse:"Orthopädie", frei:[2,1,3,4]},
 {achse:"Neurologie", frei:[1,0,2,2]},
 {achse:"Geriatrie",  frei:[3,2,2,1]},
 {achse:"SalutoCare", frei:[1,1,0,1]}
];
/* ----- Tagesberichte laufender Reha (in der Reha) — für Dashboard ----- */
let tagesberichte=[
 {pat:"Dieter Franke",tag:6,von:9,achse:"Orthopädie",eintraege:[
   {d:dstr(-1),txt:"Mobilisation an Unterarmgehstützen, 30 m Gehstrecke erreicht."},
   {d:dstr(-2),txt:"Schmerz unter Belastung NRS 3, Lymphdrainage begonnen."}]},
 {pat:"Elke Sauer",tag:4,von:14,achse:"SalutoCare",eintraege:[
   {d:dstr(-1),txt:"SalutoCare-Suite, Atemtherapie planmäßig, Werte stabil."},
   {d:dstr(-2),txt:"Erstgespräch Recovery Manager, Zielplan abgestimmt."}]}
];
/* ----- Demo-Entlassdokument (nach der Reha) — für Dashboard ----- */
const entlassDoc={pat:"Werner Adler",achse:"Geriatrie",entlassen:dstr(-3),
 brief:"Entlassbericht: geriatrische Komplexreha abgeschlossen, Gangbild stabilisiert, Hilfsmittel angepasst.",
 empfehlungen:["Ambulante Physiotherapie 2×/Woche, 6 Wochen","Sturzprophylaxe-Training","Wiedervorstellung Hausarzt in 2 Wochen"],
 ruecksprache:"0971 0000-100 (Recovery-Line, Mo–Fr 8–16 Uhr)"};
```

- [ ] **Step 5: Verify present + page still loads**

Run: `grep -cE 'const MATRIX|let belegung|let tagesberichte|const entlassDoc' index.html` → Expected: `4`
Open `index.html` in a browser → console shows **no error**; the 4 existing views still render (Heute funnel numbers unchanged).

- [x] **Step 6: Commit** — done `df1ecda`

---

### Task 2: Matrix view + 5th nav item (390px gate)

**Files:**
- Modify: `index.html` (nav 1173-1176; new `<section id="view-matrix">`; CSS; `renderMatrix()`; `renderAll` 1649)

**Does NOT cover:** the referrer screens themselves (Task 5/6) — B2B cells route via `["ref","portal"/"dashboard"]` which Task 5/6 wire up; until then those cells call a stub `openReferrer` that is added in Task 5. For Task 2, B2B cell taps may no-op gracefully (guard: `if(typeof openReferrer==='function')`).

- [ ] **Step 1: Confirm absent**

Run: `grep -cE 'data-nav="matrix"|id="view-matrix"|function renderMatrix' index.html`
Expected: `0`

- [ ] **Step 2: Add 5th nav button**

In `.tabbar-inner` (after the `system` button, line 1176), insert before `</div>`:

```html
    <button data-nav="matrix"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4" width="17" height="16" rx="1.6"/><path d="M3.5 12h17M9.5 4v16M15.5 4v16"/></svg>Matrix</button>
```

- [ ] **Step 3: Add the Matrix view section**

Insert a new `<section>` among the views (e.g. right after `view-netzwerk` closes, before `view-system` at line 1005):

```html
  <section id="view-matrix" class="view">
    <header class="vhead"><div class="kicker">Die ganze Maschine</div><h1>Matrix</h1>
      <p class="lblline">B2B · B2C  ×  vor · in · nach der Reha. Jede Zelle ist ein Bereich der Software.</p>
    </header>
    <div id="matrixGrid" class="matrix-grid"></div>
    <div class="legal" style="margin-top:14px"><b>Lesart:</b> ✓ aktiv · ⚙ im Aufbau · ○ geplant. Tippen öffnet den jeweiligen Bereich. Synthetische Demo-Daten.</div>
  </section>
```

- [ ] **Step 4: Add CSS (in `<style>`)**

Mobile-first: stacked, grouped by row; desktop ≥900px: true 2×3 grid.

```css
.matrix-grid{display:flex;flex-direction:column;gap:14px}
.mx-row{display:flex;flex-direction:column;gap:8px}
.mx-rowlbl{font:600 12px/1 Inter;letter-spacing:.08em;text-transform:uppercase;color:#9B8573}
.mx-cell{display:block;width:100%;text-align:left;border:1px solid #E3D4C8;border-radius:14px;padding:13px 14px;background:#fff;min-height:44px}
.mx-cell .mx-col{font:600 11px/1 Inter;letter-spacing:.06em;text-transform:uppercase;color:#bca37d}
.mx-cell h4{font:600 16px/1.2 Inter;margin:3px 0 2px;color:#1F1C1C}
.mx-cell p{font:400 13px/1.35 Inter;color:#6b6460;margin:0}
.mx-cell .mx-foot{display:flex;justify-content:space-between;align-items:center;margin-top:8px}
.mx-metric{font:700 18px/1 Inter;color:#1F1C1C}
.mx-chip{font:600 11px/1 Inter;padding:3px 8px;border-radius:99px}
.mx-chip.aktiv{background:#e7f0e7;color:#5d7f60}.mx-chip.aufbau{background:#f6ecd9;color:#b58a3e}.mx-chip.geplant{background:#efedea;color:#8a837d}
@media(min-width:900px){
 .matrix-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
 .mx-row{display:contents}
 .mx-rowlbl{grid-column:1/-1;margin-top:6px}
}
```

- [ ] **Step 5: Add `renderMatrix()` and metric helpers**

Before `function renderAll()` (line 1649):

```js
function mxMetric(id){
 switch(id){
  case"mxBBvor":return zuweiser.filter(z=>z.status!=="ziel").length+" Zuweiser";
  case"mxBBin":return tagesberichte.length+" laufend";
  case"mxBBnach":return "1 Abschluss";
  case"mxBCvor":return bestand.length+" Kontakte";
  case"mxBCin":return offeneFaelle().length+" Fälle";
  case"mxBCnach":return bestand.filter(b=>b.wv).length+" Wiedervorlagen";
 } return"";
}
function renderMatrix(){
 const cols={vor:"vor der Reha",in:"in der Reha",nach:"nach der Reha"};
 const rows=[["B2B","Zuweiser (B2B)"],["B2C","Patient direkt (B2C)"]];
 const chip={aktiv:"✓ aktiv",aufbau:"⚙ im Aufbau",geplant:"○ geplant"};
 document.getElementById("matrixGrid").innerHTML=rows.map(([rk,rlbl])=>{
  const cells=["vor","in","nach"].map(ck=>{
   const c=MATRIX.find(m=>m.row===rk&&m.col===ck);
   return `<button class="mx-cell" onclick="mxGo('${c.route[0]}','${c.route[1]||""}')">
     <span class="mx-col">${cols[ck]}</span>
     <h4>${c.titel}</h4><p>${c.zweck}</p>
     <span class="mx-foot"><span class="mx-metric">${mxMetric(c.metricId)}</span>
     <span class="mx-chip ${c.status}">${chip[c.status]}</span></span></button>`;
  }).join("");
  return `<div class="mx-row"><div class="mx-rowlbl">${rlbl}</div>${cells}</div>`;
 }).join("");
}
function mxGo(a,b){ if(a==="ref"){ if(typeof openReferrer==="function") openReferrer(b,"Leopoldina-Krankenhaus"); return; } go(a,b); }
```

- [ ] **Step 6: Wire into `renderAll`**

Change line 1649 from
`function renderAll(){renderHeute();renderEingang();renderBoard();renderBestand();renderZuweiser();renderCharts();}`
to add `renderMatrix();`:
```js
function renderAll(){renderHeute();renderEingang();renderBoard();renderBestand();renderZuweiser();renderCharts();renderMatrix();}
```

- [ ] **Step 7: Verify present + 390px gate**

Run: `grep -cE 'data-nav="matrix"|id="view-matrix"|function renderMatrix' index.html` → Expected: `3`
Render at **390px**: (a) bottom bar shows 5 items with **no horizontal scroll** and labels not clipped; (b) tapping **Matrix** shows 6 cells in two groups (B2B, B2C); (c) tapping **B2C·in** opens Fälle/Board; **B2C·vor** opens Netzwerk/Altpatienten. At ≥900px the cells form a 3-column grid.
**GATE:** if the 5-item bar clips/overflows at 390px → apply fallback: remove the `system` nav button, and add a 7th matrix cell / link block routing to `go('system','idee')` (or place System entries as a footer row in the Matrix view). Re-verify 4 visible nav items.

- [x] **Step 8: Commit** — done `4fd0dd1` (390px gate passed, no fallback needed)

---

### Task 3: Werdegang sub-tab (ClickUp-style stepper)

**Files:**
- Modify: `index.html` (Fälle segments header ~962; sub-panels ~967-977; `SEGS.faelle`; `renderWerdegang()`; `stepper()`; `renderAll`)

**Does NOT cover:** editing/advancing steps — the stepper is read-only demo. No drag/drop; "moves up" is illustrated by the `done` flags, not interactive.

- [ ] **Step 1: Confirm absent**

Run: `grep -cE 'data-seg="werdegang"|function renderWerdegang|function stepper' index.html`
Expected: `0`

- [ ] **Step 2: Add the segment button + sub-panel**

In the Fälle segments header (after the `board` seg button, line 963) add:
```html
        <button class="seg" data-seg="werdegang" role="tab">Werdegang</button>
```
After the board sub-panel (`sub-faelle-board` closes ~line 977), add:
```html
      <div class="sub" id="sub-faelle-werdegang">
        <p class="lblline">Der Werdegang eines Falls — zwei Wege in die Maschine.</p>
        <div id="werdegang"></div>
      </div>
```

- [ ] **Step 3: Register the segment in `SEGS`**

Locate `const SEGS = {…}` (referenced by `go()` at 1751). Add `"werdegang"` to the `faelle` array, e.g. `faelle:["anfragen","board","werdegang"]`.

- [ ] **Step 4: Add CSS for the stepper**

```css
.wg-case{border:1px solid #E3D4C8;border-radius:14px;padding:14px;margin-bottom:14px;background:#fff}
.wg-case h3{font:600 16px/1.2 Inter;margin:0 0 2px}
.wg-tag{display:inline-block;font:600 11px/1 Inter;padding:3px 8px;border-radius:99px;background:#f6ecd9;color:#b58a3e;margin-bottom:10px}
.wg-tag.passiv{background:#eef0ee;color:#6f8f72}
.stepper{display:flex;flex-direction:column;gap:0}
.stp{display:grid;grid-template-columns:22px 1fr;gap:10px;position:relative;padding-bottom:14px}
.stp:not(:last-child)::before{content:"";position:absolute;left:10px;top:18px;bottom:0;width:2px;background:#E3D4C8}
.stp .dot{width:18px;height:18px;border-radius:99px;border:2px solid #bca37d;background:#fff;margin-top:1px}
.stp.done .dot{background:#6f8f72;border-color:#6f8f72}
.stp b{font:600 14px/1.2 Inter;color:#1F1C1C}
.stp small{display:block;font:400 12px/1.3 Inter;color:#8a837d;margin-top:1px}
.stp .dur{color:#b58a3e;font-weight:600}
```

- [ ] **Step 5: Add `stepper()` + `renderWerdegang()`**

Before `renderAll()`:
```js
function stepper(schritte){
 return `<div class="stepper">`+schritte.map(s=>{
  const dur=s.dauerMin!=null?` · <span class="dur">${s.dauerMin>=60?Math.round(s.dauerMin/60)+" Std":s.dauerMin+" Min"}</span>`:"";
  const meta=[s.who,s.ts].filter(Boolean).join(" · ");
  return `<div class="stp ${s.done?"done":""}"><span class="dot"></span><span><b>${escapeHtml(s.label)}</b><small>${escapeHtml(meta)}${dur}</small></span></div>`;
 }).join("")+`</div>`;
}
function renderWerdegang(){
 const aktiv=faelle.find(f=>f.id===3);
 const passiv=passivLead;
 const card=(f,tag,cls)=>`<div class="wg-case"><span class="wg-tag ${cls}">${tag}</span><h3>${escapeHtml(f.name)} · ${escapeHtml(f.achse)}</h3>${stepper(f.schritte)}</div>`;
 document.getElementById("werdegang").innerHTML=
   card(aktiv,"Aktiver Weg — Anfrage per Formular","")+
   card(passiv,"Passiver Weg — Broschüre + Freigabe","passiv");
}
```

- [ ] **Step 6: Wire into `renderAll`** — append `renderWerdegang();` to the `renderAll()` body.

- [ ] **Step 7: Verify**

Run: `grep -cE 'data-seg="werdegang"|function renderWerdegang|function stepper' index.html` → Expected: `3`
Render at 390px: Fälle now has 3 segments; **Werdegang** shows two case cards; the active case shows steps with durations (e.g. "18 Min", "Std"); the passive case shows "Broschüre geladen → … → Info-Mail geplant". Vertical timeline line connects dots; done steps are filled.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat(werdegang): ClickUp-style Werdegang sub-tab with active + passive entry paths"
```

---

### Task 4: B2C Lead-Scoring in Bestand

> **Deviation from original plan (recorded during execution):** The live `renderBestand()` already renders rich `.patient-card`s (avatar, consent pill, `wiedervorlage(i)` action). Rather than replace it with the flat `.tier-row` design originally drafted below (which would regress the UI and break `wiedervorlage`), Task 4 **enhances** the existing cards: adds a Stufe badge, an automation line, groups cards by Stufe 5→1, and adds the legend + Stufe filter — while preserving the card markup and the real-index `wiedervorlage` action.

**Files:**
- Modify: `index.html` (`renderBestand()` 1420-1473; CSS; the Bestand sub-panel header ~998 for the legend/filter)

**Does NOT cover:** changing case (`faelle`) scoring — scoring here applies only to `bestand` (B2C standing contacts). Active pipeline cases keep their `status`, not a `stufe`.

- [ ] **Step 1: Read current `renderBestand()`**

Run: `sed -n '1420,1473p' index.html` (review existing markup so the rewrite matches its container ids `bestandStats`, `btable`).

- [ ] **Step 2: Confirm absent**

Run: `grep -cE 'tier-group|stufeFilter|Stufe 1–5|data-stufe' index.html`
Expected: `0`

- [ ] **Step 3: Add legend + filter to the Bestand sub-panel**

In `#sub-netzwerk-bestand` (after `id="bestandStats"` ~998, before `id="btable"`), add:
```html
        <div class="tier-legend">
          <b>Lead-Stufen:</b>
          <span class="tier-pill s5">5 angefragt</span><span class="tier-pill s4">4 lose</span>
          <span class="tier-pill s3">3 Anlass</span><span class="tier-pill s2">2 Broschüre</span>
          <span class="tier-pill s1">1 nur Mail</span>
        </div>
        <div class="tier-filter" id="stufeFilter"></div>
```

- [ ] **Step 4: Add CSS**

```css
.tier-legend{font:400 12px/1.5 Inter;color:#6b6460;margin:4px 0 8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.tier-pill{font:600 11px/1 Inter;padding:4px 8px;border-radius:99px}
.tier-pill.s5{background:#e7f0e7;color:#5d7f60}.tier-pill.s4{background:#eaf0e9;color:#6f8f72}
.tier-pill.s3{background:#f6ecd9;color:#b58a3e}.tier-pill.s2{background:#efedea;color:#8a837d}.tier-pill.s1{background:#f3eeea;color:#a08f7e}
.tier-filter{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.tier-filter button{font:600 12px/1 Inter;padding:7px 11px;border-radius:99px;border:1px solid #E3D4C8;background:#fff;min-height:36px}
.tier-filter button.on{background:#1F1C1C;color:#fff;border-color:#1F1C1C}
.tier-group h4{font:600 13px/1 Inter;color:#9B8573;letter-spacing:.04em;margin:14px 0 6px;text-transform:uppercase}
.tier-row{border:1px solid #E3D4C8;border-radius:12px;padding:11px 13px;margin-bottom:7px;background:#fff}
.tier-row .tr-top{display:flex;justify-content:space-between;gap:8px}
.tier-row b{font:600 15px/1.2 Inter}
.tier-row .tr-stufe{font:700 13px/1 Inter;color:#b58a3e}
.tier-row small{display:block;font:400 12.5px/1.35 Inter;color:#6b6460;margin-top:3px}
.tier-row .tr-auto{font:400 12px/1.3 Inter;color:#6f8f72;margin-top:5px}
.tier-row .tr-auto.blocked{color:#a8543f}
```

- [ ] **Step 5: Rewrite `renderBestand()` to tier-group + filter**

Replace the body of `renderBestand()` (1420-1473) so it groups by `stufe` (5→1), renders filter chips, and shows source + automation per row:
```js
let stufeFilter=0; // 0 = alle
function renderBestand(){
 const stats=document.getElementById("bestandStats");
 if(stats){const frei=bestand.filter(b=>b.consent==="ja").length;
  stats.innerHTML=`<div class="bestand-stat"><b class="num">${bestand.length}</b><span>Kontakte im Bestand</span></div>`+
   `<div class="bestand-stat"><b class="num">${frei}</b><span>mit Kontaktfreigabe</span></div>`+
   `<div class="bestand-stat"><b class="num">${bestand.filter(b=>b.wv).length}</b><span>Wiedervorlage aktiv</span></div>`;}
 const fil=document.getElementById("stufeFilter");
 if(fil){fil.innerHTML=[0,5,4,3,2,1].map(s=>`<button class="${stufeFilter===s?"on":""}" onclick="stufeFilter=${s};renderBestand()">${s===0?"Alle":"Stufe "+s}</button>`).join("");}
 const tbl=document.getElementById("btable");
 const shown=[5,4,3,2,1].filter(s=>stufeFilter===0||stufeFilter===s);
 tbl.innerHTML=shown.map(s=>{
  const rows=bestand.filter(b=>b.stufe===s);
  if(!rows.length)return"";
  return `<div class="tier-group"><h4>Stufe ${s} · ${rows.length}</h4>`+rows.map(b=>{
   const blocked=b.consent!=="ja";
   return `<div class="tier-row"><div class="tr-top"><b>${escapeHtml(b.name)}${b.alter?", "+b.alter:""}</b><span class="tr-stufe">★ ${b.stufe}</span></div>`+
    `<small>${escapeHtml(b.achse)} · ${escapeHtml(b.quelle)} · ${escapeHtml(b.anlass)}</small>`+
    `<div class="tr-auto ${blocked?"blocked":""}">⟳ ${escapeHtml(b.auto)}</div></div>`;
  }).join("")+`</div>`;
 }).join("")||`<p class="empty">Keine Kontakte in dieser Stufe.</p>`;
}
```

- [ ] **Step 6: Verify**

Run: `grep -cE 'tier-group|stufeFilter|tier-legend' index.html` → Expected: `≥3`
Render at 390px: Altpatienten tab shows a legend, filter chips (Alle/5/4/3/2/1), and contacts grouped by Stufe 5→1; each row shows source (Altpatient / Broschüre-Download / Website-Mail) and an automation line (blocked rows in red). Tapping "Stufe 2" filters to the two brochure leads.

- [x] **Step 7: Commit** — done `c1b172e` (enhance-not-replace; interactive filter verified via DOM: 6 chips, Stufe 2 → 2 cards)

---

### Task 5: Zuweiser-Portal referrer screen

**Files:**
- Modify: `index.html` (new referrer overlay markup; CSS `.ref*`; `openReferrer()`/`closeReferrer()`; `renderPortal()`)

**Does NOT cover:** the Dashboard tabs (Task 6). `openReferrer('dashboard',…)` is completed in Task 6; here only `screen==='portal'` renders fully (dashboard branch may show a "kommt in Task 6" stub until then).

- [ ] **Step 1: Confirm absent**

Run: `grep -cE 'function openReferrer|id="refOverlay"|function renderPortal' index.html`
Expected: `0`

- [ ] **Step 2: Add the overlay container**

Before `</body>` (near the `sheetNeu` dialog ~1180), add:
```html
<div class="ref-overlay" id="refOverlay" role="dialog" aria-modal="true" aria-hidden="true">
  <div class="ref-banner"><span id="refWho"></span><button class="ref-back" onclick="closeReferrer()">‹ Zurück zur Klinik-Ansicht</button></div>
  <div class="ref-body" id="refBody"></div>
</div>
```

- [ ] **Step 3: Add CSS**

```css
.ref-overlay{position:fixed;inset:0;background:#F3EFEA;z-index:90;display:none;flex-direction:column;overflow:auto}
.ref-overlay.open{display:flex}
.ref-banner{position:sticky;top:0;background:#1F1C1C;color:#E3D4C8;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;gap:10px;font:600 13px/1.2 Inter}
.ref-back{background:#bca37d;color:#1F1C1C;border:none;border-radius:99px;padding:8px 12px;font:600 12px/1 Inter;min-height:36px}
.ref-body{padding:16px;max-width:760px;margin:0 auto;width:100%}
.ref-body h2{font:600 22px/1.2 'Cormorant Garamond',serif;margin:2px 0 10px}
.ref-card{border:1px solid #E3D4C8;border-radius:14px;background:#fff;padding:14px;margin-bottom:14px}
.bel-grid{display:grid;grid-template-columns:1.2fr repeat(4,1fr);gap:6px;align-items:center;font:500 13px/1.2 Inter}
.bel-grid .hd{font:600 11px/1 Inter;color:#9B8573;text-transform:uppercase}
.bel-cell{text-align:center;border-radius:8px;padding:7px 0;font-weight:700}
.bel-cell.free{background:#e7f0e7;color:#5d7f60}.bel-cell.tight{background:#f6ecd9;color:#b58a3e}.bel-cell.none{background:#f3e2dc;color:#a8543f}
.ref-field{display:block;margin:8px 0}
.ref-field label{font:600 12px/1 Inter;color:#6b6460}
.ref-field input,.ref-field select{width:100%;font-size:16px;padding:11px;border:1px solid #E3D4C8;border-radius:10px;margin-top:4px;min-height:44px}
.ref-upload{border:1.5px dashed #bca37d;border-radius:10px;padding:16px;text-align:center;color:#9B8573;font:500 13px/1.3 Inter}
.ref-btn{background:#1F1C1C;color:#fff;border:none;border-radius:99px;padding:12px 16px;font:600 14px/1 Inter;min-height:44px;width:100%}
```

- [ ] **Step 4: Add open/close + `renderPortal()`**

```js
function openReferrer(screen,zName){
 const ov=document.getElementById("refOverlay");
 document.getElementById("refWho").textContent="Ansicht: Zuweiser-"+(screen==="portal"?"Portal":"Dashboard")+" · "+zName;
 document.getElementById("refBody").innerHTML = screen==="portal"?renderPortal(zName):renderDashboard(zName);
 ov.classList.add("open");ov.setAttribute("aria-hidden","false");document.body.classList.add("locked");
}
function closeReferrer(){const ov=document.getElementById("refOverlay");ov.classList.remove("open");ov.setAttribute("aria-hidden","true");document.body.classList.remove("locked");}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.getElementById("refOverlay").classList.contains("open"))closeReferrer();});
function renderPortal(zName){
 const wk=["KW 1","KW 2","KW 3","KW 4"];
 const cls=n=>n===0?"none":n<=1?"tight":"free";
 const bel=`<div class="bel-grid"><span class="hd">Achse</span>${wk.map(w=>`<span class="hd bel-cell">${w}</span>`).join("")}`+
  belegung.map(b=>`<span>${b.achse}</span>${b.frei.map(n=>`<span class="bel-cell ${cls(n)}">${n}</span>`).join("")}`).join("")+`</div>`;
 return `<h2>Willkommen, ${escapeHtml(zName)}</h2>
  <div class="ref-card"><h3>Freie Plätze (Auslastung)</h3>${bel}</div>
  <div class="ref-card"><h3>Patient anmelden</h3>
   <div class="ref-field"><label>Name des Patienten</label><input placeholder="z. B. Max Mustermann"></div>
   <div class="ref-field"><label>Fachbereich</label><select><option>Orthopädie</option><option>Neurologie</option><option>Geriatrie</option><option>SalutoCare</option></select></div>
   <div class="ref-field"><label>Wunschtermin</label><input placeholder="KW / Datum"></div>
   <label class="ref-field"><input type="checkbox" style="width:auto;min-height:0" checked> Dieser Patient kommt direkt von mir</label>
   <div class="ref-upload">📎 Unterlagen hierher ziehen oder tippen (Demo)</div>
   <button class="ref-btn" onclick="refToast()">Anmeldung absenden</button></div>
  <div class="ref-card"><h3>Meine angemeldeten Fälle</h3>
   <p style="font:400 13px/1.4 Inter;color:#6b6460">Heinz Vogel · SalutoCare · in Klärung &nbsp;·&nbsp; Karl Beispiel · Orthopädie · Aufnahme geplant</p></div>`;
}
function refToast(){alert("Demo — in diesem Prototyp nicht aktiv abgesendet.");}
```

- [ ] **Step 5: Verify**

Run: `grep -cE 'function openReferrer|id="refOverlay"|function renderPortal' index.html` → Expected: `3`
Render at 390px: Matrix **B2B·vor** opens a dark-bannered overlay "Ansicht: Zuweiser-Portal · Leopoldina-Krankenhaus" with an Auslastungs-grid (green/amber/red cells), an anmelden form (16px inputs), upload box, and "kommt direkt von mir" checkbox. Esc and the back button return to the clinic view; no horizontal scroll.

- [x] **Step 6: Commit** — done `b4f703b` (opens from matrix cell; back+Esc close verified via DOM)

---

### Task 6: Zuweiser-Dashboard referrer screen

**Files:**
- Modify: `index.html` (`renderDashboard()`; CSS for tabs/feed)

**Does NOT cover:** real report data — Tagesberichte/Entlassbrief are static demo content. Only one running case + one discharged case are shown.

- [ ] **Step 1: Confirm absent**

Run: `grep -cE 'function renderDashboard|ref-tabs' index.html`
Expected: `0`

- [ ] **Step 2: Add CSS**

```css
.ref-tabs{display:flex;gap:8px;margin-bottom:12px}
.ref-tabs button{flex:1;font:600 13px/1 Inter;padding:11px;border-radius:99px;border:1px solid #E3D4C8;background:#fff;min-height:44px}
.ref-tabs button.on{background:#1F1C1C;color:#fff;border-color:#1F1C1C}
.tb-entry{border-left:2px solid #bca37d;padding:4px 0 10px 12px;margin-left:4px}
.tb-entry small{color:#9B8573;font:600 11px/1 Inter}
.tb-entry p{font:400 13.5px/1.4 Inter;margin:2px 0 0}
.rec-list{list-style:none;padding:0;margin:6px 0 0}
.rec-list li{padding:7px 0;border-bottom:1px solid #f0e9e2;font:400 13.5px/1.35 Inter}
.rec-call{display:inline-block;margin-top:10px;background:#6f8f72;color:#fff;border-radius:99px;padding:10px 14px;font:600 13px/1 Inter;text-decoration:none}
```

- [ ] **Step 3: Add `renderDashboard()` with Laufend/Abgeschlossen tabs**

```js
let refTab="laufend";
function renderDashboard(zName){
 return `<h2>Behandlungs-Einblick</h2>
  <div class="ref-tabs"><button class="${refTab==="laufend"?"on":""}" onclick="refTab='laufend';document.getElementById('refBody').innerHTML=renderDashboard('${zName}')">Laufend</button>
   <button class="${refTab==="fertig"?"on":""}" onclick="refTab='fertig';document.getElementById('refBody').innerHTML=renderDashboard('${zName}')">Abgeschlossen</button></div>`+
  (refTab==="laufend"
   ? tagesberichte.map(t=>`<div class="ref-card"><h3>${escapeHtml(t.pat)} · ${escapeHtml(t.achse)}</h3>
       <p style="font:600 12px/1 Inter;color:#b58a3e;margin:0 0 8px">Reha-Tag ${t.tag} von ${t.von}</p>`+
       t.eintraege.map(e=>`<div class="tb-entry"><small>${escapeHtml(e.d)}</small><p>${escapeHtml(e.txt)}</p></div>`).join("")+`</div>`).join("")
   : `<div class="ref-card"><h3>${escapeHtml(entlassDoc.pat)} · ${escapeHtml(entlassDoc.achse)}</h3>
       <p style="font:600 12px/1 Inter;color:#6f8f72;margin:0 0 8px">entlassen ${escapeHtml(entlassDoc.entlassen)}</p>
       <p style="font:400 13.5px/1.4 Inter">${escapeHtml(entlassDoc.brief)}</p>
       <b style="font:600 13px/1 Inter;display:block;margin-top:8px">Empfehlungen</b>
       <ul class="rec-list">${entlassDoc.empfehlungen.map(r=>`<li>${escapeHtml(r)}</li>`).join("")}</ul>
       <a class="rec-call" href="#" onclick="refToast();return false">☎ Rücksprache: ${escapeHtml(entlassDoc.ruecksprache)}</a></div>`);
}
```

- [ ] **Step 4: Verify**

Run: `grep -cE 'function renderDashboard|ref-tabs' index.html` → Expected: `2`
Render at 390px: Matrix **B2B·in** opens the Dashboard overlay; **Laufend** shows two running patients with Reha-Tag X von Y and dated Tagesbericht entries; **Abgeschlossen** shows the Entlassbrief, an Empfehlungen list, and a green Rücksprache call button. Tabs switch without closing the overlay; back/Esc returns.

- [x] **Step 5: Commit** — done `82bd0a6` (both tabs verified: 2 Tagesbericht-cards laufend, Entlasspaket + 3 Empfehlungen + Rücksprache-Call abgeschlossen)

---

### Task 7: Integration, regression & deploy

**Files:**
- Modify: `index.html` (Zuweiser detail → "Portal-Ansicht" entry point; final wiring only)

**Does NOT cover:** new features — this task only connects existing pieces and verifies the whole.

- [ ] **Step 1: Add a referrer entry point from the Zuweiser detail**

In `renderZuweiser()` (1474-1530) row markup, add a button on each Krankenhaus-type referrer:
```js
// inside the per-zuweiser template, where action buttons are rendered:
`<button class="zw-portal" onclick="event.stopPropagation();openReferrer('portal','${z.name.replace(/'/g,"")}')">Portal-Ansicht ›</button>`
```
Add minimal CSS:
```css
.zw-portal{font:600 12px/1 Inter;color:#1F1C1C;background:#E3D4C8;border:none;border-radius:99px;padding:7px 11px;min-height:36px;margin-top:6px}
```

- [ ] **Step 2: Full regression at 390px**

Open `index.html` at 390px and walk the checklist (spec testing strategy):
1. All 4 original views + sub-tabs still render; Heute funnel numbers unchanged.
2. 5-item bottom bar fits, no horizontal scroll, 44px targets, 16px inputs.
3. All 6 Matrix cells route correctly (B2C·in→Board, B2C·vor/nach→Bestand, B2B·vor→Portal, B2B·in/nach→Dashboard) and back.
4. Werdegang shows both paths with timing; passive case name (Sabine Vogt) matches her Bestand Stufe-2 entry.
5. Referrer overlays: persona banner visible, back/Esc returns, no persona data bleed.
6. Desktop ≥900px: Matrix = 3-col grid; nothing overlaps.

Expected: every item passes. Fix any failure before committing.

- [x] **Step 2: Full regression at 390px** — PASS (DOM check: all 9 views render, 0 JS errors, no horizontal overflow at true 390px mobile, 6 matrix cells route, 5 Zuweiser portal buttons, referrer back+Esc close)
- [x] **Step 3: Commit** — done `7e72e53`. Deploy (merge→main→Pages) pending user go-ahead (production/pitch URL).

---

## Self-Review

**Spec coverage:**
- Matrix view (spec §2) → Task 2. ✓
- Werdegang stepper, two paths w/ timing (spec §3) → Task 1 (data) + Task 3. ✓
- Lead-scoring 1–5 + passive leads + automations (spec §4) → Task 1 (data) + Task 4. ✓
- Zuweiser-Portal (spec §5) → Task 5. ✓
- Zuweiser-Dashboard (spec §5) → Task 6. ✓
- Nav 5th item + 390px fallback (spec Navigation + failure mode 1) → Task 2 Step 7 gate. ✓
- Persona banner + back (failure mode 2) → Task 5 Step 2/4. ✓
- Metric sources pinned, no double-count (spec) → Task 2 `mxMetric()` uses `zuweiser`/`tagesberichte`/`bestand`/`offeneFaelle()` per the spec table. ✓
- 130k-list out of scope → not in any task. ✓

**Placeholder scan:** No "TBD/TODO"; every code step has real code. Referrer dashboard stub in Task 5 is explicitly resolved in Task 6 (noted in "Does NOT cover"). ✓

**Type/name consistency:**
- `openReferrer(screen,zName)` defined Task 5, called from `mxGo` (Task 2, guarded), Task 7 button — consistent signature. ✓
- `renderPortal`/`renderDashboard` referenced in `openReferrer` (Task 5) — `renderPortal` defined Task 5, `renderDashboard` Task 6; Task 5 "Does NOT cover" notes dashboard completes in Task 6. ✓
- `passivLead` defined Task 1, used in `renderWerdegang` Task 3. ✓
- `bestand` keys `stufe`/`quelle`/`auto` defined Task 1, read in Task 4. ✓
- `belegung`/`tagesberichte`/`entlassDoc` defined Task 1, read in Tasks 5/6 + `mxMetric` Task 2. ✓
- `renderAll()` extended in Tasks 2 (`renderMatrix`) and 3 (`renderWerdegang`); `renderPortal`/`renderDashboard` are called on demand (not in `renderAll`) — correct. ✓
- `SEGS.faelle` extended (Task 3) so `go('faelle','werdegang')` activates the sub-panel. ✓

No gaps found.
