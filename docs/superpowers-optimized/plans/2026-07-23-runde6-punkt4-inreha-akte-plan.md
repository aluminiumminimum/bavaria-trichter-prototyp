# Runde 6, Punkt 4 — In-Reha-Karteikarte als BWL-Akte: Implementierungsplan

> **Für ausführende Agenten:** Dieser Plan wird Subagent-Driven umgesetzt — pro Task ein frischer Agent, kein Schreiben durch das orchestrierende Modell selbst. Lane-Tag pro Task beachten. Jeder Task arbeitet ausschließlich in `index.html`; **vor jeder Anker-Zeile den `grep`-Befehl aus dem Task selbst erneut ausführen** — Zeilennummern verschieben sich durch jeden vorherigen Task. Die hier notierten Zeilen sind der Stand bei Plan-Erstellung (23.07.2026, `index.html` 7228 Zeilen, Commit `c2b367d`), nicht garantiert der Stand bei Ausführung.

**Bezug:** Setzt [2026-07-23-runde6-punkt4-inreha-akte-design.md](../specs/2026-07-23-runde6-punkt4-inreha-akte-design.md) vollständig um — ersetzt den Innenraum der `.ir-card` in `renderInReha()` durch eine BWL-Zeile + Kostenzusage-Ampel + Meilenstein-Fußzeile im neuen Namespace `.irb-*`; `rsDetail`/`openRsDetail()` bleiben vollständig unverändert. Baut auf keinem Runde-6-Vorgänger auf (P1–P3 betreffen andere Views), ist aber CSS-technisch die vierte Einfügung derselben Runde. Format/Konventionen übernommen vom vorherigen Sprint-Plan ([2026-07-23-runde6-punkt3-team-cockpit-plan.md](./2026-07-23-runde6-punkt3-team-cockpit-plan.md)).

**Architektur:** Alle Änderungen in `index.html` (self-contained, kein Build-Prozess, „Tests" = konkrete Browser-/CDP-Checks + Konsolen-Snippets, keine Test-Framework-Suite). Sequentielle Ausführung — **nie parallel**, jeder Task fasst dieselbe Datei an. Nach jedem Task: Git-Commit (nur `index.html` staged). Die App bleibt nach **jedem einzelnen Task** lauffähig (0 Console-Errors, kein kaputter Zwischenzustand).

---

## Architekten-Ergänzung: Meilenstein-Vielfalt durch Verweildauer-Seed-Justierung

Mit den unveränderten Spec-Seeds (Dieter `ist:6/plan:21`, Elke `ist:4/plan:28`, Lydia `ist:2/plan:25`) zeigen alle drei Karten `rest>10` und damit identisch „Zwischenbericht fällig" (nur der Tage-Text unterscheidet sich: 8/10/12 Tage) — die Spec selbst benennt das als bekannte, tolerierte Seed-Lücke (§4.3). Für die Demo-Vielfalt wird hier **ausschließlich `verweildauer.ist`** justiert (Wert-Tweak an einem bestehenden Feld, exakt wie beim Heinz-Vogel-`frist`-Tweak in Punkt 3) — `plan` bleibt unangetastet, die Formeln aus §4.1–§4.3 der Spec werden **nicht** geändert.

**Gewählte neue Werte** (Task 1):

| Patient | `ist` alt→neu | `plan` | `rest` alt→neu | Meilenstein alt→neu |
|---|---|--:|---|---|
| Dieter Franke | 6 → **19** | 21 | 15 → **2** | Zwischenbericht fällig → **Entlassgespräch** |
| Elke Sauer | 4 → **20** | 28 | 24 → **8** | Zwischenbericht fällig → **Verlängerungsentscheid** |
| Lydia Sommer | 2 (unverändert) | 25 | 23 (unverändert) | **Zwischenbericht fällig** (unverändert) |

Begründung der Zuordnung: Lydia bleibt unangetastet, weil ihre Karte bereits die einzige Demonstration des kritischen Ampel-Zustands ist (`kostenzusage:"offen"` + `ist≥2` → Zinnober „fehlt – kritisch", Spec §4.2) — das bleibt unberührt, wenn ihr `ist` nicht verändert wird. Elke erhält die Rolle „Verlängerungsentscheid", weil sie in `RS_BILLING` bereits `verlaengerung:true` trägt (Gold-Punkt) — inhaltlich passt „Fall steht kurz vor der Verlängerungsentscheidung" zum bereits gesetzten Marker. Dieter erhält „Entlassgespräch" (die dritte, bislang unbelegte Phase).

**Begleit-Tweak `entlassungGeplant` (zweites Feld, gleicher Datensatz):** Im bestehenden Seed gilt bereits die Invariante `entlassungGeplant === dstr(rest)` (Dieter alt: `rest=15` ↔ `dstr(15)`; Elke alt: `rest=24` ↔ `dstr(24)`) — ersichtlich bewusst so gesetzt. Ohne Nachführung stünde auf **derselben Karte** direkt sichtbar „Tag 19 von 21" (kaum noch Resttage) neben „Entlassung {altes, 15 Tage entferntes Datum}" — ein für die Zielgruppe (Leitung, „Überblick auf einen Blick") selbsterklärend falscher Widerspruch auf einer einzigen Karte, nicht nur eine Abweichung zwischen Views. Deshalb wird `entlassungGeplant` in Task 1 zusammen mit `ist` auf `dstr(rest_neu)` nachgeführt: Dieter `dstr(15)→dstr(2)`, Elke `dstr(24)→dstr(8)`. Lydias `entlassungGeplant:null` bleibt unverändert (ihre Kostenzusage ist weiterhin „offen" — kein Entlassdatum vor Klärung, unverändert konsistent).

**Bewusst NICHT nachgeführt:** `p.aufnahme` (Dieter `dstr(-6)`, Elke `dstr(-4)`) und die zugehörigen `personen[].historie`-Einträge (z. B. P09 `{d:dstr(-6),typ:"aufnahme",…}`). Diese zweite Invariante (`aufnahme === dstr(-ist_alt)`) existiert ebenfalls im Ist-Stand, gehört aber zu Baustein A „Gedächtnis" (`personen[].historie`, Stammdaten-Akte `paAkte()`) — eine andere Datenquelle, die diese Spec laut §8 explizit nicht anfasst (`rsDetail`-Innenleben inkl. Stammdaten-Akte bleibt vollständig unverändert). Sie vollständig nachzuführen würde bedeuten, `personen[]`-Einträge zu editieren, die außerhalb des von der Spec und vom Auftrag abgesteckten Radius liegen (höheres Risiko, größerer Blast-Radius als der beauftragte reine Verweildauer-Tweak). **Bekannte, akzeptierte Seed-Lücke** (dokumentiert wie die bereits in der Spec selbst benannten Lücken, §4.2/§4.3): Wer in der Stammdaten-Akte (ein Klick + Aufklappen entfernt) das Aufnahmedatum mit „Tag X" abgleicht, sieht bei Dieter/Elke eine nicht mehr exakt passende Aufnahme-Differenz. Kein Fixbedarf in dieser Runde — reines Card-Layout-Thema, keine Datensatz-Kohärenzgarantie über alle Views hinweg war je Bestandteil dieser Spec.

### Konsequenz-Neuberechnung (Pflicht-Prüfung laut Auftrag)

**BWL-Zeile (Spec §4.1) — 0 Änderungen.** Geprüft: `erlösTag=ts`, `erlösPlan=ts·plan`, `dbMarge=(ts−kt)/ts`, `zusatzTag=Σzusatz[].eur` — **keine** dieser vier Formeln liest `verweildauer.ist`. `erlösPlan` nutzt explizit `p.verweildauer.plan` (unverändert), nicht `ist` — die Architekten-Randnotiz („kalk. Gesamterlös nutzt plan, nicht ist — prüfen!") ist damit bestätigt: der Seed-Tweak ändert **keinen einzigen** der 12 BWL-Werte aus Spec §4.1. Weiterhin gültig:

| Patient | Erlös/Tag | kalk. Gesamterlös (Plan) | DB-Marge | Zusatzerlöse/Tag |
|---|--:|--:|--:|--:|
| Dieter Franke | 890 € | 18.690 € | 42 % | 65 € |
| Elke Sauer | 1.250 € | 35.000 € | 39 % | 600 € |
| Lydia Sommer | 980 € | 24.500 € | 38 % | 140 € |

**Kostenzusage-Ampel (Spec §4.2) — 0 Änderungen.** Dieter/Elke: `irbAmpel()` verzweigt bei `kz!=="offen"` sofort auf `"ok"`, unabhängig von `ist` — unverändert **Jade**. Lydia: einzige `ist`-abhängige Verzweigung (`ist<2`), ihr `ist` bleibt bei `2` — unverändert **Zinnober** „fehlt – kritisch". Tabelle unverändert gültig:

| Patient | `kostenzusage` | `ist` | Ampel | Kostenträger |
|---|---|--:|---|---|
| Dieter Franke | „liegt vor" | 19 | **Jade** „liegt vor" | PKV |
| Elke Sauer | „n.a. (Selbstzahler)" | 20 | **Jade** „kein Kostenträger nötig" | Selbstzahler |
| Lydia Sommer | „offen" | 2 | **Zinnober** „fehlt – kritisch" | PKV |

**Meilenstein (Spec §4.3) — neu, jetzt divers:**

| Patient | `ist`/`plan` | `rest` | Meilenstein | Detail |
|---|---|--:|---|---|
| Dieter Franke | 19/21 | 2 | **Entlassgespräch** | „am " + `entlassungGeplant` (= `dstr(2)`, heute+2 Tage) |
| Elke Sauer | 20/28 | 8 | **Verlängerungsentscheid** | „spätestens in 5 Tagen" (`rest-3`) |
| Lydia Sommer | 2/25 | 23 | Zwischenbericht fällig | „in 12 Tagen (Tag 14)" (unverändert) |

**Verweildauer-Band (Spec §4.4) — neu für Dieter/Elke, Lydia unverändert:**

| Patient | `stayPct=round(ist/plan·100)` | Entlassdatum-Anzeige | Gold-Punkt |
|---|--:|---|---|
| Dieter Franke | round(19/21·100) = **90 %** | „Entlassung " + `dstr(2)` (heute+2 Tage) | nein (`verlaengerung:false`) |
| Elke Sauer | round(20/28·100) = **71 %** | „Entlassung " + `dstr(8)` (heute+8 Tage) | **ja** (`verlaengerung:true`, unverändert) |
| Lydia Sommer | round(2/25·100) = **8 %** (unverändert) | „Entlassung offen" (`entlassungGeplant:null`, unverändert) | nein |

**`rsCockpit()`-Aggregat (Spec §4.1 Konsistenzcheck) — 0 Änderungen.** `erlos=Σts·plan`, `db=Σ(ts−kt)·plan`, `offen=Anzahl kostenzusage==="offen"` — **keine** dieser drei Summen liest `ist`. Cockpit-Leiste zeigt unverändert **`78k €` / `39 %` / `1`** offene Kostenzusage (Lydia), identisch zur Summe der drei (unveränderten) Karten-BWL-Werte.

**Cofounder-/Eigene Anzeigen, die `verweildauer.ist` direkt lesen (reine Anzeigewert-Konsequenz, 0 Code-Änderung, da diese Funktionen von dieser Spec nicht angefasst werden):**

| Fundstelle | Namespace | Alt (Dieter/Elke) | Neu (Dieter/Elke) | Lydia |
|---|---|---|---|---|
| `renderEinblick()` „Reha-Tag X/Y" | `.rp-*` (Cofounder, tabu — nur Anzeigewert ändert sich, kein Code-Zugriff) | 6/21 · 4/28 | **19/21 · 20/28** | 2/25 (unverändert) |
| `renderMtProtokolle()` „Tag X/Y" | `.mtp-*` (eigen, unangetastet) | 6/21 · 4/28 | **19/21 · 20/28** | 2/25 (unverändert) |
| `openRsDetail()` „Tag X / Y geplant · noch N Tage" | `rsDetail` (Nicht-Ziel dieser Spec) | noch 15 · noch 24 | **noch 2 · noch 8** | noch 23 (unverändert) |
| `rsChart()`/`rsSpark()` Interpolationspunkte `n=min(12,ist+1)` | eigen, unangetastet | 7 · 5 Punkte | **12 · 12 Punkte** (Deckel erreicht) | 3 Punkte (unverändert) |
| Stammdaten-Akte `paAkte()` „Entlassung geplant" | eigen, Nicht-Ziel | dstr(15) · dstr(24) | **dstr(2) · dstr(8)** | offen (unverändert) |

Keine dieser Zeilen erfordert einen Code-Eingriff — sie lesen bereits vor dieser Spec direkt `p.verweildauer.ist`/`p.entlassungGeplant` und zeigen automatisch die neuen Seed-Werte, sobald Task 1 committet ist. Reine Konsequenz, keine Struktur- oder Formeländerung.

---

## Harte Regeln (jeder Task, aus Spec + projektweitem `CLAUDE.md`)

- Cofounder-Namespaces **nicht anfassen**: `.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`. `#refOverlay` tabu. `p.kurzbericht`-Semantik tabu (weder gelesen noch geschrieben von der neuen Karte).
- `inReha[]` bekommt **keine neuen Felder** — die einzige Änderung an `inReha[]` ist der Wert-Tweak `verweildauer.ist`/`entlassungGeplant` bei Dieter Franke/Elke Sauer (Task 1, s. o.), Lydia Sommer bleibt komplett unverändert. `RS_BILLING` bekommt zwei neue Felder je Eintrag (`zimmer`, `verlaengerung`) — additiv, laut Spec-Kommentar „eigene Ergänzung, greift nicht in geteilte `inReha`-Felder ein", **nicht** Cofounder-geteilt.
- **Exakt 9 Keyframes** — verifiziert im Ist-Stand (`grep -c "@keyframes" index.html` = 9). Diese Runde führt **keine** neue ein (`.irb-*` ist ausschließlich statisches CSS, `lift` wird nicht neu referenziert und bleibt unverändert).
- `escapeHtml()` für jeden dynamisch eingefügten Text in allen neuen `.irb-*`-Bausteinen. Zahlen (`toLocaleString('de-DE')`) unverändert ohne Escaping, wie im übrigen Code Konvention.
- **Kein `Math.random`** — alles deterministisch (Seeds, `dstr()`).
- Reduced-motion-safe: diese Runde führt keine neuen Animationen ein.
- Beide Breiten prüfen: **390px und 1440px**. **0 Console-Errors** bei jedem Verifikationsschritt.
- Neue CSS ausschließlich als **kommentierter Block direkt vor `</style>`**, neuer Namespace `.irb-*` für alles genuin Neue. `.ir-card`/`.ir-head`/`.ir-stay` bleiben als Rahmen unverändert bestehen (Basisklassen weiter genutzt, nicht angefasst außer den in §6 der Spec explizit benannten Waisen).
- **Karten-Umbau + Waisen-Entfernung aus dem Markup sind atomar** (ein Commit, Task 3) — das alte `.ir-metrics`-Markup und der `rsSpark(p)`-Aufruf werden im selben Commit entfernt, in dem das neue `.irb-*`-Markup verdrahtet wird (kein Zwischenzustand mit doppelter/fehlender Darstellung).
- `rsSpark()` selbst, `.rsp-spark`/`.rsp-cap`-CSS **bleiben unangetastet im Quelltext liegen** — Cofounder-Namespace-Konvention `.rsp-*`, tabu unabhängig davon, ob der eigene Aufrufer entfällt (Spec §6). Nur der **eine Aufruf** in `renderInReha()` verschwindet.
- **Nur `index.html` staged** — niemals `docs/MicrosoftTeams-video.mp4` oder sonstige Dateien.

---

## Lanes

- **`claude-implementer`** (Haiku) — Task 1 (rein mechanisch: zwei additive `RS_BILLING`-Felder wörtlich einfügen, zwei Wert-Tweaks an bestehenden `inReha[]`-Feldern nach exakter Vorgabe, neuer CSS-Block wörtlich vor `</style>`).
- **`claude-implementer-pro`** (Sonnet) — Task 2 (`irbAmpel()`/`irbMeilenstein()`, additiv/unverdrahtet, aus Spec-Formeln — kein mechanisches Abtippen, Verzweigungslogik muss korrekt sitzen), Task 3 (**atomar**: Karten-Markup + `renderInReha()`-Umbau, Waisen-Entfernung aus dem Markup), Task 4 (CSS-Waisen-Sweep laut Spec-Aufräumliste §6 + finaler Abnahme-Sweep aller 11 Kriterien via Browser/CDP mit den oben neu berechneten Werten).

---

## Standard-Verifikation (nach jedem Task)

1. `grep -c "function " index.html` vor/nach vergleichen — keine unbeabsichtigt gelöschten Funktionen außer den in Task 4 explizit dokumentierten CSS-Entfernungen (Task 4 entfernt nur CSS-Regeln, keine Funktionen).
2. Browser: Seite neu laden, Console auf 0 Errors prüfen.
3. `#view-inreha` bei 390px und bei 1440px öffnen, auf Overflow/Lesbarkeit prüfen.
4. Cofounder-Bereiche (`#refOverlay`, `.mx-*`, `.rsp-*`, `.rp-*`, `.rpd-*`) unverändert gegentesten.
5. `openRsDetail()`/`rsDetail` (Klick auf eine Karte) unangetastet gegentesten — zwei Spalten unverändert.
6. `grep -c "@keyframes" index.html` — weiterhin genau **9**.
7. Commit mit klarer Botschaft, welcher Spec-Abschnitt umgesetzt wurde — **nur `index.html` staged, niemals `docs/MicrosoftTeams-video.mp4` oder sonstige Dateien**.
8. Jeder Task unten endet zusätzlich mit einer eigenen **Sichtprüfung**.

---

# Task 1 — Datengrundlage: `RS_BILLING`-Erweiterung + Verweildauer-Seed-Justierung + `.irb-*`-CSS

**Lane:** `claude-implementer` (drei vollständig vorgezeichnete, additive/wert-tweakende Bausteine: zwei neue Felder je `RS_BILLING`-Eintrag wörtlich aus der Spec, zwei Wert-Tweaks an exakt vorgegebenen `inReha[]`-Zeilen, CSS-Block wörtlich vor `</style>`; keine eigene Entscheidung nötig)

**Abhängigkeit:** keine — reine additive Datengrundlage + Wert-Tweaks. Bootet unverändert; die geänderten `verweildauer.ist`/`entlassungGeplant`-Werte werden ab diesem Commit sofort sichtbar in bereits bestehenden, unveränderten Anzeigen (`rsDetail`, `.rp-*`-Einblick, `.mtp-*`-Protokoll-Board — s. Konsequenz-Tabelle oben), da diese Funktionen `p.verweildauer.ist`/`p.entlassungGeplant` bereits vor dieser Spec direkt lesen. Das ist **erwartet**, keine Regression. Das neue `.irb-*`-CSS wird von keinem Markup erzeugt, solange Task 3 nicht gelaufen ist — rein optisch inert bis dahin.

**Bezug:** Spec §3.2 (`RS_BILLING`-Erweiterung), §5.1 (CSS), Architekten-Ergänzung oben (Verweildauer-Seed-Justierung).

**Dateien/Anker:** `grep -n "const RS_BILLING={\|personId:\"P09\"\|personId:\"P10\"\|entlassungGeplant:dstr(15)\|entlassungGeplant:dstr(24)\|^</style>" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `RS_BILLING` Zeile 6120, Dieter-Franke-Zeile 4555, Elke-Sauer-Zeile 4566, `entlassungGeplant:dstr(15)` Zeile 4563, `entlassungGeplant:dstr(24)` Zeile 4574, `</style>` Zeile 3129.

**Schritte:**

- [ ] **1.1** `grep`-Befehl oben ausführen, alle sechs Fundstellen bestätigen.

- [ ] **1.2 — `RS_BILLING` um `zimmer`/`verlaengerung` erweitern** (wörtlich aus Spec §3.2, alle Bestandsfelder inkl. `empf[]` unverändert):
```diff
 const RS_BILLING={
- "Dieter Franke":{tagessatz:890,kostenTag:520,kostenzusage:"liegt vor",zusatz:[{label:"Einzelzimmer-Zuschlag",eur:65}],empf:["Röntgen-Verlaufskontrolle Knie in 5 Tagen","Belastungsaufbau Richtung Vollbelastung","Lymphdrainage 2×/Woche fortführen"]},
- "Elke Sauer":{tagessatz:1250,kostenTag:760,kostenzusage:"n.a. (Selbstzahler)",zusatz:[{label:"SalutoCare-Suite",eur:420},{label:"Begleitperson",eur:180}],empf:["Schluckdiagnostik (FEES) Verlaufskontrolle","Logopädie intensivieren (täglich)","Kardiologisches Monitoring fortführen"]},
- "Lydia Sommer":{tagessatz:980,kostenTag:610,kostenzusage:"offen",zusatz:[{label:"Neuro-Wahlleistung",eur:140}],empf:["Karotis-Doppler zur Sekundärprävention","Ergotherapie Feinmotorik links ausbauen","Neuropsychologisches Assessment"]}
+ "Dieter Franke":{tagessatz:890,kostenTag:520,kostenzusage:"liegt vor",zimmer:"Einzelzimmer",verlaengerung:false,zusatz:[{label:"Einzelzimmer-Zuschlag",eur:65}],empf:["Röntgen-Verlaufskontrolle Knie in 5 Tagen","Belastungsaufbau Richtung Vollbelastung","Lymphdrainage 2×/Woche fortführen"]},
+ "Elke Sauer":{tagessatz:1250,kostenTag:760,kostenzusage:"n.a. (Selbstzahler)",zimmer:"SalutoCare-Suite",verlaengerung:true,zusatz:[{label:"SalutoCare-Suite",eur:420},{label:"Begleitperson",eur:180}],empf:["Schluckdiagnostik (FEES) Verlaufskontrolle","Logopädie intensivieren (täglich)","Kardiologisches Monitoring fortführen"]},
+ "Lydia Sommer":{tagessatz:980,kostenTag:610,kostenzusage:"offen",zimmer:"Doppelzimmer",verlaengerung:false,zusatz:[{label:"Neuro-Wahlleistung",eur:140}],empf:["Karotis-Doppler zur Sekundärprävention","Ergotherapie Feinmotorik links ausbauen","Neuropsychologisches Assessment"]}
 };
```

- [ ] **1.3 — Dieter Frankes `verweildauer.ist` + `entlassungGeplant` justieren** (Architekten-Ergänzung — Meilenstein-Vielfalt, alle anderen Felder dieser Zeilen wörtlich unverändert):
```diff
- {personId:"P09",name:"Dieter Franke",alter:66,achse:"Orthopädie",owner:"M. Belegung",icd:"M17.1 — Gonarthrose (sekundär)",aufnahme:dstr(-6),verweildauer:{ist:6,plan:21},barthel:{auf:45,akt:75},fim:{auf:78,akt:101},ziel:60,
+ {personId:"P09",name:"Dieter Franke",alter:66,achse:"Orthopädie",owner:"M. Belegung",icd:"M17.1 — Gonarthrose (sekundär)",aufnahme:dstr(-6),verweildauer:{ist:19,plan:21},barthel:{auf:45,akt:75},fim:{auf:78,akt:101},ziel:60,
```
```diff
-   entlassungGeplant:dstr(15),
+   entlassungGeplant:dstr(2),
```
  (`aufnahme:dstr(-6)` bewusst unverändert gelassen — gehört zur separaten Baustein-A-Invariante mit `personen[].historie`, außerhalb des Radius dieser Spec, s. Architekten-Ergänzung oben.)

- [ ] **1.4 — Elke Sauers `verweildauer.ist` + `entlassungGeplant` justieren** (analog):
```diff
- {personId:"P10",name:"Elke Sauer",alter:59,achse:"SalutoCare",owner:"Recovery Manager",icd:"I69.4 — Folgen Schlaganfall",aufnahme:dstr(-4),verweildauer:{ist:4,plan:28},barthel:{auf:30,akt:50},fim:{auf:62,akt:84},ziel:35,
+ {personId:"P10",name:"Elke Sauer",alter:59,achse:"SalutoCare",owner:"Recovery Manager",icd:"I69.4 — Folgen Schlaganfall",aufnahme:dstr(-4),verweildauer:{ist:20,plan:28},barthel:{auf:30,akt:50},fim:{auf:62,akt:84},ziel:35,
```
```diff
-   entlassungGeplant:dstr(24),
+   entlassungGeplant:dstr(8),
```

  **Lydia Sommer (P11) bleibt in diesem Task komplett unverändert** — keine Zeile dieses Eintrags wird angefasst.

- [ ] **1.5 — neuer CSS-Block vor `</style>`** (`.irb-*`-Namespace, wörtlich aus Spec §5.1):
```css
/* Runde 6 Punkt 4: .irb-* — In-Reha-Karte als BWL-Akte. Nutzt .ir-card/.ir-head/.ir-stay unverändert
   als Rahmen; kein neues Keyframe (statische Zustände). Achsen-Farbe (--acol) bleibt Akzent
   (Rand/Text/Punkt), nie Fläche — Kartenhintergrund bleibt var(--paper2)/var(--paper). */
.irb-tags{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:3px}
.irb-achse,.irb-zimmer{font:600 10.5px/1 Inter;letter-spacing:.02em;padding:3px 8px;border-radius:99px;background:var(--paper2)}
.irb-achse{border:1px solid var(--acol,var(--brass-line));color:var(--acol,var(--ink-soft))}
.irb-zimmer{border:1px solid var(--hair);color:var(--muted)}
.irb-stay .lbl span:last-child{display:flex;align-items:center;gap:5px}
.irb-gold-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--brass)}
.irb-bwl{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}
.irb-b{background:var(--paper2);border-radius:3px;border:1px solid var(--hair2);padding:8px 6px;text-align:center}
.irb-bv{font:700 17px/1 "Cormorant Garamond",Georgia,serif;color:var(--ink)}
.irb-bl{font:600 9.5px/1.2 Inter;letter-spacing:.03em;text-transform:uppercase;color:var(--muted);margin-top:3px}
.irb-ampel{display:flex;align-items:center;gap:6px;font:600 12px/1 Inter;padding:8px 10px;border-radius:8px;margin-bottom:10px}
.irb-dot{width:8px;height:8px;border-radius:50%;flex:0 0 auto}
.irb-ampel.ok{background:var(--sage-soft);color:var(--sage-deep)}.irb-ampel.ok .irb-dot{background:var(--sage-deep)}
.irb-ampel.warn{background:var(--brass-soft);color:var(--brass-deep)}.irb-ampel.warn .irb-dot{background:var(--brass)}
.irb-ampel.bad{background:var(--terra-soft);color:var(--terra)}.irb-ampel.bad .irb-dot{background:var(--terra)}
.irb-foot{display:flex;justify-content:space-between;gap:8px;font-size:12px;flex-wrap:wrap}
.irb-ms-l{font-weight:600;color:var(--ink-soft)}
.irb-ms-d{color:var(--faint)}
@media(max-width:600px){.irb-bwl{grid-template-columns:repeat(2,1fr)}}
```

- [ ] **1.6** `grep -n "zimmer:\"Einzelzimmer\"\|zimmer:\"SalutoCare-Suite\"\|zimmer:\"Doppelzimmer\"\|verweildauer:{ist:19,plan:21}\|verweildauer:{ist:20,plan:28}\|entlassungGeplant:dstr(2)\|entlassungGeplant:dstr(8)\|\.irb-tags{" index.html` ausführen — je 1 Fundstelle.

- [ ] **1.7** Standard-Verifikation bei 390px UND 1440px: App bootet unverändert (altes `renderInReha()` liest `RS_BILLING.zimmer`/`.verlaengerung` noch nicht, neue CSS-Klasse `.irb-*` wird von keinem Markup erzeugt). In der Browser-Konsole:
  - `RS_BILLING["Dieter Franke"].zimmer` ergibt `"Einzelzimmer"`, `RS_BILLING["Elke Sauer"].verlaengerung` ergibt `true`.
  - `inReha[0].verweildauer` ergibt `{ist:19,plan:21}`, `inReha[1].verweildauer` ergibt `{ist:20,plan:28}`, `inReha[2].verweildauer` ergibt `{ist:2,plan:25}` (Lydia unverändert).
  - `inReha[0].entlassungGeplant` ergibt `dstr(2)`, `inReha[1].entlassungGeplant` ergibt `dstr(8)`.
  - Optisch **sichtbar geändert, aber korrekt**: In-Reha-Karten zeigen weiterhin das **alte** Markup (Barthel/FIM-Plaketten, Sparkline) — das ist erwartet, `renderInReha()` wird erst in Task 3 umgebaut. Öffnet man jedoch eine Karte (`openRsDetail`) oder das Zuweiser-Portal-„Einblick" oder „Mein Tag" → Protokoll-Board, zeigen diese unverändert-gebliebenen Views bereits „Tag 19/21" bzw. „Tag 20/28" statt der alten Werte — das ist die dokumentierte, erwartete Konsequenz (s. Architekten-Ergänzung oben), keine Regression.
  - 0 Console-Errors.

**Sichtprüfung:** Visuell ändert sich an der In-Reha-Karte selbst **nichts** (altes Markup liest die neuen `RS_BILLING`-Felder nicht, neues CSS wird nicht erzeugt). In `rsDetail` (Klick auf Dieter Franke oder Elke Sauer) sowie im Zuweiser-Portal „Einblick" und in „Mein Tag" → Protokoll-Board zeigen sich bereits die neuen Tag-Werte (19/21, 20/28) — erwartete, dokumentierte Konsequenz der Seed-Justierung, kein Bug.

**Commit:** `feat: In-Reha-BWL-Akte Datengrundlage — RS_BILLING.zimmer/.verlaengerung (additiv), Verweildauer-Seed-Justierung Dieter Franke/Elke Sauer für Meilenstein-Vielfalt, .irb-*-CSS-Block (Runde 6 Punkt 4, §3.2/§5.1 + Architekten-Ergänzung)`

---

# Task 2 — Neue Funktionen: `irbAmpel()` + `irbMeilenstein()` (additiv, unverdrahtet)

**Lane:** `claude-implementer-pro` (Verzweigungslogik aus Spec-Formeln korrekt umsetzen — Schwellenwerte `ist<2`/`rest<=3`/`rest<=10`/`ist<zbTag` müssen exakt sitzen, kein mechanisches Abtippen)

**Abhängigkeit:** Task 1 (`p.verweildauer.ist`/`.plan`/`p.entlassungGeplant`/`bill.kostenzusage` müssen die justierten Werte tragen, damit die Konsolen-Verifikation unten die in der Architekten-Ergänzung vorgerechneten Werte liefert).

**Bezug:** Spec §4.2 (Kostenzusage-Ampel), §4.3 (Nächster Meilenstein).

**Dateien/Anker:** `grep -n "^function renderInReha" index.html` vor Bearbeitung ausführen und Zeile neu bestätigen. Bei Plan-Erstellung: `renderInReha()` beginnt vor Task 1 bei Zeile 6258. Der neue `.irb-*`-CSS-Block aus Task 1 (22 Zeilen) wird **vor** `</style>` (Zeile 3129) eingefügt — das liegt im Dokument deutlich **vor** Zeile 6258, verschiebt `renderInReha()` also automatisch nach unten, auf ca. Zeile 6280. Die beiden Wert-Tweaks/additiven Felder in Task 1 behalten dagegen ihre Zeilenzahl (reine In-Place-Werteänderungen). **Exakte Zeile in jedem Fall per `grep` neu bestimmen**, nicht auf diese Schätzung verlassen.

**Schritte:**

- [ ] **2.1** `grep`-Befehl oben ausführen, exakte aktuelle Zeile von `function renderInReha(){` bestätigen — beide neuen Funktionen werden **direkt davor** eingefügt.

- [ ] **2.2 — `irbAmpel()`/`irbMeilenstein()` einfügen**, direkt vor `function renderInReha(){` (wörtlich aus Spec §4.2/§4.3):
```js
/* Runde 6 Punkt 4 (§4.2/§4.3): irbAmpel()/irbMeilenstein() für die neue BWL-Karte.
   Additiv — noch von keinem Aufrufer genutzt (altes renderInReha() bleibt bis Task 3 unverändert
   aktiv); Verdrahtung + Markup-Umbau folgt atomar in Task 3. */
function irbAmpel(bill,p){
 const kz=bill.kostenzusage||"—";
 if(kz==="liegt vor")return{cls:"ok",label:"liegt vor"};
 if(kz!=="offen")return{cls:"ok",label:"kein Kostenträger nötig"}; // "n.a. (Selbstzahler)" u.ä.
 return p.verweildauer.ist<2?{cls:"warn",label:"angefragt"}:{cls:"bad",label:"fehlt – kritisch"};
}
function irbMeilenstein(p){
 const rest=p.verweildauer.plan-p.verweildauer.ist;
 if(rest<=3)return{label:"Entlassgespräch",detail:p.entlassungGeplant?"am "+p.entlassungGeplant:"Termin abstimmen"};
 if(rest<=10)return{label:"Verlängerungsentscheid",detail:"spätestens in "+(rest-3)+" Tagen"};
 const zbTag=14;
 return{label:"Zwischenbericht fällig",detail:p.verweildauer.ist<zbTag?"in "+(zbTag-p.verweildauer.ist)+" Tagen (Tag 14)":"jetzt (Tag 14 erreicht)"};
}
```

- [ ] **2.3** `grep -n "function irbAmpel\|function irbMeilenstein" index.html` ausführen — je 1 Fundstelle.

- [ ] **2.4 — Standard-Verifikation bei 390px UND 1440px:** App bootet unverändert (altes `renderInReha()` ruft die neuen Funktionen noch nicht auf), 0 Console-Errors. Zusätzlich in der Browser-Konsole, rein funktional ohne Rendering — **muss exakt den in der Architekten-Ergänzung vorgerechneten Werten entsprechen**:
  - `irbAmpel(RS_BILLING["Dieter Franke"],inReha[0])` ergibt `{cls:"ok",label:"liegt vor"}`.
  - `irbAmpel(RS_BILLING["Elke Sauer"],inReha[1])` ergibt `{cls:"ok",label:"kein Kostenträger nötig"}`.
  - `irbAmpel(RS_BILLING["Lydia Sommer"],inReha[2])` ergibt `{cls:"bad",label:"fehlt – kritisch"}`.
  - `irbMeilenstein(inReha[0])` ergibt `{label:"Entlassgespräch",detail:"am "+dstr(2)}`.
  - `irbMeilenstein(inReha[1])` ergibt `{label:"Verlängerungsentscheid",detail:"spätestens in 5 Tagen"}`.
  - `irbMeilenstein(inReha[2])` ergibt `{label:"Zwischenbericht fällig",detail:"in 12 Tagen (Tag 14)"}`.
  - Zusatz-Grenzfall-Check (nicht Teil der Live-Seeds, nur Formel-Verifikation — belegt den `rest<=3`-Zweig **ohne** gesetztes `entlassungGeplant`, Fallback-Text): `irbMeilenstein({verweildauer:{ist:19,plan:21},entlassungGeplant:null})` ergibt `{label:"Entlassgespräch",detail:"Termin abstimmen"}` (rest=2, `entlassungGeplant` fehlt → Fallback statt Datum).

**Sichtprüfung:** Visuell ändert sich in diesem Task **nichts** — beide Funktionen existieren und liefern bei direktem Konsolenaufruf bereits die korrekten, oben vorgerechneten Werte, werden aber von keinem Renderer aufgerufen (das kommt in Task 3).

**Commit:** `feat: irbAmpel()/irbMeilenstein() — Kostenzusage-Ampel + Meilenstein-Logik für die BWL-Karte (additiv, noch nicht verdrahtet) (Runde 6 Punkt 4, §4.2/§4.3)`

---

# Task 3 — Karten-Markup + `renderInReha()`-Umbau (atomar)

**Lane:** `claude-implementer-pro` (kritischster Task: vollständiger Innenraum-Austausch der `.ir-card` in einem Commit — Waisen-Markup raus, `.irb-*`-Struktur + Verdrahtung von `irbAmpel()`/`irbMeilenstein()`/`RS_BILLING` rein)

**Abhängigkeit:** Task 2 (`irbAmpel()`/`irbMeilenstein()` müssen existieren, sonst `ReferenceError` beim ersten `renderInReha()`-Aufruf nach dem Umbau), Task 1 (`RS_BILLING.zimmer`/`.verlaengerung`, justierte `verweildauer`/`entlassungGeplant`).

**Warum atomar:** Task 2 liefert `irbAmpel()`/`irbMeilenstein()` bereits additiv und unverdrahtet — das alte `renderInReha()` ruft sie nicht auf, es gibt also keinen Zwischenzustand, in dem beide Fassungen um denselben Zustand konkurrieren. Dieser Task schaltet in einem einzigen Commit von altem auf neues Karten-Markup um: `.ir-metrics`-Block + `rsSpark(p)`-Aufruf raus, `.irb-*`-Struktur rein. Ein Aufsplitten hätte zwangsläufig einen Zwischenstand mit doppeltem oder kaputtem Markup zur Folge.

**Bezug:** Spec §5 (`.irb-*`-Markup-Skizze), §5.2 (`renderInReha()`-Diff-Skizze), §6 (Was entfällt — HTML-Teil).

**Dateien/Anker:** `grep -n "^function renderInReha" index.html` vor Bearbeitung ausführen und Zeile neu bestätigen. Bei Plan-Erstellung (Schätzung nach Task 1+2, per `grep` zu bestätigen): `renderInReha()` beginnt bei ca. Zeile 6296 (Ist-Stand vor dieser Runde 6258, +22 Zeilen durch den `.irb-*`-CSS-Block aus Task 1, +16 Zeilen durch `irbAmpel()`/`irbMeilenstein()` aus Task 2.2).

**Schritte:**

- [ ] **3.1** `grep`-Befehl oben ausführen, den vollständigen Körper der aktuellen `renderInReha()` neu lesen (Bestätigung, dass sie noch der alten Fassung mit `.ir-metrics`/`rsSpark(p)` entspricht).

- [ ] **3.2 — `renderInReha()` vollständig ersetzen** (Spec §5/§5.2 — Kopfzeile mit Sternen/Achse-Pill/Zimmer-Chip, BWL-Zeile, Kostenzusage-Ampel, Meilenstein-Fußzeile; `.ir-metrics`-Block + `rsSpark(p)`-Aufruf entfallen):
```diff
 function renderInReha(){
  const el=document.getElementById("inrehaGrid");if(!el)return;
  const _ck=document.getElementById("rsCockpit");if(_ck)_ck.innerHTML=rsCockpit();
  el.innerHTML=inReha.map((p,i)=>{
-  const rest=Math.max(0,p.verweildauer.plan-p.verweildauer.ist);
-  const stayPct=Math.min(100,Math.round(p.verweildauer.ist/p.verweildauer.plan*100));
-  const col=ACHSE_COL[p.achse]||"var(--unklar)";
-  const dB=p.barthel.akt-p.barthel.auf,dF=p.fim.akt-p.fim.auf;
-  return `<button class="ir-card${p.achse==="SalutoCare"?" hot":""}" style="--acol:${col}" onclick="openRsDetail(${i})">
-    <div class="ir-head"><span class="ava">${initialen(p.name)}</span>
-      <div class="ir-htxt"><h3>${escapeHtml(p.name)} <span class="ir-age">(${p.alter})</span></h3>
-      <div class="ir-icd"><span class="ach-dot"></span>${escapeHtml(p.achse)} · ${escapeHtml(p.icd)}</div></div>
-      <span class="ir-chev">›</span></div>
-    <div class="ir-metrics">
-      <div class="ir-m"><div class="ir-mv num">${p.barthel.akt}<span class="ir-delta">▲${dB}</span></div><div class="ir-ml">Barthel</div></div>
-      <div class="ir-m"><div class="ir-mv num">${p.fim.akt}<span class="ir-delta">▲${dF}</span></div><div class="ir-ml">FIM</div></div>
-      <div class="ir-m"><div class="ir-mv num">${p.ziel}%</div><div class="ir-ml">Reha-Ziel</div></div>
-    </div>
-    ${rsSpark(p)}
-    <div class="ir-stay"><div class="lbl"><span>Verweildauer</span><span>Tag ${p.verweildauer.ist} / ${p.verweildauer.plan} · noch ${rest} T</span></div>
-      <div class="track"><div class="fill" style="width:${stayPct}%"></div></div></div>
-   </button>`;
+  const col=ACHSE_COL[p.achse]||"var(--unklar)";
+  const bill=RS_BILLING[p.name]||{};
+  const stayPct=Math.min(100,Math.round(p.verweildauer.ist/p.verweildauer.plan*100));
+  const ts=bill.tagessatz||0,kt=bill.kostenTag||0;
+  const erlösPlan=ts*p.verweildauer.plan,marge=ts?Math.round((ts-kt)/ts*100):0;
+  const zusatzTag=(bill.zusatz||[]).reduce((s,z)=>s+z.eur,0);
+  const ampel=irbAmpel(bill,p);
+  const ms=irbMeilenstein(p);
+  const sterne=sterneVon(p),kt_=person(p.personId)?.kt||"—";
+  return `<button class="ir-card${p.achse==="SalutoCare"?" hot":""}" style="--acol:${col}" onclick="openRsDetail(${i})">
+    <div class="ir-head"><span class="ava">${initialen(p.name)}</span>
+     <div class="ir-htxt"><h3>${escapeHtml(p.name)} <span class="ir-age">(${p.alter})</span></h3>
+      <div class="irb-tags">${sterneHtml(sterne)}<span class="irb-achse">${escapeHtml(p.achse)}</span><span class="irb-zimmer">${escapeHtml(bill.zimmer||"—")}</span></div></div>
+     <span class="ir-chev">›</span></div>
+    <div class="ir-stay irb-stay"><div class="lbl"><span>Tag ${p.verweildauer.ist} von ${p.verweildauer.plan}</span>
+      <span>${p.entlassungGeplant?escapeHtml(p.entlassungGeplant):"Entlassung offen"}${bill.verlaengerung?"<span class='irb-gold-dot' title='Verlängerung möglich'></span>":""}</span></div>
+      <div class="track"><div class="fill" style="width:${stayPct}%"></div></div></div>
+    <div class="irb-bwl">
+      <div class="irb-b"><div class="irb-bv num">${ts.toLocaleString('de-DE')} €</div><div class="irb-bl">Erlös/Tag</div></div>
+      <div class="irb-b"><div class="irb-bv num">${erlösPlan.toLocaleString('de-DE')} €</div><div class="irb-bl">Gesamterlös (Plan)</div></div>
+      <div class="irb-b"><div class="irb-bv num">${marge} %</div><div class="irb-bl">DB-Marge</div></div>
+      <div class="irb-b"><div class="irb-bv num">${zusatzTag.toLocaleString('de-DE')} €</div><div class="irb-bl">Zusatzerlöse/Tag</div></div>
+    </div>
+    <div class="irb-ampel ${ampel.cls}"><span class="irb-dot"></span>Kostenzusage ${escapeHtml(ampel.label)} · ${escapeHtml(kt_)}</div>
+    <div class="irb-foot"><span class="irb-ms-l">${escapeHtml(ms.label)}</span><span class="irb-ms-d">${escapeHtml(ms.detail)}</span></div>
+   </button>`;
  }).join("")||"<p class='empty'>Aktuell keine Patienten in Behandlung.</p>";
 }
```
  (`rest`/`dB`/`dF`/`ACHSE_COL`-Zeile: `col` bleibt erhalten (weiterhin für `--acol` gebraucht), `rest`/`dB`/`dF` entfallen ersatzlos — `rest` wird nicht mehr direkt gebraucht (nur noch intern in `irbMeilenstein()`), `dB`/`dF`/Barthel/FIM-Werte gehören nicht mehr zur Karte, s. Spec §6.)

- [ ] **3.3** `grep -n "class=\"ir-metrics\"\|rsSpark(p)\|class=\"irb-bwl\"\|class=\"irb-ampel\"\|class=\"irb-foot\"" index.html` ausführen — `ir-metrics`/`rsSpark(p)` **kein** Treffer mehr innerhalb `renderInReha()` (rsSpark-Funktionsdefinition selbst bleibt bestehen, s. Regeln oben — dieser Grep findet nur den Aufruf `rsSpark(p)`, nicht `function rsSpark`); `irb-bwl`/`irb-ampel`/`irb-foot` je 1 Fundstelle.

- [ ] **3.4 — Standard-Verifikation bei 390px UND 1440px, ausführlich (dieser Task ist der riskanteste):**
  - Navigation zu `#view-inreha`: drei Karten, jede mit Kopfzeile (Name+Alter, 5 Sterne, Achse-Pill, Zimmer-Chip), Verweildauer-Band, 4er-BWL-Zeile, Kostenzusage-Ampel, Meilenstein-Fußzeile — **kein** Barthel/FIM/Reha-Ziel mehr auf der Karte, keine Sparkline.
  - Dieter Franke: `890 €`/`18.690 €`/`42 %`/`65 €`; Ampel Jade „liegt vor · PKV"; Fußzeile „Entlassgespräch" · „am " + heutiges Datum+2 Tage; Band 90 % gefüllt, „Tag 19 von 21", Entlassdatum ohne Gold-Punkt.
  - Elke Sauer: `1.250 €`/`35.000 €`/`39 %`/`600 €`; Ampel Jade „kein Kostenträger nötig · Selbstzahler"; Fußzeile „Verlängerungsentscheid" · „spätestens in 5 Tagen"; Band 71 % gefüllt, „Tag 20 von 28", Entlassdatum **mit** Gold-Punkt (Tooltip „Verlängerung möglich").
  - Lydia Sommer: `980 €`/`24.500 €`/`38 %`/`140 €`; Ampel **Zinnober** „fehlt – kritisch · PKV"; Fußzeile „Zwischenbericht fällig" · „in 12 Tagen (Tag 14)"; Band 8 % gefüllt, „Tag 2 von 25", „Entlassung offen" (kein Datum).
  - Cockpit-Leiste oben unverändert `78k €`/`39 %`/`1`.
  - Klick auf jede Karte öffnet weiterhin `rsDetail` mit den zwei unveränderten Spalten (Erfolge & Verlauf inkl. Barthel/FIM/Sparkline/Chart weiterhin dort vorhanden; Wirtschaftlichkeit & Abrechnung).
  - 390px: `.irb-bwl` fällt auf 2×2, `.irb-tags`/`.irb-foot` umbrechen ohne horizontalen Overflow. 1440px: 4-spaltige BWL-Zeile.
  - 0 Console-Errors.

**Sichtprüfung:** Die In-Reha-Karten zeigen jetzt durchgehend die neue BWL-Akte — Kopfzeile mit Sternen/Achse/Zimmer, Verweildauer-Band mit Entlassdatum + optionalem Gold-Punkt, 4er-BWL-Zeile, Kostenzusage-Ampel, Meilenstein-Fußzeile mit sichtbar unterschiedlichem Text je Karte (Entlassgespräch/Verlängerungsentscheid/Zwischenbericht fällig). `rsDetail` bleibt beim Klick unverändert die Vertiefung mit Barthel/FIM.

**Commit:** `feat: renderInReha()-Umbau — .ir-metrics/rsSpark(p)-Aufruf entfernt, neue .irb-*-BWL-Karte verdrahtet (Kopfzeile+Sterne+Zimmer, BWL-Zeile, Kostenzusage-Ampel, Meilenstein-Fußzeile) (Runde 6 Punkt 4, §5/§5.2/§6)`

---

# Task 4 — CSS-Waisen-Sweep + finaler Abnahme-Sweep

**Lane:** `claude-implementer-pro` (Verifikations-lastiger Abschluss-Task; falls dabei ein kleiner Fund auftaucht, direkt hier fixen, kein neuer Task nötig — bei größeren Funden: stoppen, im Report melden statt selbst zu improvisieren)

**Abhängigkeit:** braucht alle vorherigen Tasks (1–3).

**Bezug:** Spec §6 (Waisen-Tabelle), §7 (Abnahmekriterien, vollständig, mit den oben neu berechneten Werten statt der Spec-Rohwerte für Meilenstein/Verweildauer-Band).

**Dateien/Anker:** `grep -n "\.ir-metrics{\|\.ir-m{\|\.ir-mv{\|\.ir-delta{\|\.ir-ml{\|\.ir-icd{\|/\* — REHA · Patienten-Etiketten" index.html` vor Bearbeitung ausführen — alle Fundstellen der Aufräumliste bestätigen (`.ir-icd` erscheint zweimal: Basis + Desktop-Ergänzung).

**Schritte:**

- [ ] **4.1** `grep`-Befehl oben ausführen, jede Fundstelle im Editor öffnen und mit der Spec-§6-Tabelle abgleichen.

- [ ] **4.2 — vollständig verwaiste Regeln löschen** (Spec §6 — kein Verwender mehr außerhalb des in Task 3 entfernten alten Karten-Markups; Zeilennummern hier nur zur Orientierung, vor dem Löschen per `grep` neu bestätigen):

  **a) `.ir-icd`-Basisregel** (früher-Stand-Zeile 647, direkt im frühen `.ir-card`/`.ir-head`-Grundblock):
```diff
 .ir-head h3{font:600 17px/1.2 Inter;margin:0}
-.ir-icd{font:500 12px/1.3 Inter;color:var(--muted);margin:2px 0 12px}
 .ring{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:74px}
```

  **b) `.ir-metrics`/`.ir-m`/`.ir-mv`/`.ir-delta`/`.ir-ml`/`.ir-icd` (Desktop-Ergänzung)** — WS3-Block, früher-Stand-Zeilen 1156/1159–1163 (2-Leerzeichen-Einrückung im Ist-Stand beibehalten, Block liegt in einer `@media`-Regel):
```diff
   .ir-htxt h3{font:700 17px/1.15 "Cormorant Garamond",Georgia,serif;margin:0;color:var(--ink)}
   .ir-age{color:var(--faint);font-weight:400;font-size:14px}
-  .ir-icd{font:400 12px/1.3 Inter;color:var(--muted);margin-top:2px;display:flex;align-items:center}
   .ir-chev{color:var(--brass);font-size:22px;line-height:1;opacity:.5;transition:transform .16s ease,opacity .16s ease}
   @media(hover:hover){.ir-card:hover .ir-chev{opacity:1;transform:translateX(3px)}}
-  .ir-metrics{display:flex;gap:10px;margin-bottom:14px}
-  .ir-m{flex:1;background:var(--paper2);border-radius:11px;padding:9px 6px;text-align:center}
-  .ir-mv{font:700 20px/1 "Cormorant Garamond",Georgia,serif;color:var(--ink);display:flex;align-items:baseline;justify-content:center;gap:4px}
-  .ir-delta{font:700 10.5px/1 Inter;color:var(--sage-deep)}
-  .ir-ml{font:600 10.5px/1 Inter;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin-top:4px}
   .ir-stay .lbl{display:flex;justify-content:space-between;font:600 11px/1 Inter;letter-spacing:.03em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
```

  **c) `.ir-m`-Ergänzung im „REHA · Patienten-Etiketten"-Block** (früher-Stand-Zeile 2603 — Kommentar bleibt stehen, beschreibt weiterhin gültige Nachbarregeln `.ir-stay .track`/`.fill`, nur die `.ir-m`-Zeile selbst entfällt):
```diff
 .ir-m{border-radius:3px;border:1px solid var(--hair2)}
```
  → diese eine Zeile ersatzlos löschen (Kommentarblock darüber unverändert lassen, er beschreibt auch weiterhin `.ir-stay`).

- [ ] **4.3** `grep -n "\.ir-metrics\|\.ir-m{\|\.ir-mv{\|\.ir-delta{\|\.ir-ml{\|\.ir-icd{" index.html` erneut ausführen — **kein** Treffer mehr im gesamten Dokument.

- [ ] **4.4** `grep -c "@keyframes" index.html` — weiterhin genau **9**.

- [ ] **4.5 — Gesamt-Abnahme-Sweep, alle 11 Kriterien der Spec (§7) im Browser (idealerweise per CDP/Browser-Tool) durchspielen, bei 390px UND 1440px — mit den in der Architekten-Ergänzung neu berechneten Werten statt der ursprünglichen Spec-Rohwerte für Meilenstein/Verweildauer-Band:**
  1. **BWL-Zeile (unverändert gegenüber Spec, s. Konsequenz-Neuberechnung):** Dieter Franke `890 €`/`18.690 €`/`42 %`/`65 €`; Elke Sauer `1.250 €`/`35.000 €`/`39 %`/`600 €`; Lydia Sommer `980 €`/`24.500 €`/`38 %`/`140 €`.
  2. **Kostenzusage-Ampel (unverändert):** Dieter Franke Jade „liegt vor · PKV"; Elke Sauer Jade „kein Kostenträger nötig · Selbstzahler"; Lydia Sommer **Zinnober** „fehlt – kritisch · PKV".
  3. **Meilenstein (neu — jetzt divers, statt 3× identisch):** Dieter Franke „Entlassgespräch" · „am " + heute+2 Tage; Elke Sauer „Verlängerungsentscheid" · „spätestens in 5 Tagen"; Lydia Sommer „Zwischenbericht fällig" · „in 12 Tagen (Tag 14)" — drei sichtbar unterschiedliche Meilenstein-**Label**, nicht nur unterschiedliche Tage-Zahlen bei identischem Label.
  4. **Verweildauer-Band (neu für Dieter/Elke):** Dieter **90 %** gefüllt + „Entlassung {heute+2 Tage}" ohne Gold-Punkt; Elke **71 %** + „Entlassung {heute+8 Tage}" **mit** Gold-Punkt (Tooltip „Verlängerung möglich"); Lydia unverändert 8 % + „Entlassung offen" (kein Datum).
  5. **Kopfzeile:** je Karte 5 gefüllte Sterne, Achse-Pill farblich nach `ACHSE_COL` (Ortho/SalutoCare/Neuro unterscheidbar), Zimmer-Chip „Einzelzimmer"/„SalutoCare-Suite"/„Doppelzimmer".
  6. **`rsCockpit`-Konsistenz (unverändert):** Cockpit-Leiste oben zeigt weiterhin `78k €`/`39 %`/`1` offene Kostenzusage — identisch zur Summe der 3 (unveränderten) Karten-Werte.
  7. **Klick unverändert:** jede Karte öffnet weiterhin `openRsDetail(i)` → `rsDetail` mit unveränderten zwei Spalten (Erfolge & Verlauf inkl. Barthel/FIM/Chart weiterhin sichtbar dort / Wirtschaftlichkeit & Abrechnung, jetzt mit „Tag 19/21 geplant · noch 2 Tage" bzw. „Tag 20/28 geplant · noch 8 Tage" statt der alten Werte — erwartete Konsequenz).
  8. **Entfernte Elemente weg:** keine `.ir-metrics`/`.ir-m`/`.ir-mv`/`.ir-delta`/`.ir-ml`/`.rsp-spark`-Elemente mehr im Karten-DOM (wohl aber `rsSpark()`/`.rsp-spark`-CSS unverändert im Quelltext vorhanden, §6).
  9. **Mobile (390px):** `.irb-bwl` 2×2, `.irb-tags`/`.irb-foot` umbrechen ohne horizontalen Overflow; Desktop (1440px) 4-spaltige BWL-Zeile.
  10. **0 Console-Errors**, beide Breiten; `grep -c "@keyframes" index.html` unverändert 9.
  11. **Unberührte Bereiche:** `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `#refOverlay`, `p.kurzbericht`, `.mtp-*`-Protokoll-Board (zeigt neue „Tag X/Y"-Werte als reine Anzeigekonsequenz, kein Code dort geändert), `inReha[]`-Struktur (nur die zwei dokumentierten Wert-Tweaks aus Task 1, keine neuen/gelöschten Felder) unverändert.

**Sichtprüfung:** Kein CSS-Orphan aus dem alten Barthel/FIM-Kartenlayout mehr im Dokument; alle 11 Abnahmekriterien der Spec sind im Browser bei beiden Breiten grün (mit den durch die Seed-Justierung aktualisierten Meilenstein-/Verweildauer-Werten); die Cofounder-Bereiche und `rsDetail` sind unangetastet; die In-Reha-Karten zeigen drei sichtbar unterschiedliche Meilensteine.

**Commit:** `chore: .ir-metrics/.ir-m/.ir-mv/.ir-delta/.ir-ml/.ir-icd-CSS-Waisen entfernt (In-Reha-Karte vollständig auf .irb-* umgestellt), Gesamt-Abnahme-Sweep aller 11 Kriterien grün inkl. Meilenstein-Vielfalt (Runde 6 Punkt 4, §6/§7)`

---

## Reihenfolge / Abhängigkeiten

```
Task 1 (Datengrundlage: RS_BILLING.zimmer/.verlaengerung, Verweildauer-Seed-Justierung, .irb-*-CSS)
      │  additiv/wert-tweakend, bootbar, altes Markup liest neue Felder noch nicht
      ▼
Task 2 (irbAmpel()/irbMeilenstein(), additiv/unverdrahtet) ── braucht Task 1 für korrekte
      │                                                        Konsolen-Verifikationswerte
      ▼
Task 3 (Karten-Markup + renderInReha()-Umbau, ATOMAR) ── braucht irbAmpel()/irbMeilenstein()
      │                                                    aus Task 2 + RS_BILLING-Felder aus Task 1
      ▼
Task 4 (CSS-Waisen-Sweep + Gesamt-Abnahme)
```

Sequentiell in dieser Reihenfolge ausführen (eine Datei, nie parallel). Task 1 ist reine additive Datengrundlage inkl. der beiden Wert-Tweaks — bootbar, ohne dass eine bestehende Funktion die neue CSS-Klasse liest (die Verweildauer-Werte selbst sind aber ab Task 1 sofort in bereits bestehenden Views sichtbar, s. Konsequenz-Tabelle). Task 2 ist ebenfalls additiv und bootbar. Task 3 ist der einzige Bruchpunkt (Umschalten von altem auf neues Karten-Markup) und deshalb bewusst atomar. Task 4 schließt mit dem CSS-Aufräumen und der vollständigen Abnahme ab.

---

## Nicht-Ziele dieser Runde (aus Spec §8, hier zur Erinnerung)

- `rsDetail`-Innenleben (`openRsDetail()`, `rsErfolg`/`rsWirt`/`rsZwischenstand`, `rsChart()`, `devBar()`) bleibt vollständig unverändert — diese Spec ändert ausschließlich, was auf der Karte davor zu sehen ist.
- `.mtp-*`-Protokoll-Board unberührt (Code) — zeigt lediglich die neuen Verweildauer-Werte als Anzeigekonsequenz.
- Cofounder-Bereiche (`.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `#refOverlay`) unberührt, inklusive `rsSpark()` selbst (Aufruf entfernt, Funktion/CSS bleiben liegen).
- `inReha[]` bekommt keine neuen Felder — nur die zwei dokumentierten Wert-Tweaks (`verweildauer.ist`/`entlassungGeplant` bei Dieter Franke/Elke Sauer).
- `drgStatus` wird nicht bereinigt/zusammengeführt — bleibt neben `RS_BILLING.kostenzusage` bestehen, nur Letzteres wird von der neuen Ampel gelesen.
- Keine Änderung an `rsCockpit()` selbst — Formeln bleiben identisch, Aggregat-Werte bleiben durch die Seed-Justierung sogar unverändert (s. Konsequenz-Neuberechnung).
- `p.aufnahme`/`personen[].historie` werden bewusst **nicht** an die neuen `verweildauer.ist`-Werte angeglichen (Baustein-A-Territorium, außerhalb des Radius dieser Spec — dokumentierte, akzeptierte Seed-Lücke, s. Architekten-Ergänzung).
- Keine neuen Keyframes, keine neuen Datenarray-Felder auf `inReha[]` außer den zwei Wert-Tweaks, `escapeHtml` für alle dynamischen Inhalte, kein `Math.random`, 390px und 1440px verifizieren, 0 Console-Errors.
