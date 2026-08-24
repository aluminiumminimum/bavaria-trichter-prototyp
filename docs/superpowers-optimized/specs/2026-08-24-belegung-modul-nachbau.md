# Belegung — Nachbau von Valons In-Reha-Modul

**Datum:** 24.08.2026 · **Quelle:** `Valon-KlinikBavaria/bavaria-trichter-prototyp`,
Branch `handover/inreha-modul` · **Entscheidung:** voller Nachbau inklusive Import

---

## 1. Warum nachbauen statt übernehmen

Valons eigenes Übergabedokument sagt es unter „Was nicht gemacht werden sollte":
seine Datei darf nicht in unsere `index.html` kopiert werden. Beide definieren ein
globales `go()` und CSS-Klassen ohne Namensraum. Dazu kommt: sein Modul ist auf
`#050d07` gebaut, wir laufen seit heute auf C1 · Petrol & Sand.

Übernommen wurden also **Rechnung, Datenmodell und Bildschirmaufbau**, nicht der Code.

## 2. Was wirklich fehlte

Wir hatten bereits Tagessatz, Kosten pro Tag, DB-Marge, einen 8-Wochen-Forecast,
den Kapazitäts-Abgleich am Fall und „Freie Plätze" im Portal. Diese vier Stellen
lasen aber alle **eine flache Zahl** (`FC_BETTEN = 7`).

Sein Modul liefert drei Dinge, die uns fehlten:

1. Station- und Bettenebene statt einer Gesamtzahl
2. Entlassdatum je Fall als Rechengrundlage — „welches Bett wird wann frei"
3. Nachbelegung

## 3. Zwei Ebenen — der entscheidende Modellpunkt

Ein erster Entwurf setzte die im Concierge verfolgten Fälle mit der Stationsbelegung
gleich. Ergebnis: „Premium 8 von 70 Betten". Das ist falsch — eine Station hat viele
Patienten, von denen wir nur die Privatfälle betreuen.

Deshalb, wie im Original, **zwei getrennte Ebenen**:

| | unsere Umsetzung | bei Valon |
|---|---|---|
| Stationsbelegung (Ist/Soll/Erlös) | `BEL_STATIONEN` + `BEL_IST_AGGREGAT` | `BEL_DATA` |
| verfolgte Fälle je Station | `BEL_PAT` | `PATIENTS` |

`inReha[]` bleibt unangetastet — es ist die **medizinische** Akte (ICD, Barthel, FIM,
Labor, Arztbericht). `BEL_PAT` ist die **betriebswirtschaftliche** Zeile. Wo beide
denselben Menschen meinen, verbindet sie ein `personId`; ein Klick auf die
Belegungszeile öffnet die ausführliche Akte.

## 4. Datenschutz

Initialen statt Klarnamen — Valons Entscheidung, die laut Übergabe beim Nachbau
ausdrücklich nicht aufgeweicht werden soll. Der Import verwirft Zeilen ohne Initialen,
gezählt und gemeldet. Alle Demo-Werte sind erfunden.

## 5. Import ohne SheetJS

Das Original lädt SheetJS von `cdnjs.cloudflare.com`. Das wurde **nicht** übernommen:
ein fremdes Skript im selben Speicher, in dem Patientendaten liegen, ist im
Gesundheitskontext ein Lieferketten-Risiko, und im Kliniknetz funktioniert es ohnehin
nicht.

Stattdessen ein eigener Leser, rund 90 Zeilen:
eine `.xlsx` ist ein ZIP mit XML darin, und `DecompressionStream('deflate-raw')` kann
das nativ. Zentralverzeichnis lesen → `xl/worksheets/sheet1.xml` und
`xl/sharedStrings.xml` entpacken → mit `DOMParser` auswerten. CSV braucht ohnehin
keine Bibliothek.

Damit bleibt die App eine einzige selbstgenügsame Datei, und der Import läuft offline.

**Übernommen wurde seine Spaltenerkennung** — bewusst tolerant, weil echte
Stationsblätter `Zimm ernr.`, `Kostentraeger`, `Therapie kosten` schreiben. Ebenso die
Summenzeilen-Erkennung (`gesamt`, `insgesamt`, `begleitperson`, `begleit`) und beide
Datumsformate. Zusätzlich erkannt: Excel-Serienzahlen.

**Ergänzt, was in der Übergabe als fehlend markiert war:** Rückmeldung nach dem Import
(übernommen / Summenzeilen / ohne Initialen / ohne Datum), Fehlerbehandlung für kaputte
Dateien, und ein Leerzustand für Stationen ohne Zeilendetail.

Nichts wird hochgeladen, nichts gespeichert — wie im Original. Beim Neuladen ist der
Import weg, es entsteht keine Löschpflicht.

## 6. Was gebaut wurde

- `view-inreha` hat jetzt zwei Unterbereiche: **Verlauf** (bisheriger Inhalt, unverändert)
  und **Belegung**. Registriert über `SEGS.inreha` — die Segmentschaltung der App ist
  generisch, es war keine Änderung an `go()` nötig.
- Belegungstabelle: Station, Ist/Soll, Auslastung, Tageserlös, Abstand zum Ziel,
  Balken je Zeile. Überbelegung färbt den Balken, statt einen Überhang zu zeichnen.
- Stationsliste: verfolgte Fälle, nach verbleibenden Tagen sortiert, mit Zimmer,
  Kostenträger, Merkmalen, Sternen und Tageserlös.
- Freiwerde-Kalender auf der Übersicht.
- Namensraum durchgehend `.bel-*`. Kein fremder Namensraum berührt.

## 7. Nachweis

Prüfläufe über 13 Ansichten bei 390 und 1440, mit Selbsttest je Lauf.

| | 1440 | 390 |
|---|---|---|
| Passform-Befunde aus `.bel-*` | 0 | 0 |
| Horizontaler Überlauf | keiner | keiner |
| Konsolenfehler | keine | keine |
| Kontrastbefunde gesamt | 24 | 24 |

Der einzige neue Kontrastbefund ist eine weitere `.btn-brass`-Instanz (Import-Knopf) —
dieselbe bekannte, offene Gestaltungsfrage aus der C1-Umstellung, kein neues Problem.

Import getestet mit einer CSV (Semikolon, gemischte Datumsformate, Summenzeile, Zeile
ohne Initialen) und einer echten `.xlsx` (gemeinsame Zeichenketten, `Zimm ernr.`,
`Therapie kosten`, Summenzeile). Beide Wege übernehmen genau die gültigen Zeilen und
melden, was verworfen wurde.

**Ein Fehler in der eigenen Arbeit, vom Prüfer gefunden:** der Überbelegungs-Balken lag
bei `left:100%` in einem Element mit `overflow:hidden` und war nie sichtbar — Classic
liegt bei 109 % und zeigte das nicht. Behoben.

## 8. Bewusst nicht gebaut

- Die vier vorhandenen Stellen (Forecast, Kapazitäts-Abgleich, Portal-Freie-Plätze,
  Heute-Trichter) hängen weiterhin an `FC_BETTEN`. Der Rechenkern steht bereit, sie
  anzuschließen — das ist der nächste sinnvolle Schritt und wurde bewusst getrennt,
  damit die Umstellung einzeln prüfbar bleibt. Das Portal ist ohnehin fremder
  Namensraum (`.rp-*`) und darf nur nach Absprache angefasst werden.
- Keine Speicherung des Imports.
- Kein Service Worker, keine Offline-Fähigkeit.
