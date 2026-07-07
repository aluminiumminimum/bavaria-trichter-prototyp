# Spec — Zuweiser-Suite: WOW-Runde (Motion + Feedback + Beziehungs-KPIs)

**Datum:** 2026-07-07 (Abend) · **Datei:** `index.html` · **Pitch:** morgen, Desktop/Beamer 1440 primär.
**Status:** Design freigegeben (User: „nur WOW zählt, Zahlen dürfen frei erfunden sein" + „plus überall Premium-Animationen").
**Basis:** Zuweiser-Premium-Suite live (`fad5762`) — Hero/Persona, Sub-Nav, News, Belegung+Prefill, Team, Formular, Fälle, Kontakt, KPI-Ringe, Outcome.

## Ziel
Die Suite vom „sehr guten Prototyp" zum **Luxury-Produkt-Erlebnis** heben: kein einziger nativer Dialog mehr, Zahlen leben, Beziehung wird gemessen, jede Interaktion antwortet mit Motion. Demo-Zahlen frei erfunden, maximal glaubwürdig inszeniert.

## Pakete

### P1 — Alert-Killer + Success-Kino
- **`rpToast(msg)`**: Gold-Toast (Espresso-Karte, Gold-Hairline, Häkchen), gleitet unten mittig ein, auto-hide 2,5 s. Einmaliges DOM-Element `#rpToast` (im `refOverlay` angehängt), CSS-Klasse `.show` togglet. Ersetzt in der SUITE alle `refToast()`-Aufrufe (Dokument-Kacheln, Rückruf, Einblick-/Abschluss-CTAs). `refToast()` selbst bleibt unverändert (Alt-Aufrufer außerhalb).
- **Anmelde-Success:** `rpSubmit()` — Formular-Karteninhalt wird ersetzt durch Success-Zustand: SVG-Gold-Häkchen **zeichnet sich** (stroke-dashoffset), „Anmeldung eingegangen", „Rückmeldung < 24 h zugesagt", Button „Weitere Anmeldung" (`rpTab('portal',zName)` re-rendert frisch). Gleichzeitig wird der Patient (Wert aus `#rpName`, Fallback „Max Mustermann", Fachbereich aus `#rpFach`) **vorn in die Fälle-Liste eingefügt** (`portalFaelle.unshift`, capped: bei >4 Einträgen pop) mit Pill „Neu · eben eingegangen" (`.rp-pill.neu` Gold-Glow-Puls) — Karte scrollt kurz in Sicht oder die Zeile bekommt Entrance-Animation. Flüchtig by design (Re-Render setzt Formular zurück, unshift bleibt für die Session — gewollt: mehrfaches Vorführen stapelt Fälle sichtbar).

### P2 — Lebende Zahlen
- **Ring-Draw-in:** `kpiRing()` bekommt optionalen Modus/Klasse `rp-anim`: Ring startet bei Offset=Umfang, CSS-Transition zieht auf Zielwert (gestaffelt per nth-of-type-Delay); Zahl per `rpCount(el,to,dur)` hochzählen (requestAnimationFrame, ease-out). Nur in der Suite aktiviert — interne `renderInReha`-Ringe unverändert.
- **Outcome 45 → 85:** beide Zahlen Count-up, Gold-Pfeil skaliert nach.
- **Belegungszellen:** gestaffeltes Scale-in (Keyframe, delay je Index).
- **Zusammenarbeits-Band (P3) zählt hoch.**
- Alle Animationen: Endzustand = Basiszustand (reduced-motion-safe; globales `*{animation:none;transition:none}` zeigt sofort final). `rpCount` prüft `matchMedia('(prefers-reduced-motion: reduce)')` → setzt sofort Endwert.

### P3 — „Ihre Zusammenarbeit"-Band
Direkt unter Hero (erste `rp-body`-Karte im Portal): 4 Kacheln, Cormorant-Großziffern mit Count-up + Mikro-Label: **14** Fälle 2026 · **11 h** Ø Rückmeldung · **96 %** Aufnahmequote · **seit 2023** Partner (letzte Kachel ohne Count-up). Demo-Array `portalStats` (Werte frei erfunden). Desktop 4 Spalten, mobil 2×2.

### P4 — Entrance + Banner
- Overlay-Öffnung: `.ref-overlay.open` bekommt Fade+Rise-Keyframe (~.35 s, nur Suite-relevant, gilt fürs Overlay generell — akzeptiert, betrifft nur Referrer).
- Hero-Kinder (mark→greet→sub→tabs) staggern nach (.05–.2 s Delays).
- Banner veredelt: Gold-Monogramm-Kreis „KB" (wie Sidebar-Brand), Text zweizeilig fein („Zuweiser-Portal" + Institution), Zurück-Button ghost-dezenter. Nur CSS + kleine Markup-Änderung im statischen `#refOverlay`-Banner-Div + `openReferrer` befüllt `#refWho` weiterhin (Institution).

### P5 — Detail-Politur
- `rpDate(iso)` Helper: „2026-07-05" → „05.07." — genutzt in Fälle-Zeilen („seit 05.07.").
- Belegte Zellen: „–" statt „0".
- `.rp-field label` + `.rp-check`: sentence-case (text-transform:none, letter-spacing normal) — überschreibt globales VERSALIEN-`label`.
- Upload-Zone klickbar: `rpUpload(this)` → Zone zeigt „✓ Arztbrief_Demo.pdf hinzugefügt" (Gold-Häkchen, Border solid sage), zweiter Klick fügt „✓ Befund_Demo.pdf" hinzu (max 2, dann Toast „Demo-Limit").

### P6 — Premium-Motion überall (Suite-weit)
- **Tab-Unterstrich gleitet:** statt border-bottom pro Tab eine absolute `.rp-tabline` im `.rp-tabs`, die per `left/width`-Transition unter den aktiven Tab gleitet (bei Tab-Wechsel vor dem Re-Render kurz animiert — Implementierung: `rpTab` misst Ziel-Tab, animiert Linie, re-rendert nach ~.25 s; einfacher robuster Fallback falls zu fummelig: Linie per Keyframe unter neuem Tab einwachsen lassen wie Matrix `mxUnder`).
- **Hero-Hairline-Schimmer:** einmaliger Gold-Shimmer-Sweep über die Hero-Top-Hairline beim Öffnen (background-position-Keyframe).
- **Karten-Hover:** einheitlicher Lift (-3px) + weicher Gold-Border + Schatten (Suite-Karten, Personen, News-Rows leichtes X-Shift).
- **Buttons/CTAs:** hover Glow (Gold-Schatten), active scale(.98); Belegungszellen press-Feedback.
- **Pills „Neu":** sanfter Gold-Puls (box-shadow-Keyframe, 3 Iterationen).
- Alles unter `@media(hover:hover)` wo Hover, alles reduced-motion-safe.

## Nicht-Ziele
- Keine Änderungen außerhalb Suite-Renderern/`.rp-*`-CSS/`#refOverlay`-Banner-Markup. `refToast()` bleibt. Interne Views/Matrix/Datenbank unberührt. Kein Sound, kein echtes Upload/Submit.

## Failure-Modes
1. **Motion wirkt billig statt teuer** (zu langsam/zu viel gleichzeitig): kurze Dauern (.3–1 s), Ease-out, Stagger ≤ .25 s Gesamtversatz; 1440-Visual-Gate beurteilt Gesamteindruck, notfalls Werte dämpfen.
2. **Tab-Gleitlinie fummelig wegen Re-Render:** Fallback im Spec verankert (Einwachs-Keyframe statt Gleiten) — kein Blocker.
3. **`portalFaelle.unshift` wächst bei Demo-Wiederholung:** cap bei 4 (ältester fliegt raus).
4. **Ring-Anim kollidiert mit interner Nutzung von `kpiRing`:** Suite-Modus nur via zusätzlichem CSS-Scope `.rp-patrings` (Transition dort definiert), Funktion selbst rückwärtskompatibel.

## Verifikation
1440 primär (Gesamteindruck + jede Interaktion: Submit-Kino, Toast, Upload, Tabs, Ringe, Count-ups, Hover), 390 Overflow-frei, 0 Console-Errors, Esc/Zurück, Mehrfach-Submit (Cap), reduced-motion strukturell (Endzustand=Basis). Live-Marker: `rpToast`.

## Rollout
Branch `feat/zuweiser-wow` → subagent-driven → Gates → pull → merge→main → Live. Heute Abend fertig.
