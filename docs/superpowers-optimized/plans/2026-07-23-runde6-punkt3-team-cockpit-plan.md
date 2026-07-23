# Runde 6, Punkt 3 — Team-Führungs-Cockpit: Implementierungsplan

> **Für ausführende Agenten:** Dieser Plan wird Subagent-Driven umgesetzt — pro Task ein frischer Agent, kein Schreiben durch das orchestrierende Modell selbst. Lane-Tag pro Task beachten. Jeder Task arbeitet ausschließlich in `index.html`; **vor jeder Anker-Zeile den `grep`-Befehl aus dem Task selbst erneut ausführen** — Zeilennummern verschieben sich durch jeden vorherigen Task. Die hier notierten Zeilen sind der Stand bei Plan-Erstellung (23.07.2026, `index.html` 7185 Zeilen, Commit `35b998c`), nicht garantiert der Stand bei Ausführung.

**Bezug:** Setzt [2026-07-23-runde6-punkt3-team-cockpit-design.md](../specs/2026-07-23-runde6-punkt3-team-cockpit-design.md) vollständig um (bereits inkl. Review-Fixes: §4.3 zeitstabile Überfällig-Definition, §4.4 Heinz-Vogel-Seed-Justierung, §6.2 Zählmodell-Fix, §6.3 Sortier-Fix + Folgefehler-Fix) — ersetzt `renderTeam()` komplett durch ein KPI-Zeile + Team-Panels + „Braucht Aufmerksamkeit"-Cockpit im neuen Namespace `.tc-*`. Baut auf Punkt 1 (`GRUPPEN`/`achseZuGruppe()`) und Punkt 2 (`fallFakten()`-Familie, bereits live) auf, ohne deren Code anzufassen. Format/Konventionen übernommen von den beiden vorherigen Sprint-Plänen ([2026-07-23-runde6-punkt1-anfrage-triage-plan.md](./2026-07-23-runde6-punkt1-anfrage-triage-plan.md), [2026-07-23-runde6-punkt2-schritt-werkzeuge-plan.md](./2026-07-23-runde6-punkt2-schritt-werkzeuge-plan.md)).

**Architektur:** Alle Änderungen in `index.html` (self-contained, kein Build-Prozess, „Tests" = konkrete Browser-Checks + ein Node-Snippet für den zeitstabilen Begleit-Fix, keine Test-Framework-Suite). Sequentielle Ausführung — **nie parallel**, jeder Task fasst dieselbe Datei an. Nach jedem Task: Git-Commit (nur `index.html` staged). Die App bleibt nach **jedem einzelnen Task** lauffähig (0 Console-Errors, kein kaputter Zwischenzustand).

---

## Harte Regeln (jeder Task, aus Spec + projektweitem `CLAUDE.md`)

- Cofounder-Namespaces **nicht anfassen**: `.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`. `#refOverlay` tabu.
- Daten-Arrays (`faelle[]`, `eingang[]`) **nur additiv** erweitern — keine bestehenden Felder umbenennen/löschen, keine bestehenden Seed-Einträge löschen. Ausnahme (explizit von der Spec verlangt, §4.4): der **Wert** von `faelle[5].frist` (Heinz Vogel, id 6) ändert sich von `dstr(0)` auf `dstr(-2)` — ein Wert-Tweak an einem bestehenden Feld, keine neue Struktur.
- **Exakt 9 Keyframes** — verifiziert im Ist-Stand (`grep -c "@keyframes" index.html` = 9): `lift` [61], `rpDrawC`/`rpDrawP` [1043]/[1044], `rpRing` [1058], `rpGrow` [1074], `cv-travel` [1362], `auGrow` [2021], `lxSweep` [2030], `lxPulse` [2073]. Diese Runde führt **keine** neuen ein — die 4 Trendlinien sind statische Inline-SVG-Polylines (`zwSparkline()`, wiederverwendet, unverändert).
- `escapeHtml()` für jeden dynamisch eingefügten Text in allen neuen `.tc-*`-Bausteinen.
- **Kein `Math.random`** — alles deterministisch (Seeds, `dstr()`).
- Reduced-motion-safe: diese Runde führt keine neuen Animationen ein.
- Beide Breiten prüfen: **390px und 1440px**. **0 Console-Errors** bei jedem Verifikationsschritt.
- Neue CSS ausschließlich als **kommentierter Block direkt vor `</style>`** (Zeile 3154 im Ist-Stand), neuer Namespace `.tc-*` für alles genuin Neue in dieser Runde. `.card`-Basis wird als zusätzliche Klasse auf `.tc-kpi`/`.tc-panel` mitgenutzt (Etiketten-Doppelrahmen), ihre bestehende Definition bleibt unangetastet.
- **Begleit-Fix zuerst:** `fristKlasse()`/`fristText()`/`kennzahlen().ueberf` sind app-weit genutzte Bestandsfunktionen (7 Aufrufstellen außerhalb dieser Spec, s. Task 1.2) — der zeitstabile Fix läuft als **eigener, früher Task**, bevor irgendein `.tc-*`-Code entsteht, der sich auf die (dann korrigierten) Zahlen verlässt.
- **Entfernung + `renderTeam()`-Neuaufbau sind atomar** (ein Commit) — würde man alte Bausteine (Deko-Figure/`teamCockpitHtml()`/altes `renderTeam()`) in einem separaten, früheren Commit entfernen, bevor die neuen `.tc-*`-Funktionen existieren, bräche die Team-Ansicht zwischen den Commits (leere Seite/`ReferenceError`) — verletzt „App bleibt nach jedem Task lauffähig".
- **Nur `index.html` staged** — niemals `docs/MicrosoftTeams-video.mp4` oder sonstige Dateien.

---

## Lanes

- **`claude-implementer`** (Haiku) — Task 2 (rein mechanisch: `TC_WOCHE`/`TC_ERLEDIGT`-Konstanten wörtlich einfügen, ein Wert-Tweak an einem bestehenden Seed-Feld, neuer CSS-Block wörtlich vor `</style>`).
- **`claude-implementer-pro`** (Sonnet) — Task 1 (**eigener früher Task**: Begleit-Fix `fristKlasse()`/`fristText()`/`kennzahlen().ueberf`, zeitstabile Überfällig-Semantik, app-weit sichtbar), Task 3 (Bausteinfunktionen `tcKpiKarte`/`tcKpiRowHtml`/`tcPipelineHtml`/`tcMitarbeiterZeile`/`tcPanel`/`tcPanelsHtml`/`tcFristSort`/`tcAttnZeile`/`tcFallZeile`/`tcAufmerksamkeitHtml`/`tcFilter`/`tcSetFilter`, additiv/unverdrahtet), Task 4 (**atomar**: Entfernung Deko-Figure/`teamCockpitHtml()`/altes `teamFilter`+`setTeamFilter()`/altes `renderTeam()` zusammen mit dem `renderTeam()`-Neuaufbau), Task 5 (CSS-Waisen-Sweep laut Spec-Aufräumliste + finaler Abnahme-Sweep aller 11 Kriterien via Browser/CDP).

---

## Warum der Begleit-Fix (Task 1) ein eigener, früher Task ist

`fristKlasse()`/`fristText()`/`kennzahlen().ueberf` sind **Bestandsfunktionen**, die schon vor dieser Spec an 7 Stellen außerhalb des Team-Cockpits genutzt werden (`makeBoardCol()`, `aufgabenHeroHtml()`, zwei `#dFrist`-Change-Listener, ein `radar-prog`-Aufruf — s. Task 1.2 für die vollständige Liste). Jede Zahl, die diese Spec ab §4.2 „durchrechnet" (Aufnahmen/Conversion/Reaktionszeit/Überfällig = 2/67 %/7 Std./1), setzt bereits die **korrigierte** Formel voraus. Würde der Fix erst irgendwo mitten im Cockpit-Bau nebenbei mitgeliefert, gäbe es keinen sauberen Verifikationspunkt dafür, dass er wirklich zeitstabil ist (unabhängig von der Uhrzeit beim Testen) — und ein Fehler darin würde sich unsichtbar in mehrere spätere Tasks fortpflanzen. **Entscheidung:** Der Begleit-Fix ist Task 1, mit eigener, uhrzeit-unabhängiger Node-Verifikation, bevor irgendein `.tc-*`-Code entsteht.

## Warum Entfernung + `renderTeam()`-Neuaufbau (Task 4) atomar sind

Siehe „Harte Regeln" oben. Zusätzlich: Task 3 liefert alle neuen `tc*`-Funktionen bereits **additiv und unverdrahtet** — das alte `renderTeam()`/`teamCockpitHtml()` ruft sie nicht auf, es gibt also keinen Zwischenzustand, in dem beide Fassungen um denselben Zustand konkurrieren. Erst Task 4 schaltet in einem einzigen Commit von alt auf neu um: alte Erzeuger raus, neues `renderTeam()` rein. Ein Aufsplitten dieses einen Schritts auf zwei Commits hätte zwangsläufig einen Zwischenstand, in dem `#teamGrid` entweder leer bleibt (neues `renderTeam()` ohne die alten Erzeuger, aber noch nicht committet) oder auf tote Funktionen zeigt (alte Erzeuger entfernt, `renderTeam()` ruft sie aber noch auf) — daher **ein** atomarer Task.

---

## Standard-Verifikation (nach jedem Task)

1. `grep -c "function " index.html` vor/nach vergleichen — keine unbeabsichtigt gelöschten Funktionen außer den in Task 4 explizit dokumentierten Entfernungen (`teamCockpitHtml`).
2. Browser: Seite neu laden, Console auf 0 Errors prüfen.
3. Betroffene View (`Fälle → Team`, `#sub-faelle-team`) bei 390px und bei 1440px öffnen, auf Overflow/Lesbarkeit prüfen.
4. Cofounder-Bereiche (`#refOverlay`, `.mx-*`, `.rsp-*`, `.rp-*`, `.rpd-*`) unverändert gegentesten.
5. `ma-mode`/„Mein Tag" (`renderMeinTag()`) und „Auswertung" (`renderCharts()`) unangetastet gegentesten (nicht Teil dieser Runde, s. Spec §8).
6. `grep -c "@keyframes" index.html` — weiterhin genau **9**.
7. Commit mit klarer Botschaft, welcher Spec-Abschnitt umgesetzt wurde — **nur `index.html` staged, niemals `docs/MicrosoftTeams-video.mp4` oder sonstige Dateien**.
8. Jeder Task unten endet zusätzlich mit einer eigenen **Sichtprüfung**.

---

# Task 1 — Begleit-Fix: zeitstabile Frist-Semantik (`fristKlasse`/`fristText`/`kennzahlen().ueberf`)

**Lane:** `claude-implementer-pro` (Logik-Fix an drei app-weit genutzten Bestandsfunktionen — Grenzfall-Umstellung von Instant- auf Kalendertag-Stringvergleich, muss vor jedem `.tc-*`-Code laufen)

**Abhängigkeit:** keine — reiner, in sich geschlossener Bugfix. Muss aber vor Task 2 (Heinz-Vogel-Seed-Justierung setzt die korrigierte Formel voraus) und vor jedem weiteren Task laufen, da alle folgenden Zahlen (§4.2 der Spec) den Fix bereits voraussetzen.

**Bezug:** Spec §4.3 (Begleit-Fix, Review-Finding 1), §8 (Nicht-Ziele-Ausnahme: einzige Bestandsfunktions-Änderung dieser Spec).

**Dateien/Anker:** `grep -n "function fristKlasse\|function fristText\|const ueberf=offen" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `fristKlasse()` Zeile 4757, `fristText()` Zeile 4758, `kennzahlen().ueberf` Zeile 5650.

**Schritte:**

- [ ] **1.1** `grep`-Befehl oben ausführen, alle drei Fundstellen bestätigen.

- [ ] **1.2 — Regressions-Grep (Pflicht vor dem Diff):** `grep -n "fristKlasse(\|fristText(" index.html` ausführen. Bei Plan-Erstellung 9 Fundstellen: die zwei Definitionen (4757/4758) plus 7 Aufrufer — `makeBoardCol()` (Zeile 5060 `fristKlasse`, 5065 `fristText`), das **noch bestehende** alte `.tm-list` in `renderTeam()` (5818 `fristText`, 5826 `fristText` — entfällt erst in Task 4, hier nur zur Kenntnis), `aufgabenHeroHtml()` (6259, beide), zwei `#dFrist`-Change-Listener (6468 `fristKlasse`, 7073 `fristKlasse`), `radar-prog` (6717 `fristText`). Jede Aufrufstelle liest ausschließlich den Rückgabewert, keine eigene Datumslogik daneben — ihr Verhalten ändert sich **nur** an der heute/überfällig-Grenze (gewollt, Spec §4.3: eine Frist auf „heute" zeigt ab jetzt zeitstabil „heute fällig"/`warn` statt — abhängig von der Tageszeit beim alten Bug — teils „überfällig (1 T)"/`bad`).

- [ ] **1.3 — Diff anwenden** (wörtlich aus Spec §4.3):
```diff
-function fristKlasse(f){if(!f)return"";const d=(new Date(f)-heute)/86400000;return d<0?"bad":d<1.5?"warn":"ok";}
-function fristText(f){if(!f)return"";const d=Math.round((new Date(f)-heute)/86400000);return d<0?"überfällig ("+Math.abs(d)+" T)":d===0?"heute fällig":"in "+d+" T";}
+function fristKlasse(f){if(!f)return"";const h=dstr(0);if(f<h)return"bad";if(f===h)return"warn";const d=(new Date(f)-heute)/86400000;return d<1.5?"warn":"ok";}
+function fristText(f){if(!f)return"";const h=dstr(0);if(f<h)return"überfällig ("+Math.round((new Date(h)-new Date(f))/86400000)+" T)";if(f===h)return"heute fällig";const d=Math.round((new Date(f)-heute)/86400000);return "in "+d+" T";}
```
```diff
-  const ueberf=offen.filter(x=>x.frist&&new Date(x.frist)<heute).length;
+  const ueberf=offen.filter(x=>x.frist&&x.frist<dstr(0)).length;
```
  Nur die Grenze überfällig/heute wechselt auf Stringvergleich (`f`/`dstr(0)` sind beides reine `"YYYY-MM-DD"`-Strings, lexikographisch identisch zur Datums-Ordnung, ohne Uhrzeit-Komponente). Der Zukunfts-Zweig (`fristText()`s „in X T", `fristKlasse()`s `warn`/`ok`-Split ab morgen) behält die bestehende Rundung gegen `heute` — dort verschiebt sich keine Tag-Grenze fälschlich, kein Fixbedarf laut Spec.

- [ ] **1.4** `grep -n "if(f<h)return\"bad\"\|x.frist&&x.frist<dstr(0)" index.html` ausführen — je 1 Fundstelle bestätigen.

- [ ] **1.5 — Node-Verifikation: zeitstabil an zwei simulierten Tageszeiten.** Datei im Scratchpad-Verzeichnis ablegen (z. B. `/tmp/.../frist-check.js`, Pfad frei wählbar) mit exakt den zwei neuen Funktionskörpern aus Schritt 1.3, parametrisiert über ein injiziertes `heute` (damit ohne Systemzeit-Abhängigkeit an zwei fixen Uhrzeiten getestet werden kann):
```js
// Post-Fix-Funktionen (wörtlich aus Spec §4.3 / Schritt 1.3), heute als Parameter statt globaler
// Variable — nur damit dieses Node-Skript zwei Tageszeiten simulieren kann, ohne die echte App zu laden.
function dstrFor(heute,o){const d=new Date(heute);d.setDate(d.getDate()+o);return d.toISOString().slice(0,10);}
function fristKlasseFor(heute,f){if(!f)return"";const h=dstrFor(heute,0);if(f<h)return"bad";if(f===h)return"warn";const d=(new Date(f)-heute)/86400000;return d<1.5?"warn":"ok";}
function fristTextFor(heute,f){if(!f)return"";const h=dstrFor(heute,0);if(f<h)return"überfällig ("+Math.round((new Date(h)-new Date(f))/86400000)+" T)";if(f===h)return"heute fällig";const d=Math.round((new Date(f)-heute)/86400000);return "in "+d+" T";}

let fail=false;
[["06:00 UTC","T06:00:00Z"],["23:00 UTC","T23:00:00Z"]].forEach(([label,suffix])=>{
  const heute=new Date("2026-07-23"+suffix);
  const heuteStr=dstrFor(heute,0), vorgestern=dstrFor(heute,-2);
  const checks=[
    ["fristText(dstr(0))",fristTextFor(heute,heuteStr),"heute fällig"],
    ["fristKlasse(dstr(0))",fristKlasseFor(heute,heuteStr),"warn"],
    ["fristText(dstr(-2))",fristTextFor(heute,vorgestern),"überfällig (2 T)"]
  ];
  checks.forEach(([name,got,want])=>{
    const ok=got===want;
    if(!ok)fail=true;
    console.log(label,name,"→",JSON.stringify(got),ok?"OK":"FAIL (erwartet "+JSON.stringify(want)+")");
  });
});
process.exit(fail?1:0);
```
  Ausführen: `node frist-check.js`. **Erwartung: alle 6 Zeilen `OK`, bei beiden Tageszeiten identisch** — das belegt, dass `fristText(dstr(0))==="heute fällig"`, `fristKlasse(dstr(0))==="warn"`, `fristText(dstr(-2))==="überfällig (2 T)"` unabhängig von der Uhrzeit gelten (der behobene Demo-Killer-Bug war exakt diese Uhrzeit-Abhängigkeit).

- [ ] **1.6** Standard-Verifikation bei 390px UND 1440px: App bootet unverändert (Cockpit existiert erst ab Task 3/4, hier ändert sich nur die zugrundeliegende Formel). In der Browser-Konsole: `kennzahlen().ueberf` ergibt **`0`** (mit den *noch unveränderten* Seeds — Heinz Vogels `frist:dstr(0)` wird erst in Task 2 auf `dstr(-2)` gesetzt; vorher liefert kein offener Fall `frist<dstr(0)`). `fristText(dstr(0))` ergibt `"heute fällig"`, `fristKlasse(dstr(0))` ergibt `"warn"` (direkt in der echten App-Konsole, keine Simulation nötig — belegt denselben Fix wie 1.5, diesmal an der echten Systemzeit). `aufgabenHeroHtml`-Konsument `openFallakte(1)` (Anna Muster, `frist:dstr(0)`) zeigt „Frist heute fällig" (Klasse `warn`), nicht „überfällig (1 T)". 0 Console-Errors.

**Sichtprüfung:** Anna Musters Aufgaben-Hero in der Fallakte zeigt „Frist heute fällig" statt (vor dem Fix, je nach Tageszeit) „überfällig (1 T)" — unabhängig davon, wann die Seite geladen wurde. Board-Ansicht (`makeBoardCol()`) und die beiden `#dFrist`-Change-Listener zeigen unverändert korrekte Frist-Chips (kein Fall in den aktuellen Seeds testet dort gerade die Grenze).

**Commit:** `fix: fristKlasse()/fristText()/kennzahlen().ueberf — zeitstabiler Kalendertag-Stringvergleich statt Instant-Vergleich gegen eingefrorenes "heute" (Runde 6 Punkt 3, Begleit-Fix §4.3)`

---

# Task 2 — Team-Cockpit-Datengrundlage: Seeds + CSS (additiv)

**Lane:** `claude-implementer` (drei vollständig vorgezeichnete, additive Bausteine — zwei Konstanten wörtlich aus der Spec, ein Wert-Tweak an genau einer Seed-Zeile nach exakter Vorgabe, CSS-Block wörtlich vor `</style>`; keine eigene Entscheidung nötig)

**Abhängigkeit:** Task 1 (die Heinz-Vogel-Seed-Justierung wirkt sich erst mit dem zeitstabilen Fix korrekt auf `kennzahlen().ueberf` aus; die neuen Konstanten selbst sind aber pure additive Daten — kein bestehender Aufrufer liest `TC_WOCHE`/`TC_ERLEDIGT`, bevor Task 3 sie konsumiert; die neue CSS-Klasse `.tc-*` wird von keinem Markup erzeugt, solange Task 3/4 nicht gelaufen sind). Bootet unverändert, 0 optische Änderung.

**Bezug:** Spec §4.4 (Heinz-Vogel-Seed-Justierung), §4.5 (`TC_WOCHE`), §4.6 (`TC_ERLEDIGT`), §6.4 (CSS).

**Dateien/Anker:** `grep -n "id:6,personId:\"P03\"\|^let teamFilter=\"alle\"\|^</style>" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: Heinz-Vogel-Seed Zeile 4266, `let teamFilter="alle";` Zeile 5777, CSS-Einfügepunkt vor `</style>` Zeile 3154.

**Schritte:**

- [ ] **2.1** `grep`-Befehl oben ausführen, alle drei Fundstellen bestätigen.

- [ ] **2.2 — Heinz-Vogel-Seed-Justierung** (Spec §4.4 — einzige Änderung: `frist:dstr(0)`→`frist:dstr(-2)`, alle anderen Felder dieses Fall-Objekts wörtlich unverändert):
```diff
- {id:6,personId:"P03",name:"Heinz Vogel",alter:69,rolle:"Zuweiser",kanal:"Zuweiser direkt",quelle:"Thoraxzentrum Münnerstadt",achse:"SalutoCare",kt:"PKV",status:"Qualifizierung",owner:"Recovery Manager",aufgabe:"Übernahmefähigkeit Beatmung klären",frist:dstr(0),saluto:true,docs:[true,true,true,false],kosten:"angefragt",consent:"schriftlich liegt vor",verlust:"",reaktion:1,log:[[dstr(-5),"Anfrage Weaning-Anschluss"],[dstr(-4),"Med. Rückfrage an Oberarzt"]]},
+ {id:6,personId:"P03",name:"Heinz Vogel",alter:69,rolle:"Zuweiser",kanal:"Zuweiser direkt",quelle:"Thoraxzentrum Münnerstadt",achse:"SalutoCare",kt:"PKV",status:"Qualifizierung",owner:"Recovery Manager",aufgabe:"Übernahmefähigkeit Beatmung klären",frist:dstr(-2),saluto:true,docs:[true,true,true,false],kosten:"angefragt",consent:"schriftlich liegt vor",verlust:"",reaktion:1,log:[[dstr(-5),"Anfrage Weaning-Anschluss"],[dstr(-4),"Med. Rückfrage an Oberarzt"]]},
```

- [ ] **2.3 — `TC_WOCHE`/`tcDelta()` einfügen**, direkt vor `let teamFilter="alle";` (wörtlich aus Spec §4.5):
```js
// Runde 6 Punkt 3 — reiner Demo-Seed für die 4 KPI-Trendlinien. Die App führt keine Tages-Historie,
// kann diese Werte also nicht rückwirkend berechnen. Nur TC_WOCHE[k][6] (heute) ist bewusst identisch
// zum live in tcKpis() berechneten Wert — die vorigen 6 Punkte sind erfundene, plausible Vorgeschichte.
const TC_WOCHE={
 aufnahmen:   [0,1,1,1,2,2,2],   // endet bei live Aufnahmen(7T)=2
 conversion:  [58,60,62,64,65,66,67], // endet bei live Conversion=67
 reaktion:    [9,9,8,8,8,7,7],   // endet bei live Ø Reaktionszeit=7
 ueberfaellig:[3,3,2,2,1,1,1]    // Review-Fix 2: endet bei live Überfällig=1 (Heinz-Vogel-Seed, §4.4), Delta=1-3=-2
};
function tcDelta(arr){ return arr[6]-arr[0]; } // Delta-Pfeil: ausschließlich Seed[6]-Seed[0], unabhängig vom Live-Hero-Wert
```

- [ ] **2.4 — `TC_ERLEDIGT` einfügen**, direkt nach `TC_WOCHE`/`tcDelta()` (wörtlich aus Spec §4.6):
```js
// Demo-Seed, keine Live-Ableitung möglich (Begründung: Spec §4.6) — "diese Woche erledigt" je TEAM-Mitglied.
const TC_ERLEDIGT={"S. Koordination":4,"M. Belegung":3,"Recovery Manager":2,"T. Abrechnung":1};
```

- [ ] **2.5 — neuer CSS-Block vor `</style>`** (`.tc-*`-Namespace, wörtlich aus Spec §6.4):
```css
/* Runde 6 Punkt 3: .tc-* — Team-Führungs-Cockpit. .tc-kpi/.tc-panel nutzen .card (Etiketten-
   Doppelrahmen) als Basisklasse zusätzlich, keine eigene Rahmen-CSS nötig. */
.tc-kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:0 0 20px}
@media(min-width:900px){.tc-kpis{grid-template-columns:repeat(4,1fr)}}
.tc-kpi{padding:16px 17px}
.tc-kpi-n{font:700 30px/1 "Cormorant Garamond",Georgia,serif;color:var(--ink)}
.tc-kpi-e{font:600 13px/1 Inter;color:var(--muted);margin-left:4px}
.tc-kpi-l{font:600 11.5px/1.2 Inter;letter-spacing:.04em;text-transform:uppercase;color:var(--brass-deep);margin:2px 0 8px}
.tc-kpi .zw-spark{display:block;margin:4px 0}
.tc-kpi-delta{font:700 12px/1 Inter;display:inline-block;margin-top:4px}
.tc-kpi-delta.gut{color:var(--sage-deep)}
.tc-kpi-delta.schlecht{color:var(--terra)}
.tc-panels{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 20px}
.tc-panel.schmal{grid-column:1/-1}
@media(min-width:900px){.tc-panels{grid-template-columns:1fr 1fr auto}.tc-panel.schmal{grid-column:auto;min-width:180px}}
.tc-panel{padding:16px 17px}
.tc-panel-h{font:700 19px/1.2 "Cormorant Garamond",Georgia,serif;color:var(--ink);margin:0 0 10px}
.tc-pipe{display:flex;height:22px;border-radius:6px;overflow:hidden;background:var(--cream2)}
.tc-pipe-seg{display:flex;align-items:center;justify-content:center;min-width:0}
.tc-pipe-n{font:700 11px/1 "Cormorant Garamond",Georgia,serif;color:var(--paper)}
.tc-pipe-legend{display:flex;gap:8px;flex-wrap:wrap;font-size:10px;color:var(--faint);margin:5px 0 0}
.tc-pipe-verl{font-size:11px;color:var(--terra);margin-top:4px}
.tc-ma-list{display:flex;flex-direction:column;gap:6px;margin-top:12px}
.tc-ma-row{display:flex;align-items:center;gap:8px;width:100%;text-align:left;background:transparent;border:1px solid transparent;border-radius:8px;padding:6px 8px;cursor:pointer}
.tc-ma-row.on{border-color:var(--brass);background:var(--brass-soft)}
@media(hover:hover){.tc-ma-row:hover{background:var(--paper2)}}
.tc-ma-name{flex:0 0 100px;font-size:12.5px;font-weight:600;color:var(--ink-soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tc-ma-track{flex:1;height:7px;border-radius:99px;background:var(--cream2);overflow:hidden}
.tc-ma-fill{height:100%;border-radius:99px;background:var(--sage-deep)}
.tc-ma-n{flex:0 0 18px;text-align:right;font:700 14px/1 "Cormorant Garamond",Georgia,serif;color:var(--ink)}
.tc-ma-ueb{font:700 10.5px/1 Inter;color:var(--terra);flex:0 0 auto}
.tc-ma-erl{font-size:10.5px;color:var(--faint);flex:0 0 auto}
.tc-attn-list{display:flex;flex-direction:column;gap:0;border:1px solid var(--hair);border-radius:12px;overflow:hidden}
.tc-attn-row{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:11px 14px;border-top:1px solid var(--hair2);background:transparent;cursor:pointer}
.tc-attn-row:first-child{border-top:none}
@media(hover:hover){.tc-attn-row:hover{background:var(--paper2)}}
.tc-attn-name{font:600 13.5px/1.2 Inter;color:var(--ink);flex:0 0 140px}
.tc-attn-aufg{font-size:12.5px;color:var(--ink-soft);flex:1;min-width:0}
.tc-attn-owner{font-size:11px;color:var(--brass-deep);font-weight:600;flex:0 0 auto}
.tc-attn-tage{font:700 11.5px/1 Inter;color:var(--ink-soft);flex:0 0 auto} /* neutral: tcFallZeile() setzt zusätzlich .bad/.warn/.ok via fristKlasse() */
.tc-attn-tage.bad{color:var(--terra)}
.tc-attn-tage.warn{color:var(--brass-deep)}
.tc-attn-tage.ok{color:var(--faint);font-weight:600}
.tc-clear{font:600 11px/1 Inter;color:var(--brass-deep);text-decoration:underline;margin:0 0 10px;display:inline-block}
@media(max-width:600px){.tc-attn-row,.tc-ma-row{flex-wrap:wrap}.tc-attn-aufg{flex:1 1 100%;order:3}}
```

- [ ] **2.6** `grep -n "const TC_WOCHE\|const TC_ERLEDIGT\|function tcDelta\|frist:dstr(-2)" index.html` ausführen — je 1 Fundstelle (`frist:dstr(-2)` exakt 1× — nur Heinz Vogels Zeile, keine andere Seed-Zeile darf dieses Muster tragen).

- [ ] **2.7** Standard-Verifikation bei 390px UND 1440px: App bootet unverändert, Team-Ansicht sieht optisch **exakt unverändert** aus (altes `teamCockpitHtml()`/`renderTeam()` liest die neuen Konstanten nicht, die neue CSS-Klasse `.tc-*` wird von keinem Markup erzeugt), 0 Console-Errors. In der Browser-Konsole: `TC_WOCHE.ueberfaellig[6]` ergibt `1`, `TC_ERLEDIGT["S. Koordination"]` ergibt `4`, `kennzahlen().ueberf` ergibt jetzt **`1`** (Heinz Vogel, seit der Seed-Justierung plus dem Begleit-Fix aus Task 1 zeitstabil überfällig).

**Sichtprüfung:** Visuell ändert sich in diesem Task **nichts** — reine additive Vorbereitung. Konsole bestätigt, dass die neue Seed-Justierung zusammen mit dem Begleit-Fix aus Task 1 bereits die korrekte Ziel-Zahl (`kennzahlen().ueberf===1`) liefert, bevor überhaupt ein `.tc-*`-Baustein existiert.

**Commit:** `feat: Team-Cockpit-Datengrundlage — Heinz-Vogel-Frist-Seed-Justierung (dstr(-2)), TC_WOCHE/TC_ERLEDIGT-Demo-Seeds, .tc-*-CSS-Block (Runde 6 Punkt 3, §4.4/§4.5/§4.6/§6.4)`

---

# Task 3 — Neue Bausteinfunktionen (additiv, unverdrahtet)

**Lane:** `claude-implementer-pro` (Logik: Wiederverwenden von `kennzahlen()`/`zwSparkline()`/`achseZuGruppe()`/`fristKlasse()`/`fristText()`, Zählmodell- und Sortier-Fixes aus dem Review korrekt umsetzen — kein mechanisches Abtippen)

**Abhängigkeit:** Task 1 (`fristKlasse()`/`fristText()`/`kennzahlen().ueberf` müssen zeitstabil sein, da `tcMitarbeiterZeile()`/`tcFallZeile()`/`tcAufmerksamkeitHtml()` direkt bzw. über `kennzahlen()` darauf aufbauen), Task 2 (`TC_WOCHE`/`TC_ERLEDIGT` müssen existieren, `GRUPPEN`/`achseZuGruppe()` bereits seit Punkt 1 vorhanden).

**Bezug:** Spec §6.1 (KPI-Zeile), §6.2 (Panels, inkl. Review-Fix Zählmodell), §6.3 (Aufmerksamkeit-Liste + Filter, inkl. Review-Fix Sortierung + selbst gefundener Zusatz-Fix).

**Dateien/Anker:** `grep -n "function teamCockpitHtml\|^let teamFilter=\"alle\"" index.html` vor Bearbeitung ausführen und Zeile neu bestätigen (verschiebt sich durch Task 2 um 9 Zeilen). Bei Plan-Erstellung (nach Task 1/2): `teamCockpitHtml()` beginnt bei Zeile 5788 (Ist vor dieser Runde 5779, +9 durch Task 2.3/2.4).

**Schritte:**

- [ ] **3.1** `grep`-Befehl oben ausführen, exakte aktuelle Zeile von `function teamCockpitHtml(openCases){` bestätigen — alle neuen Funktionen werden **direkt davor** eingefügt (altes `teamCockpitHtml()`/`renderTeam()` bleibt in diesem Task unangetastet stehen, Entfernung folgt in Task 4).

- [ ] **3.2 — alle neuen Bausteinfunktionen einfügen**, direkt vor `function teamCockpitHtml(openCases){` (wörtlich aus Spec §6.1–§6.3):
```js
/* Runde 6 Punkt 3 (§6.1–§6.3): .tc-*-Bausteinfunktionen für das neue Team-Führungs-Cockpit.
   Additiv — noch von keinem Aufrufer genutzt (altes renderTeam()/teamCockpitHtml() bleiben bis
   Task 4 unverändert aktiv); Verdrahtung + Entfernung der alten Bausteine folgt atomar in Task 4. */
function tcKpiKarte(label,val,einheit,trend,gutWennSteigt){
 const delta=tcDelta(trend), gut=gutWennSteigt?delta>=0:delta<=0;
 const pfeil=delta===0?"→":(delta>0?"▲":"▼");
 return "<div class='card tc-kpi'>"
  +"<div class='tc-kpi-n'>"+val+"<span class='tc-kpi-e'>"+escapeHtml(einheit)+"</span></div>"
  +"<div class='tc-kpi-l'>"+escapeHtml(label)+"</div>"
  +zwSparkline(trend)
  +"<span class='tc-kpi-delta "+(gut?"gut":"schlecht")+"'>"+pfeil+" "+(delta>0?"+":"")+delta+"</span>"
  +"</div>";
}
function tcKpiRowHtml(){
 const k=kennzahlen(); // reuse: conv, rzAvg, ueberf (nach Begleit-Fix Task 1 zeitstabil und direkt korrekt)
 const auf7=faelle.filter(f=>f.status==="Aufgenommen"&&f.log.some(([d,t])=>d>=dstr(-7)&&/aufgenommen/i.test(t))).length;
 return "<div class='tc-kpis'>"
  +tcKpiKarte("Aufnahmen · 7 Tage",auf7,"",TC_WOCHE.aufnahmen,true)
  +tcKpiKarte("Conversion",k.conv,"%",TC_WOCHE.conversion,true)
  +tcKpiKarte("Ø Reaktionszeit",k.rzAvg,"Std.",TC_WOCHE.reaktion,false)
  +tcKpiKarte("Überfällige Aufgaben",k.ueberf,"",TC_WOCHE.ueberfaellig,false)
  +"</div>";
}
function tcPipelineHtml(cases){
 const verl=cases.filter(f=>f.status==="Verloren").length;
 const aktiv=cases.filter(f=>f.status!=="Verloren");
 const stufen=STATUS.slice(0,6); // Neu…Aufgenommen, Verloren separat
 return "<div class='tc-pipe'>"+stufen.map(s=>{
   const n=aktiv.filter(f=>f.status===s).length;
   return "<div class='tc-pipe-seg' style='flex:"+n+" "+n+" 0;background:"+(STATUS_COL[s]||"var(--hair)")+"' title='"+escapeHtml(s)+": "+n+"'>"
    +(n?"<span class='tc-pipe-n'>"+n+"</span>":"")+"</div>";
 }).join("")+"</div>"
 +"<div class='tc-pipe-legend'>"+stufen.map(s=>"<span>"+escapeHtml(s)+"</span>").join("")+"</div>"
 +(verl?"<div class='tc-pipe-verl'>"+verl+" verloren (nicht im Trichter)</div>":"");
}
function tcMitarbeiterZeile(t,openCases,maxN){
 const mine=openCases.filter(f=>f.owner===t);
 const ueb=mine.filter(f=>f.frist&&f.frist<dstr(0)).length; // zeitstabil, s. Task 1
 const erledigt=TC_ERLEDIGT[t]||0;
 return "<button type='button' class='tc-ma-row"+(tcFilter===t?" on":"")+"' onclick='tcSetFilter(\""+t+"\")'>"
  +"<span class='ava sm'>"+initialen(t)+"</span>"
  +"<span class='tc-ma-name'>"+escapeHtml(t)+"</span>"
  +"<div class='tc-ma-track'><div class='tc-ma-fill' style='width:"+(mine.length/maxN*100)+"%'></div></div>"
  +"<span class='tc-ma-n num'>"+mine.length+"</span>"
  +(ueb?"<span class='tc-ma-ueb'>"+ueb+" überfällig</span>":"")
  +"<span class='tc-ma-erl'>"+erledigt+" diese Woche</span>"
  +"</button>";
}
function tcPanel(titel,cases,mitglieder,openCases,maxN,schmal){
 return "<div class='card tc-panel"+(schmal?" schmal":"")+"'><h3 class='tc-panel-h'>"+escapeHtml(titel)+"</h3>"
  +tcPipelineHtml(cases)
  +(schmal?"":"<div class='tc-ma-list'>"+mitglieder.map(t=>tcMitarbeiterZeile(t,openCases,maxN)).join("")+"</div>")
  +"</div>";
}
function tcPanelsHtml(openCases){ // openCases = offeneFaelle()-Ergebnis aus renderTeam() — GLOBALER Datensatz (Review-Fix Zählmodell)
 const alle=faelle; // Pipeline zählt Status inkl. Verloren (separat ausgewiesen) UND Aufgenommen — daher faelle, nicht openCases
 const ortho=alle.filter(f=>achseZuGruppe(f.achse)==="Orthopädie");
 const ng=alle.filter(f=>achseZuGruppe(f.achse)==="Neuro-Geri");
 const direkt=alle.filter(f=>achseZuGruppe(f.achse)===null);
 const maxN=Math.max(1,...TEAM.map(t=>openCases.filter(f=>f.owner===t).length));
 const mgl=g=>TEAM.filter(t=>(TEAM_ACHSE[t]||[]).map(achseZuGruppe).includes(g));
 return "<div class='tc-panels'>"
  +tcPanel("Orthopädie",ortho,mgl("Orthopädie"),openCases,maxN,false)
  +tcPanel("Neuro-Geri",ng,mgl("Neuro-Geri"),openCases,maxN,false)
  +tcPanel("Direkt / Premium",direkt,["Recovery Manager"],openCases,maxN,true)
  +"</div>";
}
let tcFilter="alle"; // ersetzt teamFilter (entfernt in Task 4)
function tcSetFilter(t){ tcFilter=(tcFilter===t?"alle":t); renderTeam(); }
function tcFristSort(a,b){ // Review-Fix Sortierung: leere Fristen IMMER ans Ende, unabhängig von der anderen Seite
 if(!a.frist&&!b.frist)return 0;
 if(!a.frist)return 1;
 if(!b.frist)return -1;
 return a.frist<b.frist?-1:a.frist>b.frist?1:0;
}
function tcAufmerksamkeitHtml(){
 const offen=offeneFaelle();
 if(tcFilter!=="alle"){
   const mine=offen.filter(f=>f.owner===tcFilter).sort(tcFristSort);
   return "<div class='chap tc-attn'><h2 class='chap-h2'>Offene Fälle · "+escapeHtml(tcFilter)+"</h2>"
    +"<button class='tc-clear' onclick='tcSetFilter(\""+tcFilter+"\")'>alle zeigen</button>"
    +"<div class='tc-attn-list'>"+(mine.length?mine.map(tcFallZeile).join(""):"<p class='empty'>Keine offenen Fälle.</p>")+"</div></div>";
 }
 const ueberfaellig=offen.filter(f=>f.frist&&f.frist<dstr(0)).sort(tcFristSort); // zeitstabil (Task 1) — frist garantiert gesetzt, tcFristSort trotzdem wiederverwendet statt Duplikat
 return "<div class='chap tc-attn'><h2 class='chap-h2'>Braucht Aufmerksamkeit</h2>"
  +"<div class='tc-attn-list'>"+(ueberfaellig.length?ueberfaellig.map(tcAttnZeile).join(""):"<p class='empty'>Keine überfälligen Aufgaben — alles im grünen Bereich.</p>")+"</div></div>";
}
function tcAttnZeile(f){ // NUR für die überfällig-Liste — durch den Filter oben garantiert f.frist<dstr(0)
 const tage=Math.round((new Date(dstr(0))-new Date(f.frist))/86400000); // beide Operanden reine Datumsstrings (Mitternacht UTC) — exakter Tageswert, immer positiv
 return "<button type='button' class='tc-attn-row' onclick='openFallakte("+f.id+")'>"
  +"<span class='tc-attn-name'>"+escapeHtml(f.name)+"</span>"
  +"<span class='tc-attn-aufg'>"+escapeHtml(f.aufgabe||"—")+"</span>"
  +"<span class='tc-attn-owner'>"+escapeHtml(f.owner)+"</span>"
  +"<span class='tc-attn-tage bad'>"+tage+" "+(tage===1?"Tag":"Tage")+" überfällig</span>"
  +"</button>";
}
function tcFallZeile(f){ // generische Zeile für den Mitarbeiter-Filter-Zweig — Fälle in JEDEM Frist-Zustand
 // (überfällig/heute/zukünftig/keine Frist), deshalb NICHT tcAttnZeile() wiederverwendet: die hätte
 // hier für nicht-überfällige Fälle Unsinn gezeigt ("2 Tage überfällig" für eine Frist in 2 Tagen,
 // "NaN Tage überfällig" ohne Frist). fristKlasse()/fristText() (zeitstabil, Task 1) decken alle
 // vier Zustände bereits korrekt ab — hier reuse statt eigener Tage-Rechnung.
 return "<button type='button' class='tc-attn-row' onclick='openFallakte("+f.id+")'>"
  +"<span class='tc-attn-name'>"+escapeHtml(f.name)+"</span>"
  +"<span class='tc-attn-aufg'>"+escapeHtml(f.aufgabe||"—")+"</span>"
  +"<span class='tc-attn-owner'>"+escapeHtml(f.owner)+"</span>"
  +"<span class='tc-attn-tage "+fristKlasse(f.frist)+"'>"+escapeHtml(f.frist?fristText(f.frist):"—")+"</span>"
  +"</button>";
}
```

- [ ] **3.3** `grep -n "function tcKpiKarte\|function tcKpiRowHtml\|function tcPipelineHtml\|function tcMitarbeiterZeile\|function tcPanel\b\|function tcPanelsHtml\|function tcSetFilter\|function tcFristSort\|function tcAufmerksamkeitHtml\|function tcAttnZeile\|function tcFallZeile\|^let tcFilter" index.html` ausführen — je 1 Fundstelle (`tcPanel\b` bewusst mit Wortgrenze, um nicht `tcPanelsHtml` mitzutreffen).

- [ ] **3.4 — Standard-Verifikation bei 390px UND 1440px:** App bootet unverändert (altes `renderTeam()`/`teamCockpitHtml()` ruft die neuen Funktionen noch nicht auf), 0 Console-Errors. Zusätzlich in der Browser-Konsole, rein funktional ohne Rendering:
  - `tcKpiRowHtml().match(/tc-kpi-n'>(\d+(?:\.\d+)?)/g)` ergibt `["tc-kpi-n'>2","tc-kpi-n'>67","tc-kpi-n'>7","tc-kpi-n'>1"]` (Aufnahmen/Conversion/Reaktionszeit/Überfällig in dieser Reihenfolge — belegt, dass Task 1 + Task 2 bereits die korrekten Zahlen liefern).
  - `tcFristSort({frist:null},{frist:"2026-08-01"})` ergibt `1`, `tcFristSort({frist:"2026-08-01"},{frist:null})` ergibt `-1`, `tcFristSort({frist:null},{frist:null})` ergibt `0` (leere Frist immer ans Ende, unabhängig von der Gegenseite — Review-Fix direkt geprüft).
  - `tcAufmerksamkeitHtml()` (mit `tcFilter==="alle"`, Default) enthält den Substring `"Heinz Vogel"` und `"2 Tage überfällig"`.
  - `tcPanelsHtml(faelle.filter(f=>!["Aufgenommen","Verloren"].includes(f.status)))` enthält 3× `"tc-panel"` und den Substring `"Orthopädie"`/`"Neuro-Geri"`/`"Direkt / Premium"`.

**Sichtprüfung:** Visuell ändert sich in diesem Task **nichts** — alle neuen Funktionen existieren und liefern bei direktem Konsolenaufruf bereits die korrekten Werte, werden aber von keinem Renderer aufgerufen (das kommt in Task 4).

**Commit:** `feat: Team-Cockpit-Bausteinfunktionen — KPI-Zeile, Panels mit Pipeline+Mitarbeiter-Zeilen, Aufmerksamkeit-Liste mit Fristsortierung (additiv, noch nicht verdrahtet) (Runde 6 Punkt 3, §6.1–§6.3)`

---

# Task 4 — Entfernung + `renderTeam()`-Neuaufbau (atomar)

**Lane:** `claude-implementer-pro` (kritischster Task: Umschalten von altem auf neues Rendering in einem Commit — Entfernung dreier Bestandsbausteine plus vollständige Neufassung von `renderTeam()`)

**Abhängigkeit:** Task 3 (alle `tc*`-Funktionen müssen existieren, sonst `ReferenceError` beim ersten `renderTeam()`-Aufruf nach dem Umbau — s. „Warum atomar" oben).

**Warum atomar:** siehe „Warum Entfernung + `renderTeam()`-Neuaufbau (Task 4) atomar sind" oben.

**Bezug:** Spec §3 (Was entfällt — HTML + JS), §5 (`renderTeam()`-Neufassung), §9 (zu entfernende/umbenannte Symbole).

**Dateien/Anker:** `grep -n "au-photo au-photo--sage\|^let teamFilter=\"alle\"\|function teamCockpitHtml\|function renderTeam" index.html` vor Bearbeitung ausführen und **alle** Zeilenangaben neu bestätigen. Bei Plan-Erstellung (nach Task 1–3): Deko-Figure Zeile 3770, `let teamFilter="alle";` Zeile 5777 (unmittelbar gefolgt von `setTeamFilter()`, dann den in Task 3 eingefügten `tc*`-Funktionen, dann `teamCockpitHtml()`, dann dem alten `renderTeam()`).

**Schritte:**

- [ ] **4.1** `grep`-Befehl oben ausführen, alle vier Fundstellen einzeln im Editor öffnen und die vollständigen Körper von `teamCockpitHtml()` und dem alten `renderTeam()` neu lesen.

- [ ] **4.2 — HTML: Deko-Figure entfernen** (Spec §3, `<p class="lblline">` bleibt — ist Eingangstext des Sub-Tabs, nicht Teil der Cockpit-Bausteine):
```diff
     <div class="sub" id="sub-faelle-team">
       <p class="lblline">Alle Anfragen aus allen Kanälen — an einem Ort gebündelt, klar zugeteilt, zügig beantwortet.</p>
-      <figure class="au-photo au-photo--sage"><img src="assets/kb-haus.webp" alt="" loading="lazy"><figcaption>Das Team · Klinik Bavaria</figcaption></figure>
       <div id="teamGrid"></div>
     </div>
```

- [ ] **4.3 — JS: altes `teamFilter`/`setTeamFilter()` + `teamCockpitHtml()` + altes `renderTeam()` durch das neue `renderTeam()` ersetzen** (Spec §5, §9 — `tcFilter`/`tcSetFilter()` aus Task 3 übernehmen die Rolle von `teamFilter`/`setTeamFilter()`, die alten Namen entfallen ersatzlos):
```diff
-let teamFilter="alle";
-function setTeamFilter(e){teamFilter=(teamFilter===e?"alle":e);renderTeam();}
-function teamCockpitHtml(openCases){
- const heuteFaellig=openCases.filter(f=>f.frist===dstr(0)).length;
- const ueberf=openCases.filter(f=>f.frist&&new Date(f.frist)<heute).length;
- const avg=(openCases.length/TEAM.length).toFixed(1);
- const kpis="<div class='ts-kpis'>"
-   +"<div class='ts-kpi'><div class='ts-kpi-n num'>"+openCases.length+"</div><div class='ts-kpi-l'>Offene Fälle gesamt</div></div>"
-   +"<div class='ts-kpi'><div class='ts-kpi-n num'>"+heuteFaellig+"</div><div class='ts-kpi-l'>Heute fällig</div></div>"
-   +"<div class='ts-kpi"+(ueberf?" jetzt":"")+"'><div class='ts-kpi-n num'>"+ueberf+"</div><div class='ts-kpi-l'>Überfällig</div></div>"
-   +"<div class='ts-kpi'><div class='ts-kpi-n num'>"+avg+"</div><div class='ts-kpi-l'>Ø offene Fälle / Kopf</div></div>"
-   +"</div>";
- const counts=TEAM.map(t=>openCases.filter(f=>f.owner===t).length);
- const maxN=Math.max(1,...counts);
- const bal="<div class='ts-bal'>"+TEAM.map((t,i)=>{
-   const n=counts[i];
-   const ueb=openCases.filter(f=>f.owner===t&&f.frist&&new Date(f.frist)<heute).length;
-   return "<div class='ts-bal-row'><span class='ts-bal-name'>"+escapeHtml(t)+"</span>"
-     +"<div class='ts-bal-track'><div class='ts-bal-fill' style='width:"+(n/maxN*100)+"%'></div>"
-     +(ueb?"<div class='ts-bal-ueb'></div>":"")+"</div>"
-     +"<span class='ts-bal-n num'>"+n+"</span></div>";
- }).join("")+"</div>";
- const achsen=[...new Set(openCases.map(f=>f.achse))];
- const ach="<div class='ts-achse'>"+achsen.map(a=>{
-   const n=openCases.filter(f=>f.achse===a).length;
-   return "<span class='ts-achse-chip'><span class='ts-achse-dot' style='background:"+(ACHSE_COL[a]||"var(--unklar)")+"'></span>"+escapeHtml(a)+" <b class='num'>"+n+"</b></span>";
- }).join("")+"</div>";
- return kpis+bal+ach;
-}
-function renderTeam(){
- const el=document.getElementById("teamGrid"); if(!el)return;
- const offen=f=>!["Aufgenommen","Verloren"].includes(f.status);
- const openCases=faelle.filter(offen);
- const eingangOffen=eingang.filter(m=>!m.done&&m.typ!=="passiv").length;
- const cards=TEAM.map(emp=>{
-   const mine=openCases.filter(f=>f.owner===emp);
-   const tasks=mine.filter(f=>f.aufgabe).length;
-   const fr=mine.map(f=>f.frist).filter(Boolean).sort()[0]||"—";
-   return "<button class='tm-card"+(teamFilter===emp?" on":"")+"' onclick='setTeamFilter(\""+emp+"\")'>"
-     +"<div class='tm-h'><span class='ava'>"+initialen(emp)+"</span><div class='tm-n'>"+escapeHtml(emp)+"</div></div>"
-     +"<div class='tm-kpis'><span><span class='num'>"+mine.length+"</span> Fälle</span><span><span class='num'>"+tasks+"</span> Aufgaben</span></div>"
-     +"<div class='tm-fr'>Frist: "+(fr==="—"?"—":fristText(fr))+"</div></button>";
- }).join("");
- const list=openCases.filter(f=>teamFilter==="alle"||f.owner===teamFilter)
-   .sort((a,b)=>String(a.frist||"").localeCompare(String(b.frist||"")))
-   .map(f=>"<button class='tm-task' onclick='openDetail("+f.id+")'>"
-     +"<span class='ava sm'>"+initialen(f.name)+"</span>"
-     +"<div class='tm-tmain'><div class='tm-tt'>"+escapeHtml(f.name)+" <span class='tm-ach'>· "+escapeHtml(f.achse)+"</span></div>"
-     +"<div class='tm-ts'>"+escapeHtml(f.aufgabe||"—")+"</div></div>"
-     +"<div class='tm-meta'><span class='tm-owner'>"+escapeHtml(f.owner||"—")+"</span><span>"+(f.frist?fristText(f.frist):"—")+"</span><span class='tm-status'>"+escapeHtml(f.status)+"</span></div>"
-     +"<span class='db-c-chev'>›</span></button>").join("")||"<p class='empty'>Keine offenen Aufgaben.</p>";
- el.innerHTML=
-   "<div class='tm-intake'><div><span class='num'>"+eingangOffen+"</span> offene Anfragen im zentralen Eingang · warten auf Zuordnung</div><button class='btn-ghost btn-sm' onclick='go(\"faelle\",\"anfragen\")'>Zum Eingang ›</button></div>"
-   +teamCockpitHtml(openCases)
-   +"<div class='tm-cards'>"+cards+"</div>"
-   +"<div class='tm-listhead'>Offene Aufgaben"+(teamFilter!=="alle"?" · "+escapeHtml(teamFilter)+" <button class='tm-clear' onclick='setTeamFilter(\""+teamFilter+"\")'>alle zeigen</button>":"")+"</div>"
-   +"<div class='tm-list'>"+list+"</div>";
-}
+function renderTeam(){
+ const el=document.getElementById("teamGrid"); if(!el)return;
+ const offen=f=>!["Aufgenommen","Verloren"].includes(f.status);
+ const openCases=faelle.filter(offen);
+ el.innerHTML = tcKpiRowHtml() + tcPanelsHtml(openCases) + tcAufmerksamkeitHtml();
+}
```
  (Die in Task 3 eingefügten `tc*`-Bausteinfunktionen bleiben an ihrer Stelle stehen — sie standen bereits vor `teamCockpitHtml()`, das jetzt zusammen mit dem alten `renderTeam()` entfällt. `renderAll()` ([index.html:6239](../../../index.html#L6239)) ruft weiterhin unverändert `renderTeam()` auf — kein Aufrufer-seitiger Änderungsbedarf, da der Funktionsname gleich bleibt.)

- [ ] **4.4** `grep -n "function teamCockpitHtml\|au-photo au-photo--sage\|^let teamFilter\|function setTeamFilter\b" index.html` ausführen — **kein** Treffer mehr für alle vier Muster. `grep -n "^function renderTeam" index.html` ausführen — genau 1 Treffer, Körper entspricht der neuen 5-Zeilen-Fassung.

- [ ] **4.5 — Standard-Verifikation bei 390px UND 1440px, ausführlich (dieser Task ist der riskanteste):**
  - Navigation zu `Fälle → Team` (`#sub-faelle-team`): KPI-Zeile mit 4 Karten (`2`/`67 %`/`7 Std.`/`1`, je mit Sparkline + Delta), darunter 3 Panels (Orthopädie, Neuro-Geri, Direkt/Premium — letzteres schmal, nur Pipeline ohne Mitarbeiter-Liste), darunter „Braucht Aufmerksamkeit" mit genau 1 Zeile „Heinz Vogel … 2 Tage überfällig".
  - Klick auf „S. Koordination"-Zeile im Orthopädie-Panel **und** im Neuro-Geri-Panel: beide zeigen identisch `3` offene Fälle, Last-Balken 100 %, kein „überfällig"-Badge (Zählmodell-Fix aus Task 3 greift). Klick schaltet die untere Liste auf „Offene Fälle · S. Koordination" mit 3 Zeilen in Frist-Reihenfolge (Anna Muster „heute fällig" → Maria Probst „in 2 T" → Werner Aumann „—", keine lexikographische Fehlsortierung).
  - „alle zeigen" (oder erneuter Klick auf dieselbe Zeile) → zurück zu „Braucht Aufmerksamkeit".
  - Keine `<figure>` mehr in `#sub-faelle-team`, kein `.tm-intake`-Banner sichtbar.
  - 0 Console-Errors.

**Sichtprüfung:** Die Team-Ansicht zeigt jetzt durchgehend das neue Führungs-Cockpit — KPI-Zeile, 3 Panels, Aufmerksamkeit-Liste mit funktionierendem Mitarbeiter-Filter. Alte `.tm-*`/`.ts-*`-CSS-Regeln sind an dieser Stelle noch im Dokument vorhanden, aber wirkungslos (kein Erzeuger mehr im JS/HTML) — ihre Entfernung ist Gegenstand von Task 5, kein Boot- oder Optik-Risiko in der Zwischenzeit.

**Commit:** `feat: renderTeam()-Neuaufbau — Deko-Figure/teamCockpitHtml()/altes teamFilter+setTeamFilter() entfernt, neues .tc-*-Cockpit verdrahtet (KPI-Zeile + 3 Panels + Aufmerksamkeit-Liste) (Runde 6 Punkt 3, §3/§5/§9)`

---

# Task 5 — CSS-Waisen-Sweep + finaler Abnahme-Sweep

**Lane:** `claude-implementer-pro` (Verifikations-lastiger Abschluss-Task; falls dabei ein kleiner Fund auftaucht, direkt hier fixen, kein neuer Task nötig — bei größeren Funden: stoppen, im Report melden statt selbst zu improvisieren)

**Abhängigkeit:** braucht alle vorherigen Tasks (1–4).

**Bezug:** Spec §3.1 (Aufräumliste), §7 (Abnahmekriterien, vollständig).

**Dateien/Anker:** `grep -n "\.tm-intake{\|\.tm-cards{\|\.tm-card{\|\.tm-h{\|\.tm-kpis{\|\.tm-fr{\|\.tm-listhead{\|\.tm-clear{\|\.tm-list{\|\.tm-task{\|\.tm-tmain{\|\.tm-meta{\|#sub-faelle-team>\.au-photo{\|/\* Task 2\.1 (Punkt 4)" index.html` vor Bearbeitung ausführen — alle Fundstellen der Aufräumliste bestätigen (mehrere Ergänzungs-Fundstellen je Klasse, s. Spec §3.1-Tabelle).

**Schritte:**

- [ ] **5.1** `grep`-Befehl oben ausführen, jede Fundstelle im Editor öffnen und mit der Spec-§3.1-Tabelle abgleichen (vollständig verwaist vs. Teil-Waise in geteilter Selector-Liste).

- [ ] **5.2 — vollständig verwaiste Regeln löschen** (Spec §3.1 — kein Verwender außerhalb des in Task 4 entfernten alten `renderTeam()`/`teamCockpitHtml()`; Reihenfolge/Inhalt exakt wie im Ist-Stand, Zeilennummern hier nur zur Orientierung, vor dem Löschen per `grep` neu bestätigen):

  **a) „WS7 · Mitarbeitercockpit"-Block** (Basis-Regeln, ursprünglich Zeile 1243–1269 — der Abschnitts-Kommentar `/* ===== WS7 · Mitarbeitercockpit ===== */` selbst bleibt stehen, nur die Regeln darunter werden entfernt):
```diff
-  .tm-intake{display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--brass-soft);border:1px solid var(--hair);border-left:3px solid var(--brass);border-radius:12px;padding:12px 16px;margin:0 0 16px;font:400 13.5px/1.4 Inter;color:var(--ink)}
-  .tm-intake .num{color:var(--brass-deep);font-weight:700;font-size:16px}
-  .tm-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:20px}
-  @media(min-width:1100px){.tm-cards{grid-template-columns:repeat(4,1fr)}}
-  .tm-card{text-align:left;background:var(--paper);border:1px solid var(--hair);border-radius:14px;box-shadow:var(--shadow-soft);padding:13px 15px;cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
-  @media(hover:hover){.tm-card:hover{transform:translateY(-2px);box-shadow:inset 0 0 0 3px var(--paper),inset 0 0 0 4px var(--gold-soft),var(--shadow)}}
-  .tm-card.on{border-color:var(--brass);box-shadow:0 0 0 2px var(--brass-soft)}
-  .tm-h{display:flex;align-items:center;gap:9px;margin-bottom:10px}
-  .tm-h .ava{width:34px;height:34px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font:600 12px/1 Inter}
-  .tm-n{font:600 13.5px/1.2 Inter;color:var(--ink)}
-  .tm-kpis{display:flex;gap:14px;font:400 12.5px/1 Inter;color:var(--muted)}
-  .tm-kpis .num{font:700 18px/1 "Cormorant Garamond",Georgia,serif;color:var(--ink);margin-right:3px}
-  .tm-fr{font:400 11.5px/1.3 Inter;color:var(--faint);margin-top:8px}
-  .tm-listhead{font:600 12px/1 Inter;letter-spacing:.06em;text-transform:uppercase;color:var(--brass-deep);margin:0 0 10px;display:flex;align-items:center;gap:10px}
-  .tm-clear{font:600 11px/1 Inter;color:var(--brass-deep);text-decoration:underline}
-  .tm-list{background:var(--paper);border:1px solid var(--hair);border-radius:14px;box-shadow:var(--shadow-soft);overflow:hidden}
-  .tm-task{width:100%;text-align:left;display:flex;align-items:center;gap:11px;padding:12px 15px;border-top:1px solid var(--hair2);cursor:pointer;background:transparent}
-  .tm-task:first-child{border-top:none}
-  @media(hover:hover){.tm-task:hover{background:var(--paper2)}}
-  .tm-task .ava.sm{width:32px;height:32px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font:600 11px/1 Inter}
-  .tm-tmain{flex:1;min-width:0}
-  .tm-tt{font:600 14px/1.2 Inter;color:var(--ink)}
-  .tm-ach{color:var(--muted);font-weight:400}
-  .tm-ts{font:400 12.5px/1.3 Inter;color:var(--ink-soft);margin-top:2px}
-  .tm-meta{display:flex;flex-direction:column;align-items:flex-end;gap:2px;font:400 11px/1.2 Inter;color:var(--muted);flex:0 0 auto;text-align:right}
-  .tm-owner{color:var(--brass-deep);font-weight:600}
-  .tm-status{font-size:10px;text-transform:uppercase;letter-spacing:.04em}
```

  **b) Ergänzungs-Fundstellen im „J4/J5"-Bereich** (ursprünglich Zeile 1812–1816):
```diff
-.tm-card{background:var(--paper2);border-radius:18px;box-shadow:var(--shadow-soft),inset 0 1px 0 var(--glass-hi)}
-.tm-kpis .num{font-weight:600}
-.tm-intake .num{font-family:"Fragment Mono",ui-monospace,monospace}
-.tm-fr{font-family:"Fragment Mono",ui-monospace,monospace}
-.tm-meta{font-family:"Fragment Mono",ui-monospace,monospace}
```

  **c) Ergänzungs-Fundstellen im „J4.5"-Bereich inkl. Deko-Figure-CSS** (ursprünglich Zeile 2481–2494):
```diff
-.tm-card.on{border-color:var(--sage-deep);
-  box-shadow:inset 0 0 0 3px var(--paper),inset 0 0 0 4px var(--gold-soft),0 0 0 2px var(--sage-soft)}
-.tm-intake{background:var(--paper);border:1px solid var(--gold-soft);border-left:3px solid var(--brass);border-radius:4px}
-.tm-intake .num{font-family:"Cormorant Garamond",Georgia,serif;font-weight:600;font-size:19px}
-#sub-faelle-team>.au-photo{height:auto;margin:6px 0 20px;background:var(--paper);border:1px solid var(--jade-line);
-  border-radius:4px;padding:9px;
-  box-shadow:inset 0 0 0 4px var(--paper),inset 0 0 0 5px var(--gold-faint),var(--shadow-soft)}
-#sub-faelle-team>.au-photo img{height:140px;border:1px solid var(--jade-line);filter:saturate(.85) sepia(.08)}
-#sub-faelle-team>.au-photo::after{display:none}
-#sub-faelle-team>.au-photo figcaption{position:static;left:auto;bottom:auto;margin:8px 2px 0;padding:0;
-  background:none;border:0;border-radius:0;box-shadow:none;text-shadow:none;
-  backdrop-filter:none;-webkit-backdrop-filter:none;
-  font-family:"Cormorant Garamond",Georgia,serif;font-size:10px;font-weight:600;
-  letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
```

  **d) Vollständiger `.ts-*`-Block inkl. eigenem Kommentar** (ursprünglich Zeile 3063–3080 — Kommentar `/* Task 2.1 (Punkt 4): .ts-* … */` beschreibt ausschließlich diesen Block, wird mitentfernt):
```diff
-/* Task 2.1 (Punkt 4): .ts-* — Team-Cockpit (KPI-Zeile + Belastungs-Balken + Achse-Aufteilung) */
-.ts-kpis{display:flex;gap:12px;flex-wrap:wrap;margin:0 0 16px}
-.ts-kpi{flex:1;min-width:120px;background:var(--paper2);border:1px solid var(--hair);border-radius:13px;box-shadow:var(--shadow-soft),inset 0 1px 0 var(--glass-hi);padding:11px 15px;position:relative;overflow:hidden}
-.ts-kpi::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--brass)}
-.ts-kpi.jetzt::before{background:var(--terra)}
-.ts-kpi-n{font:700 23px/1 "Cormorant Garamond",Georgia,serif;color:var(--ink)}
-.ts-kpi.jetzt .ts-kpi-n{color:var(--terra)}
-.ts-kpi-l{font:600 11px/1.1 Inter;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin-top:3px}
-.ts-bal{display:flex;flex-direction:column;gap:8px;margin:0 0 16px}
-.ts-bal-row{display:flex;align-items:center;gap:10px}
-.ts-bal-name{flex:0 0 128px;font-size:12.5px;color:var(--ink-soft);font-weight:600}
-.ts-bal-track{flex:1;height:8px;border-radius:99px;background:var(--cream2);position:relative;overflow:hidden}
-.ts-bal-fill{height:100%;border-radius:99px;background:var(--sage-deep)}
-.ts-bal-ueb{position:absolute;right:0;top:0;bottom:0;width:4px;background:var(--terra)}
-.ts-bal-n{flex:0 0 22px;text-align:right;font:700 15px/1 "Cormorant Garamond",Georgia,serif;color:var(--ink)}
-.ts-achse{display:flex;gap:8px;flex-wrap:wrap}
-.ts-achse-chip{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;padding:6px 11px;border-radius:99px;border:1px solid var(--hair);background:var(--paper)}
-.ts-achse-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
```

- [ ] **5.3 — Teil-Waisen: nur die Tokens `.tm-card,.tm-list,` aus zwei geteilten Selector-Listen entfernen** (andere Selektoren derselben Regel bleiben aktiv, Spec §3.1):
```diff
-.card,.tm-card,.tm-list,.radar-kpi,.db-cockpit,.ir-card{
+.card,.radar-kpi,.db-cockpit,.ir-card{
```
```diff
-.tm-card,.tm-list,.radar-card,.ir-card{position:relative}
+.radar-card,.ir-card{position:relative}
```

- [ ] **5.4** `grep -n "\.tm-\|\.ts-kpi\|\.ts-bal\|\.ts-achse\|#sub-faelle-team>\.au-photo" index.html` erneut ausführen — **kein** Treffer mehr im gesamten Dokument (Kommentar-Fundstellen ohne Coderelevanz bei Zeile ~1691/~7148, die auf `.tm-card`/`.rs-card` in reiner Doku-Prosa verweisen, sind laut Spec §3.1 optional und **keine** harte Anforderung dieser Spec — nicht anfassen, falls noch vorhanden).

- [ ] **5.5** `grep -c "@keyframes" index.html` — weiterhin genau **9**.

- [ ] **5.6 — Gesamt-Abnahme-Sweep, alle 11 Kriterien der Spec (§7) im Browser (idealerweise per CDP/Browser-Tool) durchspielen, bei 390px UND 1440px:**
  1. **KPI-Zeile:** 4 Karten zeigen exakt `2` (Aufnahmen · 7 Tage), `67 %` (Conversion), `7 Std.` (Ø Reaktionszeit), `1` (Überfällige Aufgaben) — je Karte sichtbare Trendlinie + Delta `+2`/`+9`/`−2`/`−2`, alle vier werten als „gut" (grün).
  2. **Panels korrekt gruppiert:** Orthopädie zeigt Pipeline `1/0/0/1/0/1` + „1 verloren"-Caption; Neuro-Geri zeigt `1/0/0/1/1/1`; Direkt/Premium zeigt nur Qualifizierung=1. Fallzahlen gesamt je Panel: Orthopädie **4**, Neuro-Geri **4**, Direkt/Premium **1** (Summe 9).
  3. **Mitarbeiter-Zeilen:** S. Koordination erscheint in **beiden** Panels (Orthopädie + Neuro-Geri) mit **identischer** Zahl (**3** offene Fälle, Last-Balken 100 %, 0 überfällig). M. Belegung nur in Neuro-Geri (2, 67 %, 0 überfällig). Recovery Manager in keiner `.tc-ma-list` (Direkt/Premium ist `schmal`). T. Abrechnung nirgends.
  4. **Filter-Klick + Sortierung:** Klick auf „S. Koordination" → „Offene Fälle · S. Koordination", genau 3 Zeilen in dieser Reihenfolge: Anna Muster („heute fällig", `warn`) → Maria Probst („in 2 T", `ok`) → Werner Aumann („—", keine Farbklasse, ans Ende sortiert). „alle zeigen" führt zurück zu „Braucht Aufmerksamkeit".
  5. **„Braucht Aufmerksamkeit":** genau **1 Zeile** — „Heinz Vogel — Übernahmefähigkeit Beatmung klären — Recovery Manager — **2 Tage überfällig**" (Zinnober-Text). Klick → `openFallakte(6)`.
  6. **Leerzustand als realer Code-Pfad:** in der Konsole `faelle.find(f=>f.id===6).frist=dstr(3)` setzen, `renderTeam()` erneut aufrufen → „Keine überfälligen Aufgaben — alles im grünen Bereich." (kein `<button>`, kein Klick-Handler). Danach den Seed-Wert nicht dauerhaft verändert lassen (nur Konsolen-Check, kein Commit-relevanter Zustand).
  7. **Zeitstabiler Begleit-Fix in der Fallakte:** `openFallakte(1)` (Anna Muster, `frist:dstr(0)`) → Aufgaben-Hero zeigt „Frist heute fällig" (`warn`), nicht „überfällig (1 T)" (`bad`) — unabhängig von der Tageszeit.
  8. **Entfernte Elemente weg:** kein `<figure>` mehr in `#sub-faelle-team`, kein `.tm-intake`-Banner, keine `.tm-card`/`.tm-list`-Elemente im DOM.
  9. **Mobile (390px):** KPI-Zeile bleibt 2×2 (kein horizontaler Überlauf), Panels stapeln einspaltig, Mitarbeiter-/Aufmerksamkeit-Zeilen umbrechen (`flex-wrap`) ohne Überlauf.
  10. **0 Console-Errors**, beide Breiten.
  11. **Unberührte Bereiche:** `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `#refOverlay`, `ma-mode`/„Mein Tag" (`renderMeinTag()`), „Auswertung" (`renderCharts()`) unverändert; genau 9 `@keyframes` (bereits in 5.5 geprüft); `kennzahlen()` zeigt außerhalb von `.ueberf` keine Änderung — das „Heute"-View-Badge, das `kennzahlen().ueberf` anzeigt, zeigt dadurch ebenfalls die korrekte Zahl, keine optische Änderung an Layout/Markup dort.

**Sichtprüfung:** Kein CSS-Orphan aus dem alten `.tm-*`/`.ts-*`-Team-Cockpit mehr im Dokument; alle 11 Abnahmekriterien der Spec sind im Browser bei beiden Breiten grün; die Cofounder-Bereiche, `ma-mode`/„Mein Tag" und „Auswertung" sind unangetastet; das Team-Führungs-Cockpit zeigt exakt die in der Spec durchgerechneten Zahlen.

**Commit:** `chore: .tm-*/.ts-*-CSS-Waisen entfernt (Team-Cockpit vollständig auf .tc-* umgestellt), Gesamt-Abnahme-Sweep aller 11 Kriterien grün (Runde 6 Punkt 3, §3.1/§7)`

---

## Reihenfolge / Abhängigkeiten

```
Task 1 (Begleit-Fix fristKlasse/fristText/kennzahlen().ueberf, zeitstabil) ── eigenständig,
      │                                                                       app-weit wirksam
      ▼
Task 2 (Team-Cockpit-Datengrundlage: Heinz-Vogel-Seed, TC_WOCHE/TC_ERLEDIGT, CSS) ── braucht
      │                                                                              Task 1 für korrekte Zahlen
      ▼
Task 3 (tc*-Bausteinfunktionen, additiv/unverdrahtet) ── braucht Task 1 (zeitstabile Frist-
      │                                                   Funktionen) + Task 2 (TC_WOCHE/TC_ERLEDIGT)
      ▼
Task 4 (Entfernung + renderTeam()-Neuaufbau, ATOMAR) ── braucht alle tc*-Funktionen aus Task 3
      │
      ▼
Task 5 (CSS-Waisen-Sweep + Gesamt-Abnahme)
```

Sequentiell in dieser Reihenfolge ausführen (eine Datei, nie parallel). Task 1 ist der Begleit-Fix und muss zuerst laufen, weil alle folgenden Zahlen ihn voraussetzen. Task 2 und 3 sind additiv und bootbar, ohne dass eine bestehende Funktion die neuen Bausteine liest — das alte Team-Cockpit bleibt bis Task 4 unverändert sichtbar und funktionsfähig. Task 4 ist der einzige Bruchpunkt (Umschalten von alt auf neu) und deshalb bewusst atomar. Task 5 schließt mit dem CSS-Aufräumen und der vollständigen Abnahme ab.

---

## Nicht-Ziele dieser Runde (aus Spec §8, hier zur Erinnerung)

- `ma-mode`/„Mein Tag" (`renderMeinTag()`, `#view-meintag`) bleibt vollständig unberührt.
- „Auswertung"-View (`renderCharts()`) unberührt — andere Kennzahlenebene, kein Überschneidungsbedarf.
- Ausnahme vom sonstigen „nur wiederverwenden, nicht ändern": `kennzahlen()` bekommt genau eine geänderte Zeile (`ueberf`, Task 1) — keine sonstige Änderung an der Funktion, keine neuen Rückgabefelder, keine Änderung an ihrem Aufrufort/ihrer Signatur. `fristKlasse()`/`fristText()` (Task 1) sind die einzigen zwei weiteren Bestandsfunktionen, die diese Spec anfasst.
- Keine Änderung an `renderWichtig()` — nutzt bereits eine Tage-gerundete Formel, nicht dieselbe Bug-Familie.
- Keine Persistenz von `tcFilter` über einen Seitenreload hinaus (wie zuvor bei `teamFilter`).
- Kein Ausbau der Board-Ansicht um einen Owner-Filter — der Mitarbeiter-Filter dieser Spec lebt ausschließlich innerhalb der Team-Ansicht selbst.
- Keine neuen Keyframes, keine neuen Datenarray-Felder außer dem einen Wert-Tweak (Heinz-Vogel-Frist), `escapeHtml` für alle dynamischen Inhalte, kein `Math.random`, 390px und 1440px verifizieren, 0 Console-Errors.
