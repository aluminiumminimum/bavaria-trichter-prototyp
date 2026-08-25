# Kapitel 11 · „Mein Tag" (Koordination)

**Ansicht im Prototyp:** Seitenleiste → Rollenschalter „Leitung / Koordination" → Koordination
· [Live-Ansicht](https://aluminiumminimum.github.io/bavaria-trichter-prototyp/)

## Zweck
„Mein Tag" ist das persönliche Cockpit einer einzelnen Mitarbeiterin der Patientenkoordination
— eine auf sie zugeschnittene, priorisierte Liste dessen, was heute zu tun ist, statt der
vollen Leitungsansicht mit allen Fällen aller Rollen. Ohne dieses Modul müsste jede
Mitarbeiterin selbst durch Eingang, Board und Fallakten blättern, um herauszufinden, was ihr
zugeordnet ist und was zuerst dran ist — Priorität und persönliche Zuständigkeit blieben
unsichtbar. Der Rollenschalter blendet dafür bewusst alle anderen Menüpunkte aus und verengt
die Oberfläche auf genau diese Perspektive.

## Funktionen
| Pos. | Funktion | Verhalten (2–4 Sätze) | Einordnung |
|---|---|---|---|
| 11.01 | Seitengerüst | Kopfbereich mit tageszeitabhängiger Begrüßung, Datum, Fortschrittsbalken (erledigt/gesamt der heutigen und wöchentlichen Aufgaben) und einer reinen Terminleiste (feste Tagestermine wie Morgenrunde oder Übergabe — das sind Zeitanker, keine To-Dos, sie zählen nicht zum Fortschritt). Ein Segment-Umschalter wechselt zwischen „Mein Tag" und „Protokolle" (Pos. 11.06). Der Rollenwechsel Leitung → Koordination blendet die restliche Navigation komplett aus; nur „Mein Tag" und die Fallakte bleiben erreichbar. | Produkt |
| 11.02 | „Offene Anfragen deiner Gruppe(n)" | Pool-Block zeigt alle noch unbearbeiteten Eingangs-Anfragen, gruppiert nach den Belegungs-Gruppen (z. B. Orthopädie, Neuro-Geri), denen die Koordinatorin zugeordnet ist. Anfragen aus anderen Gruppen liegen zusätzlich eingeklappt unter „Weitere Gruppen" bereit — das kleine Team darf dort aushelfen, jede freigegebene Anfrage bleibt erreichbar. Der Block erscheint nur, wenn dort tatsächlich etwas liegt. | Produkt |
| 11.03 | Poolkarte | Einzelne Karte je offener Anfrage: Kurzzusammenfassung, bei Bedarf ein Warnhinweis zur verbleibenden Reaktionszeit, die Originalnachricht ausklappbar, die Sterne-Einstufung (Priorität) und ein „Übernehmen"-Knopf. | Produkt |
| 11.04 | Pull-Logik (Übernahme sperrt) | Ein Klick auf „Übernehmen" weist die Anfrage sofort der aktuellen Koordinatorin als zuständige Person zu und entfernt sie damit aus dem gemeinsamen Pool für alle anderen — wer zuerst klickt, bekommt den Fall. Danach taucht die Anfrage unter den persönlichen Aufgaben der Koordinatorin auf (Pos. 11.05). | Produkt |
| 11.05 | „Was jetzt dran ist" | Aufgabenliste aus mehreren Quellen zusammengeführt: offene nächste Schritte eigener Fälle mit Frist, offene Kostenklärungen, fällige Wiedervorlagen abgelegter Fälle, überfällige Reha-Zwischenstände (länger als 10 Tage ohne Aktualisierung) sowie feste interne Aufgaben ohne Fallbezug. Aufgeteilt in „Jetzt" (heute fällig oder überfällig) und den Rest der Woche. Jede Karte öffnet eine geführte Arbeitskarte mit Schritt-für-Schritt-Anleitung, Formulierungs-Leitfaden und einem Pflicht-Notizfeld; der Abschluss schreibt automatisch einen Eintrag in den Fallverlauf und schaltet direkt zur nächsten offenen Aufgabe weiter. | Produkt |
| 11.06 | Protokoll-Board | Zweiter Reiter „Protokolle": listet alle aktuell in Reha befindlichen Patientinnen und Patienten mit editierbaren Feldern für Barthel-Index, FIM, Kurzbericht und weiteren Verlauf/Plan (inklusive Textbaustein-Vorschlägen und einem KI-Entwurfsknopf), jede Zeile einzeln speicherbar. Ein fälliger Zwischenstand wird farblich markiert und ist genau die Stelle, an die Pos. 11.05 bei überfälligen Zwischenständen verlinkt. | Produkt |

## Datenobjekte
„Mein Tag" liest und schreibt in die geteilten Entitäten Fall (Zuständigkeit, nächste
Aufgabe, Frist, Status, Kostenklärung, Verlaufsprotokoll, Ablage), Anfrage (Bearbeitet-Status,
Notiz, Gruppenzuordnung) und Patient/in Reha (Barthel, FIM, Kurzbericht, Verlaufsplan, Datum
des letzten Zwischenstands) — es entstehen dabei keine neuen, dauerhaften Datentypen, nur
zusätzliche Felder auf bestehenden Objekten. Details siehe datenmodell.md (Entitäten
Anfrage, Fall, Patient).

## Offene Punkte für Trinidat
- Der Erledigt-Status einzelner Aufgaben und Notizen zu internen Aufgaben ohne Fallbezug
  bestehen im Prototyp nur für die laufende Sitzung (kein Neuladen-fester Speicher) — im
  Produkt braucht es eine echte, dauerhafte Aufgabenhistorie je Mitarbeiterin.
- Die Gruppenzuordnung (Pos. 11.02) ist im Prototyp fest für eine einzelne Persona verdrahtet
  (genau zwei Gruppen). Im Produkt müssen mehrere Koordinatorinnen gleichzeitig mit ihren
  jeweils eigenen Gruppen arbeiten — inklusive korrektem Verhalten, wenn zwei Personen
  gleichzeitig dieselbe Anfrage übernehmen wollen (vgl. Kap. 13.06 Mehrbenutzerbetrieb).
- Woher kommen die statischen internen Aufgaben (z. B. Fortbildungsnachweis) im Produkt —
  aus einem eigenen Aufgabenmodul, einer HR-Schnittstelle, oder entfallen sie ganz?

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
