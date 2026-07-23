# Runde 6, Punkt 1 — Anfrage-Triage mit Gruppen-Pool

**Bezug:** Sechste Runde, Nutzer-Feedback-Punkt 1. Ersetzt das personenbasierte Zuordnungsmodell in
`#egDetail` durch ein dreigleisiges Modell (Auto-Verteilung / Entscheidungsfall / Pull-Pool). Baut auf
dem bestehenden Eingang/Fallakte-Fundament auf (`eingang[]`, `faelle[]`, `uebernehmen()`,
`ma-mode`/Rollen-Schalter, Hybrid-Fallakte aus
[2026-07-22-runde5-sprint3-fallakte-cockpit-design.md](./2026-07-22-runde5-sprint3-fallakte-cockpit-design.md)).

**Leitplanken (aus `CLAUDE.md`, siehe [../../../CLAUDE.md](../../../CLAUDE.md)):** Cofounder-Namespaces
`.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*` nicht anfassen; `#refOverlay` tabu; Daten-Arrays nur additiv erweitern;
exakt 9 Keyframes (`lift`/`cv-travel`/`lxSweep`/`lxPulse`/`auGrow`/`rpDrawC`/`rpDrawP`/`rpRing`/`rpGrow`,
keine neuen); Jade-Apotheke-Identität (Doppelrahmen-Etiketten, Cormorant-Numerale, Gold nie als
Textfarbe außer `--brass-deep`); reduced-motion-safe (Startzustand nur im Keyframe-`from`);
`escapeHtml()` für alle Nutzertexte; kein `Math.random` (deterministisch via `heute`/`dstr()`); beide
Breiten (390px + 1440px) prüfen, 0 Console-Errors; nur synthetische Demo-Daten.

---

## 1. Kontext / Problem

`egSummaryHtml()` ([index.html:4344](../../../index.html#L4344)) baut heute drei redundante Ebenen
übereinander: `.mhead` (Kopf) → `.eg-triage`-Tabelle (Wer/Woher/Was/Wie konkret,
[index.html:4352-4357](../../../index.html#L4352)) → `.eg-zsf`-Zusammenfassung
([index.html:4368](../../../index.html#L4368)) → `.eg-original`-Originaltext
([index.html:4369](../../../index.html#L4369)). Die Tabelle dupliziert Informationen, die die
Zusammenfassung bereits in Prosa liefert.

Zuordnung erfolgt an einzelne Personen: `openEgDetail()` ([index.html:4375](../../../index.html#L4375))
rendert 4 `.egd-owner`-Buttons ([index.html:4387-4395](../../../index.html#L4387)) aus `TEAM`
([index.html:4325](../../../index.html#L4325)), der Leiter muss jede qualifizierte Anfrage manuell einer
Person zuweisen — auch dann, wenn Achse und Kostenträger bereits eindeutig sind und die Zuordnung
mechanisch aus `TEAM_ACHSE` ([index.html:4328](../../../index.html#L4328)) folgen würde
(`ownerVorschlag()`, [index.html:4411](../../../index.html#L4411)).

**Rendering-Bug:** `#egDetail` ist `role="dialog" aria-modal="true"`
([index.html:4151](../../../index.html#L4151)), verhält sich aber am Desktop nicht wie ein Dialog. Die
Basis-Regel `.overlay` ([index.html:556](../../../index.html#L556)) liefert eigentlich einen echten
Backdrop (`rgba(31,28,28,.45)`) + korrektes `pointer-events`-Toggle über `.overlay.open`
([index.html:558](../../../index.html#L558)). Die Desktop-Regel
`#egDetail{…background:transparent;pointer-events:none}`
([index.html:3036](../../../index.html#L3036)) überschreibt das aber **unbedingt** — eine ID-Selector-Regel
schlägt `.overlay.open` an Spezifität, egal ob `.open` gesetzt ist. Ergebnis: kein Backdrop, kein
Klick-Weg zum Schließen, die Schiene wirkt „nicht richtig da". Zum Vergleich: `#dbDetail`
([index.html:784](../../../index.html#L784)) hat exakt dasselbe Transparent/`pointer-events:none`-Muster
— dort ist es aber korrekt, weil `dbDetail` bewusst `aria-modal="false"` ist (nicht-modaler,
dauerhaft nebenläufiger Inspektor). `#egDetail` beansprucht `aria-modal="true"` und braucht daher
tatsächlich einen Backdrop.

---

## 2. Zielbild

Drei Wege statt einer manuellen Owner-Zuweisung:

1. **Eindeutige Anfrage** → Achse **und** Kostenträger klar erkannt, kein Premium-Verdacht → System
   ordnet automatisch der passenden **Gruppe** zu (Achsen-Team). Erscheint beim Leiter **nicht** als
   To-do, nur aggregiert im Protokoll.
2. **Entscheidungsfall** → Achse unklar/fehlt, Kostenträger-Signal unklar/gehedged, oder
   SalutoCare/Premium-Verdacht → landet in „Braucht Entscheidung". Leiter öffnet die aufgeräumte
   rechte Leiste, wählt eine **Gruppe** (nicht mehr eine Person), gibt frei.
3. **Pull-Prinzip** → Koordinatorin sieht in `ma-mode` den offenen Pool ihrer Gruppe(n) und holt sich
   eine Anfrage per „Übernehmen" — **erst dann** entsteht der Fall (bestehender `uebernehmen()`-Pfad),
   Fallakte öffnet direkt.

Die rechte Leiste (`#egDetail`) wird von einem Owner-Zuweisungsformular zu einem
Entscheidungsfall-Werkzeug: Sterne-Vorschlag (überschreibbar), eine Zusammenfassung, zugeklapptes
Original, Vollständigkeits-Checkliste, Gruppen-Zuordnung. Echter Backdrop, echtes Schließen.

---

## 3. Nutzerfluss

### 3.1 Leiter (Leitungsansicht, `renderEingang()`)

1. Neue Anfrage trifft ein (Seed oder `simulateInbound()`).
2. Triage läuft sofort (deterministisch, siehe §6):
   - **Eindeutig** → `m.gruppe` wird gesetzt, `m.autoVerteilt=true`. Kein Klick nötig. Taucht nur in
     der aggregierten Protokollzeile auf.
   - **Entscheidungsfall** → `m.gruppe=null`. Taucht oben unter „Braucht Entscheidung (N)" auf.
3. Leiter klickt eine Entscheidungsfall-Zeile → `openEgDetail(id)` → rechte Leiste (Desktop) /
   Bottom-Sheet (Mobile) mit echtem Backdrop.
4. Leiter sieht Sterne-Vorschlag + Begründung, EINE Zusammenfassung, zugeklapptes Original,
   Vollständigkeits-Checkliste (✓/✗ je Prüfpunkt), 5 Gruppen-Buttons mit Pool-Größe, SalutoCare-Toggle,
   Hinweis-Feld.
5. Leiter wählt Gruppe (überschreibt ggf. Sterne, setzt SalutoCare-Toggle, trägt Hinweis ein) →
   „Gruppe zuweisen & freigeben" → `m.gruppe` gesetzt, `m.autoVerteilt=false`, `m.saluto`/`m.hinweis`
   gespeichert. Leiste zeigt danach den „bereits verteilt"-Lesezweig. Zeile verschwindet aus
   „Braucht Entscheidung", taucht in keiner Leiter-To-do-Liste mehr auf — sie liegt jetzt im Pool der
   gewählten Gruppe, sichtbar erst für die Koordinatorin (Punkt 3 unten).
6. Kein Fall entsteht in diesem Schritt. Der Leiter sieht später nur, ob/wann eine Koordinatorin die
   Anfrage übernommen hat (`m.done`/`m.fallId`, unverändert bestehender Read-Zweig in `openEgDetail()`).

### 3.2 Koordinatorin (`ma-mode`, `renderMeinTag()`)

1. Rollen-Schalter „Koordination" (`mtEnter()`, [index.html:6668](../../../index.html#L6668)).
2. Neuer Block „Offene Anfragen deiner Gruppe(n)" oberhalb von „Was jetzt dran ist"
   (`#mtJetztChap`, [index.html:3996](../../../index.html#L3996)). Zeigt alle
   `eingang[]`-Einträge mit `m.gruppe` in ihren Gruppen (aus `TEAM_ACHSE["S. Koordination"]`, siehe §5),
   egal ob `m.autoVerteilt` oder leiter-freigegeben, solange `!m.done`. Der Block ist **zweistufig**
   (siehe §7.8): oben „Deine Gruppen", darunter eingeklappt (`<details>`) „Weitere Gruppen (N)" mit allen
   übrigen offenen Pool-Anfragen — jede freigegebene Anfrage ist so erreichbar (kleines Team, aushelfen erlaubt).
3. Kompakt-Karte je Anfrage: Zusammenfassung (2 Zeilen) + Sterne + „Übernehmen"-Button.
4. Klick „Übernehmen" → `uebernehmen(id, "S. Koordination")` → Fall entsteht (bestehender Pfad,
   erweitert um `f.sterne`/`f.rueckfragen`, siehe §5) → `openFallakte(fid)`.

---

## 4. Nicht-Ziele

- **Punkt 8** (weiterer Koordinations-/Fallakten-Ausbau) wird hier **nicht** vorweggenommen — nur der
  Pool-Block in `#view-meintag` ist Teil dieser Spec.
- Kein Backend, keine echte Persistenz, keine echten Benachrichtigungen.
- `#dbDetail`/`#rsDetail` bleiben unverändert (andere Rolle: `aria-modal="false"`, dauerhafter
  Inspektor — der Backdrop-Fix gilt ausschließlich `#egDetail`).
- `antwortenEingang()` ([index.html:4816](../../../index.html#L4816)) verliert seinen Aufrufort im
  Entscheidungsfall-Zweig (es gibt vor der Gruppen-Freigabe noch keinen Owner, an den „geantwortet"
  werden könnte). Die Antwortfunktion selbst (`sendReply()`) bleibt unverändert in der Fallakte
  (`dArbeitHtml()`-Zweig „angebot") erreichbar, sobald ein Fall existiert. Kein Entfernen der Funktion
  selbst, nur kein Aufruf mehr aus `#egDetail`.
- Keine Änderung an `TEAM`/`TEAM_ACHSE`-Mitgliederliste selbst — `GRUPPEN` ist eine reine Ableitung.
- `renderTeam()` ([index.html:5621](../../../index.html#L5621)) zählt in `.tm-intake`
  ([index.html:5625](../../../index.html#L5625): `eingangOffen=eingang.filter(m=>!m.done&&m.typ!=="passiv").length`)
  weiterhin nach dem alten Modell — „offene Anfragen … warten auf Zuordnung" stimmt nach dieser Spec
  nicht mehr exakt (auto-verteilte und bereits freigegebene Pool-Einträge warten nicht mehr auf den
  Leiter, sondern auf eine Koordinatorin). Bewusst hier **nicht** angefasst — Team-Statistiken werden
  in Runde 6, Punkt 3 neu gebaut; diese Spec beschränkt sich auf `#egDetail`/`renderEingang()`/den
  Pool-Block.

---

## 5. Datenmodell-Änderungen (additiv)

### 5.1 `eingang[]` — neue optionale Felder je Eintrag

| Feld | Typ | Default | Bedeutung |
|---|---|---|---|
| `m.gruppe` | `String\|null` | `null` | Zugeordnete Gruppe (= Achsenname, s. §5.3). `null` = noch keine Entscheidung. |
| `m.sterne` | `Number\|null` | `null` | Manueller Override der Sterne-Vorschlag (1–5). `null` = kein Override, Vorschlag aus `sterneAusSignal()` gilt. |
| `m.autoVerteilt` | `Boolean` | `false` | `true` = System hat `m.gruppe` automatisch gesetzt (Weg 1). `false` bei leiter-freigegebenen Entscheidungsfällen (Weg 2) und bei noch offenen Fällen. |
| `m.saluto` | `Boolean` | `false` | SalutoCare/Premium-Toggle-Stand. `egToggleSaluto(id)` schreibt ab jetzt **direkt** auf `m.saluto` (kein transienter Zwischenspeicher mehr) — nötig, weil der Toggle-Stand bis zur Fall-Anlage überleben muss, die zeitlich später, in einer anderen Ansicht, durch eine andere Person passiert (Pool-Pull, §7.8). Die bisherige globale Variable `egSaluto` entfällt (§7.5, §9). |
| `m.hinweis` | `String` | `""` | Bearbeitungshinweis, analog `m.saluto`: eine neue Funktion `egHinweisSetzen(id,val)` schreibt direkt auf `m.hinweis`. Die bisherige globale Variable `egHinweis` entfällt (§7.5, §9). |

Bestehende Felder (`id,wer,kanal,zeit,txt,typ,achse,done,fallId,zusammenfassung,notiz`) bleiben
unangetastet.

### 5.2 `faelle[]` — neue optionale Felder

| Feld | Typ | Bedeutung |
|---|---|---|
| `f.rueckfragen` | `Array<{frage:String, done:Boolean}>` | Aus der Vollständigkeits-Checkliste generierte offene Rückfragen (nur die ✗-Punkte), beim Fall-Anlegen in `uebernehmen()` übernommen. `[]` wenn Checkliste vollständig war oder die Anfrage nie durch einen Entscheidungsfall-Zweig lief (z. B. rein passiv → Datenbank). |
| `f.sterne` | `Number\|null` | Übernommener Wert aus `m.sterne` (Override) bzw. `sterneAusSignal(erkenneSignale(m.txt))` (kein Override), zum Zeitpunkt der Fall-Anlage eingefroren. |

**Surgical-Read-Fix in `renderFallakte()`** ([index.html:6769](../../../index.html#L6769)): die Zeile
`sterneHtml(sterneVon({personId:f.personId}))` liest heute ausschließlich über die Person, nicht über
den Fall — für Eingang-Fälle ohne `personId` fällt das immer auf den Default (2) zurück. Ändern zu
`sterneHtml(f.sterne!=null?f.sterne:sterneVon({personId:f.personId}))` (eine Zeile, Priorität:
Fall-Override vor Personen-Wert vor Default), damit `f.sterne` überhaupt sichtbar wird.

### 5.3 `GRUPPEN` — neue Ableitung, keine Mitgliederliste dupliziert

```js
const GRUPPEN = Array.from(new Set(Object.values(TEAM_ACHSE).flat()));
// → ["Orthopädie","Innere","Neurologie","Geriatrie","SalutoCare"] (Reihenfolge aus TEAM_ACHSE-Objekt)
function gruppenMitglieder(g){ return TEAM.filter(t=>(TEAM_ACHSE[t]||[]).includes(g)); }
function egGruppenPoolGroesse(g){ return eingang.filter(m=>!m.done&&m.gruppe===g).length; }
```

Eine Gruppe = ein Achsenname. `T. Abrechnung` (leere Achsenliste in `TEAM_ACHSE`) erscheint nicht in
`GRUPPEN` — unverändert, keine neue Rolle nötig. `S. Koordination` deckt zwei Gruppen ab
(Orthopädie, Innere) → ihr Pool-Block zeigt beide zusammengefasst (Abschnitt §7.4).

### 5.4 Seeds — deterministische Demo-Abdeckung

Bestehende `eingang[]`-Einträge (`id 101–108`, [index.html:4238-4247](../../../index.html#L4238)) plus
additive Feld-Ergänzungen, plus zwei neue Einträge (additiv angehängt, keine Löschung):

| id | Achse | Zustand heute | Neue Felder | Kategorie (§6) |
|---|---|---|---|---|
| 101 | Innere | offen, qualifiziert, `txt` enthält „Vermutlich PKV" | `gruppe:null, sterne:null, autoVerteilt:false` | **Entscheidungsfall** (Kostenträger-Signal gehedged durch „Vermutlich") |
| 102 | Neurologie | offen, qualifiziert, PKV + „Entlassung in 4 Tagen" klar | `gruppe:"Neurologie", sterne:null, autoVerteilt:true, saluto:false, hinweis:""` | **Auto-verteilt** |
| 103 | SalutoCare | offen, qualifiziert, Suite/Premium | `gruppe:null, sterne:null, autoVerteilt:false` | **Entscheidungsfall** (SalutoCare-Verdacht) |
| 104–106 | Geriatrie/Neuro/SalutoCare | `done:true` (historisch, „gestern"/„vor 2 Tagen") | keine Pflichtänderung — außerhalb des heutigen Protokollfensters, bereits abgeschlossen | historisch, nicht Teil der Akzeptanzkriterien |
| 107 | Orthopädie | offen, **passiv** | unverändert | passiv |
| 108 | Innere | offen, **passiv** | unverändert | passiv |
| **109** (neu) | Orthopädie | `kanal:"Zuweiser-Fax", txt` mit GKV klar + „Entlassung in 5 Tagen", `zeit:"vor 50 Min."`, `typ:"qualifiziert"` | `gruppe:"Orthopädie", autoVerteilt:true, saluto:false, hinweis:""` | **Auto-verteilt** |
| **110** (neu) | Geriatrie | `kanal:"Recare", txt` mit Beihilfe klar + Altersangabe, `zeit:"vor 90 Min."`, `typ:"qualifiziert"` | `gruppe:"Geriatrie", autoVerteilt:true, saluto:false, hinweis:""` | **Auto-verteilt** |

Ergebnis: **3 auto-verteilt** in 3 verschiedenen Gruppen (Neurologie, Orthopädie, Geriatrie), **2
Entscheidungsfälle** (101 Innere, 103 SalutoCare-Verdacht — erfüllt „einer davon SalutoCare"), **2
passive** (107, 108 — erfüllt „mindestens 1 passive"; beide bleiben additiv erhalten, keine
Löschung nötig, um genau 1 zu erzwingen).

`simulateInbound()` ([index.html:4759](../../../index.html#L4759)) muss neue Anfragen durch dieselbe
Triage-Funktion (§6) routen statt sie unverändert als offene qualifizierte Anfrage einzuhängen —
`INBOUND_POOL`-Einträge ([index.html:4705](../../../index.html#L4705)) bleiben als Quelle bestehen,
nur der Verarbeitungsschritt beim `eingang.unshift(...)` ruft zusätzlich die Klassifikation auf und
setzt `m.gruppe`/`m.autoVerteilt` sofort. Deterministisch, kein `Math.random`.

---

## 6. Triage-Logik (deterministisch)

Neue Funktion, nutzt ausschließlich bestehende (`erkenneSignale`, [index.html:4723](../../../index.html#L4723))
plus eine additive Erweiterung von deren Rückgabe:

```js
// Additiv in erkenneSignale() (index.html:4723): ein neues Feld am Rückgabe-Objekt,
// keine Änderung an bestehenden Feldern/Aufrufstellen.
sig.unsicher = /vermutlich|vielleicht|eventuell|evtl\.?|möglicherweise/i.test(s);

function klassifiziereEingang(m){
  if(m.typ==="passiv") return "passiv";
  const sig=erkenneSignale(m.txt);
  if(!m.achse||m.achse==="Unklar") return "entscheidung";      // Achse unklar/fehlt
  if(m.achse==="SalutoCare"||sig.premium) return "entscheidung"; // Premium-Verdacht, auch achsenübergreifend
  if(!sig.kostentraeger||sig.unsicher) return "entscheidung";   // KT-Signal fehlt oder gehedged
  if(sig.absage) return "entscheidung";                          // widersprüchlich, muss geprüft werden
  return "auto";
}
```

**Eindeutig (auto)** — alle vier Bedingungen erfüllt: `typ==="qualifiziert"`, Achse bekannt und
`!=="Unklar"`, Achse `!=="SalutoCare"` und kein Premium-Signal, Kostenträger klar erkannt **und nicht
gehedged**, keine Absage-Signale.

**Entscheidungsfall** — jede Verletzung einer der obigen Bedingungen (Achse fehlt, SalutoCare/Premium,
Kostenträger unklar/gehedged, widersprüchlich/Absage-Signal in einer sonst qualifizierten Anfrage).

Ausführung bei Eintreffen: Seed-Ladezeit wie in §5.4 vorbelegt; `simulateInbound()` ruft
`klassifiziereEingang(m)` und routet entsprechend — siehe konkreter Diff in §6.1.

### 6.1 `simulateInbound()` — Diff (Altpfad entfällt ersatzlos)

Der bestehende `setTimeout`-Zweig ([index.html:4759-4789](../../../index.html#L4759)) legt heute nach
1,6s **direkt einen Fall an** (`faelle.push(...)`, [index.html:4776](../../../index.html#L4776)), sobald
`sterneAusSignal(sig)>=3` — das umgeht die gesamte neue Gruppen-/Pool-Logik komplett, eine simulierte
Anfrage würde sofort einen Fall erzeugen statt erst automatisch verteilt oder zum Entscheidungsfall zu
werden. Dieser Zweig wird **ersatzlos entfernt** und durch die Triage-Routing-Logik ersetzt:

```js
function simulateInbound(){
 const t=INBOUND_POOL[_inbN%INBOUND_POOL.length];_inbN++;
 const mid=_inbId++;
 const m={id:mid,kanal:t.kanal,tit:t.tit,txt:t.txt,zeit:"gerade eben",achse:t.achse,done:false,
   typ:"qualifiziert",wer:t.wer||"",zusammenfassung:t.zusammenfassung,_neu:true,
   gruppe:null,sterne:null,autoVerteilt:false,saluto:false,hinweis:""};
 eingang.unshift(m);
 renderEingang();
 inbToast("in","<b>Neue Anfrage</b> über "+escapeHtml(t.kanal),"landet im Eingang — wird automatisch verarbeitet …",null);
 setTimeout(()=>{
  m._neu=false;
  if(klassifiziereEingang(m)==="auto"){
   m.gruppe=m.achse; m.autoVerteilt=true;
   renderEingang();
   inbToast("done","<b>Automatisch verteilt</b>","an Gruppe "+escapeHtml(m.gruppe)+" · "+escapeHtml(t.kanal),null);
  }else{
   renderEingang();
   inbToast("done","<b>Braucht Entscheidung</b>","Achse/Kostenträger nicht eindeutig · "+escapeHtml(t.kanal),null);
  }
 },1600);
}
```

**Entfernt:** die komplette Auswertung zwischen dem alten `const sig=erkenneSignale(t.txt);`
([index.html:4767](../../../index.html#L4767)) und dem schließenden `else`-Toast
([index.html:4786](../../../index.html#L4786)) — inklusive `findeOderErstellePerson(...)`-Aufruf
([index.html:4771](../../../index.html#L4771)), `pHist(...)`-Aufrufe und `faelle.push(...)`. Kein
automatisches Fall-Anlegen mehr aus `simulateInbound()`; Fälle entstehen ab jetzt ausschließlich über
`uebernehmen()` — entweder per Pool-Pull (§7.8) oder (unverändert, betrifft nur `typ:"passiv"`, hier
nicht einschlägig, da alle `INBOUND_POOL`-Einträge `typ:"qualifiziert"` sind) über `inDatenbank()`.

**Bekannter Nebeneffekt, hier bewusst nicht behoben:** Mit den drei bestehenden
`INBOUND_POOL`-Einträgen ([index.html:4705-4709](../../../index.html#L4705)) klassifizieren aktuell
alle drei als `"entscheidung"` (Familie Hoffmann: Premium-Signal trotz Neurologie-Achse; Herr
Reinhardt: SalutoCare-Achse; Dr. Kessler: „Privatpatientin" matcht nicht das `\bpkv\b`-Keyword in
`erkenneSignale()`). `simulateInbound()` demonstriert damit live nur den Entscheidungsfall-Toast, nie
den Auto-Toast — der Auto-Pfad ist bereits deterministisch über die Seeds 102/109/110 (§5.4)
abgedeckt, kein zusätzlicher Handlungsbedarf für diese Spec.

**Weiterer Nebeneffekt:** `ownerVorschlag()` ([index.html:4411](../../../index.html#L4411)) verliert
mit dieser Änderung seine letzte verbliebene Aufrufstelle ([index.html:4777](../../../index.html#L4777)
— die anderen beiden, [index.html:4377](../../../index.html#L4377) und
[index.html:4390](../../../index.html#L4390), entfallen bereits durch §7.5) und wird vollständig
unbenutzt — da alle drei Aufrufstellen durch diese Spec selbst eliminiert werden (nicht
vorbestehender toter Code), wird die Funktion mit entfernt (§9). `findeOderErstellePerson()`
([index.html:4592](../../../index.html#L4592)) verliert ebenfalls ihre einzige Aufrufstelle, bleibt
aber unangetastet stehen — sie ist generische Personen-Matching-Infrastruktur außerhalb des
Zuschnitts dieser Spec (mögliche künftige Wiederverwendung bei Personen-Verknüpfung im Pool-Pull,
Punkt 8), kein Löschauftrag hier.

---

## 7. UI-Spezifikation (neuer Namespace `.egt-*`)

### 7.1 `#egDetail` — Backdrop-Fix (Rendering-Bug aus §1)

**CSS-Änderung** ([index.html:3036](../../../index.html#L3036)): aus

```css
#egDetail{align-items:stretch;justify-content:flex-end;background:transparent;pointer-events:none}
```

wird

```css
#egDetail{align-items:stretch;justify-content:flex-end}
```

— Hintergrund und `pointer-events` bleiben der Basis-Regel `.overlay`/`.overlay.open`
([index.html:556-558](../../../index.html#L556)) überlassen, die bereits korrekt ist (dunkler Backdrop,
Klick durchlässig bis `.open`). `#egDetail.open .modal`
([index.html:3039](../../../index.html#L3039)) unverändert (Docking rechts, `translateX`).

**Backdrop-Klick + Escape:** `dismissDetail()` existiert bereits ([index.html:6833](../../../index.html#L6833)),
Escape ist bereits zentral verdrahtet ([index.html:6838](../../../index.html#L6838)). Es fehlt nur der
Klick-auf-Backdrop-Pfad — additiv am `#egDetail`-Div selbst ([index.html:4151](../../../index.html#L4151)):

```html
<div class="overlay" id="egDetail" role="dialog" aria-modal="true" aria-label="Anfrage-Detail"
     onclick="if(event.target===this)dismissDetail()">
```

Kein Effekt auf `#dbDetail`/`#rsDetail` — deren eigene Semantik (`aria-modal="false"` bzw. eigener
Close-Button) bleibt unverändert.

### 7.2 Kopf: Sterne-Vorschlag mit Begründung (`.egt-sterne`)

Ersetzt den bisherigen `sterneBlock` im `.eg-triage`-„Wie konkret"-Zeile
([index.html:4356](../../../index.html#L4356)) durch einen eigenständigen Block direkt unter dem
`.mhead`, nur im Entscheidungsfall-Zweig (nicht bei `m.done`/passiv):

```html
<div class="egt-sterne">
  <span class="egt-sterne-stars" onclick="egSterneUeberschreiben(ID)">★★★★</span>
  <p class="egt-sterne-grund">privat versichert, konkreter Termin</p>
</div>
```

- Sterne = `m.sterne!=null?m.sterne:sterneAusSignal(sig)` (Override gewinnt), Klick auf die Sterne
  öffnet Inline-Auswahl (analog dem bestehenden `st`/`st.on`-Muster aus `sterneHtml()`,
  [index.html:4924](../../../index.html#L4924)) und ruft `egSterneUeberschreiben(id,n)` →
  `m.sterne=n; openEgDetail(id);`.
- Begründungszeile = dieselbe `grund`-Ableitung, die heute schon existiert
  ([index.html:4351](../../../index.html#L4351)): `[kt+" erkannt", frist, "konkrete Anfrage"].filter(Boolean).join(" · ")`.

### 7.3 Zusammenfassung + Original (`.egt-original`)

Eine Zusammenfassung bleibt exakt wie heute (`egZusammenfassung()`,
[index.html:4339](../../../index.html#L4339), `.eg-zsf`-Markup unverändert,
[index.html:3063-3064](../../../index.html#L3063)). Die `.eg-triage`-Tabelle
([index.html:4352-4357](../../../index.html#L4352)) entfällt ersatzlos — Wer/Woher sind in Kopf +
Zusammenfassung bereits enthalten.

Original zugeklappt:

```html
<details class="egt-original">
  <summary class="rk">Originalnachricht</summary>
  <div class="eg-original"><div class="mtxt">…escapeHtml(m.txt)…</div></div>
</details>
```

`.eg-original`-Innenoptik ([index.html:3065-3066](../../../index.html#L3065), Papier-Kante) bleibt
unverändert als Optik innerhalb des `<details>`; nur die äußere Sichtbarkeit wird durch `<details>`
gesteuert (analog `.pa-fold`-Muster, [index.html:3074-3076](../../../index.html#L3074)). Kein Marker
nötig (`summary.rk` blendet ihn bereits aus, [index.html:3028-3029](../../../index.html#L3028)).

### 7.4 Vollständigkeits-Checkliste (`.egt-check`)

4 Prüfpunkte, je Punkt ✓ (mit erkanntem Wert) oder ✗ (führt zu einer Rückfrage):

```js
function egVollstaendigkeit(m){
  const sig=erkenneSignale(m.txt);
  return [
    {label:"Kostenträger", ok:!!sig.kostentraeger&&!sig.unsicher, wert:sig.kostentraeger,
     frage:"Kostenträger (PKV/GKV/Beihilfe) abklären"},
    {label:"Diagnose-Achse", ok:!!m.achse&&m.achse!=="Unklar", wert:m.achse,
     frage:"Medizinische Achse/Indikation erfragen"},
    {label:"Wunschtermin", ok:!!sig.dringlichkeit, wert:sig.dringlichkeit,
     frage:"Wunschtermin/Entlassungsdatum erfragen"},
    {label:"Kontaktdaten", ok:!!m.wer, wert:m.wer,
     frage:"Vollständige Kontaktdaten (Telefon/E-Mail) erfragen"}
  ];
}
```

Markup je Punkt (String-Baustein, wie an allen anderen Stellen mit `escapeHtml()` um jeden
Nutzer-/Erkennungswert):

```js
"<div class='egt-check-item "+(c.ok?"ok":"missing")+"'><span class='egt-check-ic'>"+(c.ok?"✓":"✗")+"</span>"
+"<span class='egt-check-lbl'>"+escapeHtml(c.label)+"</span>"
+(c.ok?"<span class='egt-check-val'>"+escapeHtml(c.wert)+"</span>":"<span class='egt-check-frage'>"+escapeHtml(c.frage)+"</span>")
+"</div>"
```

Bei ✓ zeigt `.egt-check-val` den erkannten Wert (z. B. „PKV", „Neurologie"), bei ✗ zeigt
`.egt-check-frage` stattdessen die generierte Rückfrage als kleinen Hinweistext.

Mit den Seeds aus §5.4 zeigt **101** zwei ✗ (Kostenträger gehedged, kein Wunschtermin-Match), **103**
zwei ✗ (kein Kostenträger-Keyword, kein Wunschtermin-Match) — beide demonstrieren den
Rückfragen-Übertrag in §7.6 sichtbar.

### 7.5 Gruppen-Zuordnung (`.egt-groups`, ersetzt `.egd-owners`)

Ersetzt den `TEAM.map(...)`-Owner-Buttons-Block ([index.html:4388-4395](../../../index.html#L4388)):

```js
"<div class='egt-groups'>"+GRUPPEN.map(function(g){
  const sel=egGruppe===g, n=egGruppenPoolGroesse(g);
  return "<button type='button' class='egt-group"+(sel?" sel":"")+"' onclick='egGruppeWaehlen("+m.id+",\""+g+"\")'>"
    +"<span class='egt-group-name'>"+escapeHtml(g)+"</span>"
    +"<span class='egt-group-pool'>"+n+" offen</span></button>";
}).join("")+"</div>"
```

`egGruppe` ist die einzige verbleibende transiente UI-State-Variable dieses Zweigs (deklariert neben
`_egId`, [index.html:4663](../../../index.html#L4663)-Umfeld — hält nur „welche Gruppe ist gerade
angeklickt, bevor Freigeben gedrückt wird" für die aktuell offene Anfrage, wird von `egFreigeben()`
sofort konsumiert). `egGruppeWaehlen(id,g){ egGruppe=g; openEgDetail(id); }` (analog dem bisherigen
`egSetOwner()`, [index.html:4409](../../../index.html#L4409), der zusammen mit `egOwner` entfällt, §9).

**Sterne, SalutoCare-Toggle und Hinweis schreiben ab jetzt direkt auf `m`, nie mehr auf eine
transiente globale Variable** (Konsequenz aus §7.2, konsistent zu Ende geführt) — sie müssen den
zeitlichen Abstand zwischen Freigabe (Leiter) und Übernahme (Koordinatorin, ggf. viel später) ohne
Zwischenspeicher überstehen:

```js
function egToggleSaluto(id){ const m=eingang.find(x=>x.id===id); if(!m)return; m.saluto=!m.saluto; openEgDetail(id); }
function egHinweisSetzen(id,val){ const m=eingang.find(x=>x.id===id); if(m) m.hinweis=val; }
```

(`egToggleSaluto()` ersetzt die bisherige Implementierung an [index.html:4410](../../../index.html#L4410),
gleicher Funktionsname/gleiche Aufrufstelle im Markup, nur der Rumpf ändert sich. Die Hinweis-Textarea
ruft neu `oninput='egHinweisSetzen("+m.id+",this.value)'` statt `oninput='egHinweis=this.value'`.)

`openEgDetail()`s bisherige Initialisierung `egSaluto=m.achse==="SalutoCare";egHinweis="";` beim ersten
Öffnen einer Zeile ([index.html:4377](../../../index.html#L4377)) wird zu einer einmaligen
Lazy-Initialisierung auf `m` selbst: `if(m.saluto===undefined)m.saluto=(m.achse==="SalutoCare");
if(m.hinweis===undefined)m.hinweis="";` — greift nur, falls Seed/`simulateInbound()` noch keinen
Wert gesetzt haben (beide setzen laut §5.4/§6.1 immer explizit `saluto:false,hinweis:""`, der Zweig ist
also nur eine Absicherung). Ein positiver Nebeneffekt: ein Hinweistext geht jetzt nicht mehr verloren,
wenn der Leiter zwischendurch eine andere Anfrage öffnet und zurückkommt — er lebt auf `m`, nicht in
einer Variable, die vom nächsten `openEgDetail()`-Aufruf überschrieben wird.

Abschließende Aktion bleibt ein Button, der jetzt aber **nichts mehr an Sterne/Saluto/Hinweis
schreiben muss** (steht schon live auf `m`) — er setzt ausschließlich die Gruppe:

```js
+"<button class='btn-brass' style='width:100%;margin-top:4px' onclick='egFreigeben("+m.id+")'>Gruppe zuweisen &amp; freigeben</button>"
```

```js
function egFreigeben(id){
  const m=eingang.find(x=>x.id===id); if(!m||!egGruppe) return;
  m.gruppe=egGruppe; m.autoVerteilt=false;
  renderEingang(); openEgDetail(id); // re-rendert jetzt im "bereits verteilt"-Lesezweig (§7.6)
}
```

Der bisherige `uebernehmen(m.id,egOwner)`-Aufruf aus dem alten Owner-Zweig entfällt aus `#egDetail` —
`uebernehmen()` selbst bleibt bestehen und wird jetzt ausschließlich vom Pull-Pool (§7.8) aufgerufen.

### 7.6 „Bereits verteilt"-Lesezweig

Neuer dritter Zustand in `openEgDetail()` ([index.html:4375](../../../index.html#L4375)), zwischen
`m.done` und dem Entscheidungsfall-Zweig: `!m.done && m.gruppe` (egal ob auto oder freigegeben) →
schreibgeschützte Ansicht: `"<div class='egt-verteilt'>Im Pool von <b>"+escapeHtml(m.gruppe)+"</b> — wartet auf Übernahme"+(m.autoVerteilt?" (automatisch verteilt)":" (zugewiesen)")+"</div>"`,
kein Formular, nur „‹ Zurück".

### 7.7 Leiter-Eingangsliste (`renderEingang()`, [index.html:4790](../../../index.html#L4790))

Kopfbereich neu strukturiert, drei Zonen statt einer flachen Liste:

1. **`.egt-entscheidung`** — „Braucht Entscheidung (N)": `eingang.filter(m=>!m.done&&m.typ!=="passiv"&&!m.gruppe)`,
   je Zeile bestehendes `.mrow`-Markup ([index.html:4792](../../../index.html#L4792)), `onclick='openEgDetail(...)'`
   unverändert.
2. **`.egt-protokoll`** — aggregierte Auto-Verteilung, kompakt:
   `"Heute automatisch verteilt: "+n+" · "+GRUPPEN.map(g=>g+" "+cnt(g)).filter(...).join(" · ")`, plus
   `<details>` mit den Einzelzeilen (Name/Gruppe/Zeit) darunter — nutzt
   `eingang.filter(m=>m.autoVerteilt)`.
3. **Rest** (erledigt/passiv) — unverändert wie heute, gleiche `.mail`/`.mrow`-Struktur, gleiche
   `.done`/`._neu`-Klassen.

### 7.8 Pool-Block Koordinationsansicht (`.egt-pool`)

**Zwei Ebenen, nicht eine** — kleines Team, jede Koordinatorin darf aushelfen; primär zieht man aus
den eigenen Gruppen, aber jede freigegebene/auto-verteilte Anfrage bleibt für alle erreichbar (kein
Fall bleibt liegen, nur weil gerade niemand aus der zuständigen Gruppe online ist — das schließt auch
den Fall, dass die einzige `Recovery Manager`-Gruppe SalutoCare für `S. Koordination` fremd ist, s.
Abnahme 5). Neuer Block in `#mtpPaneTag`, vor `#mtJetztChap`
([index.html:3996](../../../index.html#L3996)):

```html
<div class="chap egt-pool" id="egtPoolChap">
  <div class="kicker">Pool</div>
  <h2 class="chap-h2">Offene Anfragen deiner Gruppe(n)</h2>
  <div class="mt-grid" id="egtPoolList"></div>
  <details class="egt-pool-weitere">
    <summary class="rk">Weitere Gruppen (<span id="egtPoolWeitereCount">0</span>)</summary>
    <div class="mt-grid" id="egtPoolWeitereList"></div>
  </details>
</div>
```

Gefüllt in einer neuen `renderEgtPool()`, aufgerufen aus `renderMeinTag()`
([index.html:6470](../../../index.html#L6470)) direkt nach `renderMtProtokolle()`
([index.html:6489](../../../index.html#L6489)):

```js
function renderEgtPool(){
  const meineGruppen=TEAM_ACHSE["S. Koordination"]||[]; // ["Orthopädie","Innere"]
  const karte=function(m){
    return "<article class='egt-pool-card'><p class='egt-pool-zsf'>"+escapeHtml(egZusammenfassung(m))+"</p>"
      +sterneHtml(m.sterne!=null?m.sterne:sterneAusSignal(erkenneSignale(m.txt)))
      +"<button class='btn-brass btn-sm' type='button' onclick='egUebernehmenAusPool("+m.id+")'>Übernehmen</button></article>";
  };
  const eigene=eingang.filter(m=>!m.done&&m.gruppe&&meineGruppen.includes(m.gruppe));
  const weitere=eingang.filter(m=>!m.done&&m.gruppe&&!meineGruppen.includes(m.gruppe));
  document.getElementById("egtPoolList").innerHTML=eigene.length?eigene.map(karte).join(""):"<p class='empty'>Keine offenen Anfragen in deiner Gruppe.</p>";
  document.getElementById("egtPoolWeitereList").innerHTML=weitere.map(karte).join("");
  document.getElementById("egtPoolWeitereCount").textContent=weitere.length;
}
function egUebernehmenAusPool(id){ uebernehmen(id,"S. Koordination"); }
```

Kein `openFallakte(...)`-Zusatzaufruf nötig: `openDetail()` ist bereits ein reiner Alias auf
`openFallakte()` (`function openDetail(id){openFallakte(id);}`,
[index.html:6193](../../../index.html#L6193)), und `uebernehmen()` ruft an seinem Ende bereits
`renderAll();openDetail(fid);` ([index.html:4814](../../../index.html#L4814)) — der Aufruf
`uebernehmen(id,"S. Koordination")` öffnet die Fallakte also schon von selbst, ohne dass an
`uebernehmen()` etwas geändert werden müsste.

### 7.9 Fallakte — Rückfragen-Checkliste im Werkbank-Typ „rueckruf"

`dArbeitHtml()` ([index.html:6094](../../../index.html#L6094)) hat aktuell **keinen** eigenen
`if(typ==="rueckruf")`-Zweig — er fällt durch bis zum generischen Notiz-Feld
([index.html:6118](../../../index.html#L6118)). Neuer Zweig davor:

```js
if(typ==="rueckruf"&&f.rueckfragen&&f.rueckfragen.length)
  return "<div class='egt-rueckfragen'><span class='kicker'>Offene Rückfragen</span>"
    +f.rueckfragen.map(function(r,i){
      return "<label><input type='checkbox' "+(r.done?"checked":"")+" onchange='egRueckfrageToggle("+i+")'> "+escapeHtml(r.frage)+"</label>";
    }).join("")
    +"</div>"
    +"<div class='full' style='margin-top:12px'><label for='dNotizSofort'>"+escapeHtml(MT_NOTIZ_LABEL.rueckruf)+"</label>"
    +"<div class='kz-notiz-row'><input id='dNotizSofort' placeholder='z. B. Rückruf erledigt'>"
    +"<button class='btn-ghost btn-sm' type='button' onclick='kzNotizAdd()'>Ins Protokoll</button></div></div>";
```

`egRueckfrageToggle(i){ const f=aktuellerFall;if(!f||!f.rueckfragen)return; f.rueckfragen[i].done=!f.rueckfragen[i].done; renderFallakte(); }`
— abhakbare Liste über dem bestehenden Notizfeld, `MT_NOTIZ_LABEL.rueckruf` unverändert
([index.html:6293](../../../index.html#L6293)). Fällt `f.rueckfragen` leer/`undefined` aus (Fall nicht
aus einem Entscheidungsfall entstanden), greift der bisherige generische Zweig unverändert.

### 7.10 `uebernehmen()` — vollständiger Diff

`uebernehmen()` ([index.html:4802-4815](../../../index.html#L4802)) ist nach §7.5/§6.1 die **einzige**
verbleibende Stelle, die Fälle anlegt, und muss jetzt vom Eingang-Objekt lesen statt von den
entfallenden Globalen (`egSaluto`/`egHinweis`, §9) — plus zwei neue Felder:

```diff
 function uebernehmen(id,owner){
   const m=eingang.find(x=>x.id===id);if(!m||m.done)return;
   owner=owner||TEAM[0];
   m.done=true;
   const fid=Math.max(...faelle.map(x=>x.id))+1;
   const _log=[[dstr(0),"Aus Eingang übernommen ("+m.kanal+"): "+m.tit+" — zugewiesen an "+owner]];
-  if(egHinweis)_log.push([dstr(0),"[Hinweis bei Zuordnung] "+egHinweis]);
+  if(m.hinweis)_log.push([dstr(0),"[Hinweis bei Zuordnung] "+m.hinweis]);
   faelle.push({id:fid,name:"Neuer Fall (aus Eingang)",alter:null,rolle:"offen",kanal:m.kanal,quelle:m.tit.split(":")[1]?m.tit.split(":")[1].trim():m.kanal,
     achse:m.achse,kt:"Unklar",status:"Neu",owner:owner,aufgabe:STATUS_AUFGABE["Neu"],frist:dstr(0),
-    saluto:egSaluto,zuordnungsHinweis:egHinweis||"",docs:[false,false,false,false],kosten:"offen",consent:"offen",verlust:"",reaktion:null,
+    saluto:m.saluto===true,zuordnungsHinweis:m.hinweis||"",
+    sterne:m.sterne!=null?m.sterne:sterneAusSignal(erkenneSignale(m.txt)),
+    rueckfragen:egVollstaendigkeit(m).filter(c=>!c.ok).map(c=>({frage:c.frage,done:false})),
+    docs:[false,false,false,false],kosten:"offen",consent:"offen",verlust:"",reaktion:null,
     log:_log});
   m.fallId=fid;
   renderAll();openDetail(fid);
 }
```

Feldname `zuordnungsHinweis` bleibt unverändert (bestehender Konsument:
`faHinweis`-Anzeige in `renderFallakte()`, [index.html:6772](../../../index.html#L6772)) — nur die
Quelle rechts vom Doppelpunkt ändert sich von der globalen Variable auf `m.hinweis`. `saluto` liest
`m.saluto===true` statt `egSaluto`, um einen etwaigen `undefined`-Zustand (Anfrage nie geöffnet, s.
Lazy-Init in §7.5) hart auf `false` zu normalisieren. `openDetail(fid)` bleibt unverändert — bereits
Alias auf `openFallakte(fid)` ([index.html:6193](../../../index.html#L6193), s. §7.8).

---

## 8. Abnahmekriterien (Browser-Checks)

1. **Backdrop:** `#egDetail` öffnen (Entscheidungsfall, z. B. id 101) am Desktop (≥1024px) →
   Hintergrund sichtbar abgedunkelt, Klick auf den abgedunkelten Bereich schließt die Leiste, Escape
   schließt sie ebenfalls, Browser-Zurück schließt sie (bestehender `pushDetailState()`/`dismissDetail()`-Pfad,
   unverändert). Kein `pointer-events:none` mehr auf Inhalte dahinter, solange `.open` gesetzt ist.
2. **Auto-Verteilung sichtbar, aber kein To-do:** In der Leiter-Eingangsliste taucht keine der Ids
   102/109/110 unter „Braucht Entscheidung" auf. Das Protokoll zeigt „Heute automatisch verteilt: 3"
   mit mindestens 3 unterschiedlichen Gruppen-Namen in der aggregierten Zeile.
3. **Genau 2 Entscheidungsfälle:** „Braucht Entscheidung (2)" zeigt exakt die Ids 101 und 103; 103 zeigt
   beim Öffnen SalutoCare als Achse/Premium-Signal.
4. **Checkliste + Rückfragen-Übertrag:** id 101 öffnen → Checkliste zeigt mindestens ein ✗. Gruppe
   „Innere" wählen, freigeben. In `ma-mode`/Koordinatorin-Pool erscheint die Anfrage im **oberen**
   Block „Offene Anfragen deiner Gruppe(n)" (Innere gehört zu `TEAM_ACHSE["S. Koordination"]`). Auf
   „Übernehmen" klicken → Fallakte öffnet direkt, Werkbank-Typ „rueckruf" zeigt eine abhakbare Liste mit
   genau den zuvor als ✗ markierten Punkten, Checkbox-Klick hakt ab und bleibt nach `renderFallakte()`
   erhalten (`f.rueckfragen[i].done` persistiert am Fall-Objekt).
5. **Sterne-Override wandert in den Fall, Pool-Erreichbarkeit über Gruppengrenzen:** In id 103 die
   Sterne manuell auf 5 setzen, Gruppe „SalutoCare" wählen, freigeben. Da SalutoCare **nicht** zu
   `TEAM_ACHSE["S. Koordination"]` gehört, erscheint die Anfrage **nicht** im oberen Block, sondern nur
   im eingeklappten „Weitere Gruppen (N)" — aufklappen, dort übernehmen → Fallakte-Kopf zeigt 5 Sterne
   (nicht den Default aus `sterneVon()`).
6. **Pull-Prinzip / keine vorzeitige Fall-Anlage:** Nach Schritt 3 der Abnahme (Gruppe zugewiesen,
   noch nicht übernommen) existiert **kein** neuer Eintrag in `faelle[]` mit `owner==="S. Koordination"`
   für diese `m.id` — erst nach Klick auf „Übernehmen" im Pool-Block entsteht der Fall.
7. **SalutoCare/Hinweis überleben den Zeitversatz:** Bei id 103 den SalutoCare-Toggle aktiv lassen und
   einen Hinweistext eintragen, freigeben, **danach** eine andere Entscheidungsfall-Anfrage öffnen,
   dort ebenfalls Toggle/Hinweis anders setzen (um zu beweisen, dass es keine gemeinsame globale
   Variable mehr gibt, die beide Zeilen teilen), dann erst id 103 im Pool übernehmen → der entstandene
   Fall zeigt `saluto:true` und den ursprünglich für id 103 eingetragenen Hinweistext, unbeeinflusst von
   der zwischenzeitlichen Interaktion mit der anderen Zeile (Beweis, dass `m.saluto`/`m.hinweis`
   pro Eingang-Objekt und nicht in einer einzigen globalen Variable gehalten werden).
8. **`simulateInbound()` legt keinen Fall mehr direkt an:** Simulation auslösen → nach dem
   „in"-Toast folgt nach 1,6s entweder „Automatisch verteilt" (mit Gruppenname) oder „Braucht
   Entscheidung" — in keinem Fall ein Eintrag in `faelle[]` direkt aus dieser Funktion heraus
   (`faelle.length` vor/nach dem Auslösen unverändert, bis eine tatsächliche Übernahme über den
   Pool erfolgt).
9. **Mobile (390px):** Alle obigen Schritte 1–8 wiederholt bei 390px Breite — `#egDetail` als
   Bottom-Sheet (bestehendes `.overlay`-Verhalten, kein Docking-Media-Query aktiv), Pool-Karten im
   `ma-mode` einspaltig (beide Ebenen), keine horizontale Überlauf.
10. **0 Console-Errors** bei allen obigen Schritten, in beiden Breiten.
11. **Unberührte Bereiche:** `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`-Elemente, `#refOverlay`,
    `#dbDetail`/`#rsDetail`-Verhalten unverändert; Anzahl der `@keyframes`-Blöcke im Stylesheet weiterhin
    genau 9.

---

## 9. Verifizierte Code-Anker (gelesen vor dieser Spec)

- `#egDetail` CSS: [index.html:3034-3070](../../../index.html#L3034), Basis `.overlay`:
  [index.html:556-562](../../../index.html#L556), `#dbDetail`-Vergleich: [index.html:784](../../../index.html#L784)
- `#egDetail` HTML: [index.html:4151](../../../index.html#L4151)
- `egZusammenfassung()`: [index.html:4339](../../../index.html#L4339)
- `egSummaryHtml()`: [index.html:4344](../../../index.html#L4344)
- `openEgDetail()`: [index.html:4375](../../../index.html#L4375)
- `egSetOwner()`/`egToggleSaluto()`/`ownerVorschlag()`: [index.html:4409-4417](../../../index.html#L4409)
  — `egSetOwner()` und `ownerVorschlag()` werden von dieser Spec vollständig entfernt (letzte
  Aufrufstellen entfallen, §6.1/§7.5); `egToggleSaluto()` bleibt namensgleich bestehen, nur ihr Rumpf
  ändert sich (§7.5).
- `eingang[]` Seeds: [index.html:4238-4247](../../../index.html#L4238)
- `INBOUND_POOL`/`simulateInbound()`: [index.html:4705](../../../index.html#L4705)/[index.html:4759](../../../index.html#L4759)
- `erkenneSignale()`/`sterneAusSignal()`/`sterneHtml()`: [index.html:4723](../../../index.html#L4723)/[index.html:4743](../../../index.html#L4743)/[index.html:4924](../../../index.html#L4924)
- `TEAM`/`TEAM_ACHSE`: [index.html:4325](../../../index.html#L4325)/[index.html:4328](../../../index.html#L4328)
- `uebernehmen()`: [index.html:4802](../../../index.html#L4802)
- `renderEingang()`: [index.html:4790](../../../index.html#L4790)
- Rollen-Schalter `.ds-role`/`mtEnter()`/`mtExit()`: [index.html:2881-2906](../../../index.html#L2881), [index.html:6668](../../../index.html#L6668)/[index.html:6674](../../../index.html#L6674)
- `renderTeam()`: [index.html:5621](../../../index.html#L5621)
- `#view-meintag`/`renderMeinTag()`: [index.html:3977](../../../index.html#L3977)/[index.html:6470](../../../index.html#L6470)
- `STATUS_AUFGABE`/`advanceFallStatus()`: [index.html:4175](../../../index.html#L4175)/[index.html:6178](../../../index.html#L6178)
- `openFallakte()`/`renderFallakte()`/`.fk-cols`: [index.html:6747](../../../index.html#L6747)/[index.html:6759](../../../index.html#L6759)/[index.html:2975-2982,4035](../../../index.html#L2975)
- `dArbeitHtml()`/`drawerAufgabenTyp()`: [index.html:6094](../../../index.html#L6094)/[index.html:6085](../../../index.html#L6085)
- `dismissDetail()`/`_DETAIL_IDS`/`_closeSiblingDetailRails()`/`pushDetailState()`: [index.html:6833](../../../index.html#L6833)/[index.html:6824](../../../index.html#L6824)/[index.html:4331](../../../index.html#L4331)/[index.html:6828](../../../index.html#L6828)
- `sterneVon()`: [index.html:4922](../../../index.html#L4922); `MT_NOTIZ_LABEL`: [index.html:6293](../../../index.html#L6293); `ACHSE_COL`/`STATUS`: [index.html:4201](../../../index.html#L4201)/[index.html:4174](../../../index.html#L4174)
- Obsolet werdende CSS (`.eg-triage`/`.eg-row`/`.eg-v`/`.eg-grund`/`.egd-owners`/`.egd-owner*`), einzige
  Verwender bestätigt in `egSummaryHtml()`/`openEgDetail()`: [index.html:2987-2996,3041-3047](../../../index.html#L2987)
- `openDetail()` — bereits Alias auf `openFallakte()`, keine Änderung nötig (§7.8/§7.10):
  [index.html:6193](../../../index.html#L6193)
- `findeOderErstellePerson()`: [index.html:4592](../../../index.html#L4592) (verliert einzige
  Aufrufstelle durch §6.1, bleibt bewusst unangetastet stehen, s. §6.1)

### Zu entfernende JS-Symbole (durch diese Spec vollständig unbenutzt)

- `egOwner`, `egSetOwner()` — ersetzt durch `egGruppe`/`egGruppeWaehlen()` (§7.5)
- `egSaluto`, `egHinweis` (globale Zwischenspeicher-Variablen) — ersetzt durch direkte Schreibzugriffe
  auf `m.saluto`/`m.hinweis` (§7.5); `egToggleSaluto()`/eine neue `egHinweisSetzen()` schreiben direkt
  auf das jeweilige `eingang[]`-Objekt
- `ownerVorschlag()` — alle drei Aufrufstellen ([index.html:4377](../../../index.html#L4377),
  [index.html:4390](../../../index.html#L4390), [index.html:4777](../../../index.html#L4777)) entfallen
  durch §7.5 bzw. §6.1; die Funktion selbst wird mitentfernt, da sie ausschließlich durch diese Spec
  orphaned wird (kein vorbestehender toter Code)
