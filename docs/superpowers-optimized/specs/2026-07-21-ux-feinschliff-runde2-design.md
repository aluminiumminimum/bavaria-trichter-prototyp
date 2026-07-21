# UX-Feinschliff Runde 2 — Design

**Bezug:** Korrektur-Runde zur Umsetzung aus [2026-07-21-strategie-runde-eingang-pflege-design.md](./2026-07-21-strategie-runde-eingang-pflege-design.md). Kein neues Feature — die dort spezifizierte Funktionalität existiert, aber die Umsetzung erreicht nicht das visuelle und informationsarchitektonische Niveau des restlichen Programms. Diese Spec korrigiert das, Punkt für Punkt, entlang des wörtlichen Nutzer-Feedbacks.

**Nicht-Ziel:** Keine neuen Datenfelder, keine neue Architektur. Nur Umbau bestehender (in Runde 1 gebauter) Komponenten. Harte Projektregeln bleiben unverändert in Kraft: Cofounder-Namespaces (`.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`, `openReferrer`/`closeReferrer`, `#refOverlay`) werden nicht angefasst; `inReha[]` nur additiv; jede Änderung bei 390px und 1440px verifizieren, 0 Console-Errors, reduced-motion-safe.

---

## 1. Eingangs-Karte — Signal-Erkennung sichtbar machen

**Ist:** `renderEingang()`, [index.html:4544](../../index.html#L4544). Die Karte einer eingehenden Anfrage zeigt nur ein Owner-Dropdown und zwei Buttons (`Zuordnen & als Fall`, `✉ Antworten`). Die bereits existierende Signal-Erkennung (`erkenneSignale()`, `sterneAusSignal()`) berechnet Programm/Kostenträger/Dringlichkeit/Konkretheit und daraus resultierende Sterne — aber nichts davon wird auf der Karte angezeigt. Die Leitung sieht keine Grundlage für die Ranking-/Zuordnungsentscheidung.

**Soll:**
- Erkannte Signale als Pills auf der Karte anzeigen, gleiche visuelle Sprache wie die Board-Karten-Pills (`.pill-a`/`.pill-kt`, [index.html:4618-4629](../../index.html#L4618)): Programm, Kostenträger, Dringlichkeit/Frist.
- Sichtbare Sterne-Bewertung (gleiche `STERNE`-Symbolik wie an anderer Stelle im Programm) direkt auf der Karte, nicht nur intern zur Sortierung genutzt.
- Button-Text zu vollständigem Satz: „Als Fall anlegen & zuordnen" statt „Zuordnen & als Fall".

**Erfolgskriterium:** Beim Blick auf eine Eingangs-Karte ist ohne Klick erkennbar: wer, woher, was wird gebraucht, wie konkret/dringend — als Entscheidungsgrundlage für Zuordnung.

---

## 2. Fall-Detail-Drawer — Reihenfolge nach Aufgaben-Priorität

**Ist:** `openDetail()`/`#ovDetail`, [index.html:3965-4018](../../index.html#L3965). Aktuelle Reihenfolge: (1) Email-senden-Button, (2) Werdegang, (3) Kostenzusage-Kette, (4) Stammdaten/Akte, (5) Verantwortlich/Aufgabe/Frist-Grid, (6) Accordion-Details, (7) Notiz, (8) Verlauf, (9) neue Notiz, (10) Footer. Die eigentlich wichtigste Information — was ist jetzt zu tun — steht in Punkt 5, mittig vergraben, in einem generischen Feld ohne visuelle Hervorhebung.

**Soll — neue Reihenfolge:**
1. **Nächste-Aufgabe-Hero** ganz oben: Aufgabentyp (Icon + Label), Frist, Verantwortlich, und eine zur Aufgabe passende direkte Aktion (z.B. bei „Rückruf" ein Notizfeld analog zu Punkt 8/Mitarbeiteransicht — gleiche Komponente wiederverwendet, nicht neu erfunden).
2. Werdegang (Stepper) — mit Fix (siehe unten).
3. Kostenzusage — nur sichtbar/hervorgehoben, wenn sie tatsächlich die aktuelle Aufgabe ist; sonst als reiner Status im Akte-Bereich.
4. Stammdaten/Akte — als sekundäre Referenz.
5. Email/Antwort senden — als Aktion *innerhalb* der jeweiligen Aufgabe, nicht als eigenständiges erstes Element.
6. Accordion-Details, Verlauf, neue Notiz — bleiben am Ende (Referenz-/Protokoll-Charakter).

Das bisherige separate `mgrid` (Verantwortlich/Aufgabe/Frist) entfällt als eigener Block, da in den Hero integriert. Der bestehende Button „Aktuelle Aufgabe erledigt → nächster Schritt" (`dAdvance`, [index.html:3973](../../index.html#L3973)) fungiert schon heute als De-facto-Weiter-Aktion — er wird Teil des neuen Hero-Blocks (nicht separat davor), damit „nächste Aufgabe anzeigen" und „nächste Aufgabe erledigen" an derselben Stelle stehen.

**Werdegang-Fix:** [index.html:328-334](../../index.html#L328). Aktuell sind alle Stufen-Labels `color:var(--ink)` — nur der Punkt (`.dot`) wird bei erledigten Stufen grün. Der *aktuelle* Schritt ist optisch nicht von zukünftigen zu unterscheiden. Fix: eigene Markierung für die aktuelle Stufe (z.B. Gold-Ring um den Punkt + Label fett/hervorgehoben), zusätzlich zur bestehenden „erledigt"-Markierung.

**Kostenzusage-Fix:** [index.html:5771](../../index.html#L5771). Der Button „Kostenzusage anfragen" hat aktuell keinen Bezug zu Owner oder Frist und erscheint unabhängig vom Kontext. Fix: nur als hervorgehobene Aktion zeigen, wenn Kostenklärung tatsächlich die aktuelle Aufgabe des Falls ist (`f.aufgabe` referenziert das); sonst nur als Statuszeile im Akte-Bereich.

**Erfolgskriterium:** Beim Öffnen eines Falls ist ohne Scrollen erkennbar, was jetzt zu tun ist, von wem, bis wann — und der Werdegang zeigt eindeutig den aktuellen Stand.

---

## 3. Vollständige Fallakte — Overlay-Bug + Premium-Styling

**Ist — Bug:** `openFallakte(id)`, [index.html:6301](../../index.html#L6301) setzt nur `_fallakteId` und ruft `go('fallakte')` — ohne `dismissDetail()`. Der Fall-Detail-Drawer (`#ovDetail`) bleibt als Overlay sichtbar, während im Hintergrund die Fallakte gerendert wird. Zwei Ansichten gleichzeitig offen.

**Soll:** `openFallakte()` schließt den Drawer explizit (`dismissDetail()` bzw. Äquivalent), bevor die Fallakte-Route aktiviert wird.

**Ist — Styling:** `#view-fallakte` hat keine einzige eigene CSS-Regel (0 Treffer bei Selektor-Suche). Die Übersicht (`faUebersicht`) nutzt generische `.pa-row`-Zeilen (10.5px Label, 13px Wert, [index.html:1476-1480](../../index.html#L1476)) ohne die Premium-Rahmung, die z.B. `#view-heute>.chap` oder `#view-meintag .chap` (Jade-Rahmen, Gold-Eckwinkel) bereits besitzen.

**Soll:** `#view-fallakte .chap` bekommt dieselbe Premium-Rahmung wie `#view-heute`/`#view-meintag`. Die Übersicht wird visuell aufgewertet: größere Schrift, klare Hierarchie (Kopfbereich mit Avatar/Achse-Pill/Sterne wie im Board), statt einer reinen Text-Tabelle.

**Erfolgskriterium:** Nur eine Ansicht gleichzeitig sichtbar; die Fallakte sieht aus wie ein gleichwertiger Teil des Programms, nicht wie eine angehängte Rohdaten-Liste.

---

## 4. Zuweiser-Ansicht — Ranking + Pflegehinweise direkt an der Karte

**Ist — bereits korrekt (nicht anfassen):** `renderZuweiser()`, [index.html:5122-5170](../../index.html#L5122). Die Archiv-Trennung ist entgegen dem ersten Eindruck bereits faktenbasiert korrekt umgesetzt: `primaryFiltered=filtered.filter(z=>z.faelle>=1)` ([index.html:5132](../../index.html#L5132), Kommentar „§5.3 Archiv-Split"), gesteuert über `zArchivAnzeigen` ([index.html:4409](../../index.html#L4409)) mit Toggle-Button ([index.html:5153](../../index.html#L5153)) — exakt die in Runde 1 vereinbarte Regel „jeder der real schon mal einen Patienten geschickt hat gehört in die Primäransicht", nicht statusbasiert. **Dieser Teil bleibt unverändert.**

**Ist — tatsächliche Lücken:**
- Sortierung der sichtbaren Karten ([index.html:5155](../../index.html#L5155)) ordnet nur nach `status` (`{aktiv:0,aufbau:1,ziel:2}`), nicht nach Fallzahl — der Zuweiser mit den meisten Zuweisungen steht nicht zuverlässig oben.
- Die „Nächste Aktion" pro Karte ([index.html:5167](../../index.html#L5167), `z.next||naechsteAktion(z)`) ist bei allen Demo-Einträgen ein statisches Textfeld, kein aus Fallzahl-Trend berechneter Hinweis — der Trend-Nudge aus `anlaesse()` (§5.2, Rückgang/Zuwachs) taucht nur im gemischten Radar-Feed auf (siehe Punkt 5), nicht an der Zuweiser-Karte selbst.

**Soll:**
- Sichtbare Karten (nach Archiv-Filter, unverändert) zusätzlich nach `z.faelle` absteigend sortieren.
- Den bereits in `anlaesse()` berechneten Trend-Hinweis (Rückgang → „Kontakt suchen", Zuwachs → „Dankeschön") direkt in `znext` der jeweiligen Zuweiser-Karte einblenden (statt nur im separaten Feed), sodass Pflege aus der Zuweiser-Ansicht heraus geschieht.

**Erfolgskriterium:** Die Zuweiser-Hauptansicht (unveränderter Archiv-Filter) zeigt die relevantesten Partner zuerst und macht Pflegebedarf direkt an der Karte sichtbar — ohne Umweg über einen separaten Feed.

---

## 5. Radar — B2B/B2C trennen, Kartenoptik auf Programmniveau heben

**Klarstellung des Nutzer-Feedbacks:** Es geht nicht um eine fehlende Detail-Akte (es gibt aktuell ohnehin keine klickbare Akte für Radar-Karten). Es geht um die **Kartendarstellung selbst**: `arCard()`, [index.html:4754-4771](../../index.html#L4754), rendert jeden Anlass (Geburtstag, Jubiläum, Wiederbedarf, Zuweiser-Anlass, Zuweiser-Trend) als reinen Textblock — ohne die visuelle Behandlung (Avatare, Farbcodierung, Struktur), die andere Karten im Programm (Board-Karten, Zuweiser-Karten, In-Reha-Karten) längst haben.

**Ist — Vermischung:** `anlaesse()`, [index.html:4698-4742](../../index.html#L4698), mischt Personen-Anlässe (B2C: Geburtstag, Jubiläum, Wiederbedarf) und Zuweiser-Anlässe (B2B: Kontaktpflege, Trend) in einem gemeinsamen, gemeinsam sortierten Array. `renderRadar()`, [index.html:5012](../../index.html#L5012), zeigt das explizit in einem gemeinsamen Grid unter der Überschrift „Anlässe (Geburtstage & Zuweiser)".

**Soll:**
- **Strukturell:** Radar wird kein eigenständiger Bereich mehr. Zuweiser-Anlässe (Kontaktpflege, Trend-Warnung) werden Teil der Zuweiser-Ansicht (siehe Punkt 4 — direkt an der Karte). Patienten-Anlässe (Geburtstag, Jubiläum, Wiederbedarf) werden Teil der Bestand/Kontakte-Ansicht (`renderBestand()`). B2B und B2C sind ab sofort in getrennten Views, nie in einer gemeinsamen Liste.
- **Visuell:** Die verbleibenden Karten (jetzt kontextuell in Zuweiser- bzw. Bestand-Ansicht) bekommen die gleiche Kartenqualität wie ihre Nachbarn — Avatar/Initialen, farbcodierte Dringlichkeit (analog `.due`/`.pill-a`), klare Typografie-Hierarchie statt Fließtext-Absätzen.

Diese Aufgabe ist überwiegend gestalterisch (CSS/Markup-Feinschliff, Abgleich mit bestehenden Premium-Komponenten) — wird an die Sonnet-Lane (`claude-implementer-pro`) vergeben, nicht an die Standard-Lane, da „an bestehende Premium-Optik angleichen" Ermessens- und Vergleichsarbeit statt mechanischer Umsetzung ist.

**Erfolgskriterium:** Keine gemeinsame Liste mit B2B+B2C mehr. Jede Anlass-Karte sieht aus wie eine vollwertige Karte des jeweiligen Bereichs, nicht wie ein Textblock.

---

## 6+7. In-Reha-Übersicht vs. Case-Manager-Protokoll — sauber trennen, echte Feld-Duplikation auflösen

**Ist:** Die `.ir-card`-Übersichtskarte selbst ([index.html:5723-5741](../../index.html#L5723)) enthält korrekt keine Case-Manager-Felder. Das eigentliche Problem liegt im Detail-Overlay `openRsDetail()`/`#rsDetail`, [index.html:5582-5647](../../index.html#L5582), und ist konkreter als zunächst angenommen:

- **Leitungs-Lesebereich** (`rsErfolg`, [index.html:5596-5603](../../index.html#L5596)) zeigt bereits `p.kurzbericht` als „Aktueller Kurzbericht" ([index.html:5601](../../index.html#L5601)) — und genau dieses Feld ist auch die Quelle, die das (Cofounder-eigene, nicht anzufassende) Zuweiser-Portal im Einblick-Tab anzeigt (`.rp-kurz`/`rpDoc('kurzbericht',...)`). `p.kurzbericht` ist also bereits die richtige, einzige Quelle für Leitung + Zuweiser.
- **Das Case-Manager-Eingabeformular** (`rsZwischenstand`, [index.html:5624-5643](../../index.html#L5624)) schreibt seinen Freitext aber in ein **komplett separates** Feld: `p.zwischenstand.text` ([index.html:5628](../../index.html#L5628), gespeichert via `rsSaveZwischenstand()` [index.html:5648-5661](../../index.html#L5648)) — nie in `p.kurzbericht`. Das Formular hat insgesamt **neun** Felder, nicht fünf: Zwischenstand-Datum, Zwischenstand-Text, Dokumentiert-durch, Reha-Ziel, Arztbericht-Kurzfassung, DRG-Status/Kostenzusage, Entlassung geplant, Anschluss-Bedarf, Auffälligkeiten.
- Ergebnis: Was die Case-Managerin einträgt (`zwischenstand.text`), sieht weder die Leitung noch der Zuweiser. Was Leitung/Zuweiser sehen (`kurzbericht`), kann die Case-Managerin nirgends bearbeiten — eine echte, aktuell unsichtbare Sackgasse, keine bloße Geschmacksfrage.
- Zusätzlich zeigt der Wirtschaftlichkeits-Bereich (`rsWirt`, [index.html:5622](../../index.html#L5622)) einen vorhandenen Block „Sinnvolle nächste Diagnostik & Therapie" (`bill.empf`) — genau das, was per früherer Absprache aus der Case-Manager-Dokumentation herausgehalten werden sollte.
- Hinweis für die Umsetzung: `p.drgStatus` (Formularfeld) und `bill.kostenzusage` (bereits separat in `rsWirt` als „Kostenzusage"-Pille angezeigt, [index.html:5595](../../index.html#L5595)/[5616](../../index.html#L5616)) sind zwei unterschiedliche, nicht verbundene Kostenzusage-Quellen — bei der Umsetzung prüfen, ob `drgStatus` überhaupt noch gelesen wird, bevor das Feld aus dem Formular entfernt wird.

**Soll:**
- `openRsDetail()`/`#rsDetail` bleibt reiner Lesebereich für die Leitung (zeigt weiterhin `p.kurzbericht`, unverändert) — der Block „Sinnvolle nächste Diagnostik & Therapie" (`bill.empf`) entfällt.
- Das Eingabeformular wandert exklusiv in die Mitarbeiteransicht (erreichbar über den bestehenden „Zwischenstand erfassen"-Reminder in Mein Tag, `mtZwischenstandItem`, [index.html:6038-6042](../../index.html#L6038)) — als eigene Eingabemaske dort, nicht als Rücksprung ins Leitungs-Overlay.
- **Feld-Reduktion (Punkt 7):** Die neue Eingabemaske hat nur noch **ein** Freitext-Feld: **aktueller Kurzbericht**, das direkt in `p.kurzbericht` schreibt (nicht mehr in `p.zwischenstand.text`). Datum/Autor als leichte Metadaten (wer/wann zuletzt aktualisiert) können bestehen bleiben, sofern sie nicht als zusätzlicher Dokumentationsaufwand wirken. Die sechs übrigen Strukturfelder (Reha-Ziel, Arztbericht-Kurzfassung, DRG-Status, Entlassung geplant, Anschluss-Bedarf, Auffälligkeiten) werden aus der Eingabemaske entfernt — das ist mehr, als eine Case-Managerin realistisch bei der wöchentlichen Teambesprechung dokumentiert. Die zugehörigen Datenfelder im Modell bleiben unangetastet (nur additiv erweitert laut Projektregel), falls andere Stellen sie lesen — das ist beim Entfernen der Formularfelder zu prüfen, nicht anzunehmen.

**Erfolgskriterium:** Leitung sieht weiterhin lesend `p.kurzbericht`; Case-Managerin trägt in der Mitarbeiteransicht direkt in `p.kurzbericht` ein — keine zwei parallelen Freitextfelder mehr; der Zuweiser-Einblick-Tab (cofounder-eigen, unangetastet) zeigt automatisch den aktuellen Stand, weil er dieselbe Quelle liest.

---

## 8. Mitarbeiteransicht — echte, typ-spezifische Eingabefelder statt „Erledigt"-Knopf

**Ist:** `mtSheetRender()`, [index.html:6154-6180](../../index.html#L6154). Für jeden Aufgabentyp (Rückruf, Angebot, Unterlagen, Kostenklärung, Eingang, Intern) identisches Muster: Lese-Leitfaden (`MT_SCHRITTE`, `MT_LEITFAEDEN`) plus ein einziger „Erledigt · ins Protokoll"-Button. Kein Eingabefeld. `mtAbschliessen()` generiert den Protokoll-Text automatisch aus statischen Referenzfeldern — die Mitarbeiterin kann nicht dokumentieren, was tatsächlich besprochen wurde.

**Soll:** Vor dem Abschließen-Button erscheint ein zum Aufgabentyp passendes Eingabeelement:
- **Rückruf, Angebot, Eingang:** Notiz-Textarea („Was wurde besprochen?") — Pflichtfeld vor Aktivierung des Abschließen-Buttons.
- **Kostenklärung:** Status-Auswahl (Zusage/Ablehnung/Ausstehend) + Notizfeld.
- **Zwischenstand:** bleibt wie in Punkt 6+7 beschrieben eigenständig (eigene Eingabemaske, kein Rücksprung).
- **Intern/Allgemein:** einfaches Notizfeld.

`mtAbschliessen()` schreibt den tatsächlich eingegebenen Text ins Fall-Protokoll (`f.log`), statt einen generischen Text zu erzeugen.

**Erfolgskriterium:** Nach Abschluss einer Aufgabe steht im Fall-Protokoll, was die Mitarbeiterin tatsächlich eingetragen hat — nicht nur, dass die Aufgabe erledigt wurde.

---

## Nicht-Ziele dieser Runde

- Keine neuen `inReha[]`-Felder (Punkt 6+7 reduziert Felder in der UI, ändert aber nicht die Datenstruktur — nicht angezeigte/nicht editierbare Felder bleiben im Datenmodell bestehen, falls andere Programmteile sie lesen).
- Keine Änderung an `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`-Namespaces oder `openReferrer`/`closeReferrer`/`#refOverlay`.
- Keine neue Automatisierung — reine Struktur- und Darstellungskorrektur bereits vorhandener Logik.
