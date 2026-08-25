# Kapitel 10 · Auswertung

**Ansicht im Prototyp:** Seitenleiste → Auswertung
· [Live-Ansicht](https://aluminiumminimum.github.io/bavaria-trichter-prototyp/)

## Zweck
Die Auswertung ist der Beweis-Bildschirm der Klinikleitung: Sie zeigt in einem Blick, ob der
Trichter aus den vorherigen Kapiteln tatsächlich funktioniert — woher Patienten kommen, wie
viele davon aufgenommen werden, wie schnell reagiert wird und wo Fälle hängen bleiben. Ohne
dieses Kapitel gäbe es zwar einzelne Fallakten, aber keinen Nachweis über das Ganze — die
Leitung müsste jede Auswertung selbst aus Einzelfällen zusammenzählen, und Verlustmuster
(z. B. immer dieselbe Wartezeit, derselbe Kanal) blieben unentdeckt.

## Funktionen
| Pos. | Funktion | Verhalten (2–4 Sätze) | Einordnung |
|---|---|---|---|
| 10.01 | Seitengerüst/Zeitraum | Eigene Navigationsseite mit einer Donut-Grafik, mehreren Balkendiagrammen und vier Kennzahlkacheln unten ("Nichts geht unter", "Team steuern", "Aus Verlusten lernen", "Kontaktfreigabe"). Alle Werte beziehen sich immer auf den kompletten aktuellen Datenbestand — es gibt **keine** Zeitraum-Auswahl (z. B. "letzte 30 Tage", "laufendes Quartal"); die Seite zeigt nur eine Momentaufnahme "jetzt". | Produkt (Grundgerüst), Zeitraum-Filter fehlt vollständig — echter Betrieb ohne wählbaren Zeitraum ist für ein Reporting nicht praxistauglich |
| 10.02 | Aufnahmequote (Kanal, Fachbereich, Zuweiser) | Ein Donut zeigt den Anteil aufgenommener Fälle an allen bisher entschiedenen Fällen (aufgenommen/verloren/in Arbeit, mit Prozentzahl in der Mitte) plus zwei Balkendiagramme: "Woher kommen Patienten?" (Anzahl Fälle je Eingangskanal, z. B. Zuweiser-Fax, Website, Telefon) und "Welche Fachbereiche?" (Anzahl Fälle je Fachbereich/Achse). Eine Aufschlüsselung der Aufnahmequote **je einzelnem Zuweiser** existiert in diesem Kapitel nicht — eine reine Fallzahl-Rangliste pro Zuweiser gibt es stattdessen im Netzwerk-Kapitel (Pos. 08.09), aber ohne Quoten-Bezug. | Produkt (Kanal, Fachbereich); Zuweiser-Aufschlüsselung als Aufnahmequote ist eine echte Lücke |
| 10.03 | Reaktionszeiten | Kachel "Wird das Versprechen gehalten?": zeigt, wie viele Erstkontakte innerhalb der service­versprochenen Zeit erfolgten (Dringlichkeitsklassen A/B/C je nach Kanal bzw. Sterne-Einstufung: 2 / 4 / 24 Stunden), als Bruch, Prozentwert und Fortschrittsbalken, dazu die durchschnittliche Stundenzahl bis zum Erstkontakt. Fälle mit verfehltem Ziel werden namentlich mit Überschreitung in Stunden aufgelistet, verlorene Fälle mit grober Erlösschätzung, und ein Link führt zu offenen Eskalationen. | Produkt |
| 10.04 | Engpässe je Prozessschritt | Drei ergänzende Balkendiagramme zeigen, woran offene Fälle hängen: "Wo stockt es?" zählt laufende Fälle nach Blockergrund (fehlende Unterlagen, offene Kostenklärung, überfällige Frist, fehlende Kontaktfreigabe, Aufnahmeplanung), "Woran hängen Fälle? · Ablage-Gründe" zählt Fälle im Wartezustand nach dokumentiertem Ablagegrund mit Fazit-Satz zum größten Blocker, und "Warum gehen Fälle verloren?" zählt bereits verlorene Fälle nach Verlustgrund. | Produkt |

## Datenobjekte
Die Auswertung schreibt nichts, sie liest ausschließlich und berechnet bei jedem Aufruf neu:
Fälle (Status, Kanal, Fachbereich/Achse, Kostenklärungsstatus, Dokumenten-Checkliste,
Kontaktfreigabe-Status, Verlustgrund, Ablage-Historie, Reaktionszeit bis Erstkontakt) sowie
abgeleitete Kennzahlen daraus (Konversionsrate, Ø-Reaktionszeit je Dringlichkeitsklasse). Es
gibt keine eigenen, persistierten Auswertungs-Datensätze. Details zu den gelesenen Feldern
siehe datenmodell.md (Entität Fall/Anfrage).

## Offene Punkte für Trinidat
- Soll ein Zeitraum-Filter ergänzt werden (z. B. Monat/Quartal/Jahr, frei wählbarer Bereich),
  und was ist der Standardzeitraum beim Öffnen der Seite?
- Soll die Aufnahmequote zusätzlich nach einzelnem Zuweiser aufschlüsselbar sein (Pos. 10.02),
  und falls ja, in dieser Auswertung oder nur im Netzwerk-Kapitel?
- Wird ein Export (PDF/CSV) für Geschäftsführungsberichte benötigt, oder bleibt die Auswertung
  reine Bildschirmansicht?

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
