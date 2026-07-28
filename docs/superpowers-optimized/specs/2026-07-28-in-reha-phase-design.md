# Design-Spec R15 — Die In-Reha-Phase: Aufnahme als Übergabe

Datum: 28.07.2026 · Status: vom Nutzer freigegeben (Design), Umsetzung beauftragt
Datei: `index.html` (self-contained, kein Build, kein Backend)

## Befund (gemessen, nicht vermutet)

`inReha[]` ist ein reines Seed-Array. **Keine Stelle im Code schreibt hinein.** Folgen im heutigen Prototyp:

- Ein bis „Aufnahme bestätigen" durchgespielter Fall erscheint **nie** in „In Reha".
- Die Fallakte zeigt dauerhaft „Noch nicht in Reha aufgenommen — keine medizinischen Kurzfelder vorhanden".
- Der Belegungs-Forecast behilft sich: für `status==="Aufgenommen" && !inRehaIds.has(personId)` rechnet er pauschal 21 Tage (so im Code kommentiert).
- `RS_BILLING` ist nach **Namen** verschlüsselt — ein neu aufgenommener Patient hätte 0 € Erlös und 0 % Marge.

Der Aufnahmeprozess endet also im Nichts.

## Entscheidung des Nutzers

**Medizinische Tiefe: „Steuerung + Outcome".** Diagnose/ICD, Reha-Ziel, Aufnahme- und aktueller Outcome-Wert (Barthel/FIM), Arztbericht in einem Satz, geplante Entlassung, Anschlussbedarf, wöchentlicher Zwischenstand. **Keine** Laborwerte, keine Medikation, keine Zweitdokumentation — die Kliniksoftware bleibt führend, das CRM spiegelt.

## Architektur in drei Teilen

### Teil A — Die Schwelle

„Aufnahme bestätigen" erzeugt den Reha-Datensatz aus dem Fall: Diagnose und Fachbereich aus den Klärungsfeldern, Kostenträger und Verantwortliche aus der Verwaltung, Aufnahmedatum aus dem bestätigten Termin, geplante Verweildauer je Fachbereich. Neu ist ein einziges Eingabefeld — die **Zimmerkategorie** —, weil daran Tagessatz und Zusatzerlöse hängen.

Abrechnungsdaten wandern **auf den Reha-Datensatz** (`p.bill`), nicht in die statische `RS_BILLING`-Tabelle: nur so überleben sie einen Reload (`inReha` wird persistiert, `RS_BILLING` ist Konfiguration).

Fall und Reha-Akte bleiben über `personId` verbunden; der Fall behält `f.id` im Reha-Datensatz (`fallId`), damit Rückmeldungen den Weg zurück in den Verlauf finden.

### Teil B — Was das CRM bei der Aufnahme nicht weiß

Messwerte kommen aus der Kliniksoftware. Genau das wird sichtbar: kurz nach der Aufnahme trifft das **Aufnahme-Assessment** ein (ICD, Barthel/FIM-Aufnahmewerte, Reha-Ziel-Vorschlag, Arztbericht-Satz) — über dieselbe Mechanik, mit der schon die Rückmeldungen des Sozialdienstes eintreffen. Bis dahin zeigt die Akte ehrlich „Aufnahme-Assessment steht aus" statt erfundener Startwerte.

Die Fallakte wird zur Brücke: gefüllte medizinische Kurzfelder mit Herkunftszeile, ein Sprung „In Reha ansehen", und das Lagebild sagt „Tag 3 von 21 im Haus" statt „Fall abgeschlossen".

### Teil C — Aufenthalt und Entlassung

Der wöchentliche Zwischenstand existiert (Protokoll-Board, `rsSaveZwischenstand`). Neu:

- **Zwischenstand an die anmeldende Stelle senden** — protokolliert im Fall und in der Personen-Historie. Der Kurzbericht ist bereits die gemeinsame Quelle, die das Zuweiserportal liest; es wird also nichts dupliziert.
- **Entlassung dokumentieren** — schließt die Kette: Personen-Historie erhält den Entlassungs-Eintrag (Grundlage für den automatischen Nachsorge-Anlass in der 6.–8. Woche und das Entlass-Jubiläum), der Fall bekommt den Abschlusseintrag, der Patient verschwindet aus den laufenden Listen, bleibt aber als Datensatz erhalten (`p.entlassen`), damit die Fallakte weiter medizinische Kurzfelder zeigt.

## Bewusst nicht umgesetzt (YAGNI)

- Kein neuer Status „Entlassen" in `STATUS[]` — das würde durch Board-Zonen, Trichter, Kennzahlen und Auto-Status rippeln, ohne Erkenntnisgewinn für die Demo.
- Keine Laborwerte oder Medikation bei neu angelegten Patienten (Seeds behalten ihre, sie sind gesetzt).
- Keine erfundenen Outcome-Startwerte bei der Aufnahme.

## Verifikationskriterien

1. Fall bis „Aufnahme bestätigen" durchspielen → Patient erscheint in „In Reha" mit Zimmer, Tagessatz, Erlös, Verweildauer „Tag 1 von N".
2. Nach ~9 s trifft das Assessment ein → Barthel/FIM/ICD/Reha-Ziel gefüllt, Verlaufseintrag im Fall, Kurzfelder in der Fallakte gefüllt.
3. Vor dem Assessment stürzt nichts ab: Reha-Detail zeigt den Hinweis statt leerer Ringe.
4. Zwischenstand speichern → „an Zuweiser senden" erzeugt Verlaufseintrag im Fall.
5. Entlassung dokumentieren → Patient aus „In Reha" verschwunden, Historie-Eintrag vorhanden, Fallakte zeigt weiter die Kurzfelder.
6. Reload nach Aufnahme: Zimmer/Tagessatz/Erlös bleiben erhalten.
7. 390 px und 1440 px, 0 Console-Errors, `node --check` sauber, Cofounder-Bereiche unangetastet.
