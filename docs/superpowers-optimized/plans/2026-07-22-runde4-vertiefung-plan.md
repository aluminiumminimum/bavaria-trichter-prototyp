# Vertiefung Runde 4 — Implementierungsplan

> **Für ausführende Agenten:** Dieser Plan wird Subagent-Driven umgesetzt — pro Task ein frischer Agent, kein Schreiben durch das orchestrierende Modell selbst. Lane-Tag pro Task beachten. Jeder Task arbeitet ausschließlich in `index.html`; **vor jeder Anker-Zeile den `grep`-Befehl aus dem Task selbst erneut ausführen** — Zeilennummern verschieben sich durch jeden vorherigen Task, die hier notierten Zeilen sind der Stand bei Plan-Erstellung (22.07.2026, `index.html` 6667 Zeilen, Commit `6250213`), nicht garantiert der Stand bei Ausführung.

**Bezug:** Setzt [2026-07-22-runde4-vertiefung-design.md](../specs/2026-07-22-runde4-vertiefung-design.md) um (4 Vertiefungs-Punkte auf Runde 3 aufbauend — keine „sieht gut aus, tut aber nichts"-Fälle mehr, sondern Lücken aus dem tatsächlichen Benutzen der R3-Strukturen).

**Ziel:** Anfrage-Detail-Fenster mit echter Team-Zuordnung statt Akkordeon (Punkt 1), dynamische Fall-Akte, deren Arbeitsbereich sich nach Aufgabentyp richtet statt immer gleich auszusehen (Punkt 2), Netzwerk mit „Patienten" statt „Kontakte" und Radar/Stammdaten in getrennten Reitern (Punkt 3), strukturiertes Case-Management-Protokoll mit Index-Werten und Textbaustein-Chips statt einem einzelnen Freitextfeld (Punkt 4).

**Architektur:** Alle Änderungen in `index.html` (self-contained, ~6667 Zeilen, kein Build-Prozess). Sequentielle Ausführung — **nie parallel**, da jeder Task dieselbe Datei anfasst. Nach jedem Task: Git-Commit.

**Reihenfolge (zwingend, keine Umsortierung — Vorgabe des Koordinators, weicht bewusst von der Nummerierung im Spec-Dokument ab):** Phase 1 (Spec-Punkt 2, dynamische Fall-Akte) zuerst — größter Umbau am Drawer, unabhängig von den anderen drei Punkten. Danach Phase 2 (Spec-Punkt 1, Anfrage-Detail-Fenster) — nutzt `openDetail()`, das Phase 1 bereits umgebaut hat. Danach Phase 3 (Spec-Punkt 3, Netzwerk-Umbenennung + Tabs) — unabhängig von Phase 1+2, reiner Sweep + Markup-Wrapping. Zuletzt Phase 4 (Spec-Punkt 4, Protokoll-Board) — unabhängig von allen anderen Phasen.

**Lanes:**
- `claude-implementer` (Haiku) — **nur** für rein mechanische Tasks: Umbenennungs-Sweep (Task 3.1), CSS-Aufräumen/verwaisten Code entfernen (Task 2.3).
- `claude-implementer-pro` (Sonnet) — alles mit Markup-Neubau, neuer Render-Logik, Funktionsextraktion oder Verhaltensänderungsrisiko (dynamische Akte, neues Overlay, Owner-Zuordnung, Tab-Umbau, strukturiertes Formular).

**Harte Regeln (jeder Task, aus Spec + projektweitem CLAUDE.md):**
- Cofounder-Namespaces **nicht anfassen**: `.rp-*` (Zuweiser-Suite), `.rpd-*` (Dokument-Viewer), `.rsp-*` (Reha-Charts), `.mx-*` (Matrix), `openReferrer`/`closeReferrer`/`#refOverlay`. Ausnahme unverändert: `p.kurzbericht` bleibt gemeinsame Quelle für Leitung, Case-Management und Zuweiser-Portal (`.rp-kurz`, [index.html:5677](../../../index.html#L5677)).
- Datenarrays (`faelle[]`, `eingang[]`, `zuweiser[]`, `inReha[]`, `personen[]`, `bestand[]`, `radar[]`) **nur additiv erweitern** — `p.verlaufPlan` (Punkt 4) ist das einzige neue Datenfeld dieser Runde, alles andere sind Wert-Updates auf bestehenden Feldern. Vor Entfernen/Umbenennen eines Feldnamens per `grep` prüfen, wer es sonst noch liest.
- Bei 390px **und** 1440px verifizieren, 0 Console-Errors, reduced-motion-safe.
- **Keine neuen Keyframes** — exakt 9 verifiziert (`lift` [index.html:61](../../../index.html#L61), `rpDrawC`/`rpDrawP` [1060](../../../index.html#L1060)/[1061](../../../index.html#L1061), `rpRing` [1075](../../../index.html#L1075), `rpGrow` [1091](../../../index.html#L1091), `cv-travel` [1379](../../../index.html#L1379), `auGrow` [2051](../../../index.html#L2051), `lxSweep` [2060](../../../index.html#L2060), `lxPulse` [2103](../../../index.html#L2103)).
- `escapeHtml()` für jeden dynamisch eingefügten Text.
- Nur synthetische Demo-Daten.
- Etiketten-System (Doppelrahmen Jade-Hairline + Gold-Eckwinkel, Radius-Familie 4px) statt nackter Formularzeilen in Hero-/Major-Karten-Bereichen — Referenz `#view-fallakte .chap`/`::before`/`::after` ([index.html:3012-3017](../../../index.html#L3012)).
- Typografie: Cormorant Garamond für Display/Numerale (`.serif`/`.kicker`/`.chap-h2`/`.dcap`), Inter für Fließtext. Token statt Freihand-Farbe: `--sage-deep`/`--brass`/`--brass-deep`/`--terra`/`--alert`, alle in `:root` ([index.html:20-33](../../../index.html#L20)).
- Neue CSS-Blöcke additiv per **kommentiertem Block direkt vor `</style>`** (Stand Planerstellung [index.html:3082](../../../index.html#L3082)) — Projektkonvention, matcht bereits alle R3-Ergänzungen (`.eg-triage` ab [3037](../../../index.html#L3037), `.mtp-*` ab [3054](../../../index.html#L3054)).
- Neue Top-Level-Funktionen sind `function name(){}`-Deklarationen (hoisted), keine `const name=()=>{}` — matcht den Stil des restlichen Skripts.

---

## Standard-Verifikation (nach jedem Task)

1. `grep -c "function "  index.html` vor/nach Vergleich — keine unbeabsichtigt gelöschten Funktionen.
2. Browser: Seite neu laden, Console auf 0 Errors prüfen.
3. Betroffene View bei 390px und bei 1440px öffnen, auf Overflow/Lesbarkeit prüfen.
4. Cofounder-Bereiche (Zuweiserportal `#refOverlay`, Matrix `.mx-*`/Konzept-Tab, Reha-Charts `.rsp-*` in `openRsDetail()`) unverändert gegentesten — nichts kaputt.
5. Commit mit klarer Botschaft, welcher Spec-Punkt umgesetzt wurde.
6. Jeder Task unten endet mit einer eigenen **Sichtprüfung** — einem Satz, was im Browser sichtbar sein muss, damit der Task als erfüllt gilt. Diese Prüfung zusätzlich zu den Punkten 1-5 durchführen, nicht statt ihnen.

---

## Phase 1 — Spec-Punkt 2: Dynamische Fall-Akte — zuerst, größter Umbau

### Task 1.1 — `#dArbeit`: aufgabentyp-abhängiger Arbeitsbereich im Fall-Drawer

**Lane:** `claude-implementer-pro`

**Referenz-Komponenten (erst Vorbilder lesen):** `#ovDetail`/`.fh-hero` ([index.html:4071-4090](../../../index.html#L4071)) für Struktur und Etiketten-Rahmen; `kzChain(f)`/`kzActions(f)` ([index.html:5939-5956](../../../index.html#L5939)) und `kzNotizAdd()` ([index.html:5976-5984](../../../index.html#L5976)) — beide werden **verschoben, nicht neu gebaut**; `aufgabeIcon(a)` ([index.html:4167-4174](../../../index.html#L4167)) und `mtTyp()` ([index.html:6173-6178](../../../index.html#L6173)) als Stilvorbild für den neuen Regex-Klassifikator.

**Dateien/Anker:** `grep -n "class=\"mbody two-track\"\|class=\"fh-hero\"\|class=\"d-track-wrap\"\|class=\"mgrid\"\|id=\"dNotizSofort\"\|function aufgabeIcon\|const STATUS_AUFGABE\|forEach(u=>document.getElementById(u).addEventListener\|function updateDocCnt\|function openDetail\|dSpeichern.*onclick" index.html` vor Bearbeitung ausführen und alle folgenden Zeilenangaben neu bestätigen.

**Ist (verifiziert, Stand Planerstellung):**
- `.mbody.two-track` ([index.html:4077-4126](../../../index.html#L4077)): `.fh-hero` (4078-4090) → `.d-track-wrap` (4091-4099: `#dWerdegang`, `#dKZ` **immer** gerendert, `#dAkte`, `.komm-block` „Antwort senden" **immer** gerendert) → `.mgrid` (4100-4125: Accordion „Details & Unterlagen" mit den 4 Dokumente-Checkboxen `u1`-`u4` [4108-4115](../../../index.html#L4108), „Notiz sofort vermerken" [4122](../../../index.html#L4122), Verlauf `#dLog` [4123](../../../index.html#L4123), „Neue Notiz" `dNotiz` [4124](../../../index.html#L4124)).
- CSS-Grid ab 900px ([index.html:573-577](../../../index.html#L573)): `.mbody.two-track{grid-template-columns:1.5fr 1fr}`, `.mgrid{grid-column:1}`, `.d-track-wrap{grid-column:2}`. `.fh-hero` überspannt beide Spalten separat: `@media(min-width:900px){.mbody.two-track .fh-hero{grid-column:1/-1}}` ([index.html:2994](../../../index.html#L2994)) — **Selektor ist an `.mbody.two-track` gebunden, nicht bare `.fh-hero`** (wichtig: `#faNaechste` in der Fallakte-Dashboard nutzt dieselbe Klasse `.fh-hero` in einem anderen Grid, [index.html:3988](../../../index.html#L3988) — bleibt durch die Bindung an `.mbody.two-track` unberührt).
- `updateDocCnt()` + Event-Bindung, aktuell:
```js
function updateDocCnt(){const n=["u1","u2","u3","u4"].filter(u=>document.getElementById(u).checked).length;
  document.getElementById("docCnt").textContent="("+n+" / 4)";}
["u1","u2","u3","u4"].forEach(u=>document.getElementById(u).addEventListener("change",updateDocCnt));
```
  Zeile 2 (`forEach(...addEventListener...)`) läuft **einmalig beim Skriptstart** — sobald `u1`-`u4` nur noch bedingt (aufgabentyp-abhängig) existieren, wirft schon der allererste Seitenaufruf (kein Fall offen, `#dArbeit` leer) einen TypeError, weil `document.getElementById("u1")` `null` liefert. **Das ist der Kern von Plan-Auflage (a).**
- `openDetail()` ([index.html:6000-6033](../../../index.html#L6000)) und `dSpeichern`-Handler ([index.html:6047-6068](../../../index.html#L6047), grep `document.getElementById("dSpeichern").onclick`) greifen an mehreren Stellen ungeschützt auf `u1`-`u4`/`dKZ`/`dNotizSofort` zu — **vollständige Liste, alle selbst nachverifiziert, nicht nur die im Spec explizit genannten zwei Stellen:**
  - `openDetail()` Zeile 6015: `["u1","u2","u3","u4"].forEach((u,i)=>document.getElementById(u).checked=f.docs[i]);` — wird durch dieses Redesign **überflüssig** (der Checked-Zustand wird künftig direkt beim Rendern der Checkbox-HTML aus `f.docs[i]` gesetzt, nicht nachträglich per DOM-Zugriff) → **entfernen**, nicht guarden.
  - `openDetail()` Zeile 6016: `updateDocCnt();` — steht **vor** der Stelle, an der `#dArbeit` künftig gerendert wird (aktuell Zeile 6024) und liefe damit ohnehin ins Leere → **entfernen von hier**, stattdessen einmalig **nach** dem `#dArbeit`-Render aufrufen.
  - `openDetail()` Zeile 6020: `document.getElementById("dNotizSofort").value="";` — **selbst gefunden, nicht in Spec/Auftrag genannt:** `dNotizSofort` wird Teil von `#dArbeit` (nur bei Typ `rueckruf`/`allgemein` vorhanden) → braucht denselben Guard wie das bereits vorhandene Muster eine Zeile darunter.
  - `openDetail()` Zeile 6021: `var _dr=document.getElementById("dReply");if(_dr)_dr.value="";` — **bereits korrekt geguarded**, kein Fix nötig (Zufall oder Weitsicht aus einer früheren Runde — so oder so: nichts zu tun).
  - `openDetail()` Zeile 6024: `document.getElementById("dKZ").innerHTML=...` — wird durch den neuen `#dArbeit`-Render **ersetzt** (nicht guarden, ersatzlos durch die neue Zeile ersetzen).
  - `dSpeichern`-Handler, Zeile mit `f.docs=["u1","u2","u3","u4"].map(...)` (grep `f.docs=\[` zur Bestätigung): **muss** geguarded werden — das ist Plan-Auflage (a) im Wortlaut des Auftrags.
  - `sendReply()`s `document.getElementById("dReplyKanal").value` und `kzNotizAdd()`s `document.getElementById("dNotizSofort")`-Zugriff (letzterer **bereits** geguarded) sind **sicher ohne Guard**, weil beide Funktionen ausschließlich durch einen Button ausgelöst werden, der im selben `#dArbeit`-Zweig wie das gelesene Element steht (Button und Feld existieren immer zusammen oder gar nicht) — hier **keinen** Guard ergänzen, das wäre unnötige Komplexität ohne Nutzen.

**Plan-Auflage (a) — verbindlich, onchange-Inline statt addEventListener:** Zeile `["u1","u2","u3","u4"].forEach(u=>document.getElementById(u).addEventListener("change",updateDocCnt));` entfällt ersatzlos. Jede der vier Checkboxen bekommt stattdessen `onchange="updateDocCnt()"` direkt im (jetzt dynamisch gerenderten) Markup. Zusätzlich bekommt `updateDocCnt()` selbst einen Existenz-Guard (siehe Schritt 4), damit die Funktion aus jedem Kontext sicher aufrufbar ist. `openDetail()`s Doc-Schreibzeile (6015) und `dSpeichern`s Doc-Lesezeile brauchen ebenfalls Guards bzw. entfallen (siehe oben).

**Plan-Auflage (b) — verbindlich, CSS-Grid-Platzierung:** `#dArbeit` MUSS dieselbe `grid-column:1/-1`-Regel wie `.fh-hero` bekommen (identische Media-Query, [index.html:2994](../../../index.html#L2994) erweitern), sonst zieht das Grid-Auto-Placement `#dArbeit` in Spalte 1 und verschiebt `.mgrid` eine Zeile nach unten — die bestehende Seite-an-Seite-Ausrichtung von `.mgrid`/`.d-track-wrap` würde brechen.

**Schritte:**

- [ ] `grep`-Befehl oben ausführen, alle Zeilen neu bestätigen, `openDetail()` und den `dSpeichern`-Handler komplett neu lesen (Zeilen können sich seit Plan-Erstellung verschoben haben).

- [ ] **Markup:** `<div id="dArbeit"></div>` als neue Zeile zwischen `.fh-hero`s schließendem `</div>` und `<div class="d-track-wrap">` einfügen (heute zwischen den Zeilen 4090/4091).

- [ ] **`.d-track-wrap` verkleinern** — `#dKZ` und `.komm-block` verlassen diesen Block vollständig (ziehen in `#dArbeit`):
```html
<!-- Ist: -->
<div class="d-track-wrap">
  <div id="dWerdegang" class="d-track"></div>
  <div id="dKZ" class="kz-block"></div>
  <div id="dAkte"></div>
  <div class="komm-block" style="margin-top:14px">…Antwort senden…</div>
</div>
<!-- Soll: -->
<div class="d-track-wrap">
  <div id="dWerdegang" class="d-track"></div>
  <div id="dAkte"></div>
</div>
```

- [ ] **Accordion verkleinern** — die 4 Dokumente-Checkboxen (inkl. `docCnt`-Label, [index.html:4108-4115](../../../index.html#L4108)) aus `<details class="d-acc full">` entfernen; Status/Kostenstatus/Kostenträger/Einwilligung/SalutoCare-Toggle/Verlustgrund bleiben dort unverändert stehen.

- [ ] **`dNotizSofort`-Zeile entfernen** ([index.html:4122](../../../index.html#L4122)) — ihre Funktion übernimmt die typspezifische Notizfläche in `#dArbeit` (identisches Markup, identische ID, identischer Handler `kzNotizAdd()` — reine Verlagerung, kein Neubau).

- [ ] **Neue Funktionen** einfügen (z. B. direkt vor `kzChain(f)`, [index.html:5939](../../../index.html#L5939)):
```js
function drawerAufgabenTyp(f){
 const a=f.aufgabe||"";
 if(/rückruf|erstkontakt|anruf/i.test(a))return"rueckruf";
 if(/kosten/i.test(a))return"kosten";
 if(/unterlagen|dokument|befund/i.test(a))return"unterlagen";
 if(/angebot/i.test(a))return"angebot";
 if(/anreise|zimmer|aufnahme/i.test(a))return"anreise";
 return"allgemein";
}
function dArbeitHtml(f){
 const typ=drawerAufgabenTyp(f);
 if(typ==="kosten")
   return "<div id='dKZ' class='kz-block'><div class='kicker'>Kostenzusage</div>"+kzChain(f)+kzActions(f)+"</div>"
    +"<div class='full' style='margin-top:12px'><label>Kostenzusage-Dokument</label>"
    +"<button class='btn-ghost btn-sm' type='button' onclick='dArbeitKostenUpload()'>⇪ Dokument hochladen (Demo)</button></div>";
 if(typ==="unterlagen")
   return "<div class='full'><label>Unterlagen <span id='docCnt' style='color:var(--brass-deep)'></span></label>"
    +"<div class='docs'>"
    +"<label><input type='checkbox' id='u1' "+(f.docs[0]?"checked":"")+" onchange='updateDocCnt()'> Entlassbrief</label>"
    +"<label><input type='checkbox' id='u2' "+(f.docs[1]?"checked":"")+" onchange='updateDocCnt()'> Befunde</label>"
    +"<label><input type='checkbox' id='u3' "+(f.docs[2]?"checked":"")+" onchange='updateDocCnt()'> Versicherungsdaten</label>"
    +"<label><input type='checkbox' id='u4' "+(f.docs[3]?"checked":"")+" onchange='updateDocCnt()'> Kostenzusage</label>"
    +"</div></div><button class='btn-ghost btn-sm' type='button' onclick='dArbeitUnterlagenAnfordern()'>Fehlende anfordern</button>";
 if(typ==="angebot")
   return "<div class='komm-block'><label>Antwort senden</label>"
    +"<div class='komm-row'><select id='dReplyKanal'><option>E-Mail</option><option>Telefon (Notiz)</option><option>SMS</option><option>WhatsApp</option></select>"
    +"<button class='btn-brass btn-sm' type='button' onclick='sendReply()'><svg viewBox='0 0 24 24' width='14' height='14' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='5' width='18' height='14' rx='2'/><path d='m3 7 9 6 9-6'/></svg>Antwort senden</button></div>"
    +"<textarea id='dReply' rows='2' placeholder='Antwort an die anfragende Person verfassen … (Demo)'></textarea></div>";
 if(typ==="anreise")
   return "<div class='kicker'>Anreise-Checkliste</div>"
    +"<label><input type='checkbox'> Zimmer reserviert</label>"
    +"<label><input type='checkbox'> Transport geklärt</label>"
    +"<label><input type='checkbox'> Aufnahmetag bestätigt</label>";
 return "<div class='full'><label for='dNotizSofort'>"+escapeHtml(MT_NOTIZ_LABEL[typ]||MT_NOTIZ_LABEL.allgemein)+"</label>"
   +"<div class='kz-notiz-row'><input id='dNotizSofort' placeholder='z. B. Rückruf erledigt'>"
   +"<button class='btn-ghost btn-sm' type='button' onclick='kzNotizAdd()'>Ins Protokoll</button></div></div>";
}
function dArbeitKostenUpload(){
 const f=aktuellerFall;if(!f)return;
 f.docs[3]=true;
 inbToast("done","<b>Kostenzusage-Dokument hochgeladen</b> (Demo)","",null);
}
function dArbeitUnterlagenAnfordern(){
 inbToast("done","<b>Fehlende Unterlagen angefordert</b> (Demo)","",null);
}
```
  Hinweis Anreise-Checkliste: bewusst **ohne** `id`/`onchange` — rein session-lokale, nicht persistierte Checkboxen laut Auftrag, kein neues Datenfeld. Hinweis `dArbeitKostenUpload()`: ruft **bewusst nicht** `updateDocCnt()` — `docCnt`/`u1`-`u4` existieren in diesem Zweig (`kosten`) gar nicht, ein Aufruf würde ohne den Guard aus Schritt 4 einen TypeError werfen.

- [ ] **`updateDocCnt()` robust machen** (Guard ergänzen, matcht Plan-Auflage a):
```js
// Ist:
function updateDocCnt(){const n=["u1","u2","u3","u4"].filter(u=>document.getElementById(u).checked).length;
  document.getElementById("docCnt").textContent="("+n+" / 4)";}
["u1","u2","u3","u4"].forEach(u=>document.getElementById(u).addEventListener("change",updateDocCnt));
// Soll:
function updateDocCnt(){
  if(!document.getElementById("u1"))return;
  const n=["u1","u2","u3","u4"].filter(u=>document.getElementById(u).checked).length;
  document.getElementById("docCnt").textContent="("+n+" / 4)";
}
```
  (Die `forEach(...addEventListener...)`-Zeile darunter ersatzlos streichen — genau Plan-Auflage (a).)

- [ ] **`openDetail()` anpassen** (drei Änderungen, Zeilen wie oben unter „Ist" nummeriert, per grep neu lokalisieren):
```js
// Zeile 6015 (Doc-Checkboxen setzen) — entfernen, überflüssig (Checked kommt jetzt aus f.docs[i] direkt beim Rendern).
// Zeile 6016 (updateDocCnt();) — von hier entfernen.
// Zeile 6020, Ist: document.getElementById("dNotizSofort").value="";
// Zeile 6020, Soll:
var _dns=document.getElementById("dNotizSofort");if(_dns)_dns.value="";
// Zeile 6024, Ist: document.getElementById("dKZ").innerHTML="<div class='kicker'>Kostenzusage</div>"+kzChain(f)+kzActions(f);
// Zeile 6024, Soll:
document.getElementById("dArbeit").innerHTML=dArbeitHtml(f);
updateDocCnt();
```
  (Der `updateDocCnt()`-Aufruf direkt nach dem neuen `#dArbeit`-Render ersetzt den entfernten Aufruf aus Zeile 6016 — jetzt korrekt positioniert **nach** dem Render, wirkt bei Typ `unterlagen` und ist dank Guard bei jedem anderen Typ ein sicherer No-op.)

- [ ] **`dSpeichern`-Handler anpassen** (Plan-Auflage a, wörtlich gefordert):
```js
// Ist:
f.docs=["u1","u2","u3","u4"].map(u=>document.getElementById(u).checked);
// Soll:
if(document.getElementById("u1"))f.docs=["u1","u2","u3","u4"].map(u=>document.getElementById(u).checked);
```
  (Ohne Guard: `f.docs` bleibt unverändert, wenn beim Speichern ein anderer Aufgabentyp aktiv ist als `unterlagen` — korrektes Verhalten, kein Datenverlust.)

- [ ] **CSS — Plan-Auflage (b):**
```css
/* Ist: */
@media(min-width:900px){.mbody.two-track .fh-hero{grid-column:1/-1}}
/* Soll: */
@media(min-width:900px){.mbody.two-track .fh-hero,.mbody.two-track #dArbeit{grid-column:1/-1}}
```

- [ ] Standard-Verifikation bei 390px (Werkzeuge in `#dArbeit` dürfen nicht überlaufen) UND 1440px (Zwei-Spalten-Layout bleibt erhalten, `#dArbeit` läuft über beide Spalten).

- [ ] Manuell alle 5 Typen durchklicken (Fälle mit Status Neu/Kontaktiert/Qualifizierung/Unterlagen/Aufnahme geplant sowie einen mit `aufgabe:""`, z. B. id 12/10/11 „Aufgenommen"/„Verloren") und bestätigen: passendes Werkzeug erscheint, kein Console-Error, `#dWerdegang`/`#dAkte`/Verlauf/„Neue Notiz" bleiben in jedem Fall sichtbar.

**Sichtprüfung:** Der Arbeitsbereich unter dem Hero zeigt genau die Werkzeuge, die zur aktuellen Aufgabe passen (Notiz bei Rückruf, Kostenkette+Upload bei Kostenklärung, Dokumente-Checkliste bei Unterlagen, Antwort-Editor bei Angebot, Ankunfts-Checkliste bei Anreise, generische Notiz sonst); Werdegang, Stammdaten/Akte und Verlauf bleiben immer sichtbar; da `advanceFall()` am Ende bereits `openDetail(f.id)` erneut aufruft, folgt `#dArbeit` der neuen Aufgabe nach „Erledigt" automatisch, ohne eigenen Hook.

**Commit:** `feat: dynamische Fall-Akte — #dArbeit zeigt aufgabentyp-abhängiges Werkzeug statt fixer Blöcke (Punkt 2)`

---

## Phase 2 — Spec-Punkt 1: Eingang → Anfrage-Detail-Fenster

### Task 2.1 — Neues Overlay `#egDetail` + Registrierung + Zusammenfassungs-Helper

**Lane:** `claude-implementer-pro`

**Referenz-Komponenten (erst Vorbilder lesen):** `#ovDetail` ([index.html:4071-4132](../../../index.html#L4071)) als strukturelle Vorlage (funktioniert Mobile **und** Desktop, im Gegensatz zu `#dbDetail`); `.eg-triage`/`.eg-row`/`.eg-v`/`.eg-grund` ([index.html:3037-3046](../../../index.html#L3037)) — wird **unverändert übernommen**, nicht neu gebaut; `.zcat.active`/`.tchip.on` ([index.html:369](../../../index.html#L369)/[675-676](../../../index.html#L675)) als Muster für die neue Owner-Auswahl.

**Dateien/Anker:** `grep -n "id=\"ovDetail\"\|function renderEingang\|function ownerVorschlag\|const TEAM=\|function mtCloseOverlays\|const _DETAIL_IDS\|function openDetail\|function openDbDetail" index.html` vor Bearbeitung ausführen und alle Zeilenangaben neu bestätigen.

**Ist (verifiziert, Stand Planerstellung):**
- `mtCloseOverlays()` ([index.html:6474-6479](../../../index.html#L6474)) schließt eine feste Liste: `["refOverlay","ovDetail","dbDetail","rsDetail","sheetNeu","kpSheet","rpDocView"]`.
- `_DETAIL_IDS=["ovDetail","dbDetail","rsDetail"]` ([index.html:6606](../../../index.html#L6606)) steuert `_detailOpen()`/`_rawCloseDetails()` (Escape-Taste, Backdrop, Browser-Zurück).
- `openDetail()` schließt beim Öffnen `#dbDetail` ([index.html:6028](../../../index.html#L6028)); `openDbDetail()` schließt `#ovDetail` ([index.html:5195](../../../index.html#L5195)). Keine der beiden Stellen kennt `#egDetail`.
- **Selbst gefunden, über die Spec hinaus — Desktop-Docking-Kollision:** `#ovDetail` und `#dbDetail` sind ab 1024px eigenständig auf eine **rechts angedockte 460px-Schiene** gestylt (`@media(min-width:1024px){#ovDetail{...pointer-events:none}#ovDetail .modal{width:460px;...}}`, [index.html:786-791](../../../index.html#L786) bzw. [index.html:801-804](../../../index.html#L801)) — die Regel hängt am **Element-Selektor**, nicht an einer gemeinsamen Klasse. `body.detail-open .app{margin-right:460px}` ([index.html:795](../../../index.html#L795)) verschiebt den Hauptinhalt **generisch über die Body-Klasse**, unabhängig davon, welches der drei Overlays gerade offen ist. Auf Desktop ist die Backdrop von `#ovDetail`/`#dbDetail` `pointer-events:none` — der Rest der Seite bleibt bedienbar, während die Schiene offen ist (z. B. Fall-Drawer offen + Segment-Tab wechseln zu „Anfragen" + eine Eingangs-Zeile klicken ist ein real erreichbarer Pfad). Ohne eigene Schließ-Logik könnten `#egDetail` und `#ovDetail`/`#dbDetail` gleichzeitig offen sein und sich als zwei überlappende 460px-Schienen visuell überlagern. **Lösung:** ein gemeinsamer Helper statt drei verstreuter Einzeiler.

**Schritte:**

- [ ] `grep`-Befehl oben ausführen, Zeilen neu bestätigen.

- [ ] **Markup** — neues Overlay direkt nach `#ovDetail`s schließendem `</div>` einfügen (heute zwischen Zeile 4132 und dem `<!-- DATENBANK-INSPECTOR -->`-Kommentar):
```html
<div class="overlay" id="egDetail" role="dialog" aria-modal="true" aria-label="Anfrage-Detail">
  <div class="modal">
    <div id="egdBody"></div>
  </div>
</div>
```
  (`egdBody` wird komplett per JS befüllt — Kopf, Zusammenfassung, Zuordnung und Aktionen ändern sich zu stark zwischen den drei Fällen `qualifiziert`/`passiv`/`m.done`, um sie als festes Markup vorzuformulieren.)

- [ ] **CSS — Desktop-Docking mirrort `#ovDetail`s Regel**, neuer Block vor `</style>`:
```css
/* Task 2.1 (Punkt 1): #egDetail — Anfrage-Detail-Fenster, Struktur/Docking wie #ovDetail */
@media(min-width:1024px){
  #egDetail{align-items:stretch;justify-content:flex-end;background:transparent;pointer-events:none}
  #egDetail .modal{width:460px;max-width:460px;height:100dvh;max-height:100dvh;border-radius:0;
    border-left:1px solid var(--hair);box-shadow:-12px 0 44px rgba(31,28,28,.16);transform:translateX(28px)}
  #egDetail.open .modal{transform:none;pointer-events:auto}
}
.egd-owners{display:flex;flex-direction:column;gap:8px;margin:10px 0}
.egd-owner{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:var(--paper);
  border:1px solid var(--hair);border-radius:12px;padding:10px 12px;font:inherit;color:inherit;cursor:pointer;min-height:44px}
.egd-owner.sel{border-color:var(--brass);background:var(--brass-soft)}
.egd-ownername{display:flex;flex-direction:column;gap:2px}
.egd-vorschlag{font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--brass-deep);font-weight:700}
.egd-load{margin-left:auto;font-size:12.5px;color:var(--muted);flex-shrink:0}
```
  (Kopf/Zusammenfassung/Aktionen brauchen **kein** neues CSS — sie bestehen ausschließlich aus bereits existierenden Klassen: `.mhead`/`.ava`/`.msub2`/`.chtag`/`.mtime`/`.typ-chip`/`.eg-triage`/`.pills`/`.mtxt`/`.mfoot`/`.btn-brass`/`.btn-ghost`/`.ok-chip`.)

- [ ] **Gemeinsamer Schließ-Helper** (löst die Desktop-Docking-Kollision aus dem „Ist"-Abschnitt), z. B. direkt vor `function ownerVorschlag`:
```js
function _closeSiblingDetailRails(exceptId){
  ["ovDetail","dbDetail","egDetail"].forEach(function(id){
    if(id===exceptId)return;
    const e=document.getElementById(id);if(e)e.classList.remove("open");
  });
}
```

- [ ] **`openDetail()` anpassen** — bestehende Einzeiler-Zeile ersetzen:
```js
// Ist (Zeile ~6028):
const _db=document.getElementById("dbDetail");if(_db)_db.classList.remove("open");
document.getElementById("ovDetail").classList.add("open");
// Soll:
_closeSiblingDetailRails("ovDetail");
document.getElementById("ovDetail").classList.add("open");
```

- [ ] **`openDbDetail()` anpassen** — bestehende Einzeiler-Zeile ersetzen:
```js
// Ist (Zeile ~5195):
const ov=document.getElementById("ovDetail");if(ov)ov.classList.remove("open");
// Soll:
_closeSiblingDetailRails("dbDetail");
```

- [ ] **`mtCloseOverlays()`** — `"egDetail"` in die Liste aufnehmen: `["refOverlay","ovDetail","dbDetail","rsDetail","sheetNeu","kpSheet","rpDocView","egDetail"]`.

- [ ] **`_DETAIL_IDS`** — `"egDetail"` ergänzen: `const _DETAIL_IDS=["ovDetail","dbDetail","rsDetail","egDetail"];` (aktiviert Escape/Backdrop/Browser-Zurück automatisch über `_rawCloseDetails()`/`_detailOpen()`, keine weitere Änderung an diesen beiden Funktionen nötig).

- [ ] **Modul-State** — neben `let aktuellerFall=null;let zFilter="krankenhaus";let boardStageFilter=null;let horizont=9;` ([index.html:4546](../../../index.html#L4546)) ergänzen: `let egOwner=null,_egId=null;`

- [ ] **Zusammenfassungs-Helper** (Kopf + Zuordnungsblock (a)+(b) aus der Spec, **eine** Funktion für qualifiziert/passiv, für aktiv **und** `m.done` wiederverwendet — löst „gemeinsame Helper-Funktion, nicht duplizieren"):
```js
function egSummaryHtml(m){
 const sig=erkenneSignale(m.txt);
 const sterneBlock=sterneHtml(sterneAusSignal(sig));
 const achsePill=m.achse?"<span class='pill-a' style='background:"+(ACHSE_COL[m.achse]||"var(--unklar)")+"'>"+escapeHtml(m.achse)+"</span>":"";
 let mid;
 if(m.typ!=="passiv"){
   const inst=zuweiser.find(z=>m.txt.includes(z.name));
   const grund=[sig.kostentraeger?sig.kostentraeger+" erkannt":null,sig.dringlichkeit?"Frist "+sig.dringlichkeit:null,sig.konkret?"konkrete Anfrage":null].filter(Boolean).join(" · ");
   mid="<div class='eg-triage'>"
     +"<div class='eg-row'><div class='kicker'>Wer</div><div class='eg-v'><span class='ava'>"+initialen(m.wer||"")+"</span>"+escapeHtml(m.wer||"")+"</div></div>"
     +"<div class='eg-row'><div class='kicker'>Woher</div><div class='eg-v'>"+escapeHtml(m.kanal)+(inst?" · "+escapeHtml(inst.name):"")+"</div></div>"
     +"<div class='eg-row'><div class='kicker'>Was</div><div class='eg-v'>"+(achsePill||"—")+"</div></div>"
     +"<div class='eg-row'><div class='kicker'>Wie konkret</div><div class='eg-v'>"+sterneBlock+(grund?"<span class='eg-grund'>"+escapeHtml(grund)+"</span>":"")+"</div></div>"
     +"</div>";
 }else{
   mid="<div class='pills'>"+achsePill
     +(sig.kostentraeger?"<span class='pill-kt'>"+escapeHtml(sig.kostentraeger)+"</span>":"")
     +(sig.dringlichkeit?"<span class='due'>"+escapeHtml(sig.dringlichkeit)+"</span>":"")
     +"</div>"+sterneBlock;
 }
 return "<div class='mhead'><div class='ava'>"+initialen(m.wer||"")+"</div><div><h2>"+escapeHtml(m.wer||m.tit)+"</h2>"
   +"<div class='msub2'><span class='chtag'>"+escapeHtml(m.kanal)+"</span> · <span class='mtime'>"+escapeHtml(m.zeit)+"</span> · "
   +"<span class='typ-chip "+(m.typ==="passiv"?"passiv":"qual")+"'>"+(m.typ==="passiv"?"passiv":"qualifiziert")+"</span></div></div></div>"
   +"<div style='padding:16px 20px'>"+mid+"<div class='mtxt'>"+escapeHtml(m.txt)+"</div>"
   +(m.notiz?"<div class='mt-eingang-notiz'>Notiz: "+escapeHtml(m.notiz)+"</div>":"")+"</div>";
}
```
  (Kopf zeigt `m.wer` als Haupttext, mit Fallback auf `m.tit` für die beiden passiven Einträge ohne `wer`-Feld — eigene, bewusste Ergänzung, exakt nach Spec-Wortlaut „Avatar…, m.wer, Kanal…" für die übrigen Fälle.)

- [ ] Standard-Verifikation: `openEgDetail` existiert zu diesem Zeitpunkt noch nicht (folgt in Task 2.2) — `egSummaryHtml(eingang[0])` testweise über die Browser-Konsole aufrufen und auf Fehlerfreiheit prüfen, dann Task committen.

**Sichtprüfung:** Kein sichtbarer UI-Unterschied nach diesem Task (Overlay existiert, ist aber noch an nichts angeschlossen) — Konsolentest `egSummaryHtml(eingang[0])` liefert einen HTML-String ohne Fehler; 0 Console-Errors beim normalen Durchklicken der App.

**Commit:** `feat: #egDetail-Overlay angelegt — Struktur, Docking, Registrierung, Zusammenfassungs-Helper (Punkt 1, Teil 1)`

---

### Task 2.2 — `openEgDetail()`, Owner-Zuordnung, `uebernehmen()`-Umbau, `renderEingang()`-Vereinfachung

**Lane:** `claude-implementer-pro`

**Abhängigkeit:** braucht `egSummaryHtml()`/`_closeSiblingDetailRails()`/`egOwner`/`_egId` aus Task 2.1.

**Dateien/Anker:** `grep -n "function renderEingang\|function uebernehmen\|function antwortenEingang\|function inDatenbank\|function ownerVorschlag\|const TEAM=" index.html` vor Bearbeitung ausführen und alle Zeilenangaben neu bestätigen.

**Ist (verifiziert, Stand Planerstellung):** `renderEingang()` ([index.html:4670-4713](../../../index.html#L4670)) baut pro Zeile Kopf-Button + `.mmore` (Triage/Pills + Original-Nachricht + Aktionen). `uebernehmen(id)` ([index.html:4715-4726](../../../index.html#L4715)) liest den Owner aus `#eo-{id}`, endet mit `renderAll();go("faelle","board");`. `antwortenEingang(id)` ([index.html:4727-4731](../../../index.html#L4727)) ruft `uebernehmen(id)` ohne Owner-Parameter. `inDatenbank(id)` ([index.html:4742-4752](../../../index.html#L4742)) endet mit `renderAll();go("netzwerk","kontakte");` — **wird künftig ausschließlich aus `#egDetail` heraus aufgerufen** (einziger verbleibender Aufrufpfad), `go()` schließt aber keine Overlays ([index.html:6494ff](../../../index.html#L6494) geprüft — togglet nur `.view.active`) → **selbst gefunden, nicht in Spec genannt:** ohne eigene Schließzeile bliebe `#egDetail` sichtbar offen, während im Hintergrund bereits zur Netzwerk-Ansicht gewechselt wurde.

**Schritte:**

- [ ] `grep`-Befehl oben ausführen, Zeilen neu bestätigen.

- [ ] **`openEgDetail(id)`** neu einfügen (z. B. direkt nach `egSummaryHtml`):
```js
function openEgDetail(id){
 const m=eingang.find(x=>x.id===id);if(!m)return;
 if(_egId!==id){_egId=id;egOwner=(m.typ!=="passiv"&&!m.done)?ownerVorschlag(m.achse):null;}
 _closeSiblingDetailRails("egDetail");
 let actions;
 if(m.done){
   actions=m.fallId
     ?"<button class='btn-brass' onclick='openDetail("+m.fallId+")'>Fall öffnen ›</button>"
     :"<span class='ok-chip'>✓ in Datenbank</span>";
 }else if(m.typ==="passiv"){
   actions="<button class='btn-brass' onclick='inDatenbank("+m.id+")'>In Datenbank aufnehmen</button>";
 }else{
   actions="<div class='egd-owners'>"+TEAM.map(function(t,i){
     const n=faelle.filter(f=>f.owner===t&&f.status!=="Aufgenommen"&&f.status!=="Verloren").length;
     const sel=egOwner===t,vor=t===ownerVorschlag(m.achse);
     return "<button type='button' class='egd-owner"+(sel?" sel":"")+"' onclick='egSetOwner("+m.id+","+i+")'>"
       +"<span class='ava'>"+initialen(t)+"</span><span class='egd-ownername'>"+escapeHtml(t)
       +(vor?"<span class='egd-vorschlag'>Vorschlag — Achse "+escapeHtml(m.achse)+", geringste Auslastung</span>":"")
       +"</span><span class='egd-load'>"+n+" offene "+(n===1?"Fall":"Fälle")+"</span></button>";
   }).join("")+"</div>"
   +"<button class='btn-brass' style='width:100%;margin-top:4px' onclick='uebernehmen("+m.id+",egOwner)'>Als Fall anlegen &amp; zuordnen</button>"
   +"<button class='btn-ghost' style='width:100%' onclick='antwortenEingang("+m.id+",egOwner)'>✉ Antworten</button>";
 }
 document.getElementById("egdBody").innerHTML=egSummaryHtml(m)
   +"<div class='mfoot' style='flex-direction:column;align-items:stretch;gap:8px'>"+actions
   +"<button class='btn-ghost' onclick='dismissDetail()'>‹ Zurück</button></div>";
 document.getElementById("egDetail").classList.add("open");
 document.body.classList.add("detail-open");
 if(!matchMedia("(min-width:1024px)").matches)document.body.classList.add("locked");
 pushDetailState();
}
function egSetOwner(id,idx){ egOwner=TEAM[idx]; openEgDetail(id); }
```

- [ ] **`renderEingang()` vereinfachen** — Kopf-Button bleibt, `.mmore`/Triage/Pills/Aktionen entfallen aus dem Row-Markup vollständig (wandern in `openEgDetail()`/`egSummaryHtml()`):
```js
// Ist (Auszug):
const head="<button class='mrow' onclick='toggleMail(this)'>"+…+"</button>";
… (triage, pills, act werden berechnet und in .mmore gerendert) …
return "<article class='mail"+(m.done?" done":"")+(m._neu?" neu":"")+"'>"+head
  +"<div class='mmore'>"+triage+…+"</div></article>";
// Soll:
function renderEingang(){
  document.getElementById("inbox").innerHTML=eingang.map(m=>{
    const head="<button class='mrow' onclick='openEgDetail("+m.id+")'>"
      +"<span class='chico'>"+(CHAN_ICON[m.kanal]||CHAN_ICON["E-Mail"])+"</span>"
      +"<span class='mhtxt'><span class='mtit'>"+escapeHtml(m.tit)+"</span>"
      +"<span class='mmeta'><span class='chtag'>"+escapeHtml(m.kanal)+"</span><span class='mtime'>"+escapeHtml(m.zeit)+"</span>"
      +"<span class='typ-chip "+(m.typ==="passiv"?"passiv":"qual")+"'>"+(m.typ==="passiv"?"passiv":"qualifiziert")+"</span>"
      +(m.done?"<span class='ok-chip mini'>✓ "+(m.typ==="passiv"?"in Datenbank":"als Fall")+"</span>":"")+"</span></span>"
      +"<span class='mail-chev'>›</span></button>";
    return "<article class='mail"+(m.done?" done":"")+(m._neu?" neu":"")+"'>"+head+"</article>";
  }).join("");
}
```
  (`erkenneSignale`/`sterneAusSignal`/`sterneHtml`/`ownerVorschlag`-Aufrufe verschwinden hier komplett — sie leben jetzt ausschließlich in `egSummaryHtml()`/`openEgDetail()`, per Design auf Abruf neu berechnet statt vorab für jede Zeile.)

- [ ] **`uebernehmen(id, owner)` — neuer Parameter, Sprung ins Detail statt aufs Board:**
```js
// Ist:
function uebernehmen(id){
  const m=eingang.find(x=>x.id===id);if(!m||m.done)return;
  const sel=document.getElementById("eo-"+id); const owner=sel?sel.value:TEAM[0];
  m.done=true;
  …
  renderAll();go("faelle","board");
}
// Soll:
function uebernehmen(id,owner){
  const m=eingang.find(x=>x.id===id);if(!m||m.done)return;
  owner=owner||TEAM[0];
  m.done=true;
  const fid=Math.max(...faelle.map(x=>x.id))+1;
  faelle.push({id:fid,name:"Neuer Fall (aus Eingang)",alter:null,rolle:"offen",kanal:m.kanal,quelle:m.tit.split(":")[1]?m.tit.split(":")[1].trim():m.kanal,
    achse:m.achse,kt:"Unklar",status:"Neu",owner:owner,aufgabe:STATUS_AUFGABE["Neu"],frist:dstr(0),
    saluto:m.achse==="SalutoCare",docs:[false,false,false,false],kosten:"offen",consent:"offen",verlust:"",reaktion:null,
    log:[[dstr(0),"Aus Eingang übernommen ("+m.kanal+"): "+m.tit+" — zugewiesen an "+owner]]});
  m.fallId=fid;
  renderAll();openDetail(fid);
}
```
  (`openDetail(fid)` schließt `#egDetail` bereits selbst über `_closeSiblingDetailRails("ovDetail")` aus Task 2.1 — kein zusätzlicher Schließ-Aufruf hier nötig. Neuer Fall landet bei Status „Neu" + `STATUS_AUFGABE["Neu"]` — der Hero zeigt die Rückruf-Aufgabe, das ist der gewollte Landepunkt.)

- [ ] **`antwortenEingang(id, owner)` — Owner durchreichen:**
```js
// Ist:
function antwortenEingang(id){
  const m=eingang.find(x=>x.id===id); if(!m)return;
  if(!m.done) uebernehmen(id);
  if(m.fallId){ openDetail(m.fallId); setTimeout(function(){const r=document.getElementById("dReply");if(r)r.focus();},80); }
}
// Soll:
function antwortenEingang(id,owner){
  const m=eingang.find(x=>x.id===id); if(!m)return;
  if(!m.done) uebernehmen(id,owner);
  if(m.fallId){ openDetail(m.fallId); setTimeout(function(){const r=document.getElementById("dReply");if(r)r.focus();},80); }
}
```
  **Bewusste Beobachtung (Cross-Feature-Interaktion mit Phase 1, kein Fix nötig):** Nach Phase 1 zeigt ein frisch aus dem Eingang übernommener Fall (Status „Neu") den `rueckruf`-Arbeitsbereich, nicht den Antwort-Editor (der erscheint erst bei Aufgabentyp `angebot`). Der bestehende `if(r)`-Guard in obigem `setTimeout` fängt das bereits ab (kein Fehler, der Fokus-Versuch no-opt einfach) — der Nutzer landet trotzdem korrekt im neuen Fall. Dort weiter nichts ändern, das wäre Scope-Creep über die Spec hinaus.

- [ ] **`inDatenbank(id)` — Overlay explizit schließen** (selbst gefundene Notwendigkeit, s. „Ist"):
```js
// Ist, letzte Zeile:
 renderAll();go("netzwerk","kontakte");
// Soll:
 const _eg=document.getElementById("egDetail");if(_eg)_eg.classList.remove("open");
 renderAll();go("netzwerk","kontakte");
```
  (Hinweis: Ziel-Segment `"kontakte"` wird in Task 3.1 auf `"patienten"` umbenannt — dieser Task hier läuft laut Reihenfolge **vor** Phase 3, also mit dem heute noch gültigen Namen `"kontakte"` implementieren; Task 3.1 erfasst diese Stelle per `grep` auf `"kontakte"` mit und benennt sie um.)

- [ ] Standard-Verifikation bei 390px UND 1440px, inkl. dem Desktop-Docking-Fall aus Task 2.1s „Ist": Fall-Drawer offen lassen, zu „Anfragen" wechseln, eine Eingangszeile anklicken — nur `#egDetail` ist sichtbar offen, `#ovDetail` hat sich geschlossen.

**Sichtprüfung:** Klick auf eine Eingangs-Zeile öffnet `#egDetail` mit vollständigem Kontext (Wer/Woher/Was/Wie konkret) und einer echten, vorausgewählten Team-Auswahl mit sichtbarer Auslastung je Person; „Als Fall anlegen" legt den Fall mit dem gewählten Owner an und springt direkt in dessen Drawer, nicht aufs Board; eine bereits erledigte Zeile öffnet schreibgeschützt mit nur „Fall öffnen ›" bzw. „✓ in Datenbank".

**Commit:** `feat: Eingang öffnet Anfrage-Detail-Fenster mit echter Team-Zuordnung, uebernehmen() springt in den Fall statt aufs Board (Punkt 1, Teil 2)`

---

### Task 2.3 — Toten Code entfernen: `toggleMail()`, verwaistes `.mail`/`.mmore`-CSS

**Lane:** `claude-implementer`

**Dateien/Anker:** `grep -n "function toggleMail\|\.mail\.open\|\.mmore\|\.mail\.done\.open\|\.eingang-act\|\.eingang-owner\|\.eingang-vorschlag" index.html` vor Bearbeitung ausführen und alle Zeilenangaben neu bestätigen (Zeilen verschieben sich durch Task 2.1/2.2).

**Ist (verifiziert, Stand Planerstellung — vollständige Liste, per grep selbst nachgezählt und im Plan-Review um drei weitere Fundstellen ergänzt, geht über die im Spec explizit genannten drei Zeilen hinaus):** Nach Task 2.2 ruft keine Zeile mehr `toggleMail()` auf, keine Zeile erzeugt mehr ein `<div class="mmore">`-Element, und keine Zeile emittiert mehr `<select class='eingang-owner'>`/`.eingang-act`/`.eingang-vorschlag` (das gesamte alte Owner-Zuordnungs-Markup aus `renderEingang()` ist durch die `.egd-owner`-Chips in `#egDetail` ersetzt) — jede CSS-Regel, die eine dieser drei Klassen-Familien referenziert, ist damit vollständig unerreichbar (nicht nur „selten benutzt", sondern zu 0% erreichbar):
- `.mail.open .mail-chev{transform:rotate(90deg)}` ([index.html:1426](../../../index.html#L1426))
- `.mmore{display:none;padding:0 16px 14px 71px}` ([index.html:1427](../../../index.html#L1427)) — **selbst gefunden, nicht im Spec-Text**: Basisregel wird verwaist, weil kein `.mmore`-Element mehr existiert.
- `.mail.open .mmore{display:block}` ([index.html:1428](../../../index.html#L1428))
- `.mmore .mtxt{margin-top:0;margin-bottom:12px}` ([index.html:1429](../../../index.html#L1429)) — **selbst gefunden**.
- `#inbox .mail.done.open{opacity:1}` ([index.html:1431](../../../index.html#L1431)) — **selbst gefunden**: `.open` wird nach dieser Änderung nie mehr auf `.mail` gesetzt, diese Kombination ist damit unerreichbar.
- `#inbox .mail.open .mmore{background:var(--cream2)}` ([index.html:1871](../../../index.html#L1871))
- Kommentar + Regel `/* Aufgeklappte Vorschau: Papier-Einzug mit Jade-Haarlinie links */ #inbox .mmore .mtxt{background:var(--cream2);border-left:2px solid var(--jade-hair);padding:10px 12px;border-radius:0 3px 3px 0}` ([index.html:2469-2471](../../../index.html#L2469)) — **selbst gefunden**.
- `.eingang-act{display:flex;gap:8px;align-items:center;flex-wrap:wrap}` ([index.html:302](../../../index.html#L302)) — **Plan-Review-Fund:** verwaist, weil Task 2.2 die komplette Owner-Zuordnungs-Zeile (Select + Vorschlag + Buttons) aus `renderEingang()` entfernt.
- `.eingang-owner{font-size:13px;padding:8px 10px;border:1px solid var(--hair);border-radius:9px;min-height:38px;background:var(--paper2);color:var(--ink)}` ([index.html:303](../../../index.html#L303)) — **Plan-Review-Fund**, dieselbe Ursache: das `<select class='eingang-owner'>` existiert nach Task 2.2 nirgends mehr.
- `.eingang-vorschlag{flex-basis:100%;font-size:12px;color:var(--muted)}` und `.eingang-vorschlag b{color:var(--brass-deep);font-weight:600}` ([index.html:3047-3048](../../../index.html#L3047)) — **Plan-Review-Fund**, dieselbe Ursache.
- `function toggleMail(btn){const a=btn.closest(".mail");if(a)a.classList.toggle("open");}` — keine Aufrufstelle mehr im Code (`renderEingang()` ruft seit Task 2.2 `openEgDetail(m.id)` statt `toggleMail(this)`).

**NICHT entfernen (bewusst geprüft, bleibt funktional):**
- `.mail:not(.open) .mtit{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}` ([index.html:1422](../../../index.html#L1422)) — feuert nach dieser Änderung **immer** (da `.open` nie mehr vorkommt), aber das ist exakt das gewollte Verhalten für die jetzt permanent kompakte Zeile (Titel immer als Ellipsis). Kein Bug, keine Änderung nötig — nur die `:not(.open)`-Bedingung ist überflüssig geworden, das rechtfertigt für sich allein keine Anfassung eines unabhängig funktionierenden Selektors.
- `.mail-chev{flex-shrink:0;color:var(--faint);font-size:19px;line-height:1;transition:transform .2s}` ([index.html:1425](../../../index.html#L1425)) — das `›`-Zeichen selbst bleibt (zeigt weiterhin „hier klicken öffnet etwas" an), nur seine Rotation beim Öffnen entfällt.

**Schritte:**

- [ ] `grep -n "function toggleMail\|\.mail\.open\|\.mmore\|\.mail\.done\.open\|\.eingang-act\|\.eingang-owner\|\.eingang-vorschlag" index.html` — alle Fundstellen neu bestätigen, insbesondere dass wirklich **keine** verbleibende Aufrufstelle von `toggleMail(` und keine verbleibende Emission von `.eingang-act`/`.eingang-owner`/`.eingang-vorschlag` mehr existiert (`grep -n "toggleMail(" index.html` sollte nur noch die Funktionsdefinition selbst zeigen).
- [ ] `function toggleMail(btn){...}` komplett entfernen.
- [ ] Die 10 oben gelisteten CSS-Regeln (1426, 1427, 1428, 1429, 1431, 1871, 2469-2471 inkl. Kommentarzeile, 302, 303, 3047-3048) entfernen — Zeilen zuvor per grep neu lokalisieren, nicht blind nach den hier notierten Nummern löschen.
- [ ] **Stalen Kommentar korrigieren** ([index.html:3034-3036](../../../index.html#L3034), per `grep -n "der bestehende .mail/.mmore-Wrapper"` lokalisieren): Der Satz „der bestehende `.mail`/`.mmore`-Wrapper der Eingangs-Karte selbst bleibt unverändert." ist seit Task 2.2 falsch (der Wrapper wurde grundlegend vereinfacht) — Satz entfernen oder auf „der `.mail`-Wrapper besteht als kompakte, nicht mehr aufklappbare Zeile fort (Punkt 1, Runde 4)" korrigieren.
- [ ] `grep -c "function "  index.html` vor/nach vergleichen — genau eine Funktion (`toggleMail`) weniger, sonst nichts.
- [ ] Standard-Verifikation bei 390px UND 1440px.

**Sichtprüfung:** Eingangs-Zeilen zeigen keinen rotierenden Chevron mehr und keinen Akkordeon-Effekt beim Klick (öffnen stattdessen `#egDetail`, aus Task 2.2); 0 Console-Errors; `grep -n "\.mmore\|toggleMail\|\.eingang-act\|\.eingang-owner\|\.eingang-vorschlag" index.html` liefert keine Treffer mehr außer ggf. im korrigierten Kommentar.

**Commit:** `chore: toggleMail() und verwaistes .mail/.mmore/.eingang-*-CSS entfernt (Punkt 1, Teil 3)`

---

## Phase 3 — Spec-Punkt 3: Netzwerk → „Patienten" statt „Kontakte", Radar/Stammdaten getrennt

### Task 3.1 — Umbenennungs-Sweep „Kontakte" → „Patienten"

**Lane:** `claude-implementer` (rein mechanisch — Textersetzung + Routen-Alias, keine Verzweigungslogik)

**Dateien/Anker:** `grep -n "kontakte" index.html` vor Bearbeitung ausführen — **vollständige Trefferliste selbst gegen die untenstehende Aufstellung abgleichen**, da Task 2.2 (`inDatenbank()`) und Task 2.3 zuvor bereits Zeilen verschoben haben können.

**Ist (verifiziert, Stand Planerstellung) — jede Fundstelle einzeln geprüft, ob sie die Patienten-Datenbank (→ umbenennen) oder etwas anderes meint (→ unverändert):**

**Umzubenennen (Entität „Patienten-Datenbank"):**
- `SEGS.netzwerk=["zuweiser","kontakte"]` ([index.html:6492](../../../index.html#L6492)) → `["zuweiser","patienten"]`.
- Segment-Button `data-seg="kontakte"` ([index.html:3720](../../../index.html#L3720), Label-Text „Kontakte") → `data-seg="patienten"`, Text „Patienten" (Zähler-ID `segCntBestand` **bleibt unverändert** — rein interner, nicht sichtbarer Name, zählt bereits korrekt `bestand.length`).
- Sub-View-ID `sub-netzwerk-kontakte` ([index.html:3743](../../../index.html#L3743)) + alle 7 CSS-Selektor-Vorkommen (`grep -n "sub-netzwerk-kontakte" index.html` → [1739](../../../index.html#L1739), [1769](../../../index.html#L1769), [2602](../../../index.html#L2602), [2607](../../../index.html#L2607), [2608](../../../index.html#L2608), [2609](../../../index.html#L2609), [2610](../../../index.html#L2610)) → durchgängig `sub-netzwerk-patienten` (Replace-All auf den exakten String ist hier sicher, da die Zeichenkette nirgends etwas anderes meint).
- Drei `go('netzwerk','kontakte')`/`go("netzwerk","kontakte")`-Aufrufstellen: Heute-Live-Karte ([index.html:3656](../../../index.html#L3656)), `inDatenbank()` (nach Task 2.2s Änderung dort, per grep neu lokalisieren), `setDbView(v)` ([index.html:4822](../../../index.html#L4822)) → alle auf `'patienten'`/`"patienten"`.
- `switchTab()`: `bestand:["netzwerk","kontakte"]` ([index.html:6527](../../../index.html#L6527)) → `bestand:["netzwerk","patienten"]`.
- `applyHash()`: bestehende zwei Aliase (`bestand`→`kontakte`, `radar`→`kontakte`, [index.html:6547-6548](../../../index.html#L6547)) → Ziel auf `patienten` ändern; **zusätzlich neuen dritten Alias einfügen** `if(parts[0]==="netzwerk"&&parts[1]==="kontakte"){go("netzwerk","patienten");return;}` (alte Bookmarks/Links auf `#netzwerk/kontakte` bleiben gültig).
- `MATRIX`-Konfigzeile „Nachsorge & Radar" ([index.html:4271](../../../index.html#L4271)): **ausschließlich** `route:["netzwerk","kontakte"]` → `route:["netzwerk","patienten"]` ändern — `titel`/`zweck`/`metricId`/`status` auf derselben Zeile **nicht anfassen** (reines Routen-Datenfeld, keine `.mx-*`-Präsentation, gleicher Vorbehalt wie in Runde 3).
- Sichtbare Texte (alle einzeln, **nicht** per Replace-All, da unterschiedliche Formulierungen):
  - Kicker „Kontakte" → „Patienten" ([index.html:3744](../../../index.html#L3744)).
  - Hero-Überschrift „Kontakte vor dem Fall." → „Patienten vor dem Fall." ([index.html:3745](../../../index.html#L3745)).
  - `dbCockpit()`s KPI-Label „Kontakte" → „Patienten" (Zeile mit `dbc-lbl'>Kontakte<`, [index.html:5113](../../../index.html#L5113) — **nicht** die Nachbarzeile `dbc-lbl'>kontaktfähig<` bei [5121](../../../index.html#L5121), die bleibt unverändert).
  - Empty-State „Keine Kontakte." → „Keine Patienten." ([index.html:5161](../../../index.html#L5161)).
  - `TITLES`-Subtitle „Zuweiser · Kontakte" → „Zuweiser · Patienten" ([index.html:6502](../../../index.html#L6502)).
  - `kpRender()`-Radiolabel „Altpatienten & Kontakte ab 3★" → „Patienten ab 3★" ([index.html:5081](../../../index.html#L5081) — interner Wert `kpSet("typ","patienten")` bleibt unverändert, hinkte bereits vorher dem Label hinterher).

**Unverändert lassen (bewusst geprüft, andere Bedeutung):**
- „kontaktfähig" ([index.html:5121](../../../index.html#L5121)) und „kontaktfähige Altpatienten" ([index.html:5460](../../../index.html#L5460)) — Reichweiten-/Einwilligungs-Adjektiv, keine Entitätsbenennung.
- „Letzter Kontakt" — **beide** Vorkommen (`renderBestand()` [index.html:5146](../../../index.html#L5146) **und** `renderZuweiser()` [index.html:5342](../../../index.html#L5342)) — meint ein Ereignis, nicht die Entität.
- `renderZuweiser()`s Intro „…zuerst Kategorien, dann Kontakte und nächste Aktion." ([index.html:3724](../../../index.html#L3724)), Landkarten-Leertext „Noch keine Kontakte in dieser Kategorie" ([index.html:5315](../../../index.html#L5315)), Route-Strip-Label „Kontakte"/Archiv-Toggle „…potenzielle Kontakte anzeigen" ([index.html:5322](../../../index.html#L5322)/[5325](../../../index.html#L5325)) — meinen Zuweiser-**Beziehungen**, eine andere Entität.
- Jedes „Kontaktfreigabe"/„Kontakteinwilligung"-Vorkommen (Compliance-Begriff) und das Datenfeld `kontakt:{tel,mail}` auf `personen[]` ([index.html:4444](../../../index.html#L4444) u. a.) — Feldname, kein sichtbares Label.
- `mxMetric()`s `case"mxBCvor":return bestand.length+" Kontakte";` ([index.html:5555](../../../index.html#L5555)) — speist eine Matrix-Kachel (Cofounder-Territorium), **bewusst ausgeklammert**, nicht mitziehen.

**Schritte:**

- [ ] `grep -n "kontakte" index.html` ausführen, jede Zeile gegen die zwei obigen Listen abgleichen (umzubenennen / unverändert) — falls eine Zeile in keiner der beiden Listen vorkommt, vor dem Anfassen kurz einordnen, welcher Fall zutrifft (Entität „Patienten-Datenbank" vs. etwas anderes), nicht blind ersetzen.
- [ ] `SEGS.netzwerk` umstellen.
- [ ] `data-seg="kontakte"` + Label-Text umstellen.
- [ ] `sub-netzwerk-kontakte` → `sub-netzwerk-patienten` an allen 8 Fundstellen (Markup-ID + 7 CSS-Selektoren).
- [ ] Alle drei `go('netzwerk','kontakte')`-Aufrufstellen umstellen.
- [ ] `switchTab()`-Map-Ziel umstellen.
- [ ] `applyHash()`: zwei bestehende Aliase umstellen + neuen dritten Alias (`kontakte`→`patienten`) einfügen.
- [ ] `MATRIX`-Routenfeld umstellen (nur `route:[...]`, sonst nichts auf der Zeile).
- [ ] Die 6 sichtbaren Textstellen einzeln umstellen (Kicker, Hero-Überschrift, KPI-Label, Empty-State, TITLES-Subtitle, kpRender-Radiolabel).
- [ ] Nach allen Änderungen: `grep -n "kontakte" index.html` erneut ausführen — nur noch die in der „Unverändert lassen"-Liste genannten Stellen dürfen übrig sein.
- [ ] Manuell `#netzwerk/kontakte` in die Adresszeile eingeben (oder `location.hash="#netzwerk/kontakte"` in der Konsole) und bestätigen, dass die Ansicht korrekt auf „Patienten" landet.
- [ ] Standard-Verifikation bei 390px UND 1440px, inkl. Cofounder-Matrix-Kachel „Nachsorge & Radar" im Konzept-Tab anklicken (muss weiterhin funktionieren, jetzt zur Patienten-Ansicht).

**Sichtprüfung:** „Kontakte" kommt als Bezeichnung der Patienten-Datenbank nirgends mehr vor (Navigation, Kicker, Hero-Überschrift, KPI-Label, Empty-State, Netzwerk-Subtitle) — ersetzt durch „Patienten"; „Letzter Kontakt"/„Kontaktfreigabe"/Zuweiser-Beziehungstexte bleiben unverändert; alte Hash-Routen (`#netzwerk/kontakte`, `#netzwerk/bestand`, `#netzwerk/radar`) lösen weiterhin korrekt auf.

**Commit:** `refactor: Netzwerk — „Kontakte" durchgängig zu „Patienten" umbenannt, alte Routen bleiben als Aliase gültig (Punkt 3, Teil 1)`

---

### Task 3.2 — `.nwt-*`-Tab-Leisten: Radar/Stammdaten (Patienten) und Pflege/Stammdaten (Zuweiser) getrennt

**Lane:** `claude-implementer-pro` (Markup-Neubau in zwei Sub-Views)

**Abhängigkeit:** läuft nach Task 3.1 (nutzt die dort umbenannte Sub-View-ID `sub-netzwerk-patienten`).

**Referenz-Komponenten (erst Vorbilder lesen):** `.mtp-segbar`/`.mtp-seg`/`.mtp-seg.active`/`.mtp-pane`/`.mtp-pane.active` + `mtpSwitch()` ([index.html:3058-3064](../../../index.html#L3058) CSS, [index.html:6333-6337](../../../index.html#L6333) JS, Markup [index.html:3940-3945](../../../index.html#L3940)) — **exaktes** Vorbild: reines `classList`-Toggle ohne Routing, eigener Namespace statt `.seg` (dessen Klick-Handler bereits `go()`-Routing auslöst).

**Dateien/Anker:** `grep -n "id=\"sub-netzwerk-patienten\"\|id=\"sub-netzwerk-zuweiser\"\|function renderAll" index.html` vor Bearbeitung ausführen und alle Zeilenangaben neu bestätigen.

**Ist (verifiziert, Stand Planerstellung):**
- `#sub-netzwerk-patienten` (nach Task 3.1 umbenannt) stapelt: Kicker+Hero+Intro+Foto (gemeinsamer Kopf, bleibt außerhalb der Tabs) → `#tierFilter` → Kicker „Anlässe" + `#radarHost` → `#btable` → `<p class="db-foot">` (gemeinsamer Fuß, bleibt außerhalb der Tabs).
- `#sub-netzwerk-zuweiser` ([index.html:3723-3742](../../../index.html#L3723)) stapelt: `<p class="lblline">` (gemeinsamer Kopf) → `#zAnlaesse` → `.nx-entry` → `#zcatgrid` → `#zmap` → dekoratives Foto → `#zgrid`.
- `renderAll()` ([index.html:5910](../../../index.html#L5910)) ruft `renderBestand()`, `renderRadar()` und `renderZuweiser()` **unconditional bei jedem Aufruf** — kein Lazy-Rendering im Spiel, ein reines `classList`-Tab-Toggle braucht daher **keinen** zusätzlichen Render-Aufruf beim Reiter-Wechsel.
- `arCard()`/`anlaesse()`/`AR_TYP`/`AR_FOTO`-Logik wird durch diesen Task **nicht verändert** — nur ihre Container wandern in neue Tab-Panes.

**Schritte:**

- [ ] `grep`-Befehl oben ausführen, beide Sub-Views komplett neu lesen.

- [ ] **CSS**, neuer Block vor `</style>` (Namensraum `.nwt-*`, Optik 1:1 vom `.mtp-*`-Vorbild übernommen):
```css
/* Task 3.2 (Punkt 3): .nwt-* — interne Tableiste Radar/Stammdaten bzw. Pflege/Stammdaten, Muster wie .mtp-* */
.nwt-segbar{display:flex;gap:6px;margin:14px 0 16px;background:var(--cream2);border:1px solid var(--hair);border-radius:13px;padding:4px}
.nwt-seg{flex:1;min-height:40px;border-radius:10px;font-size:13.5px;font-weight:600;color:var(--ink-soft);background:transparent;border:0;cursor:pointer}
.nwt-seg.active{background:var(--espresso-grad);color:var(--ivory-tx);box-shadow:0 2px 8px rgba(36,32,28,.25)}
.nwt-pane{display:none}
.nwt-pane.active{display:block}
```

- [ ] **Tab-Umschalter** (scope-los per `closest()` — funktioniert für beide gleichzeitig vorhandenen Tab-Leisten ohne Parameter-String):
```js
function nwtSwitch(btn,which){
 const bar=btn.closest(".nwt-segbar");
 bar.querySelectorAll(".nwt-seg").forEach(b=>b.classList.toggle("active",b.dataset.nwt===which));
 btn.closest(".sub").querySelectorAll(".nwt-pane").forEach(p=>p.classList.toggle("active",p.dataset.nwt===which));
}
```

- [ ] **`#sub-netzwerk-patienten` umbauen** — Kopf (Kicker/Hero/Intro/Foto) und Fuß (`db-foot`) bleiben außerhalb, dazwischen Tableiste + zwei Panes:
```html
<!-- Ist (nach Task 3.1s Umbenennung): -->
<div class="kicker">Patienten</div>
<h2 class="hero-h2">Patienten vor dem Fall.</h2>
<p class="db-intro">…</p>
<figure class="au-photo au-photo--gold">…</figure>
<div id="tierFilter"></div>
<div class="kicker">Anlässe</div>
<div id="radarHost"></div>
<div id="btable"></div>
<p class="db-foot">…</p>
<!-- Soll: -->
<div class="kicker">Patienten</div>
<h2 class="hero-h2">Patienten vor dem Fall.</h2>
<p class="db-intro">…</p>
<figure class="au-photo au-photo--gold">…</figure>
<div class="nwt-segbar">
  <button class="nwt-seg active" data-nwt="radar" onclick="nwtSwitch(this,'radar')">Radar &amp; Anlässe</button>
  <button class="nwt-seg" data-nwt="stamm" onclick="nwtSwitch(this,'stamm')">Stammdaten</button>
</div>
<div class="nwt-pane active" data-nwt="radar">
  <div class="kicker">Anlässe</div>
  <div id="radarHost"></div>
</div>
<div class="nwt-pane" data-nwt="stamm">
  <div id="tierFilter"></div>
  <div id="btable"></div>
</div>
<p class="db-foot">…</p>
```
  (Reihenfolge innerhalb der Panes bewusst wie im Ist: `#tierFilter` steht in der Stammdaten-Pane **vor** `#btable`, exakt wie zuvor, nur beide jetzt gemeinsam hinter dem Stammdaten-Reiter.)

- [ ] **`#sub-netzwerk-zuweiser` umbauen** — Intro bleibt außerhalb, dazwischen Tableiste + zwei Panes:
```html
<!-- Ist: -->
<p class="lblline">Zuweiser-Netzwerk · zuerst Kategorien, dann Kontakte und nächste Aktion.</p>
<div id="zAnlaesse"></div>
<div class="nx-entry">…</div>
<div class="zcat-strip" id="zcatgrid"></div>
<div class="zmap" id="zmap"></div>
<figure class="au-photo au-photo--petrol">…</figure>
<div class="zgrid" id="zgrid"></div>
<!-- Soll: -->
<p class="lblline">Zuweiser-Netzwerk · zuerst Kategorien, dann Kontakte und nächste Aktion.</p>
<div class="nwt-segbar">
  <button class="nwt-seg active" data-nwt="pflege" onclick="nwtSwitch(this,'pflege')">Pflege &amp; Gesten</button>
  <button class="nwt-seg" data-nwt="stamm" onclick="nwtSwitch(this,'stamm')">Stammdaten &amp; Ranking</button>
</div>
<div class="nwt-pane active" data-nwt="pflege">
  <div id="zAnlaesse"></div>
</div>
<div class="nwt-pane" data-nwt="stamm">
  <div class="nx-entry">…</div>
  <div class="zcat-strip" id="zcatgrid"></div>
  <div class="zmap" id="zmap"></div>
  <figure class="au-photo au-photo--petrol">…</figure>
  <div class="zgrid" id="zgrid"></div>
</div>
```
  (Das dekorative Foto bleibt bei Tab 2 — positionell zwischen Landkarte und Rangliste, im Auftrag nicht separat erwähnt, rein dekorativ.)

- [ ] Kein zusätzlicher Render-Aufruf nötig (s. „Ist" — `renderAll()` füllt beide Panes ohnehin immer).

- [ ] Standard-Verifikation bei 390px (Tableisten dürfen nicht umbrechen) UND 1440px; beide Tabs in beiden Sub-Views durchklicken.

**Sichtprüfung:** Innerhalb „Patienten" und innerhalb „Zuweiser" liegen Radar/Pflege-Anlässe und Stammdaten/Ranking in zwei separat beschrifteten Reitern, nie mehr übereinandergestapelt; Tab-Wechsel ist ein reiner Klick ohne URL-/Hash-Änderung.

**Commit:** `feat: .nwt-*-Tableisten trennen Radar/Stammdaten (Patienten) und Pflege/Stammdaten (Zuweiser) (Punkt 3, Teil 2)`

---

## Phase 4 — Spec-Punkt 4: Case-Management-Protokoll → strukturiertes Formular

### Task 4.1 — Barthel/FIM-Indexe, Kurzbericht-Chips, Verlauf/Plan-Feld+Chips, Speichern-Erweiterung

**Lane:** `claude-implementer-pro`

**Referenz-Komponenten (erst Vorbilder lesen):** `renderMtProtokolle()` ([index.html:6342-6354](../../../index.html#L6342)) — Funktion, die erweitert wird, nicht neu gebaut; `MT_SCHRITTE`/`MT_LEITFAEDEN` ([index.html:6134](../../../index.html#L6134)/[6144](../../../index.html#L6144)) als Muster für die neuen Chip-Text-Arrays.

**Dateien/Anker:** `grep -n "function renderMtProtokolle\|function rsSaveZwischenstand\|^let inReha=" index.html` vor Bearbeitung ausführen und alle Zeilenangaben neu bestätigen.

**Ist (verifiziert, Stand Planerstellung):**
```js
function renderMtProtokolle(){
 const el=document.getElementById("mtpList");if(!el)return;
 el.innerHTML=inReha.map((p,i)=>{
  const faellig=zwischenstandFaellig(p);
  return "<div class='mtp-row'>"
   +"<div class='mtp-rhead'>…</div>"
   +"<textarea id='mtpKb"+i+"' class='rsz-textarea'>"+escapeHtml(p.kurzbericht||"")+"</textarea>"
   +"<button class='btn-brass btn-sm' onclick='rsSaveZwischenstand("+i+")'>Speichern</button>"
   +"</div>";
 }).join("");
}
function rsSaveZwischenstand(i){
 const p=inReha[i];if(!p)return;
 const ta=document.getElementById("mtpKb"+i);
 if(ta)p.kurzbericht=ta.value||"";
 p.zwischenstand.datum=dstr(0);
 p.zwischenstand.autor=p.zwischenstand.autor||"Case-Management";
 renderMeinTag();
 renderMtProtokolle();
}
```
`p.barthel:{auf,akt}`/`p.fim:{auf,akt}` existieren bereits auf allen 3 `inReha[]`-Einträgen (Beispiel [index.html:4390](../../../index.html#L4390): `barthel:{auf:45,akt:75},fim:{auf:78,akt:101}`) — `.akt` ist der editierbare aktuelle Wert. `p.verlaufPlan` existiert noch nicht (`grep -n "verlaufPlan" index.html` liefert aktuell keinen Treffer) — additive Neueinführung ist sicher. `.rsp-*`-Charts (Cofounder) lesen dieselben `barthel.akt`/`fim.akt`-Felder — gewollt, nur Werte ändern sich, keine Struktur.

**Schritte:**

- [ ] `grep`-Befehl oben ausführen, Zeilen neu bestätigen.

- [ ] **Chip-Arrays + Append-Helper** einfügen (z. B. direkt vor `function renderMtProtokolle`):
```js
const MT_KB_CHIPS=["Mobilisation planmäßig.","Schmerz rückläufig.","Kreislauf stabil.","Motivation gut.","Entlassvorbereitung eingeleitet."];
const MT_VP_CHIPS=["Therapieplan fortführen.","Belastung steigern.","Angehörigengespräch vereinbaren.","Entlassung vorbereiten."];
function mtChipAppend(taId,txt){
 const ta=document.getElementById(taId);if(!ta)return;
 ta.value=ta.value?ta.value+" "+txt:txt;
}
function mtChip(which,i,idx){
 const arr=which==="kb"?MT_KB_CHIPS:MT_VP_CHIPS;
 mtChipAppend(which==="kb"?"mtpKb"+i:"mtpVp"+i,arr[idx]);
}
```

- [ ] **`renderMtProtokolle()` erweitern:**
```js
function renderMtProtokolle(){
 const el=document.getElementById("mtpList");if(!el)return;
 el.innerHTML=inReha.map((p,i)=>{
  const faellig=zwischenstandFaellig(p);
  return "<div class='mtp-row'>"
   +"<div class='mtp-rhead'><span class='ava'>"+initialen(p.name)+"</span><b>"+escapeHtml(p.name)+"</b>"
   +"<span class='patient-meta'>"+escapeHtml(p.achse)+" · Tag "+p.verweildauer.ist+"/"+p.verweildauer.plan+"</span>"
   +"<span class='due "+(faellig?"bad":"ok")+"'>"+(faellig?"Zwischenstand fällig":"aktuell")+"</span></div>"
   +"<div class='mtp-idx'>"
     +"<label>Barthel <input type='number' id='mtpBa"+i+"' min='0' max='100' value='"+p.barthel.akt+"'></label>"
     +"<label>FIM <input type='number' id='mtpFi"+i+"' min='18' max='126' value='"+p.fim.akt+"'></label>"
   +"</div>"
   +"<div class='mtp-chips'>"+MT_KB_CHIPS.map((c,ci)=>"<button type='button' class='chip-sm' onclick='mtChip(\"kb\","+i+","+ci+")'>"+escapeHtml(c)+"</button>").join("")+"</div>"
   +"<label class='mtp-lbl'>Kurzbericht</label><textarea id='mtpKb"+i+"' class='rsz-textarea'>"+escapeHtml(p.kurzbericht||"")+"</textarea>"
   +"<div class='mtp-chips'>"+MT_VP_CHIPS.map((c,ci)=>"<button type='button' class='chip-sm' onclick='mtChip(\"vp\","+i+","+ci+")'>"+escapeHtml(c)+"</button>").join("")+"</div>"
   +"<label class='mtp-lbl'>Weiterer Verlauf / Plan</label><textarea id='mtpVp"+i+"' class='rsz-textarea'>"+escapeHtml(p.verlaufPlan||"")+"</textarea>"
   +"<button class='btn-brass btn-sm' onclick='rsSaveZwischenstand("+i+")'>Speichern</button>"
   +"</div>";
 }).join("");
}
```

- [ ] **`rsSaveZwischenstand(i)` erweitern** — Barthel/FIM per `parseInt`+Clamp, nur bei gültiger Zahl überschreiben (leeres/ungültiges Feld lässt bestehenden Wert unangetastet, statt ihn auf den Clamp-Rand zu zwingen):
```js
function rsSaveZwischenstand(i){
 const p=inReha[i];if(!p)return;
 const ta=document.getElementById("mtpKb"+i);
 if(ta)p.kurzbericht=ta.value||"";
 const vp=document.getElementById("mtpVp"+i);
 if(vp)p.verlaufPlan=vp.value||"";
 const ba=document.getElementById("mtpBa"+i);
 if(ba){const n=parseInt(ba.value,10);if(!isNaN(n))p.barthel.akt=Math.max(0,Math.min(100,n));}
 const fi=document.getElementById("mtpFi"+i);
 if(fi){const n=parseInt(fi.value,10);if(!isNaN(n))p.fim.akt=Math.max(18,Math.min(126,n));}
 p.zwischenstand.datum=dstr(0);
 p.zwischenstand.autor=p.zwischenstand.autor||"Case-Management";
 renderMeinTag();
 renderMtProtokolle();
}
```

- [ ] **CSS**, neuer Block vor `</style>`:
```css
/* Task 4.1 (Punkt 4): Protokoll-Board — Index-Zeile + Textbaustein-Chips */
.mtp-idx{display:flex;gap:16px;margin:10px 0}
.mtp-idx label{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--ink-soft)}
.mtp-idx input{width:64px;font:inherit;padding:6px 8px;border:1px solid var(--hair);border-radius:8px;background:var(--paper2);color:var(--ink)}
.mtp-lbl{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--brass-deep);margin:10px 0 4px}
.mtp-chips{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}
.chip-sm{font:500 12.5px/1 Inter;padding:7px 11px;border-radius:99px;border:1px solid var(--hair);background:var(--paper);color:var(--ink-soft);cursor:pointer;min-height:32px}
@media(hover:hover){.chip-sm:hover{border-color:var(--brass);color:var(--brass-deep)}}
```

- [ ] Standard-Verifikation bei 390px (Chip-Reihen umbrechen statt zu überlaufen) UND 1440px.

**Sichtprüfung:** Jede Protokoll-Zeile zeigt zwei Zahlenfelder (Barthel/FIM) mit den heutigen Werten vorbefüllt, eine Chip-Reihe über dem Kurzbericht (Klick fügt den Satz an) und ein separates „Weiterer Verlauf / Plan"-Feld mit eigenen Chips; „Speichern" schreibt alle vier Werte plus Zwischenstand-Datum, Zahl-Felder ignorieren leere/ungültige Eingaben statt sie auf 0/18 zu zwingen.

**Commit:** `feat: Protokoll-Board — Barthel/FIM-Indexe, Kurzbericht- und Verlauf/Plan-Chips statt einzelnem Freitextfeld (Punkt 4, Teil 1)`

---

### Task 4.2 — Leitungsansicht: „Weiterer Verlauf" additiv in `#rsErfolg`

**Lane:** `claude-implementer-pro` (eine bedingte Zeile — bewusst nicht in die implementer-Lane gegeben, da eine Datenabfrage/Verzweigung enthalten ist, keine reine Textersetzung)

**Abhängigkeit:** braucht `p.verlaufPlan` aus Task 4.1.

**Dateien/Anker:** `grep -n "function openRsDetail\|rs-report" index.html` vor Bearbeitung ausführen und Zeilenangaben neu bestätigen.

**Ist (verifiziert, Stand Planerstellung):**
```js
document.getElementById("rsErfolg").innerHTML=
  "<div class='rs-ctitle'>Erfolge &amp; Verlauf</div>"
 +"<div class='rs-rings'>"+…+"</div>"
 +"<div class='rs-dev'>"+…+"</div>"
 +rsChart(p)
 +"<div class='rs-report'><span class='rk'>Aktueller Kurzbericht</span>"+escapeHtml(p.kurzbericht)+"</div>"
 +(p.labor?…:"")
 +"<div class='rs-timeline'>"+…+"</div>";
```
`.rs-report`/`.rk` sind bereits fertig gestylt ([index.html:1207-1208](../../../index.html#L1207)) — keine neue CSS nötig, reine Wiederverwendung.

**Schritte:**

- [ ] `grep`-Befehl oben ausführen, Zeile neu bestätigen.
- [ ] Direkt nach der bestehenden `rs-report`-Zeile (Kurzbericht) einen zusätzlichen, nur bei vorhandenem Wert gerenderten Block einfügen:
```js
// Ist:
+"<div class='rs-report'><span class='rk'>Aktueller Kurzbericht</span>"+escapeHtml(p.kurzbericht)+"</div>"
+(p.labor?…
// Soll:
+"<div class='rs-report'><span class='rk'>Aktueller Kurzbericht</span>"+escapeHtml(p.kurzbericht)+"</div>"
+(p.verlaufPlan?"<div class='rs-report'><span class='rk'>Weiterer Verlauf</span>"+escapeHtml(p.verlaufPlan)+"</div>":"")
+(p.labor?…
```
- [ ] Bestätigen, dass `.rp-kurz`/Zuweiser-Portal ([index.html:5677](../../../index.html#L5677)) unverändert bleibt und weiterhin ausschließlich `p.kurzbericht` liest, nicht `p.verlaufPlan` (keine Code-Änderung dort, nur Gegenprüfung).
- [ ] Standard-Verifikation bei 390px UND 1440px; Cofounder-Bereich `.rsp-*` (Charts in derselben Funktion) unverändert gegentesten.

**Sichtprüfung:** Die Leitungsansicht (`openRsDetail()`/`#rsErfolg`) zeigt „Weiterer Verlauf" zusätzlich zum Kurzbericht an, sobald ein Case-Manager in Task 4.1 etwas dort eingetragen hat — bei leerem `verlaufPlan` erscheint der Block gar nicht (kein leerer Rahmen).

**Commit:** `feat: Leitungsansicht zeigt „Weiterer Verlauf" zusätzlich zum Kurzbericht, wenn gesetzt (Punkt 4, Teil 2)`

---

## Reihenfolge / Abhängigkeiten

```
Phase 1 (Spec-Punkt 2 · dynamische Fall-Akte) ── zuerst, unabhängig von 2-4
  1.1 #dArbeit — Scaffolding + beide Plan-Auflagen + 5 Aufgabentyp-Zweige (ein Task, nicht regressionsfrei teilbar)
        │
        ▼
Phase 2 (Spec-Punkt 1 · Anfrage-Detail-Fenster) ── nutzt openDetail() aus Phase 1
  2.1 #egDetail-Overlay + Registrierung + egSummaryHtml() (Grundgerüst, noch nicht verdrahtet)
  2.2 openEgDetail() + Owner-Zuordnung + uebernehmen()/antwortenEingang()-Umbau + renderEingang()-Vereinfachung (braucht 2.1)
  2.3 toggleMail()/verwaistes CSS entfernen (braucht 2.2 — erst danach wirklich verwaist)
        │
        ▼
Phase 3 (Spec-Punkt 3 · Netzwerk) ── unabhängig von 1+2, reiner Sweep + Markup-Wrapping
  3.1 Umbenennungs-Sweep Kontakte→Patienten (mechanisch; erfasst auch die in 2.2 neu entstandene inDatenbank()-Zeile)
  3.2 .nwt-*-Tabs in Patienten- und Zuweiser-Sub-View (braucht 3.1s umbenannte Sub-View-ID)
        │
        ▼
Phase 4 (Spec-Punkt 4 · Protokoll-Board) ── unabhängig von 1-3
  4.1 Barthel/FIM-Indexe + Kurzbericht-Chips + Verlauf/Plan-Feld+Chips + Speichern-Erweiterung
  4.2 Leitungs-Lesezeile „Weiterer Verlauf" (braucht 4.1s p.verlaufPlan)
```

Sequentiell in Phasen-Reihenfolge 1→2→3→4 ausführen (eine Datei, nie parallel) — entspricht der vom Koordinator vorgegebenen Reihenfolge P2→P1→P3→P4 und stellt sicher, dass Task 2.x `openDetail()`s bereits umgebauten Zustand aus Phase 1 vorfindet.

---

## Nicht-Ziele dieser Runde

- Keine Änderung an `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`-Namespaces oder `openReferrer`/`closeReferrer`/`#refOverlay` — Ausnahme unverändert: `p.kurzbericht` bleibt bewusst gemeinsame Quelle, die `.rp-kurz` liest.
- Datenarrays nur additiv erweitern: `p.verlaufPlan` (Punkt 4) ist das einzige neue Feld dieser Runde. `p.barthel.akt`/`p.fim.akt`/`p.kurzbericht`/`f.docs[3]`/`f.owner`/`f.aufgabe`/`f.frist` sind Wert-Updates auf bestehenden Feldern, keine Struktur-Änderungen.
- Kein neues persistiertes Datenfeld für die Anreise-Checkliste (Punkt 2) — ausdrücklich „lokale Checkboxen" laut Auftrag, kein `f.`-Feld dafür erfinden.
- Kein neuer Top-Level-`.view`, kein neuer `SEGS`-Eintrag, kein Hash-Routing für `#dArbeit` (Punkt 2), `#egDetail` (Punkt 1, nutzt stattdessen `_DETAIL_IDS`/`pushDetailState()` wie `#ovDetail`) oder die `.nwt-*`-Tableisten (Punkt 3) — alles reines `classList`-Toggle bzw. Overlay-Mechanik innerhalb bestehender Views/Muster.
- Keine neuen Keyframes — die bestehenden 9 müssen ausreichen.
- Keine Änderung an der Matrix-Kachel-Darstellung selbst (Task 3.1s Änderung an der `MATRIX`-Routenzeile betrifft nur ein Routen-Datenfeld, nicht die `.mx-*`-Präsentation).
- `arCard()`/`anlaesse()`/`AR_TYP`/`AR_FOTO`-Logik (Punkt 3) wird nicht verändert — nur ihre Container wandern in neue Tab-Panes.
- Keine Erweiterung von `antwortenEingang()`s Fokus-Verhalten um eine Sonderbehandlung für den Fall, dass der Antwort-Editor nicht sichtbar ist (Punkt 1 × Punkt 2 Interaktion, s. Task 2.2) — der bestehende `if(r)`-Guard reicht, weitere Anpassung wäre Scope-Creep.
- Jede Änderung bei 390px UND 1440px verifizieren, 0 Console-Errors, reduced-motion-safe, nur synthetische Demo-Daten, `escapeHtml` für dynamische Inhalte.
