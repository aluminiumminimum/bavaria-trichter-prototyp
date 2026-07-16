# Programm — „Jade-Apotheke": App-weiter Overhaul (Spec + Plan kompakt)

**Datum:** 2026-07-16 · **Entscheid:** User locked Welt 7 („Jade-Apotheke", `design-lab/e5d-jade.html` = Messlatte) nach 8-Welten-Vergleich (Runde 5+6).
**Mandate:** (1) Fable-Executors für ALLE Tasks. (2) Null Funktionsverlust — inkl. beider Perspektiven: **Brigitte/Mein Tag** (`body.ma-mode`, geführtes Abarbeiten) und **Boss-Cockpit** (6 Views + Overlays + Portal). (3) Null visuelle Degradation vs. e5d — „maximum premium luxury". (4) Motion endlich konsolidiert (43 Keyframes → Welt-Set ≤8).

## Design-System (aus e5d-jade.html — Executor liest das File als Wahrheit)
- **Grund:** Elfenbein `#F6F2E6`; Etiketten-Karten `#FBF8EF` m. Doppelrahmen (Jade-Hairline außen + Gold-Inset via geschichteter inset-box-shadow) + Gold-Eck-Winkeln (::before/::after L-Ticks).
- **Lack:** tiefes Jade `#123B33` — Sidebar-Kabinett, Funnel-Kachel, EINE Highlight-Karte je View. Ivory-Text + Gold-Hairlines auf Lack.
- **Akzente:** Gold `#B99149` (Grafik/Hairlines/Gravur; für TEXT dunklere Stufe ≥4.5:1 auf Ivory — numerisch prüfen, Ziel ~`#7E6230`-Familie), Zinnober `#A8341F` max 2 Momente je View (Live-Siegel + 1 Wachssiegel).
- **Typo:** Cormorant Garamond (500/600/700 + Italic) Display/Numerale · Inter Body · Fragment Mono Micro-Daten. Etiketten-Header als getrackte Kapitälchen („№ 01 — DER EINGANG").
- **Fotos:** Spezimen-Platten — Doppelrahmen, `saturate(.85) sepia(.08)`, Serif-Italic-Caption UNTER dem Bild.
- **Funnel = Gold-Gravur auf Lack:** Ivory-Pfade, Gold-Punkte, Ivory-Hub m. Jade-Zahl. Contract heilig: offset-path 24 · cv-travel 2 · data-sync 46, alle 4 Instanzen synchron, 0 Geometrie-Diffs.
- **Motion-Welt-Set (Ziel ≤8 Keyframes app-weit):** `lift`-Entrance (Stagger, opacity:0 NUR im Keyframe), Funnel-Punkte (SMIL, DIE Signatur), Count-up (JS), 1 Siegel-Press (Abschluss-Momente, scale-Tap), 1 Gold-Regel-Draw (Hero), Puls (Live-Siegel), View-Transitions auf go() bleibt. Alles andere streichen. Kein filter:blur auf Animiertem. Seite rendert ohne JS.

## Umsetzung (Token-Hebel + additive Blöcke, bewährt)
Token-NAMEN bleiben, Werte → Jade (--cream→Ivory, --paper→Etikett, --sage-deep→Lack-Jade, --brass→Gold, --brass-deep→Gold-Text-dunkel, --terra→Zinnober, --sage→Jade-mittel, Daten-Hues gedämpft). Fonts-Link + `"Fraunces"`→`"Cormorant Garamond"` global. Papier-Guard (.rpd-paper/.kp-mail) bleibt — Papier passt zur Apotheke. `@media print` unangetastet. Daten-Arrays/Funktions-Signaturen unantastbar.

## Tasks (sequenziell, je 1 Commit; Fable-Executors; Gates = V-Protokoll + Parity)
- **J1 · Fundament A:** Token-Hebel v4 + Fonts + **Motion-Konsolidierung** (Keyframe-Inventar → Welt-Set, tote Regeln/JS-Hooks mit) — größter Einzelhebel.
- **J2 · Fundament B:** Etiketten-System (Karten-Familien → Doppelrahmen+Gold-Ecken, Matrix nur bg/border/shadow) + Chrome (Jade-Lack-Sidebar n. e5d, Ivory-Topbar/Tabbar) + Craft (::selection etc.). → **Gate 1, merge main**
- **J3 · Bühne:** Heute komplett — Hero (Cormorant, Gold-Regel-Draw, Spezimen-Foto), Funnel-Lack-Kachel (alle 4 Instanzen, Gates!), KPI-Etiketten (Zahl zentriert, Gold-Regel, Kapitälchen), Kapitel-Siegel (Zinnober 01, Gold 02/03), Forecast-Etikett (Jade-Balken, Gold-Peak), Echtzeit-Strip als Siegel-Zeile. → **Gate 2, merge main**
- **J4 · Fälle + Team** (Board-Zonen, Schublade-Sheet, kz-Kette: erteilt=Jade/offen=Zinnober; Team-cv-Spiegel prüfen).
- **J5 · Mein Tag (BRIGITTE — ma-mode-Mechanik unantastbar, geführte Ruhe in Etiketten-Sprache, Abschluss-CTA = Siegel-Press) + Netzwerk + Datenbank** (Kartei=Apotheker-Schrank!, Sterne Gold, kp-Sheet; kp-mail bleibt Print-Insel).
- **J6 · Reha + System + Matrix** (rsp-Charts nur Farbwerte; Matrix-Vorsicht). → **Gate 3, merge main**
- **J7 · Portal + rpd + Overlays/Toasts** (Portal = Apotheken-Microsite, rpd-Papier unangetastet, Toasts = Etiketten-Pillen) + Foto-Grades app-weit.
- **J8 · QA + Docs:** verifier (frisch, adversarial: Design-System-Treue, Contracts, Kontrast numerisch, Motion-Set-Zählung) + **Parity-Gate** (Inventare vs. `.workflow/jade-*.txt`: 161 fn / 281 const / 196 id / 26 onclick — 0 fehlend) + Live-Funktionstest beider Perspektiven (Brigitte-Rollenwechsel + Boss-Sweep) + CLAUDE.md/HANDOVER/state. → **Abnahme-Gate, merge main**

## V-Protokoll je Gate (wie Lichtung)
V1 vm.Script · V2 @1440+@390 0 Errors/0 Overflow · V3 alle Views+Overlays+Portal-Tabs+rpDocView+kp+**ma-mode** · V4 24/2/46 · V5 opacity:0 nur in Keyframes (+ begründete Interaktiv-Zustände) · V6 Kontrast ≥4.5 + shasum-Wache + Pages.
