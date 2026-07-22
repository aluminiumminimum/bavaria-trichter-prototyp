# Runde 5, Sprint 1+2 — Implementierungsplan

> **Für ausführende Agenten:** Dieser Plan wird Subagent-Driven umgesetzt — pro Task ein frischer Agent, kein Schreiben durch das orchestrierende Modell selbst. Lane-Tag pro Task beachten. Jeder Task arbeitet ausschließlich in `index.html`; **vor jeder Anker-Zeile den `grep`-Befehl aus dem Task selbst erneut ausführen** — Zeilennummern verschieben sich durch jeden vorherigen Task, die hier notierten Zeilen sind der Stand bei Plan-Erstellung (22.07.2026, `index.html` 6819 Zeilen, Commit `115398b`), nicht garantiert der Stand bei Ausführung.

**Bezug:** Setzt [2026-07-22-runde5-sprint12-design.md](../specs/2026-07-22-runde5-sprint12-design.md) um (sechs Nutzer-Feedback-Punkte aus Runde 4, Punkt 3 — Fallakte-Herzstück-Redesign — ist ausdrücklich **nicht** Teil dieser Spec). Format/Konventionen übernommen von [2026-07-22-runde4-vertiefung-plan.md](./2026-07-22-runde4-vertiefung-plan.md).

**Ziel:**
- **Sprint 1** — Anfrage-Fenster zeigt Zusammenfassung + optisch abgesetzte Originalanfrage (Punkt 1); Koordinator kann bei der Zuordnung SalutoCare/Premium markieren und einen Bearbeitungs-Hinweis hinterlegen, der im Fall-Drawer und im Mein-Tag-Sheet sichtbar bleibt (Punkt 2); die Stammdaten-Akte ist im Fall-Drawer und im In-Reha-Leitungs-Overlay standardmäßig zugeklappt (Punkt 5).
- **Sprint 2** — Team-Reiter zeigt ein CRM-artiges Cockpit (KPI-Zeile, Belastungs-Balken, Achse-Aufteilung) oberhalb der Mitarbeiter-Karten (Punkt 4); der Zuweiser-Pflege-Feed zeigt nur noch Zuweiser mit echter Fallbeziehung und unterscheidet Rhythmus-/Meilenstein-/Jubiläums-Anlässe statt eines einzelnen Rückgangs-Hinweises (Punkt 6); Stammdaten-Ansichten verlieren ihre letzten manuellen Vormerk-Buttons zugunsten der bereits vorhandenen system-generierten Anlass-Karten (Punkt 7).

**Architektur:** Alle Änderungen in `index.html` (self-contained, ~6819 Zeilen, kein Build-Prozess). Sequentielle Ausführung — **nie parallel**, da jeder Task dieselbe Datei anfasst. Nach jedem Task: Git-Commit.

**Reihenfolge:** Sprint-Reihenfolge wie vom Auftrag vorgegeben — Sprint 1 (Punkt 1 → Punkt 2 → Punkt 5) vor Sprint 2 (Punkt 4 → Punkt 6 → Punkt 7). Innerhalb Punkt 1 zuerst die additiven Seed-Daten (mechanisch), danach die Render-Logik, die darauf aufbaut. Innerhalb Punkt 6 ebenso: erst das additive `z.seit`-Seed-Feld, danach die Anlass-Logik, die es konsumiert.

**Lanes:**
- `claude-implementer` (Haiku) — **nur** für rein mechanische Tasks: Seed-Felder ohne Verzweigungslogik (Task 1.1, Task 2.2), `<details>`-Wrapping nach bereits vorhandenem Muster (Task 1.3), Tab-Label-Umbenennung (Task 2.4), Entfernen von durch diese Runde verwaistem Code, dessen einzige(r) Leser vorab per grep bestätigt ist (Task 2.5).
- `claude-implementer-pro` (Sonnet) — alles mit neuer Render-Logik, State-Handling über Rerender hinweg oder Verhaltensänderungsrisiko: Zusammenfassungs-Helper + `egSummaryHtml()`-Umbau (Task 1.2), SalutoCare-Toggle + Hinweis-Feld + `uebernehmen()`-Erweiterung (Task 1.4), Team-Cockpit (Task 2.1), Zuweiser-Rhythmus/Meilenstein/Jubiläum-Logik (Task 2.3).

**Harte Regeln (jeder Task, aus Spec + projektweitem CLAUDE.md):**
- Cofounder-Namespaces **nicht anfassen**: `.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`, `openReferrer`/`closeReferrer`/`#refOverlay`.
- Datenarrays nur additiv erweitern — `m.zusammenfassung`, `f.zuordnungsHinweis`, `z.seit` sind die einzigen neuen Felder dieser Runde. `z.letzter` bleibt unverändert (ist bereits ISO-Datum), kein zusätzliches `z.letzterKontakt`. `AR_RHYTHMUS` sowie `wiedervorlage()`/`p.wv`/`.wv`-CSS werden **entfernt** — durch diese Runde direkt verwaist (Architekten-Entscheidung bzw. Auftrag), kein eigenmächtiges Aufräumen von pre-existing Dead Code darüber hinaus.
- Bei 390px **und** 1440px verifizieren, 0 Console-Errors, reduced-motion-safe.
- **Keine neuen Keyframes** — exakt 9 verifiziert (`lift` [index.html:61](../../../index.html#L61), `rpDrawC`/`rpDrawP` [1058](../../../index.html#L1058)/[1059](../../../index.html#L1059), `rpRing` [1073](../../../index.html#L1073), `rpGrow` [1089](../../../index.html#L1089), `cv-travel` [1377](../../../index.html#L1377), `auGrow` [2042](../../../index.html#L2042), `lxSweep` [2051](../../../index.html#L2051), `lxPulse` [2094](../../../index.html#L2094)).
- `escapeHtml()` für jeden dynamisch eingefügten Text. Kein `Math.random` — alles deterministisch aus vorhandenen Datenfeldern bzw. `dstr()`/Datums-Diff.
- Nur synthetische Demo-Daten.
- Token statt Freihand-Farbe: `ACHSE_COL` ([index.html:4204](../../../index.html#L4204)) nur als kleiner Dot/Rahmen, **nie als Fläche** (explizite Vorgabe für Punkt 4c). Achsen-neutrale Balken/Kacheln nur in Jade/Gold-Familie (`--sage-deep`/`--brass`/`--terra` für Zustände wie „überfällig").
- Typografie: Cormorant Garamond für Display/Numerale, Inter für Fließtext, wie in allen bisherigen Runden.
- Neue CSS-Blöcke additiv per **kommentiertem Block direkt vor `</style>`** (Stand Planerstellung [index.html:3100](../../../index.html#L3100)).
- Neue Top-Level-Funktionen sind `function name(){}`-Deklarationen (hoisted), keine Arrow-Functions — matcht den Stil des restlichen Skripts.

---

## Standard-Verifikation (nach jedem Task)

1. `grep -c "function "  index.html` vor/nach Vergleich — keine unbeabsichtigt gelöschten Funktionen (außer beim expliziten Cleanup-Task 2.5).
2. Browser: Seite neu laden, Console auf 0 Errors prüfen.
3. Betroffene View bei 390px und bei 1440px öffnen, auf Overflow/Lesbarkeit prüfen.
4. Cofounder-Bereiche (Zuweiserportal `#refOverlay`, Matrix `.mx-*`/Konzept-Tab, Reha-Charts `.rsp-*` in `openRsDetail()`) unverändert gegentesten — nichts kaputt.
5. Commit mit klarer Botschaft, welcher Spec-Punkt umgesetzt wurde.
6. Jeder Task unten endet mit einer eigenen **Sichtprüfung** — einem Satz, was im Browser sichtbar sein muss, damit der Task als erfüllt gilt. Diese Prüfung zusätzlich zu den Punkten 1-5 durchführen, nicht statt ihnen.

---

# Sprint 1

## Phase 1 — Spec-Punkt 1: Eingang-Fenster → Original + Zusammenfassung

### Task 1.1 — Seed-Daten: `m.zusammenfassung` auf allen `eingang[]`/`INBOUND_POOL`-Einträgen

**Lane:** `claude-implementer` (rein additive Datenfelder, keine Verzweigungslogik, keine Konsumenten in diesem Task)

**Dateien/Anker:** `grep -n "^let eingang=\[\|id:10[1-8]\|const INBOUND_POOL=\[\|function simulateInbound" index.html` vor Bearbeitung ausführen und alle Zeilenangaben neu bestätigen. Bei Plan-Erstellung: `eingang=[` bei [index.html:4241](../../../index.html#L4241) (8 Einträge, id 101–108), `INBOUND_POOL=[` bei [index.html:4685](../../../index.html#L4685) (3 Einträge), `simulateInbound()` bei [index.html:4739](../../../index.html#L4739).

**Ist (verifiziert):** Weder `eingang[]` noch `INBOUND_POOL` haben ein `zusammenfassung`-Feld (`grep -n "zusammenfassung" index.html` liefert vor diesem Task keinen Treffer). `simulateInbound()`s `eingang.unshift({...})`-Objektliteral baut aus einzeln benannten Feldern von `t=INBOUND_POOL[_inbN%INBOUND_POOL.length]`, **kein Spread** — ein neues Feld muss dort explizit durchgereicht werden.

**Schritte:**

- [ ] `grep`-Befehl oben ausführen, alle 11 Objektliterale (8× `eingang[]`, 3× `INBOUND_POOL`) sowie `simulateInbound()` neu lokalisieren.
- [ ] Jedem der 8 `eingang[]`-Einträge additiv `zusammenfassung:"…"` hinzufügen (z. B. direkt nach dem `id:`-Feld):
  - `id:101`: `"Ehefrau fragt telefonisch für ihren Mann (72) nach Reha nach Herz-OP — PKV, Rückruf heute gewünscht."`
  - `id:102`: `"Sozialdienst RHÖN Bad Neustadt meldet einen Patienten (68) nach Schlaganfall zur AHB an — PKV, Entlassung in 4 Tagen."`
  - `id:103`: `"Selbstzahlerin (55) fragt über die Website nach der Premium-Suite — interessiert an Preisen und freien Terminen."`
  - `id:104`: `"Hausarzt Dr. Sommer empfiehlt seine Patientin (79) für eine geriatrische Reha — Beihilfe, Tochter koordiniert die Aufnahme."`
  - `id:105`: `"Entlassmanagement Klinikum Fulda sucht über Recare einen Neuro-Reha-Platz — GKV mit Komfort-Wunsch, Übernahme in 6 Tagen möglich."`
  - `id:106`: `"Familie fragt über PRIMO MEDICO für ihren Vater (64) nach Intensiv-Reha mit Beatmung — internationale Premium-Anfrage."`
  - `id:107` (passiv): `"Interessentin (57) lädt die Reha-Broschüre herunter und erteilt Kontaktfreigabe — noch keine konkrete Anfrage."`
  - `id:108` (passiv): `"Anonyme Anfrage per E-Mail nach freien Plätzen — kein Name, kein Follow-up erkennbar."`
- [ ] Jedem der 3 `INBOUND_POOL`-Einträge additiv `zusammenfassung:"…"` hinzufügen:
  - `INBOUND_POOL[0]` (Familie Hoffmann): `"Familie fragt über die Website für ihren Vater (74) nach einem dringenden Wechsel in die Premium-Neuro-Reha — unzufrieden mit der aktuellen Einrichtung."`
  - `INBOUND_POOL[1]` (Herr Reinhardt): `"Herr Reinhardt (61) fragt per E-Mail selbst nach der Premium-Suite — Komfort-Reha nach OP, möglichst kurzfristig."`
  - `INBOUND_POOL[2]` (Dr. Kessler): `"Privatärztin Dr. Kessler meldet ihre Patientin (58) nach Hüft-TEP zur AHB an — Privatpatientin, kurzfristige Aufnahme erbeten."`
- [ ] In `simulateInbound()`s `eingang.unshift({...})`-Objektliteral additiv `zusammenfassung:t.zusammenfassung,` ergänzen (sonst kommen simulierte Anfragen ohne das Feld an).
- [ ] `grep -c "zusammenfassung:" index.html` → erwartet **12** (11 Seed-Einträge + 1 Durchreiche-Zeile in `simulateInbound()`).
- [ ] Standard-Verifikation (rein additives Datenfeld, noch kein Konsument — kein sichtbarer UI-Unterschied in diesem Task): `eingang.find(m=>m.id===101).zusammenfassung` in der Browser-Konsole liefert den Satz, 0 Console-Errors beim normalen Durchklicken.

**Sichtprüfung:** Kein sichtbarer UI-Unterschied (Feld existiert, wird erst in Task 1.2 gelesen); Konsolentest auf `eingang[0].zusammenfassung`/`INBOUND_POOL[0].zusammenfassung` liefert je einen nicht-leeren String; 0 Console-Errors.

**Commit:** `feat: m.zusammenfassung-Seed-Feld auf eingang[]/INBOUND_POOL + simulateInbound()-Passthrough (Punkt 1, Teil 1)`

---

### Task 1.2 — `egZusammenfassung()`-Fallback + `egSummaryHtml()`-Erweiterung + Papier-Optik für die Originalanfrage

**Lane:** `claude-implementer-pro` (neue Fallback-Logik + Struktur-Änderung an bestehender Render-Funktion)

**Abhängigkeit:** braucht `m.zusammenfassung` aus Task 1.1 (Fallback-Zweig funktioniert aber auch für Objekte ohne dieses Feld).

**Referenz-Komponenten (erst lesen):** `erkenneSignale(m.txt)` (liefert `sig.kostentraeger`/`sig.dringlichkeit`/`sig.konkret`) und der bestehende `grund`-Aufbau innerhalb `egSummaryHtml()` — direktes Vorbild für den Fallback-Satz, nicht neu erfinden.

**Dateien/Anker:** `grep -n "function egSummaryHtml\|function erkenneSignale\|\.mtxt{" index.html` vor Bearbeitung ausführen und alle Zeilenangaben neu bestätigen. Bei Plan-Erstellung: `egSummaryHtml(m)` bei [index.html:4342](../../../index.html#L4342), `.mtxt{...}` CSS-Basisregel bei [index.html:296](../../../index.html#L296) (bleibt unverändert — wird nur additiv um einen umgebenden `.eg-original`-Wrapper ergänzt, nicht selbst modifiziert).

**Ist (verifiziert):** `egSummaryHtml(m)` endet aktuell mit:
```js
return "<div class='mhead'>"+…+"</div>"
  +"<div style='padding:16px 20px'>"+mid+"<div class='mtxt'>"+escapeHtml(m.txt)+"</div>"
  +(m.notiz?"<div class='mt-eingang-notiz'>Notiz: "+escapeHtml(m.notiz)+"</div>":"")+"</div>";
```
`.mtxt` wird ausschließlich hier verwendet (per grep bestätigt) — Änderungen am umgebenden Markup sind gefahrlos lokal, `.mtxt` selbst bleibt unangetastet (globale Basisregel).

**Schritte:**

- [ ] `grep`-Befehl oben ausführen, `egSummaryHtml()` komplett neu lesen.
- [ ] **`egZusammenfassung(m)`** einfügen, direkt vor `egSummaryHtml`:
```js
function egZusammenfassung(m){
 if(m.zusammenfassung)return m.zusammenfassung;
 const sig=erkenneSignale(m.txt);
 return (m.wer||"Anfrage")+" — "+[sig.kostentraeger,sig.dringlichkeit?"Frist "+sig.dringlichkeit:null,sig.konkret?"konkrete Anfrage":null].filter(Boolean).join(" · ");
}
```
- [ ] **`egSummaryHtml(m)`** — die bisherige `.mtxt`-Zeile ersetzen:
```js
// Ist:
+"<div style='padding:16px 20px'>"+mid+"<div class='mtxt'>"+escapeHtml(m.txt)+"</div>"
+(m.notiz?…
// Soll:
+"<div style='padding:16px 20px'>"+mid
  +"<div class='eg-zsf'><span class='kicker'>Zusammenfassung</span><p>"+escapeHtml(egZusammenfassung(m))+"</p></div>"
  +"<div class='eg-original'><span class='kicker'>Originalanfrage</span><div class='mtxt'>"+escapeHtml(m.txt)+"</div></div>"
+(m.notiz?…
```
  (gilt unverändert für alle drei Zustände — qualifiziert offen / passiv offen / `m.done` —, da `egSummaryHtml()` bereits heute in allen drei Fällen die einzige Aufrufstelle für den Nachrichten-Body ist.)
- [ ] **CSS**, neuer Block vor `</style>`:
```css
/* Task 1.2 (Punkt 1): Zusammenfassung + Papier-Optik für die Originalanfrage in #egDetail */
.eg-zsf{margin-top:12px}
.eg-zsf p{margin:2px 0 0;font-size:14px;color:var(--ink-soft);line-height:1.45}
.eg-original{margin-top:10px;background:var(--paper2);border:1px solid var(--hair);border-left:3px solid var(--brass-line);border-radius:8px;padding:10px 12px}
.eg-original .mtxt{margin-top:4px}
```
  (`.mtxt` selbst bleibt unverändert — nur der neue `.eg-original`-Wrapper bekommt die Papier-Anmutung, kein globaler Override.)
- [ ] Standard-Verifikation bei 390px UND 1440px: `#egDetail` für je einen Fall aus jedem der drei Zustände (qualifiziert, passiv, `m.done`) öffnen.

**Sichtprüfung:** `#egDetail` zeigt für jede Eingangs-Zeile zuerst einen 1-Satz-„ZUSAMMENFASSUNG"-Kicker, danach die vollständige, optisch abgesetzte (Papier-Hintergrund, Gold-Randlinie links) „ORIGINALANFRAGE" — für alle drei Zustände identisch aufgebaut; bei fehlendem `m.zusammenfassung` erscheint ein aus `erkenneSignale()` komponierter Satz, nie eine leere Zeile.

**Commit:** `feat: Anfrage-Detail zeigt Zusammenfassung + optisch abgesetzte Originalanfrage, egZusammenfassung()-Fallback für Anfragen ohne Seed-Feld (Punkt 1, Teil 2)`

---

## Phase 2 — Spec-Punkt 2: Eingang-Zuordnung → SalutoCare-Toggle + Bearbeitungs-Hinweis

### Task 1.3 — SalutoCare-Toggle + Hinweis-Feld + `f.zuordnungsHinweis` + Anzeige in Hero und Mein-Tag-Sheet

**Lane:** `claude-implementer-pro` (neuer State über Rerender hinweg, Datenfluss in ein neu angelegtes Fall-Objekt, zwei zusätzliche Anzeige-Stellen)

**Abhängigkeit:** unabhängig von Task 1.1/1.2 (andere Stelle in `openEgDetail()`), aber gleiche Datei — sequentiell danach.

**Referenz-Komponenten (erst lesen):** `.tchip.on`/`.zcat.active`/`.egd-owner.sel` als Klick-Chip-Vorbild; `egSetOwner(id,idx){egOwner=TEAM[idx];openEgDetail(id);}` als exaktes Rerender-Muster für den neuen Toggle.

**Dateien/Anker:** `grep -n "let egOwner=null\|function openEgDetail\|function egSetOwner\|function uebernehmen\|function aufgabenHeroHtml\|const miniFallakte" index.html` vor Bearbeitung ausführen und alle Zeilenangaben neu bestätigen. Bei Plan-Erstellung: `let egOwner=null,_egId=null;` bei [index.html:4646](../../../index.html#L4646), `openEgDetail()` bei [index.html:4371](../../../index.html#L4371), `uebernehmen(id,owner)` bei [index.html:4782](../../../index.html#L4782), `aufgabenHeroHtml(f)` bei [index.html:6004](../../../index.html#L6004), `miniFallakte`-Konstante innerhalb `mtSheetRender()` bei [index.html:6557](../../../index.html#L6557).

**Ist (verifiziert):**
- `openEgDetail()`s Init-Block: `if(_egId!==id){_egId=id;egOwner=(m.typ!=="passiv"&&!m.done)?ownerVorschlag(m.achse):null;}` — feuert **nur** beim Wechsel auf eine andere Zeile, nicht bei jedem Rerender derselben Zeile (z. B. durch `egSetOwner()`). **Genau dieses Verhalten ist der Mechanismus, der den neuen State über den Rerender hinweg erhält:** Solange `_egId===id` bleibt, wird `egSaluto`/`egHinweis` nicht zurückgesetzt — die Werte müssen also nur beim erstmaligen Öffnen einer Zeile initialisiert werden, nicht bei jedem `openEgDetail(id)`-Aufruf, den ein Toggle oder Owner-Wechsel auslöst.
- `uebernehmen(id,owner)` legt den Fall aktuell mit `saluto:m.achse==="SalutoCare"` an (hart aus der Achse abgeleitet) und hat noch kein `zuordnungsHinweis`-Feld.
- `aufgabenHeroHtml(f)` rendert `.ah-typ`+`.ah-meta`, keine Hinweis-Zeile. `mtSheetRender()`s `miniFallakte`-Block (nur für `item.kind==="fall"`) rendert Achse/KT-Pills+Status+letzte 2 Log-Einträge, ebenfalls keine Hinweis-Zeile.

**Schritte:**

- [ ] `grep`-Befehl oben ausführen, alle Fundstellen neu bestätigen.
- [ ] **State** — neben `let egOwner=null,_egId=null;` ergänzen: `let egSaluto=false,egHinweis="";`
- [ ] **Init in `openEgDetail()`** — im bestehenden `if(_egId!==id){...}`-Block zusätzlich setzen:
```js
// Ist:
if(_egId!==id){_egId=id;egOwner=(m.typ!=="passiv"&&!m.done)?ownerVorschlag(m.achse):null;}
// Soll:
if(_egId!==id){_egId=id;egOwner=(m.typ!=="passiv"&&!m.done)?ownerVorschlag(m.achse):null;egSaluto=m.achse==="SalutoCare";egHinweis="";}
```
- [ ] **Toggle + Hinweis-Feld im Zuordnungs-Block** — im `else`-Zweig (offene, nicht-passive Anfrage), direkt vor dem bestehenden `<div class='egd-owners'>...` oder direkt danach (vor den zwei Aktions-Buttons) einfügen:
```js
actions="<button type='button' class='egd-saluto"+(egSaluto?" on":"")+"' onclick='egToggleSaluto("+m.id+")'>★ SalutoCare / Premium</button>"
 +"<div class='egd-owners'>"+TEAM.map(...)+"</div>"
 +"<label class='kicker' style='margin-top:10px;display:block'>Hinweis für die Bearbeitung (optional)</label>"
 +"<textarea id='egdHinweis' class='rsz-textarea' placeholder='Worauf muss geachtet werden?' oninput='egHinweis=this.value'>"+escapeHtml(egHinweis)+"</textarea>"
 +"<button class='btn-brass' style='width:100%;margin-top:4px' onclick='uebernehmen("+m.id+",egOwner)'>Als Fall anlegen &amp; zuordnen</button>"
 +"<button class='btn-ghost' style='width:100%' onclick='antwortenEingang("+m.id+",egOwner)'>✉ Antworten</button>";
```
  (Reine Variablen-Zuweisung bei `oninput` — **kein** Rerender pro Tastenanschlag, anders als der Toggle. Da `egHinweis` bereits beim Tippen im Modul-State steht, geht der Wert bei einem durch `egSetOwner()`/`egToggleSaluto()` ausgelösten Rerender **nicht** verloren — der neue `openEgDetail()`-Aufruf schreibt denselben `egHinweis`-Wert wieder in den `value`-Slot der neu gerenderten Textarea.)
- [ ] **`egToggleSaluto(id)`** neu einfügen (identisches Muster zu `egSetOwner()`), z. B. direkt danach:
```js
function egToggleSaluto(id){ egSaluto=!egSaluto; openEgDetail(id); }
```
- [ ] **`uebernehmen(id,owner)` erweitern:**
```js
// Ist:
faelle.push({id:fid,…,saluto:m.achse==="SalutoCare",docs:[false,false,false,false],…
  log:[[dstr(0),"Aus Eingang übernommen ("+m.kanal+"): "+m.tit+" — zugewiesen an "+owner]]});
// Soll:
const _log=[[dstr(0),"Aus Eingang übernommen ("+m.kanal+"): "+m.tit+" — zugewiesen an "+owner]];
if(egHinweis)_log.push([dstr(0),"[Hinweis bei Zuordnung] "+egHinweis]);
faelle.push({id:fid,…,saluto:egSaluto,zuordnungsHinweis:egHinweis||"",docs:[false,false,false,false],…
  log:_log});
```
  (`saluto` liest jetzt den Toggle statt hart aus der Achse abzuleiten; `zuordnungsHinweis` additiv; zweiter Log-Eintrag nur, wenn tatsächlich ein Hinweis gesetzt wurde.)
- [ ] **`aufgabenHeroHtml(f)` erweitern** — nach dem bestehenden `.ah-meta`-Div:
```js
// Ist:
+"<div class='ah-meta'>"+…+"</div>";
// Soll:
+"<div class='ah-meta'>"+…+"</div>"
+(f.zuordnungsHinweis?"<div class='ah-hinweis'><span class='kicker'>Hinweis</span> "+escapeHtml(f.zuordnungsHinweis)+"</div>":"");
```
- [ ] **`miniFallakte` in `mtSheetRender()` erweitern** — nach der bestehenden `.mt-sfstatus`-Zeile:
```js
// Ist:
+"<div class='mt-sfstatus'>Status: "+escapeHtml(item.ref.status)+"</div>"
+"<div class='timeline'>"+…
// Soll:
+"<div class='mt-sfstatus'>Status: "+escapeHtml(item.ref.status)+"</div>"
+(item.ref.zuordnungsHinweis?"<div class='mt-shinweis'><span class='kicker'>Hinweis</span> "+escapeHtml(item.ref.zuordnungsHinweis)+"</div>":"")
+"<div class='timeline'>"+…
```
- [ ] **CSS**, neuer Block vor `</style>`:
```css
/* Task 1.3 (Punkt 2): SalutoCare-Toggle + Bearbeitungs-Hinweis */
.egd-saluto{display:block;width:100%;min-height:44px;margin-bottom:8px;font:600 13.5px/1 Inter;
  border:1px solid var(--hair);border-radius:12px;background:var(--paper);color:var(--ink-soft);cursor:pointer}
.egd-saluto.on{border-color:var(--brass);background:var(--brass-soft);color:var(--brass-deep)}
.ah-hinweis,.mt-shinweis{margin-top:8px;font-size:12.5px;color:var(--ink-soft)}
.ah-hinweis .kicker,.mt-shinweis .kicker{display:inline;margin:0 6px 0 0;font-size:10.5px}
```
  (`#egdHinweis` selbst nutzt die bereits vorhandene `.rsz-textarea`-Klasse — kein neues Textarea-Styling nötig.)
- [ ] Standard-Verifikation bei 390px UND 1440px: eine Anfrage öffnen, Toggle umschalten (Rerender darf `egHinweis`-Eingabe nicht löschen — vorher etwas eintippen, dann Toggle klicken, Text muss erhalten bleiben), Fall anlegen, im Fall-Drawer und im Mein-Tag-Sheet den Hinweis prüfen.

**Sichtprüfung:** Beim Zuordnen einer Anfrage ist ein SalutoCare/Premium-Chip sichtbar (vorausgewählt bei Achse „SalutoCare", umschaltbar ohne Datenverlust im Hinweis-Feld) und ein optionales Hinweis-Textfeld; nach „Als Fall anlegen" sind `f.saluto`/`f.zuordnungsHinweis` gesetzt und der Hinweis erscheint sowohl im Fall-Drawer-Hero als auch im Mein-Tag-Sheet, sobald er befüllt wurde — bei leerem Hinweis erscheint keine leere Zeile.

**Commit:** `feat: SalutoCare-Toggle + Bearbeitungs-Hinweis bei der Eingangs-Zuordnung, sichtbar in Fall-Drawer-Hero und Mein-Tag-Sheet (Punkt 2)`

---

## Phase 3 — Spec-Punkt 5: Stammdaten-Akte einklappbar

### Task 1.4 — `<details class="pa-fold">` um `#dAkte` (Fall-Drawer) und die eingebettete Akte in `#rsWirt` (In-Reha-Overlay)

**Lane:** `claude-implementer` (reines Markup-Wrapping nach bereits vorhandenem `<details>`/`summary.rk`-Muster, keine neue Logik)

**Referenz-Komponenten (erst lesen):** `<details class='mt-sleitfaden-details'><summary class='rk'>Leitfaden</summary>…</details>` — direktes Vorbild, `summary.rk{cursor:pointer;list-style:none}` liefert die Basis, keine neue Typografie nötig (das bestehende Vorbild nutzt exakt dieselbe minimale Cursor/List-Style-Regel, keine zusätzliche Farb-/Schrift-Deklaration). `.d-acc[open]>summary::after{transform:rotate(90deg)}` als Vorbild für den rotierenden Chevron.

**Dateien/Anker:** `grep -n "document.getElementById(\"dAkte\").innerHTML\|paAkte(p.personId)\|function paAkte\|function paAkteSlot\|function openDbDetail\|function renderFallakte" index.html` vor Bearbeitung ausführen und alle Zeilenangaben neu bestätigen. Bei Plan-Erstellung: Fall-Drawer-Stelle bei [index.html:6148](../../../index.html#L6148) (`document.getElementById("dAkte").innerHTML=paAkteSlot(f.personId);`), In-Reha-Overlay-Stelle bei [index.html:5873](../../../index.html#L5873) (abschließendes `+paAkte(p.personId);` in der `rsWirt`-Zusammensetzung, `openRsDetail()`). `openDbDetail()`s `dbBody`-Aufruf (`+paAkte(p.personId);` bei [index.html:5283](../../../index.html#L5283)) und `renderFallakte()`s `faUebersicht`-Aufruf (`+paAkteSlot(f.personId);` bei [index.html:6728](../../../index.html#L6728)) **bleiben unverändert offen** — hier ist die Akte der Hauptinhalt bzw. Zweck der Ansicht.

**Ist (verifiziert):** Vier `paAkte`/`paAkteSlot`-Aufrufstellen insgesamt — zwei werden in diesem Task gewrappt (Fall-Drawer `#dAkte`, In-Reha-Overlay `#rsWirt`), zwei bleiben unverändert (Datenbank-Inspektor `#dbBody`, Fallakte-Vollansicht `#faUebersicht`).

**Schritte:**

- [ ] `grep`-Befehl oben ausführen, alle vier Fundstellen gegen die obige Liste abgleichen — nur die zwei genannten anfassen.
- [ ] **Fall-Drawer** (`#dAkte`):
```js
// Ist:
document.getElementById("dAkte").innerHTML=paAkteSlot(f.personId);
// Soll:
document.getElementById("dAkte").innerHTML="<details class='pa-fold'><summary class='rk'>Stammdaten-Akte</summary>"+paAkteSlot(f.personId)+"</details>";
```
- [ ] **In-Reha-Overlay** (`rsWirt`-Zusammensetzung, abschließender Ausdruck):
```js
// Ist:
+…+paAkte(p.personId);
// Soll:
+…+"<details class='pa-fold'><summary class='rk'>Stammdaten-Akte</summary>"+paAkte(p.personId)+"</details>";
```
- [ ] **CSS**, neuer Block vor `</style>`:
```css
/* Task 1.4 (Punkt 5): .pa-fold — Stammdaten-Akte im Fall-Drawer/In-Reha-Overlay standardmäßig zugeklappt */
.pa-fold{margin-top:14px}
.pa-fold>summary::after{content:"›";display:inline-block;margin-left:6px;font-size:15px;line-height:1;color:var(--faint);transition:transform .2s}
.pa-fold[open]>summary::after{transform:rotate(90deg)}
```
- [ ] Kein neuer Render-Aufruf nötig — `<details>` ist natives HTML, Zustand lebt im DOM.
- [ ] Standard-Verifikation bei 390px UND 1440px: Fall-Drawer und In-Reha-Overlay öffnen, bestätigen dass die Akte zu ist und per Klick aufklappt; `#dbBody` (Datenbank-Inspektor) und `#faUebersicht` (Fallakte-Vollansicht) unverändert sofort offen gegentesten.

**Sichtprüfung:** Im Fall-Drawer und im In-Reha-Leitungs-Overlay ist die Stammdaten-Akte standardmäßig zugeklappt und zeigt nur die Kopfzeile „Stammdaten-Akte" — ein Klick öffnet sie vollständig; im Datenbank-Inspektor und in der Fallakte-Vollansicht bleibt sie wie bisher sofort sichtbar.

**Commit:** `feat: Stammdaten-Akte im Fall-Drawer und In-Reha-Overlay einklappbar (<details class='pa-fold'>), Datenbank-Inspektor + Fallakte-Vollansicht bleiben offen (Punkt 5)`

---

# Sprint 2

## Phase 4 — Spec-Punkt 4: Team-Statistiken (CRM-Cockpit)

### Task 2.1 — `teamCockpitHtml()`: KPI-Zeile + Belastungs-Balken + Achse-Aufteilung

**Lane:** `claude-implementer-pro` (neue Render-Funktion, deterministische Aggregation über `faelle[]`, neues CSS-Namespace)

**Referenz-Komponenten (erst lesen):** `.db-cockpit`/`.radar-kpi` (Kachel-Reihe, Aufbau in `dbCockpit()`) als Vorbild für die KPI-Zeile; `.radar-kpi.jetzt::before{background:var(--terra)}` als Vorbild für die Überfällig-Markierung; `networkDot()` als Vorbild dafür, `ACHSE_COL` nur als kleinen Dot einzusetzen, nie als Fläche.

**Dateien/Anker:** `grep -n "function renderTeam\|const TEAM=\|function kennzahlen\|const ACHSE_COL\|function offeneFaelle" index.html` vor Bearbeitung ausführen und alle Zeilenangaben neu bestätigen. Bei Plan-Erstellung: `renderTeam()` bei [index.html:5553](../../../index.html#L5553), `TEAM` (4 Einträge) bei [index.html:4328](../../../index.html#L4328), `kennzahlen()`s `ueberf`-Berechnung (Muster für die KPI-Zeile) bei [index.html:5417](../../../index.html#L5417), `ACHSE_COL` bei [index.html:4204](../../../index.html#L4204).

**Ist (verifiziert):** `renderTeam()` berechnet `openCases=faelle.filter(offen)` lokal (identische Logik zu `offeneFaelle()`, nicht dieselbe Funktion aufgerufen — direkt wiederverwendbar für das neue Cockpit ohne erneute Berechnung), rendert dann `.tm-intake`+`.tm-cards`+`.tm-listhead`+`.tm-list` in `#teamGrid`. Kein aggregiertes Cockpit oberhalb der Mitarbeiter-Karten — jede Kennzahl existiert nur pro Mitarbeiter.

**Schritte:**

- [ ] `grep`-Befehl oben ausführen, `renderTeam()` komplett neu lesen.
- [ ] **`teamCockpitHtml(openCases)`** neu einfügen, direkt vor `renderTeam()`:
```js
function teamCockpitHtml(openCases){
 const heuteFaellig=openCases.filter(f=>f.frist===dstr(0)).length;
 const ueberf=openCases.filter(f=>f.frist&&new Date(f.frist)<heute).length;
 const avg=(openCases.length/TEAM.length).toFixed(1);
 const kpis="<div class='ts-kpis'>"
   +"<div class='ts-kpi'><div class='ts-kpi-n num'>"+openCases.length+"</div><div class='ts-kpi-l'>Offene Fälle gesamt</div></div>"
   +"<div class='ts-kpi'><div class='ts-kpi-n num'>"+heuteFaellig+"</div><div class='ts-kpi-l'>Heute fällig</div></div>"
   +"<div class='ts-kpi"+(ueberf?" jetzt":"")+"'><div class='ts-kpi-n num'>"+ueberf+"</div><div class='ts-kpi-l'>Überfällig</div></div>"
   +"<div class='ts-kpi'><div class='ts-kpi-n num'>"+avg+"</div><div class='ts-kpi-l'>Ø offene Fälle / Kopf</div></div>"
   +"</div>";
 const counts=TEAM.map(t=>openCases.filter(f=>f.owner===t).length);
 const maxN=Math.max(1,...counts);
 const bal="<div class='ts-bal'>"+TEAM.map((t,i)=>{
   const n=counts[i];
   const ueb=openCases.filter(f=>f.owner===t&&f.frist&&new Date(f.frist)<heute).length;
   return "<div class='ts-bal-row'><span class='ts-bal-name'>"+escapeHtml(t)+"</span>"
     +"<div class='ts-bal-track'><div class='ts-bal-fill' style='width:"+(n/maxN*100)+"%'></div>"
     +(ueb?"<div class='ts-bal-ueb'></div>":"")+"</div>"
     +"<span class='ts-bal-n num'>"+n+"</span></div>";
 }).join("")+"</div>";
 const achsen=[...new Set(openCases.map(f=>f.achse))];
 const ach="<div class='ts-achse'>"+achsen.map(a=>{
   const n=openCases.filter(f=>f.achse===a).length;
   return "<span class='ts-achse-chip'><span class='ts-achse-dot' style='background:"+(ACHSE_COL[a]||"var(--unklar)")+"'></span>"+escapeHtml(a)+" <b class='num'>"+n+"</b></span>";
 }).join("")+"</div>";
 return kpis+bal+ach;
}
```
- [ ] **`renderTeam()` verdrahten** — Aufruf vor dem `cards`-Aufbau bzw. Einfügung im finalen `el.innerHTML` zwischen `.tm-intake` und `.tm-cards`:
```js
// Ist (Auszug, el.innerHTML-Zusammensetzung):
el.innerHTML=
   "<div class='tm-intake'>"+…+"</div>"
   +"<div class='tm-cards'>"+cards+"</div>"
   +"<div class='tm-listhead'>"+…
// Soll:
el.innerHTML=
   "<div class='tm-intake'>"+…+"</div>"
   +teamCockpitHtml(openCases)
   +"<div class='tm-cards'>"+cards+"</div>"
   +"<div class='tm-listhead'>"+…
```
- [ ] **CSS**, neuer Block vor `</style>`:
```css
/* Task 2.1 (Punkt 4): .ts-* — Team-Cockpit (KPI-Zeile + Belastungs-Balken + Achse-Aufteilung) */
.ts-kpis{display:flex;gap:12px;flex-wrap:wrap;margin:0 0 16px}
.ts-kpi{flex:1;min-width:120px;background:var(--paper2);border:1px solid var(--hair);border-radius:13px;box-shadow:var(--shadow-soft),inset 0 1px 0 var(--glass-hi);padding:11px 15px;position:relative;overflow:hidden}
.ts-kpi::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--brass)}
.ts-kpi.jetzt::before{background:var(--terra)}
.ts-kpi-n{font:700 23px/1 "Cormorant Garamond",Georgia,serif;color:var(--ink)}
.ts-kpi.jetzt .ts-kpi-n{color:var(--terra)}
.ts-kpi-l{font:600 11px/1.1 Inter;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin-top:3px}
.ts-bal{display:flex;flex-direction:column;gap:8px;margin:0 0 16px}
.ts-bal-row{display:flex;align-items:center;gap:10px}
.ts-bal-name{flex:0 0 128px;font-size:12.5px;color:var(--ink-soft);font-weight:600}
.ts-bal-track{flex:1;height:8px;border-radius:99px;background:var(--cream2);position:relative;overflow:hidden}
.ts-bal-fill{height:100%;border-radius:99px;background:var(--sage-deep)}
.ts-bal-ueb{position:absolute;right:0;top:0;bottom:0;width:4px;background:var(--terra)}
.ts-bal-n{flex:0 0 22px;text-align:right;font:700 15px/1 "Cormorant Garamond",Georgia,serif;color:var(--ink)}
.ts-achse{display:flex;gap:8px;flex-wrap:wrap}
.ts-achse-chip{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;padding:6px 11px;border-radius:99px;border:1px solid var(--hair);background:var(--paper)}
.ts-achse-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
```
  (`.ts-bal-fill` nutzt `--sage-deep`, `.ts-bal-ueb`/`.ts-kpi.jetzt` nutzen `--terra` — beide aus der Jade/Gold/Terra-Familie, keine Achsen-Farbe als Fläche; `.ts-achse-dot` ist der einzige Ort, an dem `ACHSE_COL` verwendet wird, ausschließlich als kleiner Punkt.)
- [ ] Standard-Verifikation bei 390px (KPI-Kacheln/Balken-Zeilen dürfen nicht überlaufen, Umbruch statt Overflow) UND 1440px.

**Sichtprüfung:** Der Team-Reiter zeigt oberhalb der Mitarbeiter-Karten eine KPI-Zeile (Gesamtzahl offener Fälle, heute fällig, überfällig, Ø pro Kopf), darunter eine Balkenübersicht pro Mitarbeiter (mit rotem Überfällig-Marker am Balkenende, falls vorhanden) und darunter eine Aufteilung der offenen Fälle nach Achse mit farbigem Dot statt farbiger Fläche.

**Commit:** `feat: Team-Cockpit (.ts-*) — KPI-Zeile, Belastungs-Balken, Achse-Aufteilung oberhalb der Mitarbeiter-Karten (Punkt 4)`

---

## Phase 5 — Spec-Punkt 6: Zuweiser-Archiv-Trennung + After-Sales-Anlässe

### Task 2.2 — Seed-Feld `z.seit` auf allen `zuweiser[]`-Einträgen

**Lane:** `claude-implementer` (rein additives Datenfeld, keine Verzweigungslogik, kein Konsument in diesem Task)

**Dateien/Anker:** `grep -n "^let zuweiser=\[" index.html` vor Bearbeitung ausführen und die Zeile neu bestätigen. Bei Plan-Erstellung: [index.html:4277](../../../index.html#L4277).

**Ist (verifiziert — Abweichung von der Spec-Vermutung, per grep nachgezählt):** `zuweiser[]` hat **11 Einträge** (nicht 10, wie die Design-Spec an einer Stelle vermutet — die dort genannte `faelle`-Werteliste `6,4,3,2,2,3,2,1,0,1,0` hat selbst bereits 11 Werte, stimmt also mit dem tatsächlichen Array überein; nur die Prosa-Zahl „10" im Spec-Text ist ein Zähl-Fehler). Reihenfolge: Leopoldina-Krankenhaus(6), RHÖN-KLINIKUM Campus(4), Dr. Sommer(3), Thoraxzentrum Münnerstadt(2), PRIMO MEDICO(2), Uniklinikum Würzburg(3), Klinikum Fulda(2), König-Ludwig-Haus(1), Helios Klinikum(0), Privatpraxis Dr. Neumann(1), Reha-Technik Müller(0). Kein Eintrag hat aktuell ein `seit`-Feld.

**Schritte:**

- [ ] `grep`-Befehl oben ausführen, alle 11 Objektliterale in der verifizierten Reihenfolge neu bestätigen.
- [ ] Jedem Eintrag additiv `seit:"YYYY-MM-DD"` hinzufügen (Partnerschaftsbeginn, Demo-Werte — geprüft: nur die ersten beiden liegen zum Stichtag 2026-07-22 im ±30-Tage-Fenster der Jahrestag-Erkennung aus Task 2.3, alle übrigen neun liegen nachweislich außerhalb):
  1. Leopoldina-Krankenhaus: `"2019-07-15"` (Jahrestag 15.07. → 7 Tage zurück, **im Fenster**)
  2. RHÖN-KLINIKUM Campus: `"2020-03-12"` (Jahrestag außerhalb, ~132 Tage entfernt)
  3. Dr. Sommer: `"2021-11-05"` (~106 Tage entfernt)
  4. Thoraxzentrum Münnerstadt: `"2022-05-18"` (~65 Tage entfernt)
  5. PRIMO MEDICO: `"2022-08-05"` (Jahrestag 05.08. → 14 Tage voraus, **im Fenster**)
  6. Uniklinikum Würzburg: `"2019-01-22"` (~181 Tage entfernt)
  7. Klinikum Fulda: `"2023-10-03"` (~73 Tage entfernt)
  8. König-Ludwig-Haus: `"2024-02-14"` (~158 Tage entfernt)
  9. Helios Klinikum: `"2025-04-01"` (~112 Tage entfernt)
  10. Privatpraxis Dr. Neumann: `"2021-12-20"` (~151 Tage entfernt)
  11. Reha-Technik Müller: `"2020-09-15"` (~55 Tage entfernt)
- [ ] `grep -c "seit:\"" index.html` → erwartet **11**.
- [ ] Standard-Verifikation (rein additives Datenfeld, noch kein Konsument in diesem Task — kein sichtbarer UI-Unterschied): `zuweiser[0].seit`/`zuweiser[4].seit` in der Browser-Konsole liefern die gesetzten Daten, 0 Console-Errors.

**Sichtprüfung:** Kein sichtbarer UI-Unterschied (Feld existiert, wird erst in Task 2.3 gelesen); Konsolentest auf `zuweiser.map(z=>z.seit)` liefert 11 nicht-leere ISO-Daten; 0 Console-Errors.

**Commit:** `feat: z.seit-Seed-Feld (Partnerschaftsbeginn) auf allen 11 zuweiser[]-Einträgen (Punkt 6, Teil 1)`

---

### Task 2.3 — `zuweiser-rhythmus`/`-meilenstein`/`-jubilaeum` ersetzen den alten `typ:"zuweiser"`-Block, Archiv-Filter im Pflege-Feed

**Lane:** `claude-implementer-pro` (deterministische Kadenz-/Schwellen-/Jahrestag-Logik, Ersatz eines bestehenden Blocks, Konsumenten-Gegenprüfung)

**Abhängigkeit:** braucht `z.seit` aus Task 2.2.

**Architekten-Entscheidung (aus Spec, maßgeblich):** `zuweiser-rhythmus` **ersetzt** den bestehenden `typ:"zuweiser"`-Block in `anlaesse()` vollständig (nicht additiv daneben) — zwei parallele „Zeit seit letztem Kontakt"-Karten mit unterschiedlichen Schwellen für dieselbe Beziehung wären redundant. `AR_RHYTHMUS` wird dadurch verwaist (einzige Verwendung im zu ersetzenden Block) und entfällt in diesem Task. `rhythmusPflege(z)` bleibt unverändert bestehen — sie speist weiterhin nur den statischen `znext`-Fallback in `renderZuweiser()`, eine separate Anzeige-Stelle, die hier **nicht** angefasst wird.

**Referenz-Komponenten (erst lesen):** `paGeb()` als Vorbild für Jahrestag-Erkennung — liefert aber **nur** die nächste bevorstehende Wiederkehr (nie „vor N Tagen"), für `zuweiser-jubilaeum` wird eine **symmetrische** Variante gebraucht (negativ = vor N Tagen, positiv = in N Tagen). `AR_TYP`/`AR_FOTO`/`arCard()` als bestehende Anlass-Karten-Struktur, die um neue `typ`-Werte erweitert wird, ohne die Struktur selbst zu ändern.

**Dateien/Anker:** `grep -n "function anlaesse\|const AR_RHYTHMUS\|const AR_TYP\|const AR_FOTO\|function arCard\|function paGeb\|function rhythmusPflege" index.html` vor Bearbeitung ausführen und alle Zeilenangaben neu bestätigen. Bei Plan-Erstellung: `anlaesse(scope)` bei [index.html:4931](../../../index.html#L4931) (zu ersetzender `zuweiser.forEach`-Block innerhalb bei [index.html:4954](../../../index.html#L4954)-[4961](../../../index.html#L4961), Scope-Filter bei [index.html:4977](../../../index.html#L4977)), `AR_RHYTHMUS` bei [index.html:4904](../../../index.html#L4904), `AR_TYP`/`AR_FOTO` bei [index.html:4990](../../../index.html#L4990)/[4991](../../../index.html#L4991), `arCard(a,i)` bei [index.html:4992](../../../index.html#L4992), `paGeb(geb)` bei [index.html:4611](../../../index.html#L4611).

**Ist (verifiziert):**
```js
zuweiser.forEach(z=>{
 const kad=AR_RHYTHMUS[z.status]||60;
 const seit=z.letzter?Math.round((heute-new Date(z.letzter))/86400000):9999;
 if(seit<kad)return;
 const key="zuw:"+z.name;if(_arDone.has(key))return;
 out.push({key:key,typ:"zuweiser",urg:seit>=kad*1.5?"jetzt":"bald",tage:seit===9999?999:seit,titel:z.name,sub:(z.letzter?seit+" Tage kein Kontakt":"Noch nie kontaktiert")+" · "+(z.next||""),sterne:null,geste:{label:z.next||"Kontakt aufnehmen",cta:"Kontakt aufnehmen"},zName:z.name});
});
```
Dieser Block iteriert **ungefiltert** über alle `zuweiser[]` — die zwei Einträge mit `faelle:0`/`letzter:""` (Helios Klinikum, Reha-Technik Müller) bekommen `seit=9999`, was garantiert `>=kad` ist, und erscheinen heute mit `sub:"Noch nie kontaktiert"` im Pflege-Feed — exakt der gemeldete Missstand. `renderZuweiser()`s `#zgrid`/`#zmap`-Trennung nach `faelle>=1` (`primaryFiltered`) existiert bereits seit Runde 3 und ist von diesem Task **nicht** betroffen.

**Schritte:**

- [ ] `grep`-Befehl oben ausführen, den vollständigen `zuweiser.forEach`-Block sowie `AR_RHYTHMUS`/`AR_TYP`/`AR_FOTO`/`arCard()`/Scope-Filter neu lokalisieren.
- [ ] **Symmetrische Jahrestag-Hilfsfunktion** einfügen (z. B. direkt nach `paGeb`):
```js
function jahrestagDiff(datum){
 if(!datum)return null;
 const mo=+datum.slice(5,7)-1,da=+datum.slice(8,10);
 const h0=new Date(heute.getFullYear(),heute.getMonth(),heute.getDate());
 const dies=new Date(heute.getFullYear(),mo,da), vorjahr=new Date(heute.getFullYear()-1,mo,da);
 const diffDies=Math.round((dies-h0)/86400000), diffVor=Math.round((vorjahr-h0)/86400000);
 return Math.abs(diffDies)<=Math.abs(diffVor)?diffDies:diffVor;
}
```
- [ ] **Alten `typ:"zuweiser"`-Block ersetzen** — die gesamte `zuweiser.forEach(z=>{…typ:"zuweiser"…})`-Schleife (oben unter „Ist" zitiert) durch drei neue, jeweils auf `z.faelle>=1` beschränkte Blöcke ersetzen:
```js
zuweiser.forEach(z=>{
 if(z.faelle<1)return;
 const staerke=((z.draht||"").match(/●/g)||[]).length;
 const kad=staerke>=3?90:staerke===2?180:330;
 const seit=z.letzter?Math.round((heute-new Date(z.letzter))/86400000):9999;
 if(seit<kad)return;
 const key="zuw-rhy:"+z.name;if(_arDone.has(key))return;
 out.push({key:key,typ:"zuweiser-rhythmus",urg:seit>=kad*1.5?"jetzt":"bald",tage:seit===9999?999:seit,titel:z.name,sub:seit+" Tage kein Kontakt · "+(z.next||""),sterne:null,geste:{label:z.next||"Kontakt aufnehmen",cta:"Kontakt aufnehmen"},zName:z.name});
});
zuweiser.forEach(z=>{
 if(z.faelle<1)return;
 const schwellen=[20,10,5].filter(s=>z.faelle>=s);
 if(!schwellen.length)return;
 const schwelle=schwellen[0];
 const key="zuw-meil:"+z.name+":"+schwelle;if(_arDone.has(key))return;
 out.push({key:key,typ:"zuweiser-meilenstein",urg:"bald",tage:0,titel:z.name,sub:"Dankeschön-Geste: "+schwelle+". Patient",sterne:null,geste:{label:"Dankeschön senden",cta:"Kontakt aufnehmen"},zName:z.name});
});
zuweiser.forEach(z=>{
 if(z.faelle<1)return;
 const diff=jahrestagDiff(z.seit);
 if(diff===null||Math.abs(diff)>30)return;
 const key="zuw-jub:"+z.name;if(_arDone.has(key))return;
 out.push({key:key,typ:"zuweiser-jubilaeum",urg:Math.abs(diff)<=7?"jetzt":"bald",tage:diff,titel:z.name+" — Partnerschafts-Jubiläum",sub:(diff<0?Math.abs(diff)+" Tage vergangen":"in "+diff+" Tagen")+" seit Partnerschaftsbeginn",sterne:null,geste:{label:"Jubiläums-Geste senden",cta:"Kontakt aufnehmen"},zName:z.name});
});
```
  (`schwellen[0]` liefert die höchste erreichte Schwelle, da `[20,10,5]` absteigend geprüft wird — z. B. Leopoldina mit `faelle:6` löst „5. Patient" aus, kein Eintrag mit `faelle>=10` existiert aktuell in den Demo-Daten, ist aber für künftige Datenänderungen korrekt vorbereitet. `_arDone`-Key enthält die Schwelle, damit ein späterer Sprung auf die nächste Schwelle erneut auslöst.)
- [ ] **`AR_RHYTHMUS`-Konstante entfernen** (verwaist, einzige Verwendung war der ersetzte Block) — vorher `grep -n "AR_RHYTHMUS" index.html` erneut ausführen und bestätigen, dass außer der Deklaration keine Verwendung mehr existiert.
- [ ] **`AR_TYP`/`AR_FOTO` anpassen:**
```js
// Ist:
const AR_TYP={geburtstag:"Geburtstag",jubilaeum:"Entlass-Jubiläum",wiederbedarf:"Wiederbedarf",zuweiser:"Zuweiser-Kontakt","zuweiser-trend":"Zuweiser-Trend"};
const AR_FOTO={geburtstag:["kb-garten.webp","rose"],wiederbedarf:["kb-haus.webp","sage"],zuweiser:["kb-arzt.jpg","petrol"]};
// Soll:
const AR_TYP={geburtstag:"Geburtstag",jubilaeum:"Entlass-Jubiläum",wiederbedarf:"Wiederbedarf","zuweiser-rhythmus":"Zuweiser-Rhythmus","zuweiser-meilenstein":"Zuweiser-Meilenstein","zuweiser-jubilaeum":"Partnerschafts-Jubiläum","zuweiser-trend":"Zuweiser-Trend"};
const AR_FOTO={geburtstag:["kb-garten.webp","rose"],wiederbedarf:["kb-haus.webp","sage"],"zuweiser-rhythmus":["kb-arzt.jpg","petrol"]};
```
  (Meilenstein/Jubiläum bekommen bewusst kein Foto — konsistent mit `zuweiser-trend`, das heute schon keins hat.)
- [ ] **`arCard()`s `isZ`-Zeile anpassen:**
```js
// Ist:
const isZ=a.typ==="zuweiser"||a.typ==="zuweiser-trend";
// Soll:
const isZ=["zuweiser-rhythmus","zuweiser-meilenstein","zuweiser-jubilaeum","zuweiser-trend"].includes(a.typ);
```
- [ ] **Scope-Filter in `anlaesse()` anpassen:**
```js
// Ist:
if(scope==="zuweiser")return sorted.filter(a=>a.typ==="zuweiser"||a.typ==="zuweiser-trend");
// Soll:
if(scope==="zuweiser")return sorted.filter(a=>["zuweiser-rhythmus","zuweiser-meilenstein","zuweiser-jubilaeum","zuweiser-trend"].includes(a.typ));
```
- [ ] **Konsumenten gegenprüfen (keine Code-Änderung nötig, nur bestätigen):** `renderZuweiser()`s `#zAnlaesse`-Feed (liest bereits `anlaesse("zuweiser")` — erbt automatisch); `rlCountZuw` (Heute-Live-Karte, liest ebenfalls `anlaesse("zuweiser")` — erbt automatisch, zählt jetzt nur noch Zuweiser mit echter Beziehung); `trendMap` in `renderZuweiser()` (`anlaesse().filter(a=>a.typ==="zuweiser-trend")` — **unverändert**, konsumiert weiterhin ausschließlich `zuweiser-trend`, per grep bestätigen, dass diese Zeile nicht versehentlich mitgeändert wurde).
- [ ] `grep -n "typ:\"zuweiser\"\|typ===\"zuweiser\"" index.html` erneut ausführen — sollte **keinen** Treffer mehr liefern (alle Vorkommen sind jetzt `zuweiser-rhythmus`/`-meilenstein`/`-jubilaeum`/`-trend`).
- [ ] Standard-Verifikation bei 390px UND 1440px: Zuweiser-Reiter → Pflege & Gesten öffnen, bestätigen dass Helios Klinikum und Reha-Technik Müller (`faelle:0`) **keine** Karte mehr im Feed haben; Leopoldina-Krankenhaus zeigt eine Jubiläums-Karte (7 Tage vergangen) und eine Meilenstein-Karte (5. Patient); PRIMO MEDICO zeigt eine Jubiläums-Karte (in 14 Tagen).

**Sichtprüfung:** Der Zuweiser-Pflege-Feed zeigt keine Karten mehr für Zuweiser ohne echte Fallbeziehung; für Zuweiser mit `faelle>=1` erscheinen je nach Datenlage draht-basierte Rhythmus-Erinnerungen, Fallzahl-Meilenstein-Dankeschöns und Partnerschafts-Jubiläen als eigenständige, unterscheidbare Anlass-Karten statt nur des bisherigen Rückgangs-Trends.

**Commit:** `feat: Zuweiser-Pflege-Feed — faelle>=1-Filter, zuweiser-rhythmus/-meilenstein/-jubilaeum ersetzen den alten Kadenz-Block, AR_RHYTHMUS entfernt (Punkt 6, Teil 2)`

---

## Phase 6 — Spec-Punkt 7: Bestand/Aktionen-Trennung

### Task 2.4 — Tab-Umbenennung „Aktionen & Anlässe" / „Aktionen & Pflege"

**Lane:** `claude-implementer` (reine Textersetzung, keine Verzweigungslogik, `data-nwt`-Routing-Werte unverändert)

**Dateien/Anker:** `grep -n "Radar &amp; Anlässe\|Pflege &amp; Gesten" index.html` vor Bearbeitung ausführen und beide Zeilen neu bestätigen. Bei Plan-Erstellung: Patienten-Sub-View bei [index.html:3775](../../../index.html#L3775) („Radar & Anlässe"), Zuweiser-Sub-View bei [index.html:3744](../../../index.html#L3744) („Pflege & Gesten").

**Ist (verifiziert):** `data-nwt="radar"`/`data-nwt="pflege"`-Attributwerte sind rein interne Routing-Werte für `nwtSwitch()` ohne sichtbare Auswirkung — bleiben unverändert, nur der sichtbare Button-Text ändert sich.

**Schritte:**

- [ ] `grep`-Befehl oben ausführen, beide Fundstellen neu bestätigen.
- [ ] Patienten-Sub-View: `<button class="nwt-seg active" data-nwt="radar" onclick="nwtSwitch(this,'radar')">Radar &amp; Anlässe</button>` → Text zu `Aktionen &amp; Anlässe` ändern (nur der Text zwischen den Tags, `data-nwt`/`onclick` unverändert).
- [ ] Zuweiser-Sub-View: `<button class="nwt-seg active" data-nwt="pflege" onclick="nwtSwitch(this,'pflege')">Pflege &amp; Gesten</button>` → Text zu `Aktionen &amp; Pflege` ändern (nur der Text, `data-nwt`/`onclick` unverändert).
- [ ] `grep -n "Radar &amp; Anlässe\|Pflege &amp; Gesten" index.html` erneut ausführen — kein Treffer mehr.
- [ ] Standard-Verifikation bei 390px UND 1440px: beide Tab-Leisten (Patienten, Zuweiser) zeigen die neuen Labels, Tab-Wechsel funktioniert weiterhin (reines `classList`-Toggle, `data-nwt`-Werte unverändert).

**Sichtprüfung:** Die interne Tab-Leiste in „Patienten" zeigt „Aktionen & Anlässe" statt „Radar & Anlässe", die in „Zuweiser" zeigt „Aktionen & Pflege" statt „Pflege & Gesten" — Tab-Wechsel funktioniert unverändert.

**Commit:** `refactor: .nwt-seg-Tabs zu „Aktionen & Anlässe"/„Aktionen & Pflege" umbenannt (Punkt 7, Teil 1)`

---

### Task 2.5 — `openDbDetail()`: manuellen „Nachsorge vormerken"-Button entfernen, `wiedervorlage()`/`p.wv`/`.wv`-CSS als direkte Folge verwaist und entfernt

**Lane:** `claude-implementer` (Entfernung eines bereits vollständig grep-verifizierten, durch diese Runde direkt verwaisten Codepfads — keine neue Logik, keine Verzweigungsentscheidung)

**Dateien/Anker:** `grep -n "function wiedervorlage\|\.patient-actions.*action\|p\.wv\|wv:false\|\.wv{" index.html` vor Bearbeitung ausführen und alle Zeilenangaben neu bestätigen. Bei Plan-Erstellung: `wiedervorlage(i)` bei [index.html:5259](../../../index.html#L5259), `action`-Variable + `.patient-actions`-Zeile in `openDbDetail()` bei [index.html:5268](../../../index.html#L5268)-[5282](../../../index.html#L5282), `p.wv`-Setzung in `inDatenbank()` bei [index.html:4816](../../../index.html#L4816) (`wv:false`), CSS `.wv` bei [index.html:462](../../../index.html#L462).

**Ist (verifiziert, per grep vollständig — die einzigen Fundstellen von `p.wv`/`wiedervorlage`/`.wv` im gesamten Code):**
```js
function wiedervorlage(i){bestand[i].wv=true;renderBestand();renderHeute();}
function openDbDetail(i){
  …
  const action=p.consent==="ja"
    ?(p.wv?"<span class='wv'>Wiedervorlage gesetzt</span>":"<button class='btn-ghost btn-sm' onclick='wiedervorlage("+i+");openDbDetail("+i+")'>Nachsorge vormerken</button>")
    :"<button class='btn-brass btn-sm' disabled>Kontaktfreigabe fehlt</button>";
  document.getElementById("dbBody").innerHTML=
     …
    +"<div class='patient-actions'>"+action+"</div>"
    +"</div>"+paAkte(p.personId);
  …
}
```
`p.wv` wird **nur** in `wiedervorlage()` (Schreiben) und `openDbDetail()`s `action`-Zeile (Lesen) referenziert — kein dritter Ort im Code liest oder schreibt es. `.wv`-CSS-Regel wird ausschließlich vom `p.wv?"<span class='wv'>…"`-Zweig oben erzeugt. Das bereits bestehende, system-getriebene Pendant (Wiederbedarf-Prognose `radar[]` + `arAktion()`-Karten im „Aktionen & Anlässe"-Tab, Button „Wiedervorlage planen" in `renderRadar()`) läuft komplett unabhängig daneben her und bleibt **unverändert** — dieser Task betrifft ausschließlich `openDbDetail()`s manuellen Zweig.

**Schritte:**

- [ ] `grep`-Befehl oben ausführen — **vor** jeder Löschung bestätigen, dass `p.wv`/`wiedervorlage`/`.wv` tatsächlich nur an den vier oben genannten Stellen vorkommen (kein fünfter Ort ist seit Plan-Erstellung hinzugekommen).
- [ ] **`openDbDetail()`**: die `action`-Variable und die `.patient-actions`-Zeile ersatzlos entfernen:
```js
// Ist:
const action=p.consent==="ja"
    ?(p.wv?"<span class='wv'>Wiedervorlage gesetzt</span>":"<button class='btn-ghost btn-sm' onclick='wiedervorlage("+i+");openDbDetail("+i+")'>Nachsorge vormerken</button>")
    :"<button class='btn-brass btn-sm' disabled>Kontaktfreigabe fehlt</button>";
document.getElementById("dbBody").innerHTML=
   …
  +"<div class='patient-actions'>"+action+"</div>"
  +"</div>"+paAkte(p.personId);
// Soll:
document.getElementById("dbBody").innerHTML=
   …
  +"</div>"+paAkte(p.personId);
```
- [ ] **`function wiedervorlage(i){...}`** komplett entfernen (verwaist — verliert mit obiger Änderung seinen einzigen Aufrufer).
- [ ] **`inDatenbank()`**: `wv:false,` aus dem neu angelegten `bestand.push({...})`-Objektliteral entfernen (verwaist — keine Leser mehr).
- [ ] **CSS**: `.wv{color:var(--brass-deep);font-weight:600;font-size:14px}` entfernen (verwaist — keine Emission mehr).
- [ ] `grep -n "\.wv\b\|wiedervorlage\|p\.wv" index.html` erneut ausführen — kein Treffer mehr (außer ggf. `radar-*`/`wv`-freie Nachbarklassen wie `.wv`-freie Wortteile, die keine echten Treffer sind — Ergebnis manuell gegenlesen, nicht blind auf 0 verlassen).
- [ ] `grep -c "function "  index.html` vor/nach vergleichen — genau eine Funktion (`wiedervorlage`) weniger, sonst nichts.
- [ ] Standard-Verifikation bei 390px UND 1440px: Datenbank-Inspektor (`openDbDetail()`) öffnen — zeigt nur noch Daten + Verlauf + Akte, keinen Aktions-Button mehr; „Aktionen & Anlässe"-Tab (Wiederbedarf-Karten) unverändert funktionsfähig gegentesten.

**Sichtprüfung:** Der Datenbank-/Patienten-Stammdaten-Inspektor zeigt keinen „Nachsorge vormerken"-Button und keinen „Kontaktfreigabe fehlt"-Platzhalter mehr — nur Daten, Verlauf und die (seit Task 1.4 zugeklappte) Akte; die system-generierte Wiedervorlage-Karte im „Aktionen & Anlässe"-Tab funktioniert unverändert.

**Commit:** `chore: manuellen „Nachsorge vormerken"-Button aus openDbDetail() entfernt, wiedervorlage()/p.wv/.wv-CSS als direkte Folge verwaist und entfernt (Punkt 7, Teil 2)`

---

## Reihenfolge / Abhängigkeiten

```
Sprint 1
  Task 1.1 (P1 Seed-Daten m.zusammenfassung) ── mechanisch, keine Abhängigkeit
        │
        ▼
  Task 1.2 (P1 egZusammenfassung()+egSummaryHtml()) ── braucht 1.1s Seed-Feld
        │
        ▼
  Task 1.3 (P2 SalutoCare-Toggle+Hinweis) ── unabhängig von 1.1/1.2, andere Code-Stelle, sequentiell danach
        │
        ▼
  Task 1.4 (P5 pa-fold um #dAkte/#rsWirt) ── unabhängig von 1.1-1.3, reines Markup-Wrapping
        │
        ▼
Sprint 2
  Task 2.1 (P4 Team-Cockpit) ── unabhängig von Sprint 1, eigener View
        │
        ▼
  Task 2.2 (P6 Seed-Feld z.seit) ── mechanisch, keine Abhängigkeit
        │
        ▼
  Task 2.3 (P6 Rhythmus/Meilenstein/Jubiläum, ersetzt AR_RHYTHMUS-Block) ── braucht 2.2s z.seit
        │
        ▼
  Task 2.4 (P7 Tab-Umbenennung) ── unabhängig, reiner Textsweep
        │
        ▼
  Task 2.5 (P7 wiedervorlage()/p.wv/.wv entfernen) ── unabhängig von 2.4, grep-vorverifiziert
```

Sequentiell in der oben angegebenen Reihenfolge ausführen (eine Datei, nie parallel) — entspricht der vom Auftrag vorgegebenen Sprint-Reihenfolge P1→P2→P5 (Sprint 1) und P4→P6→P7 (Sprint 2).

---

## Nicht-Ziele dieser Runde

- **Kein Fallakte-Herzstück-Redesign** (Nutzer-Feedback-Punkt 3) — separates Brainstorming folgt, nicht Teil dieser Spec/dieses Plans.
- Keine Änderung an `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`-Namespaces oder `openReferrer`/`closeReferrer`/`#refOverlay`.
- Datenarrays nur additiv: `m.zusammenfassung`, `f.zuordnungsHinweis`, `z.seit` sind die einzigen neuen Felder. `z.letzter` bleibt unverändert (bereits ISO-Datum) — kein zusätzliches `z.letzterKontakt`. `f.saluto` ist ein Wert-Update (hart abgeleitet → Toggle-gesteuert), keine neue Feld-Struktur.
- `AR_RHYTHMUS` (Task 2.3) und `wiedervorlage()`/`p.wv`/`.wv`-CSS (Task 2.5) werden entfernt — beides direkt durch diese Runde verwaist, kein pre-existing Dead Code, das darüber hinaus eigenmächtig aufgeräumt wird.
- Keine neuen Keyframes — die bestehenden 9 müssen ausreichen.
- Keine Änderung an `arAktion()`s generischem Mechanismus (Log-Push + `_arDone` + Toast) — die drei neuen Anlass-Typen sind vollständig `arCard`/`arAktion`-kompatibel, ohne den Handler selbst anzufassen.
- `trendMap`s exklusiver Konsum von `zuweiser-trend` bleibt unangetastet (Task 2.3, Konsumenten-Abschnitt).
- `openDbDetail()`/`#dbBody` (Datenbank-Inspektor) und `renderFallakte()`/`#faUebersicht` (Fallakte-Vollansicht) bleiben mit sofort sichtbarer Akte — nur `#dAkte` (Fall-Drawer) und `#rsWirt` (In-Reha-Overlay) werden zugeklappt (Task 1.4).
- Jede Änderung bei 390px UND 1440px verifizieren, 0 Console-Errors, reduced-motion-safe, nur synthetische Demo-Daten, `escapeHtml` für dynamische Inhalte, kein `Math.random`.
