# Spec — Design-Overhaul „Lichtung": Bright Editorial Luxury + Bento/Glas/3D für das gesamte Concierge OS

**Datum:** 2026-07-15 · **Status:** Richtung vom User gewählt (Design-Lab Runde 2+3, iterativ verfeinert E→E2→E3)
**Datei:** `index.html` (Single-File-App bleibt) · Assets: bestehender `assets/`-Ordner
**Referenz-Artefakt (Messlatte):** `design-lab/e3-lichtung.html` — jede überarbeitete Fläche muss dieses Niveau halten.
**Autorisierung:** Fortsetzung des User-Mandats aus dem Aurora-Programm (alle Flächen inkl. Cofounder-Namespaces `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*` restylebar; Daten-/Funktions-Contracts unantastbar). User-Feedback-Kette: Aurora „zu braun/dunkel/blass" → Runde 2 (5 Richtungen) → Lichtung gewinnt → +Grafts (E2) → helle Sidebar → +Bento/Glas/3D (E3) → **„design language set"**.

## 1 · Ziel

Die App wechselt von der dunklen Aurora-Identität zu **„Lichtung"**: Galerie-helles Editorial-Luxury (Aesop/Kinfolk-Register) mit dimensionaler Raumsprache — Bento-Kacheln mit Layer-Schatten, diszipliniertes Frosted Glass über einem Ambient-Farbwash, Pointer-3D, farbige Daten-Hues, große Fotografie. Erzählung („Aus Quellen wird planbare Belegung") und alle Funktionen bleiben unverändert — **kein JS-Logik-Umbau, nur Präsentation** (+ die spezifizierten Motion-/Tilt-Utilities).

## 2 · Design-Language „Lichtung" (Token-System v3)

### 2.1 Farben — Token-Hebel v3 (NAMEN bleiben, WERTE werden hell)
```
--cream:#FAF8F2 (CANVAS hell!) · --cream2:#F4F1E8 · --paper:#FFFFFF · --paper2:#FDFCF8
--ink:#1B1B16 (TEXT dunkel!) · --ink-soft:#4A4A40 · --muted:#8A877A · --faint:#A5A296
--hair:rgba(27,27,22,.10) · --hair2:rgba(27,27,22,.06)
--brass:#C9A45C (Ocker, primärer Akzent) · --brass-deep:#A8854B (dunkler f. Text auf hell)
--brass-soft:#F3EAD8 · --brass-line:#E3D5B8
--sage:#6B8F6E (Moos) · --sage-deep:#21402D (Wald — Buttons/aktive Zustände/Headline-Momente)
--sage-soft:#EAF0E8 · --terra:#C96F4A (Terracotta — stockt/überfällig) · --terra-soft:#F7E8E0
NEU: --azzurro:#4E7CA8 (Daten-Hue) · --slate:#6E7580 (Daten-Hue neutral)
--raised:#FFFFFF · --glass:rgba(244,241,232,.72) · --glass-border:rgba(27,27,22,.08)
Achsenfarben (Fachbereiche): auf Hell-Lesbarkeit absenken (dunklere, satte Varianten;
Namen --ortho/--neuro/… bleiben; exakte Werte im Plan, Kontrast ≥4.5:1 auf --paper).
Schatten-Stack (der teure Tiefen-Look, als --shadow-Token):
  0 1px 2px rgba(27,27,22,.04), 0 8px 24px rgba(27,27,22,.07), 0 24px 64px -24px rgba(27,27,22,.12)
```
**Hue-Disziplin:** Wald/Moos/Ocker tragen Identität; Azzurro/Terracotta/Slate sind **reine Daten-Hues** (Charts, Ringe, Fäden, Tags) — nie Flächenfarben. Kein Violett. `accent-color:var(--sage-deep)`.

### 2.2 Licht-Inseln → Licht-Kontinuität
Die App ist wieder hell — der Aurora-Block `/* AURORA · LICHT-INSELN */` wird auf Lichtung-Werte
harmonisiert (`.rpd-paper`/`.kp-mail` = reines Papier-Weiß auf hellem Canvas, kein Re-Pin-Zwang mehr,
aber der Block bleibt als Guard bestehen). `@media print` unverändert weiß.

### 2.3 Typografie
Fraunces (Display, opsz; *Italic* für emotionale Momente) · Inter (Body/UI) · Fragment Mono
(Micro-Labels/Daten, uppercase .12–.14em) — **bleiben**. Display-Skala wächst editorial
(Hero-H1 clamp bis ~76px auf Heute; Flächen-Titel 26–34px). Ghost-Kapitelnummern (01/02/03)
als Kachel-Eyebrows. Utilities `.au-display`/`.au-micro` bleiben, Werte angepasst.

### 2.4 Material & Raum
- **Kachel-System (Bento):** Karten-Familien (.card, .kpi, .radar-card, .stg-Panels, Kapitel-
  Container …) werden weiße Kacheln: `border-radius:20–24px` + Schatten-Stack + 1px-Inset-Top-
  Highlight + Hairline-Border. Utility-Klasse `.lx-tile` additiv; bestehende Klassen erben per
  gescopter Regel, KEIN Markup-Big-Bang außerhalb Heute.
- **Ambient-Wash:** Die `.aurora`-Orbs werden zum Lichtung-Wash: 3 blasse, vorgeweichte
  Radial-Gradients (Moos/Ocker/Azzurro, 7–10% Alpha) fixed hinter allem, Drift 50–70s,
  transform-only, mobil statisch. (Ersetzt die 4 dunklen Orbs, gleicher DOM-Slot.)
- **Glas-Budget (HART, ~10):** frosted Sidebar + Topbar + Tabbar (Chrome) · Overlay-Sheets
  (ovDetail/dbDetail/rsDetail/rs-overlay/kp/mt/rpDocView-Backdrop) · 2 Hero-Glas-Chips ·
  Echtzeit-Strip auf Heute. Karten/Zeilen/Chips = solide `--paper` + Schatten-Stack.
  **NIE `filter:blur` auf Animiertem** (Wash = vorgeweichte Gradients). Toasts solide.
- **3D-System:** kleines Tilt-Utility (JS, `data-tilt`): max 3.5°, perspective 900px,
  Spekular-Sheen via CSS-Vars, NUR `@media(hover:hover) and (pointer:fine)`, aus bei
  Reduced Motion. Rollout auf Kachel-Familien (Heute-Kacheln, radar-cards, Anlass-Karten,
  KPI-Tiles); Listen-Zeilen bekommen KEINEN Tilt. Hero-Maus-Parallax (Foto + Chips,
  verschiedene Raten, max 10–14px).

### 2.5 Fotografie
Bestehende Foto-Momente (Team-Band, Netzwerk-Luftbild, DB-Quadrat, Reha/MeinTag-Bänder,
Portal-Bogen, Anlass-Strips via `AR_FOTO`) **bleiben an Ort und Stelle**, Grading wechselt:
dunkle Duotone-Washes → **heller warmer Grade** (leichtes Sättigungs-/Helligkeit-Lift +
Soft-Light-Overlay). Anlass-Karten erhalten **Bogen-Masken** (999px oben). Hero Heute:
Luftbild (kb-header.jpg) als große Foto-Fläche mit Ken-Burns + 2 driftenden Soft-Light-
Lichtflecken + Sonnen-Glare (~14s) + 2 frosted Glas-Chips (Werte via bestehender `set()`-Sync).

## 3 · Der Funnel (Contract heilig — Re-Skin hell)
Die `.cv-*`-Konvergenz (4 Instanzen, nur Heute trägt IDs, Team spiegelt via `data-sync`) behält
**Struktur, `set()`-Contract und offset-path-Animation (24 Pfade, `cv-travel`, Stagger) byte-identisch** —
Gate: grep-Zählungen vor==nach (offset-path=24, cv-travel, data-sync-Attribute). Re-Skin:
Pfade als feine Strokes in **per-Kanal-Daten-Hues** (Wald/Moos/Ocker/Azzurro/Terracotta/Slate),
wandernde Punkte in Kanalfarbe, Fokal-Kreis „EIN EINGANG" wald-grün auf Weiß, Chips hell,
Stepper Mono, „stockt" ausschließlich `--terra`. Trichter darunter: Bänder hell, Fills
Moos→Ocker, Zahlen `--ink`.

## 4 · Flächen-Mandate (Reihenfolge = Rollout §6)
1. **Chrome:** Sidebar = frosted Elfenbein (Referenz E3: weiße Aktiv-Pill, wald-grüner Text,
   Ocker-Indikator, Datum+User unten) · Topbar frosted hell · Tabbar (mobil) frosted, monochrom
   + Wald-aktiv · „+ Neue Anfrage" = Wald-grüner Solid-Button (einziger dunkler Button).
2. **Heute (Bühne):** Editorial-Hero (Begrüßung + H1 mit *Italic*-Moment + vergoldete Doppel-
   Regel m. Schimmer) + Foto-Fläche m. Glas-Chips + Funnel (§3) · KPI-Band = 4 Kacheln mit
   Hue-Kopflinien + Ring-Gauges (kpiRing auf per-KPI-Hue) + Count-up/Glint · Echtzeit-Strip
   (frosted) · Kapitel (Eingang/Anlässe/Belegung) als Bento-Kacheln m. Ghost-Nummern ·
   Anlass-Karten m. Bogen-Fotos · Forecast-Balken als wachsende Stängel m. Punkt-Kappen +
   Ocker-Ziellinie (Scroll-Reveal bleibt).
3. **Fälle:** Eingang-Liste + Board (3 Zonen-Bänder als Kachel-Gruppen) + Fall-Schublade
   (Sheet frosted, Inhalt Papier) — Fristen-Pills Mono, „stockt" nur `--terra`.
4. **Team + Mein Tag:** Cockpit-/Arbeitskarten als Kacheln; Mein Tag behält geführte Ruhe,
   Fortschrittsleiste Ocker; Team-Konvergenz-Spiegel prüfen (data-sync!).
5. **Netzwerk + Datenbank:** Zuweiser-Karten/Kartei-Panels als Kacheln, Sterne Ocker,
   Radar/Kampagnen-Sheet; Mailing-Vorschau bleibt helles Print-Artefakt.
6. **Reha + System + Matrix:** rs/ir-Cockpit + rsp-Charts (Linien Wald/Ocker auf Weiß,
   Grid-Hairlines), System-Charts, mx-Zellen als Kacheln.
7. **Zuweiserportal (rp) + Dokument-Viewer (rpd):** Portal hell-editorial; rpd-Papier
   unverändert (weiß), Backdrop frosted hell.
8. **Overlays/Toasts:** Sheets frosted (Budget §2.4), Toasts solide weiße Pills m. Schatten-Stack.

## 5 · Motion-System (No-Dependency; bestehende Mechanik bleibt)
View-Transitions auf `go()` (Guards bleiben) · Entrances ≤800ms Stagger, Start-Zustände NUR
im Keyframe-`from` · genau EIN Scroll-Reveal je langer View (Heute: Forecast) · Micro 100–150ms ·
Perpetuell (Budget): Ambient-Drift, Regel-Schimmer, Ken-Burns, Lichtflecken, Glare, Chip-Float —
alle transform/opacity-only · Count-up (rpCount) RM-safe · **Kill-Switch:** globaler RM-Block
(inkl. `animation-timeline:auto!important`) + Tilt/Parallax-JS no-op bei RM; Endzustände sofort korrekt.

## 6 · Rollout (4 Stufen, je Gate: verifizieren → committen → pushen; App nach jeder Stufe voll funktionsfähig)
- **Stufe 1 · Fundament:** Token-Hebel v3 (hell), Ambient-Wash, Schatten-/Kachel-Utilities,
  Chrome (Sidebar/Topbar/Tabbar), Licht-Insel-Harmonisierung, Craft (::selection, focus-visible,
  scrollbar, theme-color #FAF8F2), Kontrast-Audit-Grundlage.
- **Stufe 2 · Bühne:** Heute komplett (§4.2) inkl. Funnel-Re-Skin (§3, Contract-Gate) +
  Tilt-Utility + Hero-Parallax.
- **Stufe 3 · Arbeitsflächen:** Fälle, Team/Mein Tag, Netzwerk/Datenbank, Reha/System/Matrix (§4.3–6).
- **Stufe 4 · Feinschliff:** Portal + rpd (§4.7), Foto-Re-Grades, Overlays/Toasts, Anti-Slop-Pass,
  fresh-context verifier + Design-Review, CLAUDE.md-Identität + HANDOVER-§3-Token-Spiegel auf
  Lichtung aktualisieren.

## 7 · Verifikation (je Stufe, Pflicht vor Commit — V-Protokoll vom Aurora-Programm)
1. **V1 Syntax:** node vm.Script über alle `<script>`-Blöcke.
2. **V2 Breiten:** @1440 UND @390 — 0 Console-Errors, 0 horizontaler Overflow, Scroll flüssig.
3. **V3 Flächen:** alle 6 Views + Overlays (`openDetail(1)`, `openDbDetail(0)`, `openRsDetail(0)`,
   `openReferrer('portal','Leopoldina-Krankenhaus')` alle 3 Tabs, rpDocView, kp-Sheet, Mein-Tag) rendern.
4. **V4 Funnel-Contract:** grep-Zählungen (offset-path=24, cv-travel, data-sync) vor==nach;
   Punkte wandern auf allen 4 Instanzen; Trichter-Zahlen korrekt.
5. **V5 Reduced-Motion:** Endzustände sofort korrekt, nichts unsichtbar (Basis-opacity:0-Falle!),
   Tilt/Parallax aus.
6. **V6 Kontrast + Sync:** Body-Text ≥4.5:1 auf --paper/--cream; ProtonDrive-Hash-Wache
   (shasum index.html == git show HEAD); Pages-Build via gh api.

## 8 · Nicht-Ziele
Kein Backend/Logik-Umbau · keine neuen Views/Features · kein Theme-Toggle · keine Runtime-
Dependencies · keine Umbenennung von Datenfeldern/Funktions-Contracts (faelle/eingang/inReha/
bestand/radar/zuweiser/personen; rsSeries/rsChart/renderMatrix/openReferrer/rpTab/rpPersona/
kpiRing/set) · Matrix-/Portal-FUNKTIONEN unverändert · design-lab/ bleibt Archiv · kein Markup-
Big-Bang außerhalb Heute (Kacheln via additive CSS auf bestehende Klassen).

## 9 · Failure-Modes (adversarial geprüft)
- **Basis-opacity:0-Entrances** (E3 nutzt sie mit RM-Override): In der App VERBOTEN —
  Kachel-Entrances folgen der Hausregel (Start nur im Keyframe-from). Der E3-Ansatz wird
  bei der Übernahme umgebaut. *(kritisch → im Plan als explizite Regel je Task)*
- **Tilt auf Interaktions-Elementen:** Tilt verschiebt Hit-Targets minimal; auf Zeilen/Buttons
  deaktiviert, nur ganze Kacheln ohne primäre Klick-Funktion + `will-change` sparsam. *(minor)*
- **Glas über Scroll-Inhalten:** backdrop-filter-Chrome über scrollendem Content ist der
  teuerste Pfad — Budget hart bei ~10, Scroll-Smoke-Test @1440/@390 je Stufe. *(mitigiert via Gate)*
- **Heller Kontrast-Kipppunkt:** Ocker auf Weiß fällt unter 4.5:1 → für TEXT immer
  --brass-deep #A8854B verwenden, #C9A45C nur für Grafik/Linien. *(im Token-Design gelöst)*
- **4× cv-Instanzen driften** beim Re-Skin auseinander → V4-Gate zählt Attribute über alle
  4 Blöcke. *(mitigiert)*
