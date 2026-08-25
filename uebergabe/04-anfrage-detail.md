# Kapitel 04 · Anfrage-Detailfenster — Testprojekt

**Ansicht im Prototyp:** Seitenleiste → Fälle → Reiter „Anfragen" → eine Anfragekarte
antippen (öffnet rechts angedockt, auf Mobilgeräten vollflächig)
· [Live-Ansicht](https://aluminiumminimum.github.io/bavaria-trichter-prototyp/)

## Zweck
Das Detailfenster ist der Arbeitsplatz, an dem eine einzelne Anfrage aus dem Eingang
(Kapitel 03) geprüft, angereichert und in einen Fall überführt wird — für die Leitung,
die jeden qualifizierten Kontakt einstuft und einer Belegungsgruppe zuteilt, bevor eine
Mitarbeiterin ihn übernimmt. Es bündelt Originaltext, automatisch erkannte bzw. per
KI vorgeschlagene Kerninformationen und die abschließende Einstufung an einer Stelle,
damit niemand zwischen Postfach, Notizzettel und CRM wechseln muss. Ohne dieses Fenster
gäbe es keinen strukturierten Übergang von einer eingehenden Nachricht zu einem
bearbeitbaren Fall — jede Anfrage müsste manuell nacherfasst werden.

## Funktionen
| Pos. | Funktion | Verhalten (2–4 Sätze) | Einordnung |
|---|---|---|---|
| 04.01 | Seitenfenster mit Kopf | Öffnet als rechts angedockte Detailansicht (auf Mobilgeräten vollflächig) mit Initialen-Avatar, Namen der anfragenden Person, Kanal-Kennzeichnung, Eingangszeitpunkt und Einstufung „qualifiziert"/„passiv" im Kopf. | Produkt |
| 04.02 | Block „Originalnachricht" (dauerhaft abrufbar) | Der vollständige Text der eingegangenen Nachricht steht immer sichtbar bzw. aufklappbar zur Verfügung — unabhängig davon, ob die Anfrage noch offen, bereits einer Gruppe zugewiesen oder schon als Fall bzw. Datenbankeintrag abgeschlossen ist. | Produkt (echte Anhänge fehlen im Prototyp, s. Offene Punkte) |
| 04.03 | Block „Automatisch erkannt" | Solange keine KI-Analyse gelaufen ist, zeigt ein Block ausschließlich, was sich regelbasiert direkt aus dem Text ablesen lässt (Kostenträger-Schlagwort, Frist-/Dringlichkeitshinweis, Fachbereich) — nie einen erfundenen, formulierten Zusammenfassungssatz. | Produkt |
| 04.04 | „KI: Anfrage analysieren" (Mensch bestätigt) | Ein Knopf löst die KI-Analyse aus, ersetzt den Block „Automatisch erkannt" durch eine KI-Zusammenfassung und befüllt Fachbereich, Kostenträger, Dringlichkeit und Sterne-Vorschlag direkt in den darunterliegenden Feldern; jedes Feld bleibt danach frei änderbar. Ohne erreichbare KI-Anbindung oder ohne freigeschalteten Zugangscode erscheint stattdessen ein aus den Signalen der jeweiligen Anfrage abgeleiteter Ersatz, deutlich als „KI offline" gekennzeichnet — nie ein fest formulierter Text einer fremden Anfrage. | Produkt (Zugangscode-Freischaltung ist Prototyp-Mechanik, im Produkt durch echte Benutzeranmeldung ersetzt) |
| 04.05 | Einstufung (5 Sterne mit Begründung) | Eine Reihe von fünf einzeln klickbaren Sternen zeigt und erlaubt die Überschreibung der Lead-Bewertung; die automatische Ersteinstufung liefert dazu immer einen kurzen Begründungstext aus den erkannten Signalen (z. B. „PKV erkannt · konkrete Anfrage"). | Produkt |
| 04.06 | Produktlinien-Kennzeichnung (SalutoCare/Premium) | Ein Schalter markiert die Anfrage als SalutoCare/Premium; er ist für Anfragen aus dem Fachbereich SalutoCare vorbelegt, lässt sich aber für jede Anfrage unabhängig vom Fachbereich umschalten (z. B. eine Selbstzahler-Anfrage außerhalb von SalutoCare). | Produkt |
| 04.07 | Block „Belegungs-Gruppe" | Zwei Auswahlkacheln (Orthopädie, Neuro-Geriatrie) zeigen je die Zahl aktuell offener Anfragen im Pool der Gruppe; eine Auswahl ist Pflicht, bevor der Knopf „Gruppe zuweisen & freigeben" die Anfrage aus „Braucht Entscheidung" nimmt und im Pool der gewählten Gruppe ablegt. | Produkt |
| 04.08 | Block „Vollständigkeit" (Pflichtangaben-Prüfliste) | Fünf Prüfpunkte (Kostenträger, Fachbereich, Wunschtermin, Kontaktdaten, Kontakt-Einwilligung) zeigen je einen erkannten Wert oder, falls nicht erkennbar, eine vorformulierte Rückfrage. | Produkt |
| 04.09 | Rückfragen erzeugen | Jeder in der Vollständigkeits-Prüfliste offen gebliebene Punkt wird beim Übernehmen automatisch zu einer Rückfrage auf dem entstehenden Fall — keine manuelle Nacherfassung nötig. | Produkt |
| 04.10 | Übernahme in einen Fall | Aus dem Pool heraus (Board oder „Mein Tag" der zuständigen Gruppe) wandelt ein Klick auf „Übernehmen" die Anfrage in einen bearbeitbaren Fall um: Fachbereich, Sterne-Einstufung, Produktlinien-Kennzeichnung und Originalnachricht werden übernommen, offene Vollständigkeits-Punkte werden zu Rückfragen, eine Bearbeiterin wird eingetragen. Ein zweiter Übernahmeversuch derselben Originalnachricht erzeugt keinen doppelten Fall, sondern öffnet den bestehenden. | Produkt |

## Datenobjekte
- **Anfrage** (Kapitel 03) — gelesen und im Detailfenster direkt beschrieben (Sterne,
  Bearbeitungshinweis, Produktlinien-Kennzeichnung, Belegungsgruppe, KI-Ergebnisfelder).
- **Fall** (Kapitel 06, vollständiger Feldkatalog in datenmodell.md) — bei „Übernehmen"
  aus der Anfrage neu erzeugt; welche Felder dabei befüllt werden, steht im Feldkatalog
  unten.
- **KI-Anbindung** (Kapitel 01.04/13.04) — liefert die Analyseergebnisse; Sperrschalter-
  und Protokollverhalten sind dort zentral geregelt, hier nur genutzt.

## Offene Punkte für Trinidat
- Der Sperrschalter „KI gesperrt" verhindert im Prototyp keinen tatsächlichen
  Analyse-Aufruf clientseitig — ohne Zugangscode lehnt lediglich der Server den Aufruf
  ab, und die Demo zeigt den Ersatz. Zu klären, ob im Produkt der Aufruf clientseitig
  unterbunden und jeder unterbundene Versuch protokolliert werden soll, wie es die
  Statusanzeige (Kapitel 01.04) verspricht.
- Eine manuelle Änderung der Sterne-Einstufung durch eine Mitarbeiterin verlangt aktuell
  keine neue Begründung — nur die automatische Ersteinstufung liefert einen
  Grundtext. Zu klären, ob Übersteuerungen im Produkt eine Pflichtbegründung brauchen.
- Wie lange ein „KI gesperrt"-Ereignis protokolliert bleibt und wo dieses Protokoll für
  die Leitung sichtbar ist, ist nicht Teil des Prototyps und von Trinidat zu
  spezifizieren.

## Zustandsmodell
Das Detailfenster zeigt je nach Zustand der zugrundeliegenden Anfrage (volles Modell
in Kapitel 03) eines von vier Layouts:

| Fenster-Zustand | Zeigt sich, wenn … | Inhalt | Mögliche Aktion |
|---|---|---|---|
| Triage (offen, „Braucht Entscheidung") | Anfrage qualifiziert, ohne Belegungsgruppe, nicht abgeschlossen. | Originalnachricht, „Automatisch erkannt"/KI-Zusammenfassung, Sterne, Produktlinien-Schalter, Belegungsgruppen-Auswahl, Vollständigkeits-Prüfliste, Bearbeitungshinweis. | KI-Analyse auslösen, Sterne überschreiben, Gruppe wählen und freigeben. |
| Im Pool | Anfrage hat eine Belegungsgruppe, ist aber noch nicht übernommen. | Zusammenfassung plus Hinweis „Im Pool von … — wartet auf Übernahme". | Nur lesend; Übernahme erfolgt über Board/„Mein Tag", nicht aus diesem Fenster. |
| Passiv, offen | Anfrage als „passiv" eingestuft, noch nicht in der Datenbank. | Zusammenfassung plus Sterne-Anzeige. | „In Datenbank aufnehmen". |
| Abgeschlossen | Anfrage bereits Fall oder Datenbankeintrag. | Zusammenfassung, nur lesend. | „Fall öffnen" bzw. Bestätigung „✓ in Datenbank". |

Innerhalb der KI-Analyse selbst gibt es zusätzlich einen einfachen Unterzustand je
Anfrage: **nicht analysiert** (Block „Automatisch erkannt") → **analysiert** (Block
„KI-Zusammenfassung", online oder als Offline-Ersatz gekennzeichnet) → erneut
auslösbar („KI: Anfrage neu analysieren").

## Geschäftsregeln
**Sterne-Einstufung mit Begründungspflicht (04.05)**
Eine automatische Erst-Einstufung ordnet jeder Anfrage 1 bis 5 Sterne zu: 1 Stern bei
erkannter Absage, 4 Sterne bei einer konkreten Anfrage mit Premium-/Selbstzahler-Signal,
3 Sterne bei einer konkreten Anfrage ohne Premium-Signal, sonst 2 Sterne. Jede
automatische Einstufung wird zusammen mit einer nachvollziehbaren Begründung aus den
erkannten Signalen angezeigt (z. B. „PKV erkannt · Frist dringend · konkrete
Anfrage"). Eine Mitarbeiterin kann die Einstufung jederzeit durch Anklicken der
gewünschten Sternezahl überschreiben.
*Beispiel (synthetisch):* Eine Website-Anfrage einer Selbstzahlerin, die konkret nach
der Suite und nach Preisen fragt, gilt als „konkret" und „Premium" → automatisch 4
Sterne, Begründung „konkrete Anfrage".
*Grenzfälle:* Eine Anfrage mit erkannter Absage-Formulierung („kein Interesse",
„Widerruf") bekommt immer nur 1 Stern, unabhängig von anderen Signalen. Überschreibt
eine Mitarbeiterin die Sterne manuell, verlangt der Prototyp aktuell keine neue
Begründung — nur der ursprüngliche automatische Grundtext bleibt sichtbar (siehe Offene
Punkte).

**Produktlinien-Kennzeichnung SalutoCare/Premium (04.06)**
Eine Anfrage wird als SalutoCare/Premium markiert, wenn ihr Fachbereich SalutoCare ist;
unabhängig davon kann eine Mitarbeiterin die Kennzeichnung für jede Anfrage per
Schalter ein- oder ausschalten.
*Beispiel:* Eine Selbstzahler-Anfrage im Fachbereich Orthopädie (kein
SalutoCare-Fachbereich) kann trotzdem manuell als Premium markiert werden, wenn im
Gespräch eine Komfort-Suite gewünscht wird.
*Grenzfälle:* Die Kennzeichnung wirkt nur auf die Anfrage bzw. den daraus entstehenden
Fall — sie ändert nicht automatisch die Belegungsgruppe (SalutoCare bleibt weiterhin
ein reiner Entscheidungsfall ohne feste Gruppe, Kapitel 03).

**Rückfragen aus offenen Pflichtangaben (04.08/04.09)**
Jeder der fünf Vollständigkeits-Punkte (Kostenträger, Fachbereich, Wunschtermin,
Kontaktdaten, Kontakt-Einwilligung), der beim Übernehmen noch nicht erfüllt ist, wird
automatisch zu einer offenen Rückfrage auf dem neu entstehenden Fall.
*Beispiel:* Fehlt bei einer Anfrage der Kostenträger, entsteht am neuen Fall
automatisch die Rückfrage „Kostenträger (PKV/GKV/Beihilfe) abklären", die im weiteren
Bearbeitungsablauf (Kapitel 06) abgehakt werden kann.
*Grenzfälle:* Die Kontakt-Einwilligung wird in keinem bisherigen Ablauf automatisch
erfüllt — sie erscheint daher praktisch bei jeder Anfrage als offene Rückfrage (siehe
Kapitel 03, Offene Punkte).

**Dubletten-Schutz bei der Übernahme (04.10)**
Ist für dieselbe Originalnachricht bereits ein Fall angelegt worden (z. B. weil eine
Nachricht doppelt im Postfach ankam oder zweimal übernommen wird), öffnet ein erneuter
Übernahmeversuch den bestehenden Fall, statt einen zweiten anzulegen.
*Beispiel:* Übernimmt eine Mitarbeiterin eine Anfrage versehentlich zweimal, öffnet der
zweite Klick lediglich den bereits angelegten Fall mit dem Hinweis „Bereits als Fall
vorhanden".
*Grenzfälle:* Die Prüfung vergleicht den vollständigen Nachrichtentext; zwei
unterschiedliche Nachrichten mit ähnlichem, aber nicht identischem Text gelten als
unterschiedliche Anfragen und erzeugen jeweils einen eigenen Fall.

## Feldkatalog
| Feld | Typ | Pflicht | Beispiel | Bemerkung |
|---|---|---|---|---|
| KI-Analyse durchgeführt | Ja/Nein | Ja (impliziert Nein) | true | Steuert, ob „Automatisch erkannt" oder „KI-Zusammenfassung" angezeigt wird. |
| KI-Zusammenfassung | Text, 2–3 Sätze | Nein | (synthetisch) „Sozialdienst meldet Patienten (68) nach Schlaganfall zur AHB an. PKV, Entlassung in 4 Tagen. Angaben wirken vollständig." | Ersetzt nach der Analyse die automatisch erkannten Stichpunkte. |
| KI-Ergebnis: Fachbereich | Text | Nein | „Neurologie" | Wird nur übernommen, wenn die KI einen Wert liefert — sonst bleibt der bisherige Fachbereich stehen. |
| KI-Ergebnis: Kostenträger | Text | Nein | „PKV" | Wie oben; ohne Erkennung erscheint stattdessen eine offene Rückfrage. |
| KI-Ergebnis: Dringlichkeit | Text (hoch/mittel/niedrig) | Nein | „hoch" | Fließt in den Bearbeitungshinweis ein. |
| KI-Ergebnis: Sterne-Vorschlag | Zahl 1–5 | Nein | 4 | Übernimmt nur, wenn geliefert; jederzeit von Hand überschreibbar. |
| KI-Ergebnis: Sterne-Begründung | Text | Nein | „Konkrete Anfrage mit familiärer Dringlichkeit" | Wird an den Bearbeitungshinweis angehängt. |
| Vollständigkeits-Prüfpunkt | 5 feste Punkte, je Status erfüllt/offen + Rückfrage-Text | Ja (immer alle fünf geprüft) | „Kontaktdaten: offen — vollständige Kontaktdaten erfragen" | Wird bei jedem Öffnen neu aus Text und Anfrage-Feldern berechnet, nicht separat gespeichert. |
| Rückfrage (am entstehenden Fall) | Liste {Frage, erledigt} | Nein | (synthetisch) [{„Kostenträger (PKV/GKV/Beihilfe) abklären", erledigt: false}] | Entsteht automatisch aus offenen Vollständigkeits-Punkten bei der Übernahme. |
| Bearbeiterin (am entstehenden Fall) | Text | Ja | „S. Koordination" | Aktuell im Prototyp unabhängig davon gesetzt, wer den Übernahme-Klick ausführt (siehe Offene Punkte). |

## KI-Analyse-Kontrakt
- **Eingabe:** Kanal, Betreff und vollständiger Rohtext der Anfrage; ist bereits ein
  Originaltext hinterlegt, wird dieser zusätzlich mitgeschickt. Keine weiteren
  Klinikdaten werden übertragen.
- **Ausgabefelder:** Zusammenfassung (2–3 Sätze), Fachbereich, Vorschlag für die
  Belegungsgruppe, Kostenträger, Diagnose, Dringlichkeit, Sterne-Vorschlag (1–5),
  Begründung der Sterne-Einstufung, ein Bearbeitungshinweis.
- **Verhalten bei Nichterkennung:** Liefert die Analyse für ein Feld keinen Wert (z. B.
  Kostenträger im Text nicht erkennbar), bleibt das Feld leer bzw. unverändert — kein
  erfundener Wert wird eingesetzt. Die Vollständigkeits-Prüfliste (04.08) zeigt die
  offene Angabe weiterhin als fehlend, inklusive eines vorformulierten
  Rückfrage-Vorschlags (z. B. „Kostenträger (PKV/GKV/Beihilfe) abklären").
- **Mensch bestätigt immer:** Die Analyse füllt Felder direkt in der Ansicht vor,
  schreibt aber nichts endgültig fest — erst „Gruppe zuweisen & freigeben" hält die
  Einstufung verbindlich fest. Bis dahin kann jede Mitarbeiterin jeden Vorschlag
  überschreiben: Sterne einzeln anklickbar, Bearbeitungshinweis frei editierbar,
  Belegungsgruppe frei wählbar.
- **Sperrschalter „KI gesperrt":** Ist die KI-Anbindung gesperrt, unterbleibt der
  Analyse-Aufruf; die Anfrage bleibt vollständig manuell bearbeitbar — alle Felder,
  Sterne, Gruppenwahl und Freigabe funktionieren ohne KI. Jeder unterbundene
  Aufrufversuch wird protokolliert (zentraler Baustein der Statusanzeige „KI gesperrt",
  Kapitel 01.04, den die Anfrage-Analyse mitnutzt).
- Ist die KI-Anbindung technisch nicht erreichbar (nicht gesperrt, aber offline), zeigt
  die Ansicht sichtbar „KI offline" und bietet stattdessen einen aus den bereits
  erkannten Signalen der konkreten Anfrage abgeleiteten Analyse-Ersatz an — nie einen
  fest formulierten Text einer anderen (fremden) Anfrage.

## Abnahmekriterien (Testprojekt, 20 Stunden)
Das Testprojekt gilt als abgenommen, wenn an mindestens einer Beispiel-Anfrage je
Kanal alle folgenden Punkte geprüft und bestätigt sind:

1. Eine im angebundenen Postfach eingehende E-Mail erscheint innerhalb der mit
   Trinidat vereinbarten Frist automatisch als neue Anfrage im Eingang, ohne dass
   jemand sie manuell abtippt.
2. Die Originalnachricht jeder Anfrage bleibt dauerhaft abrufbar — auch nachdem die
   Anfrage bearbeitet, einer Gruppe zugewiesen oder in einen Fall übernommen wurde.
3. Anhänge der eingehenden Mail (z. B. Entlassbrief, Befund) sind der Anfrage
   zugeordnet und lassen sich aus dem Detailfenster heraus öffnen.
4. Jede Anfrage zeigt erkennbar, über welchen Kanal sie eingegangen ist (mindestens
   Telefon, E-Mail, Website, Zuweiser-Fax, Recare, Premium-Netzwerk).
5. Alle Kanäle laufen in einer einzigen Eingangsliste zusammen — es gibt keine
   separate Liste je Kanal.
6. Eine neu eingegangene, noch nicht geöffnete Anfrage ist optisch als ungelesen
   erkennbar; die Kennzeichnung verschwindet, sobald eine Mitarbeiterin sie öffnet.
7. Anfragen mit eindeutigem Fachbereich und erkanntem Kostenträger ohne Absage-Signal
   werden automatisch der zuständigen Belegungsgruppe zugeteilt und im
   Verteilungsprotokoll mit anfragender Person, Zielgruppe und Zeitpunkt aufgeführt.
8. Anfragen, bei denen Fachbereich oder Kostenträger nicht eindeutig sind, erscheinen
   in einer eigenen Liste „Braucht Entscheidung" und werden nicht automatisch verteilt.
9. Ein Klick auf „KI: Anfrage analysieren" liefert einen Vorschlag für Kostenträger,
   Fachbereich, Wunschtermin/Dringlichkeit sowie eine Sterne-Einstufung mit
   Begründung.
10. Kein Vorschlag der KI-Analyse wird automatisch festgeschrieben — jede
    Mitarbeiterin kann jedes vorgeschlagene Feld vor der Freigabe der Anfrage
    überschreiben.
11. Erkennt die KI-Analyse ein Feld nicht, bleibt es leer bzw. unverändert, und die
    Vollständigkeits-Prüfliste zeigt die fehlende Angabe mit einer vorformulierten
    Rückfrage an.
12. Ist die KI-Anbindung über den Sperrschalter „KI gesperrt" deaktiviert, unterbleibt
    der Analyse-Aufruf, die Anfrage bleibt vollständig manuell bearbeitbar, und der
    unterbundene Aufrufversuch wird protokolliert.
13. Eine freigegebene, noch nicht übernommene Anfrage erscheint als Pool-Eintrag ihrer
    Belegungsgruppe und lässt sich mit einem Klick in einen Fall umwandeln.
14. Der aus der Übernahme entstehende Fall trägt den Fachbereich, die
    Sterne-Einstufung, die Produktlinien-Kennzeichnung und die Originalnachricht der
    Anfrage sowie eine zuständige Bearbeiterin.
15. Für dieselbe Originalnachricht entsteht bei einem zweiten Übernahmeversuch kein
    zweiter Fall — es öffnet sich der bereits bestehende.

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
