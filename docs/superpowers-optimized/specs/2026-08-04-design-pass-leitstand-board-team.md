# Design-Spec: Design-Pass — Leitstand-Anatomie, Board-Ampel, Team-Grafiken, Kommunikations-Qualität

**Datum:** 2026-08-04 · **Status:** in Umsetzung
**Grundlage:** Nutzer-Review 04.08. (6 Punkte) + Leitplanke: „Grafiken sind gut, aber sie müssen
optisch hochwertig sein — nicht Grafik durch Text ersetzen, eher andersherum."

## 1. Eskalationen: EINE Zeilen-Anatomie (Punkt 1)

- **Symbol statt Buchstabe:** 34px-Kreis mit SVG-Icon, alle in Zinnober (ein Farbcode für
  „Eskalation"): Uhr = Erstkontakt gerissen · Alert = Folge-Frist · Ziel-Radar = Netzwerk ·
  Posteingang = unbeanspruchte Anfrage. Icons aus W_ICON-Satz + ein Radar-SVG im selben Strich.
- **Genau zwei Zeilen:** Titel (14,5) + EINE Meta-Zeile (12,5): Verstoß kompakt in Zinnober
  („Erstkontakt +1:00 Std. über Ziel") · Klassen-Chip (Mono) · Ort/Owner in Muted. Die dritte
  Zeile entfällt — ihr Inhalt (Kanal/Zusammenfassung/Aufgabe/Prognose) wandert als Kontext-Zeile
  in das aufgeklappte Entscheidungs-Panel.
- Antwort des Mitarbeiters als **Mini-Bubble** (gleiche Bubble-Sprache wie „Team intern").

## 2. „Braucht Aufmerksamkeit" entfällt (Punkt 3)

Überfällige Folge-Fristen stehen in den Eskalationen — die Zweitliste war entstandene Redundanz.
Der Mitarbeiter-Drill-down (Klick auf Person ⇒ „Offene Fälle · X") bleibt.

## 3. Board-Ampel (Punkt 4)

- **Linker Akzentstreifen (3px)** je Karte: Jade = im Plan · Gold = knapp · Zinnober =
  überfällig/verletzt (kombinierter Zustand: SLA-Uhr, sonst Frist).
- SLA-Chip und ⚠-Frist-Pille erscheinen NUR noch bei Gold/Zinnober — im grünen Zustand trägt
  allein die Farbe die Information (ruhige Karten, Text nur wo Handlung nötig).

## 4. Team-Panels: hochwertige Grafik statt anonymer Balken (Punkt 2)

- **Trichter-Mini-Chart je Fachbereich:** 6 Stufen als kleine Säulen (Höhe ∝ Fälle) in den
  Status-Welt-Farben, Cormorant-Numerale über jeder Säule, Micro-Label darunter auf Hairline-
  Achse; „– " für leere Stufen; Verloren bleibt Zinnober-Fußnote. Selbsterklärend statt Legende.
- **Mitarbeiter-Zeile:** Avatar mit **SLA-Quoten-Ring** (Jade = alles im Ziel · Gold =
  Rückschau-Verstoß · Zinnober = akut) + **Fall-Perlen**: ein Punkt je offenem Fall, gefärbt
  nach Zustand (Jade/Gold/Zinnober, Tooltip = Fall + Aufgabe). Ersetzt Last-Balken, Überfällig-
  Text und SLA-Chip — die Grafik trägt alle drei Informationen.
- Erklär-Zeile je Panel: „n Fälle im Trichter · Ring = Service-Quote · Punkt = offener Fall".

## 5. Kommunikations-Qualität (Punkt 6)

- Thread: Absender-Avatar an jeder Bubble, „Heute"-Trenner, Zeit rechts im Kopf,
  ✓/✓✓-Gelesen-Häkchen an eigenen Nachrichten, @-Erwähnungs-Chips über der Eingabe
  (Antippen fügt „@Name " ein).
- Bug-Fix (bereits deployt): keine f.log-Spiegelung — intern und extern strikt getrennt.

## 6. Nachschärfung 05.08. (Nutzer-Review Runde 2)

- **Board-Ampel v2:** Der 3px-Streifen allein war zu leise („kaum zu sehen"). Zusätzlich ein
  **11px-Ampel-Punkt** (`.fk-dot`) oben rechts in der Kopfzeile jeder Karte — Jade/Gold/Zinnober
  mit Tooltip, Zinnober mit weichem Glow; Karten ohne Frist tragen einen gestrichelten Leer-Ring.
  Auch Pool-Karten (Neu-Spalte) zeigen den Punkt aus ihrer Service-Uhr. Streifen bleibt.
- **„Kommunikation & Verlauf" v2** (`.lgx-*`, nur `#dLog`): dieselbe Bubble-Sprache wie
  „Team intern" — Absender-Avatar an jeder Nachricht (Klinik = Jade-Monogramm „KB", rechts),
  Kopfzeile Absender + Zeit rechts, zentrierte Datums-Trenner („Heute"), Absender-Präfix und
  „↦" nicht mehr doppelt im Text; ✎-Notizen als gestrichelte Papier-Karte „Gesprächsnotiz",
  Systemzeilen eingerückt an Hairline. Timeline-Punkte-Optik im Verlauf abgelöst.

## Regeln

Welt-Token strikt; Screenshots 390/1440/1920 vor jedem Push gesichtet; 0 Console-Errors;
rendert ohne JS. Nur eigene Namespaces (.tce-/.tcp-/.tc-ma-/.tmi-/.fk-amp-*), fremde
Funktionen chirurgisch.
