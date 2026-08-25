# Kapitel 03 · Fälle · Anfragen (Eingang) — Testprojekt

**Ansicht im Prototyp:** Seitenleiste → Fälle → Reiter „Anfragen"
· [Live-Ansicht](https://aluminiumminimum.github.io/bavaria-trichter-prototyp/)

## Zweck
Die Seite „Fälle · Anfragen" ist der gemeinsame Posteingang der Klinik für alle
Akquisekanäle — hier laufen Telefonnotizen, E-Mails, Website-Formulare, Zuweiser-Faxe,
Recare-Anmeldungen und Anfragen aus dem Premium-Netzwerk an einer Stelle zusammen,
genutzt von der Leitung zur täglichen Triage. Sie sortiert automatisch vor, was direkt
einer Belegungsgruppe zugeteilt werden kann und was eine bewusste Entscheidung braucht,
und macht sichtbar, was gerade unbeachtet in der Warteschlange liegt. Ohne diese Seite
gäbe es keinen einheitlichen Einstiegspunkt in die Fallbearbeitung — jeder Kanal würde
in seiner eigenen Inbox versickern, und Anfragen blieben unbemerkt liegen.

## Funktionen
| Pos. | Funktion | Verhalten (2–4 Sätze) | Einordnung |
|---|---|---|---|
| 03.01 | Seitengerüst (Reiter Anfragen/Board/Team) | Die Seite „Fälle" gliedert sich in drei Reiter — „Anfragen" (dieser Eingang), „Board" (Kapitel 05) und „Team" —, außerdem trägt der Seitenkopf die Erläuterung „Ein Eingang für alle Kanäle: Telefon, E-Mail, Website, Zuweiser, Recare, Premium." | Produkt |
| 03.02 | „Anfrage simulieren" (Schulung/Abnahme) | Ein Knopf im Seitenkopf erzeugt aus einem festen Beispiel-Pool eine neue Anfrage, zeigt kurz die „NEU"-Kennzeichnung und durchläuft danach sichtbar die automatische Einstufung (verteilt oder „Braucht Entscheidung"). | Demo (behalten: Trinidat hat den Knopf selbst als Schulungs- und Abnahmewerkzeug eingepreist, Pos. 03.02) |
| 03.03 | Gruppe „Braucht Entscheidung" | Liste aller offenen, qualifizierten Anfragen, für die keine automatische Zuteilung möglich war; sortiert nach verbleibender Reaktionsfrist, die dringendste zuerst. Ein Klick öffnet das Detailfenster (Kapitel 04) zur manuellen Einstufung. | Produkt |
| 03.04 | Anfragekarte | Jede Karte zeigt Kanal-Symbol, Betreff, Kanal-Etikett, Eingangszeitpunkt, die Einstufung „qualifiziert"/„passiv", bei offenen qualifizierten Anfragen zusätzlich eine Frist-Kennzeichnung, und bei bereits bearbeiteten einen Erledigt-Haken („✓ als Fall" bzw. „✓ in Datenbank"). | Produkt |
| 03.05 | „NEU"/ungelesen | Eine frisch eingegangene Anfrage ist optisch als neu hervorgehoben (Rahmen + Beschriftung „NEU"), bis sie eingestuft bzw. geöffnet wurde. | Produkt (Verhalten muss verallgemeinert werden — siehe Geschäftsregeln) |
| 03.06 | Hinweiszeile automatische Verteilung | Über dem Protokoll zeigt eine Zeile, wie viele Anfragen heute automatisch verteilt wurden, aufgeschlüsselt nach Belegungsgruppe (z. B. „Heute automatisch verteilt: 3 · Orthopädie 2 · Neuro-Geri 1"). | Produkt |
| 03.07 | Gruppe „Einzelne Anfragen" | Ein aufklappbares Protokoll listet jede automatisch verteilte Anfrage einzeln auf: anfragende Person bzw. Betreff, Zielgruppe und Eingangszeitpunkt — nachvollziehbar, ohne dass die Leitung sie öffnen musste. | Produkt |
| 03.08 | Gruppe „Kein Handlungsbedarf" | Dritter Abschnitt zeigt bereits übernommene bzw. in die Datenbank aufgenommene sowie passive Anfragen, mit einem erklärenden Satz, was „passiv" bedeutet (Interessent ohne konkrete Anfrage). | Produkt |
| 03.09 | Regelwerk automatische Verteilung | Bestimmt, ob eine qualifizierte Anfrage automatisch einer Belegungsgruppe zugeteilt werden darf oder eine Entscheidung der Leitung braucht (volle Regel s. Geschäftsregeln unten). | Produkt |
| 03.10 | Regelwerk Einstufung | Bestimmt, ob eine eingehende Anfrage als „qualifiziert" (konkretes Anliegen) oder „passiv" (allgemeines Interesse ohne konkreten Bedarf) gilt, und liefert daraus den ersten Sterne-Vorschlag (voll ausgeführt in Kapitel 04). | Produkt |

## Datenobjekte
- **Anfrage** (zentrales Objekt dieser Seite — vollständiger Feldkatalog unten sowie in
  datenmodell.md) — gelesen für die drei Listen-Gruppen, geschrieben bei automatischer
  und manueller Verteilung.
- **Fall** (Kapitel 06) — wird beim „Übernehmen" aus einer Anfrage neu angelegt; diese
  Seite selbst schreibt danach nichts mehr in den Fall.
- **Person/Patientenkartei** (Kapitel 09) — wird beim „In Datenbank aufnehmen" für
  passive Kontakte neu angelegt.
- **Team/Belegungsgruppe** — feste Zuordnungstabelle Fachbereich → Gruppe (Orthopädie;
  Neuro-Geriatrie für Neurologie, Geriatrie und Innere; SalutoCare ohne feste Gruppe),
  bestimmt automatische Verteilung wie auch die Pool-Ansicht in „Mein Tag" (Kapitel 11).

## Offene Punkte für Trinidat
- Die „NEU"-Kennzeichnung läuft im Prototyp nur als 1,6-Sekunden-Demo-Effekt der
  simulierten Anfrage ab. Im echten Postfach-Betrieb muss sie bestehen bleiben, bis eine
  Mitarbeiterin die Anfrage tatsächlich öffnet — zu klären, ob „geöffnet" oder „bereits
  eingestuft" der richtige Auslöser zum Verschwinden ist.
- Die Vollständigkeits-Prüfung „Kontakt-Einwilligung" (Kapitel 04) wird in keinem
  bisherigen Datenpfad automatisch erfüllt — sie erscheint praktisch bei jeder Anfrage
  als offen. Zu klären, wie und wann eine Einwilligung im Produkt tatsächlich erfasst
  wird (vermutlich je Kanal unterschiedlich: Telefon-Notiz vs. Website-Formular mit
  Checkbox).
- Anhänge zu eingehenden Nachrichten (z. B. Entlassbrief, Befund) sind im Prototyp nur
  als Text im Nachrichteninhalt beschrieben, nicht als tatsächlich abrufbare Datei. Für
  die Postfachanbindung im Testprojekt ist zu klären, in welchem Format/Speicherort
  echte Anhänge abgelegt und wie lange sie vorgehalten werden.
- Die Bearbeiterin, die eine Anfrage aus dem Pool übernimmt, wird im Prototyp
  unabhängig von der tatsächlich handelnden Person fest auf einen Namen gesetzt — zu
  klären, ob im Produkt die angemeldete Nutzerin automatisch als Bearbeiterin
  eingetragen wird (setzt Benutzerverwaltung/Login voraus, siehe Kapitel 00.03).

## Zustandsmodell
| Status | Bedeutung | Auslöser | Erlaubte nächste Schritte | Wer |
|---|---|---|---|---|
| Neu/unklassifiziert | Anfrage ist gerade eingegangen, noch nicht automatisch geprüft. | Neue Nachricht trifft im Postfach ein (Produkt) bzw. „Anfrage simulieren" (Demo). | Automatische Prüfung ordnet die Anfrage „Braucht Entscheidung" oder „automatisch verteilt" zu. | System, keine Mitarbeiterin nötig. |
| Braucht Entscheidung | Qualifizierte Anfrage ohne eindeutig automatisch bestimmbaren Fachbereich/Kostenträger oder mit Premium-/Absage-Signal. | Regelwerk automatische Verteilung (03.09) findet mindestens eine offene Voraussetzung. | Leitung öffnet das Detailfenster, führt optional eine KI-Analyse aus, setzt Sterne, wählt eine Belegungsgruppe und gibt frei. | Leitung (der Reiter „Anfragen" ist nur in der Leitungsrolle sichtbar, nicht im Koordinations-/„Mein Tag"-Modus). |
| Automatisch verteilt | Qualifizierte Anfrage mit eindeutigem Fachbereich, erkanntem Kostenträger, ohne Absage. | Regelwerk automatische Verteilung erfüllt alle Bedingungen. | Landet direkt im Pool ihrer Belegungsgruppe; die Leitung sieht sie nur noch im Verteilungsprotokoll (03.07). | System; Leitung kann im Detailfenster nur noch lesen. |
| Im Pool (freigegeben) | Anfrage hat eine Belegungsgruppe — automatisch oder manuell — und wartet auf Übernahme. | Automatische Verteilung ODER Leitung klickt „Gruppe zuweisen & freigeben". | Jede Mitarbeiterin der zuständigen Gruppe übernimmt sie in „Mein Tag"; alternativ übernimmt die Leitung sie über das Board. | Mitarbeiterin der Belegungsgruppe (Kapitel 11) oder Leitung (Kapitel 05). |
| Übernommen (Fall) | Anfrage ist zu einem bearbeitbaren Fall geworden. | Klick auf „Übernehmen". | Keine weitere Aktion im Eingang; alle Folgeschritte laufen in der Fallakte (Kapitel 06). | Wer den Übernahme-Klick ausgeführt hat. |
| Passiv | Allgemeines Interesse ohne konkreten Reha-Bedarf (Broschüre, anonyme Frage). | Regelwerk Einstufung (03.10) erkennt kein konkretes Anliegen. | „In Datenbank aufnehmen" überführt die Person in die Patientenkartei (Kapitel 09) — nie in einen Fall. | Leitung öffnet und bestätigt. |
| In Datenbank / Kein Handlungsbedarf | Anfrage ist entweder als Fall übernommen oder in die Patientenkartei überführt. | Übernahme bzw. „In Datenbank aufnehmen". | Detailfenster zeigt nur noch einen Verweis auf den entstandenen Fall bzw. Karteieintrag. | — (nur lesend). |

## Geschäftsregeln
**Automatische Verteilung nach Fachbereich (03.09)**
Wenn eine qualifizierte Anfrage (1) einen eindeutigen Fachbereich hat, (2) dieser
Fachbereich einer Belegungsgruppe zugeordnet ist (Orthopädie → Gruppe Orthopädie;
Neurologie, Geriatrie oder Innere → Gruppe Neuro-Geriatrie; SalutoCare hat keine
automatische Gruppe), (3) im Text ein Kostenträger klar benannt und nicht nur vermutet
ist (kein „vermutlich"/„eventuell"), und (4) keine Absage-Formulierung („kein
Interesse", „Widerruf") erkannt wird, dann wird die Anfrage automatisch der
zugehörigen Belegungsgruppe zugeteilt und erscheint sofort im Verteilungsprotokoll.
*Beispiel (synthetisch):* Ein Fax des Sozialdienstes meldet einen Patienten mit
Diagnose „Knie-TEP" (Fachbereich Orthopädie); Kostenträger „GKV (AOK Bayern)" ist klar
benannt, keine Absage im Text → automatische Zuteilung an die Gruppe Orthopädie, ohne
dass die Leitung die Anfrage öffnen muss.
*Grenzfälle:* Fehlt der Fachbereich oder ist er „Unklar", ODER lässt der Text auf eine
Selbstzahler-/Premium-Anfrage schließen (Wörter wie „Suite", „Selbstzahler", „Premium"
— auch außerhalb des Fachbereichs SalutoCare), ODER ist der Kostenträger nur vage
angedeutet, landet die Anfrage stattdessen in „Braucht Entscheidung". SalutoCare-
Anfragen werden nie automatisch verteilt — sie sind bewusst immer ein Entscheidungsfall
der Leitung, weil es dafür keine feste Gruppen-Zuordnung gibt.

**Einstufung braucht-Entscheidung / einzeln (automatisch verteilt) / passiv (03.10, 03.03/03.07/03.08)**
Jede eingehende Anfrage wird zunächst als „qualifiziert" (konkretes Anliegen mit
erkennbarer anfragender Person) oder „passiv" (allgemeines Interesse ohne konkreten
Bedarf, z. B. Broschüren-Download oder eine anonyme Frage ohne Namen) eingestuft.
Passive Anfragen laufen nie in eine der beiden anderen Gruppen, sondern direkt in „Kein
Handlungsbedarf", bis eine Mitarbeiterin sie in die Patientenkartei aufnimmt.
Qualifizierte Anfragen durchlaufen anschließend die automatische Verteilung: erfüllen
sie deren Bedingungen, gelten sie als „automatisch verteilt" (Protokoll „Einzelne
Anfragen"); sonst als „Braucht Entscheidung".
*Beispiel:* Eine anonyme E-Mail „Habt ihr noch freie Plätze?" ohne Namen und ohne
konkretes Anliegen wird als „passiv" eingestuft und erscheint unter „Kein
Handlungsbedarf" mit dem Hinweis, dass es sich um einen passiven Kontakt handelt.
*Grenzfälle:* Eine passive Anfrage mit erkennbarer Einzelperson (z. B. ein
Broschüren-Download mit Namen und Kontaktfreigabe) wird trotzdem nie automatisch
verteilt — sie kann höchstens direkt in die Patientenkartei überführt werden, nicht in
einen Fall.

**„NEU"/ungelesen-Logik (03.05)**
Eine frisch eingegangene Anfrage wird optisch als neu hervorgehoben (Rahmen +
Beschriftung „NEU"), bis sie eingestuft bzw. von einer Mitarbeiterin geöffnet wurde.
*Beispiel (Prototyp-Demo):* Die simulierte Anfrage erscheint sofort hervorgehoben mit
„NEU" und verliert die Hervorhebung, sobald das System sie nach rund 1,6 Sekunden
automatisch klassifiziert.
*Grenzfälle/Demo-Hinweis:* Im Prototyp ist dieser Zeitraffer ein reiner Demo-Effekt der
Simulationsfunktion — im echten Postfach-Betrieb muss die Kennzeichnung so lange
bestehen bleiben, bis eine Mitarbeiterin die Anfrage tatsächlich geöffnet hat,
unabhängig davon, ob sie automatisch oder manuell eingestuft wurde (siehe Offene
Punkte).

Zwei weitere Geschäftsregeln — die Sterne-Einstufung mit Begründungspflicht und die
Produktlinien-Kennzeichnung SalutoCare/Premium — wirken zwar schon auf den ersten
automatischen Vorschlag in dieser Liste, werden aber erst im Anfrage-Detailfenster
gesetzt bzw. überschrieben; sie stehen vollständig in Kapitel 04.

## Feldkatalog
| Feld | Typ | Pflicht | Beispiel | Bemerkung |
|---|---|---|---|---|
| Kanal | Text, fester Wertevorrat | Ja | „Zuweiser-Fax" | Werte: Telefon, E-Mail, Website, Zuweiser-Fax, Recare, PRIMO MEDICO (Premium-Netzwerk). |
| Betreff | Text | Ja | (synthetisch) „Fax: RHÖN Bad Neustadt, Anmeldung AHB nach Schlaganfall" | Kurzform für die Listenansicht. |
| Nachrichtentext | Text, mehrzeilig | Ja | (synthetisch) „Kurzanmeldung Sozialdienst … Kostenträger: PKV …" | Rohtext, aus dem Regeln und KI Angaben ableiten. |
| Eingangszeitpunkt | Zeitstempel (im Prototyp als relative Zeitangabe) | Ja | „vor 3 Std." | Bestimmt u. a. die Sortierung nach Dringlichkeit. |
| Fachbereich | Text, fester Wertevorrat | Nein (kann „Unklar" sein) | „Orthopädie" | Werte: Orthopädie, Neurologie, Geriatrie, Innere, SalutoCare, Unklar. |
| Einstufung | Text (qualifiziert/passiv) | Ja | „qualifiziert" | Steuert, in welcher der drei Listen-Gruppen die Anfrage erscheint. |
| Anfragende(r) | Text | Nein | (synthetisch) „Ehefrau Herrmann meldet Ehemann Gerhard (72) an" | Fehlt dieses Feld (z. B. anonyme Mail), gilt die Anfrage praktisch als nicht kontaktierbar. |
| Kurzfassung | Text | Nein | (synthetisch) „Sozialdienst … meldet … zur AHB an — PKV, Entlassung in 4 Tagen." | Vor der KI-Analyse angezeigter Stichpunkt-Ersatz; nach der Analyse durch die KI-Zusammenfassung abgelöst (Kapitel 04). |
| Belegungsgruppe | Text (Orthopädie/Neuro-Geriatrie) | Nein, bis zur Freigabe | „Neuro-Geri" | Erst gesetzt, sobald automatisch verteilt oder von der Leitung freigegeben. |
| Sterne-Bewertung | Zahl 1–5 | Nein, bis zur ersten Einstufung | 4 | Ableitung und Überschreibung: siehe Kapitel 04, Geschäftsregeln. |
| Automatisch verteilt | Ja/Nein | Ja (impliziert Nein, wenn nicht gesetzt) | true | Unterscheidet „automatisch verteilt" vom Protokoll für manuell zugewiesene Anfragen. |
| Produktlinien-Kennzeichnung | Ja/Nein | Ja (impliziert Nein) | true | SalutoCare/Premium-Marker, volle Regel in Kapitel 04.06. |
| Bearbeitungshinweis | Text | Nein | (synthetisch) „Rückruf priorisieren — Kostenträger klären." | Frei editierbares Notizfeld für die Übergabe an die Bearbeiterin. |
| Patient/Patientin | Objekt {Name, Alter} | Nein | {Name: „Gerhard Herrmann", Alter: 72} (synthetisch) | Nur gesetzt, wenn Name/Alter aus der Anfrage eindeutig hervorgehen. |
| Kontakt-Einwilligung | Text/Status | Nein | „ja" | Bislang in keinem Ablauf automatisch belegt, siehe Offene Punkte. |
| Verknüpfter Fall | Referenz auf Fall | Nein, erst nach Übernahme | Fall-ID 12 | Wird beim Übernehmen gesetzt, macht die Anfrage nur noch lesbar. |
| Bearbeitet/erledigt | Ja/Nein | Ja (impliziert Nein) | true | Verhindert doppelte Übernahme und zeigt die Anfrage unter „Kein Handlungsbedarf". |

## Abnahmekriterien
Die vollständige, nummerierte Abnahme-Checkliste für das 20-Stunden-Testprojekt
(Postfachanbindung, Anfrageliste, KI-Analyse, Übernahme in einen Fall) steht gebündelt
in Kapitel 04, Abschnitt „Abnahmekriterien" — sie deckt beide Kapitel gemeinsam ab,
weil die vier beauftragten Funktionen über Eingang und Detailfenster hinweg
zusammenwirken.

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
