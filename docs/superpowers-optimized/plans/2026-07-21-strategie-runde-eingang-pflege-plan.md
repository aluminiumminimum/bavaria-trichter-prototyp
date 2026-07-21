# Strategie-Runde: Eingang, Patienten-/Zuweiserpflege — Umsetzungsplan

> **Für ausführende Agenten:** Ausführung erfolgt per direktem Agent-Tool-Dispatch an `claude-implementer` (Haiku, Standard-Lane) bzw. `claude-implementer-pro` (Sonnet, nur für Tasks, die als **Lane: pro** markiert sind) — kein separates Ausführungs-Skill nötig, das ist das in diesem Projekt etablierte Muster (siehe `HANDOVER.md`). Checkboxen (`- [ ]`) zur Fortschritts-Verfolgung.

**Ziel:** Die vier Strategiefelder aus dem Spec (Eingang, Patientenpflege-Prozess, Zuweiserpflege, Datensparsamkeit) in `index.html` umsetzen — reine Demo-Erweiterung, kein Backend.

**Architektur:** Additive Erweiterung des bestehenden self-contained `index.html`. Eine Verhaltensänderung an bestehendem Code ist bewusst eingeschlossen (`simulateInbound()`, siehe Task 1.4) — alles andere additiv (neue Funktionen, neue Felder auf geteilten Arrays, neue CSS-Blöcke vor `</style>`).

**Tech-Stack:** Vanilla HTML/CSS/JS, keine Frameworks, kein Build, kein Test-Runner. "Test" bedeutet in diesem Projekt: Browser-Verifikation via `mcp__Claude_Browser__*`-Tools bei 390px und 1440px + Konsole prüfen — es gibt keine Unit-Tests.

**Spec:** `docs/superpowers-optimized/specs/2026-07-21-strategie-runde-eingang-pflege-design.md` (Approved nach Review)

---

## Standard-Verifikation (referenziert von jedem Task statt wiederholt)

Nach jeder Implementierung, bevor committet wird:

1. `preview_start` mit `{name: "bavaria-proto"}` (falls nicht schon offen), `navigate` zur betroffenen Ansicht (Hash, z. B. `#heute`, `#faelle/board`, `#netzwerk/zuweiser`).
2. `resize_window` auf 1440×900 (Desktop) → `read_console_messages` (`onlyErrors:true`, erwartet: leer) → `computer{action:"screenshot"}` zur Sichtprüfung.
3. `resize_window` auf 390×812 (Mobile) → gleiche Prüfung + `javascript_tool`: `document.scrollingElement.scrollWidth <= document.scrollingElement.clientWidth` (erwartet: `true`, kein horizontaler Overflow).
4. `read_console_messages` ohne Filter — erwartet: keine neuen Fehler/Warnungen außer der bereits bestehenden `paAssert()`-Warnung (falls unverändert).
5. Cofounder-Bereiche stichprobenartig prüfen, wenn der Task geteilte Arrays (`inReha[]`, `personen[]`, `zuweiser[]`) berührt: `openReferrer('portal','Leopoldina-Krankenhaus')` öffnet weiterhin `#refOverlay`; Matrix (`go('konzept','matrix')`) rendert weiterhin 2×3-Grid.

**Nicht anfassen (harte Regel):** `.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`, Funktionen `openReferrer`/`closeReferrer`, `#refOverlay`. Geteilte Arrays (`inReha[]`, `personen[]`, `zuweiser[]`, `faelle[]`) nur um neue Felder erweitern, nie bestehende umbenennen/entfernen.

---

## Phase 1 — Bereich B: Eingangs-Personen-Pipeline

Baut die Grundlage, auf der Phase 4 und 5 aufsetzen. Nach dieser Phase alleine bereits vorführbar: Freitext eintippen → Signale erkannt → Person/Fall korrekt geroutet.

### Task 1.1: Signal-Erkennungs-Funktion `erkenneSignale(text)`

**Lane: claude-implementer-pro** (reine Logik, aber Korrektheit der Heuristik ist entscheidend für alles Nachgelagerte)

**Files:**
- Modify: `index.html` — neue Funktion einfügen direkt vor `function simulateInbound(){` (aktuell Zeile 4370; Zeile kann sich durch vorherige Edits verschoben haben, per Suche nach `function simulateInbound` lokalisieren)

- [ ] **Schritt 1:** Funktion schreiben, reine Logik ohne DOM-Zugriff:

```js
/* §2.1 Signal-Erkennung — Bereich B */
function erkenneSignale(text){
  const s=String(text||"");
  const premium=/salutocare|selbstzahler|suite|premium/i.test(s);
  let kt=null;
  if(/\bpkv\b/i.test(s))kt="PKV";
  else if(/\bgkv\b/i.test(s))kt="GKV";
  else if(/beihilfe/i.test(s))kt="Beihilfe";
  const absage=/keine? interesse|widerruf|abgesagt|kein bedarf/i.test(s);
  const alterMatch=/\b(\d{1,3})\s*(?:jahre|j\.|\))/i.exec(s);
  const fristMatch=/entlassung\s+(?:am\s+)?([\wäöü.]+)|in\s+(\d+)\s+tagen|dringend|möglichst schnell/i.exec(s);
  const konkret=!!(alterMatch||fristMatch||kt);
  return {
    premium:premium,
    kostentraeger:kt,
    absage:absage,
    konkret:!absage&&konkret,
    dringlichkeit:fristMatch?fristMatch[0]:null
  };
}
```

- [ ] **Schritt 2:** In der Browser-Konsole manuell verifizieren (kein Test-Runner vorhanden):

```js
erkenneSignale("Anruf: Tochter fragt für Vater (79) nach SalutoCare-Suite, Entlassung Freitag, PKV.")
// erwartet: {premium:true, kostentraeger:"PKV", absage:false, konkret:true, dringlichkeit:"Entlassung Freitag" (oder ähnlich)}
erkenneSignale("Habt ihr noch Betten frei?")
// erwartet: {premium:false, kostentraeger:null, absage:false, konkret:false, dringlichkeit:null}
erkenneSignale("Keine Interesse mehr, bitte nicht mehr kontaktieren")
// erwartet: absage:true, konkret:false
```

- [ ] **Schritt 3:** Standard-Verifikation (siehe oben) — reine Funktionsergänzung, keine UI-Änderung, daher nur Konsole/keine neuen Errors prüfen.
- [ ] **Schritt 4:** Commit: `git add index.html && git commit -m "feat(eingang): Signal-Erkennung erkenneSignale() — §2.1"`

---

### Task 1.2: Identifizierbarkeits-Gate + Personen-Abgleich

**Lane: claude-implementer-pro** (berührt bestehende `istEinzelperson()`/`pNew()`-Konventionen, Korrektheit hier verhindert Dubletten)

**Files:**
- Modify: `index.html` — neue Funktion `findeOderErstellePerson(name, kontakt)` nahe `pNew()` (Zeile ~4258)

**Kontext (bereits vorhanden, nicht anfassen):** `istEinzelperson(name)` (Zeile 4266) filtert Sammelnamen bereits aus. `personen[]`-Array hat `kontakt:{tel,mail}`.

- [ ] **Schritt 1:** Funktion schreiben, die vor jeder neuen Personen-Erstellung einen Abgleich versucht:

```js
/* §2.2 Personen-Abgleich — Bereich B. Gibt {pid, neu:bool} zurück, oder null wenn nicht identifizierbar. */
function findeOderErstellePerson(name,kontakt,teil){
  if(!istEinzelperson(name))return null;
  kontakt=kontakt||{};
  const treffer=personen.find(p=>
    (kontakt.tel&&p.kontakt.tel&&p.kontakt.tel===kontakt.tel)||
    (kontakt.mail&&p.kontakt.mail&&p.kontakt.mail===kontakt.mail)||
    p.name.toLowerCase()===String(name||"").toLowerCase());
  if(treffer)return{pid:treffer.pid,neu:false};
  const pid=pNew(name,Object.assign({kontakt:Object.assign({tel:"",mail:""},kontakt)},teil||{}));
  return{pid:pid,neu:true};
}
```

- [ ] **Schritt 2:** Konsole verifizieren: `findeOderErstellePerson("Anna Muster",{})` sollte den bestehenden Datensatz P01 treffen (`neu:false`); `findeOderErstellePerson("Ganz Neu Niemand",{})` erstellt einen neuen Eintrag (`neu:true`).
- [ ] **Schritt 3:** Standard-Verifikation.
- [ ] **Schritt 4:** Commit: `git commit -m "feat(eingang): Personen-Abgleich findeOderErstellePerson() — §2.2"`

---

### Task 1.3: Sterne-Ableitung aus Signalen

**Lane: claude-implementer** (mechanisches Mapping, Logik bereits in Task 1.1/1.2 vorbereitet)

**Files:**
- Modify: `index.html` — neue Funktion nahe `erkenneSignale`

- [ ] **Schritt 1:**

```js
/* §2.2 Sterne-Ableitung aus Signalen — Bereich B */
function sterneAusSignal(sig){
  if(sig.absage)return 1;
  if(sig.konkret)return sig.premium?4:3;
  return 2;
}
```

- [ ] **Schritt 2:** Konsole: `sterneAusSignal(erkenneSignale("Keine Interesse"))` → `1`; `sterneAusSignal(erkenneSignale("Anruf: SalutoCare-Suite, Entlassung Freitag, PKV, 79 Jahre"))` → `4`; `sterneAusSignal(erkenneSignale("Habt ihr noch Betten frei?"))` → `2`.
- [ ] **Schritt 3:** Standard-Verifikation.
- [ ] **Schritt 4:** Commit: `git commit -m "feat(eingang): Sterne-Ableitung sterneAusSignal() — §2.2"`

---

### Task 1.4: `simulateInbound()` umbauen — Fall-Schwelle (Verhaltensänderung, mit Nutzer abgestimmt)

**Lane: claude-implementer-pro** (Verhaltensänderung an bestehender, funktionierender Demo-Funktion — höchstes Risiko in Phase 1)

**Files:**
- Modify: `index.html:4370-4389` (Funktion `simulateInbound()` — exakte Zeilen können sich verschoben haben, per Funktionsnamen suchen)

**Kontext:** Heute erstellt diese Funktion **immer** einen Fall (Zeile 4381), Person nur wenn `t.einzelperson`. Ziel: Fall nur noch bei Sterne ≥3.

- [ ] **Schritt 1:** Aktuelle Funktion lesen (Suche `function simulateInbound`), Struktur verstehen (Timeout-Callback, `INBOUND_POOL`, Toast-Aufrufe).
- [ ] **Schritt 2:** Umbau — Signal-Erkennung + Sterne-Ableitung laufen zuerst, Fall-Push wird bedingt:

```js
function simulateInbound(){
 const t=INBOUND_POOL[_inbN%INBOUND_POOL.length];_inbN++;
 const mid=_inbId++;
 eingang.unshift({id:mid,kanal:t.kanal,tit:t.tit,txt:t.txt,zeit:"gerade eben",achse:t.achse,done:false,typ:"qualifiziert",_neu:true});
 renderEingang();
 inbToast("in","<b>Neue Anfrage</b> über "+escapeHtml(t.kanal),"landet im Eingang — wird automatisch verarbeitet …",null);
 setTimeout(()=>{
  const m=eingang.find(x=>x.id===mid); if(m){m.done=true;m._neu=false;}
  const sig=erkenneSignale(t.txt);
  const sterne=sterneAusSignal(sig);
  let _pid=null;
  if(t.einzelperson){
    const r=findeOderErstellePerson(t.name,{},{kt:t.kt==="Privat"?"PKV":t.kt,sterne:sterne,sterneGrund:"Automatisch aus Eingangssignal: "+(sig.konkret?"konkrete Anfrage":"schwaches Signal")});
    if(r){_pid=r.pid;pHist(_pid,"anfrage","Anfrage über "+t.kanal+" ("+t.quelle+")");}
  }
  if(sterne>=3){
    const fid=Math.max(0,...faelle.map(x=>x.id))+1;
    faelle.push({id:fid,personId:_pid,name:t.name,alter:t.alter,rolle:t.rolle,kanal:t.kanal,quelle:t.quelle,achse:t.achse,kt:t.kt,
      status:"Neu",owner:"S. Koordination",aufgabe:"Erstreaktion",frist:dstr(0),saluto:t.achse==="SalutoCare",
      docs:[false,false,false,false],kosten:"offen",consent:"offen",verlust:"",reaktion:null,
      log:[[dstr(0),"Automatisch als Fall angelegt aus "+t.kanal+": "+t.txt]]});
    if(m)m.fallId=fid;
    if(_pid)pHist(_pid,"fall","Automatisch als Fall angelegt");
    renderAll();
    inbToast("done","<b>Automatisch als Fall angelegt</b>",escapeHtml(t.name)+" · "+escapeHtml(t.achse)+" · "+escapeHtml(t.kanal),fid);
  } else {
    renderAll();
    inbToast("done","<b>Als Kontakt gespeichert</b> (schwaches Signal, kein Fall)",escapeHtml(t.name)+" · "+sterne+"★",null);
  }
 },1600);
}
```

- [ ] **Schritt 3:** Manuell in der App verifizieren: `simulateInbound()` mehrfach über die Konsole aufrufen (oder den bestehenden "⚡ Anfrage simulieren"-Button mehrfach klicken) und prüfen, dass mind. ein Durchlauf mit schwachem Signal **keinen** neuen Fall im Board erzeugt, aber eine neue Person in Netzwerk→Kontakte auftaucht.
- [ ] **Schritt 4:** Standard-Verifikation — **zusätzlich** prüfen: `paAssert()`-Konsolen-Check bleibt sauber (keine `personId`-Verweise ins Leere).
- [ ] **Schritt 5:** Commit: `git commit -m "fix(eingang): Fall-Schwelle in simulateInbound() — Fall nur ab 3★ (Verhaltensänderung §2.3)"`

---

### Task 1.5: Signal-Chips-UI in der manuellen Schnellerfassung

**Lane: claude-implementer** (reines UI-Wiring auf bereits fertiger Logik aus 1.1–1.3)

**Files:**
- Modify: `index.html` — Eingangs-Erfassungs-UI (Suche nach `renderEingang`/Eingang-Formular-Markup)
- Neue CSS-Klasse `.sig-chip` additiv vor `</style>`

- [ ] **Schritt 1:** Prüfen, ob ein manuelles Freitext-Erfassungsfeld für Personal bereits existiert (z. B. ein "Neue Anfrage erfassen"-Formular) oder ob es als Teil dieses Tasks neu ergänzt werden muss — falls kein bestehendes Formular auffindbar, ein minimales Textarea + "Erfassen"-Button in der Eingang-Ansicht ergänzen (kein Modal, additiv in `#inbox`-Bereich).
- [ ] **Schritt 2:** Bei Texteingabe (oninput, debounced ~300ms) `erkenneSignale()` aufrufen, erkannte Punkte als Chips rendern:

```html
<span class="sig-chip" data-feld="premium">⚡ Premium-Signal</span>
```

Klick auf einen Chip übernimmt den Wert in ein verstecktes Formularfeld (kein automatisches Submit).

- [ ] **Schritt 3:** CSS additiv:

```css
/* §2.1 Signal-Chips — Bereich B */
.sig-chip{border:1px dashed var(--brass-line);border-radius:20px;padding:4px 10px;font-size:13px;cursor:pointer;display:inline-block;margin:2px}
.sig-chip.on{border-style:solid;border-color:var(--brass);background:var(--brass-soft)}
```

- [ ] **Schritt 4:** Standard-Verifikation bei 390px UND 1440px (Chips müssen umbrechen, kein Overflow).
- [ ] **Schritt 5:** Commit: `git commit -m "feat(eingang): Signal-Chips-UI in Schnellerfassung — §2.1"`

---

## Phase 2 — Bereich A: Datensparsamkeit-Eingabemaske

Unabhängig von Phase 1, kann parallel laufen.

### Task 2.1: 8-Felder-Schema auf `inReha[]` erweitern

**Lane: claude-implementer**

**Files:**
- Modify: `index.html` — `inReha[]`-Objektliteral-Definitionen (Zeile ~4192), additive neue Felder pro Eintrag

- [ ] **Schritt 1:** Pro bestehendem `inReha[]`-Eintrag additiv ergänzen (bestehende Felder wie `barthel`/`fim`/`icd` NICHT anfassen):

```js
zwischenstand:{datum:null,text:null,autor:null},
rehaZiel:"", // §4.2.1
arztberichtKurz:"", // §4.2.4
drgStatus:"offen", // §4.2.5
entlassungGeplant:null, // §4.2.6
anschlussBedarf:"", // §4.2.7
auffaelligkeiten:"" // §4.2.8
```

Für die 3 bereits im Demo-Datensatz vorhandenen `inReha[]`-Einträge (Dieter Franke, Elke Sauer, Lydia Sommer) plausible Demo-Werte eintragen statt leer lassen (z. B. `rehaZiel:"Vollbelastung + selbstständiges Gehen ohne Hilfsmittel"`).

- [ ] **Schritt 2:** Konsole: `inReha.every(p=>p.hasOwnProperty("rehaZiel"))` → `true`.
- [ ] **Schritt 3:** Standard-Verifikation — **zusätzlich**: `openReferrer`/Reha-Charts-Ansicht des Cofounders unverändert prüfen (neue Felder werden dort ignoriert, nicht angezeigt — das ist erwartet).
- [ ] **Schritt 4:** Commit: `git commit -m "feat(reha): additive Datenfelder auf inReha[] — §4.2"`

---

### Task 2.2: Eingabemaske-UI im "Erfolge & Verlauf"-Bereich

**Lane: claude-implementer**

**Files:**
- Modify: `index.html` — Funktion `openRsDetail(i)` (Zeile ~5375), Bereich "Erfolge & Verlauf" (Zeile ~5390)

- [ ] **Schritt 1:** Bestehenden `openRsDetail`-Aufbau lesen (`.rs-ctitle`, `.rs-rings`, `.rs-dev`), eigene Sektion darunter ergänzen mit den 8 Feldern aus Task 2.1 als editierbares Formular (Inputs/Textareas), Speichern-Button schreibt direkt in das `inReha[]`-Objekt (kein neues globales State-Muster, folgt bestehendem Direkt-Mutation-Stil der Datei).
- [ ] **Schritt 2:** Neue CSS additiv (eigener Namespace `.rsz-*`, NICHT `.rs-*` global umstylen).
- [ ] **Schritt 3:** Standard-Verifikation bei 390px + 1440px.
- [ ] **Schritt 4:** Commit: `git commit -m "feat(reha): Eingabemaske für Zwischenstand/Abrechnung/Medizin-Kurzfelder — §4.2"`

---

### Task 2.3: Zwischenstand-Reminder + "Mein Tag"-Aufgabenliste

**Lane: claude-implementer-pro** (Datums-Diff-Logik + Einbindung in bestehenden Rollen-Schalter-Modus, ohne WS6/WS7-Bestand zu brechen)

**Files:**
- Modify: `index.html` — Aufgabenliste `function mtTodos()` (Zeile ~5760) und Rendering `function renderMeinTag()` (Zeile ~5825)

- [ ] **Schritt 1:** Funktion `zwischenstandFaellig(p)`: vergleicht `p.zwischenstand.datum` (oder `p.aufnahme`, falls noch nie gesetzt) gegen `heute`, `true` wenn > 10 Tage.
- [ ] **Schritt 2:** In `mtTodos()`/`renderMeinTag()` eine neue Aufgabenzeile pro fälligem `inReha[]`-Eintrag rendern. **Wichtig:** `mtCard()` (Zeile ~5789) verdrahtet seinen Aktions-Button heute fest auf `onclick='mtOpen(...)'`, das den generischen `mt-sheet` öffnet (nicht `openRsDetail()`) — für diesen neuen Aufgaben-Typ das bestehende `typ`-Dispatch-Muster (`MT_SCHRITTE`/`MT_LEITFAEDEN`) um einen neuen Typ "zwischenstand" erweitern, dessen Sheet-Aktions-Button `openRsDetail(i)` aufruft, statt `mtCard()` für diesen Fall zu umgehen — damit bleibt die bestehende Aufgaben-Optik/Struktur intakt. **Hinweis:** `openRsDetail(i)` erwartet einen **Array-Index** in `inReha[]` (nicht eine Personen-/Fall-ID, siehe `const p=inReha[i]` in der Funktion) — beim Bauen des neuen Aufgaben-Items den Index (z. B. `inReha.indexOf(p)`) mitführen, nicht die `personId`.
- [ ] **Schritt 3:** Farbliche Markierung als "stockt/überfällig" nutzt bestehende Zinnober-CSS-Variable (`--terra`/`--alert`, siehe Design-Tokens), keine neue Farbe einführen.
- [ ] **Schritt 4:** Standard-Verifikation, insbesondere: bestehende "Mein Tag"-Inhalte (Termine, Aufgaben aus WS7) bleiben unverändert sichtbar, neue Zeile ist additiv.
- [ ] **Schritt 5:** Commit: `git commit -m "feat(reha): Zwischenstand-Reminder in Mein-Tag-Ansicht — §4.4/§4.5"`

---

## Phase 3 — Bereich D: Zuweiserpflege

Unabhängig von Phase 1/2, kann parallel laufen. Liefert die Archiv-Struktur, die Phase 4 (Institutions-Abgleich) braucht.

### Task 3.1: Archiv-Split-Filter (faktenbasiert)

**Lane: claude-implementer**

**Files:**
- Modify: `index.html` — `function renderZuweiser()` (Zeile ~4921) und Kontakte-Äquivalent `function renderBestand()` (Zeile ~4789)

- [ ] **Schritt 1:** In `renderZuweiser()`: Standardfilter ergänzen, der nur `z.faelle>=1` zeigt; ein neuer Toggle-Button "Potenzielle anzeigen" schaltet zusätzlich `z.faelle===0` dazu (Archiv-Ansicht), ohne bestehende Filter-Logik (`zFilter`/`setZFilter`) zu entfernen — additiv kombinieren.
- [ ] **Schritt 2:** In `renderBestand()`: Standardfilter ergänzt um Ausschluss von `sterne===1` (Archiv), mit gleichem Toggle-Muster "Archiv anzeigen".
- [ ] **Schritt 3:** Standard-Verifikation — insbesondere prüfen: König-Ludwig-Haus (`faelle:1, status:"ziel"`) erscheint jetzt korrekt in der Primäransicht (siehe Spec §5.3).
- [ ] **Schritt 4:** Commit: `git commit -m "feat(netzwerk): faktenbasierte Archiv-Trennung Zuweiser+Kontakte — §5.3"`

---

### Task 3.2: Gesten-Leiter (`naechsteAktion(z)`)

**Lane: claude-implementer** (mechanisches Regel-Mapping, im Spec vollständig spezifiziert)

**Files:**
- Modify: `index.html` — neue Funktion nahe `zKategorie()` (Zeile ~4902)

- [ ] **Schritt 1:**

```js
/* §5.1 Gesten-Leiter — Bereich D */
function naechsteAktion(z){
  const drahtStark=(z.draht||"").indexOf("○")===-1;
  if(z.status==="aktiv"&&drahtStark)return"Quartalsgespräch + jährliche Geschenkbox";
  if(z.status==="aktiv"&&!drahtStark)return"⚠ Draht schwächelt trotz Aktivstatus — Kontakt suchen";
  if(z.status==="aufbau")return"Persönlicher Besuch/Kennenlern-Termin";
  return"Erstkontakt-Plan erstellen";
}
```

- [ ] **Schritt 2:** In `renderZuweiser()`-Kartenrendering: `z.next||naechsteAktion(z)` statt nur `z.next` verwenden (manueller Override bleibt möglich, Regel greift nur als Fallback/Vorschlag).
- [ ] **Schritt 3:** Standard-Verifikation.
- [ ] **Schritt 4:** Commit: `git commit -m "feat(netzwerk): Gesten-Leiter naechsteAktion() für Zuweiser — §5.1"`

---

### Task 3.3: Trend-Erkennung (Fallzahl-Verlauf)

**Lane: claude-implementer-pro** (synthetische Monats-Buckets aus Demo-Daten ableiten + Auf/Ab-Logik, mehr Design-Entscheidung als reines Mapping)

**Files:**
- Modify: `index.html` — Anlass-Engine `function anlaesse()` (Zeile ~4540)

- [ ] **Schritt 1:** Da echte monatliche Fallzahl-Historie nicht existiert, für die Demo pro Zuweiser ein plausibles 3-Monats-Array synthetisch aus vorhandenen Feldern ableiten (z. B. deterministisch aus `faelle`+Name-Hash, damit es bei jedem Render gleich bleibt — kein `Math.random()` pro Render, sonst flackert die Anzeige) und im `zuweiser[]`-Objekt als neues additives Feld `verlauf3M:[n,n,n]` ablegen (einmalig beim Laden berechnet, nicht bei jedem Render neu gewürfelt).
- [ ] **Schritt 2:** Trigger-Logik in `anlaesse()` ergänzen, analog zum bestehenden `typ:"zuweiser"`-Push (Zeile 4569):

```js
zuweiser.forEach(z=>{
  const v=z.verlauf3M;if(!v||v.length<3)return;
  if(v[2]<v[1]&&v[1]<v[0])out.push({key:"trend-ab:"+z.name,typ:"zuweiser-trend",urg:"jetzt",titel:z.name,sub:"Fallzahl 2 Monate rückläufig — Kontakt suchen",zName:z.name});
  else if(v[2]>v[1]&&v[1]>v[0])out.push({key:"trend-auf:"+z.name,typ:"zuweiser-trend",urg:"bald",titel:z.name,sub:"Fallzahl 2 Monate steigend — Dankeschön/Bestätigung",zName:z.name});
});
```

- [ ] **Schritt 3:** Standard-Verifikation, insbesondere Radar-Ansicht (Netzwerk→Radar) prüfen: neue Karten erscheinen additiv neben bestehenden Anlass-Typen, kein Layout-Bruch.
- [ ] **Schritt 4:** Commit: `git commit -m "feat(netzwerk): Trend-Erkennung Fallzahl-Verlauf im Anlass-Engine — §5.2"`

---

## Phase 4 — Bereich B (Rest): Institutions-Abgleich

Abhängig von Task 3.1 (Archiv-Struktur muss existieren).

### Task 4.1: Institutions-Abgleich gegen Zuweiser-Archiv

**Lane: claude-implementer-pro**

**Files:**
- Modify: `index.html` — Erweiterung von `findeOderErstellePerson`-Pendant für Institutionen, nahe `zKategorie()`

- [ ] **Schritt 1:** Analoge Funktion `findeOderErstelleZuweiser(name)`, die gegen `zuweiser[]` (inkl. Archiv-Einträge aus Task 3.1) nach Namensähnlichkeit sucht (einfacher Teilstring-/Lowercase-Vergleich reicht für die Demo, kein Fuzzy-Library nötig) und bei Treffer Stammdaten zur Übernahme vorschlägt statt Leerformular.
- [ ] **Schritt 2:** Hinweis im Code-Kommentar, dass das Krankenhausverzeichnis (§5.4) hier als Prinzip gilt, aber in dieser Runde **nicht** real befüllt wird (kein Datenimport) — nur der Abgleich-Mechanismus gegen die bestehende `zuweiser[]`-Liste.
- [ ] **Schritt 3:** Standard-Verifikation.
- [ ] **Schritt 4:** Commit: `git commit -m "feat(eingang): Institutions-Abgleich gegen Zuweiser-Archiv — §2.4"`

---

## Phase 5 — Bereich C: Patientenpflege im Prozess

Abhängig von Task 1.4 (Fälle entstehen jetzt gated) und profitiert von Phase 2 (neue Felder für die Fallakte).

### Task 5.1: Achse↔Team-Zuordnungstabelle + Owner-Routing-Vorschlag

**Lane: claude-implementer**

**Files:**
- Modify: `index.html` — nahe `const TEAM=[...]` (Zeile 4115)

- [ ] **Schritt 1:** Neue Lookup-Tabelle:

```js
const TEAM_ACHSE={"S. Koordination":["Orthopädie","Innere"],"M. Belegung":["Neurologie","Geriatrie"],"Recovery Manager":["SalutoCare"],"T. Abrechnung":[]};
function ownerVorschlag(achse){
  const kandidaten=TEAM.filter(t=>(TEAM_ACHSE[t]||[]).includes(achse));
  if(!kandidaten.length)return"S. Koordination";
  const zaehlung=kandidaten.map(t=>({t:t,n:faelle.filter(f=>f.owner===t&&f.status!=="Aufgenommen"&&f.status!=="Verloren").length}));
  zaehlung.sort((a,b)=>a.n-b.n);
  return zaehlung[0].t;
}
```

- [ ] **Schritt 2:** In Task 1.4's Fall-Erstellungslogik `owner:"S. Koordination"` durch `owner:ownerVorschlag(t.achse)` ersetzen (Mitarbeiter kann im Fall-Detail weiterhin manuell überschreiben — Feld bleibt editierbar).
- [ ] **Schritt 3:** Standard-Verifikation.
- [ ] **Schritt 4:** Commit: `git commit -m "feat(faelle): Owner-Routing-Vorschlag nach Achse+Auslastung — §3.1"`

---

### Task 5.2: Kontinuierliche Upsell-Erkennung im Board

**Lane: claude-implementer-pro** (Wiederverwendung der Signal-Engine in neuem Kontext, Duplikat-Vermeidung nötig)

**Files:**
- Modify: `index.html` — Werdegang/Log-Eintragsfunktion im Fall-Detail (Suche nach der Funktion, die neue `log[]`-Einträge hinzufügt, z. B. bei `sendReply`/Antwort-Composer)

- [ ] **Schritt 1:** Bei jedem neuen Log-Eintrag zu einem Fall `erkenneSignale(text)` erneut aufrufen; wenn `premium===true` und der Fall noch keine offene Upsell-Aufgabe hat (Prüfung z. B. via `f.aufgabe` oder ein neues additives Flag `f._upsellVorgeschlagen`), automatisch `f.aufgabe="Komfort-Upgrade anbieten"` + `f.frist` setzen. Duplikat-Schutz zwingend (Flag setzen nach erster Erkennung), sonst spammt jede weitere Notiz erneut die Aufgabe.
- [ ] **Schritt 2:** Standard-Verifikation, insbesondere: bestehenden Fall mit Text, der ein Premium-Signal enthält, im Board öffnen, neue Notiz mit "SalutoCare" hinzufügen, prüfen dass genau einmal die Aufgabe erscheint (nicht bei jeder weiteren Notiz erneut).
- [ ] **Schritt 3:** Commit: `git commit -m "feat(faelle): kontinuierliche Upsell-Erkennung im Werdegang — §3.2"`

---

### Task 5.3: Board-Priorisierung nach Sterne

**Lane: claude-implementer**

**Files:**
- Modify: `index.html` — `function makeBoardCol(st)` (Zeile ~4471)

- [ ] **Schritt 1:** Vor dem Rendern der Fälle einer Spalte nach `sterneVon({personId:f.personId})` absteigend sortieren (bestehende Funktion `sterneVon()` wiederverwenden, keine neue Ableitung), Reihenfolge innerhalb der Spalte, Zonenband-Gruppierung bleibt unverändert.
- [ ] **Schritt 2:** Standard-Verifikation — insbesondere Board-Zonenbänder (Phase 5 aus dem vorherigen Design-Programm) bleiben visuell/funktional intakt.
- [ ] **Schritt 3:** Commit: `git commit -m "feat(board): Priorisierung nach Sterne innerhalb Spalten — §3.3"`

---

### Task 5.4: Hybrid-Fallakte (Vollansicht + Button)

**Lane: claude-implementer-pro** (neue Route neben bestehendem Overlay-Navigationssystem, höchstes strukturelles Risiko im ganzen Plan)

**Files:**
- Modify: `index.html` — `go()`-Routing-Funktion (Zeile ~5947), `TITLES`-Objekt darin (Zeile ~5955), `applyHash()` (Zeile ~5993). `_DETAIL_IDS`-Mechanik (Zeile ~6011) NICHT verändern, sondern eine neue, zusätzliche Vollansicht danebenstellen.

**Wichtig, aus dem Plan-Review korrigiert:** `go(dest,seg)` kennt nur zwei Parameter und keine Fall-ID; `seg` wird nur akzeptiert wenn `SEGS[dest]` existiert und `seg` dort gelistet ist (Zeile 5952: `if(seg&&SEGS[dest]&&SEGS[dest].includes(seg))`). Ein dritter Positions-Parameter (z. B. `go('faelle','akte',id)`) würde von `go()` und von `applyHash()` (Zeile 6004: `go(parts[0],parts[1])`, `parts[2]` wird nie gelesen) stillschweigend verworfen. Die Fall-ID braucht daher einen eigenen Übertragungsweg, nicht die Routing-Parameter selbst — konsistent mit dem bestehenden Muster, dass Detail-State (`_detailPushed` etc.) in Modul-Variablen lebt, nicht im Routing.

- [ ] **Schritt 1:** `fallakte` als eigenständiges, neues Top-Level-`dest` anlegen (kein Segment eines anderen Views):
  - Neue Sektion `<section id="view-fallakte" class="view">…</section>` im Markup ergänzen (gleiche Struktur wie z. B. `#view-inreha`, kein `SEGS`-Eintrag nötig, da keine Unter-Segmente).
  - `TITLES`-Objekt (Zeile 5955) um `fallakte:["Fallakte","Vollständige Übersicht"]` ergänzen.
  - Neue Modul-Variable `let _fallakteId=null;` nahe den anderen Detail-State-Variablen (z. B. neben `_detailPushed`).
  - Neue Funktion `function openFallakte(id){_fallakteId=id;go('fallakte');}` — setzt nur die ID und navigiert; das eigentliche Rendern passiert zentral in `go()` (nächster Punkt), nicht hier, damit es auch bei einem direkten Hash-Aufruf (Reload/Bookmark) greift.
  - In `go()`'s `_run`-Funktion (Zeile ~5947-5972) einen neuen Zweig ergänzen, analog zum bestehenden `if(dest==="heute"&&_prevDest!=="heute"){...}`-Muster: `if(dest==="fallakte")renderFallakte();` — dadurch rendert `#view-fallakte` **immer** wenn diese Destination aktiv wird, egal ob über `openFallakte()`, direkten Hash-Aufruf oder Reload.
  - `renderFallakte()`: liest `_fallakteId`; **Schutz zuerst:** `if(!_fallakteId){go('faelle','board');return;}` (greift jetzt korrekt bei `#fallakte`-Reload ohne gesetzte ID, weil `go()` diese Funktion in genau diesem Fall aufruft); danach Fall aus `faelle` holen, Sections (Übersicht/Werdegang/Medizin/Abrechnung/Dokumente) in `#view-fallakte` aus bestehenden Renderfunktionen zusammensetzen (wiederverwenden, nicht duplizieren).
- [ ] **Schritt 2:** Im bestehenden Fall-Detail-Overlay (Schublade, `#ovDetail`) einen Button "Vollständige Fallakte öffnen →" ergänzen, der `openFallakte(aktuellerFall.id)` aufruft — **nicht** `f.id`: die bestehenden Buttons in diesem Overlay (`advanceFall()`, `sendReply()`, `dismissDetail()` u. a., siehe Zeilen 4427/5535ff.) sind alle parameterlos und lesen intern `aktuellerFall` (die im Overlay aktive Modul-Variable) — es gibt kein lokales `f` im Scope des Inline-`onclick`. `openFallakte(f.id)` würde `ReferenceError: f is not defined` werfen. KEINE Interaktion mit `_DETAIL_IDS`/`pushDetailState()` — das bleibt exklusiv für die bestehenden Overlays.
- [ ] **Schritt 3:** In der neuen Vollansicht: Sections/Tabs für Übersicht, Werdegang, medizinische Kurzfelder (aus Task 2.1/2.2), Abrechnung, Dokumente — Inhalte aus bestehenden Renderfunktionen wiederverwenden (nicht duplizieren), nur neu layoutet.
- [ ] **Schritt 4:** Standard-Verifikation — **kritisch:** bestehende Zurück-Navigation der Schublade (`dismissDetail()`, Escape/Backdrop) muss unverändert funktionieren; die neue Vollansicht nutzt normale Browser-Back-Navigation über den Hash, kein Zusatz-State.
- [ ] **Schritt 5:** Commit: `git commit -m "feat(faelle): Hybrid-Fallakte — Vollansicht neben Schublade — §3.4"`

---

## Reihenfolge-Zusammenfassung

```
Phase 1 (B, Kern)         Phase 2 (A)          Phase 3 (D)
  1.1 → 1.2 → 1.3 → 1.4     2.1 → 2.2 → 2.3      3.1 → 3.2 → 3.3
  → 1.5                                            │
       │                                           │
       └──────────────┬────────────────────────────┘
                       ↓
              Phase 4 (B-Rest): 4.1
                       ↓
              Phase 5 (C): 5.1 → 5.2 → 5.3 → 5.4
```

Phase 2 und 3 können parallel zu Phase 1 laufen (keine Abhängigkeit). Phase 4 braucht Phase 3 (Archiv). Phase 5 braucht Phase 1 (gated Fälle) und profitiert von Phase 2 (Felder für die Fallakte).
