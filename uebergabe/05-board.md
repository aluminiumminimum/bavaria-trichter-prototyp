# Kapitel 05 · Fälle · Board

**Ansicht im Prototyp:** Seitenleiste → Fälle → Reiter „Board"
· [Live-Ansicht](https://aluminiumminimum.github.io/bavaria-trichter-prototyp/)

## Zweck
Das Board ist die Arbeitsübersicht der Koordination über alle laufenden Fälle — von der ersten
Kontaktaufnahme bis zur Aufnahme im Haus. Es beantwortet auf einen Blick, wie viele Fälle in
welcher Bearbeitungsstufe stehen, welche davon Fristen reißen, und macht mit einem Klick aus einer
freigegebenen Anfrage einen bearbeitbaren Fall. Ohne das Board gäbe es keine gemeinsame,
nach Dringlichkeit sortierte Sicht auf den Fall-Bestand — jede Mitarbeiterin müsste ihre eigene
Liste führen.

## Funktionen
| Pos. | Funktion | Verhalten (2–4 Sätze) | Einordnung |
|---|---|---|---|
| 05.01 | Fünf Zonen mit Zählern | Das Board gliedert alle Fälle in fünf Bereiche: drei Bearbeitungsstufen („Neu & kontaktiert", „In Klärung", „Aufnahme geplant"), eine Zone „Im Haus" für bereits aufgenommene, noch nicht entlassene Patienten, und eine Zone „Abgeschlossen" für Entlassene, Verlorene und Archivierte. Jede Zone zeigt in der Kopfzeile die Anzahl der enthaltenen Fälle als Zähler. | Produkt |
| 05.02 | Stufenband als Filter | Ein Klick auf den Kopf einer der drei Bearbeitungsstufen blendet das Board auf ausschließlich diese Stufe; ein zusätzlicher Schalter („Stockende Fälle") filtert quer über alle Stufen auf Fälle mit überfälliger Frist oder blockierter Kostenklärung. Beide Filter schließen sich gegenseitig aus, ein „‹ Alle Fälle"-Knopf setzt zurück. | Produkt |
| 05.03 | Fallkarte | Jede Karte zeigt Initialen-Avatar, Namen (und Alter, sofern nicht bereits im Namen enthalten), Fachachsen-Pille und Kostenträger-Pille sowie eine Metazeile mit anmeldender Quelle, zuständiger Person und aktueller Aufgabe. | Produkt |
| 05.04 | Fortschrittsanzeige | Ein schmaler Balken unter der Kartenmeta zeigt den Bearbeitungsfortschritt als Anteil der durchlaufenen Statusstufen an der Gesamtzahl der Stufen — mit einer Mindestbreite, damit auch ein ganz frischer Fall sichtbar bleibt. | Produkt |
| 05.05 | Fristanzeige/Warnung | Ein farbiger Punkt oben rechts an der Karte sowie ein linker Akzentstreifen zeigen, ob eine gesetzte Frist eingehalten, knapp oder überschritten ist; zusätzlich blendet das Board ein Kürzel ein, sobald das interne Erstkontakt-Versprechen (Beispiel, synthetisch: Rückmeldung binnen 2–24 Std. je Dringlichkeit) reißt oder knapp wird. Die volle Fristlogik steht in geschaeftsregeln.md. | Produkt |
| 05.06 | Sterne-/Produktlinien-Marke | Karten werden nach der Lead-Sterne-Bewertung der zugehörigen Person sortiert (höchste zuerst); Fälle der Premium-Linie tragen zusätzlich eine „★ SalutoCare"-Kennzeichnung. | Produkt |
| 05.07 | „Übernehmen" | Für eine Bearbeitungsgruppe freigegebene, aber noch niemandem zugeordnete Anfragen erscheinen als eigene Pool-Karten in der Spalte „Neu"; ein Klick auf „Übernehmen ›" wandelt die Anfrage in einen bearbeitbaren Fall um und entfernt sie aus dem Pool (Übergabepunkt zu Kapitel 03/04, Eingang). | Produkt |
| 05.08 | Zone „Im Haus" (Tag X von Y) | Aufgenommene, noch nicht entlassene Patienten erscheinen in einer eigenen Spalte mit Fortschrittsbalken „Tag X von Y" (Ist-/Plan-Verweildauer), Zimmerangabe und geplantem Entlassdatum; sobald das Aufnahme-Assessment abgeschlossen ist, zusätzlich Barthel-/FIM-Werte im Vergleich Aufnahme → aktuell. | Produkt |
| 05.09 | Zone „Abgeschlossen" | Sammelt Entlassene, Fälle mit Status „Verloren" und archivierte Fälle in einer nur lesenden Übersicht; sie zählt nicht zu den drei Bearbeitungsstufen und beeinflusst keine Fristen mehr. | Produkt |
| 05.10 | Ungelesen-Markierung | Trifft für einen Fall eine neue Antwort ein, während dessen Fallakte gerade nicht geöffnet ist, erscheint auf der Karte der Hinweis „✉ Antwort eingetroffen", bis die Akte geöffnet wird. | Produkt |
| 05.11 | Karte öffnen (Filterzustand bleibt) | Ein Klick auf eine Karte öffnet die Fallakte (Kapitel 06). Der zuletzt gewählte Stufen- bzw. Stockend-Filter bleibt als eigener Zustand bestehen und ist beim Rücksprung zum Board weiterhin aktiv. | Produkt |

## Datenobjekte
- **Fall** (zentrales Objekt, siehe datenmodell.md) — Status, Fachachse, Kostenträger, Frist,
  zuständige Person, Klärungsfeld-Fortschritt, Ablage-Zustand: hier gelesen für Darstellung und
  Sortierung, bei „Übernehmen" neu angelegt.
- **Anfrage** — freigegebene, noch nicht übernommene Einträge aus dem Eingang (Kapitel 03/04):
  gelesen für die Pool-Karten in „Neu", beim Übernehmen in einen Fall überführt.
- **Person** — Sterne-Bewertung und Stammdaten: gelesen für Kartensortierung und
  Produktlinien-Kennzeichnung.
- **Reha-Aufenthalt** (Kapitel 07) — Verweildauer, Zimmer, Barthel-/FIM-Werte: gelesen für die
  Zone „Im Haus".

## Offene Punkte für Trinidat
- Die Statusliste und ihre Zuordnung zu den drei Board-Stufen ist im Prototyp fest verdrahtet —
  klären, ob sie im Produkt konfigurierbar sein soll (z. B. abweichende Stufen je Fachachse).
- Die Kartensortierung berücksichtigt nur die Sterne-Bewertung, keine Fristdringlichkeit — klären,
  ob bei gleicher Bewertung nach Frist sortiert werden soll.
- Für die Zone „Im Haus" gibt es keine harte Verknüpfung zu einem echten Zimmerbelegungssystem;
  klären, ob eine verbindliche Anbindung an das Belegungsmodul (Kapitel 07) vorgesehen ist.

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
