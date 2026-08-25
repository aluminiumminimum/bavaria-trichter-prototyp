# Übergabe-Dossier Klinik Bavaria · Concierge OS

Dieses Dossier beschreibt den Nachbau des Prototyps „Klinik Bavaria · Concierge OS"
als echte, produktiv einsetzbare Software durch die TriniDat Software-Entwicklung
GmbH. Es ersetzt das ursprüngliche Detailkonzept aus der Konzeptpräsentation vom
Juli 2026 als Arbeitsgrundlage. Die Kapitelnummern der einzelnen Dateien entsprechen
den Positionsnummern der Trinidat-Aufwandsabschätzung vom 04.08.2026, damit
Dossier-Kapitel und Angebotspositionen jederzeit eindeutig aufeinander verweisbar
sind.

## Vorrangregel

Für Optik und Layout gilt: **der Prototyp ist verbindlich.** Er ist live erreichbar
unter https://aluminiumminimum.github.io/bavaria-trichter-prototyp/ . Für Verhalten,
Geschäftsregeln und Daten gilt: **dieses Dossier ist verbindlich.**

Begründung: Der Prototyp enthält bewusste Demo-Kompromisse (Zeitraffer, erfundene
Beispieldaten, geskriptete Abläufe an einzelnen Stellen), die im Produkt nicht
übernommen werden dürfen — deshalb regelt bei Verhalten und Daten das Dossier, nicht
der Code. Die Optik hingegen ist mit der Geschäftsführung abgestimmt und keine
Interpretationssache; hier ist der Prototyp selbst die Referenz.

## Leseanleitung

1. Zuerst diese README lesen.
2. Danach datenmodell.md und design-system.md — sie legen die Begriffe und die
   verbindliche Gestaltung fest, auf die alle übrigen Kapitel aufbauen.
3. Für das Testprojekt (20 Stunden, siehe Aufwandsabschätzung) direkt weiter zu
   Kapitel 03 (Fälle · Anfragen) und Kapitel 04 (Anfrage-Detailfenster) — diese
   beiden Kapitel sind in Abnahmetiefe ausgearbeitet.
4. Die übrigen Kapitel (00–02, 05–13) je nach Projektetappe lesen, in der Reihenfolge,
   in der die entsprechenden Bereiche beauftragt und umgesetzt werden.
5. 15-delta.md vor jeder Diskussion über Leistungsumfang lesen — dort steht, was der
   Prototyp zusätzlich zur Angebotsgrundlage vom 04.08. kann und ausdrücklich nicht
   automatisch mitbeauftragt ist.

## Dokumentliste

| Datei | Inhalt | Tiefe |
|---|---|---|
| README.md | Einstieg, Vorrangregel, Leseanleitung, Dokumentliste | — |
| 00-grundlagen.md | Projektsetup, Datenmodell-Überblick, Benutzerverwaltung/Rollen, Gestaltungsraster, Querschnittsfunktionen | Steckbrief |
| 01-rahmen-navigation.md | Seitenleiste, Rollenumschalter, Kopfzeile, KI-Sperrschalter, „Neue Anfrage", Zuweiserportal-Wechsel, Hilfe | Steckbrief |
| 02-heute.md | Cockpit der Leitung: Kanalliste, Trichtergrafik, Kennzahlen, Anlässe, Belegungs-Forecast | Steckbrief |
| 03-eingang.md | Seite „Fälle · Anfragen" (Eingang) — Testprojekt | Abnahmetiefe |
| 04-anfrage-detail.md | Anfrage-Detailfenster inkl. KI-Analyse-Kontrakt — Testprojekt | Abnahmetiefe |
| 05-board.md | Seite „Fälle · Board" | Steckbrief |
| 06-fallakte.md | Seite „Fallakte" (Prozessleiste, Statusautomatik, Wiedervorlage) | Steckbrief |
| 07-in-reha.md | Seite „In Reha" (Patientenkarten, Kennzahlen, Assessments, Nachsorge-Vorplanung) | Steckbrief |
| 08-netzwerk-zuweiser.md | Netzwerk · Zuweiser (Anlässe, Stammdaten, Ranking) | Steckbrief |
| 09-netzwerk-patienten.md | Netzwerk · Patienten (Kartei, Einwilligung, Anlassregeln) | Steckbrief |
| 10-auswertung.md | Auswertung (Aufnahmequote, Reaktionszeiten, Engpässe) | Steckbrief |
| 11-mein-tag.md | „Mein Tag" (Koordinationsansicht, Pull-Logik) | Steckbrief |
| 12-zuweiserportal.md | Zuweiserportal (Mandantentrennung, Kennzahlenband, Abschlusspaket) | Steckbrief |
| 13-technik.md | Technische Anforderungen & Schnittstellen (REST, Webhooks, KI-Anbindung, Rollen, Hosting) | Steckbrief |
| 15-delta.md | Delta zur Angebotsgrundlage vom 04.08. — was zusätzlich existiert und separat zu beauftragen ist | — |
| datenmodell.md | Alle Entitäten (Anfrage, Fall, Patient, Zuweiser, Belegung, Aufgabe, Nachricht, Anlass) mit Feldkatalog | — |
| geschaeftsregeln.md | Fachliche Regeln, die kapitelübergreifend gelten | — |
| glossar.md | Fachbegriffe und Abkürzungen, einmal erklärt | — |
| design-system.md | Verbindliche CI: Farben, Typografie, Grundformen, Kontrastregeln, Responsivität | — |
| quellen/aufwandsschaetzung-positionen.md | Positionsliste der Trinidat-Aufwandsabschätzung (Gliederung, ohne Stunden/Preise) | — |

Kapitel 14 (Test, Einführung & Projektleitung) ist Teil der Aufwandsabschätzung,
wird aber nicht als eigenes fachliches Kapitel geführt, da es keine Produktfunktion,
sondern reine Projektorganisation beschreibt.

## Stand und Pflege

Das Dossier lebt im selben Repository wie der Prototyp und wird parallel zu dessen
Weiterentwicklung gepflegt. Jede Datei trägt am Ende eine Stand-Zeile mit Datum und
dem zugehörigen Prototyp-Commit. Kapitel 03 und 04 sind in Abnahmetiefe fertig, weil
sie das Testprojekt der ersten 20 Stunden abdecken; die übrigen Kapitel folgen je
Projektetappe in der oben genannten Reihenfolge. Screenshots der einzelnen Ansichten
folgen als Ergänzung zu den Steckbriefen, sind aber kein Ersatz für den Blick auf den
Live-Prototyp gemäß Vorrangregel.

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
