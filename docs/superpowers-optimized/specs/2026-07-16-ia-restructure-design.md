# Spec — Informationsarchitektur-Restrukturierung („Prozess-Achse")

**Datum:** 2026-07-16 · **Status:** vom User approved (Richtung: Prozess-Achse · Rollen-Schalter prominent · ein Konzept-Bereich · Nav + Views entflechten).
**Kontext:** Nach dem Jade-Apotheke-Overhaul ist die App visuell konsistent, aber die Struktur historisch gewachsen: Nav ordnet nach Datentöpfen statt nach der Maschine, Kern-Features sind vergraben (Mein Tag, Radar, Zuweiserportal mobil, Kampagnen), „Heute" und „System" sind überladen.

## Ziel

Die Navigation erzählt die Maschine als Prozess (Ergebnis → Arbeiten → Qualität → Herkunft → Beweis → Konzept), die zwei Personas werden sichtbar, jedes Feature hat genau einen offensichtlichen Ort. **Null Funktionsverlust, null visuelle Degradation** (Jade-Apotheke-System unangetastet).

## Nicht-Ziele

- Kein neues Feature, keine neuen Daten, kein Redesign einzelner Widgets (nur Verortung + Einstiege).
- Keine Änderung an Papier-Inseln (`.rpd-paper`/`.kp-mail`), `@media print`, Daten-Arrays, Funktions-Signaturen.
- Keine Änderung an ma-mode-Mechanik (`mtEnter`/`mtExit`/`mtTodos`/…) — nur der Einstieg wird sichtbar.
- Kein Persistenz-/Backend-Thema.

## Ziel-Navigation (Sidebar = Tabbar, 6 Punkte)

| # | Nav-Punkt (`data-nav`) | Segmente (`SEGS`) | Herkunft |
|---|---|---|---|
| 1 | **Heute** `heute` | — | bleibt, entschlackt (s. u.) |
| 2 | **Fälle** `faelle` | `anfragen` ⭐ · `board` · `team` | Team-View wird 3. Segment; `inreha` zieht aus |
| 3 | **In Reha** `inreha` | — | ehem. `sub-faelle-inreha` → eigener View `#view-inreha` (rsCockpit, inrehaGrid, rsDetail) |
| 4 | **Netzwerk** `netzwerk` | `zuweiser` ⭐ · `radar` · `kontakte` | Radar aus dem `dbView`-Toggle herausgelöst; „bestand" heißt künftig `kontakte` |
| 5 | **Auswertung** `auswertung` | — | ehem. `sub-system-auswertung` → eigener View `#view-auswertung` (6 Charts + Modul-Karten) |
| 6 | **Konzept** `konzept` | `idee` ⭐ · `matrix` · `sops` | ehem. `#view-system` umbenannt; Matrix-View zieht als Segment ein |

⭐ = Default-Segment. `#view-team`, `#view-matrix`, `#view-system` als Top-Level-Views entfallen (Inhalte ziehen um, DOM-Blöcke wholesale, IDs bleiben).

**Sidebar-Reihenfolge = Pitch-Dramaturgie:** Heute (Ergebnis) → Fälle (Arbeiten) → In Reha (Qualität) → Netzwerk (Herkunft/Gewinnen) → Auswertung (Beweis) → Konzept (die Maschine erklärt).

**Mobile-Tabbar:** dieselben 6 Punkte. Falls Labels @390px nicht passen: Kurzlabels erlaubt (`In Reha`→`Reha`, `Auswertung`→`Zahlen`) — Entscheidung fällt bei der 390px-Verifikation, Desktop-Sidebar behält Langlabels. Badge `navBadgeFaelle` bleibt auf Fälle.

## Rollen-Schalter „Leitung ⇄ Koordination"

- Ersetzt den versteckten Avatar-Dropdown (`#mtAvaBtn` + `#mtRollmenu`) als **primären** Einstieg.
- **Desktop:** sichtbarer Zwei-Zustands-Schalter oben in der Sidebar (unter `.ds-brand`, Etiketten-Stil: Ivory-Plate, Gold-Hairline, aktiver Zustand Lack-Jade). Klick „Koordination" → `mtEnter()`; in ma-mode zeigt der Mein-Tag-Header wie bisher den Rückweg (`mtExit()`).
- **Mobile:** derselbe Schalter sichtbar in der Topbar (statt Avatar-Menü); kompakte Form (z. B. zwei Siegel-Chips).
- `mtEnter`/`mtExit`/`renderMeinTag` unverändert; der alte Dropdown-Code darf entfallen, wenn der Schalter ihn vollständig ersetzt (Funktion = Perspektivwechsel bleibt, nur anderes UI).

## Versteckte Features → sichtbare Orte

1. **Zuweiserportal mobil:** Neue Portal-Etiketten-Karte im Segment Netzwerk→Zuweiser („Zuweiserportal öffnen ↗", `openReferrer('portal', …)`), auf allen Breiten sichtbar. Desktop-Gold-Button in der Sidebar bleibt. Overlay selbst ist bereits responsive — nur der Einstieg fehlt <1024px.
2. **Kampagnen/Newsletter:** Der `kpOpen()`-Einstieg im Zuweiser-Segment wird eine echte Etiketten-Karte („Kampagne an Zuweiser-Segment senden") statt unscheinbarem Button. `kpSheet`-Mechanik unverändert.
3. **Radar:** eigenes Segment (s. o.); der `dbView`-Toggle innerhalb „Datenbank" entfällt — `setDbView('radar')` wird Alias für `go('netzwerk','radar')`, `setDbView('kontakte')` für `go('netzwerk','kontakte')`.

## Heute-Entschlackung (umziehen, nicht löschen)

- **Anlässe-Grid** (`anlassChap`/`anlassList`) → zieht ins Segment Netzwerk→Radar (dort zusammen mit dem bisherigen Radar-Rendering: KPIs + Fällig-Liste + Anlässe-Grid = ein kuratiertes Radar-Segment). Auf Heute ersetzt durch **eine** schmale Siegel-Zeile „Radar heute: N fällig ›" → `go('netzwerk','radar')`; N aus derselben Ableitung wie bisher (`anlaesse()`/Radar-Fälligkeit).
- **Chart-Mini-Verweise** (3× `onclick="go('system','auswertung')"`-Flächen) → ersetzt durch einen Verweis „Zur Auswertung ›" → `go('auswertung')`.
- **Fotos:** Campus-Band bleibt (ein Atmosphäre-Moment); Küche-Solo-Karte entfällt ersatzlos aus Heute (Asset bleibt im Repo).
- Bleibt auf Heute: Hero + Konvergenz-Panel, Trichter-Karte (№ 01), Nordstern-KPI-Band, „Heute wichtig", Belegungs-Forecast, Suite-Kachel.
- Kapitel-Siegel-Nummern (01/02/03) werden nach dem Umzug neu durchgezählt, Regel bleibt: Zinnober nur 01, sonst Gold-Ring.

## Mechanik / Verträge

- **`go(dest,seg)` bleibt der Router.** `SEGS` neu: `{faelle:["anfragen","board","team"], netzwerk:["zuweiser","radar","kontakte"], konzept:["idee","matrix","sops"]}`.
- **Alias-Schicht** (in `switchTab()` + `applyHash()` + `mxGo()`), damit alte Routen/Hashes weiter funktionieren:
  `team`→`faelle/team` · `matrix`→`konzept/matrix` · `system`→`konzept` · `system/idee|sops`→`konzept/…` · `system/auswertung`→`auswertung` · `faelle/inreha`→`inreha` · `netzwerk/bestand`→`netzwerk/kontakte` (+`setDbView('radar')`-Kombination → `netzwerk/radar`).
  Zusätzlich werden alle internen Callsites (~20 `go()`-Stellen, `MATRIX`-Routen, WS1-Widget-String, `inbToast`, Boot/`applyHash`-Fallbacks) direkt auf die neuen Routen umgestellt — die Alias-Schicht ist Sicherheitsnetz, nicht Dauerzustand.
- **DOM-Umzüge wholesale:** Die Sektionen `sub-faelle-inreha`, `sub-system-auswertung`, `#view-matrix`-Inhalt, `#view-team`-Inhalt (ohne cv-Duplikat, s. u.), Anlässe-Block wandern als komplette Blöcke mit unveränderten inneren IDs — Render-Funktionen (`renderRadar`, `rsCockpit`, `renderCharts`, `renderTeam`, `renderMatrix`, `renderAnlaesse`, …) bleiben signaturgleich.
- **Funnel-Contract wird bewusst neu eingefroren:** Der Team-View trägt heute die 2. cv-Instanz (wide+narrow, via `data-sync` gespiegelt). Beim Umzug von Team als Fälle-Segment entfällt das cv-Duplikat ersatzlos (Heute behält die Signatur-Animation). Neue erwartete Zählwerte nach Umbau: **offset-path 12 · cv-travel 2 · data-sync ≈ 23** (exakte Zahl beim Einfrieren gemessen); `.workflow/jade-baseline.txt` wird aktualisiert und im Commit dokumentiert — kein stiller Drift.
- **Overlays unverändert:** `ovDetail`, `dbDetail` (Desktop-Rail, hängt künftig am Kontakte-Segment), `rsDetail`, `sheetNeu`, `kpSheet`, `refOverlay` — nur Einstiege/Verortung ändern sich.
- **Topbar-Titel (`TITLES`/`dtopTitle`) und Segment-Tablists** werden auf die neue Struktur aktualisiert.

## Fehlerbehandlung

- `go()` behält den Fallback auf `heute` bei unbekanntem View; Alias-Map fängt alle Alt-Routen ab (kein toter Hash).
- `setDbView`/`switchTab` bleiben als Funktionen erhalten (Parity!), delegieren nur.

## Test-/Abnahme-Strategie (V-Protokoll)

- V1 `node vm.Script` über alle `<script>`-Blöcke.
- V2 @1440 + @390: 0 Console-Errors, 0 horizontaler Overflow; Tabbar-Labels @390 lesbar.
- V3 Funktions-Sweep: alle 6 neuen Views + alle Segmente, `openDetail`/`openDbDetail`/`openRsDetail`/`openSheetNeu`/`kpOpen`/`openReferrer` (inkl. **mobilem** Portal-Einstieg) + `rpTab`/`rpDoc` + Rollen-Schalter → ma-mode rein/raus (beide Breiten).
- V4 Funnel-Gates gegen die **neu eingefrorene** Baseline (12/2/≈23); Dot-`offset-path` === Pfad-`d` script-verifiziert.
- V5 `opacity:0` nur in Keyframes; Motion-Welt-Set bleibt bei exakt 9 Keyframes.
- V6 Parity: Funktions-/Const-/ID-Inventar vor==nach (erlaubte, dokumentierte Deltas: entfallendes cv-Duplikat-Markup, entfallender Avatar-Dropdown, neue Schalter-/Karten-IDs); Kontrast-Stichproben; `git pull` vor Push; Pages-Build-Check.
- Alt-Hash-Regression: `#system/auswertung`, `#team`, `#matrix`, `#faelle/inreha`, `#netzwerk/bestand` landen alle korrekt.

## Failure-Modes (geprüft)

1. **Tabbar @390 mit längeren Labels** — *minor*, Kurzlabel-Fallback spezifiziert.
2. **Radar-Herauslösung koppelt an `dbView`/`dbDetail`** — DOM-wholesale + Alias + Inspector-Test im Gate.
3. **cv-Duplikat-Entfall ändert Funnel-Zählwerte** — bewusstes Neu-Einfrieren der Baseline statt stillem Drift (dokumentiert, script-verifiziert).

## Rollout

Feature-Branch `feat/ia` → Tasks sequenziell (Plan folgt via writing-plans) → V-Protokoll je Gate → `git pull` → merge auf `main` (Pages-Deploy). Fable-Executors gemäß Standing-Mandat.
