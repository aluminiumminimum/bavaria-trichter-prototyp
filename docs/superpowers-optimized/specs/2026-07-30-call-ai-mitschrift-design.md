# Design-Spec: Call AI — vom Verbindungsaufbau zum dokumentierten Gespräch

**Datum:** 2026-07-30 · **Status:** Brainstorming / wartet auf Nutzer-Entscheidung
**Grundlage:** Bestehende Call-AI-View (`2026-07-30-telefon-view-design.md`, Cofounder-Bau,
live auf main), Deep-Research „Patientenrückruf-Automatisierung" (29.07.).
**Anlass:** Der gebaute Teil endet, sobald ein Mensch in der Leitung ist. Das Gespräch selbst
wird nicht mitgeschrieben und sein Ergebnis nicht in die Akte übernommen.

---

## 1. Ist-Zustand (im Browser verifiziert, 30.07.)

Was der Cofounder gebaut hat, funktioniert und ist sauber: Rückrufliste aus `faelle[]`
nach Sterne-Priorität, Live-Bühne mit Wellenform und Klassifikations-Chip, drei gescriptete
Szenarien, kein Selbst-Wählen, mobil 7 Tabbar-Einträge in einer Zeile ohne Overflow, keine
Console-Errors. Der Anrufbeantworter-Zweig ist **vollständig**: `wvNichtErreicht()` feuert,
Versuchszähler steigt, Wiedervorlage-Kaskade greift (4★ → morgen), zwei Log-Zeilen landen
in der Akte, Aufgabe und Frist werden gesetzt.

Die Lücke liegt genau da, wo das Gespräch beginnt. Drei Löcher, jedes einzeln nachgestellt:

| # | Loch | Beleg |
|---|---|---|
| 1 | **Kein Gesprächszustand.** `telUebernehmen()` ruft sofort `telEnde()` und springt in die Fallakte. Es gibt keine Phase „Gespräch läuft". | `index.html:8131–8140` |
| 2 | **Kein Inhalt.** In die Akte geht genau eine Zeile: „✆ Rückruf erreicht — Gespräch übernommen (Erkennung 1,5 s)". Was gesprochen wurde, existiert nirgends. | Fall 3 nach Übernahme: `f.log` +1 Zeile, sonst unverändert |
| 3 | **Kein Ergebnis.** Nach dem ARKADIA-Anruf bleibt `f.kosten === "angefragt"` und `f.aufgabe` unverändert — obwohl der Zweck des Anrufs die Kostenzusage war. | Szenario `kasse` bis Übernahme gespielt: `kosten:"angefragt"`, `aufgabe:"Angebot Komfortpaket senden"` |

Anders gesagt: die View modelliert bislang **Verbindungsaufbau**, nicht **Gesprächsführung**.
Der Assistent gewinnt Wartezeit zurück — aber die Dokumentationsarbeit, die den Rest des
Nachmittags kostet, bleibt vollständig beim Menschen.

---

## 2. Leitentscheidung: Wortlaut flüchtig, Ergebnis dauerhaft

Die Erzählung der View ist „läuft lokal · Audio verlässt das Haus nie · keine Aufzeichnung".
Ein Transkript ist die natürliche Fortsetzung — und gleichzeitig ihr Gegenteil, wenn es
dauerhaft gespeichert wird. Der Ausweg ist keine Kompromiss-Formel, sondern eine echte
Produktentscheidung:

> **Die Mitschrift lebt nur während des Gesprächs. In die Akte geht, was daraus folgt:
> eine Zusammenfassung, die erkannten Felder, das Ergebnis, der nächste Schritt.**

Technisch heißt das: der Wortlaut liegt in `TEL_STATE` (Session-only, nicht in `demoSave`),
und beim Übernehmen wird er verworfen. Das ist Datenminimierung nach Art. 5 DSGVO als
sichtbares Produktmerkmal — und der Satz, mit dem man diese Funktion einem Datenschutz-
beauftragten erklärt, ohne ins Schwimmen zu kommen.

Drei Wege standen zur Wahl:

**A · Mitschrift mit Einwilligung, Wortlaut flüchtig** — empfohlen. Volle Wirkung
(die Mitarbeiterin muss nichts mehr tippen), rechtlich tragfähig, erzählerisch konsistent.
Kosten: der Einwilligungs-Schritt muss ins Gespräch, das ist eine echte Verhaltensänderung
am Telefon.

**B · Keine Mitschrift, nur Strukturierung getippter Stichworte.** Rechtlich trivial,
kein Einwilligungsschritt. Aber der Pain Point bleibt: es wird weiter getippt, das System
räumt nur auf. Halbe Wirkung.

**C · Volles Transkript dauerhaft in der Akte.** Maximaler Effekt beim Nachlesen, aber
Gesundheitsdaten im Wortlaut nach Art. 9 DSGVO mit Löschkonzept, Auskunftspflicht,
Betriebsratsthema (das System schreibt auch die Mitarbeiterin mit). Für eine Klinik der
teuerste Weg, und die Demo müsste ihn verteidigen können.

---

## 3. Aufbau: die Kette bis zur Akte schließen

Neue Phase **`gespraech`** nach dem Alarm. Die Bühne verschwindet nicht mehr, sie wandelt
sich zum Arbeitsplatz. Drei Bausteine.

### B1 · Einwilligungs-Gate

Klick auf „Gespräch übernehmen" beendet nicht mehr die Bühne, sondern zeigt zuerst eine
Zeile im Kopf der Bühne:

> **Mitschrift?** Bitte fragen: „Ich schreibe für die Dokumentation mit — sind Sie
> einverstanden?"
> `[ ✓ Einwilligung erteilt · mitschreiben ]` `[ Ohne Mitschrift ]`

Die Wahl steht in der Bühne sichtbar an (Chip „Mitschrift läuft · Einwilligung 09:14" bzw.
„Ohne Mitschrift") und wird in die Akte protokolliert. Beim Kassen-Szenario entfällt das
Gate — dort ist der Gesprächspartner ein Versicherungsmitarbeiter, und mitgeschrieben wird
die Sachauskunft, nicht ein Patientengespräch (eigener Textbaustein, s. §6).

### B2 · Live-Mitschrift, zwei Spalten

**Links · Wortlaut** (nur bei Einwilligung): wachsende Sprecher-Zeilen, deterministisch aus
einem Skript je Szenario, gestaffelt eingeblendet wie die Ereignis-Zeitleiste. Sprecher als
Micro-Label („Fr. Probst" / „Klinik"), kein Zeitstempel je Zeile (das wirkt sonst wie eine
Beweisaufnahme).

**Rechts · „Der Assistent hat notiert"**: Feld-Kandidaten poppen auf, während das Gespräch
läuft — Kostenträger, Diagnose, Terminwunsch, Begleitperson, offene Rückfrage. Jeder Kandidat
trägt das Zitat, aus dem er stammt („…privat versichert, ARKADIA…"). Nichts wird gespeichert,
solange nicht geklickt wird.

**Ohne Einwilligung**: linke Spalte wird ein Stichwortfeld für die Mitarbeiterin, rechte
Spalte bleibt und füllt sich aus dem Getippten. Die Demo zeigt damit beide Modi in einem
Bild — auch das ist ein Verkaufsargument.

### B3 · Nachbereitung

„Gespräch beenden" öffnet die Nachbereitungs-Karte (Etiketten-Idiom, gleiche Bühne):

1. **Gesprächsnotiz** — 3–4 Sätze, editierbares Textfeld, vorbefüllt.
2. **Erkannte Felder** — je Zeile Wert, Quelle und ein Übernehmen-Knopf, darüber
   „Alles übernehmen".
3. **Ergebnis des Anrufs** — szenario-abhängig. Beim Kassen-Anruf drei Knöpfe:
   Zusage erteilt · abgelehnt · Rückfrage offen. Beim Patienten-Rückruf: Interesse
   bestätigt · Bedenkzeit · kein Interesse.
4. **Nächster Schritt** — Aufgabe + Frist als Vorschlag, ein Klick setzt beides.
5. **Wortlaut-Hinweis** — „Die Mitschrift wird beim Übernehmen verworfen. In die Akte
   geht die Zusammenfassung."

Erst nach dem Übernehmen springt die Demo in die Fallakte — dann aber in eine Akte, in der
sichtbar etwas passiert ist: Notiz im Gespräche-Reiter, Klärungsfelder gefüllt, Kostenstatus
gesetzt, Aufgabe mit Frist. Das ist der Moment, den der Dienstleister sehen soll.

---

## 4. Wiederverwendung statt neuer Muster

Der Prototyp hat für jedes Stück dieser Kette schon ein Muster. Nichts davon neu erfinden:

| Zweck | Vorhandenes Mittel | Ort |
|---|---|---|
| „KI schlägt vor, Mensch übernimmt per Klick" | `f.medVorschlag` + `kfMedVorschlag()` | `index.html:8272` |
| Offene Punkte aus dem Gespräch | `f.rueckfragen[]` → erscheinen automatisch getaggt in der Rückruf-Checkliste | `sopChecklisteHtml()`, `:7539` |
| Notiz im Gespräche-Reiter | Präfix `✎` — `lgTyp()` erkennt das als `note` | `:5288` |
| Kostenstatus setzen | **`kostenSetzen(f, wert, logText)`** — niemals `f.kosten=` | Projektregel |
| Systemzeile ins Protokoll | `telLog(f, txt)` (3-elementig, persistiert via `demoSave`) | `:8045` |
| Status nachziehen | `kfSyncStatus(f)` **vor** `renderAll()` | Projektregel |

Neue Felder an `faelle[]` nur additiv, kein `DEMO_SCHEMA`-Bump (die Mitschrift wird ja nicht
persistiert; `f.gespraech` als optionales Ergebnis-Objekt ist additiv und unkritisch).

---

## 5. Umsetzungsplan (Demo)

Vier Schritte, jeder einzeln verifizierbar und einzeln commit-fähig.

**T1 · Gesprächszustand.** `telUebernehmen()` entkoppeln: Phase `gespraech` statt `telEnde()`,
Einwilligungs-Gate, Bühne bleibt stehen, KPI-Zählung wandert ans Gesprächsende.
Verifikation: Szenario Mensch bis `gespraech`, Bühne steht, kein Timer läuft, Auflegen möglich.

**T2 · Mitschrift-Spalte.** Skripte je Szenario (`TEL_DIALOG`), gestaffelte Einblendung,
Sprecher-Labels, `prefers-reduced-motion`-fest (kein `opacity:0` in Basisregeln).
Verifikation: alle Zeilen erscheinen, bei reduced motion sofort vollständig sichtbar.

**T3 · Kandidaten-Spalte + Nachbereitung.** Kandidaten aus dem Skript ableiten, Karte bauen,
Übernahme je Zeile und gesammelt, Ergebnis-Knöpfe, Aufgaben-Vorschlag.
Verifikation: nach Übernahme sind `f.log`, `f.med`/`f.medVorschlag`, `f.rueckfragen`,
`f.kosten`, `f.aufgabe`, `f.frist` korrekt gesetzt; Reload → alles noch da; Mitschrift weg.

**T4 · Kassen-Zweig.** Eigener Dialog, eigene Ergebnis-Knöpfe über `kostenSetzen()`,
eigener Einwilligungs-Text.
Verifikation: „Zusage erteilt" setzt `f.kosten` und die Folge-Aufgabe, Board-Karte ändert sich.

Querschnitt-Gates wie im Projekt üblich: `node --check`, 390 px **und** 1440 px, 0 Console-Errors,
Cofounder-Bereiche unangetastet (Matrix 6 Zellen, `openReferrer`, `rsp`-Charts, `.kta-`-Pilot),
Keyframe-Bilanz dokumentiert.

---

## 6. Echtsystem — was der Dienstleister bauen muss

### 6a · Der wichtigste Befund: „im Browser" hält für die Mitschrift nicht

Die View sagt heute: „Klassifiziert **im Browser der Mitarbeiterin** … Browser ist Endpunkt".
Für die **Klassifikation** (Musik, Bandansage, Mensch, Anrufbeantworter) ist das plausibel —
das ist eine grobe Audio-Unterscheidung, die lokal läuft. Für eine **deutsche Mitschrift am
Telefon ist es nachweislich falsch**, und ein Dienstleister, der Spracherkennung kennt, merkt
das im Gespräch:

- Im Browser laufen realistisch nur `tiny`/`base` (Whisper-WASM ist laut eigener Doku bis
  `small` brauchbar, darüber „unsatisfactory"; die Live-Demo verlangt ausdrücklich einen
  schnellen Desktop, kein Handy). Die schnellen `.en`-Varianten sind **English-only**.
- Deutsch braucht die multilingualen Modelle, und dort gilt in der Praxis: unter `medium`
  unbrauchbar. Belastbare deutsche WER-Zahlen für `tiny/base/small` sind **nicht publiziert** —
  wer es trotzdem versuchen will, muss selbst messen.
- Telefonie ist der ungünstigste Fall: Ein externer Anrufer über Mobilfunk zieht die Verbindung
  auf **G.711 mit 8 kHz** herunter. Bandbreitenbegrenzung gilt in der Literatur als
  **kritischster** Einzelfaktor für ASR-Fehler, und neuronale „Audio-Aufhübschung"
  verschlechtert die Erkennung sogar. Bezeichnend: Deepgram hat telefonie-optimierte
  Modelle — **nur für Englisch**.

**Konsequenz für die Erzählung:** Sobald die Mitschrift dazukommt, muss aus „läuft im Browser"
ein **„läuft im Haus"** werden. Das ist erzählerisch kein Verlust — „das Audio verlässt die
Klinik nie" bleibt wahr und ist das eigentliche Versprechen. Es ist aber eine Textänderung an
der bestehenden „So funktioniert's"-Zeile, und sie gehört zur Ehrlichkeitsregel dieses Projekts.

### 6b · Woher das Audio kommt, und welcher Erkennungsweg

**Audio-Anbindung.** Zwei brauchbare Wege, klare Reihenfolge:

1. **Wenn der Empfang per Softphone telefoniert: WebRTC-Softphone im Browser.** Dann liegt der
   Stream als `MediaStream` schon getrennt nach Anrufer und Mitarbeiterin im JavaScript — die
   beste Kanaltrennung überhaupt, und das ganze Thema Telefonanlage entfällt. Kleinstes Projekt.
2. **Sonst SIPREC (RFC 7866) am vorhandenen SBC.** Branchenstandard, passiver Fork auf
   SIP-Ebene, zentral pro Trunk statt pro Arbeitsplatz, keine Änderung an den Endgeräten, und
   die Norm verlangt **getrennte Streams je Sprechrichtung**. Unterstützt u. a. von Cisco CUBE
   und AudioCodes Mediant. Bei kleineren deutschen Anlagen (Starface, 3CX, Placetel) ist SIPREC
   nicht dokumentiert — dort gibt es meist nur den Datei-Export **nach** Gesprächsende, also
   keinen Live-Stream. **Das ist die erste Frage an die Klinik-IT: welche Anlage, welcher SBC.**

Abzuraten ist vom Audio-Mitschnitt am einzelnen Arbeitsplatz (Windows-Loopback): liefert nur
das gemischte Signal ohne Kanaltrennung, muss pro Platz installiert werden und bricht beim
Headset-Wechsel. Bei Microsoft Teams Phone gibt es keinen direkten Zugriff, nur zertifizierte
Compliance-Recording-Bots.

**Erkennungsweg — Empfehlung: EU-Cloud starten, On-Premise als Zielbild.**

**Azure AI Speech** in *Germany West Central* oder *Sweden Central* ist der pragmatischste
Einstieg: Deutsch in Echtzeit ist in der offiziellen Regionstabelle belegt, der Auftrags-
verarbeitungsvertrag liegt als Standardvertrag vor — und entscheidend: **derselbe Dienst
existiert als Container mit Offline-Modus**. Der Weg Cloud → eigener Server ist damit ohne
Anbieterwechsel offen, was in einer Klinik-Beschaffung viel wert ist.

**On-Premise** löst mehrere Rechtsfragen in einem Schritt, weil keine Daten das Haus verlassen.
Kosten: eine GPU mit mindestens 16 GB VRAM (L4/L40S-Klasse) und eigene IT-Verantwortung. Wichtig
ist dort eine Modellentscheidung: **Whisper ist kein Streaming-Modell** — der Referenzstack
kommt auf etwa 3 Sekunden Verzögerung. Für Nachbearbeitung reicht das, für „Live-Mitlesen am
Bildschirm" nicht. Wer live mitlesen will, braucht ein echtes Streaming-Modell (NVIDIA Riva /
Parakeet unterstützt Deutsch, unter einer Sekunde).

**Die harte Hürde ist nicht der AVV, sondern § 393 SGB V.** Für Leistungserbringer nach SGB V
verlangt er seit 2024/2025 ein **aktuelles BSI-C5-Typ-2-Testat, bezogen auf die konkret
genutzte datenverarbeitende Stelle** — nicht nur auf die Basis-Infrastruktur. Die reinen
Spracherkennungs-Spezialisten (Deepgram, Speechmatics, ElevenLabs, AssemblyAI) erfüllen das
nicht. Und selbst bei den großen Plattformen deckt das Testat laut Microsofts eigener
Einschränkung die Plattform, nicht automatisch die darauf aufbauenden Dienste. **Also: C5-Scope
für den konkreten Sprachdienst schriftlich beim Compliance-Team einholen, nicht beim Vertrieb.**
Ob § 393 SGB V auf die Klinik in ihrer Trägerkonstellation überhaupt anwendbar ist, muss der
Klinik-Datenschutz klären. Bei AssemblyAI zusätzlich Vorsicht: EU-Endpunkt wird beworben, der
Standard-Vertragstext nennt aber die USA als primären Verarbeitungsort.

### 6c · § 201 und § 203 StGB — die zweite Hürde ist die überraschende

**§ 201 StGB** stellt auf „auf einen Tonträger aufnimmt" ab. Mehrere übereinstimmende
Fachbeiträge vertreten: eine reine Transkription ohne persistente Audiodatei erfüllt diesen
Wortlaut nicht. **Der Haken:** Viele Erkennungs-Pipelines puffern das Rohsignal (Chunking,
Wiederholungen, Kontextfenster). Sobald diese Pufferung über flüchtige Verarbeitung im
Arbeitsspeicher hinausgeht, gilt der Anwendungsbereich in der Literatur als eröffnet.
„Kein Audio gespeichert" ist also nur belastbar, wenn es **architektonisch geprüft und
vertraglich zugesichert** ist — die Zusage im Verkaufsgespräch genügt nicht. Höchstrichterliche
Rechtsprechung speziell zu „Mitschrift statt Tonträger" gibt es nicht; es bleibt echte
Rechtsunsicherheit.

Zusatz-Hinweis fürs Produktdesign: Liest ein **gesprächsfremder Dritter** (Teamleitung, QM)
live mit, ist die Einordnung als Abhören naheliegend. Ein „Mithören für die Leitung" darf es
also nicht geben — was ohnehin die Betriebsvereinbarung verlangt (§6d).

**§ 203 StGB wird meist unterschätzt und ist die eigentliche Überraschung.** Die Weitergabe an
einen Spracherkennungs-Dienstleister ist eine Offenbarung an eine „mitwirkende Person" und
verlangt nach Abs. 4 eine **eigenständige, strafbewehrte Verpflichtung zur Geheimhaltung in
Textform**. Ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO **deckt das nicht ab** — es
braucht beides. Ohne das ist der Pilot, wie die Fachpraxis es formuliert, kein
Datenschutzverstoß, sondern ein Straftatbestand.

### 6d · DSGVO — unser Fall braucht die ausdrückliche Einwilligung

Wichtig und für uns unbequem: Aaron.ai nennt als Rechtsgrundlage Art. 6 Abs. 1 lit. a
i. V. m. **Art. 9 Abs. 2 lit. h** DSGVO — die Gesundheitsversorgungs-Ausnahme. Die setzt
aber ein **bestehendes Behandlungsverhältnis** voraus. Unser Fall ist der **Erstkontakt eines
Interessenten ohne Behandlungsvertrag**, und der Zweck ist Qualifizierung, nicht Versorgung.
Damit trägt lit. h hier eher nicht, und es bleibt **Art. 9 Abs. 2 lit. a: ausdrückliche
Einwilligung.** Genau deshalb ist das Einwilligungs-Gate (B1) nicht Kosmetik, sondern die
Rechtsgrundlage selbst.

**Opt-in, nicht Opt-out.** Nach der Linie der bayerischen Aufsichtsbehörde genügt
„Wenn Sie nicht einwilligen, drücken Sie 1" **nicht** — das ist eine Widerspruchslösung.
Erforderlich ist eine aktive Bestätigung (gesprochenes Ja oder Tastendruck **zur Zustimmung**),
dokumentiert mit Zeitstempel nach Art. 7 Abs. 1. Und es muss einen gleichwertigen Weg ohne
Mitschrift geben, ohne Nachteil — was unser „Ohne Mitschrift"-Knopf ohnehin abbildet.

Textbaustein für die Ansage (juristisch prüfen lassen, ein wörtliches Marktvorbild war nicht
auffindbar):

> „Bevor wir beginnen: Wir setzen ein System ein, das dieses Gespräch mitschreibt, damit wir
> Ihr Anliegen korrekt erfassen. Das Tonsignal wird nicht gespeichert, nur der Text, und der
> wird nach [X] gelöscht. Sie können jederzeit widerrufen. Wenn Sie das nicht möchten, notieren
> wir Ihr Anliegen wie gewohnt von Hand — Nachteile entstehen Ihnen dadurch nicht.
> **Sind Sie mit der Mitschrift einverstanden?**"

**Datenschutz-Folgenabschätzung.** Die Muss-Liste nach Art. 35 Abs. 4 DSGVO (LfDI
Baden-Württemberg, mit der Datenschutzkonferenz abgestimmt) nennt wörtlich das Einsatzfeld
„Telefongespräch-Auswertung mittels Algorithmen" mit dem Beispiel eines Callcenters, das die
Stimmungslage der Anrufer auswertet. **Sobald das System bewertet oder einstuft, ist die DSFA
zwingend.** Eine reine Mitschrift ohne Bewertung erreicht diese Schwelle allein wohl nicht —
aber unsere Sterne-Priorisierung ist eine Bewertung. Also einplanen.

**Löschfristen:** eine gesetzliche Frist für Gesprächsdokumentation existiert nicht. Zwei
getrennte Töpfe führen: Akquise-Transkript (kurz, Wochen) und Behandlungsdokumentation
(ärztliche Aufbewahrungsfristen). Nicht vermischen.

### 6e · Betriebsrat: nicht optional, und der Auslöser ist schon der gebaute Stand

Geprüft, mit Rechtsprechung belegt — und das Ergebnis betrifft **nicht erst die Mitschrift,
sondern bereits die vorhandene Erkennungsfunktion**:

Das Bundesarbeitsgericht fragt nicht, ob der Arbeitgeber überwachen *will*, sondern ob die
Anlage dazu **objektiv geeignet** ist (ständige Rechtsprechung seit 1 ABR 43/81, 1983). Und
es hat im **Beschluss vom 16.07.2024, 1 ABR 16/23** für ein Headset-System, das Vorgesetzten
das Mithören von Mitarbeitergesprächen ermöglicht, ausdrücklich entschieden: mitbestimmungs-
pflichtig nach § 87 Abs. 1 Nr. 6 BetrVG — **auch dann, wenn nichts aufgezeichnet oder
gespeichert wird.**

Das heißt: unsere Kern-Erzählung („keine Aufzeichnung") entlastet uns beim Betriebsrat
**nicht**. Ein System, das ein Telefongespräch mithört, klassifiziert und transkribiert,
erfasst zwangsläufig auch die Mitarbeiterin. Dass der Hauptzweck die Patientendokumentation
ist, ändert daran nichts — schon 1983 stellte das BAG klar, es sei gleichgültig, ob die
Daten zur Überwachung genutzt werden sollen oder nur zur Erledigung der Aufgabe nötig sind.

Praktische Folgen für den Rollout:

- **Betriebsvereinbarung**, keine formlose Regelungsabrede — nur die BV wirkt unmittelbar
  gegenüber den Beschäftigten (§ 77 Abs. 4 BetrVG). Übliche Inhalte: enge Zweckbindung
  (Dokumentation und Qualität, **kein** Leistungs-Ranking), kurze Löschfristen, ausdrückliches
  Verbot personenbezogener Einzelauswertung, Berechtigungskonzept, Beteiligung bei Änderungen.
- **§ 90 Abs. 1 Nr. 3 BetrVG** verlangt seit der Novelle 2021 ausdrücklich die rechtzeitige
  Unterrichtung über den **Einsatz von Künstlicher Intelligenz** — also früh informieren,
  nicht erst zur Abnahme.
- **§ 80 Abs. 3 Satz 2 BetrVG**: bei KI-Bezug gilt die Hinzuziehung eines Sachverständigen
  durch den Betriebsrat **als erforderlich** — das muss er nicht mehr begründen. Realistisch
  einplanen: externer Gutachter, Zeit und Kosten.
- Ohne wirksame Beteiligung hat der Betriebsrat einen **Unterlassungsanspruch** schon bei
  einfachem Verstoß mit Wiederholungsgefahr (BAG 03.05.1994, 1 ABR 24/93), und die Maßnahme
  wirkt gegenüber den Beschäftigten nicht (BAG GS 2/90). Ein laufendes System kann also
  gestoppt werden.
- Werden zusätzlich Verhaltensvorgaben gemacht (verbindlicher Gesprächsleitfaden, Vorgaben
  zu Formulierungen), kommt § 87 Abs. 1 Nr. 1 BetrVG hinzu — vorsorglich mit benennen.

**Konsequenz für die Reihenfolge:** Der Betriebsrat gehört vor den Pilotbetrieb, nicht danach.
Und weil der Auslöser bereits das Mithören ist, betrifft das auch die schon gebaute
Erkennungsfunktion, sobald sie echt wird — unabhängig davon, ob wir die Mitschrift bauen.

### 6f · EU AI Act: die gute und die unangenehme Nachricht

**Gut:** Die Transparenzpflicht aus Art. 50 Abs. 1 (bleibt beim Termin 02.08.2026) trifft uns
nach dem Wortlaut **nicht**. Sie gilt für Systeme, die „zur direkten Interaktion mit
natürlichen Personen bestimmt" sind; die FAQ der EU-Kommission nimmt Systeme, die
ausschließlich im Hintergrund arbeiten, ausdrücklich aus. Unser Assistent hört zu und
klassifiziert, er spricht nicht — genau die Architekturentscheidung, die schon in der Spec
stand („der Agent spricht selbst nicht"), zahlt hier rechtlich aus. *(Auslegung, keine
behördliche Aussage speziell zu Callcenter-Mithörsystemen gefunden.)*

**Unangenehm:** Anhang III Nr. 4 lit. b erfasst Systeme, die eingesetzt werden, um Leistung
und Verhalten von Beschäftigten zu überwachen und zu bewerten — das ist **Hochrisiko-KI**
mit Betreiberpflichten nach Art. 26 (menschliche Aufsicht durch geschultes Personal,
Protokollaufbewahrung mindestens sechs Monate, Beitrag zur Datenschutz-Folgenabschätzung).
Ob wir hineinfallen, entscheidet die **Zweckbindung**: Solange das System ausschließlich
dokumentiert und niemals zur Leistungsbewertung genutzt wird, ist der Anhang-III-Tatbestand
nicht erfüllt. Das ist kein Zufall, sondern derselbe Satz, den die Betriebsvereinbarung
ohnehin braucht — **Zweckbindung ist hier der zentrale Hebel, nicht ein Nebensatz.**

Und Art. 26 Abs. 7 verlangt, falls es doch Hochrisiko wird, die Information der
Arbeitnehmervertretung **vor** Inbetriebnahme — zusätzlich zur BetrVG-Mitbestimmung.

**Harte Grenze:** Art. 5 Abs. 1 lit. f **verbietet** Emotionserkennung am Arbeitsplatz.
Eine Auswertung von Stimmklang, Tonfall oder Prosodie — also „wie klang die Mitarbeiterin",
„war der Anrufer verärgert" — ist damit ausgeschlossen, nicht bloß heikel. Das muss als
Nicht-Ziel ins Lastenheft für den Dienstleister, weil solche Features in Callcenter-Produkten
Standard-Verkaufsargumente sind und uns aktiv angeboten werden. Gegenüber **Anrufern** greift
dieses Verbot übrigens nicht — dort ist die DSGVO das Regelwerk, und dort wäre eine
Stimmungsanalyse laut Aufsichtsbehörden-Muss-Liste sofort DSFA-pflichtig (§6d).

**Terminlage (zweifach recherchiert, konsistent):** Der „Digital Omnibus on AI" —
Verordnung (EU) 2026/1744 vom 08.07.2026, veröffentlicht am 24.07.2026, in Kraft seit
**27.07.2026** — verschiebt die Hochrisiko-Pflichten für Anhang-III-Systeme von 02.08.2026 auf
**02.12.2027** (Anhang I auf 02.08.2028). **Art. 50 bleibt beim 02.08.2026**, ebenso das
Emotionserkennungs-Verbot (seit 02.02.2025) und Art. 4 KI-Kompetenz. Die Kommissionsleitlinien
zu Art. 50 sind am 20.07.2026 erschienen und sollten vor Livegang im Volltext gelesen werden.
Das Zeitfenster bis 12/2027 ist ein Puffer, kein Freibrief — wer die Mitarbeiterbewertung von
Anfang an weglässt, muss die Frage nie stellen.

### 6g · Der Markt macht es genau so — Doctolib als Vorbild

Die Leitentscheidung aus §2 („Wortlaut flüchtig, Ergebnis dauerhaft") ist keine Erfindung
dieses Dokuments. Sie ist der Stand der Praxis bei den Anbietern, die in Deutschland
Arzt-Patienten-Gespräche dokumentieren:

**Doctolib KI-Sprechstundenassistent** (Rollout ab 11/2025) — das brauchbarste Vorbild:
Einwilligung **zweistufig** — generell bei der Praxisaufnahme, **und zusätzlich** fragt der
Arzt unmittelbar vor dem Gespräch noch einmal aktiv nach, dokumentiert per Checkbox in der
Software. Audioaufnahmen werden **nicht dauerhaft gespeichert**; Transkription und
Textvorschläge werden **48 Stunden** nach der Behandlung gelöscht. Hosting Deutschland/
Frankreich, ISO 27001 und HDS-zertifiziert.

Das validiert unser Design an drei Stellen: das Einwilligungs-Gate direkt vor dem Gespräch
(B1) entspricht genau der zweiten Stufe bei Doctolib; kein Audio; und eine kurze Lebensdauer
des Wortlauts. Wir gehen mit „Verwerfen beim Übernehmen" sogar strenger vor als die 48 Stunden.
Für den Betrieb wäre eine kurze Frist statt sofortigem Löschen zu diskutieren (Korrektur-
möglichkeit, wenn die Zusammenfassung etwas verkürzt hat) — aber die Demo sollte den strengen
Weg zeigen.

**Weitere Bezugspunkte:** **Voize** (>100 Pflegeeinrichtungen DACH, i-care-Award 2023)
verarbeitet patientenbezogene Daten laut Anbieter **lokal auf dem Smartphone** — Beleg, dass
„Erkennung auf dem Gerät" im deutschen Gesundheitsmarkt kein Marketing-Märchen ist.
**CGM one DokuAssistent** argumentiert, weil in Echtzeit transkribiert werde, sei „keine
Speicherung der Gespräche notwendig", und legt die Entscheidung über die Einwilligung
ausdrücklich dem Leistungserbringer als Verantwortlichem auf — für uns heißt das: die Klinik
muss diese Entscheidung selbst treffen und dokumentieren, der Dienstleister nimmt sie uns nicht ab.
**Aaron.ai** (Telefonassistent, >3 Mio. Anrufe/Monat für ca. 16.000 Praxen, seit 2025 bei
Doctolib) nennt als Rechtsgrundlage Art. 6 Abs. 1 lit. a i. V. m. **Art. 9 Abs. 2 lit. h DSGVO**
— Einwilligung plus Gesundheitsversorgungs-Ausnahme. Achtung: bei uns trägt lit. h vermutlich
nicht (Erstkontakt ohne Behandlungsvertrag, siehe §6d) — die Ausnahme lässt sich also nicht
einfach abschreiben.

Nicht gefunden trotz gezielter Suche: der **wörtliche Ansagetext**, den solche Telefon-
assistenten verwenden. Den müssen wir selbst formulieren (und juristisch prüfen lassen) —
er ist Teil des Lastenhefts, nicht vom Markt abzuschreiben.

### 6h · Lastenheft-Kurzfassung für den Dienstleister

Die zehn Punkte, die aus dem Obigen in ein Angebot gehören:

1. Audio-Quelle: SIPREC am SBC **oder** WebRTC-Softphone — abhängig von der Klinik-TK-Anlage
   (erste zu klärende Frage überhaupt).
2. Getrennte Streams je Sprechrichtung, kein gemischtes Signal.
3. Spracherkennung deutsch, echtzeitfähig; Streaming-Modell, wenn live mitgelesen werden soll.
4. Kein Audio persistent — **architektonisch nachweisbar**, nicht nur zugesichert (§ 201 StGB).
5. Migrationspfad Cloud → On-Premise ohne Anbieterwechsel.
6. BSI-C5-Typ-2-Scope für den konkreten Sprachdienst, schriftlich (§ 393 SGB V).
7. AVV **plus** strafbewehrte Verpflichtung nach § 203 Abs. 4 StGB.
8. Einwilligungs-Erfassung als Opt-in mit Protokollierung (Art. 7 Abs. 1).
9. Zwei getrennte Löschtöpfe: Akquise-Transkript kurz, Behandlungsdokumentation nach
   ärztlichen Fristen.
10. **Ausgeschlossen:** Emotions-/Stimmanalyse und individuelle Leistungsbewertung von
    Beschäftigten (Art. 5 Abs. 1 lit. f KI-VO; Anhang III Nr. 4).

---

## 7. Nicht-Ziele

**In der Demo:** Keine echte Telefonie, kein WebRTC, keine echte Spracherkennung · keine
Audio-Aufzeichnung, auch nicht simuliert · kein Selbst-Wählen (unverändert) · kein Eingriff
in `.rp-/.rpd-/.rsp-/.mx-`-Bereiche, `openReferrer`, `#refOverlay` · kein Netzaufruf
(die Demo bleibt offline-deterministisch, auch die „Erkennung" der Felder ist gescriptet).

**Im Produkt, dauerhaft** (gehört in Betriebsvereinbarung, Lastenheft und Demo-Text):
keine Emotions- oder Stimmungsanalyse — weder der Mitarbeiterin (verboten nach Art. 5 Abs. 1
lit. f KI-VO) noch der Anrufer (sofort DSFA-pflichtig) · keine individuelle Leistungsbewertung
von Beschäftigten · kein Live-Mithören durch gesprächsfremde Dritte.

---

## 8. Offene Punkte für den Nutzer

1. **Weg A, B oder C** (§2) — Empfehlung A.
2. **Wer baut?** `.tel-*` ist jetzt Cofounder-Gebiet, die Fallakten-Seite ist bekanntes
   Terrain der Claude-Lane. Vorschlag: Spec hier fertig, Umsetzung in der Claude-Lane,
   Ankündigung an den Cofounder über den Hub, bevor `.tel-*` angefasst wird.
3. **Kassen-Mitschrift** — mitschreiben oder nur Ergebnis erfassen? (Rechtlich harmloser,
   aber der Nutzen beim Nachweis einer telefonischen Zusage ist hoch.)
4. **„Im Browser" → „im Haus"** (§6a): Soll die bestehende „So funktioniert's"-Zeile jetzt
   korrigiert werden, oder erst mit dem Mitschrift-Bau? Sie ist heute für die Klassifikation
   vertretbar, für die Mitschrift nicht — und der Cofounder hat sie geschrieben.
5. **Frage an die Klinik-IT, unabhängig von allem anderen:** Welche TK-Anlage, gibt es einen
   SIPREC-fähigen SBC, telefoniert der Empfang per Softphone? Ohne diese Antwort ist jede
   Aufwandsschätzung des Dienstleisters geraten.

---

## 9. Quellen (die tragenden)

**Recht**
- BAG 16.07.2024, 1 ABR 16/23 (Headset-Mithören mitbestimmungspflichtig, auch ohne Speicherung):
  https://www.bundesarbeitsgericht.de/wp-content/uploads/2024/11/1-ABR-16-23.pdf
- BAG 03.05.1994, 1 ABR 24/93 (Unterlassungsanspruch) · BAG GS 2/90 (Wirksamkeitsvoraussetzung)
- §§ 80 Abs. 3, 90 Abs. 1 Nr. 3, 95 Abs. 2a BetrVG: https://www.gesetze-im-internet.de/betrvg/
- § 201 StGB: https://www.gesetze-im-internet.de/stgb/__201.html · zur Transkriptions-Frage:
  https://www.unternehmensstrafrecht.de/ki-transkription-und-%C2%A7-201-stgb/ ·
  https://www.datenschutzticker.de/2026/03/gdd-rechtliche-anforderungen-bei-der-gespraechstranskription/
- § 203 StGB und Cloud/KI (AVV genügt nicht): https://kleiboldt.de/blog/203-stgb-cloud-ki/
- § 393 SGB V / BSI-C5-Testat im Gesundheitswesen:
  https://www.bvmed.de/verband/publikationen/infoblaetter/c5-testat-393-sgb-v-cloud-einsatz-im-gesundheitswesen
- DSFA-Muss-Liste Art. 35 Abs. 4 (LfDI BW, Nr. 9/11/14, wörtliches Callcenter-Beispiel):
  https://www.baden-wuerttemberg.datenschutz.de/wp-content/uploads/2018/05/Liste-von-Verarbeitungsvorg%C3%A4ngen-nach-Art.-35-Abs.-4-DS-GVO-LfDI-BW.pdf
- BayLDA, Informationspflichten am Telefon (Opt-in, kein Opt-out):
  https://www.lda.bayern.de/media/FAQ_InformationspflichtenTelefon.pdf
- KI-VO: Art. 50 https://artificialintelligenceact.eu/article/50/ · Art. 5 Abs. 1 lit. f
  https://www.datenschutzticker.de/2025/04/artikel-5-ki-vo-emotionserkennung-am-arbeitsplatz-und-in-bildungseinrichtungen/ ·
  VO (EU) 2026/1744 https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng ·
  Kommissionsleitlinien Art. 50 (20.07.2026)
  https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems

**Technik**
- whisper.cpp (Modellgrößen, WASM-Grenzen): https://github.com/ggml-org/whisper.cpp ·
  Live-Demo-Anforderungen: https://ggml.ai/whisper.cpp/stream.wasm/
- Whisper-Streaming, 3,3 s Latenz: https://arxiv.org/abs/2307.14743
- NVIDIA ASR NIM Support-Matrix (Deutsch, GPU ≥ 16 GB):
  https://docs.nvidia.com/nim/speech/latest/reference/support-matrix/asr.html
- Azure AI Speech Regionen (Deutsch-Echtzeit):
  https://learn.microsoft.com/en-us/azure/ai-services/speech-service/regions ·
  Container inkl. Offline-Modus:
  https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-container-cstt?tabs=disconnected ·
  C5-Scope-Einschränkung: https://learn.microsoft.com/en-us/compliance/regulatory/offering-c5-germany
- SIPREC RFC 7866 (getrennte Streams je Richtung): https://www.rfc-editor.org/rfc/rfc7866.html
- Deutsche Whisper-WER-Referenzen: https://huggingface.co/primeline/whisper-large-v3-turbo-german

**Markt**
- Doctolib KI-Sprechstundenassistent: https://info.doctolib.de/ki-sprechstundenassistent/
- Aaron.ai Datenschutzinformation (Praxis): https://doceins.de/datenschutz-aaron/
- CGM one DokuAssistent:
  https://www.cgm.com/deu_de/loesungen/praxissoftware/zusatzprodukte/cgm-one-dokuassistent-1.html
- Voize: https://www.voize.ai/de/loesungen/krankenhaus
- Ambient Listening in der Praxis, rechtliche Mindestausstattung:
  https://kleiboldt.de/use-cases/ambient-listening-praxis/

**Nicht belegbar (bewusst offen gelassen):** deutsche WER-Zahlen für Whisper tiny/base/small ·
konkrete WER-Verschlechterung bei 8 kHz für Deutsch · BGH/BVerfG zu „Mitschrift statt Tonträger" ·
C5-Scope für die konkreten Sprachdienste (nur unter NDA) · behördliche Löschfrist für Transkripte ·
wörtlicher Ansagetext eines deutschen Anbieters.
