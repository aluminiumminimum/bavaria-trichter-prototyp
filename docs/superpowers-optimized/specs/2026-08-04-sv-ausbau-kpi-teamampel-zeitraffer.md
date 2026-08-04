# Design-Spec: SV-Ausbau — KPI „Versprechen gehalten", Team-Ampel, Zeitraffer-Demo

**Datum:** 2026-08-04 · **Branch:** `claude/app-threads-visibility-l4c6ed` · **Status:** in Umsetzung
**Grundlage:** priorisierter Ausbauplan 04.08. (Nutzer: „go" für Prio 1 = Punkte 1–3).
Baut auf Spec 2026-07-31 (Service-Versprechen) auf — nutzt dieselbe Klassenlogik, kein zweites Regelwerk.

## 1. Auswertung · KPI-Karte „Wird das Versprechen gehalten?"

Neue `.chart`-Karte in `#view-auswertung` (nach dem Trichter-Donut), gerendert aus `renderCharts()`:

- **Hero:** „6 / 8 Erstkontakte im Klassen-Ziel · 75 %" + Fortschrittsbalken (Jade).
- **⌀ Erstkontakt** über alle Fälle mit dokumentierter Reaktion (`f.reaktion`), daneben
  „ohne Verlustfälle" — der Keller-Ausreißer wird sichtbar statt versteckt.
- **Verfehlt:** Liste der Fälle über Ziel („Maria Probst +1 Std. · Hans Keller +24 Std.").
- **€-Brücke:** verfehlte UND verlorene Fälle ⇒ „26 Std. Reaktionszeit → Fall verloren
  ≈ 18.800 € entgangener Erlös" (`SV_FALLWERT` = Demo-Kalkulation 18 Tage × 1.045 € Tagessatz,
  angelehnt an die vorhandenen `satz`-Seeds 1.045–1.160 €).
- **Live-Brücke:** Button „Aktuell n offene Eskalationen ›" → `svGoEsk()`.

**Rückschau-Funktion `svRetro()`:** klassifiziert abgeschlossene Erstkontakte mit `svKlasseFall(f)`
(eine Quelle) und vergleicht `f.reaktion` gegen `SV_REGELN[kl].h`.

**Seed-Anpassung (mit `DEMO_SCHEMA` 6→7):** Reaktions-Seeds ans Regelwerk angepasst, damit die
Rückschau die Ziel-Erzählung trägt (Maschine funktioniert, zwei glaubwürdige Ausnahmen):
Peter 6→1, Ludwig 4→2, Elisabeth 8→2, Werner 5→2. **Unverändert:** Maria 3 (deckt sich mit ihrem
Werdegang-Schritt „Erstkontakt nach 164 Min." — bewusster Beinahe-Verstoß +1 Std.), Keller 26
(Erzähl-Anker, Log nennt 26 Std.), Heinz 1, Ruth 2. Ergebnis: 6/8 gehalten, ⌀ 4,9 Std.,
ohne Verlustfall 1,9 Std. `TC_WOCHE.reaktion` endet folgerichtig neu bei 5 (= live `rzAvg`).

## 2. Team-Ansicht · SLA-Ampel je Mitarbeiter (`.tc-ma-sla`)

Chip in `tcMitarbeiterZeile` (1 Einfüge-Zeile, fremder Code chirurgisch): „SV 2/3" —
Erstkontakte im Ziel / gesamt aus `svRetro()`, plus „· 1 akut" wenn eine laufende
Erstkontakt-Uhr des Mitarbeiters gerissen ist (`svFallState(f).over`, ohne `svAktion`).
Farben: Jade = alles gehalten · Gold = Rückschau-Verstoß · Zinnober = akut laufender Verstoß.
Demo-Spread: S. Koordination 2/3 + 1 akut (Anna) · M. Belegung 3/3 · Recovery Manager 1/1 ·
T. Abrechnung 0/1 (Keller). Folgefrist-Überfälligkeit zeigt weiterhin `.tc-ma-ueb` — kein Doppel.

## 3. Heute · Zeitraffer-Demo-Leiste (`.sv-zr`)

Schmale, geflüsterte Leiste (Fragment Mono micro, rechtsbündig) unter dem Eskalations-Panel:
„DEMO · ZEITRAFFER — Service-Uhren +1 Std. ›" + Zurücksetzen + Stand („+2:00 Std.").

- `svOffsetMin` (global, **bewusst nicht persistiert** — Reload = reale Uhren) fließt über
  `svElapsedEff(z) = svElapsedMin(z) + svOffsetMin` in `svEingangState`/`svFallState` und in den
  Reaktions-Stempel von `kfKontaktAbschliessen` (vorgespulte Zeit wird konsistent dokumentiert).
- Pitch-Dramaturgie: +1 Std. ⇒ Fax 109 (A, „vor 50 Min.") reißt; +2 Std. ⇒ weitere kippen auf
  Gold/Zinnober; Eskalations-Panel + „Heute wichtig" wachsen live mit (alles über `renderAll()`).
- Nur die Service-Uhren werden vorgespult — Fristen (`dstr`), Radar, Belegung bleiben unberührt.
  Kein neuer Keyframe, kein Ticker; Muster analog Call-AI-Zeitraffer (gescriptet, keine Echtzeit).

## 4. Namespace & Regeln

CSS additiv als kommentierter Block vor `</style>` (`.sv-zr`, `.sv-kpi-*`, `.tc-ma-sla`);
JS additiv nach dem bestehenden sv-Block. Fremdcode-Berührung: je 1 Zeile in
`tcMitarbeiterZeile` (Chip) und `renderCharts` (KPI-Body). Farben strikt Welt-Token.
Beide Breiten (390/1440), 0 Console-Errors, Seite rendert ohne JS (Leiste statisch, Karte leer).

## 4b. Redesign 04.08. (Nutzer-Feedback nach Live-Test)

Feedback: Heute war überladen („bei Heute sollten nicht tausend Dinge stehen"), Typo zu klein/
Mono-lastig, Zeitraffer-Leiste unverständlich. Konsequenz:
- **Eskalations-Panel + Zeitraffer sind von Heute nach Fälle→Team gezogen** (Leitstand
  `tcEskHtml`/`tcEskZeile`, `.tce-*`): Zeilen im Idiom der Team-Ansicht — 34px-Kreis-Badge
  (Klassen-Letter Cormorant), Name 14.5px Inter, Verstoß 12.5px Terra, Sub 12px; Aktionen
  rechts, mobil (<640px) volle Breite unter dem Text. Heute behält nur die
  „Heute wichtig"-Zeile (Klick → Team-Leitstand, `svGoEsk`).
- **Zeitraffer** ist jetzt ein einzelner, klar beschrifteter Demo-Knopf im Panel-Kopf
  („Demo · Uhren +1 Std." / „Demo +1:00 Std. · zurücksetzen"), gestrichelter Rahmen = Demo-Werkzeug.
- **KPI-Karte/Verlust-Fazit/Kapazitätsblock** auf Welt-Typo gehoben: Micro-Labels Inter
  uppercase `--brass-deep` statt Mono, Fließtext 12.5px, €-Zeilen als Terra-Band, Numerale
  im Kapazitätsblock in Cormorant 20px.
- **Team erweitert** (Ampeln nachvollziehbar): TEAM + „K. Aufnahme" (Orthopädie, Werner Aumann)
  und „J. Nachsorge" (Neuro/Geriatrie, Elisabeth Cramer); T. Abrechnung dem Ortho-Panel
  zugeordnet (Keller 0/1 sichtbar). `DEMO_SCHEMA` 7→8.

## 5. Nicht in diesem Schritt (bewusst)

Kapazitäts-Abgleich am Fall · Verlust-Analyse-Ableitungen · Netzwerk-Fällige an der
Eskalationsschiene · Wert-Score · Vorlagen — Folge-Iterationen laut priorisiertem Plan 04.08.
