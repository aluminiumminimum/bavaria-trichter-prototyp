# Runde 6, Punkt 1 — Anfrage-Triage mit Gruppen-Pool: Implementierungsplan

> **Für ausführende Agenten:** Dieser Plan wird Subagent-Driven umgesetzt — pro Task ein frischer Agent, kein Schreiben durch das orchestrierende Modell selbst. Lane-Tag pro Task beachten. Jeder Task arbeitet ausschließlich in `index.html`; **vor jeder Anker-Zeile den `grep`-Befehl aus dem Task selbst erneut ausführen** — Zeilennummern verschieben sich durch jeden vorherigen Task. Die hier notierten Zeilen sind der Stand bei Plan-Erstellung (23.07.2026, `index.html` 6885 Zeilen, Commit `f56d9b1`), nicht garantiert der Stand bei Ausführung.

**Bezug:** Setzt [2026-07-23-runde6-punkt1-anfrage-triage-design.md](../specs/2026-07-23-runde6-punkt1-anfrage-triage-design.md) vollständig um — löst das personenbasierte Owner-Zuweisungsmodell in `#egDetail` durch ein dreigleisiges Modell ab (Auto-Verteilung an eine Gruppe / Entscheidungsfall mit Gruppen-Wahl / Pull-Pool für die Koordinatorin), behebt den Backdrop-Rendering-Bug von `#egDetail`, und baut die Rückfragen-Checkliste des Fallakte-Werkbank-Typs „rueckruf" auf. Format/Konventionen übernommen vom vorherigen Sprint-Plan ([2026-07-22-runde5-sprint3-fallakte-cockpit-plan.md](./2026-07-22-runde5-sprint3-fallakte-cockpit-plan.md)).

**Architektur:** Alle Änderungen in `index.html` (self-contained, kein Build-Prozess, „Tests" = konkrete Browser-Checks, keine Test-Framework-Suite). Sequentielle Ausführung — **nie parallel**, jeder Task fasst dieselbe Datei an. Nach jedem Task: Git-Commit (nur `index.html` staged). Die App bleibt nach **jedem einzelnen Task** lauffähig (0 Console-Errors, kein kaputter Zwischenzustand).

---

## Harte Regeln (jeder Task, aus Spec + projektweitem `CLAUDE.md`)

- Cofounder-Namespaces **nicht anfassen**: `.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`. `#refOverlay` tabu.
- Daten-Arrays (`eingang[]`, `faelle[]`) **nur additiv** erweitern — keine bestehenden Felder umbenennen/löschen, keine bestehenden Seed-Einträge löschen.
- **Exakt 9 Keyframes** — verifiziert im Ist-Stand: `lift` [61], `rpDrawC`/`rpDrawP` [1043]/[1044], `rpRing` [1058], `rpGrow` [1074], `cv-travel` [1362], `auGrow` [2020], `lxSweep` [2029], `lxPulse` [2072]. Diese Runde führt **keine** neuen ein.
- `escapeHtml()` für jeden dynamisch eingefügten Nutzer-/Erkennungstext, insbesondere in allen neuen `.egt-*`-Bausteinen.
- **Kein `Math.random`** — alles deterministisch (Seeds, `dstr()`, feste `INBOUND_POOL`-Rotation über `_inbN`).
- Reduced-motion-safe: diese Runde führt keine neuen Animationen ein, daher kein zusätzliches Risiko — trotzdem keine `opacity:0`/Start-Transform außerhalb eines Keyframe-`from` einführen, falls doch etwas Animiertes ergänzt wird (ist laut Plan nicht vorgesehen).
- Beide Breiten prüfen: **390px und 1440px**. **0 Console-Errors** bei jedem Verifikationsschritt.
- Neue CSS ausschließlich als **kommentierte Blöcke direkt vor `</style>`** (Zeile 3112 im Ist-Stand), neuer Namespace `.egt-*` für alles genuin Neue in dieser Runde. Bestehende, weiterverwendete Klassen (`.mhead`, `.eg-zsf`, `.eg-original`, `.egd-saluto`, `.mt-grid`, `.chap`, `.kicker`, `.rk`/`summary.rk`, `.btn-brass`, `.btn-ghost`, `.rsz-textarea`) behalten ihre Namen und ihre bestehende CSS-Definition unangetastet.
- `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`/`#refOverlay`, `#dbDetail`/`#rsDetail`-Verhalten, `ma-mode`/`mtSheet`-Mechanik (außer der einen additiven `renderEgtPool()`-Aufrufzeile in `renderMeinTag()`, Task 5) bleiben unverändert.

---

## Lanes

- **`claude-implementer`** (Haiku) — Task 1 (Backdrop-CSS-Fix + eine Onclick-Attribut-Ergänzung), Task 2 (additive Datenmodell-Bausteine: `GRUPPEN`-Ableitung, `egVollstaendigkeit()`, `sig.unsicher`, Seed-Ergänzungen, 1-Zeilen-Fix in `renderFallakte()`), Task 4 (`renderEingang()` nach vollständig vorgegebenem Code umbauen).
- **`claude-implementer-pro`** (Sonnet) — Task 3 (**größter Task, atomar**: `klassifiziereEingang()`, `egSummaryHtml()`-Restrukturierung, `openEgDetail()`-Neuaufbau inkl. Sterne-Widget/Checkliste/Gruppen-Block/Verteilt-Lesezweig, Entfernung der Globals `egOwner`/`egSaluto`/`egHinweis`/`egSetOwner()`/`ownerVorschlag()` **inklusive aller Aufrufstellen im selben Commit**, `simulateInbound()`-Ersatz, `uebernehmen()`-Diff), Task 5 (Pool-Block Koordinationsansicht), Task 6 (Rückfragen-Checkliste in der Werkbank), Task 7 (Aufräum-Sweep + Gesamt-Boot-Check).

---

## Warum Task 3 atomar ist (Zuschnitts-Begründung)

Die Globals `egOwner`, `egSaluto`, `egHinweis` sowie die Funktionen `egSetOwner()` und `ownerVorschlag()` werden **vollständig entfernt** (§9 der Spec). Ihre Aufrufstellen sind über **drei verschiedene Funktionen** verteilt, die im Ist-Stand alle noch existieren:

| Zeile (Ist) | Fundstelle | Funktion |
|---|---|---|
| 4377 | `if(_egId!==id){_egId=id;egOwner=...;egSaluto=...;egHinweis="";}` | `openEgDetail()` |
| 4387–4399 | `egd-saluto`/`egd-owners`/`egdHinweis`-Textarea/`uebernehmen(m.id,egOwner)`/`antwortenEingang(m.id,egOwner)` | `openEgDetail()` |
| 4409–4417 | `egSetOwner()`, `egToggleSaluto()` (alte Fassung), `ownerVorschlag()` | eigene Funktionen |
| 4664/4666 | `let egOwner=null,_egId=null;` / `let egSaluto=false,egHinweis="";` | globale Deklaration |
| 4777 | `owner:ownerVorschlag(t.achse)` | alter `simulateInbound()`-Direktanlage-Zweig (entfällt durch §6.1 komplett) |
| 4808/4811 | `if(egHinweis)...`/`saluto:egSaluto,zuordnungsHinweis:egHinweis` | `uebernehmen()` |

Würde man die Globals in einem separaten Task entfernen, bevor **alle** sechs Fundstellen in derselben Änderung umgebaut sind, würfe jede noch nicht angepasste Fundstelle beim nächsten Aufruf einen `ReferenceError` (App bricht beim Klick auf eine Eingang-Zeile oder bei `uebernehmen()` ab — verletzt die Vorgabe „App bleibt nach jedem Task lauffähig"). **Entscheidung:** Alle sechs Fundstellen werden in einem einzigen atomaren Task (Task 3) behandelt — Entfernung der Globals und Neuaufbau aller Aufrufer im selben Commit. Task 3 ist unten in nummerierte Teilschritte (3.1–3.12) gegliedert.

---

## Zwei offene Punkte aus dem Review — hier verbindlich ausformuliert

Die Spec lässt an zwei Stellen bewusst eine Lücke, die dieser Plan schließt (nicht dem Implementierer überlassen):

**(a) Das klickbare 1–5-Sterne-Widget.** Die Spec zeigt in §7.2 nur ein Platzhalter-Markup (`onclick='egSterneUeberschreiben(ID)'` ohne `n`-Parameter, ein einziges `<span>` mit 4 statischen Stern-Unicode-Zeichen). Dieser Plan definiert das konkrete, einzeln klickbare Widget (siehe Task 3.5, Helper `egtSterneHtml()`): fünf einzelne `<button>`-Elemente, je mit `onclick='egSterneUeberschreiben(ID,N)'` (N = 1..5), `aria-label` je Stern, sichtbarem Hover- (`@media(hover:hover)`) und Fokus-Zustand (`:focus-visible`-Outline). Siehe exaktes Markup/CSS in Task 3.5/3.11.

**(b) `(m.saluto?" on":"")` statt `(egSaluto?" on":"")`.** Im neuen `openEgDetail()`-Entscheidungsfall-Zweig (Task 3.6) liest der SalutoCare-Toggle-Button ab jetzt `m.saluto` statt der entfallenden globalen Variable `egSaluto` — gleiche CSS-Klasse (`egd-saluto`/`egd-saluto.on`) bleibt bestehen (kein Orphan, keine Umbenennung nötig), nur die Datenquelle wechselt von global auf das `eingang[]`-Objekt.

---

## Standard-Verifikation (nach jedem Task)

1. `grep -c "function "  index.html` vor/nach vergleichen — keine unbeabsichtigt gelöschten Funktionen außer den explizit dokumentierten Entfernungen (`egSetOwner`, `ownerVorschlag`, Task 3).
2. Browser: Seite neu laden, Console auf 0 Errors prüfen.
3. Betroffene View bei 390px und bei 1440px öffnen, auf Overflow/Lesbarkeit prüfen.
4. Cofounder-Bereiche (`#refOverlay`, `.mx-*`, `.rsp-*` in `openRsDetail()`) unverändert gegentesten.
5. `#dbDetail`/`#rsDetail`-Verhalten unverändert gegentesten (nur `#egDetail` ist Teil dieser Runde).
6. Commit mit klarer Botschaft, welcher Spec-Abschnitt umgesetzt wurde — **nur `index.html` staged, niemals `docs/MicrosoftTeams-video.mp4` oder sonstige Dateien**.
7. Jeder Task unten endet zusätzlich mit einer eigenen **Sichtprüfung**.

---

# Task 1 — Backdrop-Fix `#egDetail`

**Lane:** `claude-implementer` (zwei mechanische, vollständig vorgezeichnete Änderungen: eine CSS-Zeile kürzen, ein Attribut ergänzen)

**Abhängigkeit:** keine — reiner CSS/Attribut-Fix, betrifft keine JS-Logik.

**Bezug:** Spec §1 (Rendering-Bug), §7.1, Abnahme #1.

**Dateien/Anker:** `grep -n "#egDetail{align-items\|id=\"egDetail\"" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: CSS-Regel Zeile 3036 (innerhalb `@media(min-width:1024px){` ab Zeile 3035), HTML-Div Zeile 4151.

**Schritte:**

- [ ] **1.1** `grep`-Befehl oben ausführen, beide Fundstellen bestätigen.
- [ ] **1.2 — CSS: `background:transparent;pointer-events:none` entfernen**, Rest der Regel bleibt:
```css
/* Ist: */
@media(min-width:1024px){
  #egDetail{align-items:stretch;justify-content:flex-end;background:transparent;pointer-events:none}
  #egDetail .modal{width:460px;max-width:460px;height:100dvh;max-height:100dvh;border-radius:0;
    border-left:1px solid var(--hair);box-shadow:-12px 0 44px rgba(31,28,28,.16);transform:translateX(28px)}
  #egDetail.open .modal{transform:none;pointer-events:auto}
}
/* Soll: */
@media(min-width:1024px){
  #egDetail{align-items:stretch;justify-content:flex-end}
  #egDetail .modal{width:460px;max-width:460px;height:100dvh;max-height:100dvh;border-radius:0;
    border-left:1px solid var(--hair);box-shadow:-12px 0 44px rgba(31,28,28,.16);transform:translateX(28px)}
  #egDetail.open .modal{transform:none;pointer-events:auto}
}
```
  (Hintergrund und `pointer-events` bleiben jetzt der Basis-Regel `.overlay`/`.overlay.open` überlassen, die bereits einen korrekten dunklen Backdrop + Klick-Toggle liefert — analog zu `#dbDetail`, das dieses Muster nie überschrieben hat.)
- [ ] **1.3 — HTML: Backdrop-Klick-Handler additiv ergänzen:**
```html
<!-- Ist: -->
<div class="overlay" id="egDetail" role="dialog" aria-modal="true" aria-label="Anfrage-Detail">
<!-- Soll: -->
<div class="overlay" id="egDetail" role="dialog" aria-modal="true" aria-label="Anfrage-Detail" onclick="if(event.target===this)dismissDetail()">
```
- [ ] **1.4** Standard-Verifikation bei 390px UND 1440px: `#egDetail` öffnen (z. B. Klick auf eine beliebige Eingang-Zeile) am Desktop (≥1024px) → Hintergrund sichtbar abgedunkelt, Klick auf den abgedunkelten Bereich schließt die Leiste, Escape schließt sie ebenfalls (bereits zentral verdrahtet, unverändert), Browser-Zurück schließt sie (`pushDetailState()`/`dismissDetail()`, unverändert). `#dbDetail`/`#rsDetail` exakt unverändert gegentesten (deren eigene `aria-modal="false"`-Semantik bzw. Close-Button ist von diesem Fix nicht betroffen).

**Sichtprüfung:** `#egDetail` verhält sich jetzt wie ein echter Dialog — abgedunkelter Hintergrund, Klick-weg-Schließen, kein `pointer-events:none` auf Inhalte dahinter solange `.open` gesetzt ist. Visuell an Kopf/Inhalt der Leiste selbst ändert sich noch nichts (das ist Task 3).

**Commit:** `fix: #egDetail — echter Backdrop statt transparent/pointer-events:none, Klick-weg-Schließen ergänzt (Runde 6 Punkt 1, §1/§7.1)`

---

# Task 2 — Datenmodell-Fundament (additiv)

**Lane:** `claude-implementer` (vollständig vorgezeichnete Funktionen aus der Spec wörtlich übernommen, additive Seed-Felder nach exakter Tabelle, ein 1-Zeilen-Fix)

**Abhängigkeit:** keine inhaltliche Abhängigkeit von Task 1, rein additiv — kein bestehender Aufrufer liest die neuen Felder/Funktionen in diesem Task, daher unsichtbar/wirkungslos bis Task 3/4/5/6 sie konsumieren. Bootet unverändert.

**Bezug:** Spec §5.1–§5.4 (Datenmodell + Seeds), §7.4 (Checkliste), §5.2 (Surgical-Read-Fix `renderFallakte()`).

**Dateien/Anker:** `grep -n "const TEAM_ACHSE\|function sterneAusSignal\|^let eingang=\[\|sterneHtml(sterneVon(\{personId:f.personId\}))" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `TEAM_ACHSE` Zeile 4328, `erkenneSignale()` Zeile 4723–4741, `sterneAusSignal()` Zeile 4743–4747, `eingang[]`-Seeds Zeile 4238–4247, `renderFallakte()`-Zeile mit `sterneHtml(sterneVon(...))` Zeile 6769.

**Schritte:**

- [ ] **2.1** `grep`-Befehl oben ausführen, alle vier Fundstellen bestätigen.

- [ ] **2.2 — `erkenneSignale()`: additives Feld `sig.unsicher`** (ein neues Feld am Rückgabe-Objekt, keine Änderung bestehender Felder):
```js
// Ist:
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
// Soll:
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
  const unsicher=/vermutlich|vielleicht|eventuell|evtl\.?|möglicherweise/i.test(s);
  return {
    premium:premium,
    kostentraeger:kt,
    absage:absage,
    konkret:!absage&&konkret,
    dringlichkeit:fristMatch?fristMatch[0]:null,
    unsicher:unsicher
  };
}
```

- [ ] **2.3 — neue Funktion `egVollstaendigkeit(m)` einfügen**, direkt nach `function sterneAusSignal(sig){...}`:
```js
function sterneAusSignal(sig){
  if(sig.absage)return 1;
  if(sig.konkret)return sig.premium?4:3;
  return 2;
}
/* Runde 6 Punkt 1 (§7.4): Vollständigkeits-Checkliste — 4 Prüfpunkte je Eingang-Anfrage,
   konsumiert von openEgDetail() (Task 3) und uebernehmen() (Task 3, f.rueckfragen). */
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

- [ ] **2.4 — `GRUPPEN`-Ableitung + Helper einfügen**, direkt nach der `TEAM_ACHSE`-Zeile:
```js
// Ist:
const TEAM_ACHSE={"S. Koordination":["Orthopädie","Innere"],"M. Belegung":["Neurologie","Geriatrie"],"Recovery Manager":["SalutoCare"],"T. Abrechnung":[]};
/* Task 2.1 (Punkt 1): #egDetail — gemeinsamer Schließ-Helper für die drei rechts angedockten
// Soll:
const TEAM_ACHSE={"S. Koordination":["Orthopädie","Innere"],"M. Belegung":["Neurologie","Geriatrie"],"Recovery Manager":["SalutoCare"],"T. Abrechnung":[]};
/* Runde 6 Punkt 1 (§5.3): GRUPPEN — reine Ableitung aus TEAM_ACHSE, keine neue Mitgliederliste,
   keine Änderung an TEAM_ACHSE selbst. */
const GRUPPEN=Array.from(new Set(Object.values(TEAM_ACHSE).flat()));
function gruppenMitglieder(g){ return TEAM.filter(t=>(TEAM_ACHSE[t]||[]).includes(g)); }
function egGruppenPoolGroesse(g){ return eingang.filter(m=>!m.done&&m.gruppe===g).length; }
/* Task 2.1 (Punkt 1): #egDetail — gemeinsamer Schließ-Helper für die drei rechts angedockten
```
  (Nur die neuen drei Zeilen werden zwischen die bestehende `TEAM_ACHSE`-Zeile und den bestehenden Kommentar `/* Task 2.1 ... */` eingefügt — beide bestehenden Zeilen bleiben wörtlich erhalten, nur zur eindeutigen Verortung hier mit abgebildet.)

- [ ] **2.5 — Seeds: additive Felder an bestehenden Einträgen 101/102/103 + zwei neue Einträge 109/110** (Reihenfolge/Inhalt exakt nach Spec §5.4-Tabelle; 104–108 bleiben wörtlich unverändert):
```js
// Ist:
let eingang=[
 {id:101,kanal:"Telefon",tit:"Anruf: Ehefrau fragt für Mann (72) nach Reha nach Herz-OP",txt:"Nummer notiert, möchte Rückruf heute. Vermutlich PKV.",zeit:"vor 25 Min.",achse:"Innere",done:false,typ:"qualifiziert",wer:"Ehefrau fragt für Mann (72)",zusammenfassung:"Ehefrau fragt telefonisch für ihren Mann (72) nach Reha nach Herz-OP — PKV, Rückruf heute gewünscht."},
 {id:102,kanal:"Zuweiser-Fax",tit:"Fax: RHÖN Bad Neustadt, Anmeldung AHB nach Schlaganfall",txt:"Patient (68), PKV, Entlassung in 4 Tagen. Unterlagen anbei.",zeit:"vor 1 Std.",achse:"Neurologie",done:false,typ:"qualifiziert",wer:"Sozialdienst RHÖN Bad Neustadt meldet Patient (68) nach Schlaganfall an",zusammenfassung:"Sozialdienst RHÖN Bad Neustadt meldet einen Patienten (68) nach Schlaganfall zur AHB an — PKV, Entlassung in 4 Tagen."},
 {id:103,kanal:"Website",tit:"Website-Formular: Selbstzahlerin (55) fragt nach Premium-Reha",txt:"Interessiert an Suite, fragt nach Preisen und freien Terminen.",zeit:"vor 2 Std.",achse:"SalutoCare",done:false,typ:"qualifiziert",wer:"Selbstzahlerin fragt selbst nach Premium-Suite (55)",zusammenfassung:"Selbstzahlerin (55) fragt über die Website nach der Premium-Suite — interessiert an Preisen und freien Terminen."},
 {id:104,kanal:"E-Mail",tit:"E-Mail: Hausarzt Dr. Sommer empfiehlt Patientin (79)",txt:"Geriatrische Reha angefragt, Beihilfe, Tochter koordiniert.",zeit:"gestern",achse:"Geriatrie",done:true,typ:"qualifiziert",wer:"Hausarzt Dr. Sommer empfiehlt Patientin (79), Tochter koordiniert",zusammenfassung:"Hausarzt Dr. Sommer empfiehlt seine Patientin (79) für eine geriatrische Reha — Beihilfe, Tochter koordiniert die Aufnahme."},
 {id:105,kanal:"Recare",tit:"Recare: Klinikum Fulda sucht Neuro-Reha-Platz",txt:"GKV + Komfort-Wunsch, Übernahme in 6 Tagen möglich.",zeit:"gestern",achse:"Neurologie",done:true,typ:"qualifiziert",wer:"Entlassmanagement Klinikum Fulda sucht Reha-Platz",zusammenfassung:"Entlassmanagement Klinikum Fulda sucht über Recare einen Neuro-Reha-Platz — GKV mit Komfort-Wunsch, Übernahme in 6 Tagen möglich."},
 {id:106,kanal:"PRIMO MEDICO",tit:"PRIMO MEDICO: internationale Premium-Anfrage",txt:"Familie fragt für Vater (64) nach Intensiv-Reha mit Beatmung.",zeit:"vor 2 Tagen",achse:"SalutoCare",done:true,typ:"qualifiziert",wer:"Familie fragt für Vater (64)",zusammenfassung:"Familie fragt über PRIMO MEDICO für ihren Vater (64) nach Intensiv-Reha mit Beatmung — internationale Premium-Anfrage."}
 ,{id:107,einzelperson:true,pName:"Carola Diehm",kanal:"Website",tit:"Broschüre-Download: Interessentin (57) lädt Reha-Broschüre",txt:"E-Mail hinterlegt, Kontaktfreigabe erteilt. Keine konkrete Anfrage.",zeit:"vor 40 Min.",achse:"Orthopädie",done:false,typ:"passiv",zusammenfassung:"Interessentin (57) lädt die Reha-Broschüre herunter und erteilt Kontaktfreigabe — noch keine konkrete Anfrage."}
 ,{id:108,einzelperson:false,kanal:"E-Mail",tit:"Lose Mail: Habt ihr eigentlich freie Plätze?",txt:"Einmalige Frage, kein Name, keine Unterlagen, kein Follow-up.",zeit:"vor 3 Std.",achse:"Innere",done:false,typ:"passiv",zusammenfassung:"Anonyme Anfrage per E-Mail nach freien Plätzen — kein Name, kein Follow-up erkennbar."}
];
// Soll:
let eingang=[
 {id:101,kanal:"Telefon",tit:"Anruf: Ehefrau fragt für Mann (72) nach Reha nach Herz-OP",txt:"Nummer notiert, möchte Rückruf heute. Vermutlich PKV.",zeit:"vor 25 Min.",achse:"Innere",done:false,typ:"qualifiziert",wer:"Ehefrau fragt für Mann (72)",zusammenfassung:"Ehefrau fragt telefonisch für ihren Mann (72) nach Reha nach Herz-OP — PKV, Rückruf heute gewünscht.",gruppe:null,sterne:null,autoVerteilt:false},
 {id:102,kanal:"Zuweiser-Fax",tit:"Fax: RHÖN Bad Neustadt, Anmeldung AHB nach Schlaganfall",txt:"Patient (68), PKV, Entlassung in 4 Tagen. Unterlagen anbei.",zeit:"vor 1 Std.",achse:"Neurologie",done:false,typ:"qualifiziert",wer:"Sozialdienst RHÖN Bad Neustadt meldet Patient (68) nach Schlaganfall an",zusammenfassung:"Sozialdienst RHÖN Bad Neustadt meldet einen Patienten (68) nach Schlaganfall zur AHB an — PKV, Entlassung in 4 Tagen.",gruppe:"Neurologie",sterne:null,autoVerteilt:true,saluto:false,hinweis:""},
 {id:103,kanal:"Website",tit:"Website-Formular: Selbstzahlerin (55) fragt nach Premium-Reha",txt:"Interessiert an Suite, fragt nach Preisen und freien Terminen.",zeit:"vor 2 Std.",achse:"SalutoCare",done:false,typ:"qualifiziert",wer:"Selbstzahlerin fragt selbst nach Premium-Suite (55)",zusammenfassung:"Selbstzahlerin (55) fragt über die Website nach der Premium-Suite — interessiert an Preisen und freien Terminen.",gruppe:null,sterne:null,autoVerteilt:false},
 {id:104,kanal:"E-Mail",tit:"E-Mail: Hausarzt Dr. Sommer empfiehlt Patientin (79)",txt:"Geriatrische Reha angefragt, Beihilfe, Tochter koordiniert.",zeit:"gestern",achse:"Geriatrie",done:true,typ:"qualifiziert",wer:"Hausarzt Dr. Sommer empfiehlt Patientin (79), Tochter koordiniert",zusammenfassung:"Hausarzt Dr. Sommer empfiehlt seine Patientin (79) für eine geriatrische Reha — Beihilfe, Tochter koordiniert die Aufnahme."},
 {id:105,kanal:"Recare",tit:"Recare: Klinikum Fulda sucht Neuro-Reha-Platz",txt:"GKV + Komfort-Wunsch, Übernahme in 6 Tagen möglich.",zeit:"gestern",achse:"Neurologie",done:true,typ:"qualifiziert",wer:"Entlassmanagement Klinikum Fulda sucht Reha-Platz",zusammenfassung:"Entlassmanagement Klinikum Fulda sucht über Recare einen Neuro-Reha-Platz — GKV mit Komfort-Wunsch, Übernahme in 6 Tagen möglich."},
 {id:106,kanal:"PRIMO MEDICO",tit:"PRIMO MEDICO: internationale Premium-Anfrage",txt:"Familie fragt für Vater (64) nach Intensiv-Reha mit Beatmung.",zeit:"vor 2 Tagen",achse:"SalutoCare",done:true,typ:"qualifiziert",wer:"Familie fragt für Vater (64)",zusammenfassung:"Familie fragt über PRIMO MEDICO für ihren Vater (64) nach Intensiv-Reha mit Beatmung — internationale Premium-Anfrage."}
 ,{id:107,einzelperson:true,pName:"Carola Diehm",kanal:"Website",tit:"Broschüre-Download: Interessentin (57) lädt Reha-Broschüre",txt:"E-Mail hinterlegt, Kontaktfreigabe erteilt. Keine konkrete Anfrage.",zeit:"vor 40 Min.",achse:"Orthopädie",done:false,typ:"passiv",zusammenfassung:"Interessentin (57) lädt die Reha-Broschüre herunter und erteilt Kontaktfreigabe — noch keine konkrete Anfrage."}
 ,{id:108,einzelperson:false,kanal:"E-Mail",tit:"Lose Mail: Habt ihr eigentlich freie Plätze?",txt:"Einmalige Frage, kein Name, keine Unterlagen, kein Follow-up.",zeit:"vor 3 Std.",achse:"Innere",done:false,typ:"passiv",zusammenfassung:"Anonyme Anfrage per E-Mail nach freien Plätzen — kein Name, kein Follow-up erkennbar."}
 ,{id:109,kanal:"Zuweiser-Fax",tit:"Fax: Sozialdienst Klinikum Hammelburg, Anmeldung AHB nach Knie-TEP",txt:"Patient (66), GKV, Entlassung in 5 Tagen. Unterlagen vollständig beigefügt.",zeit:"vor 50 Min.",achse:"Orthopädie",done:false,typ:"qualifiziert",wer:"Sozialdienst Klinikum Hammelburg meldet Patient (66) nach Knie-TEP an",zusammenfassung:"Sozialdienst Klinikum Hammelburg meldet einen Patienten (66) nach Knie-TEP zur AHB an — GKV, Entlassung in 5 Tagen.",gruppe:"Orthopädie",sterne:null,autoVerteilt:true,saluto:false,hinweis:""}
 ,{id:110,kanal:"Recare",tit:"Recare: Entlassmanagement Bad Kissingen sucht Geriatrie-Reha-Platz",txt:"Patientin (81), Beihilfe, Übernahme in 6 Tagen möglich.",zeit:"vor 90 Min.",achse:"Geriatrie",done:false,typ:"qualifiziert",wer:"Entlassmanagement Bad Kissingen sucht Reha-Platz für Patientin (81)",zusammenfassung:"Entlassmanagement Bad Kissingen sucht über Recare einen Geriatrie-Reha-Platz für eine Patientin (81) — Beihilfe, Übernahme in 6 Tagen möglich.",gruppe:"Geriatrie",sterne:null,autoVerteilt:true,saluto:false,hinweis:""}
];
```
  (104–108 wörtlich unverändert übernommen. 101/103 erhalten nur `gruppe:null,sterne:null,autoVerteilt:false` — bewusst **kein** explizites `saluto`/`hinweis`, das übernimmt die Lazy-Init in `openEgDetail()`, Task 3.6. 102/109/110 erhalten zusätzlich `saluto:false,hinweis:""` explizit, wie in der Spec-Tabelle gefordert.)

- [ ] **2.6 — Surgical-Read-Fix `renderFallakte()`** (eine Zeile, Priorität Fall-Override vor Personen-Wert vor Default):
```js
// Ist:
    +sterneHtml(sterneVon({personId:f.personId}))
// Soll:
    +sterneHtml(f.sterne!=null?f.sterne:sterneVon({personId:f.personId}))
```
- [ ] **2.7** `grep -n "gruppe:null\|autoVerteilt:true\|const GRUPPEN\|function egVollstaendigkeit" index.html` ausführen — erwartet: 2× `gruppe:null` (101, 103), 3× `autoVerteilt:true` (102, 109, 110), je 1× `GRUPPEN`/`egVollstaendigkeit`.
- [ ] **2.8** Standard-Verifikation bei 390px UND 1440px: Eingang-Liste sieht optisch **exakt unverändert** aus (die neuen Felder werden von keiner bestehenden Funktion gelesen), 0 Console-Errors, Fallakte eines Bestandsfalls (ohne `f.sterne`) zeigt weiterhin den alten Default-Stern-Wert (Fallback greift).

**Sichtprüfung:** Visuell ändert sich in diesem Task **nichts** — reine additive Vorbereitung. In der Browser-Konsole bestätigen: `GRUPPEN` ergibt `["Orthopädie","Innere","Neurologie","Geriatrie","SalutoCare"]`, `egGruppenPoolGroesse("Neurologie")` ergibt `1` (id 102), `egVollstaendigkeit(eingang.find(m=>m.id===101))` liefert ein Array mit 4 Objekten, mindestens eines mit `ok:false`.

**Commit:** `feat: Datenmodell-Fundament Anfrage-Triage — GRUPPEN-Ableitung, egVollstaendigkeit(), sig.unsicher, additive Seeds (109/110 + Felder auf 101/102/103), Sterne-Override-Fallback in renderFallakte() (Runde 6 Punkt 1, §5)`

---

# Task 3 — Kern-Umbau `#egDetail` (atomar)

**Lane:** `claude-implementer-pro` (größter Task: Logik-Neuaufbau mit Edge-Cases — `klassifiziereEingang()`, `openEgDetail()`-Neuaufbau, `simulateInbound()`-Ersatz, `uebernehmen()`-Diff, plus die zwei oben ausformulierten offenen Punkte a/b)

**Abhängigkeit:** braucht Task 2 (`GRUPPEN`, `egGruppenPoolGroesse()`, `egVollstaendigkeit()`, `sig.unsicher`, Seed-Felder).

**Warum atomar:** siehe „Zuschnitts-Begründung" oben — alle sechs Fundstellen von `egOwner`/`egSaluto`/`egHinweis`/`egSetOwner()`/`ownerVorschlag()` müssen im selben Commit verschwinden.

**Bezug:** Spec §6, §6.1, §7.2–§7.6, §7.10, §9 (Zu entfernende JS-Symbole).

**Dateien/Anker:** `grep -n "function egZusammenfassung\|function egSummaryHtml\|function openEgDetail\|function egSetOwner\|function egToggleSaluto\|function ownerVorschlag\|let egOwner\|let egSaluto\|function simulateInbound\|function uebernehmen\|function sterneAusSignal\|function egVollstaendigkeit" index.html` vor Bearbeitung ausführen und **alle** Zeilenangaben neu bestätigen. Bei Plan-Erstellung (nach Task 1/2, Zeilen verschieben sich um die dort hinzugefügten ~25 Zeilen):
- `egZusammenfassung()`: Zeile 4339
- `egSummaryHtml()`: Zeile 4344–4371
- `openEgDetail()`: Zeile 4375–4408
- `egSetOwner()`/`egToggleSaluto()`/`ownerVorschlag()`: Zeile 4409–4417
- `let egOwner=null,_egId=null;`: Zeile 4664, `let egSaluto=false,egHinweis="";`: Zeile 4666
- `simulateInbound()`: Zeile 4759–4789 (inkl. `INBOUND_POOL`-Nutzung, `_inbId`/`_inbN`)
- `uebernehmen()`: Zeile 4802–4815

**Schritte:**

- [ ] **3.1** Alle `grep`-Befehle oben ausführen, jede der sechs Fundstellen aus der Zuschnitts-Tabelle einzeln im Editor öffnen und den kompletten Funktionskörper neu lesen.

- [ ] **3.2 — neue Funktion `klassifiziereEingang(m)` einfügen**, direkt nach `egVollstaendigkeit(m)` (aus Task 2.3):
```js
function klassifiziereEingang(m){
  if(m.typ==="passiv") return "passiv";
  const sig=erkenneSignale(m.txt);
  if(!m.achse||m.achse==="Unklar") return "entscheidung";
  if(m.achse==="SalutoCare"||sig.premium) return "entscheidung";
  if(!sig.kostentraeger||sig.unsicher) return "entscheidung";
  if(sig.absage) return "entscheidung";
  return "auto";
}
```

- [ ] **3.3 — Sterne-Widget-Helper `egtSterneHtml(m,sig)` + `egSterneUeberschreiben(id,n)` einfügen**, direkt nach `egZusammenfassung(m)` und vor `egSummaryHtml(m)` (löst offenen Punkt (a) — fünf einzeln klickbare Sterne-Buttons):
```js
/* Runde 6 Punkt 1 (§7.2, offener Punkt a): Sterne-Vorschlag-Widget in #egDetail — fünf einzeln
   klickbare Sterne (nicht ein einziges Span), je mit eigenem onclick/aria-label. Override gewinnt
   über den aus erkenneSignale() abgeleiteten Vorschlag. */
function egtSterneHtml(m,sig){
  const n=m.sterne!=null?m.sterne:sterneAusSignal(sig);
  const grund=[sig.kostentraeger?sig.kostentraeger+" erkannt":null,sig.dringlichkeit?"Frist "+sig.dringlichkeit:null,sig.konkret?"konkrete Anfrage":null].filter(Boolean).join(" · ");
  let stars="";
  for(let i=1;i<=5;i++){
    stars+="<button type='button' class='egt-star"+(i<=n?" on":"")+"' onclick='egSterneUeberschreiben("+m.id+","+i+")' aria-label='"+i+" von 5 Sternen'>★</button>";
  }
  return "<div class='egt-sterne'><div class='egt-sterne-stars' role='group' aria-label='Sterne-Einstufung überschreiben'>"+stars+"</div>"
    +(grund?"<p class='egt-sterne-grund'>"+escapeHtml(grund)+"</p>":"")+"</div>";
}
function egSterneUeberschreiben(id,n){ const m=eingang.find(x=>x.id===id); if(m){m.sterne=n; openEgDetail(id);} }
```

- [ ] **3.4 — `egSummaryHtml()` vollständig restrukturieren** (§7.3: `.eg-triage`-Tabelle entfällt ersatzlos, Sterne-Widget nur im Entscheidungsfall-Zweig, Original zugeklappt):
```js
// Ist:
function egSummaryHtml(m){
 const sig=erkenneSignale(m.txt);
 const sterneBlock=sterneHtml(sterneAusSignal(sig));
 const achsePill=m.achse?"<span class='pill-a' style='background:"+(ACHSE_COL[m.achse]||"var(--unklar)")+"'>"+escapeHtml(m.achse)+"</span>":"";
 let mid;
 if(m.typ!=="passiv"){
   const inst=zuweiser.find(z=>m.txt.includes(z.name));
   const grund=[sig.kostentraeger?sig.kostentraeger+" erkannt":null,sig.dringlichkeit?"Frist "+sig.dringlichkeit:null,sig.konkret?"konkrete Anfrage":null].filter(Boolean).join(" · ");
   mid="<div class='eg-triage'>"
     +"<div class='eg-row'><div class='kicker'>Wer</div><div class='eg-v'><span class='ava'>"+initialen(m.wer||"")+"</span>"+escapeHtml(m.wer||"")+"</div></div>"
     +"<div class='eg-row'><div class='kicker'>Woher</div><div class='eg-v'>"+escapeHtml(m.kanal)+(inst?" · "+escapeHtml(inst.name):"")+"</div></div>"
     +"<div class='eg-row'><div class='kicker'>Was</div><div class='eg-v'>"+(achsePill||"—")+"</div></div>"
     +"<div class='eg-row'><div class='kicker'>Wie konkret</div><div class='eg-v'>"+sterneBlock+(grund?"<span class='eg-grund'>"+escapeHtml(grund)+"</span>":"")+"</div></div>"
     +"</div>";
 }else{
   mid="<div class='pills'>"+achsePill
     +(sig.kostentraeger?"<span class='pill-kt'>"+escapeHtml(sig.kostentraeger)+"</span>":"")
     +(sig.dringlichkeit?"<span class='due'>"+escapeHtml(sig.dringlichkeit)+"</span>":"")
     +"</div>"+sterneBlock;
 }
 return "<div class='mhead'><div class='ava'>"+initialen(m.wer||"")+"</div><div><h2>"+escapeHtml(m.wer||m.tit)+"</h2>"
   +"<div class='msub2'><span class='chtag'>"+escapeHtml(m.kanal)+"</span> · <span class='mtime'>"+escapeHtml(m.zeit)+"</span> · "
   +"<span class='typ-chip "+(m.typ==="passiv"?"passiv":"qual")+"'>"+(m.typ==="passiv"?"passiv":"qualifiziert")+"</span></div></div></div>"
   +"<div style='padding:16px 20px'>"+mid
   +"<div class='eg-zsf'><span class='kicker'>Zusammenfassung</span><p>"+escapeHtml(egZusammenfassung(m))+"</p></div>"
   +"<div class='eg-original'><span class='kicker'>Originalanfrage</span><div class='mtxt'>"+escapeHtml(m.txt)+"</div></div>"
   +(m.notiz?"<div class='mt-eingang-notiz'>Notiz: "+escapeHtml(m.notiz)+"</div>":"")+"</div>";
}
// Soll:
function egSummaryHtml(m){
 const sig=erkenneSignale(m.txt);
 const achsePill=m.achse?"<span class='pill-a' style='background:"+(ACHSE_COL[m.achse]||"var(--unklar)")+"'>"+escapeHtml(m.achse)+"</span>":"";
 let mid;
 if(m.typ==="passiv"){
   const sterneBlock=sterneHtml(sterneAusSignal(sig));
   mid="<div class='pills'>"+achsePill
     +(sig.kostentraeger?"<span class='pill-kt'>"+escapeHtml(sig.kostentraeger)+"</span>":"")
     +(sig.dringlichkeit?"<span class='due'>"+escapeHtml(sig.dringlichkeit)+"</span>":"")
     +"</div>"+sterneBlock;
 }else if(!m.done&&!m.gruppe){
   mid=egtSterneHtml(m,sig);
 }else{
   mid="";
 }
 return "<div class='mhead'><div class='ava'>"+initialen(m.wer||"")+"</div><div><h2>"+escapeHtml(m.wer||m.tit)+"</h2>"
   +"<div class='msub2'><span class='chtag'>"+escapeHtml(m.kanal)+"</span> · <span class='mtime'>"+escapeHtml(m.zeit)+"</span> · "
   +"<span class='typ-chip "+(m.typ==="passiv"?"passiv":"qual")+"'>"+(m.typ==="passiv"?"passiv":"qualifiziert")+"</span></div></div></div>"
   +"<div style='padding:16px 20px'>"+mid
   +"<div class='eg-zsf'><span class='kicker'>Zusammenfassung</span><p>"+escapeHtml(egZusammenfassung(m))+"</p></div>"
   +"<details class='egt-original'><summary class='rk'>Originalnachricht</summary><div class='eg-original'><div class='mtxt'>"+escapeHtml(m.txt)+"</div></div></details>"
   +(m.notiz?"<div class='mt-eingang-notiz'>Notiz: "+escapeHtml(m.notiz)+"</div>":"")+"</div>";
}
```
  (`.eg-zsf`/`.eg-original`-Innenoptik bleibt unverändert bestehen als Optik innerhalb des neuen `<details>` — nur die äußere Sichtbarkeit wird jetzt durch `<details>` gesteuert, analog `.pa-fold`-Muster. `zuweiser.find(...)`/`inst`/lokale `grund`-Berechnung entfallen ersatzlos, da nur noch von der gelöschten Tabelle benötigt.)

- [ ] **3.5 — `openEgDetail()` vollständig neu aufbauen** (§7.4–§7.6, löst offenen Punkt (b)):
```js
// Ist:
function openEgDetail(id){
 const m=eingang.find(x=>x.id===id);if(!m)return;
 if(_egId!==id){_egId=id;egOwner=(m.typ!=="passiv"&&!m.done)?ownerVorschlag(m.achse):null;egSaluto=m.achse==="SalutoCare";egHinweis="";}
 _closeSiblingDetailRails("egDetail");
 let actions;
 if(m.done){
   actions=m.fallId
     ?"<button class='btn-brass' onclick='openDetail("+m.fallId+")'>Fall öffnen ›</button>"
     :"<span class='ok-chip'>✓ in Datenbank</span>";
 }else if(m.typ==="passiv"){
   actions="<button class='btn-brass' onclick='inDatenbank("+m.id+")'>In Datenbank aufnehmen</button>";
 }else{
   actions="<button type='button' class='egd-saluto"+(egSaluto?" on":"")+"' onclick='egToggleSaluto("+m.id+")'>★ SalutoCare / Premium</button>"
   +"<div class='egd-owners'>"+TEAM.map(function(t,i){
     const n=faelle.filter(f=>f.owner===t&&f.status!=="Aufgenommen"&&f.status!=="Verloren").length;
     const sel=egOwner===t,vor=t===ownerVorschlag(m.achse);
     return "<button type='button' class='egd-owner"+(sel?" sel":"")+"' onclick='egSetOwner("+m.id+","+i+")'>"
       +"<span class='ava'>"+initialen(t)+"</span><span class='egd-ownername'>"+escapeHtml(t)
       +(vor?"<span class='egd-vorschlag'>Vorschlag — Achse "+escapeHtml(m.achse)+", geringste Auslastung</span>":"")
       +"</span><span class='egd-load'>"+n+" offene "+(n===1?"Fall":"Fälle")+"</span></button>";
   }).join("")+"</div>"
   +"<label class='kicker' style='margin-top:10px;display:block'>Hinweis für die Bearbeitung (optional)</label>"
   +"<textarea id='egdHinweis' class='rsz-textarea' placeholder='Worauf muss geachtet werden?' oninput='egHinweis=this.value'>"+escapeHtml(egHinweis)+"</textarea>"
   +"<button class='btn-brass' style='width:100%;margin-top:4px' onclick='uebernehmen("+m.id+",egOwner)'>Als Fall anlegen &amp; zuordnen</button>"
   +"<button class='btn-ghost' style='width:100%' onclick='antwortenEingang("+m.id+",egOwner)'>✉ Antworten</button>";
 }
 document.getElementById("egdBody").innerHTML=egSummaryHtml(m)
   +"<div class='mfoot' style='flex-direction:column;align-items:stretch;gap:8px'>"+actions
   +"<button class='btn-ghost' onclick='dismissDetail()'>‹ Zurück</button></div>";
 document.getElementById("egDetail").classList.add("open");
 document.body.classList.add("detail-open");
 if(!matchMedia("(min-width:1024px)").matches)document.body.classList.add("locked");
 pushDetailState();
}
// Soll:
function openEgDetail(id){
 const m=eingang.find(x=>x.id===id);if(!m)return;
 if(m.saluto===undefined)m.saluto=(m.achse==="SalutoCare");
 if(m.hinweis===undefined)m.hinweis="";
 if(_egId!==id){_egId=id;egGruppe=null;}
 _closeSiblingDetailRails("egDetail");
 let actions;
 if(m.done){
   actions=m.fallId
     ?"<button class='btn-brass' onclick='openDetail("+m.fallId+")'>Fall öffnen ›</button>"
     :"<span class='ok-chip'>✓ in Datenbank</span>";
 }else if(m.typ==="passiv"){
   actions="<button class='btn-brass' onclick='inDatenbank("+m.id+")'>In Datenbank aufnehmen</button>";
 }else if(m.gruppe){
   actions="<div class='egt-verteilt'>Im Pool von <b>"+escapeHtml(m.gruppe)+"</b> — wartet auf Übernahme"+(m.autoVerteilt?" (automatisch verteilt)":" (zugewiesen)")+"</div>";
 }else{
   const check=egVollstaendigkeit(m);
   actions="<div class='egt-check'>"+check.map(function(c){
     return "<div class='egt-check-item "+(c.ok?"ok":"missing")+"'><span class='egt-check-ic'>"+(c.ok?"✓":"✗")+"</span>"
       +"<span class='egt-check-lbl'>"+escapeHtml(c.label)+"</span>"
       +(c.ok?"<span class='egt-check-val'>"+escapeHtml(c.wert)+"</span>":"<span class='egt-check-frage'>"+escapeHtml(c.frage)+"</span>")
       +"</div>";
   }).join("")+"</div>"
   +"<button type='button' class='egd-saluto"+(m.saluto?" on":"")+"' onclick='egToggleSaluto("+m.id+")'>★ SalutoCare / Premium</button>"
   +"<div class='egt-groups'>"+GRUPPEN.map(function(g){
     const sel=egGruppe===g, n=egGruppenPoolGroesse(g);
     return "<button type='button' class='egt-group"+(sel?" sel":"")+"' onclick='egGruppeWaehlen("+m.id+",\""+g+"\")'>"
       +"<span class='egt-group-name'>"+escapeHtml(g)+"</span>"
       +"<span class='egt-group-pool'>"+n+" offen</span></button>";
   }).join("")+"</div>"
   +"<label class='kicker' style='margin-top:10px;display:block'>Hinweis für die Bearbeitung (optional)</label>"
   +"<textarea id='egdHinweis' class='rsz-textarea' placeholder='Worauf muss geachtet werden?' oninput='egHinweisSetzen("+m.id+",this.value)'>"+escapeHtml(m.hinweis)+"</textarea>"
   +"<button class='btn-brass' style='width:100%;margin-top:4px' onclick='egFreigeben("+m.id+")'>Gruppe zuweisen &amp; freigeben</button>";
 }
 document.getElementById("egdBody").innerHTML=egSummaryHtml(m)
   +"<div class='mfoot' style='flex-direction:column;align-items:stretch;gap:8px'>"+actions
   +"<button class='btn-ghost' onclick='dismissDetail()'>‹ Zurück</button></div>";
 document.getElementById("egDetail").classList.add("open");
 document.body.classList.add("detail-open");
 if(!matchMedia("(min-width:1024px)").matches)document.body.classList.add("locked");
 pushDetailState();
}
```
  Beachten: die alte `_egId!==id`-Reset-Bedingung wird **nicht** entfernt, sondern auf `egGruppe` verengt (verhindert, dass eine beim Wechsel zu einer anderen Anfrage stehengebliebene Gruppen-Auswahl versehentlich mit „Gruppe zuweisen & freigeben" auf die falsche Anfrage angewendet wird). `m.saluto`/`m.hinweis` werden dagegen **nicht** bei jedem Zeilenwechsel zurückgesetzt — sie leben dauerhaft auf `m` (Kernpunkt der Spec, §7.5). Der alte „✉ Antworten"-Button entfällt aus dem Entscheidungsfall-Zweig ersatzlos (Spec §4, Nicht-Ziele: `antwortenEingang()` bleibt als Funktion bestehen, verliert nur diesen Aufrufort).

- [ ] **3.6 — alten Owner-Block (Zeile 4409–4417 im Ist-Stand) durch die neuen Gruppen-/Saluto-/Hinweis-Funktionen ersetzen:**
```js
// Ist:
function egSetOwner(id,idx){ egOwner=TEAM[idx]; openEgDetail(id); }
function egToggleSaluto(id){ egSaluto=!egSaluto; openEgDetail(id); }
function ownerVorschlag(achse){
  const kandidaten=TEAM.filter(t=>(TEAM_ACHSE[t]||[]).includes(achse));
  if(!kandidaten.length)return"S. Koordination";
  const zaehlung=kandidaten.map(t=>({t:t,n:faelle.filter(f=>f.owner===t&&f.status!=="Aufgenommen"&&f.status!=="Verloren").length}));
  zaehlung.sort((a,b)=>a.n-b.n);
  return zaehlung[0].t;
}
// Soll:
function egGruppeWaehlen(id,g){ egGruppe=g; openEgDetail(id); }
function egToggleSaluto(id){ const m=eingang.find(x=>x.id===id); if(!m)return; m.saluto=!m.saluto; openEgDetail(id); }
function egHinweisSetzen(id,val){ const m=eingang.find(x=>x.id===id); if(m) m.hinweis=val; }
function egFreigeben(id){
  const m=eingang.find(x=>x.id===id); if(!m||!egGruppe) return;
  m.gruppe=egGruppe; m.autoVerteilt=false;
  renderEingang(); openEgDetail(id);
}
```
  (`egSetOwner()` und `ownerVorschlag()` werden vollständig entfernt — beide sind nach diesem Task komplett unbenutzt, siehe Spec §9. `egToggleSaluto()` bleibt namensgleich bestehen, nur ihr Rumpf ändert sich von global auf `m.saluto`.)

- [ ] **3.7 — globale Deklaration umbauen:**
```js
// Ist:
/* Task 2.1 (Punkt 1): #egDetail-State — aktuell offene Eingangs-Zeile + gewählter Owner */
let egOwner=null,_egId=null;
/* Task 1.3 (Punkt 2): SalutoCare-Toggle + Bearbeitungs-Hinweis bei der Eingangs-Zuordnung */
let egSaluto=false,egHinweis="";
// Soll:
/* Runde 6 Punkt 1 (§7.5): #egDetail-State — aktuell offene Eingangs-Zeile + gewählte Gruppe
   (vor Freigeben). Saluto/Hinweis leben jetzt direkt auf dem eingang[]-Objekt (m.saluto/m.hinweis),
   keine transienten globalen Zwischenspeicher mehr — sie müssen den Zeitversatz zwischen
   Leiter-Freigabe und späterer Koordinatorin-Übernahme überstehen. */
let egGruppe=null,_egId=null;
```

- [ ] **3.8 — `simulateInbound()` vollständig ersetzen** (§6.1 — alter Direktanlage-Zweig entfällt ersatzlos, inkl. `ownerVorschlag(t.achse)`-Aufruf, `findeOderErstellePerson(...)`, `pHist(...)`, `faelle.push(...)`):
```js
// Ist:
function simulateInbound(){
 const t=INBOUND_POOL[_inbN%INBOUND_POOL.length];_inbN++;
 const mid=_inbId++;
 eingang.unshift({id:mid,kanal:t.kanal,tit:t.tit,txt:t.txt,zeit:"gerade eben",achse:t.achse,done:false,typ:"qualifiziert",wer:t.wer||"",zusammenfassung:t.zusammenfassung,_neu:true});
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
     status:"Neu",owner:ownerVorschlag(t.achse),aufgabe:STATUS_AUFGABE["Neu"],frist:dstr(0),saluto:t.achse==="SalutoCare",
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
// Soll:
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
  **Bekannter, bewusst nicht behobener Nebeneffekt** (Spec §6.1): Mit den drei bestehenden `INBOUND_POOL`-Einträgen klassifizieren aktuell alle drei als `"entscheidung"` — `simulateInbound()` demonstriert damit live nur den Entscheidungsfall-Toast, nie den Auto-Toast. Der Auto-Pfad ist bereits über die Seeds 102/109/110 abgedeckt (Task 2). Kein zusätzlicher Handlungsbedarf. `findeOderErstellePerson()` bleibt als Funktion unangetastet stehen (verliert ihre einzige Aufrufstelle, ist generische Infrastruktur außerhalb des Zuschnitts dieser Runde, kein Löschauftrag).

- [ ] **3.9 — `uebernehmen()`-Diff anwenden** (§7.10):
```js
// Ist:
function uebernehmen(id,owner){
  const m=eingang.find(x=>x.id===id);if(!m||m.done)return;
  owner=owner||TEAM[0];
  m.done=true;
  const fid=Math.max(...faelle.map(x=>x.id))+1;
  const _log=[[dstr(0),"Aus Eingang übernommen ("+m.kanal+"): "+m.tit+" — zugewiesen an "+owner]];
  if(egHinweis)_log.push([dstr(0),"[Hinweis bei Zuordnung] "+egHinweis]);
  faelle.push({id:fid,name:"Neuer Fall (aus Eingang)",alter:null,rolle:"offen",kanal:m.kanal,quelle:m.tit.split(":")[1]?m.tit.split(":")[1].trim():m.kanal,
    achse:m.achse,kt:"Unklar",status:"Neu",owner:owner,aufgabe:STATUS_AUFGABE["Neu"],frist:dstr(0),
    saluto:egSaluto,zuordnungsHinweis:egHinweis||"",docs:[false,false,false,false],kosten:"offen",consent:"offen",verlust:"",reaktion:null,
    log:_log});
  m.fallId=fid;
  renderAll();openDetail(fid);
}
// Soll:
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

- [ ] **3.10 — neuer CSS-Block vor `</style>`** (`.egt-*`-Namespace: Sterne-Widget, Checkliste, Gruppen-Buttons, Verteilt-Lesezweig):
```css
/* Runde 6 Punkt 1 (§7.2–§7.6): .egt-* — Anfrage-Triage-Werkzeug in #egDetail, ersetzt das alte
   personenbasierte .egd-owners-Modell durch Sterne-Override + Vollständigkeits-Checkliste +
   Gruppen-Zuordnung + Verteilt-Lesezweig. .egd-saluto bleibt unverändert bestehen (nur die
   Datenquelle wechselt von der globalen egSaluto auf m.saluto, s. Plan Task 3.5). */
.egt-sterne{margin:2px 0 14px}
.egt-sterne-stars{display:flex;gap:2px}
.egt-star{background:transparent;border:0;padding:2px;font-size:22px;line-height:1;color:var(--hair2);cursor:pointer;min-width:32px;min-height:32px}
.egt-star.on{color:var(--brass)}
@media(hover:hover){.egt-star:hover{color:var(--brass-deep)}}
.egt-star:focus-visible{outline:2px solid var(--brass);outline-offset:2px;border-radius:4px}
.egt-sterne-grund{margin:4px 0 0;font-size:12px;color:var(--muted)}
.egt-check{display:flex;flex-direction:column;gap:8px;margin:10px 0 14px}
.egt-check-item{display:flex;align-items:center;gap:8px;font-size:13px;padding:8px 10px;border-radius:8px;background:var(--paper2);border:1px solid var(--hair)}
.egt-check-item.ok .egt-check-ic{color:var(--sage-deep)}
.egt-check-item.missing .egt-check-ic{color:var(--alert)}
.egt-check-ic{font-weight:700;width:16px;flex-shrink:0;text-align:center}
.egt-check-lbl{font-weight:600;color:var(--ink-soft)}
.egt-check-val{margin-left:auto;color:var(--muted)}
.egt-check-frage{margin-left:auto;color:var(--brass-deep);font-size:12px}
.egt-groups{display:flex;flex-direction:column;gap:8px;margin:10px 0}
.egt-group{display:flex;align-items:center;justify-content:space-between;width:100%;text-align:left;background:var(--paper);
  border:1px solid var(--hair);border-radius:12px;padding:10px 12px;font:inherit;color:inherit;cursor:pointer;min-height:44px}
.egt-group.sel{border-color:var(--brass);background:var(--brass-soft)}
.egt-group-name{font-weight:600}
.egt-group-pool{font-size:12.5px;color:var(--muted)}
.egt-verteilt{padding:12px 14px;background:var(--paper2);border:1px solid var(--hair);border-radius:8px;font-size:13.5px;color:var(--ink-soft)}
```

- [ ] **3.11** `grep -n "egOwner\|egSaluto\b\|egHinweis\b\|egSetOwner\|ownerVorschlag" index.html` erneut ausführen — **kein** Treffer mehr im gesamten Dokument (die alten Symbole sind vollständig entfernt).
- [ ] **3.12** Standard-Verifikation bei 390px UND 1440px, **ausführlich** (dieser Task ist der riskanteste): Anfrage 101 öffnen → Sterne-Widget mit 5 klickbaren Sternen (Hover-Farbwechsel am Desktop, sichtbarer Fokus-Ring per Tab-Taste), Checkliste mit mindestens einem ✗, Gruppen-Buttons mit Pool-Größe, SalutoCare-Toggle (`m.saluto` togglet korrekt), Hinweis-Textarea (Text bleibt beim erneuten Öffnen erhalten). Gruppe „Innere" wählen, „Gruppe zuweisen & freigeben" klicken → Leiste zeigt danach den `.egt-verteilt`-Lesezweig, **kein** neuer Eintrag in `faelle[]` (Pull-Prinzip, noch nicht übernommen). Anfrage 102 öffnen (bereits `gruppe:"Neurologie"` aus Seed) → zeigt sofort den Verteilt-Lesezweig, kein Formular. `simulateInbound()` auslösen → nach 1,6 s „Braucht Entscheidung"-Toast (kein Fall in `faelle[]` entstanden, `faelle.length` unverändert). 0 Console-Errors.

**Sichtprüfung:** `#egDetail` zeigt für eine offene Entscheidungsfall-Anfrage ein klickbares Sterne-Widget mit Begründungszeile, eine vierteilige Checkliste, fünf Gruppen-Buttons mit Pool-Größe, den SalutoCare-Toggle und ein Hinweisfeld — alles schreibt direkt auf das `eingang[]`-Objekt. Für bereits verteilte Anfragen (auto oder freigegeben) zeigt die Leiste stattdessen nur einen schreibgeschützten Hinweis „Im Pool von … — wartet auf Übernahme". Kein Fall entsteht, solange niemand „Übernehmen" klickt (das kommt erst mit Task 5).

**Commit:** `refactor: #egDetail-Kernumbau — klassifiziereEingang(), Sterne-Override-Widget, Vollständigkeits-Checkliste, Gruppen-Zuordnung statt Personen-Owner, Verteilt-Lesezweig; egOwner/egSaluto/egHinweis/egSetOwner()/ownerVorschlag() entfernt, simulateInbound()/uebernehmen() umgestellt (Runde 6 Punkt 1, §6/§7.2-§7.6/§7.10/§9)`

---

# Task 4 — Leiter-Eingangsliste dreizonig (`renderEingang()`)

**Lane:** `claude-implementer` (vollständig vorgezeichneter Ersatzcode, keine eigene Entscheidung nötig)

**Abhängigkeit:** braucht Task 2 (`GRUPPEN`) und Task 3 (`m.gruppe`/`m.autoVerteilt` werden jetzt tatsächlich von `openEgDetail()`/`egFreigeben()`/`simulateInbound()` gepflegt — die Seeds allein reichen für die drei Zonen aber bereits aus).

**Bezug:** Spec §7.7, Abnahme #2/#3.

**Wichtiger Hinweis (bewusstes Verhalten, kein Fehler):** Anfragen mit `m.gruppe` gesetzt, `m.autoVerteilt===false` und `m.done===false` (also vom Leiter manuell freigegeben, noch nicht von einer Koordinatorin übernommen) erscheinen in **keiner** der drei Zonen dieser Liste — das ist beabsichtigt (Spec §3.1 Punkt 5: „taucht in keiner Leiter-To-do-Liste mehr auf"). Sie sind ab Task 5 ausschließlich im Koordinations-Pool-Block sichtbar.

**Dateien/Anker:** `grep -n "function renderEingang" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: Zeile 4790–4801 (Stand vor diesem Task, nach Task 1–3 verschoben).

**Schritte:**

- [ ] **4.1** `grep`-Befehl oben ausführen, aktuellen Funktionskörper neu lesen.
- [ ] **4.2 — `renderEingang()` vollständig ersetzen:**
```js
// Ist:
function renderEingang(){
  document.getElementById("inbox").innerHTML=eingang.map(m=>{
    const head="<button class='mrow' onclick='openEgDetail("+m.id+")'>"
      +"<span class='chico'>"+(CHAN_ICON[m.kanal]||CHAN_ICON["E-Mail"])+"</span>"
      +"<span class='mhtxt'><span class='mtit'>"+escapeHtml(m.tit)+"</span>"
      +"<span class='mmeta'><span class='chtag'>"+escapeHtml(m.kanal)+"</span><span class='mtime'>"+escapeHtml(m.zeit)+"</span>"
      +"<span class='typ-chip "+(m.typ==="passiv"?"passiv":"qual")+"'>"+(m.typ==="passiv"?"passiv":"qualifiziert")+"</span>"
      +(m.done?"<span class='ok-chip mini'>✓ "+(m.typ==="passiv"?"in Datenbank":"als Fall")+"</span>":"")+"</span></span>"
      +"<span class='mail-chev'>›</span></button>";
    return "<article class='mail"+(m.done?" done":"")+(m._neu?" neu":"")+"'>"+head+"</article>";
  }).join("");
}
// Soll:
function renderEingang(){
  function mailRow(m){
    const head="<button class='mrow' onclick='openEgDetail("+m.id+")'>"
      +"<span class='chico'>"+(CHAN_ICON[m.kanal]||CHAN_ICON["E-Mail"])+"</span>"
      +"<span class='mhtxt'><span class='mtit'>"+escapeHtml(m.tit)+"</span>"
      +"<span class='mmeta'><span class='chtag'>"+escapeHtml(m.kanal)+"</span><span class='mtime'>"+escapeHtml(m.zeit)+"</span>"
      +"<span class='typ-chip "+(m.typ==="passiv"?"passiv":"qual")+"'>"+(m.typ==="passiv"?"passiv":"qualifiziert")+"</span>"
      +(m.done?"<span class='ok-chip mini'>✓ "+(m.typ==="passiv"?"in Datenbank":"als Fall")+"</span>":"")+"</span></span>"
      +"<span class='mail-chev'>›</span></button>";
    return "<article class='mail"+(m.done?" done":"")+(m._neu?" neu":"")+"'>"+head+"</article>";
  }
  const entscheidung=eingang.filter(m=>!m.done&&m.typ!=="passiv"&&!m.gruppe);
  const autoV=eingang.filter(m=>m.autoVerteilt);
  const rest=eingang.filter(m=>m.done||m.typ==="passiv");
  let html="<div class='egt-entscheidung'><div class='kicker'>Braucht Entscheidung ("+entscheidung.length+")</div>"
    +(entscheidung.length?entscheidung.map(mailRow).join(""):"<p class='empty'>Keine offenen Entscheidungsfälle.</p>")+"</div>";
  const gruppenZeile=GRUPPEN.map(function(g){const n=autoV.filter(m=>m.gruppe===g).length;return n?escapeHtml(g)+" "+n:null;}).filter(Boolean).join(" · ");
  html+="<div class='egt-protokoll'><p>Heute automatisch verteilt: "+autoV.length+(gruppenZeile?" · "+gruppenZeile:"")+"</p>"
    +"<details><summary class='rk'>Einzelne Anfragen ("+autoV.length+")</summary>"
    +autoV.map(function(m){return "<div class='egt-protokoll-row'>"+escapeHtml(m.wer||m.tit)+" · <b>"+escapeHtml(m.gruppe)+"</b> · "+escapeHtml(m.zeit)+"</div>";}).join("")
    +"</details></div>";
  html+=rest.map(mailRow).join("");
  document.getElementById("inbox").innerHTML=html;
}
```
- [ ] **4.3 — neuer CSS-Block vor `</style>`:**
```css
/* Runde 6 Punkt 1 (§7.7): .egt-entscheidung/.egt-protokoll — Leiter-Eingangsliste in drei Zonen
   statt einer flachen Liste (Braucht Entscheidung / aggregiertes Auto-Verteilungs-Protokoll / Rest). */
.egt-entscheidung{margin-bottom:8px}
.egt-entscheidung .kicker{margin-bottom:8px}
.egt-protokoll{margin:14px 0;padding:12px 14px;background:var(--paper2);border:1px solid var(--hair);border-radius:8px}
.egt-protokoll p{margin:0;font-size:13.5px;color:var(--ink-soft)}
.egt-protokoll details{margin-top:8px}
.egt-protokoll-row{font-size:12.5px;color:var(--muted);padding:4px 0;border-top:1px solid var(--hair)}
.egt-protokoll-row:first-of-type{border-top:0}
```
- [ ] **4.4** `grep -n "function renderEingang" index.html` erneut ausführen, Funktionskörper gegen den obigen Soll-Stand abgleichen.
- [ ] **4.5** Standard-Verifikation bei 390px UND 1440px: Eingang-View öffnen → „Braucht Entscheidung (2)" zeigt genau die Ids 101/103, darunter „Heute automatisch verteilt: 3 · Neurologie 1 · Orthopädie 1 · Geriatrie 1" mit aufklappbaren Einzelzeilen, darunter die restlichen (`done`/passiv) Zeilen wie bisher. Keine der Ids 102/109/110 erscheint unter „Braucht Entscheidung".

**Sichtprüfung:** Die Eingangsliste ist jetzt klar in drei Zonen gegliedert; die aggregierte Protokollzeile zeigt die automatische Verteilung kompakt, ohne dass der Leiter jede einzelne auto-verteilte Anfrage als To-do sieht.

**Commit:** `feat: renderEingang() dreizonig — Braucht Entscheidung / aggregiertes Auto-Verteilungs-Protokoll / Rest (Runde 6 Punkt 1, §7.7)`

---

# Task 5 — Pool-Block Koordinationsansicht

**Lane:** `claude-implementer-pro` (neue Komponente mit zweistufiger Sichtbarkeitslogik — eigene Gruppen vs. „Weitere Gruppen", per Spec explizit als Pro-Aufgabe benannt)

**Abhängigkeit:** braucht Task 3 (`egFreigeben()`/`m.gruppe` über die UI erreichbar, nicht nur über Seeds) und Task 2 (`GRUPPEN`/Datenfelder).

**Bezug:** Spec §3.2, §7.8, Abnahme #4/#5/#6/#7.

**Dateien/Anker:** `grep -n "id=\"mtpPaneTag\"\|id=\"mtJetztChap\"\|function renderMeinTag\|function renderMtProtokolle" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `#mtpPaneTag`-Öffnung Zeile 3991, `#mtJetztChap` Zeile 3996, `renderMeinTag()` Zeile 6470–6490, `renderMtProtokolle()` Zeile 6521.

**Schritte:**

- [ ] **5.1** `grep`-Befehl oben ausführen, aktuelle Struktur bestätigen.
- [ ] **5.2 — HTML: neuer Pool-Block additiv vor `#mtJetztChap`:**
```html
<!-- Ist: -->
    <figure class="au-photo au-photo--gold"><img src="assets/kb-komfort-wall.webp" alt="" loading="lazy"><figcaption>Komfort · Klinik Bavaria</figcaption></figure>

    <div class="chap" id="mtJetztChap">
<!-- Soll: -->
    <figure class="au-photo au-photo--gold"><img src="assets/kb-komfort-wall.webp" alt="" loading="lazy"><figcaption>Komfort · Klinik Bavaria</figcaption></figure>

    <div class="chap egt-pool" id="egtPoolChap">
      <div class="kicker">Pool</div>
      <h2 class="chap-h2">Offene Anfragen deiner Gruppe(n)</h2>
      <div class="mt-grid" id="egtPoolList"></div>
      <details class="egt-pool-weitere">
        <summary class="rk">Weitere Gruppen (<span id="egtPoolWeitereCount">0</span>)</summary>
        <div class="mt-grid" id="egtPoolWeitereList"></div>
      </details>
    </div>

    <div class="chap" id="mtJetztChap">
```
- [ ] **5.3 — neue Funktionen `renderEgtPool()` + `egUebernehmenAusPool()` einfügen**, direkt vor `function renderMeinTag(){`:
```js
/* Runde 6 Punkt 1 (§3.2, §7.8): Pool-Block Koordinationsansicht — zweistufig: oben eigene
   Gruppe(n) (aus TEAM_ACHSE["S. Koordination"]), darunter eingeklappt alle übrigen offenen
   Pool-Anfragen (kleines Team, aushelfen erlaubt — jede freigegebene Anfrage bleibt erreichbar). */
function renderEgtPool(){
  const meineGruppen=TEAM_ACHSE["S. Koordination"]||[];
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
- [ ] **5.4 — `renderMeinTag()`: Aufruf additiv ergänzen**, direkt nach `renderMtProtokolle();`:
```js
// Ist:
 renderMtProtokolle();
}
// Soll:
 renderMtProtokolle();
 renderEgtPool();
}
```
- [ ] **5.5 — neuer CSS-Block vor `</style>`:**
```css
/* Runde 6 Punkt 1 (§7.8): .egt-pool-card — Kompakt-Karte im Koordinations-Pool, wiederverwendet
   .mt-grid für das Grid-Layout (bereits vorhanden), eigene Karten-Optik analog .radar-card. */
.egt-pool-card{background:var(--paper2);border:1px solid var(--hair);border-radius:18px;
  box-shadow:var(--shadow-soft);padding:16px;display:flex;flex-direction:column;gap:8px}
.egt-pool-zsf{margin:0;font-size:13.5px;color:var(--ink-soft);line-height:1.4;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.egt-pool-weitere{margin-top:16px}
```
- [ ] **5.6** `grep -n "function renderEgtPool\|egUebernehmenAusPool\|id=\"egtPoolChap\"" index.html` erneut ausführen — je 1 Fundstelle für Definition, mindestens 1 für den Aufruf im Markup/`onclick`.
- [ ] **5.7** Standard-Verifikation bei 390px UND 1440px: In die Koordinationsansicht wechseln (`.ds-role`-Rollen-Schalter → `mtEnter()`). id 101 zuvor im Leiter-Zweig (Task 3) an Gruppe „Innere" freigegeben haben → erscheint jetzt im **oberen** Block „Offene Anfragen deiner Gruppe(n)" (Innere gehört zu `TEAM_ACHSE["S. Koordination"]`). id 103 an Gruppe „SalutoCare" freigegeben → erscheint **nicht** oben, sondern nur unter „Weitere Gruppen (N)" (SalutoCare ∉ `TEAM_ACHSE["S. Koordination"]`) — aufklappen, „Übernehmen" klicken → Fallakte öffnet direkt, Sterne-Override (falls zuvor manuell gesetzt) sichtbar im Fallakte-Kopf. Karten zeigen 2-zeilig gekürzte Zusammenfassung + Sterne + „Übernehmen"-Button, einspaltig bei 390px, mehrspaltig ab 1024px (via bestehendes `.mt-grid`).

**Sichtprüfung:** Die Koordinationsansicht zeigt jetzt oberhalb von „Was jetzt dran ist" einen Pool-Block mit den eigenen offenen Gruppen-Anfragen; ein eingeklappter Bereich „Weitere Gruppen" macht auch fremde freigegebene Anfragen erreichbar. Klick auf „Übernehmen" erzeugt den Fall (bestehender `uebernehmen()`-Pfad) und öffnet die Fallakte direkt — vor diesem Klick existierte kein entsprechender Eintrag in `faelle[]`.

**Commit:** `feat: Pool-Block Koordinationsansicht — zweistufig (eigene Gruppen / weitere Gruppen), renderEgtPool()+egUebernehmenAusPool() (Runde 6 Punkt 1, §3.2/§7.8)`

---

# Task 6 — Rückfragen-Checkliste in der Werkbank (`dArbeitHtml()`)

**Lane:** `claude-implementer-pro` (neuer Aufgabentyp-Zweig mit Zustandsänderung am Fall-Objekt — per Spec explizit als Pro-Aufgabe benannt)

**Abhängigkeit:** braucht Task 3 (`uebernehmen()`-Diff erzeugt `f.rueckfragen`).

**Bezug:** Spec §7.9, Abnahme #4 (zweiter Teil: Checkbox-Persistenz).

**Dateien/Anker:** `grep -n "function dArbeitHtml\|MT_NOTIZ_LABEL=" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung: `dArbeitHtml()` Zeile 6094–6121, `MT_NOTIZ_LABEL` Zeile 6293.

**Schritte:**

- [ ] **6.1** `grep`-Befehl oben ausführen, Funktionskörper neu lesen (insbesondere den `typ==="anreise"`-Zweig und den abschließenden generischen Notiz-Zweig, zwischen die der neue Zweig eingefügt wird).
- [ ] **6.2 — neuer `if(typ==="rueckruf"...)`-Zweig direkt vor dem generischen Notiz-Fallback:**
```js
// Ist (Ende der Funktion):
 if(typ==="anreise")
   return "<div class='kicker'>Anreise-Checkliste</div>"
    +"<label><input type='checkbox'> Zimmer reserviert</label>"
    +"<label><input type='checkbox'> Transport geklärt</label>"
    +"<label><input type='checkbox'> Aufnahmetag bestätigt</label>";
 return "<div class='full'><label for='dNotizSofort'>"+escapeHtml(MT_NOTIZ_LABEL[typ]||MT_NOTIZ_LABEL.allgemein)+"</label>"
   +"<div class='kz-notiz-row'><input id='dNotizSofort' placeholder='z. B. Rückruf erledigt'>"
   +"<button class='btn-ghost btn-sm' type='button' onclick='kzNotizAdd()'>Ins Protokoll</button></div></div>";
}
// Soll:
 if(typ==="anreise")
   return "<div class='kicker'>Anreise-Checkliste</div>"
    +"<label><input type='checkbox'> Zimmer reserviert</label>"
    +"<label><input type='checkbox'> Transport geklärt</label>"
    +"<label><input type='checkbox'> Aufnahmetag bestätigt</label>";
 if(typ==="rueckruf"&&f.rueckfragen&&f.rueckfragen.length)
   return "<div class='egt-rueckfragen'><span class='kicker'>Offene Rückfragen</span>"
     +f.rueckfragen.map(function(r,i){
       return "<label><input type='checkbox' "+(r.done?"checked":"")+" onchange='egRueckfrageToggle("+i+")'> "+escapeHtml(r.frage)+"</label>";
     }).join("")
     +"</div>"
     +"<div class='full' style='margin-top:12px'><label for='dNotizSofort'>"+escapeHtml(MT_NOTIZ_LABEL.rueckruf)+"</label>"
     +"<div class='kz-notiz-row'><input id='dNotizSofort' placeholder='z. B. Rückruf erledigt'>"
     +"<button class='btn-ghost btn-sm' type='button' onclick='kzNotizAdd()'>Ins Protokoll</button></div></div>";
 return "<div class='full'><label for='dNotizSofort'>"+escapeHtml(MT_NOTIZ_LABEL[typ]||MT_NOTIZ_LABEL.allgemein)+"</label>"
   +"<div class='kz-notiz-row'><input id='dNotizSofort' placeholder='z. B. Rückruf erledigt'>"
   +"<button class='btn-ghost btn-sm' type='button' onclick='kzNotizAdd()'>Ins Protokoll</button></div></div>";
}
function egRueckfrageToggle(i){ const f=aktuellerFall;if(!f||!f.rueckfragen)return; f.rueckfragen[i].done=!f.rueckfragen[i].done; renderFallakte(); }
```
  (Fällt `f.rueckfragen` leer/`undefined` aus — Fall nicht aus einem Entscheidungsfall entstanden —, greift der bisherige generische Zweig unverändert, da die Bedingung `f.rueckfragen&&f.rueckfragen.length` dann `false` ist.)
- [ ] **6.3 — neuer CSS-Block vor `</style>`:**
```css
/* Runde 6 Punkt 1 (§7.9): .egt-rueckfragen — abhakbare Rückfragen-Liste im Werkbank-Typ "rueckruf",
   Checkbox-Styling erbt bereits von der globalen #dArbeit-label/input-Regel. */
.egt-rueckfragen{display:flex;flex-direction:column;gap:8px;margin-bottom:4px}
```
- [ ] **6.4** `grep -n "egRueckfrageToggle\|f.rueckfragen" index.html` erneut ausführen — Definition + mindestens 2 Nutzstellen (Bedingung + `.map`).
- [ ] **6.5** Standard-Verifikation bei 390px UND 1440px: id 101 (Innere) über Task 3+5 komplett durchspielen (Entscheidungsfall öffnen → Checkliste zeigt ≥1 ✗ → Gruppe „Innere" freigeben → im Koordinations-Pool übernehmen) → Fallakte öffnet, Werkbank zeigt Typ „rueckruf" mit einer abhakbaren Liste, die exakt den zuvor als ✗ markierten Punkten entspricht. Checkbox anklicken → hakt ab, bleibt nach `renderFallakte()`-Re-Render erhalten (`f.rueckfragen[i].done` persistiert am Fall-Objekt, kein Zurücksetzen bei erneutem Öffnen der Fallakte).

**Sichtprüfung:** Ein aus einem Entscheidungsfall mit unvollständigen Angaben entstandener Fall zeigt in der Werkbank eine konkrete, abhakbare Liste der noch offenen Rückfragen statt eines generischen leeren Notizfelds; Fälle ohne solche Historie (Bestandsfälle, direkt aus Board angelegte) verhalten sich unverändert.

**Commit:** `feat: Rückfragen-Checkliste im Werkbank-Typ rueckruf — abhakbar, persistiert an f.rueckfragen (Runde 6 Punkt 1, §7.9)`

---

# Task 7 — Aufräum-Sweep + Gesamt-Boot-Check

**Lane:** `claude-implementer-pro` (Verifikations-lastiger Abschluss-Task; falls dabei ein kleiner Fund auftaucht, direkt hier fixen, kein neuer Task nötig — bei größeren Funden: stoppen, im Report melden statt selbst zu improvisieren)

**Abhängigkeit:** braucht alle vorherigen Tasks (1–6).

**Bezug:** Spec §9 (verwaiste CSS-Blöcke), Abnahme #1–#11 (Gesamtabnahme).

**Dateien/Anker:** `grep -n "\.eg-triage\|\.eg-row\|\.eg-v{\|\.eg-grund\|\.egd-owners\|\.egd-owner{\|\.egd-ownername\|\.egd-vorschlag\|\.egd-load" index.html` vor Bearbeitung ausführen. Bei Plan-Erstellung (vor diesem Task, Zeilen aus Ist-Stand vor Task 1): CSS-Block `.eg-triage`/`.eg-row`/`.eg-v`/`.eg-grund` Zeile 2987–2996, CSS-Block `.egd-owners`/`.egd-owner*` Zeile 3041–3047.

**Schritte:**

- [ ] **7.1** `grep`-Befehl oben ausführen, jede Fundstelle einzeln bestätigen — nach Task 3 sollten dies **ausschließlich** noch CSS-Selektor-Definitionen sein (keine HTML/JS-Erzeuger mehr, die wurden bereits in Task 3 entfernt).

- [ ] **7.2 — Löschen, Block 1** (`.eg-triage`/`.eg-row`/`.eg-v`/`.eg-grund`, komplette Regelgruppe inkl. Pseudo-Elemente):
```css
/* Ist: */
/* Task 2.1 (Punkt 1): Eingang-Triage-Karte (Wer/Woher/Was/Wie-konkret) — Doppelrahmen-Etikette
   analog #view-fallakte .chap (Gold-Eckwinkel + Jade-Hairline), eigener Namespace (.eg-*);
   der .mail-Wrapper besteht als kompakte, nicht mehr aufklappbare Zeile fort (Punkt 1, Runde 4). */
.eg-triage{position:relative;background:var(--paper);border:1px solid var(--jade-line);border-radius:4px;
  padding:12px 14px;margin-bottom:12px;box-shadow:inset 0 0 0 3px var(--paper),inset 0 0 0 4px var(--gold-faint)}
.eg-triage::before,.eg-triage::after{content:"";position:absolute;width:8px;height:8px;pointer-events:none;opacity:.6}
.eg-triage::before{top:7px;left:7px;border-top:1px solid var(--brass);border-left:1px solid var(--brass)}
.eg-triage::after{bottom:7px;right:7px;border-bottom:1px solid var(--brass);border-right:1px solid var(--brass)}
.eg-row+.eg-row{margin-top:9px}
.eg-row .kicker{margin:0 0 3px;font-size:10.5px}
.eg-v{font-size:13.5px;color:var(--ink-soft);display:flex;align-items:center;gap:7px;flex-wrap:wrap;line-height:1.4}
.eg-v .ava{width:22px;height:22px;font-size:10px;flex-shrink:0}
.eg-grund{color:var(--muted);font-size:12px}
/* Soll: entfällt ersatzlos */
```
- [ ] **7.3 — Löschen, Block 2** (`.egd-owners`/`.egd-owner*`, komplette Regelgruppe):
```css
/* Ist: */
.egd-owners{display:flex;flex-direction:column;gap:8px;margin:10px 0}
.egd-owner{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:var(--paper);
  border:1px solid var(--hair);border-radius:12px;padding:10px 12px;font:inherit;color:inherit;cursor:pointer;min-height:44px}
.egd-owner.sel{border-color:var(--brass);background:var(--brass-soft)}
.egd-ownername{display:flex;flex-direction:column;gap:2px}
.egd-vorschlag{font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--brass-deep);font-weight:700}
.egd-load{margin-left:auto;font-size:12.5px;color:var(--muted);flex-shrink:0}
/* Soll: entfällt ersatzlos */
```
  (`.egd-saluto`/`.egd-saluto.on` **bleiben unverändert bestehen** — kein Orphan, weiterhin genutzt vom SalutoCare-Toggle-Button, s. Task 3.5/offener Punkt (b).)
- [ ] **7.4** `grep -n "egOwner\|egSaluto\b\|egHinweis\b\|egSetOwner\|ownerVorschlag\|\.eg-triage\|\.eg-row\|\.eg-grund\|\.egd-owners\|\.egd-owner{\|\.egd-ownername\|\.egd-vorschlag\|\.egd-load" index.html` ausführen — **kein** Treffer mehr im gesamten Dokument.
- [ ] **7.5** `grep -c "function "  index.html` gegen den Stand vor Task 1 vergleichen (Notiz: netto **+9** neue Funktionen aus dieser Runde — `klassifiziereEingang`, `egtSterneHtml`, `egSterneUeberschreiben`, `egGruppeWaehlen`, `egHinweisSetzen`, `egFreigeben`, `renderEgtPool`, `egUebernehmenAusPool`, `egRueckfrageToggle` — minus **2** entfernte — `egSetOwner`, `ownerVorschlag` — macht **+7** netto gegenüber dem Stand vor Task 1; `egVollstaendigkeit`/`gruppenMitglieder`/`egGruppenPoolGroesse` aus Task 2 zählen als weitere **+3**, macht **+10** netto seit Plan-Beginn. `egToggleSaluto` bleibt namensgleich, keine Netto-Änderung durch sie).
- [ ] **7.6** `grep -c "@keyframes" index.html` ausführen — weiterhin genau **9**.
- [ ] **7.7 — Gesamt-Boot-Check, alle 11 Abnahmekriterien der Spec (§8) im Browser durchspielen, bei 390px UND 1440px:**
  1. Backdrop: `#egDetail` öffnen (Desktop) → abgedunkelter Hintergrund, Klick-weg schließt, Escape schließt, Browser-Zurück schließt.
  2. Auto-Verteilung: keine der Ids 102/109/110 unter „Braucht Entscheidung"; Protokoll zeigt „Heute automatisch verteilt: 3" mit ≥3 Gruppen.
  3. Genau 2 Entscheidungsfälle: „Braucht Entscheidung (2)" zeigt exakt 101/103; 103 zeigt SalutoCare als Achse/Premium-Signal.
  4. Checkliste + Rückfragen-Übertrag: id 101 öffnen → ≥1 ✗; Gruppe „Innere" freigeben; im Koordinations-Pool oben sichtbar; „Übernehmen" → Fallakte, Werkbank „rueckruf" zeigt genau die ✗-Punkte, Checkbox-Klick persistiert.
  5. Sterne-Override + Pool-Erreichbarkeit über Gruppengrenzen: id 103 Sterne auf 5, Gruppe „SalutoCare" freigeben → **nicht** im oberen Pool-Block, nur unter „Weitere Gruppen"; dort übernehmen → Fallakte-Kopf zeigt 5 Sterne.
  6. Pull-Prinzip: nach Freigabe, vor Übernahme existiert kein neuer Eintrag in `faelle[]` mit `owner==="S. Koordination"` für diese Anfrage.
  7. SalutoCare/Hinweis überleben Zeitversatz: id 103 Toggle+Hinweis setzen, freigeben, zwischendurch eine andere Entscheidungsfall-Anfrage mit anderem Toggle/Hinweis öffnen, danach 103 übernehmen → Fall zeigt weiterhin `saluto:true` und den ursprünglichen Hinweistext von 103.
  8. `simulateInbound()` legt keinen Fall direkt an: `faelle.length` vor/nach unverändert, nur „Automatisch verteilt"- oder „Braucht Entscheidung"-Toast.
  9. Mobile (390px): alle Schritte 1–8 wiederholt, `#egDetail` als Bottom-Sheet, Pool-Karten einspaltig, keine horizontale Überlauf.
  10. 0 Console-Errors bei allen Schritten, beiden Breiten.
  11. Unberührte Bereiche: `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `#refOverlay`, `#dbDetail`/`#rsDetail`-Verhalten unverändert; genau 9 `@keyframes`-Blöcke (bereits in 7.6 geprüft).

**Sichtprüfung:** Kein CSS-Orphan aus dem alten Owner-Modell mehr im Dokument; alle 11 Abnahmekriterien der Spec sind im Browser bei beiden Breiten grün; die Cofounder-Bereiche und `#dbDetail`/`#rsDetail` sind unangetastet.

**Commit:** nur falls 7.1–7.7 einen Fix nötig machten (dann `chore: CSS-Waisen nach Anfrage-Triage-Umbau bereinigt (.eg-triage/.eg-row/.eg-v/.eg-grund/.egd-owners/.egd-owner*) + Gesamt-Boot-Check-Fund <konkreter Fund> (Runde 6 Punkt 1, §9)`). Falls beim CSS-Sweep kein Zusatzfund auftrat, trotzdem committen (die CSS-Löschung selbst ist eine reale Änderung): `chore: CSS-Waisen nach Anfrage-Triage-Umbau bereinigt (.eg-triage/.eg-row/.eg-v/.eg-grund/.egd-owners/.egd-owner*), Gesamt-Boot-Check aller 11 Abnahmekriterien grün (Runde 6 Punkt 1, §8/§9)`

---

## Reihenfolge / Abhängigkeiten

```
Task 1 (Backdrop-Fix) ── unabhängig, rein additiv/CSS
      │
      ▼
Task 2 (Datenmodell-Fundament, additiv) ── unabhängig von 1, aber sequenziell danach
      │
      ▼
Task 3 (Kern-Umbau #egDetail, ATOMAR) ── größter Task, Globals-Entfernung + kompletter
      │                                  Neuaufbau aller Aufrufer im selben Commit
      ▼
Task 4 (renderEingang() dreizonig) ── braucht GRUPPEN (2) + m.gruppe-Realität (3)
      │
      ▼
Task 5 (Pool-Block Koordinationsansicht) ── braucht egFreigeben()/m.gruppe (3)
      │
      ▼
Task 6 (Rückfragen-Checkliste Werkbank) ── braucht f.rueckfragen aus uebernehmen()-Diff (3)
      │
      ▼
Task 7 (Aufräum-Sweep + Gesamt-Boot-Check)
```

Sequentiell in dieser Reihenfolge ausführen (eine Datei, nie parallel). Diese Reihenfolge ist zugleich so gewählt, dass die App nach **jedem einzelnen** Task lauffähig bleibt: Task 1 ist ein reiner CSS/Attribut-Fix, Task 2 ist rein additiv (keine bestehende Funktion liest die neuen Felder), Task 3 ist der einzige Bruchpunkt und deshalb bewusst atomar, Task 4/5/6/7 bauen auf einem bereits vollständig funktionsfähigen `#egDetail`/`uebernehmen()` auf.

---

## Nicht-Ziele dieser Runde (aus Spec §4, hier zur Erinnerung)

- Punkt 8 (weiterer Koordinations-/Fallakten-Ausbau) wird nicht vorweggenommen — nur der Pool-Block in `#view-meintag` ist Teil dieser Runde.
- Kein Backend, keine echte Persistenz, keine echten Benachrichtigungen.
- `#dbDetail`/`#rsDetail` bleiben unverändert (nur `#egDetail` bekommt den Backdrop-Fix).
- `antwortenEingang()` verliert ihren Aufrufort im Entscheidungsfall-Zweig, bleibt aber als Funktion bestehen (weiterhin erreichbar aus der Fallakte, Werkbank-Typ „angebot").
- Keine Änderung an `TEAM`/`TEAM_ACHSE`-Mitgliederliste selbst — `GRUPPEN` ist eine reine Ableitung.
- `renderTeam()`/`.tm-intake` zählt weiterhin nach dem alten Modell (`eingangOffen`) — bewusst nicht angefasst, Team-Statistiken sind Runde 6 Punkt 3 vorbehalten.
- `findeOderErstellePerson()` bleibt als Funktion bestehen, obwohl sie durch Task 3 ihre einzige Aufrufstelle verliert — generische Infrastruktur außerhalb des Zuschnitts dieser Runde, kein Löschauftrag.
- Keine neuen Keyframes, keine neuen Datenarray-Felder außer den in §5 der Spec explizit gelisteten, `escapeHtml` für alle dynamischen Inhalte, kein `Math.random`, 390px und 1440px verifizieren, 0 Console-Errors.
