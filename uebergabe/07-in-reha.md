# Kapitel 07 · Seite „In Reha"

**Ansicht im Prototyp:** Seitenleiste → In Reha → Reiter „Verlauf"
· [Live-Ansicht](https://aluminiumminimum.github.io/bavaria-trichter-prototyp/)

## Zweck

Die Seite zeigt der Klinikleitung und dem Case-Management alle Patienten, die sich
aktuell in Behandlung befinden — je Patient auf einen Blick Verweildauer, klinischer
Fortschritt, Wirtschaftlichkeit und offene Fristen. Ohne dieses Modul gäbe es keine
gebündelte Sicht darauf, welcher Patient wirtschaftlich im Plan liegt, wo eine
Kostenzusage fehlt und wann ein Zwischenbericht oder Entlassgespräch ansteht — diese
Informationen lägen verstreut in Einzelakten.

## Funktionen

| Pos. | Funktion | Verhalten | Einordnung |
|---|---|---|---|
| 07.01 | Seitengerüst | Kopfzeile mit Titel „In Reha" und Untertitel, darunter zwei Reiter „Verlauf" (dieses Kapitel) und „Belegung". Jeder Reiter trägt eine Zählerplakette: „Verlauf" zeigt die Zahl der aktuell nicht entlassenen Patienten, „Belegung" die aktuell belegten Betten. | Produkt |
| 07.02 | Kennzahlenzeile | Kopfleiste über der Patientenliste mit vier Werten, berechnet über alle nicht entlassenen Patienten: Anzahl „in Behandlung", kalkulierter Gesamterlös (Summe aus Tagessatz × geplanter Verweildauer je Patient, gerundet auf Tausend Euro), durchschnittliche Deckungsbeitrags-Marge in Prozent und Anzahl offener Kostenzusagen (hervorgehoben, sobald größer null). | Produkt |
| 07.03 | Patientenkarte | Eine Karte je Patient in Behandlung: Kürzel-Avatar, Name mit Alter, Fünf-Sterne-Einstufung (siehe Kapitel 09.02), Fachachse (z. B. Orthopädie, Neurologie, SalutoCare) und gebuchte Zimmerkategorie. Die Karte ist farblich nach Fachachse markiert; SalutoCare-Patienten erhalten zusätzlich eine optische Hervorhebung. | Produkt |
| 07.04 | „Tag X von Y" | Fortschrittsbalken zur Verweildauer: aktueller Tag im Verhältnis zur geplanten Gesamtdauer, daneben das geplante Entlassdatum (oder „Entlassung offen", solange keines feststeht) sowie ein Hinweispunkt, wenn eine Verlängerung als möglich vermerkt ist. | Produkt |
| 07.05 | Kennzahlkacheln je Patient | Vier Kacheln auf der Karte: Erlös pro Tag (Tagessatz), Gesamterlös bei planmäßiger Verweildauer, Deckungsbeitrags-Marge in Prozent und Zusatzerlöse pro Tag (Summe der gebuchten Wahlleistungen wie Einzelzimmer- oder Suiten-Zuschlag). Alle Beispielwerte sind synthetisch. | Produkt |
| 07.06 | Berechnungslogik Wirtschaftlichkeit | Jeder Patient trägt einen Tagessatz (Erlös je Tag) und tagesbezogene Kosten. Der Deckungsbeitrag je Tag ist die Differenz aus beidem, die Marge das Verhältnis von Deckungsbeitrag zu Tagessatz in Prozent. Der Gesamterlös ergibt sich aus Tagessatz × geplanter Verweildauer, der Gesamt-Deckungsbeitrag aus Deckungsbeitrag je Tag × geplanter Verweildauer. Zusatzerlöse aus Wahlleistungen (z. B. Einzelzimmer, SalutoCare-Suite) fließen separat aus, nicht in die Marge ein. | Produkt |
| 07.07 | Kostenzusage-Ampel | Statuszeile „Kostenzusage …" mit drei Zuständen: grün „liegt vor", sobald eine Zusage eingegangen ist; grün „kein Kostenträger nötig" bei Selbstzahlern oder vergleichbaren Fällen ohne Kostenträger; bei noch offener Zusage gelb „angefragt" in den ersten beiden Behandlungstagen, danach rot „fehlt – kritisch". Die Schwelle von zwei Tagen ist eine Demo-Annahme. | Produkt |
| 07.08 | Fußzeile mit Fristen | Zeigt je Patient den nächsten fälligen Meilenstein: Ist das Aufnahme-Assessment noch nicht eingetroffen, erscheint dieser Hinweis vorrangig. Sonst gilt gestaffelt nach verbleibenden Tagen bis zur geplanten Entlassung: „Entlassgespräch" (≤ 3 Tage Rest, mit Termin oder „Termin abstimmen"), „Verlängerungsentscheid" (≤ 10 Tage Rest, mit Tagesangabe) oder „Zwischenbericht fällig" (fester Prüfpunkt am 14. Behandlungstag, mit Countdown oder „jetzt"). | Produkt |
| 07.09 | Import der Messwerte aus der Kliniksoftware (lesend: Barthel, FIM, ICD) | **Im Prototyp nicht enthalten, Anforderung laut Angebot.** Vorgesehen ist eine lesende Übernahme von Barthel-Index, FIM-Score und ICD-Diagnose aus der Kliniksoftware bei Aufnahme. Der Prototyp simuliert diesen Vorgang nur zeitversetzt: Bis zum Eintreffen zeigt die Karte den ehrlichen Hinweis „Aufnahme-Assessment steht aus", nach einer festen Demo-Wartezeit werden feste Beispielwerte je Fachachse eingesetzt (kein echtes Schnittstellen-Abbild). | Produkt |
| 07.10 | Assessment-Entwicklung | Sobald Werte vorliegen: zwei Fortschrittsringe (Barthel aktuell mit Veränderung seit Aufnahme, FIM aktuell mit Veränderung) plus ein Reha-Ziel-Ring, zwei Entwicklungsbalken (Aufnahmewert → aktueller Wert) und eine Verlaufskurve, die den Weg von Aufnahme- zu aktuellem Wert über die bisherige Verweildauer nachzeichnet. | Produkt |
| 07.11 | Zwischen-/Entlassbericht | Dokumentationsblock im Patientendetail: zeigt, wann der Kurzbericht zuletzt aktualisiert wurde und von wem, ob und wann ein Zwischenstand an die anmeldende Stelle (Zuweiser) gesendet wurde, und erlaubt das Senden des Zwischenstands sowie das Dokumentieren der Entlassung per Knopf. Der Kurzbericht selbst wird an anderer Stelle erfasst (Seite „Mein Tag") und hier nur gelesen bzw. verschickt. | Produkt |
| 07.12 | Automatische Nachsorge-Vorplanung | Beim Dokumentieren der Entlassung wechselt der Patient im Lebenszyklus von „Patient" zu „Altpatient", der Reha-Datensatz bleibt als Historie erhalten, und ein Bestätigungshinweis vermerkt den vorgesehenen Nachsorge-Kontakt in der sechsten Woche nach Entlassung. Die eigentliche Fälligkeitslogik dieses Nachsorge-Kontakts (42- bis 56-Tage-Fenster) ist in Kapitel 09.07 beschrieben. | Produkt |

## Datenobjekte

Das Modul liest und schreibt den Reha-Datensatz je Patient (Barthel-/FIM-Werte,
Verweildauer ist/plan, ICD, Kurzbericht, Zwischenstand, Abrechnungsblock mit
Tagessatz, Kosten je Tag, Kostenzusage-Status, Zimmerkategorie und Zusatzerlösen,
geplantes Entlassdatum). Es verweist auf die Personen-Registry (Fünf-Sterne-Einstufung
für die Kartenanzeige, Einwilligungsstatus für den Empfänger des Zwischenstands) und
auf den ursprünglichen Fall (Protokolleinträge bei Aufnahme, Zwischenstand-Versand und
Entlassung). Siehe datenmodell.md für die vollständigen Feldlisten.

## Offene Punkte für Trinidat

- Die tatsächliche Schnittstelle für 07.09 (Format, Rhythmus, Fehlerverhalten bei
  Nichterreichbarkeit der Kliniksoftware) ist mit der IT-Abteilung der Klinik zu klären
  — der Prototyp kennt nur die Zielwerte je Fachachse, keine echte Anbindung.
- Die Schwellenwerte der Kostenzusage-Ampel (2 Tage bis „kritisch") und des
  Zwischenbericht-Prüfpunkts (Tag 14) sind Demo-Annahmen und mit dem Case-Management
  fachlich zu bestätigen.
- Die Kalkulation von Tagessatz und Kosten je Tag (insbesondere die pauschale
  Kostenquote) ist eine synthetische Beispielrechnung — die reale Kostenlogik muss mit
  dem Controlling abgestimmt werden.

Der zweite Reiter „Belegung" ist nach der Angebotsgrundlage entstanden und in
15-delta.md beschrieben.

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
