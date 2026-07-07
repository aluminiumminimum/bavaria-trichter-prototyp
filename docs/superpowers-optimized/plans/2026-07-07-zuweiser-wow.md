# Zuweiser-Suite WOW-Runde Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-optimized:subagent-driven-development (recommended) or superpowers-optimized:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Zuweiser-Suite mit Motion, elegantem Feedback-System (kein `alert()` mehr), lebenden Zahlen und Beziehungs-KPIs zum Luxury-Erlebnis für den Investor-Pitch heben.
**Architecture:** Alles innerhalb der Suite: neue JS-Helpers (`rpToast/rpCount/rpDate/rpUpload/rpSubmit/rpAnimate/rpFallRows`), erweiterter `.rp-*`-CSS-Block („WOW"), Updates der 3 Suite-Renderer + kleines Banner-Markup. `refToast()` und interne Views bleiben unangetastet.
**Tech Stack:** Vanilla JS/CSS in `index.html`; Verifikation Script-Extrakt+`node --check` je Task, Chrome-Visual-Gates durch Orchestrator (1440 primär, 390).
**Assumptions:** Stand `e69f50d` (Suite live wie in fad5762). Reduced-motion-Muster: animierter Zustand NUR im Keyframe-`from`, Basiszustand = Endzustand — funktioniert NICHT, falls jemand `both`-Animationen mit abweichendem Endzustand einführt. Kollege pusht ggf. parallel auf main → pull vor Merge.

**Ausführung: SEQUENZIELL.** Visual-Gates nach Task 3, 4, 5.

**JS-Parse-Check (jeder Task):**
```bash
cd /Users/andreschlender/Projects/Arasch && python3 -c "
import re
html = open('index.html', encoding='utf-8').read()
scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
open('/tmp/_rp.js','w').write('\n'.join(scripts))
" && node --check /tmp/_rp.js && echo "JS OK"
```

---

### Task 1: JS-Helpers + Daten + rpAnimate-Hook

**Files:** Modify: `index.html`

- [ ] **Step 1: Branch** `git checkout -b feat/zuweiser-wow`

- [ ] **Step 2:** Direkt NACH der Funktion `rpPersona` (nach ihrer schließenden `}`) einfügen:

```js
const portalStats=[
 {to:14,lbl:"Fälle 2026"},
 {to:11,suf:" h",lbl:"Ø Rückmeldung"},
 {to:96,suf:" %",lbl:"Aufnahmequote"},
 {txt:"seit 2023",lbl:"Partner"}
];
function rpDate(iso){const m=/^\d{4}-(\d{2})-(\d{2})$/.exec(iso||"");return m?m[2]+"."+m[1]+".":iso;}
function rpToast(msg){
 let t=document.getElementById("rpToast");
 if(!t){t=document.createElement("div");t.id="rpToast";document.body.appendChild(t);}
 t.innerHTML=`<span class="tick">✓</span>${msg}`;
 t.classList.remove("show");void t.offsetWidth;t.classList.add("show");
 clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("show"),2500);
}
function rpCount(el,to,dur,suffix){
 if(!el)return;const suf=suffix||"";
 if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches){el.textContent=to+suf;return;}
 const t0=performance.now();
 (function step(t){const p=Math.min(1,((t||performance.now())-t0)/dur),e=1-Math.pow(1-p,3);
  el.textContent=Math.round(to*e)+suf;
  if(p<1)requestAnimationFrame(step);})(t0);
}
function rpAnimate(){
 document.querySelectorAll(".rp-stat b[data-to]").forEach((el,i)=>rpCount(el,+el.dataset.to,900+i*120,el.dataset.suf||""));
 document.querySelectorAll(".rp-outcome .v b[data-to]").forEach((el,i)=>rpCount(el,+el.dataset.to,1000+i*150));
 document.querySelectorAll(".rp-patrings svg text").forEach((el,i)=>{const v=parseInt(el.textContent,10);if(v)rpCount(el,v,900+i*150);});
}
function rpUpload(zone){
 const n=zone.querySelectorAll(".up-file").length;
 if(n>=2){rpToast("Demo-Limit erreicht — 2 Dateien angehängt");return;}
 zone.classList.add("has");
 zone.insertAdjacentHTML("beforeend",`<span class="up-file">✓ ${n===0?"Arztbrief_Demo.pdf":"Befund_Demo.pdf"} hinzugefügt</span>`);
}
function rpFallRows(){
 return portalFaelle.map(f=>`<div class="rp-fall"><span class="rp-ava s">${initialen(f.name)}</span><div><b>${escapeHtml(f.name)}</b><small>${escapeHtml(f.achse)} · seit ${rpDate(f.d)}</small></div><span class="rp-pill ${f.phase}">${escapeHtml(f.status)}</span></div>`).join("");
}
function rpSubmit(zName){
 const nameEl=document.getElementById("rpName"),fachEl=document.getElementById("rpFach");
 const name=(nameEl&&nameEl.value.trim())||"Max Mustermann";
 const fach=(fachEl&&fachEl.value)||"Orthopädie";
 portalFaelle.unshift({name:name,achse:fach,status:"Neu · eben eingegangen",phase:"neu",d:dstr(0)});
 if(portalFaelle.length>4)portalFaelle.pop();
 const card=document.getElementById("rpAnmeldung");
 if(card)card.innerHTML=`<div class="rp-success">
   <svg viewBox="0 0 64 64" class="rp-tick"><circle cx="32" cy="32" r="29" fill="none" stroke="#cdb083" stroke-width="2.5"/><path d="M20 33 L29 42 L45 24" fill="none" stroke="#cdb083" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
   <h3>Anmeldung eingegangen</h3>
   <p>Wir melden uns verbindlich innerhalb von 24 Stunden bei Ihnen.</p>
   <button class="rp-cta ghost" onclick="rpTab('portal','${escapeHtml(zName)}')">Weitere Anmeldung</button></div>`;
 const list=document.getElementById("rpFaelleList");
 if(list){list.innerHTML=rpFallRows();const first=list.querySelector(".rp-fall");if(first)first.classList.add("just-in");}
}
```

- [ ] **Step 3:** In `rpTab` UND `openReferrer` jeweils direkt nach der Zeile, die `refBody.innerHTML` setzt, einfügen: `rpAnimate();`

- [ ] **Step 4:** Verifizieren: JS-Parse OK; `grep -c "function rpToast\|function rpSubmit\|function rpAnimate" index.html` → 3; `grep -c "rpAnimate();" index.html` → 2.

- [ ] **Step 5:** Commit `git add index.html && git commit -m "feat(zuweiser-wow): Helpers — rpToast, rpCount, rpDate, rpUpload, rpSubmit, rpAnimate + Hook"`

---

### Task 2: CSS-WOW-Block

**Files:** Modify: `index.html`

- [ ] **Step 1:** Direkt vor `</style>` einfügen (verbatim):

```css
/* ===== ZUWEISER-SUITE WOW — Toast, Success, Stats, Motion ===== */
#rpToast{position:fixed;left:50%;bottom:26px;transform:translate(-50%,16px);background:var(--espresso-grad);color:#f4eee3;font:600 14px/1.3 Inter;padding:13px 20px;border-radius:99px;border:1px solid rgba(205,176,131,.55);box-shadow:0 12px 30px rgba(31,28,28,.35);opacity:0;pointer-events:none;z-index:120;transition:opacity .3s ease,transform .3s ease;display:flex;align-items:center;gap:9px}
#rpToast.show{opacity:1;transform:translate(-50%,0)}
#rpToast .tick{color:#cdb083;font-weight:700}
/* Success-Kino */
.rp-success{text-align:center;padding:14px 6px 4px}
.rp-tick{width:78px;height:78px;margin:0 auto 10px;display:block}
.rp-tick circle{stroke-dasharray:183;animation:rpDrawC .8s ease-out both}
.rp-tick path{stroke-dasharray:60;animation:rpDrawP .6s ease-out .35s both}
@keyframes rpDrawC{from{stroke-dashoffset:183}}
@keyframes rpDrawP{from{stroke-dashoffset:60}}
.rp-success h3{font:600 22px/1.2 'Cormorant Garamond',serif;margin:0 0 6px}
.rp-success p{font:400 14px/1.5 Inter;color:var(--muted);margin:0 0 14px}
.rp-success .rp-cta{max-width:280px;margin:0 auto}
.rp-pill.neu{background:#fdf6e8;color:#8a6d3b;border:1px solid #cdb083;animation:rpPulse 1.6s ease-out 3}
@keyframes rpPulse{0%{box-shadow:0 0 0 0 rgba(205,176,131,.55)}70%{box-shadow:0 0 0 9px rgba(205,176,131,0)}100%{box-shadow:0 0 0 0 rgba(205,176,131,0)}}
.rp-fall.just-in{animation:rpUp .5s cubic-bezier(.3,1.2,.4,1) both}
/* Stats-Band */
.rp-stats{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.rp-stat{text-align:center;padding:8px 4px}
.rp-stat b{display:block;font:700 34px/1.05 'Cormorant Garamond',serif;color:var(--ink)}
.rp-stat span{font:600 11.5px/1.3 Inter;letter-spacing:.1em;text-transform:uppercase;color:var(--brass-deep)}
.rp-statsband{background:linear-gradient(180deg,var(--paper),#fdf8ee)}
/* Ring-Draw-in (nur Suite) */
.rp-patrings circle:nth-of-type(2){animation:rpRing 1s ease-out .25s both}
@keyframes rpRing{from{stroke-dashoffset:138.2}}
/* Belegungs-Pop */
.rp-bel{animation:rpPop .45s cubic-bezier(.3,1.35,.45,1) both}
.rp-belgrid .rp-bel:nth-child(3n){animation-delay:.08s}
.rp-belgrid .rp-bel:nth-child(3n+1){animation-delay:.16s}
.rp-belgrid .rp-bel:nth-child(5n){animation-delay:.24s}
@keyframes rpPop{from{opacity:0;transform:scale(.7)}}
/* Overlay-Entrance + Hero-Stagger + Shimmer */
.ref-overlay.open{animation:rpOvIn .35s ease-out}
@keyframes rpOvIn{from{opacity:0;transform:translateY(14px)}}
.rp-hero>*{animation:rpUp .5s cubic-bezier(.4,0,.2,1) both}
.rp-hero>.rp-greet{animation-delay:.07s}
.rp-hero>.rp-sub{animation-delay:.14s}
.rp-hero>.rp-tabs{animation-delay:.2s}
.rp-hero::after{background:linear-gradient(90deg,transparent,#cdb083 30%,#efe0bb 50%,#cdb083 70%,transparent);background-size:300% 100%;animation:rpShine 1.6s ease-out .2s both}
@keyframes rpShine{from{background-position:120% 0;opacity:0}to{background-position:0% 0;opacity:.6}}
/* Tab-Unterstrich wächst ein */
.rp-tab{border-bottom:none;position:relative}
.rp-tab::after{content:"";position:absolute;left:8%;right:8%;bottom:0;height:2px;background:#cdb083;transform:scaleX(0)}
.rp-tab.on::after{transform:scaleX(1);animation:rpGrow .35s ease-out both}
@keyframes rpGrow{from{transform:scaleX(.15)}}
/* Hover/Press-Mikrointeraktionen */
@media(hover:hover){
 .rp-card{transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
 .rp-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(31,28,28,.10);border-color:var(--brass-line)}
 .rp-newsrow{transition:transform .18s ease}
 .rp-newsrow:hover{transform:translateX(4px)}
 .rp-person{transition:transform .18s ease,box-shadow .18s ease}
 .rp-person:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(31,28,28,.08)}
 .rp-cta{transition:box-shadow .2s ease,transform .12s ease}
 .rp-cta:hover{box-shadow:0 6px 20px rgba(155,133,115,.5)}
}
.rp-cta:active,.rp-bel:active,.rp-doc:active{transform:scale(.97)}
/* Upload-Fake */
.rp-upload{cursor:pointer;transition:border-color .2s ease,color .2s ease}
.rp-upload.has{border-style:solid;border-color:var(--sage);color:var(--sage-deep)}
.up-file{display:block;font:600 13px/1.4 Inter;color:var(--sage-deep);margin-top:7px;animation:rpUp .4s both}
/* Politur: Labels sentence-case, Banner-Monogramm */
.rp-field label,.rp-check{text-transform:none;letter-spacing:0}
.rp-bbrand{display:flex;align-items:center;gap:11px;min-width:0}
.rp-bmono{flex:0 0 auto;width:34px;height:34px;border-radius:50%;border:1px solid #cdb083;color:#e8d9b0;display:flex;align-items:center;justify-content:center;font:600 14px/1 'Cormorant Garamond',serif}
.rp-bbrand span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media(min-width:900px){
 .rp-stats{grid-template-columns:repeat(4,1fr)}
 .rp-stat b{font-size:40px}
}
```

- [ ] **Step 2:** Verifizieren: `grep -c "ZUWEISER-SUITE WOW" index.html` → 1; JS-Parse OK.
- [ ] **Step 3:** Commit `git add index.html && git commit -m "feat(zuweiser-wow): CSS — Toast, Success-Kino, Stats-Band, Ring-Draw-in, Entrance, Hover-Mikrointeraktionen"`

---

### Task 3: renderPortal-Update (Stats-Band, Success-Hooks, Politur)

**Files:** Modify: `index.html`

- [ ] **Step 1:** `renderPortal` KOMPLETT ersetzen (rpPrefill dahinter bleibt) durch:

```js
function renderPortal(zName){
 const wk=["KW 1","KW 2","KW 3","KW 4"];
 const stats=`<div class="rp-card rp-statsband"><h3>Ihre Zusammenarbeit mit Klinik Bavaria</h3><div class="rp-stats">`
  +portalStats.map(s=>`<div class="rp-stat">${s.to!=null?`<b data-to="${s.to}" data-suf="${s.suf||""}">0${s.suf||""}</b>`:`<b>${s.txt}</b>`}<span>${s.lbl}</span></div>`).join("")+`</div></div>`;
 const news=`<div class="rp-card rp-news"><h3>Aktuelles von Klinik Bavaria</h3>`
  +portalNews.map(n=>`<div class="rp-newsrow"><span class="rp-date">${n.d}</span><div><b>${escapeHtml(n.t)}</b><small>${escapeHtml(n.s)}</small></div></div>`).join("")+`</div>`;
 const cls=n=>n===0?"none":n<=1?"tight":"free";
 const bel=`<div class="rp-card"><h3>Freie Plätze</h3><p class="rp-hint">Tippen Sie auf eine freie Woche — die Anmeldung wird vorausgefüllt.</p>
  <div class="rp-belgrid"><span class="hd">Achse</span>${wk.map(w=>`<span class="hd c">${w}</span>`).join("")}
  ${belegung.map(b=>`<span class="rp-achse">${escapeHtml(b.achse)}</span>`+b.frei.map((n,i)=>n>0?`<button class="rp-bel ${cls(n)}" onclick="rpPrefill('${escapeHtml(b.achse)}','KW ${i+1}')">${n}</button>`:`<span class="rp-bel none">–</span>`).join("")).join("")}</div>
  <div class="rp-legend"><span class="free">frei</span><span class="tight">knapp</span><span class="none">belegt</span></div></div>`;
 const team=`<div class="rp-card"><h3>Ihre Ansprechpartner</h3><span class="rp-badge">Rückmeldung &lt; 24 h</span><div class="rp-team">`
  +portalTeam.map(t=>`<div class="rp-person"><span class="rp-ava">${initialen(t.name)}</span><div><b>${escapeHtml(t.name)}</b><small>${escapeHtml(t.rolle)}</small><small>${escapeHtml(t.tel)} · ${escapeHtml(t.mail)}</small></div></div>`).join("")+`</div></div>`;
 const form=`<div class="rp-card" id="rpAnmeldung"><h3>Patient anmelden</h3>
  <div class="rp-form">
   <div class="rp-field"><label>Name des Patienten</label><input id="rpName" placeholder="z. B. Max Mustermann"></div>
   <div class="rp-field"><label>Fachbereich</label><select id="rpFach"><option>Orthopädie</option><option>Neurologie</option><option>Geriatrie</option><option>SalutoCare</option></select></div>
   <div class="rp-field"><label>Wunschtermin</label><input id="rpTermin" placeholder="KW / Datum"></div>
   <div class="rp-field"><label>Kostenträger</label><select><option>PKV</option><option>GKV + Komfort</option><option>Beihilfe</option><option>Selbstzahler</option></select></div>
  </div>
  <label class="rp-check"><input type="checkbox" checked> Dieser Patient kommt direkt von mir</label>
  <div class="rp-upload" onclick="rpUpload(this)">📎 Unterlagen hierher ziehen oder tippen (Demo)</div>
  <button class="rp-cta" onclick="rpSubmit('${escapeHtml(zName)}')">Patient anmelden</button></div>`;
 const faelleRows=`<div class="rp-card"><h3>Meine angemeldeten Fälle</h3><div id="rpFaelleList">${rpFallRows()}</div></div>`;
 const kontakt=`<div class="rp-card rp-kontakt"><h3>Kontakt</h3><p>Direktdurchwahl 0971 0000-180<br>zuweiser@demo-bavaria.local</p><button class="rp-cta ghost" onclick="rpToast('Rückruf angefragt — wir melden uns innerhalb von 24 h')">Wir rufen Sie zurück</button></div>`;
 return stats+news+`<div class="rp-two">${bel}${team}</div>`+form+`<div class="rp-two">${faelleRows}${kontakt}</div>`;
}
```

- [ ] **Step 2:** Verifizieren: JS-Parse OK; `grep -c "rpFaelleList" index.html` → ≥2; `grep -c "rp-statsband" index.html` → ≥2; im Portal-Renderer kein `refToast(` mehr (`grep -n "refToast" index.html` zeigt nur noch Definition + Einblick/Abschluss/Alt-Aufrufer).
- [ ] **Step 3:** Commit `git add index.html && git commit -m "feat(zuweiser-wow): Portal — Zusammenarbeits-Band, Success-Submit, Upload-Fake, Politur (Datum, –, Toast)"`

---

### Task 4: Einblick + Abschluss — Toasts + Outcome-Count-up

**Files:** Modify: `index.html`

- [ ] **Step 1:** In `renderEinblick`: die Zeile mit `rp-call` ersetzen durch
```js
    <a class="rp-call" href="#" onclick="rpToast('Rücksprache angefragt — das Behandlungsteam meldet sich');return false">☎ Rücksprache mit dem Behandlungsteam</a>
```

- [ ] **Step 2:** In `renderAbschluss`: (a) die `rp-outcome`-Zeile ersetzen durch
```js
  <div class="rp-outcome"><span class="k">Barthel-Index</span><span class="v"><b data-to="${d.barthel.auf}">0</b> <i>→</i> <b data-to="${d.barthel.ent}">0</b></span><span class="s">Reha-Ziel erreicht · Entlassung nach Hause mit ambulanter Anschlussversorgung</span></div>
```
(b) die drei `rp-doc`-Buttons: `onclick="refToast()"` → `onclick="rpToast('Arztbrief geöffnet — Demo-Dokument')"` / `rpToast('Kurzbericht geöffnet — Demo-Dokument')` / `rpToast('Medikationsplan geöffnet — Demo-Dokument')`. (c) die `rp-call`-Zeile: `onclick="refToast();return false"` → `onclick="rpToast('Rückruf angefragt — Recovery-Line meldet sich');return false"`.

- [ ] **Step 3:** Verifizieren: JS-Parse OK; `grep -c 'data-to="${d.barthel' index.html` → nichts (Template-Literal!) → stattdessen `grep -c "d.barthel.auf" index.html` → ≥1 und `grep -c "rpToast(" index.html` → ≥7. In den drei Suite-Renderern existiert kein `refToast(` mehr; Definition `function refToast` bleibt (grep → 1).
- [ ] **Step 4:** Commit `git add index.html && git commit -m "feat(zuweiser-wow): Einblick/Abschluss — Gold-Toasts statt alert, Outcome-Count-up"`

---

### Task 5: Banner-Monogramm

**Files:** Modify: `index.html`

- [ ] **Step 1:** Im statischen Markup `#refOverlay` die Banner-Zeile
```html
  <div class="ref-banner"><span id="refWho"></span><button class="ref-back" onclick="closeReferrer()">‹ Zurück zur Klinik-Ansicht</button></div>
```
ersetzen durch
```html
  <div class="ref-banner"><div class="rp-bbrand"><span class="rp-bmono">KB</span><span id="refWho"></span></div><button class="ref-back" onclick="closeReferrer()">‹ Zurück zur Klinik-Ansicht</button></div>
```

- [ ] **Step 2:** In `openReferrer` die `refWho`-Zeile ändern zu:
```js
 document.getElementById("refWho").textContent="Zuweiser-Portal · "+zName;
```

- [ ] **Step 3:** Verifizieren: JS-Parse OK; `grep -c "rp-bmono" index.html` → ≥2 (CSS+HTML).
- [ ] **Step 4:** Commit `git add index.html && git commit -m "feat(zuweiser-wow): Banner — KB-Monogramm-Siegel + feinere Beschriftung"`

---

### Task 6: Cross-Verifikation + Merge/Deploy (Orchestrator)

- [ ] 1440: Overlay-Entrance, Hero-Stagger+Shimmer, Stats-Count-up, Belegungs-Pop, Ring-Draw-in+Zahl-Count, Outcome-Count-up, Submit-Kino (Häkchen + Fall erscheint mit Neu-Puls, Mehrfach-Submit cap 4), Upload-Fake (2× + Limit-Toast), alle Toasts (kein natives alert in der Suite), Tab-Wechsel, Hover-Lifts.
- [ ] 390: alle 3 Screens 0 Overflow; Stats 2×2.
- [ ] 0 Console-Errors; Esc/Zurück; interne Views + `renderInReha`-Ringe unverändert (kein Draw-in dort).
- [ ] Findings fixen → dann pull → merge→main → push → Live-Marker `rpToast` pollen.

---

## Self-Review
- **Coverage:** P1 (T1 rpToast/rpSubmit + T3/T4 Verdrahtung), P2 (T2 CSS-Ring/Pop + T1 rpCount/rpAnimate + T4 Outcome-Markup), P3 (T1 portalStats + T3 Band), P4 (T2 Entrance/Stagger/Shimmer + T5 Banner), P5 (T1 rpDate/rpUpload + T3 „–"/Labels via T2), P6 (T2 Tab-Grow/Hover/Press/Puls). ✓
- **Platzhalter:** keine.
- **Konsistenz:** `rpFallRows` in T1 definiert, T3 nutzt sie; `rpAnimate` matcht `data-to`/`data-suf`-Markup aus T3/T4; `.rp-pill.neu` (T2) matcht `phase:"neu"` (T1); Ring-Umfang 138.2 = 2π·22 aus bestehendem `kpiRing`; reduced-motion überall from-only + rpCount-matchMedia. ✓
