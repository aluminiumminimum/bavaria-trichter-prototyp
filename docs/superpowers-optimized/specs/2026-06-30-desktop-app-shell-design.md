# Spec — Desktop-App-Shell (≥1024px), Mobile unverändert

**Datum:** 2026-06-30
**Datei:** `index.html` (single self-contained, inline CSS/JS, keine Build-Tools)
**Status:** Approved (User „ok", inkl. Datenbank-Inspector)

## 1. Ziel & Kontext

Der Prototyp ist heute **mobile-first**: `.app{max-width:720px;margin:0 auto}` zentriert die komplette Mobile-Ansicht in einer schmalen Spalte; die phone-style Bottom-Tabbar bleibt fix unten; nur wenige Grids werden ab 900px 2-spaltig. Auf breiten Screens = schmaler Streifen mit großen leeren Rändern.

**Auftrag:** Ab **1024px** wird daraus eine vollwertige Desktop-App (Sidebar + Topbar, Master-Detail, Multi-Column, Animationen). **Unter 1024px bleibt die Mobile-Ansicht byte-for-byte identisch.**

### Harte Invariante
Jede Desktop-Regel sitzt hinter `@media(min-width:1024px)`. Jedes neue Desktop-Chrome-Element ist auf Mobile `display:none`. Mobile-Render-Pfad, Mobile-Markup-Defaults und alle bestehenden Mobile-Interaktionen bleiben unangetastet.

### Identität
Luxus-Editorial (Cormorant Garamond + Inter, Messing/Sand/Espresso-Palette) bleibt erhalten — nur großzügig auf Desktop-Breite mit echten Spalten. **Kein** Wechsel zu dichtem Productivity-Look.

## 2. Festgelegte Parameter (aus Brainstorming)

| Fork | Entscheidung |
|------|--------------|
| Navigation | **Linke Sidebar + schlanke Topbar** |
| Umfang | **App-Shell + Multi-Column + Master-Detail Split-View** (Fälle **und** Datenbank) |
| Breakpoint | **≥1024px** (iPad-Hochformat 768–1023 bleibt Mobile) |

### Maße (Design-Tokens, im `@media` definiert)
- Sidebar-Breite: `248px`
- Topbar-Höhe: `~64px`
- Content max-width: `1240px`
- Detail-Inspector-Schiene: `~460px`
- Feinbreakpoint für 3-Spalten-Grids: `~1320px`

## 3. Architektur

### 3.1 Bestehende Strukturen (nicht brechen)
- **Nav:** `go(dest, seg)` toggelt `.active` auf `main section.view` + `.tabbar [data-nav]`; Sub-Tabs via `SEGS` + `.seg`-Buttons + `#sub-<dest>-<seg>`-Panels; Hash-Routing via `applyHash()`.
- **5 Views:** `view-heute`, `view-faelle`, `view-netzwerk`, `view-system`, `view-matrix`.
- **Fall-Detail:** `#ovDetail` = Singleton-Vollbild-Modal (`position:fixed;inset:0`, `.open`-Klasse). `openDetail(id)` füllt verdrahtete IDs (`dName`, `dStatus`, …); Speichern schreibt zurück + `renderAll()`. Werdegang-Zweispur (`.mbody.two-track`) liegt **innerhalb** dieses Modals.
- **Datenbank:** `renderBestand()` rendert `bestand[]` als Karten/Kanban unter Netzwerk→`bestand`. **Kein** Detail-Panel vorhanden.
- **Echte Modals (bleiben modal, auch Desktop):** Neue-Anfrage-Sheet `#sheetNeu`, Referrer-Overlay `#refOverlay` — beide nutzen `body.locked`.

### 3.2 App-Shell (Chrome)

**Sidebar** — neues `<aside class="dsidebar">` (Mobile `display:none`):
- Logo/Monogramm oben.
- 5 Nav-Items, **gleiche** SVG-Icons + `data-nav`-Attribute wie Tabbar; aktiver Zustand mit Messing-Akzent (linke Akzentleiste / Soft-Background).
- „Neue Anfrage"-CTA (ruft `openSheetNeu()`).
- `position:fixed; left:0; top:0; bottom:0; width:248px`.

**Topbar** — neues `<header class="dtopbar">` (Mobile `display:none`):
- `position:fixed; top:0; left:248px; right:0; height:64px`.
- Links: View-Titel (Cormorant) + Subtitel/Breadcrumb.
- Rechts: Datum, „Neue Anfrage"-Button, Avatar-Monogramm.

**Layout-Shift (nur Desktop):**
- `.app{max-width:none; margin-left:248px}`
- `.content{max-width:1240px; margin:0 auto; padding-top:` Topbar-Höhe + Abstand `}`
- `.tabbar{display:none}`

**Mechanik:** `position:fixed` für Sidebar+Topbar → **kein DOM-Umbau**, Mobile-Markup unberührt.

**`go()`-Erweiterung (minimal):**
- Selektor `.tabbar [data-nav]` → `[data-nav]` (synchronisiert Sidebar **und** Tabbar in einem Aufruf).
- Setzt Topbar-Titel/Subtitel aus zentraler Map `{heute:[…], faelle:[…], …}`.
- Sidebar-Items bekommen denselben Click-Handler wie Tabbar-Items (oder gemeinsamer `[data-nav]`-Handler).

### 3.3 Master-Detail

**Fälle (Inspector-Schiene, Wiederverwendung von `#ovDetail`):**
- Auf Desktop wird `#ovDetail.open` per CSS **nicht** Vollbild-Modal, sondern angedockte rechte Schiene (`position:fixed; right:0; top:0; bottom:0; width:460px`), Slide-in von rechts.
- Content weicht aus: bei offenem Detail bekommt der Content `margin-right:460px` → **kein Overlap**, Liste bleibt sichtbar & klickbar.
- **Save-Logik unverändert.** Einzige JS-Änderung: `openDetail`/`closeDetail` toggeln zusätzlich Body-Klasse `detail-open`.
- **Scroll-Lock:** Auf Desktop **kein** `body.locked` für das Detail (Liste muss scrollbar bleiben). Lösung: `openDetail` fügt `locked` nur hinzu, wenn **nicht** Desktop (`matchMedia('(min-width:1024px)').matches`), und immer `detail-open`. Rail-CSS keyed auf `detail-open`. Sheet/Referrer behalten `locked` → bleiben überall modal.

**Datenbank (netto-neuer kompakter Inspector):**
- Klick auf Datenbank-Patient → rechte Inspector-Schiene mit read-mostly Profil: Name, Stufe, Quelle, Consent, **abgeleitete Automation via vorhandenem `autoFor()`**, Wiedervorlage-Aktion.
- Bewusst klein, **nur garantiert vorhandene `bestand[]`-Felder**, Guards gegen fehlende Felder.
- Nutzt dieselbe Rail-Positionierung + denselben Content-Shift wie Fälle (gemeinsame CSS-Klassen), eigenes kleines Container-Element `#dbDetail` (oder generischer Rail-Container).

### 3.4 Multi-Column-Reflow pro View (nur Desktop)
- **Heute:** echtes Dashboard-Grid — Begrüßung/Hero + KPI-Spalten + Aktivitäts-/Wichtig-Liste nebeneinander statt gestapelt.
- **Matrix:** nutzt bereits 3-Spalten ab 900px — auf Desktop verfeinert (Abstände/Breite).
- **Netzwerk / System:** breitere Karten-Grids (2–3 Spalten, abhängig vom Feinbreakpoint ~1320px).

### 3.5 Animationen / Polish
- Sidebar-Item Hover-Slide + aktiver-Zustand-Transition.
- Detail-Rail Slide-in von rechts; Content-Shift-Transition (auf `margin`, ruckelfrei).
- Topbar-Fade.
- View-Wechsel: vorhandenes `viewIn`-Keyframe.
- Hover-Lift auf Karten: existiert bereits (`@media(hover:hover)`).
- Alles unter `prefers-reduced-motion` — **bereits global gehandhabt** (Zeilen ~608/677), neue Transitions erben das.

## 4. Non-Goals
- Kein Backend, keine echte Suche, keine Auth, keine neuen Datenarrays.
- iPad-Hochformat (768–1023px) bleibt bewusst Mobile.
- Neue-Anfrage-Sheet & Referrer-Overlay bleiben Vollflächen-Modals (auf Desktop nur breitenbegrenzt/zentriert als Polish — optional).
- Keine Topbar-Volltextsuche im Kern (optionaler Stretch: Listen-Filter nach Name in Fälle/Datenbank).
- 130k-AI-Liste / Klinik-Chefarzt-Cleanup = Pascals Task, **out of scope**, nicht anfassen.

## 5. Failure-Modes & Mitigations

1. **Scroll-Lock-Konflikt (kritisch).** `body.locked` (overflow:hidden) würde die Liste hinter dem angedockten Detail einfrieren. → Detail nutzt eigene Klasse `detail-open` ohne Lock auf Desktop; Sheet/Referrer behalten `locked` und bleiben modal. Sauber getrennt.
2. **Nav-Desync (kritisch).** Sidebar/Tabbar/Topbar-Titel laufen auseinander. → `go()` aktualisiert alle `[data-nav]` + zentrale Titel-Map; pro View klick-getestet.
3. **Datenbank-Inspector netto-neu (mittel).** Datenform-Annahmen brechen. → read-only, nur garantiert vorhandene Felder, Guards.
4. **Horizontal-Overflow durch Rail+Shift (mittel).** → Rail `fixed;right:0`, Content per `margin-right` (kein width-calc); `overflow-x:hidden` bereits auf html/body; 1024/1440px-Visual-Gate verifiziert keinen H-Scroll.
5. **Medium-Width 1024–1240 zu eng (minor).** → Feinbreakpoint ~1320px steuert 2- vs. 3-Spalten; bei 1024 konservativ 2-spaltig.

## 6. Testing / Verifikation
- **Mobile-Regression (390px, Chrome MCP mobile-emulation):** alle 5 Views rendern, 0 JS-Fehler, kein H-Scroll, Tabbar sichtbar, Fall-Detail = Vollbild-Modal wie bisher, Sheet/Referrer modal. **Muss 1:1 wie vor der Änderung sein.**
- **Desktop (1440px):** Sidebar + Topbar sichtbar & synchron, Tabbar versteckt; Master-Detail dockt rechts an (Fälle + Datenbank), Content weicht aus, kein Overlap, Liste klickbar; Multi-Column-Grids greifen; 0 JS-Fehler; kein H-Scroll.
- **Übergang:** Resize 1023↔1024 schaltet sauber zwischen Mobile- und Desktop-Shell ohne Layout-Bruch.
- Pro Implementierungs-Task: grep-Marker + `node`-JS-Parse-Check + (für sichtbare Tasks) Visual-Gate bei 390px **und** 1440px.

## 7. Rollout
- Branch `feat/desktop-app-shell` (oder analog), Tasks via `subagent-driven-development`.
- Single-file `index.html`; nach Verifikation merge to `main` → GitHub Pages live (Confirm-first für Produktions-Deploy auf die Pitch-URL).
