# Runde 6, Punkt 4 — In-Reha-Karteikarte als BWL-Akte

**Bezug:** Sechste Runde, Nutzer-Feedback-Punkt 4. Nutzer wörtlich: „Für In Reha muss die Akte
optisch/ästhetisch schöner werden UND die wichtigsten Fakten beinhalten, die aus betriebswirtschaftlicher
Sicht für den Patienten in der Reha wichtig sind, damit man den Überblick hat." Design-Entscheidung an
Claude delegiert. Baut auf keinem der Runde-6-Vorgänger-Specs auf (P1–P3 betreffen Anfrage-Triage/
Schritt-Werkzeuge/Team-Cockpit, andere Views), ist aber die vierte in derselben CSS-Einfügereihenfolge.

**Leitplanken (aus [../../../CLAUDE.md](../../../CLAUDE.md)):** `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*` +
`#refOverlay` + `p.kurzbericht`-Semantik tabu; `inReha[]` nur additiv (Cofounder-geteilt); exakt
9 `@keyframes` (bestätigt, `grep -c "@keyframes" index.html` = 9 — diese Spec fügt keine neue Animation
hinzu, `lift` wird unverändert wiederverwendet); Jade-Apotheke-Identität, Etiketten-Doppelrahmen (`.card`/
`.ir-card`); Cormorant-Numerale; Gold nie als Textfarbe (`--brass-deep` für Text, `--brass` nur Grafik);
Daten-Hues (Achsen-Farben) nie als Fläche, nur Akzent (Rand/Punkt); `escapeHtml()`; kein `Math.random`;
390px + 1440px, 0 Console-Errors; nur synthetische Daten.

---

## 1. Problem

Die aktuelle `.ir-card` ([index.html:6266-6279](../../../index.html#L6266)) zeigt pro Patient Barthel/FIM/
Reha-Ziel-Plaketten + Barthel-Verlaufs-Sparkline + Verweildauer-Band. Das ist **funktionale, aber
redundante** Information: dieselben Barthel/FIM-Werte (inkl. Delta) erscheinen im `rsDetail`-Overlay
([index.html:6144-6152](../../../index.html#L6144)) als große KPI-Ringe + Entwicklungsbalken + vollem
Verlaufs-Chart — die Karte dupliziert nur eine kleinere Version davon. Was auf der Karte dagegen **fehlt**,
ist die Wirtschaftlichkeitssicht: Erlös, Marge und Kostenzusage-Status stecken ausschließlich in der
zweiten `rsDetail`-Spalte („Wirtschaftlichkeit & Abrechnung"), die einen Klick + Scroll entfernt liegt.
Wer als Leitung `#view-inreha` überfliegt, sieht klinischen Fortschritt (den vor allem Case-Management
braucht), aber keine der Zahlen, die betriebswirtschaftlich den Überblick geben — genau die vom Nutzer
benannte Lücke.

## 2. Zielbild

Die Karteikarte wird zur **BWL-Akte auf einen Blick**; `rsDetail` bleibt unverändert die Vertiefung
(Barthel/FIM-Verlauf, Kurzbericht, Laborwerte, Stammdaten-Akte). Neuer Namespace `.irb-*`, Struktur pro
Karte (Klick weiterhin `onclick="openRsDetail(i)"`, unverändert):

1. **Kopfzeile:** Name + Alter (bestehend) · Sterne (`sterneVon`/`sterneHtml`, bisher nicht auf der Karte)
   · Achse-Pill (Rand+Text in `--acol`, neutraler Grund — keine Farbfläche) · Zimmerkategorie-Chip.
2. **Verweildauer-Band:** „Tag X von Y" (bestehendes `.ir-stay`-Muster, Balken unverändert) +
   Entlassdatum rechts statt „noch N T"; optionaler dezenter Gold-Punkt bei möglicher Verlängerung.
3. **BWL-Zeile** (neu, Kernstück): Erlös/Tag · kalk. Gesamterlös (Plan) · DB-Marge % · Zusatzerlöse/Tag —
   4 Zellen, Cormorant-Zahl + Kleinlabel, exakt dieselben Formeln wie `rsCockpit()`/`openRsDetail()`.
4. **Kostenzusage-Ampel:** 3 Zustände (liegt vor/Jade · angefragt/Gold · fehlt-kritisch/Zinnober) +
   Kostenträger-Text.
5. **Fußzeile:** nächster Meilenstein, deterministisch aus Tag X/Y abgeleitet.

Barthel/FIM/Reha-Ziel-Plaketten und die Barthel-Sparkline entfallen von der Karte (§5) — sie bleiben
vollständig und unverändert in `rsDetail` verfügbar, ein Klick entfernt.

---

## 3. Datenmodell — was existiert, was kommt additiv dazu

### 3.1 Bereits vorhanden, nur wiederverwendet (kein neues Feld)

| Feld | Quelle | Fundstelle |
|---|---|---|
| `p.verweildauer.{ist,plan}` | `inReha[]` | [4554-4587](../../../index.html#L4554) — deckt „Tag X von Y" bereits vollständig ab, **keine** neue `aufnahmeDatum`/`plantage`-Ergänzung nötig |
| `p.entlassungGeplant` | `inReha[]` | dito — Entlassdatum, `null` falls Kostenzusage/Termin noch offen (Lydia Sommer) |
| `p.achse`, `p.icd`, `p.alter`, `p.name`, `p.personId` | `inReha[]` | dito |
| `bill.tagessatz`, `bill.kostenTag`, `bill.kostenzusage`, `bill.zusatz[]` | `RS_BILLING` | [6120-6124](../../../index.html#L6120) |
| `sterneVon(p)`/`sterneHtml(n)` | global | [5081](../../../index.html#L5081)/[5083](../../../index.html#L5083) — `p.personId` reicht, exakt das bestehende Aufruf-Muster |
| `person(p.personId).kt` | `personen[]` via `person()` | [4640](../../../index.html#L4640) — Kostenträger-Text für die Ampel, **kein** neues Feld auf `inReha[]`/`RS_BILLING` nötig |
| `ACHSE_COL` | global | [4231](../../../index.html#L4231) |

**Geprüft und verworfen:** ein neues `aufnahmeDatum`/`plantage`-Feld laut Brief — überflüssig,
`verweildauer.{ist,plan}` deckt „Tag X von Y" bereits 1:1 ab (Wiederverwenden statt duplizieren,
CLAUDE.md).

### 3.2 Additiv — bewusst in `RS_BILLING`, nicht in `inReha[]`

`RS_BILLING` ist laut eigenem Kommentar „eigene Ergänzung, greift nicht in geteilte `inReha`-Felder ein"
([index.html:6119](../../../index.html#L6119)) — **nicht** Cofounder-geteilt. Zimmerkategorie und
Verlängerungs-Marker gehören inhaltlich zur Abrechnungssicht, deshalb hier statt auf `inReha[]` ergänzt:
niedrigeres Risiko als eine Änderung am geteilten Array, obwohl `inReha[]` laut Auftrag additiv
erlaubt wäre. Zwei neue Felder je Eintrag, alle Bestandsfelder unverändert:

```diff
 const RS_BILLING={
- "Dieter Franke":{tagessatz:890,kostenTag:520,kostenzusage:"liegt vor",zusatz:[{label:"Einzelzimmer-Zuschlag",eur:65}],empf:[...]},
- "Elke Sauer":{tagessatz:1250,kostenTag:760,kostenzusage:"n.a. (Selbstzahler)",zusatz:[{label:"SalutoCare-Suite",eur:420},{label:"Begleitperson",eur:180}],empf:[...]},
- "Lydia Sommer":{tagessatz:980,kostenTag:610,kostenzusage:"offen",zusatz:[{label:"Neuro-Wahlleistung",eur:140}],empf:[...]}
+ "Dieter Franke":{tagessatz:890,kostenTag:520,kostenzusage:"liegt vor",zimmer:"Einzelzimmer",verlaengerung:false,zusatz:[{label:"Einzelzimmer-Zuschlag",eur:65}],empf:[...]},
+ "Elke Sauer":{tagessatz:1250,kostenTag:760,kostenzusage:"n.a. (Selbstzahler)",zimmer:"SalutoCare-Suite",verlaengerung:true,zusatz:[{label:"SalutoCare-Suite",eur:420},{label:"Begleitperson",eur:180}],empf:[...]},
+ "Lydia Sommer":{tagessatz:980,kostenTag:610,kostenzusage:"offen",zimmer:"Doppelzimmer",verlaengerung:false,zusatz:[{label:"Neuro-Wahlleistung",eur:140}],empf:[...]}
 };
```

`zimmer`: Text-Chip für die Kopfzeile — bewusst ein eigenes Feld statt Parsen von `zusatz[0].label`
(fragil: „Neuro-Wahlleistung" bei Lydia Sommer ist ein Leistungszuschlag, keine Zimmerkategorie; nur bei
Dieter Franke/Elke Sauer wäre `zusatz[0].label` zufällig auch der Zimmername gewesen). `verlaengerung`:
Boolean, Case-Management-Signal „Verlängerung beantragt/möglich" — unabhängig von Tag X/Y, da eine
Verlängerung schon früh im Aufenthalt absehbar sein kann (hier: Elke Sauer, Selbstzahlerin, unkompliierte
Kostenfrage). `bill.empf` unverändert, wird von dieser Karte nicht gelesen.

**`inReha[]` bleibt komplett unverändert** (0 Zeilen-Diff) — die einzige Erweiterung dieser Spec liegt in
`RS_BILLING`.

---

## 4. Formeln, durchgerechnet gegen die echten Seeds

### 4.1 BWL-Zeile (identische Formeln wie `rsCockpit()`/`openRsDetail()` — Konsistenzpflicht erfüllt)

`erlösTag = ts`, `erlösPlan = ts·plan`, `dbMarge = round((ts−kt)/ts·100)`,
`zusatzTag = Σ zusatz[].eur`:

| Patient | ts | kt | plan | Erlös/Tag | kalk. Gesamterlös | DB-Marge | Zusatzerlöse/Tag |
|---|--:|--:|--:|--:|--:|--:|--:|
| Dieter Franke | 890 | 520 | 21 | **890 €** | **18.690 €** | (890−520)/890 = 41,57 → **42 %** | 65 € |
| Elke Sauer | 1250 | 760 | 28 | **1.250 €** | **35.000 €** | (1250−760)/1250 = 39,2 → **39 %** | 420+180 = **600 €** |
| Lydia Sommer | 980 | 610 | 25 | **980 €** | **24.500 €** | (980−610)/980 = 37,76 → **38 %** | 140 € |

**Konsistenzcheck `rsCockpit()`** ([index.html:6200-6214](../../../index.html#L6200), unverändert):
`erlos=Σts·plan=18.690+35.000+24.500=78.190 → round(78.190/1000)=78k €`; `db=Σ(ts−kt)·plan=
370·21+490·28+370·25=7.770+13.720+9.250=30.740`; `marge=round(30.740/78.190·100)=39 %`; `offen`
(`kostenzusage==="offen"`) = 1 (Lydia Sommer). Alle vier Kartenwerte sind Zeilen derselben Summen, die die
Cockpit-Leiste bereits bildet — keine Formel-Abweichung, keine Änderung an `rsCockpit()` nötig.

### 4.2 Kostenzusage-Ampel

`bill.kostenzusage` ist bereits heute faktisch dreiwertig (`"liegt vor"` / `"n.a. (…)"` / `"offen"`),
`inReha[].drgStatus` führt denselben Zustand parallel (Dieter „Zusage liegt vor", Elke „Selbstzahler
(SalutoCare-Suite)", Lydia „offen" — inhaltlich deckungsgleich, zwei Felder für dieselbe Tatsache). Karte
liest **ausschließlich `RS_BILLING.kostenzusage`** (dieselbe Quelle wie `rsCockpit()`/`rsDetail`, keine
zweite Wahrheit); `drgStatus` bleibt unverändert und ungenutzt von dieser Spec (Cofounder-Feld,
nicht anfassen).

```js
function irbAmpel(bill,p){
 const kz=bill.kostenzusage||"—";
 if(kz==="liegt vor")return{cls:"ok",label:"liegt vor"};
 if(kz!=="offen")return{cls:"ok",label:"kein Kostenträger nötig"}; // "n.a. (Selbstzahler)" u.ä.
 return p.verweildauer.ist<2?{cls:"warn",label:"angefragt"}:{cls:"bad",label:"fehlt – kritisch"};
}
```

Schwelle `ist<2`: Tag 0–1 gilt als „gerade angefragt, normaler Prozess" (Gold); ab Tag 2 ohne Zusage
als „kritisch" (Zinnober) — bei Reha-Aufenthalten von 21–28 Tagen frisst jeder ungeklärte Tag reale
DB-Marge, eine offene Zusage ab Tag 2 verdient aktive Eskalation.

| Patient | `kostenzusage` | `ist` | Ampel | Kostenträger (`person(pid).kt`) |
|---|---|--:|---|---|
| Dieter Franke | „liegt vor" | 6 | **Jade** „liegt vor" | PKV |
| Elke Sauer | „n.a. (Selbstzahler)" | 4 | **Jade** „kein Kostenträger nötig" | Selbstzahler |
| Lydia Sommer | „offen" | 2 | **Zinnober** „fehlt – kritisch" | PKV |

Bekannte Seed-Lücke: der Gold-Zwischenzustand („offen" bei `ist<2`) ist mit den aktuellen 3
`inReha[]`-Einträgen nicht demonstrierbar (nur Lydia Sommer hat `kostenzusage:"offen"`, bereits bei
Tag 2) — die Formel selbst deckt ihn ab, nur der Startzustand zeigt ihn nicht. Kein Fixbedarf: neue
Patienten anzulegen läge außerhalb dieser Spec (reines Feld-/Layout-Thema, keine Datensatz-Erweiterung).

### 4.3 Nächster Meilenstein (deterministisch aus `verweildauer`)

```js
function irbMeilenstein(p){
 const rest=p.verweildauer.plan-p.verweildauer.ist;
 if(rest<=3)return{label:"Entlassgespräch",detail:p.entlassungGeplant?"am "+p.entlassungGeplant:"Termin abstimmen"};
 if(rest<=10)return{label:"Verlängerungsentscheid",detail:"spätestens in "+(rest-3)+" Tagen"};
 const zbTag=14;
 return{label:"Zwischenbericht fällig",detail:p.verweildauer.ist<zbTag?"in "+(zbTag-p.verweildauer.ist)+" Tagen (Tag 14)":"jetzt (Tag 14 erreicht)"};
}
```

Drei Phasen: früher Aufenthalt (`rest>10`) → Zwischenbericht-Fälligkeit (feste 14-Tage-Konvention,
passend zur bestehenden Praxis periodischer Zwischenberichte); mittlere Phase (`4≤rest≤10`) →
Verlängerungsentscheid rückt näher; letzte Phase (`rest≤3`) → Entlassgespräch mit Datum aus
`entlassungGeplant`.

| Patient | `ist`/`plan` | `rest` | Meilenstein |
|---|---|--:|---|
| Dieter Franke | 6/21 | 15 | Zwischenbericht fällig · in 8 Tagen (Tag 14) |
| Elke Sauer | 4/28 | 24 | Zwischenbericht fällig · in 10 Tagen (Tag 14) |
| Lydia Sommer | 2/25 | 23 | Zwischenbericht fällig · in 12 Tagen (Tag 14) |

Bekannte Seed-Lücke: alle drei aktuellen Patienten sind früh im Aufenthalt (`rest>10`), die Phasen
„Verlängerungsentscheid"/„Entlassgespräch" sind vollständig spezifiziert, aber mit den 3 Live-Seeds nicht
sichtbar (analog zu Punkt 3's Seed-Lücke oben — kein Bug, reiner Zeitpunkt-Zufall der Demo-Daten).

### 4.4 Verweildauer-Band + Gold-Marker

`stayPct=Math.min(100,round(ist/plan·100))` (bestehende Formel, unverändert): Dieter 29 %, Elke 14 %,
Lydia 8 %. Gold-Marker (dezenter Punkt neben Entlassdatum) nur wenn `bill.verlaengerung===true` — mit
den obigen Seeds nur bei **Elke Sauer**.

---

## 5. UI-Spezifikation `.irb-*` (Markup-Skizze)

Äußeres `<button class="ir-card…">` bleibt exakt wie heute (Etiketten-Doppelrahmen, `--acol`, `.hot` bei
SalutoCare, `onclick="openRsDetail(i)"`) — nur der **Innenraum** wird ersetzt:

```html
<button class="ir-card${hot}" style="--acol:${col}" onclick="openRsDetail(${i})">
  <div class="ir-head">
    <span class="ava">${initialen}</span>
    <div class="ir-htxt">
      <h3>${name} <span class="ir-age">(${alter})</span></h3>
      <div class="irb-tags">${sterneHtml(sterne)}<span class="irb-achse">${achse}</span><span class="irb-zimmer">${zimmer}</span></div>
    </div>
    <span class="ir-chev">›</span>
  </div>
  <div class="ir-stay irb-stay">
    <div class="lbl"><span>Tag ${ist} von ${plan}</span><span>${entlassText}${goldDot}</span></div>
    <div class="track"><div class="fill" style="width:${stayPct}%"></div></div>
  </div>
  <div class="irb-bwl">
    <div class="irb-b"><div class="irb-bv num">${ts} €</div><div class="irb-bl">Erlös/Tag</div></div>
    <div class="irb-b"><div class="irb-bv num">${erlösPlan} €</div><div class="irb-bl">Gesamterlös (Plan)</div></div>
    <div class="irb-b"><div class="irb-bv num">${marge} %</div><div class="irb-bl">DB-Marge</div></div>
    <div class="irb-b"><div class="irb-bv num">${zusatzTag} €</div><div class="irb-bl">Zusatzerlöse/Tag</div></div>
  </div>
  <div class="irb-ampel ${ampel.cls}"><span class="irb-dot"></span>Kostenzusage ${ampel.label} · ${kostentraeger}</div>
  <div class="irb-foot"><span class="irb-ms-l">${meilenstein.label}</span><span class="irb-ms-d">${meilenstein.detail}</span></div>
</button>
```

Alle Textwerte via `escapeHtml()`; Zahlen (`toLocaleString('de-DE')`) unverändert wie bisher ohne
Escaping, wie im übrigen Code (`openRsDetail`, `rsCockpit`) bereits Konvention.

### 5.1 CSS (neuer Block vor `</style>`, nahe dem bestehenden `.ir-*`-Block ab
[index.html:2600](../../../index.html#L2600))

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

390px: `.irb-bwl` fällt auf 2×2 (wie `.tc-kpis`-Präzedenz aus Punkt 3), `.irb-tags`/`.irb-foot` umbrechen
via `flex-wrap`. 1440px: 4-spaltig, keine Änderung nötig.

### 5.2 `renderInReha()` — Diff-Skizze

```js
function renderInReha(){
 const el=document.getElementById("inrehaGrid");if(!el)return;
 const _ck=document.getElementById("rsCockpit");if(_ck)_ck.innerHTML=rsCockpit();
 el.innerHTML=inReha.map((p,i)=>{
  const bill=RS_BILLING[p.name]||{};
  const col=ACHSE_COL[p.achse]||"var(--unklar)";
  const rest=Math.max(0,p.verweildauer.plan-p.verweildauer.ist);
  const stayPct=Math.min(100,Math.round(p.verweildauer.ist/p.verweildauer.plan*100));
  const ts=bill.tagessatz||0,kt=bill.kostenTag||0;
  const erlösPlan=ts*p.verweildauer.plan,marge=ts?Math.round((ts-kt)/ts*100):0;
  const zusatzTag=(bill.zusatz||[]).reduce((s,z)=>s+z.eur,0);
  const ampel=irbAmpel(bill,p);
  const ms=irbMeilenstein(p);
  const sterne=sterneVon(p),kt_=person(p.personId)?.kt||"—";
  return `<button class="ir-card${p.achse==="SalutoCare"?" hot":""}" style="--acol:${col}" onclick="openRsDetail(${i})">
    <div class="ir-head"><span class="ava">${initialen(p.name)}</span>
     <div class="ir-htxt"><h3>${escapeHtml(p.name)} <span class="ir-age">(${p.alter})</span></h3>
      <div class="irb-tags">${sterneHtml(sterne)}<span class="irb-achse">${escapeHtml(p.achse)}</span><span class="irb-zimmer">${escapeHtml(bill.zimmer||"—")}</span></div></div>
     <span class="ir-chev">›</span></div>
    <div class="ir-stay irb-stay"><div class="lbl"><span>Tag ${p.verweildauer.ist} von ${p.verweildauer.plan}</span>
      <span>${p.entlassungGeplant?escapeHtml(p.entlassungGeplant):"Entlassung offen"}${bill.verlaengerung?"<span class='irb-gold-dot' title='Verlängerung möglich'></span>":""}</span></div>
      <div class="track"><div class="fill" style="width:${stayPct}%"></div></div></div>
    <div class="irb-bwl">
      <div class="irb-b"><div class="irb-bv num">${ts.toLocaleString('de-DE')} €</div><div class="irb-bl">Erlös/Tag</div></div>
      <div class="irb-b"><div class="irb-bv num">${erlösPlan.toLocaleString('de-DE')} €</div><div class="irb-bl">Gesamterlös (Plan)</div></div>
      <div class="irb-b"><div class="irb-bv num">${marge} %</div><div class="irb-bl">DB-Marge</div></div>
      <div class="irb-b"><div class="irb-bv num">${zusatzTag.toLocaleString('de-DE')} €</div><div class="irb-bl">Zusatzerlöse/Tag</div></div>
    </div>
    <div class="irb-ampel ${ampel.cls}"><span class="irb-dot"></span>Kostenzusage ${escapeHtml(ampel.label)} · ${escapeHtml(kt_)}</div>
    <div class="irb-foot"><span class="irb-ms-l">${escapeHtml(ms.label)}</span><span class="irb-ms-d">${escapeHtml(ms.detail)}</span></div>
   </button>`;
 }).join("")||"<p class='empty'>Aktuell keine Patienten in Behandlung.</p>";
}
```

`rest`/`stayPct` bleiben lokal berechnet wie bisher (Verweildauer-Band braucht `stayPct`, `rest` wird von
`irbMeilenstein()` intern neu bezogen — keine doppelte Berechnung mit widersprüchlichem Ergebnis, da
identische Formel `plan-ist`).

---

## 6. Was entfällt (Waisen)

**Aus der Karte entfernt** (Zeilen [6271-6276](../../../index.html#L6271) der bisherigen
`renderInReha()`): `.ir-metrics`-Block (Barthel/FIM/Reha-Ziel-Plaketten) + `${rsSpark(p)}`-Aufruf. Beide
Werte bleiben vollständig in `rsDetail` (`rsErfolg`, KPI-Ringe + `rsChart()`) erhalten — kein
Informationsverlust, nur keine zweite, kleinere Kopie auf der Karte.

**Vollständig verwaiste, löschbare CSS-Regeln** (`.ir-*`-Namespace, unser eigener — kein Cofounder-Code):

| Regel(n) | Zeile(n) |
|---|---|
| `.ir-metrics` | [1159](../../../index.html#L1159) |
| `.ir-m` (Basis + 3px-Radius-Ergänzung) | [1160](../../../index.html#L1160), [2603](../../../index.html#L2603) |
| `.ir-mv` | [1161](../../../index.html#L1161) |
| `.ir-delta` | [1162](../../../index.html#L1162) |
| `.ir-ml` | [1163](../../../index.html#L1163) |
| `.ir-icd` (Basis + zweite Ergänzung — Kopfzeile zeigt Achse/ICD jetzt über `.irb-tags`, ICD bleibt via `rsSub` in `rsDetail` sichtbar) | [647](../../../index.html#L647), [1156](../../../index.html#L1156) |

**Bewusst NICHT gelöscht, obwohl nach dieser Änderung 0 Aufrufer:** `rsSpark()`
([index.html:6227-6238](../../../index.html#L6227)) erzeugt `.rsp-spark`-Markup — dieser Klassenname
gehört zur Cofounder-Namespace-Konvention `.rsp-*` („Reha-Charts", CLAUDE.md) und ist laut Auftrag tabu,
unabhängig davon, ob unser eigener Aufrufer entfällt. Nur der **eine Aufruf** in `renderInReha()`
verschwindet (chirurgisch, eine Zeile); `rsSpark()` selbst, `.rsp-spark`/`.rsp-cap`-CSS bleiben unangetastet
liegen — kein Löschen fremden Namespace-Codes. `rsChart()`/`.rsp-chart`/`.rsp-legend` sind ohnehin
weiterhin in `rsDetail` aktiv (unverändert), kein Waisen-Risiko dort.

---

## 7. Abnahmekriterien (Browser-Checks)

1. **BWL-Zeile korrekt (4 Werte je Karte, §4.1):** Dieter Franke `890 €` / `18.690 €` / `42 %` / `65 €`;
   Elke Sauer `1.250 €` / `35.000 €` / `39 %` / `600 €`; Lydia Sommer `980 €` / `24.500 €` / `38 %` /
   `140 €`.
2. **Kostenzusage-Ampel (§4.2):** Dieter Franke Jade „liegt vor · PKV"; Elke Sauer Jade „kein
   Kostenträger nötig · Selbstzahler"; Lydia Sommer **Zinnober** „fehlt – kritisch · PKV".
3. **Meilenstein (§4.3):** alle drei zeigen „Zwischenbericht fällig" mit unterschiedlichem Tage-Text
   (8/10/12 Tage) — Text ändert sich sichtbar je Karte, keine drei identischen Zeilen.
4. **Verweildauer-Band:** Dieter 29 % gefüllt + „Entlassung {dstr(15)}" ohne Gold-Punkt; Elke 14 % +
   „Entlassung {dstr(24)}" **mit** Gold-Punkt (Tooltip „Verlängerung möglich"); Lydia 8 % + „Entlassung
   offen" (kein Datum, `entlassungGeplant===null`).
5. **Kopfzeile:** je Karte 5 gefüllte Sterne (alle drei `sterne:5` in `personen[]`), Achse-Pill farblich
   nach `ACHSE_COL` (Ortho/SalutoCare/Neuro unterscheidbar), Zimmer-Chip „Einzelzimmer"/„SalutoCare-Suite"/
   „Doppelzimmer".
6. **rsCockpit-Konsistenz:** Cockpit-Leiste oben zeigt weiterhin `78k €`/`39 %`/`1` offene Kostenzusage —
   identisch zur Summe der 3 Karten-Werte (§4.1), keine Abweichung zwischen Aggregat und Einzelkarten.
7. **Klick unverändert:** jede Karte öffnet weiterhin `openRsDetail(i)` → `rsDetail` mit unveränderten
   zwei Spalten (Erfolge & Verlauf / Wirtschaftlichkeit & Abrechnung).
8. **Entfernte Elemente weg:** keine `.ir-metrics`/`.ir-m`/`.rsp-spark`-Elemente mehr im Karten-DOM
   (wohl aber `rsSpark()`/`.rsp-spark`-CSS unverändert im Quelltext vorhanden, §6).
9. **Mobile (390px):** `.irb-bwl` 2×2, `.irb-tags`/`.irb-foot` umbrechen ohne horizontalen Overflow;
   Desktop (1440px) 4-spaltige BWL-Zeile.
10. **0 Console-Errors**, beide Breiten; `grep -c "@keyframes" index.html` unverändert 9.
11. **Unberührte Bereiche:** `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `#refOverlay`, `p.kurzbericht`
    (weder gelesen noch geschrieben von dieser Karte), `.mtp-*`-Protokoll-Board, `inReha[]`
    (0 Zeilen-Diff) unverändert.

---

## 8. Nicht-Ziele

- **`rsDetail`-Innenleben** (`openRsDetail()`, `rsErfolg`/`rsWirt`/`rsZwischenstand`, `rsChart()`,
  `devBar()`) bleibt vollständig unverändert — diese Spec ändert ausschließlich, was auf der Karte davor
  zu sehen ist, nicht die Vertiefung dahinter.
- **`.mtp-*`-Protokoll-Board** (Mein Tag/Case-Management-Dokumentation) unberührt — andere View, anderer
  Zweck (Kurzbericht-Erfassung, nicht Übersicht).
- **Cofounder-Bereiche** (`.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `#refOverlay`) unberührt, inklusive `rsSpark()`
  selbst (§6 — Aufruf entfernt, Funktion/CSS bleiben liegen).
- **`inReha[]`** bekommt in dieser Spec **keine** neuen Felder — alle Ergänzungen leben in `RS_BILLING`
  (§3.2), bewusst risikoärmer als das geteilte Array zu erweitern.
- **`drgStatus`** (Parallelfeld zu `RS_BILLING.kostenzusage`) wird nicht bereinigt/zusammengeführt — beide
  Felder bleiben nebeneinander bestehen, nur `RS_BILLING.kostenzusage` wird von der neuen Ampel gelesen.
- Keine Änderung an `rsCockpit()` selbst — Formeln sind bereits identisch, nur als Konsistenzcheck
  gegengerechnet (§4.1).

---

## 9. Verifizierte Code-Anker (gelesen vor dieser Spec)

`renderInReha()`: [6258-6281](../../../index.html#L6258) · `openRsDetail()`: [6130-6181](../../../index.html#L6130) ·
`rsCockpit()`: [6200-6214](../../../index.html#L6200) · `RS_BILLING`: [6120-6124](../../../index.html#L6120) ·
`inReha[]` (3 Einträge P09/P10/P11): [4554-4588](../../../index.html#L4554) · `personen[]` (P09/P10/P11,
`kt`/`sterne`): [4606-4608](../../../index.html#L4606) · `person()`: [4640](../../../index.html#L4640) ·
`sterneVon()`/`sterneHtml()`/`STERNE`: [5081](../../../index.html#L5081)/[5083](../../../index.html#L5083)/
[5072-5078](../../../index.html#L5072) · `ACHSE_COL`: [4231](../../../index.html#L4231) ·
`rsSpark()`/`rsChart()`/`rsSeries()`/`rsPath()`: [6215-6257](../../../index.html#L6215) ·
`.ir-card`/`.ir-head`/`.ir-stay`-Basis: [1148-1166](../../../index.html#L1148) ·
`.card,.radar-kpi,.db-cockpit,.ir-card{…}`-Doppelrahmen: [1892-1894](../../../index.html#L1892) ·
`.ach-dot`: [1127](../../../index.html#L1127) · `.rs-pill`: [1204-1206](../../../index.html#L1204) ·
`pa-fold`/`paAkte()`: [3007-3010](../../../index.html#L3007)/[4699-4716](../../../index.html#L4699)
(unverändert, nicht Teil dieser Karte — bleibt in `rsDetail`) · `escapeHtml()`: [4735](../../../index.html#L4735) ·
9 `@keyframes`-Blöcke bestätigt (`grep -c "@keyframes" index.html` = 9 vor dieser Spec, keine neue
hinzugefügt) · CSS-Einfügepunkt nahe bestehendem `.ir-*`-Block: [2600-2605](../../../index.html#L2600).
