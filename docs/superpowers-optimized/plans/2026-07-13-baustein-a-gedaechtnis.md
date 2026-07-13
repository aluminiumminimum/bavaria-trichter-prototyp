# Baustein A: Das Gedächtnis — Implementation Plan

> **For agentic workers:** Umsetzung Task-für-Task über Implementer-Lanes (`claude-implementer` = Haiku für Task 2–3, `claude-implementer-pro` = Sonnet für Task 4–5). Der Orchestrator (Fable) verifiziert nach jedem Task im Preview und führt Task 6 selbst aus. Steps nutzen Checkbox-Syntax (`- [ ]`).

**Goal:** Eine `personen[]`-Registry macht dieselbe Demo-Person über Anfrage/Fall/Reha/Bestand hinweg zu EINER Akte mit Historie, sichtbar als „Akte"-Abschnitt in den drei Detail-Overlays.

**Architecture:** Alles additiv in `index.html` (die App IST diese eine Datei, kein Build): ein neuer JS-Datenblock nach `inReha[]`, additive `personId`-Felder in bestehenden Array-Literalen, 3 Mutator-Einfügungen, eine Render-Funktion `paAkte()` + CSS-Block `.pa-*` vor `</style>`. Kein bestehendes Feld wird umbenannt oder entfernt.

**Tech Stack:** Vanilla JS/HTML/CSS inline. Kein Test-Framework — Verifikation = statische Checks (grep/node --check) je Task durch die Lane + Browser-Verifikation durch den Orchestrator (Preview `bavaria-proto`, Port 8765).

**Spec:** `docs/superpowers-optimized/specs/2026-07-13-baustein-a-gedaechtnis-design.md` (verbindlich, inkl. HARTE REGELN in §4).

**Zeilenanker beziehen sich auf `main` = `29d5247`.** Nach jedem Task verschieben sich Folge-Anker — Lanes müssen per Suchstring ankern (angegeben), nicht per Zeilennummer.

---

## Für jede Lane verbindlich (in jeden Lane-Prompt kopieren)

- Arbeitsverzeichnis: `/Users/arasch/Library/CloudStorage/ProtonDrive-pnei_konzept@proton.me-folder/SalutoCare/bavaria-trichter-prototyp`, Branch `feat/gedaechtnis` (existiert nach Task 1).
- NUR die im Task genannten Stellen anfassen. Cofounder-Namespaces tabu: `renderMatrix`, `openReferrer`/`#refOverlay`, `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`. Keine bestehenden Feldnamen ändern, nichts löschen, keine Umformatierung fremder Zeilen.
- Nach den Edits Selbstcheck ausführen (Kommando im Task) und die tatsächliche Ausgabe im Report zeigen.
- Commit auf `feat/gedaechtnis` mit der angegebenen Message, Suffix: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Kein Push.

Syntax-Selbstcheck (nach jedem Task, sofern `node` vorhanden — sonst Schritt überspringen und im Report vermerken). Ankert bewusst auf den EXAKT-Zeilen-Tags des Haupt-Script-Blocks (`^<script>$` … `^</script>$`) — die One-Line-`<script>…</script>`-Tags am Dateianfang dürfen NICHT mit extrahiert werden:
```bash
sed -n '/^<script>$/,/^<\/script>$/p' index.html | sed '1d;$d' > /tmp/pa-check.js && node --check /tmp/pa-check.js && echo SYNTAX-OK
```
Erwartet: `SYNTAX-OK` (verifiziert: liefert auf der unveränderten Datei SYNTAX-OK).

---

### Task 1: Branch anlegen (Orchestrator)

- [ ] **Step 1:** `git -C <repo> checkout -b feat/gedaechtnis` — Ausgabe: `Switched to a new branch 'feat/gedaechtnis'`.

---

### Task 2: GEDÄCHTNIS-Datenblock einfügen (Lane: claude-implementer / Haiku)

**Files:** Modify: `index.html` — Einfügung NACH dem Ende von `inReha[]` (Suchanker: die Zeile `let aktuellerFall=null;let zFilter="krankenhaus";...`, aktuell Zeile 2655; der neue Block kommt UNMITTELBAR DAVOR).

- [ ] **Step 1: Block exakt einfügen** (vollständig, keine Auslassungen):

```js
/* ---------- GEDÄCHTNIS (Baustein A): personen[]-Registry — Spec docs/superpowers-optimized/specs/2026-07-13-baustein-a-gedaechtnis-design.md ---------- */
function gebIn(tage,alter){
 const d=new Date(heute);d.setDate(d.getDate()+tage);
 const t=new Date(heute.getFullYear(),d.getMonth(),d.getDate());
 const jahr=heute.getFullYear()-alter-(t>heute?1:0);
 return jahr+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
let personen=[
 {pid:"P01",name:"Anna Muster",geb:gebIn(-142,67),lebenszyklus:"interessent",kt:"PKV",kontakt:{tel:"0971 0000-501",mail:"a.muster@demo-patient.local"},angehoerige:[{name:"Jutta Muster",bezug:"Tochter"}],einwilligung:{status:"erteilt",form:"mündlich",datum:dstr(0),zwecke:["behandlung"]},zuweiserRef:"RHÖN-KLINIKUM Campus",historie:[{d:dstr(0),typ:"anfrage",text:"Anfrage über Sozialdienst RHÖN (Schlaganfall, AHB gesucht)"}]},
 {pid:"P02",name:"Maria Probst",geb:gebIn(63,58),lebenszyklus:"interessent",kt:"Selbstzahler",kontakt:{tel:"0971 0000-502",mail:"m.probst@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-2),zwecke:["behandlung","newsletter"]},zuweiserRef:null,historie:[{d:dstr(-2),typ:"anfrage",text:"Website-Anfrage Komfort-Reha"},{d:dstr(-2),typ:"kontakt",text:"Rückruf nach 3 Std., Beratung geführt"}]},
 {pid:"P03",name:"Heinz Vogel",geb:gebIn(-201,69),lebenszyklus:"interessent",kt:"PKV",kontakt:{tel:"0971 0000-503",mail:"h.vogel@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-5),zwecke:["behandlung"]},zuweiserRef:"Thoraxzentrum Münnerstadt",historie:[{d:dstr(-5),typ:"anfrage",text:"Anfrage Weaning-Anschluss (Thoraxzentrum)"}]},
 {pid:"P04",name:"Peter Hofmann",geb:gebIn(118,63),lebenszyklus:"interessent",kt:"GKV + Komfort",kontakt:{tel:"0971 0000-504",mail:"p.hofmann@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"mündlich",datum:dstr(-6),zwecke:["behandlung"]},zuweiserRef:"Klinikum Fulda",historie:[{d:dstr(-6),typ:"anfrage",text:"Recare-Anfrage Neuro-Reha (Klinikum Fulda)"}]},
 {pid:"P05",name:"Ruth Winkler",geb:gebIn(-33,77),lebenszyklus:"interessent",kt:"PKV",kontakt:{tel:"0971 0000-505",mail:"r.winkler@demo-patient.local"},angehoerige:[{name:"Kurt Winkler",bezug:"Ehemann"}],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-10),zwecke:["behandlung"]},zuweiserRef:"Uniklinikum Würzburg",historie:[{d:dstr(-10),typ:"anfrage",text:"Anfrage Privatstation UKW"},{d:dstr(-6),typ:"kontakt",text:"Kostenzusage PKV eingegangen"}]},
 {pid:"P06",name:"Hans Keller",geb:gebIn(87,70),lebenszyklus:"interessent",kt:"Beihilfe",kontakt:{tel:"0971 0000-506",mail:"h.keller@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"mündlich",datum:dstr(-14),zwecke:["behandlung"]},zuweiserRef:null,historie:[{d:dstr(-14),typ:"anfrage",text:"Anfrage über Empfehlung"},{d:dstr(-8),typ:"kontakt",text:"Familie hat anderes Haus gewählt (Wartezeit)"}]},
 {pid:"P07",name:"Ludwig Bauer",geb:gebIn(-260,71),lebenszyklus:"patient",kt:"PKV",kontakt:{tel:"0971 0000-507",mail:"l.bauer@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-12),zwecke:["behandlung"]},zuweiserRef:"Leopoldina-Krankenhaus",historie:[{d:dstr(-12),typ:"anfrage",text:"Anfrage nach Hüft-TEP (Sozialdienst Leopoldina)"},{d:dstr(-2),typ:"aufnahme",text:"Aufgenommen — Privatzimmer"}]},
 {pid:"P08",name:"Elisabeth Cramer",geb:gebIn(24,66),lebenszyklus:"patient",kt:"PKV",kontakt:{tel:"0971 0000-508",mail:"e.cramer@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-15),zwecke:["behandlung","newsletter"]},zuweiserRef:null,historie:[{d:dstr(-15),typ:"anfrage",text:"Website-Anfrage Neuro-Reha"},{d:dstr(-3),typ:"aufnahme",text:"Aufgenommen"}]},
 {pid:"P09",name:"Dieter Franke",geb:gebIn(151,66),lebenszyklus:"patient",kt:"PKV",kontakt:{tel:"0971 0000-509",mail:"d.franke@demo-patient.local"},angehoerige:[{name:"Helga Franke",bezug:"Ehefrau"}],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-13),zwecke:["behandlung"]},zuweiserRef:null,historie:[{d:dstr(-13),typ:"anfrage",text:"Anfrage AHB nach Knie-TEP"},{d:dstr(-11),typ:"fall",text:"Fall angelegt, Unterlagen angefordert"},{d:dstr(-6),typ:"aufnahme",text:"Aufnahme zur orthopädischen AHB"}]},
 {pid:"P10",name:"Elke Sauer",geb:gebIn(-77,59),lebenszyklus:"patient",kt:"Selbstzahler",kontakt:{tel:"0971 0000-510",mail:"e.sauer@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-10),zwecke:["behandlung","newsletter"]},zuweiserRef:null,historie:[{d:dstr(-10),typ:"anfrage",text:"Anfrage SalutoCare-Suite"},{d:dstr(-4),typ:"aufnahme",text:"Aufnahme SalutoCare"}]},
 {pid:"P11",name:"Lydia Sommer",geb:gebIn(-190,77),lebenszyklus:"patient",kt:"PKV",kontakt:{tel:"0971 0000-511",mail:"l.sommer@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"mündlich",datum:dstr(-6),zwecke:["behandlung"]},zuweiserRef:null,historie:[{d:dstr(-6),typ:"anfrage",text:"Anfrage Neuro-Reha nach Hirninfarkt"},{d:dstr(-2),typ:"aufnahme",text:"Aufnahme Neurologie"}]},
 {pid:"P12",name:"Sabine Vogt",geb:gebIn(40,54),lebenszyklus:"interessent",kt:"PKV",kontakt:{tel:"0971 0000-512",mail:"s.vogt@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-3),zwecke:["behandlung","newsletter"]},zuweiserRef:null,historie:[{d:dstr(-3),typ:"kontakt",text:"Broschüre geladen, Kontaktfreigabe erteilt"},{d:dstr(-1),typ:"kontakt",text:"Erstgespräch geführt, Komfort-Reha gewünscht"}]},
 {pid:"P13",name:"Bernd Kohl",geb:gebIn(-15,59),lebenszyklus:"interessent",kt:"Unklar",kontakt:{tel:"0971 0000-513",mail:"b.kohl@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"mündlich",datum:dstr(-7),zwecke:["behandlung"]},zuweiserRef:null,historie:[{d:dstr(-7),typ:"kontakt",text:"Telefonisches Interesse an Neuro-Reha, noch kein Termin"}]},
 {pid:"P14",name:"Markus Pfeiffer",geb:gebIn(200,60),lebenszyklus:"altpatient",kt:"Selbstzahler",kontakt:{tel:"0971 0000-514",mail:"m.pfeiffer@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-120),zwecke:["behandlung","newsletter","post"]},zuweiserRef:null,historie:[{d:dstr(-120),typ:"entlassung",text:"Premium-Reha abgeschlossen, Entlassung nach Hause"},{d:dstr(-30),typ:"kontakt",text:"Kontaktwunsch Premium-Nachsorge"}]},
 {pid:"P15",name:"Petra Lindner",geb:gebIn(-58,57),lebenszyklus:"interessent",kt:"Unklar",kontakt:{tel:"0971 0000-515",mail:"p.lindner@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-20),zwecke:["newsletter"]},zuweiserRef:null,historie:[{d:dstr(-20),typ:"kontakt",text:"Reha-Broschüre geladen, Newsletter abonniert"}]},
 {pid:"P16",name:"Klaus Reuter",geb:gebIn(133,62),lebenszyklus:"interessent",kt:"Selbstzahler",kontakt:{tel:"0971 0000-516",mail:"k.reuter@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-25),zwecke:["newsletter"]},zuweiserRef:null,historie:[{d:dstr(-25),typ:"kontakt",text:"Premium-Broschüre, E-Mail-Einwilligung"}]},
 {pid:"P17",name:"Ilse Hartmann",geb:gebIn(-233,61),lebenszyklus:"interessent",kt:"Unklar",kontakt:{tel:"0971 0000-517",mail:"i.hartmann@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-60),zwecke:["newsletter"]},zuweiserRef:null,historie:[{d:dstr(-60),typ:"kontakt",text:"Newsletter-Anmeldung"}]},
 {pid:"P18",name:"Gerda Sommer",geb:gebIn(19,69),lebenszyklus:"altpatient",kt:"GKV",kontakt:{tel:"0971 0000-518",mail:"g.sommer@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-400),zwecke:["behandlung","post"]},zuweiserRef:null,historie:[{d:dstr(-400),typ:"entlassung",text:"Ortho-Reha abgeschlossen"}]},
 {pid:"P19",name:"Norbert Frey",geb:gebIn(-99,64),lebenszyklus:"interessent",kt:"Unklar",kontakt:{tel:"0971 0000-519",mail:"n.frey@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"mündlich",datum:dstr(-90),zwecke:["behandlung"]},zuweiserRef:null,historie:[{d:dstr(-90),typ:"kontakt",text:"Messe-Kontakt (Gesundheitsmesse), ruht"}]},
 {pid:"P20",name:"Hannelore Beck",geb:gebIn(76,70),lebenszyklus:"interessent",kt:"Unklar",kontakt:{tel:"",mail:"h.beck@demo-patient.local"},angehoerige:[],einwilligung:{status:"offen",form:null,datum:null,zwecke:[]},zuweiserRef:null,historie:[{d:dstr(-11),typ:"kontakt",text:"E-Mail eingegangen, keine Freigabe angeklickt"}]},
 {pid:"P21",name:"Margarete Wirth",geb:gebIn(5,73),lebenszyklus:"altpatient",kt:"GKV + Komfort",kontakt:{tel:"0971 0000-521",mail:"m.wirth@demo-patient.local"},angehoerige:[{name:"Dorothea Wirth",bezug:"Tochter"}],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-330),zwecke:["behandlung","newsletter","post"]},zuweiserRef:null,historie:[{d:dstr(-360),typ:"aufnahme",text:"Aufnahme nach Knie-TEP links"},{d:dstr(-330),typ:"entlassung",text:"Reha abgeschlossen, gutes Ergebnis"}]},
 {pid:"P22",name:"Christa Mohr",geb:gebIn(12,58),lebenszyklus:"altpatient",kt:"Selbstzahler",kontakt:{tel:"0971 0000-522",mail:"c.mohr@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-150),zwecke:["behandlung","newsletter","post"]},zuweiserRef:null,historie:[{d:dstr(-150),typ:"entlassung",text:"Premium-Reha abgeschlossen (SalutoCare)"}]},
 {pid:"P23",name:"Otto Brenner",geb:gebIn(-310,68),lebenszyklus:"altpatient",kt:"PKV",kontakt:{tel:"0971 0000-523",mail:"o.brenner@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"mündlich",datum:dstr(-425),zwecke:["behandlung","post"]},zuweiserRef:null,historie:[{d:dstr(-425),typ:"entlassung",text:"Schlaganfall-Reha abgeschlossen"}]},
 {pid:"P24",name:"Friedrich Berg",geb:gebIn(170,71),lebenszyklus:"altpatient",kt:"PKV",kontakt:{tel:"0971 0000-524",mail:"f.berg@demo-patient.local"},angehoerige:[],einwilligung:{status:"erteilt",form:"schriftlich",datum:dstr(-240),zwecke:["behandlung","post"]},zuweiserRef:null,historie:[{d:dstr(-240),typ:"entlassung",text:"Reha nach Hüft-TEP links abgeschlossen"}]},
 {pid:"P25",name:"Walter Simon",geb:gebIn(-45,80),lebenszyklus:"altpatient",kt:"GKV",kontakt:{tel:"",mail:""},angehoerige:[],einwilligung:{status:"widerruf",form:null,datum:dstr(-500),zwecke:[]},zuweiserRef:null,historie:[{d:dstr(-690),typ:"entlassung",text:"Kardio-Reha abgeschlossen"},{d:dstr(-500),typ:"kontakt",text:"Kontakteinwilligung widerrufen"}]}
];
let zuweiserEvents=[
 {zName:"Leopoldina-Krankenhaus",d:dstr(-1),typ:"fall",text:"Fall Ludwig Bauer vermittelt (Hüft-TEP)"},
 {zName:"Leopoldina-Krankenhaus",d:dstr(-30),typ:"gespraech",text:"Quartalsgespräch mit Hr. Brenner"},
 {zName:"Leopoldina-Krankenhaus",d:dstr(-60),typ:"newsletter",text:"Partner-Update Q2 versendet"},
 {zName:"RHÖN-KLINIKUM Campus",d:dstr(0),typ:"fall",text:"AHB-Anmeldung Anna Muster (Sozialdienst)"},
 {zName:"RHÖN-KLINIKUM Campus",d:dstr(-45),typ:"besuch",text:"Vor-Ort-Termin Sozialdienst"},
 {zName:"Dr. Sommer",d:dstr(-2),typ:"fall",text:"Empfehlung geriatrische Reha (Patientin, 79)"},
 {zName:"Dr. Sommer",d:dstr(-90),typ:"newsletter",text:"Praxis-Infopaket versendet"},
 {zName:"Thoraxzentrum Münnerstadt",d:dstr(-5),typ:"fall",text:"Weaning-Anschluss Heinz Vogel"},
 {zName:"PRIMO MEDICO",d:dstr(-4),typ:"fall",text:"Internationale Premium-Anfrage"},
 {zName:"PRIMO MEDICO",d:dstr(-70),typ:"newsletter",text:"Profil-Update: neue SalutoCare-Suiten eingestellt"},
 {zName:"Uniklinikum Würzburg",d:dstr(-9),typ:"rueckmeldung",text:"Feedback zur Übernahme Ruth Winkler"}
];
```

- [ ] **Step 2: Selbstcheck**
```bash
grep -c 'pid:"P' index.html        # Erwartet: 25
grep -c 'zName:' index.html        # Erwartet: 11
```
plus Syntax-Selbstcheck (s. o.).

- [ ] **Step 3: Commit** — `git add index.html && git commit -m "feat(gedaechtnis): personen[]-Registry (25 Seeds) + zuweiserEvents[] + gebIn()"`

---

### Task 3: personId-Backfill + Kurations-Flags (Lane: claude-implementer / Haiku)

**Files:** Modify: `index.html` — NUR die folgenden Literale, je 1 Feld-Einfügung. Einfügeposition: direkt nach `{id:` bzw. `{name:` des jeweiligen Elements, Format `personId:"Pxx",`.

- [ ] **Step 1: `faelle[]`** (Anker `let faelle=[`): id 1→`P01`, 3→`P02`, 6→`P03`, 8→`P04`, 9→`P05`, 12→`P06`, 10→`P07`, 11→`P08`. Beispiel Ergebnis: `{id:1,personId:"P01",name:"Anna Muster",…}`.
- [ ] **Step 2: `inReha[]`** (Anker `let inReha=[`): Dieter Franke→`P09`, Elke Sauer→`P10`, Lydia Sommer→`P11`. **ACHTUNG: geteilte Daten — ausschließlich das eine Feld einfügen, keine sonstige Änderung an diesen drei Literalen.**
- [ ] **Step 3: `bestand[]`** (Anker `let bestand=[`), in Seed-Reihenfolge: Sabine Vogt→`P12`, Bernd Kohl→`P13`, Markus Pfeiffer→`P14`, Petra Lindner→`P15`, Klaus Reuter→`P16`, Ilse Hartmann→`P17`, Gerda Sommer→`P18`, Norbert Frey→`P19`, Hannelore Beck→`P20`. „Unbekannt (Website)" bekommt KEIN personId.
- [ ] **Step 4: `radar[]`** (Anker `let radar=[`): Margarete Wirth→`P21`, Christa Mohr→`P22`, Otto Brenner→`P23`, Friedrich Berg→`P24`, Walter Simon→`P25`.
- [ ] **Step 5: `eingang[]`** (Anker `let eingang=[`): NUR id 107: `einzelperson:true,pName:"Carola Diehm",` einfügen (nach `{id:107,`); NUR id 108: `einzelperson:false,` einfügen. Einträge 101–106 unverändert (keine identifizierbare Einzelperson, kein personId).
- [ ] **Step 6: `INBOUND_POOL`** (Anker `const INBOUND_POOL=[`): Eintrag „Familie Hoffmann" → `einzelperson:false,`; Eintrag „Herr Reinhardt" → `einzelperson:true,`; Eintrag „Frau Dr. Kessler" → `einzelperson:false,` (die benannte Person ist die Zuweiserin, nicht die Patientin). Jeweils nach `{kanal:…,` vor `name:` einfügen.
- [ ] **Step 7: Selbstcheck**
```bash
grep -c 'personId:"P' index.html   # Erwartet: 25
grep -c 'einzelperson:' index.html # Erwartet: 5
```
plus Syntax-Selbstcheck.
- [ ] **Step 8: Commit** — `git add index.html && git commit -m "feat(gedaechtnis): personId-Backfill (faelle/inReha/bestand/radar) + einzelperson-Kuration (eingang 107/108, INBOUND_POOL)"`

---

### Task 4: Helper, Boot-Assertion, Mutator-Einfügungen (Lane: claude-implementer-pro / Sonnet)

**Files:** Modify: `index.html` — 4 Stellen.

- [ ] **Step 1: Helper + Assertion** ans ENDE des GEDÄCHTNIS-Blocks aus Task 2 (direkt nach dem `zuweiserEvents`-Array, vor `let aktuellerFall`):

```js
let _pidN=0;
function person(pid){return personen.find(p=>p.pid===pid)||null;}
function pNew(name,teil){
 const p=Object.assign({pid:"PR"+(++_pidN),name:name,geb:null,lebenszyklus:"interessent",kt:"Unklar",
  kontakt:{tel:"",mail:""},angehoerige:[],einwilligung:{status:"offen",form:null,datum:null,zwecke:[]},
  zuweiserRef:null,historie:[]},teil||{});
 personen.push(p);return p.pid;
}
function pHist(pid,typ,text){const p=person(pid);if(p)p.historie.push({d:dstr(0),typ:typ,text:text});}
(function paAssert(){
 const miss=[];
 [["faelle",faelle],["eingang",eingang],["bestand",bestand],["radar",radar],["inReha",inReha]].forEach(pair=>{
  pair[1].forEach(x=>{if(x.personId&&!personen.some(p=>p.pid===x.personId))miss.push(pair[0]+": "+(x.name||x.id));});
 });
 personen.forEach(p=>{if(!p.geb||!p.kt)miss.push("personen: "+p.pid);});
 if(miss.length)console.warn("Gedächtnis-Assertion — nicht auflösbar:",miss);
})();
```

- [ ] **Step 2: `simulateInbound`** — im `setTimeout`-Callback (Anker: `const fid=Math.max(0,...faelle.map(x=>x.id))+1;`), DAVOR einfügen:
```js
  let _pid=null;
  if(t.einzelperson){_pid=pNew(t.name,{kt:t.kt==="Privat"?"PKV":t.kt});pHist(_pid,"anfrage","Anfrage über "+t.kanal+" ("+t.quelle+")");pHist(_pid,"fall","Automatisch als Fall angelegt");}
```
und im darauffolgenden `faelle.push({id:fid,` → `faelle.push({id:fid,personId:_pid,`.
**`uebernehmen()` wird NICHT angefasst** (Platzhaltername, keine identifizierbare Person — Spec §2.4).

- [ ] **Step 3: `inDatenbank`** — das komplette `bestand.unshift({…})`-Statement (Anker: `bestand.unshift({name:m.tit.split`) ERSETZEN durch:
```js
 let _pid=null;
 if(m.einzelperson&&m.pName){_pid=pNew(m.pName,{kt:"Unklar"});pHist(_pid,"kontakt","In Datenbank aufgenommen aus "+m.kanal);}
 bestand.unshift({name:(m.einzelperson&&m.pName)?m.pName:(m.tit.split(":")[1]?m.tit.split(":")[1].trim():"Neuer Kontakt"),personId:_pid,tier:"C",alter:null,achse:m.achse,entl:"—",
   consent:(m.tit+" "+m.txt).toLowerCase().includes("freigabe")?"ja":"nein",
   anlass:"Aus Eingang ("+m.kanal+"): "+m.txt,wv:false,stufe:2,quelle:"Broschüre-Download",
   auto:"1 Info-Mail nach 7 Tagen, dann ruhend",board:"neu",owner:"S. Koordination"});
```
(Enthält den Beifang-Fix `tier:"C"` — Spec §2.4. Alle übrigen Felder unverändert.)

- [ ] **Step 4: `advanceFall`** — nach der Zeile `const ns=STATUS[cur+1]; f.log.push(…);` einfügen:
```js
 if(f.personId)pHist(f.personId,ns==="Aufgenommen"?"aufnahme":"fall","Status: "+f.status+" → "+ns);
```
(VOR `f.status=ns;` — der Text braucht den alten Status.)

- [ ] **Step 5: Selbstcheck** — Syntax-Selbstcheck + `grep -c 'function pNew' index.html` (Erwartet: 1).
- [ ] **Step 6: Commit** — `git add index.html && git commit -m "feat(gedaechtnis): person()/pNew()/pHist() + Boot-Assertion + Laufzeit-Personen in simulateInbound/inDatenbank/advanceFall (inkl. tier-Fix)"`

---

### Task 5: Akte-UI `paAkte()` + CSS `.pa-*` (Lane: claude-implementer-pro / Sonnet)

**Files:** Modify: `index.html` — 5 Stellen.

- [ ] **Step 1: Render-Funktionen** ans Ende des GEDÄCHTNIS-Blocks (nach der `paAssert`-IIFE):

```js
function paDate(iso){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||"");return m?m[3]+"."+m[2]+"."+m[1]:(iso||"");}
function paGeb(geb){
 if(!geb)return null;
 const mo=+geb.slice(5,7)-1,da=+geb.slice(8,10),j=+geb.slice(0,4);
 const h0=new Date(heute.getFullYear(),heute.getMonth(),heute.getDate());
 let n=new Date(heute.getFullYear(),mo,da);
 if(n<h0)n=new Date(heute.getFullYear()+1,mo,da);
 return {tage:Math.round((n-h0)/86400000),wird:n.getFullYear()-j,datum:String(da).padStart(2,"0")+"."+String(mo+1).padStart(2,"0")+"."};
}
/* Tages-Diff bewusst gegen Mitternacht (h0) statt gegen `heute` (trägt Ladezeit-Uhrzeit) — sonst kippt die Tageszahl je nach Tageszeit um ±1. */
const PA_TYP={anfrage:"Anfrage",fall:"Fall",aufnahme:"Aufnahme",entlassung:"Entlassung",kontakt:"Kontakt"};
const PA_ZW={behandlung:"Behandlung",newsletter:"Newsletter",post:"Post/Geschenk"};
function paAkte(pid){
 const p=person(pid);if(!p)return"";
 const g=paGeb(p.geb),ew=p.einwilligung||{zwecke:[]};
 const ewTxt=ew.status==="erteilt"?("erteilt"+(ew.form?" ("+ew.form+")":"")):ew.status==="widerruf"?"Widerruf":"offen";
 const hist=(p.historie||[]).slice(-6).reverse().map(h=>"<div class='pa-he'><small>"+escapeHtml(paDate(h.d))+"</small><span class='pa-ht'>"+escapeHtml(PA_TYP[h.typ]||h.typ)+"</span><p>"+escapeHtml(h.text)+"</p></div>").join("");
 return "<div class='pa-akte'>"
  +"<div class='pa-head'><span class='kicker'>Akte</span><span class='pa-chip lz-"+p.lebenszyklus+"'>"+escapeHtml(p.lebenszyklus)+"</span><span class='pa-chip'>"+escapeHtml(p.kt)+"</span></div>"
  +(p.geb?"<div class='pa-row'><span class='pa-k'>Geburtsdatum</span><span>"+escapeHtml(paDate(p.geb))+((g&&g.tage<=30)?" · <b class='pa-soon'>wird "+g.wird+" am "+g.datum+"</b>":"")+"</span></div>":"")
  +"<div class='pa-row'><span class='pa-k'>Einwilligung</span><span>"+escapeHtml(ewTxt)+((ew.zwecke&&ew.zwecke.length)?" · "+ew.zwecke.map(z=>"<span class='pa-zw'>"+escapeHtml(PA_ZW[z]||z)+"</span>").join(" "):"")+"</span></div>"
  +((p.angehoerige&&p.angehoerige.length)?"<div class='pa-row'><span class='pa-k'>Angehörige</span><span>"+p.angehoerige.map(a=>escapeHtml(a.name)+" ("+escapeHtml(a.bezug)+")").join(", ")+"</span></div>":"")
  +(p.zuweiserRef?"<div class='pa-row'><span class='pa-k'>Zuweiser</span><span>"+escapeHtml(p.zuweiserRef)+"</span></div>":"")
  +(hist?"<div class='pa-hist'>"+hist+"</div>":"")
  +"</div>";
}
function paAkteSlot(pid){
 return pid?paAkte(pid):"<div class='pa-akte'><div class='pa-head'><span class='kicker'>Akte</span></div><div class='pa-hint'>Noch keine Einzelperson qualifiziert — die Akte entsteht bei der Qualifizierung.</div></div>";
}
```

- [ ] **Step 2: Statisches Markup Fall-Schublade** — nach der Zeile `<div id="dWerdegang" class="d-track"></div>` (aktuell Zeile 2387) einfügen: `        <div id="dAkte"></div>`
- [ ] **Step 3: `openDetail`** — nach der Zeile, die `dWerdegang`-innerHTML setzt (Anker `document.getElementById("dWerdegang").innerHTML=`), einfügen:
```js
  document.getElementById("dAkte").innerHTML=paAkteSlot(f.personId);
```
- [ ] **Step 4: `openDbDetail`** — am Ende des `dbBody`-innerHTML-Ausdrucks (Anker: `+"<div class='patient-actions'>"+action+"</div>"` gefolgt von `+"</div>";`): aus `+"</div>";` wird `+"</div>"+paAkte(p.personId);`
- [ ] **Step 5: `openRsDetail`** — am Ende des `rsWirt`-innerHTML-Ausdrucks (Anker: `+(bill.empf&&bill.empf.length?…:"");`): vor dem abschließenden `;` anhängen: `+paAkte(p.personId)`
- [ ] **Step 6: CSS-Block** — VOR `</style>` (aktuell Zeile 1495) einfügen:

```css
/* ---------- Baustein A · Akte (.pa-*) — Spec 2026-07-13-baustein-a-gedaechtnis ---------- */
.pa-akte{margin-top:18px;padding-top:14px;border-top:1px solid var(--hair)}
.pa-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.pa-chip{font:600 10.5px/1 Inter,sans-serif;letter-spacing:.05em;text-transform:uppercase;padding:4px 8px;border-radius:999px;background:var(--paper2);color:var(--muted);border:1px solid var(--hair)}
.pa-chip.lz-patient{background:var(--sage-soft);color:var(--sage-deep);border-color:transparent}
.pa-chip.lz-altpatient{background:var(--brass-soft);color:var(--brass-deep);border-color:transparent}
.pa-row{display:flex;gap:10px;padding:5px 0;font-size:13px;color:var(--ink-soft);border-bottom:1px dashed var(--hair2)}
.pa-row .pa-k{flex:0 0 110px;color:var(--faint);font-size:11px;text-transform:uppercase;letter-spacing:.05em;padding-top:2px}
.pa-soon{color:var(--brass-deep);font-weight:600}
.pa-zw{display:inline-block;font-size:11px;padding:2px 7px;border-radius:999px;background:var(--paper2);border:1px solid var(--hair);color:var(--muted);margin-left:2px}
.pa-hist{margin-top:10px;display:grid;gap:7px}
.pa-he{display:grid;grid-template-columns:74px 84px 1fr;gap:8px;font-size:12.5px;align-items:baseline}
.pa-he small{color:var(--faint);font-variant-numeric:tabular-nums}
.pa-he .pa-ht{font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--brass-deep)}
.pa-he p{margin:0;color:var(--ink-soft)}
.pa-hint{font-size:13px;color:var(--muted);font-style:italic}
@media(max-width:520px){.pa-he{grid-template-columns:64px 1fr}.pa-he p{grid-column:1/-1;margin-top:-2px}}
```

- [ ] **Step 7: Selbstcheck** — Syntax-Selbstcheck + `grep -c 'pa-akte' index.html` (Erwartet: ≥3: 1× CSS, 2× in paAkte/paAkteSlot).
- [ ] **Step 8: Commit** — `git add index.html && git commit -m "feat(gedaechtnis): Akte-Abschnitt (paAkte) in Fall-Schublade, Datenbank- und Reha-Detail + .pa-* CSS"`

---

### Task 6: Verifikation, Merge, Push (Orchestrator — Fable, inline)

Checkliste = Spec §5, vollständig:

- [ ] **Step 1:** Preview `bavaria-proto` starten, 1440×900. `openDetail(1)` → Akte Anna Muster (Chips interessent/PKV, Geburtsdatum, Einwilligung mündlich+Behandlung, Angehörige, Zuweiser RHÖN, Historie).
- [ ] **Step 2:** `openDbDetail(0)` → Akte Sabine Vogt (Cross-View: 2 Kontakt-Einträge). `openRsDetail(0)` → Akte Dieter Franke (patient, anfrage→fall→aufnahme) UNTER dem BWL-Panel; `rsp`-Charts darüber intakt.
- [ ] **Step 3:** Live-Flow A: `simulateInbound()` manuell (liefert „Herr Reinhardt") → Fall öffnen → Akte mit PR-pid + 2 Historie-Einträgen. Live-Flow B: 2× weiter klicken bis „Familie Hoffmann" → Fall öffnen → `.pa-hint`-Hinweis, KEINE Person.
- [ ] **Step 4:** `uebernehmen` auf Eingangs-Eintrag 101 → Fall öffnen → `.pa-hint`, keine Person „Neuer Fall (aus Eingang)" in `personen` (Console: `personen.some(p=>p.name.includes("Neuer Fall"))` → `false`).
- [ ] **Step 5:** `inDatenbank(107)` → Bestand-View zeigt „Carola Diehm" SICHTBAR in Stufe C (tier-Fix), `openDbDetail(0)` → Akte vorhanden. Danach `inDatenbank(108)` (nach Reload oder zweiter Eintrag) → Eintrag sichtbar, KEINE Akte, kein Fehler.
- [ ] **Step 6:** Geburtstags-Beleg: Console `paGeb(person("P21").geb).tage` → `5` (deterministisch dank Mitternachts-Normalisierung in `paGeb`); Console `paAkte("P21")` liefert String mit „wird 74 am" (radar hat kein eigenes Overlay). Anzeige-Kontrolle im Datenbank-Inspektor: P18 Gerda Sommer (19 Tage) zeigt die „wird … am …"-Zeile.
- [ ] **Step 7:** Cofounder-Gegenprobe: `go('matrix')` 6 Zellen; `openReferrer('portal','Leopoldina-Krankenhaus')` + Tabs Einblick (liest `inReha[]`) + Abschluss; schließen.
- [ ] **Step 8:** Console: 0 Errors, KEINE „Gedächtnis-Assertion"-Warnung. `document.documentElement.scrollWidth - clientWidth === 0` @1440 und @390 auf allen 6 Views + geöffneten Overlays. Screenshots @1440 und @390 als Beleg.
- [ ] **Step 9:** Merge & Push: `git checkout main && GIT_TERMINAL_PROMPT=0 git fetch origin main && git merge-base --is-ancestor origin/main HEAD || git pull --rebase; git merge --ff-only feat/gedaechtnis || git merge feat/gedaechtnis; GIT_TERMINAL_PROMPT=0 git push origin main; git branch -d feat/gedaechtnis`. Danach Live-Check via `gh api repos/aluminiumminimum/bavaria-trichter-prototyp/pages/builds/latest --jq '{status,commit}'`.

---

## Nicht-Ziele (Erinnerung aus Spec §6)

Keine View-Redesigns · keine Radar-/Newsletter-/Forecast-Features (B/C) · kein Umbau `RS_BILLING` · `uebernehmen` bleibt ohne Personen-Anlage · toter Code (`passivLead`, `mxMetric`) bleibt stehen · keine Persistenz.
