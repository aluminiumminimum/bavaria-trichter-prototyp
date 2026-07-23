# Runde 6, Punkt 3 — Team-Führungs-Cockpit

**Bezug:** Sechste Runde, Nutzer-Feedback-Punkt 3. Baut auf Punkt 1
([2026-07-23-runde6-punkt1-anfrage-triage-design.md](./2026-07-23-runde6-punkt1-anfrage-triage-design.md):
`GRUPPEN`/`achseZuGruppe()`/`egVollstaendigkeit()`) und Punkt 2
([2026-07-23-runde6-punkt2-schritt-werkzeuge-design.md](./2026-07-23-runde6-punkt2-schritt-werkzeuge-design.md):
`fallFakten()`/`f.sopDone`) auf, beide bereits umgesetzt (main, live). Ersetzt die aktuelle `renderTeam()`
komplett.

**Leitplanken (aus [../../../CLAUDE.md](../../../CLAUDE.md)):** `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*` +
`#refOverlay` tabu; Arrays/Objekte nur additiv; exakt 9 `@keyframes` (bestätigt, `grep -c "@keyframes"
index.html` = 9, diese Spec fügt keine neue Animation hinzu — Trendlinien sind statische SVG-Polylines,
kein Keyframe); Jade-Apotheke-Identität, Etiketten-Doppelrahmen (`.card`); Cormorant-Numerale;
`escapeHtml()` um alle dynamischen Texte; kein `Math.random`; 390px + 1440px, 0 Console-Errors; nur
synthetische Daten.

> **Review-Fixes eingearbeitet** (verbindliche Entscheidungen): §4.3 zeitstabile Überfällig-Definition
> (Begleit-Fix an `fristKlasse()`/`fristText()`/`kennzahlen().ueberf`) · §4.4 Heinz-Vogel-Seed-Justierung
> (`frist:dstr(-2)`) statt leerer Demo-Liste · §6.2 Zählmodell-Fix (Mitarbeiter-Zeilen lesen den
> globalen, nicht den panel-lokalen Fall-Datensatz) · §6.3 Sortier-Fix (leere Fristen ans Ende) +
> ein beim Umsetzen selbst gefundener Folgefehler in derselben Funktion (neue `tcFallZeile()` statt
> `tcAttnZeile()` für nicht-überfällige Fälle im Personenfilter, s. §6.3). Alle Zahlen in §4/§6/§7 unten
> sind bereits die korrigierten.

---

## 1. Problem

Nutzer-Feedback wörtlich: „Teamstatistiken dünn und schlecht, gleiche Informationen mehrmals dargestellt,
schlechte Optik, entspricht nicht einem Premium-CRM." Konkret in der aktuellen `renderTeam()`
([index.html:5806-5834](../../../index.html#L5806)):

1. **Deko-Foto ohne Informationswert** — `<figure class="au-photo au-photo--sage">…Das Team · Klinik
   Bavaria…</figure>` ([index.html:3770](../../../index.html#L3770)), reine Bebilderung vor einem
   Zahlen-Dashboard.
2. **`.tm-intake`-Banner nach totem Modell** — `eingangOffen=eingang.filter(m=>!m.done&&m.typ!=="passiv").length`
   ([index.html:5810](../../../index.html#L5810)) zählt „wartet auf Zuordnung", obwohl seit Punkt 1
   die meisten Anfragen automatisch verteilt sind oder bereits im Gruppen-Pool liegen — die Zahl
   suggeriert Rückstand, der so nicht existiert (von Punkt 1, §4, selbst als bekannt-veraltet vermerkt).
3. **Redundanz:** `.ts-kpis` (Offene Fälle gesamt/Heute fällig/Überfällig/Ø pro Kopf,
   [index.html:5783-5788](../../../index.html#L5783)) und `.tm-cards` (dieselben Fälle/Aufgaben nochmal
   pro Mitarbeiter, [index.html:5811-5819](../../../index.html#L5811)) und `.tm-list` (dieselben Fälle
   ein drittes Mal als Zeilen, [index.html:5820-5827](../../../index.html#L5820)) zeigen dieselben
   9 offenen Fälle in drei verschiedenen Aggregationen ohne erkennbaren Mehrwert je Ebene.
4. **Keine Historie/Trend**, keine Sortierung nach Dringlichkeit, keine Team-Struktur (`GRUPPEN` aus
   Punkt 1 existiert, wird hier nicht genutzt — die zwei Belegungs-Teams Orthopädie/Neuro-Geri sind
   in der Team-Ansicht unsichtbar).

Nutzer hat das **Führungs-Cockpit** aus den vorgeschlagenen Optionen ausgewählt.

---

## 2. Zielbild

Von oben nach unten, neuer Namespace `.tc-*`:

1. **KPI-Zeile** (4 Etiketten-Karten): Aufnahmen (7 Tage) · Conversion Anfrage→Aufnahme · Ø
   Reaktionszeit bis Erstkontakt · Überfällige Aufgaben — je Karte große Cormorant-Zahl, Label,
   statische 7-Punkte-Trendlinie (Inline-SVG), Delta-Pfeil vs. vor 7 Tagen.
2. **Zwei Team-Panels** (Orthopädie / Neuro-Geri, aus `GRUPPEN`) + ein drittes schmales Panel
   „Direkt / Premium" für gruppenlose Fälle (SalutoCare/Unklar) — je Panel eine Mini-Pipeline
   (6 Status-Stufen als Segmentleiste) und Mitarbeiter-Zeilen mit Last-Balken, Überfällig-Marker,
   „diese Woche erledigt".
3. **„Braucht Aufmerksamkeit"-Liste** — alle echt überfälligen Fälle, sortiert nach Tagen überfällig,
   Klick → Fallakte. Ruhige Leerzustands-Zeile, falls keiner überfällig ist (Code-Pfad bleibt erhalten,
   §7 Abnahme 6 — der Demo-Startzustand selbst zeigt nach §4.4 genau 1 Zeile).

Jede Zahl kommt entweder live aus `faelle[]`/`eingang[]` oder ist explizit als Demo-Seed-Zeitreihe
gekennzeichnet — nirgends zeigt dieselbe Kennzahl zweimal dieselbe Aggregation.

---

## 3. Was entfällt

**HTML** ([index.html:3768-3772](../../../index.html#L3768)):
```diff
 <div class="sub" id="sub-faelle-team">
   <p class="lblline">Alle Anfragen aus allen Kanälen — an einem Ort gebündelt, klar zugeteilt, zügig beantwortet.</p>
-  <figure class="au-photo au-photo--sage"><img src="assets/kb-haus.webp" alt="" loading="lazy"><figcaption>Das Team · Klinik Bavaria</figcaption></figure>
   <div id="teamGrid"></div>
 </div>
```
(`<p class="lblline">` bleibt — ist Eingangstext der Sub-Tab, nicht Teil der Cockpit-Bausteine.)

**JS** — komplett ersetzt: `teamCockpitHtml()` ([index.html:5779-5805](../../../index.html#L5779)),
`renderTeam()` ([index.html:5806-5834](../../../index.html#L5806)), `teamFilter`/`setTeamFilter()`
([index.html:5777-5778](../../../index.html#L5777), Zustand wird unter neuem Namen weitergeführt, §6.3
— nicht ersatzlos entfernt, siehe dort).

### 3.1 Aufräumliste — Waisen-CSS nach dieser Spec

**Vollständig verwaiste, löschbare Regeln** (kein Verwender außerhalb der entfernten `renderTeam()`):

| Regel(n) | Zeilen |
|---|---|
| `.tm-intake`, `.tm-intake .num` (3 Fundstellen: Basis + 2 Ergänzungen) | [1243-1244](../../../index.html#L1243), [1814](../../../index.html#L1814), [2483-2484](../../../index.html#L2483) |
| `.tm-cards` + Media-Query | [1245-1246](../../../index.html#L1245) |
| `.tm-card` (Basis, `:hover`, `.on`) + 2 Ergänzungen | [1247-1249](../../../index.html#L1247), [1812-1813](../../../index.html#L1812), [2481-2482](../../../index.html#L2481) |
| `.tm-h`, `.tm-h .ava`, `.tm-n` | [1250-1252](../../../index.html#L1250) |
| `.tm-kpis`, `.tm-kpis .num` | [1253-1254](../../../index.html#L1253) |
| `.tm-fr` (+ Mono-Ergänzung) | [1255](../../../index.html#L1255), [1815](../../../index.html#L1815) |
| `.tm-listhead`, `.tm-clear` | [1256-1257](../../../index.html#L1256) |
| `.tm-task`, `:first-child`, `:hover`, `.ava.sm` | [1259-1262](../../../index.html#L1259) |
| `.tm-tmain`, `.tm-tt`, `.tm-ach`, `.tm-ts` | [1263-1266](../../../index.html#L1263) |
| `.tm-meta` (+ Mono-Ergänzung), `.tm-owner`, `.tm-status` | [1267-1268](../../../index.html#L1267), [1816](../../../index.html#L1816), [1269](../../../index.html#L1269) |
| `#sub-faelle-team>.au-photo` + `img`/`::after`/`figcaption` (dediziert, Basis-`.au-photo` bleibt — anderswo genutzt) | [2485-2490](../../../index.html#L2485) |
| **Alle `.ts-*`** (Team-Cockpit-Namespace aus Punkt „Task 2.1", ausschließlich von `teamCockpitHtml()` genutzt) | [3063-3080](../../../index.html#L3063) |

**Teil-Waisen — nur Token aus geteilter Selector-Liste entfernen, Regel bleibt** (andere Selektoren
in derselben Regel sind weiterhin aktiv, z. B. `.radar-kpi`/`.db-cockpit`/`.ir-card`/`.card`):

| Zeile | Vorher | Nachher |
|---|---|---|
| [1926](../../../index.html#L1926) | `.card,.tm-card,.tm-list,.radar-kpi,.db-cockpit,.ir-card{` | `.card,.radar-kpi,.db-cockpit,.ir-card{` |
| [1940](../../../index.html#L1940) | `.tm-card,.tm-list,.radar-card,.ir-card{position:relative}` | `.radar-card,.ir-card{position:relative}` |

`.tm-list` selbst (dedizierte Regel [1258](../../../index.html#L1258)) gehört ebenfalls zur
vollständig-verwaisten Liste oben (in der Tabelle als eigene Zeile ergänzen: `.tm-list` → Zeile 1258).
Kommentar-Fundstellen ohne Coderelevanz (Doku-Text, keine Regel): [1691](../../../index.html#L1691),
[7148](../../../index.html#L7148) — optional bei Gelegenheit aktualisieren, keine harte Anforderung
dieser Spec.

**Nicht entfernt:** `.card`-Basis ([1926-1928](../../../index.html#L1926)), `.chap`/`.kicker`/`.chap-h2`/
`.empty` (app-weit geteilt), `.au-photo`-Basis (anderswo aktiv genutzt, nur die `#sub-faelle-team`-Variante
entfällt).

---

## 4. Datenmodell/Ableitungen

### 4.1 Live vs. Seed — Grundsatzentscheidung

**Keine neuen Felder an `faelle[]`/`eingang[]` nötig für die 4 KPI-„Jetzt"-Werte.** Geprüft gegen den
Brief-Vorschlag, additiv `f.eingegangen`/`f.erstkontakt` einzuführen: `f.reaktion` (bestehendes Feld,
Stunden, [index.html:4264-4273](../../../index.html#L4264)) deckt „Reaktionszeit bis Erstkontakt" bereits
exakt ab und wird bereits identisch dafür in `kennzahlen()` verwendet
([index.html:5648-5649](../../../index.html#L5648)) — zwei parallele Datenquellen für denselben Fakt
wären eine Redundanz, die diese Spec gerade beheben soll (Wiederverwenden statt duplizieren,
`CLAUDE.md`). Neue Datumsfelder entfallen ersatzlos gegenüber dem ursprünglichen Auftrag.

### 4.2 Live-Formeln, durchgerechnet gegen die aktuellen Seeds (`faelle[]`, 9 Einträge, Werte nach §4.3/§4.4)

| # | KPI | Formel | Ergebnis |
|---|---|---|---|
| 1 | Aufnahmen (7 Tage) | `faelle.filter(f=>f.status==="Aufgenommen"&&f.log.some(([d,t])=>d>=dstr(-7)&&/aufgenommen/i.test(t))).length` — **neue** kleine Funktion `tcAufnahmen7T()`, da `kennzahlen().auf` alle Aufnahmen seit je zählt, nicht nur die letzten 7 Tage | id10 (log-Zeile `dstr(-2)`,„Aufgenommen — Privatzimmer") + id11 (`dstr(-3)`,„Aufgenommen") → **2** |
| 2 | Conversion | reuse `kennzahlen().conv` (bereits `auf/(auf+verl)*100` gerundet, [index.html:5647](../../../index.html#L5647)) | auf=2, verl=1 (id12) → round(2/3·100) = **67 %** |
| 3 | Ø Reaktionszeit | reuse `kennzahlen().rzAvg` ([index.html:5648-5649](../../../index.html#L5648)) | Werte `[3,1,6,2,26,4,8,5]` (id1 `reaktion:null` ausgeschlossen) → 55/8 = 6,875 → round = **7 Std.** |
| 4 | Überfällige Aufgaben | reuse `kennzahlen().ueberf` — **jetzt zeitstabil** dank Begleit-Fix §4.3, exakt dieselbe Definition wie die neue Kennzahl selbst gebraucht hätte: `offen.filter(x=>x.frist&&x.frist<dstr(0)).length` | offene Fälle mit Frist: id1(`dstr(0)`, **nicht** `<dstr(0)`), id3(`dstr(2)`), id6(`dstr(-2)`, **Treffer** — Review-Seed-Justierung §4.4), id8(`dstr(1)`), id9(`dstr(2)`) → **1** |

### 4.3 Begleit-Fix (Review-Finding 1, verbindlich): zeitstabile Überfällig-Definition an 2 bestehenden Code-Stellen

**Der Bug:** `fristKlasse()`/`fristText()` ([index.html:4757-4758](../../../index.html#L4757)) und
`kennzahlen().ueberf` ([index.html:5650](../../../index.html#L5650)) vergleichen bisher
`new Date(f.frist)<heute` — ein reiner Datumsstring wird als Mitternacht UTC geparst, `heute` ist aber
der **beim Laden eingefrorene** Zeitpunkt inklusive Uhrzeit (`const heute=new Date();`,
[index.html:4258](../../../index.html#L4258)). Eine Frist auf „heute" (`dstr(0)`) gilt nach dieser Formel
**den ganzen restlichen Tag über als bereits überfällig**, sobald Mitternacht UTC vorbei ist — der
Bug sitzt im Instant-Vergleich gegen das eingefrorene `heute`, nicht in `dstr()` selbst. Ohne Fix hätte
das Cockpit z. B. nachmittags „0 überfällig" gezeigt (bei Tages-gerundeter Formel), während dieselbe
Fallakte (Anna Muster, id1, `frist:dstr(0)`) „überfällig (1 T)" schreit — ein Demo-Killer bei
widersprüchlichen Zahlen auf derselben Bühne.

**Der Fix:** Kalendertag-Stringvergleich statt Instant-Vergleich — `f.frist` und `dstr(0)` sind beides
reine `"YYYY-MM-DD"`-Strings, lexikographisch identisch zur Datums-Ordnung, **ohne** Uhrzeit-Komponente:

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

Nur die Grenze überfällig/heute wechselt auf Stringvergleich; der Zukunfts-Zweig (`fristText()`s
„in X T", `fristKlasse()`s `warn`/`ok`-Split ab morgen) behält die bestehende Rundung gegen `heute` —
dort verschiebt sich keine Tag-Grenze fälschlich, nur eine grobe „wie bald"-Einordnung (kein Fixbedarf
laut Review, ausdrücklich erlaubt: „relative „in X T"-Texte dürfen die Rundung behalten").

`aufgabenHeroHtml()`s Überfällig-Darstellung ([index.html:6258-6264](../../../index.html#L6258)) hat
**keinen eigenen** Datumsvergleich — sie ruft ausschließlich `fristKlasse(f.frist)`/`fristText(f.frist)`
auf ([index.html:6259](../../../index.html#L6259)) und wird durch den obigen Fix automatisch korrekt,
ohne eigene Code-Änderung an dieser Stelle. Die vom Review benannten „3 Stellen" sind damit 3
*Symptom-Orte*, real **2 Fix-Orte** (das benachbarte Paar `fristKlasse`+`fristText`, plus
`kennzahlen().ueberf`). `renderWichtig()` ([index.html:5661](../../../index.html#L5661)) nutzt bereits
eine Tage-**gerundete** Formel (nicht dieselbe Instant-Bug-Familie, da schon `Math.round(...)` statt
rohem `<heute`) — vom Review nicht benannt, hier bewusst unangetastet.

**Konsequenz für diese Spec:** `kennzahlen().ueberf` liefert jetzt exakt dieselbe, korrekte Zahl, die die
neue `.tc-*`-Kennzahl ohnehin gebraucht hätte — die KPI-Karte „Überfällige Aufgaben" kann `k.ueberf`
direkt wiederverwenden (§6.1), keine eigene Parallel-Formel mehr nötig (Wiederverwenden statt
duplizieren, wie bereits für Conversion/Reaktionszeit vorgesehen).

### 4.4 Review-Finding 2: Demo-Wert statt leerer Liste — Heinz-Vogel-Seed-Justierung

Mit der korrekten Definition (§4.3) und den *ursprünglichen* Seeds wäre „Überfällige Aufgaben" **0** und
„Braucht Aufmerksamkeit" leer — technisch korrekt, aber ein zu stiller Startzustand für einen Pitch (das
Cockpit soll in Aktion sichtbar sein). Bewusste Demo-Justierung eines bestehenden Feld-Werts (Wert-Tweak,
keine neue Struktur — analog dem Thoraxzentrum-Seed aus Runde 5):

```diff
- {id:6,…quelle:"Thoraxzentrum Münnerstadt",achse:"SalutoCare",kt:"PKV",status:"Qualifizierung",owner:"Recovery Manager",aufgabe:"Übernahmefähigkeit Beatmung klären",frist:dstr(0),saluto:true,…}
+ {id:6,…quelle:"Thoraxzentrum Münnerstadt",achse:"SalutoCare",kt:"PKV",status:"Qualifizierung",owner:"Recovery Manager",aufgabe:"Übernahmefähigkeit Beatmung klären",frist:dstr(-2),saluto:true,…}
```

([index.html:4266](../../../index.html#L4266) — einzige Änderung: `frist:dstr(0)`→`frist:dstr(-2)`, alle
anderen Felder dieses Fall-Objekts unverändert.)

**Neu durchgerechnet:**
- Heinz Vogel (id6) ist jetzt 2 Kalendertage überfällig (`dstr(0)`−`dstr(-2)`) → „Überfällige Aufgaben"
  = **1**, „Braucht Aufmerksamkeit" zeigt genau **1 Zeile**: „Heinz Vogel — Übernahmefähigkeit Beatmung
  klären — Recovery Manager — **2 Tage überfällig**" (Zinnober).
- Anna Muster (id1, `frist:dstr(0)`, unverändert) ist **nicht** überfällig — `f.frist===dstr(0)` greift,
  sie ist „heute fällig", erscheint **nicht** in „Braucht Aufmerksamkeit" (die Liste zeigt nur
  `frist<dstr(0)`). Ihr Aufgaben-Hero in der Fallakte zeigt dank §4.3 „Frist heute fällig" statt (vorher,
  mit dem Bug, jeden Nachmittag) „überfällig (1 T)".
- Mitarbeiter-Überfällig-Marker (§4.7, §6.2): Recovery Manager hätte 1 (aus id6) — wird aber nirgends als
  Mitarbeiter-Zeile gerendert (ihr einziges Panel „Direkt/Premium" ist `schmal`, keine `.tc-ma-list`,
  §6.2); sichtbar bleibt der Fall ausschließlich über die globale „Braucht Aufmerksamkeit"-Liste. Alle
  anderen drei Mitarbeiter: weiterhin 0 überfällig.
- `TC_WOCHE.ueberfaellig` (§4.5): letzter Wert wechselt von 0 auf **1** (Sparkline-Ende = neuer Live-Wert).

Keine anderen Kennzahlen betroffen — id6s Achse/Status/Owner/Reaktion sind unverändert, Pipeline (§4.7)
und die drei anderen KPIs (§4.2, Zeilen 1-3) bleiben exakt wie zuvor berechnet. Der Leerzustand
(„Keine überfälligen Aufgaben — alles im grünen Bereich.") bleibt trotzdem ein realer, testbarer
Code-Pfad (§7, Abnahme 6) — er ist nur nicht mehr der Demo-Startzustand.

### 4.5 `TC_WOCHE` — Seed-Zeitreihe für die 4 Trendlinien

Die App speichert keine Tages-Historie der Kennzahlen (nur den aktuellen Schnappschuss in `faelle[]`) —
eine echte Rückrechnung „Wert vor 6 Tagen" ist nicht möglich, ohne 7 komplette historische
`faelle[]`-Zustände zu simulieren. `TC_WOCHE` ist daher explizit ein **Demo-Seed**, keine Ableitung.
Konvention: 7 Werte, älteste→neueste, **der letzte Wert ist bewusst gleich dem live berechneten
Heute-Wert aus §4.2 gesetzt** (Konsistenz Headline↔Sparkline-Ende), die vorigen 6 sind erfundene,
plausible Vorgeschichte:

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

### 4.6 `TC_ERLEDIGT` — Seed je Mitarbeiterin für „diese Woche erledigt"

Geprüft, ob live zählbar (`f.log`-Zeilen „Aufgabe erledigt" der letzten 7 Tage,
`advanceFallStatus()` schreibt exakt diesen Text, [index.html:6442](../../../index.html#L6442)):
**keine** der 9 statischen `faelle[]`-Seeds enthält diese Log-Zeile mit einem Datum der letzten 7 Tage —
der Text entsteht ausschließlich live durchs Klicken auf „nächster Schritt" während der laufenden Demo,
nicht durch vorbelegte Historie. Eine Live-Zählung würde also bei jedem frischen Seiten­aufruf **für
alle vier Mitarbeiter 0** anzeigen — exakt die Art von dünner, unüberzeugender Zahl, die der Nutzer
kritisiert hat. Deshalb additiver Seed (ehrlich als Demo-Seed kommentiert), analog dem bestehenden
Muster `zuweiser[].verlauf3M` ([index.html:5546-5549](../../../index.html#L5546), `zwSparkline()`s
Datenquelle):

```js
// Demo-Seed, keine Live-Ableitung möglich (Begründung: §4.6 der Spec) — "diese Woche erledigt" je TEAM-Mitglied.
const TC_ERLEDIGT={"S. Koordination":4,"M. Belegung":3,"Recovery Manager":2,"T. Abrechnung":1};
```

### 4.7 Gruppen-/Team-Zuordnung, durchgerechnet

`achseZuGruppe(f.achse)` je Fall ([index.html:4392-4396](../../../index.html#L4392)):

| Gruppe | Fälle (id · achse · status) | Pipeline (6 Stufen, Verloren separat) |
|---|---|---|
| Orthopädie | 3·Orthopädie·Kontaktiert, 12·Orthopädie·**Verloren**, 10·Orthopädie·Aufgenommen, 13·Orthopädie·Unterlagen | Neu 0 · Kontaktiert 1 · Qualifizierung 0 · Unterlagen 1 · Aufnahme geplant 0 · Aufgenommen 1 (+ 1 verloren, separat) |
| Neuro-Geri | 1·Neurologie·Neu, 8·Neurologie·Unterlagen, 9·Neurologie·Aufnahme geplant, 11·Neurologie·Aufgenommen | Neu 1 · Kontaktiert 0 · Qualifizierung 0 · Unterlagen 1 · Aufnahme geplant 1 · Aufgenommen 1 |
| Direkt/Premium (`achseZuGruppe`→`null`) | 6·SalutoCare·Qualifizierung | Neu 0 · Kontaktiert 0 · Qualifizierung 1 · Unterlagen 0 · Aufnahme geplant 0 · Aufgenommen 0 |

Summe 4+4+1 = 9 = `faelle.length`. „Verloren" ist bewusst **kein** 7. Segment der Leiste (Memory/CLAUDE.md:
„STATUS 6 Stufen Neu→Aufgenommen") — je Gruppe stattdessen eine kleine Caption „N verloren" neben der
Leiste, nur falls >0 (nur bei Orthopädie, „1 verloren").

Mitarbeiter je Panel — `TEAM_ACHSE[t].map(achseZuGruppe)` ([index.html:4386](../../../index.html#L4386)):

| Mitarbeiter | `TEAM_ACHSE` | abgeleitete Gruppen | erscheint in Panel(en) |
|---|---|---|---|
| S. Koordination | Orthopädie, Innere | Orthopädie, Neuro-Geri (Innere→Neuro-Geri) | **beide** Team-Panels |
| M. Belegung | Neurologie, Geriatrie | Neuro-Geri (beide Achsen mappen dorthin) | nur Neuro-Geri |
| Recovery Manager | SalutoCare | — (`achseZuGruppe("SalutoCare")` = `null`) | **Direkt/Premium** (ihr einziger Fall, id6, liegt dort) |
| T. Abrechnung | — (leere Achsenliste) | — | in keinem Panel (ihr einziger Fall, id12, ist Verloren — 0 offene Fälle, 0 Gruppenzugehörigkeit; bewusste Konsequenz, keine Sonderbehandlung nötig) |

Mitarbeiter-Kennzahlen sind **personenbezogene Gesamtwerte** (nicht je Panel neu gefiltert) — erscheint
S. Koordination in beiden Panels, zeigt sie in beiden dieselbe Zahl (all ihre offenen Fälle, unabhängig
von deren Achse). Design-Entscheidung dieser Spec (vom Nutzer nicht bis auf diese Feinheit
spezifiziert): einfacher und ohne Doppel-Buchführungsrisiko, als Fälle künstlich auf Panel-Achsen
aufzuteilen, deren Grenze in den echten Owner-Daten ohnehin nicht sauber verläuft (S. Koordination
besitzt z. B. Fall id1 mit Achse „Neurologie", obwohl ihre `TEAM_ACHSE`-Liste „Neurologie" gar nicht
enthält — bestehende Seed-Realität, hier nicht bereinigt).

Offene Fälle je Mitarbeiter (`offeneFaelle()`, [index.html:4770](../../../index.html#L4770), gefiltert
nach `f.owner`): S. Koordination 3 (id1,3,13) · M. Belegung 2 (id8,9) · Recovery Manager 1 (id6) ·
T. Abrechnung 0. Last-Balken-Basis `maxN=3`: S. Koordination 100 %, M. Belegung 67 %, Recovery Manager
33 %, T. Abrechnung 0 %. Überfällig-Marker je Mitarbeiter (Review-Fix 2, §4.4): S. Koordination/
M. Belegung/T. Abrechnung **0**; Recovery Manager **1** (id6, seit der Frist-Justierung) — bleibt aber
unsichtbar, da ihr einziges Panel „Direkt/Premium" `schmal` ist (kein `.tc-ma-list`, §6.2); der Fall
selbst ist trotzdem sichtbar über „Braucht Aufmerksamkeit" (§6.3).

---

## 5. `renderTeam()` — Vorher/Nachher-Struktur

**Vorher** ([index.html:5806-5834](../../../index.html#L5806)): `.tm-intake`-String → `teamCockpitHtml()`
→ `.tm-cards` (`TEAM.map`) → `.tm-listhead` + `.tm-list` (`openCases` gefiltert nach `teamFilter`).

**Nachher** (gleicher Einstiegspunkt `#teamGrid`, gleicher Aufrufer `renderAll()`
[index.html:6239](../../../index.html#L6239)):

```js
function renderTeam(){
 const el=document.getElementById("teamGrid"); if(!el)return;
 const offen=f=>!["Aufgenommen","Verloren"].includes(f.status);
 const openCases=faelle.filter(offen);
 el.innerHTML = tcKpiRowHtml() + tcPanelsHtml(openCases) + tcAufmerksamkeitHtml();
}
```

Drei neue Bausteinfunktionen (§6), alle vor `renderTeam()` platziert (Einfügepunkt: direkt wo heute
`teamCockpitHtml()` beginnt, [index.html:5779](../../../index.html#L5779)).

---

## 6. UI-Spezifikation (`.tc-*`)

### 6.1 KPI-Zeile (`tcKpiRowHtml()`)

```js
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
 const k=kennzahlen(); // reuse: conv, rzAvg, ueberf (nach Begleit-Fix §4.3 zeitstabil und direkt korrekt)
 const auf7=faelle.filter(f=>f.status==="Aufgenommen"&&f.log.some(([d,t])=>d>=dstr(-7)&&/aufgenommen/i.test(t))).length;
 return "<div class='tc-kpis'>"
  +tcKpiKarte("Aufnahmen · 7 Tage",auf7,"",TC_WOCHE.aufnahmen,true)
  +tcKpiKarte("Conversion",k.conv,"%",TC_WOCHE.conversion,true)
  +tcKpiKarte("Ø Reaktionszeit",k.rzAvg,"Std.",TC_WOCHE.reaktion,false)
  +tcKpiKarte("Überfällige Aufgaben",k.ueberf,"",TC_WOCHE.ueberfaellig,false)
  +"</div>";
}
```

`zwSparkline()` ([index.html:5546-5550](../../../index.html#L5546)) unverändert wiederverwendet — bereits
eine reine, statische Inline-SVG-Polyline (`var(--brass-deep)`-Stroke, kein Keyframe), exakt was die
Vorgabe „7-Punkte-Trendlinie … KEIN neues Keyframe" verlangt. Kein neuer Sparkline-Code nötig.
`k.ueberf` ist nach dem Begleit-Fix (§4.3) zeitstabil und exakt die richtige Zahl — anders als im
ursprünglichen Entwurf dieser Spec ist **keine eigene Parallel-Formel** mehr nötig, nur noch Wiederverwendung.

### 6.2 Team-Panels (`tcPanelsHtml()`)

```js
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
 const ueb=mine.filter(f=>f.frist&&f.frist<dstr(0)).length; // zeitstabil, s. §4.3
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
function tcPanelsHtml(openCases){ // openCases = offeneFaelle()-Ergebnis aus renderTeam() — GLOBALER Datensatz, s. Review-Fix unten
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
```

**Review-Fix (Finding 2):** `tcPanel()` bekam ursprünglich `cases` (das panel-lokale, nach Achse
gefilterte, **ungefilterte** Fall-Set — inkl. Verloren/Aufgenommen, exklusive fremder Achsen) auch als
Datensatz für `tcMitarbeiterZeile()` durchgereicht. Das ist falsch: `tcMitarbeiterZeile()` soll
personenbezogene **Gesamtwerte** zeigen (§4.7 — „S. Koordination zeigt in beiden Panels dieselbe Zahl"),
aber mit dem panel-lokalen `cases`-Set hätte sie im Orthopädie-Panel nur ihre Orthopädie-Fälle (id3,id13
→ 2) und im Neuro-Geri-Panel nur id1 (→ 1) gesehen — zwei **unterschiedliche, beide falsche** Zahlen
statt der korrekten 3 in beiden. Fix: `tcPanel()` bekommt zusätzlich den **global** vorberechneten
`openCases`-Datensatz aus `tcPanelsHtml()` als eigenen Parameter und reicht **den** (nicht `cases`) an
`tcMitarbeiterZeile()` weiter — `cases` bleibt ausschließlich Input für `tcPipelineHtml()` (die *braucht*
das panel-lokale, ungefilterte Set, inkl. Verloren/Aufgenommen, für die 6-Stufen-Segmentleiste).

`tcPanel()` für „Direkt / Premium" (`schmal=true`) rendert bewusst **keine** Mitarbeiter-Zeilenliste im
vollen `.tc-ma-list`-Format (Vorgabe: „drittes **schmales** Panel") — stattdessen nur die Pipeline. Die
`mitglieder`-Liste `["Recovery Manager"]` wird aktuell nicht gerendert (Parameter für spätere
Erweiterung belassen, kein toter Code — `tcPanel()` selbst nutzt ihn nur im Nicht-schmal-Zweig; ein
`if(schmal)`-Frühausstieg vor der Nutzung macht das explizit).

### 6.3 „Braucht Aufmerksamkeit" + Mitarbeiter-Filter (`tcAufmerksamkeitHtml()`)

Bestehendes Klick-Verhalten (`teamFilter`→Liste filtern, `setTeamFilter()` zum Umschalten) wird
**erhalten, aber sauber ersetzt**: die alte generische „alle offenen Aufgaben"-Liste (`.tm-list`)
existiert im neuen Layout nicht mehr — die einzige verbleibende Liste ist „Braucht Aufmerksamkeit"
(nur echt überfällige Fälle). Filtert ein Klick auf eine Mitarbeiter-Zeile (§6.2) diese Liste auf
„nur überfällig", wäre sie bei 0 Überfälligen fast immer leer — schlechtes UX. Deshalb wechselt die
Liste bei aktivem Mitarbeiter-Filter den **Inhalt**, nicht nur den Filter: „alle offenen Fälle dieser
Person" (das alte `.tm-list`-Verhalten, nur umbenannt) statt „nur überfällige":

```js
let tcFilter="alle"; // ersetzt teamFilter (§9)
function tcSetFilter(t){ tcFilter=(tcFilter===t?"alle":t); renderTeam(); }
function tcFristSort(a,b){ // Review-Fix (Finding 3): leere Fristen IMMER ans Ende, unabhängig von der anderen Seite
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
 const ueberfaellig=offen.filter(f=>f.frist&&f.frist<dstr(0)).sort(tcFristSort); // zeitstabil, s. §4.3 — frist garantiert gesetzt, tcFristSort trotzdem wiederverwendet statt Duplikat
 return "<div class='chap tc-attn'><h2 class='chap-h2'>Braucht Aufmerksamkeit</h2>"
  +"<div class='tc-attn-list'>"+(ueberfaellig.length?ueberfaellig.map(tcAttnZeile).join(""):"<p class='empty'>Keine überfälligen Aufgaben — alles im grünen Bereich.</p>")+"</div></div>";
}
function tcAttnZeile(f){ // NUR für die überfällig-Liste — durch den Filter oben garantiert f.frist<dstr(0)
 const tage=Math.round((new Date(dstr(0))-new Date(f.frist))/86400000); // beide Operanden reine Datumsstrings (Mitternacht UTC) — exakter Tageswert, immer positiv, keine Rundungsartefakte
 return "<button type='button' class='tc-attn-row' onclick='openFallakte("+f.id+")'>"
  +"<span class='tc-attn-name'>"+escapeHtml(f.name)+"</span>"
  +"<span class='tc-attn-aufg'>"+escapeHtml(f.aufgabe||"—")+"</span>"
  +"<span class='tc-attn-owner'>"+escapeHtml(f.owner)+"</span>"
  +"<span class='tc-attn-tage bad'>"+tage+" "+(tage===1?"Tag":"Tage")+" überfällig</span>"
  +"</button>";
}
function tcFallZeile(f){ // generische Zeile für den Mitarbeiter-Filter-Zweig — Fälle in JEDEM Frist-Zustand
 // (überfällig/heute/zukünftig/keine Frist), deshalb NICHT tcAttnZeile() wiederverwendet: die hätte
 // hier für nicht-überfällige Fälle Unsinn gezeigt ("-2 Tage überfällig" für eine Frist in 2 Tagen,
 // "NaN Tage überfällig" ohne Frist). fristKlasse()/fristText() (§4.3, jetzt zeitstabil) decken alle
 // vier Zustände bereits korrekt ab — hier reuse statt eigener Tage-Rechnung.
 return "<button type='button' class='tc-attn-row' onclick='openFallakte("+f.id+")'>"
  +"<span class='tc-attn-name'>"+escapeHtml(f.name)+"</span>"
  +"<span class='tc-attn-aufg'>"+escapeHtml(f.aufgabe||"—")+"</span>"
  +"<span class='tc-attn-owner'>"+escapeHtml(f.owner)+"</span>"
  +"<span class='tc-attn-tage "+fristKlasse(f.frist)+"'>"+escapeHtml(f.frist?fristText(f.frist):"—")+"</span>"
  +"</button>";
}
```

`openFallakte()` ([index.html:7044](../../../index.html#L7044)) unverändert wiederverwendet. Sortierung
der Aufmerksamkeit-Liste nach Frist aufsteigend (früheste/längste überfällige Frist zuerst) — mit den
aktuellen Seeds (§4.4) genau 1 Zeile, Sortierung also nicht sichtbar prüfbar, aber im Personenfilter-Zweig
(gleiche `tcFristSort()`) mit 3 Zeilen (§7, Abnahme 4) demonstrierbar.

**Review-Fix (Finding 3, Minor):** Der ursprüngliche Personenfilter-Zweig sortierte über
`String(a.frist||"").localeCompare(...)` — eine leere Frist (`""`) sortiert lexikographisch **vor** jedem
Datumsstring, landet also fälschlich **zuerst** statt zuletzt. `tcFristSort()` behandelt die leere Frist
jetzt explizit als „immer ans Ende", unabhängig von der Gegenseite.

**Zusätzlich selbst gefundener Fix (kein Review-Finding, beim Umsetzen der Sortierung entdeckt):** Der
ursprüngliche Entwurf dieser Spec ließ den Personenfilter-Zweig ebenfalls `tcAttnZeile()` aufrufen — die
Funktion nimmt aber an, dass jeder übergebene Fall bereits überfällig ist (Vorbedingung des
„Braucht Aufmerksamkeit"-Filters). Im Personenfilter sind das aber ALLE offenen Fälle einer Person,
nicht nur überfällige — mit den echten Seeds hätte das sichtbar falschen Text erzeugt: id3
(`frist:dstr(2)`, fällig in 2 Tagen) als „2 Tage überfällig" (Vorzeichenfehler durch `Math.round` ohne
Schutz), id13 (keine Frist) als „NaN Tage überfällig". Root Cause: eine überfällig-spezifische
Render-Funktion für einen gemischten Datensatz wiederverwendet, kein Symptom-Patch (z. B. `Math.abs()`)
möglich, da die Kernannahme selbst falsch war. Fix: eigene, generische `tcFallZeile()` (s. o.), die
`fristKlasse()`/`fristText()` (bereits zeitstabil, §4.3) für alle vier Frist-Zustände korrekt wiederverwendet.

### 6.4 CSS (neuer Block vor `</style>`, [index.html:3154](../../../index.html#L3154))

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

390px: `.tc-kpis` bleibt 2-spaltig (nicht 1-spaltig — 4 Karten sind kompakt genug, kein horizontaler
Überlauf, geprüft mit Cormorant-Zahlen bis 3-stellig), `.tc-panels` fällt auf 1 Spalte (kein
`min-width:900px` erreicht), Mitarbeiter-/Aufmerksamkeit-Zeilen umbrechen (`flex-wrap`).

---

## 7. Abnahmekriterien (Browser-Checks)

1. **KPI-Zeile:** 4 Karten zeigen exakt `2` (Aufnahmen · 7 Tage), `67 %` (Conversion), `7 Std.`
   (Ø Reaktionszeit), `1` (Überfällige Aufgaben — nach Heinz-Vogel-Seed-Justierung §4.4) — je Karte eine
   sichtbare Trendlinie + Delta `+2`/`+9`/`−2`/`−2`. Mit diesen Seeds werten **alle vier** als „gut"
   (grün): Aufnahmen/Conversion steigend (steigen ist erwünscht) UND Reaktionszeit/Überfällig fallend
   (fallen ist erwünscht) — Überfällig-Delta jetzt `-2` statt vorher `-3` (§4.5, Heinz-Vogel-Seed
   verschiebt den Live-Endwert von 0 auf 1).
2. **Panels korrekt gruppiert:** Orthopädie-Panel zeigt Pipeline `1/0/0/1/0/1` (Kontaktiert/Unterlagen/
   Aufgenommen je 1) + „1 verloren" Caption; Neuro-Geri zeigt `1/0/0/1/1/1` (Neu/Unterlagen/Aufnahme
   geplant/Aufgenommen je 1); Direkt/Premium zeigt nur Qualifizierung=1, restliche Segmente leer.
3. **Mitarbeiter-Zeilen (Review-Fix Finding 2, §6.2):** S. Koordination erscheint in **beiden** Panels
   (Orthopädie + Neuro-Geri) mit **identischer** Zahl (3 offene Fälle, Last-Balken 100 %, 0 überfällig)
   — vor dem Fix hätte sie panel-lokal `2` (Orthopädie) bzw. `1` (Neuro-Geri) gezeigt, jetzt korrekt in
   beiden `3`, weil `tcMitarbeiterZeile()` den global vorberechneten `openCases`-Datensatz bekommt,
   nicht das panel-lokale `cases`. M. Belegung nur in Neuro-Geri (2, 67 %, 0 überfällig). Recovery
   Manager erscheint in keiner `.tc-ma-list` (Direkt/Premium ist `schmal`) — obwohl ihr einziger Fall
   (id6) inzwischen überfällig ist, bleibt ihre Zeile ungerendert (§4.4); T. Abrechnung erscheint
   nirgends.
4. **Filter-Klick + Sortierung (Review-Fix Finding 3, §6.3):** Klick auf „S. Koordination"-Zeile →
   Liste unten wechselt zu „Offene Fälle · S. Koordination" mit genau 3 `tcFallZeile()`-Zeilen in dieser
   Reihenfolge: Anna Muster (`frist:dstr(0)` → Frist-Badge „heute fällig", Klasse `warn`) → Maria Probst
   (`frist:dstr(2)` → „in 2 T", Klasse `ok`) → Werner Aumann (keine Frist → „—", keine Farb-Klasse,
   `tcFristSort()` sortiert sie bewusst ans Ende statt — wie vor dem Fix — lexikographisch an den
   Anfang). Keine Zeile zeigt „Tage überfällig"-Text, obwohl keiner dieser drei Fälle tatsächlich
   überfällig ist (Beleg für den selbst gefundenen Zusatz-Fix oben). „alle zeigen"-Button sichtbar;
   Klick darauf (oder erneut auf dieselbe Mitarbeiter-Zeile) → zurück zu „Braucht Aufmerksamkeit"
   (1 Zeile, s. Punkt 5).
5. **„Braucht Aufmerksamkeit" zeigt den Demo-Fall (Review-Fix Finding 2, §4.4):** genau 1 Zeile —
   „Heinz Vogel — Übernahmefähigkeit Beatmung klären — Recovery Manager — **2 Tage überfällig**"
   (Zinnober-Text, `.tc-attn-tage`). Klick darauf → `openFallakte(6)` öffnet seine Fallakte.
6. **Leerzustand bleibt ein realer Code-Pfad:** `eingang`/`faelle` unverändert lassen, aber in der
   Konsole `faelle.find(f=>f.id===6).frist=dstr(3)` setzen und `renderTeam()` erneut aufrufen → „Braucht
   Aufmerksamkeit" zeigt jetzt „Keine überfälligen Aufgaben — alles im grünen Bereich." (kein
   `<button>`-Markup, kein Klick-Handler) — der Leerzustand existiert weiterhin, ist nur nicht mehr der
   Demo-Startzustand.
7. **Zeitstabiler Begleit-Fix in der Fallakte sichtbar (Review-Fix Finding 1, §4.3):** Anna Muster
   (`openFallakte(1)`, `frist:dstr(0)`) öffnen → Aufgaben-Hero zeigt „Frist heute fällig" (CSS-Klasse
   `warn`), **nicht** „überfällig (1 T)" (Klasse `bad`) — unabhängig davon, zu welcher Tageszeit die
   Seite geladen wurde (das war der behobene Demo-Killer-Bug: Instant-Vergleich gegen das beim Laden
   eingefrorene `heute`).
8. **Entfernte Elemente weg:** kein `<figure>` mehr in `#sub-faelle-team`, kein `.tm-intake`-Banner,
   keine `.tm-card`/`.tm-list`-Elemente im DOM.
9. **Mobile (390px):** KPI-Zeile 2×2, Panels stapeln einspaltig, Mitarbeiter-/Aufmerksamkeit-Zeilen
   umbrechen ohne horizontalen Überlauf.
10. **0 Console-Errors**, beide Breiten.
11. **Unberührte Bereiche:** `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `#refOverlay`, `ma-mode`/„Mein Tag"
   (`renderMeinTag()`), `renderCharts()`/„Auswertung" unverändert; genau 9 `@keyframes` (`grep -c
   "@keyframes" index.html` vor/nach identisch). Ausnahme vom sonstigen „kennzahlen() unangetastet":
   `kennzahlen().ueberf` ändert sich um eine Zeile (§4.3, Begleit-Fix) — das „Heute"-View-Badge, das
   diesen Wert anzeigt, zeigt dadurch jetzt ebenfalls die korrekte (zeitstabile) Zahl, keine optische
   Änderung an Layout/Markup dort.

---

## 8. Nicht-Ziele

- `ma-mode`/„Mein Tag" (`renderMeinTag()`, `#view-meintag`) bleibt vollständig unberührt — dieser
  Cockpit-Umbau betrifft ausschließlich die Leitungsansicht (`#sub-faelle-team`, außerhalb `ma-mode`
  ohnehin sichtbar, [index.html:1579](../../../index.html#L1579)).
- „Auswertung"-View (`renderCharts()`, Donut/Balken-Charts) unberührt — andere Kennzahlenebene
  (historische Verlust-/Engpass-Analyse), kein Überschneidungsbedarf mit dem neuen Führungs-Cockpit.
- **Ausnahme vom sonstigen „nur wiederverwenden, nicht ändern":** `kennzahlen()` bekommt genau eine
  geänderte Zeile (`ueberf`, §4.3, Begleit-Fix aus dem Review) — keine sonstige Änderung an der
  Funktion, keine neuen Rückgabefelder, keine Änderung an ihrem Aufrufort/ihrer Signatur. `fristKlasse()`/
  `fristText()` (§4.3) sind die einzigen zwei weiteren Bestandsfunktionen, die diese Spec anfasst — beide
  je eine chirurgische Ein-Zeilen-Änderung (Grenzfall überfällig/heute), sonst unverändert.
- Keine Änderung an `renderWichtig()` ([index.html:5661](../../../index.html#L5661)) — nutzt bereits eine
  Tage-gerundete Formel, nicht dieselbe Bug-Familie, vom Review nicht benannt (§4.3).
- Keine Persistenz von `tcFilter` über einen Seitenreload hinaus (wie zuvor bei `teamFilter`).
- Kein Ausbau der Board-Ansicht um einen Owner-Filter — der Mitarbeiter-Filter dieser Spec lebt
  ausschließlich innerhalb der Team-Ansicht selbst (§6.3), analog zum bisherigen `teamFilter`-Verhalten.

---

## 9. Zu entfernende/umbenannte Symbole

- `teamCockpitHtml()` — vollständig ersetzt durch `tcKpiRowHtml()`/`tcPanelsHtml()` (§6.1-6.2).
- `teamFilter`, `setTeamFilter()` — umbenannt zu `tcFilter`/`tcSetFilter()` mit erweitertem Zweck
  (§6.3: filtert jetzt den Listeninhalt, nicht nur eine feste Liste) — kein ersatzloses Entfernen des
  Zustandskonzepts, nur Umbenennung + Bedeutungserweiterung.
- Alle unter §3.1 gelisteten `.tm-*`/`.ts-*`-CSS-Regeln.

---

## 10. Verifizierte Code-Anker (gelesen vor dieser Spec)

`renderTeam()`/`teamCockpitHtml()`: [5806-5834](../../../index.html#L5806)/[5779-5805](../../../index.html#L5779) ·
`#sub-faelle-team` + Deko-Figure + `#teamGrid`: [3768-3772](../../../index.html#L3768) ·
`TEAM`/`TEAM_ACHSE`/`GRUPPEN`/`achseZuGruppe()`: [4383](../../../index.html#L4383)/[4386](../../../index.html#L4386)/[4391](../../../index.html#L4391)/[4392-4396](../../../index.html#L4392) ·
`STATUS`/`STATUS_AUFGABE`/`STATUS_COL`/`ACHSE_COL`: [4230](../../../index.html#L4230)/[4231-4237](../../../index.html#L4231)/[4256](../../../index.html#L4256)/[4257](../../../index.html#L4257) ·
`heute`/`dstr()`/`initialen()`: [4258-4260](../../../index.html#L4258) ·
`faelle[]`-Seeds (9 Einträge): [4263-4274](../../../index.html#L4263) ·
`offeneFaelle()`: [4770](../../../index.html#L4770) ·
`kennzahlen()` (inkl. `ueberf`-Begleit-Fix §4.3): [5643-5656](../../../index.html#L5643) ·
`fristKlasse()`/`fristText()` (Begleit-Fix §4.3): [4757](../../../index.html#L4757)/[4758](../../../index.html#L4758) ·
`aufgabenHeroHtml()` (konsumiert `fristKlasse`/`fristText`, kein eigener Fix-Ort): [6258-6264](../../../index.html#L6258) ·
`renderWichtig()` (Tage-Rundungs-Präzedenz, nicht Teil des Begleit-Fixes): [5657-5685](../../../index.html#L5657) ·
`zwSparkline()` (wiederverwendet, unverändert): [5546-5550](../../../index.html#L5546) ·
`advanceFallStatus()` (Quelle des Log-Texts „Aufgabe erledigt"): [6434-6444](../../../index.html#L6434) ·
`kpiRing()`: [6066-6072](../../../index.html#L6066) ·
`escapeHtml()`: [4761](../../../index.html#L4761) ·
`openFallakte()`/`openDetail()`: [7044](../../../index.html#L7044)/[6455](../../../index.html#L6455) ·
`renderAll()` (Aufrufer von `renderTeam()`): [6239](../../../index.html#L6239) ·
`.card`-Basis (Etiketten-Doppelrahmen): [1926-1928](../../../index.html#L1926) ·
`.chap`/`.kicker`/`.chap-h2`/`.empty`: [2147](../../../index.html#L2147)/[842](../../../index.html#L842)/[67,2141](../../../index.html#L67)/[1761](../../../index.html#L1761) ·
`.tm-*`/`.ts-*`-CSS (obsolet, §3.1) — vollständige Fundstellen-Liste dort ·
CSS-Einfügepunkt vor `</style>`: [3154](../../../index.html#L3154) ·
9 `@keyframes`-Blöcke bestätigt (`grep -c` vor dieser Spec: 9), keine neue hinzugefügt ·
`body.ma-mode`-Gate (Beleg für „Team-Ansicht nur außerhalb ma-mode sichtbar"): [1579](../../../index.html#L1579)
