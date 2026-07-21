# Spec — Strategie-Runde: Eingang, Patienten-/Zuweiserpflege, Datensparsamkeit

**Datum:** 2026-07-21
**Datei:** `index.html` (single self-contained, inline CSS/JS)
**Rahmen:** Brainstorming-Sitzung nach Sync mit dem Cofounder-Stand (IA-Restrukturierung + Jade-Apotheke, `c4c7312`). Kein Hosting-/Backend-Beschluss heute — **reine Demo/Prototyp-Politur**, kein echtes Backend, keine echte KIS-Anbindung.
**Anlass:** Nutzer-Auftrag, vier Strategiefelder zu schärfen: (A) Datensparsamkeit, (B) Eingangs-Konsolidierung, (C) Patientenpflege-Automatisierung, (D) Zuweiserpflege-Automatisierung — mit dem Ziel, die Investoren-Demo überzeugender und ehrlicher (technisch plausibel) zu machen.
**Status:** Entwurf, mit Nutzer Abschnitt für Abschnitt im Dialog abgestimmt. Steht noch aus: Spec-Review-Loop + schriftliche Nutzer-Freigabe.

## 1. Ziel

Die vier Strategiefelder werden zu **einem zusammenhängenden Fluss**, nicht zu vier Einzelfeatures: Eine Anfrage kommt über irgendeinen Kanal rein → wird automatisch erkannt/eingeordnet → wird einer Person/Institution zugeordnet (neu oder bestehend) → bekommt eine Sterne-Einstufung → ab einer Schwelle wird ein Fall im Board angelegt, sonst bleibt es ein Kontakt in der Registry → im laufenden Prozess erkennt dasselbe System Upsell-Chancen und Pflegebedarf, mit einem Menschen, der jeden Vorschlag bestätigt (kein Blind-Automatismus).

**Leitprinzip (alle vier Bereiche):** Vorschlag statt Automatik. Das System erkennt Muster (Schlagwörter, Fristen, Trends, Kontakt-Lücken) und schlägt eine Handlung vor — ein Mensch bestätigt oder korrigiert. Das gilt für Personen-Zuordnung, Sterne-Einstufung, Routing, Upselling und Zuweiser-Gesten gleichermaßen.

**Bewusst außen vor (nicht Teil dieser Runde):** echte KIS-Anbindung, echtes Backend/Persistenz, Hosting-Entscheidung (lokal/Cloud). Diese Runde bleibt Demo-Politur; alles unten Beschriebene erweitert weiterhin nur simulierten JS-Zustand in `index.html`.

## 2. Bereich B — Eingangs-Konsolidierung

### 2.1 Signal-Erkennung bei der Schnellerfassung

Wenn Personal eine Anfrage (Anruf, Mail, Fax, Website) im Eingang erfasst, scannt eine einfache Keyword-/Muster-Erkennung den Freitext (kein NLP nötig, reicht für Demo und wäre real ein plausibler v1):

- **Premium-Signal**: "SalutoCare", "Selbstzahler", "Suite", "Premium" → Prioritäts-Vorschlag hoch
- **Kostenträger-Hinweis**: "PKV"/"GKV"/"Beihilfe" → füllt `kt` vor
- **Konkretheit**: Alter, Frist/Datum, Kanal-Details vorhanden → "konkret"; generischer Einzeiler ohne Substanz → "unkonkret"
- **Dringlichkeit**: "Entlassung [Datum]", "dringend" → Frist-Vorschlag

Jeder erkannte Punkt erscheint als Chip ("⚡ Premium-Signal: SalutoCare"); ein Klick übernimmt ihn. Nichts wird ohne Bestätigung übernommen.

### 2.2 Identifizierbarkeits-Grenze (zentrale Datensparsamkeits-Regel)

Die Grenze, ob aus einem Eingangs-Eintrag ein dauerhafter Datensatz wird, ist **nicht** "konkret vs. unkonkret", sondern **identifizierbar vs. nicht**:

- **Kein erkennbarer Name/Kontakt** (z. B. eine anonyme "Habt ihr noch Betten frei?"-Mail) → bleibt einmalig im Eingang-Log, wird **nie** zu einer Person.
- **Mit Name/Kontakt einer eindeutigen Einzelperson** → wird immer eine Person in der Registry — neu angelegt oder (per automatischem Abgleich nach Name/Telefon/Mail) mit einer bestehenden Person verknüpft ("Meintest du Anna Muster, P01?").
- **Ausnahme (bestehende Konvention, bleibt unangetastet):** Sammelnamen (Familie/Eheleute/"Unbekannt") laufen weiterhin über das bestehende `einzelperson:false`-Flag (Baustein A) und bekommen **keine** Einzelpersonen-Akte, unabhängig davon, ob ein Name erkannt wurde. Die Identifizierbarkeits-Grenze aus diesem Abschnitt gilt also nur für Eingänge, die sich einer einzelnen Person eindeutig zuordnen lassen — sie erweitert die bestehende Konvention, ersetzt sie nicht.

Die erkannten Signale aus 2.1 bestimmen direkt den **Sterne-Wert** dieser Person, keinen separaten Pfad: kein konkretes Signal → 2★ (wie im bestehenden `STERNE`-Contract schon definiert), Alter+Frist+Kostenträger erkannt → 3–4★, explizite Absage/Widerruf erkannt → **1★, überschreibt alles andere** (DSGVO-Pflicht, nie wieder kontaktieren).

### 2.3 Fall-Schwelle

Ein **Fall im Board** wird erst ab einer Schwelle (Sterne ≥3) automatisch vorgeschlagen — "konkret" ist hier kein separates Feld, sondern deckt sich mit der Sterne-Ableitung aus §2.2 (3–4★ = konkrete Signale erkannt). Darunter bleibt die Person in Netzwerk→Kontakte und kann später durch einen stärkeren Kontakt hochgestuft werden (kein Fall-Datensatz nötig für schwache Leads).

### 2.4 Institutions-Abgleich (Zuweiser-Anfragen)

Kommt eine Anfrage erkennbar von einer Klinik/Praxis, läuft derselbe Abgleich-Mechanismus wie bei Personen, aber gegen die Zuweiser-Archiv-Datenbank (siehe §5.3): Namensabgleich gegen Bestand + Krankenhausverzeichnis-Referenzdaten, Vorschlag zur Übernahme von Stammdaten (Adresse, Fachabteilungen) statt Leerformular.

## 3. Bereich C — Patientenpflege-Automatisierung (im Board/Prozess)

### 3.1 Routing-Vorschlag statt Fixwert

Heute bekommt jeder neue Fall automatisch denselben Standard-Owner ("S. Koordination", hartkodiert in `simulateInbound()`). Neu: das System schlägt einen Owner vor (nach Achse-Spezialisierung + aktueller Fallzahl je Mitarbeiter), der zuständige Mitarbeiter/Teamlead bestätigt. **Neue Datengrundlage nötig:** eine kleine Zuordnungstabelle Achse↔Team-Mitglied existiert noch nicht (`TEAM` kennt heute nur Namen, keine Achsen-Zuständigkeit) — das ist Teil der Umsetzung, keine Vorbedingung.

### 3.2 Kontinuierliche Upsell-Erkennung

Die Signal-Erkennung aus §2.1 läuft nicht nur einmalig bei Aufnahme, sondern bei **jedem neuen Informationsstück** (Anruf-Notiz, Zwischenstand-Update, neues Dokument) erneut. Ein erkannter Upsell (z. B. GKV-Patient mit erkanntem Komfort-Interesse) erscheint sofort als Board-Badge/Aufgabe, unabhängig vom Prozessalter des Falls.

### 3.3 Board-Priorisierung

Board-Spalten bleiben nach Prozess-Status geordnet (Zonenbänder unverändert), aber **innerhalb** jeder Spalte sortiert nach Sterne/Dringlichkeit, damit die wichtigsten Fälle oben stehen statt in Eingangsreihenfolge.

### 3.4 Fallakte — Hybrid-Modell

Die heutige Schublade (Fall-Detail-Overlay) wird mit den neuen Feldern (medizinische Kurzfelder, Abrechnung/DRG, Upsell-Trigger, Werdegang) zu eng. Statt die bestehende Zurück-Navigation (WS1, für Overlays gebaut) komplett zu ersetzen:

- Die **Schublade bleibt** für schnelle Interaktionen (z. B. einen Upsell-Vorschlag bestätigen).
- Ein Button **"Vollständige Fallakte öffnen"** führt in eine neue Vollansicht (eigene Route) für den Tiefeneinstieg — alle Kurzfelder, Dokumente, Historie, Abrechnung.
- Additiv: kein Bruch mit der bestehenden Overlay-Navigation, aber echter Raum für die wachsende Informationsmenge.

## 4. Bereich A — Datensparsamkeit: medizinische Datengrenze

### 4.1 Ausgangslage

Diagnose/ICD/Medikation existieren heute als Kurzfelder im Bereich des Cofounders (Zuweiser-Portal-Dokumentenansicht, Reha-Charts, `.rp-*`/`.rsp-*`) — schon recht schlank, aber bisher zufällig entstanden, nicht als bewusste Grenze festgelegt. Eine echte KIS-Anbindung, um diese Felder live zu befüllen, ist kein Prototyp-Umfang (Interoperabilität, Berechtigungen, Haftung) — **wird für die absehbare Zeit ausgeschlossen**.

### 4.2 Standardisierte Mitarbeiter-Eingabemaske (Proof of Concept)

Statt Freitext-Aufsatz: eine feste Maske mit 8 Feldern, die sich später aufbereiten lässt (Matrix-Kennzahlen, Zuweiser-Ansicht, Auswertung):

**Medizinische Kurzfelder (bewusst knapp, nie Volltext-Akte):**
1. Reha-Ziel (ein Satz)
2. Barthel-Index aktuell (Zahl 0–100)
3. FIM aktuell (Zahl 18–126)
4. Arztbericht-Kurzfassung (ein Satz)

**Geschäftlich/verwaltungsrelevante Felder:**
5. Kostenträger-/DRG-Status bzw. Tagessatz-Bestätigung (Selbstzahler/PKV) — knüpft an `RS_BILLING`
6. Entlassung geplant/gewünscht (Datum oder "in X Tagen")
7. Anschluss-Bedarf (Kurzfeld: ambulante Anschluss-Reha, Hilfsmittel-Beratung, Familie einbeziehen)
8. Auffälligkeiten/Sonstiges (optional, kurz)

Dokumente (Entlassbrief, Befunde) bleiben Datei-Uploads (Checkliste existiert bereits) — die medizinische Substanz lebt im PDF, nicht als Strukturfeld im CRM. Das ist zugleich technisch am einfachsten, weil es die Interoperabilitäts-Hürde zum echten KIS umgeht.

### 4.3 Zuständigkeit: Case Management als Brücken-Rolle

Pflege/Ärzte dokumentieren bereits im echten KIS — zusätzliche Eingabe hier würde Doppel-Dokumentation bedeuten und auf Widerstand stoßen. Realistisch zuständig: **Case Management/Sozialdienst/Aufnahmemanagement** (in den Demo-Daten schon als Rollen "Recovery Manager"/"S. Koordination" vorhanden) — diese Rolle vermittelt ohnehin zwischen Behandlungsteam, Kostenträgern und Zuweisern.

### 4.4 Datenfluss/Rhythmus

- **Ereignis-getriggert (sofort):** Dokument kommt an, Kostenzusage da, Status ändert sich → sofort ins Werdegang-Log, wie heute schon.
- **Reha-Zwischenstand (regelmäßig):** an die ohnehin stattfindende Teambesprechung andocken (z. B. wöchentlich) — die Case-Management-Person holt sich dort den Stand und trägt ihn in die Maske ein. Keine neue Pflichtaufgabe, sondern Nebenprodukt eines bestehenden Termins.
- **Automatisierter Reminder:** kein neuer Werdegang-Eintrag seit X Tagen → Fall wird als "Zwischenstand fällig" markiert (Zinnober/"stockt"-Farbe, im Design-System bereits reserviert).

### 4.5 UI-Verankerung

Die Eingabemaske lebt im bestehenden Rollen-Schalter-Modus "Mein Tag" (Koordination-Ansicht): dort erscheint eine Aufgabenliste "Zwischenstände fällig" (aus 4.4 generiert); Klick öffnet die Maske im "Erfolge & Verlauf"-Teil des Fall-Details. Speichern schreibt in dieselben geteilten Objekte (`inReha[]`/`RS_BILLING`) — für Barthel/FIM ist das geprüft ohne neue Kopplung: `renderEinblick()` (Cofounder-Bereich, `.rp-*`) liest `p.barthel.akt`/`p.fim.akt` schon heute direkt aus `inReha[]`. Die in §4.2 neuen Felder (Reha-Ziel, Arztbericht-Kurzfassung, DRG-Status, Entlassung, Anschluss-Bedarf, Auffälligkeiten) sind additive neue Properties auf denselben `inReha[]`-Objekten — technisch unschädlich (von Rendering-Code, der nur bekannte Keys liest, einfach ignoriert), aber genaugenommen Schema-Wachstum auf einer Struktur, die der Cofounder-Bereich mit iteriert. Keine Aktion nötig, nur zur Einordnung: falls der Cofounder diese neuen Felder später auch in der Zuweiser-Ansicht zeigen möchte, ist das sein Anschluss, keiner, den diese Spec vorschreibt.

**Organisatorischer Hinweis (kein Software-Thema):** Ob die Case-Management-Rolle real an der Teambesprechung teilnimmt, muss klinikintern geklärt/organisiert werden — das ist eine Voraussetzung, kein Bestandteil dieser Spec.

## 5. Bereich D — Zuweiserpflege-Automatisierung

### 5.1 Gesten-Leiter (analog zur Patienten-Sterne-Leiter)

Das `next`-Feld pro Zuweiser ist heute frei getippter Text. Neu: eine Regel, abhängig von Status + Draht-Stärke:

- **aktiv + starker Draht (●●●):** Quartalsgespräch/Dankesnotiz als wiederkehrende Aufgabe + jährliche Geschenkbox
- **aktiv, Draht schwächelt (●○○ trotz aktiv):** Warnsignal, höhere Priorität im Radar
- **aufbau:** persönlicher Besuch/Kennenlern-Termin als nächste Aktion
- **ziel:** automatischer Erstkontakt-Plan-Vorschlag statt Einzelfall-Text

Das `next`-Feld wird aus dieser Regel generiert, mit Möglichkeit zum manuellen Override.

### 5.2 Trend-Erkennung (dynamisch statt starr)

Zusätzlich zur bestehenden Anlass-Engine-Regel ("seit X Tagen kein Kontakt") ein neuer Trigger-Typ auf Basis der **Fallzahl-Entwicklung** pro Zuweiser über die letzten Monate:

- **2 Monate in Folge rückläufig** → Alarm "jetzt", Aufgabe "Kontakt suchen — Rückgang klären"
- **2 Monate in Folge steigend** → positive Meldung, Aufgabe "Kontakt mit Dankeschön/Bestätigung"; bei Status "aufbau" zusätzlich Vorschlag zur Hochstufung auf "aktiv" (bestätigt durch Mitarbeiter)

Der Trend-Trigger läuft unabhängig von der Routine-Kadenz aus 5.1 — er reagiert auf Auffälligkeiten, nicht auf den Kalender.

### 5.3 Archiv-Trennung (faktenbasiert, nicht status-basiert)

Primäransicht (Netzwerk→Zuweiser) bleibt schlank:

- **Primäransicht:** jeder Zuweiser, der mindestens eine konkrete Anfrage/einen Fall geschickt hat — unabhängig vom Status-Label (korrigiert nebenbei einen Widerspruch in den Demo-Daten: König-Ludwig-Haus hat 1 Fall, aber Status "ziel" — gehört nach dieser Regel in die Primäransicht).
- **Archiv, zweigeteilt:**
  - **Eigene Prospects** — Kliniken/Praxen ohne echten Fall bisher, die aktiv umworben werden sollen (von Hand priorisiert)
  - **Referenz-Stammdaten aus dem Krankenhausverzeichnis** — kompletter deutscher Bestand (Name, Adresse, Fachabteilungen), nicht aktiv gepflegt, dient nur als Abgleich-Basis für §2.4

Analog bei Patienten/Kontakten: **Archiv nur bei 1★** (explizite Ablehnung/Widerruf) — alles ab 2★ bleibt in der Primäransicht sichtbar, aber mit gestaffelter Pflege-Intensität (2★ = z. B. jährliche Broschüre, 5★ = persönliche Geste), analog zur bestehenden Sterne→Geste-Leiter.

### 5.4 Krankenhausverzeichnis-Prinzip (nicht in dieser Runde befüllt)

Das Krankenhausverzeichnis (realer Datensatz aller deutschen Krankenhäuser) wird als **Prinzip** für diese Runde festgehalten, nicht als reale Datenbefüllung in `index.html` umgesetzt — bleibt Demo/Prototyp, kein produktiver Datenimport. Wird eine spätere Runde relevant, dient es als Referenzquelle für den Institutions-Abgleich aus §2.4.

## 6. Zusammenfassung: Nicht-Ziele dieser Runde

- Keine echte KIS-Anbindung (strukturierte Datenübernahme aus dem Klinikinformationssystem)
- Kein echtes Backend/Persistenz — alles bleibt simulierter JS-Zustand in `index.html`
- Keine Hosting-Entscheidung (lokal/Cloud)
- Kein realer Import des Krankenhausverzeichnisses in die Demo-Daten
- Keine Änderung an Cofounder-Bereichen (`.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`) — Barthel/FIM-Propagation nutzt ausschließlich bereits geteilte Datenfelder, keine neue Kopplung
