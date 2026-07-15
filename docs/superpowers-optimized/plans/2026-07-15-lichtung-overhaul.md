# Lichtung Design-Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-optimized:subagent-driven-development (recommended) or superpowers-optimized:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `index.html` wechselt komplett von der dunklen Aurora-Identität zur hellen „Lichtung"-Sprache (Spec `docs/superpowers-optimized/specs/2026-07-15-lichtung-overhaul-design.md`, Messlatte `design-lab/e3-lichtung.html`) — in 4 gate-verifizierten Stufen, App nach jeder Stufe voll funktionsfähig und deployed.

**Architecture:** Single-File-App (~4900 Zeilen HTML+CSS+JS inline, Deutsch, kein Build). Restyling über den bewährten Token-Hebel (Custom-Property-NAMEN bleiben, WERTE flippen hell) + additive, kommentierte CSS-Blöcke vor `</style>` + zwei kleine JS-Utilities (Tilt, Parallax). Funnel-Animation (4 `.cv-*`-Instanzen) bleibt mechanisch byte-identisch, nur Präsentation ändert sich.

**Tech Stack:** Vanilla HTML/CSS/JS, Google Fonts (Fraunces/Inter/Fragment Mono — unverändert), keine Dependencies.

**Assumptions:**
- HEAD bei Start = `d5c312f` oder Nachfolger; vor JEDEM Push `git pull` (Cofounder pusht parallel). Gilt NICHT, falls der Cofounder parallel Design-Änderungen macht — dann stoppen und User fragen.
- Aurora-Strukturen existieren wie dokumentiert: `:root`-Token ~Z.15, globaler RM-Block ~Z.778, `.aurora`-Orbs-Markup nach `<body>`, `kpiRing()` mit `#auroraRingGrad`, `AR_FOTO`-Map ~Z.3725, `.au-photo`-Komponente, CSS-Blockfolge vor `</style>` endend auf LICHT-INSELN. Anker via grep, nicht Zeilennummern.
- Browser-Pane-Verifikation kann Paint-Lag haben → DOM-Checks (computed styles, geometry) sind der verlässliche Weg; Screenshots nur als Zusatz-Beleg.

**Arbeitsmodus (alle Tasks):**
- Branch `feat/lichtung` (einmalig von main abzweigen). Je Task 1 Commit (conventional message + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`). Je Stufen-Gate: V-Protokoll → `git pull` auf main → ff-merge → push main → Pages-Check.
- **Hausregeln in jede Subagent-Spec kopieren:** (1) Start-Zustände von Animationen NUR im Keyframe-`from`, nie Basis-`opacity:0` (der globale RM-Block muss sofort korrekte Endzustände liefern). (2) NIE `filter:blur` auf Animiertem. (3) `backdrop-filter` nur auf den Budget-Flächen (§Task 4/13). (4) Daten-Arrays/Funktions-Signaturen unantastbar. (5) Nur synthetische Demo-Daten. (6) CSS additiv als kommentierter Block vor `</style>`, Namespace `.lx-*`. (7) Kein `git push --force`, Subagents committen nicht selbst.
- **V-Protokoll (Gate je Stufe):**
  - V1 Syntax: `node -e "const s=require('fs').readFileSync('index.html','utf8');const vm=require('vm');[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((x,i)=>new vm.Script(x[1]));console.log('JS OK')"`
  - V2 Breiten: Preview `bavaria-proto` @1440×900 und @390×844 — 0 Console-Errors, `document.documentElement.scrollWidth<=innerWidth`, Scroll flüssig.
  - V3 Flächen: alle 6 Views (`go('heute')`,`go('faelle','board')`,`go('team')`,`go('netzwerk')`,`go('matrix')`,`go('system')`) + `openDetail(1)`, `openDbDetail(0)`, `openRsDetail(0)`, `openReferrer('portal','Leopoldina-Krankenhaus')` (3 Tabs + Dokument-Viewer), kp-Sheet, Mein-Tag-Rollenwechsel.
  - V4 Funnel-Contract: `grep -c 'offset-path' index.html` == Vorher-Wert (24) · `grep -c 'cv-travel' index.html` == Vorher · `grep -c 'data-sync' index.html` == Vorher; Punkte wandern auf allen 4 Instanzen.
  - V5 Reduced-Motion: mit RM-Emulation (oder statisch: kein Basis-`opacity:0` auf neuen Klassen — `grep -n 'opacity:0' index.html` reviewen) — Endzustände sofort korrekt.
  - V6 Kontrast + Sync: Stichprobe computed colors ≥4.5:1 auf --paper/--cream; `shasum index.html` == `git show HEAD:index.html | shasum` (ProtonDrive-Wache); nach Push: `gh api repos/aluminiumminimum/bavaria-trichter-prototyp/pages/builds/latest --jq '{status,commit}'`.

---

## Stufe 1 · Fundament (Tasks 1–4)

### Task 1: Token-Hebel v3 — Werte hell flippen

**Files:** Modify: `index.html` (nur der `:root`-Block, Anker `grep -n ':root' index.html` erster Treffer)

- [x] **Step 1: Vorher-Zustand sichern** — `grep -c 'offset-path' index.html` und `grep -c 'data-sync' index.html` notieren (V4-Referenzwerte für alle Gates).
- [x] **Step 2: `:root`-Werte ersetzen.** Bestehende Token-NAMEN behalten, Werte auf:

```css
:root{
  --cream:#FAF8F2; --cream2:#F4F1E8; --paper:#FFFFFF; --paper2:#FDFCF8;
  --ink:#1B1B16; --ink-soft:#4A4A40; --muted:#8A877A; --faint:#A5A296;
  --brass:#C9A45C; --brass-deep:#A8854B; --brass-soft:#F3EAD8; --brass-line:#E3D5B8;
  --hair:rgba(27,27,22,.10); --hair2:rgba(27,27,22,.06);
  --sage:#6B8F6E; --sage-deep:#21402D; --sage-soft:#EAF0E8;
  --terra:#C96F4A; --terra-soft:#F7E8E0;
  --amber:#C9853F; --alert:#C96F4A; --raised:#FFFFFF;
  --azzurro:#4E7CA8; --slate:#6E7580;
  --glass:rgba(244,241,232,.72); --glass-border:rgba(27,27,22,.08); --glass-hi:rgba(255,255,255,.85);
  --shadow:0 1px 2px rgba(27,27,22,.04),0 8px 24px rgba(27,27,22,.07),0 24px 64px -24px rgba(27,27,22,.12);
  --shadow-soft:0 1px 2px rgba(27,27,22,.04),0 6px 16px rgba(27,27,22,.06);
  --ortho:#8A6320; --neuro:#3E5F80; --geri:#4C7355; --innere:#2F6B60; --saluto:#A8854B; --unklar:#6E6A5E;
  /* ggf. weitere bestehende Token (Verläufe etc.): --espresso-grad -> linear-gradient(135deg,#21402D,#2E5A40); --brass-grad -> linear-gradient(120deg,#C9A45C,#E3C98F); */
}
```
  Vorsicht: Es existieren evtl. mehr Token als hier gelistet (`--aurora-grad`, Schatten-Varianten) — jeden vorhandenen Namen mit einem hell-passenden Wert belegen, KEINEN Namen löschen. `--aurora-grad:linear-gradient(110deg,#6B8F6E,#C9A45C 45%,#C9853F 75%,#C96F4A)`.
- [x] **Step 3: `<meta name="theme-color">` auf `#FAF8F2`.**
- [x] **Step 4: Verifikation** — V1; Preview @1440: App hell, Text dunkel lesbar auf allen 6 Views (dunkle Hardcodes fallen in Stufe 2/3, hier nur notieren, Liste an Orchestrator melden). @390 kein Overflow.
- [x] **Step 5: Commit** `feat(lichtung): Token-Hebel v3 — Werte hell (Stufe 1)`

### Task 2: Ambient-Wash statt Aurora-Orbs

**Files:** Modify: `index.html` (Markup-Anker `grep -n 'class="aurora"' index.html`; CSS-Anker `grep -n 'orb--' index.html`)

- [x] **Step 1: Markup ersetzen** — die Orb-`<i>`-Elemente durch 3 Wash-Blobs:

```html
<div class="aurora" aria-hidden="true"><i class="lxw lxw--moss"></i><i class="lxw lxw--ochre"></i><i class="lxw lxw--azz"></i></div>
```
- [x] **Step 2: Orb-CSS-Regeln ersetzen** (alte `.orb`-Regeln raus, gleicher Block):

```css
.aurora{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.lxw{position:absolute;border-radius:50%;will-change:transform}
.lxw--moss{width:52vw;height:52vw;left:-12vw;top:-14vh;background:radial-gradient(circle,rgba(107,143,110,.10),transparent 65%);animation:lxwDrift 64s ease-in-out infinite alternate}
.lxw--ochre{width:46vw;height:46vw;right:-10vw;top:22vh;background:radial-gradient(circle,rgba(201,164,92,.09),transparent 65%);animation:lxwDrift 52s ease-in-out infinite alternate-reverse}
.lxw--azz{width:40vw;height:40vw;left:24vw;bottom:-16vh;background:radial-gradient(circle,rgba(78,124,168,.07),transparent 65%);animation:lxwDrift 70s ease-in-out infinite alternate}
@keyframes lxwDrift{from{transform:translate(0,0)}to{transform:translate(6vw,4vh)}}
@media(max-width:1023px){.lxw{animation:none}}
```
  Falls der bestehende globale RM-Block Animationen killt (tut er), ist kein zusätzlicher Guard nötig — Endzustand der Blobs ist ihre Basisposition (korrekt).
- [x] **Step 3: Body-Mobile-Farbwash** (Aurora Vivid hatte radiale Washes auf `body` mobil) — auf helle Pastell-Variante umstellen oder entfernen; Anker `grep -n 'radial-gradient' index.html | head`, nur body-bezogene Regel anpassen.
- [x] **Step 4: Verifikation** — @1440 Scroll-Smoke (kein Jank), Blobs sichtbar aber leise; @390 statisch. V1.
- [x] **Step 5: Commit** `feat(lichtung): Ambient-Wash (3 Pastell-Blobs) ersetzt Aurora-Orbs`

### Task 3: Kachel-System (.lx-tile) + Toasts

**Files:** Modify: `index.html` (neuer kommentierter Block VOR dem LICHT-INSELN-Block vor `</style>`)

- [x] **Step 1: Utility-Block einfügen:**

```css
/* ===== LICHTUNG · KACHELN (lx-tile) ===== */
.card,.kpi,.radar-card,.stg-group,.db-group,.chap,.fc-panel,.ar-card,.rs-card,.ir-card,.tm-card,.z-card,.mx-cell{
  background:var(--paper);border:1px solid var(--hair2);border-radius:20px;
  box-shadow:var(--shadow-soft);position:relative;
}
.card::before,.kpi::before,.radar-card::before,.chap::before{
  content:"";position:absolute;inset:0 0 auto 0;height:1px;border-radius:20px 20px 0 0;
  background:var(--glass-hi);pointer-events:none;
}
```
  **WICHTIG:** Die exakte Selektor-Liste beim Implementieren gegen den echten Code prüfen (`grep -o 'class="[^"]*card[^"]*"' index.html | sort -u` u. ä.) — Klassen, die es nicht gibt, streichen; große Container (chap) ggf. 24px Radius. Bestehende border/background-Deklarationen dieser Klassen NICHT löschen — der additive Block gewinnt per Source-Order. Wo eine Klasse bereits Rundung/Schatten hat, prüfen, dass kein Doppel-Rahmen entsteht (dann Klasse aus Liste nehmen und gezielt stylen).
- [x] **Step 2: Toasts** — `rpToast`-CSS auf solide weiße Pille: `background:var(--paper);color:var(--ink);border:1px solid var(--hair);box-shadow:var(--shadow)`; kein backdrop-filter (war schon Regel).
- [x] **Step 3: Verifikation** — alle 6 Views: Karten wirken als weiße Kacheln mit weichem Schatten-Stack, keine Doppel-Rahmen, keine kaputten Radien in Ecken mit Fotos. V1, @390 Overflow.
- [x] **Step 4: Commit** `feat(lichtung): Kachel-System — Schatten-Stack + Inset-Highlight auf Karten-Familien`

### Task 4: Chrome (Sidebar/Topbar/Tabbar) + Craft + Licht-Inseln-Harmonisierung

**Files:** Modify: `index.html` (`.ds-*` Desktop-Sidebar, `.dtopbar`, `.tabbar`; LICHT-INSELN-Block; Craft-Regeln)

- [x] **Step 1: Sidebar** (Referenz E3/E2 nach User-Feedback „dezent"): Fläche `var(--glass)` + `backdrop-filter:blur(14px) saturate(1.1)`, Text `var(--ink)`/`#63614F`, Icons `#8A877A`, aktiv = weiße Pill (`background:var(--paper);color:var(--sage-deep);box-shadow:0 1px 2px rgba(27,27,22,.06),0 0 0 1px rgba(27,27,22,.05)`) + 3px-Ocker-Indikator links, Hairline rechts `var(--hair)`. Logo-Kreis weiß, `kb-logo-weiss.webp` via `filter:brightness(0)` auf Ink. „Concierge OS"-Micro in `var(--brass-deep)`.
- [x] **Step 2: Topbar** frosted hell (`var(--glass)` + blur), Text/Icons Ink/muted; „+ Neue Anfrage"-Button: `background:var(--sage-deep);color:#F5F2E8` (einziger dunkler Button, ersetzt Verlaufsbutton).
- [x] **Step 3: Tabbar (mobil)** frosted hell, inaktiv `var(--muted)`, aktiv `var(--sage-deep)`.
- [x] **Step 4: Craft:** `::selection{background:var(--sage-deep);color:#F5F2E8}` · `:focus-visible` 2px `var(--sage-deep)` Ring · `scrollbar-color:var(--brass-line) transparent`.
- [x] **Step 5: Licht-Inseln:** Im `/* AURORA · LICHT-INSELN */`-Block die Re-Pin-Werte auf Lichtung harmonisieren (`.rpd-paper`,`.kp-mail`: Papier bleibt weiß — jetzt konsistent mit Canvas; `color:var(--ink)`-Reset bleibt; `@media print` unangetastet). Block-Kommentar auf `/* LICHTUNG · PAPIER-GUARD */` umbenennen.
- [x] **Step 6: Verifikation** — Glas-Zählung: `grep -c 'backdrop-filter' index.html` ≤ 12 (Chrome 3 + Sheets + Reserve); V1–V3-Kurzlauf; @390 Tabbar.
- [x] **Step 7: Commit** `feat(lichtung): Chrome frosted hell + Craft + Papier-Guard (Stufe 1 komplett)`

**STUFEN-GATE 1:** V1–V6 komplett → pull → ff-merge → push main → Pages-Check.

---

## Stufe 2 · Bühne — Heute (Tasks 5–9)

### Task 5: Editorial-Hero + Foto-Fläche + Glas-Chips

**Files:** Modify: `index.html` (`#view-heute` Greeting/Hero-Bereich, `.au-arch`-Slot, neuer `.lx-hero*`-CSS-Block)

- [x] **Step 1: Begrüßungszeile + H1** — bestehende `.greet`-Struktur: Eyebrow-Zeile (Hairline + „Guten Morgen, **Sabine** — N neue Anfragen warten." aus bestehender Logik), H1 in Fraunces mit *Italic*-Gradient-Moment auf „planbare" (bestehender `em`-Mechanismus, Farbe `var(--sage-deep)`, der --aurora-grad-Text-Effekt bleibt @supports-gated auf hellem Verlauf). Darunter vergoldete Doppel-Regel mit Schimmer:

```css
.lx-rule{height:3px;border-top:1px solid var(--brass-line);border-bottom:1px solid var(--brass-line);width:min(300px,40%);position:relative;overflow:hidden;margin:18px 0 22px}
.lx-rule::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(201,164,92,.75),transparent);transform:translateX(-110%);animation:lxSweep 7s ease-in-out infinite}
@keyframes lxSweep{0%,55%{transform:translateX(-110%)}75%{transform:translateX(110%)}100%{transform:translateX(110%)}}
```
- [x] **Step 2: Foto-Fläche** — `.au-arch`-Slot (kb-header.jpg, das Luftbild) vergrößern/re-graden: heller warmer Grade statt Duotone (`filter:saturate(1.08) brightness(1.03)` + Soft-Light-Overlay statt dunkler Gradient); Ken-Burns behalten; 2 driftende Soft-Light-Lichtflecken + Sonnen-Glare-Band (~14s) als absolute Kinder (transform-only, vorgeweichte Gradients).
- [x] **Step 3: 2 Glas-Chips** auf der Foto-Fläche, Werte an bestehende Sync-Mechanik: Chip 1 „<span data-sync="cvGesamt">41</span> Anfragen heute" (exakte data-sync-ID aus dem Code übernehmen, `grep -o 'id="cv[A-Za-z]*"' index.html | sort -u`), Chip 2 Belegung aus `renderBelegung`-Daten falls ohne Umbau verfügbar — sonst statischer Demo-Wert MIT Kommentar. CSS: `background:var(--glass);backdrop-filter:blur(10px);border:1px solid var(--glass-border);border-radius:999px` + Float-Idle (translateY ±3px, 7s).
- [x] **Step 4: Verifikation** — `set()`-Sync intakt (Werte in Chips ändern sich nach `simulateInbound`), Ken-Burns läuft, RM: alles sofort sichtbar. V1.
- [x] **Step 5: Commit** `feat(lichtung): Heute-Hero — Editorial-H1, Gold-Regel, Foto-Fläche m. Glas-Chips`

### Task 6: Funnel-Re-Skin hell (alle 4 Instanzen)

**Files:** Modify: `index.html` (alle 4 `.cv-*`-SVG-Blöcke + zugehöriges CSS; Trichter-Grafik darunter)

**Does NOT cover:** Änderungen an Pfad-Geometrie, offset-path-Werten, Keyframes, Delays, `set()`/`data-sync` — alles Contract.

- [x] **Step 1: Vorher-Gates erfassen:** `grep -c 'offset-path' index.html` (=24), `grep -c 'cv-travel' index.html`, `grep -c 'data-sync' index.html` — Werte notieren.
- [x] **Step 2: Farb-Mapping anwenden** (NUR Farb-/Filter-Attribute bzw. CSS): Kanal-Strokes E-Mail `var(--sage-deep)` · Telefon `var(--sage)` · Fax `var(--brass)` · Website `var(--azzurro)` · Zuweiser `var(--terra)` · Portale `var(--slate)`; wandernde Punkte je Kanalfarbe (fill), drop-shadow hell weich; Chips (`.cv-chip-bg`) `fill:#FFFFFF;stroke:rgba(27,27,22,.10)`; Label-Text `var(--ink)`/`var(--muted)`; Fokal-Kreis „EIN EINGANG" `fill:var(--sage-deep)`, Zahl weiß; „Fall"-Pill Ocker-Rand; Stepper Mono `var(--muted)`, aktiv `var(--ink)`; „2 stockt" `var(--terra)`. Alle 4 Blöcke synchron (Heute breit/schmal, Team breit/schmal).
- [x] **Step 3: Trichter darunter:** Bänder helle Flächen (`--sage-soft`/`--brass-soft`-Stufen), Fills Moos→Ocker-Verlauf, Zahlen `var(--ink)`, „→ Belegung"-Beschriftung Mono.
- [x] **Step 4: Gates nachmessen** — alle 3 grep-Werte identisch zu Step 1; Punkte wandern (4 Instanzen visuell/DOM); `cv-pulse`-Ring (Basis opacity:0 als korrekter RM-Endzustand) unangetastet.
- [x] **Step 5: Commit** `feat(lichtung): Funnel-Re-Skin hell — per-Kanal-Hues, Contract byte-identisch`

### Task 7: KPI-Kacheln — Hue-Kopflinien + Ring-Gauges + Count-up-Glint

**Files:** Modify: `index.html` (`kennzahlen()`-Rendering/KPI-CSS, `kpiRing()`-Helper, globales SVG-defs)

- [x] **Step 1: Hue-Zuordnung** der 4 Heute-KPIs: 1→`--sage-deep`, 2→`--azzurro`, 3→`--terra`, 4→`--brass`. Kopflinie: `.kpi{border-top:3px solid var(--kpi-hue)}` via Inline-Style oder nth-Regel (implementierungsnah entscheiden, KEINE Render-Signatur ändern).
- [x] **Step 2: `kpiRing()`** — Stroke von `url(#auroraRingGrad)` auf `currentColor` umstellen und Aufrufern die Hue via `color:` mitgeben; ODER 4 Hue-Gradients in den globalen defs ergänzen und per Parameter wählen — die Variante wählen, die KEINE Signatur-Änderung braucht (zusätzlicher optionaler Parameter ist ok, alle bestehenden Aufrufer bleiben gültig). Ring-Wert-Text `var(--ink)`.
- [x] **Step 3: Count-up-Glint** — bestehendes `rpCount` bleibt; nach Settle einmalig Klasse `lx-glint` (background-clip-Shine, 900ms, `animationend` entfernt Klasse; bei RM nie hinzufügen — `matchMedia`-Guard).
- [x] **Step 4: Echtzeit-Strip** — falls Heute bereits eine Live-/Auto-Zuteilungs-Zeile hat (`grep -n 'Auto-Zuteilung\|simulateInbound' index.html`), als frosted Strip stylen (`var(--glass)`+blur, Puls-Punkt `var(--sage)`); WENN nicht vorhanden: NICHT neu erfinden (Nicht-Ziel: keine neuen Features) — stattdessen überspringen und im Report vermerken.
- [x] **Step 5: Verifikation** — Ringe zeichnen in 4 Hues, Count-up + Glint einmalig, RM: Endwerte sofort. V1.
- [x] **Step 6: Commit** `feat(lichtung): KPI-Kacheln — Hue-Ringe, Count-up-Glint, Echtzeit-Strip`

### Task 8: Heute-Kapitel als Bento — Anlass-Bögen + Forecast-Stängel

**Files:** Modify: `index.html` (`#anlassChap`/`#belegungChap`/Eingang-Kapitel CSS, `arCard`/`AR_FOTO`-Grade, `.fc-bar`-Regeln)

- [x] **Step 1: Kapitel-Kacheln** — die Kapitel-Container erhalten Kachel-Optik (Task-3-Regeln greifen ggf. schon; sonst Klasse ergänzen) + Ghost-Nummern: bestehende Mono-Kapitelnummern (01/02/03) zusätzlich als große ghosted Fraunces-Ziffer in der Kachel-Ecke (`position:absolute;font-size:96px;opacity:.06`).
- [x] **Step 2: Anlass-Karten** — `AR_FOTO`-Strips: Bogen-Maske `border-radius:999px 999px 0 0` auf dem Foto-Element, Grade hell-warm (Overlay-Gradient des `.au-photo`-Duotone hier auf `linear-gradient(rgba(250,248,242,.06),rgba(250,248,242,.18))` + saturate-Lift). Nur CSS/AR_FOTO-Werte — `arCard`-Signatur unantastbar.
- [x] **Step 3: Forecast-Stängel** — `.fc-bar`: Fill Moos→Ocker-Verlauf, `transform-origin:bottom`; bestehender Scroll-Reveal (`animation-timeline: view()` @supports-gated) bleibt Mechanik, Keyframe wird scaleY-Wachstum; Punkt-Kappe: `::after`-Dot in Kanalfarbe, Peak-Woche Ocker; Ziellinie gestrichelt `var(--brass-deep)`.
- [x] **Step 4: Eingang-Kapitel** — Mail-Zeilen hell (Zebra `var(--cream2)`), NEU/WARTET-Tags: NEU `var(--sage-soft)`+`var(--sage-deep)`-Text, WARTET `var(--terra-soft)`+`var(--terra)`-Text.
- [x] **Step 5: Verifikation** — Anlässe rendern m. Bogen-Fotos (3 Typen: geburtstag/wiederbedarf/zuweiser), fc-Balken wachsen bei Scroll, RM: volle Höhe sofort. V1, @390.
- [x] **Step 6: Commit** `feat(lichtung): Heute-Kapitel als Bento — Bogen-Anlässe, Forecast-Stängel`

### Task 9: Tilt-Utility + Hero-Parallax

**Files:** Modify: `index.html` (neuer kleiner `<script>`-Abschnitt am Ende des Haupt-Scripts + `.lx-tilt`-CSS)

- [x] **Step 1: Tilt-JS** (einmalig, delegiert):

```js
/* LICHTUNG · TILT */
(function(){
  var rm=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  if(rm.matches||!fine.matches)return;
  var sel='.kpi,.radar-card,.ar-card,.card[data-tilt]';
  document.addEventListener('pointermove',function(e){
    var t=e.target.closest(sel);if(!t)return;var r=t.getBoundingClientRect();
    var x=(e.clientX-r.left)/r.width-0.5,y=(e.clientY-r.top)/r.height-0.5;
    t.style.transform='perspective(900px) rotateX('+(-y*3.5)+'deg) rotateY('+(x*3.5)+'deg)';
    t.style.setProperty('--shx',(x*100+50)+'%');t.style.setProperty('--shy',(y*100+50)+'%');
  },{passive:true});
  document.addEventListener('pointerout',function(e){
    var t=e.target.closest(sel);if(t&&!t.contains(e.relatedTarget)){t.style.transform='';}
  },{passive:true});
})();
```
  Selektor-Liste beim Implementieren gegen echte Klassen prüfen; KEINE Listen-Zeilen (.mrow,.db-c), KEINE Buttons. CSS: `transition:transform .25s var? ease;` auf den Ziel-Klassen + optionaler Sheen (`background:radial-gradient(circle at var(--shx,50%) var(--shy,50%),rgba(255,255,255,.35),transparent 55%)` auf einem ::after mit opacity nur bei :hover).
- [x] **Step 2: Hero-Parallax** — pointermove auf dem Hero-Container: Foto-Layer `translate(±12px)` invers zu Chips `translate(±20px)`, via CSS-Vars, gleiche rm/fine-Guards, `{passive:true}`.
- [x] **Step 3: Verifikation** — Tilt nur auf Kacheln, Klick-Funktionen (openDetail via Karten? — prüfen: Karten mit onclick behalten Klickbarkeit trotz transform), RM+Touch: kein Effekt. V1.
- [x] **Step 4: Commit** `feat(lichtung): Tilt-Utility (3.5°, hover+fine) + Hero-Parallax`

**STUFEN-GATE 2:** V1–V6 komplett (V4-Schwerpunkt!) → pull → ff-merge → push main → Pages-Check.

---

## Stufe 3 · Arbeitsflächen (Tasks 10–13)

*Gemeinsames Muster je Task: hell-Hardcodes der View finden (`grep -n '#0B0D0C\|#141613\|#1B1E19\|rgba(240,235,225' index.html` im View-Abschnitt), auf Token umstellen; Karten→Kacheln (Task-3-Liste ergänzen falls Klasse fehlt); Akzente gem. Hue-Disziplin; Fotos hell re-graden; je View V1+V2+betroffene Overlays.*

### Task 10: Fälle — Eingang, Board, Fall-Schublade
- [x] Eingang: `.mail`/`.mrow`/`.mmore` hell, aufklapp-Vorschau `--cream2`; Ein-CTA-Politik unangetastet.
- [x] Board: 3 Zonen-Bänder als flache Kachel-Gruppen (Zone-Header Mono + Hue-Unterstrich sage/brass/terra je Zone-Semantik), `.done-rail` gedämpft; `boardZoneGroup`/`makeBoardCol` Signaturen unantastbar.
- [x] Fall-Schublade `#ovDetail`: Sheet frosted (`var(--glass)`+blur, Budget!), Inhalt Papier-Kacheln; kz-Kette: offen/abgelehnt `--terra`, erteilt `--sage-deep`; Composer hell; `.d-acc`-Akkordeon Hairlines.
- [x] Commit `feat(lichtung): Fälle — Eingang/Board/Schublade hell (Stufe 3.1)`

### Task 11: Team + Mein Tag
- [x] Team-Cockpit-Karten als Kacheln; Team-`.cv`-Spiegel NUR via data-sync verifizieren (Task 6 hat gefärbt — hier nur prüfen).
- [x] Mein Tag (`.mt-*`): geführte Ruhe hell — JETZT/HEUTE/GUT-ZU-WISSEN-Blöcke als Kacheln, Fortschrittsleiste Ocker auf `--brass-soft`-Track, `mt-greet`-Gradient-Moment hell; `body.ma-mode`-Mechanik unantastbar.
- [x] Commit `feat(lichtung): Team + Mein Tag hell (Stufe 3.2)`

### Task 12: Netzwerk + Datenbank
- [x] Zuweiser-Karten (`.z*`) Kacheln; Cofounder-Button `openReferrer` in Karten nur chirurgisch (Farben via Token-Vererbung); Netzwerk-Luftbild-Band hell re-graden.
- [x] Datenbank: Kartei-Panels (`.stg-*`/`.db-group`) Kacheln, Ledger-Zeilen (`.db-c`) Hairlines + Zebra, Sterne `var(--brass)`, „gesperrt" `--slate`; Radar-Karten Kacheln; kp-Sheet frosted, `.kp-mail`-Vorschau bleibt Print-Artefakt (Papier-Guard).
- [x] Commit `feat(lichtung): Netzwerk + Datenbank hell (Stufe 3.3)`

### Task 13: Reha + System + Matrix
- [x] Reha (`.rs-*`/`.ir-*`): Cockpit-Kacheln, rs-overlay frosted; `rsp`-Charts (Cofounder): Linien `var(--sage-deep)`/`var(--brass-deep)` auf Weiß, Grid `var(--hair2)`, Sparkline-Farben — NUR Farbwerte, `rsSeries/rsSpark/rsChart` unantastbar; `RS_BILLING`-Panel hell.
- [x] System: Charts hell (`strom`-SVG-Fills!), `au-plate`-Editorial-Tafel hell-grayscale; Takeaways Mono.
- [x] Matrix: `.mx-cell` als Kacheln — VORSICHT Source-Order (Kollegen-Padding 24/22/20px nicht überschreiben, siehe session-log 2026-07-07): eigener `.lx-*`-Block, nur background/border/shadow, KEIN Padding.
- [x] Commit `feat(lichtung): Reha + System + Matrix hell (Stufe 3.4)`

**STUFEN-GATE 3:** V1–V6 komplett (V3-Schwerpunkt: alle Overlays + Cofounder-Flächen) → pull → ff-merge → push main → Pages-Check.

---

## Stufe 4 · Feinschliff (Tasks 14–16)

### Task 14: Portal (rp) + Dokument-Viewer + Foto-Grades app-weit
- [x] Portal-Suite (`.rp-*`): Hero hell-editorial (Begrüßung Fraunces-Italic `var(--sage-deep)`, Espresso-Hardcodes → Token), Sub-Nav-Tabs hell, Belegungs-Zellen `--sage-soft`-Skala, `rpPrefill`/`rpFlash`-Puls Ocker; `renderSuite`/`rpTab`/`rpPersona` unantastbar. Portal-Bogenfenster-Foto (kb-komfortzimmer) hell re-graden.
- [x] `#rpDocView`: Backdrop frosted HELL, Papier unangetastet (Papier-Guard), QR s/w bleibt.
- [x] App-weite Foto-Momente (Team-Band kb-haus, Netzwerk kb-header, DB kb-garten, Reha kb-suite, MeinTag kb-komfort-wall, System forest-sun): `.au-photo`-Overlay von Ink-Duotone auf hellen warmen Grade (`linear-gradient(rgba(250,248,242,.05),rgba(250,248,242,.16))` + `filter:saturate(1.06) brightness(1.02)`); System-Tafel bleibt grayscale.
- [x] Commit `feat(lichtung): Portal + Dokument-Backdrop + Foto-Grades hell (Stufe 4.1)`

### Task 15: QA-Pass — verifier + Kontrast + Anti-Slop
- [x] Fresh-context `verifier`-Subagent gegen Spec §2–§5 + §9 (statisch): Token-Vollständigkeit, Glas-Budget-Zählung, Funnel-Gates, RM-Basis-opacity-Scan, Papier-Guard, Tilt-Guards.
- [x] Kontrast-Audit numerisch: alle Text-auf-Flächen-Paare ≥4.5:1 (--muted auf --cream prüfen! ggf. --muted abdunkeln auf #7A7768); Ocker nie als Fließtext.
- [x] Anti-Slop-Sichtpass @1440: keine Emoji-Icons neu entstanden, Rhythmus-Variation, kein Karten-Einheitsbrei; Befunde fixen.
- [x] Commit `fix(lichtung): QA-Pass — Kontrast/Budget/RM-Befunde`

### Task 16: Doku + Abschluss
- [x] CLAUDE.md „Identität wahren"-Absatz: Lichtung-Palette/Regeln ersetzen Aurora (hell #FAF8F2, Kacheln/Schatten-Stack, Glas-Budget, Tilt-Regeln, Referenz `design-lab/e3-lichtung.html`).
- [x] HANDOVER.md §3: Token-Spiegel auf v3-Werte (Warnhinweis „Werte HELL seit Lichtung 07/2026").
- [x] state.md: Programm-Abschluss; session-log `[saved]`-Eintrag.
- [x] Commit `docs(lichtung): CLAUDE.md-Identität + HANDOVER-Token-Spiegel + state`

**STUFEN-GATE 4 (Abnahme):** V1–V6 komplett + Live-URL-Sichtprüfung @1440 + QR-Hinweis an User.

---

## Self-Review (gegen Spec geprüft)
- §2.1 Token → T1 · §2.2 Inseln → T4 · §2.3 Typo → T5/T8 (Skala editorial via Hero/Kapitel; Fonts unverändert) · §2.4 Kacheln/Wash/Glas/3D → T2/T3/T4/T9 · §2.5 Fotos → T5/T8/T14 · §3 Funnel → T6 · §4.1–4.8 Flächen → T4–T14 · §5 Motion → T2/T5/T7/T8/T9 · §6 Stufen → Gate-Struktur · §7 V-Protokoll → Arbeitsmodus · §8 Nicht-Ziele → je Task „unantastbar"-Marker · §9 Failure-Modes → Hausregel 1 (opacity:0), T9-Guards, T15-Kontrast, T6-Gates.
- Placeholder-Scan: konkrete Codeblöcke wo Code entsteht; Selektor-Listen sind explizit als „gegen echten Code prüfen" markiert (bewusste Implementierungs-Freiheit, kein TBD).
- Konsistenz: `.lx-*`-Namespace durchgängig; Hue-Mapping T6==T7==T8 (sage-deep/sage/brass/azzurro/terra/slate).
