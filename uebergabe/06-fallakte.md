# Kapitel 06 · Fallakte

**Ansicht im Prototyp:** Fälle → Board (oder „Mein Tag") → eine Fallkarte anklicken → Fallakte
(eigene Vollansicht, kein Overlay)
· [Live-Ansicht](https://aluminiumminimum.github.io/bavaria-trichter-prototyp/)

## Zweck
Die Fallakte ist der Arbeitsplatz für genau einen Fall — hier klärt die Koordination Schritt für
Schritt Kontakt, medizinischen Bedarf, Unterlagen, Kostenzusage und Anreise, bis die Aufnahme
feststeht. Sie bündelt Kommunikation, Fristen, interne Absprachen und die Original-Anfrage an
einem Ort, statt sie über E-Mail-Postfach, Telefonnotizen und Aktenordner zu verstreuen. Ohne die
Fallakte gäbe es keine nachvollziehbare, für jede Vertretung sofort verständliche Fallgeschichte.

## Funktionen
| Pos. | Funktion | Verhalten (2–4 Sätze) | Einordnung |
|---|---|---|---|
| 06.01 | Seitengerüst | Die Fallakte ist eine eigene Vollbild-Ansicht mit drei Spalten: links die Prozessleiste, in der Mitte Lagebild, Klärungsfelder und ein Verwaltungsblock (Kostenträger, SalutoCare-Kennzeichnung, Verlust/Reaktivierung), rechts Kommunikation & Verlauf, interne Team-Nachrichten sowie ausklappbare Blöcke für Übersicht, medizinische Kurzfelder, Abrechnung und Dokumente. Ein „‹ Zurück"-Knopf führt kontextabhängig zum Board oder zu „Mein Tag" zurück. | Produkt |
| 06.02 | Prozessleiste (6 Stufen) | Eine vertikale Leiste zeigt die sechs Stufen Neu → Kontaktiert → Qualifizierung → Unterlagen → Aufnahme geplant → Aufgenommen, markiert durchlaufene Stufen als erledigt und die aktuelle als aktiv. Die Leiste ist rein anzeigend; die Stufenfolge leitet sich automatisch aus dem Fall-Status ab (siehe 06.11). | Produkt |
| 06.03 | „Lagebild" | Kompakter Statusblock oben im Arbeitsbereich: aktueller Status als Farbchip, Anzahl geklärter von fünf Klärungsfeldern, primärer Ansprechpartner samt Auskunftsstatus, ein klickbarer „Jetzt zu tun"-Satz, der zum betroffenen Klärungsfeld springt, und ein Kurzhinweis auf die zuletzt empfangene oder gesendete Nachricht. Sind alle Felder geklärt, erscheint stattdessen ein Bestätigen-Knopf für die Aufnahme. | Produkt |
| 06.04 | „Kommunikation mit" | Zeigt, mit wem aktuell kommuniziert wird: die anmeldende Stelle (z. B. Sozialdienst, Klinik) getrennt vom eigentlichen Ansprechpartner (Patient oder Angehörige) sowie — falls abweichend — an wen Antworten tatsächlich adressiert werden. Ist die Auskunftsberechtigung ungeklärt, erscheint zusätzlich ein Warnhinweis (siehe 06.15). | Produkt |
| 06.05 | „Jetzt zu tun" | Leitet aus dem ersten noch offenen Klärungsfeld einen konkreten, in Prosa formulierten Handlungssatz ab (Beispiel, synthetisch: „Erstgespräch führen und Stammdaten bestätigen · ☎ 0170 …"); ein Klick öffnet direkt das zuständige Klärungsfeld. Sonderfälle — Patient hat abgesagt, Fall bereits aufgenommen oder verloren — überschreiben die reguläre Reihenfolge. | Produkt |
| 06.06 | „Zuletzt empfangen" | Zeigt die letzte ein- oder ausgehende Nachricht aus dem Verlauf mit Zeitpunkt und gekürztem Text; eine unbearbeitete, frisch eingetroffene Antwort ist optisch hervorgehoben. Ein Klick springt in den Nachrichtenverlauf. | Produkt |
| 06.07 | Frist-Datumsfeld | Freies Datumsfeld für die nächste Bearbeitungsfrist; die Rahmenfarbe zeigt eingehalten/knapp/überschritten. Wird von Statusautomatik und Ablage-/Wiedervorlage-Regeln automatisch vorbelegt, bleibt aber jederzeit manuell überschreibbar. | Produkt |
| 06.08 | „Verantwortlich" | Auswahlfeld mit Avatar-Kürzel für die zuständige Person aus einer festen Rollenliste. Jede Änderung wird im Verlauf protokolliert. | Produkt (Rollenliste im Prototyp auf vier Personen begrenzt, siehe Offene Punkte) |
| 06.09 | Schlagworte | Aus der Originalnachricht automatisch erkannte Kurzangaben (Beispiel: Diagnose, Frist-Formulierung, Absendertyp) erscheinen als kleine Chips oberhalb der Klärungsfelder — schnelle Orientierung, ohne die Originalnachricht öffnen zu müssen. Fehlt ein Merkmal im Text, entfällt der zugehörige Chip ersatzlos. | Produkt |
| 06.10 | Fünf Klärungsfelder | Statt eines starren Schritt-für-Schritt-Assistenten zeigt die Akte fünf gleichzeitig zugängliche, auf- und zuklappbare Felder — Kontakt & Erstgespräch, Medizinischer Bedarf, Unterlagen, Kostenzusage, Anreise & Aufnahme — jedes mit eigenem Werkzeug (Formular, Checkliste oder Aktion) und dem Zustand offen/aktuell/erledigt. Welches Feld als „aktuell" aufklappt, ergibt sich aus dem ersten noch nicht erledigten Feld; erledigte oder übersprungene Felder bleiben jederzeit zum Nachschlagen erreichbar. Die vollständigen Erledigungskriterien je Feld stehen in geschaeftsregeln.md. | Produkt |
| 06.11 | Statusautomatik (vor, nie zurück) | Der Fall-Status wird nicht manuell gesetzt, sondern nach jeder abschließenden Klärungsfeld-Aktion automatisch auf den Meilenstein des ersten noch offenen Feldes vorgerückt — nie zurück. Beispiel (synthetisch): Ein Fall in „Kontaktiert" mit bereits vollständigen Unterlagen und Diagnose, aber offener Kostenzusage, springt direkt auf „Unterlagen"; die dazwischenliegende Stufe „Qualifizierung" wird ausgelassen, ihre hinterlegten Folgeaktionen laufen trotzdem. Die vollständige Regel inkl. Sonderfälle (Verlust, Aufnahme) steht in geschaeftsregeln.md. | Produkt |
| 06.12 | Wiedervorlage-Automatik „Nicht erreicht" | Ein Klick auf „Nicht erreicht" zählt den Kontaktversuch hoch und setzt automatisch eine neue Frist nach Sterne-Priorität der Person — Beispiel (synthetisch): 5 Sterne → noch heute, 4 Sterne → morgen, 3 Sterne → in 2 Tagen, sonst → in 4 Tagen. Der Fall gilt währenddessen als „abgelegt" (externer Blocker) und pausiert damit die Service-Zeit-Messung statt als Verstoß zu zählen; ab dem dritten erfolglosen Versuch empfiehlt das System einen Kanalwechsel (schriftlich statt telefonisch). Vollständige Ablage-Mechanik in geschaeftsregeln.md. | Produkt |
| 06.13 | Ärztliche Übernahme-Freigabe | Bei Fällen mit hohem medizinischem Schweregrad (Beispiel: Beatmungs-/Weaning-Fälle) verlangt das Klärungsfeld „Medizinischer Bedarf" zusätzlich zur Diagnose eine interne ärztliche Freigabe, bevor es als erledigt gilt. Ein Knopf fragt die Freigabe bei der Ärztlichen Leitung an; die Antwort (erteilt, mit Auflage) wird protokolliert und schaltet das Feld frei. | Produkt (im Prototyp an eine einzelne, namentlich hinterlegte Person gebunden statt an eine Rolle, siehe Offene Punkte) |
| 06.14 | Kopfdaten der Gegenseite | Im Kommunikationsbereich stehen die Kopfdaten der Gegenseite: anmeldende Stelle mit Eingangskanal, festgehaltener Ansprechpartner mit Verhältnis zum Patienten, und — falls abweichend — der tatsächliche Empfänger der nächsten Antwort. | Produkt |
| 06.15 | Hinweis Auskunftsberechtigung | Solange die Auskunftsberechtigung einer Kontaktperson (Vollmacht, gesetzliche Betreuung, Patient selbst oder „ungeklärt") nicht erfasst ist, zeigt die Akte einen Warnhinweis, dass keine Angaben zum Gesundheitszustand gemacht werden dürfen. Der Hinweis ist eine Erinnerung an die Mitarbeiterin, keine technische Sperre von Textbausteinen oder Versand. | Produkt (Hinweis derzeit beratend, keine harte Sperre, siehe Offene Punkte) |
| 06.16 | Filter und Zeitleiste | Der Nachrichtenverlauf lässt sich zwischen zwei Reitern umschalten: „Gespräche" zeigt nur ein- und ausgehende Nachrichten sowie manuelle Gesprächsnotizen, „Alles" zusätzlich interne Systemzeilen (z. B. Statuswechsel, Dokument abgehakt). Einträge sind chronologisch mit Datumstrennern gruppiert, der aktuelle Tag erscheint als „Heute". | Produkt |
| 06.17 | Originalnachricht und Anhänge | Die ursprüngliche Anfrage (Text, Eingangskanal, Quelle) bleibt über eine ausklappbare, standardmäßig eingeklappte Karte dauerhaft abrufbar, statt nach der Übernahme zu verschwinden. Mitgeschickte Unterlagen sind im Prototyp als reine Ja/Nein-Checkliste (Entlassbrief, Befunde, Versicherungsdaten, Kostenzusage) abgebildet, nicht als hinterlegte Dateien. | Produkt (echte Datei-Anhänge fehlen im Prototyp, siehe Offene Punkte) |
| 06.18 | Erfassen aus der Akte (Notiz, E-Mail, Rückmeldung) | Aus der Akte heraus lassen sich drei Dinge erfassen: eine interne Gesprächsnotiz, eine ausgehende Antwort (Kanalwahl E-Mail/Telefonnotiz/SMS/WhatsApp, kombinierbare Textbausteine je Kostenträger) und — im Testbetrieb — eine simulierte Rückmeldung der Gegenseite. Jede Erfassung erscheint sofort im Nachrichtenverlauf und kann Klärungsfelder automatisch abschließen (Beispiel: eine simulierte Kostenzusage schließt das Feld „Kostenzusage"). | Produkt; die simulierte Rückmeldung ist Demo (behalten: dient wie „Anfrage simulieren", Pos. 03.02, als Schulungs-/Abnahmewerkzeug) |

## Datenobjekte
- **Fall** (zentrales Objekt, siehe datenmodell.md) — Status, Klärungsfeld-Zustände (Kontakt
  bestätigt, medizinischer Bedarf inkl. ärztlicher Freigabe, Dokumente, Kostenzusage-Stand,
  Ansprechpartner, Ablage-Zustand), Frist, Verantwortliche Person, chronologischer Verlauf,
  Originalnachricht: hier gelesen und von praktisch jeder Aktion der Akte geschrieben.
- **Person** — Sterne-Bewertung, Einwilligung, Kontaktdaten, Angehörige: teils in den
  Ansprechpartner des Falls gespiegelt.
- **Reha-Aufenthalt** (Kapitel 07) — sobald aufgenommen, liefert die medizinischen Kurzfelder
  (Diagnose/ICD, Barthel/FIM, Entlassdatum) für die Akte.
- **Team-Nachricht** — interne, fallbezogene Absprachen zwischen Mitarbeitenden, getrennt vom
  Verlauf mit der Gegenseite.

## Offene Punkte für Trinidat
- Die Rollenliste im Feld „Verantwortlich" (vier Personen) deckt nicht das volle Team ab — klären,
  ob im Produkt eine echte Rollen-/Nutzerverwaltung greift (Verweis Kapitel 00.03).
- Die Ärztliche Übernahme-Freigabe ist im Prototyp an eine namentlich hinterlegte Person gebunden
  statt an eine Rolle „Ärztliche Leitung" — klären, ob mehrere Personen freigabeberechtigt sein
  müssen (Vertretung).
- Dokumente sind eine Ja/Nein-Checkliste ohne echte Dateiablage; klären, ob das Produkt echten
  Datei-Upload/-Versand statt reiner Vollständigkeits-Häkchen braucht.
- Der Hinweis zur Auskunftsberechtigung ist rein beratend — klären, ob das Produkt Textbausteine
  mit Gesundheitsangaben technisch sperren soll, solange die Berechtigung „ungeklärt" ist.

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
