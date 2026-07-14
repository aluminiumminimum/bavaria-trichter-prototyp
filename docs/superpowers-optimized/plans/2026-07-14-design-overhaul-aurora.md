# Design-Overhaul „Aurora" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-optimized:subagent-driven-development (recommended) or superpowers-optimized:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** index.html komplett auf die Aurora-Design-Language umstellen (Spec `2026-07-14-design-overhaul-aurora-design.md`), in 4 Stufen, App nach jeder Stufe voll funktionsfähig + deployed.
**Architecture:** Single-File-App bleibt. Zentraler Hebel = Token-Value-Swap in `:root` (Zeile 15; Token-NAMEN bleiben, WERTE werden Aurora) + Licht-Insel-Re-Pins + additive `AURORA·*`-CSS-Blöcke vor `</style>` (Zeile 1722). JS-Logik unangetastet; einzige JS-Edits: `go()`-View-Transition-Wrapper (Z. 4641), `kpiRing()`-Template (Z. 4049), Count-up-Verdrahtung.
**Tech Stack:** Vanilla HTML/CSS/JS, Google Fonts (Fraunces/Inter/Fragment Mono), View-Transitions-API + `animation-timeline: view()` (beide `@supports`-gated), keine Dependencies.
**Assumptions:** (1) Cofounder pusht nicht parallel (User-Zusage) — Konflikt-Fenster irrelevant; gilt NICHT mehr, falls fremde Commits auftauchen → dann pull-rebase je Task. (2) Referenz-Prototyp `design-lab/d-aurora.html` bleibt im Repo — Executor-Tasks LESEN ihn als visuelle Quelle. (3) Pitch-Bühne = echtes Chrome; das Preview-Pane virtualisiert Scroll (bekannte Eigenheit, state.md) — Scroll-Smoke dort nur via Tasten, im Zweifel echtes Chrome.

---

## Verifikations-Protokoll (je Task referenziert als V1–V6)

- **V1 Syntax:** `awk '/<script>/{f=1;next} /<\/script>/{f=0} f' index.html > /tmp/aurora-check.js && node --check /tmp/aurora-check.js` → „(kein Output)" = PASS.
- **V2 Desktop:** Preview `bavaria-proto` (`.claude/launch.json`), Viewport **1440×900**. Alle 6 Views via `go('heute')`, `go('faelle','eingang')`, `go('faelle','board')`, `go('team')`, `go('netzwerk','datenbank')`, `go('matrix')`, `go('system')`. 0 Console-Errors, 0 horizontaler Overflow (`document.documentElement.scrollWidth<=1440`), Screenshot je betroffener View.
- **V3 Mobile:** Viewport **390×844**, dieselben Views. 0 Errors, `scrollWidth<=390`.
- **V4 Overlays:** `openDetail(1)` · `openDbDetail(0)` · `openRsDetail(0)` · `openReferrer('portal','Leopoldina-Krankenhaus')` (alle 3 Tabs; im Abschluss-Tab ein Dokument öffnen → `.rpd-paper` bleibt hell) · kp-Sheet (Netzwerk → „Newsletter erstellen") · Mein-Tag-Rollenwechsel (Topbar-Avatar → hin + zurück).
- **V5 Motion/Perf:** Funnel-Punkte wandern (Heute + Team, breit + schmal); Reduced-Motion-Probe (`matchMedia`-Emulation oder OS-Setting): Endzustände sofort korrekt, nichts unsichtbar; Scroll-Smoke @1440 (End/PageDown + Screenshot — kein schwarzes Frame/Wedge).
- **V6 Sync-Wache:** `shasum index.html` == `git show HEAD:index.html | shasum` nach jedem Commit (ProtonDrive-Gotcha); keine „Edit conflict"-Dateien.

**Stufen-Gate:** Am Ende jeder Stufe V1–V6 komplett + `git push origin main` (FF-Check davor) + Pages-Build prüfen: `gh api repos/aluminiumminimum/bavaria-trichter-prototyp/pages/builds/latest --jq '{status,commit}'`.

---

## STUFE 1 · FUNDAMENT

### Task 1: Assets-Ordner anlegen

**Files:** Create: `assets/` (aus `design-lab/img/` kuratiert)

- [ ] **Step 1:** Kopieren: `mkdir -p assets && cp design-lab/img/{kb-logo-beige.webp,kb-logo-weiss.webp,kb-suite.webp,kb-komfort-wall.webp,kb-komfortzimmer.webp,kb-header.jpg,green-hills.jpg,fog-mountain.jpg,forest-sun.jpg,alpine-vista.jpg} assets/`
- [ ] **Step 2:** Höher aufgelöste Suite-Originale versuchen (Cache-Varianten sind ~600px): `curl -sL "https://klinik-bavaria.com/wp-content/uploads/2026/03/walleistung-suite.webp" -o /tmp/suite-hi.webp` — wenn `sips -g pixelWidth /tmp/suite-hi.webp` ≥1200: ersetzen. Sonst Bestand behalten (Bogen-Maske braucht ~700px, reicht).
- [ ] **Step 3:** Größen-Gate: `du -h assets/* | sort -rh | head -4` — forest-sun.jpg (1.6MB) via `sips -Z 1600 --setProperty formatOptions 70 -s format jpeg` auf ≤400KB drücken; kein Asset >500KB.
- [ ] **Step 4: Commit** `git add assets && git commit -m "feat(aurora): assets/ — Klinik-Bilder, Wortmarke, Atmosphäre-Motive (Stufe 1)"` → V6.

### Task 2: Fonts + Token-System v2 + Licht-Inseln

**Files:** Modify: `index.html` (Z. 12 Font-Link, Z. 13 Font-Loader, Z. 15 `:root`, neuer Block vor `</style>` Z. 1722)
**Does NOT cover:** Chrome/Flächen-Feinschliff (T4/T8–T12) — nach diesem Task darf die App „roh dunkel" aussehen, aber NIRGENDS unlesbar.

- [ ] **Step 1:** Font-Link (Z. 12) ersetzen durch:
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Inter:wght@400;500;600;700&family=Fragment+Mono&display=swap" rel="stylesheet">
```
- [ ] **Step 2:** Font-Loader (Z. 13): `"700 1em 'Cormorant Garamond'"` → `"600 1em 'Fraunces'"`.
- [ ] **Step 3:** Globaler Font-Swap: alle 78 Vorkommen `"Cormorant Garamond"` → `"Fraunces"` (`sed -i '' 's/Cormorant Garamond/Fraunces/g' index.html`), Fallback Georgia bleibt überall stehen.
- [ ] **Step 4:** `:root` (Z. 15) — Token-WERTE ersetzen (Namen bleiben!), neue Aliase ergänzen:
```css
:root{
  --cream:#0B0D0C; --cream2:#0F1110; --paper:#141613; --paper2:#1B1E19;
  --ink:#F0EBE1; --ink-soft:#D9D3C6; --muted:#97917F; --faint:#6E6A5E;
  --brass:#C4A97D; --brass-deep:#DCC094; --brass-soft:#2B2519; --brass-line:#3B3427;
  --hair:rgba(240,235,225,.09); --hair2:rgba(240,235,225,.06);
  --sage:#7E9B84; --sage-deep:#A3C2AA; --sage-soft:#1C231E;
  --terra:#D9784F; --terra-soft:#2E1E18;
  --ortho:#C99A54; --neuro:#7E9BB8; --geri:#8FAE95; --innere:#6FA89F; --saluto:#C4A97D; --unklar:#A29B8D;
  --shadow:0 30px 70px -30px rgba(0,0,0,.7); --shadow-soft:0 16px 40px -20px rgba(0,0,0,.5);
  --espresso-grad:linear-gradient(140deg,#181A17,#0B0D0C 55%,#12140F);
  --brass-grad:linear-gradient(120deg,#C4A97D,#D99A5B);
  /* AURORA-Aliase */
  --amber:#D99A5B; --alert:#D9784F; --raised:#23261F;
  --glass:rgba(255,255,255,.05); --glass-border:rgba(255,255,255,.09); --glass-hi:rgba(255,255,255,.06);
}
```
(Weitere in `:root` vorhandene Tokens, die hier nicht gelistet sind, sinngemäß auf Dark heben — Textwerte heller, Flächenwerte dunkler; im Zweifel V2-Sichtprüfung. `--brass-deep`/`--sage-deep` sind bewusst HELLER als Basis — auf Dunkel invertiert „deep"-Text seine Rolle.)
- [ ] **Step 5:** Licht-Inseln-Block vor `</style>`:
```css
/* ===== AURORA · LICHT-INSELN — Papier bleibt Papier (Spec §2.2) ===== */
.rpd-paper,.kp-mail{
  --cream:#e9e8e3; --cream2:#e0ded7; --paper:#fbfaf8; --paper2:#f3f0ea;
  --ink:#1f1c1c; --ink-soft:#3c3737; --muted:#766f64; --faint:#948c80;
  --brass:#9b8573; --brass-deep:#6e5d4e; --brass-soft:#e3d4c8; --brass-line:#d7c8bc;
  --hair:#ddd8cf; --hair2:#e6e2da; --sage:#6f8f72; --sage-deep:#56745a; --sage-soft:#e8efe6;
  --terra:#a8543f; --terra-soft:#f5e3dc;
  --shadow:0 18px 44px -18px rgba(31,28,28,.28); --shadow-soft:0 10px 26px -14px rgba(31,28,28,.18);
}
@media print{ body{background:#fff} .rpd-paper{--paper:#fff} }
```
- [ ] **Step 5b:** Typo-Utilities im AURORA-Block (Spec §2.3): `.au-display{font-family:"Fraunces",Georgia,serif;font-weight:340;letter-spacing:-.03em;font-optical-sizing:auto}` · `.au-micro{font-family:"Fragment Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}` — werden in T5–T13 auf Kicker/Labels/KPI-Einheiten angewendet (bestehende Micro-Label-Klassen behalten ihre Namen, erben nur die neue font-family per Override).
- [ ] **Step 6:** Direkt-Hex-Audit: `grep -noE '#[0-9a-fA-F]{6}\b' index.html | sort -t: -k2 | uniq -c -f1 | sort -rn | head -30` → je Treffer Kontext prüfen. Fix-Regel: dunkle TEXT-Farben (`#1f1c1c`,`#3c3737`-Familie) in Kontexten, deren Hintergrund jetzt dunkel ist → auf `var(--ink)`/`var(--ink-soft)` umstellen. Dunkle Hero-HINTERGRÜNDE (`#332d2a`,`#282320` etc.) und helle Hero-Textfarben (`#f4eee3`,`#d3b78a`,`#ecdfc8`…) bleiben (T5 ersetzt sie gezielt). Buttons mit dunklem Text auf Brass-Fläche bleiben.
- [ ] **Step 7:** V1 + V2 + V3 (Lesbarkeits-Gate: JEDE View — kein dark-on-dark-Text) + V4 (`.rpd-paper` hell! kp-Vorschau hell!) + V6.
- [ ] **Step 8: Commit** `git commit -m "feat(aurora): Token-System v2 + Fraunces/Fragment-Mono + Licht-Inseln (Stufe 1)"`.

### Task 3: Aurora-Hintergrund + Craft + Reduced-Motion-Härtung

**Files:** Modify: `index.html` (Body-Start nach `<body>`, neuer CSS-Block vor `</style>`, RM-Block Z. 771, `<head>`)
**Does NOT cover:** mobile <1024px bekommt KEINE Orbs (statischer Gradient) — bewusst, Perf.

- [ ] **Step 1:** Direkt nach `<body>` einfügen:
```html
<div class="aurora" aria-hidden="true"><i class="orb orb--sage"></i><i class="orb orb--champ"></i><i class="orb orb--amber"></i></div>
<div class="au-noise" aria-hidden="true"></div><div class="au-vignette" aria-hidden="true"></div>
```
- [ ] **Step 2:** CSS-Block `/* ===== AURORA · CANVAS ===== */` vor `</style>` — Orbs aus `design-lab/d-aurora.html` Z. 78–112 übernehmen (die GEFIXTE Version: Radial-Gradient-Falloff, **kein `filter:blur`**), plus: Orbs nur `@media(min-width:1024px)` animiert+sichtbar, darunter `body{background:radial-gradient(140% 100% at 20% 0%, #12140F, var(--cream) 60%)}`. `.au-noise` = feTurbulence-Data-URI 3%, `.au-vignette` = Radial-Vignette (beide `position:fixed;pointer-events:none;z-index:-1/-2`).
- [ ] **Step 3:** Craft-Block:
```css
::selection{background:var(--brass);color:#0B0D0C}
:focus-visible{outline:2px solid var(--brass);outline-offset:2px;border-radius:4px}
html{scrollbar-color:var(--brass-line) var(--cream);accent-color:var(--brass)}
```
+ in `<head>`: `<meta name="theme-color" content="#0B0D0C">`.
- [ ] **Step 4:** RM-Block Z. 771 ersetzen durch: `@media (prefers-reduced-motion: reduce){*,*::before,*::after{transition:none!important;animation:none!important;animation-timeline:auto!important;scroll-behavior:auto!important}}`
- [ ] **Step 5:** V1+V2+V3+V5 (Orbs driften @1440, stehen bei RM; @390 statischer Gradient, kein Orb-Layer im DOM-Paint) + V6.
- [ ] **Step 6: Commit** `git commit -m "feat(aurora): Canvas — Orbs (Gradient-Falloff, blur-frei) + Noise/Vignette + Craft + RM-Härtung (Stufe 1)"`.

### Task 4: Chrome — Sidebar, Topbar, Tabbar, Wortmarke

**Files:** Modify: `index.html` (`.dsidebar` Z. 775ff, `.dtopbar` Z. 799ff, `.tabbar` Z. 601ff, Brand-Markup im Body [grep `ds-logo\|ds-brand\|ds-wordmark`], neuer Block `/* ===== AURORA · CHROME ===== */`)
**Mandat (visuelle Quelle: `design-lab/d-aurora.html` Sidebar/Topbar):** Sidebar = Glas auf Ink (`--glass` + `backdrop-filter:blur(22px)` + `--glass-border`-Hairline rechts + Inset-Top-Highlight); Wortmarken-Bild `<img src="assets/kb-logo-beige.webp" alt="Klinik Bavaria" class="ds-wordmark">` (height ~34px) ersetzt das KB-Monogramm+Text; aktiver Nav-Punkt = Champagner-Glow-Pill (Border `--glass-border`, `box-shadow:0 0 24px rgba(196,169,125,.18)`); Nav-Icons: bestehende Icons auf Inline-SVG 1.5px-Stroke prüfen/vereinheitlichen; „Zuweiserportal ↗" champagner; „+ Neue Anfrage" = `--brass-grad`-Button (der EINZIGE Verlaufsbutton). Topbar = Glas, sticky, Breadcrumb Fraunces. Tabbar (mobil) = Glas-Leiste, monochrome Icons, aktiv champagner — KEIN backdrop-filter auf Einzel-Tabs, nur auf der Leiste.

- [ ] **Step 1:** CSS-Block anlegen, `.dsidebar`/`.dtopbar`/`.tabbar`-Basisregeln per Source-Order-Override (bestehende Regeln stehen lassen, Overrides im AURORA-Block — chirurgisch, kein Umbau der Layout-Properties: `position/width/z-index` unangetastet).
- [ ] **Step 2:** Brand-Markup: Monogramm-Span durch `<img>`-Wortmarke ersetzen (beige auf dunklem Glas); mobiler Header analog (grep `class="brand"` im Mobil-Header).
- [ ] **Step 3:** V1+V2+V3 (Sidebar/Topbar/Tabbar auf allen Views; `body.detail-open .dtopbar{right:460px}`-Verhalten Z. 824 intakt; ma-mode blendet Chrome weiter aus [V4 Mein Tag]) + V6.
- [ ] **Step 4: Commit** `git commit -m "feat(aurora): Chrome — Glas-Sidebar/Topbar/Tabbar + echte Wortmarke + Glow-Nav (Stufe 1)"`.

**→ STUFEN-GATE 1:** V1–V6 komplett, push, Pages-Build „built".

---

## STUFE 2 · BÜHNE

### Task 5: Hero + Funnel premium (alle 4 cv-Instanzen) + Trichter (.strom)

**Files:** Modify: `index.html` (cv-CSS ~Z. 1410ff, cv-SVGs ~Z. 1776–1900 [Heute breit+schmal] + ~Z. 2313–2400 [Team-Spiegel], `.strom`-Block ~Z. 233-Kontext, Hero-Container `.greet`)
**Does NOT cover:** KPI-Band/Kapitel (T6). Funnel-VERTRAG: `offset-path`-Pfade, `cv-travel`-Keyframes, Stagger-Delays (`cv-t2`–`cv-t6`), alle `data-sync`-Attribute und `set()`-Aufrufe bleiben BYTE-IDENTISCH — nur Farben/Strokes/Filter/Fills ändern sich.

- [ ] **Step 1:** Hero-Fläche `.greet`: Direkt-Hex-Gradient (`#332d2a,#1f1c1c,#282320`) → `var(--espresso-grad)` + `--glass-border`-Rand + Inset-Highlight; Hero-Textfarben-Hexes (`#f4eee3→var(--ink)`, `#d3b78a→var(--brass)`, `#b29a76→var(--muted)`, `#8f7448→var(--brass-line)`, `#ecdfc8→var(--brass-deep)`, `#e6794f→var(--alert)`).
- [ ] **Step 2:** cv-Re-Skin (CSS only): `.cv-chip-bg{fill:rgba(255,255,255,.05);stroke:rgba(255,255,255,.09)}`; Pfad-Strokes champagner `#C4A97D` mit weichem Glow (SVG `<filter id="cvGlow"><feDropShadow dx="0" dy="0" stdDeviation="2.2" flood-color="#C4A97D" flood-opacity=".55"/></filter>` einmal je SVG-defs, auf die Linien-Gruppe); `.cv-dot{fill:#F4E9D2}` + `drop-shadow` verstärken; Fokal-Kreis: Glas-Scheibe + Champagner-Stroke + Außen-Glow; Stepper-Labels Fragment Mono; „stockt" `var(--alert)`. In ALLEN 4 SVG-Instanzen synchron (Heute breit ~1776/1849, Heute schmal ~1841, Team-Spiegel ~2313+; `grep -c "cv-chip-bg"` muss vor==nach sein).
- [ ] **Step 3:** `.strom`-Trichter: Bänder-Fills auf Sage→Champagner-Verläufe (`<linearGradient>` in strom-defs), Zahlen `var(--ink)`, Hairlines `var(--hair)`, `fn-dot`-Verhalten unangetastet (RM-Block Z. 233 bleibt).
- [ ] **Step 4:** Bogen-Foto-Moment (aus A): im Hero rechts `<div class="au-arch"><img src="assets/kb-suite.webp" alt="" loading="eager"></div>` — Bogen-Maske `border-radius:999px 999px 24px 24px`, Ink-Duotone-Overlay, nur ≥1200px sichtbar, Mono-Caption „KLINIK BAVARIA · BAD KISSINGEN".
- [ ] **Step 5:** V1+V2+V3+V5: Punkte wandern in Heute (breit+schmal per Resize) UND Team; `renderHeute()`-`set()`-Sync: `simulateInbound()` abwarten → Zahlen steigen in beiden Views; Screenshots gegen `d-aurora.html`-Hero (Messlatte). V6.
- [ ] **Step 6: Commit** `git commit -m "feat(aurora): Hero + Funnel-Re-Skin (4 Instanzen, Animation-Contract intakt) + Trichter + Bogen-Foto (Stufe 2)"`.

### Task 6: KPI-Band + Ring-Gauges + Kapitel-Nummerierung

**Files:** Modify: `index.html` (`kennzahlen()`/KPI-Markup, `kpiRing()` Z. 4049, `#anlassChap` Z. 2209 / `#belegungChap` Z. 2215 Kapitel-Köpfe, Count-up)
**Does NOT cover:** Karten-Inhalte der Kapitel (T8/T10-Muster folgen in Stufe 3).

- [ ] **Step 1:** KPI-Kacheln: Elevation-Fläche (`--paper2`, KEIN Glas), Zahlen Fraunces 600 mit dezentem Glow (`text-shadow:0 0 24px rgba(196,169,125,.28)`), Einheiten/Labels Fragment Mono uppercase.
- [ ] **Step 2:** Count-up: bestehenden RM-sicheren Count-up-Helper wiederverwenden (Portal-Stats, `<script>`-Region um Z. 2889, `el.textContent=to+suf`-Guard) — auf die Heute-KPIs verdrahten, einmalig beim Render.
- [ ] **Step 3:** `kpiRing()` (Z. 4049): Template auf Verlaufs-Stroke umstellen — global EINMAL verstecktes `<svg width="0" height="0"><defs><linearGradient id="auroraRingGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7E9B84"/><stop offset="1" stop-color="#C4A97D"/></linearGradient></defs></svg>` nach `<body>`-Start; Ring-Stroke `stroke="url(#auroraRingGrad)"`, Track `var(--hair)`.
- [ ] **Step 4:** Kapitel-Köpfe (alle `.chap`-Header auf Heute): Mono-Nummern „01/02/03…" (aus C) + Fraunces-Zeile; Forecast-Balken (.fc) Sage→Champagner-Verlauf + Scroll-Reveal via `animation-timeline: view()` (`@supports`+`no-preference`, `animation-range: entry 0% cover 40%`; Endzustand ohne Animation = sichtbar).
- [ ] **Step 5:** V1+V2+V3+V5 (Count-up landet exakt; RM → Endwerte sofort; Ring-Gauges überall wo `kpiRing` rendert: Team, Datenbank-Cockpit, Portal prüfen). V6.
- [ ] **Step 6: Commit** `git commit -m "feat(aurora): KPI-Band m. Count-up/Glow + Verlaufs-Ringe + Kapitel-Nummern + Forecast-Reveal (Stufe 2)"`.

### Task 7: Motion-System — View-Transitions + Entrances

**Files:** Modify: `index.html` (`go()` Z. 4641, neuer CSS-Block `/* ===== AURORA · MOTION ===== */`)
**Does NOT cover:** per-Karten-Hover einzelner Flächen (Stufe 3 je Fläche).

- [ ] **Step 1:** `go()` wrappen (Logik unverändert, nur Umschalt-Moment):
```js
function go(dest,seg){
  const _run=()=>{ /* ===== bisheriger go()-Body 1:1 hierher ===== */ };
  if(document.startViewTransition && !(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)){
    document.startViewTransition(_run);
  } else { _run(); }
}
```
- [ ] **Step 2:** CSS: `::view-transition-old(root),::view-transition-new(root){animation-duration:.28s}`; Entrance-Choreografie je View-Wechsel: bestehende `dv2Up`-Entrance-Muster (Design-V2) auf Aurora-Timing heben (Stagger ≤800ms, transform/opacity, Startzustand NUR im Keyframe-`from`).
- [ ] **Step 3:** Micro-Interactions global: Buttons/Zeilen `transition:transform .12s ease,border-color .12s ease,background .12s ease`, Hover-Lift max `translateY(-2px)` (Karten -4px), `@media(hover:hover)`-gated.
- [ ] **Step 4:** V1+V2+V5 (View-Wechsel blendet @Chrome; Fallback ohne VT-API = harter Wechsel OK; RM = keine Transitions; Esc-Kaskade + `dismissDetail`/History-Verhalten [WS1] unverändert — `openDetail`→Esc→`history.back()`-Pfad testen). V6.
- [ ] **Step 5: Commit** `git commit -m "feat(aurora): Motion — View-Transitions auf go() + Entrances + Micro-Interactions (Stufe 2)"`.

**→ STUFEN-GATE 2:** V1–V6, push, Pages „built".

---

## STUFE 3 · ARBEITSFLÄCHEN
*(Muster für alle Tasks 8–12: Elevation-Flächen statt Glas [Glas-Budget!], Radii-Regel Container 24px / Interaktives 10px (Spec §2.4), Fristen/Meta in Fragment Mono bzw. `.au-micro`, Serifen-Namen Fraunces, „stockt/überfällig" ausschließlich `var(--alert)`, Sterne `var(--brass)`. Visuelle Quelle: `design-lab/d-aurora.html` Anlässe/Kartei-Sektionen. Je Task: V1+V2+V3+V4(betroffene Overlays)+V6, eigener Commit `feat(aurora): <Fläche> (Stufe 3)`.)*

### Task 8: Fälle — Eingang, Board, Fall-Schublade
**Files:** Modify: `index.html` (`#inbox .mail`/`.mrow`/`.mmore`, `.zone-*`/`.done-rail`/`.col`, `#ovDetail`/`.d-acc`/kz-Kette `.kz-*`/Akte `.pa-*`)
- [ ] Eingang: Mail-Karten = `--paper`-Flächen, ungelesen-Marker champagner, aufklappen unverändert. Board: 3 Zonen-Bänder als Elevation-Stufen (`--cream2`→`--paper`→`--paper2`) statt Rahmen, Spaltenköpfe Mono, Karten-Sparklines (rsSpark) Stroke champagner. Schublade `#ovDetail`: Glas-Sheet (Budget: EINES der 3 erlaubten Overlays), kz-Kette: Stufen-Pills Mono (offen=`--muted`, angefragt=`--brass`, liegt vor=`--sage`, abgelehnt=`--alert`), Akte `.pa-*`: Historie-Timeline Hairline+champagner Punkte.
- [ ] Verify inkl.: `advanceFall`-Flow im Board (Karte bewegt sich), `sendReply`-Composer, `openStage`-Panel.

### Task 9: Team + Mein Tag
**Files:** Modify: `index.html` (`.tm-*`, `.mt-*`, Team-`.cv`-Spiegel [nur Container-Politur — SVG kam aus T5])
- [ ] Team-Cockpit-Karten auf Elevation; Mein Tag: Kopf-Begrüßung Fraunces italic-Moment, Fortschrittsleiste Track `--hair`/Füllung `--brass-grad`, Termin-Leiste + radar-card-Familie auf Aurora-Flächen, `mt-rollmenu` = `--raised`-Pill-Menü. ma-mode-Ausblendung (Z. 1666ff) funktional unverändert.
- [ ] Verify inkl.: kompletter Mein-Tag-Flow (Rollenwechsel → To-Do öffnen → „Erledigt" → Fortschritt +1 → zurück zur Leitung).

### Task 10: Netzwerk + Datenbank + Kampagnen
**Files:** Modify: `index.html` (`.z*`-Zuweiserkarten [enthalten `openReferrer`-Button — Markup-Struktur NICHT ändern, nur CSS], `.db-*`/`.stg-*`-Kartei, `.ar-*`-Anlässe, `.kp-*`-Sheet)
- [ ] Kartei = Ledger auf einem Glas-freien Panel, Gruppen-Köpfe (`.stg-h`) mit Messing→Champagner-Sternen; Anlass-Karten `.ar-card` nach d-aurora-Anatomie (dominante Karte + kleine, Foto-Slot `assets/green-hills.jpg`-Duotone); kp-Sheet Glas — aber `.kp-mail`-Vorschau bleibt LICHT-INSEL (T2, gegenprüfen!).
- [ ] Verify inkl.: Kampagnen-Flow Segment→Entwurf→Vorschau(hell!)→Demo-Versand-Toast; Radar-Tab „Radar & Anlässe" Feed.

### Task 11: Reha-Steuerung + System + Matrix
**Files:** Modify: `index.html` (`.rs-*`/`.ir-*`, `#rsDetail`, `.rsp-*`-Charts, System-View-Charts, `.mx-*`)
- [ ] rs-Cockpit + BWL-Panel auf Elevation; `rsp`-Charts: Linien champagner/sage mit Glow-Dot am Endwert, Grid `--hair`, Achsen-Labels Mono (rsSeries/rsChart-JS UNANGETASTET, nur Farb-/Stroke-Attribute bzw. CSS); Matrix-Zellen: `--paper`-Flächen, Zellen-Akzent-`::before` champagner, Achsenfarben-Chips (neue Werte aus T2 wirken automatisch); System-Charts analog.
- [ ] Verify inkl.: `openRsDetail(0)` Chart + Sparkline zeichnen; Matrix 6 Zellen; devBar-Demo-Aktionen.

### Task 12: Zuweiserportal + Dokument-Viewer
**Files:** Modify: `index.html` (`.rp-*`-Suite [Espresso-Direkthexes → Tokens], `#refOverlay`, `.rpd-*`-Viewer-CHROME [Backdrop/Close/Nav — `.rpd-paper` selbst bleibt Licht-Insel])
- [ ] Portal-Hero: Espresso-Hexes auf `--espresso-grad`/Token-Familie; KPI-Ringe erben `auroraRingGrad` (T6); Tabs/CTAs champagner; Submit-Kino + rpToast-Optik T13 vorgreifen NICHT (nur Farben). rpd: Viewer-Backdrop Ink-Glas, Papierbogen + MUSTER-Wasserzeichen + QR unverändert HELL; `@media print` Gegenprobe (T2-Regel greift).
- [ ] Verify inkl.: `openReferrer` alle 3 Tabs + Formular-Prefill + Submit-Erfolg; Dokument öffnen/Esc-Kaskade; QR-Kontrast (s/w auf Papier).

**→ STUFEN-GATE 3:** V1–V6 (alle Views + alle Overlays), push, Pages „built".

---

## STUFE 4 · ATMOSPHÄRE & FEINSCHLIFF

### Task 13: Toasts, Empty-States, Editorial-Moment, Icon-Sweep
**Files:** Modify: `index.html` (`#rpToast` [JS Z. 2882], `#inbToast` [Z. 3093], `refToast()` Z. 3973, Empty-State-Stellen, System-View)
- [ ] Toasts: solide `--raised`-Pills (KEIN backdrop-filter — Spec §5.8), Icon champagner, Entrance translateY. `refToast()`-`alert()` durch rpToast-Aufruf ersetzen (einzige zulässige JS-Kleinigkeit — Demo-Feedback-Regel bleibt erfüllt). Editorial-Tafel (aus C): System-View bekommt eine Grayscale-Bildtafel `assets/forest-sun.jpg` (`filter:grayscale(1)`) mit Mono-Caption „ABB. 01 — REGENERATION". Icon-Sweep: verbliebene Emoji/Unicode-Symbole (grep `✉\|↗\|✓\|⚠` + Review) → Inline-SVG 1.5px, `↗` darf als typografisches Zeichen bleiben.
- [ ] V1+V2+V3, Commit `feat(aurora): Toasts/Empty-States/Editorial-Tafel/Icon-Sweep (Stufe 4)`.

### Task 14: Anti-Slop-Pass + Design-Review + Kontrast/Perf-Audit
**Files:** Modify: `index.html` (nur Befund-Fixes)
- [ ] Kontrast-Stichprobe (V2): Body-Text ≥4.5:1 auf `--cream/--paper/--paper2` (Rechner: WebAIM-Formel via Browser-Eval); Glas-Budget-Audit: `grep -c "backdrop-filter" index.html` — nur Chrome (3) + 3 Overlays + kp/mt-Sheets + Hero ≤ 8 Vorkommen; `grep "filter:blur" index.html` → 0 Treffer auf animierten Selektoren.
- [ ] Fresh-Context-Review: `design-reviewer`-Agent auf die Live-Preview (Anti-Slop-Rubrik, Motion-Budget, RM, 390/1440, A11y) → Befunde fixen (PASS-Gate).
- [ ] `verifier`-Agent: Spec §9-Checkliste komplett gegen die App → CONFIRMED-Gate.
- [ ] Commit `fix(aurora): Review-Befunde — Kontrast/Anti-Slop/Perf (Stufe 4)`.

### Task 15: Doku-Abschluss
**Files:** Modify: `CLAUDE.md`, `HANDOVER.md`, `state.md`
- [ ] CLAUDE.md „Identität wahren"-Regel ersetzen: „Identität wahren: Fraunces + Inter + Fragment Mono; Aurora-Palette (Ink `#0B0D0C`/Champagner `#C4A97D`/Amber/Salbei); Licht-Inseln (.rpd-paper, .kp-mail, print) bleiben hell; kein filter:blur auf Animiertem; backdrop-filter nur Chrome/Hero/Sheets." HANDOVER §3-Token-Spiegel aktualisieren. state.md: Overhaul abgeschlossen.
- [ ] Commit `docs(aurora): CLAUDE.md-Identität + HANDOVER-Token-Spiegel aktualisiert (Stufe 4)` + push + Pages „built" + Live-URL-Stichprobe @1440.

**→ STUFEN-GATE 4 = Programm-Abnahme:** Screenshots aller 6 Views + 3 Overlays gegen `design-lab/d-aurora.html`; User-Sichtung.
