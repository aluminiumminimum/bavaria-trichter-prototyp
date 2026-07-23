# Runde 5, Sprint 3 — Fallakte als Arbeits-Cockpit, Schublade entfällt

**Bezug:** Fünfte Runde, aufbauend auf [2026-07-22-runde5-sprint12-design.md](./2026-07-22-runde5-sprint12-design.md) (Sprint 1+2, umgesetzt, `main`, zuletzt `81fc34b`). Sprint 1+2 hatte das Fallakte-Herzstück-Redesign (Nutzer-Feedback-Punkt 3) ausdrücklich ausgeklammert — diese Spec liefert es nach. Der Nutzer hat das Design unten wörtlich freigegeben; diese Spec inventarisiert den Ist-Zustand vollständig (Sektion 2), bevor sie das Soll (Sektionen 3–7) beschreibt, weil es sich um einen großen strukturellen Umbau handelt (Löschung eines kompletten Overlays, Umbau der Fallakte-Vollansicht, Umverdrahtung von ~14 `openDetail(`-Aufrufstellen).

**Nicht-Ziel:** Kein neues Backend, kein Build-Prozess, keine Bibliotheken. `ma-mode` (Mein-Tag/`mtSheet`-Koordinations-Arbeitsplatz) bleibt komplett unangetastet. `egDetail`/`dbDetail`/`rsDetail` bleiben als Overlays bestehen. Cofounder-Namespaces (`.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`, `openReferrer`/`closeReferrer`, `#refOverlay`) bleiben unangetastet. Datenarrays nur additiv erweitern — diese Runde führt **kein** neues Datenfeld ein, sie verschiebt und verdrahtet nur bestehende Felder/Funktionen um. Jede Änderung bei 390px und 1440px verifizieren, 0 Console-Errors, reduced-motion-safe, nur synthetische Demo-Daten, `escapeHtml` für dynamische Inhalte, kein `Math.random`.

---

## 1. Ziel + Nutzerzitat

**Nutzerzitat (wörtlich freigegebenes Design):** „Die Fallakte wird DER Arbeitsort pro Fall — Herzstück, weil die meiste Arbeit hier erfolgt; wichtigste Informationen; intuitiv und schnell erkennbar was die nächste Aufgabe ist; passt sich dem Stand an; hat Struktur." Die Seitenschublade `#ovDetail` wird komplett entfernt. Layout: „Zwei Zonen: Arbeit | Kontext."

**Ziel dieser Spec:** `#view-fallakte` (aktuell eine überwiegend lesende Übersichtsseite, erreichbar nur über einen einzigen Button aus der Schublade heraus) wird zum alleinigen Arbeitsort pro Fall. Jeder Weg zu einem Fall führt direkt dorthin. `#ovDetail` — Markup, CSS, History-Einträge — wird entfernt.

---

## 2. Ist-Inventur

### 2.1 Alle `openDetail(`-Aufrufstellen (14 Stellen, per grep vollständig erfasst)

| # | Zeile | Funktion/Kontext | Auslöser | Nach dem Klick |
|---|-------|-------------------|----------|----------------|
| 1 | [index.html:4417](../../../index.html#L4417) | `openEgDetail()`, `m.done`-Zweig (Anfrage bereits übernommen) | Button „Fall öffnen ›" im `#egDetail`-Overlay | `openDetail(m.fallId)` |
| 2 | [index.html:4751](../../../index.html#L4751) | `inbToast()` — Toast nach `simulateInbound()` | Button „Fall öffnen ›" im Eingangs-Toast | `go("faelle","board");openDetail(fid)` |
| 3 | [index.html:4849](../../../index.html#L4849) | `uebernehmen(id,owner)` | Eingang-Übernahme („Als Fall anlegen & zuordnen") | `renderAll();openDetail(fid)` — direkt nach Fall-Anlage |
| 4 | [index.html:4854](../../../index.html#L4854) | `antwortenEingang(id,owner)` | „✉ Antworten"-Button im Eingang | ruft `uebernehmen()` falls nötig, dann `openDetail(m.fallId)` + fokussiert `#dReply` per `setTimeout` |
| 5 | [index.html:4917](../../../index.html#L4917) | `makeBoardCol(st)` | Klick auf Board-Karte (`k.onclick`) | `openDetail(x.id)` |
| 6 | [index.html:5512](../../../index.html#L5512) | `renderWichtig(k)` — Heute-Karte „Frist überfällig" | Klick auf `.wrow`-Button in `#wichtigList` (Heute-Ansicht) | `click:"openDetail("+f.id+")"` (String, per `onclick` ausgeführt) |
| 7 | [index.html:5513](../../../index.html#L5513) | `renderWichtig(k)` — Heute-Karte „heute fällig" | wie oben | wie oben |
| 8 | [index.html:5522](../../../index.html#L5522) | `renderWichtig(k)` — Heute-Karte „Kostenklärung offen" | wie oben | wie oben |
| 9 | [index.html:5672](../../../index.html#L5672) | `renderTeam()` — Team-Aufgabenliste (`.tm-task`) | Klick auf offene Aufgabe eines Mitarbeiters im Team-Reiter | `openDetail(f.id)` |
| 10 | [index.html:6191](../../../index.html#L6191) | `kzAnfragen()` | Button „Kostenzusage anfragen" (in `dArbeitHtml()`, Kosten-Zweig) | `renderAll();openDetail(f.id)` — Re-Render nach Zustandsänderung |
| 11 | [index.html:6197](../../../index.html#L6197) | `kzZusage()` | Button „Zusage erfassen" | wie oben |
| 12 | [index.html:6203](../../../index.html#L6203) | `kzAblehnung()` | Button „Ablehnung erfassen" | wie oben |
| 13 | [index.html:6227](../../../index.html#L6227) | `advanceFall()` | Button „Aktuelle Aufgabe erledigt → nächster Schritt ›" | `renderAll();openDetail(f.id)` |
| 14 | [index.html:6229](../../../index.html#L6229) | `function openDetail(id){…}` | (Funktionsdefinition selbst) | — |

**Nicht** hierunter fallen — verifiziert, bewusst geprüft laut Auftrag:
- **`mtSheetRender()`/`mtAbschliessen()`** ([index.html:6636](../../../index.html#L6636)/[6678](../../../index.html#L6678)): referenzieren `openDetail` **nicht**. Der Mein-Tag-Sheet ist komplett selbstgenügsam — `miniFallakte` ([index.html:6659-6666](../../../index.html#L6659)) zeigt eine reine Lese-Kopie (Achse/KT-Pills, Status, Hinweis, letzte 2 Log-Zeilen) direkt im Sheet, **ohne** Link/Button in die Fallakte. `ma-mode` bleibt also komplett unangetastet — kein Umbau nötig, keine Aufrufstelle vorhanden.
- **`openDbDetail()`/`openRsDetail()`**: kein `openDetail(`-Aufruf; das sind separate Overlays für andere Objekte (Stammdaten-Inspektor, In-Reha-Leitung), bleiben laut Auftrag bestehen.
- **Suche:** Es existiert keine globale Such-/Filterfunktion, die Fälle direkt öffnet (per Volltextsuche verifiziert — kein Treffer).

**Ergebnis:** **13 echte Aufrufstellen** (Positionen 1–13, Position 14 ist die Definition), verteilt auf 8 Funktionen/Renderer. Alle 13 werden in §6 auf `openFallakte()` umgestellt.

### 2.2 Elemente/Funktionen exklusiv am `#ovDetail`-Markup

**Statische Kopf-/Steuerfelder** (native `<select>`/`<input>`, direkt im HTML von `#ovDetail`, **kein** `innerHTML`-Rebuild — Event-Listener werden einmalig beim Skript-Laden gebunden):

| ID | Feld | Wird gelesen von | Wird geschrieben von | Ziel im Cockpit |
|----|------|-------------------|----------------------|-----------------|
| `dStatus` | Status-Select | `dSpeichern`-Handler, `toggleVerlust()` | `openDetail()` (füllt Optionsliste + `selected`) | Steuerung (③) |
| `dOwner` | Verantwortlich-Select | `dSpeichern`-Handler, `change`-Listener → `dOwnerAva` | `openDetail()` | Steuerung (③) — **bereits heute** editierbares natives Element neben der reinen Präsentation aus `aufgabenHeroHtml()` |
| `dFrist` | Frist-Date-Input | `dSpeichern`-Handler, `change`-Listener → `dFristWrap`-Klasse | `openDetail()` | Steuerung (③) |
| `dFristWrap` | Wrapper-Span um `dFrist` (Frist-Ampel-Farbe) | — | `openDetail()`, `dFrist`-`change`-Listener | Steuerung (③) |
| `dOwnerAva` | Avatar-Initialen neben `dOwner` | — | `openDetail()`, `dOwner`-`change`-Listener | Steuerung (③) |
| `dKosten` | Kostenstatus-Select | `dSpeichern`-Handler | `openDetail()` | Steuerung (③) |
| `dKT` | Kostenträger-Select | `dSpeichern`-Handler | `openDetail()` | Steuerung (③) |
| `dConsent` | Einwilligung-Select | `dSpeichern`-Handler | `openDetail()` | Steuerung (③) |
| `dSaluto` | SalutoCare-Checkbox | `dSpeichern`-Handler | `openDetail()` | Steuerung (③) |
| `dVerlust` | Verlustgrund-Select | `dSpeichern`-Handler (Pflichtfeld-Check bei „Verloren") | `openDetail()`, `toggleVerlust()` | Steuerung (③) |
| `rowVerlust` | Wrapper um `dVerlust` (versteckt/zeigt via `.show`) | `toggleVerlust()` | — | Steuerung (③) |
| `dAdvance` | Button „Aktuelle Aufgabe erledigt …" | — | `openDetail()` (`style.display` je nach Status) | Arbeit① |
| `dAbbruch` | Button „‹ Zurück" | `.onclick=dismissDetail` (einmalig) | — | **entfällt** (kein Zurück-Button mehr nötig — Akte ist Vollseite mit eigenem „‹ Zurück zum Board") |
| `dSpeichern` | Button „Speichern" | `.onclick=…` (kompletter Handler, [index.html:6277-6297](../../../index.html#L6277)) | — | Steuerung (③) — Handler wird umgebaut (s. u.) |
| „Vollständige Fallakte öffnen →"-Button | [index.html:4154](../../../index.html#L4154) | `onclick="openFallakte(aktuellerFall.id)"` | — | **entfällt ersatzlos** (kein zweistufiger Sprung mehr — die Akte ist der direkte Zielort) |

**Dynamisch nachgeladene Bereiche** (per `innerHTML` in `openDetail()` befüllt):

| ID | Funktion | Ziel im Cockpit |
|----|----------|-----------------|
| `dAva`/`dName`/`dSub` | Avatar/Name/Subline (`initialen()`, Text) | Kopf — bereits inhaltsgleich in `faAva`/`faName`/`faSub` vorhanden |
| `dAufgabeView` | `aufgabenHeroHtml(f)` | Arbeit① — bereits inhaltsgleich in `faNaechste` vorhanden |
| `dArbeit` | `dArbeitHtml(f)` | Arbeit② — **zieht 1:1 um, existiert in der heutigen Fallakte noch gar nicht** (kritischer Fund, s. §2.4) |
| `dWerdegang` | `"<div class='kicker'>Werdegang</div>"+stepper(...)` | Kontext — inhaltsgleich bereits in `faWerdegang` vorhanden (dort ohne Kicker-Zeile, mit zusätzlichem Log-Timeline-Anhang) |
| `dAkte` | `"<details class='pa-fold'>…"+paAkteSlot(f.personId)+"</details>"` (Sprint-1-Collapse) | Kontext — inhaltsgleich bereits in `faUebersicht` vorhanden, dort aber **ohne** `.pa-fold`-Collapse (s. §2.3, Stelle 4) |
| `dLog` | Timeline aus `f.log` | Arbeit④ — **existiert in der heutigen Fallakte nicht als eigenständiges Element**, `faWerdegang` hat einen eigenen Log-Anhang, der aber an den Werdegang gekoppelt ist, nicht an eine „Neue Notiz"-Eingabe |
| `dNotiz` | freies Notizfeld, nur bei Klick auf „Speichern" committed | Arbeit④ |

**Funktionen, die exklusiv `#ovDetail`-IDs lesen/schreiben:**

- **`openDetail(id)`** ([index.html:6229-6260](../../../index.html#L6229)): die zentrale Fülllogik — setzt `aktuellerFall`, befüllt alle o. g. Felder, ruft `_closeSiblingDetailRails("ovDetail")`, `pushDetailState()`. **Entfällt vollständig** — ihre Fülllogik wird in `renderFallakte()` überführt (s. §3–4).
- **`closeDetail()`** ([index.html:6262-6265](../../../index.html#L6262)): entfernt `.open`/`locked`/`detail-open`-Klassen von `#ovDetail`. Wird **nirgends aufgerufen** (verifiziert per grep — nur die Definition existiert, `dismissDetail()`/`_rawCloseDetails()` sind der tatsächlich genutzte Pfad). **Bereits heute toter Code** — nicht Teil dieser Runde, wird als vorbestehende Dead Code notiert (Surgical-Changes-Regel: nicht eigenmächtig entfernen, aber erwähnt).
- **`updateDocCnt()`** ([index.html:6266-6270](../../../index.html#L6266)): liest `u1`–`u4` (Teil von `dArbeitHtml()`s Unterlagen-Zweig, zieht mit `dArbeit` um), schreibt `docCnt`. Bleibt unverändert — IDs ziehen 1:1 mit.
- **`toggleVerlust()`** ([index.html:6271](../../../index.html#L6271)): liest `dStatus`, schreibt `rowVerlust`-Klasse. Bleibt unverändert, IDs ziehen mit Steuerung um.
- **`dSpeichern`-Handler** ([index.html:6277-6297](../../../index.html#L6277)): liest `dStatus`/`dOwner`/`dAufgabe`/`dFrist`/`dKosten`/`dKT`/`dConsent`/`u1-u4`/`dSaluto`/`dVerlust`/`dNotiz`, schreibt zurück auf `aktuellerFall`, ruft `renderAll();dismissDetail();`. **Wird umgebaut**: `dismissDetail()` → Re-Render der Akte statt Schließen (s. §4③).
- **`sendReply()`** ([index.html:4856-4864](../../../index.html#L4856)): liest `aktuellerFall`, `dReply`, `dReplyKanal` (Teil von `dArbeitHtml()`s Angebot-Zweig), schreibt **direkt** `document.getElementById("dLog").innerHTML=…` (kein Re-Render über `openDetail()`!). IDs ziehen mit `dArbeit`/`dLog` um — funktioniert unverändert, **sofern `dLog` als ID im Cockpit erhalten bleibt** (kritische Abhängigkeit, s. §4④).
- **`kzNotizAdd()`** ([index.html:6205-6213](../../../index.html#L6205)): analog `sendReply()` — liest `aktuellerFall`, `dNotizSofort`, schreibt direkt `#dLog`. Gleiche Abhängigkeit.
- **`kzAnfragen()`/`kzZusage()`/`kzAblehnung()`** ([index.html:6188-6204](../../../index.html#L6188)): lesen `aktuellerFall`, rufen **`renderAll();openDetail(f.id);`** — werden auf `renderAll();renderFallakte();` (oder gleichwertig) umgestellt.
- **`dArbeitKostenUpload()`/`dArbeitUnterlagenAnfordern()`** ([index.html:6150-6157](../../../index.html#L6150)): lesen `aktuellerFall`, zeigen nur einen Toast (`inbToast`), kein Re-Render-Aufruf nötig — funktionieren unverändert.
- **`advanceFall()`** ([index.html:6225-6228](../../../index.html#L6225)): ruft `advanceFallStatus(f); renderAll(); openDetail(f.id);` — wird zur „Aktuelle Aufgabe erledigt"-Logik in Arbeit①, `openDetail(f.id)` → `renderFallakte()`.

### 2.3 Fallakte-Ist-Struktur (`renderFallakte()`, Ausgangspunkt)

`#view-fallakte` ([index.html:4045-4081](../../../index.html#L4045)) ist heute eine statische Vollseiten-Sektion mit folgenden per `innerHTML` befüllten Ziel-Divs, gerendert von `renderFallakte()` ([index.html:6818-6857](../../../index.html#L6818)), aufgerufen aus `go()`'s `if(dest==="fallakte")renderFallakte();`-Zweig ([index.html:6772](../../../index.html#L6772)):

- **Kopf** (statisch, nicht neu gerendert): `faAva`/`faName`/`faSub` (Text/Avatar), `faHeadMeta` (Achse-Pill + `sterneHtml(sterneVon(...))` — **Kostenträger, SalutoCare-Stern und Zuordnungs-Hinweis fehlen hier komplett**, obwohl `faSub` den Kostenträger textuell mit einschließt), Button „‹ Zurück zum Board".
- **`faKacheln`**: 3 Kacheln — Frist, `kzChain(f)` (lesend), Sterne. Läuft bewusst außerhalb `.fa-cols` volle Breite.
- **`faNaechste`** (`.fh-hero`-Klasse, wiederverwendet): `"<div class='kicker'>Nächste Aufgabe</div>"+aufgabenHeroHtml(f)` — rein lesend (Owner/Frist als Text, kein editierbares Feld, kein „erledigt"-Button).
- **`.fa-cols`** (zweispaltig ab 1024px, per CSS bereits vorhanden [index.html:3019](../../../index.html#L3019)):
  - **`.fa-col-l`**: ein `.chap` mit `faWerdegang` = `stepper(f.schritte||deriveSchritte(f))` + Log-Timeline-Anhang.
  - **`.fa-col-r`**: vier `.chap`-Blöcke — `faUebersicht` (Einwilligung, SalutoCare-Zeile + `paAkteSlot(f.personId)`, **ohne** `.pa-fold`-Collapse), `faMedizin` (medizinische Kurzfelder, nur falls `inReha`-Match), `faAbrechnung` (`kzChain(f)` lesend + Kostenstatus/DRG), `faDokumente` (4 Status-Chips).

**Was fehlt komplett in der heutigen Fallakte** (kritisch für §4):
- **Kein `dArbeit`/`dArbeitHtml(f)`-Aufruf** — die gesamte aufgabentyp-abhängige Werkbank (Notizfläche/Doc-Checkliste/Kostenzusage+Upload/Antwort-Composer/Anreise-Checkliste) existiert nur in `#ovDetail`.
- **Kein editierbares Steuerfeld** — `faNaechste` zeigt Owner/Frist nur als Text, `faUebersicht` zeigt Status/Kostenstatus/Einwilligung/Verlustgrund gar nicht.
- **Kein „Aufgabe erledigt"-Button** — `advanceFall()` ist nur über `#ovDetail` erreichbar.
- **Kein Verlauf+Notiz-Eingabefeld** — nur der an `faWerdegang` gekoppelte Log-Anhang, keine `dNotiz`-Entsprechung.

### 2.4 Kritischer Fund: `aktuellerFall` wird von `renderFallakte()`/`openFallakte()` nicht gesetzt

`openFallakte(id)` ([index.html:6817](../../../index.html#L6817)) setzt nur `_fallakteId=id;mtCloseOverlays();go('fallakte');` — **nicht** `aktuellerFall`. `renderFallakte()` liest `_fallakteId`, nicht `aktuellerFall`. Bislang unschädlich, weil `openFallakte()` bisher **ausschließlich** aus dem bereits offenen `#ovDetail` heraus aufgerufen wird ([index.html:4154](../../../index.html#L4154)) — `aktuellerFall` ist dann durch das vorangegangene `openDetail()` bereits korrekt gesetzt.

Sobald `#ovDetail` entfällt und alle 13 Aufrufstellen aus §2.1 direkt `openFallakte()` aufrufen (ohne vorherigen `openDetail()`-Aufruf), bleibt `aktuellerFall` `null`/veraltet. Da `dArbeitHtml()`s komplette Werkbank (`kzAnfragen`, `kzZusage`, `kzAblehnung`, `sendReply`, `kzNotizAdd`, `dArbeitKostenUpload`, `dArbeitUnterlagenAnfordern`, `advanceFall`, der künftige Steuerung-Speichern-Handler) ausnahmslos über das modul-weite `aktuellerFall` arbeitet, **bricht die gesamte Arbeit②/③-Zone**, wenn dieser Fund nicht behoben wird. **Fix (Teil dieser Runde, keine Option):** `renderFallakte()` setzt als erste Zeile `aktuellerFall=f;` (analog zu `openDetail()`s `aktuellerFall=faelle.find(...)`).

### 2.5 History/Overlay-Mechanik

- **`_DETAIL_IDS=["ovDetail","dbDetail","rsDetail","egDetail"]`** ([index.html:6864](../../../index.html#L6864)): `"ovDetail"` wird aus diesem Array entfernt (3 verbleibende Einträge).
- **`pushDetailState()`** ([index.html:6868](../../../index.html#L6868)): generischer Mechanismus für alle `_DETAIL_IDS`-Overlays, bleibt unverändert — betrifft nach Entfernung von `"ovDetail"` nur noch `dbDetail`/`rsDetail`/`egDetail`.
- **`_rawCloseDetails()`** ([index.html:6869-6872](../../../index.html#L6869)): iteriert über `_DETAIL_IDS`, entfernt `.open`. Kein Sonderfall für `ovDetail` im Code selbst (rein generisch über das Array) — durch die Array-Kürzung automatisch korrekt.
- **`dismissDetail()`** ([index.html:6873](../../../index.html#L6873)): bleibt unverändert, wird aber nach Entfernung von `#ovDetail` **nur noch** von `dbDetail`/`rsDetail`/`egDetail`-Zurück-Buttons aufgerufen (`dAbbruch`-Verdrahtung entfällt mit `#ovDetail`).
- **`_closeSiblingDetailRails(exceptId)`** ([index.html:4366](../../../index.html#L4366)): `_closeSiblingDetailRails("ovDetail")`-Aufruf in `openDetail()` entfällt mit der ganzen Funktion. Prüfen: wird `"ovDetail"` an anderer Stelle als `exceptId`-Parameter übergeben? — **nein** (verifiziert per grep, einzige Übergabe war `openDetail()`s eigener Aufruf). Die Funktion selbst bleibt (wird weiterhin für `egDetail`/`dbDetail` genutzt), nur der `ovDetail`-Aufruf entfällt mit der Funktion, in der er steht.
- **`mtCloseOverlays()`** ([index.html:6731-6736](../../../index.html#L6731)): Array `["refOverlay","ovDetail","dbDetail","rsDetail","sheetNeu","kpSheet","rpDocView","egDetail"]` — `"ovDetail"` wird aus diesem Array entfernt (7 verbleibende Einträge). Betrifft `mtEnter()` (Wechsel in `ma-mode`) — unkritisch, da rein defensiv (schließt ein Overlay, das ohnehin nicht mehr existiert).
- **Route `#fallakte` selbst**: bleibt **unverändert** — sie ist bereits heute eine normale `go()`-Route (kein Overlay, kein `_DETAIL_IDS`-Eintrag, kein `pushDetailState()`), das „Zurück zum Board"-Verhalten läuft über den normalen Browser-Verlauf via `applyHash()`/`history.replaceState` in `go()` (Zeile [index.html:6768](../../../index.html#L6768)) — kein Zurück-Button-Sonderfall nötig, weil kein Overlay-State existiert, der zu bereinigen wäre. Das ist bereits heute korrekt und braucht **keine Änderung**.

### 2.6 CSS-Waisen-Kandidaten nach Entfernung von `#ovDetail`

**Reine `#ovDetail`-Selektoren (18 Fundstellen, [index.html:784-2508](../../../index.html#L784)) — Einzelverweise (komplette Regel entfernen):**

| Zeile | Selektor | Status |
|-------|----------|--------|
| 784–790 | `#ovDetail{…}`, `#ovDetail.open{…}`, `#ovDetail .modal{…}`, `#ovDetail.open .modal{…}`, `#ovDetail .mbody.two-track{…}`, `#ovDetail .mbody.two-track .d-track-wrap{…}` | Waise |
| 1884 | `#ovDetail .d-acc>summary{…}` | Waise |
| 1886 | `#ovDetail .status-pill.lock{…}` | Waise — **redundant bereits heute**: identisch zur globalen Basisregel `.status-pill.lock` ([index.html:460](../../../index.html#L460)), Entfernen ändert nichts visuell |
| 1888–1889 | `#ovDetail .mbody textarea{…}`, `#ovDetail .mbody textarea:focus{…}` | Waise |
| 2490–2493 | `#ovDetail .modal{border:…}` (Basis + `@media(min-width:1024px)`-Override) | Waise |
| 2496 | `#ovDetail .mhead{…}` | Waise |
| 2499 | `#ovDetail .pa-akte{border-radius:4px;border-top:2px solid var(--gold-soft)}` | Waise (Basisklasse `.pa-akte` selbst bleibt — wird in `dbDetail`/`rsWirt`/`faUebersicht` weiterverwendet) |
| 2508 | `#ovDetail .mbody textarea:focus{…}` (zweite, jade-farbene Variante — offenbar spätere Layer-Override der Zeile 1889) | Waise |

**Gruppierte Selektoren — Regel NICHT löschen, nur den `#ovDetail`-Teil aus der Selektorliste entfernen:**

| Zeile | Selektor | Aktion |
|-------|----------|--------|
| 2216 | `#ovDetail .modal,#dbDetail .modal{…}` | zu `#dbDetail .modal{…}` kürzen — `#dbDetail` bleibt |
| 2219 | `#ovDetail .mfoot,#dbDetail .mfoot{…}` | zu `#dbDetail .mfoot{…}` kürzen |
| 2462 | `#view-faelle .btn-brass,#ovDetail .btn-brass{…}` | zu `#view-faelle .btn-brass{…}` kürzen |
| 2465 | `#view-faelle .btn-ghost,#ovDetail .btn-ghost{…}` | zu `#view-faelle .btn-ghost{…}` kürzen |
| 2498 | `#ovDetail .d-acc,#ovDetail .docs{border-radius:4px}` | **beide** Teile referenzieren `#ovDetail` → ganze Regel wäre Waise, **aber**: falls die neue Steuerung (③) `.d-acc` weiterverwendet und die neue Arbeit② (`.docs`, aus `dArbeitHtml()`s Unterlagen-Zweig) im `.fk-*`-Namespace der Akte landet, sollte die `border-radius:4px`-Intention (4px-Radius-Familie, Etiketten-Ästhetik) **unter dem neuen Akte-Namespace neu gesetzt** werden (z. B. `#view-fallakte .d-acc,#view-fallakte .docs{border-radius:4px}`), nicht ersatzlos gestrichen — sonst fällt die Etiketten-Radius-Konvention in der Akte auf die generische 12px-Basisregel von `.d-acc`/`.docs` zurück. |

**Klassen, die exklusiv nur einmal im gesamten Dokument vorkommen — innerhalb `#ovDetail` — und mit dem Markup umziehen, NICHT löschen (bleiben gültig, weil das Markup selbst nur den Container wechselt):**

- `.mgrid` ([index.html:575](../../../index.html#L575), Regel-Definition; [index.html:4162](../../../index.html#L4162), einzige HTML-Verwendung) — zieht mit dem Steuerung/Verlauf-Block um oder wird zur neuen `.fk-*`-Struktur; Regel bleibt nutzbar, aber die `.mbody.two-track .mgrid{grid-column:1}`-Kopplung ([index.html:572](../../../index.html#L572)) ist spezifisch an `.mbody.two-track` gebunden (s. u.) — wird beim Umbau ohnehin durch neue `.fk-*`-Grid-Regeln ersetzt.
- `.d-track-wrap` ([index.html:568](../../../index.html#L568), Definition; [index.html:4158](../../../index.html#L4158), einzige Verwendung) — Waisen-Kandidat, da die neue Kontext-Zone eine eigene `.fk-*`-Struktur bekommt statt diese 1:1 zu übernehmen (Entscheidung liegt beim Umsetzer — funktional deckungsgleich mit dem, was die neue rechte Kontext-Zone braucht).
- `.mbody` (Basisregel, [index.html:567](../../../index.html#L567)) — **bleibt**, da auch von `#dbDetail` genutzt (`<div class="mbody" id="dbBody">`, [index.html:4196](../../../index.html#L4196)). Nur der Modifier `.mbody.two-track` (samt seiner drei Zeilen im `@media(min-width:900px)`-Block, [index.html:571-574](../../../index.html#L571)) ist exklusiv `#ovDetail` und wird Waise.
- `.d-acc`/`.d-acc-body` (Basisregeln, [index.html:1440-1446](../../../index.html#L1440)) — HTML-Verwendung ([index.html:4163-4165](../../../index.html#L4163)) ist aktuell exklusiv `#ovDetail` (das „Details & Unterlagen"-Akkordeon). **Bleibt bestehen** — empfohlen zur Wiederverwendung als Collapse-Wrapper für die neue Steuerung(③)-Sektion in der Akte (identisches, bereits eingeführtes Muster wie Sprint 3/Runde 3 `mt-sleitfaden-details`/`pa-fold`), damit kein neuer Akkordeon-Mechanismus erfunden werden muss. Keine Waise, sondern Wiederverwendung mit neuem Aufrufort.
- `.saluto-toggle`/`.verlustrow` ([index.html:580-584](../../../index.html#L580)) — ziehen mit den Feldern `dSaluto`/`dVerlust` in die Steuerung um, bleiben unverändert gültig.
- `.fh-hero`/`.fh-meta`/`.fh-actions`/`.ah-*`/`#dFristWrap`/`.fh-owner-chip` ([index.html:2976-2996](../../../index.html#L2976)) — **bleiben unverändert**, bereits heute in `faNaechste` (Fallakte) genutzt (`.fh-hero`) bzw. für die Steuerung (③) weiterverwendbar (`#dFristWrap`/`.fh-owner-chip` sind exakt die IDs, die mit `dFrist`/`dOwner` umziehen).
- `#dArbeit label`/`#dArbeit input[type=checkbox]` ([index.html:3069-3070](../../../index.html#L3069)) — bleiben gültig, da die ID `dArbeit` unverändert mit dem Markup umzieht.

**Zusammenfassung CSS-Waisen:** **8 echte Waisen-Regel-Blöcke** (784–790 zusammen als 1 Block gezählt, 1884, 1886\*, 1888–1889 als 1 Block, 2490–2493 als 1 Block, 2496, 2499) + **1 Regel, die zu 4px-Konvention unter neuem Selektor migriert werden sollte statt gelöscht** (2498) + **5 gruppierte Selektoren, die gekürzt statt gelöscht werden** (2216, 2219, 2462, 2465, plus 2498 s. o.). \*1886 ist zusätzlich redundant mit einer bestehenden globalen Regel, ihr Entfernen hat also ohnehin keinen visuellen Effekt.

---

## 3. Soll — Kopf (schmal, immer sichtbar)

Der Kopf bleibt die bereits vorhandenen statischen Elemente `faAva`/`faName`/`faSub`/`faHeadMeta` plus **drei neue, additive Anzeigen** und **eine neue Komponente**:

- **Avatar, Name (Alter):** unverändert (`faAva`/`faName`).
- **Achse-Pill:** unverändert (`.pill-a` in `faHeadMeta`).
- **Kostenträger:** neu als eigene Pill (`.pill-kt`, dasselbe Muster wie in Board-Karten/`mtSheet`) in `faHeadMeta`, zusätzlich zur bisherigen textuellen Erwähnung in `faSub` (dort bleibt sie, da `faSub` auch Quelle/Kanal transportiert).
- **Sterne:** unverändert (`sterneHtml(sterneVon(...))`, bereits in `faHeadMeta`).
- **SalutoCare-Stern falls gesetzt:** neu, `f.saluto?"<span class='star'>★ SalutoCare</span>":""` (identisches Muster zur Board-Karte, [index.html:4917](../../../index.html#L4917) Kontext) in `faHeadMeta`.
- **Status als kompaktes horizontales Prozessband — neue Komponente:** eine neue Funktion (z. B. `stageBandHtml(f)`, Namespace `.fk-stageband`), die dieselben 6 Werdegang-Stufen wie `deriveSchritte(f)`/`STATUS.slice(0,6)` horizontal statt vertikal darstellt, mit identischer Semantik zum bestehenden `.stepper`/`.stp` (Jade gefüllt bei `done`, Gold bei `current`, hohl bei zukünftig — dieselben Tokens `var(--sage)`/`var(--brass)` wie [index.html:328-330](../../../index.html#L328), nur horizontal angeordnet statt als vertikale Punkt-Linie). Kein neuer Datenzustand — konsumiert dieselbe `deriveSchritte(f)`/`f.schritte`-Quelle wie der bestehende vertikale `stepper()` in der Kontext-Zone.
- **Zuordnungs-Hinweis (`f.zuordnungsHinweis`) als goldene Zeile falls gesetzt:** neu im Kopf. **Offener Punkt (s. §8 Unklarheiten):** `aufgabenHeroHtml()` rendert denselben Hinweis heute bereits als `.ah-hinweis`-Zeile innerhalb des Hero (Arbeit①) — mit dem neuen Kopf-Hinweis entstünde eine Dopplung. Empfehlung dieser Spec: die `.ah-hinweis`-Zeile wird aus `aufgabenHeroHtml()` entfernt (einzige verbleibende Konsumenten dieser Funktion sind Arbeit① der Akte — nach Entfernung von `#ovDetail` gibt es keinen zweiten Aufrufer mehr, der die Zeile bräuchte), der Hinweis erscheint dann **nur einmal**, im Kopf. `mtSheet`s `.mt-shinweis`-Anzeige ([index.html:6662](../../../index.html#L6662)) ist davon unberührt (separates Sheet, eigene Anzeige, bleibt).

---

## 4. Soll — Arbeitszone (links)

**① Nächste-Aufgabe-Hero:** `faNaechste` bleibt (`.fh-hero`, `aufgabenHeroHtml(f)`), zusätzlich der Button „Aktuelle Aufgabe erledigt → nächster Schritt ›" (identischer Text/Icon wie bisher in `#ovDetail`), `onclick="advanceFall()"`. `advanceFall()` selbst ändert sich nur in der letzten Zeile: `renderAll();openDetail(f.id);` → `renderAll();renderFallakte();` (kein Statuswechsel-Logik-Unterschied).

**② Dynamischer Arbeitsbereich:** neues Ziel-Div (z. B. `id="faArbeit"`, ersetzt das bisherige `id="dArbeit"` — **oder** die ID `dArbeit` wird 1:1 beibehalten, um jede der o. g. Konsumentenfunktionen unangetastet zu lassen; **empfohlen: ID `dArbeit` beibehalten**, da `sendReply()`/`kzNotizAdd()`/`updateDocCnt()`/`dArbeitKostenUpload()` sie direkt per `getElementById` referenzieren und eine Umbenennung mehrere Funktionskörper anfassen würde, ohne fachlichen Nutzen — Surgical-Changes-Prinzip). `renderFallakte()` ergänzt `document.getElementById("dArbeit").innerHTML=dArbeitHtml(f);` (identischer Aufruf wie bisher in `openDetail()`). Danach funktionieren `kzAnfragen`/`kzZusage`/`kzAblehnung`/`sendReply`/`kzNotizAdd`/`dArbeitKostenUpload`/`dArbeitUnterlagenAnfordern`/`updateDocCnt` unverändert, **sofern** `aktuellerFall` korrekt gesetzt ist (§2.4-Fix) und `kzAnfragen`/`kzZusage`/`kzAblehnung`s Re-Render-Zeile auf `renderFallakte()` statt `openDetail()` umgestellt wird (3 Stellen).

**③ Steuerung (kompakter Abschnitt):** die Felder `dOwner`/`dFrist`/`dFristWrap`/`dOwnerAva` (bereits als editierbare native Elemente im Hero-`.fh-meta` vorgesehen — ziehen 1:1 mit `faNaechste`s Struktur um oder direkt daneben) sowie `dStatus`/`dKosten`/`dKT`/`dConsent`/`dSaluto`/`dVerlust`/`rowVerlust` (bisher im `.d-acc`-Akkordeon „Details & Unterlagen") werden als **statisches** Markup (kein `innerHTML`-Rebuild) direkt in `#view-fallakte` platziert — analog dazu, wie sie heute direkt (nicht per `innerHTML`) in `#ovDetail`s Modal stehen. Das ist notwendig, damit die drei bereits einmalig beim Skript-Laden gebundenen `addEventListener` (`dStatus`→`toggleVerlust`, `dOwner`→`dOwnerAva`-Sync, `dFrist`→`dFristWrap`-Sync, [index.html:6272-6274](../../../index.html#L6272)) weiter funktionieren, ohne neu gebunden werden zu müssen. Empfohlen: `.d-acc`-Wrapper wiederverwenden (s. §2.6) für einen „Steuerung"-Collapse. Ein neuer Button `id="faSpeichern"` (oder `dSpeichern` bleibt, s. u.) übernimmt den bisherigen `dSpeichern`-Handler-Körper unverändert, **außer** der letzten beiden Zeilen: `renderAll();dismissDetail();` → `renderAll();renderFallakte();` (kein Schließen mehr, sondern Neu-Rendern der bereits offenen Akte). Der `alert()`-Pflichtfeld-Check und `celebratePlanned()`-Aufruf bleiben unverändert.

**④ Verlauf + Neue-Notiz-Feld:** neues Ziel-Div für die Log-Timeline (die ID `dLog` bleibt **zwingend** erhalten, da `sendReply()` und `kzNotizAdd()` direkt `document.getElementById("dLog").innerHTML=…` schreiben, ohne über eine zentrale Render-Funktion zu gehen — eine ID-Änderung hier würde zwei Funktionskörper anfassen müssen, ohne fachlichen Grund). `renderFallakte()` ergänzt `document.getElementById("dLog").innerHTML=f.log.map(...)` (identische Map-Funktion wie bisher dreimal im Code dupliziert — bleibt an dieser Stelle unverändert dupliziert, keine Refaktorierung dieser Runde). Das freie Notizfeld `dNotiz` zieht unverändert mit um, sein Wert wird weiterhin nur beim Klick auf „Speichern" (③) committed — **nicht** beim Tippen.

**Alias-Entscheidung (Routing, Details in §6):** `openDetail(id)` wird zu einem dünnen Alias `function openDetail(id){openFallakte(id);}` (statt alle 13 Aufrufstellen einzeln umzuschreiben). Begründung s. §6.

---

## 5. Soll — Kontextzone (rechts, lesend)

Übernimmt die heutige `.fa-col-r`/`.fa-col-l`-Struktur größtenteils unverändert, mit einer Verhaltensänderung:

- **Werdegang vertikal:** `faWerdegang` bleibt unverändert (`stepper(f.schritte||deriveSchritte(f))` + Log-Timeline-Anhang) — identisch zu heute.
- **Kostenzusage-Kette (lesend):** `faAbrechnung` bleibt unverändert (`kzChain(f)` ohne `kzActions`) — bewusst redundant zur interaktiven `kzChain(f)+kzActions(f)`-Variante in Arbeit②, falls die aktuelle Aufgabe kostenbezogen ist (Kontext = immer sichtbare Kurzübersicht, Arbeit = Handlungsort nur wenn gerade relevant).
- **Dokumente als Status-Chips:** `faDokumente` bleibt unverändert.
- **Stammdaten-Akte (`pa-fold`, zugeklappt):** `faUebersicht`s `paAkteSlot(f.personId)`-Aufruf wird mit dem Sprint-1-Collapse-Muster umschlossen: `"<details class='pa-fold'><summary class='rk'>Stammdaten-Akte</summary>"+paAkteSlot(f.personId)+"</details>"` — **bewusste Revision der Sprint-1-Entscheidung** (dort blieb Stelle 4/`renderFallakte()` explizit offen, weil „Akte ist hier der Zweck der Seite"; mit dem Cockpit-Umbau ist die Akte nicht mehr der Seitenzweck, sondern nur noch Kontext-Information neben der Arbeitszone — die Begründung von Sprint 1 entfällt damit, die gleiche Behandlung wie im Fall-Drawer/In-Reha-Overlay ist jetzt konsistent).
- **Medizinische Kurzfelder (falls `inReha`-Match):** `faMedizin` bleibt unverändert.

---

## 6. Routing / Entfernung der Schublade

**Alias statt Einzelumstellung:** `function openDetail(id){openFallakte(id);}` ersetzt die bisherige `openDetail()`-Definition ([index.html:6229-6260](../../../index.html#L6229)) komplett. Alle 13 Aufrufstellen aus §2.1 bleiben **wörtlich unverändert im Code** (`openDetail(f.id)`, `openDetail(fid)`, `openDetail(m.fallId)`, `click:"openDetail("+f.id+")"` …) und laufen automatisch über den Alias in die Akte. **Warum Alias statt Umstellung aller 13 Stellen:** chirurgischer (1 geänderte Funktionsdefinition statt 13 verteilte Änderungen über 6 Dateien-Bereiche), risikoärmer (String-Interpolationen wie `click:"openDetail("+f.id+")"` in `renderWichtig()` sind fehleranfällig beim manuellen Umschreiben auf `openFallakte`), und macht die Migration in einem späteren Aufräum-Schritt trivial nachvollziehbar (grep nach `openDetail(` findet dann ausschließlich Aufrufstellen, keine Definition mehr, die wörtlich dasselbe tut). Nachteil: der Name `openDetail` bleibt im Code bestehen, obwohl es kein „Detail-Overlay" mehr gibt — das ist ein bewusster, dokumentierter Kompromiss (Übergangs-Alias), keine Verwechslungsgefahr, da die Funktion nur eine Zeile hat und ihr Zweck im selben Atemzug ersichtlich ist. Empfehlung für eine spätere Runde: die 13 Aufrufstellen schrittweise direkt auf `openFallakte` umstellen und den Alias dann entfernen — **nicht Teil dieser Runde**.

**`antwortenEingang()`-Sonderfall:** der `setTimeout(...)`-Fokus auf `#dReply` ([index.html:4854](../../../index.html#L4854)) funktioniert unverändert, da `dReply` als ID mit `dArbeit` in die Akte umzieht und `openFallakte()`/`go('fallakte')` synchron genug rendert, dass das Element nach 80 ms existiert (identisches Timing-Verhalten wie heute).

**Entfernung `#ovDetail`:**
- **Markup:** der komplette `<div class="overlay" id="ovDetail">…</div>`-Block ([index.html:4142-4180](../../../index.html#L4142), grob) wird entfernt — die darin enthaltenen Steuerfelder (§2.2) werden **vor** der Löschung in `#view-fallakte` verschoben (nicht kopiert-und-dann-gelöscht, sondern derselbe Markup-Knoten wandert), `dArbeit`/`dWerdegang`/`dAkte`/`dLog`/`dNotiz` ebenso.
- **CSS:** die 8 Waisen-Blöcke + 5 zu kürzenden Selektorlisten aus §2.6.
- **History-Integration:** `"ovDetail"` aus `_DETAIL_IDS` ([index.html:6864](../../../index.html#L6864)) und aus `mtCloseOverlays()`s Array ([index.html:6732](../../../index.html#L6732)) entfernen. `_closeSiblingDetailRails("ovDetail")`-Aufruf entfällt automatisch mit `openDetail()`s alter Funktionsdefinition (die durch den Alias ersetzt wird). `pushDetailState()`/`dismissDetail()`/`_rawCloseDetails()`/`popstate`-Handler bleiben unverändert (generisch, betreffen nach der Kürzung nur noch `dbDetail`/`rsDetail`/`egDetail`).
- **„Vollständige Fallakte öffnen →"-Button** ([index.html:4154](../../../index.html#L4154)) entfällt ersatzlos mit dem gesamten `#ovDetail`-Markup.

**`egDetail`/`dbDetail`/`rsDetail`:** bleiben unverändert als Overlays bestehen (explizites Nicht-Ziel).

---

## 7. Mobile (<1024px)

Die bestehende `.fa-cols`-Grid-Regel ([index.html:3019](../../../index.html#L3019): `grid-template-columns:1fr 1fr`) ist bereits per `@media(min-width:1024px)` gated — unterhalb von 1024px ist `.fa-cols` implizit einspaltig (kein expliziter Mobile-Override nötig, da die Basisregel vor dem Media-Query-Block keine Spalten definiert, s. Kontext [index.html:3010-3019](../../../index.html#L3010)). Für das neue Zwei-Zonen-Layout (Arbeit/Kontext statt Werdegang/Rest) gilt dasselbe Prinzip: eine neue `.fk-cols` (oder Erweiterung von `.fa-cols`) mit dem Arbeit-Block als erstes Kind im Markup, damit die Stapelreihenfolge unterhalb 1024px automatisch „Arbeit zuerst" ergibt, ohne `order`/Flex-Reorder-CSS. Der Kopf bleibt in beiden Breiten oberhalb der Zonen, unverändert aus dem heutigen `<header class="vhead">`-Aufbau.

---

## 8. Erfolgskriterien

- Ein kompletter Fall-Lebenszyklus (Neu → Kontaktiert → Qualifizierung → Unterlagen → Aufnahme geplant → Aufgenommen) ist **ausschließlich** über die Fallakte durchspielbar: Board-Klick öffnet die Akte, „Aktuelle Aufgabe erledigt" advanciert den Status, die Steuerung erlaubt manuelle Korrekturen, der Verlauf zeigt jeden Schritt.
- Ein Klick auf eine Board-Karte landet direkt in der Fallakte (nicht mehr in einer Schublade).
- Der Browser-Zurück-Button funktioniert weiterhin sauber für `egDetail`/`dbDetail`/`rsDetail` (unverändert) — die Fallakte selbst nutzt weiterhin die normale `go()`-Navigation (kein Regressionsrisiko, da an diesem Mechanismus nichts geändert wird).
- `ma-mode`/`mtSheet` bleiben zu 100 % unangetastet — keine einzige Zeile in `mtSheetRender()`/`mtAbschliessen()`/`mtCloseOverlays()`s Aufruf-Logik (außer der reinen Array-Kürzung um `"ovDetail"`) verändert sich.
- 0 Console-Errors bei 390px und 1440px, insbesondere beim direkten Anspringen von `#fallakte` per Hash/Reload (`_fallakteId` muss dann bereits gesetzt sein oder `renderFallakte()`s bestehender Fallback `if(!_fallakteId){go('faelle','board');return;}` greift — unverändert).
- Genau 9 Keyframes (unverändert, keine neuen).
- `escapeHtml` für alle dynamischen Inhalte in der neuen `stageBandHtml()`-Komponente.

**Nicht-Ziele:** `ma-mode`/`mtSheet` (Koordinations-Arbeitsplatz, komplett unangetastet). `egDetail`/`dbDetail`/`rsDetail` (bleiben Overlays, keine Migration in die Akte). Cofounder-Namespaces (`.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`, `openReferrer`/`closeReferrer`, `#refOverlay`). Kein neues Datenfeld. Keine schrittweise Ablösung des `openDetail`-Alias durch direkte `openFallakte`-Aufrufe an den 13 Stellen (spätere Runde). Keine Refaktorierung der dreifach duplizierten Log-Timeline-Map-Funktion (`sendReply`/`kzNotizAdd`/`renderFallakte`) — bleibt wie bisher dupliziert.

---

## Querschnittsanforderung — Ästhetik-Leitplanke (identisch zu Runde 3/4/5-Sprint1+2)

- **Etiketten-System:** Doppelrahmen (Jade-Hairline + Gold-Inset-Ring), Gold-Eckwinkel auf Major-Karten, Radius-Familie 4px — gilt auch für den neuen `stageBandHtml()`-Kopf und die Steuerung-Sektion.
- **Typografie:** Cormorant Garamond für Display/Numerale, Inter für Fließtext.
- **Neuer CSS-Namespace `.fk-*`** (fallakte-cockpit) für alles genuin Neue (Stage-Band, ggf. neue Grid-Wrapper) — bestehende, wiederverwendete Klassen (`.fh-hero`, `.pa-fold`, `.d-acc`, `.kz-*`, `.ah-*`) behalten ihre bisherigen Namen.
- Kein neues Keyframe. `escapeHtml` für dynamische Inhalte. Kein `Math.random`. 390px und 1440px verifizieren, 0 Console-Errors, reduced-motion-safe.
