# Telefon-View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-optimized:subagent-driven-development (recommended) or superpowers-optimized:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Neue Top-Level-View „Telefon" — der assistierte Anruf als interaktive, deterministische Demo (Spec: `../specs/2026-07-30-telefon-view-design.md`).
**Architecture:** Alles additiv in `index.html`: 2 Nav-Buttons, 1 TITLES-Eintrag, 1 renderAll-Hook, 1 HTML-Section, 1 CSS-Block vor `</style>`, 1 JS-Block. State-getrieben (`TEL_STATE`), re-render-fest, Timer-Disziplin (nach Alarm keine Timer). Wiederverwendet: `telAusText, initialen, escapeHtml, dstr, logZeit, inbToast, openFallakte, wvNichtErreicht, lxPulse`.
**Tech Stack:** Vanilla JS/CSS im Single-File-Prototyp. Kein Testframework — Gates: `node --check` + grep + Browser-Protokoll.
**Assumptions:** `wvNichtErreicht(fid)` existiert (R16) und ist sim-frei — wird direkt aufgerufen. Assumes Kostenzusage-Fall via `/angefragt/i.test(f.kosten)` findbar — Kassen-Zeile entfällt sonst ersatzlos (kein Fake-Fall). Assumes Anker-Strings unten existieren exakt einmal — Task bricht ab statt zu raten, wenn grep ≠ 1 Treffer.

**Branch:** `feat/telefon` (von aktuellem `main`). Jeder Task: `node --check` (Script-Extrakt) muss grün sein, dann eigener Commit mit Trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

**HARTE REGELN (aus CLAUDE.md/HANDOVER §2, bindend):** Cofounder-Namespaces (`.rp-` `.rpd-` `.rsp-` `.mx-`, `openReferrer`, `#refOverlay`) und `.kta-`-Pilot NICHT anfassen. Kein `Math.random()`, kein argloses `new Date()`. Kein Stern-Slash in CSS-Kommentar-PROSA. Keine Aufrufe von `sendReply`/`kzNotizAdd`/`simTrigger` aus tel-Code.

---

### Task 1: Branch + Navigation + Routing-Hooks

**Files:** Modify: `index.html`

- [ ] **Step 1:** `git checkout -b feat/telefon` (vorher `git pull --ff-only`).

- [ ] **Step 2 — Sidebar-Button.** Anker (genau 1 Treffer): die Sidebar-Zeile, die BEIDES enthält: `data-nav="faelle"` und `<span>Fälle</span>`. DIREKT DANACH neue Zeile einfügen:

```html
    <button data-nav="telefon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg><span>Telefon</span></button>
```

- [ ] **Step 3 — Tabbar-Button.** Anker (genau 1 Treffer): die Tabbar-Zeile mit `id="navBadgeFaelle"`. DIREKT DANACH neue Zeile:

```html
    <button data-nav="telefon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>Telefon</button>
```

- [ ] **Step 4 — TITLES.** In der `const TITLES={...}`-Zeile in `go()` vor `fallakte:` einfügen:

```js
telefon:["Telefon","KI-Anruf-Assistent · läuft lokal"],
```

- [ ] **Step 5 — renderAll-Hook.** In `function renderAll(){...}` nach `renderBelegung();` einfügen:

```js
if(typeof renderTelefon==="function")renderTelefon();
```

- [ ] **Step 6:** Script-Extrakt via letztes `<script>`/`</script>`-Paar (sed, §4l-Lehre) → `node --check` grün. Commit: `feat(telefon): Nav, Titel, renderAll-Hook für View Telefon`

### Task 2: View-Section (statisches Gerüst)

**Files:** Modify: `index.html`

- [ ] **Step 1:** Anker (genau 1 Treffer): Zeile `<section id="view-inreha"`. DIREKT DAVOR einfügen:

```html
  <section id="view-telefon" class="view">
    <div class="kicker">Tagesgeschäft</div>
    <h1>Telefon</h1>
    <div class="tel-hero">
      <span class="tel-badge"><i></i>Läuft lokal — Audio verlässt das Haus nie · keine Aufzeichnung</span>
      <h2>Kein Rückruf verpufft mehr.</h2>
      <p style="margin:0;max-width:56ch">Die Mitarbeiterin wählt — der Assistent wartet, hört zu und meldet sich, sobald ein Mensch in der Leitung ist. Das System wählt nie von selbst.</p>
      <div class="tel-kpis">
        <div class="tel-kpi"><div class="num" id="telKpiMin">0</div><span>Warteminuten übernommen</span></div>
        <div class="tel-kpi"><div class="num" id="telKpiOk">0</div><span>Rückrufe erreicht</span></div>
      </div>
    </div>
    <div id="telBuehne"></div>
    <div class="kicker" style="margin-top:18px">Rückrufliste · nach Sterne-Priorität</div>
    <div id="telListe" class="tel-list"></div>
    <div id="telKonzept"></div>
  </section>
```

- [ ] **Step 2:** `node --check` grün (HTML-Edit — Check trotzdem als Regressionswache). Commit: `feat(telefon): View-Section #view-telefon (statisches Gerüst)`

### Task 3: CSS-Block

**Files:** Modify: `index.html`

- [ ] **Step 1:** Anker: `</style>` (das App-Stylesheet — bei mehreren Treffern das LETZTE `</style>` vor `</head>`). DIREKT DAVOR einfügen:

```css
/* ===== TELEFON · KI-ANRUF-ASSISTENT (.tel-Klassen) =====
   View #view-telefon. Additiv. Einziger neuer Keyframe: telWave (nur transform,
   reduced-motion-safe: Basis-Höhen statisch inline, Animation nur via Klasse .an). */
#view-telefon .tel-hero{position:relative;background:var(--paper);border:1px solid var(--jade-hair);border-radius:4px;box-shadow:var(--shadow-soft);padding:24px 26px;margin-bottom:16px}
#view-telefon .tel-hero::after{content:"";position:absolute;inset:5px;border:1px solid var(--gold-faint);border-radius:2px;pointer-events:none}
.tel-hero h2{font-family:"Cormorant Garamond",Georgia,serif;font-size:29px;font-weight:600;margin:10px 0 6px}
.tel-badge{display:inline-flex;align-items:center;gap:7px;font:600 10px "Fragment Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--sage-deep);background:var(--sage-soft);border:1px solid var(--jade-hair);border-radius:3px;padding:4px 9px}
.tel-badge i{width:7px;height:7px;border-radius:50%;background:var(--sage-deep);animation:lxPulse 2.4s ease-in-out infinite}
.tel-kpis{display:flex;gap:26px;margin-top:14px;flex-wrap:wrap}
.tel-kpi .num{font-family:"Cormorant Garamond",Georgia,serif;font-size:30px;font-weight:600;color:var(--sage-deep)}
.tel-kpi span{display:block;font:600 9.5px "Fragment Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.tel-list{display:flex;flex-direction:column;gap:10px;margin-top:12px}
.tel-row{display:flex;align-items:center;gap:12px;background:var(--paper);border:1px solid var(--hair);border-radius:4px;padding:12px 14px;flex-wrap:wrap}
.tel-st{color:var(--brass-deep);font-size:12px;letter-spacing:2px;white-space:nowrap}
.tel-stage{position:relative;background:var(--paper);border:1px solid var(--jade-hair);border-radius:4px;box-shadow:var(--shadow);padding:18px 20px;margin-top:16px}
.tel-stage::after{content:"";position:absolute;inset:5px;border:1px solid var(--gold-faint);border-radius:2px;pointer-events:none}
.tel-wave{display:flex;align-items:center;gap:3px;height:56px;margin:14px 0 10px}
.tel-wave i{flex:1;max-width:9px;border-radius:2px;background:var(--faint);transform-origin:center}
.tel-wave.an i{animation:telWave 1.1s ease-in-out infinite alternate}
.tel-wave.musik i{background:var(--azzurro)}
.tel-wave.ansage i{background:var(--amber)}
.tel-wave.mensch i{background:var(--sage-deep)}
@keyframes telWave{from{transform:scaleY(.25)}to{transform:scaleY(1)}}
.tel-chip{display:inline-flex;align-items:center;gap:8px;font:600 11px "Fragment Mono",monospace;letter-spacing:.1em;text-transform:uppercase;border:1px solid var(--hair);border-radius:3px;padding:6px 11px;color:var(--ink-soft);background:var(--paper2)}
.tel-chip.musik{color:var(--azzurro);border-color:var(--azzurro)}
.tel-chip.ansage{color:var(--amber);border-color:var(--amber)}
.tel-chip.alarm{background:var(--brass-soft);border-color:var(--brass-line);color:var(--brass-deep);animation:lxPulse 1.6s ease-in-out infinite}
.tel-raffer{font:600 9.5px "Fragment Mono",monospace;letter-spacing:.1em;text-transform:uppercase;background:var(--terra-soft);color:var(--terra);border-radius:3px;padding:3px 8px}
.tel-ereignisse{list-style:none;margin:12px 0 0;padding:0;font-size:12.5px;color:var(--ink-soft)}
.tel-ereignisse li{display:flex;gap:10px;padding:4px 0;border-top:1px dashed var(--hair2)}
.tel-ereignisse .t{font-family:"Fragment Mono",monospace;font-size:11px;color:var(--muted);min-width:48px}
.tel-actions{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
.tel-uebernehmen{background:var(--sage-deep);color:var(--ivory-tx);border:0;border-radius:4px;padding:11px 18px;font-weight:600;cursor:pointer;font-family:inherit;font-size:14px}
.tel-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:10px}
.tel-step{background:var(--paper);border:1px solid var(--hair);border-radius:4px;padding:14px}
.tel-step p{margin:6px 0 0;font-size:12.5px;color:var(--ink-soft)}
@media(max-width:700px){.tel-steps{grid-template-columns:1fr}.tel-kpis{gap:16px}}
```

- [ ] **Step 2:** Gate: `grep -c '@keyframes' index.html` ergibt **17** (vorher 16). Commit: `feat(telefon): CSS-Block .tel-Klassen (+1 Keyframe telWave)`

### Task 4: JS-Block (Queue, Szenarien, Bühne)

**Files:** Modify: `index.html`

- [ ] **Step 1:** Anker (genau 1 Treffer): Zeile `function kfKontaktBody(f){`. DIREKT DAVOR einfügen:

```js
/* ===== TELEFON · KI-ANRUF-ASSISTENT (tel-Funktionen) =====
   Interaktive Demo des assistierten Anrufs. Deterministisch, offline, ohne Proxy.
   Kein Selbst-Waehlen (Human-in-the-loop). Nach dem Alarm laeuft KEIN Timer mehr —
   das Szenario wartet auf den Klick. Verboten hier: sendReply/kzNotizAdd/simTrigger. */
var TEL_TEMPO=1;
var TEL_STATE={aktiv:null,min:0,ok:0,done:{}};
var TEL_FALLBACK_NR="0176 4471 2280";
var TEL_H=[38,62,45,70,52,80,40,66,55,74,48,60,42,72,58,66,36,64,50,76,44,68,54,62];
var TEL_SZEN={
 mensch:[[0,"waehlt","Wählt …"],[1200,"klingelt","Klingelt …"],[4800,"analyse","Abgehoben — analysiere …"],[6300,"alarm","● Mensch in der Leitung — Überbrückungsansage läuft"]],
 ab:[[0,"waehlt","Wählt …"],[1200,"klingelt","Klingelt …"],[6000,"analyse","Abgehoben — analysiere …"],[7500,"ab","Anrufbeantworter erkannt"]],
 kasse:[[0,"waehlt","Wählt …"],[1200,"musik","Verbunden — Warteschleife · Musik erkannt"],[6000,"ansage","Bandansage erkannt — kein Mensch, weiter warten"],[9000,"musik","Warteschleife · Musik läuft weiter"],[14000,"analyse","Stimme erkannt — analysiere …"],[15500,"alarm","● Mitarbeiter:in der ARKADIA in der Leitung — Überbrückungsansage läuft"]]
};
function telNummer(f){
 let n=(typeof telAusText==="function"&&f.originalTxt)?telAusText(f.originalTxt):"";
 if(!n&&f.personId&&typeof person==="function"){const p=person(f.personId);n=(p&&p.telefon)||"";}
 return n||TEL_FALLBACK_NR;
}
function telSterne(n){let s="";for(let i=1;i<=5;i++)s+=i<=n?"★":"☆";return s;}
function telQueue(){
 const q=[];
 faelle.filter(f=>["Neu","Kontaktiert","Qualifizierung"].includes(f.status)&&f.status!=="Verloren").forEach(f=>{
  const p=(f.personId&&typeof person==="function")?person(f.personId):null;
  q.push({fallId:f.id,typ:"rueckruf",name:f.name,nummer:telNummer(f),
   anlass:"Rückruf erbeten · "+(f.quelle||"Anfrage"),sterne:(p&&Number(p.sterne))||3,versuche:f.anrufe||0});
 });
 q.sort((a,b)=>b.sterne-a.sterne||a.fallId-b.fallId);
 q.forEach((e,i)=>{e.szenario=(i%2===0)?"mensch":"ab";});
 const kf=faelle.find(f=>/angefragt/i.test(f.kosten||"")&&f.status!=="Verloren");
 if(kf)q.unshift({fallId:kf.id,typ:"kasse",name:"ARKADIA Versicherung",nummer:"0800 275 2342",
  anlass:"Kostenzusage nachfassen · "+kf.name,sterne:5,versuche:0,szenario:"kasse"});
 return q;
}
function telLog(f,txt){
 if(!f||!f.log)return;
 f.log.push([dstr(0),txt,typeof logZeit==="function"?logZeit():""]);
 if(typeof demoSave==="function")demoSave();
}
function telWaveKlasse(ph){
 if(ph==="musik")return "musik an";
 if(ph==="ansage")return "ansage an";
 if(ph==="alarm")return "mensch an";
 if(ph==="ab")return "ansage";
 if(ph==="analyse"||ph==="klingelt")return "an";
 return "";
}
function renderTelefon(){
 const list=document.getElementById("telListe");if(!list)return;
 const kMin=document.getElementById("telKpiMin");if(kMin)kMin.textContent=TEL_STATE.min;
 const kOk=document.getElementById("telKpiOk");if(kOk)kOk.textContent=TEL_STATE.ok;
 const q=telQueue(),busy=!!TEL_STATE.aktiv;
 if(!q.length){list.innerHTML="<div class='tel-row'><div><b>Alle Rückrufe erledigt.</b><div class='au-micro'>Neue Anfragen erscheinen hier automatisch · ↺ oben setzt die Demo zurück.</div></div></div>";}
 else list.innerHTML=q.map(e=>{
  const done=TEL_STATE.done[e.fallId+e.typ];
  return "<div class='tel-row'>"
   +"<span class='ava'>"+initialen(e.name)+"</span>"
   +"<div style='flex:1;min-width:150px'><b>"+escapeHtml(e.name)+"</b> <span class='au-micro'>"+escapeHtml(e.nummer)+"</span>"
   +"<div class='au-micro'>"+escapeHtml(e.anlass)+" · ✓ Rückruf erbeten"+(e.versuche?" · Versuch "+(e.versuche+1):"")+"</div></div>"
   +"<span class='tel-st'>"+telSterne(e.sterne)+"</span>"
   +(done?"<span class='au-micro'>✓ "+escapeHtml(done)+"</span>"
        :"<button class='btn-ghost btn-sm' type='button' "+(busy?"disabled":"")+" onclick='telAnruf("+e.fallId+",\""+e.typ+"\",\""+e.szenario+"\")'>Anrufen ›</button>")
   +"</div>";
 }).join("");
 telRenderBuehne();
 telRenderKonzept();
}
function telRenderBuehne(){
 const el=document.getElementById("telBuehne");if(!el)return;
 const a=TEL_STATE.aktiv;
 if(!a){el.innerHTML="";return;}
 const chipCls=a.phase==="alarm"?"alarm":a.phase==="musik"?"musik":(a.phase==="ansage"||a.phase==="ab")?"ansage":"";
 const last=a.events.length?a.events[a.events.length-1].txt:"Wählt …";
 let actions="<button class='btn-ghost btn-sm' type='button' onclick='telAuflegen()'>Auflegen</button>";
 if(a.phase==="alarm")actions="<button class='tel-uebernehmen' type='button' onclick='telUebernehmen()'>Gespräch übernehmen ›</button>"+actions;
 if(a.phase==="ab")actions="<button class='btn-ghost btn-sm' type='button' onclick='telNachricht()'>Neutrale Nachricht abspielen</button>"+actions;
 if(a.phase==="nachricht")actions="";
 el.innerHTML="<div class='tel-stage'>"
  +"<div style='display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center'>"
  +"<div><b>"+escapeHtml(a.name)+"</b> <span class='au-micro'>"+escapeHtml(a.nummer)+"</span></div>"
  +(a.szenario==="kasse"?"<span class='tel-raffer'>Zeitraffer — real ~12 Min</span>":"")
  +"</div>"
  +"<div class='tel-wave "+telWaveKlasse(a.phase)+"'>"+TEL_H.map(h=>"<i style='height:"+h+"%'></i>").join("")+"</div>"
  +"<span class='tel-chip "+chipCls+"'>"+escapeHtml(last)+"</span>"
  +"<ul class='tel-ereignisse'>"+a.events.map(ev=>"<li><span class='t'>"+(ev.s==="—"?"—":"+"+ev.s+" s")+"</span><span>"+escapeHtml(ev.txt)+"</span></li>").join("")+"</ul>"
  +"<div class='tel-actions'>"+actions+"</div>"
  +"</div>";
}
function telRenderKonzept(){
 const el=document.getElementById("telKonzept");if(!el||el.innerHTML)return;
 el.innerHTML="<div class='kicker' style='margin-top:26px'>So funktioniert's</div>"
  +"<div class='tel-steps'>"
  +"<div class='tel-step'><b>1 · Mensch wählt</b><p>Rückruf aus der Liste — per Klick. Das System wählt nie von selbst.</p></div>"
  +"<div class='tel-step'><b>2 · Assistent hört zu</b><p>Klassifiziert lokal im Browser: Klingeln, Musik, Bandansage, Mensch, Anrufbeantworter. Keine Cloud, keine Aufzeichnung.</p></div>"
  +"<div class='tel-step'><b>3 · Mensch übernimmt</b><p>Alarm im selben Fenster, Überbrückungsansage hält die Leitung, die Akte öffnet sich automatisch.</p></div>"
  +"</div>"
  +"<p class='au-micro' style='margin-top:10px'>Architektur: Browser ist Endpunkt der Verbindung · Erkennung ~1,5 s · Wiedervorlage-Automatik 5★ heute · 4★ morgen · 3★ +2 Tage</p>";
}
function telAnruf(fid,typ,szen){
 if(TEL_STATE.aktiv)return;
 const f=faelle.find(x=>x.id===fid);if(!f)return;
 const e=telQueue().find(x=>x.fallId===fid&&x.typ===typ);
 TEL_STATE.aktiv={fallId:fid,typ:typ,szenario:szen,phase:"waehlt",name:e?e.name:f.name,nummer:e?e.nummer:telNummer(f),events:[],timer:[]};
 (TEL_SZEN[szen]||[]).forEach(step=>{
  const id=setTimeout(function(){telPhase(step[1],step[2],step[0]);},step[0]*TEL_TEMPO);
  TEL_STATE.aktiv.timer.push(id);
 });
 renderTelefon();
 const b=document.getElementById("telBuehne");if(b)b.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function telPhase(ph,txt,ms){
 const a=TEL_STATE.aktiv;if(!a)return;
 a.phase=ph;a.events.push({s:Math.round(ms/100)/10,txt:txt});
 telRenderBuehne();
}
function telEnde(){
 const a=TEL_STATE.aktiv;if(!a)return;
 a.timer.forEach(clearTimeout);
 TEL_STATE.aktiv=null;
 renderTelefon();
}
function telUebernehmen(){
 const a=TEL_STATE.aktiv;if(!a||a.phase!=="alarm")return;
 const f=faelle.find(x=>x.id===a.fallId);
 if(a.szenario==="kasse"){TEL_STATE.min+=12;if(f)telLog(f,"✆ ARKADIA erreicht — Warteschleife (~12 Min) vom Assistenten übernommen");}
 else{TEL_STATE.ok++;if(f)telLog(f,"✆ Rückruf erreicht — Gespräch übernommen (Erkennung 1,5 s)");}
 TEL_STATE.done[a.fallId+a.typ]=a.szenario==="kasse"?"Kasse erreicht":"erreicht";
 telEnde();
 if(typeof inbToast==="function")inbToast("done","<b>Gespräch übernommen</b>",escapeHtml(a.name)+" — die Akte öffnet sich",null);
 if(f&&typeof openFallakte==="function")openFallakte(f.id);
}
function telNachricht(){
 const a=TEL_STATE.aktiv;if(!a||a.phase!=="ab")return;
 a.phase="nachricht";a.events.push({s:"—",txt:"Neutrale Nachricht läuft — ohne Gesundheitsbezug"});
 telRenderBuehne();
 const id=setTimeout(function(){
  const f=faelle.find(x=>x.id===a.fallId);
  if(f&&typeof wvNichtErreicht==="function"){wvNichtErreicht(f.id);telLog(f,"✆ Neutrale Nachricht auf AB hinterlassen");}
  TEL_STATE.done[a.fallId+a.typ]="AB · Nachricht + Wiedervorlage";
  telEnde();
 },2000*TEL_TEMPO);
 a.timer.push(id);
}
function telAuflegen(){
 const a=TEL_STATE.aktiv;if(!a)return;
 const f=faelle.find(x=>x.id===a.fallId);
 const vorAbheben=(a.phase==="waehlt"||a.phase==="klingelt");
 const nachAlarm=(a.phase==="alarm");
 telEnde();
 if(f){
  if(vorAbheben&&a.typ==="rueckruf"&&typeof wvNichtErreicht==="function"){wvNichtErreicht(f.id);}
  else if(nachAlarm){telLog(f,"✆ Anruf beendet ohne Übernahme");}
  else{telLog(f,"✆ Anruf abgebrochen");}
 }
 renderTelefon();
}
```

- [ ] **Step 2 — Gates:**
  - Script-Extrakt → `node --check` grün.
  - `grep -c 'sendReply\|kzNotizAdd\|simTrigger' <tel-Block-Extrakt>` = **0** (nur im tel-Block prüfen).
  - `grep -c 'Math.random\|new Date()' <tel-Block-Extrakt>` = **0**.
- [ ] **Step 3:** Commit: `feat(telefon): Szenarien-Engine, Rückrufliste, Live-Bühne (tel-Funktionen)`

### Task 5: Browser-Verifikation (führt der Orchestrator selbst aus)

- [ ] @1440: View über Sidebar; S1 (2. Listeneintrag „mensch") durchspielen → Alarm → Übernehmen → Fallakte öffnet, `f.log`-Eintrag 3-elementig; S2 (AB) → Nachricht → wv-Toast + 2 Log-Zeilen; S3 (ARKADIA) → Zeitraffer-Chip sichtbar → Übernehmen → KPI +12.
- [ ] Doppelklick-Guard: während aktivem Anruf sind andere Buttons disabled; „Auflegen" in jeder Phase räumt Timer (keine Nach-Zünder: 3 s warten, keine Phase wechselt).
- [ ] Reload: Logs persistiert, `TEL_STATE` zurückgesetzt (frische KPIs) — korrekt so.
- [ ] @390: **Tabbar-Messung** — 7 Buttons, `document.querySelector('.tabbar-inner').scrollWidth<=390` und kein Label-Umbruch; sonst Fallback: Tabbar-Label zu `Anruf` kürzen; View 0 horizontaler Overflow (`document.documentElement.scrollWidth<=390`).
- [ ] Reduced Motion (Emulation): View statisch vollständig sichtbar, Welle steht auf Basis-Höhen.
- [ ] 0 Console-Errors. Cofounder-Check: Matrix 6 Zellen, `openReferrer('portal','Leopoldina-Krankenhaus')`, rsp-Charts, kta-Pilot-Button vorhanden.
- [ ] HANDOVER §4v-Kurzeintrag (Telefon-View, .tel-Namespace, +1 Keyframe, Spec/Plan-Verweis).
- [ ] `git fetch` + FF-Check → merge `feat/telefon` → `main` → push.

## Self-Review

Spec-Abdeckung: §3 Nav/Routing→T1, Gerüst→T2, §4 Zonen→T2/T3/T4, §5 Szenarien→T4 (`TEL_SZEN`), §6 Datenregeln→T4-Gates, §7 Kanten→`telAuflegen`/Guard/Leer-Zustand, §9 Gates→T5. Typ-Konsistenz: `telAnruf/telPhase/telEnde/telUebernehmen/telNachricht/telAuflegen/telLog/telQueue/telNummer/telSterne/telWaveKlasse/renderTelefon/telRenderBuehne/telRenderKonzept` — alle definiert, Aufrufer stimmen überein. Platzhalter: keine. Abweichung zur Spec, dokumentiert: Bühne nur bei AKTIVEM Anruf (Ende-Zustand lebt als ✓-Mark in der Liste + Toast/Screen-Pop) — bewusst einfacher, deckt §4 Z3 funktional ab.
