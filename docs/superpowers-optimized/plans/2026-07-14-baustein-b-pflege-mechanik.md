# Baustein B: Pflege-Mechanik — Implementation Plan

> **For agentic workers:** Umsetzung Task-für-Task über Lanes (Task 2 = Haiku, Tasks 3–5 = Sonnet). Orchestrator (Fable) verifiziert zwischen Tasks und führt Task 6 aus. Checkbox-Syntax (`- [ ]`).

**Goal:** 5-Sterne-Klassifikation ersetzt A/B/C in der Kontakt-Datenbank; Anlass-Engine (Geburtstage, Wiederbedarf, Zuweiser-Rhythmus) mit sterne-skalierten Gesten auf Heute + im Radar-Tab; Kampagnen-Workflow (Newsletter: Segment → Entwurf → Premium-Vorschau → Demo-Versand).

**Architecture:** Alles in `index.html`, additiv bis auf den vom Advisor verlangten sauberen Schnitt (TIERS→STERNE inkl. Löschung der `tier:`-Felder — Claude-Bereich). Neue Namespaces `.st-*` (Sterne), `.ar-*` (Anlass-Radar), `.kp-*` (Kampagne). Kampagnen-Sheet wird per JS erzeugt (Muster `rpToast`), kein statisches Overlay-Markup nötig.

**Spec:** `docs/superpowers-optimized/specs/2026-07-14-baustein-b-pflege-mechanik-design.md` (verbindlich, inkl. Typ-Vertrag §2.1: Bucket-Werte sind STRINGS, `personen[].sterne` ist Number; Design-Messlatte §1).

**Zeilenanker gelten für `main` = `39a0301`** (index.html identisch mit `944c2f1`). Lanes ankern per Suchstring, nicht per Zeilennummer.

---

## Für jede Lane verbindlich (in jeden Lane-Prompt kopieren)

- Repo: `/Users/arasch/Library/CloudStorage/ProtonDrive-pnei_konzept@proton.me-folder/SalutoCare/bavaria-trichter-prototyp`, Branch `feat/pflege`, einzige Datei `index.html`.
- Cofounder tabu: `renderMatrix`, `openReferrer`/`#refOverlay`, `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`. `zuweiser[]`/`inReha[]`/`radar[]`-Feldnamen unangetastet (lesen ok; `zuweiserEvents` darf wachsen).
- VERBOTEN: die toten CSS-Klassen `.tier-pill.s1–s5`, `.stufe-badge.s1–s5`, `.tbadge.*` verwenden.
- Syntax-Selbstcheck nach jedem Task: `sed -n '/^<script>$/,/^<\/script>$/p' index.html | sed '1d;$d' > /tmp/kp-check.js && node --check /tmp/kp-check.js && echo SYNTAX-OK` → `SYNTAX-OK`.
- Sync-Wache (ProtonDrive!): vor Beginn `git status --short` sauber (nur `?? HANDOVER.md`), sonst STOPP + melden. Nach Commit: `git status --short`, `ls | grep -c "Edit conflict"` → 0, Hash-Vergleich `git show HEAD:index.html | shasum` == `shasum index.html`. Ausgaben wörtlich in den Report.
- Commit-Message wie angegeben + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. KEIN Push.

---

### Task 1: Branch (Orchestrator)
- [ ] `git checkout -b feat/pflege`

---

### Task 2: Sterne-Kuration der Seeds (Lane: claude-implementer / Haiku)

**Files:** Modify `index.html` — NUR `personen[]`-Literale (Anker `let personen=[`) + `pNew` (Anker `function pNew(name,teil){`).

- [ ] **Step 1:** In jedem der 25 `personen[]`-Elemente direkt NACH dem Feld `kt:"…",` die zwei Felder `sterne:<n>,sterneGrund:"<text>",` einfügen — exakt nach dieser Tabelle:

| pid | sterne | sterneGrund |
|---|---|---|
| P01 | 3 | "PKV, Gespräch über Sozialdienst, Angehörige aktiv" |
| P02 | 4 | "Selbstzahlerin bestätigt, konkretes Beratungsgespräch" |
| P03 | 4 | "Konkretes Weaning-Gespräch, echter Bedarf (SalutoCare)" |
| P04 | 3 | "Kassenpatient mit Komfort-Interesse (GKV + Komfort)" |
| P05 | 4 | "PKV mit Kostenzusage, Aufnahme in Planung" |
| P06 | 1 | "Hat explizit abgesagt — anderes Haus gewählt" |
| P07 | 5 | "Aktiver Privatpatient im Haus (Privatzimmer)" |
| P08 | 5 | "Aktive Privatpatientin im Haus" |
| P09 | 5 | "Aktiver Privatpatient, Einzelzimmer-Wahlleistung" |
| P10 | 5 | "Aktive Selbstzahlerin (SalutoCare-Suite)" |
| P11 | 5 | "Aktive Privatpatientin (Neurologie)" |
| P12 | 4 | "Konkretes Erstgespräch, Komfort-Reha gewünscht" |
| P13 | 3 | "Gespräch geführt, Interesse an Neuro-Reha" |
| P14 | 5 | "War in Premium-Reha & begeistert, aktiver Selbstzahler" |
| P15 | 2 | "Nur Broschüre geladen" |
| P16 | 2 | "Broschüre-Download ohne konkrete Anfrage" |
| P17 | 2 | "Newsletter-Leserin, noch keine Anfrage" |
| P18 | 3 | "War bereits da (Ortho-Reha), Wiederkehr-Potenzial" |
| P19 | 2 | "Messe-Kontakt ohne konkrete Details" |
| P20 | 2 | "Kurze Anfrage ohne Details, keine Freigabe" |
| P21 | 5 | "War da & sehr zufrieden, Komfort-Zusatz, Gegenseite absehbar" |
| P22 | 5 | "Premium-Wiederkehrerin, aktive Selbstzahlerin" |
| P23 | 4 | "War da, PKV, regelmäßiger Nachsorge-Bedarf" |
| P24 | 4 | "War da, PKV, Gegenseite mittelfristig wahrscheinlich" |
| P25 | 1 | "Einwilligung widerrufen, kein Zuzahlungsinteresse" |

- [ ] **Step 2:** In `pNew()` im `Object.assign`-Default nach `kt:"Unklar",` einfügen: `sterne:2,sterneGrund:"Neu erfasst — noch nicht qualifiziert",`
- [ ] **Step 3: Selbstcheck:** `grep -c 'sterne:' index.html` → 26 (25 Seeds + pNew) · `grep -c 'sterneGrund' index.html` → 26 · Syntax-Selbstcheck.
- [ ] **Step 4: Commit** — `feat(pflege): Sterne-Kuration personen[] (25 Seeds, Kollegen-Kriterien) + pNew-Default 2★`

---

### Task 3: Der Sterne-Schnitt — TIERS→STERNE atomar (Lane: claude-implementer-pro / Sonnet)

**Files:** Modify `index.html` — Datenbank-Logikblock (Anker Zeile ~2988–3118), bestand-Literale, inDatenbank, paAkte, CSS.

- [ ] **Step 1:** Den Block von `const TIERS={` bis einschließlich `function bucketOf(p){return p.consent!=="ja"?"gesperrt":p.tier;}` ERSETZEN durch:

```js
const STERNE={
 5:{label:"Heißester Lead — Wiederkehr / VIP",note:"War bereits da & begeistert · aktiver Selbstzahler/Privatpatient · hat aktiv weiterempfohlen",auto:"Persönliche Betreuung durch Recovery Manager · bevorzugte Terminvergabe",geste:"Geschenk (Stift, Visitenkarte, persönliche Note)"},
 4:{label:"Sehr qualifiziert — Selbstzahler mit Interesse",note:"Selbstzahler bestätigt · konkretes Gespräch, echter Bedarf · Angehöriger mit Entscheidungsauftrag",auto:"Persönlicher Rückruf + Wiedervorlage",geste:"Handgeschriebene Karte + persönlicher Anruf"},
 3:{label:"Qualifiziert — Interesse vorhanden",note:"Privat-/Kassenpatient mit Zusatzversicherung · Gespräch geführt · aktiv recherchierender Angehöriger",auto:"Wiedervorlage + Infopaket",geste:"Karte oder Anruf"},
 2:{label:"Schwacher Lead — wenig Signale",note:"Nur Broschüre · kurze Anfrage ohne konkrete Details",auto:"Automatische Info-/Newsletter-Strecke",geste:"Gruß im Newsletter"},
 1:{label:"Nicht qualifiziert — kein Potenzial",note:"Nie erreicht · falsche Zielgruppe · reiner Kassenpatient · explizit abgesagt",auto:"Keine aktive Pflege · Datenhygiene",geste:null}
};
const STERNE_ORDER=["5","4","3","2","1"];
let sterneFilter="alle";
function sterneVon(p){const per=p.personId?person(p.personId):null;return per&&per.sterne?per.sterne:2;}
function bucketOf(p){return p.consent!=="ja"?"gesperrt":String(sterneVon(p));}
function sterneHtml(n){let s="";for(let i=1;i<=5;i++)s+="<span class='st"+(i<=n?" on":"")+"'>★</span>";return "<span class='st-row' role='img' aria-label='"+n+" von 5 Sternen'>"+s+"</span>";}
```

- [ ] **Step 2: `dbCockpit()` komplett ersetzen** durch (Titel „Verteilung nach Sternen", 6 Segmente, Handlungsbedarf = consent ja && sterne≥4):

```js
function dbCockpit(){
  const c=b=>bestand.filter(p=>bucketOf(p)===b).length;
  const n5=c("5"),n4=c("4"),n3=c("3"),n2=c("2"),n1=c("1"),nG=c("gesperrt");
  const nHot=bestand.filter(p=>p.consent==="ja"&&sterneVon(p)>=4).length;
  const nOk=bestand.filter(p=>p.consent==="ja").length;
  const seg=(n,cls)=>n?"<span class='dbc-seg "+cls+"' style='flex:"+n+"'></span>":"";
  return "<div class='db-cockpit'>"
    +"<div class='dbc-stat'><div class='dbc-num num'>"+bestand.length+"</div><div class='dbc-lbl'>Kontakte</div></div>"
    +"<div class='dbc-div'></div>"
    +"<div class='dbc-barwrap'><div class='dbc-bartitle'>Verteilung nach Sternen</div>"
      +"<div class='dbc-bar'>"+seg(n5,"s5s")+seg(n4,"s4s")+seg(n3,"s3s")+seg(n2,"s2s")+seg(n1,"s1s")+seg(nG,"sGs")+"</div>"
      +"<div class='dbc-legend'><span><i class='l5'></i>5★ "+n5+"</span><span><i class='l4'></i>4★ "+n4+"</span><span><i class='l3'></i>3★ "+n3+"</span><span><i class='l2'></i>2★ "+n2+"</span><span><i class='l1'></i>1★ "+n1+"</span><span><i class='lG'></i>Gesperrt "+nG+"</span></div>"
    +"</div>"
    +"<div class='dbc-div'></div>"
    +"<div class='dbc-stat hot'><div class='dbc-num num'>"+nHot+"</div><div class='dbc-lbl'>Handlungsbedarf</div></div>"
    +"<div class='dbc-stat'><div class='dbc-num num'>"+nOk+"</div><div class='dbc-lbl'>kontaktfähig</div></div>"
  +"</div>";
}
```

- [ ] **Step 3: `renderBestand()` anpassen (4 Edits):**
  1. Im Body der `const chip=…`-Arrow-Function BEIDE `tierFilter`-Vorkommen durch `sterneFilter` ersetzen (das `tierFilter===key` UND das `tierFilter=\"…\"` im onclick-String — Signatur/Struktur bleiben gleich). Danach die `const chips=…`-Zeile ersetzen: `const chips="<div class='tier-chips'>"+chip("alle","Alle")+STERNE_ORDER.map(k=>chip(k,k+"★")).join("")+chip("gesperrt","Gesperrt")+"</div>";`
  2. `const groups=…` → `const groups=sterneFilter==="alle"?[...STERNE_ORDER,"gesperrt"]:[sterneFilter];`
  3. Das `ICO`-Objekt ERSATZLOS löschen (Icons weichen Sternen); in der Gruppen-Schleife die Zeilen `const ico=…`, `const title=…`, `const note=…`, `const auto=…` ersetzen durch:
```js
    const kopf=gesperrt?"<span class='db-ico gesperrt'><svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><rect x='5' y='11' width='14' height='9' rx='2'/><path d='M8 11V8a4 4 0 0 1 8 0v3'/></svg></span>":sterneHtml(Number(g));
    const title=gesperrt?"Gesperrt":escapeHtml(STERNE[g].label);
    const note=gesperrt?"keine Einwilligung":STERNE[g].note;
    const auto=gesperrt?"Keine Ansprache (Compliance)":STERNE[g].auto;
```
  4. Header-Zeile: `+"<header class='db-group-h'>"+ico+…` → `+"<header class='db-group-h st-h'>"+kopf+"<div class='db-group-txt'><div class='db-group-t'>"+title+"<span class='db-group-n num'>"+rows.length+"</span></div><div class='db-group-note'>"+escapeHtml(note)+"</div></div></header>"`

- [ ] **Step 4: `openDbDetail()`** — die „Einstufung"-Zeile ersetzen durch:
```js
    +"<div class='di-row'><span class='di-k'>Einstufung</span><span>"+sterneHtml(sterneVon(p))+" <span class='st-lbl'>"+escapeHtml((STERNE[String(sterneVon(p))]||{}).label||"")+"</span></span></div>"
    +((p.personId&&person(p.personId)&&person(p.personId).sterneGrund)?"<div class='di-row'><span class='di-k'>Begründung</span><span>"+escapeHtml(person(p.personId).sterneGrund)+"</span></div>":"")
```
- [ ] **Step 5: `autoFor()`** — Rückgabezeile ersetzen: `return (STERNE[String(sterneVon(b))]||{}).auto||"Ruhende Pflege";`
- [ ] **Step 6: `tier:`-Felder LÖSCHEN** (Advisor-Auflage sauberer Schnitt): in allen 10 `bestand[]`-Literalen das Feld `tier:"A",`/`tier:"B",`/`tier:"C",` entfernen; in `inDatenbank()` das Feld `tier:"C",` aus dem `bestand.unshift({…})` entfernen. `grep -c 'tier:"' index.html` muss danach 0 sein.
- [ ] **Step 7: `paAkte()`** — im `pa-head` nach dem kt-Chip anhängen: `+(p.sterne?sterneHtml(p.sterne):"")`
- [ ] **Step 8: CSS** — (a) Zeile `.dbc-seg.sA{…}.dbc-seg.sG{…}` ERSETZEN durch:
```css
  .dbc-seg.s5s{background:#6e5d4e}.dbc-seg.s4s{background:#9b8573}.dbc-seg.s3s{background:#bfa886}.dbc-seg.s2s{background:#d7c8bc}.dbc-seg.s1s{background:#e9e3d8}.dbc-seg.sGs{background:#c9c4bb}
  .dbc-legend i.l5{background:#6e5d4e}.dbc-legend i.l4{background:#9b8573}.dbc-legend i.l3{background:#bfa886}.dbc-legend i.l2{background:#d7c8bc}.dbc-legend i.l1{background:#e9e3d8}.dbc-legend i.lG{background:#c9c4bb}
```
  (b) NEUEN kommentierten Block vor `</style>` einfügen:
```css
/* ---------- Baustein B · Sterne (.st-*) ---------- */
.st-row{display:inline-flex;gap:1px;font-size:13px;line-height:1;letter-spacing:.5px}
.st-row .st{color:var(--hair)}
.st-row .st.on{color:var(--brass)}
.st-lbl{font:600 11px/1.4 Inter;letter-spacing:.04em;color:var(--muted)}
.db-group-h.st-h .st-row{font-size:15px;margin-top:3px}
.pa-head .st-row{font-size:12px}
```
- [ ] **Step 9: Selbstchecks:** Syntax-Selbstcheck · `grep -c 'TIERS' index.html` → 0 · `grep -c 'tier:"' index.html` → 0 · `grep -c "tierFilter=" index.html` → 0 UND `grep -c 'id="tierFilter"' index.html` → 1 (die DOM-id bleibt bewusst bestehen) · `grep -c 'sterneHtml' index.html` → 4 (Definition + renderBestand + openDbDetail + paAkte; die Anlass-Verwendungen kommen erst mit Task 4).
- [ ] **Step 10: Commit** — `feat(pflege): Sterne-Schnitt — STERNE ersetzt TIERS vollstaendig (Datenbank-UI, Cockpit, Inspektor, autoFor, Akte; tier-Felder entfernt)`

---

### Task 4: Anlass-Engine + Heute-Feed + Radar & Anlässe (Lane: claude-implementer-pro / Sonnet)

**Files:** Modify `index.html` — 6 Stellen.

- [ ] **Step 1: Engine** — direkt NACH der Funktion `sterneHtml` (Ende von Task-3-Step-1-Block) einfügen:

```js
/* ---------- Baustein B · Anlass-Engine (.ar-*) — Spec 2026-07-14 §3 ---------- */
const AR_RHYTHMUS={aktiv:45,aufbau:30,ziel:60};
let _arDone=new Set();
function arGeste(p){
 const ew=p.einwilligung||{};const ok=ew.status==="erteilt";const zw=ew.zwecke||[];
 if(p.sterne>=3){
  if(zw.includes("post"))return{label:STERNE[String(p.sterne)].geste,cta:p.sterne>=5?"Geschenk vormerken":"Karte vormerken"};
  if(ok)return{label:"Persönlicher Anruf",cta:"Anruf planen"};
  return null;
 }
 if(p.sterne===2)return zw.includes("newsletter")?{label:"Gruß im Newsletter",cta:"In Newsletter aufnehmen"}:null;
 return null;
}
function anlaesse(){
 const out=[];
 personen.forEach(p=>{
  if(!p.geb||!p.sterne||p.sterne<2)return;
  const g=paGeb(p.geb);if(!g||g.tage>30)return;
  const geste=arGeste(p);if(!geste)return;
  if(_arDone.has("geb:"+p.pid))return;
  out.push({key:"geb:"+p.pid,typ:"geburtstag",urg:g.tage<=7?"jetzt":"bald",tage:g.tage,titel:p.name+" wird "+g.wird,sub:"Geburtstag am "+g.datum+" · in "+g.tage+" Tagen",sterne:p.sterne,geste:geste,pid:p.pid});
 });
 radar.forEach(r=>{
  if(r.consent!=="ja")return;
  const key="radar:"+(r.personId||r.name);if(_arDone.has(key))return;
  const per=r.personId?person(r.personId):null;
  out.push({key:key,typ:"wiederbedarf",urg:r.faelligInTagen<=45?"jetzt":r.faelligInTagen<=120?"bald":"beob",tage:r.faelligInTagen,titel:r.name+" — Wiederbedarf absehbar",sub:r.prognose,sterne:per?per.sterne:null,geste:{label:"Persönliche Wiedervorlage",cta:"Wiedervorlage planen"},pid:r.personId});
 });
 zuweiser.forEach(z=>{
  const kad=AR_RHYTHMUS[z.status]||60;
  const seit=z.letzter?Math.round((heute-new Date(z.letzter))/86400000):9999;
  if(seit<kad)return;
  const key="zuw:"+z.name;if(_arDone.has(key))return;
  out.push({key:key,typ:"zuweiser",urg:seit>=kad*1.5?"jetzt":"bald",tage:seit===9999?999:seit,titel:z.name,sub:(z.letzter?seit+" Tage kein Kontakt":"Noch nie kontaktiert")+" · "+(z.next||""),sterne:null,geste:{label:z.next||"Kontakt aufnehmen",cta:"Kontakt aufnehmen"},zName:z.name});
 });
 const ord={jetzt:0,bald:1,beob:2};
 return out.sort((a,b)=>(ord[a.urg]-ord[b.urg])||(a.tage-b.tage));
}
function arAktion(key){
 const a=anlaesse().find(x=>x.key===key);if(!a)return;
 if(a.pid)pHist(a.pid,"kontakt",a.geste.cta+" (Anlass-Radar): "+a.titel);
 if(a.zName)zuweiserEvents.push({zName:a.zName,d:dstr(0),typ:"gespraech",text:"Kontakt aufgenommen (Anlass-Radar)"});
 _arDone.add(key);
 if(typeof inbToast==="function")inbToast("done","<b>"+escapeHtml(a.geste.cta)+"</b> (Demo)",escapeHtml(a.titel),null);
 renderAnlaesse();
 if(typeof dbView!=="undefined"&&dbView==="radar")renderBestand();
}
const AR_TYP={geburtstag:"Geburtstag",wiederbedarf:"Wiederbedarf",zuweiser:"Zuweiser-Kontakt"};
function arCard(a){
 return "<div class='ar-card"+(a.urg==="jetzt"?" jetzt":"")+"'>"
  +"<div class='ar-top'><span class='ar-typ'>"+AR_TYP[a.typ]+"</span>"+(a.sterne?sterneHtml(a.sterne):"")+"</div>"
  +"<div class='ar-name'>"+escapeHtml(a.titel)+"</div>"
  +"<div class='ar-sub'>"+escapeHtml(a.sub)+"</div>"
  +"<div class='ar-act'><span class='ar-geste'>"+escapeHtml(a.geste.label)+"</span><button class='btn-brass btn-sm' onclick='arAktion(\""+a.key.replace(/"/g,"&quot;")+"\")'>"+escapeHtml(a.geste.cta)+" ›</button></div>"
  +"</div>";
}
function renderAnlaesse(){
 const el=document.getElementById("anlassList");if(!el)return;
 const list=anlaesse();
 const nG=list.filter(a=>a.typ==="geburtstag").length,nW=list.filter(a=>a.typ==="wiederbedarf").length,nZ=list.filter(a=>a.typ==="zuweiser").length;
 const sum=document.getElementById("anlassSum");
 if(sum)sum.textContent=[nG?nG+(nG===1?" Geburtstag":" Geburtstage"):null,nW?nW+"× Wiederbedarf":null,nZ?nZ+(nZ===1?" Zuweiser wartet":" Zuweiser warten"):null].filter(Boolean).join(" · ")||"Keine offenen Anlässe";
 el.innerHTML=list.slice(0,3).map(arCard).join("")||"<p class='empty'>Alles gepflegt — keine offenen Anlässe.</p>";
}
```

- [ ] **Step 2: Heute-HTML** — unmittelbar VOR der Zeile `<div class="card ns-card">` einfügen (Advisor-Auflage: VOR der ns-card, eigene ID):
```html
    <div class="chap" id="anlassChap">
      <div class="kicker">Anlässe · Beziehungen pflegen</div>
      <div class="ar-head"><span class="ar-sum" id="anlassSum"></span><button class="ar-more" onclick="go('netzwerk','bestand');setDbView('radar')">Alle Anlässe ›</button></div>
      <div class="ar-grid" id="anlassList"></div>
    </div>
```
- [ ] **Step 3: renderAll-Hook** — Zeile `function renderAll(){…renderTeam();}` → am Ende `renderAnlaesse();` ergänzen (vor `}`).
- [ ] **Step 4: Radar-Tab wird „Radar & Anlässe"** — (a) im statischen HTML: `<button id="dbRadar" onclick="setDbView('radar')">Radar</button>` → Label `Radar &amp; Anlässe`. (b) In `renderRadar()`: NACH `+rhead` und VOR `+"<div class='radar-grid'>"` einfügen:
```js
   +(function(){const oth=anlaesse().filter(a=>a.typ!=="wiederbedarf");return oth.length?"<div class='ar-feedhead'>Anlässe (Geburtstage & Zuweiser)</div><div class='ar-grid'>"+oth.map(arCard).join("")+"</div><div class='ar-feedhead'>Wiederbedarf (medizinische Prognose)</div>":"";})()
```
  (c) Radar-Karten: `<h3>`-Zeile ergänzen — nach `+"<h3>…</h3>"` einfügen: `+(r.personId&&person(r.personId)?"<div class='ar-cardstars'>"+sterneHtml(person(r.personId).sterne)+"</div>":"")` und den CTA-onclick ersetzen: `onclick='radarPlan("+i+")'` → `onclick='arAktion(\"radar:"+(r.personId||escapeHtml(r.name))+"\")'` mit Label `Wiedervorlage planen` (unverändert). (d) Die Funktion `radarPlan(i)` ersatzlos LÖSCHEN.
- [ ] **Step 5: CSS** — kommentierten Block vor `</style>`:
```css
/* ---------- Baustein B · Anlass-Radar (.ar-*) ---------- */
#anlassChap{grid-column:1/-1}
.ar-head{display:flex;align-items:baseline;gap:12px;margin:2px 0 12px}
.ar-sum{font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-size:19px;color:var(--ink-soft)}
.ar-more{margin-left:auto;background:none;border:none;cursor:pointer;font:600 12px/1 Inter;color:var(--brass-deep);letter-spacing:.03em;padding:6px 2px}
.ar-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}
.ar-card{background:var(--paper);border:1px solid var(--hair);border-top:2px solid var(--brass-line);border-radius:14px;padding:14px 16px;box-shadow:var(--shadow-soft);display:flex;flex-direction:column;gap:7px}
.ar-card.jetzt{border-top-color:var(--brass)}
.ar-top{display:flex;align-items:center;gap:8px}
.ar-typ{font:600 10px/1 Inter;letter-spacing:.08em;text-transform:uppercase;color:var(--brass-deep);background:var(--brass-soft);padding:4px 8px;border-radius:999px}
.ar-top .st-row{margin-left:auto}
.ar-name{font-family:"Cormorant Garamond",Georgia,serif;font-weight:600;font-size:19px;color:var(--ink);line-height:1.25}
.ar-sub{font-size:12.5px;color:var(--muted);line-height:1.45}
.ar-act{display:flex;align-items:center;gap:10px;margin-top:auto;padding-top:8px;border-top:1px solid var(--hair2)}
.ar-geste{font-size:11.5px;color:var(--ink-soft)}
.ar-act .btn-brass{margin-left:auto;white-space:nowrap}
.ar-feedhead{font:600 10.5px/1 Inter;letter-spacing:.07em;text-transform:uppercase;color:var(--brass-deep);margin:18px 0 10px}
.ar-cardstars{margin:2px 0 4px}
@media(max-width:520px){.ar-grid{grid-template-columns:1fr}}
```
- [ ] **Step 6: Selbstchecks:** Syntax-Selbstcheck · `grep -c 'anlassChap' index.html` → 2 (HTML+CSS) · `grep -c 'function anlaesse' index.html` → 1 · `grep -c 'radarPlan' index.html` → 0 · `grep -c 'renderAnlaesse' index.html` → ≥3 · `grep -c 'sterneHtml' index.html` → ≥6 (4 aus Task 3 + arCard + Radar-Karten).
- [ ] **Step 7: Commit** — `feat(pflege): Anlass-Engine + Concierge-Feed auf Heute + Radar & Anlaesse (sterne-skalierte Gesten, Demo-Aktionen)`

---

### Task 5: Kampagnen-Workflow (Lane: claude-implementer-pro / Sonnet)

**Files:** Modify `index.html` — 3 Stellen.

- [ ] **Step 1: CTA** — in `#sub-netzwerk-zuweiser` direkt NACH der Zeile `<p class="lblline">Zuweiser-Netzwerk · zuerst Kategorien, dann Kontakte und nächste Aktion.</p>` einfügen:
```html
      <button class="kp-cta" onclick="kpOpen()">✉ Newsletter erstellen</button>
```
- [ ] **Step 2: Logik** — direkt NACH `renderAnlaesse` (Ende des Task-4-Blocks) einfügen:

```js
/* ---------- Baustein B · Kampagnen (.kp-*) — Spec 2026-07-14 §4 ---------- */
let _kp={typ:"zuweiser",kat:"alle",status:"aktiv",betreff:"Neues aus der Klinik Bavaria",bausteine:[true,true,false]};
function kpEmpfaenger(){
 if(_kp.typ==="patienten")return personen.filter(p=>p.sterne>=3&&p.einwilligung&&p.einwilligung.status==="erteilt"&&(p.einwilligung.zwecke||[]).includes("newsletter")).map(p=>({name:p.name,pid:p.pid}));
 return zuweiser.filter(z=>(_kp.kat==="alle"||zKategorie(z)===_kp.kat)&&(_kp.status==="alle"||z.status===_kp.status)).map(z=>({name:z.name,zName:z.name}));
}
function kpOpen(){
 let s=document.getElementById("kpSheet");
 if(!s){s=document.createElement("div");s.id="kpSheet";document.body.appendChild(s);}
 s.className="kp-sheet open";document.body.classList.add("locked");
 kpRender();
}
function kpClose(){const s=document.getElementById("kpSheet");if(s)s.classList.remove("open");document.body.classList.remove("locked");}
function kpSet(k,v){_kp[k]=v;kpRender();}
function kpBaustein(i){_kp.bausteine[i]=!_kp.bausteine[i];kpRender();}
function kpRender(){
 const s=document.getElementById("kpSheet");if(!s)return;
 const emp=kpEmpfaenger();
 const anrede=_kp.typ==="patienten"?(emp[0]?"Liebe/r "+escapeHtml(emp[0].name):"Liebe Patientin, lieber Patient"):(function(){const per=emp[0]?rpPersona(emp[0].name):null;return per&&per.name?"Sehr geehrte/r "+escapeHtml(per.name):"Sehr geehrte Damen und Herren";})();
 const bausteine=portalNews.map((n,i)=>_kp.bausteine[i]?"<div class='kp-block'><div class='kp-bt'>"+escapeHtml(n.t)+"</div><div class='kp-bs'>"+escapeHtml(n.s)+"</div></div>":"").join("");
 const kats="<option value='alle'>Alle Kategorien</option>"+Z_CATS.map(c=>"<option value='"+c.id+"'"+(_kp.kat===c.id?" selected":"")+">"+escapeHtml(c.label)+"</option>").join("");
 s.innerHTML="<div class='kp-back' onclick='kpClose()'></div><div class='kp-panel'>"
  +"<div class='kp-head'><span class='kp-title'>Newsletter erstellen</span><button class='kp-x' onclick='kpClose()' aria-label='Schließen'>×</button></div>"
  +"<div class='kp-body'>"
  +"<div class='kp-sec'><div class='kp-k'>1 · Segment</div>"
    +"<div class='kp-row'><label class='kp-radio'><input type='radio' name='kpTyp' "+(_kp.typ==="zuweiser"?"checked":"")+" onchange='kpSet(\"typ\",\"zuweiser\")'> Zuweiser</label>"
    +"<label class='kp-radio'><input type='radio' name='kpTyp' "+(_kp.typ==="patienten"?"checked":"")+" onchange='kpSet(\"typ\",\"patienten\")'> Altpatienten & Kontakte ab 3★</label></div>"
    +(_kp.typ==="zuweiser"?"<div class='kp-row'><select onchange='kpSet(\"kat\",this.value)'>"+kats+"</select>"
      +"<select onchange='kpSet(\"status\",this.value)'><option value='aktiv'"+(_kp.status==="aktiv"?" selected":"")+">Status: aktiv</option><option value='aufbau'"+(_kp.status==="aufbau"?" selected":"")+">Status: im Aufbau</option><option value='ziel'"+(_kp.status==="ziel"?" selected":"")+">Status: Ziel</option><option value='alle'"+(_kp.status==="alle"?" selected":"")+">Status: alle</option></select></div>":"")
    +"<div class='kp-count'><b class='num'>"+emp.length+"</b> Empfänger"+(emp.length?"":" — Segment anpassen")+"</div></div>"
  +"<div class='kp-sec'><div class='kp-k'>2 · Inhalt</div>"
    +"<input class='kp-betreff' value='"+escapeHtml(_kp.betreff)+"' onchange='kpSet(\"betreff\",this.value)'>"
    +portalNews.map((n,i)=>"<label class='kp-check'><input type='checkbox' "+(_kp.bausteine[i]?"checked":"")+" onchange='kpBaustein("+i+")'> "+escapeHtml(n.t)+"</label>").join("")+"</div>"
  +"<div class='kp-sec'><div class='kp-k'>3 · Vorschau</div>"
    +"<div class='kp-mail'><div class='kp-mhead'><span class='kp-marke'>KLINIK BAVARIA · CONCIERGE</span><div class='kp-mtitel'>"+escapeHtml(_kp.betreff)+"</div></div>"
    +"<div class='kp-mbody'><p class='kp-anrede'>"+anrede+",</p>"+(bausteine||"<p class='kp-bs'>— Bausteine wählen —</p>")
    +"<p class='kp-gruss'>Herzliche Grüße aus Bad Kissingen<br>Ihr Team der Klinik Bavaria</p></div>"
    +"<div class='kp-mfoot'>Sie erhalten diese Nachricht, weil eine Einwilligung vorliegt · Abmeldung jederzeit möglich (Demo)</div></div></div>"
  +"</div>"
  +"<div class='kp-foot'><button class='btn-ghost btn-sm' onclick='kpClose()'>Abbrechen</button><button class='btn-brass' onclick='kpSend()'"+(emp.length?"":" disabled")+">"+emp.length+" Newsletter senden (Demo)</button></div>"
  +"</div>";
}
function kpSend(){
 const emp=kpEmpfaenger();if(!emp.length)return;
 emp.forEach(e=>{
  if(e.zName)zuweiserEvents.push({zName:e.zName,d:dstr(0),typ:"newsletter",text:"Newsletter: "+_kp.betreff});
  if(e.pid)pHist(e.pid,"kontakt","Newsletter erhalten: "+_kp.betreff);
 });
 kpClose();
 if(typeof inbToast==="function")inbToast("done","<b>"+emp.length+" Newsletter versendet</b> (Demo)",escapeHtml(_kp.betreff),null);
}
```

- [ ] **Step 3: CSS** — kommentierten Block vor `</style>`:
```css
/* ---------- Baustein B · Kampagnen (.kp-*) ---------- */
.kp-cta{display:inline-flex;align-items:center;gap:7px;background:var(--paper);border:1px solid var(--brass-line);color:var(--brass-deep);font:600 12.5px/1 Inter;letter-spacing:.03em;padding:10px 16px;border-radius:999px;cursor:pointer;margin:0 0 14px;box-shadow:var(--shadow-soft)}
.kp-cta:hover{background:var(--brass-soft)}
.kp-sheet{position:fixed;inset:0;z-index:80;display:none}
.kp-sheet.open{display:block}
.kp-back{position:absolute;inset:0;background:rgba(31,28,28,.42)}
.kp-panel{position:absolute;right:0;top:0;bottom:0;width:min(680px,100%);background:var(--paper);display:flex;flex-direction:column;box-shadow:-18px 0 50px rgba(31,28,28,.25)}
.kp-head{display:flex;align-items:center;padding:18px 22px;border-bottom:1px solid var(--hair)}
.kp-title{font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-weight:600;font-size:23px;color:var(--ink)}
.kp-x{margin-left:auto;background:none;border:none;font-size:26px;line-height:1;color:var(--muted);cursor:pointer}
.kp-body{flex:1;overflow:auto;padding:18px 22px;display:grid;gap:18px}
.kp-k{font:600 10.5px/1 Inter;letter-spacing:.07em;text-transform:uppercase;color:var(--brass-deep);margin-bottom:9px}
.kp-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px}
.kp-radio,.kp-check{display:flex;align-items:center;gap:7px;font:500 13px/1.3 Inter;color:var(--ink-soft);cursor:pointer}
.kp-check{padding:4px 0}
.kp-row select{font:500 13px/1.2 Inter;color:var(--ink-soft);padding:8px 10px;border:1px solid var(--hair);border-radius:9px;background:var(--paper)}
.kp-count{font:500 12.5px/1 Inter;color:var(--muted);margin-top:4px}
.kp-count .num{font:700 15px/1 "Cormorant Garamond",Georgia,serif;color:var(--brass-deep)}
.kp-betreff{width:100%;font:600 14px/1.3 Inter;color:var(--ink);padding:10px 12px;border:1px solid var(--hair);border-radius:9px;background:var(--paper2);margin-bottom:8px}
.kp-mail{border:1px solid var(--hair);border-radius:14px;overflow:hidden;box-shadow:var(--shadow-soft)}
.kp-mhead{background:linear-gradient(140deg,#332d2a,#1f1c1c 55%,#282320);padding:18px 20px}
.kp-marke{font:600 10px/1 Inter;letter-spacing:.14em;color:#b29a76}
.kp-mtitel{font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-weight:600;font-size:22px;color:#f4eee3;margin-top:7px}
.kp-mbody{padding:16px 20px;background:var(--paper)}
.kp-anrede{font:500 13.5px/1.5 Inter;color:var(--ink-soft);margin:0 0 12px}
.kp-block{border-top:1px solid var(--brass-line);padding:11px 0}
.kp-bt{font:600 13.5px/1.35 Inter;color:var(--ink)}
.kp-bs{font:400 12.5px/1.5 Inter;color:var(--muted);margin-top:3px}
.kp-gruss{font:500 13px/1.55 Inter;color:var(--ink-soft);margin:14px 0 0}
.kp-mfoot{padding:10px 20px;background:var(--paper2);font:400 10.5px/1.4 Inter;color:var(--faint);border-top:1px solid var(--hair2)}
.kp-foot{display:flex;gap:10px;padding:14px 22px;border-top:1px solid var(--hair);justify-content:flex-end}
@media(max-width:520px){.kp-panel{width:100%}}
```
- [ ] **Step 4: Selbstchecks:** Syntax-Selbstcheck · `grep -c 'kpOpen' index.html` → 2 (CTA + Funktion) · `grep -c 'kp-mail' index.html` → 2 (JS+CSS) · `grep -c 'function kpSend' index.html` → 1.
- [ ] **Step 5: Commit** — `feat(pflege): Kampagnen-Workflow — Segment/Entwurf/Premium-Vorschau/Demo-Versand mit Historie-Protokoll`

---

### Task 6: Verifikation, Merge, Push (Orchestrator) — Checkliste = Spec §6

- [ ] Preview frisch starten (Port-Kill, Served-Hash == HEAD — ProtonDrive-Lehre). @1440: Heute zeigt Anlass-Sektion VOR ns-card, Grid intakt; Top-Anlass Margarete Wirth 5★ mit „Geschenk vormerken".
- [ ] Datenbank: Gruppen 5★→1★+Gesperrt, Messing-Sterne, Verteilungs-Balken/Legende/Handlungsbedarf(=2: P12,P14); Chips filtern; `openDbDetail` zeigt Sterne+Begründung; Console-Beleg `document.body.innerHTML.includes("A · Warm")` → false.
- [ ] Radar & Anlässe: Feed (Geburtstage+Zuweiser, ohne Wiederbedarf-Dopplung) + Radar-Karten mit Sternen; Helios „Noch nie kontaktiert" überfällig; Aktion → Toast + Historie-Eintrag + Anlass verschwindet; P25 erzeugt keinen Anlass.
- [ ] Gesten-Gates (Console): P21 (5★,post) → Geschenk; Person 5★ ohne post → Anruf; P15 (2★,newsletter) → Newsletter-Gruß; 2★ ohne newsletter → kein Anlass.
- [ ] Kampagne: Default-Segment (Zuweiser, alle Kategorien, Status aktiv) → Zähler **4** (Leopoldina, RHÖN, Dr. Sommer, PRIMO MEDICO); Vorschau = Mailing-Design; Senden → Toast + `zuweiserEvents`-Einträge (Console — zuweiserEvents hat noch keine UI, bewusst); Patienten-Segment → Zähler **7** (P02, P08, P10, P12, P14, P21, P22 — sterne≥3, erteilt, newsletter-Zweck; reviewergeprüft gegen die echten Literale).
- [ ] Akte: `openDetail(1)` zeigt Sterne im Akte-Kopf; simulateInbound (Reinhardt) → 2★-Default.
- [ ] Cofounder: Matrix, `openReferrer` 3 Tabs, `rsp`-Charts. Console 0 Errors, 0 Overflow @390/@1440. Screenshots gegen Design-Messlatte.
- [ ] Merge: `git checkout main` → fetch/FF-Check → `git merge --ff-only feat/pflege` → Push → Pages-Build-Check → Branch löschen.

## Nicht-Ziele (Spec §7)
Kein echter Versand · kein Sterne-Umstufungs-UI (Baustein D) · kein Forecast (C) · `renderWichtig`/Board/Eingang/Team unangetastet · tote Altlasten bleiben.
