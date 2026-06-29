# Patienten-Matrix Iteration 2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-optimized:subagent-driven-development (recommended) or superpowers-optimized:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-map the Matrix to a true patient journey, add an in-Reha KPI monitoring core (internal + referrer), split Fälle vs. a board-driven Datenbank, move Werdegang into the case detail with task-auto-advance, enrich the Zuweiserportal — all to a premium-luxury design bar.

**Architecture:** Additive refactor of the single `index.html` (inline CSS/JS, synthetic demo data). New `inReha[]` model feeds both an internal Fälle→"In Reha" sub-tab and the referrer dashboard; `eingang` items gain a `typ` that routes to Fälle vs. Datenbank; `renderBestand` gains a Liste/Board toggle; `openDetail` gains a Werdegang track + task-advance. Mobile-first 390px; desktop ≥900px enhancement.

**Tech Stack:** Vanilla HTML/CSS/JS, no build, no deps. GitHub Pages from `main` root. Cormorant Garamond + Inter; espresso/taupe/sand/beige/gold palette.

**Assumptions:**
- No automated test runner — verification is grep markers + `node` JS-parse + Chrome device-emulation at 390px (`emulate 390x844x3,mobile`). Headed window won't shrink below ~500px, so emulation is the 390px source of truth.
- All data synthetic; no backend/auth/email. Automations shown as status only.
- `inReha[]` absorbs `tagesberichte[]`; the referrer dashboard is migrated off `tagesberichte` in Task 3 before it is removed — until then both exist, nothing breaks.
- Reducing `faelle` is safe because all downstream numbers are computed, not hardcoded (verified: metrics use `offeneFaelle()`, `stageCases`, `zaehle`). Will NOT hold if a future hardcoded count is added.

---

## Verification approach
Per task: `grep -c '<marker>'` with expected counts + `node` JS-parse (below). Then the orchestrator runs a Chrome 390px-emulation render/DOM check. JS-parse command (reused everywhere):
```
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const m=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n;\n');require('vm').createScript(m);console.log('JS_PARSE_OK')"
```

## Premium design directives (apply to every UI task)
- KPI values (Barthel, FIM, Ziel) as **thin circular SVG rings** (gold stroke `#bca37d` on hairline `#E3D4C8` track), value in **Cormorant Garamond**, Aufnahme→aktuell delta as small gold ▲.
- Cards: paper bg, 1px `#E3D4C8` hairline, ~16–18px padding, soft shadow; SalutoCare = gold corner crest. 8px spacing rhythm.
- Labels in Inter uppercase letter-spaced; numbers `font-variant-numeric: tabular-nums`.
- Transitions 150–200ms ease on overlays/tabs/hover-lift; wrap in `@media (prefers-reduced-motion: reduce){ * {transition:none!important;animation:none!important} }`.
- Gold is the only "premium/aktiv" accent; status green/amber/red stay muted as established. No new hues.

## File structure
Single file `index.html`. Current anchors: data block `let faelle` 1353 / `let eingang` 1386 / `let bestand` 1395 / `const MATRIX` 1424 / `let tagesberichte` 1440 / `entlassDoc` 1449. Functions: `renderEingang` 1489 · `uebernehmen` 1498 · `renderBestand` 1568 · `stepper` 1834 · `renderWerdegang` 1841 · `renderPortal` 1858 · `renderDashboard` 1877 · `renderAll` 1892 · `openDetail` 1904 · `SEGS` 1989. Markup: Fälle segs ~1031, `sub-faelle-board` 1040, `sub-faelle-werdegang` 1045, `sub-netzwerk-bestand` 1067.

---

### Task 1: Data foundation + Matrix re-route

**Files:** Modify `index.html` (data block + `MATRIX`)

**Does NOT cover:** renderers — arrays are inert until later tasks. `tagesberichte` is kept (Task 3 removes it after migrating the dashboard).

- [ ] **Step 1: Confirm absent** — `grep -cE 'let inReha|const TEAM|typ:"passiv"|board:"neu"' index.html` → `0`

- [ ] **Step 2: Add `inReha[]` + `TEAM`** (after `entlassDoc` definition, ~line 1453):
```js
const TEAM=["S. Koordination","M. Belegung","T. Abrechnung","Recovery Manager"];
/* ----- Patienten aktuell in der Reha (in-treatment) — Reha-KPIs ----- */
let inReha=[
 {name:"Dieter Franke",alter:66,achse:"Orthopädie",owner:"M. Belegung",icd:"M17.1 — Gonarthrose (sekundär)",aufnahme:dstr(-6),verweildauer:{ist:6,plan:21},barthel:{auf:45,akt:75},fim:{auf:78,akt:101},ziel:60,
   eintraege:[{d:dstr(-1),txt:"Mobilisation an Unterarmgehstützen, 30 m Gehstrecke erreicht."},{d:dstr(-2),txt:"Schmerz unter Belastung NRS 3, Lymphdrainage begonnen."}]},
 {name:"Elke Sauer",alter:59,achse:"SalutoCare",owner:"Recovery Manager",icd:"I69.4 — Folgen Schlaganfall",aufnahme:dstr(-4),verweildauer:{ist:4,plan:28},barthel:{auf:30,akt:50},fim:{auf:62,akt:84},ziel:35,
   eintraege:[{d:dstr(-1),txt:"SalutoCare-Suite, Atemtherapie planmäßig, Werte stabil."},{d:dstr(-2),txt:"Erstgespräch Recovery Manager, Zielplan abgestimmt."}]},
 {name:"Lydia Sommer",alter:77,achse:"Neurologie",owner:"M. Belegung",icd:"I63.9 — Hirninfarkt",aufnahme:dstr(-2),verweildauer:{ist:2,plan:25},barthel:{auf:25,akt:35},fim:{auf:55,akt:63},ziel:18,
   eintraege:[{d:dstr(-1),txt:"Aufnahme abgeschlossen, neurologisches Assessment, Therapieplan erstellt."}]}
];
```

- [ ] **Step 3: Add `typ` to `eingang` + 2 passive items.** In `let eingang=[…]` (1386), append `,typ:"qualifiziert"` to each existing item, then add two passive entries before the closing `];`:
```js
 ,{id:107,kanal:"Website",tit:"Broschüre-Download: Interessentin (57) lädt Reha-Broschüre",txt:"E-Mail hinterlegt, Kontaktfreigabe erteilt. Keine konkrete Anfrage.",zeit:"vor 40 Min.",achse:"Orthopädie",done:false,typ:"passiv"}
 ,{id:108,kanal:"E-Mail",tit:"Lose Mail: „Habt ihr eigentlich freie Plätze?\"",txt:"Einmalige Frage, kein Name, keine Unterlagen, kein Follow-up.",zeit:"vor 3 Std.",achse:"Innere",done:false,typ:"passiv"}
```
(Existing items: add `typ:"qualifiziert"` to each object literal.)

- [ ] **Step 4: Add `board` + ensure `owner` on `bestand`.** To each `bestand` entry add `board:"<col>"` and `owner:"<team>"`. Map by stufe: stufe 5/4 → `board:"reagiert"`, stufe 3 → `board:"ansprache"`, stufe 2 → `board:"neu"`, stufe 1 (gesperrt) → `board:"ruhend"`. Owner: rotate from TEAM. Example for the first entry:
```js
 {name:"Margarete Wirth",alter:73,achse:"Orthopädie",entl:"vor 11 Monaten",consent:"ja",anlass:"Jahres-Check nach Knie-TEP steht an",wv:true, stufe:3,quelle:"Altpatient",auto:"Check-in-Mail alle 3 Monate", board:"ansprache",owner:"S. Koordination"},
```
Apply the analogous `board`/`owner` addition to all 11 entries.

- [ ] **Step 5: Reduce `faelle` 12→6.** Keep ids **1** (Neu), **3** (Kontaktiert, has `schritte`), **6** (Qualifizierung), **8** (Unterlagen), **9** (Aufnahme geplant), **12** (Verloren). **Delete ids 2, 4, 5, 7, 10, 11.** Rationale: admitted patients (old ids 10 Dieter / 11 Elke) now live in `inReha`, not the pre-admission board — no name collision with `inReha` (Dieter/Elke/Lydia). Leave kept entries byte-for-byte unchanged; fix array commas.

- [ ] **Step 6: Re-route + relabel `MATRIX` B2C row** (1424). Replace the three B2C cells:
```js
 {row:"B2C",col:"vor",titel:"Intake & Qualifizierung",zweck:"Anfragen → Fälle-Board · passive Leads → Datenbank",metricId:"mxBCvor",status:"aktiv",route:["faelle","board"]},
 {row:"B2C",col:"in", titel:"Behandlung & Reha-KPIs",zweck:"Verweildauer, Barthel, FIM, Ziel-Fortschritt",metricId:"mxBCin", status:"aktiv",route:["faelle","inreha"]},
 {row:"B2C",col:"nach",titel:"Nachsorge & Reaktivierung",zweck:"Wiedervorlagen, Datenbank-Pflege",metricId:"mxBCnach",status:"aufbau",route:["netzwerk","bestand"]},
```
Then in `mxMetric()` change `case"mxBCin":` to `return inReha.length+" in Reha";` and `case"mxBBin":` to `return inReha.length+" laufend";`.

- [ ] **Step 7: Verify** — `grep -cE 'let inReha|const TEAM' index.html` → `2`; `grep -c 'typ:"passiv"' index.html` → `2`; faelle count `grep -c 'name:"' index.html` sanity; JS-parse → `JS_PARSE_OK`; open page, no console error, Heute + Board still render.

- [ ] **Step 8: Commit** — `git add index.html && git commit -m "feat(iter2): data foundation — inReha KPIs, eingang typ, datenbank board fields, fewer Fälle, Matrix re-route"`

---

### Task 2: Premium KPI ring + In-Reha internal view

**Files:** Modify `index.html` (Fälle segs + new sub-panel, CSS, `kpiRing()`, `renderInReha()`, `SEGS`, `renderAll`)

- [ ] **Step 1: Confirm absent** — `grep -cE 'function kpiRing|function renderInReha|data-seg="inreha"' index.html` → `0`

- [ ] **Step 2: Add the `inreha` segment + panel.** After the `data-seg="board"` button (1031) add `<button class="seg" data-seg="inreha" role="tab">In Reha</button>`. After the `sub-faelle-board` panel closes, add:
```html
      <div class="sub" id="sub-faelle-inreha">
        <p class="lblline">Patienten aktuell in Behandlung — Live-KPIs.</p>
        <div id="inrehaGrid"></div>
      </div>
```

- [ ] **Step 3: Register in `SEGS`** (1989): change `faelle` to `faelle:["anfragen","board","inreha"]` (the `werdegang` entry is removed in Task 7; for now set `["anfragen","board","inreha"]` — drop werdegang here).

- [ ] **Step 4: Premium CSS** (in `<style>`):
```css
.ir-card{border:1px solid #E3D4C8;border-radius:16px;background:var(--paper,#fff);padding:16px;margin-bottom:14px;box-shadow:0 1px 3px rgba(31,28,28,.05)}
.ir-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:4px}
.ir-head h3{font:600 17px/1.2 Inter;margin:0}
.ir-icd{font:500 12px/1.3 Inter;color:#9B8573;margin:2px 0 12px}
.ir-rings{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:12px}
.ring{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:74px}
.ring svg{display:block}
.ring .rv{font:600 18px/1 'Cormorant Garamond',serif;font-variant-numeric:tabular-nums}
.ring .rl{font:600 10px/1.1 Inter;letter-spacing:.06em;text-transform:uppercase;color:#9B8573;text-align:center}
.ring .rd{font:700 10px/1 Inter;color:#5d7f60}
.ir-stay{margin:8px 0 12px}
.ir-stay .lbl{font:600 10px/1 Inter;letter-spacing:.06em;text-transform:uppercase;color:#9B8573;display:flex;justify-content:space-between}
.ir-stay .track{position:relative;height:8px;background:#EFEAE3;border-radius:99px;margin-top:5px;overflow:visible}
.ir-stay .fill{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#bca37d,#9B8573);border-radius:99px}
.ir-stay .plan{position:absolute;top:-2px;width:2px;height:12px;background:#1F1C1C;opacity:.5}
.ir-rep{border-left:2px solid #bca37d;padding:3px 0 8px 12px;margin-left:2px}
.ir-rep small{color:#9B8573;font:600 11px/1 Inter}.ir-rep p{font:400 13px/1.4 Inter;margin:2px 0 0}
```

- [ ] **Step 5: Add `kpiRing()` + `renderInReha()`** (before `renderAll`):
```js
function kpiRing(val,max,label,sub){
 const r=22,c=2*Math.PI*r,pct=Math.max(0,Math.min(1,val/max)),off=c*(1-pct);
 return `<div class="ring"><svg width="56" height="56" viewBox="0 0 56 56">
   <circle cx="28" cy="28" r="${r}" fill="none" stroke="#E3D4C8" stroke-width="5"/>
   <circle cx="28" cy="28" r="${r}" fill="none" stroke="#bca37d" stroke-width="5" stroke-linecap="round"
     stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 28 28)"/>
   <text x="28" y="32" text-anchor="middle" font-family="'Cormorant Garamond',serif" font-size="17" font-weight="600" fill="#1F1C1C">${val}</text></svg>
   <span class="rl">${escapeHtml(label)}</span>${sub?`<span class="rd">${escapeHtml(sub)}</span>`:""}</div>`;
}
function renderInReha(){
 const el=document.getElementById("inrehaGrid");if(!el)return;
 el.innerHTML=inReha.map(p=>{
  const rest=Math.max(0,p.verweildauer.plan-p.verweildauer.ist);
  const stayPct=Math.min(100,p.verweildauer.ist/p.verweildauer.plan*100);
  return `<div class="ir-card${p.achse==="SalutoCare"?" hot":""}">
    <div class="ir-head"><div><h3>${escapeHtml(p.name)} <span style="color:#9B8573;font-weight:400">(${p.alter})</span></h3>
      <div class="ir-icd">${escapeHtml(p.achse)} · ${escapeHtml(p.icd)} · ${escapeHtml(p.owner)}</div></div></div>
    <div class="ir-rings">
      ${kpiRing(p.barthel.akt,100,"Barthel","▲ "+(p.barthel.akt-p.barthel.auf))}
      ${kpiRing(p.fim.akt,126,"FIM","▲ "+(p.fim.akt-p.fim.auf))}
      ${kpiRing(p.ziel,100,"Reha-Ziel",p.ziel+" %")}
    </div>
    <div class="ir-stay"><div class="lbl"><span>Verweildauer</span><span>Tag ${p.verweildauer.ist} / ${p.verweildauer.plan} · noch ${rest} T</span></div>
      <div class="track"><div class="fill" style="width:${stayPct}%"></div><div class="plan" style="left:100%"></div></div></div>
    ${p.eintraege.map(e=>`<div class="ir-rep"><small>${escapeHtml(e.d)}</small><p>${escapeHtml(e.txt)}</p></div>`).join("")}
   </div>`;
 }).join("")||"<p class='empty'>Aktuell keine Patienten in Behandlung.</p>";
}
```

- [ ] **Step 6: Wire `renderAll`** — add `renderInReha();` to the `renderAll()` body.

- [ ] **Step 7: Verify** — `grep -cE 'function kpiRing|function renderInReha|data-seg="inreha"' index.html` → `3`; JS-parse OK; orchestrator: at 390px, Fälle→In Reha shows 3 patient cards with 3 gold rings each, Verweildauer track + Plan-tick, daily reports; no overflow.

- [ ] **Step 8: Commit** — `git commit -m "feat(iter2): premium In-Reha KPI view (Barthel/FIM/Ziel rings, Verweildauer)"`

---

### Task 3: Migrate referrer Dashboard to inReha; remove tagesberichte

**Files:** Modify `index.html` (`renderDashboard` 1877, remove `tagesberichte`)

**Does NOT cover:** the Portal "Meine Patienten" (Task 8). Only the Dashboard "Laufend" tab changes here.

- [ ] **Step 1: Confirm current** — `grep -c 'tagesberichte' index.html` → `≥2` (defined + used in renderDashboard)

- [ ] **Step 2: Rewrite the "Laufend" branch of `renderDashboard`** to read `inReha` and show KPI rings. Replace the `tagesberichte.map(...)` block with:
```js
   ? inReha.map(t=>{const rest=Math.max(0,t.verweildauer.plan-t.verweildauer.ist);
       return `<div class="ref-card"><h3>${escapeHtml(t.pat||t.name)} · ${escapeHtml(t.achse)}</h3>
       <p style="font:600 12px/1 Inter;color:#b58a3e;margin:0 0 10px">Reha-Tag ${t.verweildauer.ist} von ${t.verweildauer.plan} · noch ${rest} T</p>
       <div class="ir-rings">${kpiRing(t.barthel.akt,100,"Barthel","▲ "+(t.barthel.akt-t.barthel.auf))}${kpiRing(t.fim.akt,126,"FIM","▲ "+(t.fim.akt-t.fim.auf))}${kpiRing(t.ziel,100,"Ziel",t.ziel+" %")}</div>`+
       t.eintraege.map(e=>`<div class="tb-entry"><small>${escapeHtml(e.d)}</small><p>${escapeHtml(e.txt)}</p></div>`).join("")+`</div>`}).join("")
```
(Use `t.name` — `inReha` has `name`, not `pat`.)

- [ ] **Step 3: Remove `let tagesberichte=[…]`** (1440) entirely — now unused.

- [ ] **Step 4: Verify** — `grep -c 'tagesberichte' index.html` → `0`; JS-parse OK; orchestrator: open Matrix B2B·in → Dashboard → Laufend shows the 3 inReha patients with rings; Abgeschlossen still shows entlassDoc.

- [ ] **Step 5: Commit** — `git commit -m "feat(iter2): referrer dashboard reads inReha + shows KPI rings; drop tagesberichte"`

---

### Task 4: Anfragen typing → Fälle vs. Datenbank

**Files:** Modify `index.html` (`renderEingang` 1489, add `inDatenbank()`)

**Does NOT cover:** the Datenbank board view (Task 5). `inDatenbank` just appends a staged lead to `bestand`.

- [ ] **Step 1: Confirm absent** — `grep -cE 'function inDatenbank|In Datenbank aufnehmen' index.html` → `0`

- [ ] **Step 2: Rewrite `renderEingang` action** so the button depends on `typ`. Replace the action line (1495) with:
```js
   +(m.done?"<span class='ok-chip'>✓ "+(m.typ==="passiv"?"in Datenbank":"als Fall übernommen")+"</span>"
     :m.typ==="passiv"
       ?"<button class='btn-ghost btn-sm' onclick='inDatenbank("+m.id+")'>In Datenbank aufnehmen</button>"
       :"<button class='btn-brass btn-sm' onclick='uebernehmen("+m.id+")'>Als Fall übernehmen</button>")
```
Also add a small type chip in the meta line: in the `.mmeta` span row add `+"<span class='typ-chip "+(m.typ==="passiv"?"passiv":"qual")+"'>"+(m.typ==="passiv"?"passiv":"qualifiziert")+"</span>"`.

- [ ] **Step 3: CSS for the chip:**
```css
.typ-chip{font:600 10px/1 Inter;padding:3px 7px;border-radius:99px;margin-left:6px}
.typ-chip.qual{background:#e7f0e7;color:#5d7f60}.typ-chip.passiv{background:#efedea;color:#8a837d}
```

- [ ] **Step 4: Add `inDatenbank()`** (after `uebernehmen`):
```js
function inDatenbank(id){
 const m=eingang.find(x=>x.id===id);if(!m||m.done)return;
 m.done=true;
 bestand.unshift({name:m.tit.split(":")[1]?m.tit.split(":")[1].trim():"Neuer Kontakt",alter:null,achse:m.achse,entl:"—",
   consent:m.tit.toLowerCase().includes("freigabe")||m.txt.toLowerCase().includes("freigabe")?"ja":"nein",
   anlass:"Aus Eingang ("+m.kanal+"): "+m.txt,wv:false,stufe:2,quelle:"Broschüre-Download",
   auto:"1 Info-Mail nach 7 Tagen, dann ruhend",board:"neu",owner:"S. Koordination"});
 renderAll();go("netzwerk","bestand");
}
```

- [ ] **Step 5: Verify** — `grep -cE 'function inDatenbank|typ-chip' index.html` → `≥2`; JS-parse OK; orchestrator: Anfragen shows qualifiziert/passiv chips; passive item button = "In Datenbank aufnehmen" → clicking adds to Datenbank + navigates there; qualified still → Fälle.

- [ ] **Step 6: Commit** — `git commit -m "feat(iter2): typed Anfragen — qualifiziert→Fälle, passiv→Datenbank"`

---

### Task 5: Datenbank Liste/Board toggle + kanban

**Files:** Modify `index.html` (`renderBestand` 1568, `#sub-netzwerk-bestand` 1067, CSS). Relabel UI to „Datenbank".

**Does NOT cover:** changing case (`faelle`) data; this is the passive-lead board only.

- [ ] **Step 1: Confirm absent** — `grep -cE 'dbView|db-board|setDbView' index.html` → `0`

- [ ] **Step 2: Add the view toggle to the panel.** In `#sub-netzwerk-bestand` (1067), right after the opening `<div ...>` and before `bestandStats`, insert:
```html
        <div class="db-toggle"><button id="dbListe" class="on" onclick="setDbView('liste')">Liste</button><button id="dbBoard" onclick="setDbView('board')">Board</button></div>
```
Also relabel the Altpatienten segment button (find `data-seg="bestand"` …`Altpatienten`) text to `Datenbank`.

- [ ] **Step 3: CSS:**
```css
.db-toggle{display:inline-flex;gap:4px;background:#EFEAE3;border-radius:99px;padding:3px;margin-bottom:12px}
.db-toggle button{font:600 12px/1 Inter;padding:7px 16px;border-radius:99px;border:none;background:transparent;min-height:34px}
.db-toggle button.on{background:#1F1C1C;color:#fff}
.db-board{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px;-webkit-overflow-scrolling:touch}
.db-col{flex:0 0 200px;background:#F6F3EE;border:1px solid #E3D4C8;border-radius:14px;padding:10px}
.db-col h4{font:600 11px/1 Inter;letter-spacing:.05em;text-transform:uppercase;color:#9B8573;margin:0 0 8px;display:flex;justify-content:space-between}
.db-lead{background:#fff;border:1px solid #E3D4C8;border-radius:11px;padding:9px 10px;margin-bottom:7px}
.db-lead b{font:600 13.5px/1.2 Inter}
.db-lead small{display:block;font:400 11.5px/1.3 Inter;color:#8a837d;margin-top:2px}
.db-lead select{width:100%;font-size:12px;padding:5px;border:1px solid #E3D4C8;border-radius:7px;margin-top:6px;min-height:32px}
```

- [ ] **Step 4: Add `dbView` state + `setDbView` + board render; gate the existing list.** At the top of `renderBestand` add a board branch. Insert before the function (state) and wrap the body:
```js
let dbView="liste";
function setDbView(v){dbView=v;document.getElementById("dbListe").classList.toggle("on",v==="liste");document.getElementById("dbBoard").classList.toggle("on",v==="board");renderBestand();}
const DB_COLS=[["neu","Neu erfasst"],["ansprache","In Ansprache"],["reagiert","Reagiert"],["uebergabe","Übergabe an Fälle"],["ruhend","Ruhend"]];
function dbAssign(i,who){bestand[i].owner=who;}
function dbMove(i,col){bestand[i].board=col;renderBestand();}
```
Then inside `renderBestand`, after the stats block, branch on `dbView`: if `board`, render the kanban into `#btable` and skip the tier list; else render the existing Liste. Board render:
```js
 if(dbView==="board"){
   document.getElementById("btable").innerHTML="<div class='db-board'>"+DB_COLS.map(([k,lbl])=>{
     const rows=bestand.map((p,i)=>[p,i]).filter(pi=>(pi[0].board||"neu")===k);
     return "<div class='db-col'><h4>"+lbl+"<span>"+rows.length+"</span></h4>"+rows.map(pi=>{const p=pi[0],i=pi[1];
       return "<div class='db-lead'><b>"+escapeHtml(p.name)+"</b><small>"+escapeHtml(p.achse)+" · Stufe "+p.stufe+" · "+escapeHtml(p.quelle)+"</small>"
        +"<select onchange='dbAssign("+i+",this.value)'>"+TEAM.map(t=>"<option"+(t===p.owner?" selected":"")+">"+t+"</option>").join("")+"</select></div>";
     }).join("")+"</div>";
   }).join("")+"</div>";
   return;
 }
```
(Place the stats render before this branch so stats always show; the filter chips + tier list run only in `liste` mode.)

- [ ] **Step 5: Verify** — `grep -cE 'dbView|db-board|setDbView|DB_COLS' index.html` → `≥4`; JS-parse OK; orchestrator: Netzwerk→Datenbank shows Liste/Board toggle; Board shows 5 columns with leads + assignment selects; horizontal scroll contained at 390px; Liste unchanged.

- [ ] **Step 6: Commit** — `git commit -m "feat(iter2): Datenbank — Liste/Board toggle + kanban with person assignment"`

---

### Task 6: Person-assignment on case takeover

**Files:** Modify `index.html` (`uebernehmen` 1498)

- [ ] **Step 1: Confirm current** — `grep -c 'owner:"S. Koordination",aufgabe:"Erstreaktion' index.html` → `1`

- [ ] **Step 2: Inline styled owner-select (premium, no native prompt).** In `renderEingang`, the qualified action becomes a styled select + button:
```js
"<div class='eingang-act'><select class='eingang-owner' id='eo-"+m.id+"'>"+TEAM.map(t=>"<option>"+escapeHtml(t)+"</option>").join("")+"</select><button class='btn-brass btn-sm' onclick='uebernehmen("+m.id+")'>Als Fall übernehmen</button></div>"
```
In `uebernehmen`, after the guard read the select: `const sel=document.getElementById("eo-"+id); const owner=sel?sel.value:TEAM[0];`. Change the pushed Fall `owner:"S. Koordination"` → `owner:owner`, and append `+" — zugewiesen an "+owner` to the initial log text. CSS:
```css
.eingang-act{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.eingang-owner{font-size:13px;padding:8px 10px;border:1px solid #E3D4C8;border-radius:9px;min-height:38px;background:#fff;color:#1F1C1C}
```

- [ ] **Step 3: Verify** — `grep -c 'Fall zuweisen an' index.html` → `1`; JS-parse OK; orchestrator (DOM): stub `window.prompt` to return "2", click a qualified Anfrage's übernehmen, confirm the new Fall's `owner` = TEAM[1].

- [ ] **Step 4: Commit** — `git commit -m "feat(iter2): assign owner when taking a case over from Anfragen"`

---

### Task 7: Fall-Detail Werdegang track + task-advance; remove Werdegang tab

**Files:** Modify `index.html` (`openDetail` 1904, detail overlay markup, remove `renderWerdegang` 1841 + `sub-faelle-werdegang` 1045 + werdegang seg button 1032, CSS)

**Does NOT cover:** editing step content; the stepper is read-only except the single "advance" action.

- [ ] **Step 1: Confirm current** — `grep -cE 'data-seg="werdegang"|function renderWerdegang|id="sub-faelle-werdegang"' index.html` → `3`

- [ ] **Step 2: Remove the Werdegang tab** — delete the `data-seg="werdegang"` button (1032), the `#sub-faelle-werdegang` panel (1045), `function renderWerdegang(){…}` (1841), the `renderWerdegang();` call in `renderAll`, and any `werdegang` left in `SEGS.faelle` (Task 2 already set it to `["anfragen","board","inreha"]` — confirm no `werdegang`). Keep `stepper()` (reused below).

- [ ] **Step 3: Add the Werdegang track + advance button into the detail overlay.** Find the detail overlay body (the element holding `dLog`). Add, near the top of the detail body, a container:
```html
        <div id="dWerdegang" class="d-track"></div>
        <button id="dAdvance" class="btn-brass btn-sm" style="width:100%;margin:6px 0 12px" onclick="advanceFall()">Aktuelle Aufgabe erledigt → nächster Schritt ›</button>
```
- [ ] **Step 4: CSS (two-track desktop, stacked mobile):**
```css
.d-track{margin:10px 0 4px}
@media(min-width:900px){ .detail-body.two-track{display:grid;grid-template-columns:1.4fr 1fr;gap:20px;align-items:start} .detail-body.two-track .d-track{grid-column:2;grid-row:1/99} }
```
(Apply class `two-track` to the detail body container if it cleanly wraps form+track; otherwise the stacked default is acceptable — mobile is stacked regardless.)

- [ ] **Step 5: Populate the track in `openDetail` + add `advanceFall()`.** In `openDetail`, after `dLog` is set, add:
```js
 document.getElementById("dWerdegang").innerHTML="<div class='kicker'>Werdegang</div>"+stepper(f.schritte||deriveSchritte(f));
 document.getElementById("dAdvance").style.display=["Aufgenommen","Verloren"].includes(f.status)?"none":"";
```
Add helpers (before `openDetail`):
```js
function deriveSchritte(f){ // generic stepper from STATUS for cases without explicit schritte
 const cur=STATUS.indexOf(f.status);
 return STATUS.slice(0,6).map((s,i)=>({label:s,who:i<=cur?(f.owner||""):"",ts:"",dauerMin:null,done:i<cur}));
}
function advanceFall(){ const f=aktuellerFall;if(!f)return;
 const cur=STATUS.indexOf(f.status); if(cur<0||cur>=5)return; // allow up to Aufnahme geplant(4)→Aufgenommen(5); block at Aufgenommen/Verloren
 const ns=STATUS[cur+1]; f.log.push([dstr(0),"Aufgabe erledigt · Status: "+f.status+" → "+ns]);
 if(f.schritte&&f.schritte[cur]) f.schritte[cur].done=true;
 f.status=ns; renderAll(); openDetail(f.id); // re-open to refresh track + dropdown
}
```
(`advanceFall` writes the same `f.status` the dropdown edits — single source of truth.)

- [ ] **Step 6: Verify** — `grep -cE 'data-seg="werdegang"|function renderWerdegang' index.html` → `0`; `grep -cE 'function advanceFall|id="dWerdegang"' index.html` → `2`; JS-parse OK; orchestrator: open a Board case → Werdegang track visible (desktop right column / mobile stacked); click advance → status moves one stage, log appended, stepper updates; status dropdown still works as manual override.

- [ ] **Step 7: Commit** — `git commit -m "feat(iter2): Werdegang as case-detail track + task-auto-advance; remove Werdegang tab"`

---

### Task 8: Zuweiserportal „Meine Patienten"

**Files:** Modify `index.html` (`renderPortal` 1858, CSS)

- [ ] **Step 1: Confirm absent** — `grep -c 'Meine Patienten' index.html` → `0`

- [ ] **Step 2: Add a „Meine Patienten" card to `renderPortal`** (append before the function's returned string closes, after "Meine angemeldeten Fälle"):
```js
 +`<div class="ref-card"><h3>Meine Patienten — Live-Status</h3>`
 +inReha.slice(0,2).map(p=>`<div class="mp-row"><div><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.achse)} · in Reha, Tag ${p.verweildauer.ist}/${p.verweildauer.plan}</small></div><button class="mp-link" onclick="openReferrer('dashboard','${zName}')">KPIs ›</button></div>`).join("")
 +`<div class="mp-row"><div><b>${escapeHtml(entlassDoc.pat)}</b><small>${escapeHtml(entlassDoc.achse)} · entlassen ${escapeHtml(entlassDoc.entlassen)}</small></div><button class="mp-link" onclick="refTab='fertig';openReferrer('dashboard','${zName}')">Abschlusspaket ›</button></div></div>`
```

- [ ] **Step 3: CSS:**
```css
.mp-row{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f0e9e2}
.mp-row:last-child{border-bottom:none}.mp-row b{font:600 14px/1.2 Inter}.mp-row small{display:block;font:400 12px/1.3 Inter;color:#8a837d;margin-top:1px}
.mp-link{background:#E3D4C8;color:#1F1C1C;border:none;border-radius:99px;padding:8px 12px;font:600 12px/1 Inter;min-height:36px;white-space:nowrap}
```

- [ ] **Step 4: Verify** — `grep -c 'Meine Patienten' index.html` → `1`; JS-parse OK; orchestrator: open Zuweiser-Portal → „Meine Patienten" lists in-Reha patients (→ Dashboard KPIs) + the discharged one (→ Abschlusspaket tab).

- [ ] **Step 5: Commit** — `git commit -m "feat(iter2): Zuweiserportal 'Meine Patienten' — live status into KPIs / Abschlusspaket"`

---

### Task 9: Premium polish pass + transitions + full regression + deploy

**Files:** Modify `index.html` (cross-cutting CSS)

- [ ] **Step 1: Add transitions + reduced-motion + tabular-nums** (in `<style>`):
```css
.ref-overlay,.sub,.mx-cell,.ir-card,.db-lead,.tier-row,.zcard{transition:transform .18s ease,box-shadow .18s ease,opacity .18s ease}
@media(hover:hover){ .mx-cell:hover,.ir-card:hover,.zcard:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(31,28,28,.08)} }
.num,.rv,.mx-metric,.tr-stufe{font-variant-numeric:tabular-nums}
@media (prefers-reduced-motion: reduce){ *{transition:none!important;animation:none!important} }
```

- [ ] **Step 2: Full regression at 390px (orchestrator DOM eval).** Walk: (a) all views/sub-tabs render, 0 JS errors; (b) no horizontal overflow incl. In-Reha cards, Datenbank board, Fall-Detail; (c) KPI rings correct; (d) Anfragen typing routes correctly; (e) Datenbank Liste/Board + assignment; (f) Fall-Detail track + advance + manual dropdown; (g) dashboard reads inReha; (h) Portal „Meine Patienten" links; (i) Matrix B2C cells route to board/inreha/datenbank; (j) `prefers-reduced-motion` disables transforms; (k) desktop ≥900px two-column detail. Fix any failure before deploy.

- [ ] **Step 3: Commit + deploy** — `git add index.html && git commit -m "feat(iter2): premium polish — transitions, hover-lift, reduced-motion, tabular-nums"`; then on user go-ahead: merge `feat/matrix-iter2`→`main`, push (Pages deploy), verify live at 390px.

---

## Self-Review

**Spec coverage:**
- Matrix re-mapping (spec §1) → Task 1 Step 6. ✓
- In-Reha KPI model + internal view (spec §2) → Task 1 (data) + Task 2 (view). ✓
- Referrer dashboard KPIs (spec §2) → Task 3. ✓
- Anfragen typing + Datenbank routing (spec §3) → Task 4. ✓
- Datenbank Liste/Board (spec §3) → Task 5. ✓
- Person-assignment on takeover (spec §4) → Task 6. ✓
- Werdegang track + task-advance + remove tab + fewer Fälle (spec §4) → Task 1 Step 5 (fewer) + Task 7. ✓
- Zuweiserportal „Meine Patienten" (spec §5) → Task 8. ✓
- Premium design (spec §6) → baked into Tasks 2/5/7/8 + finalized Task 9. ✓
- Non-goals (no nav item, no backend) → respected; In-Reha is a Fälle sub-tab, not a new nav item. ✓

**Placeholder scan:** No TBD/TODO; every code step has real code. Task 7's `two-track` class application notes a conditional ("if it cleanly wraps") — acceptable because the stacked default works regardless; the executor confirms the wrapper. No other vagueness.

**Type/name consistency:**
- `inReha[]` shape (`name/verweildauer/barthel/fim/ziel/eintraege`) defined Task 1, read identically in Tasks 2, 3, 8. ✓ (Task 3 note flags `name` not `pat`.)
- `kpiRing(val,max,label,sub)` defined Task 2, called in Tasks 2, 3 with matching arity. ✓
- `TEAM` defined Task 1, used in Tasks 5 (`dbAssign`/select), 6 (`uebernehmen`). ✓
- `bestand` `board`/`owner` added Task 1, read in Task 5 (`DB_COLS`/`dbAssign`). ✓
- `eingang` `typ` added Task 1, read in Task 4 (`renderEingang`/`inDatenbank`). ✓
- `advanceFall`/`deriveSchritte`/`stepper` — `stepper` preserved in Task 7 Step 2; `advanceFall` writes `f.status` (same as dropdown). ✓
- `renderAll`: `renderWerdegang` removed (Task 7), `renderInReha` added (Task 2), `renderBestand` retained. ✓
- `SEGS.faelle` set to `["anfragen","board","inreha"]` in Task 2, werdegang removal confirmed Task 7. ✓

No gaps. One ordering note for the executor: Task 2 sets `SEGS.faelle` (drops werdegang) before Task 7 deletes the werdegang markup — harmless interim (an orphan button with no panel) resolved in Task 7.
