# Runde 6, Punkt 2 — Dynamische Schritt-Werkzeuge: Implementierungsplan

> **Für ausführende Agenten:** Dieser Plan wird Subagent-Driven umgesetzt — pro Task ein frischer Agent, kein Schreiben durch das orchestrierende Modell selbst. Lane-Tag pro Task beachten. Jeder Task arbeitet ausschließlich in `index.html`; **vor jeder Anker-Zeile den `grep`-Befehl aus dem Task selbst erneut ausführen** — Zeilennummern verschieben sich durch jeden vorherigen Task. Die hier notierten Zeilen sind der Stand bei Plan-Erstellung (23.07.2026, `index.html` 7036 Zeilen, Commit `69428f4`), nicht garantiert der Stand bei Ausführung.

**Bezug:** Setzt [2026-07-23-runde6-punkt2-schritt-werkzeuge-design.md](../specs/2026-07-23-runde6-punkt2-schritt-werkzeuge-design.md) vollständig um (bereits inkl. Review-Fixes: `sopDone`-Key `"<typ>:<status>:<idx>"`, Alter-Guard auch in `makeBoardCol` Z.4984) — dynamische Kernfakten-Chips + Stammdaten-Bestätigung + gemischte SOP-/Rückfragen-Checkliste im Werkbank-Werkzeug `#dArbeit`, sprechender Fallname aus dem Eingang statt „Neuer Fall (aus Eingang)", Originalnachricht als eigenes Kontext-Spalten-Kapitel außerhalb des rueckruf-Typs. Format/Konventionen übernommen vom vorherigen Sprint-Plan ([2026-07-23-runde6-punkt1-anfrage-triage-plan.md](./2026-07-23-runde6-punkt1-anfrage-triage-plan.md)).

**Architektur:** Alle Änderungen in `index.html` (self-contained, kein Build-Prozess, „Tests" = konkrete Browser-Checks + ein Node-Snippet für die reine Extraktionsfunktion, keine Test-Framework-Suite). Sequentielle Ausführung — **nie parallel**, jeder Task fasst dieselbe Datei an. Nach jedem Task: Git-Commit (nur `index.html` staged). Die App bleibt nach **jedem einzelnen Task** lauffähig (0 Console-Errors, kein kaputter Zwischenzustand).

---

## Harte Regeln (jeder Task, aus Spec + projektweitem `CLAUDE.md`)

- Cofounder-Namespaces **nicht anfassen**: `.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`. `#refOverlay` tabu.
- Daten-Arrays (`faelle[]`, `eingang[]`) **nur additiv** erweitern — keine bestehenden Felder umbenennen/löschen, keine bestehenden Seed-Einträge löschen.
- **Exakt 9 Keyframes** — verifiziert im Ist-Stand (`grep -c "@keyframes" index.html` = 9): `lift` [61], `rpDrawC`/`rpDrawP` [1043]/[1044], `rpRing` [1058], `rpGrow` [1074], `cv-travel` [1362], `auGrow` [2021], `lxSweep` [2030], `lxPulse` [2073]. Diese Runde führt **keine** neuen ein.
- `escapeHtml()` für jeden dynamisch eingefügten Text (Chips, Original, Stammdaten, Checkliste-Labels, Namen), insbesondere in allen neuen `.fkw-*`-Bausteinen.
- **Kein `Math.random`** — alles deterministisch.
- Reduced-motion-safe: diese Runde führt keine neuen Animationen ein.
- Beide Breiten prüfen: **390px und 1440px**. **0 Console-Errors** bei jedem Verifikationsschritt.
- Neue CSS ausschließlich als **kommentierter Block direkt vor `</style>`** (Zeile 3147 im Ist-Stand), neuer Namespace `.fkw-*` für alles genuin Neue in dieser Runde. Bestehende, weiterverwendete Klassen (`.egt-check-item`, `.eg-original`, `.pa-fold`, `summary.rk`, `.btn-ghost`, `.btn-brass`) behalten ihre Namen und ihre bestehende CSS-Definition unangetastet.
- `f.rueckfragen`/`egRueckfrageToggle()` (Punkt 1) bleiben namensgleich bestehen — werden hier nur zusätzlich in `sopChecklisteHtml()` eingemischt, nicht ersetzt.
- Reihenfolge-Vorgabe aus der Spec (§8.2): Chips → Stammdaten → Original → Checkliste → Notizfeld im rueckruf-Zweig.

---

## Lanes

- **`claude-implementer`** (Haiku) — Task 1 (rein mechanisch: `SOP_CHECKLISTE`-Konstante wörtlich einfügen, additive Seed-Felder nach exakter Tabelle, neuer CSS-Block wörtlich vor `</style>`).
- **`claude-implementer-pro`** (Sonnet) — Task 2 (`fallFakten()`/`fallAbsenderTyp()` + Node-Verifikation), Task 3 (`sopChecklisteHtml()`/`sopToggle()`), Task 4 (**größter Task, atomar**: `dArbeitHtml()`-Neufassung aller Zweige + neue Helper `fkwFaktenHtml`/`fkwOriginalHtml`/`fkwStammHtml`/`fkwStammBestaetigen`), Task 5 (Kontext-Spalten-Kapitel „Originalanfrage"), Task 6 (**atomar**: `uebernehmen()`-Diff/sprechender Name + beide Alter-Guards `faName`+`makeBoardCol` im selben Commit), Task 7 (`advanceFallStatus()`-Diff), Task 8 (Aufräum-Sweep + Abnahme-Sweep).

---

## Warum Task 4 atomar ist (Zuschnitts-Begründung)

`dArbeitHtml()` wird als **eine** Funktion vollständig neu gefasst (§8.1 der Spec): jeder der fünf Zweige (`kosten`/`unterlagen`/`angebot`/`anreise`/`rueckruf`) bekommt die neue `fakten+`-Zeile vorangestellt, drei Zweige zusätzlich `sopChecklisteHtml(...)`, der rueckruf-Zweig zusätzlich `fkwStammHtml`+`fkwOriginalHtml`. Die vier neuen Helper (`fkwFaktenHtml`/`fkwOriginalHtml`/`fkwStammHtml`/`fkwStammBestaetigen`) werden **nur** von dieser einen Funktion aufgerufen. Würde man `dArbeitHtml()` in Teilzweigen über mehrere Commits verteilen, gäbe es einen Zwischenzustand, in dem z. B. der rueckruf-Zweig bereits `fkwStammHtml(f)` aufruft, die Funktion aber noch nicht existiert (`ReferenceError` beim Öffnen jeder Fallakte — verletzt „App bleibt nach jedem Task lauffähig"). **Entscheidung:** Helper-Definitionen und die komplette `dArbeitHtml()`-Neufassung werden in einem einzigen atomaren Task (Task 4) behandelt.

## Warum Task 6 atomar ist (Zuschnitts-Begründung, Review-Vorgabe)

Die Spec verlangt explizit (§6.1, zweite Fundstelle als Review-Fund benannt), dass die Namenskonstruktion in `uebernehmen()` und **beide** Alter-Guards (`renderFallakte()`s `#faName`-Zeile **und** `makeBoardCol()`s Karten-Zeile) zusammen behandelt werden — der Bug (doppeltes Alter „… (72) · Innere (72)") entsteht nur, sobald `uebernehmen()` Namen mit „(Zahl)"-Klammer konstruiert, und beide Anzeigeorte (Fallakte-Kopf, Board-Karte) zeigen denselben Fall. Ein Commit, das nur einen der beiden Guards setzt, ließe eine der beiden Ansichten mit sichtbarem Doppel-Alter zurück — kein gebrochener Boot-Zustand (kein Fehler), aber ein sofort sichtbarer, unvollständiger Fix, den die Spec ausdrücklich als zusammengehörig markiert. **Entscheidung:** Namenskonstruktion + beide Guards in einem Commit.

---

## Standard-Verifikation (nach jedem Task)

1. `grep -c "function " index.html` vor/nach vergleichen — nur die im Task dokumentierten neuen Funktionen kommen hinzu, keine unbeabsichtigt gelöschten.
2. Browser: Seite neu laden, Console auf 0 Errors prüfen.
3. Betroffene View bei 390px und bei 1440px öffnen, auf Overflow/Lesbarkeit prüfen.
4. Cofounder-Bereiche (`#refOverlay`, `.mx-*`, `.rsp-*`, `.rp-*`, `.rpd-*`) unverändert gegentesten.
5. `renderTeam()`/Matrix (`.mx-*`) unangetastet gegentesten (nicht Teil dieser Runde).
6. Commit mit klarer Botschaft, welcher Spec-Abschnitt umgesetzt wurde — **nur `index.html` staged, niemals `docs/MicrosoftTeams-video.mp4` oder sonstige Dateien**.
7. Jeder Task unten endet zusätzlich mit einer eigenen **Sichtprüfung**.

---

# Task 1 — Datengrundlage: SOP-Konstante, Seeds, CSS (additiv)

**Lane:** `claude-implementer` (drei vollständig vorgezeichnete, additive Bausteine — Konstante wörtlich aus der Spec, Seed-Ergänzungen nach exakter Tabelle, CSS-Block wörtlich vor `</style>`; keine eigene Entscheidung nötig)

**Abhängigkeit:** keine — rein additiv. Keine bestehende Funktion liest `SOP_CHECKLISTE`, `f.originalTxt`, `f.originalKanal`, `f.patient` in diesem Task; die neue CSS-Klasse `.fkw-*` wird von keinem Markup erzeugt, solange Task 4 nicht gelaufen ist. Bootet unverändert, 0 optische Änderung.

**Bezug:** Spec §3.1, §3.2, §5, §7 (Bestands-Seeds), §8.5 (CSS).

**Dateien/Anker:** `grep -n "^let faelle=\[\|^let eingang=\[\|function sterneAusSignal\|^</style>" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `faelle[]` Zeile 4252 (Anna Muster `id:1` Zeile 4253, Maria Probst `id:3` Zeile 4254, Ruth Winkler `id:9` Zeile 4257), `eingang[]` Zeile 4283 (`id:101` Zeile 4284, `id:103` Zeile 4286), `sterneAusSignal()` Zeile ca. 4822, CSS-Einfügepunkt vor `</style>` Zeile 3147.

**Schritte:**

- [ ] **1.1** `grep`-Befehl oben ausführen, alle Fundstellen bestätigen.

- [ ] **1.2 — `SOP_CHECKLISTE`-Konstante einfügen**, direkt vor `function sopChecklisteHtml` — da diese Funktion erst in Task 3 entsteht, hier stattdessen direkt nach `function sterneAusSignal(sig){...}` platzieren (gleicher Bereich wie andere Domänen-Konstanten):
```js
/* Runde 6 Punkt 2 (§5): SOP_CHECKLISTE — Standard-Checkpunkte je Werkbank-Typ, konsumiert von
   sopChecklisteHtml()/sopToggle() (Task 3) und advanceFallStatus() (Task 7). unterlagen/anreise
   bewusst kein Eintrag — deren bestehende Checklisten (u1-u4 bzw. 3 Anreise-Punkte) bleiben
   unverändert das Werkzeug, keine Dopplung. */
const SOP_CHECKLISTE={
  rueckruf:["Erreichbarkeit & Rückrufzeit klären","Bedarf & Situation verstehen","Nächste Schritte ankündigen"],
  kosten:["Kostenträger-Kontakt prüfen","Zusage-Frist notieren"],
  angebot:["Zimmerkategorie passend zu Sternen wählen","Anreise-Optionen nennen"]
};
```

- [ ] **1.3 — `faelle[]`: `originalTxt`/`originalKanal` additiv an 3 Bestands-Einträgen** (Spec §7-Tabelle, wörtlich; keine bestehende Zeile sonst verändert):
```diff
- {id:1,personId:"P01",name:"Anna Muster",alter:67,rolle:"Angehörige",kanal:"Zuweiser direkt",quelle:"RHÖN Campus Bad Neustadt, Sozialdienst",achse:"Neurologie",kt:"PKV",status:"Neu",owner:"S. Koordination",aufgabe:"Rückruf Angehörige",frist:dstr(0),saluto:false,docs:[false,false,false,false],kosten:"offen",consent:"mündlich erteilt",verlust:"",reaktion:null,log:[[dstr(0),"Anfrage eingegangen (Sozialdienst, Schlaganfall, AHB gesucht)"]]},
+ {id:1,personId:"P01",name:"Anna Muster",alter:67,rolle:"Angehörige",kanal:"Zuweiser direkt",quelle:"RHÖN Campus Bad Neustadt, Sozialdienst",achse:"Neurologie",kt:"PKV",status:"Neu",owner:"S. Koordination",aufgabe:"Rückruf Angehörige",frist:dstr(0),saluto:false,docs:[false,false,false,false],kosten:"offen",consent:"mündlich erteilt",verlust:"",reaktion:null,log:[[dstr(0),"Anfrage eingegangen (Sozialdienst, Schlaganfall, AHB gesucht)"]],originalTxt:"Guten Tag, hier meldet sich der Sozialdienst des RHÖN Campus Bad Neustadt. Unsere Patientin Anna Muster (67) ist nach einem Schlaganfall bei uns in der Neurologie, PKV-versichert, und soll möglichst schnell zur AHB. Die Tochter organisiert die Aufnahme und bittet um Rückruf.",originalKanal:"Zuweiser direkt"},
```
```diff
- {id:3,personId:"P02",name:"Maria Probst",alter:58,rolle:"Patient selbst",kanal:"Website-Formular",quelle:"Website",achse:"Orthopädie",kt:"Selbstzahler",status:"Kontaktiert",owner:"S. Koordination",aufgabe:"Angebot Komfortpaket senden",frist:dstr(2),saluto:false,docs:[false,false,true,false],kosten:"angefragt",consent:"schriftlich liegt vor",verlust:"",reaktion:3,log:[[dstr(-2),"Website-Anfrage"],[dstr(-2),"Rückruf nach 3 Std., Beratung geführt"]]},
+ {id:3,personId:"P02",name:"Maria Probst",alter:58,rolle:"Patient selbst",kanal:"Website-Formular",quelle:"Website",achse:"Orthopädie",kt:"Selbstzahler",status:"Kontaktiert",owner:"S. Koordination",aufgabe:"Angebot Komfortpaket senden",frist:dstr(2),saluto:false,docs:[false,false,true,false],kosten:"angefragt",consent:"schriftlich liegt vor",verlust:"",reaktion:3,log:[[dstr(-2),"Website-Anfrage"],[dstr(-2),"Rückruf nach 3 Std., Beratung geführt"]],originalTxt:"Hallo, ich interessiere mich für eine Reha nach meiner Hüft-TEP. Ich bin Selbstzahlerin (58 Jahre) und möchte gerne ein Komfortzimmer, am liebsten möglichst schnell einen Termin.",originalKanal:"Website-Formular"},
```
```diff
- {id:9,personId:"P05",name:"Ruth Winkler",alter:77,rolle:"Angehörige",kanal:"Telefon",quelle:"UKW Würzburg, Station 2 Nord",achse:"Neurologie",kt:"PKV",status:"Aufnahme geplant",owner:"M. Belegung",aufgabe:"Zimmer + Transport bestätigen",frist:dstr(2),saluto:false,docs:[true,true,true,true],kosten:"Zusage liegt vor",consent:"schriftlich liegt vor",verlust:"",reaktion:2,log:[[dstr(-10),"Anfrage Privatstation UKW"],[dstr(-6),"Kostenzusage PKV"],[dstr(-1),"Aufnahme für nächste Woche geplant"]]},
+ {id:9,personId:"P05",name:"Ruth Winkler",alter:77,rolle:"Angehörige",kanal:"Telefon",quelle:"UKW Würzburg, Station 2 Nord",achse:"Neurologie",kt:"PKV",status:"Aufnahme geplant",owner:"M. Belegung",aufgabe:"Zimmer + Transport bestätigen",frist:dstr(2),saluto:false,docs:[true,true,true,true],kosten:"Zusage liegt vor",consent:"schriftlich liegt vor",verlust:"",reaktion:2,log:[[dstr(-10),"Anfrage Privatstation UKW"],[dstr(-6),"Kostenzusage PKV"],[dstr(-1),"Aufnahme für nächste Woche geplant"]],originalTxt:"Guten Tag, ich rufe für meine Mutter an, die auf der Station 2 Nord im UKW Würzburg liegt. Sie ist 77 Jahre alt, PKV-versichert, und soll nach einem Schlaganfall zu Ihnen in die Neuro-Reha. Wir bräuchten möglichst schnell einen Platz, am besten mit Privatzimmer.",originalKanal:"Telefon"},
```
  (Bewusst **kein** `originalZeit` an diesen drei Bestands-Seeds — Spec §3.1: die Anfrage ist historisch, ein relativer „vor N Min."-Zeitstempel wäre neben Fällen, die bereits Tage im Log stehen, irreführend.)

- [ ] **1.4 — `eingang[]`: `patient`-Feld additiv an 2 Einträgen** (Spec §7.1, nur dort wo `fallFakten()` das Alter nicht selbst aus `m.txt` lesen kann):
```diff
- {id:101,kanal:"Telefon",tit:"Anruf: Ehefrau fragt für Mann (72) nach Reha nach Herz-OP",txt:"Nummer notiert, möchte Rückruf heute. Vermutlich PKV.",zeit:"vor 25 Min.",achse:"Innere",done:false,typ:"qualifiziert",wer:"Ehefrau fragt für Mann (72)",zusammenfassung:"Ehefrau fragt telefonisch für ihren Mann (72) nach Reha nach Herz-OP — PKV, Rückruf heute gewünscht.",gruppe:null,sterne:null,autoVerteilt:false},
+ {id:101,kanal:"Telefon",tit:"Anruf: Ehefrau fragt für Mann (72) nach Reha nach Herz-OP",txt:"Nummer notiert, möchte Rückruf heute. Vermutlich PKV.",zeit:"vor 25 Min.",achse:"Innere",done:false,typ:"qualifiziert",wer:"Ehefrau fragt für Mann (72)",zusammenfassung:"Ehefrau fragt telefonisch für ihren Mann (72) nach Reha nach Herz-OP — PKV, Rückruf heute gewünscht.",gruppe:null,sterne:null,autoVerteilt:false,patient:{name:null,alter:72}},
```
```diff
- {id:103,kanal:"Website",tit:"Website-Formular: Selbstzahlerin (55) fragt nach Premium-Reha",txt:"Interessiert an Suite, fragt nach Preisen und freien Terminen.",zeit:"vor 2 Std.",achse:"SalutoCare",done:false,typ:"qualifiziert",wer:"Selbstzahlerin fragt selbst nach Premium-Suite (55)",zusammenfassung:"Selbstzahlerin (55) fragt über die Website nach der Premium-Suite — interessiert an Preisen und freien Terminen.",gruppe:null,sterne:null,autoVerteilt:false},
+ {id:103,kanal:"Website",tit:"Website-Formular: Selbstzahlerin (55) fragt nach Premium-Reha",txt:"Interessiert an Suite, fragt nach Preisen und freien Terminen.",zeit:"vor 2 Std.",achse:"SalutoCare",done:false,typ:"qualifiziert",wer:"Selbstzahlerin fragt selbst nach Premium-Suite (55)",zusammenfassung:"Selbstzahlerin (55) fragt über die Website nach der Premium-Suite — interessiert an Preisen und freien Terminen.",gruppe:null,sterne:null,autoVerteilt:false,patient:{name:null,alter:55}},
```
  (Ids 102/109/110 brauchen `patient` nicht — ihr `txt` enthält die Altersangabe bereits direkt, `fallFakten()` liest sie über die eigene Regex, kein doppelt gepflegtes Feld.)

- [ ] **1.5 — neuer CSS-Block vor `</style>`** (`.fkw-*`-Namespace, wörtlich aus Spec §8.5):
```css
/* Runde 6 Punkt 2: .fkw-* — dynamische Schritt-Werkzeuge (Kernfakten-Chips, Stammdaten-Bestätigung,
   gemischte SOP-/Rückfragen-Checkliste). Original-Papieroptik wiederverwendet .eg-original/.pa-fold/
   summary.rk (Punkt 1, keine neue Papier-CSS nötig); Checklisten-Zeilen wiederverwenden .egt-check-item. */
.fkw-fakten{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}
.fkw-chip{display:inline-flex;align-items:center;font:600 12px/1 Inter;padding:5px 10px;border-radius:99px;border:1px solid var(--hair);background:var(--paper2);color:var(--ink-soft)}
.fkw-check{display:flex;flex-direction:column;gap:8px;margin-bottom:4px}
.fkw-tag{margin-left:auto;font-size:10.5px;font-weight:600;color:var(--brass-deep);background:var(--brass-soft);border:1px solid var(--brass-line);border-radius:6px;padding:2px 6px;flex-shrink:0}
.fkw-stamm{display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin:0 0 14px;padding:10px 12px;background:var(--brass-soft);border:1px solid var(--brass-line);border-radius:8px}
.fkw-stamm label{display:block;font-size:11px;color:var(--brass-deep);margin-bottom:3px}
.fkw-stamm input{font:inherit;padding:6px 8px;border:1px solid var(--hair);border-radius:8px;background:var(--paper)}
```

- [ ] **1.6** `grep -n "const SOP_CHECKLISTE\|originalTxt:\|patient:{name:null" index.html` ausführen — erwartet: 1× `SOP_CHECKLISTE`, 3× `originalTxt:` (ids 1/3/9), 2× `patient:{name:null` (ids 101/103).
- [ ] **1.7** Standard-Verifikation bei 390px UND 1440px: App bootet unverändert, Eingang-Liste und alle Fallakten sehen optisch **exakt unverändert** aus (keine bestehende Funktion liest die neuen Felder/die neue Klasse), 0 Console-Errors.

**Sichtprüfung:** Visuell ändert sich in diesem Task **nichts** — reine additive Vorbereitung. In der Browser-Konsole bestätigen: `SOP_CHECKLISTE.rueckruf.length` ergibt `3`, `faelle.find(f=>f.id===1).originalTxt` enthält „Schlaganfall", `eingang.find(m=>m.id===101).patient.alter` ergibt `72`.

**Commit:** `feat: Datengrundlage Schritt-Werkzeuge — SOP_CHECKLISTE-Konstante, originalTxt/originalKanal an 3 faelle[]-Seeds, patient an 2 eingang[]-Seeds, .fkw-*-CSS-Block (Runde 6 Punkt 2, §3/§5/§7/§8.5)`

---

# Task 2 — `fallFakten()`/`fallAbsenderTyp()`: deterministische Extraktion

**Lane:** `claude-implementer-pro` (reine, aber nicht-triviale Extraktionslogik mit mehreren Regex-Fallback-Ketten — aus der Spec wörtlich übernommen, per Node gegen die Spec-Tabelle verifiziert)

**Abhängigkeit:** Task 1 (`f.originalTxt`/`m.patient` müssen existieren, damit die Node-Verifikation gegen echte Seeds sinnvoll ist; die Funktionen selbst sind aber pure Funktionen ohne Nebenwirkung — auch ohne Task 1 bootbar, nur die Verifikationstabelle bräuchte sonst Fake-Objekte).

**Bezug:** Spec §4, §4.1 (Verifikationstabelle).

**Dateien/Anker:** `grep -n "function egVollstaendigkeit" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `egVollstaendigkeit()` endet Zeile 4838 (schließende Klammer), direkt danach `klassifiziereEingang()`.

**Schritte:**

- [ ] **2.1** `grep`-Befehl oben ausführen, exakte Zeile der schließenden Klammer von `egVollstaendigkeit()` bestätigen.

- [ ] **2.2 — `fallFakten()`/`fallAbsenderTyp()` + Label-Konstanten einfügen**, direkt nach `egVollstaendigkeit(m){...}` und vor `function klassifiziereEingang(m){`, wörtlich aus Spec §4:
```js
/* Runde 6 Punkt 2 (§4): fallFakten()/fallAbsenderTyp() — deterministische Kernfakten-Extraktion
   (Alter/Diagnose/Kostenträger/Frist/Absender-Typ) aus Originaltext oder Fall-Feldern. Nimmt
   wahlweise einen Fall (f.originalTxt) oder ein Eingang-Objekt (m.txt, für die Namenskonstruktion
   in uebernehmen(), Task 6) — daher liest sie f.originalTxt||f.txt. */
const KT_LABEL={pkv:"PKV",gkv:"GKV",beihilfe:"Beihilfe",selbstzahler:"Selbstzahler"};
const DIAG_LABEL={schlaganfall:"Schlaganfall","hüft-tep":"Hüft-TEP","knie-tep":"Knie-TEP",
  "herz-op":"Herz-OP",beatmung:"Beatmung",weaning:"Weaning",hirnblutung:"Hirnblutung"};

function fallAbsenderTyp(f){
  // 1) saubere Rolle direkt am Fall (statische faelle[]-Seeds wie Anna Muster) — höchste Priorität
  if(f.rolle==="Angehörige") return "Angehörige";
  if(f.rolle==="Patient selbst") return "Patient/in selbst";
  if(f.rolle==="Zuweiser") return /sozialdienst|entlassmanagement/i.test((f.quelle||"")+" "+(f.wer||""))?"Sozialdienst":"Zuweisende:r Arzt";
  // 2) Fallback über wer/Text — nötig für Eingang-Objekte UND für uebernehmen()-erzeugte Fälle,
  //    deren f.rolle bis heute hart "offen" ist und nie in eine der obigen drei Kategorien fällt
  //    (bekannter Bestandszustand, hier bewusst nicht angefasst, s. Spec §9/§11).
  const ctx=(f.wer||"")+" "+(f.originalTxt||f.txt||"");
  if(/sozialdienst|entlassmanagement/i.test(ctx)) return "Sozialdienst";
  if(/ehefrau|ehemann|tochter|sohn|familie|angehörige/i.test(ctx)) return "Angehörige";
  if(/hausarzt|privatärztin|privatarzt|\bdr\.|\bärztin\b|\barzt\b/i.test(ctx)) return "Zuweisende:r Arzt";
  if(/fragt selbst|ich (bin|interessiere)|selbstzahler/i.test(ctx)) return "Patient/in selbst";
  return null;
}

function fallFakten(f){
  const txt=String(f.originalTxt||f.txt||"");
  const out=[];
  const alterM=/\((\d{1,3})\)|(\d{1,3})\s*(?:jahre|j\.)\b/i.exec(txt);
  const patientAlter=f.patient&&f.patient.alter!=null?f.patient.alter:null;
  const alter=alterM?+(alterM[1]||alterM[2]):(f.alter!=null?f.alter:patientAlter);
  if(alter) out.push({typ:"alter",text:alter+" J.",raw:alter});

  const diagM=/(schlaganfall|hüft-tep|knie-tep|herz-op|beatmung|weaning|hirnblutung)/i.exec(txt);
  if(diagM) out.push({typ:"diagnose",text:DIAG_LABEL[diagM[0].toLowerCase()]});
  else if(f.achse&&f.achse!=="Unklar") out.push({typ:"diagnose",text:f.achse});

  const ktM=/\bpkv\b|\bgkv\b|beihilfe|selbstzahler/i.exec(txt);
  if(ktM) out.push({typ:"kt",text:KT_LABEL[ktM[0].toLowerCase()]});
  else if(f.kt&&f.kt!=="Unklar") out.push({typ:"kt",text:f.kt});

  // eigenes, volleres Muster — NICHT identisch mit erkenneSignale()s fristMatch: dessen
  // "entlassung\s+(?:am\s+)?([\wäöü.]+)" matcht bei "Entlassung in 4 Tagen" nur "Entlassung in"
  // (Tage-Zahl geht verloren), hier deshalb die Tage-Varianten bewusst vor die generische gestellt.
  const fristM=/entlassung\s+in\s+\d+\s+tagen|entlassung\s+am\s+[\wäöü.]+|übernahme\s+in\s+\d+\s+tagen|in\s+\d+\s+tagen|dringend|möglichst schnell/i.exec(txt);
  if(fristM) out.push({typ:"frist",text:fristM[0]});

  const absender=fallAbsenderTyp(f);
  if(absender) out.push({typ:"absender",text:absender});

  return out; // fehlende Fakten werden einfach nicht gepusht — keine leeren Chips
}
```

- [ ] **2.3** `grep -n "function fallFakten\|function fallAbsenderTyp\|const KT_LABEL\|const DIAG_LABEL" index.html` ausführen — je 1 Fundstelle.

- [ ] **2.4 — Node-Verifikation** (kein Teil der App, nur Kontrolle vor dem Commit — Skript im Scratchpad ablegen, gegen ein Extrakt der relevanten Funktionen aus `index.html` laufen lassen, exakt die Spec-Tabelle §4.1 nachrechnen):
```
node -e "
$(sed -n '/^const KT_LABEL=/,/^}$/p' index.html | sed -n '1,$p')
" 2>&1 | true
```
  Praktikabler: die vier neuen Definitionen (Zeilen aus 2.2) plus ein kleines Test-Array in eine Datei im Scratchpad-Verzeichnis kopieren und mit `node <datei>` ausführen. Erwartet (Spec §4.1, exakt):
  - `eingang[101]` (`txt`+`patient.alter=72`) → `72 J. · Innere · PKV · Angehörige`
  - `eingang[102]` (`txt` „Patient (68), PKV, Entlassung in 4 Tagen...") → `68 J. · Neurologie · PKV · Entlassung in 4 Tagen · Sozialdienst`
  - `eingang[103]` (`txt`+`patient.alter=55`) → `55 J. · SalutoCare · Patient/in selbst`
  - `eingang[109]` → `66 J. · Orthopädie · GKV · Entlassung in 5 Tagen · Sozialdienst`
  - `eingang[110]` → `81 J. · Geriatrie · Beihilfe · Übernahme in 6 Tagen · Sozialdienst`
  - `faelle[0]` (Anna Muster, `originalTxt`) → `67 J. · Schlaganfall · PKV · möglichst schnell · Angehörige`
  - `faelle[1]` (Maria Probst, `originalTxt`) → `58 J. · Hüft-TEP · Selbstzahler · möglichst schnell · Patient/in selbst`
  - `faelle[4]` (Ruth Winkler, `originalTxt`) → `77 J. · Schlaganfall · PKV · möglichst schnell · Angehörige`
  0 Abweichungen zur Tabelle sind Pflicht, sonst Regex-Reihenfolge/Priorität gegen die Spec nachprüfen (nicht selbst „verbessern" — Spec-Code wörtlich übernehmen).

- [ ] **2.5** Standard-Verifikation bei 390px UND 1440px: App bootet unverändert (Funktionen sind additiv, noch von niemandem aufgerufen), 0 Console-Errors. In der Browser-Konsole zusätzlich: `fallFakten(faelle.find(f=>f.id===1)).map(c=>c.text)` liefert `["67 J.","Schlaganfall","PKV","möglichst schnell","Angehörige"]`.

**Sichtprüfung:** Visuell ändert sich in diesem Task **nichts** — die Funktionen existieren, werden aber von keinem Renderer aufgerufen (das kommt in Task 4). Konsole bestätigt exakte Übereinstimmung mit der Spec-Tabelle §4.1 für alle 8 Quellen.

**Commit:** `feat: fallFakten()/fallAbsenderTyp() — deterministische Kernfakten-Extraktion (Alter/Diagnose/Kostenträger/Frist/Absender-Typ), Node-verifiziert gegen 8 Seed-Texte (Runde 6 Punkt 2, §4)`

---

# Task 3 — `sopChecklisteHtml()`/`sopToggle()`: gemischte Checkliste

**Lane:** `claude-implementer-pro` (Logik mit Persistenz-Semantik über `f.sopDone`-Keys — Statuswechsel-abhängiger Key, Mischung zweier Datenquellen in einer Liste)

**Abhängigkeit:** Task 1 (`SOP_CHECKLISTE`-Konstante muss existieren).

**Bezug:** Spec §3.1 (`f.sopDone`), §5.

**Dateien/Anker:** `grep -n "function drawerAufgabenTyp\|const SOP_CHECKLISTE" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `drawerAufgabenTyp()` Zeile 6193–6200, `SOP_CHECKLISTE` (aus Task 1) irgendwo im 4800er-Bereich.

**Schritte:**

- [ ] **3.1** `grep`-Befehl oben ausführen, `drawerAufgabenTyp()`-Körper neu lesen (wird von `sopToggle()` aufgerufen).

- [ ] **3.2 — `sopChecklisteHtml(f,typ)`/`sopToggle(i)` einfügen**, direkt vor `function dArbeitHtml(f){` (wörtlich aus Spec §5; `sopDone`-Key bereits im Review-Fix-Format `"<typ>:<status>:<idx>"`):
```js
/* Runde 6 Punkt 2 (§5): sopChecklisteHtml()/sopToggle() — mischt übernommene Rückfragen (getaggt
   "aus der Anfrage") mit SOP-Standardpunkten in EINER Liste, Reihenfolge: Rückfragen zuerst, SOP
   danach. .egt-check-item (Punkt 1) wird als Zeilen-Stil wiederverwendet (Flex-Row/Padding/Border
   passen unverändert auf ein <label> mit Checkbox statt der ursprünglichen Div-Struktur; die
   dortigen .ok/.missing-Modifier greifen hier nicht, da diese Klassen nicht gesetzt werden).
   sopDone-Key ist "<typ>:<f.status>:<Index>" (Review-Fix) — ein Punkt gilt je Typ+Status-Stufe
   einzeln als erledigt, dieselbe Checkliste kann bei späterem Status erneut auftauchen, und ein
   manuelles Umtexten der Aufgabe ohne Statuswechsel kollidiert nicht mit fremden Häkchen. */
function sopChecklisteHtml(f,typ){
  const items=SOP_CHECKLISTE[typ]||[];
  let extra="";
  if(typ==="rueckruf"&&f.rueckfragen&&f.rueckfragen.length)
    extra=f.rueckfragen.map(function(r,i){
      return "<label class='egt-check-item'><input type='checkbox' "+(r.done?"checked":"")
        +" onchange='egRueckfrageToggle("+i+")'> "+escapeHtml(r.frage)
        +" <span class='fkw-tag'>aus der Anfrage</span></label>";
    }).join("");
  const sop=items.map(function(label,i){
    const done=!!(f.sopDone&&f.sopDone[typ+":"+f.status+":"+i]);
    return "<label class='egt-check-item'><input type='checkbox' "+(done?"checked":"")
      +" onchange='sopToggle("+i+")'> "+escapeHtml(label)+"</label>";
  }).join("");
  if(!extra&&!sop) return "";
  return "<div class='fkw-check'>"+extra+sop+"</div>";
}
function sopToggle(i){
  const f=aktuellerFall;if(!f)return;
  if(!f.sopDone)f.sopDone={};
  const key=drawerAufgabenTyp(f)+":"+f.status+":"+i;
  f.sopDone[key]=!f.sopDone[key];
  renderFallakte();
}
```

- [ ] **3.3** `grep -n "function sopChecklisteHtml\|function sopToggle" index.html` ausführen — je 1 Fundstelle.
- [ ] **3.4** Standard-Verifikation bei 390px UND 1440px: App bootet unverändert (Funktionen additiv, `dArbeitHtml()` ruft sie noch nicht auf), 0 Console-Errors. Browser-Konsole: `sopChecklisteHtml(faelle.find(f=>f.id===1),"rueckruf")` liefert einen HTML-String mit 3× `class='egt-check-item'` und keinem `fkw-tag` (Anna Muster hat kein `f.rueckfragen`).

**Sichtprüfung:** Visuell ändert sich in diesem Task **nichts** — additive Vorbereitung, Aufruf folgt in Task 4.

**Commit:** `feat: sopChecklisteHtml()/sopToggle() — gemischte SOP-/Rückfragen-Checkliste mit statusabhängigem Persistenz-Key (Runde 6 Punkt 2, §5)`

---

# Task 4 — `dArbeitHtml()`-Neufassung + `.fkw-*`-Helper (atomar)

**Lane:** `claude-implementer-pro` (größter Task: komplette Neufassung einer zentralen Render-Funktion mit fünf Zweigen + vier neue Helper, die einzige Konsumentin von `fallFakten()`/`sopChecklisteHtml()` — Kernänderung der gesamten Spec)

**Abhängigkeit:** braucht Task 2 (`fallFakten()`) und Task 3 (`sopChecklisteHtml()`).

**Warum atomar:** siehe „Zuschnitts-Begründung" oben.

**Bezug:** Spec §8.1, §8.2, Abnahme #1 (Anna-Muster-Szenario, Pflicht), #4, #5, #8.

**Dateien/Anker:** `grep -n "function drawerAufgabenTyp\|function dArbeitHtml\|function egRueckfrageToggle" index.html` vor Bearbeitung ausführen und **alle** Zeilenangaben neu bestätigen. Bei Plan-Erstellung (nach Task 1–3, Zeilen verschieben sich um die dort hinzugefügten ~55 Zeilen): `drawerAufgabenTyp()` ca. Zeile 6248, `dArbeitHtml()` ca. Zeile 6257–6293, `egRueckfrageToggle()` direkt danach.

**Schritte:**

- [ ] **4.1** `grep`-Befehl oben ausführen, kompletten `dArbeitHtml()`-Körper (alle fünf Zweige + generischer Fallback) neu lesen.

- [ ] **4.2 — vier neue Helper einfügen**, direkt vor `function dArbeitHtml(f){` (wörtlich aus Spec §8.2):
```js
/* Runde 6 Punkt 2 (§8.2): .fkw-*-Helper für dArbeitHtml() — Kernfakten-Chips, zugeklapptes
   Original, Stammdaten-Bestätigungszeile. Reihenfolge im rueckruf-Zweig (Chips → Stammdaten →
   Original → Checkliste → Notiz) ist eine Design-Entscheidung dieser Spec: Identität zuerst
   bestätigen, dann Kontext lesen, dann handeln. */
function fkwFaktenHtml(f){
  const fk=fallFakten(f);
  if(!fk.length) return "";
  return "<div class='fkw-fakten'>"+fk.map(c=>"<span class='fkw-chip'>"+escapeHtml(c.text)+"</span>").join("")+"</div>";
}
function fkwOriginalHtml(f){
  if(!f.originalTxt) return "";
  return "<details class='pa-fold'><summary class='rk'>Originalnachricht"
    +(f.originalKanal?" · "+escapeHtml(f.originalKanal):"")+"</summary>"
    +"<div class='eg-original'><div class='mtxt'>"+escapeHtml(f.originalTxt)+"</div></div></details>";
}
function fkwStammHtml(f){
  if(f.stammOk) return "";
  return "<div class='fkw-stamm'>"
   +"<div><label for='fkwName'>Name</label><input id='fkwName' value=\""+escapeHtml(f.name||"")+"\"></div>"
   +"<div><label for='fkwAlter'>Alter</label><input id='fkwAlter' type='number' min='18' max='105' value=\""+(f.alter||"")+"\" style='width:70px'></div>"
   +"<button class='btn-ghost btn-sm' type='button' onclick='fkwStammBestaetigen()'>Bestätigen</button>"
   +"</div>";
}
function fkwStammBestaetigen(){
 const f=aktuellerFall;if(!f)return;
 const nameEl=document.getElementById("fkwName"),alterEl=document.getElementById("fkwAlter");
 const name=(nameEl?nameEl.value:"").trim(); if(!name)return;
 f.name=name; f.alter=alterEl&&alterEl.value?+alterEl.value:f.alter; f.stammOk=true;
 f.log.push([dstr(0),"Stammdaten im Erstkontakt bestätigt"]);
 renderAll();renderFallakte();
}
```

- [ ] **4.3 — `dArbeitHtml()` vollständig durch die Neufassung ersetzen** (wörtlich aus Spec §8.1; ersetzt die komplette bestehende Funktion inkl. aller fünf Zweige):
```js
function dArbeitHtml(f){
 const typ=drawerAufgabenTyp(f);
 const fakten=fkwFaktenHtml(f);
 if(typ==="kosten")
   return fakten+"<div id='dKZ' class='kz-block'><div class='kicker'>Kostenzusage</div>"+kzChain(f)+kzActions(f)+"</div>"
    +sopChecklisteHtml(f,"kosten")
    +"<div class='full' style='margin-top:12px'><label>Kostenzusage-Dokument</label>"
    +"<button class='btn-ghost btn-sm' type='button' onclick='dArbeitKostenUpload()'>⇪ Dokument hochladen (Demo)</button></div>";
 if(typ==="unterlagen")
   return fakten+"<div class='full'><label>Unterlagen <span id='docCnt' style='color:var(--brass-deep)'></span></label>"
    +"<div class='docs'>"
    +"<label><input type='checkbox' id='u1' "+(f.docs[0]?"checked":"")+" onchange='updateDocCnt()'> Entlassbrief</label>"
    +"<label><input type='checkbox' id='u2' "+(f.docs[1]?"checked":"")+" onchange='updateDocCnt()'> Befunde</label>"
    +"<label><input type='checkbox' id='u3' "+(f.docs[2]?"checked":"")+" onchange='updateDocCnt()'> Versicherungsdaten</label>"
    +"<label><input type='checkbox' id='u4' "+(f.docs[3]?"checked":"")+" onchange='updateDocCnt()'> Kostenzusage</label>"
    +"</div></div><button class='btn-ghost btn-sm' type='button' onclick='dArbeitUnterlagenAnfordern()'>Fehlende anfordern</button>";
 if(typ==="angebot")
   return fakten+sopChecklisteHtml(f,"angebot")+"<div class='komm-block'><label>Antwort senden</label>"
    +"<div class='komm-row'><select id='dReplyKanal'><option>E-Mail</option><option>Telefon (Notiz)</option><option>SMS</option><option>WhatsApp</option></select>"
    +"<button class='btn-brass btn-sm' type='button' onclick='sendReply()'><svg viewBox='0 0 24 24' width='14' height='14' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='5' width='18' height='14' rx='2'/><path d='m3 7 9 6 9-6'/></svg>Antwort senden</button></div>"
    +"<textarea id='dReply' rows='2' placeholder='Antwort an die anfragende Person verfassen … (Demo)'></textarea></div>";
 if(typ==="anreise")
   return fakten+"<div class='kicker'>Anreise-Checkliste</div>"
    +"<label><input type='checkbox'> Zimmer reserviert</label>"
    +"<label><input type='checkbox'> Transport geklärt</label>"
    +"<label><input type='checkbox'> Aufnahmetag bestätigt</label>";
 if(typ==="rueckruf")
   return fakten+fkwStammHtml(f)+fkwOriginalHtml(f)+sopChecklisteHtml(f,"rueckruf")
    +"<div class='full' style='margin-top:12px'><label for='dNotizSofort'>"+escapeHtml(MT_NOTIZ_LABEL.rueckruf)+"</label>"
    +"<div class='kz-notiz-row'><input id='dNotizSofort' placeholder='z. B. Rückruf erledigt'>"
    +"<button class='btn-ghost btn-sm' type='button' onclick='kzNotizAdd()'>Ins Protokoll</button></div></div>";
 return fakten+"<div class='full'><label for='dNotizSofort'>"+escapeHtml(MT_NOTIZ_LABEL[typ]||MT_NOTIZ_LABEL.allgemein)+"</label>"
   +"<div class='kz-notiz-row'><input id='dNotizSofort' placeholder='z. B. Rückruf erledigt'>"
   +"<button class='btn-ghost btn-sm' type='button' onclick='kzNotizAdd()'>Ins Protokoll</button></div></div>";
}
```
  **Kernänderung gegenüber heute:** der rueckruf-Zweig greift jetzt bei **jedem** `typ==="rueckruf"`, nicht mehr nur wenn `f.rueckfragen.length>0` — das behebt das Anna-Muster-Problem (ihr Fall hat kein `rueckfragen`-Feld, bekommt aber jetzt trotzdem Stammdaten-Zeile + Original + SOP-Checkliste). `egRueckfrageToggle()` (unverändert, bleibt direkt nach `dArbeitHtml()` stehen) wird jetzt aus `sopChecklisteHtml()` heraus aufgerufen statt aus dem alten `.egt-rueckfragen`-Markup direkt — die alte `if(typ==="rueckruf"&&f.rueckfragen&&f.rueckfragen.length)`-Zeile und ihr `.egt-rueckfragen`-Markup entfallen ersatzlos (Funktion `egRueckfrageToggle()` selbst bleibt unangetastet stehen, nur ihr alter Aufrufort verschwindet).

- [ ] **4.4** `grep -n "function fkwFaktenHtml\|function fkwOriginalHtml\|function fkwStammHtml\|function fkwStammBestaetigen\|function dArbeitHtml" index.html` ausführen — je 1 Fundstelle; `grep -c "egt-rueckfragen" index.html` ausführen — erwartet **1** Treffer (nur noch die CSS-Regel selbst, kein Erzeuger mehr im JS; CSS-Entfernung folgt in Task 8).

- [ ] **4.5** Standard-Verifikation bei 390px UND 1440px, **ausführlich** (dieser Task ist der riskanteste): Fallakte Anna Muster (id 1) öffnen → `#dArbeit` zeigt Chip-Zeile (`67 J.` · `Schlaganfall` · `PKV` · `Angehörige`), darunter Stammdaten-Zeile mit vorbefüllten Werten „Anna Muster"/„67", darunter zugeklappt „Originalnachricht · Zuweiser direkt" (aufklappen zeigt den vollen Text), darunter 3 SOP-Checkboxen ohne `fkw-tag` (kein `f.rueckfragen` an diesem Fall), darunter das Notiz-Feld. Fallakte Heinz Vogel (id 6, `kosten`-Typ) öffnen → Chip-Zeile + Kostenzusage-Block + 2 SOP-Punkte, kein Original/keine Stammdaten-Zeile (nicht rueckruf-Typ). Fallakte Werner Aumann (id 13, `unterlagen`-Typ) → Chip-Zeile + unverändertes u1–u4-Formular, **keine** SOP-Checkliste (§5: unterlagen bewusst ausgenommen). 0 Console-Errors.

**Sichtprüfung:** Der rueckruf-Zweig des Werkbank-Werkzeugs zeigt jetzt für **jeden** rueckruf-Fall (nicht mehr nur solche mit `f.rueckfragen`) Kernfakten-Chips, eine Stammdaten-Bestätigung, die zugeklappte Originalnachricht und eine Checkliste — exakt das im Spec-Kontext (§1) beschriebene Anna-Muster-Problem ist behoben. Die übrigen vier Werkbank-Typen zeigen zusätzlich die Chip-Zeile, drei davon zusätzlich passende SOP-Punkte, ohne dass ihr bisheriges Kern-Formular sich verändert.

**Commit:** `feat: dArbeitHtml()-Neufassung — Kernfakten-Chips in allen 5 Zweigen, rueckruf-Zweig verlässlich (nicht mehr an f.rueckfragen.length gebunden) mit Stammdaten-Bestätigung + zugeklapptem Original + gemischter SOP-Checkliste, neue Helper fkwFaktenHtml/fkwOriginalHtml/fkwStammHtml/fkwStammBestaetigen (Runde 6 Punkt 2, §8.1/§8.2)`

---

# Task 5 — Kontext-Spalte: neues Kapitel „Originalanfrage"

**Lane:** `claude-implementer-pro` (additive HTML-Struktur + eine bedingte Sichtbarkeits-Zeile in `renderFallakte()`, aber Bedingung ist eine Funktions-Auswertung, kein reines Markup-Einfügen)

**Abhängigkeit:** braucht Task 4 (`fkwOriginalHtml()` muss existieren).

**Bezug:** Spec §8.3, Abnahme #4, #5.

**Dateien/Anker:** `grep -n "class=\"fk-col-kontext\"\|id=\"dArbeit\"\|function renderFallakte" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `.fk-col-kontext`-Öffnung Zeile 4117, erstes Kapitel „Übersicht" direkt danach, `renderFallakte()`s `dArbeit`-Zeile ca. Zeile 6931 (nach Task 4 verschoben).

**Schritte:**

- [ ] **5.1** `grep`-Befehl oben ausführen, exakte Position des „Übersicht"-Kapitels (nach „Werdegang", vor „Medizinische Kurzfelder") in `.fk-col-kontext` bestätigen, sowie die `document.getElementById("dArbeit").innerHTML=dArbeitHtml(f);`-Zeile in `renderFallakte()`.

- [ ] **5.2 — HTML: neues Kapitel additiv einfügen**, direkt nach dem „Übersicht"-Kapitel-Div und vor „Medizinische Kurzfelder" (wörtlich aus Spec §8.3):
```html
<!-- Ist (Ausschnitt): -->
        <div class="chap">
          <h2 class="chap-h2">Übersicht</h2>
          <div id="faUebersicht"></div>
        </div>
        <div class="chap">
          <h2 class="chap-h2">Medizinische Kurzfelder</h2>
<!-- Soll: -->
        <div class="chap">
          <h2 class="chap-h2">Übersicht</h2>
          <div id="faUebersicht"></div>
        </div>
        <div class="chap" id="faOriginalChap" style="display:none">
          <h2 class="chap-h2">Originalanfrage</h2>
          <div id="faOriginal"></div>
        </div>
        <div class="chap">
          <h2 class="chap-h2">Medizinische Kurzfelder</h2>
```

- [ ] **5.3 — `renderFallakte()`: Sichtbarkeits-Wiring einfügen**, direkt nach der bestehenden `dArbeit`-Zeile (wörtlich aus Spec §8.3):
```diff
   document.getElementById("dArbeit").innerHTML=dArbeitHtml(f);
+  const _zeigeOriginalInKontext=f.originalTxt&&drawerAufgabenTyp(f)!=="rueckruf";
+  document.getElementById("faOriginalChap").style.display=_zeigeOriginalInKontext?"":"none";
+  if(_zeigeOriginalInKontext) document.getElementById("faOriginal").innerHTML=fkwOriginalHtml(f);
   updateDocCnt();
```
  Bedingung ist `drawerAufgabenTyp(f)!=="rueckruf"` (nicht ein Status-Name) — deckt sich in der Praxis mit „ab Status Unterlagen", weil `STATUS_AUFGABE`s Text ab „Kontaktiert" nie wieder das rueckruf-Muster matcht (Ausnahme: `pruefeUpsell()` überschreibt `f.aufgabe` auch schon ab „Neu" auf „Komfort-Upgrade anbieten" → dann sofort `allgemein`, Original wandert entsprechend sofort in die Kontext-Spalte — korrektes Verhalten, kein Sonderfall nötig).

- [ ] **5.4** `grep -n "id=\"faOriginalChap\"\|id=\"faOriginal\"\|_zeigeOriginalInKontext" index.html` ausführen — je 1–2 Fundstellen (HTML-Div + JS-Nutzung).
- [ ] **5.5** Standard-Verifikation bei 390px UND 1440px: Maria Probst (id 3, Typ „angebot") öffnen → Werkbank zeigt Chip-Zeile + 2 SOP-Punkte + Antwort-Formular, **kein** Original inline; Kontext-Spalte zeigt neues Kapitel „Originalanfrage" direkt unter „Übersicht", zugeklappt, mit Original-Text beim Aufklappen. Ruth Winkler (id 9, Typ „anreise") analog, Checkliste dabei unverändert (3 alte Punkte, keine SOP — `anreise` ist in `SOP_CHECKLISTE` nicht gelistet). Heinz Vogel (id 6, kein `originalTxt`) öffnen → `#faOriginalChap` bleibt `display:none`, keine leere Chip-Zeile im Werkbank-Kopf (da `fallFakten()` für ihn dennoch Diagnose/KT/Absender aus seinen Fall-Feldern liefern kann — das ist gewollt, nur das *Original*-Kapitel bleibt versteckt). Anna Muster (id 1, Typ „rueckruf") öffnen → `#faOriginalChap` bleibt `display:none` (Original steckt inline im Werkbank-Werkzeug, nicht doppelt in der Kontext-Spalte). 0 Console-Errors.

**Sichtprüfung:** Für jeden Fall mit `originalTxt`, dessen aktueller Werkbank-Typ **nicht** „rueckruf" ist, erscheint die Originalnachricht jetzt als eigenes, zugeklapptes Kapitel in der Kontext-Spalte statt gar nicht angezeigt zu werden. Rueckruf-Fälle zeigen das Original weiterhin nur inline im Werkzeug (keine Dopplung).

**Commit:** `feat: Kontext-Spalten-Kapitel "Originalanfrage" — Originalnachricht sichtbar ab Werkbank-Typ ungleich rueckruf, kein Doppel-Original (Runde 6 Punkt 2, §8.3)`

---

# Task 6 — `uebernehmen()`-Diff + beide Alter-Guards (atomar)

**Lane:** `claude-implementer-pro` (Namenskonstruktion mit Fallback-Kette aus `fallFakten()`-Chips + zwei eng verwandte, aber an unterschiedlichen Stellen liegende Guard-Fixes — laut Spec/Review zwingend gemeinsam zu committen)

**Abhängigkeit:** braucht Task 2 (`fallFakten()`).

**Warum atomar:** siehe „Zuschnitts-Begründung" oben (Review-Vorgabe).

**Bezug:** Spec §6, §6.1 (inkl. Review-Fund zweite Fundstelle `makeBoardCol`), Abnahme #6, #7.

**Dateien/Anker:** `grep -n "function uebernehmen\|getElementById(\"faName\")\|function makeBoardCol" index.html` vor Bearbeitung ausführen und **alle** Zeilenangaben neu bestätigen. Bei Plan-Erstellung: `uebernehmen()` Zeile 4907–4923, `#faName`-Zeile in `renderFallakte()` Zeile 6915 (nach Task 4/5 verschoben, neu prüfen), `makeBoardCol()`s Namen+Alter-Zeile Zeile 4984.

**Schritte:**

- [ ] **6.1** `grep`-Befehl oben ausführen, alle drei Fundstellen einzeln bestätigen und im Editor öffnen.

- [ ] **6.2 — `uebernehmen()`-Diff anwenden** (wörtlich aus Spec §6; additiv nur `name`/`alter`-Zeile geändert + drei neue Felder, alles andere in der Funktion bleibt exakt wie es aus Punkt 1 steht):
```diff
   const _log=[[dstr(0),"Aus Eingang übernommen ("+m.kanal+"): "+m.tit+" — zugewiesen an "+owner]];
   if(m.hinweis)_log.push([dstr(0),"[Hinweis bei Zuordnung] "+m.hinweis]);
-  faelle.push({id:fid,name:"Neuer Fall (aus Eingang)",alter:null,rolle:"offen",kanal:m.kanal,quelle:m.tit.split(":")[1]?m.tit.split(":")[1].trim():m.kanal,
+  const _fk=fallFakten(m);
+  const _alterC=_fk.find(c=>c.typ==="alter"), _diagC=_fk.find(c=>c.typ==="diagnose");
+  const _name=(m.patient&&m.patient.name)
+    ||(_alterC?("Patient/Patientin ("+_alterC.raw+")"+(_diagC?" · "+_diagC.text:"")):null)
+    ||"Neuer Fall (aus Eingang)";
+  faelle.push({id:fid,name:_name,alter:(m.patient&&m.patient.alter!=null)?m.patient.alter:null,rolle:"offen",kanal:m.kanal,quelle:m.tit.split(":")[1]?m.tit.split(":")[1].trim():m.kanal,
     achse:m.achse,kt:"Unklar",status:"Neu",owner:owner,aufgabe:STATUS_AUFGABE["Neu"],frist:dstr(0),
     saluto:m.saluto===true,zuordnungsHinweis:m.hinweis||"",
     sterne:m.sterne!=null?m.sterne:sterneAusSignal(erkenneSignale(m.txt)),
     rueckfragen:egVollstaendigkeit(m).filter(c=>!c.ok).map(c=>({frage:c.frage,done:false})),
+    originalTxt:m.txt,originalKanal:m.kanal,originalZeit:m.zeit,
     docs:[false,false,false,false],kosten:"offen",consent:"offen",verlust:"",reaktion:null,
     log:_log});
```
  `f.rolle` bleibt `"offen"` (unverändert, außerhalb des Zuschnitts dieser Spec — `fallAbsenderTyp()` kompensiert das über den `wer`/Text-Fallback, s. Task 2).

- [ ] **6.3 — Guard 1: `renderFallakte()`s `#faName`-Zeile** (verhindert doppeltes Alter, wenn der Name selbst schon eine „(Zahl)"-Klammer enthält):
```diff
-  document.getElementById("faName").textContent=f.name+(f.alter?" ("+f.alter+")":"");
+  document.getElementById("faName").textContent=f.name+(f.alter&&!/\(\d+\)/.test(f.name)?" ("+f.alter+")":"");
```
  Wirkt nur, wenn der Name bereits ein „(Zahl)"-Muster enthält; alle 8 bestehenden Namen wie „Anna Muster" enthalten so ein Muster nie, ihr Verhalten ändert sich also nicht.

- [ ] **6.4 — Guard 2 (Review-Fund): `makeBoardCol()`s Karten-Zeile**, dieselbe Guard-Bedingung:
```diff
-      +"<div class='krow'><span class='ava'>"+initialen(x.name)+"</span><span class='name'>"+escapeHtml(x.name)+" <span class='alter'>"+(x.alter?"("+x.alter+")":"")+"</span></span></div>"
+      +"<div class='krow'><span class='ava'>"+initialen(x.name)+"</span><span class='name'>"+escapeHtml(x.name)+" <span class='alter'>"+(x.alter&&!/\(\d+\)/.test(x.name)?"("+x.alter+")":"")+"</span></span></div>"
```
  Ohne diesen Fix zeigt das Board für übernommene Fälle mit konstruiertem Namen (ids 101/103 nach Übernahme) „Patient/Patientin (72) · Innere (72)".

- [ ] **6.5** `grep -n "const _fk=fallFakten(m)\|!/\\(\\\\d\\+\\)/.test(f.name)\|!/\\(\\\\d\\+\\)/.test(x.name)" index.html` ausführen — je 1 Fundstelle (Namenskonstruktion, `#faName`-Guard, `makeBoardCol`-Guard).
- [ ] **6.6** Standard-Verifikation bei 390px UND 1440px: id 101 (Gruppe „Neuro-Geri" oder je nach Ist-Stand der Gruppen aus Punkt 1) über den Koordinations-Pool übernehmen → Fallakte-Kopf zeigt „Patient/Patientin (72) · Innere" (nicht „Neuer Fall (aus Eingang)", nicht „… (72) · Innere (72)"); Board zeigt dieselbe Karte ebenso ohne Doppel-Alter. Anna Muster (id 1, unverändert bestehender Name ohne Klammer-Muster) bleibt exakt „Anna Muster (67)" in Fallakte-Kopf und Board. 0 Console-Errors.

**Sichtprüfung:** Übernommene Fälle aus dem Eingang tragen jetzt einen sprechenden, aus den Kernfakten konstruierten Namen statt der generischen Platzhalter-Bezeichnung; weder Fallakte-Kopf noch Board-Karte zeigen dabei ein doppeltes Alter. Bestandsfälle mit klassischen Namen sind exakt unverändert.

**Commit:** `feat: uebernehmen() konstruiert sprechenden Fallnamen aus fallFakten(), Alter-Guard gegen Doppel-Anzeige in #faName UND makeBoardCol (Runde 6 Punkt 2, §6/§6.1)`

---

# Task 7 — `advanceFallStatus()`-Diff: SOP-Log vor Statuswechsel

**Lane:** `claude-implementer-pro` (kleiner, aber semantisch wichtiger Diff — Reihenfolge der Log-Einträge und korrekter `sopDone`-Key-Zeitpunkt sind entscheidend)

**Abhängigkeit:** braucht Task 1 (`SOP_CHECKLISTE`) und Task 3 (`f.sopDone`-Schreibsemantik, damit der Log-Eintrag überhaupt etwas findet).

**Bezug:** Spec §8.4, Abnahme #2.

**Dateien/Anker:** `grep -n "function advanceFallStatus" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: ca. Zeile 6390 (nach Task 1–6 verschoben, neu prüfen).

**Schritte:**

- [ ] **7.1** `grep`-Befehl oben ausführen, aktuellen Funktionskörper neu lesen.

- [ ] **7.2 — `advanceFallStatus()`-Diff anwenden** (wörtlich aus Spec §8.4):
```diff
 function advanceFallStatus(f){
  const cur=STATUS.indexOf(f.status); if(cur<0||cur>=5)return false;
+  const _typ=drawerAufgabenTyp(f);
+  const _items=SOP_CHECKLISTE[_typ];
+  if(_items){
+    const _erledigt=_items.filter((label,i)=>f.sopDone&&f.sopDone[_typ+":"+f.status+":"+i]);
+    if(_erledigt.length) f.log.push([dstr(0),"Erledigt: "+_erledigt.join(" · ")]);
+  }
  const ns=STATUS[cur+1]; f.log.push([dstr(0),"Aufgabe erledigt · Status: "+f.status+" → "+ns]);
  if(f.personId)pHist(f.personId,ns==="Aufgenommen"?"aufnahme":"fall","Status: "+f.status+" → "+ns);
  qualifyIfNeeded(f,ns);
  if(f.schritte&&f.schritte[cur]) f.schritte[cur].done=true;
  f.status=ns;
  f.aufgabe=STATUS_AUFGABE[ns]||"";
  f.frist=STATUS_AUFGABE[ns]?dstr(2):"";
  return true;
 }
```
  Der neue Log-Eintrag entsteht **vor** dem Status-Wechsel-Eintrag (liest sich chronologisch: erst die Punkte, dann der Sprung), nutzt `f.status` (noch der alte Wert an dieser Stelle) für den `sopDone`-Key — identisch zu dem, was beim Rendern der Checkliste verwendet wurde.

- [ ] **7.3** `grep -n "const _typ=drawerAufgabenTyp(f)\|const _items=SOP_CHECKLISTE" index.html` ausführen — je 1 Fundstelle.
- [ ] **7.4** Standard-Verifikation bei 390px UND 1440px: Anna Muster (id 1, rueckruf, Status „Neu") öffnen → 2 von 3 SOP-Punkten anhaken → „nächster Schritt" klicken → `f.status` wird „Kontaktiert", `f.log` bekommt einen neuen Eintrag „Erledigt: …" mit genau den 2 angehakten Labels, **vor** dem „Status: Neu → Kontaktiert"-Eintrag (im Verlauf oben chronologisch geprüft). Fallakte neu geöffnet: die alten Häkchen bleiben am `f.sopDone`-Objekt bestehen (anderer Key `rueckruf:Kontaktiert:N`), erscheinen aber nicht mehr angehakt (neue Aufgabe „Kontaktiert" ist Typ `allgemein`, kein `SOP_CHECKLISTE`-Eintrag für diesen Typ). 0 Console-Errors.

**Sichtprüfung:** Beim Fortschritt in den nächsten Status werden erledigte SOP-Punkte automatisch protokolliert, chronologisch vor dem Status-Sprung selbst; nicht (mehr) relevante Checklisten verschwinden korrekt, ohne die zugrundeliegenden Häkchen-Daten zu löschen.

**Commit:** `feat: advanceFallStatus() protokolliert erledigte SOP-Punkte vor dem Status-Sprung (Runde 6 Punkt 2, §8.4)`

---

# Task 8 — Aufräum-Sweep + Abnahme-Sweep

**Lane:** `claude-implementer-pro` (Verifikations-lastiger Abschluss-Task; falls dabei ein kleiner Fund auftaucht, direkt hier fixen, kein neuer Task nötig — bei größeren Funden: stoppen, im Report melden statt selbst zu improvisieren)

**Abhängigkeit:** braucht alle vorherigen Tasks (1–7).

**Bezug:** Spec §9 (Abnahmekriterien, vollständig), §10 (obsolete CSS).

**Dateien/Anker:** `grep -n "\.egt-rueckfragen{" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: Zeile 3146 (Kommentar+Regel Zeile 3144–3146, direkt vor `</style>` Zeile 3147).

**Schritte:**

- [ ] **8.1** `grep`-Befehl oben ausführen, Fundstelle bestätigen — nach Task 4 ist dies **ausschließlich** noch eine CSS-Selektor-Definition (kein Erzeuger mehr im JS, der wurde bereits in Task 4 entfernt).

- [ ] **8.2 — Löschen: `.egt-rueckfragen`-CSS-Block** (Spec §10 — durch diese Spec vollständig unbenutzt, ersetzt durch `.fkw-check`):
```diff
-/* Runde 6 Punkt 1 (§7.9): .egt-rueckfragen — abhakbare Rückfragen-Liste im Werkbank-Typ "rueckruf",
-   Checkbox-Styling erbt bereits von der globalen #dArbeit-label/input-Regel. */
-.egt-rueckfragen{display:flex;flex-direction:column;gap:8px;margin-bottom:4px}
```
  (Keine JS-Funktion wird obsolet — `egRueckfrageToggle()` bleibt aktiv genutzt, jetzt aus `sopChecklisteHtml()` heraus aufgerufen, s. Task 3/4.)

- [ ] **8.3** `grep -n "egt-rueckfragen" index.html` erneut ausführen — **kein** Treffer mehr im gesamten Dokument.
- [ ] **8.4** `grep -c "function " index.html` gegen den Stand vor Task 1 vergleichen (Notiz: netto **+9** neue Funktionen aus dieser Runde — `fallAbsenderTyp`, `fallFakten`, `sopChecklisteHtml`, `sopToggle`, `fkwFaktenHtml`, `fkwOriginalHtml`, `fkwStammHtml`, `fkwStammBestaetigen` — plus `dArbeitHtml`/`advanceFallStatus`/`uebernehmen`/`renderFallakte`/`makeBoardCol` bleiben namensgleich bestehen, keine Netto-Änderung durch sie).
- [ ] **8.5** `grep -c "@keyframes" index.html` ausführen — weiterhin genau **9**.

- [ ] **8.6 — Gesamt-Boot-Check, alle 10 Abnahmekriterien der Spec (§9) im Browser (idealerweise per CDP/Browser-Tool) durchspielen, bei 390px UND 1440px:**
  1. **Anna-Muster-Szenario (Pflicht):** `mtEnter()` (Rollen-Schalter → Koordination) → „Was jetzt dran ist" → Rückruf-Aufgabe anklicken → öffnet `openFallakte(1)`. `#dArbeit` zeigt: Chip-Zeile `67 J.` · `Schlaganfall` · `PKV` · `Angehörige`; „Stammdaten bestätigen"-Zeile (Name/Alter vorbefüllt); zugeklappt „Originalnachricht · Zuweiser direkt" (aufklappen zeigt `originalTxt`); 3 SOP-Checkboxen ohne „aus der Anfrage"-Tags (kein `f.rueckfragen` an diesem Fall).
  2. SOP-Persistenz + Log: 2 von 3 SOP-Punkten anhaken → „nächster Schritt" → `f.status` „Kontaktiert", `f.log` „Erledigt: …" mit genau den 2 Labels **vor** der Status-Zeile.
  3. Stammdaten-Bestätigung: Name auf „Anna Musterhausen" ändern, „Bestätigen" → `#faName` sofort „Anna Musterhausen (67)"; Zeile verschwindet; Log „Stammdaten im Erstkontakt bestätigt"; Board zeigt neuen Namen ebenso.
  4. Originalanfrage in Kontext-Spalte: Maria Probst (id 3, „angebot") → kein Original inline, Kontext-Spalte zeigt „Originalanfrage" unter „Übersicht". Ruth Winkler (id 9, „anreise") analog, Checkliste unverändert (3 alte Punkte).
  5. Kein Original ohne Originaltext: Heinz Vogel (id 6) → kein Original-Block irgendwo, `#faOriginalChap` bleibt `display:none`, keine leere Chip-Zeile.
  6. Sprechender Name aus dem Eingang: eine Entscheidungsfall-Anfrage (z. B. id 101) freigeben und im Pool übernehmen → Fallakte-Kopf „Patient/Patientin (72) · Innere" statt „Neuer Fall (aus Eingang)"; Checkliste zeigt die aus Punkt 1 übernommenen Rückfragen zuerst (getaggt), danach die 3 SOP-Punkte.
  7. Kein Doppel-Alter im Kopf: Fall aus Punkt 6 zeigt genau „Patient/Patientin (72) · Innere", nicht „… (72) · Innere (72)"; Anna Muster bleibt unverändert „Anna Muster (67)"; Board-Karte ebenso ohne Doppel-Alter.
  8. Mobile (390px): 1–7 wiederholt — Chip-Zeile umbricht, Stammdaten-Zeile stapelt, kein horizontaler Überlauf, Checkboxen bedienbar.
  9. 0 Console-Errors, beide Breiten.
  10. Unberührte Bereiche: `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `#refOverlay`, `renderTeam()`, `.egt-sterne`/`.egt-check`/`.egt-groups`/`.egt-verteilt` aus Punkt 1 unverändert; genau 9 `@keyframes` (bereits in 8.5 geprüft); `.egt-rueckfragen` vollständig entfernt (bereits in 8.3 geprüft).

**Sichtprüfung:** Kein CSS-Orphan aus dem alten rueckruf-exklusiven Rückfragen-Markup mehr im Dokument; alle 10 Abnahmekriterien der Spec sind im Browser bei beiden Breiten grün; die Cofounder-Bereiche, `renderTeam()` und die Punkt-1-Bausteine sind unangetastet.

**Commit:** `chore: .egt-rueckfragen-CSS entfernt (durch .fkw-check ersetzt), Gesamt-Boot-Check aller 10 Abnahmekriterien grün (Runde 6 Punkt 2, §9/§10)`

---

## Reihenfolge / Abhängigkeiten

```
Task 1 (Datengrundlage: SOP_CHECKLISTE, Seeds, CSS) ── unabhängig, rein additiv
      │
      ▼
Task 2 (fallFakten()/fallAbsenderTyp(), Node-verifiziert) ── braucht Task 1 nur für die
      │                                                       Verifikationstabelle
      ▼
Task 3 (sopChecklisteHtml()/sopToggle()) ── braucht SOP_CHECKLISTE (1)
      │
      ▼
Task 4 (dArbeitHtml()-Neufassung + .fkw-*-Helper, ATOMAR) ── braucht fallFakten() (2) +
      │                                                       sopChecklisteHtml() (3)
      ▼
Task 5 (Kontext-Spalten-Kapitel "Originalanfrage") ── braucht fkwOriginalHtml() (4)
      │
      ▼
Task 6 (uebernehmen()-Diff + beide Alter-Guards, ATOMAR) ── braucht fallFakten() (2)
      │
      ▼
Task 7 (advanceFallStatus()-Diff) ── braucht SOP_CHECKLISTE (1) + f.sopDone-Semantik (3)
      │
      ▼
Task 8 (Aufräum-Sweep + Gesamt-Abnahme)
```

Sequentiell in dieser Reihenfolge ausführen (eine Datei, nie parallel). Task 1–3 sind additiv und bootbar, ohne dass eine bestehende Funktion die neuen Bausteine liest. Task 4 ist der einzige Bruchpunkt (Erstverdrahtung von `fallFakten()`/`sopChecklisteHtml()` in die UI) und deshalb bewusst atomar. Task 5–7 bauen auf einem bereits vollständig funktionsfähigen `dArbeitHtml()` auf. Task 6 ist zusätzlich intern atomar (Namenskonstruktion + beide Guards). Task 8 schließt mit dem CSS-Aufräumen und der vollständigen Abnahme ab.

---

## Nicht-Ziele dieser Runde (aus Spec §11, hier zur Erinnerung)

- Keine vorbefüllten Antwort-Entwürfe (Textarea bleibt leer wie bisher).
- Keine automatische Eskalation/Fristen-Automatik über `pruefeUpsell()`/`STATUS_AUFGABE` hinaus.
- Kein „Punkt-8-Vollausbau" (weiterer Koordinations-/Fallakten-Ausbau bleibt einer künftigen Spec vorbehalten).
- Team-Statistiken (Punkt 3, `renderTeam()`) unberührt.
- `f.rolle:"offen"` bei `uebernehmen()`-erzeugten Fällen wird **nicht** korrigiert — außerhalb des Zuschnitts dieser Spec, `fallAbsenderTyp()` kompensiert deterministisch über `wer`/Text.
- Keine neuen Keyframes, keine neuen Datenarray-Felder außer den in Spec §3 explizit gelisteten, `escapeHtml` für alle dynamischen Inhalte, kein `Math.random`, 390px und 1440px verifizieren, 0 Console-Errors.
