# Datenmodell

Dieses Dokument beschreibt das fachliche Datenmodell des Prototyps „Klinik Bavaria ·
Concierge OS" vollständig, entitätsweise mit allen Feldern. Es ersetzt ein eigenes
Datenmodell-Konzept von Trinidat: Grundlage für Datenbankentwurf, Migrationen und API sind
die hier beschriebenen Entitäten, nicht die JavaScript-Implementierung.

Im Prototyp liegen die Daten als JavaScript-Arrays im Speicher der Seite (`faelle[]`,
`eingang[]`, `personen[]` usw.), ohne Backend, ohne Datenbank. Im Produkt werden daraus
Datenbanktabellen (bzw. Dokumente/Aggregate, je nach gewählter Technologie). Die
Feldbezeichner in diesem Dokument sind die Namen aus dem Prototyp-Code — sie dienen der
eindeutigen Rückverfolgbarkeit zur Quelle und dürfen im Produkt sauber und sprechend neu
benannt werden (z. B. `kt` → `kostentraegerTyp`).

Alle Beispielwerte sind aus den Seed-Daten des Prototyps übernommen und SYNTHETISCH —
keine echten Patienten-, Zuweiser- oder Kontaktdaten.

## Übersicht der Entitäten und Beziehungen

Der Trichter läuft in drei Phasen: Eine **Anfrage** kommt über einen Kanal (Telefon,
Website, Fax, E-Mail, Zuweiser-Portal, Recare, PRIMO MEDICO) roh im Eingang an. Wird sie
qualifiziert, entsteht daraus ein **Fall**, der den gesamten Prozess von der Erstreaktion
bis zur Aufnahme oder zum Verlust durchläuft. Sobald eine Anfrage oder ein Fall eine
identifizierbare Einzelperson betrifft, wird eine **Person**-Akte angelegt oder
wiederverwendet (Personen-Registry) — sie überlebt den einzelnen Fall und sammelt die
gesamte Beziehungshistorie (Interessent → Patient → Altpatient). Fälle, die über einen
Sozialdienst, eine Praxis oder ein Klinikum hereinkommen, sind einem **Zuweiser**
zugeordnet, zu dem eigene Kontakt- und Beziehungsdaten geführt werden. Nach der Aufnahme
lebt ein Fall als **Belegung** weiter: als klinischer In-Reha-Aufenthalt (Barthel-Index,
FIM, Verweildauer, Zwischenstand) und parallel als Belegungszeile auf einer Station (Bett,
Tagessatz, Erlös). Arbeit wird als **Aufgabe** an einem Fall geführt (ein Feldpaar
„aufgabe"/„frist" je Fall) und als **Anlass** proaktiv vorgeschlagen (Geburtstage,
Jubiläen, Nachsorge-Fenster, Zuweiser-Rhythmus — siehe „Abgeleitete Größen"). Kommunikation
zu einem Fall wird als **Nachricht** im internen Team-Thread des Falls geführt.

Beziehungsliste:

- Person 1—n Fall (eine Person kann mehrere Fälle im Zeitverlauf haben, z. B. zwei
  Reha-Aufenthalte)
- Fall 0..1—1 Anfrage (ein Fall entsteht aus genau einer qualifizierten Anfrage; nicht jede
  Anfrage wird ein Fall — passive Kontakte bleiben in der Personen-Registry ohne Fall)
- Person 0..1—n In-Reha-Aufenthalt (eine Person kann mehrfach in Reha gewesen sein)
- Fall 0..1—1 In-Reha-Aufenthalt (ein aufgenommener Fall bekommt genau einen laufenden
  Aufenthalt; verknüpft über `fallId`/`personId`)
- Zuweiser 1—n Fall über `zuweiserRef` bzw. `f.quelle` (ein Zuweiser meldet mehrere Fälle
  an; nicht jeder Fall hat einen Zuweiser — Selbstmelder haben `zuweiserRef: null`)
- Zuweiser 1—n Zuweiser-Ereignis (Beziehungshistorie, analog zur Personen-Historie)
- Belegungszeile 0..1—Person über `personId` (nur die im Concierge nachverfolgten Zeilen
  tragen `personId`; die übrige Stationsbelegung ist ein anonymes Aggregat, siehe
  „Hinweise für den Produkt-Entwurf")
- Fall 1—n Nachricht (interner Team-Thread `chat[]`, an einem Fall geführt)
- Fall 1—1 Aufgabe (aktueller „nächster Schritt": Felder `aufgabe`/`frist` direkt am Fall)
- Person 1—n Historieneintrag (`historie[]`, dokumentiert jede Anfrage, jeden Kontakt, jede
  Aufnahme/Entlassung dieser Person)

## Entität Anfrage

Eine Anfrage ist der unbearbeitete Eingang aus einem Kanal, bevor entschieden ist, ob
daraus ein Fall wird. Sie wird entweder in einen Fall überführt (qualifiziert), in die
Personen-Registry ohne Fall aufgenommen (passiv, z. B. Broschüre-Download) oder bleibt
anonym liegen (z. B. „habt ihr noch Plätze frei?" ohne Namen).

| Feld | Bedeutung | Typ | Beispiel (synthetisch) | Pflicht/optional |
|---|---|---|---|---|
| id | Eindeutige Nummer der Anfrage im Eingang | Zahl | 102 | Pflicht |
| kanal | Eingangskanal | Text (Enum) | „Zuweiser-Fax" | Pflicht |
| tit | Kurztitel für die Listenansicht | Text | „Fax: RHÖN Bad Neustadt, Anmeldung AHB nach Schlaganfall" | Pflicht |
| txt | Rohtext der Anfrage, unverändert wie eingegangen | Text (mehrzeilig) | „Kurzanmeldung Sozialdienst RHÖN Bad Neustadt, Station Neurologie 2, Az. N-0472/26. …" | Pflicht |
| zeit | Eingangszeitpunkt, im Prototyp als relativer Text | Text (Prototyp) / Zeitstempel (Produkt) | „vor 3 Std." | Pflicht |
| achse | Zugeordnete Fachachse | Text (Enum: Orthopädie/Neurologie/Geriatrie/Innere/SalutoCare) | „Neurologie" | Pflicht |
| done | Anfrage bereits übernommen (als Fall oder in die Personen-Registry) | Boolean | false | Pflicht |
| typ | Einstufung der Anfrage | Text (Enum: „qualifiziert"/„passiv") | „qualifiziert" | Pflicht |
| wer | Wer meldet an bzw. für wen (Kurzsatz) | Text | „Sozialdienst RHÖN Bad Neustadt meldet Friedrich Sander (68) nach Schlaganfall an" | optional (nur bei „qualifiziert") |
| zusammenfassung | Kurzzusammenfassung der Anfrage (KI-gestützt oder redaktionell) | Text | „Sozialdienst RHÖN Bad Neustadt meldet Friedrich Sander (68) … zur AHB an — PKV, Entlassung in 4 Tagen." | optional |
| gruppe | Zugewiesenes Team (Verteil-Pool), solange noch kein Fall übernommen hat | Text (Enum: „Orthopädie"/„Neuro-Geri") | „Neuro-Geri" | optional |
| sterne | Priorität/Einstufung 1–5, von der Leitung überschreibbar | Zahl (1–5) oder leer | 4 | optional |
| autoVerteilt | Automatisch anhand Achse verteilt (true) oder manuell zugewiesen (false) | Boolean | true | optional |
| saluto | Als SalutoCare-/Premium-Kandidat markiert | Boolean | false | optional |
| hinweis | Freitext-Hinweis für die Übernahme in den Fall | Text | „" | optional |
| patient.name | Name des Patienten, falls abweichend vom Anmelder (z. B. Angehöriger ruft an) | Text | „Gerhard Herrmann" | optional |
| patient.alter | Alter des Patienten | Zahl | 72 | optional |
| einzelperson | Anfrage lässt sich einer Einzelperson zuordnen (false bei Sammel-/anonymen Anfragen wie „Familie K." oder ohne Namen) | Boolean | true | optional, Standard true |
| pName | Name bei „passiv"-Anfragen ohne Patientenbezug (z. B. Interessentin für Broschüre) | Text | „Carola Diehm" | optional |

## Entität Fall

Der Fall ist das zentrale Arbeitsobjekt vom Zeitpunkt der Qualifizierung bis zur Aufnahme
oder zum Verlust. Er bündelt Status, Aufgabe, Dokumentenstand, Kostenklärung, Verlaufsprotokoll
und den internen Team-Austausch zu genau einer Anfrage/Person.

| Feld | Bedeutung | Typ | Beispiel (synthetisch) | Pflicht/optional |
|---|---|---|---|---|
| id | Eindeutige Fallnummer | Zahl | 6 | Pflicht |
| personId | Verweis auf die Person-Akte (`personen[].pid`) | Text (Fremdschlüssel) | „P03" | Pflicht, sobald qualifiziert |
| name | Name des Patienten | Text | „Heinz Vogel" | Pflicht |
| alter | Alter des Patienten | Zahl | 69 | Pflicht |
| rolle | Rolle des Erstkontakts zum Patienten | Text (Enum: Patient selbst/Angehörige/Zuweiser) | „Zuweiser" | Pflicht |
| kanal | Eingangskanal, aus der Anfrage übernommen | Text | „Zuweiser direkt" | Pflicht |
| eingangZeit | Zeitpunkt des Fall-Eingangs (für SLA/Reaktionszeit-Messung) | Text/Zeitstempel | „vor 3 Std." | optional |
| quelle | Herkunft/Absender im Klartext | Text | „Thoraxzentrum Münnerstadt" | Pflicht |
| achse | Fachachse | Text (Enum) | „SalutoCare" | Pflicht |
| kt | Kostenträger-Typ | Text (Enum: PKV/GKV/GKV + Komfort/Beihilfe/Selbstzahler/Unklar) | „PKV" | Pflicht |
| status | Trichter-Status (siehe Zustandsmodell in Kapitel 03) | Text (Enum: Neu/Kontaktiert/Qualifizierung/Unterlagen/Aufnahme geplant/Aufgenommen/Verloren) | „Qualifizierung" | Pflicht |
| owner | Zuständige Person im Team | Text (Enum, Werte aus `TEAM`) | „Recovery Manager" | Pflicht |
| aufgabe | Aktueller nächster Arbeitsschritt (siehe Entität Aufgabe/Anlass) | Text | „Übernahmefähigkeit Beatmung klären" | optional (leer nach Erledigung) |
| frist | Fälligkeitsdatum der Aufgabe | Datum (ISO) | 2026-08-23 | optional |
| saluto | Als SalutoCare-/Premium-Fall markiert | Boolean | true | optional |
| med.diagnose | Hauptdiagnose | Text | „Z. n. Langzeitbeatmung, Weaning laufend" | optional |
| med.neben | Nebendiagnose | Text | „Respiratorische Insuffizienz" | optional |
| med.isolation | Isolationspflicht | Text (Ja/Nein) | „Nein" | optional |
| med.schwere | Schweregrad-Einschätzung | Text (Enum: leicht/mittel/hoch) | „hoch" | optional |
| docs[0] | Entlassbrief vorhanden | Boolean | true | Pflicht (4er-Array, Standard false) |
| docs[1] | Befunde vorhanden | Boolean | true | Pflicht |
| docs[2] | Versicherungsdaten vorhanden | Boolean | true | Pflicht |
| docs[3] | Kostenzusage vorhanden | Boolean | false | Pflicht (bei Selbstzahlern faktisch irrelevant) |
| kosten | Stand der Kostenklärung | Text (Enum: offen/angefragt/Zusage liegt vor/abgelehnt/„—") | „angefragt" | Pflicht |
| consent | Einwilligung zur Kontaktaufnahme, als Freitext am Fall | Text | „schriftlich liegt vor" | Pflicht — im Produkt durch `Person.einwilligung` ersetzen, siehe Produkt-Hinweise |
| verlust | Verlustgrund, nur bei Status „Verloren" | Text | „Zu lange Wartezeit" | optional |
| reaktion | Reaktionszeit bis zum Erstkontakt in Stunden (SLA-Kennzahl) | Zahl (Stunden) oder leer | 26 | optional, wird beim ersten Kontakt gesetzt |
| log[] | Verlaufsprotokoll: Liste aus [Datum, Text, optional Uhrzeit] | Array | `[["2026-08-20","Anfrage eingegangen (Sozialdienst, Schlaganfall, AHB gesucht)"]]` | Pflicht |
| originalTxt | Ursprünglicher Rohtext der Anfrage, unveränderlich | Text | „Kurzanmeldung Sozialdienst RHÖN Campus Bad Neustadt, Station Neurologie, Az. N-1187/26. …" | Pflicht |
| originalKanal | Ursprünglicher Eingangskanal der Anfrage | Text | „Zuweiser direkt" | Pflicht |
| chat[] | Interner Team-Thread zum Fall (Entität Nachricht) | Array (Fremdverweis) | siehe Entität Nachricht | optional |
| ablage.grund | Grund, warum der Fall aktuell pausiert/abgelegt ist | Text | „Unterlagen ausstehend" | optional (nur wenn abgelegt) |
| ablage.notiz | Freitext-Notiz zur Ablage | Text | „Entlassmanagement: Rückmeldung zum Komfort-Upgrade steht aus" | optional |
| ablage.seit | Datum, seit dem der Fall abgelegt ist | Datum (ISO) | 2026-08-14 | optional |
| ablage.art | Art des Weckers | Text (Enum: „ereignis"/„zeit") | „ereignis" | optional |
| ablage.weckerTage | Frist in Tagen bis zur Wiedervorlage | Zahl | 7 | optional |
| ablage.maxTage | Maximale Ablagedauer, danach Archivierungs-Vorschlag | Zahl | 14 | optional |
| ablage.zyklen | Anzahl bereits durchlaufener Ablage-Zyklen | Zahl | 2 | optional |
| ablZyklen | Zähler der Ablage-Zyklen am Fall (Spiegel von `ablage.zyklen` nach Reaktivierung) | Zahl | 2 | optional |
| ablHist[] | Historie der bisherigen Ablagegründe | Array aus Text | `["Unterlagen ausstehend","Unterlagen ausstehend"]` | optional |
| schritte[] | Werdegang-Schritte des Falls (Pipeline-Nachweis) | Array aus Objekten `{label, who, ts, dauerMin, done}` | `{label:"Erstkontakt raus", who:"S. Koordination", ts:"2026-08-18 12:14", dauerMin:164, done:true}` | optional, im Prototyp nur für Demo-Fälle gesetzt |
| bettKw | Vorgemerkte Kalenderwoche für ein Komfortbett (Kapazitäts-Reservierung) | Text | „KW 33" | optional |
| anrufe | Anzahl bisheriger, erfolgloser Rückrufversuche | Zahl | 2 | optional |
| ungelesen | Anzahl ungelesener eingehender Nachrichten/Antworten am Fall | Zahl | 1 | optional, Zähler für „Mein Tag" |
| sim | Sitzungszustand des Prototyps für die Übung „Anfrage simulieren" (`{done:{}, pending:[]}` plus Szenario-Flags) | Objekt | — | Kein Produktfeld, siehe Produkt-Hinweise |

## Entität Patient/Person

Die Person-Akte ist die alleinige, überdauernde Identität eines Menschen im System — sie
existiert unabhängig vom einzelnen Fall und wird bei jeder neuen Anfrage entweder
wiedergefunden (Abgleich über Telefon, E-Mail oder Name) oder neu angelegt. Sie führt den
Lebenszyklus (Interessent → Patient → Altpatient), die Einwilligung und die vollständige
Beziehungshistorie.

| Feld | Bedeutung | Typ | Beispiel (synthetisch) | Pflicht/optional |
|---|---|---|---|---|
| pid | Eindeutige Personen-ID | Text | „P09" | Pflicht |
| name | Vollständiger Name | Text | „Dieter Franke" | Pflicht |
| geb | Geburtsdatum | Datum (ISO) | 1960-03-15 | Pflicht (Assertion warnt im Prototyp, wenn leer) |
| lebenszyklus | Beziehungsstufe zur Klinik | Text (Enum: interessent/patient/altpatient) | „patient" | Pflicht |
| kt | Kostenträger-Typ | Text (Enum, wie bei Fall) | „PKV" | Pflicht |
| sterne | Priorisierung/Wertigkeit der Beziehung, 1–5 | Zahl | 5 | Pflicht |
| sterneGrund | Begründung der Einstufung, für Nachvollziehbarkeit | Text | „Aktiver Privatpatient, Einzelzimmer-Wahlleistung" | Pflicht |
| kontakt.tel | Telefonnummer | Text | „0971 0000-509" | optional |
| kontakt.mail | E-Mail-Adresse | Text | „d.franke@demo-patient.local" | optional |
| angehoerige[].name | Name eines Angehörigen | Text | „Helga Franke" | optional |
| angehoerige[].bezug | Beziehung zum Patienten | Text | „Ehefrau" | optional |
| einwilligung.status | Status der Einwilligung zur Kontaktaufnahme | Text (Enum: offen/erteilt/widerruf) | „erteilt" | Pflicht |
| einwilligung.form | Form der Einwilligung | Text (Enum: mündlich/schriftlich) oder null | „schriftlich" | Pflicht, wenn Status „erteilt" |
| einwilligung.datum | Datum der Einwilligung | Datum (ISO) oder null | 2026-08-12 | Pflicht, wenn Status „erteilt" |
| einwilligung.zwecke[] | Zwecke, für die die Einwilligung gilt | Array aus Text (Enum: behandlung/newsletter/post) | `["behandlung","newsletter"]` | Pflicht (leeres Array, wenn keine Einwilligung) |
| zuweiserRef | Verweis auf den vermittelnden Zuweiser | Text (Fremdschlüssel auf `zuweiser[].name`) oder null | „RHÖN-KLINIKUM Campus" | optional |
| historie[].d | Datum des Ereignisses | Datum (ISO) | 2026-08-06 | Pflicht je Eintrag |
| historie[].typ | Ereignistyp | Text (Enum: anfrage/fall/kontakt/aufnahme/entlassung) | „aufnahme" | Pflicht je Eintrag |
| historie[].text | Freitext-Beschreibung des Ereignisses | Text | „Aufnahme zur orthopädischen AHB" | Pflicht je Eintrag |

**Zusatzfelder aus den Kontaktstufen-/Radar-Listen** (kuratierte Sichten auf die
Personen-Registry für Datenbank-Modul und Altpatienten-Radar; referenzieren `personId`,
tragen aber eigene redaktionelle Zusatzfelder, die es auf der Person selbst nicht gibt):

| Feld | Bedeutung | Typ | Beispiel (synthetisch) | Pflicht/optional | Herkunft |
|---|---|---|---|---|---|
| kontext | Kurzbeschreibung des aktuellen Kontaktstands | Text | „Interesse an Neuro-Reha, noch kein Termin" | Pflicht | Bestand (Kontaktstufen A–D) |
| quelle | Wie der Kontakt entstanden ist | Text | „Broschüre-Download" | Pflicht | Bestand |
| consent | Einwilligung ja/nein (Kurzform, redundant zu `Person.einwilligung.status`) | Text (Enum: ja/nein) | „ja" | Pflicht | Bestand |
| prognose | Fachliche Einschätzung des absehbaren Wiederbedarfs | Text | „Gegenseite (Knie-TEP rechts) absehbar — zweite Seite meist nach ~12 Monaten fällig" | Pflicht | Altpatienten-Radar |
| letzte | Kurzbeschreibung des letzten Aufenthalts | Text | „Knie-TEP links · Reha vor 11 Monaten" | Pflicht | Altpatienten-Radar |
| faelligInTagen | Prognostizierte Fälligkeit des Wiederbedarfs in Tagen (negativ = bereits überfällig) | Zahl | 30 | Pflicht | Altpatienten-Radar |
| owner | Zuständige Person für die Wiedervorlage | Text | „S. Koordination" | Pflicht | Altpatienten-Radar |

## Entität Zuweiser

Ein Zuweiser ist eine externe Einrichtung oder Praxis, die Patienten anmeldet (Akutklinik,
Sozialdienst, Hausarztpraxis, Vermittlungsportal). Zu jedem Zuweiser wird eine eigene
Beziehungspflege geführt, unabhängig von den einzelnen Fällen.

| Feld | Bedeutung | Typ | Beispiel (synthetisch) | Pflicht/optional |
|---|---|---|---|---|
| name | Name des Zuweisers (Primärschlüssel im Prototyp) | Text | „Leopoldina-Krankenhaus" | Pflicht |
| typ | Art der Einrichtung | Text | „Akutklinik mit Privatstation" | Pflicht |
| ort | Standort mit Entfernungsangabe | Text | „Schweinfurt (~25 km)" | Pflicht |
| rel | Fachliche Relevanz/Schwerpunkte | Text | „Ortho (EPZ), Neuro" | Pflicht |
| ap | Ansprechpartner | Text | „Hr. Brenner (Privatstation)" | Pflicht |
| tel | Telefonnummer | Text | „0971 0000-231" | optional |
| mail | E-Mail-Adresse | Text | „brenner@demo-klinik.local" | optional |
| faelle | Anzahl gemeinsamer Fälle (Zähler) | Zahl | 6 | Pflicht |
| letzter | Datum des letzten Falls/Kontakts | Datum (ISO) | 2026-08-24 | Pflicht |
| draht | Beziehungsstärke, als Punkte-Skala (●●● bis ○○○) | Text (3-Punkte-Skala) | „●●●" | Pflicht |
| status | Beziehungsstatus | Text (Enum: aktiv/aufbau/ziel) | „aktiv" | Pflicht |
| seit | Beginn der Partnerschaft | Datum (ISO) | 2019-07-23 | Pflicht |
| next | Empfohlener nächster Pflegeschritt | Text | „Quartalsgespräch vereinbaren" | Pflicht |
| letzterAbschluss | Datum des letzten abgeschlossenen gemeinsamen Falls (löst den Abschlussbericht-Anlass aus) | Datum (ISO) oder nicht gesetzt | 2026-08-20 | optional |

**Zuweiser-Ereignis** (`zuweiserEvents[]`, Beziehungshistorie analog zu `Person.historie`):

| Feld | Bedeutung | Typ | Beispiel (synthetisch) | Pflicht/optional |
|---|---|---|---|---|
| zName | Verweis auf den Zuweiser | Text (Fremdschlüssel auf `zuweiser[].name`) | „Leopoldina-Krankenhaus" | Pflicht |
| d | Datum des Ereignisses | Datum (ISO) | 2026-08-24 | Pflicht |
| typ | Ereignistyp | Text (Enum: fall/gespraech/newsletter/besuch/rueckmeldung) | „fall" | Pflicht |
| text | Freitext-Beschreibung | Text | „Fall Ludwig Bauer vermittelt (Hüft-TEP)" | Pflicht |

## Entität Belegung

Belegung deckt zwei zusammengehörige Sichten auf denselben aufgenommenen Fall ab: den
**klinischen Verlauf** (In-Reha-Aufenthalt: Assessment, Verweildauer, Zwischenstand) und
die **Bettenbelegung** je Station (Belegungszeile: Zimmer, Tagessatz, Erlös). Beide werden
über `personId` (bzw. zusätzlich `fallId`) verknüpft, sind aber unterschiedliche
Datensätze mit unterschiedlichem Lebenszyklus — eine Belegungszeile kann enden
(Entlassung), während der In-Reha-Datensatz die medizinische Historie behält.

**In-Reha-Aufenthalt** (`inReha[]`):

| Feld | Bedeutung | Typ | Beispiel (synthetisch) | Pflicht/optional |
|---|---|---|---|---|
| personId | Verweis auf die Person-Akte | Text (Fremdschlüssel) | „P09" | Pflicht |
| fallId | Verweis auf den ursprünglichen Fall, falls vorhanden | Zahl (Fremdschlüssel) | 10 | optional |
| name | Name des Patienten | Text | „Dieter Franke" | Pflicht |
| alter | Alter | Zahl | 66 | Pflicht |
| achse | Fachachse | Text (Enum) | „Orthopädie" | Pflicht |
| owner | Zuständige Person im Team | Text | „M. Belegung" | Pflicht |
| icd | ICD-Diagnoseschlüssel mit Klartext | Text | „M17.1 — Gonarthrose (sekundär)" | Pflicht |
| aufnahme | Aufnahmedatum | Datum (ISO) | 2026-08-19 | Pflicht |
| verweildauer.ist | Bisherige Aufenthaltsdauer in Tagen | Zahl | 19 | Pflicht |
| verweildauer.plan | Geplante Gesamt-Verweildauer in Tagen | Zahl | 21 | Pflicht |
| barthel.auf | Barthel-Index bei Aufnahme | Zahl (0–100) | 45 | Pflicht |
| barthel.akt | Aktueller Barthel-Index | Zahl (0–100) | 75 | Pflicht |
| fim.auf | FIM-Wert bei Aufnahme | Zahl (18–126) | 78 | Pflicht |
| fim.akt | Aktueller FIM-Wert | Zahl (18–126) | 101 | Pflicht |
| ziel | Zielwert (Barthel) für die Entlassung | Zahl | 60 | Pflicht |
| kurzbericht | Aktueller Kurzbericht zum Behandlungsstand | Text | „Postoperativ reizlos, Mobilisation an Unterarmgehstützen, 30 m Gehstrecke; Schmerz unter Belastung NRS 3." | Pflicht |
| labor[].k | Bezeichnung des Laborwerts/Parameters | Text | „CRP" | optional je Eintrag |
| labor[].v | Wert mit Einheit | Text | „6 mg/l" | optional je Eintrag |
| eintraege[].d | Datum des Verlaufseintrags | Datum (ISO) | 2026-08-24 | optional je Eintrag |
| eintraege[].txt | Text des Verlaufseintrags | Text | „Mobilisation an Unterarmgehstützen, 30 m Gehstrecke erreicht." | optional je Eintrag |
| zwischenstand.datum | Datum des letzten dokumentierten Zwischenstands | Datum (ISO) oder null | 2026-08-24 | optional |
| zwischenstand.text | Text des Zwischenstands | Text oder null | „Mobilisation planmäßig, Schmerzmanagement effektiv, Gehstrecke auf 35 m erweitert." | optional |
| zwischenstand.autor | Wer den Zwischenstand erfasst hat | Text oder null | „M. Belegung" | optional |
| verlaufPlan | Weiterer Verlauf/Plan (Freitext, separat vom Kurzbericht) | Text | — | optional |
| rehaZiel | Übergeordnetes Reha-Ziel in Prosa | Text | „Vollbelastung + selbstständiges Gehen ohne Hilfsmittel erreichbar" | Pflicht |
| arztberichtKurz | Kurzfassung für den Arztbericht | Text | „Gute postoperative Heilung, Physiotherapie im Plan." | Pflicht |
| drgStatus | Stand der Kostenzusage/Abrechnung | Text | „Zusage liegt vor" | Pflicht |
| entlassungGeplant | Geplantes Entlassdatum | Datum (ISO) oder null | 2026-08-27 | optional |
| anschlussBedarf | Empfohlene Anschlussversorgung | Text | „ambulante Physiotherapie 2×/Woche fortsetzen" | Pflicht |
| auffaelligkeiten | Besondere Auffälligkeiten im Verlauf | Text | „" | optional |
| entlassen | Entlassdatum, sobald der Aufenthalt beendet ist | Datum (ISO) oder nicht gesetzt | — | optional, steuert u. a. die Zwischenstand-Fälligkeit |
| bill.tagessatz | Vereinbarter Tagessatz (Pflegesatz) | Zahl (EUR) | 1045 | Pflicht bei Privatfällen |
| bill.kostenTag | Tatsächliche Tageskosten | Zahl (EUR) | 650 | Pflicht bei Privatfällen |
| bill.kostenzusage | Stand der Kostenzusage | Text | „liegt vor" | Pflicht bei Privatfällen |
| bill.zimmer | Zimmerkategorie | Text | „Einzelzimmer" | Pflicht bei Privatfällen |
| bill.verlaengerung | Verlängerung des Aufenthalts beantragt | Boolean | false | Pflicht bei Privatfällen |
| bill.zusatz[].label | Bezeichnung eines Zusatzentgelts | Text | „Einzelzimmer-Zuschlag" | optional je Eintrag |
| bill.zusatz[].eur | Betrag des Zusatzentgelts pro Tag | Zahl (EUR) | 65 | optional je Eintrag |

**Belegungszeile** (`BEL_PAT[]`, Bett-/Zimmerebene je Station):

| Feld | Bedeutung | Typ | Beispiel (synthetisch) | Pflicht/optional |
|---|---|---|---|---|
| zi | Zimmer-/Bettnummer | Text | „P-201" | Pflicht |
| ini | Initialen des Patienten (bewusst keine Klarnamen, siehe Produkt-Hinweise) | Text | „R.A." | Pflicht |
| st | Station | Text (Fremdschlüssel auf `BEL_STATIONEN[].name`) | „Premium" | Pflicht |
| mass | Maßnahme/Reha-Art in Prosa | Text | „Orthopädische Reha" | Pflicht |
| art | Aufnahmeart | Text (Enum: AHB/Phase C/Phase D/Privat) | „AHB" | Pflicht |
| kt | Kostenträger (Name der Kasse/Versicherung) | Text | „DAK" | Pflicht |
| ks | Kostenträger-Typ (Kurzform) | Text (Enum: GKV/PKV/SZ) | „GKV" | Pflicht |
| ps | Pflegesatz pro Tag | Zahl (EUR) | 320 | Pflicht |
| th | Zusatzentgelt Therapie pro Tag | Zahl (EUR) | 560 | Pflicht |
| auf | Aufnahmedatum, relativ zu heute in Tagen | Zahl (negativ = Tage in der Vergangenheit) | -88 | Pflicht |
| plan | Geplante Verweildauer in Tagen | Zahl | 96 | Pflicht |
| ez | Einzelzimmer | Boolean | true | Pflicht |
| ca | Complex-/Aufmerksamkeitsfall-Kennzeichen | Boolean | false | Pflicht |
| suite | Suite/Premium-Zimmer | Boolean | false | Pflicht |
| sterne | Bewertung/Priorität dieser Belegungszeile, 1–5 | Zahl | 4 | Pflicht |
| nach | Nachversorgungs-Ziel bei absehbarer Entlassung | Text | „Pflegeheim Demo-Kurpark" | optional |
| vl | Stand einer möglichen Verlängerung | Text | „beantragt" | optional |
| zuweiser | Zuweisername im Klartext (Anzeige, kein Fremdschlüssel) | Text | „Dr. Ravensberg, München" | Pflicht |
| begl[] | Namen begleitender Angehöriger | Array aus Text | `["Erika A."]` | optional |
| bauf | Barthel-Index bei Aufnahme (Spiegel für die Belegungssicht) | Zahl | 45 | Pflicht |
| bakt | Aktueller Barthel-Index (Spiegel für die Belegungssicht) | Zahl | 70 | Pflicht |
| personId | Verweis auf die Person-Akte, nur für die im Concierge nachverfolgten Zeilen | Text (Fremdschlüssel) | „P10" | optional |
| _mark | Manuell markiert/vorgemerkt (Arbeitszustand der Ansicht) | Boolean | false | Sitzungszustand des Prototyps, kein Produktfeld |
| _notiz | Freitext-Arbeitsnotiz zur Zeile | Text | „" | Sitzungszustand des Prototyps, kein Produktfeld |
| _auf | Überschriebenes Aufnahmedatum nach Stationsblatt-Import | Datum (ISO) | — | Sitzungszustand des Prototyps, kein Produktfeld |

**Stationsdaten** (`BEL_STATIONEN[]`, Stammdaten je Station):

| Feld | Bedeutung | Typ | Beispiel (synthetisch) | Pflicht/optional |
|---|---|---|---|---|
| name | Stationsname | Text | „Premium" | Pflicht |
| soll | Bettenanzahl (Soll) | Zahl | 70 | Pflicht |
| zielTag | Tagesumsatzziel der Station | Zahl (EUR) | 53000 | Pflicht |
| art | Stationsart | Text (Enum: intensiv/regel/pflege/privat) | „privat" | Pflicht |

Ergänzend dazu zwei Aggregat-Nachschlagetabellen ohne Zeilenebene: `BEL_IST_AGGREGAT`
(Ist-Belegung je Station, z. B. `{"Premium":65}`) und `BEL_ERLOES_AGGREGAT` (Ist-Erlös je
Station, z. B. `{"Premium":48219}`) — sie gelten für die gesamte Station, nicht nur für die
im Concierge nachverfolgte Teilmenge der Belegungszeilen (siehe Produkt-Hinweise).

**Komfortbett-Kontingent** (`BEL_KONTINGENT`, Achse → Anzahl reservierter Komfortbetten):

| Feld | Bedeutung | Typ | Beispiel (synthetisch) | Pflicht/optional |
|---|---|---|---|---|
| Orthopädie | Kontingent Komfortbetten für diese Achse | Zahl | 2 | Pflicht |
| Neurologie | Kontingent Komfortbetten für diese Achse | Zahl | 3 | Pflicht |
| Geriatrie | Kontingent Komfortbetten für diese Achse | Zahl | 1 | Pflicht |
| SalutoCare | Kontingent Komfortbetten für diese Achse | Zahl | 1 | Pflicht |

**Entlassdokument** (Beispielstruktur `entlassDoc`, wird am Ende eines Aufenthalts erzeugt):

| Feld | Bedeutung | Typ | Beispiel (synthetisch) | Pflicht/optional |
|---|---|---|---|---|
| pat | Patientenname | Text | „Werner Adler" | Pflicht |
| achse | Fachachse | Text | „Geriatrie" | Pflicht |
| entlassen | Entlassdatum | Datum (ISO) | 2026-08-22 | Pflicht |
| aufenthalt | Aufenthaltsdauer in Prosa | Text | „21 Tage" | Pflicht |
| barthel.auf | Barthel-Index bei Aufnahme | Zahl | 45 | Pflicht |
| barthel.ent | Barthel-Index bei Entlassung | Zahl | 85 | Pflicht |
| fim.auf | FIM-Wert bei Aufnahme | Zahl | 78 | Pflicht |
| fim.ent | FIM-Wert bei Entlassung | Zahl | 104 | Pflicht |
| diagnose | Diagnose/Behandlungsschwerpunkt | Text | „Z. n. Sturz mit Beckenfraktur · geriatrische Komplexreha" | Pflicht |
| kurz | Kurzfassung des Behandlungsergebnisses | Text | „Reha-Ziel erreicht: Gangbild stabil, Transfers selbstständig …" | Pflicht |
| brief | Kurzform des Entlassbriefs | Text | „Entlassbericht: geriatrische Komplexreha abgeschlossen …" | Pflicht |
| empfehlungen[] | Empfehlungen für die Anschlussversorgung | Array aus Text | `["Ambulante Physiotherapie 2×/Woche, 6 Wochen", …]` | Pflicht |
| medikation | Kurzhinweis zur Medikation bei Entlassung | Text | „Medikationsplan beigefügt · 3 Dauermedikamente, 1 neu angesetzt" | Pflicht |
| ruecksprache | Rückspracheweg für Rückfragen nach Entlassung | Text | „0971 0000-100 (Recovery-Line, Mo–Fr 8–16 Uhr)" | Pflicht |
| medis[].m | Medikamentenname | Text | „Ramipril" | Pflicht je Eintrag |
| medis[].st | Stärke/Dosis | Text | „5 mg" | Pflicht je Eintrag |
| medis[].d | Einnahmeschema | Text | „1 – 0 – 0" | Pflicht je Eintrag |
| medis[].h | Hinweis zur Einnahme | Text | „RR-Kontrolle beim Hausarzt" | optional je Eintrag |
| epikrise | Ausführliche Epikrise | Text | „Die stationäre geriatrische Komplexrehabilitation nach Beckenringfraktur verlief komplikationslos. …" | Pflicht |
| prozeduren[] | Durchgeführte Prozeduren/OPS | Array aus Text | `["Physiotherapie einzeln, 5 ×/Woche · Gangschule und Kraftaufbau", …]` | Pflicht |

## Entität Aufgabe/Anlass

Es gibt keine eigene, dauerhaft gespeicherte Aufgaben-Tabelle. Stattdessen trägt jeder Fall
genau ein Feldpaar für seinen aktuellen nächsten Schritt:

| Feld | Bedeutung | Typ | Beispiel (synthetisch) | Pflicht/optional |
|---|---|---|---|---|
| aufgabe (an Fall) | Nächster Arbeitsschritt in Prosa | Text | „Kostenzusage anfragen" | optional (leer nach Erledigung) |
| frist (an Fall) | Fälligkeitsdatum des nächsten Schritts | Datum (ISO) | 2026-08-25 | optional |

Zusätzlich existiert eine feste, kurze Liste interner Team-Aufgaben ohne Fall-Bezug
(`MT_INTERN[]`) — im Prototyp ein hartcodiertes Demo-Beispiel, im Produkt der Ansatzpunkt
für ein echtes, allgemeines Aufgaben-Backlog:

| Feld | Bedeutung | Typ | Beispiel (synthetisch) | Pflicht/optional |
|---|---|---|---|---|
| key | Eindeutiger Schlüssel der internen Aufgabe | Text | „intern:fobi-nachweis" | Pflicht |
| titel | Titel der Aufgabe | Text | „Fortbildungsnachweis Q2 hochladen" | Pflicht |
| sub | Kontext-/Unterzeile | Text | „Personalabteilung wartet auf den Nachweis" | Pflicht |
| fristTage | Fälligkeit in Tagen ab heute (0 = heute) | Zahl | 0 | Pflicht |

Die tägliche Aufgabenliste „Mein Tag" und das Anlass-Radar sind reine Berechnungen über
die oben beschriebenen Entitäten — sie fassen mehrere Quellen zu einer priorisierten Liste
zusammen, speichern aber selbst nichts Neues. Details dazu in „Abgeleitete Größen".

## Entität Nachricht

Eine Nachricht ist ein Beitrag im internen Team-Thread eines Falls (`chat[]` am Fall).
Sie ist strikt intern (Team-zu-Team) und getrennt vom patienten-/zuweiserseitigen
Kommunikationsverlauf (`log[]`).

| Feld | Bedeutung | Typ | Beispiel (synthetisch) | Pflicht/optional |
|---|---|---|---|---|
| von | Absender (Team-Mitglied) | Text (Enum, Werte aus `TEAM`) | „M. Belegung" | Pflicht |
| txt | Nachrichtentext, kann `@Name`-Erwähnungen enthalten | Text | „@S. Koordination Komfortzimmer für Frau Probst ist ab KW 33 machbar — reicht dir das fürs Angebot, oder braucht sie früher?" | Pflicht |
| ts | Uhrzeit der Nachricht | Text (Uhrzeit) | „08:40" | Pflicht |
| an[] | Explizit per `@`-Erwähnung adressierte Team-Mitglieder | Array aus Text | `["S. Koordination"]` | optional (leeres Array ohne Erwähnung) |
| gelesenVon[] | Team-Mitglieder, die die Nachricht bereits gelesen haben | Array aus Text | `["M. Belegung"]` | Pflicht, mindestens der Absender |

Nicht Gegenstand dieses Dokuments ist der Nachrichtenaustausch im Zuweiserportal
(`renderPortal()`, Namensraum `.rp-*` des Cofounders) — er liegt außerhalb des hier
beschriebenen Namensraums und wurde nur lesend zur Kenntnis genommen.

## Abgeleitete Größen

Die folgenden Größen werden bei jedem Rendern aus den oben beschriebenen Entitäten neu
berechnet. Sie haben im Prototyp keine eigene Tabelle und sollten das auch im Produkt nicht
bekommen — sonst laufen gespeicherter Wert und Ist-Zustand der Fachdaten auseinander:

- **Anlässe (`anlaesse()`)**: eine priorisierte Liste proaktiver Kontaktvorschläge, aus
  Regeln über `personen[]`, `radar[]` und `zuweiser[]` berechnet. Typen: Geburtstag
  (`geb` + `sterne ≥ 2`, Fenster 30 Tage), Jubiläum (Jahrestag der letzten Entlassung,
  `sterne ≥ 3`), Nachsorge-Check (42.–56. Tag nach Entlassung, mit Einwilligung),
  Wiederbedarf (aus `radar[]`), sowie fünf Zuweiser-Anlässe: Kontakt-Rhythmus (kein
  Austausch seit 90/180/330 Tagen je nach Beziehungsstärke `draht`), Fallzahl-Meilenstein
  (10/25/50 gemeinsame Fälle), Partnerschafts-Jubiläum (Jahrestag von `zuweiser.seit`),
  Abschlussbericht-Fälligkeit (0–14 Tage nach `letzterAbschluss`) und
  Fortbildungs-/CME-Einladung (quartalsweise). Ein einmal bearbeiteter Anlass wird über
  seinen `key` für die laufende Sitzung ausgeblendet (`_arDone`), aber nicht dauerhaft
  gespeichert.
- **„Mein Tag"-Aufgabenliste (`mtTodos()`)**: fasst die Fall-Aufgabe (`aufgabe`/`frist`),
  offene Kostenklärung, unbeantwortete qualifizierte Anfragen, fällige
  Reha-Zwischenstände (`zwischenstandFaellig()`, älter als 10 Tage) und die interne
  Aufgabenliste `MT_INTERN` zu einer einzigen, nach Dringlichkeit sortierten Liste
  zusammen. Nichts davon ist eine eigenständig gespeicherte „Aufgabe" — die Quelle bleibt
  immer der jeweilige Fachdatensatz.
- **SLA-/Service-Versprechen-Zustand**: ob ein Fall die Reaktionszeit-Zielvorgabe (abhängig
  von Priorität/`sterne`) einhält, wird laufend aus `eingangZeit`/`reaktion` gegen die
  aktuelle Uhrzeit berechnet, nicht gespeichert.
- **Belegungs-Forecast (`fcWochen()`, `belegungAktualisieren()`)**: freie Komfortbetten je
  Achse und Woche werden aus `BEL_KONTINGENT`, den laufenden `inReha[]`-Aufenthalten (Ende
  = Aufnahme + geplante Verweildauer) und vorgemerkten Fällen (`f.bettKw`) berechnet. Die
  alte, fest verdrahtete `belegung[]`-Seedliste wird bei jedem Aufruf überschrieben.
- **Zuweiser-Fallverlauf (`z.verlauf3M`)**: eine 3-Monats-Reihe gemeinsamer Fallzahlen,
  aus der Fallhistorie abgeleitet, um steigende/fallende Trends zu erkennen — kein
  gespeichertes Feld am Zuweiser.

Diese Größen bleiben im Produkt bewusst Berechnungen (z. B. materialisierte Sichten oder
Bedarfs-Queries), keine eigenen Tabellen — sonst müsste jede Änderung an Fall, Person oder
Zuweiser zusätzlich in einer Kopie nachgezogen werden.

## Hinweise für den Produkt-Entwurf

- **Einwilligung ist eine Pflichtstruktur, kein Freitext-Flag.** Die Personen-Akte
  (`einwilligung.status/form/datum/zwecke[]`) ist die einzige belastbare Quelle für
  Kontakterlaubnis und muss im Produkt so bleiben: Status, Form, Datum und die konkreten
  Zwecke (Behandlung/Newsletter/Post) je einzeln nachprüfbar. Der zusätzliche Freitext
  `Fall.consent` ist eine ältere, parallele Ablage desselben Sachverhalts direkt am Fall —
  im Produkt sollte es nur noch die eine, strukturierte Quelle an der Person geben.
- **Initialen statt Klarnamen im Belegungsmodul ist eine bewusste Datenschutz-Entscheidung**
  (Feld `ini` in der Belegungszeile), aus der ursprünglichen Übergabe übernommen und nicht
  aufzuweichen: Wer auf einer Stationsübersicht mitliest, soll keine Klarnamen sehen, auch
  wenn die vollständige Person über `personId` erreichbar bleibt.
- **Der Original-Rohtext einer Anfrage ist unveränderlich aufzubewahren.** Sobald aus einer
  Anfrage ein Fall wird, wandert ihr Rohtext unverändert in `Fall.originalTxt`/
  `originalKanal` — er darf im weiteren Bearbeitungsverlauf nicht überschrieben oder
  nachträglich „korrigiert" werden, da er im Streitfall die einzige Nachweisquelle für den
  tatsächlichen Anfrageinhalt ist.
- **Zwei Belegungsebenen sind bewusst nicht deckungsgleich.** Die Ist-Aggregate je Station
  (`BEL_IST_AGGREGAT`/`BEL_ERLOES_AGGREGAT`) gelten für die gesamte Station; die
  Belegungszeilen (`BEL_PAT[]`) sind nur die im Concierge nachverfolgte Teilmenge. Ein
  Produkt-Entwurf darf beides nicht vermischen (siehe Kommentar im Quellcode: „8 von 70
  Betten" wäre falsch, wenn 8 nur die nachverfolgte Teilmenge ist).
- **`_mark`/`_notiz`/`_auf` an Belegungszeilen und `f.sim` am Fall sind reiner
  Sitzungszustand des Prototyps** (Markierungen, Arbeitsnotizen der Demo-Ansicht, Zustand
  der Übung „Anfrage simulieren") — sie gehören nicht ins Produkt-Datenmodell, sondern
  bestenfalls in einen austauschbaren UI-Zustand ohne fachliche Bedeutung.

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
