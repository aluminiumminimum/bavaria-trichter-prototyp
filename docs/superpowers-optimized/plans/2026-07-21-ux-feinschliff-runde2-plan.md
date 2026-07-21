# UX-Feinschliff Runde 2 — Implementierungsplan

> **Für ausführende Agenten:** Dieser Plan wird Subagent-Driven umgesetzt — pro Task ein frischer Agent, kein Schreiben durch das orchestrierende Modell selbst. Lane-Tag pro Task beachten.

**Ziel:** Die 8 Feedback-Punkte aus [2026-07-21-ux-feinschliff-runde2-design.md](../specs/2026-07-21-ux-feinschliff-runde2-design.md) umsetzen — Korrektur bestehender Komponenten, keine neuen Features.

**Architektur:** Alle Änderungen in `index.html` (self-contained, kein Build). Sequentielle Ausführung — nie parallel, da alle Tasks dieselbe Datei anfassen. Nach jedem Task: Git-Commit.

**Lanes:** `claude-implementer` (Haiku, Standard) für mechanische/eindeutig spezifizierte Arbeit. `claude-implementer-pro` (Sonnet) für Tasks mit Interdependenzen, Ermessens-/Vergleichsarbeit oder Verhaltensänderungsrisiko.

**Harte Regeln (jeder Task):** Cofounder-Namespaces (`.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`, `openReferrer`/`closeReferrer`, `#refOverlay`) nicht anfassen. `inReha[]`/`zuweiser[]`/`faelle[]`/`personen[]` nur additiv erweitern, nie Felder umbenennen/entfernen. Bei 390px UND 1440px verifizieren, 0 Console-Errors, reduced-motion-safe. Vor dem Entfernen eines Formularfelds/einer Anzeige: `grep` nach dem Datenfeld im gesamten File, um versteckte Leser nicht zu brechen (siehe Task 6.1 — `drgStatus` wird z.B. in `paAkte`/Fallakte gelesen).

---

## Standard-Verifikation (nach jedem Task)

1. `grep -c "function "  index.html` vor/nach Vergleich — keine unbeabsichtigt gelöschten Funktionen.
2. Browser: Seite neu laden, Console auf 0 Errors prüfen.
3. Betroffene View bei 390px und bei 1440px öffnen, auf Overflow/Lesbarkeit prüfen.
4. Cofounder-Bereiche (Zuweiser-Portal `#refOverlay`, Matrix `.mx-*`, Reha-Charts `.rsp-*`) unverändert testen — nichts kaputt.
5. Commit mit klarer Botschaft, welcher Feedback-Punkt umgesetzt wurde.

---

## Phase 1 — Eingangs-Karte: Signale sichtbar machen (Punkt 1)

### Task 1.1 — Signal-Chips + Sterne auf Eingangs-Karte
**Lane:** claude-implementer
**Dateien:** Modify `index.html` — Funktion `renderEingang()` um [index.html:4544](../../index.html#L4544) (exakte Zeile beim Ausführen neu verifizieren, da vorherige Tasks Zeilennummern verschieben).

- [ ] Finde `renderEingang()` und die Stelle, an der `m` (Eingangs-Nachricht) zur Karte gerendert wird.
- [ ] Finde `erkenneSignale(text)` und `sterneAusSignal(sig)` (bereits vorhanden aus Runde 1) — prüfe, welche Felder sie zurückgeben (Programm, Kostenträger, Dringlichkeit/Frist, Sterne).
- [ ] Ergänze auf der Eingangs-Karte, vor dem Owner-Dropdown, eine Pill-Reihe mit den erkannten Signalen — exakt gleiche CSS-Klassen wie die Board-Karten-Pills (`.pill-a` für Achse/Programm, `.pill-kt` für Kostenträger, `.due`-Klasse für Dringlichkeit falls Frist erkannt). Kein neues CSS erfinden — bestehende Klassen wiederverwenden.
- [ ] Ergänze eine sichtbare Sterne-Anzeige (gleiches Symbol/Markup wie an anderer Stelle im Programm — die Render-Funktion dafür ist `sterneHtml(n)` [index.html:4669](../../index.html#L4669), bereits verwendet in `paAkte`/`arCard`/`renderRadar`/Datenbank-Liste — `grep -n "sterneHtml(" index.html` um alle Aufrufstellen als Vorbild zu sehen und exakt zu kopieren, nicht neu erfinden).
- [ ] Ändere den Button-Text von "Zuordnen & als Fall" zu "Als Fall anlegen & zuordnen" (String an der `onclick='uebernehmen(...)'`-Stelle).
- [ ] Standard-Verifikation, Commit: `feat: Signal-Chips + Sterne auf Eingangs-Karte sichtbar (Punkt 1)`

---

## Phase 2 — Fall-Detail-Drawer: Reihenfolge nach Aufgaben-Priorität (Punkt 2)

### Task 2.1 — Nächste-Aufgabe-Hero bauen und an den Anfang stellen
**Lane:** claude-implementer-pro (mehrere bestehende Blöcke werden zusammengeführt, Regressionsrisiko)
**Dateien:** Modify `index.html` — statisches Markup um `#ovDetail` ([index.html:3965-4018](../../index.html#L3965)) und `openDetail()` (Fülllogik).

- [ ] Lies den kompletten aktuellen `#ovDetail`-Block und `openDetail()` neu (Zeilen können sich seit der Spec-Analyse verschoben haben).
- [ ] Baue einen neuen Hero-Block direkt nach dem Drawer-Header, der zusammenfasst: Aufgabentyp/Frist/Verantwortlich (bisher `mgrid`: `dOwner`/`dAufgabe`/`dFrist`) UND den bestehenden `dAdvance`-Button ("Aktuelle Aufgabe erledigt → nächster Schritt").
- [ ] Entferne den bisherigen separaten `mgrid`-Block an seiner alten Position (Inhalt ist jetzt Teil des Hero).
- [ ] Verschiebe den Email/Antwort-senden-Block (aktuell erstes Element) hinter Werdegang — er ist eine Aktion, kein Einstiegspunkt.
- [ ] Neue Reihenfolge im DOM: Hero (Aufgabe+Advance) → Werdegang → Kostenzusage (nur falls aktuelle Aufgabe, siehe Task 2.3) → Stammdaten/Akte → Email/Antwort senden → Accordion-Details → Notiz/Verlauf → Footer.
- [ ] Standard-Verifikation (besonders: Drawer bei allen Fall-Status öffnen, kein leeres/kaputtes Layout), Commit: `refactor: Fall-Detail-Drawer — Nächste-Aufgabe-Hero zuerst (Punkt 2)`

### Task 2.2 — Werdegang: aktuellen Schritt visuell markieren
**Lane:** claude-implementer
**Dateien:** Modify `index.html` — CSS um [index.html:328-334](../../index.html#L328), ggf. `stepper()`/`deriveSchritte()`.

- [ ] Finde `deriveSchritte(f)` — prüft `done:i<cur`. Ergänze ein `current:i===cur`-Flag pro Schritt.
- [ ] Finde `stepper()` — rendere bei `current:true` eine zusätzliche CSS-Klasse `.stp.current` auf dem `.stp`-Element.
- [ ] CSS ergänzen: `.stp.current .dot{border-color:var(--brass);box-shadow:0 0 0 3px rgba(185,145,73,.25)}` (Gold-Ring, reduced-motion-safe — kein Keyframe, nur statisches CSS) und `.stp.current b{color:var(--brass-deep);font-weight:700}`.
- [ ] Standard-Verifikation, Commit: `fix: Werdegang zeigt aktuellen Schritt eindeutig (Punkt 2)`

### Task 2.3 — Kostenzusage-Button nur bei tatsächlicher Aktualität
**Lane:** claude-implementer
**Dateien:** Modify `index.html` — `kzActions()` um [index.html:5769-5775](../../index.html#L5769) (Zeilen bei Ausführung neu prüfen, Task 2.1 verschiebt Umgebung nicht, da anderer Funktionsbereich).

- [ ] In `kzActions(f)`: den Button „Kostenzusage anfragen" nur zeigen, wenn zusätzlich zu `f.kosten==="offen"` auch `f.aufgabe` inhaltlich auf Kostenklärung hindeutet (z.B. `/kostenzusage|kostenklärung/i.test(f.aufgabe||"")`) — sonst nur den reinen Status-Text ohne Aktions-Button zeigen.
- [ ] Standard-Verifikation, Commit: `fix: Kostenzusage-Button nur bei aktueller Aufgabe (Punkt 2)`

---

## Phase 3 — Vollständige Akte: Overlay-Bug + Premium-Styling (Punkt 3)

### Task 3.1 — Drawer beim Öffnen der Akte schließen
**Lane:** claude-implementer
**Dateien:** Modify `index.html` — `openFallakte(id)` (`grep -n "function openFallakte"`).

- [ ] In `openFallakte(id)`: vor `go('fallakte')` den Fall-Detail-Drawer schließen. **Nicht** das `openRsDetail()`-Muster (`["ovDetail","dbDetail"].forEach(...)`) kopieren — das ist dort nur sicher, weil direkt danach erneut `pushDetailState()` für das neue Overlay aufgerufen wird. `openFallakte()` öffnet aber kein Overlay, sondern navigiert per `go('fallakte')` (eigene Route, kein Overlay-Push). Stattdessen die bestehende Funktion `mtCloseOverlays()` ([index.html:6217-6223](../../index.html#L6217)) aufrufen — sie schließt alle Overlays UND setzt `_detailPushed=false` zurück. Ohne dieses Zurücksetzen bleibt `_detailPushed` auf `true` hängen, und der Browser-Zurück-Button auf der Fallakte-Ansicht würde dann in den `popstate`-Handler ([index.html:6356-6358](../../index.html#L6356)) laufen, der nur `_rawCloseDetails()` aufruft statt `applyHash()` — Zurück würde also nichts tun.
- [ ] Standard-Verifikation: Fall öffnen → „Vollständige Fallakte öffnen" klicken → nur EINE Ansicht sichtbar, kein Overlay im Hintergrund. **Zusätzlich:** danach Browser-Zurück drücken und bestätigen, dass die Ansicht tatsächlich wechselt (nicht nur visuell prüfen — dieser Regressionspunkt ist nicht offensichtlich sichtbar).
- [ ] Commit: `fix: Fall-Detail-Drawer schließt beim Öffnen der Fallakte (Punkt 3)`

### Task 3.2 — Premium-Rahmung für die Fallakte-Ansicht
**Lane:** claude-implementer
**Dateien:** Modify `index.html` — CSS-Block vor `</style>`, betrifft `#view-fallakte .chap`.

- [ ] Finde die bestehende CSS-Regel für `#view-heute>.chap` bzw. `#view-meintag .chap` (Jade-Rahmen + Gold-Eckwinkel, `grep -n "view-heute>.chap\|view-meintag .chap" index.html`).
- [ ] Ergänze eine analoge Regel für `#view-fallakte .chap` (gleiche Rahmen-/Eckwinkel-Deklaration, im passenden kommentierten CSS-Block ergänzen, nicht bestehende Regeln umschreiben).
- [ ] Erhöhe die Schriftgrößen in `.pa-row`/`.pa-k`/`.pa-v` **nur innerhalb von `#view-fallakte`** (spezifischerer Selektor `#view-fallakte .pa-row` etc., um die anderswo verwendete `.pa-row`-Komponente — z.B. Bestand-Detail — nicht zu verändern).
- [ ] Standard-Verifikation bei 390px UND 1440px (Rahmen darf bei 390px nicht überlaufen), Commit: `style: Fallakte-Ansicht bekommt Premium-Rahmung + größere Schrift (Punkt 3)`

---

## Phase 4 — Zuweiser: Ranking + Pflegehinweise an der Karte (Punkt 4)

### Task 4.1 — Sortierung nach Fallzahl + Trend-Hinweis auf der Karte
**Lane:** claude-implementer
**Dateien:** Modify `index.html` — `renderZuweiser()` ([index.html:5122-5170](../../index.html#L5122)).

- [ ] **Nicht anfassen:** die Archiv-Filterung (`primaryFiltered`/`zArchivAnzeigen`, [index.html:5130-5134](../../index.html#L5130)) bleibt exakt wie sie ist.
- [ ] Ändere die Sortierung ([index.html:5155](../../index.html#L5155)) von reiner Status-Sortierung zu: zuerst nach Status (aktiv vor aufbau — Ziel kommt durch den Archiv-Filter ohnehin kaum noch vor), dann innerhalb dessen nach `z.faelle` absteigend. Beispiel: `sorted=[...filtered].sort((a,b)=>({aktiv:0,aufbau:1,ziel:2}[a.status]-{aktiv:0,aufbau:1,ziel:2}[b.status])||(b.faelle-a.faelle))`.
- [ ] In der Karten-Render-Zeile ([index.html:5167](../../index.html#L5167), `znext`): wenn `anlaesse()` für diesen Zuweiser aktuell einen `zuweiser-trend`-Eintrag mit `urg==="jetzt"` erzeugt (Rückgang), zeige stattdessen dessen `geste.label` statt `z.next||naechsteAktion(z)`. Prüfe den exakten Rückgabewert von `anlaesse()` für den `zuweiser-trend`-Typ (`grep -n "zuweiser-trend" index.html`), um das richtige Feld zu referenzieren — nicht raten.
- [ ] Standard-Verifikation, Commit: `feat: Zuweiser-Karten nach Fallzahl sortiert + Trend-Hinweis direkt sichtbar (Punkt 4)`

---

## Phase 5 — Radar: B2B/B2C trennen, Kartenoptik heben (Punkt 5)

### Task 5.1 — Zuweiser-Anlässe in die Zuweiser-Ansicht verschieben
**Lane:** claude-implementer-pro (Vergleichsarbeit mit bestehender Premium-Optik, kein rein mechanischer Task)
**Dateien:** Modify `index.html` — `anlaesse()` ([index.html:4698-4742](../../index.html#L4698)), `renderRadar()` ([index.html:4998-5025](../../index.html#L4998)), `renderZuweiser()` (aus Phase 4).

- [ ] In `renderZuweiser()`: die Zuweiser-Anlässe (Typ `zuweiser`/`zuweiser-trend` aus `anlaesse()`) werden — sofern nicht schon durch Task 4.1 als `znext`-Ersatz abgedeckt — NICHT mehr über `renderRadar()`/das gemeinsame Grid gezeigt.
- [ ] In `renderRadar()`/`anlaesse()`: die Zuweiser-Typen aus dem gemeinsamen Feed entfernen bzw. so filtern, dass `renderRadar()` nur noch Patienten-Anlässe (Geburtstag, Jubiläum, Wiederbedarf) zeigt. Überschrift „Anlässe (Geburtstage & Zuweiser)" entsprechend zu „Anlässe" ändern (nur noch Patienten).
- [ ] `radar` ist bereits nur ein Unterpunkt-Segment von `netzwerk` (`SEGS.netzwerk`, [index.html:6235](../../index.html#L6235)), keine eigenständige Top-Level-Route — insofern ist keine große Navigations-Änderung nötig. Den Anlässe-Block (jetzt nur noch Patienten-Anlässe) entweder als Unterpunkt in der Bestand/Kontakte-Ansicht belassen/verschieben oder als eigenes `netzwerk`-Segment weiterführen, solange er nicht mehr B2B+B2C mischt — die Nav-Struktur selbst muss nicht angetastet werden.
- [ ] Standard-Verifikation: keine gemischte B2B/B2C-Liste mehr an irgendeiner Stelle, Commit: `refactor: Radar-Feed nach B2B/B2C getrennt (Punkt 5, Teil 1)`

### Task 5.2 — Anlass-Karten optisch auf Programmniveau heben
**Lane:** claude-implementer-pro
**Dateien:** Modify `index.html` — `arCard(a,i)` ([index.html:4754-4771](../../index.html#L4754)), zugehöriges CSS.

- [ ] Vergleiche `arCard()` mit mindestens zwei bestehenden Premium-Karten im Programm (z.B. Board-Karte `makeBoardCol`/[index.html:4618-4629](../../index.html#L4618), oder `zcard` in `renderZuweiser()`) — identifiziere konkret, was fehlt: Avatar/Initialen, Farbcodierung nach Dringlichkeit, klare Label/Wert-Hierarchie statt Fließtext.
- [ ] Baue `arCard()` mit denselben strukturellen Elementen um: Avatar (`initialen(name)`), farbcodierte Dringlichkeits-Pille (analog `.due`-Klasse: `jetzt`/`bald`/`beob` → Zinnober/Gold/neutral), klar getrennte Label/Wert-Zeilen statt eines Textabsatzes.
- [ ] Kein neues Farbschema erfinden — nur bestehende Tokens (`--brass`, `--sage-deep`, Zinnober) und bestehende Klassennamen-Konventionen wiederverwenden.
- [ ] Standard-Verifikation bei 390px UND 1440px, Commit: `style: Anlass-Karten (arCard) auf Premium-Kartenoptik gehoben (Punkt 5, Teil 2)`

---

## Phase 6 — Case-Manager-Protokoll konsolidieren (Punkte 6+7+8)

Diese drei Feedback-Punkte hängen zusammen: das Case-Manager-Formular verlässt `openRsDetail()` und wird zur typ-spezifischen Eingabe in der Mitarbeiteransicht (Mein Tag). Ein Task, da beide Seiten (alter Ort + neuer Ort) in derselben Änderung konsistent gehalten werden müssen.

### Task 6.1 — Vorprüfung: wer liest die zu entfernenden Felder?
**Lane:** claude-implementer-pro
**Dateien:** Read-only Analyse, kein Schreiben in diesem Task.

- [ ] `grep -n "\.drgStatus\|\.rehaZiel\|\.arztberichtKurz\|\.entlassungGeplant\|\.anschlussBedarf\|\.auffaelligkeiten" index.html` — für jedes Feld alle Lesestellen auflisten (bekannt bereits: `drgStatus` wird in `renderFallakte()` gelesen, [index.html:6332](../../index.html#L6332) laut Spec-Review — Zeile bei Ausführung neu verifizieren; das ist eine andere Funktion als `paAkte()`, das über `paAkte(p.personId)` separat in `openRsDetail()` aufgerufen wird).
- [ ] Für jede gefundene Lesestelle außerhalb des zu entfernenden Formulars: entscheiden ob (a) Anzeige bleibt bestehen und liest weiterhin aus dem (jetzt nicht mehr editierbaren) Datenfeld — unproblematisch, Feld bleibt im Modell, nur nicht mehr in diesem Formular editierbar — oder (b) die Lesestelle wird obsolet und sollte ebenfalls entfernt werden. Ergebnis kurz dokumentieren (Kommentar im Code oder Rückgabe an den nächsten Task), nicht einfach löschen.
- [ ] Kein Commit (reine Analyse) — Ergebnis wird in Task 6.2 verwendet.

### Task 6.2 — Kurzbericht-Eingabe in Mein Tag, Formular aus openRsDetail entfernen
**Lane:** claude-implementer-pro
**Dateien:** Modify `index.html` — `openRsDetail()` ([index.html:5582-5647](../../index.html#L5582)), `rsSaveZwischenstand()` ([index.html:5648-5661](../../index.html#L5648)), `mtSheetRender()` ([index.html:6154-6180](../../index.html#L6154)), `mtZwischenstandItem()` ([index.html:6038-6042](../../index.html#L6038)), `mtAbschliessen()`.

- [ ] In `openRsDetail()`/`rsErfolg`: Block bleibt lesend, unverändert (`p.kurzbericht` weiter anzeigen).
- [ ] In `openRsDetail()`/`rsWirt`: Block „Sinnvolle nächste Diagnostik & Therapie" (`bill.empf`, [index.html:5622](../../index.html#L5622)) entfernen.
- [ ] Den kompletten `#rsZwischenstand`-Block (Eingabeformular, [index.html:5624-5643](../../index.html#L5624)) aus `openRsDetail()` entfernen. Falls `#rsZwischenstand` als DOM-Element dann leer/ungenutzt ist: leeres Element im HTML-Grundgerüst kann bestehen bleiben (kein Schaden) oder entfernt werden — nach Ermessen, aber keine hängenden `document.getElementById(...)`-Aufrufe auf entferntes Markup hinterlassen.
- [ ] `rsSaveZwischenstand(i)` wird nicht mehr von `openRsDetail()` aus aufgerufen — falls seine Logik komplett in den neuen Mein-Tag-Speicherpfad wandert, alte Funktion entsprechend anpassen/ersetzen (kein doppelter toter Code — alte Funktion umbauen statt Duplikat anlegen).
- [ ] In `mtSheetRender()`: für `item.typ==="zwischenstand"` einen eigenen Body-Abschnitt rendern (statt des generischen „Warum jetzt/So gehst du vor/Leitfaden"-Musters oder zusätzlich dazu): ein Textarea vorbefüllt mit `inReha[item.idx].kurzbericht`, Label „Aktueller Kurzbericht". Footer-Button „Speichern" statt „Erledigt · ins Protokoll" (Zwischenstand hat kein klassisches Abschließen-Konzept, ist ein wiederkehrender Status).
- [ ] Neue Speicherfunktion (kann `rsSaveZwischenstand` sein, umgebaut): schreibt den Textarea-Wert direkt in `inReha[idx].kurzbericht` (NICHT mehr `zwischenstand.text`). Optional: `zwischenstand.datum`/`.autor` als leichte Metadaten weiter pflegen (heutiges Datum, aktueller Team-Nutzer), aber das ist sekundär.
- [ ] Standard-Verifikation: Mein Tag → Zwischenstand-Aufgabe öffnen → Kurzbericht bearbeiten → Speichern → in `openRsDetail()` (Leitungs-Lesebereich) erscheint der neue Text unter „Aktueller Kurzbericht". Zusätzlich effektiv (falls ohne echten Login möglich): prüfen, dass der Zuweiser-Portal-Einblick-Tab (`.rp-kurz`) denselben Text zeigt — falls das im Programm-Fluss nicht ohne Weiteres testbar ist, zumindest per Code-Inspektion bestätigen, dass beide dasselbe Feld lesen.
- [ ] Commit: `refactor: Case-Manager-Kurzbericht exklusiv in Mein Tag, Leitungs-Overlay wird reiner Lesebereich (Punkte 6+7)`

### Task 6.3 — Typ-spezifische Eingabefelder für die übrigen Mein-Tag-Aufgaben
**Lane:** claude-implementer-pro
**Dateien:** Modify `index.html` — `mtSheetRender()`, `mtAbschliessen()`.

- [ ] Für `typ` in `rueckruf`/`angebot`/`unterlagen`/`eingang`/`intern`/`allgemein`: vor dem „Erledigt"-Button ein Notiz-Textarea ergänzen (Placeholder „Was wurde besprochen?"). Der „Erledigt"-Button bleibt deaktiviert (oder zeigt einen Hinweis), solange das Feld leer ist.
- [ ] Für `typ==="kosten"`: zusätzlich zum Notizfeld eine Status-Auswahl (Select: „Zusage" / „Ablehnung" / „Ausstehend").
- [ ] **Wichtig — `mtAbschliessen()` verzweigt nach `item.kind`, nicht nach `item.typ`, und nicht jede `kind` hat ein Fall-Log:** Nur `kind==="fall"`-Items haben `ref` als echtes `Fall`-Objekt mit `.log`-Array — dort den eingegebenen Notiz-Text (+ bei Kosten den Status) tatsächlich in `f.log`/`pHist` schreiben, statt des automatisch generierten Texts. `kind==="eingang"`-Items haben `ref=m` (ein `eingang[]`-Nachrichtenobjekt ohne `.log`-Feld) — hier den Notiz-Text stattdessen in ein neues additives Feld `m.notiz` schreiben und prüfen, wo `eingang[]`-Einträge sonst noch angezeigt werden, um `m.notiz` dort mit anzuzeigen. `kind==="intern"`-Items haben `ref=x` (statischer `MT_INTERN`-Eintrag, ausdrücklich „kein Fall-Bezug" kommentiert) — hier den Notiz-Text in einer neuen Begleit-Map (z.B. `_mtNotizen = new Map()`, key → Notiz) ablegen (`_mtDone` selbst ist ein `Set` von Keys und kann keinen Text halten) und in der Karte anzeigen (z.B. „✓ Erledigt: <Notiz>" im `mt-check`-Element), da es keinen persistenten Fall gibt, in den geschrieben werden könnte.
- [ ] Standard-Verifikation: für mindestens einen Rückruf-Task (`kind==="fall"`) und einen Kostenklärungs-Task den Ablauf durchklicken, prüfen dass der eingegebene Text im Fall-Verlauf (Fall-Detail-Drawer, Verlauf-Sektion) tatsächlich auftaucht. Zusätzlich einen Eingang- und einen Intern-Task durchklicken und prüfen, dass die Notiz dort sichtbar landet (nicht stillschweigend verworfen wird).
- [ ] Commit: `feat: Mein Tag — typ-spezifische Eingabefelder statt generischem Erledigt-Knopf (Punkt 8)`

---

## Reihenfolge / Abhängigkeiten

```
Phase 1 (unabhängig) ─┐
Phase 2 (unabhängig)  ─┼─→ sequentiell ausführen (gleiche Datei), Reihenfolge untereinander frei
Phase 3 (unabhängig)  ─┤
Phase 4 (unabhängig)  ─┘
Phase 5 (nutzt evtl. Zwischenstand aus Phase 4/znext) — nach Phase 4
Phase 6 (Task 6.1 vor 6.2 vor 6.3 — harte Abhängigkeit)
```

Empfehlung: 1 → 2 → 3 → 4 → 5 → 6, da Phase 6 am risikoreichsten ist (mehrere Dateien/Funktionen betroffen) und von einer stabilen Codebasis profitiert.

---

## Nicht-Ziele

- Keine neuen `inReha[]`/`zuweiser[]`/`faelle[]`-Felder.
- Keine Änderung an `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*` oder `openReferrer`/`closeReferrer`/`#refOverlay`.
- Keine Änderung der Navigations-IA über das in Task 5.1 beschriebene Ausmaß hinaus (Radar wird eingebettet, nicht zu einer komplett neuen Struktur umgebaut).
