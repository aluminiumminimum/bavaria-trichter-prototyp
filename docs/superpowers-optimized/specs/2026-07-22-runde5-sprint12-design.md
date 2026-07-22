# Runde 5, Sprint 1+2 — Design

**Bezug:** Fünfte Runde, aufbauend auf [2026-07-22-runde4-vertiefung-design.md](./2026-07-22-runde4-vertiefung-design.md). Runde 4 ist vollständig umgesetzt und auf `main` (verifiziert per `git log`: `bb5a208` … `25b9783`, u. a. `#egDetail`-Overlay + echte Team-Zuordnung, dynamische `#dArbeit`-Fallakte, `.nwt-*`-Tabs Radar/Stammdaten, Protokoll-Board mit Barthel/FIM/Chips). Der Nutzer hat sieben Punkte zurückgemeldet; **Punkt 3 (Fallakte-Herzstück-Redesign) ist ausdrücklich NICHT Teil dieser Spec** — dafür ist ein separates Brainstorming vorgesehen (s. Nicht-Ziele). Diese Spec deckt die verbleibenden sechs Punkte ab, aufgeteilt in zwei Sprints:

- **Sprint 1** — Punkt 1 (Original + Zusammenfassung im Anfrage-Fenster), Punkt 2 (SalutoCare-Toggle + Zuordnungs-Hinweis), Punkt 5 (Akte einklappbar).
- **Sprint 2** — Punkt 4 (Team-Statistiken), Punkt 6 (Zuweiser: Archiv + After-Sales-Anlässe), Punkt 7 (Bestand/Aktionen-Trennung).

**Nicht-Ziel:** Kein neues Backend, kein Build-Prozess, keine Bibliotheken. Cofounder-Namespaces (`.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`, `openReferrer`/`closeReferrer`, `#refOverlay`) bleiben unangetastet. **Kein Fallakte-Herzstück-Redesign** (Nutzer-Feedback-Punkt 3 „Bei in Reha muss die Akte nicht schon aufgeklappt sein …" wird in dieser Spec nur insoweit behandelt, wie er sich auf die bereits bestehende `paAkte`/`paAkteSlot`-Einbettung bezieht — die grundsätzliche Neugestaltung der Fallakte selbst folgt separat). Datenarrays nur additiv erweitern: `m.zusammenfassung`, `f.zuordnungsHinweis`, `z.seit` sind die einzigen neuen Felder dieser Runde — `z.letzter` ist bereits ISO-Datum (`dstr()`-Ausgabe) und braucht **kein** zusätzliches normiertes Feld (s. Punkt 6). Jede Änderung bei 390px und 1440px verifizieren, 0 Console-Errors, reduced-motion-safe, nur synthetische Demo-Daten, `escapeHtml` für dynamische Inhalte, kein `Math.random`.

---

## Querschnittsanforderung — Ästhetik-Leitplanke

Gilt für jede in dieser Runde neu gebaute Oberfläche (identisch zu Runde 3/4):

- **Etiketten-System:** Doppelrahmen (Jade-Hairline + Gold-Inset-Ring), Gold-Eckwinkel auf Major-Karten, Radius-Familie 4px. Referenz: `.eg-triage` ([index.html:3025-3029](../../../index.html#L3025)) als bereits gebautes Beispiel aus Runde 4.
- **Typografie:** Cormorant Garamond für Display/Numerale (`.kicker` [index.html:65](../../../index.html#L65), `.chap-h2` [index.html:67](../../../index.html#L67)), Inter für Fließtext.
- **Token statt Freihand-Farbe:** `ACHSE_COL` ([index.html:4204](../../../index.html#L4204)) für alle Achse-Farben — **nie als Fläche**, nur als kleiner Dot/Rahmen (explizite Vorgabe für Punkt 4c und bestehende Praxis in `networkDot()` [index.html:5354-5361](../../../index.html#L5354)).
- **Bereits vorhandene, direkt wiederverwendbare Muster:**
  - `summary.rk` ([index.html:3066-3067](../../../index.html#L3066)) + `<details class='mt-sleitfaden-details'><summary class='rk'>…</summary>` ([index.html:6553](../../../index.html#L6553)) — der aus Runde 3 (Punkt 8) stammende Leitfaden-Collapse, direktes Vorbild für **Punkt 5**s `.pa-fold`.
  - `.d-acc` ([index.html:1441-1447](../../../index.html#L1441)) — natives `<details>` mit Chevron-Rotation, zweites mögliches Vorbild für den Collapse-Rahmen.
  - `.tchip.on` ([index.html:5195](../../../index.html#L5195)) / `.zcat.active` ([index.html:5367](../../../index.html#L5367)) / `.egd-owner.sel` ([index.html:3082](../../../index.html#L3082)) — Klick-Chip mit aktivem Zustand, Vorbild für **Punkt 2**s SalutoCare-Toggle.
  - `.db-cockpit`/`.radar-kpi` ([index.html:1116-1157](../../../index.html#L1116), Aufbau in `dbCockpit()` [index.html:5174-5191](../../../index.html#L5174)) — Balken-aus-Segmenten + KPI-Kachel-Reihe, Vorbild für **Punkt 4**s Team-Cockpit.
  - `arCard()`/`AR_TYP`/`AR_FOTO` ([index.html:4992-5008](../../../index.html#L4992)/[4990](../../../index.html#L4990)/[4991](../../../index.html#L4991)) — die bestehende Anlass-Karte, für **Punkt 6** um neue `typ`-Werte erweitert, Struktur unverändert.
- **Motion:** Keine neuen Keyframes. Verifiziert genau 9 im gesamten Code (unverändert seit Runde 4): `lift` [index.html:61](../../../index.html#L61), `rpDrawC`/`rpDrawP` [index.html:1058-1059](../../../index.html#L1058), `rpRing` [index.html:1073](../../../index.html#L1073), `rpGrow` [index.html:1089](../../../index.html#L1089), `cv-travel` [index.html:1377](../../../index.html#L1377), `auGrow` [index.html:2042](../../../index.html#L2042), `lxSweep` [index.html:2051](../../../index.html#L2051), `lxPulse` [index.html:2094](../../../index.html#L2094).

---

# Sprint 1

## 1. Eingang-Fenster → Original + Zusammenfassung

**Nutzer-Feedback:** „Wenn eine Anfrage kommt, sollte man die Originalanfrage auch sehen können direkt und dann eben eine kurze Zusammenfassung davon."

**Ist:** `egSummaryHtml(m)` ([index.html:4342-4367](../../../index.html#L4342)), einzige Aufrufstelle in `openEgDetail()` ([index.html:4394](../../../index.html#L4394)). Struktur: `.mhead` (Kopf) → bei `m.typ!=="passiv"` der `.eg-triage`-Block (Wer/Woher/Was/Wie-konkret, [index.html:4350-4355](../../../index.html#L4350)), sonst Pills+Sterne ([index.html:4357-4360](../../../index.html#L4357)) → direkt darunter, **ohne Label und ohne eigene Papier-Optik**, die rohe Original-Nachricht: `"<div class='mtxt'>"+escapeHtml(m.txt)+"</div>"` ([index.html:4365](../../../index.html#L4365)). `.mtxt` selbst ist eine reine Fließtext-Regel (`font-size:14.5px;color:var(--muted);margin-top:3px;line-height:1.45`, [index.html:296](../../../index.html#L296)) — kein Papier-Charakter, keine Abgrenzung vom Rest. `.mtxt` wird **ausschließlich** hier verwendet (verifiziert per grep — keine andere Stelle nutzt die Klasse), Änderungen daran sind also gefahrlos lokal.

Es gibt **keine Zusammenfassung** — weder auf `eingang[]` ([index.html:4241-4250](../../../index.html#L4241), 8 Einträge) noch auf `INBOUND_POOL` ([index.html:4685-4689](../../../index.html#L4685), 3 Einträge) existiert ein `m.zusammenfassung`-Feld (verifiziert per Volltextsuche — additive Neueinführung ist sicher). `simulateInbound()` ([index.html:4739-4769](../../../index.html#L4739)) baut das `eingang.unshift({...})`-Objekt ([index.html:4742](../../../index.html#L4742)) aus **einzeln benannten** Feldern von `t` (kein Spread) — ein neues `t.zusammenfassung` muss dort explizit mit durchgereicht werden, sonst kommen simulierte Anfragen ohne Zusammenfassung an.

`erkenneSignale(m.txt)` ([index.html:4703](../../../index.html#L4703)) liefert bereits `sig.kostentraeger`/`sig.dringlichkeit`/`sig.konkret` — dieselben Felder, aus denen `egSummaryHtml()` schon heute den `grund`-Satz für „Wie konkret" komponiert ([index.html:4349](../../../index.html#L4349)): `[sig.kostentraeger?...,sig.dringlichkeit?...,sig.konkret?...].filter(Boolean).join(" · ")` — direktes Vorbild für den Fallback-Satz.

**Soll:**
- **(a) Seed-Daten:** Jeder der 8 `eingang[]`-Einträge und 3 `INBOUND_POOL`-Einträge bekommt ein additives Feld `zusammenfassung` (1 Satz, Stil wie vom Auftrag vorgegeben). Konkrete Sätze:
  - `id:101` (Ehefrau/Herz-OP): „Ehefrau fragt telefonisch für ihren Mann (72) nach Reha nach Herz-OP — PKV, Rückruf heute gewünscht."
  - `id:102` (RHÖN Bad Neustadt/Schlaganfall): „Sozialdienst RHÖN Bad Neustadt meldet einen Patienten (68) nach Schlaganfall zur AHB an — PKV, Entlassung in 4 Tagen."
  - `id:103` (Selbstzahlerin/Premium): „Selbstzahlerin (55) fragt über die Website nach der Premium-Suite — interessiert an Preisen und freien Terminen."
  - `id:104` (Dr. Sommer/Geriatrie): „Hausarzt Dr. Sommer empfiehlt seine Patientin (79) für eine geriatrische Reha — Beihilfe, Tochter koordiniert die Aufnahme."
  - `id:105` (Klinikum Fulda/Recare): „Entlassmanagement Klinikum Fulda sucht über Recare einen Neuro-Reha-Platz — GKV mit Komfort-Wunsch, Übernahme in 6 Tagen möglich."
  - `id:106` (PRIMO MEDICO/Beatmung): „Familie fragt über PRIMO MEDICO für ihren Vater (64) nach Intensiv-Reha mit Beatmung — internationale Premium-Anfrage."
  - `id:107` (Carola Diehm, passiv): „Interessentin (57) lädt die Reha-Broschüre herunter und erteilt Kontaktfreigabe — noch keine konkrete Anfrage."
  - `id:108` (lose Mail, passiv): „Anonyme Anfrage per E-Mail nach freien Plätzen — kein Name, kein Follow-up erkennbar."
  - `INBOUND_POOL[0]` (Familie Hoffmann/Wechsel-Reha): „Familie fragt über die Website für ihren Vater (74) nach einem dringenden Wechsel in die Premium-Neuro-Reha — unzufrieden mit der aktuellen Einrichtung."
  - `INBOUND_POOL[1]` (Herr Reinhardt): „Herr Reinhardt (61) fragt per E-Mail selbst nach der Premium-Suite — Komfort-Reha nach OP, möglichst kurzfristig."
  - `INBOUND_POOL[2]` (Dr. Kessler/Hüft-TEP): „Privatärztin Dr. Kessler meldet ihre Patientin (58) nach Hüft-TEP zur AHB an — Privatpatientin, kurzfristige Aufnahme erbeten."
- **(b) Durchreichen in `simulateInbound()`:** [index.html:4742](../../../index.html#L4742) ergänzt `zusammenfassung:t.zusammenfassung` im `eingang.unshift({...})`-Objektliteral.
- **(c) Fallback-Funktion** `egZusammenfassung(m)`: liefert `m.zusammenfassung`, falls gesetzt; sonst komponiert sie einen Satz aus `erkenneSignale(m.txt)` nach demselben Muster wie der bestehende `grund`-Aufbau ([index.html:4349](../../../index.html#L4349)), z. B. `escapeHtml(m.wer||"Anfrage")+" — "+[sig.kostentraeger,sig.dringlichkeit?"Frist "+sig.dringlichkeit:null,sig.konkret?"konkrete Anfrage":null].filter(Boolean).join(" · ")`.
- **(d) `egSummaryHtml(m)`-Erweiterung:** zwischen dem bestehenden `mid`-Block (Triage/Pills) und der bisherigen `.mtxt`-Zeile wird eingefügt:
  ```
  "<div class='eg-zsf'><span class='kicker'>Zusammenfassung</span><p>"+escapeHtml(egZusammenfassung(m))+"</p></div>"
  +"<div class='eg-original'><span class='kicker'>Originalanfrage</span><div class='mtxt'>"+escapeHtml(m.txt)+"</div></div>"
  ```
  ersetzt die bisherige einzelne `"<div class='mtxt'>"+escapeHtml(m.txt)+"</div>"`-Zeile ([index.html:4365](../../../index.html#L4365)). Gilt unverändert für alle drei Zustände (qualifiziert offen / passiv offen / `m.done`), da `egSummaryHtml()` bereits heute in allen drei Fällen aufgerufen wird.
- **(e) `.mtxt` aufwerten (Papier-Stil):** da `.mtxt` nachweislich nur noch innerhalb des neuen `.eg-original`-Wrappers vorkommt, bekommt der Wrapper (nicht `.mtxt` selbst, um die Basisregel nicht global zu verändern) eine leichte Papier-Anmutung: Hintergrund `var(--paper2)`, `border:1px solid var(--hair)`, `border-left:3px solid var(--brass-line)`, `border-radius:8px`, `padding:10px 12px`, `margin-top:4px` — dezent abgesetzt vom Zusammenfassungssatz darüber, ohne neue Schriftfamilie oder Cofounder-Optik zu kopieren.

**Erfolgskriterium:** `#egDetail` zeigt für jede Eingangs-Zeile zuerst einen 1-Satz-„ZUSAMMENFASSUNG"-Kicker, danach die vollständige, optisch abgesetzte „ORIGINALANFRAGE" — für alle Zustände (offen/passiv/erledigt) identisch aufgebaut. Fehlt `m.zusammenfassung` (z. B. bei künftig simulierten Anfragen ohne das Feld), erscheint stattdessen ein aus `erkenneSignale()` komponierter Satz, nie eine leere Zeile.

---

## 2. Eingang-Zuordnung → SalutoCare-Toggle + Bearbeitungs-Hinweis

**Nutzer-Feedback:** „Es muss direkt bei den Anfragen auch für den Koordinator eine Art Premium/Salutocare Button oder Ähnliches geben und die Möglichkeit, wenn man es einem Mitarbeiter zuordnet eine kurze Notiz zu schreiben, worauf geachtet werden muss."

**Ist:** State-Variablen `egOwner`/`_egId` ([index.html:4646](../../../index.html#L4646)), initialisiert in `openEgDetail()` beim ersten Öffnen einer Zeile: `if(_egId!==id){_egId=id;egOwner=(m.typ!=="passiv"&&!m.done)?ownerVorschlag(m.achse):null;}` ([index.html:4373](../../../index.html#L4373)). Der Zuordnungs-Block (`actions`-Variable, [index.html:4383-4392](../../../index.html#L4383)) rendert `.egd-owners` (Team-Chips, [index.html:3079-3085](../../../index.html#L3079) CSS) + zwei Buttons „Als Fall anlegen & zuordnen" (`uebernehmen(m.id,egOwner)`) und „✉ Antworten" (`antwortenEingang(m.id,egOwner)`). `egSetOwner(id,idx)` ([index.html:4402](../../../index.html#L4402)) setzt `egOwner=TEAM[idx]` und rendert per vollem `openEgDetail(id)`-Aufruf neu — exakt das Wiederverwendungsmuster, das der neue SalutoCare-Toggle übernimmt.

`uebernehmen(id,owner)` ([index.html:4782-4793](../../../index.html#L4782)) legt den neuen Fall mit `saluto:m.achse==="SalutoCare"` an ([index.html:4789](../../../index.html#L4789)) — hart aus der Achse abgeleitet, ohne manuelle Korrekturmöglichkeit; einziger `log`-Eintrag ist die automatische Übernahme-Zeile ([index.html:4790](../../../index.html#L4790)). `uebernehmen()` hat nur zwei Aufrufstellen (Button [index.html:4391](../../../index.html#L4391), `antwortenEingang()` [index.html:4796](../../../index.html#L4796)) — beide aus `#egDetail`-Kontext, ein drittes Argument ist nicht nötig, da die neuen Werte wie `egOwner` als modul-weite State-Variable gelesen werden können.

`aufgabenHeroHtml(f)` ([index.html:6004-6011](../../../index.html#L6004)) ist der Hero im Fall-Drawer — rendert `.ah-typ` + `.ah-meta` (Owner-Avatar + Frist), keine Zeile für einen Hinweis. `mtSheetRender()`s `miniFallakte`-Block ([index.html:6557-6562](../../../index.html#L6557)) zeigt für `item.kind==="fall"` Achse/KT-Pills + Status + die letzten 2 Log-Einträge — ebenfalls keine Hinweis-Zeile.

**Soll:**
- **(a) State:** `let egSaluto=false,egHinweis="";` ergänzt neben `egOwner`/`_egId` ([index.html:4646](../../../index.html#L4646)). In `openEgDetail()`s Init-Block ([index.html:4373](../../../index.html#L4373)) zusätzlich `egSaluto=m.achse==="SalutoCare";egHinweis="";` beim erstmaligen Öffnen einer Zeile (`_egId!==id`).
- **(b) SalutoCare-Toggle:** neuer Chip-Button im Zuordnungs-Block (nur im `else`-Zweig für offene, nicht-passive Anfragen, wie die bestehenden Owner-Chips), Muster `.tchip.on`/`.zcat.active`: `<button type='button' class='egd-saluto"+(egSaluto?" on":"")+"' onclick='egToggleSaluto("+m.id+")'>★ SalutoCare / Premium</button>`. Neue Funktion `egToggleSaluto(id){egSaluto=!egSaluto;openEgDetail(id);}` — identisches Muster zu `egSetOwner()`.
- **(c) Hinweis-Feld:** `<textarea id='egdHinweis' placeholder='Worauf muss geachtet werden?' oninput='egHinweis=this.value'>`+escapeHtml(egHinweis)+`</textarea>` mit Kicker-Label „Hinweis für die Bearbeitung (optional)" darüber — reine Variablen-Zuweisung bei `oninput`, **kein** Rerender pro Tastenanschlag (anders als der Toggle, der wie `egSetOwner()` neu rendert).
- **(d) `uebernehmen(id,owner)`-Erweiterung:** das neue Fall-Objekt bekommt `saluto:egSaluto` statt `m.achse==="SalutoCare"` ([index.html:4789](../../../index.html#L4789) angepasst) sowie additiv `zuordnungsHinweis:egHinweis||""`. Ist `egHinweis` gesetzt, wird zusätzlich zum bestehenden Übernahme-Log-Eintrag ein zweiter Eintrag gepusht: `f.log.push([dstr(0),"[Hinweis bei Zuordnung] "+egHinweis]);`.
- **(e) Anzeige im Fall-Drawer-Hero:** `aufgabenHeroHtml(f)` bekommt nach `.ah-meta` ([index.html:6009](../../../index.html#L6009)) eine neue, nur bei gesetztem Feld gerenderte Zeile: `(f.zuordnungsHinweis?"<div class='ah-hinweis'><span class='kicker'>Hinweis</span> "+escapeHtml(f.zuordnungsHinweis)+"</div>":"")` — dezent, Gold-Kicker, kein eigener Rahmen.
- **(f) Anzeige im Mein-Tag-Sheet:** `miniFallakte` ([index.html:6557-6562](../../../index.html#L6557)) bekommt nach der `.mt-sfstatus`-Zeile ([index.html:6559](../../../index.html#L6559)) dieselbe bedingte Zeile: `(item.ref.zuordnungsHinweis?"<div class='mt-shinweis'><span class='kicker'>Hinweis</span> "+escapeHtml(item.ref.zuordnungsHinweis)+"</div>":"")`.

**Erfolgskriterium:** Beim Zuordnen einer Anfrage kann der Koordinator sichtbar markieren, ob es sich um eine SalutoCare/Premium-Anfrage handelt (vorausgewählt bei Achse „SalutoCare", jederzeit umschaltbar), und optional einen kurzen Bearbeitungshinweis hinterlegen. Beides landet im neu angelegten Fall (`f.saluto`, `f.zuordnungsHinweis`) und ist im Fall-Drawer-Hero sowie im Mein-Tag-Sheet sichtbar, sobald gesetzt.

---

## 3. Stammdaten-Akte einklappbar

**Nutzer-Feedback:** „Bei in Reha muss die Akte nicht schon aufgeklappt sein, die Akte, die sich überall durchzieht und als Stammdaten hinterlegt sind, müsste man per Klick immer öffnen können, aber die muss nicht überall immer sofort sichtbar sein. Besser ist es ein schlichtes Design zu haben, mit den wichtigsten Fakten."

**Ist — alle vier `paAkte`/`paAkteSlot`-Aufrufstellen, per grep vollständig erfasst:**

| # | Ort | Zeile | Funktion/View | Kontext |
|---|-----|-------|---------------|---------|
| 1 | `#dAkte` | [index.html:6148](../../../index.html#L6148) (Ziel-Div [index.html:4128](../../../index.html#L4128)) | `openDetail()`, Fall-Drawer (`#ovDetail`) | `.d-track-wrap` — Stammdaten **neben** dem aufgabenspezifischen `#dArbeit`-Bereich (Runde 4, Punkt 2) |
| 2 | `#dbBody` | [index.html:5283](../../../index.html#L5283) | `openDbDetail()`, Datenbank/Patienten-Stammdaten-Inspektor | Akte ist der **Hauptinhalt** des Inspektors — kein umgebender Fall-Kontext, der um Aufmerksamkeit konkurriert |
| 3 | `#rsWirt` | [index.html:5873](../../../index.html#L5873) | `openRsDetail()`, In-Reha-Leitungs-Overlay (Spalte „Wirtschaftlichkeit & Abrechnung") | wird direkt unter DRG/Kostenzusage-Zeilen anghängt — genau der vom Nutzer benannte „In Reha"-Fall |
| 4 | `#faUebersicht` | [index.html:6728](../../../index.html#L6728) | `renderFallakte()`, `#view-fallakte` (Vollansicht) | Akte ist hier **der Zweck der Seite** |

`paAkteSlot(pid)` ([index.html:4640-4642](../../../index.html#L4640)) ist der Guard für „keine Einzelperson qualifiziert" (Fall-Drawer + Fallakte-Vollansicht); `paAkte(pid)` ([index.html:4622-4639](../../../index.html#L4622)) selbst wird direkt in Stellen 2 und 3 aufgerufen (dort existiert immer ein `personId`, kein Guard nötig).

Bestehendes Collapse-Vorbild aus Runde 3: `<details class='mt-sleitfaden-details'><summary class='rk'>Leitfaden</summary>…</details>` ([index.html:6553](../../../index.html#L6553)), CSS `summary.rk{cursor:pointer;list-style:none}` + `::-webkit-details-marker{display:none}` ([index.html:3066-3067](../../../index.html#L3066)). Zweites Muster: `.d-acc` ([index.html:1441-1447](../../../index.html#L1441)) mit rotierendem Chevron (`.d-acc[open]>summary::after{transform:rotate(90deg)}`).

**Soll:** An den Stellen 1 (Fall-Drawer) und 3 (In-Reha-Leitungs-Overlay) wird die eingebettete Akte in `<details class="pa-fold"><summary class="rk">Stammdaten-Akte</summary>` … `</details>` gewickelt, **standardmäßig ohne `open`-Attribut** (zu). Konkret:
- Stelle 1: `document.getElementById("dAkte").innerHTML=paAkteSlot(f.personId);` ([index.html:6148](../../../index.html#L6148)) wird zu `"<details class='pa-fold'><summary class='rk'>Stammdaten-Akte</summary>"+paAkteSlot(f.personId)+"</details>"`.
- Stelle 3: der abschließende `+paAkte(p.personId)` in der `rsWirt`-Zusammensetzung ([index.html:5873](../../../index.html#L5873)) wird zu `+"<details class='pa-fold'><summary class='rk'>Stammdaten-Akte</summary>"+paAkte(p.personId)+"</details>"`.

Stellen 2 (`openDbDetail()`) und 4 (`renderFallakte()`) bleiben **unverändert offen** — explizit laut Auftrag (dbDetail: Akte ist Hauptinhalt; Fallakte-Vollansicht: Akte ist der Zweck der Seite).

Neue CSS (`.pa-fold`, minimal, Muster `summary.rk` + `.d-acc`-Chevron): `summary.rk` liefert die Cursor/List-Style-Basis bereits mit; `.pa-fold` selbst bekommt nur Abstand (`margin-top`) und — analog `.d-acc[open]>summary::after` — einen rotierenden `›`-Chevron via `.pa-fold>summary::after`, damit der Zustand (zu/auf) auch ohne Klick-Historie erkennbar ist. Kein neuer Render-Aufruf nötig — `<details>` ist natives HTML, der Zustand lebt im DOM, nicht im JS-Modell.

**Erfolgskriterium:** Im Fall-Drawer und im In-Reha-Leitungs-Overlay ist die Stammdaten-Akte standardmäßig zugeklappt und zeigt nur die Kopfzeile „Stammdaten-Akte" — ein Klick öffnet sie vollständig. Im Datenbank-Inspektor und in der Fallakte-Vollansicht bleibt sie wie bisher sofort sichtbar, da sie dort der Hauptzweck der Ansicht ist.

---

# Sprint 2

## 4. Team-Statistiken (CRM-Cockpit)

**Nutzer-Feedback:** „Team: Hier müssen Teamstatistiken drin sein, wie bei CRMs, die die Übersicht zeigen, die Mitarbeiterbelastung, Aufteilung etc, damit der Koordinator/Leiter auf einen Blick die wichtigsten sehen kann."

**Ist:** Team-Sub-View `#sub-faelle-team` ([index.html:3714-3718](../../../index.html#L3714)): Intro-Zeile, dekoratives Foto, `<div id="teamGrid"></div>`. `renderTeam()` ([index.html:5553-5580](../../../index.html#L5553)) befüllt ausschließlich `#teamGrid` mit: `.tm-intake` (offene Anfragen im Eingang + Link), `.tm-cards` (pro `TEAM`-Mitglied eine Karte: Fälle-Zahl, Aufgaben-Zahl, nächste Frist — Klick filtert die Liste darunter), `.tm-listhead` + `.tm-list` (gefilterte offene Aufgaben, klickbar → `openDetail()`). Kein aggregiertes Cockpit oberhalb der Karten — jede Kennzahl existiert nur pro Mitarbeiter, nicht als Team-Summe.

Verfügbare Bausteine: `offeneFaelle()` ([index.html:4664](../../../index.html#L4664): `faelle.filter(x=>!["Aufgenommen","Verloren"].includes(x.status))`) — `renderTeam()` dupliziert dieselbe Logik lokal als `openCases` ([index.html:5555-5556](../../../index.html#L5555)), direkt wiederverwendbar für das neue Cockpit, ohne erneute Berechnung. `kennzahlen()` ([index.html:4417-4429](../../../index.html#L4417)) berechnet `ueberf` bereits genau mit dem Muster, das das Cockpit braucht: `offen.filter(x=>x.frist&&new Date(x.frist)<heute).length` ([index.html:4424](../../../index.html#L4424)). `fristText()`/`fristKlasse()` ([index.html:4652](../../../index.html#L4652)/[4651](../../../index.html#L4651)) und `ACHSE_COL` ([index.html:4204](../../../index.html#L4204)) stehen bereit. `TEAM` hat 4 Einträge ([index.html:4328](../../../index.html#L4328)).

**Soll:** Neue Funktion `teamCockpitHtml(openCases)`, aufgerufen in `renderTeam()` **vor** dem bestehenden `cards`-Aufbau, Ergebnis wird in `el.innerHTML` **vor** `.tm-cards` eingefügt (dekoratives Foto und Intro-Zeile bleiben in der HTML-Struktur davor unverändert). Eigener Namespace `.ts-*`.

- **(a) KPI-Zeile** (`.ts-kpis`, Muster `.db-cockpit`/`.radar-kpi`): 4 Kacheln —
  - „Offene Fälle gesamt" = `openCases.length`
  - „Heute fällig" = `openCases.filter(f=>f.frist===dstr(0)).length`
  - „Überfällig" = `openCases.filter(f=>f.frist&&new Date(f.frist)<heute).length` (identisches Muster zu `kennzahlen()`s `ueberf`)
  - „Ø offene Fälle / Kopf" = `(openCases.length/TEAM.length).toFixed(1)`
- **(b) Belastung-Block** (`.ts-bal`): pro `TEAM`-Mitglied eine Zeile — Name, horizontaler Balken (`.ts-bal-track`/`.ts-bal-fill`, Breite relativ zum Maximum über alle 4 Mitglieder: `n/maxN*100%`), Fallzahl als Cormorant-Numerale (`.ts-bal-n`, Stil wie `.rk-n`/`.dbc-num`) rechts neben dem Balken, überfällige Fälle dieses Mitglieds als rotes Segment/Punkt am Balkenende markiert (`var(--terra)`, Muster `.radar-kpi.jetzt::before`).
- **(c) Aufteilung-nach-Achse-Block** (`.ts-achse`): pro in `openCases` vorkommender Achse ein Chip mit Anzahl (`openCases.filter(f=>f.achse===achse).length`), Achse-Farbe **nur als kleiner Dot** (`ACHSE_COL[achse]`, `.ts-achse-dot`), nie als Chip-Hintergrund — explizite Querschnitts-Vorgabe.

Alles deterministisch aus `faelle[]` berechnet, kein neues Datenfeld, kein `Math.random`. Bestehende `.tm-cards`/`.tm-list` bleiben unverändert darunter stehen.

**Erfolgskriterium:** Der Team-Reiter zeigt oberhalb der Mitarbeiter-Karten auf einen Blick: Gesamtzahl offener Fälle, wie viele heute fällig/überfällig sind, die durchschnittliche Auslastung pro Kopf, eine Balkenübersicht der Belastung je Mitarbeiter (inkl. Überfällig-Markierung) und eine Aufteilung der offenen Fälle nach Achse.

---

## 5. Zuweiser: Archiv-Trennung + After-Sales-Anlässe

**Nutzer-Feedback:** „Bei Zuweisern sollten nicht primär welche drin sein, mit denen wir noch nie Kontakt hatten — die können höchstens im Archiv sein. Und für die Pflege darf es nicht nur den Fall geben ‚Patientenzahl nimmt ab', sondern ähnlich wie bei den Patienten unterschiedliche Anlässe und eine Art regelmäßigen After-Sales-Prozess."

### (a) Kontaktlose Zuweiser raus aus dem Pflege-Feed, rein ins Archiv

**Ist:** `renderZuweiser()` ([index.html:5363-5415](../../../index.html#L5363)) trennt bereits für `#zgrid`/`#zmap`/Route-Strip nach `z.faelle>=1` (`primaryFiltered`, [index.html:5372](../../../index.html#L5372)) vs. Archiv (`archivCount`, Toggle `zArchivAnzeigen`, [index.html:5393](../../../index.html#L5393)) — diese Trennung existiert seit Runde 3 (§5.3-Kommentar [index.html:5371](../../../index.html#L5371)). **Der Pflege-Feed `#zAnlaesse` ist von dieser Trennung nicht erfasst:** `anlaesse("zuweiser")` ([index.html:5396](../../../index.html#L5396)) iteriert in `anlaesse()`s `zuweiser.forEach(...)`-Block ([index.html:4955-4961](../../../index.html#L4955)) über **alle** `zuweiser[]`, ungefiltert nach `faelle`. Für Einträge mit `faelle:0` und `letzter:""` (Helios Klinikum, Reha-Technik Müller — [index.html:4286](../../../index.html#L4286)/[4288](../../../index.html#L4288)) gilt `seit=9999` ([index.html:4957](../../../index.html#L4957)), was garantiert `>=kad` ist — diese Karten erscheinen also heute mit `sub:"Noch nie kontaktiert"` im Pflege-Feed, exakt der gemeldete Missstand.

`zuweiser[]` hat 10 Einträge ([index.html:4277-4289](../../../index.html#L4277)), `faelle`-Werte: 6,4,3,2,2,3,2,1,0,1,0 — zwei mit `faelle:0` (beide `status:"ziel"`, `letzter:""`).

### (b) Neue After-Sales-Anlass-Typen

**Ist — Feldbestand `zuweiser[]` (verifiziert):** `name,typ,ort,rel,ap,tel,mail,faelle,letzter,draht,status,next`. `z.letzter` ist bereits `dstr(o)` ([index.html:4206](../../../index.html#L4206): `new Date(heute); setDate(+o); toISOString().slice(0,10)`) — **echtes ISO-Datum** (`"YYYY-MM-DD"`), kein zusätzliches normiertes Feld nötig (Abweichung von der ursprünglichen Auftragsvermutung, nach Prüfung entschieden). `z.draht` ist ein String aus `●`/`○` (z. B. `"●●○"`), Stärke bereits per `((z.draht||"").match(/●/g)||[]).length` auslesbar — exakt das Muster aus `rhythmusPflege(z)` ([index.html:5325-5329](../../../index.html#L5325)), das heute nur als **statischer Fallback-Text** für die `znext`-Zeile in `renderZuweiser()` dient ([index.html:5412](../../../index.html#L5412)), **nicht** zeitgesteuert und **nicht** als eigene Anlass-Karte.

Bestehende Cadence-Logik `AR_RHYTHMUS={aktiv:45,aufbau:30,ziel:60}` ([index.html:4904](../../../index.html#L4904)) treibt den heutigen `typ:"zuweiser"`-Block ([index.html:4955-4961](../../../index.html#L4955)) status-basiert (nicht draht-basiert) — dieselbe fachliche Lücke, die `zuweiser-rhythmus` schließen soll, nur mit anderer Formel. **Architekten-Entscheidung:** `zuweiser-rhythmus` **ersetzt** den bestehenden `typ:"zuweiser"`-Block vollständig (nicht rein additiv daneben) — zwei parallele „Zeit seit letztem Kontakt"-Karten mit unterschiedlichen Schwellen für dieselbe Beziehung wären redundant und verwirrend. `AR_RHYTHMUS` wird dadurch verwaist (einzige Verwendung [index.html:4956](../../../index.html#L4956)) und entfällt. `rhythmusPflege(z)` bleibt unverändert bestehen — sie speist weiterhin nur den statischen `znext`-Fallback in `renderZuweiser()` ([index.html:5412](../../../index.html#L5412)), eine separate Anzeige-Stelle, die laut Auftrag (c) nicht angefasst wird.

**Soll — drei neue `typ`-Werte in `anlaesse()`, alle nur für `z.faelle>=1` (Punkt a), alle deterministisch, `_arDone`-kompatibel:**

- **`zuweiser-rhythmus`** (ersetzt den `zuweiser`-Block [index.html:4955-4961](../../../index.html#L4955)): Kadenz aus Draht-Stärke statt Status — `●●●` → 90 Tage (Quartalsgespräch), `●●` → 180 Tage (Halbjahres-Anruf), `●` → 330 Tage (Jahres-Broschüre). `seit` wie bisher aus `z.letzter` (`Math.round((heute-new Date(z.letzter))/86400000)`, identisches Muster zu heute [index.html:4957](../../../index.html#L4957)). `urg:"jetzt"` ab dem 1,5-fachen der Schwelle, sonst `"bald"` (Muster identisch zum bisherigen Block).
- **`zuweiser-meilenstein`**: `z.faelle` erreicht/überschreitet 5, 10 oder 20 (höchste erreichte Schwelle, `>=`-Vergleich statt exaktem Treffer — mit den aktuellen Demo-Daten träfe ein exakter Vergleich nie zu, da kein Eintrag genau 5/10/20 Fälle hat; Leopoldina-Krankenhaus mit `faelle:6` löst so „Dankeschön-Geste: 5. Patient" aus). `_arDone`-Key enthält die Schwelle (`"zuw-meil:"+z.name+":"+schwelle`), damit ein späterer Sprung auf die nächste Schwelle erneut auslöst.
- **`zuweiser-jubilaeum`**: neues additives Feld `z.seit` (ISO-Datum, Partnerschaftsbeginn) auf allen 10 Einträgen, Demo-Werte (Jahr variiert, Monat/Tag so gewählt, dass zwei Einträge zum Stichtag 2026-07-22 im ±30-Tage-Fenster liegen — Leopoldina-Krankenhaus `"2019-07-15"` (7 Tage zurück) und PRIMO MEDICO `"2022-08-05"` (14 Tage voraus), die übrigen acht außerhalb des Fensters). Jahrestag-Erkennung analog `paGeb()` ([index.html:4611-4617](../../../index.html#L4611)), aber **symmetrisch** (paGeb liefert nur die nächste bevorstehende Wiederkehr, nie „vor N Tagen"): neue kleine Hilfsfunktion, die sowohl die dieses- als auch die vorjährige Wiederkehr gegen `heute` prüft und die betragsmäßig kleinere Differenz zurückgibt (Vorzeichen erhalten: negativ = vor N Tagen, positiv = in N Tagen). Auslösefenster `Math.abs(diff)<=30`; `urg:"jetzt"` bei `Math.abs(diff)<=7`, sonst `"bald"`.

**AR_TYP/AR_FOTO-Ergänzung** ([index.html:4990-4991](../../../index.html#L4990)): `zuweiser:"Zuweiser-Kontakt"` entfällt (Typ wird nicht mehr erzeugt), stattdessen `"zuweiser-rhythmus":"Zuweiser-Rhythmus"`, `"zuweiser-meilenstein":"Zuweiser-Meilenstein"`, `"zuweiser-jubilaeum":"Partnerschafts-Jubiläum"`. `AR_FOTO["zuweiser-rhythmus"]=["kb-arzt.jpg","petrol"]` übernimmt den bisherigen `AR_FOTO.zuweiser`-Eintrag 1:1 (gleiches Foto, neuer Schlüssel); Meilenstein/Jubiläum bekommen bewusst **kein** Foto (wie schon `zuweiser-trend` heute keins hat — konsistent).

**arCard()-Anpassung** ([index.html:4994](../../../index.html#L4994)): `const isZ=a.typ==="zuweiser"||a.typ==="zuweiser-trend";` wird zu `const isZ=["zuweiser-rhythmus","zuweiser-meilenstein","zuweiser-jubilaeum","zuweiser-trend"].includes(a.typ);` — steuert nur Label-Text („Nächste Aktion" statt „Empfohlene Geste", „überfällig/fällig" statt „in N Tagen"), keine Struktur-Änderung.

### (c) Konsumenten von `anlaesse("zuweiser")` — verifiziert, minimal angepasst

- **`anlaesse()`s Scope-Filter** ([index.html:4977](../../../index.html#L4977)): `if(scope==="zuweiser")return sorted.filter(a=>a.typ==="zuweiser"||a.typ==="zuweiser-trend");` wird zu `return sorted.filter(a=>["zuweiser-rhythmus","zuweiser-meilenstein","zuweiser-jubilaeum","zuweiser-trend"].includes(a.typ));`.
- **`zAnlaesse`-Feed** (`renderZuweiser()` [index.html:5396-5398](../../../index.html#L5396)): keine Code-Änderung nötig — liest bereits `anlaesse("zuweiser")`, erbt die neue Filterung automatisch.
- **`rlCountZuw`** (Heute-Live-Karte, [index.html:3675](../../../index.html#L3675) HTML / [index.html:5013](../../../index.html#L5013) JS): `zuw=anlaesse("zuweiser")` — keine Code-Änderung, erbt ebenfalls automatisch (zählt jetzt nur noch Zuweiser mit echter Beziehung, keine „Noch nie kontaktiert"-Fälle mehr).
- **`trendMap` in `renderZuweiser()`** ([index.html:5400](../../../index.html#L5400)): `anlaesse().filter(a=>a.typ==="zuweiser-trend")` — **unverändert**, wie vom Auftrag verlangt; konsumiert weiterhin ausschließlich `zuweiser-trend`, unabhängig von den drei neuen Typen.

**Erfolgskriterium:** Der Zuweiser-Pflege-Feed zeigt keine Karten mehr für Zuweiser ohne echte Fallbeziehung (`faelle===0`) — diese sind nur noch über den Archiv-Toggle in der Stammdaten-Ansicht erreichbar. Für Zuweiser mit `faelle>=1` erscheinen je nach Datenlage draht-basierte Rhythmus-Erinnerungen, Fallzahl-Meilenstein-Dankeschöns und Partnerschafts-Jubiläen als eigenständige, unterscheidbare Anlass-Karten — nicht mehr nur der Rückgangs-Trend.

---

## 6. Bestand/Stammdaten vs. Aktionen — klare Trennung

**Nutzer-Feedback:** „Bei Patienten sowie Zuweisern muss klarer zwischen Bestand/Stammdaten und den Aktionen unterschieden werden. Jetzt muss man noch manuell in eine Patientenakte und Dinge ‚vormerken' — das ist nicht Sinn und Zweck der Software."

### (a) Tab-Umbenennung

**Ist:** `.nwt-seg`-Beschriftungen (Runde 4, Punkt 3b/3c): Patienten-Sub-View „Radar & Anlässe" ([index.html:3775](../../../index.html#L3775)), Zuweiser-Sub-View „Pflege & Gesten" ([index.html:3744](../../../index.html#L3744)). `data-nwt`-Attributwerte (`"radar"`/`"pflege"`) sind rein interne Routing-Werte für `nwtSwitch()` ([index.html:6465-6470](../../../index.html#L6465)) ohne sichtbare Auswirkung (gleicher Vorbehalt wie `segCntBestand` in Runde 4) — bleiben unverändert, nur der sichtbare Button-Text ändert sich.

**Soll:** „Radar & Anlässe" → „Aktionen & Anlässe" ([index.html:3775](../../../index.html#L3775)); „Pflege & Gesten" → „Aktionen & Pflege" ([index.html:3744](../../../index.html#L3744)) — einheitlich das Wort „Aktionen" vorangestellt, um beide Tabs klar als den system-generierten Handlungs-Bereich zu kennzeichnen (Gegenstück zum jeweiligen „Stammdaten"/„Stammdaten & Ranking"-Tab).

### (b) Manuelle „Vormerken"-Buttons in Stammdaten-Kontexten — Ist-Analyse

**Per grep gefundene Treffer** (`vormerken|wiedervorlage|planen` in Button-Kontexten):

1. **`openDbDetail()`** ([index.html:5268-5270](../../../index.html#L5268)): im Datenbank/Patienten-Stammdaten-Inspektor (Stelle 2 aus Punkt 5) rendert `action` einen manuellen Button „Nachsorge vormerken" (`onclick='wiedervorlage(i);openDbDetail(i)'`) bzw. bei fehlender Einwilligung einen deaktivierten Button „Kontaktfreigabe fehlt". `wiedervorlage(i)` ([index.html:5259](../../../index.html#L5259)) setzt lediglich `bestand[i].wv=true` — ein isoliertes Boolean-Flag ohne jede weitere Verzahnung: `p.wv` wird **nur** an dieser einen Stelle gelesen (verifiziert per grep — kein anderer Ort konsumiert es), das bereits bestehende, system-getriebene Pendant (Wiederbedarf-Prognose `radar[]` + `arAktion()`-Karten im Anlässe-Tab, [index.html:5255](../../../index.html#L5255)) läuft komplett unabhängig daneben her. **Das ist der exakte, vom Nutzer gemeldete Fall:** eine manuelle Vormerkung in einem Stammdaten-Kontext, redundant zu einem bereits vorhandenen system-generierten Pendant.
2. **`renderRadar()`** ([index.html:5255](../../../index.html#L5255)): „Wiedervorlage planen"-Button — **kein Verstoß**, da dieser Button bereits Teil einer system-generierten Anlass-Karte ist (`arAktion("radar:"+…)`, im — nach Umbenennung (a) — „Aktionen & Anlässe"-Tab liegt, nicht in „Stammdaten").
3. **`btable`/`row()`** (`renderBestand()`, [index.html:5201-5216](../../../index.html#L5201)): einzige Interaktion ist `onclick='openDbDetail(idx)'` — reine Navigation zum Inspektor, kein Aktions-Button. Kein Verstoß.
4. **`paAkte()`** ([index.html:4622-4639](../../../index.html#L4622)): rein darstellend, enthält keinerlei Button. Kein Verstoß.
5. **Zuweiser-Stammdaten (`zcard`, [index.html:5401-5414](../../../index.html#L5401))**: einziger Button ist „Portal-Ansicht des Zuweisers ›" ([index.html:5413](../../../index.html#L5413)) — Navigation ins Cofounder-Zuweiser-Portal, keine Aktion. `znext`-Zeile ([index.html:5412](../../../index.html#L5412)) ist reiner Text, kein Button. Kein Verstoß.

**Soll:** In `openDbDetail()` entfällt der `action`-Zweig vollständig — `.patient-actions` zeigt an dieser Stelle künftig **nichts** (weder Button noch deaktivierten Platzhalter); die Zeile `+"<div class='patient-actions'>"+action+"</div>"` ([index.html:5282](../../../index.html#L5282)) entfällt ersatzlos, da im Stammdaten-Inspektor „nur Daten + Verlauf" stehen soll und das system-getriebene Pendant (Wiederbedarf-Anlass im Aktionen-Tab) bereits existiert. Als **direkte Folge dieser Änderung verwaist** (nicht vorbestehender Dead Code): `wiedervorlage(i)` ([index.html:5259](../../../index.html#L5259)) verliert seinen einzigen Aufrufer und entfällt; `p.wv`-Feld (gesetzt in `inDatenbank()`, [index.html:4816](../../../index.html#L4816): `wv:false`) verliert seinen einzigen Leser und die Zuweisung entfällt ebenfalls; CSS `.wv` ([index.html:462](../../../index.html#L462)) wird mitentfernt, da nach Wegfall der Anzeige `p.wv?"<span class='wv'>…` ungenutzt.

**Erfolgskriterium:** „Kontakte" bzw. Stammdaten-Ansichten (Patienten-Inspektor, Zuweiser-Stammdaten, `btable`, `paAkte`) enthalten keine manuellen Vormerk-/Planungs-Buttons mehr — nur Daten, Verlauf und (wo sinnvoll) Navigation. Jede Handlungsaufforderung liegt ausschließlich auf den system-generierten Anlass-Karten im jeweiligen „Aktionen & …"-Tab.

---

## Nicht-Ziele dieser Runde

- **Kein Fallakte-Herzstück-Redesign** (Nutzer-Feedback-Punkt 3) — separates Brainstorming folgt. Diese Spec behandelt aus dem „In Reha"-Feedback nur den Akte-Collapse-Teilaspekt (Punkt 5/Sprint-1-Punkt 3); die grundsätzliche Neugestaltung der Fallakte selbst ist ausdrücklich ausgeklammert.
- Keine Änderung an `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`-Namespaces oder `openReferrer`/`closeReferrer`/`#refOverlay`.
- Datenarrays nur additiv: `m.zusammenfassung`, `f.zuordnungsHinweis`, `z.seit` sind die einzigen neuen Felder. `z.letzter` bleibt unverändert (ist bereits ISO-Datum) — **kein** zusätzliches `z.letzterKontakt`-Feld. `f.saluto` (Wert-Update von hart abgeleitet auf Toggle-gesteuert) und `bestand[].wv`/`.egOwner`-artige Session-States sind keine neuen Datenfeld-**Strukturen**.
- `AR_RHYTHMUS` (Punkt 6b), `wiedervorlage()`+`p.wv`+`.wv`-CSS (Punkt 7b) werden entfernt — beides direkt durch diese Runde verwaist, kein pre-existing Dead Code, das eigenmächtig aufgeräumt wird.
- Keine neuen Keyframes — die bestehenden 9 müssen ausreichen.
- Keine Änderung an `arAktion()`s generischem Mechanismus (Log-Push + `_arDone` + Toast) — die drei neuen Anlass-Typen sind vollständig `arCard`/`arAktion`-kompatibel, ohne den Handler selbst anzufassen.
- `trendMap`s exklusiver Konsum von `zuweiser-trend` bleibt unangetastet (Punkt 6c).
- Jede Änderung bei 390px UND 1440px verifizieren, 0 Console-Errors, reduced-motion-safe, nur synthetische Demo-Daten, `escapeHtml` für dynamische Inhalte, kein `Math.random`.
