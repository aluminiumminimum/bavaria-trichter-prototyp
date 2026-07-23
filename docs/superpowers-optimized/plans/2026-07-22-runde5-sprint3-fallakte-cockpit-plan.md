# Runde 5, Sprint 3 — Fallakte-Cockpit: Implementierungsplan

> **Für ausführende Agenten:** Dieser Plan wird Subagent-Driven umgesetzt — pro Task ein frischer Agent, kein Schreiben durch das orchestrierende Modell selbst. Lane-Tag pro Task beachten. Jeder Task arbeitet ausschließlich in `index.html`; **vor jeder Anker-Zeile den `grep`-Befehl aus dem Task selbst erneut ausführen** — Zeilennummern verschieben sich durch jeden vorherigen Task. Die hier notierten Zeilen sind der Stand bei Plan-Erstellung (23.07.2026, `index.html` 6925 Zeilen, Commit `81fc34b`), nicht garantiert der Stand bei Ausführung.

**Bezug:** Setzt [2026-07-22-runde5-sprint3-fallakte-cockpit-design.md](../specs/2026-07-22-runde5-sprint3-fallakte-cockpit-design.md) um — das Fallakte-Herzstück-Redesign, das Sprint 1+2 ([2026-07-22-runde5-sprint12-design.md](../specs/2026-07-22-runde5-sprint12-design.md)/[-plan.md](./2026-07-22-runde5-sprint12-plan.md)) ausdrücklich ausgeklammert hatte. Format/Konventionen übernommen von diesem Sprint-1+2-Plan.

**Ziel:** `#view-fallakte` wird zum alleinigen Arbeitsort pro Fall — Kopf (Avatar/Pills/Sterne/Saluto/horizontales Prozessband/Hinweis-Zeile), Arbeitszone links (Hero mit editierbaren Feldern, aufgabentyp-abhängige Werkbank, Steuerung, Verlauf+Notiz) und Kontextzone rechts (Werdegang, Übersicht mit zugeklappter Stammdaten-Akte, Medizin, Abrechnung, Dokumente). Die Seitenschublade `#ovDetail` entfällt vollständig; alle 13 bestehenden `openDetail(`-Aufrufstellen bleiben wörtlich unverändert und laufen über einen dünnen Alias in die Akte.

**Architektur:** Alle Änderungen in `index.html` (self-contained, kein Build-Prozess). Sequentielle Ausführung — **nie parallel**, jeder Task fasst dieselbe Datei an. Nach jedem Task: Git-Commit. Die App bleibt nach **jedem einzelnen Task** lauffähig (0 Console-Errors, kein kaputter Zwischenzustand) — siehe Zuschnitts-Begründung unten.

---

## Zuschnitts-Begründung: warum Task B+C atomar sind

Die Spec (§2.2/§4②/§4③) verlangt, dass folgende IDs **wörtlich unverändert** aus `#ovDetail` in `#view-fallakte` umziehen, weil Funktionskörper (`sendReply()`, `kzNotizAdd()`, `updateDocCnt()`, `dArbeitKostenUpload()`, der `dSpeichern`-Handler, die `dStatus`/`dOwner`/`dFrist`-`addEventListener`) sie direkt per `getElementById` referenzieren: `dArbeit`, `dLog`, `dNotiz`, `dAufgabe`, `dFrist`, `dFristWrap`, `dOwner`, `dOwnerAva`, `dAdvance`, `dStatus`, `dKosten`, `dKT`, `dConsent`, `dSaluto`, `dVerlust`, `rowVerlust`, `dSpeichern` (die Sub-IDs `dReply`/`dReplyKanal`/`dNotizSofort`/`u1`–`u4`/`docCnt`/`dKZ` liegen **innerhalb** von `dArbeitHtml(f)`s Ausgabe und werden bei jedem `dArbeit`-Rerender neu erzeugt — unkritisch).

**Per grep verifiziert:** `#view-fallakte` (Zeile 4045) steht im Dokument **vor** `#ovDetail` (Zeile 4137). Würde man die IDs in einem separaten Task additiv in `#view-fallakte` einfügen, ohne im selben Atemzug `#ovDetail` zu entfernen, existierten `dArbeit`/`dStatus`/`dFrist`/… **doppelt im DOM**. `getElementById` liefert dann das **erste** Vorkommen im Dokument — also das neue, noch unfertige `#view-fallakte`-Exemplar — und sämtliche Schreibzugriffe aus der noch aktiven Schublade (`openDetail()`, `dSpeichern`-Handler, `sendReply()`, `toggleVerlust()`, die drei `addEventListener`) würden **am falschen Element** landen. Die Schublade wäre für die Dauer dieses Zwischenzustands funktional kaputt (Speichern schreibt nirgendwo Sichtbares hin, Notiz-Composer reagiert nicht) — das verletzt die Vorgabe „App bleibt nach jedem Task lauffähig".

**Entscheidung:** Task B (Arbeitszone einbauen) und Task C (Routing umstellen, `#ovDetail` entfernen) werden zu **einem** atomaren Task verschmolzen: Die betroffenen Markup-Knoten werden **physisch verschoben** (aus `#ovDetail` ausgeschnitten, in `#view-fallakte` eingefügt) und `#ovDetail` wird **im selben Task** vollständig gelöscht — nie existiert eine doppelte ID. Der Task ist unten sauber in nummerierte Teilschritte (B.1–B.14) gegliedert, damit er trotz seiner Größe nachvollziehbar bleibt. Task A (Kopf-Umbau) und Task D/E/F bleiben wie vom Auftrag vorgegeben eigenständige Tasks, weil sie keine der oben genannten IDs doppelt anlegen (Task A fügt nur neue `.fk-*`-Elemente und Pills additiv in den bereits bestehenden Kopf ein; Task D/E/F wirken auf Bereiche, die zu ihrem jeweiligen Zeitpunkt bereits konfliktfrei sind).

Zusätzlicher, beim Ist-Abgleich gefundener Fund (nicht in der Spec explizit benannt, aber zwingend Teil von Task B+C): Zeile 6276 hängt einen Klick-Listener direkt an `document.getElementById("ovDetail")` — nach Entfernen von `#ovDetail` würde dieser **top-level, beim Skript-Laden ausgeführte** Aufruf einen `TypeError` werfen (`null.addEventListener`) und **die gesamte nachfolgende Skript-Ausführung abbrechen** (App-Boot kaputt). Zeile 6275 (`dAbbruch`-Bindung) hätte dasselbe Problem, sobald `#dAbbruch` nicht mehr existiert. Beide Zeilen müssen im selben Task gelöscht werden — siehe Schritt B.11.

---

## Lanes

- `claude-implementer` (Haiku) — Task D (vorab identifizierte, exakt aufgelistete CSS-Waisen), Task F (Textersetzungen/Konsistenz-Sweep ohne neue Logik).
- `claude-implementer-pro` (Sonnet) — Task A (neue Render-Logik + kritischer State-Fix), Task B+C (größter Task: Markup-Umzug, Routing-Alias, History-Mechanik), Task E (Layout-Finalisierung + eine Verhaltensänderung: Stammdaten-Akte zuklappen), Lebenszyklus-Test (Verifikation, ggf. kleine Fixes).

**Harte Regeln (jeder Task, aus Spec + projektweitem CLAUDE.md):**
- `ma-mode`/`mtSheet` **komplett unangetastet** (keine Zeile in `mtSheetRender()`/`mtAbschliessen()`; `mtCloseOverlays()` nur um den einen Array-Eintrag `"ovDetail"` gekürzt).
- `egDetail`/`dbDetail`/`rsDetail` bleiben unverändert bestehende Overlays.
- Cofounder-Namespaces **nicht anfassen**: `.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`, `openReferrer`/`closeReferrer`/`#refOverlay`.
- Datenarrays nur additiv — diese Runde führt **kein** neues Datenfeld ein (nur Umzug/Verdrahtung bestehender Felder).
- Bei 390px **und** 1440px verifizieren, 0 Console-Errors, reduced-motion-safe.
- **Keine neuen Keyframes** — exakt 9 (verifiziert: `lift` [61], `rpDrawC`/`rpDrawP` [1057]/[1058], `rpRing` [1072], `rpGrow` [1088], `cv-travel` [1376], `auGrow` [2041], `lxSweep` [2050], `lxPulse` [2093]).
- `escapeHtml()` für jeden dynamisch eingefügten Text, insbesondere in `stageBandHtml()`. Kein `Math.random`.
- Neue CSS-Blöcke additiv per **kommentiertem Block direkt vor `</style>`**, neuer Namespace `.fk-*` für alles genuin Neue — bestehende, wiederverwendete Klassen (`.fh-hero`, `.pa-fold`, `.d-acc`, `.kz-*`, `.ah-*`, `.mgrid`) behalten ihre Namen.
- Typografie: Cormorant Garamond für Display/Numerale, Inter für Fließtext.

---

## Standard-Verifikation (nach jedem Task)

1. `grep -c "function "  index.html` vor/nach vergleichen — keine unbeabsichtigt gelöschten Funktionen (außer bei den explizit dokumentierten Entfernungen: `openDetail`s alter Körper in Task B+C, `wiedervorlage` war bereits Sprint 1+2).
2. Browser: Seite neu laden, Console auf 0 Errors prüfen.
3. Betroffene View bei 390px und bei 1440px öffnen, auf Overflow/Lesbarkeit prüfen.
4. Zurück-Button (Browser) für `egDetail`/`dbDetail`/`rsDetail` gegentesten — unverändert funktionsfähig.
5. Cofounder-Bereiche (Zuweiserportal `#refOverlay`, Matrix `.mx-*`, Reha-Charts `.rsp-*` in `openRsDetail()`) unverändert gegentesten.
6. Commit mit klarer Botschaft, welcher Spec-Abschnitt umgesetzt wurde.
7. Jeder Task unten endet mit einer eigenen **Sichtprüfung** — zusätzlich zu 1–6, nicht statt ihnen.

---

# Task A — `aktuellerFall`-Fix + Kopf-Umbau

**Lane:** `claude-implementer-pro` (neue Render-Logik, kritischer State-Fix, neue Komponente `stageBandHtml()`)

**Abhängigkeit:** keine — arbeitet ausschließlich am Kopf von `#view-fallakte`/`renderFallakte()`, die Schublade `#ovDetail` bleibt währenddessen vollständig unverändert bestehen und funktionsfähig (§2.4-Fix betrifft nur `renderFallakte()`s eigene Variable, keine von der Schublade gelesene ID).

**Referenz-Komponenten (erst lesen):** `stepper(schritte)` ([index.html:5763](../../../index.html#L5763)) und `deriveSchritte(f)` ([index.html:6101](../../../index.html#L6101)) als Datenquelle/Semantik-Vorbild (Jade gefüllt = `done`, Gold = `current`, hohl = zukünftig) — `stageBandHtml()` konsumiert dieselbe Quelle, nur horizontal statt vertikal. `.pill-kt`/`.star`-Verwendung in der Board-Karte ([index.html:4912](../../../index.html#L4912)/[4916](../../../index.html#L4916)) als exaktes Muster für die neuen Kopf-Pills.

**Dateien/Anker:** `grep -n "function renderFallakte\|function deriveSchritte\|function aufgabenHeroHtml\|id=\"faHeadMeta\"\|ah-hinweis" index.html` vor Bearbeitung ausführen und alle Zeilenangaben neu bestätigen. Bei Plan-Erstellung: `renderFallakte()` bei [index.html:6818](../../../index.html#L6818), `#view-fallakte`-Header bei [index.html:4045-4052](../../../index.html#L4045), `aufgabenHeroHtml(f)` bei [index.html:6108](../../../index.html#L6108) (mit `.ah-hinweis`-Zeile am Ende), CSS-Regel `.ah-hinweis,.mt-shinweis{...}` bei [index.html:3108-3109](../../../index.html#L3108).

**Ist (verifiziert):**
```js
function renderFallakte(){
  if(!_fallakteId){go('faelle','board');return;}
  const f=faelle.find(x=>x.id===_fallakteId);
  if(!f){go('faelle','board');return;}
  document.getElementById("faName").textContent=f.name+(f.alter?" ("+f.alter+")":"");
  ...
  document.getElementById("faHeadMeta").innerHTML="<span class='pill-a' style='background:"+(ACHSE_COL[f.achse]||"var(--unklar)")+"'>"+escapeHtml(f.achse)+"</span>"+sterneHtml(sterneVon({personId:f.personId}));
```
`aktuellerFall` wird **nirgends** in `renderFallakte()`/`openFallakte()` gesetzt (kritischer Fund §2.4 der Spec) — bislang unschädlich, weil `openFallakte()` bisher ausschließlich aus der bereits offenen Schublade heraus aufgerufen wird (dort ist `aktuellerFall` durch `openDetail()` schon korrekt gesetzt). Sobald Task B+C alle 13 Aufrufstellen ohne vorherigen `openDetail()`-Aufruf direkt in die Akte leitet, bricht die gesamte Arbeitszone ohne diesen Fix.

`aufgabenHeroHtml(f)` endet mit `+(f.zuordnungsHinweis?"<div class='ah-hinweis'>...":"")`; diese Funktion wird bereits heute auch von `faNaechste` in der Fallakte aufgerufen — nach diesem Task würde derselbe Hinweis **zweimal** auf derselben Seite erscheinen (einmal neu im Kopf, einmal weiterhin im Hero), wenn die Zeile nicht im selben Task entfernt wird.

**Schritte:**

- [ ] **A.1** `grep`-Befehl oben ausführen, alle vier Fundstellen neu bestätigen.
- [ ] **A.2** — `renderFallakte()`: `aktuellerFall=f;` als erste Zeile nach den beiden Fallback-Checks einfügen (§2.4-Fix):
```js
// Ist:
function renderFallakte(){
  if(!_fallakteId){go('faelle','board');return;}
  const f=faelle.find(x=>x.id===_fallakteId);
  if(!f){go('faelle','board');return;}
  document.getElementById("faName").textContent=...
// Soll:
function renderFallakte(){
  if(!_fallakteId){go('faelle','board');return;}
  const f=faelle.find(x=>x.id===_fallakteId);
  if(!f){go('faelle','board');return;}
  aktuellerFall=f;
  document.getElementById("faName").textContent=...
```
- [ ] **A.3** — `#view-fallakte`-Header: zwei neue leere Ziel-Divs zwischen `faHeadMeta` und dem Zurück-Button einfügen:
```html
<!-- Ist: -->
      <div class="pa-head" id="faHeadMeta"></div>
      <button class="btn-ghost btn-sm" type="button" onclick="go('faelle','board')">‹ Zurück zum Board</button>
<!-- Soll: -->
      <div class="pa-head" id="faHeadMeta"></div>
      <div id="faStage"></div>
      <div id="faHinweis"></div>
      <button class="btn-ghost btn-sm" type="button" onclick="go('faelle','board')">‹ Zurück zum Board</button>
```
- [ ] **A.4** — neue Funktion `stageBandHtml(f)` einfügen, direkt vor `function renderFallakte(){`:
```js
/* Task A (Runde 5 Sprint 3, §3): Kopf-Prozessband — horizontale Variante von stepper()/deriveSchritte(f),
   keine neue Datenquelle, nur andere Darstellung derselben 6 Werdegang-Stufen. Identische Semantik zum
   vertikalen .stepper in der Kontext-Zone: Jade gefüllt = done, Gold = current, hohl = zukünftig. */
function stageBandHtml(f){
 const schritte=f.schritte||deriveSchritte(f);
 return "<div class='fk-stageband'>"+schritte.map(function(s,i){
   const cls=s.done?"done":(s.current?"current":"");
   return (i>0?"<span class='fk-stage-sep'></span>":"")
    +"<span class='fk-stage "+cls+"'><span class='fk-stage-dot'></span><span class='fk-stage-label'>"+escapeHtml(s.label)+"</span></span>";
 }).join("")+"</div>";
}
```
- [ ] **A.5** — `renderFallakte()`s `faHeadMeta`-Zeile erweitern (KT-Pill + SalutoCare-Stern additiv) und zwei neue Zeilen für `faStage`/`faHinweis` ergänzen:
```js
// Ist:
  document.getElementById("faHeadMeta").innerHTML="<span class='pill-a' style='background:"+(ACHSE_COL[f.achse]||"var(--unklar)")+"'>"+escapeHtml(f.achse)+"</span>"+sterneHtml(sterneVon({personId:f.personId}));
  document.getElementById("faKacheln").innerHTML=
// Soll:
  document.getElementById("faHeadMeta").innerHTML="<span class='pill-a' style='background:"+(ACHSE_COL[f.achse]||"var(--unklar)")+"'>"+escapeHtml(f.achse)+"</span>"
    +"<span class='pill-kt'>"+escapeHtml(f.kt)+"</span>"
    +sterneHtml(sterneVon({personId:f.personId}))
    +(f.saluto?"<span class='star'>★ SalutoCare</span>":"");
  document.getElementById("faStage").innerHTML=stageBandHtml(f);
  document.getElementById("faHinweis").innerHTML=f.zuordnungsHinweis?("<div class='fk-hinweis'><span class='kicker'>Hinweis</span> "+escapeHtml(f.zuordnungsHinweis)+"</div>"):"";
  document.getElementById("faKacheln").innerHTML=
```
  (`faKacheln` bleibt in diesem Task unverändert bestehen — Task E ersetzt/entfernt die Kachel-Reihe im Zuge der 2-Zonen-Layout-Finalisierung, nicht Teil von Task A.)
- [ ] **A.6** — `aufgabenHeroHtml(f)`: die jetzt im Kopf gedoppelte `.ah-hinweis`-Zeile entfernen (einzige verbleibende Konsumentin dieser Funktion nach Task B+C ist Arbeit① der Akte selbst — der Kopf zeigt den Hinweis jetzt exklusiv):
```js
// Ist:
function aufgabenHeroHtml(f){
 const fk=fristKlasse(f.frist), ft=f.frist?fristText(f.frist):"—";
 return "<div class='ah-typ'>"+aufgabeIcon(f.aufgabe)+"<b>"+escapeHtml(f.aufgabe||"Keine offene Aufgabe")+"</b></div>"
  +"<div class='ah-meta'>"
  +"<span class='ah-owner'><span class='ava'>"+initialen(f.owner)+"</span>"+escapeHtml(f.owner)+"</span>"
  +(f.frist?"<span class='due "+fk+"'>Frist "+escapeHtml(ft)+"</span>":"")
  +"</div>"
  +(f.zuordnungsHinweis?"<div class='ah-hinweis'><span class='kicker'>Hinweis</span> "+escapeHtml(f.zuordnungsHinweis)+"</div>":"");
}
// Soll:
function aufgabenHeroHtml(f){
 const fk=fristKlasse(f.frist), ft=f.frist?fristText(f.frist):"—";
 return "<div class='ah-typ'>"+aufgabeIcon(f.aufgabe)+"<b>"+escapeHtml(f.aufgabe||"Keine offene Aufgabe")+"</b></div>"
  +"<div class='ah-meta'>"
  +"<span class='ah-owner'><span class='ava'>"+initialen(f.owner)+"</span>"+escapeHtml(f.owner)+"</span>"
  +(f.frist?"<span class='due "+fk+"'>Frist "+escapeHtml(ft)+"</span>":"")
  +"</div>";
}
```
  **Wichtiger Nebeneffekt, bewusst in Kauf genommen:** `aufgabenHeroHtml()` wird bis Task B+C noch von der weiterhin offenen Schublade (`dAufgabeView`) mitgenutzt — für die kurze Lebensdauer dieses Zwischenzustands (bis zum nächsten Task) zeigt die alte Schublade den Bearbeitungs-Hinweis **nirgends** mehr an (er ist weder im schmalen Schublade-Header noch mehr im Hero sichtbar). Das ist kein Datenverlust (`f.zuordnungsHinweis` bleibt unverändert im Fall-Objekt), nur eine temporäre, auf einen Task begrenzte kosmetische Lücke in einem Bauteil, das im unmittelbar nächsten Task ohnehin komplett entfällt — der Alternative (Dopplung auf der bereits produktiven Fallakte-Seite) wird hier bewusst der Vorzug gegeben.
- [ ] **A.7** — CSS: `.ah-hinweis,.mt-shinweis{...}`-Regel trimmen (analog zum Muster der Spec §2.6 für gruppierte Selektoren — `.ah-hinweis` wird durch A.6 zur reinen Waise, `.mt-shinweis` bleibt in `mtSheetRender()` genutzt):
```css
/* Ist: */
.ah-hinweis,.mt-shinweis{margin-top:8px;font-size:12.5px;color:var(--ink-soft)}
.ah-hinweis .kicker,.mt-shinweis .kicker{display:inline;margin:0 6px 0 0;font-size:10.5px}
/* Soll: */
.mt-shinweis{margin-top:8px;font-size:12.5px;color:var(--ink-soft)}
.mt-shinweis .kicker{display:inline;margin:0 6px 0 0;font-size:10.5px}
```
- [ ] **A.8** — CSS, neuer Block vor `</style>`:
```css
/* Task A (Runde 5 Sprint 3, §3): .fk-stageband — horizontales Prozessband im Fallakte-Kopf +
   .fk-hinweis — goldene Zuordnungs-Hinweis-Zeile, nur hier, nicht mehr zusätzlich in aufgabenHeroHtml(). */
.fk-stageband{display:flex;align-items:center;flex-wrap:wrap;gap:0;margin:10px 0 2px}
.fk-stage{display:inline-flex;align-items:center;gap:6px;font:600 11px/1 Inter;letter-spacing:.01em;color:var(--muted);white-space:nowrap}
.fk-stage-dot{width:9px;height:9px;border-radius:50%;border:2px solid var(--brass);background:transparent;flex-shrink:0}
.fk-stage.done .fk-stage-dot{background:var(--sage);border-color:var(--sage)}
.fk-stage.current .fk-stage-dot{background:var(--brass);border-color:var(--brass);box-shadow:0 0 0 3px rgba(185,145,73,.25)}
.fk-stage.current .fk-stage-label{color:var(--brass-deep);font-weight:700}
.fk-stage.done .fk-stage-label{color:var(--ink-soft)}
.fk-stage-sep{width:16px;height:2px;background:var(--brass-line);margin:0 6px;flex-shrink:0}
.fk-hinweis{margin-top:8px;display:inline-block;font-size:12.5px;color:var(--brass-deep);
  background:var(--brass-soft);border:1px solid var(--brass-line);border-radius:8px;padding:6px 10px}
.fk-hinweis .kicker{display:inline;margin:0 6px 0 0;font-size:10.5px}
@media(max-width:479px){
  .fk-stage-label{display:none}
  .fk-stage-sep{width:10px;margin:0 3px}
}
```
  (Unter 480px werden die Stufen-Labels ausgeblendet, nur die farbcodierte Punkt-Kette bleibt — verhindert Umbruch-Chaos bei sechs Labels auf 390px, ohne den Farbcode-Informationsgehalt zu verlieren.)
- [ ] **A.9** Standard-Verifikation bei 390px UND 1440px: Fallakte für einen Fall mit **und** ohne `zuordnungsHinweis` öffnen (z. B. einen frisch aus `uebernehmen()` angelegten Fall mit Hinweis vs. einen Bestandsfall ohne), Konsole prüfen, `aktuellerFall.id` in der Konsole gegen `_fallakteId` abgleichen.

**Sichtprüfung:** Der Fallakte-Kopf zeigt zusätzlich zu Avatar/Name/Achse/Sternen jetzt eine Kostenträger-Pille, bei `f.saluto` einen „★ SalutoCare"-Stern, darunter ein kompaktes horizontales Prozessband mit sechs farbcodierten Stufen (Jade=erledigt, Gold=aktuell, hohl=offen) und — nur falls `f.zuordnungsHinweis` gesetzt ist — eine goldene Hinweis-Zeile; dieser Hinweis erscheint **nirgends doppelt** auf der Seite. Die alte Schublade (`#ovDetail`) öffnet weiterhin unverändert über die bestehenden 13 Aufrufstellen (noch nicht Teil dieses Tasks).

**Commit:** `feat: Fallakte-Kopf — KT-Pille, SalutoCare-Stern, horizontales Prozessband (stageBandHtml), Zuordnungs-Hinweis; aktuellerFall-Fix in renderFallakte() (Runde 5 Sprint 3, §2.4+§3)`

---

# Task B+C — Arbeitszone einbauen + Routing umstellen + Schublade entfernen (atomar)

**Lane:** `claude-implementer-pro` (größter Task: Markup-Umzug mit ID-Kollisionsrisiko, Alias-Routing, History-Mechanik-Anpassung)

**Abhängigkeit:** braucht Task A (nutzt `aktuellerFall`-Fix zwar nicht direkt, aber baut auf dem bereits umgebauten Kopf auf; `aufgabenHeroHtml()` ist bereits dedupliziert).

**Warum atomar:** siehe „Zuschnitts-Begründung" oben — jede der wandernden IDs darf im gesamten Task-Verlauf nie doppelt im DOM stehen.

**Referenz-Komponenten (erst lesen):** die komplette `#ovDetail`-Definition (wird in B.1 neu gelesen) — sie ist die **einzige** Quelle für alle im Folgenden zitierten Felder, nichts wird neu erfunden, nur verschoben.

**Dateien/Anker:** `grep -n "id=\"ovDetail\"\|function openDetail\|function closeDetail\|dAbbruch\|_DETAIL_IDS\|function mtCloseOverlays\|function kzAnfragen\|function kzZusage\|function kzAblehnung\|function advanceFall\|dSpeichern\").onclick\|id=\"faNaechste\"\|id=\"faKacheln\"" index.html` vor Bearbeitung ausführen und **alle** Zeilenangaben neu bestätigen. Bei Plan-Erstellung (nach Task A, Zeilen verschieben sich um die in A hinzugefügten ~20 Zeilen):
- `#ovDetail`-Block: [index.html:4137-4185](../../../index.html#L4137) (vor Task A; nach Task A entsprechend verschoben)
- `openDetail(id)`: [index.html:6229-6260](../../../index.html#L6229)
- `closeDetail()`: [index.html:6262](../../../index.html#L6262) (bleibt unangetastet, vorbestehender Dead Code, s. u.)
- `dStatus`/`dOwner`/`dFrist`-`addEventListener` + `dAbbruch`-Bindung + `ovDetail`-Klick-Listener + `dSpeichern`-Handler: [index.html:6272-6299](../../../index.html#L6272)
- `_DETAIL_IDS`: [index.html:6864](../../../index.html#L6864)
- `mtCloseOverlays()`: [index.html:6731-6736](../../../index.html#L6731)
- `kzAnfragen`/`kzZusage`/`kzAblehnung`: [index.html:6187-6204](../../../index.html#L6187)
- `advanceFall()`: [index.html:6225-6228](../../../index.html#L6225)
- `#view-fallakte`s `faNaechste`/`faKacheln` (nach Task A): direkt nach dem in Task A geänderten Header.
- Kommentar mit veralteter „neben der Schublade (#ovDetail)"-Formulierung: [index.html:6814](../../../index.html#L6814).

**Ist (verifiziert, vollständiger `#ovDetail`-Body):**
```html
<div class="overlay" id="ovDetail" role="dialog" aria-modal="true" aria-label="Fall-Detail">
  <div class="modal">
    <div class="mhead">
      <div class="ava" id="dAva"></div>
      <div><h2 id="dName"></h2><div class="msub2" id="dSub"></div></div>
    </div>
    <div class="mbody two-track">
      <div class="fh-hero">
        <label for="dAufgabe" class="kicker">Nächste Aufgabe</label>
        <div id="dAufgabeView"></div>
        <input id="dAufgabe" type="hidden">
        <div class="fh-meta">
          <div><label for="dFrist">Frist</label><span class="due" id="dFristWrap"><input id="dFrist" type="date"></span></div>
          <div><label for="dOwner">Verantwortlich</label><span class="fh-owner-chip"><span class="ava" id="dOwnerAva"></span><select id="dOwner">...</select></span></div>
        </div>
        <div class="fh-actions">
          <button id="dAdvance" class="btn-brass btn-sm" style="width:100%;margin-bottom:12px" onclick="advanceFall()">Aktuelle Aufgabe erledigt → nächster Schritt ›</button>
          <button class="btn-ghost btn-sm" style="width:100%" type="button" onclick="openFallakte(aktuellerFall.id)">Vollständige Fallakte öffnen →</button>
        </div>
      </div>
      <div id="dArbeit"></div>
      <div class="d-track-wrap">
        <div id="dWerdegang" class="d-track"></div>
        <div id="dAkte"></div>
      </div>
      <div class="mgrid">
        <details class="d-acc full">
          <summary>Details &amp; Unterlagen</summary>
          <div class="d-acc-body">... dStatus/dKosten/dKT/dConsent/dSaluto/dVerlust/rowVerlust ...</div>
        </details>
        <div class="full"><label>Verlauf</label><div class="timeline" id="dLog"></div></div>
        <div class="full"><label for="dNotiz">Neue Notiz</label><input id="dNotiz" placeholder="..."></div>
      </div>
    </div>
    <div class="mfoot">
      <button class="btn-ghost" id="dAbbruch">‹ Zurück</button>
      <button class="btn-brass" id="dSpeichern">Speichern</button>
    </div>
  </div>
</div>
```
`dWerdegang`/`dAkte` (samt `.d-track-wrap`) sind **reine Duplikate** von Inhalten, die in der Fallakte bereits unter anderen IDs existieren (`faWerdegang`/`faUebersicht`) — sie werden **nicht** migriert, sondern ersatzlos gelöscht (per grep verifiziert: `dWerdegang`/`dAkte` werden ausschließlich innerhalb des zu löschenden `openDetail()`-Körpers und ihrer eigenen, zu löschenden Markup-Zeile referenziert, kein dritter Ort im Code).

**Schritte:**

- [ ] **B.1** Alle `grep`-Befehle oben ausführen, den kompletten `#ovDetail`-Body sowie alle gelisteten Funktionen neu lesen und Zeilenangaben aktualisieren.

- [ ] **B.2 — `#view-fallakte`: `faNaechste` zu statischem Container mit editierbaren Feldern umbauen.** `faNaechste` wird von „bei jedem Render komplett per `innerHTML` ersetzt" zu „statischer Rahmen mit einem dynamischen Unter-Div (`faAufgabeView`) plus den aus `#ovDetail` umziehenden statischen Steuerelementen":
```html
<!-- Ist: -->
    <div class="fa-kacheln" id="faKacheln"></div>
    <div class="fh-hero" id="faNaechste"></div>
    <div class="fa-cols">
<!-- Soll: -->
    <div class="fa-kacheln" id="faKacheln"></div>
    <div class="fh-hero" id="faNaechste">
      <div class="kicker">Nächste Aufgabe</div>
      <div id="faAufgabeView"></div>
      <input id="dAufgabe" type="hidden">
      <div class="fh-meta">
        <div><label for="dFrist">Frist</label><span class="due" id="dFristWrap"><input id="dFrist" type="date"></span></div>
        <div><label for="dOwner">Verantwortlich</label><span class="fh-owner-chip"><span class="ava" id="dOwnerAva"></span><select id="dOwner"><option>S. Koordination</option><option>M. Belegung</option><option>T. Abrechnung</option><option>Recovery Manager</option></select></span></div>
      </div>
      <div class="fh-actions">
        <button id="dAdvance" class="btn-brass btn-sm" style="width:100%" onclick="advanceFall()">Aktuelle Aufgabe erledigt → nächster Schritt ›</button>
      </div>
    </div>
    <div id="dArbeit"></div>
    <div class="chap">
      <h2 class="chap-h2">Steuerung</h2>
      <div class="mgrid">
        <details class="d-acc full">
          <summary>Details &amp; Status</summary>
          <div class="d-acc-body">
            <div><label for="dStatus">Status</label><select id="dStatus"></select></div>
            <div><label for="dKosten">Kostenstatus</label><select id="dKosten"><option>offen</option><option>angefragt</option><option>Zusage liegt vor</option><option>Selbstzahler bestätigt</option><option>abgelehnt</option></select></div>
            <div><label for="dKT">Kostenträger</label><select id="dKT"><option>PKV</option><option>Selbstzahler</option><option>GKV + Komfort</option><option>Beihilfe</option><option>GKV</option></select></div>
            <div><label for="dConsent">Einwilligung</label><select id="dConsent"><option>offen</option><option>mündlich erteilt</option><option>schriftlich liegt vor</option></select></div>
            <div class="full"><div class="saluto-toggle"><input type="checkbox" id="dSaluto"><span>★ Für <b>SalutoCare</b> geeignet · Premium-Option aktiv anbieten</span></div></div>
            <div class="full verlustrow" id="rowVerlust"><label for="dVerlust">Verlustgrund (Pflicht bei „Verloren&#8220;)</label>
              <select id="dVerlust"><option></option><option>Kosten nicht geklärt</option><option>Zu lange Wartezeit</option><option>Anderes Haus gewählt</option><option>Medizinisch nicht passend</option><option>Keine Rückmeldung mehr</option><option>Kapazität fehlte</option><option>Sonstiges</option></select>
            </div>
          </div>
        </details>
        <div class="full"><label>Verlauf</label><div class="timeline" id="dLog"></div></div>
        <div class="full"><label for="dNotiz">Neue Notiz</label><input id="dNotiz" placeholder="z. B. Rückruf erledigt, Unterlagen angefordert"></div>
        <div class="full"><button class="btn-brass" id="dSpeichern" style="width:100%">Speichern</button></div>
      </div>
    </div>
    <div class="fa-cols">
```
  (`&#8220;` bei „Verloren" wörtlich aus dem Original übernommen — vorbestehende Typo/Entity-Eigenheit, nicht Teil dieses Tasks, nicht korrigieren. Layout bleibt bewusst in der bestehenden `.fa-kacheln`/`.fa-cols`-Reihenfolge — die endgültige `.fk-cols`-Zwei-Zonen-Anordnung mit Kacheln-Entfernung ist Task E vorbehalten, s. dort.)

- [ ] **B.3 — `renderFallakte()`: die alte `faNaechste`-Komplettersetzung durch die neuen Einzel-Zielzuweisungen ersetzen** (Hero-Text, editierbare Felder, Werkbank, Steuerung, Verlauf, Notiz-Reset):
```js
// Ist:
  document.getElementById("faNaechste").innerHTML="<div class='kicker'>Nächste Aufgabe</div>"+aufgabenHeroHtml(f);
// Soll:
  document.getElementById("faAufgabeView").innerHTML=aufgabenHeroHtml(f);
  document.getElementById("dAufgabe").value=f.aufgabe||"";
  document.getElementById("dFrist").value=f.frist||"";
  document.getElementById("dFristWrap").className="due "+(f.frist?fristKlasse(f.frist):"");
  document.getElementById("dOwner").value=f.owner;
  document.getElementById("dOwnerAva").textContent=initialen(f.owner);
  document.getElementById("dAdvance").style.display=["Aufgenommen","Verloren"].includes(f.status)?"none":"";
  document.getElementById("dArbeit").innerHTML=dArbeitHtml(f);
  updateDocCnt();
  document.getElementById("dStatus").innerHTML=STATUS.map(s=>"<option"+(s===f.status?" selected":"")+">"+s+"</option>").join("");
  document.getElementById("dKosten").value=f.kosten;
  document.getElementById("dKT").value=f.kt;
  document.getElementById("dConsent").value=f.consent;
  document.getElementById("dSaluto").checked=f.saluto;
  document.getElementById("dVerlust").value=f.verlust||"";
  toggleVerlust();
  document.getElementById("dNotiz").value="";
  document.getElementById("dLog").innerHTML=f.log.map(function(l){var out=/^↦/.test(l[1]);return "<div class='"+(out?"log-out":"log-in")+"'><b>"+escapeHtml(l[0])+"</b><br>"+escapeHtml(l[1])+"</div>";}).join("");
```
  (Identische Map-Funktion für `dLog` wie bereits an zwei weiteren Stellen im Code (`openDetail()`s Rest wird gleich gelöscht, `kzNotizAdd()` behält ihre eigene Kopie) — bewusst weiterhin dupliziert, keine Refaktorierung dieser Runde, s. Spec-Nicht-Ziele.)

- [ ] **B.4 — `openDetail(id)` durch den Alias ersetzen** (kompletter Funktionskörper entfällt, inkl. `_closeSiblingDetailRails("ovDetail")`, das damit automatisch mitentfällt):
```js
// Ist (kompletter Funktionskörper, Zeilen 6229-6260 vor diesem Task):
function openDetail(id){
  aktuellerFall=faelle.find(x=>x.id===id);const f=aktuellerFall;if(!f)return;
  document.getElementById("dAva").textContent=initialen(f.name);
  ... (32 Zeilen) ...
  pushDetailState();
}
// Soll:
function openDetail(id){openFallakte(id);}
```

- [ ] **B.5 — `closeDetail()` unangetastet lassen.** Bereits vor diesem Task toter Code (kein Aufrufer, per grep verifiziert), referenziert nach diesem Task ein nicht mehr existierendes `#ovDetail` — bleibt laut Surgical-Changes-Regel unangetastet (vorbestehender Dead Code, nicht durch diese Runde neu verwaist, nur seine bereits vorher fehlende Wirkung wird jetzt zusätzlich fehlerhaft *falls* sie je aufgerufen würde; da sie nie aufgerufen wird, kein Laufzeit-Risiko). Im Abschlussbericht als Beobachtung vermerken, nicht selbst entfernen.

- [ ] **B.6 — `dSpeichern`-Handler: letzte beiden Zeilen umstellen** (Re-Render statt Schließen):
```js
// Ist (Ende des Handlers):
  if(n){f.log.push([dstr(0),n]);pruefeUpsell(f,n);}
  renderAll();
  dismissDetail();
  if(ns==="Aufnahme geplant"&&alt!=="Aufnahme geplant")celebratePlanned();
};
// Soll:
  if(n){f.log.push([dstr(0),n]);pruefeUpsell(f,n);}
  renderAll();
  renderFallakte();
  if(ns==="Aufnahme geplant"&&alt!=="Aufnahme geplant")celebratePlanned();
};
```
  (Alles davor im Handler — Statuswechsel-Log, `qualifyIfNeeded`, alle Feld-Zuweisungen, der `alert()`-Pflichtfeld-Check bei „Verloren" — bleibt wörtlich unverändert; die IDs, die er liest, existieren jetzt in `#view-fallakte` statt in `#ovDetail`, das ist für den Handler-Code selbst unsichtbar.)

- [ ] **B.7 — `kzAnfragen()`/`kzZusage()`/`kzAblehnung()`: Re-Render-Zeile umstellen** (3 Stellen):
```js
// Ist (je Funktion identisch):
 renderAll();openDetail(f.id);
// Soll (je Funktion):
 renderAll();renderFallakte();
```

- [ ] **B.8 — `advanceFall()`: Re-Render-Zeile umstellen:**
```js
// Ist:
function advanceFall(){ const f=aktuellerFall;if(!f)return;
 advanceFallStatus(f);
 renderAll(); openDetail(f.id);
}
// Soll:
function advanceFall(){ const f=aktuellerFall;if(!f)return;
 advanceFallStatus(f);
 renderAll(); renderFallakte();
}
```

- [ ] **B.9 — `_DETAIL_IDS`: `"ovDetail"` entfernen:**
```js
// Ist:
const _DETAIL_IDS=["ovDetail","dbDetail","rsDetail","egDetail"];
// Soll:
const _DETAIL_IDS=["dbDetail","rsDetail","egDetail"];
```

- [ ] **B.10 — `mtCloseOverlays()`: `"ovDetail"` aus dem Array entfernen:**
```js
// Ist:
function mtCloseOverlays(){
 ["refOverlay","ovDetail","dbDetail","rsDetail","sheetNeu","kpSheet","rpDocView","egDetail"].forEach(function(id){
// Soll:
function mtCloseOverlays(){
 ["refOverlay","dbDetail","rsDetail","sheetNeu","kpSheet","rpDocView","egDetail"].forEach(function(id){
```

- [ ] **B.11 — kritischer Boot-Fix: die beiden top-level-Bindungen an `#dAbbruch`/`#ovDetail` löschen**, bevor `#ovDetail` selbst gelöscht wird (sonst `TypeError` beim Skript-Laden, App-Boot bricht komplett ab):
```js
// Ist (direkt vor dem dSpeichern-Handler):
document.getElementById("dStatus").addEventListener("change",toggleVerlust);
document.getElementById("dOwner").addEventListener("change",function(){document.getElementById("dOwnerAva").textContent=initialen(this.value);});
document.getElementById("dFrist").addEventListener("change",function(){document.getElementById("dFristWrap").className="due "+(this.value?fristKlasse(this.value):"");});
document.getElementById("dAbbruch").onclick=dismissDetail;
document.getElementById("ovDetail").addEventListener("click",e=>{if(e.target===document.getElementById("ovDetail"))dismissDetail();});
document.getElementById("dSpeichern").onclick=()=>{
// Soll:
document.getElementById("dStatus").addEventListener("change",toggleVerlust);
document.getElementById("dOwner").addEventListener("change",function(){document.getElementById("dOwnerAva").textContent=initialen(this.value);});
document.getElementById("dFrist").addEventListener("change",function(){document.getElementById("dFristWrap").className="due "+(this.value?fristKlasse(this.value):"");});
document.getElementById("dSpeichern").onclick=()=>{
```
  (Die drei `addEventListener`-Zeilen bleiben unverändert — `dStatus`/`dOwner`/`dFrist` existieren als dieselben, physisch verschobenen DOM-Knoten weiter, die Bindung bleibt gültig, ohne dass diese Zeilen selbst geändert werden müssen.)

- [ ] **B.12 — `#ovDetail`-Markup vollständig löschen** (der gesamte `<div class="overlay" id="ovDetail">…</div>`-Block, inkl. `.mhead`, `.d-track-wrap`/`dWerdegang`/`dAkte`, `.mfoot`/`dAbbruch`, dem „Vollständige Fallakte öffnen"-Button — alle darin enthaltenen, in B.2 bereits nach `#view-fallakte` verschobenen Felder werden **hier nicht noch einmal gelöscht dupliziert**, sie sind ja durch B.2 bereits am neuen Ort; dieser Schritt entfernt nur noch die alte Hülle):
```html
<!-- kompletter Block, siehe "Ist" oben im Task-Kopf, wird ersatzlos entfernt -->
<div class="overlay" id="ovDetail" role="dialog" aria-modal="true" aria-label="Fall-Detail">
  ...
</div>
```

- [ ] **B.13 — Kommentar an `_DETAIL_IDS` aktualisieren** (wird durch B.9/B.12 sachlich falsch, da er die jetzt gelöschte Schublade als Vergleichspunkt nennt):
```js
// Ist:
/* §3.4 Hybrid-Fallakte — Bereich C: eigene Top-Level-Route neben der Schublade (#ovDetail). */
// Soll:
/* §3.4 Hybrid-Fallakte — Bereich C: eigene Top-Level-Route, Schublade (#ovDetail) mit Runde 5 Sprint 3 entfernt. */
```

- [ ] **B.14** — `grep -n "id=\"ovDetail\"\|getElementById(\"ovDetail\")\|\"dAbbruch\"" index.html` erneut ausführen — **kein** Treffer mehr außer ggf. dem historischen Analogie-Kommentar bei `#egDetail`s Definition (`Struktur/Docking wie #ovDetail`, [index.html:3071](../../../index.html#L3071) vor diesem Task) — dieser bleibt unangetastet (beschreibt `egDetail`s Design-Herkunft, `egDetail` selbst ist Nicht-Ziel dieser Runde). `grep -c "function "  index.html` vor/nach vergleichen — genau **eine** Funktion weniger (`openDetail`s alter Körper wurde durch eine 1-Zeilen-Definition ersetzt, zählt weiterhin als `function`, also **keine** Netto-Änderung der Funktionsanzahl — nur zur Kontrolle, dass nichts *zusätzlich* verschwunden ist).
- [ ] **B.15** Standard-Verifikation bei 390px UND 1440px, **ausführlich** (dieser Task ist der riskanteste): Board-Karte klicken → landet direkt in der Fallakte (nicht mehr in einer Schublade); Frist ändern + Speichern → Wert bleibt nach Re-Render erhalten; Status auf „Verloren" ohne Verlustgrund + Speichern → `alert()` erscheint wie bisher; „Aktuelle Aufgabe erledigt" klicken → Status springt eine Stufe, Kopf-Prozessband (Task A) aktualisiert sich sofort; bei einer Aufgabe mit Kostenbezug „Kostenzusage anfragen"/„Zusage erfassen"/„Ablehnung erfassen" klicken → Kette aktualisiert sich ohne Navigations-Sprung; Notiz über „Neue Notiz"+Speichern **und** über die aufgabentyp-abhängige Sofort-Notiz (`dNotizSofort`/„Ins Protokoll") eintragen → beide landen im Verlauf; `antwortenEingang()` über den Eingang auslösen → Fokus springt nach 80ms korrekt in `#dReply` (jetzt Teil von `#dArbeit` in der Akte). Browser-Zurück-Button aus der Fallakte → normale `go()`-Navigation, kein Overlay-Rest. `egDetail`/`dbDetail`/`rsDetail` unverändert per Zurück-Button/Klick gegentesten.

**Sichtprüfung:** Kein `#ovDetail` mehr im DOM (`document.getElementById("ovDetail")` liefert `null`); jeder der 13 bestehenden `openDetail(`-Aufrufrufe (Board-Karte, Eingang-Übernahme/Antworten/Toast, Team-Aufgabe, Heute-Wichtig×3, Kostenzusage×3, Aufgabe-erledigt) landet direkt und ohne Zwischenschritt in der Fallakte, komplett mit funktionierender Werkbank/Steuerung/Verlauf; 0 Console-Errors beim Boot und bei jeder dieser Aktionen.

**Commit:** `refactor: Fallakte-Cockpit — Schublade (#ovDetail) entfernt, Arbeitszone (Hero-Editierfelder, Werkbank, Steuerung, Verlauf+Notiz) 1:1 in #view-fallakte umgezogen, openDetail() zu openFallakte()-Alias (Runde 5 Sprint 3, §2.2/§4/§6)`

---

# Task D — CSS-Waisen entfernen

**Lane:** `claude-implementer` (rein mechanisch, exakte, vorab verifizierte Liste — keine Verzweigungslogik, keine neue Entscheidung)

**Abhängigkeit:** braucht Task B+C (Schublade muss entfernt sein, sonst sind diese Regeln noch nicht verwaist).

**Dateien/Anker:** `grep -n "#ovDetail" index.html` vor Bearbeitung ausführen — nach Task B+C sollte dies **ausschließlich** noch CSS-Selektoren liefern (keine HTML/JS-Treffer mehr, die wurden in B+C entfernt). Bei Plan-Erstellung (vor Task A/B+C, Zeilen verschieben sich): 784–790, 1884, 1886, 1888–1889, 2216, 2219, 2462, 2465, 2490–2493, 2496, 2498–2499, 2508 (siehe Spec §2.6 für die vollständige Herleitung).

**Ist (verifiziert, exakte Liste — 8 Waisen-Blöcke zu löschen, 1 Regel zu migrieren, 4 gruppierte Selektoren zu kürzen):**

- [ ] **D.1** `grep -n "#ovDetail" index.html` ausführen, jede der folgenden 17 Fundstellen einzeln gegen die untenstehende Kategorisierung abgleichen (falls sich die Zeilenzahl seit Plan-Erstellung geändert hat, per Fundstellen-Text statt Zeilennummer identifizieren).

- [ ] **D.2 — Löschen (Waise, ganze Regel), Block 1** — innerhalb des `@media(min-width:1024px){...}`-Blocks „DESKTOP TASK 2" (die drei nicht-`#ovDetail`-Zeilen `.app{transition...}`/`body.detail-open .app{...}`/`body.detail-open .dtopbar{...}` **bleiben**, sie werden weiterhin von `dbDetail`/`rsDetail`/`egDetail`s `detail-open`-Klasse gebraucht):
```css
/* Ist: */
@media(min-width:1024px){
  #ovDetail{align-items:stretch;justify-content:flex-end;background:transparent;pointer-events:none}
  #ovDetail.open{pointer-events:none}
  #ovDetail .modal{width:460px;max-width:460px;height:100dvh;max-height:100dvh;border-radius:0;
    border-left:1px solid var(--hair);box-shadow:-12px 0 44px rgba(31,28,28,.16);transform:translateX(28px)}
  #ovDetail.open .modal{transform:none;pointer-events:auto}
  #ovDetail .mbody.two-track{display:block}
  #ovDetail .mbody.two-track .d-track-wrap{margin-top:18px}
  .app{transition:margin-right .28s cubic-bezier(.4,0,.2,1)}
  body.detail-open .app{margin-right:460px}
  body.detail-open .dtopbar{right:460px}
}
/* Soll: */
@media(min-width:1024px){
  .app{transition:margin-right .28s cubic-bezier(.4,0,.2,1)}
  body.detail-open .app{margin-right:460px}
  body.detail-open .dtopbar{right:460px}
}
```
- [ ] **D.3 — Löschen, Block 2** (Akkordeon-Kopf-Regel für die alte Schublade):
```css
/* Ist: */
#ovDetail .d-acc>summary{font-family:"Fragment Mono",ui-monospace,monospace;font-weight:400;letter-spacing:.1em}
/* Soll: entfällt ersatzlos */
```
- [ ] **D.4 — Löschen, Block 3** (redundant bereits mit globaler Basisregel `.status-pill.lock`, Entfernen ändert nichts visuell):
```css
/* Ist: */
#ovDetail .status-pill.lock{background:var(--raised);color:var(--muted)}
/* Soll: entfällt ersatzlos */
```
- [ ] **D.5 — Löschen, Block 4** (Composer-Textarea-Regeln, zwei Zeilen):
```css
/* Ist: */
#ovDetail .mbody textarea{background:var(--paper2)}
#ovDetail .mbody textarea:focus{border-color:var(--brass)}
/* Soll: entfällt ersatzlos */
```
- [ ] **D.6 — Kürzen (gruppierter Selektor), Stelle 1:**
```css
/* Ist: */
#ovDetail .modal,#dbDetail .modal{
  background:rgba(251,248,239,.88);
  backdrop-filter:blur(18px) saturate(1.15);-webkit-backdrop-filter:blur(18px) saturate(1.15)}
/* Soll: */
#dbDetail .modal{
  background:rgba(251,248,239,.88);
  backdrop-filter:blur(18px) saturate(1.15);-webkit-backdrop-filter:blur(18px) saturate(1.15)}
```
- [ ] **D.7 — Kürzen, Stelle 2:**
```css
/* Ist: */
#ovDetail .mfoot,#dbDetail .mfoot{background:rgba(251,248,239,.6)}
/* Soll: */
#dbDetail .mfoot{background:rgba(251,248,239,.6)}
```
- [ ] **D.8 — Kürzen, Stelle 3:**
```css
/* Ist: */
#view-faelle .btn-brass,#ovDetail .btn-brass{background:var(--sage-deep);border-color:#0D2E28;color:var(--ivory-tx);
  box-shadow:inset 0 0 0 1px rgba(185,145,73,.4),inset 0 0 0 3px var(--sage-deep),0 2px 8px rgba(18,59,51,.25);
  text-shadow:none}
/* Soll: */
#view-faelle .btn-brass{background:var(--sage-deep);border-color:#0D2E28;color:var(--ivory-tx);
  box-shadow:inset 0 0 0 1px rgba(185,145,73,.4),inset 0 0 0 3px var(--sage-deep),0 2px 8px rgba(18,59,51,.25);
  text-shadow:none}
```
- [ ] **D.9 — Kürzen, Stelle 4:**
```css
/* Ist: */
#view-faelle .btn-ghost,#ovDetail .btn-ghost{background:transparent;border-color:var(--gold-soft);color:var(--brass-deep)}
/* Soll: */
#view-faelle .btn-ghost{background:transparent;border-color:var(--gold-soft);color:var(--brass-deep)}
```
- [ ] **D.10 — Löschen, Block 5** (Rahmen-Regel + `@media`-Override, zwei zusammengehörige Blöcke):
```css
/* Ist: */
#ovDetail .modal{border:1px solid var(--jade-hair);
  box-shadow:0 -10px 50px rgba(28,25,22,.3),inset 0 0 0 1px var(--gold-faint)}
@media(min-width:1024px){
  #ovDetail .modal{border:0;border-left:1px solid var(--jade-hair);
    box-shadow:-12px 0 44px rgba(31,28,28,.16),inset 0 0 0 1px var(--gold-faint)}
}
/* Soll: entfällt ersatzlos */
```
- [ ] **D.11 — Löschen, Block 6:**
```css
/* Ist: */
#ovDetail .mhead{box-shadow:inset 0 -1px 0 var(--gold-soft)}
/* Soll: entfällt ersatzlos */
```
- [ ] **D.12 — Migrieren (kein Löschen!), Block 7** — **festes Soll aus Spec §2.6**: beide Teile dieser Regel referenzieren `#ovDetail`, die Regel zieht auf den neuen Fallakte-Kontext um (sowohl `.d-acc`/Steuerung als auch `.docs`/Unterlagen-Checkliste aus `dArbeitHtml()` landen jetzt unter `#view-fallakte`):
```css
/* Ist: */
#ovDetail .d-acc,#ovDetail .docs{border-radius:4px}
/* Soll: */
#view-fallakte .d-acc,#view-fallakte .docs{border-radius:4px}
```
- [ ] **D.13 — Löschen, Block 8** (`.pa-akte`-Basisklasse selbst bleibt bestehen, nur die `#ovDetail`-spezifische Radius-Regel entfällt):
```css
/* Ist: */
#ovDetail .pa-akte{border-radius:4px;border-top:2px solid var(--gold-soft)}
/* Soll: entfällt ersatzlos */
```
- [ ] **D.14 — Löschen, Block 9** (zweite, jade-farbene Textarea-Fokus-Variante, Layer-Override der in D.5 bereits gelöschten Basisregel):
```css
/* Ist: */
#ovDetail .mbody textarea:focus{border-color:var(--sage-deep);box-shadow:0 0 0 2px var(--sage-soft)}
/* Soll: entfällt ersatzlos */
```
- [ ] **D.15** `grep -n "#ovDetail" index.html` erneut ausführen — **kein** Treffer mehr im gesamten Dokument.
- [ ] **D.16** Standard-Verifikation bei 390px UND 1440px: `#dbDetail`/`#egDetail`/`#view-faelle`-Buttons visuell unverändert prüfen (die gekürzten gruppierten Selektoren dürfen dort **nichts** verändert haben); Fallakte-Steuerung (`.d-acc`) und Unterlagen-Checkliste (`.docs`) zeigen weiterhin den 4px-Radius aus D.12.

**Sichtprüfung:** `grep -c "#ovDetail" index.html` liefert `0`; `#dbDetail`, `#egDetail`, die Board-Buttons (`#view-faelle .btn-brass`/`.btn-ghost`) sehen exakt wie vor diesem Task aus; die Steuerung- und Unterlagen-Bereiche der Fallakte zeigen weiterhin den kantigen 4px-Radius statt auf die generische 12px-Basisregel zurückzufallen.

**Commit:** `chore: CSS-Waisen nach Entfernung von #ovDetail bereinigt — 8 verwaiste Regel-Blöcke gelöscht, 1 Regel (.d-acc/.docs) auf #view-fallakte migriert, 4 gruppierte Selektoren gekürzt (Runde 5 Sprint 3, §2.6)`

---

# Task E — Kontextzone finalisieren + 2-Zonen-Layout

**Lane:** `claude-implementer-pro` (eine echte Verhaltensänderung — Stammdaten-Akte zuklappen — plus Layout-Restrukturierung mit Mobile-Stapel-Anforderung)

**Abhängigkeit:** braucht Task B+C (Arbeitszone muss existieren, damit sie in die linke `.fk-cols`-Spalte gepackt werden kann).

**Referenz-Komponenten (erst lesen):** `.pa-fold`-CSS ([index.html:1440-Bereich](../../../index.html#L1440), aus Sprint 1 Task 1.4) und `summary.rk{cursor:pointer;list-style:none}` ([index.html:3065](../../../index.html#L3065)) — beide bereits vollständig vorhanden und wiederverwendbar, **keine neue CSS-Regel für den Collapse selbst nötig**.

**Dateien/Anker:** `grep -n "id=\"faKacheln\"\|id=\"faUebersicht\"\|class=\"fa-cols\"\|class=\"fa-col-l\"\|class=\"fa-col-r\"\|\\.fa-cols{\|\\.fa-kacheln{\|\\.fa-kachel" index.html` vor Bearbeitung ausführen und alle Zeilenangaben neu bestätigen.

**Ist (nach Task B+C, verifiziert):** `#view-fallakte` hat die Reihenfolge `faKacheln` (3 Kacheln: Frist/kzChain/Sterne, seit Task A großteils redundant zum Kopf) → `faNaechste`(erweitert, Task B+C) → `dArbeit` → Steuerung-`.chap` → `.fa-cols` (`.fa-col-l`=Werdegang, `.fa-col-r`=Übersicht/Medizin/Abrechnung/Dokumente). `faUebersicht`s `paAkteSlot(f.personId)`-Aufruf ist **nicht** in ein `<details>` gewrappt (Sprint-1-Entscheidung, die die Spec in §5 bewusst revidiert, da die Akte jetzt nur noch Kontext ist, nicht mehr Seitenzweck).

**Schritte:**

- [ ] **E.1** `grep`-Befehl oben ausführen, aktuelle Struktur neu bestätigen.
- [ ] **E.2 — `faUebersicht`: Stammdaten-Akte zuklappen** (identisches Muster wie Sprint 1 Task 1.4 für Fall-Drawer/In-Reha-Overlay):
```js
// Ist:
  document.getElementById("faUebersicht").innerHTML="<div class='pa-meta'>"
    +"<div class='pa-row'><span class='pa-k'>Einwilligung</span><span class='pa-v'>"+escapeHtml(f.consent)+"</span></div>"
    +(f.saluto?"<div class='pa-row'><span class='pa-k'>SalutoCare</span><span class='pa-v'>★ Premium-Option geeignet</span></div>":"")
    +"</div>"+paAkteSlot(f.personId);
// Soll:
  document.getElementById("faUebersicht").innerHTML="<div class='pa-meta'>"
    +"<div class='pa-row'><span class='pa-k'>Einwilligung</span><span class='pa-v'>"+escapeHtml(f.consent)+"</span></div>"
    +(f.saluto?"<div class='pa-row'><span class='pa-k'>SalutoCare</span><span class='pa-v'>★ Premium-Option geeignet</span></div>":"")
    +"</div>"+"<details class='pa-fold'><summary class='rk'>Stammdaten-Akte</summary>"+paAkteSlot(f.personId)+"</details>";
```
- [ ] **E.3 — `faKacheln`-Kachelreihe entfernen** (Frist/kzChain/Sterne sind jetzt redundant: Frist ist editierbar in der Hero, Sterne+Achse+KT+Saluto stehen im Kopf, kzChain steht lesend in Abrechnung):
```js
// Ist:
  document.getElementById("faStage").innerHTML=stageBandHtml(f);
  document.getElementById("faHinweis").innerHTML=f.zuordnungsHinweis?("<div class='fk-hinweis'><span class='kicker'>Hinweis</span> "+escapeHtml(f.zuordnungsHinweis)+"</div>"):"";
  document.getElementById("faKacheln").innerHTML=
     "<div class='fa-kachel'><span class='rk'>Frist</span><span class='due "+fristKlasse(f.frist)+"'>"+(f.frist?escapeHtml(fristText(f.frist)):"—")+"</span></div>"
    +"<div class='fa-kachel'>"+kzChain(f)+"</div>"
    +"<div class='fa-kachel'>"+sterneHtml(sterneVon({personId:f.personId}))+"</div>";
  document.getElementById("faAufgabeView").innerHTML=aufgabenHeroHtml(f);
// Soll:
  document.getElementById("faStage").innerHTML=stageBandHtml(f);
  document.getElementById("faHinweis").innerHTML=f.zuordnungsHinweis?("<div class='fk-hinweis'><span class='kicker'>Hinweis</span> "+escapeHtml(f.zuordnungsHinweis)+"</div>"):"";
  document.getElementById("faAufgabeView").innerHTML=aufgabenHeroHtml(f);
```
  Und im HTML das leere `<div class="fa-kacheln" id="faKacheln"></div>` entfernen:
```html
<!-- Ist: -->
    <div class="fa-kacheln" id="faKacheln"></div>
    <div class="fh-hero" id="faNaechste">
<!-- Soll: -->
    <div class="fh-hero" id="faNaechste">
```
- [ ] **E.4 — 2-Zonen-Layout: `.fa-cols`/`.fa-col-l`/`.fa-col-r` in `.fk-cols`/`.fk-col-arbeit`/`.fk-col-kontext` überführen**, Arbeit-Inhalte (Hero, Werkbank, Steuerung) in die linke, Kontext-Inhalte (Werdegang, Übersicht, Medizin, Abrechnung, Dokumente) in die rechte Spalte verschieben — Arbeit steht als **erstes Kind im Markup**, damit die Mobile-Stapelreihenfolge automatisch „Arbeit zuerst" ergibt (kein `order`/Flex-Reorder-CSS nötig, identisches Prinzip wie die bisherige `.fa-cols`-Regel):
```html
<!-- Ist (nach E.3, direkt vor .fa-cols): -->
    <div class="fh-hero" id="faNaechste">
      ...
    </div>
    <div id="dArbeit"></div>
    <div class="chap">
      <h2 class="chap-h2">Steuerung</h2>
      ...
    </div>
    <div class="fa-cols">
      <div class="fa-col-l">
        <div class="chap"><h2 class="chap-h2">Werdegang</h2><div id="faWerdegang"></div></div>
      </div>
      <div class="fa-col-r">
        <div class="chap"><h2 class="chap-h2">Übersicht</h2><div id="faUebersicht"></div></div>
        <div class="chap"><h2 class="chap-h2">Medizinische Kurzfelder</h2><div id="faMedizin"></div></div>
        <div class="chap"><h2 class="chap-h2">Abrechnung</h2><div id="faAbrechnung" class="kz-block"></div></div>
        <div class="chap"><h2 class="chap-h2">Dokumente</h2><div id="faDokumente"></div></div>
      </div>
    </div>
  </section>
<!-- Soll: -->
    <div class="fk-cols">
      <div class="fk-col-arbeit">
        <div class="fh-hero" id="faNaechste">
          ...
        </div>
        <div id="dArbeit"></div>
        <div class="chap">
          <h2 class="chap-h2">Steuerung</h2>
          ...
        </div>
      </div>
      <div class="fk-col-kontext">
        <div class="chap"><h2 class="chap-h2">Werdegang</h2><div id="faWerdegang"></div></div>
        <div class="chap"><h2 class="chap-h2">Übersicht</h2><div id="faUebersicht"></div></div>
        <div class="chap"><h2 class="chap-h2">Medizinische Kurzfelder</h2><div id="faMedizin"></div></div>
        <div class="chap"><h2 class="chap-h2">Abrechnung</h2><div id="faAbrechnung" class="kz-block"></div></div>
        <div class="chap"><h2 class="chap-h2">Dokumente</h2><div id="faDokumente"></div></div>
      </div>
    </div>
  </section>
```
  (Die drei Punkte `...` stehen für die in Task B+C bereits eingefügten, hier unverändert mitgenommenen Inhalte von `faNaechste`/Steuerung — keine erneute inhaltliche Änderung, nur Verschiebung der umschließenden Divs.)
- [ ] **E.5 — CSS: `.fa-kacheln`/`.fa-kachel`-Regeln entfernen (durch E.3 verwaist) + `.fa-cols`→`.fk-cols` umbenennen** — beide Änderungen betreffen denselben Kommentarblock, daher gemeinsam:
```css
/* Ist: */
/* Task 3.1 (Punkt 3): Fallakte-Dashboard — Kennzahl-Kacheln (Muster analog .rs-kpi/.g-stat,
   große Serif-/Statuswerte statt 10px-Label-Listen) + zweispaltiges Layout ab 1024px.
   #faKacheln/#faNaechste(.fh-hero, wiederverwendet aus Task 1.3) laufen bewusst außerhalb
   von .fa-cols volle Breite; darunter Werdegang links, restliche Chaps rechts gestapelt. */
.fa-kacheln{display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:18px}
.fa-kachel{background:var(--paper2);border:1px solid var(--hair2);border-radius:8px;padding:14px 16px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center}
.fa-kachel .rk{display:block;font:700 10.5px/1 Inter;letter-spacing:.06em;text-transform:uppercase;color:var(--brass-deep)}
@media(min-width:1024px){
  .fa-kacheln{grid-template-columns:repeat(3,1fr)}
  .fa-cols{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
}
/* Soll: */
/* Task E (Runde 5 Sprint 3, §5/§7): .fk-cols — Zwei-Zonen-Layout Arbeit|Kontext ab 1024px,
   Arbeit steht als erstes Kind im Markup → Mobile-Stapelreihenfolge "Arbeit zuerst" ohne
   order/Flex-Reorder-CSS. Ersetzt die alte Kennzahl-Kacheln-Reihe (.fa-kacheln/.fa-kachel,
   jetzt redundant: Frist ist editierbar in der Hero, Sterne/Achse/KT/Saluto stehen im Kopf,
   kzChain steht lesend in Abrechnung) sowie die alte .fa-cols/.fa-col-l/.fa-col-r-Aufteilung
   (Werdegang links/Rest rechts) durch die neue Arbeit/Kontext-Aufteilung. */
@media(min-width:1024px){
  .fk-cols{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
}
```
- [ ] **E.6** `grep -n "\.fa-kacheln\|\.fa-kachel\|\.fa-cols\|\.fa-col-l\|\.fa-col-r\|class=\"fa-\"" index.html` erneut ausführen — kein Treffer mehr (weder CSS noch HTML).
- [ ] **E.7** Standard-Verifikation bei 390px UND 1440px: bei <1024px stapelt sich die Seite in der Reihenfolge Kopf → Arbeit (Hero/Werkbank/Steuerung) → Kontext (Werdegang/Übersicht/Medizin/Abrechnung/Dokumente), keine horizontale Overflow; ab 1024px zwei Spalten nebeneinander; Stammdaten-Akte ist standardmäßig zugeklappt und öffnet per Klick; `#dbDetail`/`#faUebersicht`(alt) unverändert gegentesten — Moment: `#dbDetail`s eigener `paAkte()`-Aufruf bleibt laut Sprint-1-Entscheidung weiterhin offen (dieser Task betrifft nur `faUebersicht`, nicht `#dbDetail`).

**Sichtprüfung:** Die Fallakte zeigt jetzt exakt zwei Zonen — links durchgängig „Arbeit" (Hero mit editierbaren Feldern, aufgabentyp-abhängige Werkbank, Steuerung), rechts durchgängig „Kontext" (Werdegang, Übersicht mit zugeklappter Stammdaten-Akte, Medizin, Abrechnung, Dokumente); unter 1024px steht Arbeit zuerst; die alte Kachel-Reihe (Frist/Kostenkette/Sterne als separate Kacheln) ist verschwunden, ohne dass eine der drei Informationen aus der Seite verschwunden wäre (sie stehen jetzt an ihren jeweils sinnvolleren Orten).

**Commit:** `refactor: Fallakte — Stammdaten-Akte zugeklappt (.pa-fold), Kennzahl-Kacheln entfernt (redundant zu Kopf/Hero/Abrechnung), finales Zwei-Zonen-Layout .fk-cols (Arbeit|Kontext, Mobile-Stapel "Arbeit zuerst") (Runde 5 Sprint 3, §5/§7)`

---

# Task F — Feinschliff/Konsistenz

**Lane:** `claude-implementer` (reine Textersetzungen + Verifikations-Sweep, keine neue Logik)

**Abhängigkeit:** braucht Task A/B+C/D/E (prüft deren Ergebnis, ändert nur noch Restkosmetik).

**Dateien/Anker:** `grep -n "TITLES=\|Vollständige Fallakte öffnen\|ah-hinweis" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `TITLES`-Objekt in `go()` bei [index.html:6758](../../../index.html#L6758) (Zeile verschiebt sich durch vorherige Tasks).

**Ist (verifiziert):** `const TITLES={...,fallakte:["Fallakte","Vollständige Übersicht"]};` — der Untertitel „Vollständige Übersicht" beschreibt noch die alte, überwiegend lesende Seite; nach diesem Sprint ist die Seite der aktive Arbeitsplatz. „Vollständige Fallakte öffnen"-Button-Reste und die `.ah-hinweis`-Zeile in `aufgabenHeroHtml()` wurden bereits in Task A/B+C entfernt (dieser Task verifiziert das nur noch, ändert nichts doppelt).

**Schritte:**

- [ ] **F.1** `grep`-Befehl oben ausführen.
- [ ] **F.2 — `TITLES`-Untertitel für `fallakte` aktualisieren:**
```js
// Ist:
const TITLES={heute:["Heute","Cockpit · Überblick"],faelle:["Fälle","Anfragen · Board · Team"],inreha:["In Reha","Erfolg · Wirtschaftlichkeit"],netzwerk:["Netzwerk","Zuweiser · Patienten"],auswertung:["Auswertung","Quellen · Engpässe · Team · Fachbereiche"],konzept:["Konzept","Idee · Matrix · SOPs"],fallakte:["Fallakte","Vollständige Übersicht"]};
// Soll:
const TITLES={heute:["Heute","Cockpit · Überblick"],faelle:["Fälle","Anfragen · Board · Team"],inreha:["In Reha","Erfolg · Wirtschaftlichkeit"],netzwerk:["Netzwerk","Zuweiser · Patienten"],auswertung:["Auswertung","Quellen · Engpässe · Team · Fachbereiche"],konzept:["Konzept","Idee · Matrix · SOPs"],fallakte:["Fallakte","Arbeitsplatz je Fall"]};
```
- [ ] **F.3** `grep -n "Vollständige Fallakte öffnen" index.html` ausführen — erwartet **kein** Treffer (Button-Rest wurde in Task B+C mit `#ovDetail` gelöscht). Falls doch ein Treffer erscheint (z. B. weil Task B+C abweichend umgesetzt wurde), an dieser Stelle entfernen und im Report vermerken.
- [ ] **F.4** `grep -n "ah-hinweis" index.html` ausführen — erwartet **kein** Treffer mehr (Task A hat sowohl die HTML-Erzeugung in `aufgabenHeroHtml()` als auch die CSS-Regel entfernt). Falls doch ein Treffer erscheint, an dieser Stelle nachholen und im Report vermerken.
- [ ] **F.5** `grep -n "ovDetail\|dWerdegang\|\"dAkte\"" index.html` ausführen — erwartet **kein** Treffer außer dem historischen Analogie-Kommentar bei `egDetail` (Zeile ~3071, „Struktur/Docking wie #ovDetail" — bewusst unangetastet, s. Task B+C, B.14). Im Report explizit auflisten, was der grep noch findet.
- [ ] **F.6** Standard-Verifikation bei 390px UND 1440px: Fallakte-Titelzeile im Desktop-Topbar zeigt „Arbeitsplatz je Fall" statt „Vollständige Übersicht".

**Sichtprüfung:** Der Desktop-Topbar-Untertitel für die Fallakte lautet „Arbeitsplatz je Fall"; ein Dokumenten-weiter grep nach `ovDetail`/`Vollständige Fallakte öffnen`/`ah-hinweis` liefert keine unerwarteten Treffer (nur der dokumentierte `egDetail`-Analogie-Kommentar bleibt).

**Commit:** `chore: Feinschliff Fallakte-Cockpit — Topbar-Untertitel aktualisiert, Restkosmetik-Sweep (ovDetail/ah-hinweis/Vollständige-Fallakte-Button) verifiziert (Runde 5 Sprint 3)`

---

# Abschluss-Task — Lebenszyklus-Test

**Lane:** `claude-implementer-pro` (Verifikation im Browser; falls dabei ein Fund auftaucht, kleine Fixes direkt hier, kein neuer Task nötig für Kleinigkeiten — bei größeren Funden: stoppen, im Report melden statt selbst zu improvisieren)

**Abhängigkeit:** braucht alle vorherigen Tasks (A, B+C, D, E, F).

**Ziel:** ein kompletter Fall-Lebenszyklus läuft **ausschließlich** über die Fallakte, exakt wie in Spec §8 („Erfolgskriterien") gefordert.

**Schritte (alle im Browser, 390px UND 1440px, Console offen):**

- [ ] **G.1 — Neuer Fall aus dem Eingang:** eine offene Anfrage im Eingang öffnen (`openEgDetail`), SalutoCare-Toggle testen, Hinweis-Text eintragen, „Als Fall anlegen & zuordnen" (`uebernehmen()`) klicken → landet direkt in der Fallakte (nicht in einer Schublade), Kopf zeigt sofort den neuen goldenen Hinweis + „Neu"-Stufe im Prozessband.
- [ ] **G.2 — `antwortenEingang()`:** aus dem Eingang „✉ Antworten" auf eine noch nicht übernommene Anfrage klicken → Fall wird angelegt, Fallakte öffnet, Fokus springt nach ~80ms in `#dReply` (Teil der Werkbank, Zweig „angebot"/Antwort-Composer — ggf. vorher testweise `f.aufgabe` auf einen Wert setzen, der `drawerAufgabenTyp()` in den `"angebot"`-Zweig lenkt, oder direkt mit einem Fall aus den Seed-Daten testen, dessen Aufgabe bereits „Angebot"-artig ist).
- [ ] **G.3 — `sendReply()`:** im Antwort-Composer einen Text eintragen, Kanal wählen, „Antwort senden" klicken → Verlauf (`#dLog`) zeigt den neuen Eintrag sofort, ohne Navigations-Sprung.
- [ ] **G.4 — Kostenzusage-Zyklus:** einen Fall mit kostenbezogener Aufgabe öffnen, nacheinander „Kostenzusage anfragen" → „Zusage erfassen" (oder „Ablehnung erfassen") klicken → `kzChain(f)` in Arbeit② und in Kontext/Abrechnung aktualisieren sich synchron, kein Navigations-Sprung, Verlauf zeigt beide Einträge.
- [ ] **G.5 — Sofort-Notiz (`kzNotizAdd()`):** in einem Fall ohne speziellen Aufgabentyp die Sofort-Notiz-Zeile („Ins Protokoll") nutzen → Verlauf aktualisiert sich sofort, `dNotizSofort` wird geleert, kein Re-Render der ganzen Seite nötig.
- [ ] **G.6 — Unterlagen-Checkliste:** bei einer Aufgabe vom Typ „unterlagen" die vier Checkboxen (`u1`–`u4`) einzeln toggeln → `docCnt` aktualisiert sich live (`updateDocCnt()`), „Fehlende anfordern" zeigt Demo-Toast.
- [ ] **G.7 — Steuerung + Speichern:** in der Steuerung Status auf „Verloren" setzen **ohne** Verlustgrund, Speichern klicken → `alert()` erscheint, nichts wird gespeichert; danach Verlustgrund wählen, erneut Speichern → Status/Kosten/Kostenträger/Einwilligung/SalutoCare/Verlustgrund werden übernommen, Verlauf zeigt den Statuswechsel-Eintrag, Seite bleibt auf der Fallakte (kein Schließen/Navigations-Sprung).
- [ ] **G.8 — `advanceFall()` komplett durchspielen:** von „Neu" bis „Aufgenommen" jede Stufe per „Aktuelle Aufgabe erledigt → nächster Schritt ›" durchklicken → Kopf-Prozessband (Task A) füllt sich synchron zum Werdegang (Kontext-Zone) auf, bei Erreichen von „Aufnahme geplant" erscheint `celebratePlanned()`s Konfetti/Feier-Effekt wie bisher, Button verschwindet bei „Aufgenommen"/„Verloren".
- [ ] **G.9 — Board-Klick:** `#board`-Karte anklicken → landet direkt in der Fallakte des angeklickten Falls.
- [ ] **G.10 — Team-/Heute-Aufrufstellen:** Team-Reiter → offene Aufgabe eines Mitarbeiters anklicken; Heute-Ansicht → „Frist überfällig"/„heute fällig"/„Kostenklärung offen"-Zeile anklicken → alle landen direkt in der Fallakte des jeweiligen Falls.
- [ ] **G.11 — `ma-mode`/`mtSheet`-Gegentest:** in den Koordinations-Arbeitsplatz wechseln (`.ds-role`-Umschalter), `mtSheet` für einen Fall öffnen → `miniFallakte`-Block bleibt unverändert eine reine Lese-Kopie **ohne** Link/Button in die Fallakte, Hinweis-Zeile (`mt-shinweis`) erscheint dort weiterhin unverändert; `mtCloseOverlays()` schließt weiterhin `refOverlay`/`dbDetail`/`rsDetail`/`sheetNeu`/`kpSheet`/`rpDocView`/`egDetail` korrekt (7 statt vormals 8 Einträge, `ovDetail` fehlt jetzt zu Recht).
- [ ] **G.12 — Cofounder-Gegentest:** Zuweiser-Portal (`#refOverlay`, `openReferrer`/`closeReferrer`) öffnen/schließen; Matrix (`.mx-*`/Konzept-Tab) durchklicken; In-Reha-Leitungs-Overlay (`openRsDetail()`, `.rsp-*`-Charts) öffnen — alle drei Bereiche exakt wie vor diesem Sprint, 0 Console-Errors, 0 optische Veränderung.
- [ ] **G.13 — Zurück-Button/History:** aus `egDetail`/`dbDetail`/`rsDetail` per Browser-Zurück schließen → funktioniert wie bisher (unverändert, da `_DETAIL_IDS`/`pushDetailState()`/`dismissDetail()`/`_rawCloseDetails()` generisch bleiben, nur um den einen `"ovDetail"`-Eintrag gekürzt); aus der Fallakte per Browser-Zurück → normale `go()`-Navigation zum vorherigen View, kein Overlay-Rest, kein doppelter History-Eintrag.
- [ ] **G.14** Finale Kontrolle: `grep -c "function "  index.html` gegen den Stand vor Task A vergleichen und die Differenz gegen die im Plan dokumentierten Änderungen abgleichen (netto: `stageBandHtml` neu (+1), `openDetail()`s alter Körper durch 1-Zeilen-Alias ersetzt (±0), keine sonstigen Funktionsänderungen). 0 Console-Errors über den kompletten Testlauf bei 390px UND 1440px.

**Sichtprüfung:** Ein kompletter Fall lässt sich von „Neu" bis „Aufgenommen" ausschließlich innerhalb der Fallakte bearbeiten — jede Interaktion (Antwort senden, Kostenzusage-Schritte, Notiz, Unterlagen-Haken, Steuerung+Speichern, Aufgabe-erledigt) bleibt auf derselben Seite, ohne Navigations-Sprung oder Schublade; alle Einstiegspunkte (Board/Team/Heute/Eingang) führen direkt dorthin; `ma-mode` und alle Cofounder-Bereiche sind unverändert.

**Commit:** nur falls G.1–G.14 einen Fix nötig machten — dann `fix: <konkreter Fund aus dem Lebenszyklus-Test> (Runde 5 Sprint 3, Abschluss-Verifikation)`. Falls keine Fixes nötig waren, kein Commit (reine Verifikation).

---

## Reihenfolge / Abhängigkeiten

```
Task A (Kopf-Umbau + aktuellerFall-Fix) ── Schublade bleibt parallel bestehen, App durchgehend lauffähig
      │
      ▼
Task B+C (Arbeitszone umziehen + Routing-Alias + Schublade entfernen, ATOMAR) ── größter Task,
      │                                                                          ID-Kollisionsrisiko
      ▼
Task D (CSS-Waisen) ── braucht die durch B+C entfernte Schublade
      │
      ▼
Task E (Kontextzone + 2-Zonen-Layout) ── braucht die durch B+C existierende Arbeitszone
      │
      ▼
Task F (Feinschliff/Konsistenz-Sweep)
      │
      ▼
Abschluss-Task (Lebenszyklus-Test)
```

Sequentiell in dieser Reihenfolge ausführen (eine Datei, nie parallel). Diese Reihenfolge ist zugleich so gewählt, dass die App nach **jedem einzelnen** Task lauffähig bleibt — Task A verändert nur additiv den Kopf (Schublade unberührt), Task B+C ist der einzige Bruchpunkt und deshalb bewusst atomar, Task D/E/F/Abschluss bauen auf einer bereits vollständig funktionsfähigen Fallakte auf.

---

## Nicht-Ziele dieser Runde

- `ma-mode`/`mtSheet` bleiben zu 100% unangetastet (nur die reine Array-Kürzung um `"ovDetail"` in `mtCloseOverlays()`, Task B+C).
- `egDetail`/`dbDetail`/`rsDetail` bleiben unverändert bestehende Overlays, inkl. ihres eigenen `paAkte()`-Aufrufs in `#dbDetail` (bleibt laut Sprint-1-Entscheidung offen, nicht zugeklappt).
- Cofounder-Namespaces (`.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`, `openReferrer`/`closeReferrer`/`#refOverlay`) — nicht angefasst.
- Kein neues Datenfeld — reine Umzug/Verdrahtung bestehender Felder.
- Der `openDetail`-Alias (Task B+C) wird **nicht** durch direkte `openFallakte`-Aufrufe an den 13 Stellen ersetzt — spätere Runde (siehe Spec §6, explizite Empfehlung, nicht Teil dieser Runde).
- Keine Refaktorierung der weiterhin dreifach duplizierten Log-Timeline-Map-Funktion (`sendReply`/`kzNotizAdd`/`renderFallakte`).
- `closeDetail()` bleibt als vorbestehender, jetzt zusätzlich auf ein nicht mehr existierendes Element zeigender Dead Code bestehen — nicht Teil dieser Runde, im Abschlussbericht vermerkt.
- Der historische Analogie-Kommentar bei `egDetail`s Definition („Struktur/Docking wie #ovDetail") bleibt unangetastet — beschreibt Design-Herkunft, `egDetail` selbst ist Nicht-Ziel.
- Keine neuen Keyframes, keine neuen Datenfelder, `escapeHtml` für alle dynamischen Inhalte, kein `Math.random`, 390px und 1440px verifizieren, 0 Console-Errors, reduced-motion-safe.
