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

---

# Nachtrag — Anschluss an die vorhandenen Stellen (24.08.2026)

## Der eigentliche Anschlusspunkt

Bei der Suche zeigte sich, dass die App längst eine gemeinsame Kapazitätsquelle hat:
ein globales `belegung[]` je **Achse** mit freien Komfortbetten pro Woche. Es war ein
fest verdrahteter Seed:

```
{achse:"Orthopädie", frei:[2,1,3,4]}   …
```

Gelesen wird es vom Kapazitäts-Abgleich am Fall (`kapFallHtml`, unser Namensraum) **und
vom Zuweiserportal** („Freie Plätze", `.rp-*`). Damit war der Weg klar: wird `frei[]`
gerechnet statt gesetzt, profitieren beide — und **im fremden Namensraum musste keine
einzige Zeile angefasst werden**, weil das Portal die Liste nur liest.

## Was jetzt gerechnet wird

`belegungAktualisieren()` läuft zu Beginn von `renderAll()` und füllt `belegung[].frei`:

```
frei[i] = Kontingent(Achse) − noch belegt am Ende von Woche i − vorgemerkt in Woche i
```

- **Kontingent** aus `BEL_KONTINGENT` (Ortho 2 · Neuro 3 · Geri 1 · SalutoCare 1 = 7).
  Die Summe ist `FC_BETTEN` — die Konstante ist jetzt abgeleitet statt fest.
- **Belegt** nach derselben Regel, die der Forecast schon benutzt (`fcKtTyp`:
  PKV oder Selbstzahler = privat). Bewusst keine zweite, abweichende Definition.
- **Vorgemerkt** aus `f.bettKw` am Fall.
- Wochenraster über denselben Mittwochs-Anker wie `fcWochen()`/`kapKwLabel()`.

## Warum die Vormerkung aus dem Fall kommt

`kapVormerken()` hat bisher `b.frei[i]--` gerechnet. Da `belegung[]` **und** `faelle[]`
im Speicher persistiert werden, hätte eine Neuberechnung nach dem Wiederherstellen
doppelt abgezogen. Der Handabzug ist deshalb entfernt; die Vormerkung steht nur noch am
Fall und wird von der Basis abgezogen. Geprüft: zwei aufeinanderfolgende `renderAll()`
ändern nichts mehr.

## Ein Fehler beim Nachbauen

Die erste Fassung von `belKomfortBelegung()` hat aufgenommene Fälle doppelt gezählt —
`fcBelegte()` schließt Fälle aus, die schon in `inReha[]` stehen, meine Fassung nicht.
Ergebnis waren 8 Belegungen auf 7 Betten und ein Totalstau. Behoben; jetzt 6 von 7.

## Stand danach

| Achse | frei in 4 Wochen | Kontingent |
|---|---|---|
| Orthopädie | 0 · 0 · 1 · 2 | 2 |
| Neurologie | 0 · 0 · 0 · 3 | 3 |
| Geriatrie | 1 · 1 · 1 · 1 | 1 |
| SalutoCare | 0 · 0 · 0 · 0 | 1 |

Ein Bereich sofort buchbar, zwei werden frei, SalutoCare ausgebucht. Keine Achse ist
überbelegt. Der Kapazitäts-Abgleich sagt jetzt Sätze wie „Nächstes freies Komfortbett:
KW 38 — in 3 Wochen", hergeleitet aus echten Entlassdaten statt aus einem Seed.

## Nachweis

| | 1440 | 390 |
|---|---|---|
| Kontrastbefunde | 24 | 24 |
| Passform-Befunde | 22 | 11 |
| davon aus `.bel-*` | 0 | 0 |
| Ansichten mit Überlauf | 0 | 0 |
| Konsolenfehler | keine | keine |

Identisch zum Stand vor dem Anschluss — nichts regressiert. Zusätzlich einzeln geprüft:
Vormerkung stabil über mehrere Renders, Portal zeigt dieselben Werte wie das Modell,
Forecast rechnet weiter („Ohne Neuzugänge sinkt die Belegung von 6 auf 0 in acht Wochen").

## Weiterhin offen

`.btn-brass` (2,41:1) — unverändert die offene Gestaltungsfrage aus der C1-Umstellung.

---

# Nachtrag 2 — die fehlenden Bausteine (24.08.2026)

## Warum sie gefehlt haben

Der Umfang wurde festgelegt, bevor Abschnitt (c) der Übergabe gelesen war — die
vollständige Klickstrecke mit allen vier Bildschirmen, Filter, Sortierung, Sternen
und Notizen. Die Auswahlmöglichkeit war zudem mit „dafür ist sein Modul dann wirklich
abgebildet" beschrieben, was nicht zutraf. Beides Fehler in der Vorbereitung, nicht
in der Umsetzung.

## Jetzt ergänzt

| Baustein bei Valon | Umsetzung |
|---|---|
| **s0** Ring Erlös Ist gegen Sollziel, Einstieg „Patienten · Alle Stationen" | in den Kopf der Belegungsübersicht gefaltet — eine eigene Landeseite wäre neben unserer Segmentleiste doppelt |
| **Extras-Streifen** Komfortzimmer · CA · EZ | unter der Stationstabelle |
| **s2 über alle Stationen** | `belOeffne("*")` |
| **s3 Patientendetail** | alle acht Abschnitte: Kopf mit Avatar und Merkmalen, Aufenthalt mit Zeitleiste, Zimmer & Klassifikation, Kosten & Kostenträger, VL/Anmerkung, Aufenthaltsdauer, Zuweiser & Begleitpersonen, Barthel, Notizen |
| **Filterfenster** | fährt von unten ein; fünf Gruppen, 16 Chips — Status ≤7/≤21/stabil, Bewertung, Zimmerkategorie, Markierte/VL, vier Sortierungen |
| **Sterne setzen · Notizen · Markieren** | alle drei, nur im Arbeitsspeicher wie im Original |
| „Stand: …"-Zeile | auf Übersicht und Detail |

Dazu 14 Datenzeilen um die Felder erweitert, die das Detail zeigt: VL/Anmerkung,
Zuweiser, Begleitpersonen, Barthel bei Aufnahme und aktuell.

## Eine Abweichung mit Grund: die Sterne

Erster Nachbau übernahm sein Muster — leerer Stern in hellem Gold. Das ergab
**48 zusätzliche Kontrastbefunde bei 1,56:1**, die Kontrastzahl sprang von 24 auf 67.

Nachrechnen zeigte eine Sackgasse: Ein leerer Stern, der über die Farbe allein auf 3:1
käme, läge nur noch 1,65:1 vom gefüllten entfernt — beide sähen gleich aus. Deshalb
trägt jetzt die **Form** die Bedeutung: gefüllt ★ gegen offen ☆, dazu `--muted` statt
hellem Gold. Zurück auf 25.

Dieselbe Schwäche hat die ältere `.st-row` in der Datenbank-Ansicht (10 Befunde,
vorbestehend). Der gleiche Griff würde dort helfen — nicht angefasst, weil außerhalb
dieser Aufgabe.

## Nachweis

13 Ansichten plus die drei neuen Zustände (Liste über alle Stationen, Detail,
Filterfenster), beide Breiten, Selbsttest je Lauf.

| | 1440 | 390 |
|---|---|---|
| Kontrastbefunde | 25 | 25 |
| Passform-Befunde | 25 | 11 |
| davon aus `.bel-*` | 0 | 0 |
| Ansichten mit Überlauf | 0 | 0 |
| Konsolenfehler | keine | keine |

Der eine Kontrastbefund mehr als vorher ist der „Filter anwenden"-Knopf — dieselbe
`.btn-brass`-Frage.

Durchgespielt: alle Stationen (14 Zeilen) · Filter „Kritisch" + Sortierung nach Name
(2 Treffer, aktive Filterzeile stimmt) · Markieren und Filter „Markierte" (1 Treffer) ·
Sterne setzen (5 → 2) · Notiz schreiben und wiederfinden · Detail mit Zeitleiste
„32 vergangen · 4 verbleibend · 89 %".

**Ein eigener Fehler unterwegs:** eine Regel aus dem ersten Bauabschnitt
(`.bel-row{flex-direction:column}` unter 640 px) stapelte das Markierungs-Kästchen
über die Zeile statt daneben. Entfernt.

## Weiterhin nicht übernommen

- Speicherung von Sternen und Notizen über das Neuladen hinaus — bewusst, wie im
  Original: mit Speicherung entsteht sofort eine Löschpflicht.
- Sein eigener Startbildschirm mit Markenkopf „Bavaria Data" — die App hat ihren
  eigenen Einstieg.

---

# Nachtrag 3 — Speichern und drei Altlasten (24.08.2026)

## Sterne, Notizen und Markierungen überdauern das Neuladen

Entscheidung des Nutzers, abweichend von Valons Original (das bewusst nichts speichert).

Gespeichert wird **nur der veränderte Zustand je Zimmer** (`{s:Sterne, n:Notiz, m:Markierung}`),
nicht die ganze Datenzeile — so bleibt der Seed austauschbar und ein alter Speicherstand
kann keine Datenstruktur überschreiben. Der Zustand hängt im vorhandenen `kbDemoState`,
also räumt der Zurücksetzen-Knopf ihn automatisch mit weg. Geprüft: gesetzt → neu geladen →
noch da; zurückgesetzt → wieder Seed-Werte.

Der Import bleibt absichtlich flüchtig.

**Für den echten Betrieb gilt weiterhin:** sobald echte Patientendaten gespeichert werden,
entsteht eine Löschpflicht. Im Prototyp mit erfundenen Daten im Browser-Speicher ist das
kein Thema; beim Rollout schon.

## Drei Altlasten erledigt

| Was | Vorher | Jetzt |
|---|---|---|
| Konsolenfehler bei jedem Ansichtswechsel | 7 abgewiesene Versprechen auf 7 Wechsel | **0** auf 16 Wechsel |
| Leere Bewertungssterne in der Datenbank-Ansicht | 10 Befunde bei 1,5–1,56:1 | **0** |
| Kontrastbefunde gesamt | 25 | **15** |

Der Konsolenfehler war eine nicht abgefangene View-Transition: `.ready`/`.finished` lehnen
ab, wenn ein Übergang abgebrochen wird. Jetzt mit `catch` versehen — zwei Zeilen, keine
Verhaltensänderung.

Die leeren Sterne bekamen dieselbe Lösung wie im Belegungs-Modul: das offene Zeichen ☆
statt eines hellen ★, plus `--muted` statt `--brass-line`. Die Form trägt die Bedeutung,
nicht die Farbe.

## Nicht angefasst

**„Zuweiser-Portal · undefined"** in der Portal-Kopfzeile (`renderSuite`, Zeile ~8882):
`zName` ist leer, wenn das Portal ohne Zuweisernamen geöffnet wird. Ein `||`-Fallback würde
reichen, aber die Stelle liegt im geschützten Namensraum des Cofounders — gehört ihm.

## Stand

| | 1440 | 390 |
|---|---|---|
| Kontrastbefunde | 15 | 15 |
| Passform-Befunde | 25 | 11 |
| davon aus `.bel-*` | 0 | 0 |
| Ansichten mit Überlauf | 0 | 0 |
| Konsolenfehler / abgewiesene Versprechen | 0 / 0 | 0 / 0 |

Die verbliebenen 15 Kontrastbefunde sind 14× `.btn-brass` (die offene Gestaltungsfrage)
und eine Foto-Bildunterschrift, bei der der Prüfer das Bild dahinter nicht sieht.

---

## Nachtrag 4 — 25.08.2026: Befunde aus Valons Loom-Video

Quelle: Loom „Klinik Bavaria · Concierge – 25 August 2026" (1:44), Untertitel liegen vor.
Valon hat ein echtes Stationsblatt mit 301 Zeilen geladen. Ergebnis auf dem Schirm:
301/301 Betten, 100 % auf **jeder** Station, Sollziel 0,00 €, „166k von 0k €".

### Befund 1 — jede Zeile zählte als heute belegtes Bett

Der Import filterte nicht nach Datum. Ein Stationsblatt enthält aber regelmäßig
abgeschlossene und noch nicht begonnene Aufenthalte; Valons Stichproben waren
„alle schon draußen". Neu: `belLaeuft(r)` prüft Aufnahme ≤ heute ≤ Entlassung.
Nur laufende Aufenthalte zählen als Bett und in den Tageserlös.
Der Importbericht nennt die Zahl der nicht laufenden Aufenthalte, die Standzeile
wiederholt sie, die Stationszeile zeigt „N nicht aktuell".

`belRestPill()` zeigt negative Rest-Tage nicht länger als rote Dringlichkeit,
sondern ruhig als „N Tage her". `belStatus()` kennt dafür die Lage `weg`.

### Befund 2 — Soll wurde auf die Zeilenzahl gesetzt

`const st = bekannt[n] || {name:n, soll:zeilen.length, zielTag:0, art:"regel"}`
setzte für jede unbekannte Station Soll = Ist. Damit war die Auslastung
rechnerisch immer 100 %, das Erlösziel null und die Zielabweichung sinnlos —
auch mit einer tagesaktuellen Liste.

Neu: unbekannte Station heißt `soll:null` / `zielTag:null`. Die Oberfläche zeigt
dann einen Strich statt einer Zahl. Eine Gesamtquote erscheint nur, wenn für
**jede** Station ein Wert bekannt ist (`g.ohneSoll`, `g.ohneZiel`) — sonst wäre
die Summe eine Mischung aus gemessen und geraten. Der Ring weicht einer
Platzhalter-Kachel `.bel-ohne-ziel`.

Nachtragen über `belSollFormular()` / `belSollUebernehmen()` / `belSollLeeren()`,
Ablage in `BEL_SOLL` — nur im Speicher, wie der Import selbst. Zurückgesetzt bei
neuem Import und bei „Zurück zur Demo".

### Befund 3 — Barthel-Index: kein Fehler

„Aufnahme / aktuell / Differenz" steht in `BEL_SPALTEN` nicht drin. Ein
Stationsblatt ist eine Belegungs- und Abrechnungsliste; Barthel und FIM kommen
aus der medizinischen Dokumentation. Bei uns liegen sie als Demo-Daten in
`inReha[]`. Nicht geändert — dafür bräuchte es eine zweite Quelle.

### Zusätzlich: Kennzahlen groß (Wunsch Michael)

Nur `.bel-cockpit` wird vergrößert: 46 px, ab 760 px 36 px, ab 430 px 30 px.
Das Cockpit auf „Heute" bleibt bei 27 px. Die Bettenzahl-Angabe steht als
`<i>` gesetzt kleiner und gedämpft hinter dem Ist-Wert.

### Prüfung

| | 1440 | 390 |
|---|---|---|
| Überlauf im Belegungs-Modul | 0 | 0 |
| Konsolenfehler / Rejections | 0 | 0 |

Die 13 Überlaufbefunde in `inreha/verlauf` (`.ir-card`, `.irb-bwl`) sind
zeichengleich mit dem Stand vor diesem Umbau — vorbestehend, nicht angefasst.

Testfall (15 Zeilen, zwei unbekannte Stationen, 13 abgeschlossene Aufenthalte):
vorher hätte er 15/15 und 100 % gezeigt, jetzt 2/— und einen Strich; nach dem
Nachtragen von 40 bzw. 30 Betten 2/70 und 3 %. „Zurück zur Demo" stellt den
Ausgangszustand exakt wieder her.
