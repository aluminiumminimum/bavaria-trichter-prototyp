# Kapitel 08 · Netzwerk · Zuweiser

**Ansicht im Prototyp:** Seitenleiste → Netzwerk → Reiter „Zuweiser"
· [Live-Ansicht](https://aluminiumminimum.github.io/bavaria-trichter-prototyp/)

## Zweck

Die Seite verwaltet die Beziehungen zu einweisenden Kliniken, Praxen, Hausärzten und
sonstigen Partnern (im Dossier „Zuweiser" genannt), von denen Patienten an die Klinik
vermittelt werden. Sie zeigt, wie tragfähig jede Beziehung aktuell ist, und schlägt vor,
wann und wie der nächste Kontakt stattfinden sollte. Ohne dieses Modul würde die
Pflege dieser Beziehungen — Dankesanrufe, Jahresgespräche, Fortbildungseinladungen —
vom persönlichen Gedächtnis der Mitarbeitenden abhängen statt von einer
nachvollziehbaren, terminierten Regel.

## Funktionen

| Pos. | Funktion | Verhalten | Einordnung |
|---|---|---|---|
| 08.01 | Seitengerüst | Kopfzeile, darunter zwei Bereiche für Zuweiser-Kacheln (Zuweiserportal-Verweis, Newsletter-Kampagne) sowie die Reiter „Aktionen & Anlässe" (fällige Kontaktanlässe) und „Stammdaten" (Landkarte, Kategorien, Zuweiserliste). | Produkt |
| 08.02 | Unterreiter (Kategorien) | Fünf Kategorien als Filterkacheln mit laufend berechneter Anzahl: Krankenhäuser, Privatpraxen, Hausärzte, Sanitätshäuser, Premium (SalutoCare-Netzwerke und vergleichbare Sonderkanäle). Die Kategorie wird aus Name, Typ, Relevanz-Feld und Ansprechpartner des Zuweisers per Stichwortabgleich abgeleitet, nicht separat gepflegt. | Produkt |
| 08.03 | „Diese Woche" (Fälligkeitslogik) | Die fälligen Kontaktanlässe werden nach Dringlichkeit sortiert unter „Diese Woche" (akut fällig oder überfällig) und „Demnächst" gruppiert. Ein Anlass gilt als „jetzt" fällig, wenn die jeweilige Regel ihre Frist erreicht oder überschritten hat, sonst als „bald". | Produkt |
| 08.04 | Anlasskarte | Jede Karte zeigt Anlass-Symbol und -Typ (z. B. Kontaktpflege, Jahrestag, Meilenstein), Zuweisername, den vollständigen Anlasstext mit empfohlener Handlung, eine Fälligkeitsangabe („überfällig", „heute" oder „in N Tagen") und einen Knopf zum Bearbeiten. | Produkt |
| 08.05 | Anlassregel Jahrestag | Löst ein „Jahrestag der Partnerschaft" aus, sobald ein Zuweiser seit mindestens rund einem Jahr Fälle vermittelt und der Jahrestag des Partnerschaftsbeginns innerhalb von 14 Tagen liegt (davor oder danach). Vorschlag: Jahres-Kooperationsgespräch mit Chefarzt bzw. Leitung anbieten. Ein verpasster Jahrestag gilt als „jetzt" fällig, um ihn nachzuholen. | Produkt |
| 08.06 | Anlassregel Fortbildung | Für Zuweiser mit mindestens drei vermittelten Fällen wird pro Quartal ein deterministischer Fälligkeitstag berechnet (aus einem Namens-Hashwert, damit nicht alle Partner am selben Tag fällig werden). Liegt dieser Tag innerhalb von 7 Tagen um das aktuelle Datum, erscheint der Vorschlag, eine Fortbildungs-/Hospitationseinladung (CME) für das laufende Quartal zu versenden. | Produkt |
| 08.07 | Anlassregel Fallzahl-Trend | Vergleicht die Fallzahl der letzten drei Monate je Zuweiser (im Prototyp aus der aktuellen Fallzahl und einem deterministischen Namens-Hashwert abgeleitet, da keine echte Monatshistorie existiert). Bei zwei Monaten in Folge fallender Zahl erscheint „Fallzahl rückläufig" mit der Empfehlung, den Rückgang zu klären; bei zwei Monaten in Folge steigender Zahl „Fallzahl steigend" mit der Empfehlung für einen Dankeskontakt (bei Zuweisern im Status „im Aufbau" zusätzlich der Vorschlag, auf „aktiv" hochzustufen). | Produkt |
| 08.08 | Stammdaten | Karte je Zuweiser mit Typ, Ort, fachlicher Relevanz, Ansprechpartner, Telefon und E-Mail (E-Mail als anklickbarer Mail-Link), Anzahl vermittelter Fälle, Datum des letzten Kontakts, einer Draht-Stärke-Anzeige (drei Stufen) sowie einem Link in die Portal-Ansicht des jeweiligen Zuweisers. Zusätzlich zeigt eine Landkarten-Grafik alle Zuweiser der gewählten Kategorie mit Punktgröße nach Fallzahl. | Produkt |
| 08.09 | Ranking nach Fallzahl | Jeder Zuweiser mit mindestens einem vermittelten Fall erhält eine von drei Einstufungen: „Aktiver Zuweiser" (letzter Kontakt innerhalb von 45 Tagen und mindestens drei Fälle), „Gelegentlicher Zuweiser" (letzter Kontakt innerhalb von 120 Tagen) oder „War aktiv — ruht". Zuweiser ohne jeden Fall werden als Archiv separat ausgewiesen und standardmäßig ausgeblendet. Die Liste ist nach Einstufung und danach nach Fallzahl sortiert, mit Filterchips je Einstufung. | Produkt |
| 08.10 | Pflege-Vorschlag je Partner | Zeigt je Zuweiser die nächste empfohlene Handlung: Liegt ein aktueller Fallzahl-Trend-Anlass vor, wird dessen Empfehlung angezeigt (bei dringendem Rückgang mit Warnsymbol). Andernfalls schlägt die Draht-Stärke die Pflegemaßnahme vor — starker Draht: Quartalsgespräch, mittlerer Draht: Newsletter-Aufnahme plus halbjährlicher Anruf, schwacher Draht: jährliche Basis-Broschüre. | Produkt |

## Datenobjekte

Das Modul liest und schreibt die Zuweiser-Stammdaten (Name, Typ, Ort, fachliche
Relevanz, Ansprechpartner, Kontaktwege, Fallzahl, Datum des letzten Kontakts,
Draht-Stärke, Partnerschaftsbeginn, zuletzt abgeschlossener gemeinsamer Fall) sowie
den zugehörigen Kontaktverlauf (Gespräche, Newsletter, Besuche, Rückmeldungen). Die
Anlassregeln greifen zusätzlich auf die Fallliste zu, um Fallzahlen und Abschlüsse zu
ermitteln. Siehe datenmodell.md für die vollständigen Feldlisten.

## Offene Punkte für Trinidat

- Die Kadenz-Schwellen der Kontaktpflege (90/180/330 Tage je nach Draht-Stärke) und
  die Ranking-Grenzwerte (45/120 Tage, 3 Fälle) sind Demo-Annahmen und mit Vertrieb
  bzw. Klinikleitung zu bestätigen.
- Die Kategorisierung der Zuweiser (08.02) läuft im Prototyp über eine
  Stichwort-Erkennung im Namens-/Typfeld. Für den Produktivbetrieb ist zu klären, ob
  ein festes Kategorie-Stammdatenfeld sinnvoller ist.
- Die Fallzahl-Trend-Erkennung (08.07) simuliert im Prototyp eine Drei-Monats-Historie
  deterministisch aus der aktuellen Fallzahl, weil keine echte Monatshistorie
  vorliegt — im Produkt braucht diese Regel echte historische Fallzahlen je Monat.

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
