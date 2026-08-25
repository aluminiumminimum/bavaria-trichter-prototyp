# Kapitel 09 · Netzwerk · Patienten (Kartei)

**Ansicht im Prototyp:** Seitenleiste → Netzwerk → Reiter „Patienten"
· [Live-Ansicht](https://aluminiumminimum.github.io/bavaria-trichter-prototyp/)

## Zweck

Die Seite ist die Kartei aller Interessenten und ehemaligen Patienten (Bestand,
Wiederbedarf-Radar), eingestuft nach Kontaktwert und mit automatisch vorgeschlagenen
Pflegemaßnahmen. Sie sorgt dafür, dass persönliche Ansprache (Geburtstagsgruß,
Jahrestag, Nachsorge-Anruf) systematisch statt zufällig ausgelöst wird — und dass
niemand ohne dokumentierte Einwilligung kontaktiert wird. Ohne dieses Modul gäbe es
keine strukturierte Nachpflege des Kontaktbestands und ein erhöhtes Risiko, Personen
ohne gültige Freigabe anzusprechen.

## Funktionen

| Pos. | Funktion | Verhalten | Einordnung |
|---|---|---|---|
| 09.01 | Kartei Bestand/Interessenten | Reiter „Stammdaten": listet alle Interessenten und ehemaligen Patienten, gruppiert nach Fünf-Sterne-Einstufung (5★ bis 1★) und einer eigenen Gruppe „Gesperrt" für Personen ohne Einwilligung. Eine Kopfleiste zeigt Gesamtzahl, Sterneverteilung als Balken, Anzahl mit akutem Handlungsbedarf (4★/5★ mit Einwilligung) und Anzahl kontaktfähiger Personen. Jede Zeile öffnet eine Detailansicht mit Kontext, letztem Kontakt und automatisch vorgeschlagener Maßnahme. | Produkt |
| 09.02 | Fünf-Sterne-Klassifikation | Jede Person trägt eine Einstufung 1 bis 5 Sterne mit Bezeichnung, Beispiel-Begründung und automatischer Pflegemaßnahme: 5★ „Heißester Lead" (persönliche Betreuung durch Recovery Manager), 4★ „Sehr qualifiziert" (persönlicher Rückruf), 3★ „Qualifiziert" (Wiedervorlage plus Infopaket), 2★ „Schwacher Lead" (automatische Newsletter-Strecke), 1★ „Nicht qualifiziert" (keine aktive Pflege). Die Begründung der Einstufung ist je Person hinterlegt und wird in der Detailansicht angezeigt. | Produkt |
| 09.03 | „Nachsorge" | Anlasstyp im Reiter „Aktionen & Anlässe": eine Karte mit dem Etikett „Nachsorge", die anzeigt, dass bei einer ehemaligen Patientin oder einem ehemaligen Patienten der reguläre Nachsorge-Kontakt fällig ist (siehe Anlassregel 09.07), inklusive Sterne-Einstufung und empfohlener Handlung. | Produkt |
| 09.04 | „Demnächst" | Gruppierungs-Überschrift im Anlass-Feed: fällige Anlässe (Geburtstag, Entlass-Jubiläum, Nachsorge) werden nach Dringlichkeit in „Diese Woche" und „Demnächst" sortiert angezeigt, analog zur Fälligkeitslogik der Zuweiser-Anlässe (Kapitel 08.03). | Produkt |
| 09.05 | Anlassregel Geburtstag | Für Personen ab 2 Sternen mit hinterlegtem Geburtsdatum und Geburtstag innerhalb der nächsten 30 Tage erscheint ein Anlass „wird [Alter]" mit Datum und Tagen bis zum Geburtstag — vorausgesetzt, die Person hat laut ihrer Einstufung und ihren Einwilligungszwecken überhaupt eine passende Geste (z. B. Post-Einwilligung für eine Karte, sonst persönlicher Anruf ab 3 Sternen). Ohne passende Geste erscheint kein Anlass. | Produkt |
| 09.06 | Anlassregel Entlass-Jubiläum | Für Personen ab 3 Sternen mit einer dokumentierten Entlassung wird der Jahrestag dieser Entlassung errechnet; liegt er innerhalb der nächsten 30 Tage, erscheint ein Anlass „N. Entlass-Jubiläum" mit Datum des ursprünglichen Abschlusses und Tagen bis zum Jahrestag, ebenfalls nur mit passender Geste (siehe 09.05). | Produkt |
| 09.07 | Anlassregel Nachsorge | Für Personen ab 2 Sternen mit erteilter Einwilligung und dokumentierter Entlassung greift ein einmaliges Fenster von 42 bis 56 Tagen nach der Entlassung (6. bis 8. Woche). Innerhalb dieses Fensters erscheint der Anlass „jetzt" fällig; bei 5 Sternen mit dem Vorschlag „Persönlicher Nachsorge-Anruf durch Bezugstherapeutin", sonst mit „Nachsorge-Check anbieten". Vor oder nach dem Fenster erscheint kein Anlass. | Produkt |
| 09.08 | Live berechnete Empfängerzahl | Im Reiter „Aktionen & Anlässe" listet ein Block „Automatik-Regeln" vier wiederkehrende Versandregeln (Quartals-Newsletter, Gesundheitsbrief, SalutoCare-Jahresimpuls, Reaktivierung ruhender Kontakte). Zu jeder aktiven Regel wird das nächste Ausführungsdatum sowie die Empfängerzahl angezeigt — live gegen den aktuellen Kartei-Bestand nach Sterne-Zielgruppe, Einwilligung und (bei der Reaktivierungs-Regel) Kontaktruhe von über 12 Monaten neu berechnet, nicht als feste Zahl hinterlegt. Jede Regel lässt sich einzeln pausieren. | Produkt |
| 09.09 | Einwilligung und Sperre (ohne Freigabe keine Ansprache) | Jede Person trägt einen Einwilligungsstatus (erteilt/offen/widerrufen) mit Form und erlaubten Zwecken (Behandlung, Newsletter, Post). Fehlt eine gültige Einwilligung, wird die Person sichtbar in der Gruppe „Gesperrt" geführt (eigenes Symbol statt Sterne-Bewertung), die automatische Pflegemaßnahme zeigt „Keine Ansprache — Einwilligung fehlt", und im Wiederbedarf-Radar erscheint statt einer Handlungsschaltfläche nur der deaktivierte Hinweis „Kontaktfreigabe fehlt". Keine der Anlassregeln (09.05–09.07) und keine Automatik-Regel (09.08) erzeugt ohne erteilte Einwilligung einen Vorschlag. | Produkt |

## Datenobjekte

Das Modul liest und schreibt die Personen-Registry (Geburtsdatum, Lebenszyklus-Status
Interessent/Patient/Altpatient, Kostenträger, Sterne-Einstufung mit Begründung,
Kontaktdaten, Angehörige, Einwilligung mit Form/Datum/Zwecken, Bezug zum vermittelnden
Zuweiser, Kontakthistorie) sowie die Kartei-Liste der Interessenten (Kontext, Quelle,
Einwilligungsstatus) und den Altpatienten-Radar (Prognose zum Wiederbedarf, Fälligkeit
in Tagen). Die Automatik-Regeln (09.08) berechnen ihre Empfängerzahl live aus diesen
Daten. Siehe datenmodell.md für die vollständigen Feldlisten.

## Offene Punkte für Trinidat

- Zielgruppen, Sterne-Schwellen und Versandrhythmus der vier Automatik-Regeln (09.08)
  sind Demo-Festlegungen und mit Marketing/Compliance fachlich zu bestätigen.
- Die Reaktivierungs-Schwelle „ruhend seit über 12 Monaten" (09.08) ist ein
  Beispielwert und mit der Klinikleitung abzustimmen.
- Das Lösch-/Aufbewahrungskonzept bei widerrufener Einwilligung (09.09) ist im
  Prototyp nicht abgebildet — der Datensatz bleibt dauerhaft als „Gesperrt" sichtbar.
  Das eigentliche Löschkonzept ist Gegenstand von Kapitel 13.09.

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
