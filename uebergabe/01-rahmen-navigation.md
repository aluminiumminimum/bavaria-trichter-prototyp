# Kapitel 01 · Rahmen & Navigation

**Ansicht im Prototyp:** Seitenleiste (Desktop) bzw. Kopfzeile bei aktiver Tableiste
(Mobil) — auf jeder Seite sichtbar · [Live-Ansicht](https://aluminiumminimum.github.io/bavaria-trichter-prototyp/)

## Zweck
Rahmen und Navigation bilden die Chrome um jede Fachseite herum: Von hier aus wechselt
die Leitung zwischen den Bereichen, sieht auf einen Blick den Status der KI-Anbindung und
legt neue Anfragen manuell an. Ohne diesen Rahmen gäbe es keinen konsistenten Einstieg —
jede Seite müsste ihre eigene Navigation und Kopfzeile mitbringen, und Orientierung
zwischen Heute, Fällen, Belegung und Netzwerk ginge verloren. Der Rahmen selbst trägt
keine Fachlogik, sondern nur Wege dorthin und ein paar Werkzeuge, die auf jeder Seite
gleich funktionieren sollen.

## Funktionen
| Pos. | Funktion | Verhalten (2–4 Sätze) | Einordnung |
|---|---|---|---|
| 01.01 | Seitenleiste (Heute, Fälle, In Reha, Netzwerk, Auswertung, Konzept) | Auf großen Bildschirmen (ab ca. 1024 Pixel) steht links eine durchgehend sichtbare Seitenleiste mit sechs Hauptbereichen: Heute, Fälle, In Reha, Netzwerk, Auswertung und Konzept (zusätzlich ein Knopf zum Anruf-Assistenten „Call AI", der keinem eigenen Punkt dieser Liste zugeordnet ist). Auf schmalen Bildschirmen übernimmt eine Tableiste am unteren Bildschirmrand dieselbe Aufgabe. Ein Klick markiert den aktiven Bereich, wechselt Titel und Untertitel der Kopfzeile und merkt sich die zuletzt gewählte Unteransicht (z. B. Board statt Anfragen) auch über einen Seiten-Neuladen hinweg (Adresszeile). | Produkt. |
| 01.02 | Rollenumschalter Leitung/Koordination | Zwei Knöpfe („Leitung"/„Koordination") wechseln zwischen der vollständigen Führungsansicht mit allen Kapiteln und einer stark reduzierten, persönlichen Tagesansicht für Mitarbeitende im Tagesgeschäft (Kapitel 11); im Koordinations-Modus verschwindet die gesamte Leitungs-Chrome (Seitenleiste, Kopfzeile, Tableiste), nur die Aufgabenliste bleibt sichtbar. Der Umschalter existiert doppelt — fest in der Desktop-Seitenleiste und zusätzlich mobil im Begrüßungsblock der Heute-Seite. Der Wechsel selbst ist rein optisch und prüft keine Berechtigung; jede Person mit Zugriff auf den Prototyp kann beide Perspektiven einsehen. | Produkt — Bemerkung: ohne echte Berechtigungsprüfung dahinter, siehe 00.03 und Offene Punkte. |
| 01.03 | Kopfzeile (Titel, Datum, Zurücksetzen, Hilfe) | Die Kopfzeile zeigt links Titel und Untertitel des aktuellen Bereichs, rechts eine Werkzeugleiste: heutiges Datum, KI-Statusanzeige (01.04), einen Fragezeichen-Knopf für die Einführungshilfe (01.07), den Schnellzugriff „+ Neue Anfrage" (01.05) und einen „↺ Zurücksetzen"-Knopf. Zurücksetzen fragt vor der Ausführung nach („Alle Test-Eingaben gehen verloren") und löscht danach den gesamten im Browser gespeicherten Testzustand, worauf die Seite neu lädt und wieder mit den ursprünglichen Beispieldaten startet. | Produkt für Titel/Datum/Hilfe-Zugriff — Ausnahme „Zurücksetzen": reine Prototyp-Mechanik, im Produkt ersetzt durch echte Datenhaltung ohne Rücksetzfunktion für Fachdaten. |
| 01.04 | Statusanzeige „KI gesperrt" mit Protokollierung | Ein Punkt mit Text in der Kopfzeile zeigt einen von drei Zuständen: „KI aktiv" (klickbar, öffnet den KI-Chat), „KI gesperrt" (Zugangscode fehlt, ein Klick fragt danach) oder „KI offline" (Anbindung nicht erreichbar — alle KI-Funktionen laufen dann mit vorbereiteten Beispiel-Antworten weiter, siehe Kapitel 04). Der Zustand wird laufend geprüft und aktualisiert sich automatisch beim Seitenwechsel. Der Prototyp zeigt dabei nur den aktuellen Zustand — ein Verlauf, wer wann einen Zugangscode eingegeben oder eine Sperre umgangen hat, wird nicht geführt. | Produkt — Bemerkung: die im Positionstitel genannte Protokollierung ist im Prototyp nicht sichtbar, siehe Offene Punkte. |
| 01.05 | „+ Neue Anfrage" (Telefon/Vor-Ort-Erfassung) | Ein Formular für die manuelle Erfassung einer Anfrage, die nicht automatisch über einen Kanal eingegangen ist (Telefonnotiz, persönliches Gespräch vor Ort). Erfasst werden Name und Alter des Patienten, wer sich meldet, Eingangskanal und genaue Quelle, medizinische Achse, Kostenträger, verantwortliche Person, Frist zur Erstreaktion, ein Freitext-Anliegen und der Einwilligungsstatus zur Kontaktaufnahme; Eintippen im Freitext erkennt live mögliche Signale (z. B. Kostenträger) und schlägt sie als Chip zur Übernahme vor. Nach dem Absenden landet die Anfrage sofort als neuer Fall im Status „Neu" auf dem Fall-Board — außer Name ist nichts verpflichtend, es gibt keine Dublettenprüfung. | Produkt. |
| 01.06 | Wechsel ins Zuweiserportal | Aus der Seitenleiste (Desktop) sowie über eigene Einstiegskarten im Bereich Netzwerk → Zuweiser (mobiler Zugang) öffnet sich das Zuweiserportal als eigenständige Vollbild-Ansicht über der Klinik-Oberfläche — mit eigener Kopfzeile, eigenem „Zurück zur Klinik-Ansicht"-Knopf und ohne die sonstige Navigation. Im Prototyp startet der Wechsel immer für denselben Beispiel-Zuweiser; im echten Betrieb entscheidet die Anmeldung des jeweiligen Zuweisers, welche Daten er sieht. Das Portal selbst — Inhalte, Mandantentrennung, Rechtevergabe — ist Gegenstand von Kapitel 12. | Produkt — Bemerkung: der feste Beispiel-Zuweiser im Wechsel ist Demo-Vereinfachung, echte Anmeldelogik siehe 12.02/12.03. |
| 01.07 | Hilfe-/Einführungspunkte | Ein Fragezeichen-Knopf (Desktop-Kopfzeile) bzw. eine schwebende Schaltfläche (Mobil) öffnet ein Einführungsfenster mit einer kurzen, schrittweisen Anleitung, wie der Prototyp zu testen ist (welche Beispielfälle reagieren, was ausprobiert werden soll), sowie einem Link zum Senden von Feedback per E-Mail. Das Fenster öffnet sich zusätzlich automatisch beim ersten Besuch und merkt sich im Browser, dass es schon gesehen wurde. Es enthält auch den Hinweis, dass es sich um einen Prototyp mit erfundenen Daten handelt und der Zurücksetzen-Knopf (01.03) jederzeit zum Ausgangszustand zurückführt. | Demo (behalten: der Inhalt richtet sich an Tester des Prototyps — ein Produkt braucht eigene, produktbezogene Hilfeinhalte statt dieser Testanleitung, die Funktionsstelle „Hilfe" selbst bleibt aber sinnvoll). |

## Datenobjekte
Der Rahmen selbst liest überwiegend nur Zähler aus den Fachlisten (z. B. Anzahl neuer
Anfragen für Navigations-Badges, Segmentzähler je Bereich), siehe `datenmodell.md`. Eine
Ausnahme ist „+ Neue Anfrage" (01.05): Sie legt einen neuen Datensatz der Entität
Fall/Anfrage an. Der KI-Zugangscode liegt technisch im Browser und ist kein Teil des
fachlichen Datenmodells.

## Offene Punkte für Trinidat
1. Hinter dem Rollenumschalter (01.02) fehlt jede echte Berechtigungsprüfung — muss
   zusammen mit der Benutzerverwaltung (00.03) definiert werden.
2. Ein Zugriffsprotokoll für den KI-Sperrstatus (wer hat wann entsperrt, siehe 01.04) ist
   im Prototyp nicht vorhanden, wird aber im Positionstitel gefordert — Umfang mit der
   Fachseite festlegen.
3. Validierungsregeln für „+ Neue Anfrage" (01.05) — Pflichtfelder über den Namen hinaus,
   Dublettenprüfung — sind im Prototyp minimal und für den Produktivbetrieb offen.
4. Die Rechte-/Mandantenlogik beim Wechsel ins Zuweiserportal (01.06, welcher Zuweiser
   sieht was) ist im Prototyp durch einen festen Beispielnamen ersetzt; die echte
   Anmeldelogik ist Gegenstand von Kapitel 12.

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
