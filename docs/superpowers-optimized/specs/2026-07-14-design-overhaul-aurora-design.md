# Spec — Design-Overhaul „Aurora": Ink & Iridescence für das gesamte Concierge OS

**Datum:** 2026-07-14 · **Status:** Richtung vom User gewählt (Design-Lab-Vergleich, 4 Prototypen)
**Datei:** `index.html` (Single-File-App bleibt) + neuer `assets/`-Ordner
**Referenz-Artefakt:** `design-lab/d-aurora.html` (visueller Nordstern) + Anreicherungen aus `a-alpine.html`/`b-nocturne.html`/`c-galerie.html`
**Autorisierung:** User hat explizit freigegeben: (1) komplette Neugestaltung ALLER Flächen inkl. Cofounder-Namespaces (`.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*` — „Alles restylen", Cofounder ist fertig, wir arbeiten ungestört), (2) Bilder von klinik-bavaria.com (Original-Klinik-Seite), (3) Original-Funnel-Animation erhalten, premium machen. Die HANDOVER-§2-Regeln 2 (Cofounder-Code) und 7 (Identität/Palette) sind für dieses Programm **vom User aufgehoben**; alle übrigen Regeln gelten weiter.

## 1 · Ziel

Die App sieht aus wie ein 2026-Flagship-Produkt: tiefe Ink-Leinwand, lebendes Licht (Aurora-Orbs in Salbei→Champagner→Amber), Glas-Tiefe, leuchtende Daten — Linear-Grade-Politur trifft Luxus-Kur. Jede Fläche wird neu gedacht. Die Erzählung („Aus Quellen wird planbare Belegung") und alle Funktionen bleiben unverändert — **kein JS-Logik-Umbau, nur Präsentation** (Ausnahme: Motion-Enhancements und die als „echt mutierend" spezifizierten Demo-Aktionen bleiben wie sie sind).

**Design-Messlatte (Abnahme):** Screenshot-Vergleich gegen `design-lab/d-aurora.html`. „Rendert korrekt" reicht nicht — jede überarbeitete Fläche muss das Aurora-Niveau halten.

## 2 · Design-Language „Aurora" (Token-System v2)

### 2.1 Farben (ersetzt die Cream/Espresso-Tokens)
```
Canvas:      --ink:#0B0D0C (Body-Hintergrund)
Elevation:   --surface:#141613 · --elevated:#1B1E19 · --raised:#23261F (3-Stufen-Leiter)
Text:        --text:#F0EBE1 · --muted:#97917F · --faint:#6E6A5E
Hairline:    rgba(240,235,225,.09) · Inset-Highlight rgba(255,255,255,.06)
Akzente:     --champagne:#C4A97D (primär) · --amber:#D99A5B · --sage:#7E9B84 (positiv)
             --alert:#D9784F (stockt/überfällig — ersetzt --terra funktional)
Achsenfarben (Fachbereiche) bleiben SEMANTISCH, werden aber auf Dark-Legibility angehoben
             (je +15-20 % Luminanz; exakte Werte im Plan; Namen --ortho/--neuro/… bleiben).
```
**Hue-Disziplin:** ausschließlich Grün/Gold/Amber-Familie. NIEMALS Blau/Violett (definitives AI-Slop-Tell). `accent-color: var(--champagne)`.

### 2.2 Licht-Inseln (bleiben hell — bewusste Ausnahmen)
- `.rpd-*` Dokument-Viewer: Arztbrief/Kurzbericht/Mediplan bleiben **Papierbögen** (paper-weiß, MUSTER-Wasserzeichen, QR s/w) — medizinische Dokumente auf dunklem Glas wären falsch. Der Viewer-Hintergrund (Backdrop) wird Ink-Glas, das PAPIER bleibt hell.
- Druck (`@media print`): druckbare Inhalte weiß.
- Newsletter-Premium-Vorschau (kp): edles helles Mailing (Espresso-Kopf) — ein Print-Artefakt, kein UI.

### 2.3 Typografie
- **Fraunces** (Display; 300–600 + Italic, opsz) ersetzt Cormorant Garamond **überall** — inkl. Cofounder-Deklarationen (Suchen&Ersetzen `"Cormorant Garamond"` → `"Fraunces"`, Fallback Georgia bleibt). Emotionale Momente in Italic mit Champagner→Amber `background-clip`-Verlauf (sparsam: H1 + je Fläche max. 1 Moment).
- **Inter** bleibt Body/UI. **Fragment Mono** neu für Micro-Labels/KPI-Einheiten/Timestamps/Daten (uppercase, .12em, 11px).
- Fluid `clamp()`-Skala; Display eng gespationiert (−0.02…−0.04em), Micro offen. Google-Fonts-Link: Fraunces + Inter + Fragment Mono (Cormorant entfällt).

### 2.4 Material & Form
- **Glas-Budget (HART — Lehre aus dem Prototyp-Perf-Wedge):** `backdrop-filter` NUR auf: Sidebar, Topbar, den 3 Detail-Overlays/Sheets (ovDetail/dbDetail/rsDetail + kp/mt-Sheets) und dem Hero-Panel. Karten/Zeilen/Chips = **solide Elevation-Flächen** (rgba-Alpha auf --surface/--elevated), KEIN backdrop-filter. NIEMALS `filter:blur()` auf animierten Elementen — weiche Kanten kommen aus Radial-Gradient-Falloff (Prototyp-Fix ist der Standard).
- Aurora-Hintergrund: 3 fixe Gradient-Orbs (Falloff, kein Blur-Filter) + SVG-Noise 3 % + Vignette; Drift 47–58s alternate, **nur ≥1024px** — mobil statischer Gradient (Perf).
- Radii: Container 24px, Interaktives 10px. Inset-Top-Highlight auf allen Elevation-Flächen.
- Icons: durchgängig Inline-SVG 1.5px-Stroke (bestehende Emoji/Unicode-Icons in Nav/Buttons werden ersetzt; ★-Glyphen für Sterne bleiben).

### 2.5 Anreicherungen aus den anderen Richtungen (kuratiert, Teil der Abnahme)
- **aus B (Nocturne):** KPI-Count-up beim Erscheinen (reduced-motion → Endwert sofort); „Daten als Licht": KPI-Zahlen mit dezentem Glow.
- **aus A (Alpine):** Fotografie in **Bogen-Masken** (arch, 999px oben) mit Ink-Duotone-Overlay — der „teure Spa-Moment" für Hero/Anlässe/Akte-Momente.
- **aus C (Galerie):** Mono-Katalog-Nummerierung der Heute-Kapitel („01 EINGANG · 02 ANLÄSSE · 03 BELEGUNG"); eine Grayscale-Editorial-Bildtafel mit Bildunterschrift als Empty-State-/System-View-Moment.
- Conversion-/Ring-KPIs als SVG-Ring-Gauges mit Sage→Champagner-Verlaufsstroke (`kpiRing` wird darauf umgebaut).

## 3 · Assets (`assets/` im Repo, nie hotlinken)
Von klinik-bavaria.com (Original-Klinik, User-autorisiert; Quell-URLs im Plan dokumentieren): `kb-header.jpg` (Luftbild Haus — Duotone für System/Netzwerk-Kontext), `kb-suite.webp` + `kb-komfort-wall.webp` + `kb-komfortzimmer.webp` (Interiors — Hero-/Anlass-Atmosphäre; höher aufgelöste Originale während der Umsetzung nachladen, wo die Cache-Varianten <1200px sind), `kb-logo-beige.webp`/`kb-logo-weiss.webp` (ECHTE Wortmarke → ersetzt das „KB"-Monogramm in Sidebar/Topbar), `kb-kueche.webp`, `kb-klinik.jpg`, `kb-umgebung-*.jpg` (sekundär). Ergänzend die kuratierten Unsplash-Motive aus `design-lab/img/` (green-hills, fog-mountain, forest-sun, alpine-vista; Unsplash-Lizenz). Alle Bilder web-optimiert (≤300KB, passende Auflösung), `loading="lazy"` außer Hero.

## 4 · Der Funnel (Original-Animation erhalten, premium)
Die `.cv-*`-Konvergenz existiert 4× (Heute/Team × breit/schmal; nur Heute trägt IDs, Team spiegelt via `data-sync`) — **Struktur, `set()`-Contract und die `offset-path`-Punkt-Animation (`cv-travel`, Stagger-Delays) bleiben exakt erhalten.** Premium-Re-Skin: Kanal-Chips als Glas-Pills; Pfade als feine Champagner-Strokes mit Glow; die wandernden Punkte heller mit stärkerem `drop-shadow`; Fokal-Kreis „EIN EINGANG" als leuchtende Glas-Scheibe; Stepper in Mono; „2 stockt" in --alert. Gleiches Prinzip für den Trichter darunter (die einzige „→ Belegung"-Grafik): Bänder/Zahlen auf Dark angehoben, Verlaufs-Fills Sage→Champagner. Alle 4 SVG-Blöcke synchron ändern.

## 5 · Flächen-Mandate (jede Fläche wird angefasst; Reihenfolge = Rollout §8)
1. **Chrome:** Sidebar = Glas auf Ink, echte Wortmarke, aktiver Punkt = Champagner-Glow-Pill; Topbar = Glas, sticky; Tabbar (mobil) = Glas, monochrom + Champagner-aktiv. „+ Neue Anfrage" = Champagner→Amber-Verlaufsbutton (einziger Verlaufsbutton der App).
2. **Heute:** Hero mit Aurora-Hintergrund + Funnel (§4) + Bogen-Foto (kb-suite); KPI-Band mit Count-up/Glow; Kapitel mit Mono-Nummern; Anlass-Karten (.ar) + Forecast (.fc) auf Elevation-Flächen, Forecast-Balken Sage→Champagner mit Scroll-Reveal.
3. **Fälle:** Eingang (Mail-Liste) + Board (3 Zonen-Bänder + Done-Rail) + Fall-Schublade (ovDetail, inkl. kz-Kette/Akte/Composer) — Zonen als Elevation-Stufen statt Rahmen, Fristen-Pills in Mono, „stockt" ausschließlich --alert.
4. **Team + Mein Tag:** Cockpit-Karten; Mein Tag behält seine geführte Ruhe — dunkler, wärmer, Fortschrittsleiste Champagner.
5. **Netzwerk + Datenbank:** Zuweiser-Karten/Karte, Kartei-Panels (.stg/.db-c) als Ledger auf Glas-Panel, Sterne Champagner; Radar & Anlässe; Kampagnen-Sheet (kp) — Vorschau bleibt helles Mailing (§2.2).
6. **Reha-Steuerung + System + Matrix:** rs/ir-Cockpit, rsp-Charts (Linien auf Champagner/Sage mit Glow, Grid-Hairlines), Datenbank-/System-Charts, mx-Matrix-Zellen.
7. **Zuweiserportal (rp) + Dokument-Viewer (rpd):** Portal-Overlay in Aurora-Sprache (Espresso-Direkthex → Ink/Champagner); rpd gemäß Licht-Insel §2.2.
8. **Overlays/Toasts:** einheitliche Glas-Sheets; Toasts als kleine SOLIDE Elevation-Pills (--raised, KEIN backdrop-filter — Glas-Budget §2.4).

## 6 · Motion-System (No-Dependency: CSS/WAAPI/View-Transitions)
- **View-Wechsel:** View-Transitions-API auf `go()` (same-document, `@supports`-gated; Fallback: sofortiger Wechsel). Subtile Shared-Axis-Blende ≤300ms.
- **Entrance je View:** max. 800ms Choreografie, Stagger transform/opacity, Startzustände NUR im Keyframe-`from` (bestehende Regel).
- **Scroll:** genau EIN Scroll-Reveal je langer View (Heute: Forecast-Balken; sonst sparsam) via `animation-timeline: view()` in `@supports` + `no-preference`; IO-Fallback nur wo essenziell.
- **Micro:** 100–150ms, nur transform/opacity; Hover-Lift max. translateY(-4px)+Border-Glow.
- **Kill-Switch:** globaler `prefers-reduced-motion`-Block ERWEITERT um `animation-timeline:auto!important`; Count-ups springen auf Endwert; Orbs stehen.
- **Perf-Gate:** INP-Ziel <200ms; Scroll-Jank-Smoke-Test @1440 und @390 Pflicht je Stufe (§9).

## 7 · Craft (Pflicht, App-weit)
`::selection` Champagner/Ink · `:focus-visible` 2px Champagner-Ring (offset 2) · `scrollbar-color` gestylt · kein Browser-Blau irgendwo · `<meta name="theme-color" content="#0B0D0C">` · rpd-Print weiß (§2.2).

## 8 · Rollout (4 Stufen, je verifiziert → committed → gepusht; App nach jeder Stufe voll funktionsfähig)
- **Stufe 1 · Fundament:** Token-Swap + Licht-Inseln-Guards, Fonts, Aurora-Hintergrund, Chrome, Craft-Details. (Größte sichtbare Wirkung, definiert alle Verträge.)
- **Stufe 2 · Bühne:** Heute komplett (Hero/Funnel/KPI/Kapitel) + Motion-System (View-Transitions, Entrances).
- **Stufe 3 · Arbeitsflächen:** Fälle, Team/Mein Tag, Netzwerk/Datenbank, Reha/System/Matrix.
- **Stufe 4 · Atmosphäre & Feinschliff:** Portal + rpd, Assets-Feinschliff, Empty-States, Editorial-Momente, Anti-Slop-Pass + Design-Review, CLAUDE.md-Identitätsabsatz aktualisieren (neue Palette/Fonts als neue Hard Rule).

## 9 · Verifikation (je Stufe, Pflicht vor Commit)
1. @1440 UND @390: 0 Console-Errors, 0 horizontaler Overflow, Scroll flüssig (kein Compositor-Wedge — Lehre aus Prototyp D).
2. Alle 6 Views + Overlays (`openDetail(1)`, `openDbDetail(0)`, `openRsDetail(0)`, `openReferrer('portal','Leopoldina-Krankenhaus')` alle 3 Tabs, Dokument-Viewer, kp-Sheet, Mein-Tag-Rollenwechsel) rendern und funktionieren.
3. Funnel: Punkte wandern auf allen 4 SVG-Instanzen, `set()`/`data-sync` intakt; Trichter-Zahlen korrekt.
4. Reduced-Motion-Probe: Endzustände sofort korrekt, nichts unsichtbar.
5. Kontrast-Stichprobe: Body-Text ≥4.5:1 auf allen Elevation-Stufen.
6. Screenshots gegen `design-lab/d-aurora.html` (Messlatte §1) + Sync-Wache (ProtonDrive-Hash-Check).

## 10 · Nicht-Ziele
Kein Backend/Persistenz/Logik-Umbau · keine neuen Views/Features · kein Theme-Toggle (Aurora ist DIE Identität) · keine Runtime-Dependencies (GSAP/Lenis bleiben draußen) · keine Umbenennung von Datenfeldern/Funktions-Contracts · Matrix-/Portal-FUNKTIONEN unverändert (nur Optik) · `design-lab/` bleibt als Archiv (wird committed, nicht deployed-verlinkt).
