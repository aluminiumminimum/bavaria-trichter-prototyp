# Kapitel 15 · Delta zur Angebotsgrundlage

Das Angebot von TriniDat vom 04.08.2026 basiert auf der Konzeptpräsentation vom Juli
2026. Der Prototyp hat sich seither weiterentwickelt: Es sind Ansichten und ein
grundlegender Design-Wechsel hinzugekommen, die zum Zeitpunkt der Angebotserstellung
noch nicht existierten. **Jeder Punkt in diesem Kapitel ist nicht Teil des Angebots
vom 04.08. und wird, falls gewünscht, separat beauftragt.** Ziel dieses Kapitels ist
Transparenz vor der Umsetzung, nicht eine automatische Erweiterung des Auftrags.

## Belegungs-Reiter

Im Bereich „In Reha" ist ein zusätzlicher Reiter „Belegung" entstanden, der über die
im Angebot beschriebene Patientenkarte hinausgeht. Er zeigt eine Stationsübersicht
über alle Stationen der Klinik (nicht nur die vom Concierge-Produkt bedienten), mit
Soll-Bettenzahl, Ist-Belegung, Auslastung in Prozent sowie Tages-Erlös-Ist gegen
Tages-Erlös-Ziel je Station. Ergänzend gibt es einen Freiwerde-Kalender, der anzeigt,
welches Bett wann voraussichtlich frei wird, sortiert nach Dringlichkeit, sowie die
Möglichkeit, Bettenzahl und Tagesziel je Station händisch nachzutragen, wenn diese
Werte nicht aus einer Datenquelle vorliegen. Jede Patientenzeile lässt sich mit einer
Fünf-Sterne-Priorität und einer Freitext-Notiz versehen. Der auffälligste Teil ist der
Stationsblatt-Import: Der Reiter kann eine Excel- (.xlsx) oder CSV-Datei aus dem
Klinik-System direkt im Browser einlesen und daraus die Belegungszahlen ableiten,
ohne dass die Datei einen Server verlässt oder eine externe Bibliothek zum Einsatz
kommt — die Datei wird ausschließlich im Browser-Tab verarbeitet. Ob und in welcher
Form eine solche Import-Funktion im Produkt sinnvoll ist (feste Schnittstelle zum
Kliniksystem statt manuellem Datei-Upload), ist eine offene Entscheidung für Trinidat.

## Call-AI-Ansicht

Zusätzlich zur Navigation aus dem Angebot ist eine eigene Ansicht „Call AI"
entstanden, die einen Telefon-Assistenten für eingehende Anrufe simuliert: eine
Warteliste mit Rückrufen, ein simulierter Anrufverlauf mit den Phasen Wählen,
Klingeln, Ansage/Anrufbeantworter, Gespräch und Nachbereitung, eine Live-Mitschrift
mit vom Assistenten erkannten Feldvorschlägen sowie eine ausdrückliche
Einwilligungsabfrage, bevor mitgeschrieben wird. Diese Ansicht demonstriert ein
Zielbild (Spracherkennung auf einem Server im Haus der Klinik, keine Cloud-Verarbeitung
des Tons), ist im Prototyp aber vollständig als geskriptetes Demo-Szenario umgesetzt,
nicht als echte Telefonie-Anbindung. Sie ist deshalb ohnehin nicht Teil des
regulären Angebots: Position 13.03 sieht für Telefonie ausdrücklich nur Andockpunkte
zu Fremdlösungen vor („Anruf auslösen", „Akte öffnen"), keine eigene Anruf- oder
Spracherkennungslogik. Ob die in dieser Ansicht gezeigte Idee als eigenständiges,
separat zu beauftragendes Vorhaben verfolgt wird, ist eine Entscheidung der
Geschäftsführung, kein Bestandteil dieses Dossiers.

## C1-Design-Umstellung

Die Konzeptpräsentation, auf der das Angebot vom 04.08. beruht, zeigte noch die
ältere Optik des Prototyps (ein grünerer Farbton, andere Etiketten-Details). Am
24.08.2026 hat die Geschäftsführung eine neue Palette namens „C1 · Petrol & Sand"
für den Prototyp freigegeben; sie ist heute durchgängig umgesetzt. Das betrifft
unmittelbar Position 00.04 (Gestaltungsraster und Seitenaufbau): Der dort mutmaßlich
hinterlegte Folien-Verweis auf die Juli-Optik ist veraltet. Für den Nachbau gilt
ausschließlich design-system.md in diesem Dossier — Farbwerte, Typografie,
Grundformen und Kontrastregeln sind dort vollständig und verbindlich beschrieben.
Am Umfang und den Positionsnummern des Angebots ändert die Umstellung nichts, an der
zu Grunde liegenden Optik hingegen deutlich; Trinidat sollte deshalb design-system.md
statt der Angebotsfolien als Referenz verwenden, sobald mit der Gestaltung
gearbeitet wird.

## Konzept-Ansicht

Die Navigation enthält einen Bereich „Konzept" mit den Unterreitern „Idee", „Matrix"
und „SOPs". Er zeigt intern verwendetes Präsentations- und Pitch-Material (die
zugrunde liegende Produktidee, eine Positionierungs-Matrix, Standard-Arbeitsabläufe)
in derselben Optik wie der übrige Prototyp. Diese Ansicht ist kein Fachmodul für den
Klinikalltag, sondern Kontext- und Verkaufsmaterial, das in den Prototyp
eingebettet wurde, damit es sich im selben Pitch zeigen lässt wie das Produkt selbst.
Sie ist deshalb kein originärer Bestandteil des Datenmodells oder der übrigen
Kapitel dieses Dossiers und muss beim Nachbau nicht abgebildet werden. Dies sollte
vor Beauftragung ausdrücklich mit der Geschäftsführung bestätigt werden, statt es
stillschweigend wegzulassen oder stillschweigend mit einzupreisen.

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
