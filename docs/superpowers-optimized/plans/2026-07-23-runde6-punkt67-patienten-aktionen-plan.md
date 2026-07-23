# Runde 6, Punkt 6+7 — Patienten-Anlässe individuell + Automatik-Regeln + reine Stammdaten: Implementierungsplan

> **Für ausführende Agenten:** Dieser Plan wird Subagent-Driven umgesetzt — pro Task ein frischer Agent, kein Schreiben durch das orchestrierende Modell selbst. Lane-Tag pro Task beachten. Jeder Task arbeitet ausschließlich in `index.html`; **vor jeder Anker-Zeile den `grep`-Befehl aus dem Task selbst erneut ausführen** — Zeilennummern verschieben sich durch jeden vorherigen Task. Die hier notierten Zeilen sind der Stand bei Plan-Erstellung (23.07.2026, `index.html` 7363 Zeilen, Commit `e4f714f`), nicht garantiert der Stand bei Ausführung.

**Bezug:** Setzt [2026-07-23-runde6-punkt67-patienten-aktionen-design.md](../specs/2026-07-23-runde6-punkt67-patienten-aktionen-design.md) vollständig um — neuer Anlass-Typ `nachsorge` in `anlaesse()`, Block A „Individuelle Anlässe" (`paaKarte()`/`renderPatientenAnlaesse()`, `.zwa-*`-Wiederverwendung aus P5) statt `arCard()` in `renderRadar()`, Block B „Automatik-Regeln" (`PAT_REGELN`/`parKarte()`/Toggle) neu, passive `dbDetail`-Automatik-Zeile, Waisen-Entfernung von `arCard()`/`AR_TYP`/`AR_FOTO`/`.ar-grid`. Format/Konventionen übernommen vom vorherigen Sprint-Plan ([2026-07-23-runde6-punkt5-zuweiser-plan.md](./2026-07-23-runde6-punkt5-zuweiser-plan.md)).

**Architektur:** Alle Änderungen in `index.html` (self-contained, kein Build-Prozess, „Tests" = konkrete Browser-/CDP-Checks + Konsolen-Snippets, keine Test-Framework-Suite). Sequentielle Ausführung — **nie parallel**, jeder Task fasst dieselbe Datei an. Nach jedem Task: Git-Commit (nur `index.html` staged, niemals `docs/MicrosoftTeams-video.mp4`). Die App bleibt nach **jedem einzelnen Task** lauffähig und visuell korrekt (0 Console-Errors, kein kaputter oder optisch falscher Zwischenzustand).

---

## Architekten-Ergänzungen (bei Bestandslektüre gefunden)

Anders als bei Punkt 5 hat diese Spec **keine inhaltlichen Lücken** — alle Formeln, Empfänger-Zahlen (4/8/1/1) und Seed-Werte wurden gegen den tatsächlichen Ist-Stand von `index.html` (Commit `e4f714f`, nach Spec-Erstellung unverändert) nachgerechnet und stimmen exakt: `sterneVon()` für P12/P13/P14/P15/P16/P17/P18/P19 ergibt 4/3/5/2/2/2/3/2, `consent`-Feld exakt wie in Spec-Tabelle §4, `patRegelLauf()`-Kalenderrechnung (Quartal/Halbjahr/Fixdatum) ergibt exakt 01.10.2026/01.01.2027/01.12.2026/01.02.2027. Die Spec lässt jedoch drei **Platzierungsfragen** offen (kein Bug, nur „wo genau einfügen" — hier für alle Tasks einheitlich festgelegt, damit nicht jeder Task-Agent unterschiedlich entscheidet):

**(1) `renderPatientenAnlaesse()` muss einen HTML-String zurückgeben, nicht selbst `innerHTML` setzen.** Anders als `renderZuweiserAnlaesse()` (P5, eigenes Zielelement `#zAnlaesse`) ist Block A Teil der einen großen `innerHTML`-Zusammensetzung von `renderRadar()` (`#radarHost`) — es gibt kein eigenes DOM-Element dafür. `renderPatientenAnlaesse()` wird daher als reine String-Rückgabe-Funktion gebaut und in `renderRadar()`s Template mit `+renderPatientenAnlaesse()` eingehängt (Task 3).

**(2) Einfügeort neuer Top-Level-Konstrukte.** `PAA_TYP`/`paaKarte()`/`renderPatientenAnlaesse()` werden direkt nach `renderZuweiserAnlaesse()` eingefügt (vor dem Belegungs-Forecast-Kommentar `/* ---------- Baustein C · Belegungs-Forecast (.fc-*) ---------- */`) — hält den P5-Block (Zuweiser) unangetastet zusammen und reiht den neuen Punkt-6-Block (Patienten) direkt danach ein, statt ihn zwischen bestehende Funktionen zu quetschen. `PAT_REGELN`/`patRegelLauf()`/`patRegelEmpfaenger()`/`patRegelnAn`/`parToggle()`/`parKarte()`/`renderPatRegelnHtml()` werden direkt vor `function dbCockpit(){` eingefügt — zentral zwischen ihren drei Verwendungsstellen (`renderRadar()` Block B, `openDbDetail()`s neue Automatik-Zeile, beide operieren auf `bestand[]` wie `dbCockpit()` selbst). `patAutomatikText()` wird direkt vor `function openDbDetail(i){` eingefügt (einziger Aufrufer).

**(3) Übergangs-Fenster zwischen Task 2 (neuer `anlaesse()`-Typ `nachsorge`) und Task 3 (`paaKarte()`-Umstellung).** Identisches Muster zu Punkt 5s Architekten-Ergänzung (4): Zwischen Task 2 und Task 3 rendert `renderRadar()` noch über die **alte** `arCard()`-Kette, deren `AR_TYP`-Lookup den neuen Typ `nachsorge` nicht kennt — ohne Gegenmaßnahme zeigt die Karte in diesem Zwischenzustand sichtbar „undefined" statt eines Labels. **Fix:** Task 2 ergänzt `AR_TYP` **vorübergehend** um `nachsorge:"Nachsorge"` (mit Kommentar „TEMPORÄR, entfällt mit AR_TYP komplett in Task 6"). Da `AR_TYP` als Ganzes in Task 6 entfernt wird (kein weiterer Aufrufer nach Task 3), ist keine separate Rückbau-Zeile nötig — der komplette Waisen-Sweep in Task 6 erledigt das mit.

Alle drei Punkte ändern **kein** spezifiziertes Verhalten oder Zahlenergebnis — sie legen nur fest, wo neuer Code in der Datei landet und schließen die eine erwartbare Zwischenzustands-Lücke.

---

## Harte Regeln (jeder Task, aus Spec + projektweitem `CLAUDE.md`)

- Cofounder-Namespaces **nicht anfassen**: `.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`. `#refOverlay` tabu.
- **`anlaesse()` darf in dieser Runde NUR den `nachsorge`-Block einfügen und den `scope==="patienten"`-Filter erweitern.** Die bestehenden Blöcke (`geburtstag`/`jubilaeum`/`wiederbedarf`/alle sechs `zuweiser-*`-Blöcke/Scope-Filter „zuweiser") bleiben **byte-identisch** außer der einen Zeilen-Erweiterung — vor und nach Task 2 per Diff prüfen.
- **`personen[]` bekommt genau zwei additive neue Einträge (P27/P28) + einen Wert-Tweak (P19, zwei Stellen auf derselben Zeile).** Keine weiteren Personen-Änderungen. `zuweiser[]`, `faelle[]`, `inReha[]`, `bestand[]`, `radar[]` werden von dieser Spec **nicht** angefasst (0 Zeilen-Diff).
- **„Erledigt"-Buttons (Block A):** Session-State (`_arDone`-Set, keine Persistenz), Toast-Reuse über das bestehende `arAktion()` — **kein neuer Toast-Mechanismus**, `arAktion()` selbst bleibt unverändert.
- **Toggle (Block B):** reiner Session-State (`patRegelnAn`-Objekt, kein `_arDone`-Reuse — anderes Konzept: Regel-An/Aus, nicht Anlass-Erledigt).
- **Alter `arCard()`/`AR_TYP`/`AR_FOTO`/`.ar-grid`-Code:** vor dem Löschen (Task 6) per `grep` **alle** Fundstellen bestätigen — kein Zwischenzustand mit totem CSS, keine verbliebene Referenz.
- **Exakt 9 Keyframes** — verifiziert im Ist-Stand (`grep -c "@keyframes" index.html` = 9). Diese Runde führt **keine** neue ein (`.par-*`-Toggle ist eine CSS-`transition`, keine `@keyframes`).
- `escapeHtml()` für jeden dynamisch eingefügten Text in allen neuen Bausteinen. **Kein `Math.random`** — alles deterministisch (`heute`, `dstr()`, Kalenderrechnung wie in P5s `patRegelLauf()`-Vorbild).
- Beide Breiten prüfen: **390px und 1440px**. **0 Console-Errors** bei jedem Verifikationsschritt.
- Neue CSS ausschließlich als **kommentierter Block direkt vor `</style>`**, neuer Namespace `.par-*` (das `.zwa-*`-CSS aus P5 wird nur wiederverwendet, nicht verändert).
- **Niemals `docs/MicrosoftTeams-video.mp4` oder sonstige Dateien staged** — jeder Commit nur `index.html`.
- **Stammdaten (`dbBody`/`renderBestand()`) bekommen KEINE neuen Buttons/Aktions-CTAs** — die neue Automatik-Zeile (Task 5) ist reine Information, kein `onclick`.

---

## Lanes

- **`claude-implementer`** (Haiku) — Task 1 (rein mechanisch: zwei additive `personen[]`-Einträge wörtlich aus der Spec, ein Wert-Tweak an exakt vorgegebener Zeile, ein CSS-Block wörtlich vor `</style>`, keine eigene Entscheidung nötig).
- **`claude-implementer-pro`** (Sonnet) — Task 2 (`nachsorge`-Block in `anlaesse()`, Scope-Filter-Erweiterung, temporärer `AR_TYP`-Fix — Bedingungslogik, kein mechanisches Abtippen), Task 3 (`paaKarte()`/`renderPatientenAnlaesse()`, Verdrahtung in `renderRadar()`, ersetzt `arCard()`-Aufruf), Task 4 (`PAT_REGELN`/`parKarte()`/Toggle/Live-Empfänger-Zählung, Verdrahtung in `renderRadar()`), Task 5 (`dbDetail`-Automatik-Zeile), Task 6 (Waisen-Entfernung `arCard()`/`AR_TYP`/`AR_FOTO`/`.ar-grid` + Konsistenz-Check `renderAnlaesse()`/Radar-B2C-Feed + finaler CDP-Abnahme-Sweep aller Spec-Kriterien).

---

## Standard-Verifikation (nach jedem Task)

1. `grep -c "function " index.html` vor/nach vergleichen — keine unbeabsichtigt gelöschten Funktionen außer den in Task 6 explizit dokumentierten Waisen.
2. Browser: Seite neu laden, Console auf 0 Errors prüfen.
3. `#view-netzwerk` → Patienten-Tab, beide Reiter („Aktionen & Anlässe"/„Stammdaten") bei 390px und bei 1440px öffnen, auf Overflow/Lesbarkeit prüfen.
4. Cofounder-Bereiche (`#refOverlay`, `.mx-*`, `.rsp-*`, `.rp-*`, `.rpd-*`) unangetastet gegentesten.
5. `grep -c "@keyframes" index.html` — weiterhin genau **9**.
6. Commit mit klarer Botschaft, welcher Spec-Abschnitt umgesetzt wurde — **nur `index.html` staged**.
7. Jeder Task unten endet zusätzlich mit einer eigenen **Sichtprüfung**.

---

# Task 1 — Seeds: Rosa Klein (P27) + Anton Weiss (P28) + Norbert-Frey-Tweak + `.par-*`-CSS

**Lane:** `claude-implementer` (zwei wörtlich vorgegebene additive Einträge, ein wörtlich vorgegebener Wert-Tweak an exakter Zeile, ein CSS-Block wörtlich vor `</style>`, keine eigene Entscheidung nötig)

**Abhängigkeit:** keine — reine additive/wert-tweakende Datengrundlage. Bootet unverändert; P27/P28 sind neue `personen[]`-Einträge, die von keiner bestehenden Funktion vor Task 2 gelesen werden (additiv/inert). Der Norbert-Frey-Tweak wirkt bereits auf keine bestehende Bedingung, da `anlaesse()` aktuell keinen „Ruhe"-Check hat — inert bis Task 4 (`patRegelEmpfaenger()`s `ruhendAbTage`-Zweig).

**Bezug:** Spec §3.3 (Seeds-Diff), §5.3 (`.par-*`-CSS).

**Dateien/Anker:** `grep -n "pid:\"P26\"\|pid:\"P19\"\|^</style>" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: P26-Zeile 4653 (letzter Eintrag vor dem schließenden `];` von `personen[]` auf Zeile 4654), P19-Zeile 4645, `</style>` Zeile 3157.

**Schritte:**

- [ ] **1.1** `grep`-Befehl oben ausführen, alle drei Fundstellen bestätigen.

- [ ] **1.2 — Rosa Klein (P27) + Anton Weiss (P28) additiv einfügen** (Spec §3.3(1) — nach P26, vor dem schließenden `];`):
```diff
  {pid:"P26",name:"Werner Aumann",geb:gebIn(170,72),lebenszyklus:"interessent",kt:"PKV",sterne:3,sterneGrund:"PKV, konkrete Anfrage, Kostenklärung läuft",kontakt:{tel:"0971 0000-526",mail:"w.aumann@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-4),zwecke:["behandlung"]},zuweiserRef:null,historie:[{d:dstr(-4),typ:"anfrage",text:"Anfrage über Empfehlung (Knie-TEP, AHB gesucht)"}]}
+,
+ {pid:"P27",name:"Rosa Klein",geb:gebIn(140,66),lebenszyklus:"altpatient",kt:"PKV",sterne:3,
+  sterneGrund:"War da, PKV, reguläre Nachsorge nach Knie-TEP",
+  kontakt:{tel:"0971 0000-527",mail:"r.klein@demo-patient.local"},angehoerige:[],
+  einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-49),zwecke:["behandlung","post"]},
+  zuweiserRef:null,
+  historie:[{d:dstr(-49),typ:"entlassung",text:"Ortho-Reha nach Knie-TEP abgeschlossen, Entlassung nach Hause"}]},
+ {pid:"P28",name:"Anton Weiss",geb:gebIn(160,64),lebenszyklus:"altpatient",kt:"Selbstzahler",sterne:5,
+  sterneGrund:"Premium-Selbstzahler (SalutoCare-Suite), Bezugstherapeutin bekannt",
+  kontakt:{tel:"0971 0000-528",mail:"a.weiss@demo-patient.local"},angehoerige:[],
+  einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-45),zwecke:["behandlung","newsletter","post"]},
+  zuweiserRef:null,
+  historie:[{d:dstr(-45),typ:"entlassung",text:"Premium-Reha (SalutoCare-Suite) abgeschlossen, Entlassung nach Hause"}]}
```
  (Praktisch: die bestehende letzte Zeile von P26 verliert ihr Zeilenende-Komma-Fehlen nicht — P26 bleibt der letzte Eintrag ohne Komma nur, wenn er tatsächlich zuletzt bleibt; da P27/P28 danach folgen, bekommt **P26 ein Komma angehängt**, P28 bleibt ohne Komma vor `];`.)

- [ ] **1.3 — Norbert Frey (P19) Wert-Tweak** (Spec §3.3(2) — Ruhe-Semantik für „Reaktivierung ruhender Kontakte", zwei Vorkommen von `dstr(-90)` auf derselben Zeile werden beide zu `dstr(-395)`, Kontaktmoment und Einwilligungsdatum bleiben identisch):
```diff
- {pid:"P19",name:"Norbert Frey",geb:gebIn(-99,64),lebenszyklus:"interessent",kt:"Unklar",sterne:2,sterneGrund:"Messe-Kontakt ohne konkrete Details",kontakt:{tel:"0971 0000-519",mail:"n.frey@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"mündlich",datum:dstr(-90),zwecke:["behandlung"]},zuweiserRef:null,historie:[{d:dstr(-90),typ:"kontakt",text:"Messe-Kontakt (Gesundheitsmesse), ruht"}]},
+ {pid:"P19",name:"Norbert Frey",geb:gebIn(-99,64),lebenszyklus:"interessent",kt:"Unklar",sterne:2,sterneGrund:"Messe-Kontakt ohne konkrete Details",kontakt:{tel:"0971 0000-519",mail:"n.frey@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"mündlich",datum:dstr(-395),zwecke:["behandlung"]},zuweiserRef:null,historie:[{d:dstr(-395),typ:"kontakt",text:"Messe-Kontakt (Gesundheitsmesse), ruht"}]},
```
  **Wichtig:** nur die Person-Registry-Zeile (`personen[]`, P19) ändert sich. Der separate `bestand[]`-Eintrag für Norbert Frey (Zeile ~4321, `{personId:"P19",...}`) bleibt **unverändert** — `patRegelEmpfaenger()` (Task 4) liest die Ruhe-Dauer über `person(p.personId).historie`, nicht über `bestand[]` selbst.

- [ ] **1.4 — neuer CSS-Block vor `</style>`** (`.par-*`-Namespace, wörtlich aus Spec §5.3, direkt nach dem bestehenden `.zwa-noster{...}`-Block angehängt, keine neue Animation):
```css
/* Runde 6 Punkt 6 (§5.3): .par-* — Toggle-Switch für Automatik-Regeln (Demo, Session-State).
   CSS-Transition, keine neue Animation — @keyframes-Zahl bleibt 9. */
.par-toggle{position:relative;display:inline-block;width:34px;height:18px;margin-left:auto;flex-shrink:0}
.par-toggle input{position:absolute;opacity:0;width:0;height:0}
.par-slider{position:absolute;inset:0;background:var(--jade-line);border-radius:10px;cursor:pointer;transition:background .15s}
.par-slider::before{content:"";position:absolute;left:2px;top:2px;width:14px;height:14px;border-radius:50%;background:var(--paper);transition:transform .15s}
.par-toggle input:checked+.par-slider{background:var(--brass-deep)}
.par-toggle input:checked+.par-slider::before{transform:translateX(16px)}
.par-foot{font:600 12px/1.4 Inter;color:var(--ink-soft);margin-top:8px}
.par-foot.muted{opacity:.55;font-style:italic}
```

- [ ] **1.5** `grep -n "pid:\"P27\"\|pid:\"P28\"\|datum:dstr(-395)\|\.par-toggle{\|\.par-foot{" index.html` ausführen — je mindestens 1 Fundstelle (`dstr(-395)` zweimal auf der P19-Zeile).

- [ ] **1.6 — Standard-Verifikation bei 390px UND 1440px:** App bootet unverändert. In der Browser-Konsole:
  - `personen.find(p=>p.pid==="P27").name` ergibt `"Rosa Klein"`, `personen.find(p=>p.pid==="P28").name` ergibt `"Anton Weiss"`.
  - `Math.round((heute-new Date(personen.find(p=>p.pid==="P27").historie[0].d))/86400000)` ergibt `49`, für P28 `45`.
  - `Math.round((heute-new Date(personen.find(p=>p.pid==="P19").historie[0].d))/86400000)` ergibt `395`.
  - `paAssert()`-Warnung bleibt aus (Konsole prüfen) — P27/P28 haben `geb`/`kt` gesetzt.
  - **Kein sichtbarer Effekt** in der UI: P27/P28 sind nicht in `bestand[]`/`radar[]`, tauchen in Stammdaten/Anlässen noch nirgends auf (erst Task 2 macht `nachsorge` daraus). Norbert Frey erscheint unverändert in der Zuweiser-unabhängigen Patienten-Stammdaten-Liste (2★, unverändert `sterneGrund`). `.par-*`-CSS ist inert (kein Markup nutzt es).
  - 0 Console-Errors.

**Sichtprüfung:** Keine sichtbare Struktur-Änderung in der App. `personen.length` ist `28` (vorher 26). `.par-*`-CSS ist inert.

**Commit:** `feat: Patienten-Seeds — Rosa Klein (P27)/Anton Weiss (P28) additiv für Nachsorge-Demo, Norbert-Frey-Tweak (P19, ruhender Kontakt seit 395 Tagen), .par-*-CSS-Block (Runde 6 Punkt 6+7, §3.3/§5.3)`

---

# Task 2 — `nachsorge`-Anlass-Block in `anlaesse()`

**Lane:** `claude-implementer-pro` (Bedingungslogik mit Premium-Verzweigung, Scope-Filter-Erweiterung, temporärer `AR_TYP`-Fix — kein mechanisches Abtippen)

**Abhängigkeit:** Task 1 (P27/P28 müssen existieren, damit die Konsolen-Verifikation unten die Spec-Werte liefert; Norbert-Frey-Tweak wird hier noch nicht ausgewertet, erst Task 4).

**Bezug:** Spec §3.1 (`nachsorge`-Formel), Architekten-Ergänzung (3) (temporärer `AR_TYP`-Fix).

**Warum die übrigen Blöcke unangetastet bleiben müssen:** `anlaesse()` liefert auch `geburtstag`/`jubilaeum`/`wiederbedarf` sowie alle sechs `zuweiser-*`-Typen — Thema anderer Runden/Specs (Spec §10 Nicht-Ziele). Dieser Task ändert **ausschließlich** die Einfügung eines neuen `personen.forEach`-Blocks und die eine Scope-Filter-Zeile.

**Dateien/Anker:** `grep -n "^function anlaesse\|const key=\"jub:\"|radar.forEach(r=>{\|if(scope===\"patienten\")" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `anlaesse()` beginnt Zeile 5141, geburtstag-Block 5143-5149, jubilaeum-Block 5150-5158, `radar.forEach` (wiederbedarf) beginnt Zeile 5159, Scope-Filter „patienten" Zeile 5238.

**Schritte:**

- [ ] **2.1** `grep`-Befehl oben ausführen, den vollständigen `anlaesse()`-Körper neu lesen. Vor der Bearbeitung: die Zeilen des `jubilaeum`-Blocks und des `radar.forEach`-Blocks (Wiederbedarf) in eine Diff-Referenz kopieren — nach der Bearbeitung müssen diese Zeilen **byte-identisch** bleiben (nur eine neue Zeilengruppe wird dazwischen eingefügt).

- [ ] **2.2 — `nachsorge`-Block einfügen**, direkt nach dem `jubilaeum`-Block, vor `radar.forEach(r=>{` (Spec §3.1, wörtlich):
```diff
  personen.forEach(p=>{
   if(!p.sterne||p.sterne<3)return;
   const ent=(p.historie||[]).filter(h=>h.typ==="entlassung").map(h=>h.d).sort().pop();
   if(!ent)return;
   const g=paGeb(ent);if(!g||g.tage>30)return;
   const geste=arGeste(p);if(!geste)return;
   const key="jub:"+p.pid;if(_arDone.has(key))return;
   out.push({key:key,typ:"jubilaeum",urg:g.tage<=7?"jetzt":"bald",tage:g.tage,titel:p.name+" — "+g.wird+". Entlass-Jubiläum",sub:"Reha abgeschlossen am "+paDate(ent)+" · Jahrestag in "+g.tage+" Tagen",sterne:p.sterne,geste:geste,pid:p.pid});
  });
+ /* Runde 6 Punkt 6 (§3.1): nachsorge — 6-Wochen-Check nach Entlassung, Premium-Variante ab 5★.
+    Fenster bewusst einmalig 42-56 Tage (6.-8. Woche), analog zum zuweiser-bericht-Fenster [0,14]. */
+ personen.forEach(p=>{
+  if(!p.sterne||p.sterne<2)return;
+  if(!p.einwilligung||p.einwilligung.status!=="erteilt")return;
+  const ent=(p.historie||[]).filter(h=>h.typ==="entlassung").map(h=>h.d).sort().pop();
+  if(!ent)return;
+  const tage=Math.round((heute-new Date(ent))/86400000);
+  if(tage<42||tage>56)return;
+  const key="nach:"+p.pid;if(_arDone.has(key))return;
+  const premium=p.sterne>=5;
+  out.push({key,typ:"nachsorge",urg:tage<=45?"jetzt":"bald",tage,titel:p.name,
+   sub:"Reha vor "+tage+" Tagen abgeschlossen — "+(premium
+    ?"Persönlicher Nachsorge-Anruf durch Bezugstherapeutin anbieten."
+    :"Nachsorge-Check anbieten (6-Wochen-Kontakt)."),
+   sterne:p.sterne,
+   geste:premium?{label:"Persönlicher Nachsorge-Anruf",cta:"Anruf durch Bezugstherapeutin"}
+               :{label:"Nachsorge-Check",cta:"Nachsorge-Check anbieten"},
+   pid:p.pid});
+ });
  radar.forEach(r=>{
```

- [ ] **2.3 — Scope-Filter „patienten" erweitern** (Spec §3.1, letzter Satz):
```diff
- if(scope==="patienten")return sorted.filter(a=>a.typ==="geburtstag"||a.typ==="jubilaeum"||a.typ==="wiederbedarf");
+ if(scope==="patienten")return sorted.filter(a=>a.typ==="geburtstag"||a.typ==="jubilaeum"||a.typ==="wiederbedarf"||a.typ==="nachsorge");
```

- [ ] **2.4 — temporärer `AR_TYP`-Fix** (Architekten-Ergänzung (3) — verhindert „undefined"-Text in der noch nicht umgebauten Block-A-Ansicht zwischen diesem Task und Task 3; wird in Task 6 zusammen mit `AR_TYP` als Ganzes entfernt):
```diff
- const AR_TYP={geburtstag:"Geburtstag",jubilaeum:"Entlass-Jubiläum",wiederbedarf:"Wiederbedarf"};
+ /* TEMPORÄR (Runde 6 Punkt 6+7, Task 2→6): nachsorge hier nur, damit arCard() zwischen Task 2 und
+    Task 3 kein "undefined"-Label rendert. Entfällt in Task 6 zusammen mit AR_TYP als Ganzes. */
+ const AR_TYP={geburtstag:"Geburtstag",jubilaeum:"Entlass-Jubiläum",wiederbedarf:"Wiederbedarf",nachsorge:"Nachsorge"};
```
  (`AR_FOTO` bleibt unverändert — kannte ohnehin nur `geburtstag`/`wiederbedarf`, kein Fix nötig; fehlender Eintrag für `nachsorge` erzeugt keinen Fehlertext, nur keinen Foto-Streifen, per bestehender `(AR_FOTO[a.typ])?...:""`-Ternary.)

- [ ] **2.5** `grep -n "typ:\"nachsorge\"\|nach:\"\|a.typ===\"nachsorge\"" index.html` ausführen — mehrere Treffer (neuer Block + Scope-Filter), keiner davon im `geburtstag`/`jubilaeum`/`wiederbedarf`/`zuweiser-*`-Code.

- [ ] **2.6 — Diff-Kontrolle:** `sed -n '<jubilaeum-Start>,<jubilaeum-Ende>p;<wiederbedarf-Start>,<wiederbedarf-Ende>p' index.html` (Zeilen per grep aus 2.1 neu bestimmen) gegen die vor 2.1 kopierte Referenz vergleichen — **0 Zeilen-Diff**.

- [ ] **2.7 — Standard-Verifikation bei 390px UND 1440px, ausführlich (Konsole, gegen Spec §3.1/§3.3):**
  - `anlaesse("patienten").filter(a=>a.typ==="nachsorge").map(a=>({t:a.titel,tage:a.tage,urg:a.urg}))` ergibt `[{t:"Anton Weiss",tage:45,urg:"jetzt"},{t:"Rosa Klein",tage:49,urg:"bald"}]` (Reihenfolge nach `tage` aufsteigend durch die bestehende Sortierung).
  - `anlaesse("patienten").find(a=>a.titel==="Anton Weiss").sub` beginnt mit `"Reha vor 45 Tagen abgeschlossen — Persönlicher Nachsorge-Anruf durch Bezugstherapeutin anbieten."`.
  - `anlaesse("patienten").find(a=>a.titel==="Rosa Klein").sub` beginnt mit `"Reha vor 49 Tagen abgeschlossen — Nachsorge-Check anbieten (6-Wochen-Kontakt)."`.
  - `anlaesse("patienten").every(a=>["geburtstag","jubilaeum","wiederbedarf","nachsorge"].includes(a.typ))` ergibt `true`.
  - `anlaesse("zuweiser")` bleibt unverändert gegenüber dem Stand vor diesem Task (Diff-Kontrolle 2.6 bereits erledigt, hier nur Typ-Whitelist gegenprüfen: `anlaesse("zuweiser").every(a=>a.typ.startsWith("zuweiser-"))` ergibt `true`).
  - **Optischer Zwischenzustand (erwartet, temporär):** Im Reiter „Aktionen & Anlässe" erscheinen jetzt bis zu zwei neue Karten (Anton Weiss/Rosa Klein) im alten `arCard()`/`.radar-card`-Layout (noch keine Wochen-Gruppierung, noch `.ar-grid`), mit korrektem Label „Nachsorge" (dank 2.4) statt „undefined". Wird erst in Task 3 durch `.zwa-*`-Karten mit Gruppierung ersetzt.
  - 0 Console-Errors.

**Sichtprüfung:** „Aktionen & Anlässe" zeigt zwei neue Karten (Anton Weiss/Rosa Klein) mit korrektem „Nachsorge"-Label und den neuen medizinisch-kollegialen Texten — noch im alten `.radar-card`-Layout, ohne Wochen-Gruppierung. Das ist der erwartete, dokumentierte Zwischenstand.

**Commit:** `feat: anlaesse() nachsorge-Block — 6-Wochen-Check nach Entlassung mit Premium-Variante ab 5★ (Fenster 42-56 Tage), Scope-Filter „patienten" erweitert, temporärer AR_TYP-Fix (Runde 6 Punkt 6+7, §3.1 + Architekten-Ergänzung 3)`

---

# Task 3 — Block A: `paaKarte()`/`renderPatientenAnlaesse()` ersetzt `arCard()` in `renderRadar()`

**Lane:** `claude-implementer-pro` (Verdrahtung eines neuen, String-zurückgebenden Renderers anstelle der bestehenden Inline-IIFE, Gruppierungs-Logik Diese-Woche/Demnächst, `.zwa-*`-Wiederverwendung)

**Abhängigkeit:** Task 2 (`anlaesse("patienten")` muss bereits `nachsorge` liefern, sonst fehlen die zwei erwarteten Karten in der Abnahme).

**Bezug:** Spec §5.1 (`paaKarte()`, Gruppierung), Architekten-Ergänzungen (1)+(2) (String-Rückgabe statt eigenem DOM-Element, Einfügeort nach `renderZuweiserAnlaesse()`).

**Dateien/Anker:** `grep -n "^function renderZuweiserAnlaesse\|oth.map(arCard)\|Baustein C · Belegungs-Forecast" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `renderZuweiserAnlaesse()` endet Zeile 5304 (schließende `}`), Belegungs-Forecast-Kommentar Zeile 5305, die alte Inline-IIFE in `renderRadar()` liegt bei Zeile 5536.

**Schritte:**

- [ ] **3.1** `grep`-Befehl oben ausführen, exakte aktuelle Zeilen bestätigen. Zusätzlich `grep -n "arCard(" index.html` ausführen — bestätigen, dass Zeile 5536 (bzw. die neue Zeilennummer) weiterhin der **einzige** verbleibende Aufruf ist (kein zweiter Aufrufer irgendwo im Dokument).

- [ ] **3.2 — `PAA_TYP`/`paaKarte()`/`renderPatientenAnlaesse()` einfügen**, direkt nach `renderZuweiserAnlaesse()` (wörtlich aus Spec §5.1, `renderPatientenAnlaesse()` als String-Rückgabe gemäß Architekten-Ergänzung (1)):
```js
/* Runde 6 Punkt 6+7 (§5.1): .zwa-* wiederverwendet aus P5 — eigene Etiketten-Karten für die
   individuellen Patienten-Anlässe (Geburtstag/Entlass-Jubiläum/Nachsorge), ersetzt arCard()/
   .radar-card in renderRadar(). Wiederbedarf bleibt unverändert (Spec §5.2 — eigene, bereits gute
   Kartenoptik mit Lock-Status). renderPatientenAnlaesse() gibt einen HTML-String zurück (kein
   eigenes Zielelement wie #zAnlaesse — Block A ist Teil von renderRadar()s einer #radarHost-innerHTML). */
const PAA_TYP={geburtstag:{ico:"✦",label:"Geburtstag"},jubilaeum:{ico:"❖",label:"Entlass-Jubiläum"},
 nachsorge:{ico:"✚",label:"Nachsorge"}};
function paaKarte(a){
 const t=PAA_TYP[a.typ]||{ico:"•",label:""};
 const dueTxt=a.tage===0?"heute":"in "+a.tage+" Tagen";
 return "<div class='zwa-card'>"
  +"<div class='zwa-head'><span class='zwa-ico'>"+t.ico+"</span><span class='zwa-typ'>"+t.label+"</span>"
  +"<span class='radar-due "+a.urg+"' style='margin-left:auto'>"+dueTxt+"</span></div>"
  +"<div class='zwa-name'>"+escapeHtml(a.titel)+"</div>"
  +(a.sterne?"<div class='ar-cardstars'>"+sterneHtml(a.sterne)+"</div>":"")
  +"<p class='zwa-text'>"+escapeHtml(a.sub)+"</p>"
  +"<div class='zwa-foot'><button class='btn-ghost btn-sm' onclick='arAktion(\""+a.key.replace(/"/g,"&quot;")+"\")'>Erledigt ✓</button></div>"
  +"</div>";
}
function renderPatientenAnlaesse(){
 const anl=anlaesse("patienten").filter(a=>a.typ!=="wiederbedarf");
 if(!anl.length)return"";
 const woche=anl.filter(a=>a.urg==="jetzt"), demnaechst=anl.filter(a=>a.urg==="bald");
 return "<div class='ar-feedhead'>Individuelle Anlässe</div>"
  +(woche.length?"<div class='ar-feedhead'>Diese Woche</div><div class='zwa-group'>"+woche.map(paaKarte).join("")+"</div>":"")
  +(demnaechst.length?"<div class='ar-feedhead'>Demnächst</div><div class='zwa-group'>"+demnaechst.map(paaKarte).join("")+"</div>":"")
  +"<div class='ar-feedhead'>Wiederbedarf (medizinische Prognose)</div>";
}
```
  **Hinweis zur `if(!anl.length)`-Kopplung:** repliziert exakt das bestehende Verhalten der alten IIFE (`oth.length?...:""`) — bleiben bei 0 individuellen Anlässen sowohl der „Individuelle Anlässe"- als auch der „Wiederbedarf"-Titel weg, unverändert gegenüber dem Ist-Stand (Surgical Changes — kein Fixbedarf für diesen vorbestehenden Rand-Fall, der zudem mit den P27/P28-Seeds derzeit nie eintritt).

- [ ] **3.3 — `renderRadar()` verdrahten** — alte Inline-IIFE durch Funktionsaufruf ersetzen:
```diff
   +rhead
-  +(function(){const oth=anlaesse("patienten").filter(a=>a.typ!=="wiederbedarf");return oth.length?"<div class='ar-feedhead'>Anlässe (Geburtstage & Jubiläen)</div><div class='ar-grid'>"+oth.map(arCard).join("")+"</div><div class='ar-feedhead'>Wiederbedarf (medizinische Prognose)</div>":"";})()
+  +renderPatientenAnlaesse()
   +"<div class='radar-grid'>"+sorted.map(([r,i])=>{
```

- [ ] **3.4** `grep -n "function renderPatientenAnlaesse\|function paaKarte\|renderPatientenAnlaesse()" index.html` ausführen — Funktionsdefinitionen je 1 Fundstelle, Aufruf 1 Fundstelle (innerhalb `renderRadar()`).

- [ ] **3.5** `grep -n "arCard(" index.html` erneut ausführen — **0 Treffer** mehr (Funktionsdefinition `function arCard(a,i){` selbst ist noch kein „Aufruf", zählt hier nicht als Treffer für das reine Aufruf-Pattern `arCard(a` mit vorangehendem `.map(` o.ä. — zur Kontrolle gezielt `grep -n "\.map(arCard)\|=arCard(" index.html` ausführen, **0 Treffer**). Die Funktion `arCard()` selbst existiert bis Task 6 noch, aber unaufgerufen.

- [ ] **3.6 — Standard-Verifikation bei 390px UND 1440px, ausführlich (gegen Spec §9 Punkt 1-4):**
  - `#radarHost` zeigt jetzt `.zwa-card`-Elemente unter „Individuelle Anlässe", **keine** `.radar-card`/`.ar-grid`-Ausgabe mehr für Geburtstag/Jubiläum/Nachsorge.
  - „Diese Woche" (Anton Weiss — Premium-Nachsorge-Anruf, `jetzt`) / „Demnächst" (Rosa Klein — Nachsorge-Check, `bald`, plus bestehende Geburtstags-/Jubiläums-Karten je nach Kalenderdatum von `heute`).
  - Klick auf „Erledigt ✓" bei Anton Weiss' Karte: Karte verschwindet sofort aus dem DOM (Session-Set `_arDone`, kehrt nach Reload zurück), Demo-Toast erscheint (`arAktion()` unverändert).
  - Wiederbedarf-Sektion (Kalender-Icon, Datum, Sterne, Prognose, ggf. gesperrter Walter Simon mit „Kontaktfreigabe fehlt") **unverändert** — eigene Kartenoptik, kein `.zwa-card`.
  - 390px: `.zwa-head` (`flex-wrap`) bricht ohne horizontalen Overflow um. 0 Console-Errors.

**Sichtprüfung:** „Aktionen & Anlässe" zeigt die neuen Etiketten-Karten unter „Individuelle Anlässe", gruppiert nach „Diese Woche"/„Demnächst", visuell klar unterscheidbar vom alten `.radar-card`-Text-Layout; Wiederbedarf-Sektion unverändert darunter.

**Commit:** `feat: renderPatientenAnlaesse()/paaKarte() — Block „Individuelle Anlässe" komplett auf .zwa-Etiketten-Layout umgestellt (Diese Woche/Demnächst), ersetzt arCard()-Aufruf in renderRadar() (Runde 6 Punkt 6+7, §5.1)`

---

# Task 4 — Block B: `PAT_REGELN`/`parKarte()`/Toggle + Live-Empfänger-Zählung

**Lane:** `claude-implementer-pro` (vier Regel-Objekte, deterministische Kalenderanker-Formel, Empfänger-Filter mit optionalem Ruhe-Kriterium, Session-Toggle — Logik-Task, kein mechanisches Abtippen)

**Abhängigkeit:** Task 1 (Norbert-Frey-Tweak muss gesetzt sein, damit Regel 4 in der Verifikation N=1 statt N=0 liefert). Keine funktionale Abhängigkeit von Task 2/3 (liest `bestand[]`, nicht `anlaesse()`), läuft aber sequenziell danach.

**Bezug:** Spec §3.2 (`PAT_REGELN`, `patRegelLauf()`, `patRegelEmpfaenger()`), §5.3 (`parKarte()`, `renderPatRegelnHtml()`), §4 (Empfänger-Tabelle, N=4/8/1/1), Architekten-Ergänzung (2) (Einfügeort vor `dbCockpit()`).

**Dateien/Anker:** `grep -n "^function dbCockpit\|^function renderRadar" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `dbCockpit()` beginnt Zeile 5465 (bzw. verschoben durch Task 2/3-Einfügungen), `renderRadar()` beginnt entsprechend später.

**Schritte:**

- [ ] **4.1** `grep`-Befehl oben ausführen, exakte aktuelle Zeile von `dbCockpit()` und `renderRadar()`s Ende bestätigen.

- [ ] **4.2 — `PAT_REGELN`/`patRegelLauf()`/`patRegelEmpfaenger()`/`patRegelnAn`/`parToggle()`/`parKarte()`/`renderPatRegelnHtml()` einfügen**, direkt vor `function dbCockpit(){` (wörtlich aus Spec §3.2/§5.3):
```js
/* Runde 6 Punkt 6+7 (§3.2): PAT_REGELN — Automatik-Regeln für Patienten-Gruppen (Newsletter/
   Gesundheitsbrief/Jahresimpuls/Reaktivierung). Empfänger-Pool = bestand[] (identisch mit
   dbCockpit()/Stammdaten) — aktive Patienten (lebenszyklus:"patient") sind bewusst NICHT im Pool. */
const PAT_REGELN=[
 {id:"newsletter-q",name:"Quartals-Newsletter",zielSterne:[3,4,5],
  zielLabel:"3★ und mehr, mit Einwilligung",rhythmus:"quartalsweise",
  aktion:"Quartals-Newsletter mit Reha-/Gesundheitsthemen versenden",anker:"quartal"},
 {id:"gesundheitsbrief",name:"Gesundheitsbrief & Broschüre",zielSterne:[2,3,4,5],
  zielLabel:"2★ und mehr, mit Einwilligung",rhythmus:"halbjährlich",
  aktion:"Gesundheitsbrief + Broschüre versenden",anker:"halbjahr"},
 {id:"jahresimpuls",name:"SalutoCare-Jahresimpuls",zielSterne:[5],
  zielLabel:"5★, mit Einwilligung",rhythmus:"jährlich, persönlich",
  aktion:"Persönlichen Jahresimpuls (Brief + Anruf durch Recovery Manager) senden",
  anker:{monat:11,tag:1}},
 {id:"reaktivierung",name:"Reaktivierung ruhender Kontakte",zielSterne:[1,2],
  zielLabel:"1-2★, ohne Kontakt seit über 12 Monaten, mit Einwilligung",rhythmus:"jährlich",
  aktion:"Reaktivierungs-Anschreiben senden",anker:{monat:1,tag:1},ruhendAbTage:365}
];
let patRegelnAn={"newsletter-q":true,"gesundheitsbrief":true,"jahresimpuls":true,"reaktivierung":true};
function parToggle(id){patRegelnAn[id]=!patRegelnAn[id];renderRadar();}
/* patRegelLauf() — nächster Kalenderanker ab heute, rein datumsbasiert, kein Math.random. */
function patRegelLauf(regel){
 if(regel.anker==="quartal"){const qm=Math.floor(heute.getMonth()/3)*3;return new Date(heute.getFullYear(),qm+3,1);}
 if(regel.anker==="halbjahr")return heute.getMonth()<6?new Date(heute.getFullYear(),6,1):new Date(heute.getFullYear()+1,0,1);
 let d=new Date(heute.getFullYear(),regel.anker.monat,regel.anker.tag);
 if(d<heute)d=new Date(heute.getFullYear()+1,regel.anker.monat,regel.anker.tag);
 return d;
}
/* patRegelEmpfaenger() — live gegen bestand[]: consent=ja + Sterne-Bucket + optionales Ruhe-Kriterium. */
function patRegelEmpfaenger(regel){
 return bestand.filter(p=>{
  if(p.consent!=="ja")return false;
  if(!regel.zielSterne.includes(sterneVon(p)))return false;
  if(regel.ruhendAbTage){
   const per=p.personId?person(p.personId):null;
   const h=per&&per.historie&&per.historie.length?per.historie[per.historie.length-1].d:null;
   const tage=h?Math.round((heute-new Date(h))/86400000):0;
   if(tage<regel.ruhendAbTage)return false;
  }
  return true;
 });
}
function parKarte(regel){
 const empf=patRegelEmpfaenger(regel);
 const an=patRegelnAn[regel.id];
 const laufTxt=an
  ?"Nächster Lauf: "+paDate(patRegelLauf(regel).toISOString().slice(0,10))+" · "+empf.length+" Empfänger"
  :"Pausiert — kein automatischer Lauf";
 return "<div class='zwa-card'>"
  +"<div class='zwa-head'><span class='zwa-name' style='margin:0;font-size:17px'>"+escapeHtml(regel.name)+"</span>"
  +"<label class='par-toggle'><input type='checkbox' "+(an?"checked":"")+" onchange='parToggle(\""+regel.id+"\")'><span class='par-slider'></span></label></div>"
  +"<p class='zwa-text'>Zielgruppe: "+escapeHtml(regel.zielLabel)+" · Aktion: "+escapeHtml(regel.aktion)+" ("+escapeHtml(regel.rhythmus)+")</p>"
  +"<div class='par-foot"+(an?"":" muted")+"'>"+laufTxt+"</div>"
  +"</div>";
}
function renderPatRegelnHtml(){
 return "<div class='ar-feedhead'>Automatik-Regeln</div>"
  +"<p class='db-intro'>Regeln laufen automatisch — Versand nur an Kontakte mit Einwilligung.</p>"
  +"<div class='zwa-group'>"+PAT_REGELN.map(parKarte).join("")+"</div>";
}
```

- [ ] **4.3 — `renderRadar()` verdrahten** — `renderPatRegelnHtml()` ans Ende der `#radarHost`-Zusammensetzung anhängen:
```diff
   +"<div class='radar-grid'>"+sorted.map(([r,i])=>{
      ...
-   }).join("")+"</div>";
+   }).join("")+"</div>"+renderPatRegelnHtml();
  }
```

- [ ] **4.4** `grep -n "^const PAT_REGELN\|^function patRegelLauf\|^function patRegelEmpfaenger\|^let patRegelnAn\|^function parToggle\|^function parKarte\|^function renderPatRegelnHtml\|renderPatRegelnHtml()" index.html` ausführen — je 1 Fundstelle Definition, Aufruf 1 Fundstelle.

- [ ] **4.5 — Standard-Verifikation bei 390px UND 1440px, ausführlich (Konsole, gegen Spec-Tabelle §4):**
  - `patRegelEmpfaenger(PAT_REGELN[0]).length` (Quartals-Newsletter) ergibt `4`.
  - `patRegelEmpfaenger(PAT_REGELN[1]).length` (Gesundheitsbrief) ergibt `8`.
  - `patRegelEmpfaenger(PAT_REGELN[2]).length` (Jahresimpuls) ergibt `1`.
  - `patRegelEmpfaenger(PAT_REGELN[3]).length` (Reaktivierung) ergibt `1` (Norbert Frey, dank Task-1-Tweak — ohne Tweak wäre dies `0`).
  - `patRegelLauf(PAT_REGELN[0]).toISOString().slice(0,10)` ergibt `"2026-10-01"`.
  - `patRegelLauf(PAT_REGELN[1]).toISOString().slice(0,10)` ergibt `"2027-01-01"`.
  - `patRegelLauf(PAT_REGELN[2]).toISOString().slice(0,10)` ergibt `"2026-12-01"`.
  - `patRegelLauf(PAT_REGELN[3]).toISOString().slice(0,10)` ergibt `"2027-02-01"`.
  - UI: vier Karten unter „Automatik-Regeln" — „Quartals-Newsletter" 01.10.2026 · 4 Empfänger, „Gesundheitsbrief & Broschüre" 01.01.2027 · 8, „SalutoCare-Jahresimpuls" 01.12.2026 · 1, „Reaktivierung ruhender Kontakte" 01.02.2027 · 1.
  - Toggle-Klick auf eine Karte (z. B. Quartals-Newsletter): Text wechselt zu „Pausiert — kein automatischer Lauf", Karte optisch gedimmt (`.par-foot.muted`); erneuter Klick stellt Lauf-Datum + Empfängerzahl wieder her. Seiten-Reload setzt alle Toggles zurück auf „an" (Session-State, `let patRegelnAn`, keine Persistenz).
  - 390px: `.par-toggle` kein Overflow, `.zwa-head` bricht bei Bedarf um. 0 Console-Errors.

**Sichtprüfung:** „Aktionen & Anlässe" zeigt unter „Individuelle Anlässe" jetzt zusätzlich den Block „Automatik-Regeln" mit vier Karten, live berechneten Empfängerzahlen und funktionierendem Toggle.

**Commit:** `feat: PAT_REGELN/parKarte()/Toggle — Automatik-Regeln-Block mit live berechneter Empfängerzahl gegen bestand[] (4/8/1/1), deterministischer Kalenderanker, Session-Pause-Toggle (Runde 6 Punkt 6+7, §3.2/§5.3 + Architekten-Ergänzung 2)`

---

# Task 5 — `dbDetail`: passive Automatik-Regeln-Zeile

**Lane:** `claude-implementer-pro` (reine Informations-Zeile, Objekt-Identitätsprüfung gegen `bestand[]`, kein Button/CTA — Sorgfaltspflicht: darf keine Aktions-Möglichkeit einführen)

**Abhängigkeit:** Task 4 (`PAT_REGELN`/`patRegelLauf()`/`patRegelEmpfaenger()` müssen existieren).

**Bezug:** Spec §6 (`patAutomatikText()`, `dbBody`-Zeile), §7 (Ranking-Bestandsaufnahme — keine Änderung an Sterne/Label/Begründung).

**Dateien/Anker:** `grep -n "^function openDbDetail\|di-row.*Begründung\|di-row.*Quelle" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `openDbDetail()` beginnt Zeile 5550 (bzw. verschoben durch vorherige Tasks), Begründung-Zeile und Quelle-Zeile direkt danach im `dbBody`-Template.

**Schritte:**

- [ ] **5.1** `grep`-Befehl oben ausführen, `openDbDetail()`s `dbBody`-Template-String vollständig neu lesen — insbesondere die Reihenfolge der `.di-row`-Zeilen (Einwilligung → Achse → Einstufung → [bedingt] Begründung → Quelle) bestätigen.

- [ ] **5.2 — `patAutomatikText(p)` einfügen**, direkt vor `function openDbDetail(i){` (Spec §6, wörtlich):
```js
/* Runde 6 Punkt 6+7 (§6): patAutomatikText() — zeigt, welche PAT_REGELN auf die geöffnete Person
   zutreffen. Reine Information, kein Button — Stammdaten bleiben eine reine Daten-Ansicht (P7). */
function patAutomatikText(p){
 const treffer=PAT_REGELN.filter(r=>patRegelnAn[r.id]&&patRegelEmpfaenger(r).some(e=>e===p));
 if(!treffer.length)return"Keine aktive Automatik-Regel";
 return treffer.map(r=>escapeHtml(r.name)+" · nächster Lauf "+paDate(patRegelLauf(r).toISOString().slice(0,10))).join("<br>");
}
```

- [ ] **5.3 — neue `.di-row` in `dbBody` einfügen**, zwischen der (bedingten) Begründung-Zeile und der Quelle-Zeile:
```diff
    +((p.personId&&person(p.personId)&&person(p.personId).sterneGrund)?"<div class='di-row'><span class='di-k'>Begründung</span><span>"+escapeHtml(person(p.personId).sterneGrund)+"</span></div>":"")
+   +"<div class='di-row'><span class='di-k'>Automatik-Regeln</span><span>"+patAutomatikText(p)+"</span></div>"
    +"<div class='di-row'><span class='di-k'>Quelle</span><span>"+escapeHtml(p.quelle||"—")+"</span></div>"
```
  **Kein `escapeHtml()` auf `patAutomatikText(p)`s Rückgabewert nötig** — die Funktion escaped Regel-Namen bereits intern, das `<br>` ist bewusstes HTML (Zeilenumbruch zwischen mehreren Regeln), kein dynamischer Nutzer-Text.

- [ ] **5.4** `grep -n "function patAutomatikText\|patAutomatikText(p)" index.html` ausführen — Definition 1 Fundstelle, Aufruf 1 Fundstelle (innerhalb `dbBody`-Template).

- [ ] **5.5 — Grep-Kontrolle „keine neuen Buttons in Stammdaten"** (Pflicht laut Spec §1(c)/Auftrag): `sed -n '<openDbDetail-Start>,<openDbDetail-Ende>p' index.html | grep -n "button\|onclick"` (Zeilen aus 5.1 neu bestimmen) — **0 Treffer** innerhalb der neuen Automatik-Zeile selbst (der bestehende `onclick='openDbDetail(i)'`-Navigationsbutton in `renderBestand()`s `row()` ist ein anderer, unveränderter Ort und kein Treffer in diesem Ausschnitt).

- [ ] **5.6 — Standard-Verifikation bei 390px UND 1440px, ausführlich (Konsole, gegen Spec §6):**
  - `patAutomatikText(bestand.find(p=>p.name==="Gerda Sommer"))` ergibt `"Quartals-Newsletter · nächster Lauf 01.10.2026<br>Gesundheitsbrief & Broschüre · nächster Lauf 01.01.2027"`.
  - `patAutomatikText(bestand.find(p=>p.name==="Norbert Frey"))` ergibt `"Gesundheitsbrief & Broschüre · nächster Lauf 01.01.2027<br>Reaktivierung ruhender Kontakte · nächster Lauf 01.02.2027"`.
  - `patAutomatikText(bestand.find(p=>p.name==="Hannelore Beck"))` ergibt `"Keine aktive Automatik-Regel"`.
  - UI (Desktop 1440px, `dbDetail` öffnet nur ab `min-width:1024px`): Gerda Sommer, Norbert Frey, Hannelore Beck je in der Stammdaten-Liste anklicken — neue Zeile „Automatik-Regeln" erscheint zwischen Begründung und Quelle, zeigt exakt die obigen Texte, **kein Button/`onclick`** in dieser Zeile.
  - Sterne+Label+Begründung in `dbDetail` unverändert (Spec §7 — keine Code-Änderung dort).
  - 390px: `dbDetail`-Panel öffnet auf Mobile ohnehin nicht (`matchMedia("(min-width:1024px)")`-Guard, unverändert) — nur visuell/strukturell auf 390px prüfen, dass `renderBestand()`/`dbCockpit()` unverändert aussehen. 0 Console-Errors.

**Sichtprüfung:** `dbDetail` zeigt bei jeder Person eine neue, passive Automatik-Regeln-Zeile ohne jede Aktionsmöglichkeit — Stammdaten bleiben eine reine Daten-Ansicht.

**Commit:** `feat: patAutomatikText()/dbBody-Automatik-Zeile — passive Info-Zeile in dbDetail zeigt zutreffende PAT_REGELN, kein Button/CTA (Runde 6 Punkt 6+7, §6/§7)`

---

# Task 6 — Waisen-Entfernung (`arCard()`/`AR_TYP`/`AR_FOTO`/`.ar-grid`) + finaler CDP-Abnahme-Sweep

**Lane:** `claude-implementer-pro` (Verifikations-lastiger Abschluss-Task; bei einem kleinen Fund direkt hier fixen, kein neuer Task nötig — bei größeren Funden: stoppen, im Report melden statt selbst zu improvisieren)

**Abhängigkeit:** braucht alle vorherigen Tasks (1-5). Erst jetzt ist `arCard()` nachweislich nie mehr aufrufbar (`renderRadar()` ruft seit Task 3 `renderPatientenAnlaesse()`/`paaKarte()`).

**Bezug:** Spec §8 (Waisen-Tabelle), §9 (Abnahmekriterien, vollständig, alle 10 Punkte).

**Dateien/Anker:** `grep -n "^const AR_TYP\|^const AR_FOTO\|^function arCard\|\.ar-grid" index.html` vor Bearbeitung ausführen — alle Fundstellen bestätigen.

**Schritte:**

- [ ] **6.1** `grep`-Befehl oben ausführen. Zusätzlich `grep -n "arCard(\|AR_TYP\[\|AR_FOTO\[" index.html` ausführen — bestätigen: **0 Aufrufer** von `arCard(` (nur noch die Funktionsdefinition selbst `function arCard(a,i){`), `AR_TYP[`/`AR_FOTO[` nur noch innerhalb der `arCard()`-Funktion selbst gelesen.

- [ ] **6.2 — Konsistenz-Check „Radar-B2C-Feed" (Auftrags-Pflichtprüfung):** `grep -n "^function renderAnlaesse" index.html` ausführen, Funktionskörper lesen. Bestätigen: `renderAnlaesse()` setzt nur `rlCountPat`/`rlCountZuw` über `anlaesse("patienten").length`/`anlaesse("zuweiser").length` — **typ-agnostisch**, zählt `nachsorge` automatisch mit (kein `arCard()`-Aufruf, kein Kartenrendering, keine Änderung nötig). Konsole: `document.getElementById("rlCountPat").textContent` nach Seitenaufruf ergibt dieselbe Zahl wie `anlaesse("patienten").length` (inkl. `nachsorge`-Einträge).

- [ ] **6.3 — `arCard()`/`AR_TYP`/`AR_FOTO` entfernen** (vollständige Funktion + beide Konstanten, keine Teilentfernung nötig, da 0 Aufrufer mehr):
```diff
- const AR_TYP={geburtstag:"Geburtstag",jubilaeum:"Entlass-Jubiläum",wiederbedarf:"Wiederbedarf",nachsorge:"Nachsorge"};
- const AR_FOTO={geburtstag:["kb-garten.webp","rose"],wiederbedarf:["kb-haus.webp","sage"]};
- function arCard(a,i){
-  const perName=a.pid&&person(a.pid)?person(a.pid).name:a.titel;
-  const due=a.urg==="beob"?"im Blick":"in "+a.tage+" Tagen";
-  const dueCls=a.urg;
-  const strip=(AR_FOTO[a.typ])?"<figure class='au-photo au-photo--"+AR_FOTO[a.typ][1]+"'><img src='assets/"+AR_FOTO[a.typ][0]+"' alt='' loading='lazy'></figure>":"";
-  return "<div class='radar-card ar-rc' style='--acol:var(--brass)'>"
-   +strip
-   +"<div class='patient-top'><span class='ava'>"+initialen(perName)+"</span><span class='radar-due "+dueCls+"'>"+due+"</span></div>"
-   +"<h3>"+escapeHtml(a.titel)+"</h3>"
-   +(a.sterne?"<div class='ar-cardstars'>"+sterneHtml(a.sterne)+"</div>":"")
-   +"<div class='patient-meta'>"+AR_TYP[a.typ]+"</div>"
-   +"<div class='radar-prog'><span class='rk'>Anlass</span>"+escapeHtml(a.sub)+"</div>"
-   +"<div class='radar-prog'><span class='rk'>Empfohlene Geste</span>"+escapeHtml(a.geste.label)+"</div>"
-   +"<div class='patient-actions'><button class='btn-ghost btn-sm' onclick='arAktion(\""+a.key.replace(/"/g,"&quot;")+"\")'>"+escapeHtml(a.geste.cta)+" ›</button></div>"
-   +"</div>";
- }
```

- [ ] **6.4 — `.ar-grid`-CSS-Waisen entfernen** (inkl. der beiden Kind-Selektoren + Media-Query, **nicht** `.ar-feedhead`/`.ar-cardstars` — beide weiterhin von `paaKarte()`/`renderZuweiserAnlaesse()`/Wiederbedarf-Karten genutzt):
```diff
-.ar-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}
-.ar-grid .radar-card{height:100%;display:flex;flex-direction:column}
-.ar-grid .radar-card .patient-actions{margin-top:auto}
 .ar-feedhead{font:600 10.5px/1 Inter;letter-spacing:.07em;text-transform:uppercase;color:var(--brass-deep);margin:18px 0 10px}
 .ar-cardstars{margin:2px 0 4px}
-@media(max-width:520px){.ar-grid{grid-template-columns:1fr}}
```

- [ ] **6.5** `grep -n "arCard\|AR_TYP\|AR_FOTO\|\.ar-grid" index.html` ausführen — **0 Treffer** im gesamten Dokument.

- [ ] **6.6** `grep -c "@keyframes" index.html` — weiterhin genau **9**.

- [ ] **6.7 — `git diff --stat index.html`** ausführen (alle sechs Commits dieses Plans zusammen betrachtet) — bestätigen, dass **keine** Zeile innerhalb der `zuweiser[]`-, `faelle[]`-, `inReha[]`-, `bestand[]`- oder `radar[]`-Arrays verändert wurde (nur `personen[]` P27/P28 additiv + P19 Wert-Tweak, `anlaesse()`, `AR_TYP`/`AR_FOTO`/`arCard()` entfernt, `renderRadar()`, neue Funktionen `paaKarte`/`renderPatientenAnlaesse`/`PAT_REGELN`/`patRegelLauf`/`patRegelEmpfaenger`/`parToggle`/`parKarte`/`renderPatRegelnHtml`/`patAutomatikText`, `openDbDetail()`s `dbBody`-Zeile, zwei CSS-Blöcke `.par-*` hinzu/`.ar-grid` weg).

- [ ] **6.8 — Gesamt-Abnahme-Sweep, alle 10 Kriterien der Spec (§9) im Browser (idealerweise per CDP/Browser-Tool) durchspielen, bei 390px UND 1440px:**
  1. „Individuelle Anlässe" zeigt `.zwa-*`-Karten (kein `.radar-card`/`arCard()`-Rest): „Diese Woche" (Anton Weiss, `jetzt`) / „Demnächst" (Rosa Klein, `bald`, plus bestehende Geburtstags-/Jubiläums-Karten je nach Kalenderdatum).
  2. Nachsorge-Texte: Anton Weiss „Reha vor 45 Tagen abgeschlossen — Persönlicher Nachsorge-Anruf durch Bezugstherapeutin anbieten." (5★); Rosa Klein „Reha vor 49 Tagen abgeschlossen — Nachsorge-Check anbieten (6-Wochen-Kontakt)." (3★).
  3. „Erledigt"-Klick: Karte verschwindet sofort (Session-Set, kehrt nach Reload zurück).
  4. Wiederbedarf-Sektion unverändert: eigene Kartenoptik, Kalender-Icon, Datum, Sterne, Prognose, Walter Simon gesperrt mit „Kontaktfreigabe fehlt" — kein `.zwa-card`.
  5. Automatik-Regeln: vier Karten — „Quartals-Newsletter" 01.10.2026 · 4 Empfänger, „Gesundheitsbrief & Broschüre" 01.01.2027 · 8, „SalutoCare-Jahresimpuls" 01.12.2026 · 1, „Reaktivierung ruhender Kontakte" 01.02.2027 · 1.
  6. Toggle: Klick dimmt Karte auf „Pausiert — kein automatischer Lauf"; erneuter Klick stellt Lauf-Datum + Empfängerzahl wieder her (Session-scope, kein Reload-Persistenz).
  7. `dbDetail`-Automatik-Zeile: Gerda Sommer zeigt zwei Regel-Zeilen (Newsletter+Gesundheitsbrief), Norbert Frey Gesundheitsbrief+Reaktivierung, Hannelore Beck „Keine aktive Automatik-Regel" — kein Button in dieser Zeile.
  8. Stammdaten unverändert: `dbCockpit()`-Zahlen bleiben exakt wie vor dieser Spec (Rosa Klein/Anton Weiss sind bewusst NICHT in `bestand[]`), Sterne+Label+Begründung unverändert, **0** neue `onclick`/`<button>` in `renderBestand()`/`dbBody` außer der bereits bestehenden Zeilen-Navigation.
  9. Mobile (390px): `.par-toggle` kein Overflow, `.zwa-head` bricht um; Desktop (1440px) unverändert. 0 Console-Errors auf beiden Breiten; `grep -c "@keyframes" index.html` unverändert 9.
  10. Unberührte Bereiche: `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `#refOverlay`, `zuweiser[]`, `radar[]` (Struktur), `faelle[]`, `inReha[]`, P5s `zwaKarte()`/`zwSterne()`/`renderZuweiserAnlaesse()` unberührt (per 6.7 bestätigt).

**Sichtprüfung:** Kein `arCard`/`AR_TYP`/`AR_FOTO`/`.ar-grid`-Fragment mehr im Dokument; alle 10 Abnahmekriterien der Spec sind im Browser bei beiden Breiten grün; Cofounder-Bereiche unangetastet; „Aktionen & Anlässe" zeigt durchgehend zwei klar getrennte, etikettenförmige Blöcke (Individuelle Anlässe / Automatik-Regeln); Stammdaten bleiben eine reine, aktionsfreie Daten-Ansicht mit einer neuen passiven Info-Zeile.

**Commit:** `chore: arCard()/AR_TYP/AR_FOTO/.ar-grid-Waisen entfernt (nach renderPatientenAnlaesse()-Umstellung nicht mehr erreichbar), Radar-B2C-Feed-Konsistenz bestätigt, Gesamt-Abnahme-Sweep aller 10 Kriterien grün (Runde 6 Punkt 6+7, §8/§9)`

---

## Reihenfolge / Abhängigkeiten

```
Task 1 (Seeds: Rosa Klein/Anton Weiss additiv, Norbert-Frey-Tweak, .par-*-CSS)
      │  additiv/wert-tweakend, bootbar, CSS inert bis Task 4
      ▼
Task 2 (nachsorge-Block in anlaesse(), Scope-Filter-Fix, temporärer AR_TYP-Fix)
      │  braucht Task 1 für korrekte Konsolen-/Sicht-Verifikationswerte
      ▼
Task 3 (Block A: paaKarte()/renderPatientenAnlaesse(), ersetzt arCard()-Aufruf) ── braucht Task 2
      │                                                                            (nachsorge-Typ)
      ▼
Task 4 (Block B: PAT_REGELN/parKarte()/Toggle, Live-Empfänger-Zählung)
      │  braucht Task 1 (Norbert-Frey-Tweak für N=1 bei Reaktivierung)
      ▼
Task 5 (dbDetail-Automatik-Zeile) ── braucht Task 4 (PAT_REGELN/patRegelEmpfaenger)
      ▼
Task 6 (Waisen-Sweep arCard()/AR_TYP/AR_FOTO/.ar-grid + Gesamt-Abnahme) ── braucht Task 1-5
```

Sequentiell in dieser Reihenfolge ausführen (eine Datei, nie parallel). Tasks 1-5 sind additiv/verdrahtend und einzeln bootbar (Task 2 erzeugt einen dokumentierten, korrekten Zwischenzustand mit noch altem Kartenlayout aber neuen Nachsorge-Texten; Task 2.4 verhindert dabei sichtbare „undefined"-Labels). Task 6 schließt mit dem Waisen-Abbau der in Task 2.4 bewusst temporär eingeführten Ergänzung und der vollständigen Abnahme ab.

---

## Nicht-Ziele dieser Runde (aus Spec §10, hier zur Erinnerung)

- **Echter Versand.** Regel-Klick/Toggle bleibt Demo — kein Newsletter-Tool, kein E-Mail-Versand; `kpOpen()`/`kpSend()`s Kampagnen-Editor bewusst nicht wiederverwendet.
- **Zuweiser-Anlässe/-Sterne (P5).** `zwaKarte()`/`zwSterne()`/`ZWA_TYP`/`renderZuweiserAnlaesse()` bleiben exakt wie in [2026-07-23-runde6-punkt5-zuweiser-design.md](../specs/2026-07-23-runde6-punkt5-zuweiser-design.md) spezifiziert — unangetastet.
- **`STERNE[g].auto`/`autoFor()`.** Bleibt bestehen, keine Zusammenlegung mit `PAT_REGELN` — beide Zeilen ergänzen sich in `dbBody`, keine Redundanz-Löschung.
- **Radar-B2C-Feed-Konsistenz.** `renderAnlaesse()` bleibt unverändert (typ-agnostisch, zählt `nachsorge` automatisch mit) — in Task 6.2 nur gegengeprüft, nicht geändert.
- **Wiederbedarf-Umbau.** Bewusst nicht angetastet (Spec §5.2) — eigene, bereits gute Kartenoptik mit Lock-Status bleibt bestehen.
- **Regel-Historie/Log.** Kein „wann zuletzt gelaufen"-Verlauf, nur der nächste Termin.
- Keine neuen Keyframes, `escapeHtml` für alle dynamischen Inhalte, kein `Math.random`, 390px und 1440px verifizieren, 0 Console-Errors.
