# IA-Restrukturierung „Prozess-Achse" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-optimized:subagent-driven-development (recommended) or superpowers-optimized:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Navigation von `index.html` auf die Prozess-Achse umbauen (Heute · Fälle+Team · In Reha · Netzwerk+Radar · Auswertung · Konzept+Matrix), Rollen-Schalter sichtbar machen, versteckte Features (Portal mobil, Kampagnen, Radar) an sichtbare Orte holen, Heute entschlacken — bei null Funktionsverlust und null visueller Degradation (Jade-Apotheke).

**Architecture:** Alles in der einen Datei `index.html` (~6000 Zeilen, HTML+CSS+JS inline). DOM-Blöcke ziehen **wholesale** um (innere IDs unverändert, Render-Funktionen signaturgleich). Der Router `go(dest,seg)` bleibt; `SEGS`/`TITLES` werden erweitert, `switchTab()`/`applyHash()`/`mxGo()` bekommen eine Alias-Schicht für Alt-Routen. Neues CSS nur als kommentierte Blöcke vor `</style>` in eigenen Namespaces.

**Tech Stack:** Vanilla HTML/CSS/JS, kein Build. Verifikation: `node` (vm.Script-Syntaxcheck), `grep`-Gates, Browser-Pane (Orchestrator).

**Spec:** `docs/superpowers-optimized/specs/2026-07-16-ia-restructure-design.md`

**Assumptions:**
- Zeilennummern in diesem Plan sind Anker vom Stand `8c66cda` — Executor verifiziert per grep vor jedem Edit; NICHT blind nach Zeilennummer editieren.
- Alle Tasks editieren `index.html` → **strikt sequenziell, keine parallelen Waves.**
- Jeder Task hinterlässt einen funktionierenden Zustand (App lädt, alle Views erreichbar) und endet mit eigenem Commit auf `feat/ia`.
- Funnel-Contract wird in Task 2 bewusst NEU eingefroren — bis dahin gelten die alten Werte (24/2/46). Wird Task 2 übersprungen, bricht das V4-Gate: Plan funktioniert nur in Reihenfolge.
- Fable-Executors (User-Mandat): `model: "fable"` in jedem Agent-Call.

**Für jeden Executor-Prompt (Orchestrator fügt ein):**
- „You are a focused subagent. Do NOT invoke any skills from the superpowers-optimized plugin. Do NOT use the Skill tool. Your only job is the task described below."
- Jade-Regeln: `opacity:0` NUR in Keyframes; kein `filter:blur` auf Animiertem; Motion-Welt-Set bleibt bei exakt 9 `@keyframes`; Papier-Inseln (`.rpd-paper`, `.kp-mail`) und `@media print` tabu; Daten-Arrays und Funktions-Signaturen unantastbar; CSS additiv vor `</style>`; Token-Namen historisch (`--sage-deep`=Lack-Jade, `--brass`=Gold).
- Agents committen NICHT — der Orchestrator verifiziert und committet.

**Datei-Landkarte (alle Tasks):**
- Modify: `index.html` (einzige App-Datei)
- Modify (Task 2): `.workflow/jade-baseline.txt` (Contract-Neueinfrieren)
- Modify (Task 8): `CLAUDE.md`, `HANDOVER.md`, `state.md`

---

## Task 1: In Reha wird Top-Level-View

**Files:** Modify: `index.html`

**Does NOT cover:** Team-Umzug (Task 2), inhaltliche Änderungen am Reha-Cockpit (keine).

- [x] **Step 1: Neuen View anlegen, Inhalt wholesale umziehen**

Den kompletten Inhalt von `<div class="sub" id="sub-faelle-inreha">…</div>` (bei ~3540–3545: `lblline` + `au-photo` Komfort + `#rsCockpit` + `#inrehaGrid`) ausschneiden und direkt NACH `</section>` von `#view-faelle` als neuen View einfügen:

```html
  <!-- ============ IN REHA ============ -->
  <section id="view-inreha" class="view">
    <header class="vhead"><div class="kicker">Qualität &amp; Steuerung</div><h1>In Reha</h1>
      <p class="lblline">Patienten aktuell in Behandlung — Erfolg &amp; Wirtschaftlichkeit auf einen Blick.</p>
    </header>
    <figure class="au-photo au-photo--gold"><img src="assets/kb-komfort-band.jpg" alt="" loading="lazy"><figcaption>Komfort · Klinik Bavaria</figcaption></figure>
    <div id="rsCockpit"></div>
    <div id="inrehaGrid"></div>
  </section>
```

Die alte `lblline` wird zur Header-`lblline` (kein Duplikat behalten). Das leere `<div class="sub" id="sub-faelle-inreha">` restlos entfernen.

- [x] **Step 2: Fälle-Tablist und Router anpassen**

In der Fälle-Tablist (~3527) den Button `<button class="seg" data-seg="inreha" role="tab">In Reha</button>` entfernen.
In `SEGS` (~5941): `faelle:["anfragen","board","inreha"]` → `faelle:["anfragen","board"]`.
In `TITLES` (~5951) ergänzen/ändern: `faelle:["Fälle","Anfragen · Board"]`, neu `inreha:["In Reha","Erfolg · Wirtschaftlichkeit"]`.
In `switchTab()`-map (~5973) ergänzen: `inreha:["inreha"]`.
In `applyHash()` (~5988) vor `go(parts[0],parts[1])` Alias einfügen:

```javascript
  if(parts[0]==="faelle"&&parts[1]==="inreha"){go("inreha");return;}
```

- [x] **Step 3: Nav-Buttons ergänzen**

Sidebar (`.ds-nav`, ~2944): nach dem `faelle`-Button neu einfügen:

```html
    <button data-nav="inreha"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10"/><path d="M2 18h20"/><path d="M7 10h4v4H7z"/></svg><span>In Reha</span></button>
```

Tabbar (`.tabbar`, ~3862): nach dem `faelle`-Item ein Item mit `data-nav="inreha"`, Label **„Reha"** (Kurzlabel, Mobile), gleiche Markup-Struktur wie die Nachbarn (Icon + span).

- [x] **Step 4: Interne Callsites umstellen**

Alle `go('faelle','inreha')` / `go("faelle","inreha")` Vorkommen (grep!) auf `go('inreha')` umstellen. MATRIX-Routen (~4071, `route:`-Felder): jede Route auf `faelle/inreha` → `["inreha"]` (Format an bestehende Routen-Struktur anpassen, `mxGo` prüfen).

- [x] **Step 5: Verifikation**

```bash
node -e 'const fs=require("fs"),vm=require("vm");const h=fs.readFileSync("index.html","utf8");const m=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)];m.forEach((s,i)=>new vm.Script(s[1],{filename:"blk"+i}));console.log("JS OK",m.length)'
grep -c 'id="view-inreha"' index.html            # erwartet: 1
grep -c 'sub-faelle-inreha' index.html           # erwartet: 0
grep -c "go('faelle','inreha')" index.html       # erwartet: 0
grep -c 'data-nav="inreha"' index.html           # erwartet: 2 (Sidebar+Tabbar)
```

Browser (Orchestrator): `#inreha` lädt rsCockpit+inrehaGrid, `openRsDetail` öffnet; Alt-Hash `#faelle/inreha` landet auf In Reha; Fälle zeigt nur noch 2 Segmente.

- [x] **Step 6: Commit** `feat(ia): T1 — In Reha als Top-Level-View (aus Fälle herausgelöst, Alias faelle/inreha)`

---

## Task 2: Team wird Fälle-Segment, cv-Duplikat entfällt, Contract neu einfrieren

**Files:** Modify: `index.html`, `.workflow/jade-baseline.txt`

**Does NOT cover:** Änderungen an der Heute-cv-Instanz (bleibt byte-identisch!), renderTeam-Logik (signaturgleich).

- [x] **Step 1: Team-Inhalt als Segment umziehen, cv-Duplikat streichen**

Aus `#view-team` (~3550–3619) übernehmen: die `lblline`-Zeile, `<figure class="au-photo au-photo--sage">…kb-haus…</figure>`, `<div id="teamGrid"></div>`. Das komplette `<div class="cv tm-cv">…</div>` (beide SVGs, ~3554–3616) wird ERSATZLOS GELÖSCHT. Danach `#view-team` samt Section-Kommentar restlos entfernen.

In `#view-faelle` nach `sub-faelle-board` neues Segment:

```html
    <div class="sub" id="sub-faelle-team">
      <p class="lblline">Alle Anfragen aus allen Kanälen — an einem Ort gebündelt, klar zugeteilt, zügig beantwortet.</p>
      <figure class="au-photo au-photo--sage"><img src="assets/kb-haus.webp" alt="" loading="lazy"><figcaption>Das Team · Klinik Bavaria</figcaption></figure>
      <div id="teamGrid"></div>
    </div>
```

Tablist Fälle: `<button class="seg" data-seg="team" role="tab">Team</button>` als dritter Tab.

- [x] **Step 2: Router/Nav**

`SEGS`: `faelle:["anfragen","board","team"]`. `TITLES.faelle`: `["Fälle","Anfragen · Board · Team"]`; `TITLES.team` entfernen.
`switchTab()`-map ergänzen: `team:["faelle","team"]`.
`applyHash()`-Alias ergänzen (neben dem inreha-Alias):

```javascript
  if(parts[0]==="team"){go("faelle","team");return;}
```

Sidebar-Button `data-nav="team"` (~2947) und Tabbar-Item `data-nav="team"` entfernen. `renderTeam()`/`setTeamFilter()` bleiben unverändert (Ziel-Container `#teamGrid` existiert weiter). Callsite ~5120 (`Team inbound indicator`) prüfen: liegt im teamGrid-Rendering, bleibt gültig. MATRIX-Routen auf `team` → `["faelle","team"]`.

- [x] **Step 3: Funnel-Contract NEU einfrieren**

```bash
grep -c 'offset-path' index.html     # erwartet: 12 (vorher 24)
grep -c 'cv-travel' index.html       # erwartet: 2 (unverändert)
grep -c 'data-sync' index.html       # messen — erwartet ~28 (vorher 46; Team-Block trug 18)
node -e 'const fs=require("fs");const h=fs.readFileSync("index.html","utf8");const paths=[...h.matchAll(/class="cv-path" d="([^"]+)"/g)].map(m=>m[1]);const dots=[...h.matchAll(/offset-path:path\(.([^)']+).\)/g)].map(m=>m[1]);console.log("paths",paths.length,"dots",dots.length,"match",dots.every(d=>paths.includes(d)))'
# erwartet: paths 6, dots 6 (nur noch Heute wide+narrow? -> je 6+6=12 gesamt; match true)
```

`.workflow/jade-baseline.txt` mit den GEMESSENEN neuen Werten überschreiben (offset-path / cv-travel / data-sync) + Kommentarzeile `# neu eingefroren 2026-07-16 T2: Team-cv-Duplikat entfernt (Spec ia-restructure)`.

- [x] **Step 4: Verifikation** — vm.Script-Check wie T1; `grep -c 'id="view-team"' index.html` → 0; `grep -c 'tm-cv' index.html` → 0 (auch CSS-Regeln `.tm-cv` entfernen, falls dadurch verwaist — NUR die, die ausschließlich `.tm-cv` adressieren). Browser: Fälle→Team zeigt teamGrid + Filter klickbar; Heute-Funnel-Animation läuft unverändert; `#team` (Alt-Hash) landet auf Fälle/Team; `set()`-Sync wirft keine Errors (Konsole 0).

- [x] **Step 5: Commit** `feat(ia): T2 — Team als Fälle-Segment, cv-Duplikat entfernt, Funnel-Baseline neu eingefroren (24→12)`

---

## Task 3: Auswertung wird Top-Level, System+Matrix werden „Konzept"

**Files:** Modify: `index.html`

**Does NOT cover:** Inhaltliche Änderungen an Charts/Idee/SOPs/Matrix-Grid (nur Verortung). Heute-Chart-Verweise (Task 5).

- [x] **Step 1: Auswertung extrahieren**

Kompletten Inhalt von `<div class="sub" id="sub-system-auswertung">…</div>` (~3691 ff.: lblline, 6 `.chart`-Blöcke, Modul-`.chap`) in neuen View DIREKT NACH `#view-netzwerk`s `</section>`:

```html
  <!-- ============ AUSWERTUNG ============ -->
  <section id="view-auswertung" class="view">
    <header class="vhead"><div class="kicker">Beweis</div><h1>Auswertung</h1>
      <p class="lblline">Auswertung · Quellen, Engpässe, Team und Fachbereiche.</p>
    </header>
    <!-- hierher: die 6 .chart-Blöcke + Modul-.chap, unverändert -->
  </section>
```

Die alte lblline im Sub entfällt (wandert in den Header). Leeres Sub entfernen.

- [x] **Step 2: System → Konzept umbenennen, Matrix eingliedern**

`<section id="view-system">` → `<section id="view-konzept">`; Kicker „Steuerung" → „Die ganze Maschine"; `<h1>System</h1>` → `<h1>Konzept</h1>`. Tablist neu:

```html
      <div class="segments" role="tablist" aria-label="Konzept-Bereiche">
        <button class="seg active" data-seg="idee" role="tab">Idee</button>
        <button class="seg" data-seg="matrix" role="tab">Matrix</button>
        <button class="seg" data-seg="sops" role="tab">SOPs</button>
      </div>
```

`sub-system-idee` → `sub-konzept-idee`; `sub-system-sops` → `sub-konzept-sops`. Neues Segment aus dem Matrix-View-Inhalt (~3651–3657: lblline, `#matrixGrid`, db-foot):

```html
    <div class="sub" id="sub-konzept-matrix">
      <p class="lblline">B2B · B2C  ×  vor · in · nach der Reha. Jede Zelle ist ein Bereich der Software.</p>
      <div id="matrixGrid"></div>
      <p class="db-foot">Tippen öffnet den jeweiligen Bereich · aktiv · im Aufbau · geplant · synthetische Demo-Daten.</p>
    </div>
```

`#view-matrix` samt Kommentar restlos entfernen.

- [x] **Step 3: Router/Nav/Callsites**

`SEGS`: `system`-Eintrag ersetzen durch `konzept:["idee","matrix","sops"]`. `navState.segs`: `system:"idee"` → `konzept:"idee"`.
`TITLES`: `system`- und `matrix`-Einträge ersetzen durch `auswertung:["Auswertung","Quellen · Engpässe · Team · Fachbereiche"]` und `konzept:["Konzept","Idee · Matrix · SOPs"]`.
`switchTab()`-map: `idee:["konzept","idee"]`, `intelligenz:["auswertung"]`, `kommunikation:["konzept","sops"]`.
`applyHash()`-Aliase ergänzen:

```javascript
  if(parts[0]==="system"){go(parts[1]==="auswertung"?"auswertung":"konzept",parts[1]==="auswertung"?undefined:parts[1]);return;}
  if(parts[0]==="matrix"){go("konzept","matrix");return;}
```

Callsites: `go('system','idee')` (~3128 „Die ganze Idee ›") → `go('konzept','idee')`; die 3× `go('system','auswertung')` im Trichter-SVG (~3386/3394/3402) → `go('auswertung')`. MATRIX-Routen: `system/*` → `konzept/*` bzw. `["auswertung"]`; `matrix`-Selbstbezüge → `["konzept","matrix"]` (in `mxGo` ~5202 prüfen).
Sidebar: Button `data-nav="matrix"` entfernen; `data-nav="system"` ersetzen durch ZWEI Buttons in dieser Reihenfolge (nach `netzwerk`):

```html
    <button data-nav="auswertung"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg><span>Auswertung</span></button>
    <button data-nav="konzept"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.6"/><path d="m15.8 8.2-2.3 5.3-5.3 2.3 2.3-5.3z"/></svg><span>Konzept</span></button>
```

Tabbar analog: `matrix`/`system`-Items ersetzen durch `auswertung` (Kurzlabel **„Zahlen"**) und `konzept` (Label „Konzept"). Endstand Sidebar-Reihenfolge: heute · faelle · inreha · netzwerk · auswertung · konzept (Tabbar identisch).

- [x] **Step 4: Verifikation**

```bash
grep -c 'view-system\|view-matrix\|sub-system-' index.html   # erwartet: 0
grep -c "go('system'" index.html                              # erwartet: 0
grep -c 'data-nav="auswertung"' index.html                    # 2
grep -c 'data-nav="konzept"' index.html                       # 2
```

vm.Script-Check. Browser: alle Alt-Hashes (`#system/auswertung` → Auswertung, `#system/sops` → Konzept/SOPs, `#matrix` → Konzept/Matrix) + `renderCharts`/`renderMatrix` rendern in neuen Containern; Matrix-Zellen navigieren korrekt (mxGo).

- [x] **Step 5: Commit** `feat(ia): T3 — Auswertung Top-Level, System+Matrix zu Konzept (Idee·Matrix·SOPs), Alias-Schicht`

---

## Task 4: Netzwerk — Radar wird Segment, „Datenbank" wird „Kontakte"

**Files:** Modify: `index.html`

**Does NOT cover:** Anlässe-Umzug von Heute (Task 5). renderRadar/renderBestand-Logik (nur Container/Einstieg).

- [x] **Step 1: Ist-Mechanik lesen** — `setDbView` (~4506 ff.), `renderBestand`, `renderRadar`: WOHIN rendert Radar aktuell (welche Container-IDs innerhalb `sub-netzwerk-bestand`)? Erst danach schneiden.

- [x] **Step 2: Segment-Split**

Tablist Netzwerk (~3625): drei Segmente:

```html
        <button class="seg active" data-seg="zuweiser" role="tab">Zuweiser <b class="segn num" id="segCntZuweiser"></b></button>
        <button class="seg" data-seg="radar" role="tab">Radar</button>
        <button class="seg" data-seg="kontakte" role="tab">Kontakte <b class="segn num" id="segCntBestand"></b></button>
```

(`segCntBestand`-ID bleibt — Render-Code unantastbar.)
`sub-netzwerk-bestand` → umbenennen in `sub-netzwerk-kontakte`; darin den `db-toggle` (~3639) restlos entfernen; Kicker „Datenbank" → „Kontakte".
Neues `<div class="sub" id="sub-netzwerk-radar">` zwischen zuweiser und kontakte: dorthin ziehen alle Radar-Container, die `renderRadar()` befüllt (in Step 1 identifiziert), plus eigener Kicker „Radar &amp; Anlässe" und die bisherige Radar-Intro-Zeile, falls vorhanden. Wenn Radar bisher in DENSELBEN Container wie Kontakte rendert (dbView-Umschaltung): dedizierten Container `<div id="radarHost"></div>` anlegen und `renderRadar()` NUR im Ziel-Selektor anpassen (kleinstmöglicher Eingriff, Signatur bleibt).

- [x] **Step 3: Router/Aliase**

`SEGS`: `netzwerk:["zuweiser","radar","kontakte"]`; `navState.segs.netzwerk` bleibt `"zuweiser"`.
`TITLES.netzwerk`: `["Netzwerk","Zuweiser · Radar · Kontakte"]`.
`setDbView(v)` wird Delegation (Funktion BLEIBT, Parity):

```javascript
function setDbView(v){go("netzwerk",v==="radar"?"radar":"kontakte");}
```

Falls `setDbView` bisher zusätzlich rendert: Rendering an den Segment-Wechsel hängen (beide Subs werden beim View-Aufbau einmal gerendert — prüfen, wo `renderBestand`/`renderRadar` aufgerufen werden, ggf. beide in `renderAll()` sicherstellen).
`switchTab()`-map: `bestand:["netzwerk","kontakte"]`.
`applyHash()`-Alias: `if(parts[0]==="netzwerk"&&parts[1]==="bestand"){go("netzwerk","kontakte");return;}`.
Callsite Heute „Alle Anlässe ›" (~3499): `onclick="go('netzwerk','bestand');setDbView('radar')"` → `onclick="go('netzwerk','radar')"`.

- [x] **Step 4: Verifikation** — vm.Script; `grep -c 'sub-netzwerk-bestand\|db-toggle' index.html` → 0; Browser: Netzwerk zeigt 3 Segmente; Radar-Segment zeigt KPIs + Fällig-Liste; Kontakte zeigt tierFilter+btable; Desktop `openDbDetail` (Rail) öffnet aus Kontakte; `#netzwerk/bestand` landet auf Kontakte; `arAktion`-Buttons im Radar funktionieren.

- [x] **Step 5: Commit** `feat(ia): T4 — Netzwerk: Radar eigenes Segment, Datenbank→Kontakte, setDbView delegiert`

---

## Task 5: Heute entschlacken (Anlässe→Radar, Verweise bündeln, Foto-Diät, Siegel neu zählen)

**Files:** Modify: `index.html`

**Does NOT cover:** Löschen von Funktionen/Daten (alles zieht um oder wird retargetet).

- [x] **Step 1: Anlässe-Block umziehen**

`<div class="chap hb-8" id="anlassChap">…</div>` (~3497–3501, inkl. `ar-head`, `#anlassSum`, `#anlassList`) wholesale in `sub-netzwerk-radar` (aus Task 4) verschieben — dort ANS ENDE, nach den Radar-Containern; Klasse `hb-8` entfernen (Netzwerk-Subs sind nicht im hb-Grid), `au-chapnum`-Span „02" entfernen (Kapitel-Siegel gehören zur Heute-Bühne). Der „Alle Anlässe ›"-Button im `ar-head` entfällt dort (man IST am Ziel) — Button-Markup löschen, `renderAnlaesse()` bleibt unverändert (IDs identisch).

- [x] **Step 2: Radar-Siegel-Zeile auf Heute**

An der alten Stelle von `anlassChap` (Row C, neben „Heute wichtig" hb-4) neue schlanke Zeile:

```html
    <div class="chap hb-8" id="radarLine">
      <div class="kicker"><span class="au-chapnum">02</span>Radar · Beziehungen pflegen</div>
      <button class="card lx-live rl-strip" onclick="go('netzwerk','radar')"><i class="lx-pulse"></i><b><span id="rlCount">–</span> Anlässe fällig</b> · Geburtstage, Wiederbedarf, Zuweiser-Kontakte<span class="lx-rt">RADAR ›</span></button>
    </div>
```

JS: in `renderHeute()` (dort, wo bisher `anlassSum` auf Heute befüllt wurde bzw. am Ende) `rlCount` mit derselben Zahl befüllen, die bisher `#anlassSum` auf Heute speiste (gleiche Ableitung aus `anlaesse()` — Betrag übernehmen, Quelle nicht neu erfinden). Guard `if(el)` wie im Bestand üblich.
CSS additiv vor `</style>` (Namespace `.rl-*`): `.rl-strip` = volle Breite, Etiketten-Karte (bestehende `.card`/`.lx-live`-Optik erbt), `cursor:pointer`, Hover = Gold-Hairline-Verstärkung. Keine neuen Keyframes.

- [x] **Step 3: Auswertungs-Verweis bündeln**

Die 3 Trichter-Tap-Flächen behalten ihre (in T3 bereits auf `go('auswertung')` umgestellten) onclicks. ZUSÄTZLICH sichtbare Affordanz: in der Trichter-Karte (`hb-trichter`) unter dem SVG eine Verweis-Zeile im Stil des bestehenden „Die ganze Idee ›"-Links (~3128 als Vorbild kopieren): Text „Zur Auswertung ›", `onclick="go('auswertung')"`. Der „Die ganze Idee ›"-Link zeigt ab jetzt auf `go('konzept','idee')` (T3 hat das erledigt — verifizieren).

- [x] **Step 4: Foto-Diät + Grid-Rebalance + Siegel**

Küche-Figure (~3510, `assets/kb-kueche.webp`) restlos entfernen (Asset bleibt im Repo). Panorama-Suite-Figure (~3514, `hb-4 hb-photo`) rückt als Partner NEBEN Belegung (Row D: `belegungChap` hb-8 + Suite hb-4). Campus-Figure: Klasse `hb-8` → `hb-12` (volle Breite als Schlussband).
Kapitel-Siegel neu zählen: Trichter bleibt `01` (Zinnober via CSS `#view-heute>.hb-trichter::after` — unverändert), `radarLine` trägt `02`, `belegungChap` bleibt `03` → auf `03` prüfen und beibehalten ODER auf 02/03 harmonisieren so, dass GENAU die Regel gilt: 01 Zinnober, 02/03 Gold-Ring, lückenlos aufsteigend in DOM-Reihenfolge.

- [x] **Step 5: Verifikation** — vm.Script; `grep -c 'anlassChap' index.html` → 1 (jetzt im Radar-Segment); `grep -c 'kb-kueche' index.html` → 0; Browser @1440: Heute-Grid ohne Loch (Rows: Hero / Trichter / NS-Band / wichtig+radarLine / belegung+suite / campus), @390 kein Overflow; Klick auf Radar-Zeile landet im Radar-Segment mit Anlässe-Grid; `rlCount` zeigt Zahl >0.

- [x] **Step 6: Commit** `feat(ia): T5 — Heute entschlackt: Anlässe→Radar-Segment, Radar-Siegel-Zeile, Verweis Auswertung, Foto-Diät`

---

## Task 6: Rollen-Schalter „Leitung ⇄ Koordination"

**Files:** Modify: `index.html`

**Does NOT cover:** Änderungen an `mtEnter`/`mtExit`/`renderMeinTag`/`mtTodos` (unantastbar). `mtRollToggle`-Funktion bleibt definiert (Parity), wird aber von keinem Markup mehr referenziert.

- [x] **Step 1: Desktop-Sidebar-Schalter**

In `.dsidebar` direkt nach `.ds-brand` (~2943):

```html
  <div class="ds-role" role="group" aria-label="Perspektive">
    <button class="ds-role-btn on" id="roleBoss" onclick="mtExit()">Leitung</button>
    <button class="ds-role-btn" id="roleKoord" onclick="mtEnter()">Koordination</button>
  </div>
```

Topbar (~2958): den kompletten `.mt-avawrap`-Block (Avatar-Button + `#mtRollmenu`) entfernen.

- [x] **Step 2: Mobiler Einstieg**

Es gibt KEINE mobile Topbar (`.dtopbar` ist Desktop-Shell). Mobiler Schalter kommt in den Heute-Greet-Header: in `.g-row` (~2966) als kompaktes Chip-Paar (gleiche IDs dürfen nicht doppelt vergeben werden → mobile Buttons OHNE id, nur `onclick="mtEnter()"`):

```html
          <div class="ds-role ds-role--mobile" role="group" aria-label="Perspektive">
            <button class="ds-role-btn on" onclick="mtExit()">Leitung</button>
            <button class="ds-role-btn" onclick="mtEnter()">Koordination</button>
          </div>
```

- [x] **Step 3: CSS + Zustands-Sync**

CSS additiv (Namespace `.ds-role*`): Etiketten-Stil — Ivory-Plate `var(--paper)`, Jade-Hairline, aktiver Zustand Lack-Jade-Fläche mit Ivory-Text; Sidebar-Variante volle Breite unter Brand, `.ds-role--mobile` nur `<1024px` sichtbar (Desktop `display:none`), in der Sidebar umgekehrt. Fokus-Ring wie bestehende Buttons. Kein neuer Keyframe.
JS: `mtEnter()`/`mtExit()` NICHT anfassen — der „on"-Zustand wird rein per CSS abgeleitet: `body.ma-mode .ds-role-btn` Regeln (in ma-mode ist die Sidebar ohnehin ausgeblendet — prüfen; falls ja, genügt statisches „Leitung on", weil der Schalter nur außerhalb ma-mode sichtbar ist; der Rückweg bleibt der bestehende „Zurück"-Button im Mein-Tag-Header, ~3827).
`mtRollToggle()` bleibt im JS stehen; toten CSS-Block `.mt-avawrap`/`.mt-rollmenu`/`.dt-ava` entfernen, SOFERN er ausschließlich das entfernte Markup adressiert.

- [x] **Step 4: Verifikation** — vm.Script; `grep -c 'mtAvaBtn\|mtRollmenu' index.html` → nur noch in JS-Funktion `mtRollToggle` (Markup 0); Browser @1440: Schalter unter Brand sichtbar, „Koordination" → ma-mode (Mein Tag rendert, 9–10 Karten), Zurück-Button → Leitung; @390: Chip-Paar im Greet sichtbar, gleicher Roundtrip; 0 Console-Errors in beiden Richtungen.

- [x] **Step 5: Commit** `feat(ia): T6 — Rollen-Schalter Leitung⇄Koordination (Sidebar + mobil), Avatar-Dropdown ersetzt`

---

## Task 7: Portal mobil + Kampagnen-Karte

**Files:** Modify: `index.html`

**Does NOT cover:** Portal-Inhalte (`renderPortal` etc.), `kpOpen`-Mechanik — nur Einstiege.

- [x] **Step 1: Portal-Karte im Zuweiser-Segment**

In `sub-netzwerk-zuweiser` (~3630), nach der `lblline`, eine Etiketten-Doppelkarte (2-spaltig ab 760px, gestapelt mobil), Namespace `.nx-entry`:

```html
      <div class="nx-entry">
        <button class="card nx-card" onclick="openReferrer('portal','Leopoldina-Krankenhaus')">
          <div class="kicker">Für Zuweiser</div>
          <b>Zuweiserportal öffnen&nbsp;↗</b>
          <span>Freie Plätze, Anmeldung, Verlauf &amp; Entlassbrief — die Sicht des zuweisenden Arztes.</span>
        </button>
        <button class="card nx-card" onclick="kpOpen()">
          <div class="kicker">Kampagne</div>
          <b>Newsletter an Segment senden</b>
          <span>Zielgruppe wählen, Bausteine setzen, Vorschau prüfen — Versand als Demo.</span>
        </button>
      </div>
```

Den alten `kp-cta`-Button (~3632) entfernen (ersetzt durch die Karte). CSS additiv `.nx-entry`/`.nx-card`: Etiketten-Karte (Doppelrahmen-Familie erben via `.card`), linksbündiger Textblock, Gold-Eck-Winkel NUR falls `.card` sie nicht schon mitbringt — Bestandsoptik prüfen, nichts doppeln. Sichtbar auf ALLEN Breiten.

- [x] **Step 2: Verifikation** — vm.Script; Browser @390: Netzwerk→Zuweiser zeigt beide Karten, Tap „Zuweiserportal" öffnet `#refOverlay` (Overlay bedienbar: rpTab-Wechsel, `rpDoc('arztbrief')` öffnet Papier, Schließen via ‹); Tap Kampagne öffnet kpSheet, 3 Schritte durchklickbar, `.kp-marke` bleibt `#b29a76` (Insel!); @1440 identisch + Sidebar-Gold-Button weiterhin funktional.

- [x] **Step 3: Commit** `feat(ia): T7 — Zuweiserportal mobil erreichbar + Kampagnen-Karte im Zuweiser-Segment`

---

## Task 8: QA-Gate, Parity, Doku

**Files:** Modify: `index.html` (nur Fixes), `CLAUDE.md`, `HANDOVER.md`, `state.md`, `.workflow/jade-baseline.txt` (final bestätigen)

- [ ] **Step 1: verifier (frisch, adversarial)** — Orchestrator dispatcht `verifier`-Agent gegen den feat/ia-Diff mit Prüfauftrag: (a) alle Alt-Routen-Aliase (`#team`, `#matrix`, `#system/auswertung`, `#system/sops`, `#faelle/inreha`, `#netzwerk/bestand`, alte `switchTab`-Namen `intelligenz`/`kommunikation`/`bestand`/`idee`), (b) Parity-Inventare, (c) Jade-Regeln (Keyframes ==9, opacity:0 nur in Keyframes, Inseln unberührt), (d) tote Selektoren/Container nach den Umzügen.

- [ ] **Step 2: Parity-Inventar**

```bash
grep -o 'function [a-zA-Z_][a-zA-Z0-9_]*' index.html | sort -u > /tmp/ia-fns.txt
comm -23 .workflow/jade-fns.txt /tmp/ia-fns.txt   # erwartet: LEER (0 verlorene Funktionen)
```

Analog consts/ids/onclicks gegen `.workflow/jade-{consts,ids,onclicks}.txt`. Erlaubte, im Commit dokumentierte Deltas NUR: entfallene Markup-IDs des cv-Duplikats/Avatar-Dropdowns, neue IDs (`view-inreha`, `view-auswertung`, `view-konzept`, `sub-*` neu, `roleBoss`, `roleKoord`, `rlCount`, `radarHost` falls angelegt), geänderte onclick-Ziele. JEDER andere Fehlbestand = Fix, kein Whitelisting.

- [ ] **Step 3: V-Protokoll komplett** — V1 vm.Script · V2 @1440+@390 (0 Errors, 0 Overflow, Tabbar-Labels lesbar) · V3 Sweep: 6 Views + alle 8 Segmente + `openDetail`/`openDbDetail`/`openRsDetail`/`openSheetNeu`/`kpOpen`/`openReferrer`(mobil UND Desktop)+`rpTab`+`rpDoc` + Rollen-Schalter-Roundtrip beide Breiten + `simulateInbound`-Toast-Route · V4 Funnel gegen NEUE Baseline (dot-path===path-d script) · V5 `opacity:0`-Audit + Keyframe-Zählung ==9 · V6 Kontrast-Stichproben neue Elemente (Rollen-Schalter, Radar-Zeile, nx-Karten ≥4.5:1 Text).

- [ ] **Step 4: Doku** — `CLAUDE.md`: Funnel-Contract-Zeile aktualisieren (neue Zahlen, „1 cv-Instanz-Paar auf Heute"), Nav-Nennung in Konventionen prüfen (`.ds-*`-Beschreibung). `HANDOVER.md`: §Nav/Token-Spiegel auf neue Struktur. `state.md`: Programm-Abschluss. Session-log via context-management (macht der Orchestrator).

- [ ] **Step 5: Merge** — `git pull` → `feat/ia` ff-merge auf `main` → Push → `gh api repos/{owner}/{repo}/pages/builds` Build grün → Live-Stichprobe.

- [ ] **Step 6: Commit/Abschluss** `feat(ia): T8 — QA-Gate: Parity 0 Verluste, V-Protokoll, Doku (CLAUDE/HANDOVER/state)`

---

## Self-Review (erledigt)

- **Spec-Coverage:** Nav-Neuordnung T1–T4 ✓ · Rollen-Schalter T6 ✓ · Portal mobil/Kampagnen T7 ✓ · Heute-Entschlackung T5 ✓ · Alias-Schicht T1–T4 ✓ · Baseline-Neueinfrieren T2 ✓ · V-Protokoll/Parity T8 ✓ · Siegel-Neuzählung T5 ✓. Keine Lücke gefunden.
- **Platzhalter:** keine TBDs; wo Ist-Zustand entscheidet (Radar-Container T4.1, `.tm-cv`-CSS T2, ma-mode-Sidebar-Sichtbarkeit T6.3), ist das Nachschauen als expliziter Schritt formuliert, nicht als Lücke.
- **Konsistenz:** `data-seg`-Namen (`team`/`radar`/`kontakte`/`matrix`) stimmen zwischen Tablist-Markup, SEGS, Aliassen und Callsites überein; `segCntBestand`-ID bewusst behalten; Tabbar-Kurzlabels „Reha"/„Zahlen" nur mobil, `data-nav` bleibt `inreha`/`auswertung`.
