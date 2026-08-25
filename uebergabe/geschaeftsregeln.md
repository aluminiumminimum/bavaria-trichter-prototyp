# Geschäftsregeln-Katalog

Dieses Dokument sammelt die Regeln, die das Verhalten des Prototyps steuern, sich aber
nicht durch bloßes Anklicken der Oberfläche erschließen — sie stecken im Rechenkern und
in den Beispieldaten. Bei Widerspruch zwischen Prototyp und diesem Dokument gilt dieses
Dokument.

## Eingang und Verteilung

**R-01 Automatische Verteilung eindeutiger Anfragen** · Wenn eine eingehende Anfrage einen
eindeutigen Fachbereich trägt, einem der beiden Belegungs-Teams zugeordnet werden kann,
einen erkennbaren Kostenträger nennt und weder eine Absage noch eine unsichere Formulierung
enthält, dann verteilt das System sie automatisch in den Pool des zuständigen Teams — ohne
dass die Leitung sie vorher sieht. Fehlt eine dieser Bedingungen (unklarer Fachbereich,
Premium-/SalutoCare-Verdacht, kein Kostenträger, unsichere Formulierung wie „vermutlich"
oder eine Absage), landet die Anfrage stattdessen in der Gruppe „Braucht Entscheidung".
Beispiel: Eine Fax-Anmeldung mit „Diagnose Knie-TEP, Kostenträger GKV (AOK Bayern)" wird
automatisch dem Team Orthopädie zugeteilt. Grenzfall: Dieselbe Anfrage mit Fachbereich
SalutoCare wird NIE automatisch verteilt — SalutoCare hat bewusst kein Team-Mapping und
bleibt immer Entscheidungsfall der Leitung. Kap. 03, 11.

**R-02 Regelwerk Einstufung — Sterne aus dem Anfragetext** · Wenn eine Anfrage noch keine
manuell gesetzte Sterne-Einstufung hat, dann leitet das System einen Stern-Vorschlag aus dem
Anfragetext ab: eine erkannte Absage („kein Bedarf", „abgesagt", Widerruf) ergibt 1 Stern;
eine konkrete Anfrage (erkennbares Alter, eine Frist oder ein Kostenträger) ergibt 4 Sterne
bei Premium-Signalwörtern (SalutoCare, Selbstzahler, Suite, Premium) oder sonst 3 Sterne;
alles andere ergibt 2 Sterne. Beispiel: „Ich bin 55 Jahre alt und zahle selbst … Suite …"
löst 4 Sterne aus (konkret + Premium-Signal). Grenzfall: Enthält der Text sowohl eine Absage
als auch ein Premium-Signal, gewinnt die Absage — 1 Stern, weil sie zuerst geprüft wird. Kap.
03, 04.

**R-03 Sterne-Override mit Begründungspflicht** · Wenn die Leitung die automatisch
vorgeschlagene Einstufung für falsch hält, dann kann sie jeden der fünf Sterne einzeln
anklicken und überschreibt damit den Vorschlag dauerhaft — der Systemvorschlag bleibt als
Begründungstext („PKV erkannt · Frist erkannt · konkrete Anfrage") sichtbar, auch nachdem
überschrieben wurde. In der Personen-Kartei trägt jede der 28 Beispielpersonen zusätzlich
einen frei formulierten Begründungstext als Fließtext (z. B. „War in Premium-Reha &
begeistert, aktiver Selbstzahler"). Beispiel: Eine Anfrage mit automatisch erkannten 2
Sternen wird von der Leitung auf 4 gesetzt, weil im Telefonat ein konkreter Aufnahmewunsch
genannt wurde, den der Text nicht hergab. Grenzfall: Der Override wirkt nur für diese eine
Anfrage — er verändert nicht die Regeln, nach denen künftige Anfragen automatisch eingestuft
werden. Kap. 04, 09.

**R-04 Vollständigkeits-Prüfliste vor Übernahme** · Wenn eine Anfrage in einen Fall
übernommen werden soll, dann prüft das System fünf Punkte (Kostenträger, medizinische
Achse, Wunschtermin, vollständige Kontaktdaten, Einwilligung zur Kontaktaufnahme) und zeigt
jeden offenen Punkt als zu klärende Rückfrage. Beispiel: Eine anonyme E-Mail „Habt ihr noch
freie Plätze?" erfüllt nur 0 von 5 Punkten und bleibt als „passiver Kontakt" ohne
Fall-Übernahme liegen. Grenzfall: Auch bei 5/5 erfüllten Punkten erzwingt das System die
Übernahme nicht — die Entscheidung bleibt bei der bearbeitenden Person. Kap. 04.

**R-05 Einwilligung als Pflichtpunkt der Vollständigkeit** · Wenn die Kontakt-Einwilligung
einer Anfrage noch „offen" oder leer ist, dann gilt der Vollständigkeits-Punkt „Kontakt-
Einwilligung (DSGVO)" als nicht erfüllt — unabhängig davon, wie viele andere Angaben
vorliegen. Beispiel: Eine vollständige Fax-Anmeldung mit Diagnose, Kostenträger und Frist
gilt trotzdem als unvollständig, solange die Einwilligung nicht dokumentiert ist. Grenzfall:
Eine „passive" Anfrage (reiner Broschüren-Download) verlangt keine Einwilligungs-Prüfung in
dieser Liste — sie landet ohnehin nie in einem Fall, sondern höchstens direkt in der
Personen-Datenbank. Kap. 04, 09.

**R-06 Personen-Abgleich verhindert Dubletten** · Wenn ein Fall oder eine Anfrage eine neue
Person referenziert, dann sucht das System zuerst nach einer Übereinstimmung bei Telefon,
E-Mail oder exaktem Namen (ohne Groß-/Kleinschreibung) in der bestehenden Personen-Kartei,
bevor eine neue Akte angelegt wird. Sammelbezeichnungen wie „Familie", „Eheleute" oder
„Unbekannt" erhalten grundsätzlich keine Einzelakte. Beispiel: Eine zweite Anfrage von
„a.muster@demo-patient.local" wird derselben Person P01 (Anna Muster) zugeordnet statt einer
neuen Akte P29. Grenzfall: Trägt eine Anfrage nur einen Namen ohne Telefon/E-Mail und
existiert exakt derselbe Name bereits, gilt das als Treffer — auch wenn es sich in Wirklichkeit
um zwei verschiedene Personen handeln könnte (im Prototyp angedeutet, im Produkt mit
weiteren Merkmalen wie Geburtsdatum auszubauen). Kap. 04, 06.

## Service-Versprechen und Eskalation

**R-07 Dringlichkeitsklassen und Erstkontakt-Budget** · Wenn eine Anfrage oder ein neuer Fall
eintrifft, dann ordnet das System sie einer von drei Dringlichkeitsklassen zu und setzt ein
Zeitbudget bis zum ersten Kontakt: Klasse A („heiß") 2 Stunden, Klasse B („warm") 4 Stunden,
Klasse C („Lead") 24 Stunden. Klasse A gilt automatisch für alle Zuweiser-Kanäle (Fax, Recare,
Zuweiser direkt, PRIMO MEDICO), für 4- und 5-Sterne-Anfragen sowie für Fälle mit PKV,
Selbstzahler oder Beihilfe; alles andere ist Klasse B; rein passive Kontakte sind Klasse C.
Beispiel: Ein Fax vom Sozialdienst RHÖN mit PKV bekommt automatisch Klasse A und ein
2-Stunden-Fenster, obwohl die Nachricht selbst keine Dringlichkeit nennt. Grenzfall: Die Uhr
läuft nur, solange der Fall auf „Neu" steht und noch keine Reaktion dokumentiert ist — sobald
die Ablage-Doktrin (R-10) greift, pausiert sie, weil ein externer Blocker kein
Reaktionsversäumnis der Klinik ist. Kap. 03, 05, 06.

**R-08 Eskalation an die Leitung bei gerissenem Versprechen** · Wenn das Erstkontakt-Budget
einer Klasse überschritten wird, eine Folge-Frist eines Falls überfällig ist oder eine
automatisch verteilte Anfrage im Team-Pool liegen bleibt, dann erscheint der Fall in der
Eskalationsliste der Leitung mit den Optionen neu zuweisen, Frist mit Pflichtgrund
verschieben oder direkt öffnen. Beziehungs-Anlässe (Geburtstag, Jubiläum, Nachsorge-Fenster)
lösen bewusst KEINE Eskalation aus — nur ein deutlich gerissener Zuweiser-Kontaktrhythmus
zählt zusätzlich als Eskalation. Beispiel: Ein Klasse-A-Fall ohne Reaktion nach 2 Std. 45 Min.
erscheint mit „Erstkontakt +0:45 Std. über Ziel" in der Liste. Grenzfall: Ein Fall, der bereits
im Ablage-Fach liegt (R-10), erzeugt keine Eskalation, selbst wenn seine ursprüngliche Frist
verstrichen wäre — die Ablage hat Vorrang vor der SLA-Uhr. Kap. 03, 06.

**R-09 Team-Ampel als Rückschau je Mitarbeiter** · Wenn für einen Mitarbeitenden dokumentierte
Erstkontakte vorliegen oder aktuell eine ungelöste Eskalation an ihm hängt, dann zeigt die
Team-Ansicht eine Ampel mit „erfüllte/gesamte Ziele" (z. B. „SV 4/5") und zusätzlich die Zahl
akut überfälliger Fälle. Beispiel: „SV 3/5 · 1 akut" bedeutet drei von fünf dokumentierten
Erstkontakten im Ziel und einen aktuell laufenden Verstoß ohne Leitungs-Aktion. Grenzfall:
Ein Mitarbeitender ohne dokumentierte Erstkontakte und ohne akute Eskalation bekommt gar
keine Ampel angezeigt (kein leerer 0/0-Chip). Kap. 03.

**R-10 Ablage-Doktrin: Verschulden vs. Umstand** · Wenn ein Fall an einem externen Blocker
hängt (Unterlagen ausstehend, Kostenklärung läuft, Patient nicht erreicht, Rückruf zugesagt,
Sonstiges), dann wird er mit Pflichtgrund und optionaler Notiz „abgelegt" statt als Verstoß
gegen das Service-Versprechen gezählt — er verlässt die Board-Spalten und die Eskalations-
Rechnung, bekommt aber zwingend einen Wecker (Wiedervorlage) und eine Maximaldauer als
Sicherheitsnetz. Beispiel: Ein Fall mit Grund „Kostenklärung läuft" bekommt einen Wecker in 7
Tagen und spätestens nach 21 Tagen eine erzwungene Wiedervorlage. Grenzfall: Trifft während
der Ablage eine Antwort ein (Grund-Art „ereignis"), reaktiviert sie den Fall sofort — der
Sicherheits-Wecker wird dann nicht mehr gebraucht; bei Gründen der Art „zeit" (z. B. „Nicht
erreicht") gibt es keine automatische Reaktivierung durch Antworten, nur durch den Wecker
selbst. Kap. 06.

**R-11 Wecker und Maximaldauer je Ablage-Grund** · Wenn ein Fall abgelegt wird, dann bestimmt
der gewählte Grund exakt, wann die nächste Wiedervorlage fällig ist und nach wie vielen Tagen
spätestens eine Entscheidung erzwungen wird: „Unterlagen ausstehend" 7/14 Tage, „Nicht
erreicht" 3/21 Tage (siehe aber R-13 für die feinere Sterne-Staffelung dieses konkreten
Grundes), „Kostenklärung läuft" 7/21 Tage, „Rückruf zugesagt" 1/7 Tage, „Sonstiges" 7/30 Tage.
Beispiel: Ein als „Rückruf zugesagt" abgelegter Fall meldet sich bereits nach 1 Tag wieder,
weil vage Rückrufzusagen am häufigsten verschleppt werden. Grenzfall: Wird eine Wiedervorlage
manuell um 3 Tage verschoben, zählt das als neuer Zyklus — ab dem dritten Zyklus schlägt das
System die Archivierung vor (siehe R-16). Kap. 06.

## Fallführung

**R-12 Statusautomatik der Klärungsfelder — vor, nie zurück** · Wenn eines der fünf
Klärungsfelder eines Falls (Kontakt & Erstgespräch, Medizinischer Bedarf, Unterlagen,
Kostenzusage, Anreise & Aufnahme) als erledigt markiert wird, dann rückt der sichtbare
Fall-Status automatisch auf den Meilenstein des nächsten noch offenen Feldes vor — niemals
zurück, und maximal bis „Aufnahme geplant" (der Sprung zu „Aufgenommen" bleibt eine
ausdrückliche Aktion). Werden mehrere Felder in einem Schritt erledigt, überspringt der
Status Zwischenstufen, löst deren Hintergrund-Ereignisse aber trotzdem aus. Beispiel: Wird
in einem neuen Fall gleichzeitig das Erstgespräch dokumentiert UND die Diagnose erfasst,
springt der Status direkt von „Neu" zu „Qualifizierung" statt über „Kontaktiert" stehen zu
bleiben. Grenzfall: Ein bereits auf „Aufgenommen", „Verloren" oder „Archiviert" stehender
Fall wird von dieser Automatik nicht mehr angefasst. Kap. 06.

**R-13 Wiedervorlage-Staffelung „Nicht erreicht" nach Sterne-Priorität** · Wenn ein
Rückrufversuch als „nicht erreicht" dokumentiert wird, dann setzt das System die nächste
Wiedervorlage automatisch nach der Sterne-Einstufung der Person: 5 Sterne → heute 16:00 Uhr,
4 Sterne → morgen 09:00 Uhr, 3 Sterne → in 2 Tagen, 1–2 Sterne → in 4 Tagen. Ab dem dritten
erfolglosen Versuch empfiehlt das System zusätzlich einen Kanalwechsel (schriftlich statt
telefonisch). Beispiel: Ein 5-Sterne-Selbstzahler, der nicht erreicht wird, bekommt eine
Wiedervorlage noch am selben Tag um 16:00 Uhr; ein 2-Sterne-Kontakt dagegen erst in 4 Tagen.
Grenzfall: Jeder „Nicht erreicht"-Versuch legt den Fall zusätzlich ins Ablage-Fach (R-10) mit
genau diesem sterne-basierten Wecker — er ersetzt damit den allgemeinen 3-Tage-Standardwecker
aus R-11 für diesen speziellen Grund. Kap. 06.

**R-14 Ärztliche Übernahme-Freigabe bei hoher medizinischer Schwere** · Wenn ein Fall als
medizinisch „hoch" eingestuft ist (z. B. Beatmungspatient), dann gilt das Klärungsfeld
„Medizinischer Bedarf" erst als erledigt, wenn zusätzlich zur Diagnose eine ärztliche
Übernahme-Freigabe mit Status „erteilt" vorliegt — eine bloß „angefragte" Freigabe reicht
nicht. Beispiel: Ein Weaning-Fall mit vollständiger Diagnose, aber nur angefragter Freigabe,
bleibt im Lagebild als „ärztliche Freigabe offen" stehen und rückt nicht in Richtung
Kostenklärung vor. Grenzfall: Fälle ohne die Einstufung „hoch" überspringen diese zusätzliche
Prüfung vollständig — die Diagnose allein genügt ihnen. Kap. 06.

**R-15 Automatische Aufnahme in die Datenbank bei Qualifizierung** · Wenn ein Fall den
Meilenstein „Qualifizierung" erreicht und noch keiner Person zugeordnet ist, dann legt das
System automatisch eine neue Personen-Akte an und verknüpft den Fall damit — sofern es sich
um eine identifizierbare Einzelperson handelt (siehe R-06). Beispiel: Ein Fall „Familie
Steiner" erreicht „Qualifizierung", bekommt aber keine Einzelakte, weil der Name als
Sammelbezeichnung erkannt wird. Grenzfall: Ein Fall, der direkt als „Verloren" endet, bevor er
„Qualifizierung" erreicht, erzeugt nie eine Personen-Akte. Kap. 06.

**R-16 Archivierungsvorschlag nach drei erfolglosen Ablage-Zyklen** · Wenn eine Wiedervorlage
zum dritten Mal manuell um weitere 3 Tage verschoben wird, dann schlägt das System explizit
die Archivierung vor, erzwingt sie aber nicht. Wird ein Fall archiviert, wandert er mit einer
30-Tage-Wiedervorlage in den Patienten-Radar statt gelöscht zu werden. Beispiel: Ein Fall mit
Grund „Nicht erreicht" wird nach dem dritten Verschieben archiviert und taucht 30 Tage später
im Radar mit dem Prognosetext „Wiederansprache mit Anlass sinnvoll" wieder auf. Grenzfall: Die
Archivierung bleibt bis zuletzt eine bestätigungspflichtige, manuelle Aktion — auch nach dem
dritten Zyklus läuft nichts automatisch. Kap. 06, 09.

## Anlass-Regeln

**R-17 Geburtstags-Anlass** · Wenn eine Person mindestens 2 Sterne trägt und ihr Geburtstag
innerhalb der nächsten 30 Tage liegt, dann erscheint ein Geburtstags-Anlass — aber nur, wenn
zusätzlich eine passende Geste möglich ist (siehe R-28: ohne den Einwilligungs-Zweck „Post"
bei 3+ Sternen bzw. ohne erteilte Einwilligung allgemein entsteht kein Anlass). Beispiel: Eine
4-Sterne-Person, die in 12 Tagen 68 wird und die Einwilligung „Post" erteilt hat, erhält den
Anlass „wird 68 · Geburtstag am [Datum] · in 12 Tagen" mit der Geste „Handgeschriebene Karte +
persönlicher Anruf". Grenzfall: Eine 1-Stern-Person hat nie einen Geburtstags-Anlass, unabhängig
vom Datum. Kap. 02, 09.

**R-18 Entlass-Jubiläum** · Wenn eine Person mindestens 3 Sterne trägt und der Jahrestag ihrer
letzten Entlassung innerhalb der nächsten 30 Tage liegt, dann erscheint ein Jubiläums-Anlass
mit dem Text „N-tes Entlass-Jubiläum". Beispiel: Eine Person, deren Reha vor genau einem Jahr
minus 5 Tagen endete, erhält den Anlass „1. Entlass-Jubiläum … Jahrestag in 5 Tagen". Grenzfall:
Ohne dokumentiertes Entlassdatum in der Historie entsteht kein Jubiläums-Anlass, selbst bei
5 Sternen. Kap. 02, 09.

**R-19 Nachsorge-Fenster (6.–8. Woche)** · Wenn eine Person mindestens 2 Sterne trägt, ihre
Einwilligung ausdrücklich „erteilt" ist und ihre Entlassung zwischen 42 und 56 Tagen zurückliegt,
dann erscheint genau einmal ein Nachsorge-Anlass; ab 5 Sternen als „Persönlicher
Nachsorge-Anruf durch die Bezugstherapeutin", sonst als einfacher „Nachsorge-Check". Beispiel:
Eine Person, die vor 44 Tagen entlassen wurde und 5 Sterne trägt, bekommt den Premium-Anlass;
dieselbe Person mit 3 Sternen bekäme den Standard-Check. Grenzfall: Am Tag 41 oder Tag 57 gibt
es (noch) keinen bzw. keinen erneuten Anlass mehr — das Fenster ist exakt einmalig und schließt
sich danach endgültig. Kap. 07, 09.

**R-20 Zuweiser-Jahrestag** · Wenn eine Partnerschaft mit einem Zuweiser mindestens 350 Tage
besteht und der jährliche Jahrestag höchstens 14 Tage entfernt liegt (auch rückwirkend, falls
er knapp verpasst wurde), dann erscheint ein Jubiläums-Anlass mit Vorschlag „Jahres-
Kooperationsgespräch mit Chefarzt/Leitung anbieten". Beispiel: Eine seit 2019 bestehende
Partnerschaft mit Jahrestag vor 3 Tagen erscheint als „dringend" (jetzt nachholen), nicht als
„demnächst". Grenzfall: Zuweiser ohne dokumentierte gemeinsame Fälle erhalten
grundsätzlich keinen Jahrestags-Anlass, selbst bei langer Partnerschaftsdauer. Kap. 08.

**R-21 Fortbildungseinladung je Quartal** · Wenn ein Zuweiser mindestens 3 gemeinsame Fälle
hat, dann berechnet das System für ihn einen festen, aber pro Zuweiser unterschiedlichen
Fälligkeitstag innerhalb des laufenden Quartals (aus dem Namen abgeleitet, nicht zufällig,
damit nicht alle Zuweiser am selben Tag feuern) und zeigt den Fortbildungs-Anlass, sobald
dieser Tag höchstens 7 Tage entfernt ist. Beispiel: Zuweiser mit 6 gemeinsamen Fällen bekommt
im dritten Quartal einen Anlass „Einladung zu Fortbildung/Hospitation (CME)" zu einem
festen, für ihn charakteristischen Tag. Grenzfall: Zuweiser mit weniger als 3 Fällen erhalten
nie eine Fortbildungseinladung, unabhängig vom Quartal. Kap. 08.

**R-22 Fallzahl-Trend-Erkennung** · Wenn die monatliche Fallzahl eines Zuweisers zwei Monate
in Folge sinkt, dann erscheint ein dringlicher Anlass „Fallzahl 2 Monate rückläufig" mit der
Handlungsempfehlung, den Rückgang im Gespräch zu klären; steigt sie zwei Monate in Folge,
erscheint stattdessen ein Anlass für einen Dankes-/Bestätigungskontakt — und, falls der
Zuweiser noch im Status „aufbau" ist, zusätzlich der Vorschlag, ihn auf „aktiv" hochzustufen.
Beispiel: Fallzahlen 6→4→2 lösen „Fallzahl-Trend: rückläufig" aus; Fallzahlen 1→2→4 bei einem
„aufbau"-Zuweiser lösen den Hochstufungs-Vorschlag aus. Grenzfall: Ein einmaliger Ausreißer
nach oben oder unten (z. B. 4→2→3) löst KEINEN Trend-Anlass aus — nötig ist eine echte,
zweimonatige Kontinuität in dieselbe Richtung. Kap. 08.

## Wirtschaftlichkeit und Belegung

**R-23 Belegungsrechnung zählt nur laufende Aufenthalte** · Wenn ein importiertes Stationsblatt
auch bereits abgeschlossene oder noch nicht begonnene Aufenthalte enthält, dann zählt das
System als „belegtes Bett" ausschließlich Aufenthalte, deren Aufnahmedatum nicht in der
Zukunft und deren Entlassdatum nicht in der Vergangenheit liegt (Stichtag heute). Beispiel:
Ein Stationsblatt mit 301 Gesamtzeilen, von denen nur 240 heute tatsächlich noch im Haus
liegen, zeigt eine Auslastung auf Basis von 240, nicht 301. Grenzfall: Ohne diese Regel hätte
eine Liste mit vielen historischen Zeilen fälschlich „301/301 belegt" gezeigt, obwohl niemand
mehr im Haus war — genau dieser Fehlerfall ist im Code als Warnung dokumentiert. Kap. 02, 07.

**R-24 Unbekannte Bettenzahl bleibt unbekannt** · Wenn für eine importierte Station keine
hinterlegte Soll-Bettenzahl existiert, dann zeigt das System für Auslastung und freie Betten
dieser Station einen Strich statt eines berechneten Werts — die Zeilenzahl der importierten
Liste wird niemals hilfsweise als Bettenzahl verwendet. Beispiel: Eine neu importierte Station
„Reha-Nord" ohne hinterlegtes Soll zeigt „Auslastung: —" statt einer erfundenen 100-%-Angabe.
Grenzfall: Sobald für dieselbe Station nachträglich eine Soll-Bettenzahl eingetragen wird
(Bettenzahl und Tagesziel lassen sich nachtragen), erscheinen ab diesem Moment echte
Prozentwerte. Kap. 07.

**R-25 Erlösrechnung aus Pflegesatz und Therapiekosten** · Wenn der Tageserlös einer
Belegungszeile berechnet wird, dann ist er die Summe aus Pflegesatz und Therapiekosten dieses
Tages (nicht nur der Pflegesatz allein); der Deckungsbeitrag je Tag ergibt sich aus Tagessatz
minus tatsächlichen Kosten je Tag, multipliziert mit der geplanten Verweildauer. Beispiel: Ein
Patient mit Pflegesatz 520 € und Therapiekosten 900 € trägt 1.420 € Tageserlös zur
Stations-Summe bei. Grenzfall: Nach einem Datenimport ersetzen die importierten Werte
vollständig die Demo-Zeilen derselben Station — beide Quellen werden nie addiert. Kap. 07.

**R-26 Belegungs-Forecast: Mittwochs-Anker und Komfort-Kontingent** · Wenn der 8-Wochen-
Forecast berechnet wird, dann misst er die Belegung jeweils am Mittwoch jeder Woche (nicht am
Wochenanfang oder -ende) und trennt privat Versicherte (PKV/Selbstzahler) von gesetzlich
Versicherten; die Zielgröße ist eine Stufe unter der vollen Kapazität der Komfortbetten
(Summe der Komfort-Kontingente je Fachbereich, aktuell 2+3+1+1=7 Betten, Ziel 6). Beispiel:
Sinkt die Belegung von Woche 1 zu Woche 8 von 6 auf 4, meldet die Kachel „4 Komfortbetten
werden frei" statt einer reinen Zahl ohne Einordnung. Grenzfall: Wird in Woche 8 die volle
Kapazität von 7 erreicht, erscheint statt einer Prognose der Satz „Vollbelegung erstmals
erreicht" — die Ziel-Linie bei 6 wird dann nicht mehr gesondert erwähnt. Kap. 02.

**R-27 Kostenzusage-Ampel mit vier Zuständen** · Wenn der Kostenzusage-Status eines Reha-Falls
angezeigt wird, dann unterscheidet die Ampel vier Fälle statt nur zwei: „liegt vor" (grün),
„kein Kostenträger nötig" (grün, z. B. Selbstzahler), „angefragt" (gelb, solange der
Patient höchstens 2 Tage im Haus ist) und „fehlt – kritisch" (rot, sobald die Zusage nach
2 Tagen im Haus immer noch offen ist). Beispiel: Ein Patient am Aufnahmetag ohne Zusage zeigt
„angefragt"; derselbe Patient am 3. Tag ohne Zusage zeigt „fehlt – kritisch". Grenzfall: Ein
Selbstzahler zeigt nie „fehlt – kritisch", selbst am 10. Tag ohne formale Kostenzusage — für
ihn ist gar keine Kostenträger-Zusage vorgesehen. Kap. 07.

## Datenschutz-Regeln

**R-28 Einwilligungssperre nach Zweck** · Wenn eine Ansprache oder Geste für eine Person
vorgeschlagen wird, dann prüft das System nicht nur, ob überhaupt eine Einwilligung vorliegt,
sondern ob sie den passenden Zweck abdeckt: eine Karte/ein Geschenk (ab 3 Sternen) braucht den
Zweck „Post", ein Newsletter-Eintrag (bei 2 Sternen) braucht den Zweck „Newsletter" — fehlt der
passende Zweck, unterbleibt die Geste, selbst wenn die Sterne-Einstufung dafür sprechen würde.
Beispiel: Eine 5-Sterne-Person mit Einwilligung nur für „Behandlung" (kein „Post") bekommt
keine Geburtstagskarten-Geste vorgeschlagen, sondern höchstens einen persönlichen Anruf.
Grenzfall: Auch für Kampagnen-Empfängerlisten (z. B. Newsletter-Versand) gilt dieselbe Regel —
nur Personen mit erteilter Einwilligung UND dem Zweck „Newsletter" UND mindestens 3 Sternen
werden als Empfänger vorgeschlagen. Kap. 09, 13.

**R-29 Widerruf sperrt dauerhaft** · Wenn eine Person ihre Einwilligung widerrufen hat oder nie
zugestimmt hat, dann entstehen für sie grundsätzlich keine Anlässe (Geburtstag, Jubiläum,
Nachsorge, Wiederbedarf) mehr, und die zugehörige Karte im Patienten-Radar zeigt statt einer
Aktion den deaktivierten Hinweis „Kontaktfreigabe fehlt". Beispiel: Eine Person mit
dokumentiertem Widerruf und einer medizinisch plausiblen Wiederbedarfs-Prognose taucht zwar
weiterhin in der Liste auf, aber ohne die Möglichkeit „Wiedervorlage planen" — der Button ist
deaktiviert. Grenzfall: Der Widerruf ist im Prototyp keine reversible Statuswechsel-Aktion
über die Oberfläche, sondern nur als Seed-Zustand hinterlegt — wie ein Widerruf im Betrieb
gesetzt und wieder aufgehoben wird, ist im Prototyp angedeutet, im Produkt auszubauen. Kap. 09,
13.

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
