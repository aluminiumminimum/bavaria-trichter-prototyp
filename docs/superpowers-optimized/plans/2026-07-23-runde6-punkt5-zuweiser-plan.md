# Runde 6, Punkt 5 — Zuweiser-After-Sales-Niveau + Sterne-Ranking: Implementierungsplan

> **Für ausführende Agenten:** Dieser Plan wird Subagent-Driven umgesetzt — pro Task ein frischer Agent, kein Schreiben durch das orchestrierende Modell selbst. Lane-Tag pro Task beachten. Jeder Task arbeitet ausschließlich in `index.html`; **vor jeder Anker-Zeile den `grep`-Befehl aus dem Task selbst erneut ausführen** — Zeilennummern verschieben sich durch jeden vorherigen Task. Die hier notierten Zeilen sind der Stand bei Plan-Erstellung (23.07.2026, `index.html` 7266 Zeilen, Commit `38e2f58`), nicht garantiert der Stand bei Ausführung.

**Bezug:** Setzt [2026-07-23-runde6-punkt5-zuweiser-design.md](../specs/2026-07-23-runde6-punkt5-zuweiser-design.md) vollständig um — Anlass-Katalog-Rework in `anlaesse()` (nur `zuweiser-*`-Zweige), `zwSterne()` + Sterne-Ranking in der Stammdaten-Liste, `.zwa-*`-Etiketten-Karten für `#zAnlaesse` statt `arCard()`. Format/Konventionen übernommen vom vorherigen Sprint-Plan ([2026-07-23-runde6-punkt4-inreha-akte-plan.md](./2026-07-23-runde6-punkt4-inreha-akte-plan.md)).

**Architektur:** Alle Änderungen in `index.html` (self-contained, kein Build-Prozess, „Tests" = konkrete Browser-/CDP-Checks + Konsolen-Snippets, keine Test-Framework-Suite). Sequentielle Ausführung — **nie parallel**, jeder Task fasst dieselbe Datei an. Nach jedem Task: Git-Commit (nur `index.html` staged, niemals `docs/MicrosoftTeams-video.mp4`). Die App bleibt nach **jedem einzelnen Task** lauffähig und visuell korrekt (0 Console-Errors, kein kaputter oder optisch falscher Zwischenzustand).

---

## Architekten-Ergänzungen (bei Bestandslektüre gefunden, Spec ergänzt/korrigiert)

Die Spec ist inhaltlich korrekt und vollständig durchgerechnet, hat aber vier Lücken, die beim Umsetzen entstehen würden, wenn man die Spec-Diffs wörtlich und isoliert anwendet. Alle vier werden unten in den Tasks aufgelöst:

**(1) Scope-Filter in `anlaesse()` fehlt den beiden neuen Typen.** Zeile 5196 (Ist-Stand): `if(scope==="zuweiser")return sorted.filter(a=>["zuweiser-rhythmus","zuweiser-meilenstein","zuweiser-jubilaeum","zuweiser-trend"].includes(a.typ));` — die Spec fügt `zuweiser-bericht`/`zuweiser-fortbildung` in §3.4/§3.5 als neue Blöcke ein, patcht aber nirgends diese Whitelist. Ohne Fix würden beide neuen Anlass-Typen zwar berechnet, aber von `renderZuweiser()`s `anlaesse("zuweiser")`-Aufruf **stillschweigend verworfen** — RHÖN-KLINIKUM Campus' Abschlussbericht- und Fortbildungs-Karte (Abnahmekriterien §8 Punkt 3+4) würden nie erscheinen. **Fix in Task 2**, in derselben Code-Stelle, in der die neuen Blöcke eingefügt werden.

**(2) HTML-Container für die Sterne-Filter-Chips fehlt.** Die Spec beschreibt in §5.3 nur die JS-Logik (`zwChip()`, Einfügung „vor `.zgrid`, innerhalb von `renderZuweiser()`"), aber `renderBestand()` (das Vorbild) schreibt seine Chips in ein **bestehendes** `<div id="tierFilter">` ([index.html:3825](../../../index.html#L3825)) — für die Zuweiser-Stammdaten-Seite existiert kein Pendant im Markup (`#sub-netzwerk-zuweiser` `.nwt-pane[data-nwt="stamm"]`, [index.html:3792-3809](../../../index.html#L3792)). **Fix in Task 3:** neuer leerer Container `<div id="zwSterneChips"></div>` direkt vor `<div class="zgrid" id="zgrid">` ([index.html:3808](../../../index.html#L3808)), analog zur bestehenden Konvention (eigenes Element pro Render-Ziel: `zcatgrid`/`zmap`/`zgrid`).

**(3) `.zwa-noster`-CSS fehlt.** Spec §5.2 verwendet `<span class='zwa-noster'>kein Ranking</span>` für Zuweiser ohne Ranking (`faelle<1`, Archiv), aber der CSS-Block in §5.1 definiert diese Klasse nicht. **Fix:** eine Zeile CSS in Task 1 ergänzt (`color:var(--muted)`, passend zum bestehenden gedämpften Label-Stil, z. B. `.zn`/`.rnote`).

**(4) Übergangs-Fenster zwischen Task 2 (neue `anlaesse()`-Typen) und Task 4 (`#zAnlaesse`-Neuaufbau).** Zwischen diesen beiden Tasks ruft `renderZuweiser()` noch die **alte** `arCard()`-Rendering-Kette auf. `arCard()`s `isZ`-Erkennung ([index.html:5213](../../../index.html#L5213)) und `AR_TYP` ([index.html:5209](../../../index.html#L5209)) kennen die beiden neuen Typen `zuweiser-bericht`/`zuweiser-fortbildung` nicht — ohne Gegenmaßnahme würde nach Task 2 (aber vor Task 4) `AR_TYP[a.typ]` zu `undefined` auswerten und im Kartentext sichtbar „undefined" statt eines Labels erscheinen (kein Absturz, aber ein sichtbarer, wenn auch temporärer Darstellungsfehler in einem als „lauffähig" deklarierten Zwischenzustand). **Fix:** Task 2 ergänzt `AR_TYP`/das `isZ`-Array **vorübergehend** um die zwei neuen Typen (mit dem Kommentar, dass sie in Task 5 zusammen mit alter Rang-Logik als Waisen entfernt werden, sobald `arCard()` nach Task 4 nie mehr mit einem `zuweiser-*`-Typ aufgerufen wird). Dieses temporäre Stück Code ist bewusst dokumentierte Übergangsarbeit, keine dauerhafte Altlast — Regel „Discipline: eigene Hacks vor Fertigmeldung selbst aufräumen" wird durch den fest eingeplanten Task-5-Abbau erfüllt.

Diese vier Punkte ändern **kein** einziges spezifiziertes Verhalten oder Zahlenergebnis der Spec — sie schließen ausschließlich Lücken zwischen den isoliert beschriebenen Diffs, die beim wörtlichen, sequenziellen Anwenden sonst zu einem gebrochenen oder unvollständigen Zwischen- bzw. Endzustand führen würden.

---

## Harte Regeln (jeder Task, aus Spec + projektweitem `CLAUDE.md`)

- Cofounder-Namespaces **nicht anfassen**: `.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`. `#refOverlay` tabu. `openReferrer()` bleibt Blackbox, weiterhin nur über den bestehenden `.zw-portal`-Button aufgerufen ([index.html:5627](../../../index.html#L5627)).
- **`anlaesse()` darf NUR die `zuweiser-*`-Zweige anfassen.** Die drei Patienten-Blöcke (`geburtstag`/`jubilaeum`/`wiederbedarf`, [index.html:5127-5148](../../../index.html#L5127)) bleiben **byte-identisch** — vor und nach Task 2 per Diff prüfen. `radar.forEach(...)` (Wiederbedarf-Block) ebenfalls unangetastet.
- **Alle 5 Aufrufstellen von `anlaesse()`** ([index.html:5200](../../../index.html#L5200), [5230](../../../index.html#L5230), [5464](../../../index.html#L5464), [5610](../../../index.html#L5610), [5614](../../../index.html#L5614)) nach Task 2 gegenprüfen — keine darf brechen, insbesondere `renderRadar()` (scope `"patienten"`, Zeile 5464) darf nie einen `zuweiser-*`-Typ sehen.
- **„Erledigt"-Buttons:** Session-State (`_arDone`-Set, keine Persistenz), Toast-Reuse über das bestehende `arAktion()`/`inbToast` — **kein neuer Toast-Mechanismus**, `arAktion()` selbst bleibt unverändert (ruft bereits `renderZuweiser()` nach jedem Klick auf).
- **Alter Rang-Code (`.zw-rank`):** vor dem Löschen per `grep` **alle** Fundstellen (CSS + Markup) bestätigen, dann Ersatz (Sterne) und Waisen-Entfernung (`.zw-rank`-CSS) **im selben Commit** (Task 3) — kein Zwischenzustand mit totem CSS.
- **Exakt 9 Keyframes** — verifiziert im Ist-Stand (`grep -c "@keyframes" index.html` = 9). Diese Runde führt **keine** neue ein (`.zwa-*` ist ausschließlich statisches CSS).
- `escapeHtml()` für jeden dynamisch eingefügten Text in allen neuen `.zwa-*`-Bausteinen. **Kein `Math.random`** — alles deterministisch (`zNameHash()`, `dstr()`, Kalenderrechnung).
- Beide Breiten prüfen: **390px und 1440px**. **0 Console-Errors** bei jedem Verifikationsschritt.
- Neue CSS ausschließlich als **kommentierter Block direkt vor `</style>`** ([index.html:3143](../../../index.html#L3143)), neuer Namespace `.zwa-*`.
- `personen[]`, `faelle[]`, `inReha[]` werden von dieser Spec **nicht** angefasst (0 Zeilen-Diff) — nur `zuweiser[]` bekommt die zwei dokumentierten Wert-/Feld-Tweaks (Task 1).
- **Niemals `docs/MicrosoftTeams-video.mp4` oder sonstige Dateien staged** — jeder Commit nur `index.html`.

---

## Lanes

- **`claude-implementer`** (Haiku) — Task 1 (rein mechanisch: zwei Seed-Tweaks an exakt vorgegebenen `zuweiser[]`-Zeilen, ein neuer CSS-Block wörtlich vor `</style>`).
- **`claude-implementer-pro`** (Sonnet) — Task 2 (`anlaesse()`-Rework: alle sechs `zuweiser-*`-Blöcke, Scope-Filter-Fix, temporäre `AR_TYP`/`isZ`-Ergänzung — Verzweigungslogik + Sorgfaltspflicht bei den 5 Aufrufstellen, kein mechanisches Abtippen), Task 3 (`zwSterne()` + Stammdaten-Sterne-Umbau + Filter-Chips + HTML-Container, `.zw-rank`-Waisen-Entfernung atomar im selben Commit), Task 4 (`#zAnlaesse`-Neuaufbau: `ZWA_TYP`/`zwaKarte()`/`renderZuweiserAnlaesse()`, Verdrahtung in `renderZuweiser()`), Task 5 (Waisen-Sweep der temporären `AR_TYP`/`isZ`-Ergänzungen aus Task 2 + finaler CDP-Abnahme-Sweep aller 11 Spec-Kriterien).

---

## Standard-Verifikation (nach jedem Task)

1. `grep -c "function " index.html` vor/nach vergleichen — keine unbeabsichtigt gelöschten Funktionen außer den in Task 5 explizit dokumentierten Waisen.
2. Browser: Seite neu laden, Console auf 0 Errors prüfen.
3. `#view-netzwerk` → Zuweiser-Tab, beide Reiter („Aktionen & Pflege"/„Stammdaten & Ranking") bei 390px und bei 1440px öffnen, auf Overflow/Lesbarkeit prüfen.
4. Cofounder-Bereiche (`#refOverlay`, `.mx-*`, `.rsp-*`, `.rp-*`, `.rpd-*`) unangetastet gegentesten — `.zw-portal`-Button öffnet weiterhin `openReferrer()`.
5. `grep -c "@keyframes" index.html` — weiterhin genau **9**.
6. Commit mit klarer Botschaft, welcher Spec-Abschnitt umgesetzt wurde — **nur `index.html` staged**.
7. Jeder Task unten endet zusätzlich mit einer eigenen **Sichtprüfung**.

---

# Task 1 — Seeds: Leopoldina-`seit`-Tweak + `letzterAbschluss`-Feld + `.zwa-*`-CSS

**Lane:** `claude-implementer` (zwei wörtlich vorgegebene Seed-Tweaks an exakten Zeilen, ein CSS-Block wörtlich vor `</style>`, keine eigene Entscheidung nötig)

**Abhängigkeit:** keine — reine additive/wert-tweakende Datengrundlage. Bootet unverändert; der Leopoldina-`seit`-Tweak wirkt bereits auf die **alte**, noch unveränderte `zuweiser-jubilaeum`-Bedingung (`Math.abs(diff)<=30`) — Leopoldinas `diff` wechselt von −8 auf 0, bleibt also weiterhin im alten Fenster, nur der angezeigte Text ändert sich vorübergehend zu „in 0 Tagen seit Partnerschaftsbeginn" (statt „8 Tage vergangen") bis Task 2 den Text komplett ersetzt. Das ist erwarteter Zwischenzustand, keine Regression. `letzterAbschluss` ist ein neues, optionales Feld, das von keiner bestehenden Funktion gelesen wird (additiv/inert bis Task 2).

**Bezug:** Spec §7 (Seeds-Diff), §5.1 (CSS), Architekten-Ergänzung (3) (`.zwa-noster`).

**Dateien/Anker:** `grep -n "seit:\"2019-07-15\"\|name:\"RHÖN-KLINIKUM Campus\"\|^</style>" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: Leopoldina-Zeile 4321, RHÖN-Zeile 4322, `</style>` Zeile 3143.

**Schritte:**

- [ ] **1.1** `grep`-Befehl oben ausführen, alle drei Fundstellen bestätigen.

- [ ] **1.2 — Leopoldinas `seit` justieren** (Spec §7(1) — Jubiläums-Demo-Robustheit, Jahr/Monat unverändert, nur Tag-im-Monat-Nudge):
```diff
- {name:"Leopoldina-Krankenhaus",typ:"Akutklinik mit Privatstation",ort:"Schweinfurt (~25 km)",rel:"Ortho (EPZ), Neuro",ap:"Hr. Brenner (Privatstation)",tel:"0971 0000-231",mail:"brenner@demo-klinik.local",faelle:6,letzter:dstr(-1),draht:"●●●",status:"aktiv",seit:"2019-07-15",next:"Quartalsgespräch vereinbaren"},
+ {name:"Leopoldina-Krankenhaus",typ:"Akutklinik mit Privatstation",ort:"Schweinfurt (~25 km)",rel:"Ortho (EPZ), Neuro",ap:"Hr. Brenner (Privatstation)",tel:"0971 0000-231",mail:"brenner@demo-klinik.local",faelle:6,letzter:dstr(-1),draht:"●●●",status:"aktiv",seit:"2019-07-23",next:"Quartalsgespräch vereinbaren"},
```

- [ ] **1.3 — `letzterAbschluss` bei RHÖN-KLINIKUM Campus ergänzen** (Spec §7(2) — additives, optionales Feld, alle Bestandsfelder unverändert):
```diff
- {name:"RHÖN-KLINIKUM Campus",typ:"Akutklinik · Maximalversorger",ort:"Bad Neustadt (~20 km)",rel:"Neuro, Ortho, SalutoCare",ap:"Fr. Albrecht (Sozialdienst)",tel:"0971 0000-242",mail:"albrecht@demo-klinik.local",faelle:4,letzter:dstr(-3),draht:"●●○",status:"aktiv",seit:"2020-03-12",next:"Feedback zu letzter Übernahme geben"},
+ {name:"RHÖN-KLINIKUM Campus",typ:"Akutklinik · Maximalversorger",ort:"Bad Neustadt (~20 km)",rel:"Neuro, Ortho, SalutoCare",ap:"Fr. Albrecht (Sozialdienst)",tel:"0971 0000-242",mail:"albrecht@demo-klinik.local",faelle:4,letzter:dstr(-3),draht:"●●○",status:"aktiv",seit:"2020-03-12",next:"Feedback zu letzter Übernahme geben",letzterAbschluss:dstr(-5)},
```
  Die übrigen 9 Zuweiser bekommen **kein** `letzterAbschluss`-Feld (bewusst `undefined` — sonst würde `zuweiser-bericht` in Task 2 dauerhaft für alle mit `faelle>=1` feuern, s. Spec §3.4).

- [ ] **1.4 — neuer CSS-Block vor `</style>`** (`.zwa-*`-Namespace, wörtlich aus Spec §5.1, plus die in Architekten-Ergänzung (3) nachgetragene `.zwa-noster`-Regel):
```css
/* Runde 6 Punkt 5: .zwa-* — Zuweiser-Anlass-Karten im Etiketten-Stil (Doppelrahmen + Gold-Eckwinkel,
   Muster wie .mtp-row), ersetzt arCard()/.radar-card für die Zuweiser-Pflege. Keine neue Animation. */
.zwa-group{margin-bottom:18px}
.zwa-card{position:relative;background:var(--paper);border:1px solid var(--jade-line);border-radius:4px;
  padding:14px 16px;margin-bottom:12px;box-shadow:inset 0 0 0 3px var(--paper),inset 0 0 0 4px var(--gold-faint),var(--shadow-soft)}
.zwa-card::before,.zwa-card::after{content:"";position:absolute;width:9px;height:9px;pointer-events:none;opacity:.6}
.zwa-card::before{top:8px;left:8px;border-top:1px solid var(--brass);border-left:1px solid var(--brass)}
.zwa-card::after{bottom:8px;right:8px;border-bottom:1px solid var(--brass);border-right:1px solid var(--brass)}
.zwa-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.zwa-ico{font-size:14px;color:var(--brass-deep)}
.zwa-typ{font:600 10.5px/1 Inter;letter-spacing:.07em;text-transform:uppercase;color:var(--brass-deep)}
.zwa-name{font-family:"Cormorant Garamond",Georgia,serif;font-size:19px;font-weight:700;margin:2px 0 6px;color:var(--ink)}
.zwa-text{font-size:13.5px;color:var(--ink-soft);line-height:1.45;margin:0 0 10px}
.zwa-foot{display:flex;align-items:center;justify-content:flex-end}
.zwa-noster{font:600 12px/1 Inter;color:var(--muted)}
```

- [ ] **1.5** `grep -n "seit:\"2019-07-23\"\|letzterAbschluss:dstr(-5)\|\.zwa-group{\|\.zwa-noster{" index.html` ausführen — je 1 Fundstelle.

- [ ] **1.6 — Standard-Verifikation bei 390px UND 1440px:** App bootet unverändert. In der Browser-Konsole:
  - `zuweiser[0].seit` ergibt `"2019-07-23"`.
  - `zuweiser[1].letzterAbschluss` ergibt einen Datumsstring 5 Tage vor heute (`dstr(-5)`).
  - `jahrestagDiff(zuweiser[0].seit)` ergibt `0`.
  - **Erwarteter, temporärer Sichteffekt:** Im Reiter „Aktionen & Pflege" zeigt Leopoldinas Jubiläums-Karte (noch mit altem Text/altem `arCard()`) „in 0 Tagen seit Partnerschaftsbeginn" statt vorher „8 Tage vergangen" — korrekt und erwartet, wird in Task 2 durch den neuen Text ersetzt. Kein neues optisches Element aus dem `.zwa-*`-CSS sichtbar (noch von keinem Markup erzeugt).
  - 0 Console-Errors.

**Sichtprüfung:** Keine sichtbare Struktur-Änderung außer dem einen erwarteten Text-Detail bei Leopoldinas Jubiläums-Karte (Tage-Zahl 8→0). `.zwa-*`-CSS ist inert (kein Markup nutzt es).

**Commit:** `feat: Zuweiser-Seeds — Leopoldina seit-Tweak (Jubiläums-Demo-Robustheit), letzterAbschluss-Feld bei RHÖN-KLINIKUM Campus (additiv), .zwa-*-CSS-Block (Runde 6 Punkt 5, §5.1/§7)`

---

# Task 2 — `anlaesse()`-Rework: sechs `zuweiser-*`-Blöcke + Scope-Filter-Fix

**Lane:** `claude-implementer-pro` (kritischster Logik-Task: sechs Bedingungs-/Text-Blöcke, Scope-Filter-Erweiterung, Prüfpflicht über alle 5 Aufrufstellen — kein mechanisches Abtippen, Schwellenwerte und Gates müssen exakt sitzen)

**Abhängigkeit:** Task 1 (Leopoldina-`seit`-Tweak und `letzterAbschluss`-Feld müssen gesetzt sein, damit die Konsolen-Verifikation unten die in der Spec vorgerechneten Werte liefert).

**Bezug:** Spec §3 (kompletter Anlass-Katalog), Architekten-Ergänzungen (1) (Scope-Filter-Fix) und (4) (temporäre `AR_TYP`/`isZ`-Ergänzung).

**Warum die drei Patienten-Blöcke unangetastet bleiben müssen:** `anlaesse()` liefert auch die Patienten-Typen `geburtstag`/`jubilaeum`/`wiederbedarf` ([index.html:5127-5148](../../../index.html#L5127)) — Thema von Punkt 6, nicht dieser Spec (Spec §9 Nicht-Ziele). Dieser Task ändert **ausschließlich** die `zuweiser.forEach(...)`-Blöcke und die Scope-Filter-Zeile danach.

**Dateien/Anker:** `grep -n "^function anlaesse\|zuweiser.forEach(z=>{" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `anlaesse()` beginnt Zeile 5125, die vier `zuweiser.forEach`-Blöcke (rhythmus/meilenstein/jubilaeum/trend) liegen bei 5152/5161/5169/5181, Funktion endet Zeile 5198.

**Schritte:**

- [ ] **2.1** `grep`-Befehl oben ausführen, den vollständigen `anlaesse()`-Körper neu lesen. Vor der Bearbeitung: Zeilen 5127-5148 (die drei Patienten-Blöcke) in eine Diff-Referenz kopieren — nach der Bearbeitung müssen diese Zeilen **byte-identisch** bleiben.

- [ ] **2.2 — die vier bestehenden `zuweiser-*`-Blöcke (rhythmus/meilenstein/jubilaeum) + zwei neue Blöcke (bericht/fortbildung) + Scope-Filter ersetzen**, `zuweiser-trend`-Block ([index.html:5181-5191](../../../index.html#L5181)) bleibt **komplett unverändert** (Spec §3.6):

```diff
  zuweiser.forEach(z=>{
   if(z.faelle<1)return;
   const staerke=((z.draht||"").match(/●/g)||[]).length;
   const kad=staerke>=3?90:staerke===2?180:330;
   const seit=z.letzter?Math.round((heute-new Date(z.letzter))/86400000):9999;
   if(seit<kad)return;
   const key="zuw-rhy:"+z.name;if(_arDone.has(key))return;
-  out.push({key:key,typ:"zuweiser-rhythmus",urg:seit>=kad*1.5?"jetzt":"bald",tage:seit===9999?999:seit,titel:z.name,sub:seit+" Tage kein Kontakt · "+(z.next||""),sterne:null,geste:{label:z.next||"Kontakt aufnehmen",cta:"Kontakt aufnehmen"},zName:z.name});
+  const monate=Math.round(seit/30);
+  out.push({key:key,typ:"zuweiser-rhythmus",urg:seit>=kad*1.5?"jetzt":"bald",tage:seit===9999?999:seit,titel:z.name,sub:"Seit "+monate+" Monaten kein fachlicher Austausch — Anruf mit Belegungs-Update anbieten.",sterne:null,geste:{label:z.next||"Kontakt aufnehmen",cta:"Kontakt aufnehmen"},zName:z.name});
  });
  zuweiser.forEach(z=>{
   if(z.faelle<1)return;
-  const schwellen=[20,10,5].filter(s=>z.faelle>=s);
+  const schwellen=[50,25,10].filter(s=>z.faelle>=s);
   if(!schwellen.length)return;
   const schwelle=schwellen[0];
   const key="zuw-meil:"+z.name+":"+schwelle;if(_arDone.has(key))return;
-  out.push({key:key,typ:"zuweiser-meilenstein",urg:"bald",tage:0,titel:z.name,sub:"Dankeschön-Geste: "+schwelle+". Patient",sterne:null,geste:{label:"Dankeschön senden",cta:"Kontakt aufnehmen"},zName:z.name});
+  out.push({key:key,typ:"zuweiser-meilenstein",urg:"bald",tage:0,titel:z.name,sub:schwelle+". gemeinsamer Patient erreicht — Persönlicher Dank und Outcome-Bilanz der bisherigen Patienten anbieten.",sterne:null,geste:{label:"Dankeschön senden",cta:"Kontakt aufnehmen"},zName:z.name});
  });
  zuweiser.forEach(z=>{
   if(z.faelle<1)return;
-  const diff=jahrestagDiff(z.seit);
-  if(diff===null||Math.abs(diff)>30)return;
-  const key="zuw-jub:"+z.name;if(_arDone.has(key))return;
-  out.push({key:key,typ:"zuweiser-jubilaeum",urg:Math.abs(diff)<=7?"jetzt":"bald",tage:diff,titel:z.name+" — Partnerschafts-Jubiläum",sub:(diff<0?Math.abs(diff)+" Tage vergangen":"in "+diff+" Tagen")+" seit Partnerschaftsbeginn",sterne:null,geste:{label:"Jubiläums-Geste senden",cta:"Kontakt aufnehmen"},zName:z.name});
+  const partnerTage=Math.round((heute-new Date(z.seit))/86400000);
+  if(partnerTage<350)return;
+  const diff=jahrestagDiff(z.seit);
+  if(diff===null||Math.abs(diff)>14)return;
+  const key="zuw-jub:"+z.name;if(_arDone.has(key))return;
+  const jahre=Math.round(partnerTage/365.25);
+  out.push({key:key,typ:"zuweiser-jubilaeum",urg:Math.abs(diff)<=7?"jetzt":"bald",tage:diff,titel:z.name,sub:jahre+". Jahrestag der Partnerschaft (seit "+z.seit.slice(0,4)+") — Jahres-Kooperationsgespräch mit Chefarzt/Leitung anbieten.",sterne:null,geste:{label:"Kooperationsgespräch anbieten",cta:"Termin anbieten"},zName:z.name});
  });
+ /* Runde 6 Punkt 5 (§3.4): zuweiser-bericht — wichtigster After-Sales-Moment. Additives, optionales
+    Feld z.letzterAbschluss (nur bei RHÖN-KLINIKUM Campus gesetzt, s. Task 1/Spec §7). */
+ zuweiser.forEach(z=>{
+  if(!z.letzterAbschluss)return;
+  const tage=Math.round((heute-new Date(z.letzterAbschluss))/86400000);
+  if(tage<0||tage>14)return;
+  const key="zuw-ber:"+z.name;if(_arDone.has(key))return;
+  out.push({key:key,typ:"zuweiser-bericht",urg:tage<=3?"jetzt":"bald",tage:tage,titel:z.name,sub:"Gemeinsamer Patient vor "+tage+" Tagen entlassen — Abschlussbericht und Dank an den Zuweiser senden.",sterne:null,geste:{label:"Abschlussbericht senden",cta:"Abschlussbericht senden"},zName:z.name});
+ });
+ /* Runde 6 Punkt 5 (§3.5): zuweiser-fortbildung — quartalsweise CME-Einladung, Fälligkeit deterministisch
+    aus dem bestehenden zNameHash() abgeleitet (kein Math.random), damit nicht alle qualifizierten
+    Zuweiser am selben Tag feuern. */
+ zuweiser.forEach(z=>{
+  if(z.faelle<3)return;
+  const h=zNameHash(z.name);
+  const qStartMonth=Math.floor(heute.getMonth()/3)*3;
+  const quarterStart=new Date(heute.getFullYear(),qStartMonth,1);
+  const due=new Date(quarterStart);due.setDate(due.getDate()+(h%84));
+  const diff=Math.round((due-new Date(heute.getFullYear(),heute.getMonth(),heute.getDate()))/86400000);
+  if(Math.abs(diff)>7)return;
+  const key="zuw-fb:"+z.name+":"+heute.getFullYear()+"Q"+(qStartMonth/3+1);if(_arDone.has(key))return;
+  out.push({key:key,typ:"zuweiser-fortbildung",urg:diff<0?"jetzt":"bald",tage:Math.max(0,diff),titel:z.name,sub:"Einladung zu Fortbildung/Hospitation (CME) für das laufende Quartal versenden.",sterne:null,geste:{label:"Einladung senden",cta:"Einladung senden"},zName:z.name});
+ });
  /* §5.2 Trend-Erkennung — reagiert auf Auffälligkeiten, unabhängig von der Kontakt-Kadenz oben. [Kommentar unverändert] */
  zuweiser.forEach(z=>{
   [unverändert — kein Diff]
  });
  const ord={jetzt:0,bald:1,beob:2};
  const sorted=out.sort((a,b)=>(ord[a.urg]-ord[b.urg])||(a.tage-b.tage));
  if(scope==="patienten")return sorted.filter(a=>a.typ==="geburtstag"||a.typ==="jubilaeum"||a.typ==="wiederbedarf");
- if(scope==="zuweiser")return sorted.filter(a=>["zuweiser-rhythmus","zuweiser-meilenstein","zuweiser-jubilaeum","zuweiser-trend"].includes(a.typ));
+ if(scope==="zuweiser")return sorted.filter(a=>["zuweiser-rhythmus","zuweiser-meilenstein","zuweiser-jubilaeum","zuweiser-bericht","zuweiser-fortbildung","zuweiser-trend"].includes(a.typ));
  return sorted;
 }
```

  **Wichtig:** `jubilaeum:` als Objekt-Schlüsselname im `titel`-String entfällt (`z.name+" — Partnerschafts-Jubiläum"` → nur `z.name`) — der neue `sub`-Text trägt „Jahrestag der Partnerschaft" bereits im Fließtext, keine Redundanz im `titel`. Das entspricht wörtlich Spec §3.3.

- [ ] **2.3 — temporäre `AR_TYP`/`isZ`-Ergänzung** (Architekten-Ergänzung (4) — verhindert „undefined"-Text in der noch nicht umgebauten `#zAnlaesse`-Ansicht zwischen diesem Task und Task 4; wird in Task 5 zusammen mit dem Rest entfernt):
```diff
- const AR_TYP={geburtstag:"Geburtstag",jubilaeum:"Entlass-Jubiläum",wiederbedarf:"Wiederbedarf","zuweiser-rhythmus":"Zuweiser-Rhythmus","zuweiser-meilenstein":"Zuweiser-Meilenstein","zuweiser-jubilaeum":"Partnerschafts-Jubiläum","zuweiser-trend":"Zuweiser-Trend"};
+ /* TEMPORÄR (Runde 6 Punkt 5, Task 2→5): zuweiser-bericht/-fortbildung hier nur, damit arCard()
+    zwischen Task 2 und Task 4 kein "undefined"-Label rendert. Wird in Task 5 zusammen mit den
+    übrigen zuweiser-*-Einträgen entfernt, sobald renderZuweiserAnlaesse() (Task 4) arCard() für
+    Zuweiser-Anlässe nicht mehr aufruft. */
+ const AR_TYP={geburtstag:"Geburtstag",jubilaeum:"Entlass-Jubiläum",wiederbedarf:"Wiederbedarf","zuweiser-rhythmus":"Zuweiser-Rhythmus","zuweiser-meilenstein":"Zuweiser-Meilenstein","zuweiser-jubilaeum":"Partnerschafts-Jubiläum","zuweiser-bericht":"Zuweiser-Abschlussbericht","zuweiser-fortbildung":"Zuweiser-Fortbildung","zuweiser-trend":"Zuweiser-Trend"};
```
```diff
- const isZ=["zuweiser-rhythmus","zuweiser-meilenstein","zuweiser-jubilaeum","zuweiser-trend"].includes(a.typ);
+ const isZ=["zuweiser-rhythmus","zuweiser-meilenstein","zuweiser-jubilaeum","zuweiser-bericht","zuweiser-fortbildung","zuweiser-trend"].includes(a.typ); // TEMPORÄR, s. Kommentar bei AR_TYP oben
```
  (`AR_FOTO` bleibt unverändert — kannte ohnehin nur `zuweiser-rhythmus`, kein Fix nötig.)

- [ ] **2.4** `grep -n "zuw-ber:\|zuw-fb:\|zuweiser-bericht\|zuweiser-fortbildung\|partnerTage" index.html` ausführen — mehrere Treffer (neue Blöcke + Scope-Filter + `AR_TYP`/`isZ`), keiner davon in den drei Patienten-Blöcken.

- [ ] **2.5 — Diff-Kontrolle der drei Patienten-Blöcke:** `sed -n '5127,5148p' index.html` (Zeilen ggf. per grep neu bestimmen) gegen die vor 2.1 kopierte Referenz vergleichen — **0 Zeilen-Diff**.

- [ ] **2.6 — Standard-Verifikation bei 390px UND 1440px, ausführlich (Konsole, gegen die Spec-Tabellen §3.1-§3.5):**
  - `anlaesse("zuweiser").filter(a=>a.typ==="zuweiser-rhythmus").map(a=>a.titel)` ergibt `["Thoraxzentrum Münnerstadt"]` (einzig dieser überschreitet die Kadenz).
  - `anlaesse("zuweiser").filter(a=>a.typ==="zuweiser-meilenstein").length` ergibt `0` (höchster `faelle`-Wert 6, keiner erreicht 10 — bewusste, dokumentierte Seed-Lücke, kein Bug).
  - `anlaesse("zuweiser").filter(a=>a.typ==="zuweiser-jubilaeum").map(a=>({t:a.titel,u:a.urg,tage:a.tage}))` ergibt `[{t:"Leopoldina-Krankenhaus",u:"jetzt",tage:0},{t:"PRIMO MEDICO",u:"bald",tage:13}]`.
  - `anlaesse("zuweiser").find(a=>a.typ==="zuweiser-bericht")` ergibt ein Objekt mit `titel:"RHÖN-KLINIKUM Campus"`, `tage:5`, `urg:"bald"`, `sub` beginnt mit `"Gemeinsamer Patient vor 5 Tagen entlassen"`.
  - `anlaesse("zuweiser").find(a=>a.typ==="zuweiser-fortbildung")` ergibt ein Objekt mit `titel:"RHÖN-KLINIKUM Campus"`, `urg:"bald"`, `tage:6`.
  - `anlaesse("zuweiser").length` ergibt `8` (2 `jetzt` + 6 `bald` — Rhythmus 1, Jubiläum 2, Bericht 1, Fortbildung 1, Trend 3, Meilenstein 0).
  - `anlaesse("patienten")` liefert weiterhin nur `geburtstag`/`jubilaeum`(Patient)/`wiederbedarf`-Typen — unverändert gegenüber dem Stand vor diesem Task (Diff-Kontrolle 2.5 bereits erledigt, hier nur Typ-Whitelist gegenprüfen: `anlaesse("patienten").every(a=>["geburtstag","jubilaeum","wiederbedarf"].includes(a.typ))` ergibt `true`).
  - `renderRadar()`-Ansicht (`#sub-netzwerk-patienten`) zeigt unverändert nur Patienten-Anlässe, kein `zuweiser-*`-Titel darin.
  - **Optischer Zwischenzustand (erwartet, temporär):** Im Reiter „Aktionen & Pflege" erscheinen jetzt bis zu 8 Karten mit den neuen Texten, gerendert noch über die alte `arCard()`/`.radar-card`-Darstellung (Foto-Streifen nur bei `zuweiser-rhythmus`, keine Gruppierung „Diese Woche"/„Demnächst") — das wird erst in Task 4 durch `.zwa-*`-Karten ersetzt. Dank der temporären `AR_TYP`/`isZ`-Ergänzung (2.3) zeigen auch die zwei neuen Kartentypen ein korrektes Label statt „undefined".
  - 0 Console-Errors.

**Sichtprüfung:** „Aktionen & Pflege" zeigt bereits die neuen, medizinisch-kollegialen Anlass-Texte (kein „Jubiläums-Geste senden" mehr, stattdessen „Jahres-Kooperationsgespräch mit Chefarzt/Leitung anbieten") sowie zwei neue Kartentypen (Abschlussbericht, Fortbildung) — noch im alten `.radar-card`-Layout, ohne Wochen-Gruppierung. Das ist der erwartete, dokumentierte Zwischenstand.

**Commit:** `feat: anlaesse() Zuweiser-Rework — sechs zuweiser-*-Blöcke (Rhythmus-Text, Meilenstein-Schwelle 50/25/10, Jubiläum-Gates 350d/±14, neu: Bericht + Fortbildung), Scope-Filter erweitert, temporäre AR_TYP/isZ-Ergänzung (Runde 6 Punkt 5, §3 + Architekten-Ergänzung 1+4)`

---

# Task 3 — `zwSterne()` + Stammdaten-Sterne-Umbau + Filter-Chips

**Lane:** `claude-implementer-pro` (Formel + Sortier-/Filter-Logik korrekt umsetzen, atomare Waisen-Entfernung des alten Rang-Codes im selben Commit)

**Abhängigkeit:** keine funktionale Abhängigkeit von Task 2 (liest nur `z.faelle`/`z.draht`/`z.verlauf3M`, nicht `anlaesse()`) — läuft aber nach Task 2 in der sequenziellen Ausführung dieses Plans.

**Bezug:** Spec §4 (`zwSterne()`-Formel), §5.2 (Sterne statt Rang), §5.3 (Filter-Chips), §6 (`.zw-rank`-Waisen), Architekten-Ergänzung (2) (HTML-Container-Fix).

**Dateien/Anker:** `grep -n "^function renderZuweiser\|^function findeOderErstelleZuweiser\|let zArchivAnzeigen\|\.zw-rank{\|class=\"zgrid\" id=\"zgrid\"" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `renderZuweiser()` Zeile 5577, `findeOderErstelleZuweiser()` endet Zeile 5565, `zArchivAnzeigen`-Deklaration Zeile 4742, `.zw-rank{`-CSS Zeile 2929, `#zgrid`-Div (HTML-Markup) Zeile 3808.

**Schritte:**

- [ ] **3.1** `grep`-Befehl oben ausführen, alle vier Fundstellen bestätigen.

- [ ] **3.2 — `grep -n "\.zw-rank\b\|zw-rank " index.html` ausführen — alle Fundstellen der alten Rang-Anzeige vor der Bearbeitung bestätigen** (Pflicht-Sorgfalt laut Auftrag): erwartungsgemäß genau 2 Treffer — CSS-Regel `.zw-rank{...}` (Zeile 2929) und Markup `<span class='zw-rank serif'>` innerhalb `renderZuweiser()` (Zeile ~5617). `.zw-rankline` (der Container, bleibt bestehen) ist **kein** Treffer dieses engeren Patterns.

- [ ] **3.3 — `zwSterneFilter`-Zustandsvariable ergänzen**, direkt neben `zArchivAnzeigen` (Spec §5.3):
```diff
 let zArchivAnzeigen=false;let bestandArchivAnzeigen=false;
+let zwSterneFilter="alle";
```

- [ ] **3.4 — `zwSterne(z)` + `zwChip()` einfügen**, direkt vor `function renderZuweiser(){` (wörtlich aus Spec §4 + §5.3):
```js
/* Runde 6 Punkt 5 (§4): zwSterne() — deterministische 1-5-Sterne-Einstufung aus Fallvolumen,
   Draht-Stärke (gleiche Zählweise wie rhythmusPflege()) und Trend (aus dem bestehenden
   verlaufAusFaellen()/verlauf3M). faelle<1 (Archiv/Nie-Kontaktierte) liefert null — kein Ranking. */
function zwSterne(z){
 if(z.faelle<1)return null;
 const volumen=z.faelle>=5?3:z.faelle>=3?2:1;
 const staerke=((z.draht||"").match(/●/g)||[]).length;
 const draht=staerke>=3?2:staerke===2?1:0;
 const v=z.verlauf3M||[0,0,0];
 const trend=(v[2]>v[1]&&v[1]>v[0])?1:(v[2]<v[1]&&v[1]<v[0])?-1:0;
 const score=volumen+draht+trend;
 if(score>=6)return 5;
 if(score>=4)return 4;
 if(score===3)return 3;
 if(score===2)return 2;
 return 1;
}
/* Runde 6 Punkt 5 (§5.3): zwChip() — Sterne-Filter-Chips, analog renderBestand()s chip()-Vorbild
   (index.html renderBestand()), nutzt bestehende .tier-chips/.tchip-CSS (keine neue Klasse). */
function zwChip(key,lbl,pool){
 const n=key==="alle"?pool.length:pool.filter(z=>zwSterne(z)===+key).length;
 return "<button class='tchip"+(zwSterneFilter===key?" on":"")+"' onclick='zwSterneFilter=\""+key+"\";renderZuweiser()'>"+lbl+" <b class='num'>"+n+"</b></button>";
}
```

- [ ] **3.5 — `renderZuweiser()` umbauen: Chips-Rendering + Sterne-Sortierung/-Filter + `.zw-rank`-Markup-Ersatz** (Spec §5.2/§5.3, an der bestehenden `sorted`-Zeile und dem `zw-rankline`-Div):
```diff
+ const chipsHtml="<div class='tier-chips'>"+zwChip("alle","Alle",primaryFiltered)
+   +["5","4","3","2","1"].map(k=>zwChip(k,k+"★",primaryFiltered)).join("")+"</div>";
+ const zwChipsEl=document.getElementById("zwSterneChips");if(zwChipsEl)zwChipsEl.innerHTML=chipsHtml;
- const sorted=[...filtered].sort((a,b)=>b.faelle-a.faelle);
+ const sorted=[...filtered].filter(z=>zwSterneFilter==="alle"||zwSterne(z)===+zwSterneFilter)
+   .sort((a,b)=>(zwSterne(b)||0)-(zwSterne(a)||0)||b.faelle-a.faelle);
  const trendMap=new Map(anlaesse().filter(a=>a.typ==="zuweiser-trend").map(a=>[a.zName,a]));
- document.getElementById("zgrid").innerHTML=sorted.length?sorted.map((z,i)=>
+ document.getElementById("zgrid").innerHTML=sorted.length?sorted.map(z=>
    "<div class='zcard'>"
-  +"<div class='zw-rankline'><span class='zw-rank serif'>#"+(i+1)+"</span>"+zwSparkline(z.verlauf3M)+"</div>"
+  +"<div class='zw-rankline'>"+(zwSterne(z)!=null?sterneHtml(zwSterne(z)):"<span class='zwa-noster'>kein Ranking</span>")+zwSparkline(z.verlauf3M)+"</div>"
```
  `primaryFiltered` ist die bestehende, bereits nach `zFilter`/Kategorie gefilterte Variable (`faelle>=1`, [index.html:5586](../../../index.html#L5586)) — unverändert, nur als Chip-Basis wiederverwendet, kein Duplikat. `(z,i)=>` → `z=>`: der Index-Parameter `i` wurde ausschließlich für die alte Rang-Nummer gebraucht, hier direkt mit entfernt (kein separater Waisen-Schritt nötig, da Teil derselben Zeile).

- [ ] **3.6 — HTML-Container für die Chips ergänzen** (Architekten-Ergänzung (2) — Spec beschreibt nur die JS-Seite, kein Zielelement existiert):
```diff
        <div class="zcat-strip" id="zcatgrid"></div>
        <div class="zmap" id="zmap"></div>
        <figure class="au-photo au-photo--petrol"><img src="assets/kb-header.jpg" alt="" loading="lazy"><figcaption>Bad Kissingen · Luftbild</figcaption></figure>
+       <div id="zwSterneChips"></div>
        <div class="zgrid" id="zgrid"></div>
```

- [ ] **3.7 — `.zw-rank`-CSS-Waise entfernen** (atomar im selben Commit wie der Ersatz, laut Auftrag — `.zw-rankline` bleibt als Container bestehen, nur `.zw-rank` selbst entfällt):
```diff
 .zw-rankline{display:flex;align-items:center;gap:10px;margin-bottom:4px}
-.zw-rank{font-size:28px;font-weight:700;color:var(--brass-deep);line-height:1}
```

- [ ] **3.8** `grep -n "\.zw-rank\b" index.html` erneut ausführen — **0 Treffer** mehr im gesamten Dokument (weder CSS noch Markup).

- [ ] **3.9** `grep -n "function zwSterne\|function zwChip\|zwSterneFilter\|id=\"zwSterneChips\"" index.html` ausführen — je mindestens 1 Fundstelle (zwSterneFilter mehrfach: Deklaration + Lese-/Schreibzugriffe).

- [ ] **3.10 — Standard-Verifikation bei 390px UND 1440px, ausführlich (Konsole, gegen Spec-Tabelle §4):**
  - `zwSterne(zuweiser.find(z=>z.name==="Leopoldina-Krankenhaus"))` ergibt `5`.
  - `zwSterne(zuweiser.find(z=>z.name==="Dr. Sommer"))` ergibt `4`.
  - `zwSterne(zuweiser.find(z=>z.name==="RHÖN-KLINIKUM Campus"))` ergibt `3`.
  - `zwSterne(zuweiser.find(z=>z.name==="Thoraxzentrum Münnerstadt"))` und `zwSterne(zuweiser.find(z=>z.name==="PRIMO MEDICO"))` ergeben je `2`.
  - `zwSterne(zuweiser.find(z=>z.name==="Uniklinikum Würzburg"))`, `"Klinikum Fulda"`, `"König-Ludwig-Haus"`, `"Privatpraxis Dr. Neumann"` ergeben je `1`.
  - `zwSterne(zuweiser.find(z=>z.name==="Helios Klinikum"))` und `"Reha-Technik Müller"` ergeben `null`.
  - Im Reiter „Stammdaten & Ranking", Kategorie „Krankenhäuser" (Standard-Filter): Karten-Reihenfolge Leopoldina (5★) → Dr. Sommer erscheint **nicht** hier (Kategorie „Hausärzte") → RHÖN (3★) → Thoraxzentrum (2★) → Uniklinikum Würzburg/Klinikum Fulda/König-Ludwig-Haus (1★, Reihenfolge bei Sterne-Gleichstand nach `faelle` absteigend: Uniklinikum 3, Fulda 2, König-Ludwig-Haus 1).
  - Sterne-Chip „5★" anklicken (Kategorie „Krankenhäuser") → nur Leopoldina sichtbar. „Alle" anklicken → wieder volle, sternensortierte Liste dieser Kategorie.
  - Helios Klinikum/Reha-Technik Müller (Archiv, hinter „⊕ potenzielle Kontakte anzeigen") zeigen `<span class='zwa-noster'>kein Ranking</span>` statt Sternen, erscheinen bei keinem Sterne-Chip außer „Alle".
  - 390px: `.tier-chips` umbricht ohne horizontalen Overflow. 0 Console-Errors.

**Sichtprüfung:** Stammdaten-Liste zeigt Sterne statt `#1`…`#11`, sortiert primär nach Sternen, sekundär nach Fällen; Sterne-Filter-Chips funktionieren pro Kategorie; kein `.zw-rank`-Code mehr im Dokument.

**Commit:** `feat: zwSterne() + Sterne-Ranking in der Zuweiser-Stammdaten-Liste — ersetzt #N-Rang durch sterneHtml(), Sterne-Filter-Chips (.tier-chips wiederverwendet), .zw-rank-CSS-Waise entfernt (Runde 6 Punkt 5, §4/§5.2/§5.3/§6 + Architekten-Ergänzung 2+3)`

---

# Task 4 — `#zAnlaesse`-Neuaufbau: `.zwa-*`-Karten statt `arCard()`

**Lane:** `claude-implementer-pro` (Verdrahtung eines neuen Renderers anstelle der bestehenden Inline-Zuweisung, Gruppierungs-Logik Diese-Woche/Demnächst)

**Abhängigkeit:** Task 2 (`anlaesse("zuweiser")` muss bereits alle sechs Typen inkl. `zuweiser-bericht`/`zuweiser-fortbildung` liefern, sonst fehlen zwei der acht erwarteten Karten in der Abnahme).

**Bezug:** Spec §5.1 (`.zwa-*`-Karten, `renderZuweiserAnlaesse()`).

**Dateien/Anker:** `grep -n "^function renderAnlaesse\|const zAnl=anlaesse" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `renderAnlaesse()` endet Zeile 5233, die alte Inline-Zuweisung in `renderZuweiser()` liegt bei Zeile 5609-5612.

**Schritte:**

- [ ] **4.1** `grep`-Befehl oben ausführen, exakte aktuelle Zeilen bestätigen.

- [ ] **4.2 — `ZWA_TYP`/`zwaKarte()`/`renderZuweiserAnlaesse()` einfügen**, direkt nach `function renderAnlaesse(){...}` (wörtlich aus Spec §5.1):
```js
/* Runde 6 Punkt 5 (§5.1): .zwa-* — eigene Etiketten-Karten für die Zuweiser-Anlässe (Kicker+Icon,
   Zuweiser-Name, voller Anlass-Satz, Fälligkeits-Chip, ein Erledigt-Button), ersetzt arCard()/
   .radar-card für #zAnlaesse. arCard() bleibt für die drei Patienten-Anlass-Typen (renderRadar())
   unverändert aktiv. */
const ZWA_TYP={
 "zuweiser-rhythmus":{ico:"⟳",label:"Kontaktpflege"},
 "zuweiser-jubilaeum":{ico:"✦",label:"Jahrestag"},
 "zuweiser-meilenstein":{ico:"◆",label:"Meilenstein"},
 "zuweiser-bericht":{ico:"✉",label:"Abschlussbericht"},
 "zuweiser-fortbildung":{ico:"▣",label:"Fortbildung"},
 "zuweiser-trend":{ico:"∿",label:"Fallzahl-Trend"}
};
function zwaKarte(a){
 const t=ZWA_TYP[a.typ]||{ico:"•",label:""};
 const dueTxt=a.urg==="jetzt"?"überfällig":"in "+a.tage+" Tagen";
 return "<div class='zwa-card'>"
  +"<div class='zwa-head'><span class='zwa-ico'>"+t.ico+"</span><span class='zwa-typ'>"+t.label+"</span>"
  +"<span class='radar-due "+a.urg+"' style='margin-left:auto'>"+dueTxt+"</span></div>"
  +"<div class='zwa-name'>"+escapeHtml(a.zName)+"</div>"
  +"<p class='zwa-text'>"+escapeHtml(a.sub)+"</p>"
  +"<div class='zwa-foot'><button class='btn-ghost btn-sm' onclick='arAktion(\""+a.key.replace(/"/g,"&quot;")+"\")'>Erledigt ✓</button></div>"
  +"</div>";
}
function renderZuweiserAnlaesse(){
 const zAnl=anlaesse("zuweiser");
 const el=document.getElementById("zAnlaesse");if(!el)return;
 if(!zAnl.length){el.innerHTML="<p class='empty'>Aktuell keine anstehenden Zuweiser-Anlässe.</p>";return;}
 const woche=zAnl.filter(a=>a.urg==="jetzt"), demnaechst=zAnl.filter(a=>a.urg==="bald");
 el.innerHTML=(woche.length?"<div class='ar-feedhead'>Diese Woche</div><div class='zwa-group'>"+woche.map(zwaKarte).join("")+"</div>":"")
  +(demnaechst.length?"<div class='ar-feedhead'>Demnächst</div><div class='zwa-group'>"+demnaechst.map(zwaKarte).join("")+"</div>":"");
}
```

- [ ] **4.3 — `renderZuweiser()` verdrahten** — alte Inline-Zuweisung durch Aufruf ersetzen:
```diff
-  /* §5.1 B2B/B2C-Trennung: Zuweiser-Anlässe (Kontaktpflege-Fälligkeit + Trend) gehören in die Zuweiser-Ansicht, nicht ins Patienten-Radar */
-  const zAnl=anlaesse("zuweiser");
-  const zAnlEl=document.getElementById("zAnlaesse");
-  if(zAnlEl)zAnlEl.innerHTML=zAnl.length?"<div class='ar-feedhead'>Zuweiserpflege — anstehende Gesten</div><div class='ar-grid'>"+zAnl.map(arCard).join("")+"</div>":"";
+  /* Runde 6 Punkt 5 (§5.1): eigene Etiketten-Karten (.zwa-*) statt arCard()/.radar-card */
+  renderZuweiserAnlaesse();
```

- [ ] **4.4** `grep -n "function renderZuweiserAnlaesse\|function zwaKarte\|renderZuweiserAnlaesse()" index.html` ausführen — Funktionsdefinitionen je 1 Fundstelle, Aufruf 1 Fundstelle (innerhalb `renderZuweiser()`).

- [ ] **4.5 — Standard-Verifikation bei 390px UND 1440px, ausführlich (gegen Spec-Abnahmekriterien §8 Punkt 1-6):**
  - `#zAnlaesse` zeigt jetzt `.zwa-card`-Elemente, **keine** `.radar-card`/`arCard()`-Ausgabe mehr für Zuweiser.
  - „Diese Woche" (2 Karten: Leopoldina-Jahrestag `jetzt`, Uniklinikum Würzburg-Trend↓ `jetzt`) / „Demnächst" (6 Karten, in Tage-Reihenfolge: Leopoldina-Trend↑, Dr. Sommer-Trend↑, RHÖN-Abschlussbericht, RHÖN-Fortbildung, PRIMO MEDICO-Jahrestag, Thoraxzentrum-Rhythmus).
  - Leopoldina-Karte zeigt „7. Jahrestag der Partnerschaft (seit 2019) — Jahres-Kooperationsgespräch mit Chefarzt/Leitung anbieten." — **nicht** mehr „Jubiläums-Geste senden".
  - RHÖN-KLINIKUM Campus zeigt zwei separate Karten: „Gemeinsamer Patient vor 5 Tagen entlassen — Abschlussbericht und Dank an den Zuweiser senden." UND „Einladung zu Fortbildung/Hospitation (CME) für das laufende Quartal versenden." — bewusst zwei Karten für denselben Zuweiser, kein Bug.
  - Klick auf „Erledigt ✓" bei einer Karte: Karte verschwindet sofort aus `#zAnlaesse`, Demo-Toast erscheint (`inbToast`, unverändert über `arAktion()`); Seiten-Reload bringt die Karte zurück (Session-Set, keine Persistenz).
  - Meilenstein-Typ: 0 Karten sichtbar (§3.2, kein Fixbedarf, kein Fehler) — `ZWA_TYP["zuweiser-meilenstein"]` bleibt vorbereitet für den Fall, dass ein Zuweiser real 10 Fälle erreicht.
  - 390px: `.zwa-card`-Kopf (`display:flex;flex-wrap:wrap`) umbricht ohne horizontalen Overflow bei langen Typ-Labels. 0 Console-Errors.

**Sichtprüfung:** „Aktionen & Pflege" zeigt die neuen Etiketten-Karten, gruppiert nach „Diese Woche"/„Demnächst", mit Kicker+Icon, vollem Anlass-Satz und „Erledigt ✓"-Button — visuell klar unterscheidbar vom alten `.radar-card`-Text-Only-Layout.

**Commit:** `feat: renderZuweiserAnlaesse()/.zwa-Karten — #zAnlaesse komplett auf eigenes Etiketten-Layout umgestellt (Diese Woche/Demnächst-Gruppierung), ersetzt arCard()-Aufruf in renderZuweiser() (Runde 6 Punkt 5, §5.1)`

---

# Task 5 — Waisen-Sweep (temporäre `AR_TYP`/`isZ`-Ergänzung) + finaler Abnahme-Sweep

**Lane:** `claude-implementer-pro` (Verifikations-lastiger Abschluss-Task; bei einem kleinen Fund direkt hier fixen, kein neuer Task nötig — bei größeren Funden: stoppen, im Report melden statt selbst zu improvisieren)

**Abhängigkeit:** braucht alle vorherigen Tasks (1-4). Erst jetzt ist `arCard()` nachweislich nie mehr mit einem `zuweiser-*`-Typ aufrufbar (`renderZuweiser()` ruft seit Task 4 `renderZuweiserAnlaesse()`/`zwaKarte()`, `renderRadar()` mit scope `"patienten"` liefert laut Spec-Verifikation nie `zuweiser-*`-Typen).

**Bezug:** Spec §6 (Waisen-Tabelle), §8 (Abnahmekriterien, vollständig, alle 11 Punkte).

**Dateien/Anker:** `grep -n "^const AR_TYP\|^const AR_FOTO\|^function arCard\|isZ=" index.html` vor Bearbeitung ausführen — alle Fundstellen bestätigen.

**Schritte:**

- [ ] **5.1** `grep`-Befehl oben ausführen, `arCard()` vollständig neu lesen (Bestätigung: `isZ` mit sechs `zuweiser-*`-Einträgen aus Task 2.3 ist jetzt **nachweislich immer `false`**, da kein Aufrufer mehr `zuweiser-*`-Typen an `arCard()` übergibt).

- [ ] **5.2 — `arCard()` vereinfachen** (Spec §6 — `isZ`-Zweig entfernen, Funktion behandelt nur noch die drei Patienten-Typen):
```diff
 function arCard(a,i){
  const perName=a.pid&&person(a.pid)?person(a.pid).name:a.titel;
- const isZ=["zuweiser-rhythmus","zuweiser-meilenstein","zuweiser-jubilaeum","zuweiser-bericht","zuweiser-fortbildung","zuweiser-trend"].includes(a.typ);
- const due=isZ?(a.urg==="jetzt"?"überfällig":"fällig"):(a.urg==="beob"?"im Blick":"in "+a.tage+" Tagen");
+ const due=a.urg==="beob"?"im Blick":"in "+a.tage+" Tagen";
  const dueCls=a.urg;
- const gLbl=isZ?"Nächste Aktion":"Empfohlene Geste";
  const strip=(AR_FOTO[a.typ])?"<figure class='au-photo au-photo--"+AR_FOTO[a.typ][1]+"'><img src='assets/"+AR_FOTO[a.typ][0]+"' alt='' loading='lazy'></figure>":"";
  return "<div class='radar-card ar-rc' style='--acol:var(--brass)'>"
   +strip
   +"<div class='patient-top'><span class='ava'>"+initialen(perName)+"</span><span class='radar-due "+dueCls+"'>"+due+"</span></div>"
   +"<h3>"+escapeHtml(a.titel)+"</h3>"
   +(a.sterne?"<div class='ar-cardstars'>"+sterneHtml(a.sterne)+"</div>":"")
   +"<div class='patient-meta'>"+AR_TYP[a.typ]+"</div>"
   +"<div class='radar-prog'><span class='rk'>Anlass</span>"+escapeHtml(a.sub)+"</div>"
-  +"<div class='radar-prog'><span class='rk'>"+gLbl+"</span>"+escapeHtml(a.geste.label)+"</div>"
+  +"<div class='radar-prog'><span class='rk'>Empfohlene Geste</span>"+escapeHtml(a.geste.label)+"</div>"
   +"<div class='patient-actions'><button class='btn-ghost btn-sm' onclick='arAktion(\""+a.key.replace(/"/g,"&quot;")+"\")'>"+escapeHtml(a.geste.cta)+" ›</button></div>"
   +"</div>";
 }
```

- [ ] **5.3 — `AR_TYP` auf die drei Patienten-Typen reduzieren** (Spec §6 — die sechs `zuweiser-*`-Einträge, inkl. der in Task 2.3 temporär ergänzten zwei, sind jetzt vollständige Waisen):
```diff
- const AR_TYP={geburtstag:"Geburtstag",jubilaeum:"Entlass-Jubiläum",wiederbedarf:"Wiederbedarf","zuweiser-rhythmus":"Zuweiser-Rhythmus","zuweiser-meilenstein":"Zuweiser-Meilenstein","zuweiser-jubilaeum":"Partnerschafts-Jubiläum","zuweiser-bericht":"Zuweiser-Abschlussbericht","zuweiser-fortbildung":"Zuweiser-Fortbildung","zuweiser-trend":"Zuweiser-Trend"};
+ const AR_TYP={geburtstag:"Geburtstag",jubilaeum:"Entlass-Jubiläum",wiederbedarf:"Wiederbedarf"};
```
  (`AR_FOTO` bleibt unverändert bestehen — trägt bereits nur `geburtstag`/`wiederbedarf`/`zuweiser-rhythmus`; Spec §6 nennt `AR_FOTO["zuweiser-rhythmus"]` explizit als Waise. Separater Diff:)
```diff
- const AR_FOTO={geburtstag:["kb-garten.webp","rose"],wiederbedarf:["kb-haus.webp","sage"],"zuweiser-rhythmus":["kb-arzt.jpg","petrol"]};
+ const AR_FOTO={geburtstag:["kb-garten.webp","rose"],wiederbedarf:["kb-haus.webp","sage"]};
```

- [ ] **5.4** `grep -n "zuweiser-rhythmus\|zuweiser-meilenstein\|zuweiser-jubilaeum\|zuweiser-bericht\|zuweiser-fortbildung\|zuweiser-trend" index.html` ausführen — verbleibende Treffer **ausschließlich** innerhalb `anlaesse()` (Task 2), `ZWA_TYP`/`zwaKarte()`/`renderZuweiserAnlaesse()` (Task 4) und dem Scope-Filter; **kein** Treffer mehr in `AR_TYP`, `AR_FOTO` oder `arCard()`.

- [ ] **5.5** `grep -c "@keyframes" index.html` — weiterhin genau **9**.

- [ ] **5.6 — `git diff --stat index.html`** ausführen (alle fünf Commits dieses Plans zusammen betrachtet) — bestätigen, dass **keine** Zeile innerhalb der `personen[]`-, `faelle[]`- oder `inReha[]`-Arrays verändert wurde (nur `zuweiser[]`, `anlaesse()`, `AR_TYP`/`AR_FOTO`/`arCard()`, `renderZuweiser()`, neue Funktionen `zwSterne`/`zwChip`/`ZWA_TYP`/`zwaKarte`/`renderZuweiserAnlaesse`, CSS-Block, ein HTML-Container-Div).

- [ ] **5.7 — Gesamt-Abnahme-Sweep, alle 11 Kriterien der Spec (§8) im Browser (idealerweise per CDP/Browser-Tool) durchspielen, bei 390px UND 1440px:**
  1. `#zAnlaesse` zeigt `.zwa-*`-Karten, keine `.radar-card`/`arCard()`-Ausgabe mehr für Zuweiser; „Diese Woche" (2: Leopoldina-Jahrestag `jetzt`, Uniklinikum Würzburg-Trend↓ `jetzt`) / „Demnächst" (6: Leopoldina-Trend↑, Dr. Sommer-Trend↑, RHÖN-Abschlussbericht, RHÖN-Fortbildung, PRIMO MEDICO-Jahrestag, Thoraxzentrum-Rhythmus, in dieser Tage-Reihenfolge).
  2. Jubiläums-Text: Leopoldina zeigt „7. Jahrestag der Partnerschaft (seit 2019) — Jahres-Kooperationsgespräch mit Chefarzt/Leitung anbieten." — nicht mehr „Jubiläums-Geste senden".
  3. Abschlussbericht: RHÖN-KLINIKUM Campus zeigt „Gemeinsamer Patient vor 5 Tagen entlassen — Abschlussbericht und Dank an den Zuweiser senden."
  4. Fortbildung: RHÖN-KLINIKUM Campus zeigt zusätzlich „Einladung zu Fortbildung/Hospitation (CME) für das laufende Quartal versenden." — zwei Karten gleichzeitig, kein Bug.
  5. Meilenstein: 0 Karten sichtbar, kein Absturz/Fehler.
  6. „Erledigt"-Klick: Karte verschwindet sofort (Session-scope, kehrt nach Reload zurück), Demo-Toast erscheint.
  7. Sterne statt Rang: Stammdaten-Liste zeigt `sterneHtml()` statt `#1`…`#11`; Reihenfolge je aktiver Kategorie: Leopoldina (5★) → Dr. Sommer (4★, Kategorie Hausärzte) → RHÖN (3★) → Thoraxzentrum/PRIMO (2★) → Uniklinikum Würzburg/Klinikum Fulda/König-Ludwig-Haus/Privatpraxis Neumann (1★).
  8. Sterne-Filter-Chips: „5★" zeigt nur Leopoldina (Kategorie Krankenhäuser); „Alle" zeigt wieder die volle, sternensortierte Liste der aktiven Kategorie.
  9. Archiv unverändert: Helios Klinikum/Reha-Technik Müller bleiben hinter `zArchivAnzeigen` verborgen, zeigen „kein Ranking" statt Sterne, erscheinen bei keinem Sterne-Chip außer „Alle".
  10. Mobile (390px): `.zwa-card` kein horizontaler Overflow, Kopf-Flexbox umbricht; Desktop (1440px) unverändert breit. 0 Console-Errors auf beiden Breiten; `grep -c "@keyframes" index.html` unverändert 9.
  11. Unberührte Bereiche: `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `#refOverlay`, `openReferrer()` (weiterhin nur über `.zw-portal`-Button), `inReha[]`, `faelle[]`, `personen[]` (0 Zeilen-Diff, per 5.6 bestätigt) unverändert.

**Sichtprüfung:** Kein `zuweiser-*`-Code-Fragment mehr in `AR_TYP`/`AR_FOTO`/`arCard()`; alle 11 Abnahmekriterien der Spec sind im Browser bei beiden Breiten grün; Cofounder-Bereiche unangetastet; die Zuweiser-Ansicht zeigt durchgehend das neue medizinisch-kollegiale Anlass-Niveau und ein echtes Sterne-Ranking.

**Commit:** `chore: AR_TYP/AR_FOTO/arCard()-Waisen der zuweiser-*-Typen entfernt (nach renderZuweiserAnlaesse()-Umstellung nicht mehr erreichbar), Gesamt-Abnahme-Sweep aller 11 Kriterien grün (Runde 6 Punkt 5, §6/§8)`

---

## Reihenfolge / Abhängigkeiten

```
Task 1 (Seeds: Leopoldina seit-Tweak, letzterAbschluss, .zwa-*-CSS)
      │  additiv/wert-tweakend, bootbar, CSS inert bis Task 4
      ▼
Task 2 (anlaesse() Zuweiser-Rework, Scope-Filter-Fix, temporäre AR_TYP/isZ-Ergänzung)
      │  braucht Task 1 für korrekte Konsolen-/Sicht-Verifikationswerte
      ▼
Task 3 (zwSterne() + Stammdaten-Sterne-Umbau + Filter-Chips, .zw-rank-Waise atomar entfernt)
      │  keine funktionale Abhängigkeit von Task 2, läuft aber sequenziell danach
      ▼
Task 4 (#zAnlaesse-Neuaufbau: .zwa-Karten, renderZuweiserAnlaesse()) ── braucht Task 2
      │                                                                  (alle 6 anlaesse()-Typen)
      ▼
Task 5 (Waisen-Sweep der temporären AR_TYP/isZ-Ergänzung + Gesamt-Abnahme) ── braucht Task 1-4
```

Sequentiell in dieser Reihenfolge ausführen (eine Datei, nie parallel). Tasks 1-4 sind additiv/verdrahtend und einzeln bootbar (Task 2 erzeugt einen dokumentierten, korrekten Zwischenzustand mit noch altem Kartenlayout aber neuen Texten; Task 2.3 verhindert dabei sichtbare „undefined"-Labels). Task 5 schließt mit dem Waisen-Abbau der in Task 2.3 bewusst temporär eingeführten Ergänzung und der vollständigen Abnahme ab.

---

## Nicht-Ziele dieser Runde (aus Spec §9, hier zur Erinnerung)

- Zuweiserportal/`#refOverlay`/`openReferrer()` (Cofounder-Bereich) — unberührt, weiterhin nur als Blackbox über den bestehenden Button aufgerufen.
- Patienten-Anlässe (Geburtstag/Entlass-Jubiläum/Wiederbedarf) — Thema von Punkt 6, nicht dieser Spec; `arCard()` bleibt für diese drei Typen unverändert aktiv (nur intern vereinfacht in Task 5, Verhalten identisch).
- `findeOderErstelleZuweiser()` — bleibt ungenutzter, unangetasteter Code.
- `rhythmusPflege()`/`znext`-Fallback in der Stammdaten-Karte — unverändert, liefert weiterhin den Fallback-Text für Zuweiser ohne aktiven `zuweiser-trend`-Eintrag.
- `zuweiser-meilenstein`-Seed-Fix — bewusst nicht vorgenommen, keine `faelle`-Werte künstlich angehoben.
- Gruppierte Stammdaten-Abschnitte (analog `.db-group`/`.stg-h` bei Patienten) — bewusst NICHT gebaut; flache, sternensortierte Liste + Filter-Chips genügt.
- Keine neuen Keyframes, `escapeHtml` für alle dynamischen Inhalte, kein `Math.random`, 390px und 1440px verifizieren, 0 Console-Errors.
