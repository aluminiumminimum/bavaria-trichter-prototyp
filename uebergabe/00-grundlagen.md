# Kapitel 00 · Grundlagen & technischer Rahmen

**Ansicht im Prototyp:** Querschnitt — kein eigener Menüpunkt; sichtbar in Aufbau, Optik
und Verhalten jeder Seite · [Live-Ansicht](https://aluminiumminimum.github.io/bavaria-trichter-prototyp/)

## Zweck
Dieses Kapitel legt den gemeinsamen Unterbau fest, auf dem alle Fachkapitel (01–13)
aufbauen: welche Datenstrukturen es gibt, welche Blickwinkel (Rollen) auf die Software
existieren, wie Seiten grundsätzlich aufgebaut sind und welche kleinen Bausteine (Filtern,
leere Listen, Fehlermeldungen) sich durch die ganze Anwendung ziehen. Ohne diesen
Querschnitt müsste jedes Fachkapitel seine eigenen Grundregeln erfinden, und Seiten würden
sich in Aufbau und Verhalten widersprechen. Der Prototyp selbst ist dafür nur ein
Anschauungsobjekt — er ist eine einzelne Datei ohne Server, Datenbank oder Anmeldung und
gibt damit **keine** technische Vorgabe, sondern beschreibt nur, was fachlich gebraucht wird.

## Funktionen
| Pos. | Funktion | Verhalten (2–4 Sätze) | Einordnung |
|---|---|---|---|
| 00.01 | Projektsetup und Umgebungen | Der Prototyp ist eine einzige, selbsttragende HTML-Datei ohne Server, Datenbank oder Build-Prozess; sie läuft direkt im Browser und wird unverändert als statische Datei veröffentlicht. Es gibt keine getrennten Umgebungen (Entwicklung/Test/Produktion) und keinen Anmeldevorgang — jede Kopie der Datei zeigt denselben Startzustand mit denselben Beispieldaten. Änderungen während der Nutzung bleiben nur im jeweiligen Browser erhalten (siehe 00.05, 01.03). | Demo (entfällt) — reine Prototyp-Bauweise ohne produktionsrelevante Infrastruktur; Projektsetup und Umgebungen sind für das Produkt komplett neu zu konzipieren. |
| 00.02 | Datenmodell (Anfrage, Fall, Patient, Zuweiser, Belegung, Aufgabe, Nachricht, Anlass) | Der Prototyp führt für jede fachliche Entität eine eigene Liste im Arbeitsspeicher: eingehende Anfragen, daraus entstehende Fälle, Personen/Patienten, Zuweiser (Kliniken, Praxen, Hausärzte), aktuell in Behandlung befindliche Patienten samt Stationsbelegung sowie Kontaktanlässe für die Beziehungspflege. Diese Listen hängen über gemeinsame Kennungen zusammen — eine Anfrage verweist auf den daraus entstandenen Fall, ein Fall auf die zugehörige Person. Der vollständige Feldkatalog mit Pflichtfeldern, Typen und Beispielwerten steht in `datenmodell.md`; dieses Kapitel beschreibt nur den Querschnitt. | Produkt — die fachliche Struktur ist bindend, auch wenn die technische Speicherung im Produkt anders erfolgt als im Prototyp (siehe 00.05). |
| 00.03 | Benutzerverwaltung, Rollen und Rechte | Der Prototyp kennt keine Anmeldung und keine echten Benutzerkonten; er unterscheidet nur zwei clientseitig umschaltbare Perspektiven — „Leitung" (voller Überblick) und „Koordination" (persönliche Tagesansicht, Kapitel 11) — sowie einen separaten, ohne eigene Anmeldung erreichbaren Zuweiser-Zugang (Kapitel 12). Keine dieser Perspektiven ist durch echte Zugriffsrechte abgesichert; jede Person mit Zugriff auf den Prototyp kann zwischen ihnen wechseln. Das Dossier beschreibt damit nur, welche Blickwinkel fachlich gebraucht werden — Konten, Passwörter und Rechteprüfung fehlen vollständig. | Demo (entfällt) für die technische Umsetzung — die fachlich benötigten Rollen selbst sind Produkt. |
| 00.04 | Gestaltungsraster und Seitenaufbau (mobiltauglich) | Jede Seite folgt demselben Aufbau: Seitenleiste bzw. Tableiste für die Navigation, eine Kopfzeile mit Titel und Werkzeugen, darunter der Seiteninhalt in Karten und Kacheln. Das Layout ist für schmale Mobilgeräte (ab rund 390 Pixel Breite) ebenso ausgelegt wie für große Bildschirme — Inhalte ordnen sich dabei um, statt nur verkleinert zu werden. Optik, Typografie und Bildsprache sind mit der Geschäftsführung abgestimmt und laut Vorrangregel für das Produkt verbindlich; sie werden eigenständig in `design-system.md` dokumentiert. | Produkt — das Gestaltungsraster ist die verbindliche Vorlage für die reale Oberfläche. |
| 00.05 | Querschnittsfunktionen (Suchen, Filtern, Sortieren, Blättern, Leerzustände, Fehlermeldungen) | Filtern und Sortieren treten überall dort auf, wo Listen lang werden können — etwa als Filter-und-Sortier-Dialog in der Belegung, als Stufen- und Sterne-Filter im Fall-Board oder als Kategorie-Reiter im Netzwerk; eine übergreifende Volltextsuche über alle Datensätze zeigt der Prototyp dagegen nicht. Leere Listen werden nie kommentarlos weggelassen, sondern durch einen erklärenden Satz ersetzt (z. B. „Noch keine aktiven Zuweiser in dieser Kategorie" oder „Kein Fall passt zu diesem Filter"). Lange Inhalte blenden sich über „Weitere …"-Aufklapper nach und nach ein; ist ein angebundener Dienst (z. B. die KI-Anbindung) nicht erreichbar, blendet die Oberfläche sichtbar auf einen Ersatzzustand um, statt kommentarlos nichts zu tun. | Produkt — Bemerkung: eine echte Volltextsuche über Listen zeigt der Prototyp nicht, siehe Offene Punkte. |

## Datenobjekte
Dieses Kapitel beschreibt keine einzelne Entität, sondern den Rahmen für alle: Anfrage,
Fall, Person/Patient, Zuweiser, Belegung, Aufgabe, Nachricht und Anlass. Jede dieser
Entitäten wird im Prototyp als eigene Liste geführt und über Kennungen (z. B. Fall →
Person, Anfrage → Fall) verknüpft. Der vollständige Feldkatalog gehört nicht in dieses
Kapitel, sondern in `datenmodell.md`; Gestaltungsvorgaben (Farben, Typografie, Raster)
gehören in `design-system.md`.

## Offene Punkte für Trinidat
1. Projektsetup, Umgebungen (Entwicklung/Test/Produktion) und Deployment sind im Prototyp
   nicht vorhanden (eine einzelne statische Datei) — dafür gibt der Prototyp keine
   technische Vorgabe.
2. Echte Benutzerverwaltung mit Login und Rechteprüfung fehlt vollständig (nur ein
   clientseitiger Rollen-Umschalter ohne Absicherung) — Kontenmodell und Rechtevergabe sind
   von Grund auf zu konzipieren.
3. Der Prototyp hält Daten im Browser des Nutzers (siehe 01.03) statt in einer echten
   Datenbank — die technische Datenhaltung im Produkt ist Trinidats Entscheidung,
   `datenmodell.md` liefert nur die fachliche Struktur.
4. Der Umfang produktionsreifer Fehlermeldungen (Wortlaut, Sprache, Wiederherstellbarkeit)
   ist im Prototyp nur exemplarisch gezeigt und muss für den Produktivbetrieb festgelegt
   werden.

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
