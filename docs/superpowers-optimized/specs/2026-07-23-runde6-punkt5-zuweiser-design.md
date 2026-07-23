# Runde 6, Punkt 5 — Zuweiser: medizinisches After-Sales-Niveau + Sterne-Ranking

**Bezug:** Sechste Runde, Nutzer-Feedback-Punkt 5. Nutzer wörtlich: (a) „Die Zuweiser-Akte unter
‚Aktionen & Pflege' ist optisch einfach wieder nur Texte." (b) „8 Tage seit Partnerschaftsbeginn und
dann Jubiläums-Geste senden? Das ist doch nicht Douglas wo man Parfums kauft — Premium-Reha-Klinik in
der Medizin, das muss Niveau haben." (c) „Bei Stammdaten & Ranking fehlt ein klares Ranking — Sterne-
System für Zuweiser analog zu den 5 Patienten-Sternen." Design-Entscheidung an Claude delegiert. Fünfte
Spec in der Runde-6-Reihe (P1–P4 betreffen Anfrage-Triage/Schritt-Werkzeuge/Team-Cockpit/In-Reha-Akte,
andere Views/Datenmodelle).

**Leitplanken (aus [../../../CLAUDE.md](../../../CLAUDE.md)):** `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*` +
`#refOverlay` tabu — **Achtung:** `openReferrer()`/Zuweiserportal ist Cofounder-Code, wird nur
aufgerufen, nie verändert; Arrays additiv, nur Wert-Tweaks an bestehenden Feldern erlaubt; exakt
9 `@keyframes` (bestätigt, `grep -c "@keyframes" index.html` = 9 — diese Spec fügt keine neue Animation
hinzu, alle neuen Karten sind statisch); Jade-Apotheke-Identität, Etiketten-Doppelrahmen für neue Karten;
Cormorant-Numerale; Gold nie als Textfarbe (`--brass-deep` für Text, `--brass` nur Grafik/Icon);
`escapeHtml()`; kein `Math.random`; 390px + 1440px, 0 Console-Errors; nur synthetische Daten.

---

## 1. Problem

Drei Baustellen in `#sub-netzwerk-zuweiser` (`.nwt-segbar`, Reiter „Aktionen & Pflege" / „Stammdaten &
Ranking"):

**(a) Optik.** `renderZuweiser()` ([index.html:5577](../../../index.html#L5577)) befüllt `#zAnlaesse` über
`anlaesse("zuweiser").map(arCard)` ([index.html:5610-5612](../../../index.html#L5610)) — dieselbe
`arCard()`-Funktion ([index.html:5211-5228](../../../index.html#L5211)) wie für Patienten-Anlässe.
`AR_FOTO` greift nur bei `"zuweiser-rhythmus"` ([index.html:5210](../../../index.html#L5210)) — Meilenstein,
Jubiläum, Trend zeigen keinen Foto-Strip, nur Avatar + Titelzeile + zwei Textzeilen + Button. Genau das
meint der Nutzer mit „optisch einfach wieder nur Texte".

**(b) Realitätsferne Anlässe.** `zuweiser-jubilaeum` feuert bei `Math.abs(diff)<=30` Tagen um den
Jahrestag ([index.html:5172](../../../index.html#L5172)) mit „Jubiläums-Geste senden"
([index.html:5174](../../../index.html#L5174)) — unabhängig vom Alter der Partnerschaft, mit einer
Geschenk-Semantik, die für eine Akutklinik-Beziehung unpassend ist. `zuweiser-meilenstein` feuert bereits
ab 5 Patienten ([index.html:5163](../../../index.html#L5163)) mit „Dankeschön-Geste" — niedrigschwellig
für Klinik-zu-Klinik. Der wichtigste reale After-Sales-Moment (Abschlussbericht nach Entlassung eines
gemeinsamen Patienten) fehlt komplett.

**(c) Kein Ranking.** Die Stammdaten-Karte zeigt `.zw-rankline` mit reiner Positionsnummer (`#1`…`#11`,
sortiert nach `faelle`, [index.html:5613-5617](../../../index.html#L5613)) — keine Einstufung, kein
Pendant zum 5-Sterne-System der Patienten (`STERNE`/`sterneVon`/`sterneHtml`,
[index.html:5086-5097](../../../index.html#L5086)).

## 2. Zielbild

- **Anlass-Katalog** (§3) auf medizinisch-kollegialem Niveau: sechs Typen, davon zwei neu
  (`zuweiser-bericht`, `zuweiser-fortbildung`), zwei mit verschärften Bedingungen (`zuweiser-jubilaeum`,
  `zuweiser-meilenstein`), zwei unverändert (`zuweiser-rhythmus`, `zuweiser-trend`).
- **`#zAnlaesse` neu gerendert** über eigene `.zwa-*`-Etiketten-Karten (§5) statt `arCard()`/
  `.radar-card` — Kicker (Typ+Icon) · Zuweiser-Name · voller Anlass-Satz · Fälligkeits-Chip · ein
  „Erledigt"-Button, gruppiert nach „Diese Woche" (`urg==="jetzt"`) / „Demnächst" (`urg==="bald"`).
- **`zwSterne(z)`** (§4): deterministische 1–5-Sterne-Einstufung aus Fallvolumen, Trend und
  Draht-Stärke, ersetzt die reine Rangnummer in der Stammdaten-Liste; Liste sortiert nach Sternen,
  Filter-Chips analog `bucketOf()`/`.tier-chips`.

## 3. Anlass-Katalog — `anlaesse()`, Block `zuweiser-*` ([index.html:5152-5191](../../../index.html#L5152))

Alle sechs Blöcke bleiben `zuweiser.forEach(...)`-Schleifen im bestehenden `anlaesse(scope)`, unverändert
aufgerufen von `renderZuweiser()` ([index.html:5610](../../../index.html#L5610)) und
`arAktion()`/`_arDone` ([index.html:5199-5207](../../../index.html#L5199), Dismiss-Mechanik
unverändert wiederverwendet). `heute` = [index.html:4246](../../../index.html#L4246); alle Tages-
Rechnungen unten sind gegen **2026-07-23** (heutiges Datum) durchgerechnet — bei jedem echten Seitenaufruf
läuft dieselbe Rechnung gegen den tatsächlichen `new Date()`, exakt wie im Bestandscode.

### 3.1 `zuweiser-rhythmus` — unverändert (Bedingung), Text neu

Bedingung wie bisher: Draht-Stärke `staerke=●-Anzahl` → Kadenz `kad` (90/180/330 Tage), `seit`=Tage seit
`z.letzter`, feuert bei `seit>=kad`. **Nur der Text ändert sich** — Kicker „Kontaktpflege" (Icon `⟳`):

```js
const monate=Math.round(seit/30);
sub: "Seit "+monate+" Monaten kein fachlicher Austausch — Anruf mit Belegungs-Update anbieten."
```

**Durchgerechnet (11 Seeds):** einzig **Thoraxzentrum Münnerstadt** überschreitet die Kadenz (`draht`
`●●○`→kad180, `letzter` `dstr(-195)`→`seit=195≥180`) → `monate=Math.round(195/30)=7`,
`urg="bald"` (195<180·1,5=270). Alle übrigen 9 aktiven Zuweiser liegen unter ihrer Kadenz (Kontakt vor
1–20 Tagen), Helios Klinikum/Reha-Technik Müller haben `faelle:0` und werden vom bestehenden
`z.faelle<1`-Guard ([index.html:5153](../../../index.html#L5153)) ausgeschlossen.

### 3.2 `zuweiser-meilenstein` — Schwelle verschärft von [20,10,5] auf [50,25,10]

```js
const schwellen=[50,25,10].filter(s=>z.faelle>=s);
...
sub: schwelle+". gemeinsamer Patient erreicht — Persönlicher Dank und Outcome-Bilanz der bisherigen Patienten anbieten."
```

Kicker „Meilenstein" (Icon `◆`). **Durchgerechnet:** höchster `faelle`-Wert im Seed-Bestand ist 6
(Leopoldina-Krankenhaus) — keiner der 11 Zuweiser erreicht 10. **Bekannte Seed-Lücke, bewusst kein
Fixbedarf:** ein Wert-Tweak an `faelle` nur für diese Demo-Sichtbarkeit würde den Sinn der Verschärfung
unterlaufen (echte Meilensteine statt Spam ab 5) und wäre eine reine Kosmetik-Fabrikation ohne Auftrag —
analog zur dokumentierten, nicht behobenen Seed-Lücke in
[2026-07-23-runde6-punkt4-inreha-akte-design.md §4.2/§4.3](2026-07-23-runde6-punkt4-inreha-akte-design.md).
Die Formel ist vollständig spezifiziert und feuert automatisch, sobald ein Zuweiser real 10 Fälle
erreicht.

### 3.3 `zuweiser-jubilaeum` — Bedingung verschärft (Kernpunkt des Nutzer-Feedbacks b)

Alt: `Math.abs(diff)<=30`, unabhängig vom Alter der Partnerschaft, Aktion „Jubiläums-Geste senden". Neu:

```js
zuweiser.forEach(z=>{
 if(z.faelle<1)return;
 const partnerTage=Math.round((heute-new Date(z.seit))/86400000);
 if(partnerTage<350)return;
 const diff=jahrestagDiff(z.seit);
 if(diff===null||Math.abs(diff)>14)return;
 const key="zuw-jub:"+z.name;if(_arDone.has(key))return;
 const jahre=Math.round(partnerTage/365.25);
 out.push({key,typ:"zuweiser-jubilaeum",urg:Math.abs(diff)<=7?"jetzt":"bald",tage:diff,titel:z.name,
  sub:jahre+". Jahrestag der Partnerschaft (seit "+z.seit.slice(0,4)+") — Jahres-Kooperationsgespräch mit Chefarzt/Leitung anbieten.",
  sterne:null,geste:{label:"Kooperationsgespräch anbieten",cta:"Termin anbieten"},zName:z.name});
});
```

Zwei Gates statt einem: Partnerschaft ≥350 Tage (verhindert, dass eine frisch aufgebaute Beziehung schon
eine „Jahresfeier" bekommt) **und** Jahrestag im engeren ±14-Tage-Fenster (statt ±30). Aktion ist ein
**persönlicher Termin** (Chefarzt/Leitung), keine Geste/kein Geschenk — direkte Antwort auf Feedback (b).
`jahre=Math.round(partnerTage/365.25)` (robust gegen Schaltjahre, exakt genug für eine Jubiläums-Anzeige).

**Durchgerechnet gegen alle 11 `z.seit`-Werte** (heute 2026-07-23, `jahrestagDiff()` unverändert
[index.html:4703-4710](../../../index.html#L4703)):

| Zuweiser | `seit` | Partnerschaftstage | Jahrestag-Diff | ≥350 Tage? | \|diff\|≤14? |
|---|---|--:|--:|:-:|:-:|
| Leopoldina-Krankenhaus | 2019-07-15 | 2565 | −8 | ✓ | ✓ |
| RHÖN-KLINIKUM Campus | 2020-03-12 | 2324 | −133 | ✓ | ✗ |
| Dr. Sommer | 2021-11-05 | 1721 | +105 | ✓ | ✗ |
| Thoraxzentrum Münnerstadt | 2022-05-18 | 1527 | −66 | ✓ | ✗ |
| PRIMO MEDICO | 2022-08-05 | 1448 | +13 | ✓ | **✓** |
| Uniklinikum Würzburg | 2019-01-22 | 2739 | −182 | ✓ | ✗ |
| Klinikum Fulda | 2023-10-03 | 1024 | +72 | ✓ | ✗ |
| König-Ludwig-Haus | 2024-02-14 | 890 | −159 | ✓ | ✗ |
| Helios Klinikum | 2025-04-01 | 478 | −113 | ✓ (faelle:0 → Guard) | — |
| Privatpraxis Dr. Neumann | 2021-12-20 | 1676 | +150 | ✓ | ✗ |
| Reha-Technik Müller | 2020-09-15 | 2137 | +54 | ✓ (faelle:0 → Guard) | — |

Ohne Seed-Änderung liegen bereits zwei Zuweiser im Fenster: Leopoldina (`diff=−8`, exakt der vom Nutzer
genannte Fall — bleibt real, nur die Aktion ändert sich von „Geste senden" zu „Kooperationsgespräch
anbieten") und PRIMO MEDICO (`diff=+13`). Leopoldinas Marge bis zum Fensterausstieg beträgt aber nur noch
6 Tage (`diff` wandert täglich Richtung −14) — siehe Seeds-Diff §7 für die Robustheits-Korrektur.

### 3.4 `zuweiser-bericht` — NEU, wichtigster After-Sales-Moment

Kein Feld verknüpft `inReha[]`/`faelle[]` sauber mit `zuweiser[]` (Fall-`quelle` ist Freitext, `inReha[]`
trägt keine Herkunfts-Referenz). Geprüft und verworfen: `findeOderErstelleZuweiser()`
([index.html:5557-5565](../../../index.html#L5557)) wäre technisch nutzbar, hängt aber an driftendem
`faelle[].quelle`-Freitext. Stattdessen ein neues, additives, optionales Feld direkt auf `zuweiser[]` —
**Seed statt Ableitung**, wie vom Auftrag als Alternative vorgesehen:

```js
// neuer zuweiser.forEach()-Block innerhalb anlaesse():
zuweiser.forEach(z=>{
 if(!z.letzterAbschluss)return;
 const tage=Math.round((heute-new Date(z.letzterAbschluss))/86400000);
 if(tage<0||tage>14)return;
 const key="zuw-ber:"+z.name;if(_arDone.has(key))return;
 out.push({key,typ:"zuweiser-bericht",urg:tage<=3?"jetzt":"bald",tage,titel:z.name,
  sub:"Gemeinsamer Patient vor "+tage+" Tagen entlassen — Abschlussbericht und Dank an den Zuweiser senden.",
  sterne:null,geste:{label:"Abschlussbericht senden",cta:"Abschlussbericht senden"},zName:z.name});
});
```

Kicker „Abschlussbericht" (Icon `✉`). `z.letzterAbschluss` fehlt bei 10 von 11 Einträgen (bewusst
`undefined` — kein Fixwert, damit der Anlass nicht dauerhaft für alle Zuweiser feuert); ein Wert bei
RHÖN-KLINIKUM Campus (§7 Seeds-Diff). **Durchgerechnet:** `letzterAbschluss:dstr(-5)` → `tage=5`,
`urg="bald"`.

### 3.5 `zuweiser-fortbildung` — NEU, quartalsweise CME-Einladung

Bedingung `z.faelle>=3`; Fälligkeit deterministisch aus Kalenderquartal + bestehendem `zNameHash()`
([index.html:5113-5117](../../../index.html#L5113), wiederverwendet statt dupliziert) abgeleitet, damit
nicht alle qualifizierten Zuweiser am selben Tag feuern:

```js
zuweiser.forEach(z=>{
 if(z.faelle<3)return;
 const h=zNameHash(z.name);
 const qStartMonth=Math.floor(heute.getMonth()/3)*3;
 const quarterStart=new Date(heute.getFullYear(),qStartMonth,1);
 const due=new Date(quarterStart);due.setDate(due.getDate()+(h%84));
 const diff=Math.round((due-new Date(heute.getFullYear(),heute.getMonth(),heute.getDate()))/86400000);
 if(Math.abs(diff)>7)return;
 const key="zuw-fb:"+z.name+":"+heute.getFullYear()+"Q"+(qStartMonth/3+1);if(_arDone.has(key))return;
 out.push({key,typ:"zuweiser-fortbildung",urg:diff<0?"jetzt":"bald",tage:Math.max(0,diff),titel:z.name,
  sub:"Einladung zu Fortbildung/Hospitation (CME) für das laufende Quartal versenden.",
  sterne:null,geste:{label:"Einladung senden",cta:"Einladung senden"},zName:z.name});
});
```

Kicker „Fortbildung" (Icon `▣`). `faelle>=3` schließt 7 der 11 Zuweiser aus (Volumen-Schwelle: nur wer
regelmäßig einweist, bekommt eine CME-Einladung). **Durchgerechnet** (4 Kandidaten mit `faelle≥3`:
Leopoldina=6, RHÖN=4, Dr. Sommer=3, Uniklinikum Würzburg=3; Quartalsstart Q3 2026 = 2026-07-01):

| Zuweiser | `zNameHash%84` | Fällig am | Diff zu heute | Im ±7-Fenster? |
|---|--:|---|--:|:-:|
| Leopoldina-Krankenhaus | 77 | 2026-09-16 | +55 | ✗ |
| RHÖN-KLINIKUM Campus | 28 | 2026-07-29 | +6 | **✓** |
| Dr. Sommer | 1 | 2026-07-02 | −21 | ✗ |
| Uniklinikum Würzburg | 69 | 2026-09-08 | +47 | ✗ |

Nur RHÖN-KLINIKUM Campus fällt aktuell ins Fenster (`urg="bald"`) — passt inhaltlich zum bereits
bestehenden Feld `z.next:"Feedback zu letzter Übernahme geben"` dieses Zuweisers.

### 3.6 `zuweiser-trend` — unverändert („trend bleibt")

Keine Code-Änderung an Bedingung oder Text ([index.html:5181-5191](../../../index.html#L5181)) — die
Formulierungen sind bereits sachlich/daten-basiert („Fallzahl 2 Monate rückläufig/steigend"), kein
Marketing-Ton vorhanden. Nur neuer Kicker „Fallzahl-Trend" (Icon `∿`) in der Kartendarstellung (§5).

---

## 4. `zwSterne(z)` — Zuweiser-Sterne-Formel

Deterministisch aus drei bereits vorhandenen Signalen, keine neuen Felder nötig:

```js
function zwSterne(z){
 if(z.faelle<1)return null; // Archiv/Nie-Kontaktierte — kein Ranking
 const volumen=z.faelle>=5?3:z.faelle>=3?2:1;
 const staerke=((z.draht||"").match(/●/g)||[]).length;
 const draht=staerke>=3?2:staerke===2?1:0;
 const v=z.verlauf3M||[0,0,0];
 const trend=(v[2]>v[1]&&v[1]>v[0])?1:(v[2]<v[1]&&v[1]<v[0])?-1:0;
 const score=volumen+draht+trend; // 0..6
 if(score>=6)return 5;
 if(score>=4)return 4;
 if(score===3)return 3;
 if(score===2)return 2;
 return 1;
}
```

`volumen` (Fallvolumen, 1–3 Punkte), `draht` (Draht-Stärke aus dem bestehenden `●`-String, 0–2 Punkte,
gleiche Zählweise wie `rhythmusPflege()` [index.html:5539-5544](../../../index.html#L5539)) und `trend`
(aus dem bestehenden `verlaufAusFaellen()`/`verlauf3M` [index.html:5118-5124](../../../index.html#L5118),
−1/0/+1) ergeben einen Score 0–6, der auf 1–5 Sterne gemappt wird. `faelle<1` (Nie-Kontaktierte, Archiv)
liefert `null` — kein Ranking, wie gefordert.

**Durchgerechnet gegen alle 11 Seeds** (`verlauf3M` aus der bestehenden Hash-Ableitung, exakt
nachgerechnet):

| Zuweiser | faelle | draht | verlauf3M | Trend | volumen | draht-Pkt | trend-Pkt | Score | **Sterne** |
|---|--:|:-:|---|---|--:|--:|--:|--:|:-:|
| Leopoldina-Krankenhaus | 6 | ●●● | [3,5,6] | steigend | 3 | 2 | +1 | 6 | **★★★★★** |
| Dr. Sommer | 3 | ●●● | [1,2,3] | steigend | 2 | 2 | +1 | 5 | **★★★★☆** |
| RHÖN-KLINIKUM Campus | 4 | ●●○ | [1,4,4] | flach | 2 | 1 | 0 | 3 | ★★★☆☆ |
| Thoraxzentrum Münnerstadt | 2 | ●●○ | [4,4,2] | flach | 1 | 1 | 0 | 2 | ★★☆☆☆ |
| PRIMO MEDICO | 2 | ●●○ | [2,2,2] | flach | 1 | 1 | 0 | 2 | ★★☆☆☆ |
| Uniklinikum Würzburg | 3 | ●○○ | [6,5,3] | fallend | 2 | 0 | −1 | 1 | ★☆☆☆☆ |
| Klinikum Fulda | 2 | ●○○ | [1,1,2] | flach | 1 | 0 | 0 | 1 | ★☆☆☆☆ |
| König-Ludwig-Haus | 1 | ●○○ | [0,0,1] | flach | 1 | 0 | 0 | 1 | ★☆☆☆☆ |
| Privatpraxis Dr. Neumann | 1 | ●○○ | [4,0,1] | flach | 1 | 0 | 0 | 1 | ★☆☆☆☆ |
| Helios Klinikum | 0 | ○○○ | — | — | — | — | — | — | *kein Ranking (Archiv)* |
| Reha-Technik Müller | 0 | ○○○ | — | — | — | — | — | — | *kein Ranking (Archiv)* |

**Verteilung:** 1×5★, 1×4★, 1×3★, 2×2★, 4×1★, 2× ohne Ranking — erfüllt „1–2 Fünf-Sterne, Mittelfeld
besetzt, Nie-Kontaktierte ohne Sterne" vollständig, alle fünf Stufen sind demo-sichtbar.

---

## 5. UI

### 5.1 `.zwa-*` — Anlass-Karten, Etiketten-Stil (ersetzt `arCard()` für die Zuweiser-Pflege)

Modelliert auf dem bestehenden Etiketten-Muster `.mtp-row` ([index.html:2941-2949](../../../index.html#L2941),
Doppelrahmen + Gold-Eckwinkel — das „Etiketten-System" aus CLAUDE.md), nicht auf `.radar-card` (das war
das „nur Text"-Problem). Fälligkeits-Chip nutzt `.radar-due`/`.jetzt`/`.bald`
([index.html:703-707](../../../index.html#L703)), Button `.btn-ghost.btn-sm`
([index.html:84-88](../../../index.html#L84)) — beides wiederverwendet, kein Duplikat.

```js
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

`renderZuweiser()` ([index.html:5610-5612](../../../index.html#L5610)) ruft künftig
`renderZuweiserAnlaesse()` statt der bisherigen Inline-Zuweisung; `arAktion()` bleibt unverändert (ruft
bereits `renderZuweiser()` nach jedem Klick auf, [index.html:5207](../../../index.html#L5207)) — der
„Erledigt"-Klick verschwindet damit exakt wie gefordert **innerhalb der Session** (`_arDone` ist ein
In-Memory-`Set`, kein Persistenz-Layer, gleiches Muster wie `_mtDone`).

**CSS** (neuer Block vor `</style>`, nahe dem bestehenden `.zw-*`-Block ab
[index.html:2928](../../../index.html#L2928)):

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
```

390px: Karten sind block-level, kein Grid — `flex-wrap` im Kopf verhindert Overflow bei langen
Typ-Labels. 1440px: unverändert, `#zAnlaesse` liegt in der bestehenden `.nwt-pane`-Breite.

### 5.2 Sterne statt Rang in `.zw-rankline`

`renderZuweiser()` ([index.html:5613-5629](../../../index.html#L5613)): Sortierung und Kopfzeile ändern
sich, der restliche `.zcard`-Körper (Kontakt, Ort, Relevanz, Ansprechpartner, Fälle, letzter Kontakt,
Draht, Nächste Aktion, Portal-Button) bleibt exakt wie bisher.

```js
const sorted=[...filtered].sort((a,b)=>(zwSterne(b)||0)-(zwSterne(a)||0)||b.faelle-a.faelle);
...
"<div class='zw-rankline'>"+(zwSterne(z)!=null?sterneHtml(zwSterne(z)):"<span class='zwa-noster'>kein Ranking</span>")+zwSparkline(z.verlauf3M)+"</div>"
```

Sortiert primär nach Sternen absteigend, sekundär (bei Sterne-Gleichstand) nach `faelle` absteigend —
`Array.sort` ist stabil, bei völliger Gleichheit bleibt die ursprüngliche Array-Reihenfolge erhalten.

### 5.3 Sterne-Filter-Chips (analog `bucketOf()`/`.tier-chips`)

Neue lokale Zustandsvariable `zwSterneFilter="alle"` (neben bestehendem `zFilter`/`zArchivAnzeigen`,
[index.html:4735](../../../index.html#L4735)/[4742](../../../index.html#L4742)); Chips wiederverwenden
die generische `.tier-chips`/`.tchip`-CSS ([index.html:661-665](../../../index.html#L661), bereits
klassenneutral, keine `db-`/`bestand`-Kopplung im Namen) — **kein neues CSS nötig**:

```js
function zwChip(key,lbl,pool){
  const n=key==="alle"?pool.length:pool.filter(z=>zwSterne(z)===+key).length;
  return "<button class='tchip"+(zwSterneFilter===key?" on":"")+"' onclick='zwSterneFilter=\""+key+"\";renderZuweiser()'>"+lbl+" <b class='num'>"+n+"</b></button>";
}
// vor .zgrid, innerhalb von renderZuweiser(), pool = primaryFiltered (faelle>=1, respektiert Kategorie-Filter):
const chipsHtml="<div class='tier-chips'>"+zwChip("alle","Alle",primaryFiltered)
  +["5","4","3","2","1"].map(k=>zwChip(k,k+"★",primaryFiltered)).join("")+"</div>";
let sorted=[...filtered].filter(z=>zwSterneFilter==="alle"||zwSterne(z)===+zwSterneFilter)
  .sort((a,b)=>(zwSterne(b)||0)-(zwSterne(a)||0)||b.faelle-a.faelle);
```

Chips sind **pro Kategorie** skaliert (`primaryFiltered` ist bereits nach `zFilter`/`cat.id` gefiltert,
identisch zum Bestandscode [index.html:5584-5588](../../../index.html#L5584)) — ein Zuweiser aus dem
Archiv (`faelle:0`) taucht nur auf, wenn zusätzlich `zArchivAnzeigen` aktiv ist; sein `zwSterne()===null`
sorgt dafür, dass er von keinem Sterne-Chip erfasst wird (nur über „Alle" sichtbar, mit „kein Ranking"-
Label statt Sternen, §5.2).

---

## 6. Was entfällt (Waisen)

- **`.zw-rank`-CSS** ([index.html:2929](../../../index.html#L2929), `font-size:28px;font-weight:700;
  color:var(--brass-deep)`) — die Positionsnummer `#N` wird nicht mehr gerendert (ersetzt durch
  `sterneHtml()`); `.zw-rankline` selbst bleibt (jetzt Container für Sterne + Sparkline).
- **`arCard()`'s `isZ`-Zweig** ([index.html:5213-5216](../../../index.html#L5213)) — nach dieser Spec
  ruft niemand mehr `arCard()` mit einem `zuweiser-*`-Typ auf (`renderZuweiser()` nutzt `zwaKarte()`,
  der einzige verbleibende `arCard()`-Aufrufer ist `renderRadar()` mit `scope==="patienten"`,
  [index.html:5464](../../../index.html#L5464), liefert nie `zuweiser-*`-Typen). `isZ` ist damit immer
  `false` — toter Zweig, empfohlen zum Entfernen (eigener Namespace, kein Cofounder-Code).
- **`AR_TYP`'s vier `zuweiser-*`-Einträge** ([index.html:5209](../../../index.html#L5209)) und
  **`AR_FOTO["zuweiser-rhythmus"]`** ([index.html:5210](../../../index.html#L5210)) — nur noch von dem
  jetzt toten `isZ`-Zweig gelesen, gleiches Schicksal.
- **Alte Anlass-Texte/-Schwellen** (Wert-Tweaks, keine strukturellen Waisen): `Math.abs(diff)<=30`→`≤14`
  + neues `partnerTage>=350`-Gate (§3.3), `[20,10,5]`→`[50,25,10]` (§3.2) — die alten Zahlenwerte
  existieren nach dem Edit nirgends mehr im Quelltext, kein Waisen-Risiko.

**Bewusst NICHT verändert:** `rhythmusPflege()` ([index.html:5539-5544](../../../index.html#L5539)) bleibt
unverändert — sie liefert weiterhin den `znext`-Fallback-Text in der Stammdaten-Karte
([index.html:5626](../../../index.html#L5626)) für Zuweiser ohne aktiven `zuweiser-trend`-Eintrag, ein
anderer Anwendungsfall als die Pflege-Feed-Karten dieser Spec. `findeOderErstelleZuweiser()`
([index.html:5557-5565](../../../index.html#L5557)) bleibt ungenutzt liegen — geprüft und bewusst nicht
für `zuweiser-bericht` verwendet (§3.4), kein Cofounder-Code, aber außerhalb des Auftrags dieser Spec zu
entfernen.

---

## 7. Seeds-Diff

**(1) Jubiläums-Demo-Robustheit.** Ohne Änderung liegt Leopoldina-Krankenhaus bei `diff=−8` bereits im
neuen ±14-Tage-Fenster (§3.3), verliert diese Sichtbarkeit aber in 6 Tagen (`diff` wandert mit jedem realen
Kalendertag Richtung −14). Ein-Wert-Tweak, Tag-im-Monat-Nudge von 8 Tagen, Jahr/Monat unverändert (die
„seit 2019"-Erzählung bleibt vollständig intakt):

```diff
- {name:"Leopoldina-Krankenhaus",...,seit:"2019-07-15",...}
+ {name:"Leopoldina-Krankenhaus",...,seit:"2019-07-23",...}
```

Ergebnis: `diff=0` (Jahrestag fällt exakt auf den heutigen Kalendertag) → `urg="jetzt"`, symmetrische
±14-Tage-Marge in beide Richtungen (deutlich robuster für die kommenden Pitch-Vorführungen als die alten
6 Tage Marge). PRIMO MEDICO bleibt unverändert (`diff=+13`, eigenständig demo-sichtbar, zweite Karte).

**(2) Abschlussbericht-Seed.** Neues additives, optionales Feld `letzterAbschluss` (nur bei einem von 11
Einträgen gesetzt, bewusst kein Fixwert bei den übrigen 10 — sonst würde der Anlass dauerhaft für alle
mit `faelle>=1` feuern):

```diff
 {name:"RHÖN-KLINIKUM Campus",typ:"Akutklinik · Maximalversorger",...,next:"Feedback zu letzter Übernahme geben"}
+ {name:"RHÖN-KLINIKUM Campus",typ:"Akutklinik · Maximalversorger",...,next:"Feedback zu letzter Übernahme geben",letzterAbschluss:dstr(-5)}
```

Passt inhaltlich zum bereits bestehenden `next`-Text dieses Zuweisers (der bereits eine kürzlich
abgeschlossene Übernahme andeutet) — kein Bruch der bestehenden Erzählung, reine Ergänzung.

**Kein Tweak an `faelle`** für den Meilenstein-Typ (§3.2, bewusste Entscheidung, Seed-Lücke dokumentiert,
nicht künstlich behoben).

---

## 8. Abnahmekriterien (Browser-Checks)

1. **`#zAnlaesse` zeigt `.zwa-*`-Karten**, keine `.radar-card`/`arCard()`-Ausgabe mehr für Zuweiser;
   „Diese Woche" (2: Leopoldina-Jahrestag `jetzt`, Uniklinikum Würzburg-Trend↓ `jetzt`) / „Demnächst"
   (6: Leopoldina-Trend↑, Dr. Sommer-Trend↑, RHÖN-Abschlussbericht, RHÖN-Fortbildung, PRIMO MEDICO-
   Jahrestag, Thoraxzentrum-Rhythmus, in dieser `tage`-Reihenfolge).
2. **Jubiläums-Text neu:** Leopoldina zeigt „7. Jahrestag der Partnerschaft (seit 2019) — Jahres-
   Kooperationsgespräch mit Chefarzt/Leitung anbieten." — **nicht** mehr „Jubiläums-Geste senden".
3. **Abschlussbericht (neu):** RHÖN-KLINIKUM Campus zeigt „Gemeinsamer Patient vor 5 Tagen entlassen —
   Abschlussbericht und Dank an den Zuweiser senden."
4. **Fortbildung (neu):** RHÖN-KLINIKUM Campus zeigt zusätzlich „Einladung zu Fortbildung/Hospitation
   (CME) für das laufende Quartal versenden." — zwei Karten für denselben Zuweiser gleichzeitig, bewusst
   so, kein Bug.
5. **Meilenstein vorhanden, aber 0 Karten sichtbar** (§3.2, kein Fixbedarf) — kein Absturz, kein Fehler;
   `ZWA_TYP["zuweiser-meilenstein"]` feuert automatisch, sobald ein Zuweiser real 10 Fälle erreicht.
6. **„Erledigt"-Klick:** Karte verschwindet sofort aus `#zAnlaesse` (Session-scope, `_arDone` In-Memory,
   kehrt nach Reload zurück), Demo-Toast erscheint.
7. **Sterne statt Rang:** Stammdaten-Liste zeigt `sterneHtml()` statt `#1`…`#11`; Reihenfolge Leopoldina
   (5★) → Dr. Sommer (4★) → RHÖN (3★) → Thoraxzentrum/PRIMO (2★) → Uniklinikum Würzburg/Klinikum
   Fulda/König-Ludwig-Haus/Privatpraxis Neumann (1★) — exakt Tabelle §4, je aktiver Kategorie (`zFilter`
   bleibt wirksam).
8. **Sterne-Filter-Chips:** „5★" zeigt nur Leopoldina (Kategorie „Krankenhäuser"); „Alle" zeigt wieder
   die volle, sternensortierte Liste der aktiven Kategorie.
9. **Archiv unverändert:** Helios Klinikum/Reha-Technik Müller bleiben hinter `zArchivAnzeigen`
   verborgen, zeigen „kein Ranking" statt Sterne, erscheinen bei keinem Sterne-Chip außer „Alle".
10. **Mobile (390px):** `.zwa-card` kein horizontaler Overflow, Kopf-Flexbox umbricht bei langen Typ-
    Labels; Desktop (1440px) unverändert breit wie die bestehende `.nwt-pane`. 0 Console-Errors auf
    beiden Breiten; `grep -c "@keyframes" index.html` unverändert 9.
11. **Unberührte Bereiche:** `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `#refOverlay`, `openReferrer()` (weiterhin
    nur über den bestehenden `.zw-portal`-Button aufgerufen, [index.html:5627](../../../index.html#L5627)),
    `inReha[]`, `faelle[]`, `personen[]` (0 Zeilen-Diff) unverändert.

---

## 9. Nicht-Ziele

- **Zuweiserportal/`#refOverlay`/`openReferrer()`** (Cofounder-Bereich) — unberührt, weiterhin nur als
  Blackbox über den bestehenden Button aufgerufen.
- **Patienten-Anlässe** (Geburtstag/Entlass-Jubiläum/Wiederbedarf) — Thema von Punkt 6, nicht dieser
  Spec; `arCard()` bleibt für diese drei Typen unverändert aktiv.
- **`findeOderErstelleZuweiser()`** — bleibt ungenutzter, aber unangetasteter Code; keine Aktivierung,
  keine Löschung im Rahmen dieser Spec (§6).
- **`rhythmusPflege()`/`znext`-Fallback in der Stammdaten-Karte** — unverändert, siehe §6.
- **`zuweiser-meilenstein`-Seed-Fix** — bewusst nicht vorgenommen (§3.2/§7), keine `faelle`-Werte
  künstlich angehoben.
- **Gruppierte Stammdaten-Abschnitte** (analog `.db-group`/`.stg-h` bei Patienten) — bewusst NICHT gebaut;
  flache, sternensortierte Liste + Filter-Chips erfüllt die Anforderung „klares Ranking" bereits ohne
  zusätzliche Sektionsstruktur (Simplicity First).

---

## 10. Verifizierte Code-Anker (gelesen vor dieser Spec)

`anlaesse()`: [5125-5198](../../../index.html#L5125) (alle Aufrufstellen per grep geprüft:
[5200](../../../index.html#L5200), [5230](../../../index.html#L5230), [5464](../../../index.html#L5464),
[5610](../../../index.html#L5610), [5614](../../../index.html#L5614)) · `zuweiser-*`-Blöcke:
[5152-5191](../../../index.html#L5152) · `rhythmusPflege()`: [5539-5544](../../../index.html#L5539) ·
`jahrestagDiff()`: [4703-4710](../../../index.html#L4703) · `zuweiser[]` (11 Seeds):
[4320-4332](../../../index.html#L4320) · `zwSparkline()`: [5534-5538](../../../index.html#L5534) ·
`zNameHash()`/`verlaufAusFaellen()`: [5113-5124](../../../index.html#L5113) · `STERNE`/`STERNE_ORDER`/
`sterneVon()`/`bucketOf()`/`sterneHtml()`: [5086-5097](../../../index.html#L5086) · `renderZuweiser()`:
[5577-5629](../../../index.html#L5577) · `arCard()`/`AR_TYP`/`AR_FOTO`: [5209-5228](../../../index.html#L5209) ·
`renderBestand()`-Chip-Muster (Vorbild für `zwChip()`): [5411-5417](../../../index.html#L5411) ·
`Z_CATS`/`zKategorie()`: [5514-5528](../../../index.html#L5514) · `findeOderErstelleZuweiser()`:
[5557-5565](../../../index.html#L5557) (geprüft, bewusst nicht verwendet, §3.4/§6) · `escapeHtml()`:
[4749](../../../index.html#L4749) · `heute`: [4246](../../../index.html#L4246) · `.tier-chips`/`.tchip`:
[661-665](../../../index.html#L661) · `.radar-due`: [703-707](../../../index.html#L703) · `.ar-feedhead`:
[1493](../../../index.html#L1493) · `.btn-ghost`/`.btn-sm`: [84-88](../../../index.html#L84) · `.mtp-row`-
Etiketten-Muster (Strukturvorbild, nicht wiederverwendet, eigener Namespace): [2941-2949](../../../index.html#L2941) ·
`.zw-rankline`/`.zw-rank`: [2928-2929](../../../index.html#L2928) · `zArchivAnzeigen`/`zFilter`:
[4735](../../../index.html#L4735)/[4742](../../../index.html#L4742) · 9 `@keyframes`-Blöcke bestätigt
(`grep -c "@keyframes" index.html` = 9, keine neue hinzugefügt).
