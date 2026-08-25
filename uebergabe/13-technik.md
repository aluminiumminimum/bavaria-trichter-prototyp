# Kapitel 13 · Technische Anforderungen & Schnittstellen

**Ansicht im Prototyp:** kein eigener Bildschirm — der Prototyp ist eine einzelne,
selbsttragende Datei ohne Server, ohne Datenbank und ohne Mehrbenutzerbetrieb; dieses Kapitel
beschreibt deshalb überwiegend Anforderungen, die im Prototyp **nicht** umgesetzt sind
· [Live-Ansicht](https://aluminiumminimum.github.io/bavaria-trichter-prototyp/)

## Zweck
Dieses Kapitel bündelt die technische Grundausstattung, auf der jedes fachliche Feature aus
den vorigen Kapiteln erst zu echter Klinik-Software wird: Anbindung an Fremdsysteme,
Mehrbenutzerfähigkeit, Datenschutz-Infrastruktur und Hosting. Ohne diese Grundlagen bleibt
jede Fachfunktion eine Insel-Demo für eine einzelne Person im selben Browser mit lokalem
Speicher, nicht eine mehrbenutzerfähige, DSGVO-konforme Software für den echten Klinikalltag.
Adressiert sind IT-Verantwortliche der Klinik und die TriniDat-Entwicklung gemeinsam als
Abnahmegrundlage für die Rahmenbedingungen, nicht für einzelne Bildschirme.

## Funktionen
| Pos. | Funktion | Verhalten (2–4 Sätze) | Einordnung |
|---|---|---|---|
| 13.01 | REST-Schnittstelle | Die Software muss eine programmierbare Schnittstelle bereitstellen, über die andere Systeme (Kliniksoftware, Abrechnung, künftige Auswertungswerkzeuge) lesend und schreibend auf Anfragen, Fälle, Patienten und Belegung zugreifen können, ohne die Oberfläche zu bedienen. Das betrifft insbesondere den in Kapitel 07 vorgesehenen lesenden Import von Assessment-Werten (Barthel, FIM, ICD) aus der Kliniksoftware. | Im Prototyp nicht enthalten — es gibt keine Serverseite, alles läuft rein im Browser mit lokalem Speicher |
| 13.02 | Ereignis-Webhooks | Tritt im System ein definiertes Ereignis ein (neue Anfrage, Statuswechsel eines Falls, neue Aufnahme), muss die Software aktiv eine Benachrichtigung an ein externes System senden können, statt dass dieses ständig nachfragen muss — etwa um ein Abrechnungssystem oder ein BI-Werkzeug synchron zu halten. | Im Prototyp nicht enthalten |
| 13.03 | Andockpunkte Fremdlösungen (Telefonie: „Anruf auslösen", „Akte öffnen") | Die Telefonanlage selbst ist ausdrücklich **nicht** Teil des Angebots — die Klinik nutzt ihre eigene Anlage. Die Software soll aber zwei Andockpunkte bereitstellen: aus einer Fallakte heraus per Klick einen Anruf bei der hinterlegten Rufnummer auslösen, und umgekehrt bei eingehendem Anruf anhand der erkannten Rufnummer automatisch die passende Fallakte öffnen. | Im Prototyp nicht enthalten — die separate „Call AI"-Seite ist ein eigenständiges Warteschleifen-Werkzeug ohne Verbindung zu einer echten Telefonanlage und deckt diese Anforderung nicht ab |
| 13.04 | KI-Anbindung ans CRM (Sperrschalter, Protokoll) | Prototyp-Vorbild vorhanden: Ein Statuspunkt in der Kopfzeile zeigt „KI aktiv" / „KI gesperrt" / „KI offline". Ohne einen zur Laufzeit gesetzten Zugangscode bleibt die KI gesperrt — jeder Aufruf schlägt serverseitig ab (401) und die Oberfläche zeigt stattdessen einen erkennbar gekennzeichneten Demo-Fallback statt eines echten KI-Ergebnisses. Der eigentliche Modellaufruf läuft ausschließlich über einen externen Proxy-Server (kein Schlüssel im Browsercode). Ein Protokoll im Sinn eines Audit-Logs aller KI-Aufrufe existiert im Prototyp nicht — einzig das Ergebnis eines KI-gestützten Dokumenten-Scans wird als Text in den normalen Fallverlauf geschrieben. | Produkt (Sperrschalter-Prinzip und Proxy-Architektur als Vorbild), echtes Zugriffsprotokoll fehlt |
| 13.05 | KI on premise (TriniDat stellt Lösung, nur Einrichtung kalkuliert) | Aus Datenschutzgründen soll die KI-gestützte Analyse optional nicht über einen externen Cloud-Anbieter laufen, sondern als von TriniDat bereitgestellte, selbst gehostete Lösung verfügbar sein; kalkuliert wird dabei nur die Einrichtung, nicht ein eigenes Modelltraining. | Im Prototyp nicht enthalten — die KI-Anbindung läuft ausschließlich über einen externen Proxy (vgl. 13.04); das Architekturprinzip „kein Schlüssel im Client, Aufruf ausschließlich serverseitig" ließe sich aber unverändert auf eine On-Premise-Instanz übertragen |
| 13.06 | Mehrbenutzerbetrieb (Sperren, Konflikte) | Mehrere Mitarbeiterinnen arbeiten gleichzeitig im selben System — zum Beispiel zwei Koordinatorinnen im selben Anfragen-Pool (vgl. Kapitel 11.04). Die Software muss verhindern, dass zwei Personen gleichzeitig denselben Fall bearbeiten oder dieselbe Anfrage doppelt übernehmen, und im Konfliktfall anzeigen, wer gerade woran arbeitet. | Im Prototyp nicht enthalten — der Prototyp läuft für genau eine Nutzerin in einem Browser mit lokalem Speicher, es gibt keine Serverseite und daher keine echte Gleichzeitigkeit; die „Übernehmen"-Logik aus Kapitel 11 simuliert nur ein einziges Nutzerkonto |
| 13.07 | Echtzeit-Benachrichtigungen | Geht eine neue Anfrage ein, läuft eine Frist ab oder schickt ein Kollege eine interne Nachricht, sollen betroffene Mitarbeiterinnen ohne manuelles Neuladen der Seite sofort informiert werden (z. B. Badge, Ton, Push). | Im Prototyp nicht enthalten — Listen und Zähler aktualisieren sich nur, weil die gesamte Oberfläche nach jeder eigenen Aktion vollständig neu aufgebaut wird, nicht durch eine Benachrichtigung bei fremden Ereignissen |
| 13.08 | Rollen/Rechte technisch | Verschiedene Rollen (Leitung, Koordination, Belegung, Abrechnung, Recovery Manager, künftig auch Zuweiser-Nutzerinnen) benötigen unterschiedliche, technisch durchgesetzte Rechte für Sicht- und Änderungszugriff. | Im Prototyp nicht enthalten — der Rollenschalter Leitung/Koordination (Kapitel 11) und das Auswahlfeld „Verantwortlich" in der Fallakte sind reine Anzeige-Umschaltung ohne Anmeldung und ohne serverseitige Zugriffsprüfung; jede Person sieht im Prototyp alle Daten |
| 13.09 | Einwilligungs-Dokumentation und Löschkonzept | Für jede Person muss nachvollziehbar dokumentiert sein, ob und wofür eine Kontakteinwilligung vorliegt (z. B. Behandlung, Newsletter, Post), inklusive Form, Datum und Widerrufsmöglichkeit, sowie ein Löschkonzept für abgelaufene Aufbewahrungsfristen oder Löschverlangen. Prototyp-Vorbild vorhanden: Die Personen-Registry führt je Person ein Einwilligungsfeld mit Status (erteilt/offen/widerrufen), Form, Datum und einer Liste von Zwecken; aktive Ansprache und Kampagnen-Vorschläge prüfen diesen Status vor jeder Aktion, Fälle zeigen zusätzlich einen Kontaktfreigabe-Status als Ampel (freigegeben/prüfen/gesperrt). | Produkt (Einwilligungsfeld als Vorbild), ein Löschkonzept fehlt vollständig — im Prototyp werden Daten nie gelöscht, nur der Status auf „Widerruf" gesetzt |
| 13.11 | Hosting in Deutschland | Alle personenbezogenen Daten müssen auf Servern in Deutschland bzw. der EU mit deutschem Recht gehostet werden, DSGVO-konform. | Im Prototyp nicht enthalten — es gibt keinen eigenen Server, die Auslieferung erfolgt über einen US-Anbieter (unkritisch, da ausschließlich synthetische Demo-Daten ohne echten Personenbezug); der einzige externe Netzaufruf (KI-Proxy, vgl. 13.04) müsste für den Produktivbetrieb gesondert auf Serverstandort geprüft werden |
| 13.12 | Unterlagen für AVV und Verarbeitungsverzeichnis | Die Klinik benötigt von TriniDat die Unterlagen für einen Auftragsverarbeitungsvertrag und zur Vervollständigung ihres Verarbeitungsverzeichnisses nach Art. 30 DSGVO — u. a. welche Daten wo verarbeitet werden, welche Subunternehmer (Hosting, KI-Anbieter) beteiligt sind und welche technisch-organisatorischen Maßnahmen bestehen. | Im Prototyp nicht enthalten — kein Produktivbetrieb, keine echten Personendaten, daher bislang keine solchen Unterlagen nötig |

## Datenobjekte
Die einzigen im Prototyp bereits vorhandenen Datenspuren mit Bezug zu diesem Kapitel sind der
zur Laufzeit gesetzte KI-Zugangscode (rein lokal im Browser gespeichert, kein Bestandteil
eines Nutzerkontos) und das Einwilligungsfeld der Personen-Registry (Status, Form, Datum,
Zwecke). Alle übrigen Positionen dieses Kapitels betreffen Infrastruktur, die im Prototyp
keine Entsprechung als Datenobjekt hat. Details zum Einwilligungsfeld siehe datenmodell.md
(Entität Patient/Person).

## Offene Punkte für Trinidat
- Welche Ereignisse sollen Webhooks auslösen (Pos. 13.02), und an welche Zielsysteme?
- Cloud-Proxy oder On-Premise-KI (Pos. 13.04/13.05) — das ist eine Entscheidung der
  Geschäftsführung, keine rein technische; wovon hängt sie ab (Kosten, Datenschutzauflagen)?
- Welches Sperrverhalten bei Mehrbenutzerkonflikten wird erwartet (Pos. 13.06) — sofortige
  Sperrung beim Öffnen eines Falls, oder erst bei widersprüchlichem Speichern?
- Rechenzentrumsstandort und Hosting-Anbieter (Pos. 13.11) sind noch nicht festgelegt.
- Welche Aufbewahrungs- und Löschfristen gelten für welche Personengruppen (Pos. 13.09),
  und wer löst die Löschung aus — automatisch nach Fristablauf oder nur auf Antrag?

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
