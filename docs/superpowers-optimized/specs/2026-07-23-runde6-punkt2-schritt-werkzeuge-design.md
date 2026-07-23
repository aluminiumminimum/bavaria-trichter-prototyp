# Runde 6, Punkt 2 — Dynamische Schritt-Werkzeuge in der Fallakte

**Bezug:** Sechste Runde, Nutzer-Feedback-Punkt 2. Baut auf Punkt 1
([2026-07-23-runde6-punkt1-anfrage-triage-design.md](./2026-07-23-runde6-punkt1-anfrage-triage-design.md),
umgesetzt inkl. Nachfixes: 2 Teams Orthopädie/Neuro-Geri via `achseZuGruppe()`, `f.rueckfragen[]`,
`egVollstaendigkeit()`, Fallakte öffnet in `ma-mode`, Aufgaben-Klick → `openFallakte()`) sowie der
Hybrid-Fallakte aus
[2026-07-22-runde5-sprint3-fallakte-cockpit-design.md](./2026-07-22-runde5-sprint3-fallakte-cockpit-design.md).

**Leitplanken (aus [../../../CLAUDE.md](../../../CLAUDE.md)):** `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*` +
`#refOverlay` tabu; Arrays/Objekte nur additiv; exakt 9 `@keyframes` (unverändert, diese Spec fügt
keine neue Animation hinzu); Jade-Apotheke-Identität; reduced-motion-safe; `escapeHtml()` um alle
dynamischen Texte; kein `Math.random`; 390px + 1440px, 0 Console-Errors; nur synthetische Daten.

---

## 1. Kontext / Problem

Beim Arbeitsschritt „Rückruf Angehörige" bei Anna Muster (`faelle[0]`, [index.html:4253](../../../index.html#L4253))
zeigt `dArbeitHtml()` ([index.html:6202](../../../index.html#L6202)) heute **gar kein** rueckruf-Werkzeug:
Der bestehende rueckruf-Zweig ([index.html:6226](../../../index.html#L6226)) greift nur, wenn
`f.rueckfragen&&f.rueckfragen.length` — Anna Muster ist aber eine statische `faelle[]`-Seed ohne
`rueckfragen`-Feld (nie durch `uebernehmen()` gelaufen), fällt also durch bis zum generischen
Notiz-Feld ([index.html:6235](../../../index.html#L6235)). Es fehlt: die Originalnachricht (existiert für
sie gar nicht als Feld), die Kernfakten auf einen Blick, eine Checkliste was zu tun ist. Übernommene
Fälle heißen zudem immer `"Neuer Fall (aus Eingang)"` ([index.html:4914](../../../index.html#L4914)),
unabhängig davon, was in der Anfrage stand.

---

## 2. Zielbild

Jedes Werkbank-Werkzeug in `#dArbeit` bekommt im Kopf eine **Kernfakten-Chip-Zeile** (Alter, Diagnose/
Achse, Kostenträger, Frist, Absender-Typ — deterministisch aus dem Originaltext extrahiert). Der
**rueckruf**-Zweig wird verlässlich (nicht mehr bedingt durch `rueckfragen.length`) und zeigt zusätzlich:
eine „Stammdaten bestätigen"-Zeile (bis bestätigt), die zugeklappte Originalnachricht, und eine
Checkliste aus SOP-Standardpunkten + ggf. übernommenen Rückfragen. Ab jedem anderen Aufgabentyp wandert
die Originalnachricht stattdessen als eigenes Kapitel in die Kontext-Spalte. Neue Fälle aus dem Eingang
bekommen einen sprechenden Namen statt „Neuer Fall (aus Eingang)".

---

## 3. Datenmodell-Änderungen (additiv)

### 3.1 `faelle[]` — neue optionale Felder

| Feld | Typ | Bedeutung |
|---|---|---|
| `f.originalTxt` | `String` | Originalnachricht der Anfrage. Aus `uebernehmen()` kopiert (§6) oder manuell an 3 Bestands-Seeds ergänzt (§7). |
| `f.originalKanal` | `String` | Eingangskanal der Originalnachricht (z. B. `"Telefon"`), nur Anzeige. |
| `f.originalZeit` | `String` | Nur bei `uebernehmen()`-erzeugten Fällen (`m.zeit`, z. B. `"vor 25 Min."`); bei den 3 nachgerüsteten Bestands-Seeds bewusst weggelassen — dort ist die Anfrage historisch, ein relativer „vor N Min."-Zeitstempel wäre irreführend neben Fällen, die bereits Tage im Log stehen. |
| `f.sopDone` | `Object<string,Boolean>` | Persistenter Häkchen-Zustand der SOP-Checkliste, Key `"<typ>:<f.status>:<Index>"` (z. B. `"rueckruf:Neu:0"`, typ aus `drawerAufgabenTyp(f)`). Ein Punkt gilt je Typ+Status-Stufe einzeln als erledigt — dieselbe Checkliste kann bei späterem Status erneut auftauchen (§5), und ein manuelles Umtexten der Aufgabe ohne Statuswechsel (Typ-Wechsel via `#dAufgabe`+Speichern) kollidiert nicht mit fremden Häkchen (Review-Fund). |
| `f.stammOk` | `Boolean` | `true`, sobald die Stammdaten-Zeile im rueckruf-Werkzeug bestätigt wurde. Blendet die Zeile dauerhaft aus. |

Bestehende Felder unangetastet. `f.rueckfragen` (Punkt 1) bleibt unverändert Datenquelle für den
rueckruf-Zweig, wird hier nur zusätzlich mit den SOP-Punkten in einer Liste gemischt (§5).

### 3.2 `eingang[]` — neues optionales Feld

| Feld | Typ | Bedeutung |
|---|---|---|
| `m.patient` | `{name:String\|null, alter:Number\|null}` | Nur ergänzt, wo Alter/Name **nicht** aus `m.txt` selbst regex-extrahierbar sind, aber aus dem übrigen Anfragekontext (`m.wer`) bekannt sind — s. §7 für die genaue Begründung je Eintrag. Bei den übrigen `eingang[]`-Einträgen bewusst **nicht** ergänzt, weil `fallFakten()` das Alter dort bereits direkt aus `m.txt` liest (kein doppelt gepflegtes Feld). |

---

## 4. `fallFakten(f)` — deterministische Extraktion

Neue reine Funktion, platziert direkt nach `egVollstaendigkeit()`
([index.html:4839](../../../index.html#L4839)). Nimmt wahlweise einen Fall (`f.originalTxt`) oder ein
Eingang-Objekt (`m.txt`, für die Namenskonstruktion in `uebernehmen()`, §6) — daher liest sie
`f.originalTxt||f.txt`:

```js
const KT_LABEL={pkv:"PKV",gkv:"GKV",beihilfe:"Beihilfe",selbstzahler:"Selbstzahler"};
const DIAG_LABEL={schlaganfall:"Schlaganfall","hüft-tep":"Hüft-TEP","knie-tep":"Knie-TEP",
  "herz-op":"Herz-OP",beatmung:"Beatmung",weaning:"Weaning",hirnblutung:"Hirnblutung"};

function fallAbsenderTyp(f){
  // 1) saubere Rolle direkt am Fall (statische faelle[]-Seeds wie Anna Muster) — höchste Priorität
  if(f.rolle==="Angehörige") return "Angehörige";
  if(f.rolle==="Patient selbst") return "Patient/in selbst";
  if(f.rolle==="Zuweiser") return /sozialdienst|entlassmanagement/i.test((f.quelle||"")+" "+(f.wer||""))?"Sozialdienst":"Zuweisende:r Arzt";
  // 2) Fallback über wer/Text — nötig für Eingang-Objekte UND für uebernehmen()-erzeugte Fälle,
  //    deren f.rolle bis heute hart "offen" ist (index.html:4914) und nie in eine der obigen
  //    drei Kategorien fällt (bekannter Bestandszustand, hier bewusst nicht angefasst, s. §9).
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

  // eigenes, volleres Muster — NICHT identisch mit erkenneSignale()s fristMatch (index.html:4807):
  // dessen "entlassung\s+(?:am\s+)?([\wäöü.]+)" matcht bei "Entlassung in 4 Tagen" nur "Entlassung in"
  // (Tage-Zahl geht verloren), hier deshalb die Tage-Varianten bewusst vor die generische gestellt.
  const fristM=/entlassung\s+in\s+\d+\s+tagen|entlassung\s+am\s+[\wäöü.]+|übernahme\s+in\s+\d+\s+tagen|in\s+\d+\s+tagen|dringend|möglichst schnell/i.exec(txt);
  if(fristM) out.push({typ:"frist",text:fristM[0]});

  const absender=fallAbsenderTyp(f);
  if(absender) out.push({typ:"absender",text:absender});

  return out; // fehlende Fakten werden einfach nicht gepusht — keine leeren Chips
}
```

### 4.1 Gegen echte + synthetische Seed-Texte getestet (Node, siehe §9)

| Quelle | Text | Ergebnis `fallFakten()` |
|---|---|---|
| `eingang[101].txt` | „Nummer notiert, möchte Rückruf heute. Vermutlich PKV." (+`m.patient.alter=72`) | `72 J.` · `Innere` · `PKV` · `Angehörige` |
| `eingang[102].txt` | „Patient (68), PKV, Entlassung in 4 Tagen. Unterlagen anbei." | `68 J.` · `Neurologie` · `PKV` · `Entlassung in 4 Tagen` · `Sozialdienst` |
| `eingang[103].txt` | „Interessiert an Suite, fragt nach Preisen und freien Terminen." (+`m.patient.alter=55`) | `55 J.` · `SalutoCare` · `Patient/in selbst` |
| `eingang[109].txt` | „Patient (66), GKV, Entlassung in 5 Tagen. Unterlagen vollständig beigefügt." | `66 J.` · `Orthopädie` · `GKV` · `Entlassung in 5 Tagen` · `Sozialdienst` |
| `eingang[110].txt` | „Patientin (81), Beihilfe, Übernahme in 6 Tagen möglich." | `81 J.` · `Geriatrie` · `Beihilfe` · `Übernahme in 6 Tagen` · `Sozialdienst` |
| neu `faelle[0].originalTxt` (Anna Muster, §7) | s. §7 | `67 J.` · `Schlaganfall` · `PKV` · `möglichst schnell` · `Angehörige` |
| neu `faelle[1].originalTxt` (Maria Probst, §7) | s. §7 | `58 J.` · `Hüft-TEP` · `Selbstzahler` · `möglichst schnell` · `Patient/in selbst` |
| neu `faelle[4].originalTxt` (Ruth Winkler, §7) | s. §7 | `77 J.` · `Schlaganfall` · `PKV` · `möglichst schnell` · `Angehörige` |

Namenskonstruktion (§6) auf denselben `eingang[]`-Objekten (`m` statt `f`):

| `m.id` | `fallNameAusFakten(m)` |
|---|---|
| 101 | `Patient/Patientin (72) · Innere` |
| 102 | `Patient/Patientin (68) · Neurologie` |
| 103 | `Patient/Patientin (55) · SalutoCare` |
| 109 | `Patient/Patientin (66) · Orthopädie` |
| 110 | `Patient/Patientin (81) · Geriatrie` |

Alle 8 Fälle + 5 Namenskonstruktionen liefen unverändert durch ein Node-Testskript (kein Teil der App,
nur Verifikation vor dieser Spec) — 0 Abweichungen zur Tabelle oben.

---

## 5. `SOP_CHECKLISTE` + gemischte Checkliste

```js
const SOP_CHECKLISTE={
  rueckruf:["Erreichbarkeit & Rückrufzeit klären","Bedarf & Situation verstehen","Nächste Schritte ankündigen"],
  kosten:["Kostenträger-Kontakt prüfen","Zusage-Frist notieren"],
  angebot:["Zimmerkategorie passend zu Sternen wählen","Anreise-Optionen nennen"]
  // unterlagen/anreise: bewusst kein Eintrag — deren bestehende Checklisten (u1–u4-Checkboxen bzw.
  // die 3 Anreise-Punkte) bleiben unverändert das Werkzeug, keine Dopplung.
};
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

Reihenfolge im rueckruf-Zweig: Rückfragen (aus der Anfrage, getaggt) zuerst, SOP-Punkte danach — wie
gefordert „in EINER Liste gemischt". `.egt-check-item` ([index.html:3110](../../../index.html#L3110),
Punkt 1) wird als Zeilen-Stil wiederverwendet (Flex-Row/Padding/Border passen unverändert auf ein
`<label>` mit Checkbox statt der ursprünglichen Div-Struktur; die dortigen `.ok`/`.missing`-Modifier
greifen hier einfach nicht, da diese Klassen nicht gesetzt werden — harmlos).

---

## 6. `uebernehmen()` — Diff

Aktueller Stand ([index.html:4907-4923](../../../index.html#L4907)):

```js
function uebernehmen(id,owner){
  const m=eingang.find(x=>x.id===id);if(!m||m.done)return;
  owner=owner||TEAM[0];
  m.done=true;
  const fid=Math.max(...faelle.map(x=>x.id))+1;
  const _log=[[dstr(0),"Aus Eingang übernommen ("+m.kanal+"): "+m.tit+" — zugewiesen an "+owner]];
  if(m.hinweis)_log.push([dstr(0),"[Hinweis bei Zuordnung] "+m.hinweis]);
  faelle.push({id:fid,name:"Neuer Fall (aus Eingang)",alter:null,rolle:"offen",kanal:m.kanal,quelle:m.tit.split(":")[1]?m.tit.split(":")[1].trim():m.kanal,
    achse:m.achse,kt:"Unklar",status:"Neu",owner:owner,aufgabe:STATUS_AUFGABE["Neu"],frist:dstr(0),
    saluto:m.saluto===true,zuordnungsHinweis:m.hinweis||"",
    sterne:m.sterne!=null?m.sterne:sterneAusSignal(erkenneSignale(m.txt)),
    rueckfragen:egVollstaendigkeit(m).filter(c=>!c.ok).map(c=>({frage:c.frage,done:false})),
    docs:[false,false,false,false],kosten:"offen",consent:"offen",verlust:"",reaktion:null,
    log:_log});
  m.fallId=fid;
  renderAll();openDetail(fid);
}
```

Neu (additiv, nur `name`/`alter`-Zeile geändert + drei neue Felder):

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

`f.rolle` bleibt `"offen"` (unverändert, außerhalb des Zuschnitts dieser Spec — `fallAbsenderTyp()`
kompensiert das über den `wer`/Text-Fallback, §4).

### 6.1 Notwendiger Begleit-Fix in `renderFallakte()` (Kopfzeile, Duplikat-Alter vermeiden)

`document.getElementById("faName").textContent=f.name+(f.alter?" ("+f.alter+")":"");`
([index.html:6915](../../../index.html#L6915)) hängt bei **jedem** Fall zusätzlich `" (Alter)"` an
`f.name` an. Der neu konstruierte Name enthält das Alter aber bereits in Klammern
(„Patient/Patientin (72) · Innere") — ohne Anpassung stünde dort „… (72) · Innere (72)". Minimal-Fix
(eine Zeile, wirkt nur, wenn der Name bereits eine „(Zahl)"-Klammer enthält; alle 8 bestehenden
Namen wie „Anna Muster" enthalten so ein Muster nie, ihr Verhalten ändert sich also nicht):

```diff
-  document.getElementById("faName").textContent=f.name+(f.alter?" ("+f.alter+")":"");
+  document.getElementById("faName").textContent=f.name+(f.alter&&!/\(\d+\)/.test(f.name)?" ("+f.alter+")":"");
```

**Zweite Fundstelle (Review-Fund, gleiche Guard-Bedingung):** die Board-Karte in `makeBoardCol()`
([index.html:4984](../../../index.html#L4984)) verkettet Name+Alter nach demselben Muster
(`escapeHtml(x.name)+" <span class='alter'>"+(x.alter?"("+x.alter+")":"")`). Ohne Guard zeigt das
Board für übernommene Fälle mit konstruiertem Namen (ids 101/103) „Patient/Patientin (72) · Innere (72)".
Fix analog:

```diff
-  ...+(x.alter?"("+x.alter+")":"")...
+  ...+(x.alter&&!/\(\d+\)/.test(x.name)?"("+x.alter+")":"")...
```

---

## 7. Bestands-Seeds — `originalTxt` an 3 `faelle[]`-Einträgen

Additiv an bestehende Objekte angehängt (keine Feld-Löschung, keine Umbenennung). Ausgewählt: Anna
Muster (rueckruf-Zweig, Pflichtszenario laut Vorgabe), Maria Probst (angebot-Zweig, zeigt die
Kontext-Spalten-Platzierung) und Ruth Winkler (anreise-Zweig, zweite Kontext-Spalten-Probe).

| id | Fall | Ergänzung (Zeile [index.html:4253](../../../index.html#L4253) / [4254](../../../index.html#L4254) / [4257](../../../index.html#L4257)) |
|---|---|---|
| 1 | Anna Muster | `,originalTxt:"Guten Tag, hier meldet sich der Sozialdienst des RHÖN Campus Bad Neustadt. Unsere Patientin Anna Muster (67) ist nach einem Schlaganfall bei uns in der Neurologie, PKV-versichert, und soll möglichst schnell zur AHB. Die Tochter organisiert die Aufnahme und bittet um Rückruf.",originalKanal:"Zuweiser direkt"` |
| 3 | Maria Probst | `,originalTxt:"Hallo, ich interessiere mich für eine Reha nach meiner Hüft-TEP. Ich bin Selbstzahlerin (58 Jahre) und möchte gerne ein Komfortzimmer, am liebsten möglichst schnell einen Termin.",originalKanal:"Website-Formular"` |
| 9 | Ruth Winkler | `,originalTxt:"Guten Tag, ich rufe für meine Mutter an, die auf der Station 2 Nord im UKW Würzburg liegt. Sie ist 77 Jahre alt, PKV-versichert, und soll nach einem Schlaganfall zu Ihnen in die Neuro-Reha. Wir bräuchten möglichst schnell einen Platz, am besten mit Privatzimmer.",originalKanal:"Telefon"` |

Alle drei Texte sind neu formuliert (synthetisch, konsistent zu den bereits vorhandenen Feldern
`kanal`/`quelle`/`achse`/`kt`/`log` dieser Fälle), keine bestehende Zeile wird überschrieben.

### 7.1 `eingang[]` — `m.patient` an 2 Einträgen

Nur dort, wo `fallFakten()` das Alter **nicht** aus `m.txt` selbst lesen kann (Alter steht nur in
`m.wer`, s. §4.1-Tabelle: 102/109/110 brauchen das Feld nicht, ihr `txt` enthält die Zahl bereits):

| id | Ergänzung (Zeile [index.html:4284](../../../index.html#L4284) / [4286](../../../index.html#L4286)) |
|---|---|
| 101 | `,patient:{name:null,alter:72}` |
| 103 | `,patient:{name:null,alter:55}` |

---

## 8. UI-Spezifikation (neuer Namespace `.fkw-*`)

### 8.1 `dArbeitHtml()` — vollständige Neufassung ([index.html:6202-6238](../../../index.html#L6202))

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
   // unverändert ab hier (u1–u4-Checkboxen + "Fehlende anfordern"-Button, index.html:6209-6215) —
   // nur "fakten+" neu vorangestellt, SOP hier bewusst nicht dupliziert (§5).
   return fakten+"<div class='full'><label>Unterlagen …</label>…</div>";
 if(typ==="angebot")
   // unverändert ab hier (Antwort-Formular, index.html:6217-6220) — "fakten+" und
   // "sopChecklisteHtml(f,'angebot')+" neu vorangestellt.
   return fakten+sopChecklisteHtml(f,"angebot")+"<div class='komm-block'>…</div>";
 if(typ==="anreise")
   // unverändert ab hier (3 Checkboxen, index.html:6222-6225) — nur "fakten+" neu vorangestellt.
   return fakten+"<div class='kicker'>Anreise-Checkliste</div>…";
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

**Kernänderung gegenüber heute:** der rueckruf-Zweig greift jetzt bei **jedem** `typ==="rueckruf"`, nicht
mehr nur wenn `f.rueckfragen.length>0` — das behebt exakt das Anna-Muster-Problem aus §1 (ihr Fall hat
kein `rueckfragen`-Feld, bekommt aber jetzt trotzdem Stammdaten-Zeile + Original + SOP-Checkliste).
`egRueckfrageToggle()` ([index.html:6239](../../../index.html#L6239)) bleibt namensgleich bestehen, wird
jetzt aus `sopChecklisteHtml()` heraus aufgerufen statt aus dem alten `.egt-rueckfragen`-Markup direkt.

### 8.2 Neue Helper-Funktionen (platziert direkt vor `dArbeitHtml()`, [index.html:6202](../../../index.html#L6202))

```js
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

Reihenfolge im rueckruf-Zweig (chips → Stammdaten → Original → Checkliste → Notiz-Feld) ist eine
Design-Entscheidung dieser Spec (vom Nutzer nicht bis auf diese Feinheit spezifiziert): Identität zuerst
bestätigen, dann Kontext lesen, dann handeln.

### 8.3 Kontext-Spalte — neues Kapitel „Originalanfrage" (`#faOriginalChap`)

Additiv in `.fk-col-kontext`, direkt nach dem Übersicht-Kapitel
([index.html:4122-4125](../../../index.html#L4122), vor „Medizinische Kurzfelder"):

```html
<div class="chap" id="faOriginalChap" style="display:none">
  <h2 class="chap-h2">Originalanfrage</h2>
  <div id="faOriginal"></div>
</div>
```

In `renderFallakte()` ([index.html:6931](../../../index.html#L6931), direkt nach der bestehenden
`dArbeit`-Zeile ergänzt):

```js
document.getElementById("dArbeit").innerHTML=dArbeitHtml(f);
const _zeigeOriginalInKontext=f.originalTxt&&drawerAufgabenTyp(f)!=="rueckruf";
document.getElementById("faOriginalChap").style.display=_zeigeOriginalInKontext?"":"none";
if(_zeigeOriginalInKontext) document.getElementById("faOriginal").innerHTML=fkwOriginalHtml(f);
```

Bedingung ist `drawerAufgabenTyp(f)!=="rueckruf"` (nicht ein Status-Name) — das deckt sich in der Praxis
mit „ab Status Unterlagen", weil `STATUS_AUFGABE`s Text ab „Kontaktiert" nie wieder das rueckruf-Muster
matcht (Ausnahme: `pruefeUpsell()` überschreibt `f.aufgabe` auch schon ab „Neu" auf „Komfort-Upgrade
anbieten" → dann sofort `allgemein`, Original wandert entsprechend sofort in die Kontext-Spalte — korrektes
Verhalten, kein Sonderfall nötig).

### 8.4 `advanceFallStatus()` — Diff ([index.html:6296-6306](../../../index.html#L6296))

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

Der neue Log-Eintrag entsteht **vor** dem Status-Wechsel-Eintrag (liest sich chronologisch: erst die
Punkte, dann der Sprung), nutzt `f.status` (noch der alte Wert an dieser Stelle) für den `sopDone`-Key —
identisch zu dem, was beim Rendern der Checkliste verwendet wurde.

### 8.5 CSS (neuer Block vor `</style>`, [index.html:3147](../../../index.html#L3147))

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

---

## 9. Abnahmekriterien (Browser-Checks)

1. **Anna-Muster-Szenario (Pflicht):** `mtEnter()` → „Was jetzt dran ist" → Rückruf-Aufgabe anklicken →
   `openFallakte(1)`. `#dArbeit` zeigt: Chip-Zeile `67 J.` · `Schlaganfall` · `PKV` · `Angehörige`;
   „Stammdaten bestätigen"-Zeile (Name/Alter vorbefüllt); zugeklappt „Originalnachricht · Zuweiser
   direkt" (aufklappen zeigt `originalTxt`); 3 SOP-Checkboxen ohne „aus der Anfrage"-Tags (kein
   `f.rueckfragen` an diesem Fall).
2. **SOP-Persistenz + Log:** 2 von 3 SOP-Punkten anhaken → „nächster Schritt" klicken → `f.status`
   „Kontaktiert", `f.log` bekommt „Erledigt: …" mit genau den 2 Labels **vor** der Status-Zeile. Neu
   geöffnet: alte Häkchen bleiben am Objekt (anderer Key), erscheinen aber nicht mehr (neue Aufgabe =
   `allgemein`, kein `SOP_CHECKLISTE`-Eintrag).
3. **Stammdaten-Bestätigung:** Name auf „Anna Musterhausen" ändern, „Bestätigen" → `#faName` sofort
   „Anna Musterhausen (67)"; Zeile verschwindet; Log „Stammdaten im Erstkontakt bestätigt"; Board zeigt
   neuen Namen ebenso.
4. **Originalanfrage in Kontext-Spalte:** Maria Probst (id 3, Typ „angebot") öffnen → Chip-Zeile + 2
   SOP-Punkte + Antwort-Formular, **kein** Original inline; Kontext-Spalte zeigt neues Kapitel
   „Originalanfrage" unter „Übersicht". Ruth Winkler (id 9, Typ „anreise") analog, Checkliste dabei
   unverändert (3 alte Punkte).
5. **Kein Original ohne Originaltext:** Heinz Vogel (id 6) öffnen → kein Original-Block irgendwo,
   `#faOriginalChap` bleibt `display:none`, keine leere Chip-Zeile.
6. **Sprechender Name aus dem Eingang:** id 101 freigeben (Gruppe „Neuro-Geri") → im Pool übernehmen →
   Fallakte-Kopf „Patient/Patientin (72) · Innere" statt „Neuer Fall (aus Eingang)"; Checkliste zeigt
   die aus Punkt 1 übernommenen Rückfragen zuerst (getaggt), danach die 3 SOP-Punkte.
7. **Kein Doppel-Alter im Kopf:** Fall aus Punkt 6 zeigt genau „Patient/Patientin (72) · Innere", nicht
   „… (72) · Innere (72)"; Anna Muster bleibt unverändert „Anna Muster (67)".
8. **Mobile (390px):** 1–7 wiederholt — Chip-Zeile umbricht, Stammdaten-Zeile stapelt, kein horizontaler
   Überlauf, Checkboxen bedienbar.
9. **0 Console-Errors**, beide Breiten.
10. **Unberührte Bereiche:** `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `#refOverlay`, `renderTeam()`,
    `.egt-sterne`/`.egt-check`/`.egt-groups`/`.egt-verteilt` aus Punkt 1; genau 9 `@keyframes`.

---

## 10. Zu entfernende/obsolete Symbole

- **CSS `.egt-rueckfragen`** ([index.html:3144-3146](../../../index.html#L3144), aus Punkt 1 §7.9):
  wird durch diese Spec **vollständig unbenutzt** — der einzige Verwender war der alte, jetzt ersetzte
  rueckruf-Zweig in `dArbeitHtml()`, der `class='egt-rueckfragen'` erzeugte. Ersetzt durch die
  generischere `.fkw-check` (§8.5, jetzt auch für kosten/angebot verwendet, nicht mehr rueckruf-
  exklusiv). Regel entfernen.
- Keine JS-Funktion wird obsolet — `egRueckfrageToggle()` bleibt aktiv genutzt (§8.1).

---

## 11. Nicht-Ziele (vom Nutzer abgewählt/verschoben)

- Keine vorbefüllten Antwort-Entwürfe (Textarea bleibt leer wie bisher).
- Keine automatische Eskalation/Fristen-Automatik über `pruefeUpsell()`/`STATUS_AUFGABE` hinaus.
- Kein „Punkt-8-Vollausbau" (weiterer Koordinations-/Fallakten-Ausbau bleibt einer künftigen Spec
  vorbehalten).
- Team-Statistiken (Punkt 3, `renderTeam()`) unberührt.
- `f.rolle:"offen"` bei `uebernehmen()`-erzeugten Fällen wird **nicht** korrigiert (§4, §6) — außerhalb
  des Zuschnitts dieser Spec, `fallAbsenderTyp()` kompensiert deterministisch über `wer`/Text.

---

## 12. Verifizierte Code-Anker (gelesen vor dieser Spec)

`uebernehmen()` [4907-4923](../../../index.html#L4907) · `dArbeitHtml()`/`drawerAufgabenTyp()`
[6202](../../../index.html#L6202)/[6193](../../../index.html#L6193) · `egRueckfrageToggle()`
[6239](../../../index.html#L6239) · `renderFallakte()`/`.fk-cols`/`.fk-col-kontext`
[6910](../../../index.html#L6910)/[2976-2983](../../../index.html#L2976)/[4117-4138](../../../index.html#L4117) ·
`STATUS`/`STATUS_AUFGABE`/`advanceFallStatus()` [4219-4226](../../../index.html#L4219)/[6296](../../../index.html#L6296) ·
`erkenneSignale()`/`egVollstaendigkeit()`/`klassifiziereEingang()`
[4798](../../../index.html#L4798)/[4827](../../../index.html#L4827)/[4842](../../../index.html#L4842) ·
`faelle[]`-Seeds (Anna Muster/Maria Probst/Ruth Winkler) [4253-4257](../../../index.html#L4253) ·
`eingang[]`-Seeds (101/102/103/109/110) [4284-4293](../../../index.html#L4284) ·
`TEAM_ACHSE`/`GRUPPEN`/`achseZuGruppe()` [4375-4385](../../../index.html#L4375) ·
`escapeHtml()` [4750](../../../index.html#L4750) ·
`.eg-original`/`.pa-fold`/`summary.rk` [3051-3052](../../../index.html#L3051)/[3060-3062](../../../index.html#L3060)/[3016-3017](../../../index.html#L3016) ·
`.egt-check-item` [3110](../../../index.html#L3110) ·
`.egt-rueckfragen` (obsolet, §10) [3144-3146](../../../index.html#L3144) ·
CSS-Einfügepunkt vor `</style>` [3147](../../../index.html#L3147) ·
`MT_NOTIZ_LABEL` [6411](../../../index.html#L6411) ·
`openFallakte()`/`aktuellerFall` [6898](../../../index.html#L6898)/[4736](../../../index.html#L4736) ·
9 `@keyframes`-Blöcke bestätigt (`grep -c` vor dieser Spec: 9), keine neue hinzugefügt.
