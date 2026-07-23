# Runde 6, Punkt 6+7 — Patienten: individuelle Anlässe, Automatik-Regeln, reine Stammdaten

**Bezug:** Sechste Runde, Nutzer-Feedback-Punkte 6+7 (zusammen bearbeitet, da beide dieselben Views
betreffen). Nutzer wörtlich: (P6) „Patienten-Aktionen & Anlässe müssen strukturierter sein: das eine
sind personenbezogene individuelle Anlässe (Geburtstage, absehbare Nachsorge, Nachsorge bei
5-Sterne-Patienten), das andere allgemeine Aktionen, die man für Gruppen automatisiert haben sollte
(alle 3-Sterne-Patienten pro Quartal ein Newsletter, alle 6 Monate eine Broschüre). Viel muss
automatisiert sein können, viel Überblick notwendig." (P7) „Stammdaten = Daten zum Reinschauen, aber
Aktionen dürfen nicht erfordern, dass man aktiv reinschaut — das muss automatisch laufen, die Ebenen
dürfen sich nicht vermischen; genau schauen, was in Stammdaten & Ranking reingehört." Design-Entscheidung
an Claude delegiert. Sechste Spec der Runde-6-Reihe (P1–P5 betreffen andere Views); wiederverwendet
gezielt das `.zwa-*`-Etiketten-Muster und den `_arDone`-Session-State aus
[2026-07-23-runde6-punkt5-zuweiser-design.md](2026-07-23-runde6-punkt5-zuweiser-design.md).

**Leitplanken (aus [../../../CLAUDE.md](../../../CLAUDE.md)):** `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*` +
`#refOverlay` tabu (unberührt); Arrays additiv, nur Wert-Tweaks an bestehenden Feldern erlaubt; exakt
9 `@keyframes` (bestätigt, `grep -c "@keyframes" index.html` = 9 — diese Spec fügt keine neue Animation
hinzu, der neue Toggle-Switch nutzt eine CSS-`transition`, kein Keyframe); Jade-Apotheke-Identität,
Etiketten-Doppelrahmen für neue Karten; Gold nie als Textfarbe (`--brass-deep` für Text); `escapeHtml()`;
kein `Math.random`; 390px + 1440px, 0 Console-Errors; nur synthetische Daten.

---

## 1. Problem

`#sub-netzwerk-patienten` hat zwei Reiter (`.nwt-segbar`): „Aktionen & Anlässe" (`data-nwt="radar"`,
befüllt `#radarHost` über `renderRadar()`) und „Stammdaten" (`data-nwt="stamm"`, befüllt `#tierFilter`/
`#btable` über `renderBestand()`/`dbCockpit()`, Detail über `openDbDetail()`→`#dbDetail`).

**(a) Vermischte Anlass-Ebenen in „Aktionen & Anlässe".** `renderRadar()`
([index.html:5522-5549](../../../index.html#L5522)) rendert drei `arCard()`-Karten (Geburtstag/Jubiläum —
die „nur Text"-Optik, die P5 für Zuweiser bereits behoben hat, hier noch unverändert) neben einer
separaten, besseren `radar-grid`-Sektion für Wiederbedarf — ohne Trennung zwischen personenbezogenen
Einzel-Anlässen und „allgemeinen, für Gruppen zu automatisierenden Aktionen" (Quartals-Newsletter,
Broschüren-Rhythmus). Letzteres existiert **gar nicht als eigenes Konzept**: `STERNE[g].auto`
([index.html:5102-5108](../../../index.html#L5102)) liefert nur einen statischen Hinweistext pro
Sterne-Stufe, kein Regelwerk mit Zielgruppe, Rhythmus, nächstem Lauf und Empfängerzahl.

**(b) Fehlender Anlass-Typ „Nachsorge".** Der 6-Wochen-Check nach Entlassung (Premium-Variante bei
5★) fehlt komplett. Entlassungs-Ereignisse leben nur als `historie`-Einträge (`typ:"entlassung"`) in
`personen[]` ([index.html:4626-4654](../../../index.html#L4626)) und werden bisher ausschließlich vom
`jubilaeum`-Typ (Jahrestag) ausgewertet — nie für einen zeitnahen Nachsorge-Check.

**(c) Stammdaten & Ranking (P7) — Prüfung auf Vermischung.** Grep über `renderBestand()`/`dbCockpit()`
([index.html:5465-5521](../../../index.html#L5465)), `openDbDetail()`/`dbBody`
([index.html:5550-5573](../../../index.html#L5550)) und `paAkte()`
([index.html:4728-4745](../../../index.html#L4728)) — **kein Fund**: nur Filter-Chips, ein
`onclick='openDbDetail(i)'`-Navigationsbutton, sonst 0 `<button>`/`onclick` mit Versand-/Kontakt-Charakter
(`grep -n "button\|onclick"` über exakt diese Bereiche = 0 Treffer außer den genannten). Die einzigen
Aktions-Buttons stecken bereits korrekt in `renderRadar()` („Wiedervorlage planen"/„Kontaktfreigabe fehlt",
[index.html:5546](../../../index.html#L5546)). Die Ebenen sind **bereits sauber getrennt** — das
tatsächliche P7-Problem ist die unstrukturierte Aktions-Ebene (a), nicht eine Vermischung; das Ranking
selbst (Sterne+Label+Begründung, `sterneVon()`/`STERNE[g].label`/`p.sterneGrund`,
[index.html:5565-5566](../../../index.html#L5565)) ist bereits vollständig, keine Änderung nötig.

## 2. Zielbild

`#radarHost` (Reiter „Aktionen & Anlässe") gliedert sich künftig in **zwei klar benannte, optisch
konsistente Blöcke**, beide im `.zwa-*`-Etiketten-Stil aus P5:

- **A. Individuelle Anlässe** — personenbezogen, einzeln abzuarbeiten: `geburtstag`/`jubilaeum`
  (unverändert in der Bedingung) + NEU `nachsorge`, gruppiert „Diese Woche"/„Demnächst" (P5-Muster),
  jede Karte mit Session-„Erledigt". Wiederbedarf (`wiederbedarf`) bleibt als eigener, bereits guter
  Unterblock bestehen (Begründung §5.2).
- **B. Automatik-Regeln** (Kernstück, NEU) — vier feste Regeln (`PAT_REGELN`) für Gruppen-Automatik
  (Newsletter, Broschüre, Premium-Impuls, Reaktivierung), jede mit live berechneter Empfängerzahl aus
  `bestand[]`, deterministischem nächsten Lauf-Datum und einem Demo-Session-Toggle. Kein Versand — die
  Regel-Karte zeigt nur, *was automatisch laufen würde*.

`#tierFilter`/`#btable`/`openDbDetail()` (Reiter „Stammdaten") bleiben eine reine Daten-Ansicht, bekommen
aber eine neue **passive** Zeile „Automatik-Regeln" in `dbBody`, die zeigt, welche der vier Regeln auf
die gerade geöffnete Person zutreffen — ohne Button, ohne CTA, nur Information.

## 3. Datenmodell

### 3.1 `nachsorge` — neuer Anlass-Typ in `anlaesse()`

Formel: aus dem letzten `historie`-Eintrag mit `typ==="entlassung"` (identische Ableitung wie im
bestehenden `jubilaeum`-Block, [index.html:5150-5158](../../../index.html#L5150)) wird die Tage-Zahl seit
Entlassung berechnet; das Fenster ist **42–56 Tage** (6.–8. Woche — bewusst ein einmaliges, begrenztes
Fenster statt einer „ab Tag 42"-Dauerbedingung, analog zum bestehenden `zuweiser-bericht`-Fenster
[0,14] Tage, [index.html:5198-5204](../../../index.html#L5198)). Ab 5★ wird die Textzeile zur
persönlichen Geste (Nutzer-Vorgabe wörtlich), sonst der reguläre 6-Wochen-Check:

```js
/* Runde 6 Punkt 6 (§3.1): nachsorge — 6-Wochen-Check nach Entlassung, Premium-Variante ab 5★.
   Einfügen direkt nach dem bestehenden jubilaeum-Block (vor dem ersten zuweiser.forEach). */
personen.forEach(p=>{
 if(!p.sterne||p.sterne<2)return;
 if(!p.einwilligung||p.einwilligung.status!=="erteilt")return;
 const ent=(p.historie||[]).filter(h=>h.typ==="entlassung").map(h=>h.d).sort().pop();
 if(!ent)return;
 const tage=Math.round((heute-new Date(ent))/86400000);
 if(tage<42||tage>56)return;
 const key="nach:"+p.pid;if(_arDone.has(key))return;
 const premium=p.sterne>=5;
 out.push({key,typ:"nachsorge",urg:tage<=45?"jetzt":"bald",tage,titel:p.name,
  sub:"Reha vor "+tage+" Tagen abgeschlossen — "+(premium
   ?"Persönlicher Nachsorge-Anruf durch Bezugstherapeutin anbieten."
   :"Nachsorge-Check anbieten (6-Wochen-Kontakt)."),
  sterne:p.sterne,
  geste:premium?{label:"Persönlicher Nachsorge-Anruf",cta:"Anruf durch Bezugstherapeutin"}
              :{label:"Nachsorge-Check",cta:"Nachsorge-Check anbieten"},
  pid:p.pid});
});
```

Schwelle `sterne>=2` (nicht `>=3` wie bei `jubilaeum`) folgt bewusst dem `geburtstag`-Schwellenwert
([index.html:5143](../../../index.html#L5143)) — ein Nachsorge-Check ist ein niedrigschwelligerer,
fürsorglicher Kontakt als ein Kooperations-/Jubiläumsgespräch, passt daher zur breiteren Geburtstags-Schwelle.
`anlaesse()`s Scope-Filter ([index.html:5238](../../../index.html#L5238)) bekommt `nachsorge` ergänzt:
`a.typ==="geburtstag"||a.typ==="jubilaeum"||a.typ==="wiederbedarf"||a.typ==="nachsorge"`.

**Seed-Lücke geprüft:** Kein `personen[]`-Eintrag hat aktuell eine Entlassung im 42–56-Tage-Fenster
(durchgerechnet gegen alle `entlassung`-Einträge: P14 −345 Tage, P18 −400, P21 −330, P22 −150, P23 −425,
P24 −240, P25 −690 — alle weit außerhalb; P07–P11 sind noch stationär, keine Entlassung). Anders als beim
P5-Meilenstein ist hier explizit erwünscht, 2–3 Karten sichtbar zu machen — daher zwei **additive** neue
`personen[]`-Einträge (kein Tweak an bestehenden, anderswo referenzierten Personen, s. §3.3).

### 3.2 `PAT_REGELN` — Automatik-Regeln, wörtlich

Empfänger-Pool ist **`bestand[]`** (nicht `personen[]`) — das ist exakt der Datensatz, den „Stammdaten &
Ranking" zeigt (`dbCockpit()`s `n5/n4/n3/n2/n1/nG`-Zählung nutzt bereits denselben Pool,
[index.html:5466-5468](../../../index.html#L5466)) und derselbe, auf dem `openDbDetail()` operiert — die
neue dbDetail-Automatik-Zeile (§6) kann die Regeln so 1:1 gegen die gerade geöffnete Person prüfen, ohne
einen zweiten Personenkreis einzuführen. Aktive Patienten (`lebenszyklus:"patient"`, gerade in Behandlung)
sind bewusst **nicht** im Empfänger-Pool — sie sind nicht in `bestand[]`, ein Quartals-Newsletter an einen
aktuell stationären Patienten wäre unpassend.

```js
/* Runde 6 Punkt 6 (§3.2): PAT_REGELN — Automatik-Regeln für Patienten-Gruppen (Newsletter/Broschüre/
   Premium-Impuls/Reaktivierung). Empfänger-Pool = bestand[] (identisch mit dbCockpit()/Stammdaten). */
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
  zielLabel:"1–2★, ohne Kontakt seit über 12 Monaten, mit Einwilligung",rhythmus:"jährlich",
  aktion:"Reaktivierungs-Anschreiben senden",anker:{monat:1,tag:1},ruhendAbTage:365}
];
let patRegelnAn={"newsletter-q":true,"gesundheitsbrief":true,"jahresimpuls":true,"reaktivierung":true};
function parToggle(id){patRegelnAn[id]=!patRegelnAn[id];renderRadar();}
```

`anker` ist ein deterministischer Kalenderanker, kein `zNameHash()`-Offset wie bei
`zuweiser-fortbildung` — eine Gruppen-Regel hat **einen** gemeinsamen Lauftermin für alle Empfänger,
keinen individuellen:

```js
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
```

`sterneVon()`/`bucketOf()` ([index.html:5111-5112](../../../index.html#L5111)) werden wiederverwendet,
kein Duplikat der Sterne-Logik. Das „Ruhe"-Kriterium liest denselben `per.historie[...]`-Zugriffspfad,
den `renderBestand()`s `row()`-Funktion bereits für die „Letzter Kontakt"-Spalte nutzt
([index.html:5496](../../../index.html#L5496)).

### 3.3 Seeds-Diff

**(1) Zwei additive `personen[]`-Einträge** (nach P26, vor dem schließenden `]`,
[index.html:4654](../../../index.html#L4654)) — machen `nachsorge` demo-sichtbar, ohne bestehende,
anderswo referenzierte Personen (P14/P18/P21–P25, s. §3.1) anzufassen:

```diff
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

P27: `tage=49` → Fenster ✓, `urg="bald"`. P28: `tage=45` → Fenster ✓, `urg="jetzt"`, **Premium-Text**
(sterne=5). Beide bewusst **nicht** in `bestand[]`/`radar[]` — gleiche Konvention wie P21–P25:
`personen[]` ist die Gesamt-Registry, Slice-Arrays sind kuratiert, kein 1:1-Zwang. `geb`/`kt` gesetzt
(sonst `console.warn` in `paAssert()`, [index.html:4698-4705](../../../index.html#L4698)).

**(2) Ein Wert-Tweak** (Norbert Frey, P19) macht „Reaktivierung ruhender Kontakte" demo-sichtbar. Ohne
Tweak liegt der älteste 1-2★-Kontakt bei nur 90 Tagen (Norbert Frey selbst; Petra Lindner 20, Klaus Reuter
25, Ilse Hartmann 60) — unter der 365-Tage-Schwelle. Norbert Freys Text „Messe-Kontakt (Gesundheitsmesse),
**ruht**" trägt die Ruhe-Semantik bereits im Namen — passender Kandidat für einen reinen Datums-Tweak
(Kontaktmoment und Einwilligungsdatum waren identisch, bleiben es):

```diff
- {pid:"P19",...,einwilligung:{status:"erteilt",form:"mündlich",datum:dstr(-90),zwecke:["behandlung"]},
-  ...,historie:[{d:dstr(-90),typ:"kontakt",text:"Messe-Kontakt (Gesundheitsmesse), ruht"}]}
+ {pid:"P19",...,einwilligung:{status:"erteilt",form:"mündlich",datum:dstr(-395),zwecke:["behandlung"]},
+  ...,historie:[{d:dstr(-395),typ:"kontakt",text:"Messe-Kontakt (Gesundheitsmesse), ruht"}]}
```

`dstr(-395)` an beiden Stellen (derselbe Moment, konsistent verschoben) → 395 Tage seit letztem Kontakt,
überschreitet die 365-Tage-Schwelle mit 30 Tagen Marge (robust wie die Leopoldina-Korrektur in P5 §7).
Norbert Frey ist in keinem `radar[]`/hardcodierten Monats-Text referenziert — geprüft, kein
Kollisionsrisiko. Kein Tweak an `faelle`/`sterne`.

## 4. Empfänger je Regel — durchgerechnet gegen `bestand[]` (10 Einträge)

| Eintrag (`bestand[]`) | `sterneVon()` | consent | Letzter Kontakt |
|---|--:|:-:|--:|
| Sabine Vogt (P12) | 4★ | ja | 1 Tag |
| Bernd Kohl (P13) | 3★ | ja | 7 Tage |
| Markus Pfeiffer (P14) | 5★ | ja | 30 Tage |
| Petra Lindner (P15) | 2★ | ja | 20 Tage |
| Klaus Reuter (P16) | 2★ | ja | 25 Tage |
| Ilse Hartmann (P17) | 2★ | ja | 60 Tage |
| Gerda Sommer (P18) | 3★ | ja | 400 Tage |
| Norbert Frey (P19, nach Tweak) | 2★ | ja | **395 Tage** |
| Hannelore Beck (P20) | — | nein | — (gesperrt) |
| Unbekannt (Website) | — | nein | — (gesperrt) |

**Regel 1 · Quartals-Newsletter (3★+):** N=**4** — Sabine Vogt, Bernd Kohl, Markus Pfeiffer, Gerda Sommer.
Nächster Lauf: `patRegelLauf()` → Quartalsgrenze nach 2026-07-23 = **01.10.2026**.

**Regel 2 · Gesundheitsbrief & Broschüre (2★+):** N=**8** — alle einwilligenden `bestand[]`-Einträge
(Sabine Vogt, Bernd Kohl, Markus Pfeiffer, Petra Lindner, Klaus Reuter, Ilse Hartmann, Gerda Sommer,
Norbert Frey). Nächster Lauf: Halbjahresgrenze nach 2026-07-23 = **01.01.2027**.

**Regel 3 · SalutoCare-Jahresimpuls (5★):** N=**1** — Markus Pfeiffer. Nächster Lauf: **01.12.2026**.

**Regel 4 · Reaktivierung ruhender Kontakte (1-2★, >365 T. ohne Kontakt):** N=**1** — Norbert Frey
(395 Tage, nach Seed-Tweak §3.3). Ohne den Tweak wäre N=0 (dokumentierte Lücke wie in P5 §3.2, hier aber
durch den minimalen Tweak behoben statt offengelassen, da der Nutzer explizit „viel Überblick" für diese
Regel wünscht). Nächster Lauf: **01.02.2027**.

Alle vier Regeln sind damit demo-sichtbar (N≥1), zeigen unterschiedliche Rhythmen/Zielgruppen und werden
bei jedem echten Seitenaufruf gegen das tatsächliche `new Date()` neu berechnet (keine Fixwerte).

## 5. UI

### 5.1 Block A — Individuelle Anlässe: `paaKarte()` ersetzt `arCard()`

Vollständige Wiederverwendung der P5-Etiketten-Klassen — **kein neues CSS nötig** für diesen Block:
`.zwa-card`/`.zwa-head`/`.zwa-ico`/`.zwa-typ`/`.zwa-name`/`.zwa-text`/`.zwa-foot`/`.zwa-group`
([index.html:3144-3157](../../../index.html#L3144)) plus die bereits vorhandene `.ar-cardstars`
([index.html:1494](../../../index.html#L1494)) für die Sterne-Zeile (Zuweiser-Anlässe brauchen keine).

```js
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
```

`renderRadar()` ([index.html:5522-5549](../../../index.html#L5522)) ersetzt die Zeile
`oth.map(arCard).join("")` durch eine „Diese Woche"/„Demnächst"-Gruppierung (identisches Muster zu
`renderZuweiserAnlaesse()`, [index.html:5298-5304](../../../index.html#L5298)) über
`anlaesse("patienten").filter(a=>a.typ!=="wiederbedarf")` (also `geburtstag`+`jubilaeum`+`nachsorge`),
unter der Überschrift „Individuelle Anlässe" (`.ar-feedhead`, wiederverwendet auf zwei Ebenen — Block-Titel
und Diese-Woche/Demnächst-Untergruppe — analog zur P5-Verwendung dieser einen Klasse).

### 5.2 Wiederbedarf bleibt unverändert — Begründung

Die bestehende `radar-grid`-Sektion ([index.html:5537-5548](../../../index.html#L5537)) hat **nicht** das
P5-„nur Text"-Problem: Kalender-Icon, formatiertes Fälligkeitsdatum, Sterne, Prognose-Satz und — bewusste
Ausnahme — **gesperrte** Einträge (Walter Simon, `consent:"nein"`) mit deaktiviertem Button
(„Kontaktfreigabe fehlt"), eine Compliance-Transparenz, die `anlaesse()`s Wiederbedarf-Block selbst nicht
abbildet (filtert Gesperrte komplett heraus, [index.html:5159](../../../index.html#L5159)). Eine
Umstellung auf `paaKarte()` würde diese Sichtbarkeit ohne Gewinn verlieren — bleibt unangetastet, nur die
Nachbarschaft (Block-Überschriften) ändert sich (§5.1).

### 5.3 Block B — Automatik-Regeln: `parKarte()`/`renderPatRegeln()`

Etiketten-Karten (`.zwa-card` als Basis), NEU nur der Toggle-Switch (`.par-*`, CSS-Transition, keine
Animation):

```js
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

Angehängt ans Ende von `renderRadar()`s zusammengesetztem `innerHTML` (nach der Wiederbedarf-Sektion).
Empfängerzahl und Lauf-Datum sind **live** — jeder Aufruf von `renderPatRegelnHtml()` berechnet neu gegen
den aktuellen `bestand[]`-Stand, kein gecachter Wert.

**Neues CSS** (vor `</style>`, nahe dem `.zwa-*`-Block):

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

390px: `.zwa-head` ist bereits `flex-wrap`, Toggle bricht bei Bedarf in eine zweite Zeile um, kein Overflow.

## 6. `dbDetail` — neue passive Zeile „Automatik-Regeln"

`openDbDetail()` ([index.html:5550-5573](../../../index.html#L5550)) bekommt einen neuen `.di-row`
zwischen „Begründung" und „Quelle" — reine Information, kein Button, kein `onclick`:

```js
function patAutomatikText(p){
 const treffer=PAT_REGELN.filter(r=>patRegelnAn[r.id]&&patRegelEmpfaenger(r).some(e=>e===p));
 if(!treffer.length)return"Keine aktive Automatik-Regel";
 return treffer.map(r=>escapeHtml(r.name)+" · nächster Lauf "+paDate(patRegelLauf(r).toISOString().slice(0,10))).join("<br>");
}
// im dbBody-Template, nach der Begründung-Zeile:
+"<div class='di-row'><span class='di-k'>Automatik-Regeln</span><span>"+patAutomatikText(p)+"</span></div>"
```

`patRegelEmpfaenger(r).some(e=>e===p)` prüft Objekt-Identität gegen dasselbe `bestand[]`-Array-Element
(kein erneuter Filter-Aufbau nötig, `p` ist bereits `bestand[i]`). Beispiel Gerda Sommer (P18, 3★, ja):
zeigt „Quartals-Newsletter · nächster Lauf 01.10.2026<br>Gesundheitsbrief & Broschüre · nächster Lauf
01.01.2027" — genau zwei Zeilen, weil ihre 3★ beide Regeln erfüllen. Norbert Frey (P19, nach Tweak):
„Gesundheitsbrief & Broschüre · nächster Lauf 01.01.2027<br>Reaktivierung ruhender Kontakte · nächster
Lauf 01.02.2027". Hannelore Beck/Unbekannt (gesperrt): „Keine aktive Automatik-Regel" (kein `consent`).

## 7. Ranking-Block — Bestandsaufnahme (kein Fix nötig)

Geprüft gegen den Auftrag „Sterne + STERNE-Label + 1-Satz-Begründung": `openDbDetail()` zeigt bereits
`sterneHtml(sterneVon(p))` + `STERNE[g].label` + (bedingt) `person(p.personId).sterneGrund`
([index.html:5565-5566](../../../index.html#L5565)) — alle 26 `personen[]`-Einträge (inkl. der zwei neuen,
§3.3) haben `sterneGrund` gesetzt. Die Begründungs-Zeile fehlt korrekt nur bei „Unbekannt (Website)"
(kein `personId`, keine Einzelperson-Akte — konsistent mit `istEinzelperson()`-Konvention,
[index.html:4678](../../../index.html#L4678)). **Keine Code-Änderung** — Surgical Changes: Vorhandenes ist
bereits vollständig, nur die neue Automatik-Zeile (§6) wird ergänzt.

## 8. Was entfällt (Waisen)

- **`arCard()`** ([index.html:5254-5269](../../../index.html#L5254)) — nach §5.1 hat niemand mehr einen
  Aufrufer (einziger verbleibender Aufruf war `oth.map(arCard)` in `renderRadar()`, wird ersetzt). Eigener
  Namespace, kein Cofounder-Code, empfohlen zur Entfernung in der Umsetzung.
- **`AR_TYP`/`AR_FOTO`** ([index.html:5252-5253](../../../index.html#L5252)) — nur von `arCard()` gelesen,
  gleiches Schicksal.
- **`.ar-grid`-CSS** (inkl. `.ar-grid .radar-card`/`.ar-grid .radar-card .patient-actions`,
  [index.html:1480-1482](../../../index.html#L1480), [1495](../../../index.html#L1495)) — war exklusiv der
  Wrapper um `arCard()`-Ausgaben, nach §5.1 unbenutzt. **Nicht** betroffen: `.radar-card` selbst (weiterhin
  von Wiederbedarf und `.mt-grid` genutzt, geprüft per Grep) und `.patient-top`/`.patient-meta`/
  `.patient-actions`/`.radar-prog` (alle weiterhin von Wiederbedarf, Mein-Tag und Team-Cockpit verwendet).

**Bewusst NICHT verändert:** `STERNE[g].auto`/`autoFor()` ([index.html:5580-5582](../../../index.html#L5580))
bleiben als übergeordneter, stufenbezogener Automatik-Hinweis bestehen — ein anderer Anwendungsfall als die
neuen, konkreten `PAT_REGELN` (statische Tier-Beschreibung vs. konkrete Regel mit Datum+Empfängerzahl),
beide Zeilen ergänzen sich in `dbBody`, keine Redundanz-Löschung nötig.

## 9. Abnahmekriterien (Browser-Checks)

1. **„Individuelle Anlässe"** zeigt `.zwa-*`-Karten (kein `.radar-card`/`arCard()` mehr): „Diese Woche"
   (P28 Anton Weiss — Premium-Nachsorge-Anruf, `jetzt`) / „Demnächst" (P27 Rosa Klein — Nachsorge-Check,
   `bald`, plus bestehende Geburtstags-/Jubiläums-Karten je nach Kalenderdatum).
2. **Nachsorge-Text neu:** Anton Weiss „Reha vor 45 Tagen abgeschlossen — Persönlicher Nachsorge-Anruf
   durch Bezugstherapeutin anbieten." (5★). Rosa Klein „Reha vor 49 Tagen abgeschlossen — Nachsorge-Check
   anbieten (6-Wochen-Kontakt)." (3★).
3. **„Erledigt"-Klick:** Karte verschwindet sofort (Session-scope `_arDone`, kehrt nach Reload zurück).
4. **Wiederbedarf-Sektion unverändert:** eigene Kartenoptik mit Datum/Lock-Status, inkl. Walter Simon
   (gesperrt, disabled Button) — kein `.zwa-card`.
5. **Automatik-Regeln:** vier Karten — „Quartals-Newsletter" 01.10.2026 · 4 Empfänger, „Gesundheitsbrief &
   Broschüre" 01.01.2027 · 8, „SalutoCare-Jahresimpuls" 01.12.2026 · 1, „Reaktivierung ruhender Kontakte"
   01.02.2027 · 1.
6. **Toggle:** Klick dimmt die Karte auf „Pausiert — kein automatischer Lauf"; erneuter Klick stellt
   Lauf-Datum + Empfängerzahl wieder her (Session-scope, kein Reload-Persistenz).
7. **`dbDetail`-Automatik-Zeile:** Gerda Sommer zeigt zwei Regel-Zeilen (Newsletter+Gesundheitsbrief),
   Norbert Frey Gesundheitsbrief+Reaktivierung, Hannelore Beck „Keine aktive Automatik-Regel" — kein
   Button in dieser Zeile.
8. **Stammdaten unverändert:** `dbCockpit()`-Zahlen bleiben exakt wie vor dieser Spec (Rosa Klein/Anton
   Weiss sind bewusst NICHT in `bestand[]`), Sterne+Label+Begründung unverändert.
9. **Mobile (390px):** `.par-toggle` kein Overflow, `.zwa-head` bricht um; Desktop (1440px) unverändert,
   0 Console-Errors, `grep -c "@keyframes" index.html` unverändert 9.
10. **Unberührte Bereiche:** `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `#refOverlay`, `zuweiser[]`, `radar[]`
    (Struktur), `faelle[]`, `inReha[]`, P5s `zwaKarte()`/`zwSterne()` unberührt.

## 10. Nicht-Ziele

- **Echter Versand.** Regel-Klick/Toggle bleibt Demo — kein Newsletter-Tool, kein E-Mail-Versand;
  `kpOpen()`/`kpSend()`s Kampagnen-Editor ([index.html:5450-5463](../../../index.html#L5450)) bewusst
  nicht wiederverwendet, `PAT_REGELN` ist reine Übersicht ohne Versand-Dialog.
- **Zuweiser-Anlässe/-Sterne (P5).** `zwaKarte()`/`zwSterne()`/`ZWA_TYP` bleiben exakt wie in
  [2026-07-23-runde6-punkt5-zuweiser-design.md](2026-07-23-runde6-punkt5-zuweiser-design.md) spezifiziert.
- **`STERNE[g].auto`/`autoFor()`.** Bleibt bestehen (§8), keine Zusammenlegung mit `PAT_REGELN`.
- **Radar-B2C-Feed-Konsistenz geprüft:** `renderAnlaesse()` ([index.html:5270-5274](../../../index.html#L5270))
  setzt nur `rlCountPat`/`rlCountZuw` (Heute-Kachel, [index.html:3731](../../../index.html#L3731)) über
  `anlaesse("patienten").length` — bereits typ-agnostisch, zählt `nachsorge` automatisch mit, kein
  Änderungsbedarf.
- **`Wiederbedarf`-Umbau.** Bewusst nicht angetastet (§5.2).
- **Regel-Historie/Log.** Kein „wann zuletzt gelaufen"-Verlauf, nur der nächste Termin.

## 11. Verifizierte Code-Anker (gelesen vor dieser Spec)

`anlaesse()`: [5141-5241](../../../index.html#L5141) (Scope-Filter [5238](../../../index.html#L5238)) ·
`personen[]` (26 Einträge, P01–P26): [4626-4654](../../../index.html#L4626) · `gebIn()`:
[4620-4625](../../../index.html#L4620) · `paGeb()`: [4707-4714](../../../index.html#L4707) ·
`jahrestagDiff()`: [4718-4725](../../../index.html#L4718) · `paDate()`: [4706](../../../index.html#L4706) ·
`paAkte()`/`paAkteSlot()`: [4728-4748](../../../index.html#L4728) · `paAssert()`:
[4698-4705](../../../index.html#L4698) · `heute`/`dstr()`: [4261-4262](../../../index.html#L4261) ·
`bestand[]` (10 Einträge): [4310-4325](../../../index.html#L4310) · `radar[]` (5 Einträge):
[4327-4333](../../../index.html#L4327) · `STERNE`/`STERNE_ORDER`/`sterneVon()`/`bucketOf()`/`sterneHtml()`:
[5102-5113](../../../index.html#L5102) · `arGeste()`: [5116-5125](../../../index.html#L5116) ·
`arAktion()`: [5242-5251](../../../index.html#L5242) · `AR_TYP`/`AR_FOTO`/`arCard()`:
[5252-5269](../../../index.html#L5252) · `renderAnlaesse()`: [5270-5274](../../../index.html#L5270) ·
`dbCockpit()`: [5465-5482](../../../index.html#L5465) · `renderBestand()`:
[5483-5521](../../../index.html#L5483) · `renderRadar()`: [5522-5549](../../../index.html#L5522) ·
`openDbDetail()`/`closeDbDetail()`/`autoFor()`: [5550-5583](../../../index.html#L5550) ·
`renderAll()`: [6417](../../../index.html#L6417) · P5-Anker (wiederverwendet, unverändert gelesen):
`ZWA_TYP`/`zwaKarte()`/`renderZuweiserAnlaesse()`: [5279-5304](../../../index.html#L5279) · `.zwa-*`-CSS:
[3144-3157](../../../index.html#L3144) · `.ar-feedhead`/`.ar-grid`/`.ar-cardstars`:
[1480-1495](../../../index.html#L1480) · `.radar-due`: [703-707](../../../index.html#L703) ·
`.tier-chips`/`.tchip`: [661-662](../../../index.html#L661) · `.btn-ghost`/`.btn-sm`:
[84-88](../../../index.html#L84) · `.db-intro`: [659](../../../index.html#L659) · Grep-Verifikation
„keine Aktions-Buttons in Stammdaten/dbDetail": `sed -n '5465,5583p' index.html | grep -n "onclick\|btn-"`
(nur Filter-Chips + Zeilen-Navigation, keine Versand-CTA) und `sed -n '5550,5578p;4728,4748p' index.html |
grep -n "button\|onclick"` (0 Treffer) · `grep -n "ar-grid\|arCard(" index.html` (Aufrufstellen-Check,
bestätigt einziger verbleibender Aufruf vor dieser Spec: [5536](../../../index.html#L5536)) · 9
`@keyframes`-Blöcke bestätigt (`grep -c "@keyframes" index.html` = 9, keine neue hinzugefügt).
