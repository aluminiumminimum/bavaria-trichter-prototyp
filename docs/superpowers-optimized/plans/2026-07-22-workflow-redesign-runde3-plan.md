# Workflow-Redesign Runde 3 — Implementierungsplan

> **Für ausführende Agenten:** Dieser Plan wird Subagent-Driven umgesetzt — pro Task ein frischer Agent, kein Schreiben durch das orchestrierende Modell selbst. Lane-Tag pro Task beachten. Jeder Task arbeitet ausschließlich in `index.html`; **vor jeder Anker-Zeile den `grep`-Befehl aus dem Task selbst erneut ausführen** — Zeilennummern verschieben sich durch jeden vorherigen Task, die hier notierten Zeilen sind der Stand bei Plan-Erstellung (22.07.2026, vor Beginn dieser Runde), nicht garantiert der Stand bei Ausführung.

**Bezug:** Setzt [2026-07-22-workflow-redesign-runde3-design.md](../specs/2026-07-22-workflow-redesign-runde3-design.md) um (8 Feedback-Punkte, dritte Korrektur-Runde — Runde 1+2 waren überwiegend kosmetisch, diese Runde korrigiert das zugrundeliegende Informationsmodell).

**Ziel:** Status→Aufgabe-Modell für Fälle, Wer/Woher/Was-Entscheidungskarte im Eingang, Fallakte als Dashboard, binäres Zuweiser-Modell mit zahlengetriebener Pflege, Auflösung von Radar in Zuweiser/Kontakte, Case-Manager-Protokoll-Board in ma-mode, Fall-Kontext im Mitarbeiter-Sheet.

**Architektur:** Alle Änderungen in `index.html` (self-contained, ~6490 Zeilen, kein Build-Prozess). Sequentielle Ausführung — **nie parallel**, da jeder Task dieselbe Datei anfasst. Nach jedem Task: Git-Commit.

**Reihenfolge (zwingend, keine Umsortierung):** Phase 1 (Punkt 2, Aufgaben-Modell) zuerst — sie ist Fundament für Phase 3 (Punkt 3, Fallakte nutzt dieselbe Hero-Komponente) und Phase 7 (Punkt 8, Sheet zeigt nach „Erledigt" die nächste Aufgabe desselben Falls). Danach Punkt 1, 3, 4, 5, 6+7, 8 in genau dieser Reihenfolge.

**Lanes:**
- `claude-implementer` (Haiku) — **nur** für rein mechanische Tasks: CSS-Semantik-Umbau (Stepper), wörtliche Vokabular-Entfernung (aufbau/ziel), Route-Alias-Ergänzungen, Wrap-in-`<details>`-Umbauten ohne Verzweigungslogik.
- `claude-implementer-pro` (Sonnet) — alles mit Markup-Neubau, neuer Render-Logik, Funktionsextraktion oder Verhaltensänderungsrisiko (Triage-Karte, Aufgaben-Modell, Fallakte-Dashboard, Zuweiser-Ranking, Radar-Auflösung, Protokoll-Board, Sheet-Mini-Akte).

**Harte Regeln (jeder Task, aus Spec + projektweitem CLAUDE.md):**
- Cofounder-Namespaces **nicht anfassen**: `.rp-*` (Zuweiser-Suite), `.rpd-*` (Dokument-Viewer), `.rsp-*` (Reha-Charts), `.mx-*` (Matrix), `openReferrer`/`closeReferrer`/`#refOverlay` (verifiziert: `#refOverlay` [index.html:3957](../../../index.html#L3957), `openReferrer()` [index.html:5504](../../../index.html#L5504), `closeReferrer()` [index.html:5512](../../../index.html#L5512)). Ausnahme unverändert seit Runde 2: `p.kurzbericht` bleibt bewusst gemeinsame Quelle für Leitung, Case-Management und Zuweiser-Portal.
- Datenarrays (`faelle[]`, `personen[]`, `zuweiser[]`, `inReha[]`, `eingang[]`) **nur additiv erweitern** — vor dem Entfernen/Umbenennen eines Felds per `grep` prüfen, wer es sonst noch liest.
- Bei 390px **und** 1440px verifizieren, 0 Console-Errors, reduced-motion-safe.
- **Keine neuen Keyframes** — exakt 9 verifiziert (`lift`, `rpDrawC`, `rpDrawP`, `rpRing`, `rpGrow`, `cv-travel`, `auGrow`, `lxSweep`, `lxPulse`); neue visuelle Zustände (z. B. „zukünftig" im Stepper, Collapse im Sheet) sind statische CSS-Regeln bzw. natives `<details>`, keine Animation.
- `escapeHtml()` für jeden dynamisch eingefügten Text.
- Nur synthetische Demo-Daten.
- **Keine nackten Selects/Inputs in Hero-Bereichen** — Etiketten-System (Doppelrahmen Jade-Hairline + Gold-Eckwinkel, Radius-Familie 4px) statt Formularzeilen; Referenz `#view-fallakte .chap`/`::before`/`::after` ([index.html:3014-3023](../../../index.html#L3014)).
- Typografie: Cormorant Garamond für Display/Numerale (`.serif`/`.kicker`/`.chap-h2`/`.dcap`), Inter für Fließtext. Token statt Freihand-Farbe: `--sage-deep` (Lack-Jade), `--brass`/`--brass-deep` (Gold), `--terra`/`--alert` (Zinnober) — alle in `:root`, [index.html:20-33](../../../index.html#L20).

---

## Standard-Verifikation (nach jedem Task)

1. `grep -c "function "  index.html` vor/nach Vergleich — keine unbeabsichtigt gelöschten Funktionen.
2. Browser: Seite neu laden, Console auf 0 Errors prüfen.
3. Betroffene View bei 390px und bei 1440px öffnen, auf Overflow/Lesbarkeit prüfen.
4. Cofounder-Bereiche (Zuweiserportal `#refOverlay`, Matrix `.mx-*`/Konzept-Tab, Reha-Charts `.rsp-*` in `openRsDetail()`) unverändert gegentesten — nichts kaputt.
5. Commit mit klarer Botschaft, welcher Spec-Punkt umgesetzt wurde.
6. **Neu in Runde 3:** Jeder Task unten endet mit einer eigenen **Sichtprüfung** — einem Satz, was im Browser sichtbar sein muss, damit der Task als erfüllt gilt (aus dem jeweiligen Spec-Erfolgskriterium abgeleitet). Diese Prüfung zusätzlich zu den Punkten 1-5 durchführen, nicht statt ihnen.

---

## Phase 1 — Status→Aufgabe-Modell (Punkt 2) — Fundament, zuerst

### Task 1.1 — Werdegang-Stepper: CSS-Semantik erledigt/aktuell/zukünftig
**Lane:** `claude-implementer`
**Dateien/Anker:** `index.html`, CSS-Regeln `.stp .dot` / `.stp.done .dot` / `.stp.current .dot`, Stand bei Planerstellung [index.html:330-332](../../../index.html#L330). `grep -n "\.stp \.dot\|\.stp\.done \.dot\|\.stp\.current \.dot" index.html` vor Bearbeitung erneut ausführen.

**Ist (verifiziert):**
```css
.stp .dot{width:18px;height:18px;border-radius:99px;border:2px solid var(--brass);background:var(--ink);margin-top:1px}
.stp.done .dot{background:var(--sage);border-color:var(--sage)}
.stp.current .dot{border-color:var(--brass);box-shadow:0 0 0 3px rgba(185,145,73,.25)}
```
Der Bug: Die Basisregel füllt JEDEN Punkt mit `var(--ink)` (dunkel, wirkt „gefüllt"). `.done` überschreibt auf Jade — korrekt. `.current` ändert nur `border-color`/`box-shadow`, **nicht** den Hintergrund — ein aktueller Schritt bleibt also `--ink`-gefüllt, exakt wie ein zukünftiger. Die JS-Seite (`stepper()`, [index.html:5472-5484](../../../index.html#L5472); `deriveSchritte()`, [index.html:5804-5807](../../../index.html#L5804)) berechnet `done`/`current` bereits korrekt — reiner CSS-Fix, kein JS-Änderungsbedarf. `.stp` wird ausschließlich vom Werdegang-Stepper verwendet (verifiziert: keine anderweitige Wiederverwendung der Klasse im gesamten File), Änderung also folgenlos für andere Komponenten.

**Schritte:**
- [ ] `grep -n "\.stp \.dot\|\.stp\.done \.dot\|\.stp\.current \.dot" index.html` — Zeilen neu bestätigen.
- [ ] Ersetze die drei Regeln durch:
```css
.stp .dot{width:18px;height:18px;border-radius:99px;border:2px solid var(--brass);background:transparent;margin-top:1px}
.stp.done .dot{background:var(--sage);border-color:var(--sage)}
.stp.current .dot{background:var(--brass);border-color:var(--brass);box-shadow:0 0 0 3px rgba(185,145,73,.25)}
```
  (Zeile `.stp.current b{color:var(--brass-deep)}` direkt darunter bleibt unverändert, ist bereits korrekt aus Runde 2.)
- [ ] Keine Keyframes hinzufügen — reiner statischer Farbwechsel, reduced-motion-safe per Konstruktion.

**Sichtprüfung:** Einen Fall öffnen, dessen Status mitten im Werdegang steht (z. B. „Qualifizierung") — erledigte Schritte zeigen einen voll jade-gefüllten Punkt, der aktuelle Schritt einen voll gold-gefüllten Punkt mit sichtbarem Halo-Ring, alle folgenden Schritte einen hohlen (transparenten) Punkt mit nur goldener Umrandung; kein Punkt-Zustand ist mit einem anderen verwechselbar.

**Commit:** `style: Werdegang-Stepper — erledigt/aktuell/zukünftig eindeutig unterscheidbar (Punkt 2)`

---

### Task 1.2 — STATUS_AUFGABE-Map + advanceFallStatus()-Extraktion
**Lane:** `claude-implementer-pro`
**Dateien/Anker:** `const STATUS` [index.html:4074](../../../index.html#L4074), `function advanceFall()` [index.html:5856-5863](../../../index.html#L5856). `grep -n "^const STATUS=\|^function advanceFall" index.html` vor Bearbeitung erneut ausführen.

**Ist (verifiziert):**
```js
const STATUS=["Neu","Kontaktiert","Qualifizierung","Unterlagen","Aufnahme geplant","Aufgenommen","Verloren"];
...
function advanceFall(){ const f=aktuellerFall;if(!f)return;
 const cur=STATUS.indexOf(f.status); if(cur<0||cur>=5)return;
 const ns=STATUS[cur+1]; f.log.push([dstr(0),"Aufgabe erledigt · Status: "+f.status+" → "+ns]);
 if(f.personId)pHist(f.personId,ns==="Aufgenommen"?"aufnahme":"fall","Status: "+f.status+" → "+ns);
 qualifyIfNeeded(f,ns);
 if(f.schritte&&f.schritte[cur]) f.schritte[cur].done=true;
 f.status=ns; renderAll(); openDetail(f.id);
}
```
`f.aufgabe`/`f.frist` werden hier **nie** verändert — das ist der Kernfehler aus der Spec. Der Guard `cur>=5` begrenzt automatisches Fortschalten exakt auf die 5 Statuspaare, die die Spec mit Aufgaben belegt (Neu…Aufnahme geplant); „Aufgenommen"/„Verloren" sind Terminalzustände ohne Folgeaufgabe.

**Wichtig — Vorgriff auf Phase 7 (Punkt 8):** `mtAbschliessen()` ([index.html:6248-6275](../../../index.html#L6248)) hat im generischen Zweig ([index.html:6266-6270](../../../index.html#L6266)) exakt denselben Root-Cause-Bug (`item.ref.aufgabe="";item.ref.frist="";` statt Weiterschaltung). Dieser Task extrahiert die Statuslogik deshalb bewusst in eine **eigenständige, parametrisierte Funktion** `advanceFallStatus(f)` (statt die Logik nur inline in `advanceFall()` zu flicken), damit Phase 7 / Task 7.3 sie unverändert wiederverwenden kann, statt sie zu duplizieren (Duplizierung wäre die Standard-Falle hier — bewusst vermieden).

**Schritte:**
- [ ] `grep -n "^const STATUS=\|^function advanceFall" index.html` — Zeilen neu bestätigen.
- [ ] Direkt nach der `STATUS`-Zeile einfügen:
```js
const STATUS_AUFGABE={
  "Neu":"Rückruf/Erstkontakt",
  "Kontaktiert":"Bedarf qualifizieren",
  "Qualifizierung":"Unterlagen anfordern",
  "Unterlagen":"Kostenzusage anfragen",
  "Aufnahme geplant":"Anreise & Zimmer organisieren"
};
```
- [ ] `advanceFall()` in eine reine Statuslogik-Funktion + dünnen UI-Wrapper aufteilen:
```js
function advanceFallStatus(f){
 const cur=STATUS.indexOf(f.status); if(cur<0||cur>=5)return false;
 const ns=STATUS[cur+1]; f.log.push([dstr(0),"Aufgabe erledigt · Status: "+f.status+" → "+ns]);
 if(f.personId)pHist(f.personId,ns==="Aufgenommen"?"aufnahme":"fall","Status: "+f.status+" → "+ns);
 qualifyIfNeeded(f,ns);
 if(f.schritte&&f.schritte[cur]) f.schritte[cur].done=true;
 f.status=ns;
 f.aufgabe=STATUS_AUFGABE[ns]||"";
 f.frist=STATUS_AUFGABE[ns]?dstr(2):"";
 return true;
}
function advanceFall(){ const f=aktuellerFall;if(!f)return;
 advanceFallStatus(f);
 renderAll(); openDetail(f.id);
}
```
  (`dstr(2)` als neue Frist ist eine bewusste, zum bestehenden Muster passende Wahl — vgl. Seed-Daten `faelle[]`, in denen laufende Fälle durchgängig `dstr(0..2)`-Fristen tragen. Kein anderer Tag-Offset ist in der Spec vorgegeben.)
- [ ] **Nicht ändern:** `kzActions()` ([index.html:5817-5824](../../../index.html#L5817)). Ihr Regex `/kosten/i.test(f.aufgabe||"")` matcht ab jetzt automatisch korrekt, weil `f.aufgabe` beim Erreichen von Status „Unterlagen" zuverlässig `"Kostenzusage anfragen"` enthält (STATUS_AUFGABE-Eintrag). Der in der Spec beschriebene Folgefehler löst sich damit als Nebeneffekt auf — nur gegentesten, nicht anfassen.
- [ ] Prüfen: `faelle[]`-Einträge mit Status „Aufgenommen"/„Verloren" haben in den Seed-Daten bereits `aufgabe:"",frist:""` (z. B. id 10, 11) — `advanceFallStatus()`s Terminalfall (`STATUS_AUFGABE[ns]` ist `undefined` für „Aufgenommen") produziert exakt dasselbe Muster, keine Inkonsistenz.

**Sichtprüfung:** Einen Fall im Status „Unterlagen" öffnen, „Aktuelle Aufgabe erledigt" klicken — Status wechselt zu „Aufnahme geplant" **und** der Hero zeigt sofort „Anreise & Zimmer organisieren" mit neuer Frist (nicht mehr den alten Text); denselben Fall bis „Aufgenommen" durchklicken bestätigt, dass danach keine Aufgabe/Frist mehr angezeigt wird.

**Commit:** `feat: Status→Aufgabe-Modell — advanceFallStatus() setzt Aufgabe+Frist der Folgestufe (Punkt 2)`

---

### Task 1.3 — Fall-Detail-Drawer-Hero: Aufgabentyp+Icon, Personen-Chip, Ampel-Frist
**Lane:** `claude-implementer-pro`
**Dateien/Anker:** `.fh-hero`-Markup [index.html:4003-4014](../../../index.html#L4003), `openDetail()` [index.html:5864-5893](../../../index.html#L5864), `dSpeichern`-Handler [index.html:5906-5928](../../../index.html#L5906). `grep -n "fh-hero\|id=\"dAufgabe\"\|id=\"dOwner\"\|id=\"dFrist\"" index.html` vor Bearbeitung erneut ausführen.

**Ist (verifiziert):**
```html
<div class="fh-hero">
  <label for="dAufgabe" class="kicker">Nächste Aufgabe</label>
  <input id="dAufgabe" class="fh-aufgabe">
  <div class="fh-meta">
    <div><label for="dFrist">Frist</label><input id="dFrist" type="date"></div>
    <div><label for="dOwner">Verantwortlich</label><select id="dOwner"><option>S. Koordination</option>…</select></div>
  </div>
  <div class="fh-actions">…dAdvance-Button…openFallakte…</div>
</div>
```

**Kritische Nebenbedingung (selbst verifiziert, steht NICHT explizit so in der Spec):** `dOwner`/`dAufgabe`/`dFrist` sind keine reinen Anzeige-Elemente. Zwei bestehende Funktionen lesen/schreiben `.value` dieser exakten IDs:
- `openDetail()`, Zeilen 5870-5872: `dOwner.value=f.owner`, `dAufgabe.value=f.aufgabe||""`, `dFrist.value=f.frist||""`.
- `dSpeichern`-Click-Handler, Zeilen 5914-5916: `f.owner=dOwner.value`, `f.aufgabe=dAufgabe.value`, `f.frist=dFrist.value` — ein vollständig separater „alles speichern"-Pfad (Status/Owner/Aufgabe/Frist/Kosten/KT/Consent/Docs/Notiz), unabhängig vom `dAdvance`/`advanceFall()`-Kurzweg.

Eine 1:1-Wiederverwendung derselben IDs in der Fallakte (Phase 3) ist deshalb **nicht möglich** — zwei Elemente mit identischer ID (`dOwner` etc.) gleichzeitig im DOM wären ungültiges HTML und `getElementById` würde nur das erste treffen. Die „dieselbe Hero-Komponente" aus der Spec muss daher als **reine Präsentations-Funktion** (HTML-String, keine Formularelemente) gebaut werden, die in beiden Kontexten aufgerufen wird — im Drawer zusätzlich zu, nicht anstatt der drei funktionalen IDs.

**Bereits wiederverwendbar (kein neues CSS nötig):** `fristKlasse(f)` ([index.html:4450](../../../index.html#L4450), gibt `"bad"/"warn"/"ok"` zurück) + `fristText(f)` ([index.html:4451](../../../index.html#L4451)) + die bereits gestylten `.due`/`.ok`/`.warn`/`.bad`-Klassen ([index.html:357-360](../../../index.html#L357)) — exakt das Muster, das `makeBoardCol()` für die Board-Karten-Frist-Ampel schon verwendet ([index.html:4668](../../../index.html#L4668)/4673). **Referenz vor dem Bauen lesen:** `makeBoardCol()` [index.html:4661-4679](../../../index.html#L4661) für das Frist-Ampel-Muster, `CHAN_ICON` [index.html:4465](../../../index.html#L4465) plus die Tabbar-SVG-Icons [index.html:3947-3949](../../../index.html#L3947) für den Icon-Stil (kleine Inline-SVG-Linienicons, keine Emoji).

**Schritte:**
- [ ] `grep -n "fh-hero\|id=\"dAufgabe\"\|id=\"dOwner\"\|id=\"dFrist\"" index.html` — Zeilen neu bestätigen; `openDetail()`/`dSpeichern` komplett neu lesen (Zeilen können sich seit Task 1.1/1.2 verschoben haben).
- [ ] Neue Lookup-Tabelle `AUFGABE_ICON` anlegen (5 Einträge, Keys = `STATUS_AUFGABE`-Werte aus Task 1.2, Werte = kleine Inline-SVGs im Stil von `CHAN_ICON`/Tabbar-Icons — z. B. Telefonhörer für „Rückruf/Erstkontakt", Lupe für „Bedarf qualifizieren", Dokument für „Unterlagen anfordern", Häkchen/Euro für „Kostenzusage anfragen", Haus/Schlüssel für „Anreise & Zimmer organisieren").
- [ ] Neue reine Render-Funktion `aufgabenHeroHtml(f)` (HTML-String, kein DOM-Zugriff) — wird in Task 3.1 (Fallakte) erneut aufgerufen:
```js
function aufgabenHeroHtml(f){
 const fk=fristKlasse(f.frist), ft=f.frist?fristText(f.frist):"—";
 return "<div class='ah-typ'>"+(AUFGABE_ICON[f.aufgabe]||"")+"<b>"+escapeHtml(f.aufgabe||"Keine offene Aufgabe")+"</b></div>"
  +"<div class='ah-meta'>"
  +"<span class='ah-owner'><span class='ava'>"+initialen(f.owner)+"</span>"+escapeHtml(f.owner)+"</span>"
  +(f.frist?"<span class='due "+fk+"'>Frist "+escapeHtml(ft)+"</span>":"")
  +"</div>";
}
```
- [ ] `.fh-hero`-Markup umbauen: `dAufgabe` wird zu `<input id="dAufgabe" type="hidden">` (Wert bleibt maschinell gesetzt/gelesen wie bisher — freies Umtexten der Aufgabe entfällt bewusst, da die Aufgabe jetzt aus dem Status abgeleitet wird, siehe Task 1.2); direkt davor ein neuer Container `<div id="dAufgabeView"></div>`, den `openDetail()` zusätzlich mit `aufgabenHeroHtml(f)` befüllt.
- [ ] `dOwner` (Select) und `dFrist` (Date-Input) bleiben **echte, interaktive** native Elemente (Umbesetzen/Verschieben der Frist muss weiter möglich sein — das steht so nicht in der Spec, aber Entfernen wäre Funktionsverlust) — visuell zu einem Avatar-Chip (`dOwner` mit `appearance:none` + begleitendem `<span class="ava">`-Element, dessen Initialen per `change`-Listener aktualisiert werden) bzw. einer Ampel-Pille (`dFrist` umschlossen von einem Container, dessen Klasse per `change`-Listener aus `fristKlasse(this.value)` gesetzt wird) umstylen, statt sie zu verstecken.
- [ ] `openDetail()` ergänzen: nach den bestehenden Zeilen 5870-5872 zusätzlich `document.getElementById("dAufgabeView").innerHTML=aufgabenHeroHtml(f);` sowie die Owner-Avatar/Frist-Ampel-Initialisierung (gleiche Logik wie die neuen `change`-Listener, einmalig beim Öffnen ausgeführt).
- [ ] `dSpeichern`-Handler **nicht in seiner Lese-Logik ändern** (`dOwner.value`/`dAufgabe.value`/`dFrist.value` bleiben die Wahrheit) — nur sicherstellen, dass nach Speichern auch `dAufgabeView`/Avatar/Ampel neu gerendert werden (`renderAll()`+`openDetail()` dort ruft ohnehin schon `openDetail()` erneut auf über den bestehenden Ablauf — prüfen, nicht blind annehmen).
- [ ] Standard-Verifikation bei 390px UND 1440px — der Hero darf bei 390px nicht umbrechen/überlaufen.

**Sichtprüfung:** Im Fall-Detail-Drawer zeigt der Hero-Bereich oben Icon+Aufgabentext (kein Text-Input mehr sichtbar), darunter einen Avatar-Chip mit dem Namen des Verantwortlichen (kein nacktes `<select>` mehr sichtbar) und eine farbige Frist-Pille (grün/gold/rot je nach Nähe zum Fälligkeitsdatum, kein nacktes Datums-Input mehr sichtbar) — Owner und Frist bleiben per Klick änderbar.

**Commit:** `refactor: Fall-Detail-Drawer-Hero — Aufgabentyp+Icon, Personen-Chip, Ampel-Frist statt nackter Formularzeile (Punkt 2)`

---

## Phase 2 — Eingang → Triage-Karte (Punkt 1)

### Task 2.1 — Wer/Woher/Was/Wie-konkret-Karte + vorausgewählter Zuordnungsvorschlag
**Lane:** `claude-implementer-pro`
**Dateien/Anker:** `eingang[]`-Seed [index.html:4113-4122](../../../index.html#L4113), `renderEingang()` [index.html:4569-4596](../../../index.html#L4569), `ownerVorschlag()` [index.html:4204-4210](../../../index.html#L4204, unverändert, nur aufrufen). `grep -n "^let eingang=\|function renderEingang\|function ownerVorschlag" index.html` vor Bearbeitung erneut ausführen.

**Ist (verifiziert):** `eingang[]`-Einträge haben keine separaten `name`/`alter`/`rolle`-Felder — das Beziehungsmuster steckt uneinheitlich in `tit` oder `txt`. Die Karte zeigt aktuell nur eine nackte `<select class='eingang-owner'>` ohne Vorauswahl/Begründung ([index.html:4590](../../../index.html#L4590)); `ownerVorschlag(achse)` existiert und funktioniert bereits (least-loaded-Kandidat je Achse), wird aber im interaktiven Eingangs-Pfad nie aufgerufen — nur im automatischen Simulationspfad.

**Referenz vor dem Bauen lesen:** `#view-fallakte .chap`/`::before`/`::after` (Etiketten-Doppelrahmen, [index.html:3014-3023](../../../index.html#L3014)) für den Rahmen-Stil der neuen Wer/Woher-Teilkarte — **surgical**: nur der neue innere Block bekommt diese Optik, der bestehende `.mail`/`.mmore`-Wrapper der Eingangs-Karte selbst wird nicht umgebaut.

**Schritte:**
- [ ] `grep -n "^let eingang=\|function renderEingang\|function ownerVorschlag" index.html` — Zeilen neu bestätigen.
- [ ] `eingang[]`: additives Feld `wer` (natürlicher Satz) auf den `typ:"qualifiziert"`-Einträgen (id 101-106) ergänzen, nach dem Muster der beiden in der Spec zitierten Beispiele — z. B. id 101 (`tit`: „Anruf: Ehefrau fragt für Mann (72) nach Reha nach Herz-OP") → `wer:"Ehefrau fragt für Mann (72)"`; id 106 (`tit`: „PRIMO MEDICO: internationale Premium-Anfrage", `txt`: „Familie fragt für Vater (64) nach Intensiv-Reha mit Beatmung.") → `wer:"Familie fragt für Vater (64)"`. Für die übrigen 4 qualifizierten Einträge (102-105) je einen passenden Satz aus dem vorhandenen `tit`/`txt` ableiten. Die 2 passiven Einträge (107-108) brauchen kein `wer`-Feld (zeigen ohnehin keine Zuordnungs-UI).
- [ ] In `renderEingang()`: oberhalb der bestehenden Pill-Reihe (`.pills`, Zeile 4580) einen neuen Block einfügen mit „Wer" (Avatar + `m.wer||""`), „Woher" (Kanal + `m.kanal`, ggf. Institution aus `txt` falls erkennbar — sonst nur Kanal), „Was" (bestehende `.pill-a`-Achse-Pille, unverändert wiederverwenden), „Wie konkret" (bestehende Sterne + ein zusammengesetzter Begründungssatz aus `sig.kostentraeger`/`sig.dringlichkeit`, z. B. `[sig.kostentraeger?sig.kostentraeger+" erkannt":null, sig.dringlichkeit?"Frist "+sig.dringlichkeit:null, sig.konkret?"konkrete Anfrage":null].filter(Boolean).join(" · ")`).
- [ ] Owner-Zuordnung: in der `eingang-act`-Zeile (Zeile 4590) `ownerVorschlag(m.achse)` aufrufen, das passende `<option>` in der bestehenden `<select class='eingang-owner'>` vorauswählen (`selected`-Attribut auf dem Treffer), plus eine sichtbare Begründungszeile darunter: „Vorschlag: {Name} — Achse {m.achse}, geringste Auslastung".
- [ ] `escapeHtml()` auf alle neuen dynamischen Textfelder (`m.wer` u. a.) anwenden.
- [ ] Standard-Verifikation bei 390px UND 1440px.

**Sichtprüfung:** Eine offene, qualifizierte Eingangs-Karte aufklappen — ohne weiteren Klick ist erkennbar wer fragt (für wen), woher, welches Programm, wie konkret/dringend (Sterne + Begründungssatz), und die Owner-Zuordnung zeigt bereits einen vorausgewählten Namen mit sichtbarer Begründung statt einer leeren Dropdown-Zeile.

**Commit:** `feat: Eingangs-Karte zeigt Wer/Woher/Was/Wie-konkret + vorausgewählten Zuordnungsvorschlag (Punkt 1)`

---

## Phase 3 — Vollständige Fallakte → Dashboard (Punkt 3)

### Task 3.1 — Fallakte-Umbau: Kopf-Status-Band, Kennzahl-Kacheln, Nächste-Aufgabe-Karte, zweispaltig
**Lane:** `claude-implementer-pro`
**Dateien/Anker:** `#view-fallakte`-Markup [index.html:3912-3940](../../../index.html#L3912), `renderFallakte()` [index.html:6380-6417](../../../index.html#L6380). **Abhängigkeit:** braucht `aufgabenHeroHtml(f)` aus Task 1.3 — dieser Task darf erst NACH Phase 1 laufen. `grep -n "id=\"view-fallakte\"\|function renderFallakte" index.html` vor Bearbeitung erneut ausführen.

**Ist (verifiziert):** 5 `.chap`-Blöcke (Übersicht/Werdegang/Medizinische Kurzfelder/Abrechnung/Dokumente), jeder rendert reine `.pa-row`-Label:Wert-Paare. Kopf ([index.html:3914-3918](../../../index.html#L3914)) zeigt nur `faName`/`faSub`/`faAva` als Text, kein Achse-Pill, keine Sterne. `faDokumente` ([index.html:6414-6416](../../../index.html#L6414)) nutzt bereits `.status-pill ok/lock` — die Spec-Anforderung „Dokumente als Status-Chips" ist hier **bereits erfüllt**, nur die Positionierung (rechte Spalte) ändert sich.

**Referenz vor dem Bauen lesen:** `.rs-kpi`/`.rk-n` in `openRsDetail()`/`rsWirt` ([index.html:5669-5678](../../../index.html#L5669) — `.rs-*` ist **kein** Cofounder-Namespace, nur `.rsp-*` ist gesperrt, siehe Harte Regeln oben) und `.g-stat` (Heute-Begrüßung, [index.html:115](../../../index.html#L115)) als Muster für „große Serif-Zahlen" statt 10px-Label-Listen. `kzChain(f)` ([index.html:5810-5816](../../../index.html#L5810)) und `sterneHtml(n)`/`sterneVon(...)` (Aufrufmuster `sterneVon({personId:x.personId})` wie in `makeBoardCol()`, [index.html:4663](../../../index.html#L4663)) wiederverwenden, nicht neu bauen.

**Schritte:**
- [ ] `grep -n "id=\"view-fallakte\"\|function renderFallakte" index.html` — Zeilen neu bestätigen; kompletten aktuellen Block neu lesen (Zeilen verschieben sich durch Phase 1/2).
- [ ] Kopf (`.vhead` in `#view-fallakte`): Achse-Pill (bestehende `.pill-a`-Optik, Farbe aus `ACHSE_COL[f.achse]`) und Sterne (`sterneHtml(sterneVon({personId:f.personId}))`) neben `faName`/`faSub` ergänzen.
- [ ] Ersten `.chap`-Block („Übersicht") umbauen zu: Kennzahl-Kacheln-Reihe (3 Kacheln: Frist-Ampel via `fristKlasse(f.frist)`/`fristText(f.frist)`/`.due`-Klasse; Kostenzusage-Kette via `kzChain(f)`; Sterne via `sterneHtml(...)`) gefolgt von der Nächste-Aufgabe-Karte via `aufgabenHeroHtml(f)` (aus Task 1.3):
```js
document.getElementById("faKacheln").innerHTML=
   "<div class='fa-kachel'><span class='rk'>Frist</span><span class='due "+fristKlasse(f.frist)+"'>"+(f.frist?escapeHtml(fristText(f.frist)):"—")+"</span></div>"
  +"<div class='fa-kachel'>"+kzChain(f)+"</div>"
  +"<div class='fa-kachel'>"+sterneHtml(sterneVon({personId:f.personId}))+"</div>";
document.getElementById("faNaechste").innerHTML="<div class='kicker'>Nächste Aufgabe</div>"+aufgabenHeroHtml(f);
```
  Die bisherigen `.pa-row`-Zeilen „Status"/„Verantwortlich"/„Nächste Aufgabe"/„Frist"/„Kostenträger" aus `faUebersicht` ([index.html:6388-6392](../../../index.html#L6388)) entfallen dort (jetzt in Kacheln/Kopf/Aufgaben-Karte abgedeckt); „Einwilligung"/„SalutoCare"-Zeilen bleiben als Stammdaten-Rest erhalten (siehe nächster Schritt).
- [ ] Ab 1024px zweispaltiges Layout: linke Spalte = bestehender „Werdegang"-`.chap` (`faWerdegang`, unverändert) + Verlauf; rechte Spalte = restliche Stammdaten (Kostenträger/Einwilligung/SalutoCare-Zeile aus `faUebersicht`, „Medizinische Kurzfelder" bleibt eigener Block) + `faDokumente` (Status-Chips, nur hierher verschoben, Inhalt/Logik unverändert). CSS-technisch per Grid/Flex auf dem `#view-fallakte`-Container ab `min-width:1024px`, unterhalb weiter einspaltig gestapelt.
- [ ] `escapeHtml()` auf alle neuen dynamischen Werte.
- [ ] Standard-Verifikation bei 390px (einspaltig, kein Overflow der Kacheln-Reihe — ggf. horizontal scrollbar oder gestapelt) UND 1440px (zweispaltig sichtbar).

**Sichtprüfung:** Die Fallakte zeigt oben Achse+Sterne im Kopf, direkt darunter drei Kennzahl-Kacheln (Frist-Ampel-Farbe, Kostenzusage-Kette, Sterne) und eine Nächste-Aufgabe-Karte mit Icon — ab Desktop-Breite stehen Werdegang links und Stammdaten+Dokumente-Chips rechts nebeneinander; nirgends mehr eine reine Fließ-Textliste als Hauptinhalt.

**Commit:** `refactor: Fallakte — Dashboard mit Kennzahl-Kacheln statt Textlisten (Punkt 3)`

---

## Phase 4 — Zuweiser-Ansicht → binär + Zahlen erzeugen Aufgaben (Punkt 4)

### Task 4.1 — Vokabular-Entfernung „aufbau"/„ziel" + verwaistes CSS
**Lane:** `claude-implementer`
**Dateien/Anker:** `lbl`-Map [index.html:5176](../../../index.html#L5176), `Z_CATS`-Note [index.html:5124](../../../index.html#L5124), `kpRender()`-Select [index.html:4971](../../../index.html#L4971), Empty-State-Karte [index.html:5227](../../../index.html#L5227), `.zstat`-Emission auf der Haupt-Karte [index.html:5216](../../../index.html#L5216). `grep -n "const lbl=\|Zielkategorie im Aufbau\|Status: im Aufbau\|class='zstat" index.html` vor Bearbeitung erneut ausführen.

**Wichtig — bewusster Scope-Cut (im Review ggf. gegenprüfen):** Die Netzwerk-Landkarte (`zmap`/`networkDot()` [index.html:5166-5168](../../../index.html#L5166)/Map-Legende [index.html:5199](../../../index.html#L5199)) färbt Punkte weiterhin dreistufig nach `z.status` (aktiv/aufbau/ziel) — **das bleibt in diesem Task unangetastet**. Die Spec nennt `networkDot()` zwar als „dieselbe Trichotomie" im Ist-Teil, das Soll beschreibt aber ausdrücklich nur die Kartenliste (`zgrid`) als binär; `z.status` bleibt zusätzlich als Datenfeld erhalten (additiv-Regel — wird an anderer Stelle evtl. noch gelesen). Wird die Landkarte in einer späteren Runde ebenfalls vereinheitlicht, ist das eine eigene Entscheidung.

**Schritte:**
- [ ] `grep -n "const lbl=\|Zielkategorie im Aufbau\|Status: im Aufbau\|class='zstat" index.html` — Zeilen neu bestätigen.
- [ ] `const lbl={aktiv:...,aufbau:...,ziel:...}` (Zeile 5176) komplett entfernen.
- [ ] Auf der Zuweiser-Hauptkarte (Zeile 5216) das `<span class='zstat "+z.status+"'>"+lbl[z.status]+"</span>` entfernen (die Stelle, an der bisher „Aktiver Partner"/„Im Aufbau"/„Ziel-Partner" stand) — Task 4.2 ersetzt diese Position durch das Rang-Badge, hier nur ersatzlos streichen.
- [ ] `Z_CATS`-Eintrag `sanitaet` (Zeile 5124): Note-Text „Zielkategorie im Aufbau" durch neutralen Text ersetzen, z. B. „Sanitätshäuser & Orthopädie-Technik".
- [ ] `kpRender()`-Select (Zeile 4971): Optionen „Status: im Aufbau"/„Status: Ziel" entfernen, nur „Status: aktiv"/„Status: alle" behalten (Werte/Vergleichslogik entsprechend anpassen, falls der Select sonst auf inzwischen nicht mehr existierende Optionswerte prüft — `grep -n "_kp.status" index.html` gegenprüfen).
- [ ] Empty-State-Karte (Zeile 5227): Text „Zielkategorie" / „Zielpartner recherchieren, Kontaktquelle erfassen und ersten SOP-Schritt anlegen." durch neutrale Formulierung ersetzen, z. B. „Noch keine aktiven Zuweiser in dieser Kategorie" / „Kontakt herstellen und ersten Fall verzeichnen."; `class='zcard ziel'`/`class='zstat ziel'` in diesem Markup auf `class='zcard'` (ohne `ziel`-Modifier) reduzieren.
- [ ] Nach obigen Änderungen erneut `grep -n "\.zstat" index.html` ausführen — sind nur noch CSS-Definitionen (keine Emission mehr) übrig, sind folgende Regeln jetzt verwaist und können entfernt werden: `.zstat`-Basisregel + `.zstat.aktiv`/`.aufbau`/`.ziel` (Stand Planerstellung [index.html:395-398](../../../index.html#L395)), Override-Block (Stand Planerstellung [index.html:1775](../../../index.html#L1775)/[1779](../../../index.html#L1779)), zweiter Override-Block (Stand Planerstellung [index.html:2637](../../../index.html#L2637)). Ebenso `.zcard.ziel` (Stand Planerstellung [index.html:394](../../../index.html#L394)/[2635](../../../index.html#L2635)) — **`.zcard` selbst (ohne `.ziel`) bleibt**, wird weiterhin für jede Karte gebraucht. Vor dem Löschen jeweils per `grep` bestätigen, dass wirklich keine Emission mehr existiert — nicht blind nach Zeilennummer löschen, da sich Zeilen durch vorherige Tasks verschoben haben.
- [ ] Standard-Verifikation.

**Sichtprüfung:** In der Zuweiser-Ansicht (Kategorie-Filter, Landkarte, Kartenliste) taucht der Text „Im Aufbau" oder „Ziel-Partner"/„Zielkategorie" nirgends mehr auf — die Landkarte selbst zeigt weiterhin dreifarbige Punkte (bewusst unverändert, siehe Scope-Cut-Hinweis oben).

**Commit:** `refactor: Zuweiser-Vokabular „Im Aufbau"/„Ziel-Partner" aus der Oberfläche entfernt (Punkt 4)`

---

### Task 4.2 — Ranking nach Fallzahl + Trend-Sparkline + zahlengetriebenes Pflege-Feld
**Lane:** `claude-implementer-pro`
**Dateien/Anker:** `renderZuweiser()` [index.html:5175-5228](../../../index.html#L5175), `naechsteAktion()` [index.html:5136-5142](../../../index.html#L5136), `verlaufAusFaellen()`/`z.verlauf3M` [index.html:4739-4745](../../../index.html#L4739) (bereits berechnet, nur zu visualisieren), `zAnlaesse`-Div [index.html:3681](../../../index.html#L3681). **Läuft nach Task 4.1** (setzt die dort entfernte `.zstat`-Position voraus). `grep -n "function renderZuweiser\|function naechsteAktion\|const sorted=\[\.\.\.filtered\]" index.html` vor Bearbeitung erneut ausführen.

**Ist (verifiziert):**
- Sortierung (Zeile 5212, Stand Planerstellung): `sort((a,b)=>({aktiv:0,aufbau:1,ziel:2}[a.status]-{…}[b.status])||(b.faelle-a.faelle))` — primär Status-Eimer, erst sekundär Fallzahl.
- `naechsteAktion(z)` hat **exakt eine** Aufrufstelle im gesamten Code (Zeile 5225, innerhalb `renderZuweiser()`) — selbst verifiziert per `grep -n "naechsteAktion("`. Gefahrlos ersetzbar/entfernbar, kein anderer Konsument.
- `trendMap` (Zeile 5213) liefert bereits Anstieg/Einbruch-Texte aus `anlaesse()` (`zuweiser-trend`-Typ, Logik in [index.html:4778-4787](../../../index.html#L4778)) — das deckt die Fälle „Anstieg"/„Einbruch" aus der Spec **bereits ab**. Fehlt nur: der `naechsteAktion()`-Fallback für den Normalfall (kein Trend) ist status-basiert, muss auf Draht-Stärke umgestellt werden.
- `z.verlauf3M` (3 Werte, `verlaufAusFaellen()`) ist für jeden Zuweiser bereits berechnet — keine Sparkline im Markup bisher.

**Cofounder-Hinweis (selbst verifiziert):** `rsChart()` ([index.html:5749-5767](../../../index.html#L5749)) ist ein fertiges SVG-Linienchart-Muster — **aber** es rendert in `.rsp-chart`/`.rsp-legend`, also im gesperrten `.rsp-*`-Namespace (Reha-Charts, Cofounder). Nur als **Strukturvorbild lesen** (Polyline aus Werte-Array bauen), keinesfalls seine Klassen wiederverwenden oder seine CSS-Regeln anfassen. Die neue Sparkline bekommt einen eigenen, neuen Klassennamen (z. B. `.zw-spark`).

**Schritte:**
- [ ] `grep -n "function renderZuweiser\|function naechsteAktion\|const sorted=\[\.\.\.filtered\]" index.html` — Zeilen neu bestätigen.
- [ ] Sortierung (vormals Zeile 5212) auf reine Fallzahl umstellen: `const sorted=[...filtered].sort((a,b)=>b.faelle-a.faelle);`
- [ ] An der Stelle, an der Task 4.1 die `.zstat`-Pille entfernt hat: Rang-Badge einfügen, z. B. `"<span class='zw-rank serif'>#"+(i+1)+"</span>"` (großes Serif-Numeral, `.serif`-Klasse ist bereits global auf Cormorant Garamond gemappt — kein neues Font-CSS nötig) — dafür `sorted.map((z,i)=>...)` statt `sorted.map(z=>...)` (Index mitführen).
- [ ] Neue kleine Sparkline-Funktion (neuer Namespace, **nicht** `.rsp-*`):
```js
function zwSparkline(v){
 const w=64,h=20,max=Math.max(1,...v);
 const pts=v.map((n,i)=>(i/(v.length-1)*w)+","+(h-(n/max*h))).join(" ");
 return "<svg class='zw-spark' viewBox='0 0 "+w+" "+h+"' width='"+w+"' height='"+h+"'><polyline points='"+pts+"' fill='none' stroke='var(--brass-deep)' stroke-width='1.6'/></svg>";
}
```
- [ ] Neue Rhythmus-Pflege-Funktion (ersetzt den `naechsteAktion()`-Fallback, Draht-Stärke aus `(z.draht.match(/●/g)||[]).length` — 0-3):
```js
function rhythmusPflege(z){
 const staerke=((z.draht||"").match(/●/g)||[]).length;
 if(staerke>=3)return"Quartalsgespräch";
 if(staerke===2)return"Newsletter";
 return"Broschüre";
}
```
- [ ] Zeile 5225 (`znext`/„Nächste Aktion") umbauen: bei Trend-Treffer (`trendMap.has(z.name)`) unverändert Anstieg/Einbruch-Text zeigen (bereits korrekt); im „sonst"-Fall statt `z.next||naechsteAktion(z)` neu: `z.next||rhythmusPflege(z)`.
- [ ] `naechsteAktion(z)` (Zeilen 5136-5142) komplett entfernen — durch obigen Schritt ist ihre einzige Aufrufstelle ersetzt, Funktion ist jetzt tot (eigener Orphan durch diesen Task, entsprechend zu entfernen statt stehenzulassen).
- [ ] Sparkline in die Karte einbauen (z. B. direkt neben/unter dem Rang-Badge, vor der Trend-/Pflege-Zeile): `zwSparkline(z.verlauf3M)`.
- [ ] `zAnlaesse`-Block umbenennen: Überschrift in `renderZuweiser()` (Zeile 5211, aktuell „Zuweiser-Anlässe") zu „Zuweiserpflege — anstehende Gesten" ändern.
- [ ] `zAnlaesse`-Div ([index.html:3681](../../../index.html#L3681)) im statischen Markup an den Anfang der Zuweiser-Sub-View verschieben — vor `.nx-entry` ([index.html:3667](../../../index.html#L3667)), direkt nach dem einleitenden `<p class="lblline">` (Zeile 3666), passend zu „Oben in der Ansicht" aus der Spec.
- [ ] `escapeHtml()` auf alle neuen dynamischen Werte.
- [ ] Standard-Verifikation bei 390px (Sparkline darf nicht umbrechen/die Karte sprengen) UND 1440px.

**Sichtprüfung:** Die Zuweiser-Kartenliste zeigt jede Karte mit fortlaufender Rangnummer (#1, #2, …) nach Fallzahl absteigend sortiert, eine kleine 3-Monats-Trendlinie, und einen konkreten Pflegehinweis („Bedanken", „⚠ Nachfassen — Rückgang klären" oder eine Rhythmus-Geste) — „Zuweiserpflege — anstehende Gesten" steht ganz oben in der Ansicht.

**Commit:** `feat: Zuweiser-Karten nach Fallzahl gerankt + Trend-Sparkline + zahlengetriebenes Pflege-Feld (Punkt 4)`

---

## Phase 5 — Radar löst sich auf (Punkt 5)

### Task 5.1 — Radar-Sub-Tab auflösen: Markup verschieben, Heute-Karte zweiteilen
**Lane:** `claude-implementer-pro`
**Dateien/Anker:** Segment-Leiste + Sub-Views in `#view-netzwerk` [index.html:3659-3703](../../../index.html#L3659), Heute-Live-Karte `#radarLine` [index.html:3596-3599](../../../index.html#L3596), `renderAnlaesse()` [index.html:4825-4834](../../../index.html#L4825). **Läuft vor Task 5.2** (die dort geänderten Routen zeigen auf die hier neu positionierten Sub-Views). `grep -n "id=\"sub-netzwerk-radar\"\|id=\"radarHost\"\|id=\"rlCount\"\|function renderAnlaesse" index.html` vor Bearbeitung erneut ausführen.

**Ist (verifiziert):**
- `.segments`-Leiste: 3 Buttons `zuweiser`/`radar`/`kontakte` ([index.html:3660-3662](../../../index.html#L3660)).
- Drei `.sub`-Divs: `#sub-netzwerk-zuweiser` (3665-3684), `#sub-netzwerk-radar` (3685-3693, enthält `#radarHost` **und** `#anlassChap`/`#anlassList`/`#anlassSum`), `#sub-netzwerk-kontakte` (3694-3702).
- `#radarHost` wird von `renderRadar()` befüllt und ist bereits B2C-rein (Geburtstage/Jubiläen/Wiederbedarf, `anlaesse("patienten")`).
- `#anlassList`/`#anlassSum` werden von `renderAnlaesse()` aus **ungefiltertem** `anlaesse()` befüllt — das ist die konkrete Mischstelle (B2B+B2C zusammen), zusätzlich redundant zu `#radarHost` (B2C) und zu `zAnlaesse` in der Zuweiser-Ansicht (B2B, aus Task 4.2 jetzt oben positioniert).
- Heute-Live-Karte (`#radarLine`, Zeilen 3596-3599): **ein** Button `onclick="go('netzwerk','radar')"`, Bildunterschrift mischt wörtlich „Geburtstage, Wiederbedarf, Zuweiser-Kontakte" — das ist die B2B/B2C-Mischstelle im Heute-Feed, die laut Spec-Soll in „zwei beschriftete Reihen" aufgeteilt werden muss (nicht explizit in der Spec als eigener Fund benannt, aber die einzige Stelle im Heute-View, auf die „zwei Welten getrennt in zwei Reihen" zutreffen kann — selbst verifiziert, dass es in `#view-heute` keine weitere Anlässe-Liste gibt).
- `renderAnlaesse()` befüllt aktuell sowohl `#rlCount` (Zeile 4831, Gesamtzahl für die Heute-Karte) als auch `#anlassList`/`#anlassSum`.

**Schritte:**
- [ ] `grep -n "id=\"sub-netzwerk-radar\"\|id=\"radarHost\"\|id=\"rlCount\"\|function renderAnlaesse" index.html` — Zeilen neu bestätigen.
- [ ] `#radarHost`-Div (samt umgebendem `<div class="kicker">`-Label „Radar & Anlässe" bzw. passend umbenannt, z. B. „Anlässe") aus `#sub-netzwerk-radar` in `#sub-netzwerk-kontakte` verschieben (z. B. nach `#tierFilter`/vor `#btable`) — reine Markup-Verschiebung, `renderRadar()` selbst bleibt unverändert (befüllt weiterhin dieselbe ID `radarHost`, egal wo sie im DOM sitzt).
- [ ] `#sub-netzwerk-radar`-Div komplett entfernen (samt `#anlassChap`/`#anlassList`/`#anlassSum`-Markup darin).
- [ ] Segment-Button `<button class="seg" data-seg="radar" role="tab">Radar</button>` (Zeile 3661) aus der `.segments`-Leiste entfernen.
- [ ] Heute-Live-Karte (`#radarLine`) auf zwei Reihen umbauen:
```html
<div class="chap hb-8" id="radarLine">
  <div class="kicker"><span class="au-chapnum">02</span>Radar · Beziehungen pflegen</div>
  <button class="card lx-live rl-strip" onclick="go('netzwerk','kontakte')"><i class="lx-pulse"></i><b><span id="rlCountPat">–</span> Anlässe fällig</b> · Geburtstage, Jubiläen, Wiederbedarf<span class="lx-rt">KONTAKTE ›</span></button>
  <button class="card lx-live rl-strip" onclick="go('netzwerk','zuweiser')"><i class="lx-pulse"></i><b><span id="rlCountZuw">–</span> Zuweiser warten</b> · Kontaktpflege fällig<span class="lx-rt">ZUWEISER ›</span></button>
</div>
```
- [ ] `renderAnlaesse()` vereinfachen — `#anlassList`/`#anlassSum`/`arCard`-Aufruf entfernen, stattdessen beide neuen Zähler scope-gefiltert befüllen:
```js
function renderAnlaesse(){
 const pat=anlaesse("patienten"), zuw=anlaesse("zuweiser");
 const rp=document.getElementById("rlCountPat");if(rp)rp.textContent=pat.length;
 const rz=document.getElementById("rlCountZuw");if(rz)rz.textContent=zuw.length;
}
```
- [ ] `arAktion(key)` ([index.html:4795-4804](../../../index.html#L4795), ruft am Ende `renderAnlaesse();renderRadar();renderZuweiser();`) bleibt unverändert — funktioniert mit der vereinfachten `renderAnlaesse()` unverändert weiter.
- [ ] Standard-Verifikation: `grep -n "arCard\|anlaesse(" index.html` danach gegenprüfen, dass keine verwaiste Referenz auf `#anlassList`/`#anlassSum`/`#anlassChap` mehr existiert.

**Sichtprüfung:** In Netzwerk gibt es nur noch zwei Segmente (Zuweiser/Kontakte, kein „Radar" mehr); die Heute-Ansicht zeigt zwei getrennt beschriftete Zeilen („… Anlässe fällig · Geburtstage, Jubiläen, Wiederbedarf" → Kontakte, „… Zuweiser warten" → Zuweiser) statt einer gemischten Zeile; nirgends mehr eine Liste, die B2B und B2C zusammen zeigt.

**Commit:** `refactor: Radar-Sub-Tab aufgelöst — Patienten-Anlässe in Kontakte, Heute-Karte B2B/B2C getrennt (Punkt 5, Teil 1)`

---

### Task 5.2 — Route-Alias: SEGS, applyHash, MATRIX-Routenstring, setDbView
**Lane:** `claude-implementer`
**Dateien/Anker:** `SEGS.netzwerk` [index.html:6313](../../../index.html#L6313), `applyHash()` [index.html:6362-6374](../../../index.html#L6362), `MATRIX`-Konfigzeile „Nachsorge & Radar" [index.html:4170](../../../index.html#L4170), `setDbView(v)` [index.html:4705](../../../index.html#L4705). **Läuft nach Task 5.1.** `grep -n "const SEGS=\|function applyHash\|route:\[.netzwerk.,.radar.\]\|function setDbView" index.html` vor Bearbeitung erneut ausführen.

**Ist (verifiziert):**
```js
const SEGS={faelle:["anfragen","board","team"],netzwerk:["zuweiser","radar","kontakte"],konzept:["idee","matrix","sops"]};
...
function applyHash(){
  ...
  if(parts[0]==="netzwerk"&&parts[1]==="bestand"){go("netzwerk","kontakte");return;}
  ...
}
...
{row:"B2C",col:"nach",titel:"Nachsorge & Radar",zweck:"Wiedervorlagen, Datenbank-Pflege",metricId:"mxBCnach",status:"aufbau",route:["netzwerk","radar"]}
...
function setDbView(v){go("netzwerk",v==="radar"?"radar":"kontakte");}
```
`setDbView(v)` hat **null Aufrufstellen** im gesamten Code (selbst verifiziert per `grep -n "setDbView("` — einziger Treffer ist die Definition selbst). Ungefährlich zu vereinfachen, aber die Spec verlangt die Korrektur trotzdem (tote Funktion mit ungültigem Routenziel ist schlechte Hygiene, auch wenn aktuell niemand sie aufruft).

**Wichtig — Cofounder-Konfigzeile 4170:** Das ist **keine** `.mx-*`-CSS-Regel, sondern eine reine JS-Konfigurationszeile im `MATRIX`-Array, die auch die Cofounder-Matrix-Kachel-Darstellung speist. Die Spec ist hier explizit: **nur** das Routen-Array `route:["netzwerk","radar"]` → `route:["netzwerk","kontakte"]` ändern — `titel:"Nachsorge & Radar"` **unverändert lassen**, obwohl der Titel danach nicht mehr exakt zur Zielroute passt (das ist von der Spec ausdrücklich als „bei Umsetzung prüfen, nicht Teil dieser Spec-Entscheidung" offengelassen, keine eigene Interpretation nachschieben). Chirurgische 1-String-Änderung, sonst nichts auf dieser Zeile anfassen.

**Schritte:**
- [ ] `grep -n "const SEGS=\|function applyHash\|route:\[.netzwerk.,.radar.\]\|function setDbView" index.html` — Zeilen neu bestätigen.
- [ ] `SEGS.netzwerk`: `["zuweiser","radar","kontakte"]` → `["zuweiser","kontakte"]`.
- [ ] `applyHash()`: direkt nach der bestehenden `bestand`-Alias-Zeile (`if(parts[0]==="netzwerk"&&parts[1]==="bestand"){go("netzwerk","kontakte");return;}`) einen neuen, exakt gleich gebauten Alias einfügen: `if(parts[0]==="netzwerk"&&parts[1]==="radar"){go("netzwerk","kontakte");return;}`.
- [ ] `MATRIX`-Konfigzeile: **ausschließlich** `route:["netzwerk","radar"]` → `route:["netzwerk","kontakte"]` ändern, alle anderen Felder auf dieser Zeile (`titel`, `zweck`, `metricId`, `status`) unangetastet lassen.
- [ ] `setDbView(v)`: vereinfachen zu `function setDbView(v){go("netzwerk","kontakte");}` (Parameter `v` bleibt in der Signatur, auch wenn er jetzt ungenutzt ist — keine Aufrufstellen zu jagen, die den Parameter mitgeben; Entfernen der Signatur wäre unnötiges Risiko für eine tote, aber möglicherweise später wieder gebrauchte Funktion).
- [ ] Nach den Änderungen: `#netzwerk/radar` manuell in die Adresszeile eingeben (bzw. `location.hash="#netzwerk/radar"` in der Konsole setzen) und bestätigen, dass die Ansicht auf Kontakte landet.
- [ ] Standard-Verifikation — insbesondere Cofounder-Matrix-Kachel „Nachsorge & Radar" im Konzept-Tab anklicken und bestätigen, dass sie jetzt auf Kontakte statt auf eine tote Radar-Route führt, ohne dass sich an der Kachel-Optik selbst etwas ändert.

**Sichtprüfung:** Der Hash `#netzwerk/radar` (z. B. aus einem alten Lesezeichen) landet automatisch auf der Kontakte-Ansicht; die Matrix-Kachel „Nachsorge & Radar" führt zur Kontakte-Ansicht statt ins Leere; die Matrix-Kachel-Optik selbst ist unverändert.

**Commit:** `fix: Route-Alias #netzwerk/radar → kontakte (SEGS, applyHash, MATRIX-Route, setDbView) (Punkt 5, Teil 2)`

---

## Phase 6 — Case-Managerin → Protokoll-Board in ma-mode (Punkt 6+7)

### Task 6.1 — Segment-Leiste `.mtp-*` + Protokolle-Board (alle In-Reha-Patienten als Zeilen)
**Lane:** `claude-implementer-pro`
**Dateien/Anker:** `#view-meintag`-Markup [index.html:3880-3910](../../../index.html#L3880), `renderMeinTag()` [index.html:6167-6186](../../../index.html#L6167), `zwischenstandFaellig()` [index.html:6088-6093](../../../index.html#L6088). **Verortung bindend aus der Spec:** kein neuer Top-Level-`.view`, keine `SEGS`/Hash-Route, kein Eingriff in das `ma-mode`-Gate ([index.html:1609-1611](../../../index.html#L1609), unverändert lassen) — reines `classList`-Toggle innerhalb derselben View. `grep -n "id=\"view-meintag\"\|function renderMeinTag\|function zwischenstandFaellig" index.html` vor Bearbeitung erneut ausführen.

**Ist (verifiziert):** `#view-meintag` enthält aktuell direkt unter `.mt-head`: `.mt-termine`, ein Foto, `#mtJetztChap`, `#mtWocheChap`, `#mtGutChap` — keine Segment-Leiste, kein zweiter Bereich. `inReha[]`-Felder (verifiziert an Beispieleintrag): `personId, name, alter, achse, owner, icd, aufnahme, verweildauer:{ist,plan}, barthel:{auf,akt}, fim:{auf,akt}, ziel, kurzbericht, labor[], eintraege[]` (+ optional `zwischenstand:{datum,autor}`, von `zwischenstandFaellig()`/`rsSaveZwischenstand()` gelesen/geschrieben).

**Schritte:**
- [ ] `grep -n "id=\"view-meintag\"\|function renderMeinTag\|function zwischenstandFaellig" index.html` — Zeilen neu bestätigen.
- [ ] Direkt nach `.mt-head` (vor `.mt-termine`) neue Segment-Leiste einfügen:
```html
<div class="mtp-segbar">
  <button class="mtp-seg active" data-mtp="tag" onclick="mtpSwitch('tag')">Mein Tag</button>
  <button class="mtp-seg" data-mtp="protokolle" onclick="mtpSwitch('protokolle')">Protokolle</button>
</div>
```
- [ ] Den kompletten bisherigen Inhalt von `.mt-termine` bis `#mtGutChap` in einen neuen Wrapper `<div class="mtp-pane active" id="mtpPaneTag">…</div>` einschließen (reine Einklammerung, kein Inhalt ändern).
- [ ] Danach neuen Wrapper `<div class="mtp-pane" id="mtpPaneProtokolle"><div class="chap"><div class="kicker">Protokolle</div><h2 class="chap-h2">Alle In-Reha-Patienten</h2><div id="mtpList"></div></div></div>` ergänzen.
- [ ] Neue Toggle-Funktion (reines Client-State, kein Routing, kein Hash):
```js
function mtpSwitch(which){
 document.querySelectorAll(".mtp-seg").forEach(b=>b.classList.toggle("active",b.dataset.mtp===which));
 document.getElementById("mtpPaneTag").classList.toggle("active",which==="tag");
 document.getElementById("mtpPaneProtokolle").classList.toggle("active",which==="protokolle");
 if(which==="protokolle")renderMtProtokolle();
}
```
- [ ] Neue Render-Funktion für das Board, ein Row pro `inReha[]`-Patient (Avatar, Achse, „Tag X/Y" aus `verweildauer.ist`/`.plan`, Fällig-Ampel aus `zwischenstandFaellig(p)`, Textarea vorbefüllt mit `p.kurzbericht`, Speichern-Button pro Zeile):
```js
function renderMtProtokolle(){
 const el=document.getElementById("mtpList");if(!el)return;
 el.innerHTML=inReha.map((p,i)=>{
  const faellig=zwischenstandFaellig(p);
  return "<div class='mtp-row'>"
   +"<div class='mtp-rhead'><span class='ava'>"+initialen(p.name)+"</span><b>"+escapeHtml(p.name)+"</b>"
   +"<span class='patient-meta'>"+escapeHtml(p.achse)+" · Tag "+p.verweildauer.ist+"/"+p.verweildauer.plan+"</span>"
   +"<span class='due "+(faellig?"bad":"ok")+"'>"+(faellig?"Zwischenstand fällig":"aktuell")+"</span></div>"
   +"<textarea id='mtpKb"+i+"' class='rsz-textarea'>"+escapeHtml(p.kurzbericht||"")+"</textarea>"
   +"<button class='btn-brass btn-sm' onclick='rsSaveZwischenstand("+i+")'>Speichern</button>"
   +"</div>";
 }).join("");
}
```
- [ ] `renderMeinTag()` ergänzen: am Ende zusätzlich `renderMtProtokolle();` aufrufen, damit das Board bei jedem globalen Re-Render aktuell bleibt (auch wenn der Protokolle-Reiter gerade nicht sichtbar ist — günstiger als bei jedem Tab-Wechsel neu zu berechnen, Datenmenge ist klein).
- [ ] `rsSaveZwischenstand(i)` ([index.html:5700-5709](../../../index.html#L5700)) anpassen: liest aktuell fest `document.getElementById("mtZwText")` — auf die neue pro-Zeile-ID umstellen: `const ta=document.getElementById("mtpKb"+i);`. Den bisherigen `.rsz-save`-Button-Sonderfall (Zeilen 5707-5708, `document.querySelector(".rsz-save")`-Erfolgsanimation für das alte Einzel-Sheet) entfernen — im neuen Board reicht ein einfaches `renderMtProtokolle()` nach dem Speichern als Bestätigung (Zeile im Board aktualisiert sich, Fällig-Ampel springt auf „aktuell").
- [ ] CSS: `.mtp-pane{display:none}.mtp-pane.active{display:block}` sowie `.mtp-segbar`/`.mtp-seg`/`.mtp-seg.active`/`.mtp-row` in einem neuen kommentierten Block vor `</style>` ergänzen (Etiketten-Look für `.mtp-row` an `#view-fallakte .chap` orientieren, s. Harte Regeln oben) — reduced-motion-safe, keine neuen Keyframes, reines `display:none/block`.
- [ ] Standard-Verifikation bei 390px (Board-Zeilen dürfen nicht überlaufen) UND 1440px.

**Sichtprüfung:** In ma-mode (`body.ma-mode`) zeigt ein Klick auf den Reiter „Protokolle" alle In-Reha-Patienten als Zeilen mit editierbarem Kurzbericht-Textfeld und eigener Fällig-Ampel, jede Zeile einzeln speicherbar, ohne dass Sidebar/Topbar/Tabbar sichtbar werden; ein Klick zurück auf „Mein Tag" zeigt wieder die gewohnte Aufgabenliste — alles innerhalb derselben URL/Route.

**Commit:** `feat: Protokolle-Reiter in Mein Tag — alle In-Reha-Patienten mit editierbarem Kurzbericht an einem Ort (Punkt 6+7, Teil 1)`

---

### Task 6.2 — Zwischenstand-Reminder verknüpfen + toten Code aufräumen
**Lane:** `claude-implementer-pro`
**Dateien/Anker:** `mtCard()` [index.html:6125-6141](../../../index.html#L6125), `mtSheetRender()` [index.html:6212-6247](../../../index.html#L6212). **Läuft nach Task 6.1** (braucht `mtpSwitch()`). `grep -n "function mtCard\|function mtSheetRender" index.html` vor Bearbeitung erneut ausführen.

**Ist (verifiziert):** `mtCard(item)`s Aktions-Button ist für **alle** Typen identisch: `onclick='mtOpen("...")'` (Zeile 6131). Für `typ==="zwischenstand"`-Items öffnet das über `mtOpen()`→`mtSheetRender()` weiterhin das alte Einzel-Sheet mit einem eigenen `#mtZwText`-Textarea (Zeile 6235) und `rsSaveZwischenstand(item.idx)`-Button (Zeile 6223) — genau der Pfad, der laut Spec „Der Mein-Tag-Zwischenstand-Reminder wechselt beim Klick auf den 'Protokolle'-Reiter (statt ein eigenes Sheet zu öffnen)" ersetzt werden soll.

**Nicht offensichtlicher Zusatzfund (selbst verifiziert, nicht in der Spec):** Ein zwischenstand-Item wird **nie** über `_mtDone` als erledigt markiert (`mtAbschliessen()` wird für diesen Typ nie aufgerufen — er hat einen eigenen `rsz-save`-Button-Pfad, keinen `mtAbschlBtn`-Pfad). Zusätzlich kann ein zwischenstand-Item auch über `mtNext()` (Zeile 6276-6281, „Weiter zur nächsten ›" nach Abschluss eines ANDEREN Items) als `_mtSheetKey` landen, ohne über `mtCard()`/`mtOpen()` zu laufen. Ein reiner Klick-Handler-Fix in `mtCard()` würde diesen zweiten Einstiegspfad **nicht** abdecken. Deshalb zusätzlich ein Guard direkt in `mtSheetRender()` selbst (einzige Stelle, durch die jeder Pfad zwingend läuft).

**Schritte:**
- [ ] `grep -n "function mtCard\|function mtSheetRender" index.html` — Zeilen neu bestätigen.
- [ ] `mtCard()`, Zeile 6131 (Aktions-Button): für `item.typ==="zwischenstand"` abzweigen:
```js
const action=done?"<span class='mt-check'>✓ Erledigt"+(internNotiz?" — "+escapeHtml(internNotiz.slice(0,60))+(internNotiz.length>60?"…":""):"")+"</span>"
 :(item.typ==="zwischenstand"
   ?"<button class='btn-ghost btn-sm' onclick='mtpSwitch(\"protokolle\")'>Zum Protokoll ›</button>"
   :"<button class='btn-ghost btn-sm' onclick='mtOpen(\""+item.key.replace(/"/g,"&quot;")+"\")'>Jetzt erledigen ›</button>");
```
- [ ] `mtSheetRender()`: direkt nach der `if(!item){mtClose();return;}`-Zeile einen Guard einfügen, der JEDEN Weg abfängt (auch über `mtNext()`):
```js
if(item.typ==="zwischenstand"){mtClose();mtpSwitch("protokolle");return;}
```
- [ ] Damit werden folgende Teile von `mtSheetRender()` unerreichbar (verwaist durch diesen Task, entsprechend entfernen statt stehenlassen): den `foot`-Sonderfall `item.typ==="zwischenstand"?"<button class='rsz-save' onclick='rsSaveZwischenstand(...)'>Speichern</button>":...` (Zeilen 6222-6223) und den `body`-Sonderfall mit `#mtZwText`-Textarea (Zeilen 6233-6235) — beide Ternary-Zweige auf ihren jeweiligen „sonst"-Fall reduzieren (der Guard oben verhindert, dass der `zwischenstand`-Zweig je erreicht wird).
- [ ] Standard-Verifikation: gezielt einen anderen (nicht-zwischenstand) Mein-Tag-Task über den normalen Sheet-Ablauf abschließen und „Weiter zur nächsten ›" klicken, bis ein zwischenstand-Reminder an der Reihe wäre — bestätigen, dass automatisch auf den Protokolle-Reiter gewechselt wird statt ein Sheet zu zeigen.

**Sichtprüfung:** Ein Klick auf einen überfälligen Zwischenstand-Reminder in „Was jetzt dran ist" wechselt direkt zum Protokolle-Reiter (kein Sheet öffnet sich mehr); dasselbe passiert auch, wenn man über „Weiter zur nächsten ›" von einem anderen Task aus auf ein Zwischenstand-Item trifft.

**Commit:** `refactor: Zwischenstand-Reminder öffnet Protokolle-Reiter statt Einzel-Sheet, toter Sheet-Zweig entfernt (Punkt 6+7, Teil 2)`

---

## Phase 7 — Mitarbeiter-Aufgaben-Sheet mit Fall-Kontext (Punkt 8)

### Task 7.1 — Mini-Fallakte-Header im Sheet
**Lane:** `claude-implementer-pro`
**Dateien/Anker:** `mtSheetRender()`, `.mt-shead`-Block [index.html:6241-6243](../../../index.html#L6241). `grep -n "mt-shead" index.html` vor Bearbeitung erneut ausführen.

**Ist (verifiziert):** `.mt-shead` zeigt aktuell nur Avatar + Name + Typ-Label (`MT_TYP_LABEL[item.typ]`) + Fällig-Pille. Keine Achse/KT-Pills, keine Status-Zeile, keine Verlaufsauszüge — obwohl `item.ref` für `item.kind==="fall"`-Items ein vollständiges `Fall`-Objekt mit `achse`/`kt`/`status`/`log[]` ist.

**Schritte:**
- [ ] `grep -n "mt-shead" index.html` — Zeile neu bestätigen; `mtSheetRender()` komplett neu lesen (Zeilen verschieben sich durch Phase 6).
- [ ] Für `item.kind==="fall"` (also `item.ref` ist ein `Fall`) einen zusätzlichen Mini-Fallakte-Block direkt unter `.mt-shead` einfügen: Achse-Pill (`.pill-a`, Farbe `ACHSE_COL[item.ref.achse]`) + KT-Pill (`.pill-kt`) + Status-Text (`item.ref.status`) + letzte 2 Log-Einträge (`item.ref.log.slice(-2)`, gleiches Rendermuster wie das bestehende `dLog`-Log-Rendering — `<b>Datum</b><br>Text` pro Eintrag).
- [ ] Für `item.kind!=="fall"` (`eingang`/`intern` — `zwischenstand` erreicht diesen Code nach Task 6.2 nicht mehr) diesen Block **nicht** rendern (kein `achse`/`kt`/`status`/`log` in derselben Form vorhanden) — einfache `if(item.kind==="fall"){...}`-Bedingung.
- [ ] `escapeHtml()` auf alle neuen dynamischen Werte.
- [ ] Standard-Verifikation bei 390px (Pills dürfen nicht umbrechen/überlaufen) UND 1440px.

**Sichtprüfung:** Ein Fall-bezogenes Mein-Tag-Sheet (z. B. ein Rückruf- oder Kostenklärungs-Task) zeigt oben zusätzlich zu Avatar/Name Achse- und Kostenträger-Pille, den aktuellen Status und die letzten zwei Protokoll-Einträge des Falls; ein Eingang- oder Intern-Sheet zeigt diesen Block nicht (hat keinen Fall).

**Commit:** `feat: Mitarbeiter-Sheet zeigt Mini-Fallakte (Achse/KT/Status/Verlauf) im Kopf (Punkt 8, Teil 1)`

---

### Task 7.2 — Leitfaden einklappbar
**Lane:** `claude-implementer`
**Dateien/Anker:** `mtSheetRender()`, Leitfaden-Zeile [index.html:6238](../../../index.html#L6238) (Stand Planerstellung — verschiebt sich durch Task 7.1). `grep -n "mt-sleitfaden" index.html` vor Bearbeitung erneut ausführen.

**Ist (verifiziert):** `.mt-ssteps`/`.mt-sleitfaden` ([index.html:1650-1654](../../../index.html#L1650)/[1873](../../../index.html#L1873)/[2597-2599](../../../index.html#L2597)) sind reine Typografie-/Rahmen-Styles ohne Collapse-Mechanik — kein `<details>`, kein Toggle-JS, kein Collapse-CSS. Betrifft laut Spec-Soll ausdrücklich den „Leitfaden"-Block (die `MT_LEITFAEDEN`-gespeisten Formulierungshilfen), nicht „So gehst du vor" (`.mt-ssteps`, bleibt wie gehabt immer sichtbar).

**Schritte:**
- [ ] `grep -n "mt-sleitfaden" index.html` — Zeile neu bestätigen.
- [ ] Aktuelle Zeile
```js
+"<div class='radar-prog'><span class='rk'>Leitfaden</span><div class='mt-sleitfaden'>"+leitfaden.map(x=>"<p>"+escapeHtml(x)+"</p>").join("")+"</div></div>"
```
  ersetzen durch natives `<details>`/`<summary>` (kein JS-Toggle nötig, kein neues Keyframe, Standardverhalten des Browsers reicht):
```js
+"<details class='mt-sleitfaden-details'><summary class='rk'>Leitfaden</summary><div class='mt-sleitfaden'>"+leitfaden.map(x=>"<p>"+escapeHtml(x)+"</p>").join("")+"</div></details>"
```
- [ ] Minimales CSS ergänzen (vor `</style>`, kommentierter Block), damit `<summary>` wie das bisherige `.rk`-Label aussieht statt wie ein Standard-Dreieck-Widget: `summary.rk{cursor:pointer;list-style:none}summary.rk::-webkit-details-marker{display:none}` — **keine** Transition/Animation auf `[open]` ergänzen (reduced-motion-safe per Verzicht, nicht per `prefers-reduced-motion`-Media-Query).
- [ ] Standard-Verifikation: Sheet öffnen, Leitfaden ist standardmäßig eingeklappt, Klick auf „Leitfaden" klappt ihn auf/zu.

**Sichtprüfung:** Im Mitarbeiter-Sheet ist der Leitfaden-Abschnitt standardmäßig eingeklappt (nur die Überschrift „Leitfaden" sichtbar) und lässt sich per Klick auf-/zuklappen; „So gehst du vor" bleibt davon unberührt immer sichtbar.

**Commit:** `feat: Leitfaden im Mitarbeiter-Sheet einklappbar statt permanent sichtbar (Punkt 8, Teil 2)`

---

### Task 7.3 — Nächste Aufgabe DES FALLS nach Abschluss (statt allgemeiner Warteschlange)
**Lane:** `claude-implementer-pro`
**Dateien/Anker:** `mtAbschliessen()` [index.html:6248-6275](../../../index.html#L6248), generischer Zweig [index.html:6266-6270](../../../index.html#L6266). **Abhängigkeit:** braucht `advanceFallStatus(f)` aus Task 1.2 — dieser Task darf erst NACH Phase 1 laufen. `grep -n "function mtAbschliessen" index.html` vor Bearbeitung erneut ausführen.

**Ist (verifiziert):**
```js
}else{
  const desc=item.ref.aufgabe||MT_TYP_LABEL[item.typ];
  item.ref.log.push([dstr(0),desc+": "+notiz]);
  item.ref.aufgabe="";item.ref.frist="";
}
```
Dieser generische Zweig (greift für `kind==="fall"`-Items, die weder `typ==="kosten"` sind noch über `kind==="eingang"`/`"intern"` abgezweigt werden — also genau die Items aus `mtFallAufgabeItem()`, die direkt aus dem Status→Aufgabe-Modell stammen) **leert** die Aufgabe statt sie weiterzuschalten — derselbe Root-Cause-Bug wie in `advanceFall()` (Task 1.2), hier aber für den Mein-Tag-Pfad. Nach `_mtDone.add(key)`/`renderAll()`/`renderMeinTag()` ruft die Funktion `mtSheetRender()` erneut auf, die dasselbe (jetzt erledigte) `_mtSheetKey` erneut anzeigt — es gibt keinen automatischen Sprung zur nächsten Aufgabe desselben Falls, nur den manuellen „Weiter zur nächsten ›"-Button (`mtNext()`), der in die allgemeine Warteschlange springt, nicht zwingend zum selben Fall.

**Scope-Abgrenzung (bewusst, nicht in der Spec explizit ausgeschlossen, aber aus dem Soll-Text „gekoppelt an das Aufgaben-Modell aus Punkt 2" abgeleitet):** Diese Kopplung gilt **nur** für den generischen Zweig (das Status→Aufgabe-Modell). Die `kind==="eingang"`- und `kind==="intern"`-Zweige sowie der `typ==="kosten"`-Zweig bleiben unverändert (kein Fall-Status-Fortschritt in ihrer Bedeutung) — nicht mit ausbauen, das wäre Scope-Creep über die Spec hinaus.

**Schritte:**
- [ ] `grep -n "function mtAbschliessen" index.html` — Zeile neu bestätigen.
- [ ] Generischen Zweig umbauen, `advanceFallStatus(f)` aus Task 1.2 wiederverwenden (keine Logik duplizieren) und `_mtSheetKey` bei Erfolg auf die neue Aufgabe desselben Falls umsetzen:
```js
}else{
  const f=item.ref;
  const desc=f.aufgabe||MT_TYP_LABEL[item.typ];
  f.log.push([dstr(0),desc+": "+notiz]);
  if(advanceFallStatus(f)){
    const naechstes=mtFallAufgabeItem(f);
    if(naechstes)_mtSheetKey=naechstes.key;
  }else{
    f.aufgabe="";f.frist="";
  }
}
```
- [ ] Direkt danach (nach `_mtDone.add(key)`) prüfen: `_mtDone.add(key)` markiert weiterhin den **alten** Key als erledigt — das bleibt so (der neue Key aus `mtFallAufgabeItem(f)` ist ein anderer String, taucht als frisches, offenes Item auf, genau das ist gewollt).
- [ ] Bestehende Reihenfolge am Ende (`renderAll();renderMeinTag();mtSheetRender();`) unverändert lassen — `mtSheetRender()` liest jetzt automatisch den neuen `_mtSheetKey` (falls gesetzt) und zeigt direkt die nächste Aufgabe des Falls statt der „✓ Erledigt"-Bestätigung.
- [ ] Standard-Verifikation: einen Fall-Task (z. B. Rückruf, Status „Neu") im Mitarbeiter-Sheet abschließen — direkt im Anschluss muss das Sheet ohne Zwischenschritt die nächste Aufgabe desselben Falls zeigen (z. B. „Bedarf qualifizieren"), inklusive des neuen Mini-Fallakte-Headers aus Task 7.1 mit aktualisiertem Status.

**Sichtprüfung:** Nach Abschluss einer Fall-Aufgabe im Mitarbeiter-Sheet erscheint direkt die nächste Aufgabe **desselben Falls** (erkennbar am unveränderten Namen/Avatar im Header, aber neuem Aufgabentext und aktualisiertem Status) — nicht die nächste beliebige Aufgabe aus der allgemeinen Warteschlange.

**Commit:** `feat: Mitarbeiter-Sheet zeigt nach Abschluss die nächste Aufgabe desselben Falls (Punkt 8, Teil 3)`

---

## Reihenfolge / Abhängigkeiten

```
Phase 1 (Punkt 2 · Aufgaben-Modell) ── FUNDAMENT, zuerst
  1.1 Stepper-CSS (unabhängig, reines CSS)
  1.2 STATUS_AUFGABE + advanceFallStatus()
  1.3 Drawer-Hero (braucht 1.2)
        │
        ├──────────────────────────────┐
        ▼                              ▼
Phase 2 (Punkt 1 · Eingang)     Phase 3 (Punkt 3 · Fallakte)
  2.1 Wer/Woher/Was-Karte         3.1 Dashboard (braucht aufgabenHeroHtml() aus 1.3 zwingend)
  (unabhängig von 1, nutzt          
   nur bereits vorhandenes
   ownerVorschlag())
        │                              │
        └──────────────┬───────────────┘
                        ▼
Phase 4 (Punkt 4 · Zuweiser binär) ── unabhängig von 1-3
  4.1 Vokabular-Entfernung (mechanisch)
  4.2 Ranking+Sparkline+Pflege-Feld (braucht 4.1s entfernte .zstat-Position)
        │
        ▼
Phase 5 (Punkt 5 · Radar löst sich auf) ── nutzt 4.2s zAnlaesse-Position oben in Zuweiser
  5.1 Markup verschieben, Heute-Karte zweiteilen
  5.2 Route-Alias (braucht 5.1s neue Struktur)
        │
        ▼
Phase 6 (Punkt 6+7 · Protokoll-Board) ── unabhängig von 1-5
  6.1 Board bauen
  6.2 Reminder verknüpfen + aufräumen (braucht 6.1s mtpSwitch())
        │
        ▼
Phase 7 (Punkt 8 · Mitarbeiter-Sheet) ── braucht advanceFallStatus() aus 1.2 zwingend (7.3)
  7.1 Mini-Fallakte-Header
  7.2 Leitfaden einklappbar (mechanisch)
  7.3 Nächste-Aufgabe-Kopplung (braucht 1.2)
```

Sequentiell in Phasen-Reihenfolge 1→2→3→4→5→6→7 ausführen (eine Datei, nie parallel) — das entspricht der in der Spec vorgegebenen Ausführungs-Reihenfolge (2, 1, 3, 4, 5, 6+7, 8) und stellt sicher, dass 3.1 und 7.3 ihre harten Abhängigkeiten aus Phase 1 vorfinden.

---

## Nicht-Ziele dieser Runde

- Keine Änderung an `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`-Namespaces oder `openReferrer`/`closeReferrer`/`#refOverlay` — Ausnahme unverändert: `p.kurzbericht` bleibt bewusst gemeinsame Quelle, die `rp`/Zuweiser-Portal liest. `.rs-*`/`.ir-*` (Reha-Steuerung) ist **kein** Cofounder-Namespace und darf als Referenz gelesen werden (s. Task 3.1), `.rsp-*` (Reha-Charts) dagegen schon (s. Task 4.2).
- Datenarrays (`faelle[]`, `eingang[]`, `zuweiser[]`, `inReha[]`, `personen[]`) nur additiv erweitern — vor dem Entfernen eines Felds prüfen, ob andere Stellen es lesen, nicht annehmen.
- Kein neuer Radar-eigener Datentyp und keine neue Detail-Akte für Anlässe — `arCard()`, `anlaesse()`, `AR_TYP`/`AR_FOTO` werden verlagert und wiederverwendet, nicht neu erfunden.
- Keine neuen Keyframes — die bestehenden 9 müssen ausreichen; neue visuelle Zustände (Stepper „zukünftig", Leitfaden-Collapse, Protokolle-Pane-Toggle) sind statische CSS-Regeln bzw. natives `<details>`, keine Animation.
- Keine Änderung an der Matrix-Kachel-Darstellung selbst (Task 5.2s Änderung an Zeile 4170 betrifft nur das Routen-Datenfeld, nicht die `.mx-*`-Präsentation).
- Die Netzwerk-Landkarte (`zmap`/`networkDot()`) bleibt dreifarbig nach `z.status` — bewusster Scope-Cut in Task 4.1, siehe dortige Anmerkung, kein Versehen.
- Keine Erweiterung der `kind==="eingang"`/`"intern"`/`typ==="kosten"`-Zweige in `mtAbschliessen()` um eine Fall-Kopplung — Task 7.3 koppelt ausschließlich den generischen (Status→Aufgabe-)Zweig.
- Jede Änderung bei 390px UND 1440px verifizieren, 0 Console-Errors, reduced-motion-safe, nur synthetische Demo-Daten, `escapeHtml` für dynamische Inhalte.
