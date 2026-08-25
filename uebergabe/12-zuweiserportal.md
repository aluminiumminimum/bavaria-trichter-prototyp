# Kapitel 12 · Zuweiserportal

**Ansicht im Prototyp:** Seitenleiste (Desktop) → Knopf „Zuweiserportal" · oder Netzwerk →
Zuweiser → Karte „Portal-Ansicht des Zuweisers" (öffnet als Overlay über der Leitungsansicht,
kein eigener Navigationspunkt)
· [Live-Ansicht](https://aluminiumminimum.github.io/bavaria-trichter-prototyp/)

## Zweck
Das Zuweiserportal ist die Perspektive des einweisenden Krankenhauses oder der Praxis auf die
Zusammenarbeit mit der Klinik: freie Kapazitäten sehen, einen Patienten anmelden, den
Behandlungsstand der eigenen Patienten während der Reha einsehen und nach Entlassung die
Abschlussdokumente abrufen. Ohne dieses Modul müssten Zuweiser für jede Information anrufen
oder faxen — die Klinik verlöre den direkten, schnellen Kanal, der Vertrauen und Fallzahl bei
Partnerhäusern trägt.

## Funktionen
| Pos. | Funktion | Verhalten (2–4 Sätze) | Einordnung |
|---|---|---|---|
| 12.01 | Portalgerüst | Overlay mit Kopfbereich (Begrüßung, Institutionsname, Hintergrundbild), drei Reitern für die Phasen der Zusammenarbeit und dem jeweiligen Inhalt darunter. Schließbar per Kreuz oder Escape-Taste. | Produkt |
| 12.02 | Anmeldung/Rechtevergabe | Im Prototyp gibt es **keinen Login**: Das Portal wird direkt aus der internen Leitungsansicht heraus mit einem fest verdrahteten Zuweiser-Namen geöffnet — keine Authentifizierung, kein Passwort, keine unterschiedlichen Nutzerkonten oder Rechte je Zuweiser-Mitarbeiter. | Demo (entfällt) — im Produkt zwingend durch echten Login mit Rechtevergabe zu ersetzen |
| 12.03 | Mandantentrennung | **Kritischste Anforderung dieses Kapitels:** Jedes Partnerhaus darf ausschließlich seine eigenen angemeldeten Patienten, eigenen Kennzahlen und eigene Fallliste sehen. Im Prototyp ist das nur angedeutet: Einzig der Reiter „Behandlungs-Einblick" (Pos. 12.11) filtert Patientinnen und Patienten tatsächlich nach dem übergebenen Zuweiser-Namen; Kennzahlenband, Aktuelles, freie Plätze, Ansprechpartner, Fallliste und Abschlusspaket zeigen unabhängig vom Namen dieselben statischen Demo-Daten für jeden aufgerufenen Zuweiser. | Demo (entfällt) — im Produkt harte Trennung auf Datenbankebene mit serverseitiger Berechtigungsprüfung bei jedem Zugriff, nicht nur ein UI-Filter |
| 12.04 | Begrüßungsblock | Persönliche Anrede mit dem aus den Zuweiser-Stammdaten abgeleiteten Ansprechpartner-Namen, Institutionsname und einem Hero-Bild. | Produkt |
| 12.05 | Reiter Vor/In/Nach der Reha | Tab-Navigation entlang der drei Phasen der Zusammenarbeit (entspricht der B2B-Zeile der Matrix im Konzept-Kapitel): wechselt zwischen Anmeldung/freien Plätzen, Behandlungs-Einblick und Abschlusspaket. | Produkt |
| 12.06 | Kennzahlenband | Kachelreihe mit hochzählender Animation: Fallzahl im laufenden Jahr, durchschnittliche Rückmeldezeit, Aufnahmequote in Prozent, Partnerschaft seit Jahreszahl — im Prototyp feste Demo-Zahlen, unabhängig vom tatsächlich aufgerufenen Zuweiser. | Demo (Zahlen entfallen) — Anzeigeform behalten, im Produkt aus echten, mandantengefilterten Fallzahlen berechnet |
| 12.07 | „Aktuelles" | Liste kurzer Neuigkeiten der Klinik an den Zuweiser (Datum, Titel, Kurztext) — im Prototyp statischer Inhalt, für jeden Zuweiser identisch. | Demo (entfällt) — im Produkt braucht die Klinik eine Pflegeoberfläche, ob generisch oder je Zuweiser unterschiedlich |
| 12.08 | „Freie Plätze" (KW × Fachbereich) | Tabelle mit Kalenderwochen als Spalten und Fachbereichen als Zeilen, Zellwert = Anzahl freier Plätze mit Ampel-Farbe (frei/knapp/belegt). Ein Klick auf eine freie Zelle springt zum Anmeldeformular (Pos. 12.09) und trägt Fachbereich und Kalenderwoche automatisch ein. Die Datenquelle ist dieselbe Belegungstabelle wie in der internen Ansicht — im Prototyp ungefiltert, jeder Zuweiser sieht dieselbe unternehmensweite Kapazität. | Produkt (Funktionsidee) — Sichtbarkeit der Gesamtkapazität für jedes Haus ist eine offene Entscheidung |
| 12.09 | Vorausgefülltes Anmeldeformular | Formular mit Patientenname, Fachbereich, Wunschtermin, Kostenträger und einer Checkbox „kommt direkt von mir" sowie einem simulierten Datei-Upload (Demo-Grenze: 2 Dateien). Absenden erzeugt lokal eine neue Zeile in „Meine angemeldeten Fälle" und zeigt eine Erfolgsmeldung — es wird nichts tatsächlich an die Klinik übertragen oder dauerhaft gespeichert. | Demo (Absenden/Speichern entfällt) — Formularaufbau und Vorbefüllung als UI-Vorbild behalten |
| 12.10 | „Ihre Ansprechpartner" (< 24 h) | Kartenliste der Klinik-Ansprechpartner mit Name, Rolle, Telefon, Mail und einem Rückmeldeversprechen-Hinweis „< 24 h" — im Prototyp eine statische Liste, für jeden Zuweiser gleich. | Demo (behalten als Anzeigeform) — im Produkt eventuell je nach zugeordnetem Case-Team unterschiedlich |
| 12.11 | Behandlungs-Einblick | Ärztliche Sicht auf die eigenen Patientinnen und Patienten des Zuweisers während der Reha, bewusst ohne interne Steuerungskennzahlen wie Deckungsbeitrag: Kurzbericht, Verlaufseinträge, Laborwerte, Barthel-/FIM-Fortschrittsringe sowie ein Knopf für eine Rücksprache mit dem Behandlungsteam. Dies ist die **einzige** Stelle im Portal, die im Prototyp tatsächlich nach dem übergebenen Zuweiser-Namen filtert — das Prototyp-Vorbild für die Mandantentrennung aus Pos. 12.03. | Produkt (Filterlogik als Vorbild), serverseitiger Zugriffsschutz fehlt |
| 12.12 | Abschlusspaket (Arztbrief, Kurzbericht, Medikationsplan) | Nach Entlassung zeigt der Reiter „Nach der Reha" das Behandlungsergebnis (z. B. Barthel-Verlauf) sowie drei Dokument-Knöpfe, die ein synthetisches, dokumentartig gestaltetes Fenster öffnen: Arztbrief mit Anrede, Diagnose, Epikrise und Empfehlungen; Kurzbericht mit Tabellenvergleich Aufnahme/Entlassung; Medikationsplan. Dazu eine QR-Code-Attrappe „aufs Handy" und ein Rücksprache-Link. Im Prototyp ist das für genau einen fest hinterlegten Demo-Patienten verdrahtet, unabhängig vom aufgerufenen Zuweiser. | Demo (fester Demo-Patient entfällt) — Layout der Dokumentenansicht behalten, im Produkt echte generierte Dokumente je entlassenem Patienten des jeweiligen Zuweisers |

## Datenobjekte
Das Portal liest Zuweiser (Name, Typ, Ansprechpartner), Person/Patient (insbesondere das Feld
für den zugeordneten Zuweiser, das als einziger Mandanten-Anker dient) und Belegung; es
schreibt im Prototyp nur in eine nicht persistierte, lokale Demo-Liste angemeldeter Fälle.
Kennzahlenband, Aktuelles, Ansprechpartner-Liste und das Abschlussdokument sind eigene,
statische Demo-Datensätze ohne echte Verknüpfung zu einem Fall. Details siehe datenmodell.md
(Entitäten Zuweiser, Patient, Belegung).

## Offene Punkte für Trinidat
- Login und Rechtevergabe (Pos. 12.02) sowie eine echte Mandantentrennung (Pos. 12.03) fehlen
  vollständig — zu entscheiden ist, ob ein Zuweiser-Haus ein gemeinsames Konto oder mehrere
  individuelle Nutzerkonten mit eigenen Rechten erhält.
- Soll die volle unternehmensweite Belegungstabelle (Pos. 12.08) für jeden Zuweiser sichtbar
  sein, oder nur ein reduzierter, wettbewerbsunkritischer Ausschnitt?
- Wie werden Ansprechpartner (Pos. 12.10) und Aktuelles (Pos. 12.07) im Produkt gepflegt —
  generisch für alle Zuweiser oder individuell je Partnerhaus?

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
