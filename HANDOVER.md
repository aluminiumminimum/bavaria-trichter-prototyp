# HANDOVER — Klinik Bavaria · Concierge OS

**Für:** neuer Thread mit Fable-als-Orchestrator (delegiert an `claude-implementer` / `claude-implementer-pro`, konsultiert `fable-advisor`) — **oder den Cofounder**, der die nächste Aufgabe (§7) direkt übernimmt.
**Stand:** `main` = `5dbb488`, live. Datum des Handovers: 2026-07-16 (ursprünglich 2026-07-09; seither: Jade-Apotheke-Overhaul 16.07. + IA-Restrukturierung „Prozess-Achse" 16.07. — §3/§7 aktualisiert; **22.07.: Workflow-Redesign Runden 2–4 — 73 Commits, §4c neu**).

Lies zusätzlich die **`CLAUDE.md`** im Repo-Root — das ist die verbindliche Konventions-Quelle. Dieses Dokument ergänzt sie um Projektstand, Architektur-Landkarte und Orchestrator-Spielregeln.

---

## 1. Was das Produkt ist (in einem Absatz)
Interaktiver **Investor-Pitch-Prototyp** einer „Privatpatienten-Maschine" für die Klinik Bavaria Bad Kissingen (Premium-Reha). **`index.html` IST die App** — eine einzige self-contained Datei (HTML+CSS+JS inline, Deutsch). **Kein Build, keine Dependencies, kein Backend.** Nur synthetische Demo-Daten. Alle Aktionen geben Demo-Feedback, senden nichts.

**Die EINE Kernidee („DealersDesk für eine Klinik"):** Alle Eingangskanäle — E-Mail, Telefon, Fax, Website, Zuweiser, Portale — laufen in **einen zentralen Eingang**, werden **einem Mitarbeiter zugeteilt**, **beantwortet** und zu einem **verfolgbaren Fall**, der durch einen Trichter bis zur Aufnahme läuft. Leitsatz: *„Aus Quellen wird planbare Belegung."* Jede Design-Entscheidung dient dieser Klarheit.

- **Repo:** `github.com/aluminiumminimum/bavaria-trichter-prototyp`
- **Live (GitHub Pages, Deploy = Push auf `main`, ~1 min):** https://aluminiumminimum.github.io/bavaria-trichter-prototyp/
- **Arbeitskopie:** `…/SalutoCare/bavaria-trichter-prototyp`
- **Git:** Remote `origin` zeigt auf das Repo im **Cofounder-Account `aluminiumminimum`** — wir pushen dorthin. Branch: **`main`** (= `origin/main` = `c45185c`). Push läuft **nicht-interaktiv** (`GIT_TERMINAL_PROMPT=0`, Credentials lokal hinterlegt), **nur Fast-Forward, nie `--force`**. Ablauf: `git fetch origin main` → `git merge-base --is-ancestor origin/main HEAD` prüfen → `git push origin main`. Bei Divergenz (Cofounder war schneller): `git pull --rebase`, verifizieren, dann push.

---

## 2. HARTE REGELN (nicht verhandelbar — in jede Implementer-Spec kopieren)
1. **Geteilte Datei, mehrere Autoren.** Ein Cofounder pusht parallel auf `main`. **IMMER `git pull` vor eigenem Push.** Feature als kurzlebiger Branch → verifizieren → pull → merge→main; kleine Politur direkt auf main.
2. **NIEMALS Cofounder-Code anfassen.** Fremd = Namespaces `.rp-*` (Zuweiser-Portal-Suite), `.rpd-*` (Dokument-Viewer), `.rsp-*` (Reha-Charts), `.mx-*` (Matrix) sowie die Funktionen `openReferrer`/`closeReferrer` und das Overlay `#refOverlay`. Nur **1-Zeilen-Einfügungen** in Fremdbereichen, eigene Namespaces nutzen. Source-Order-Overrides können fremdes Rendering unbemerkt zerstören.
3. **Geteilte Daten nur ERWEITERN, nie umbenennen/löschen** — v. a. `inReha[]` (teilt sich Claude mit dem Behandlungs-Einblick des Cofounders). Neue Felder ok, bestehende Feldnamen sind Vertrag.
4. **Desktop UND Mobile.** Jede Änderung bei **390px** UND **≥1024px** prüfen: 0 horizontaler Overflow, lesbar, **0 Console-Errors**. **1440 ist die Pitch-Bühne** (Priorität Desktop). Aktueller Fokus: Desktop.
5. **CSS additiv** als kommentierte Blöcke vor `</style>`, mit eigenem Namespace oder `#view-*`-gescopt. Bare/globale Klassen (`.card`, `.num`, `.ava`, `.kicker`, `.col`) nicht umstylen.
6. **Animationen reduced-motion-safe:** Start-Zustand (opacity/transform/offset) NUR im Keyframe-`from`, nie in der Basisregel — der globale `prefers-reduced-motion`-Block schaltet Animationen ab, Endzustand muss dann sofort korrekt sein.
7. **Identität wahren:** siehe CLAUDE.md (Jade-Apotheke 07/2026) — Elfenbein-Grund, Lack-Jade-Struktur, Gold nur Grafik/Gravur, Etiketten-Karten; kein Blau/Violett außer Daten-Hue Steel (--azzurro).
8. **Nur synthetische Demo-Daten**, Mails auf `@demo-*.local`.

---

## 3. Architektur-Landkarte (index.html)
**Views** schalten über `go(view[, sub])`; Sidebar/Tabbar-Buttons tragen `data-nav`. 6 Top-Level-Views (IA „Prozess-Achse" seit 16.07.2026): `heute`, `faelle` (anfragen/board/team), `inreha`, `netzwerk` (zuweiser/radar/kontakte), `auswertung`, `konzept` (idee/matrix/sops — Matrix-Grid ist Cofounder-Code, nur verschoben). Alt-Routen (`team`, `matrix`, `system/*`, `faelle/inreha`, `netzwerk/bestand`) laufen über Aliase in `switchTab()`/`applyHash()`. Rollen-Schalter `.ds-role` (Sidebar + mobiler Greet-Chip) = Einstieg in `ma-mode`/Mein Tag. `renderAll()` ruft alle Render-Funktionen. Hash-Routing via `applyHash()`. Funnel-Contract seit IA-Umbau: offset-path 12 · cv-travel 2 · data-sync 30 (Team-cv-Duplikat entfernt, `.workflow/jade-baseline.txt`).

**Detail-Overlays** hängen im Browser-Verlauf (WS1): `pushDetailState()` beim Öffnen, `dismissDetail()` (→ `history.back()` wenn gepusht, sonst `_rawCloseDetails()`), Escape/Backdrop führen dorthin. IDs: `ovDetail` (Fall-Schublade), `dbDetail` (Datenbank-Inspektor), `rsDetail` (Reha-Steuerung).

### Claude-Bereiche (frei bearbeitbar)
| Bereich | Kern-Funktionen | Namespace | Daten |
|---|---|---|---|
| **Heute** | `renderHeute()`, `cvCounts()`, `renderWichtig()`, `kennzahlen()` | `.cv-*`, `#view-heute` | `faelle[]`, `eingang[]` |
| **Konvergenz-Hero** | (statisches SVG, Werte via `set()`/`data-sync`) | `.cv-*` | `eingang[]` |
| **Fälle/Eingang** | `renderEingang()`, `toggleMail()`, `uebernehmen()`, `antwortenEingang()`, `simulateInbound()` | `#inbox .mail`, `.mrow`, `.mmore` | `eingang[]` |
| **Fälle/Board** | `renderBoard()`, `boardZoneGroup()`, `makeBoardCol()`, `renderBoardFocus()`, `stageMeta()`, `openStage()`, `setBoardStage()` | `.zone-*`, `.done-rail`, `.col` | `faelle[]` |
| **Fall-Schublade** | `openDetail()`, `advanceFall()`, `sendReply()`, `#dSpeichern`-Handler, `toggleVerlust()` | `#ovDetail`, `.d-acc` | `faelle[]` |
| **Reha-Steuerung** | `renderInReha()`, `rsCockpit()`, `openRsDetail()`, `devBar()` | `.rs-*`, `.ir-*` | `inReha[]` (GETEILT!), `RS_BILLING{}` (Claude) |
| **Datenbank** | `renderBestand()`, `dbCockpit()`, `openDbDetail()`, `renderRadar()` | `.db-*` | `bestand[]`, `radar[]` |
| **Team** | `renderTeam()`, `setTeamFilter()` | `.tm-*`, `.tm-cv` | `TEAM[]`, abgeleitet aus `faelle[]`/`eingang[]` |
| **Netzwerk** | `renderZuweiser()`, `networkDot()` (⚠ Karten enthalten Cofounder-Button `openReferrer` — Karten-Markup nur chirurgisch) | `.z*`, `#view-netzwerk` | `zuweiser[]` |
| **Helper** | `fristText()`, `fristKlasse()`, `dstr()`, `escapeHtml()`, `initialen()`, `kpiRing()` | — | — |

### Cofounder-Bereiche (READ-ONLY für uns)
`view-matrix` / `renderMatrix` (2×3-Grid), `openReferrer`/`refOverlay` (Zuweiser-Portal mit 3 Tabs), `.rpd-*` Dokument-Viewer (Arztbrief/QR), `.rsp-*` Reha-Verlaufscharts. **Nach jeder Änderung verifizieren, dass diese noch funktionieren.**

### Konvergenz-Hero — wichtige Eigenheit
Das `.cv-*`-Panel existiert **4×**: Heute (breit + schmal) und Team (breit + schmal). **Nur die Heute-Variante trägt `id="cv…"`; Team spiegelt über `data-sync="cv…"`.** `set()` in `renderHeute()` aktualisiert beide. Wer den Hero ändert, muss **alle 4 SVG-Blöcke synchron** halten. Story endet bewusst beim **„Fall"** (nicht „Belegung") — der Trichter darunter ist die einzige „→ Belegung"-Grafik (zwei getrennte Akte, Redundanz war ein Fehler und wurde behoben).

### Design-Tokens (JADE-APOTHEKE-Overhaul 07/2026 — Token-NAMEN historisch: --sage-deep=LACK-JADE, --brass=GOLD!)
```
--cream:#F6F2E6 (Elfenbein-CANVAS!); --cream2:#EFEAD9; --paper:#FBF8EF (Etiketten-Papier); --paper2:#F6F2E3;
--ink:#221E15; --ink-soft:#4C4638; --muted:#6B675A; --faint:#A19C8C;
--brass:#B99149 (GOLD — nur Grafik/Gravur); --brass-deep:#7E6230 (Gold-Text); --brass-soft:#F2E8CF; --brass-line:#D9C8A0;
--hair:rgba(34,30,21,.12); --hair2:rgba(34,30,21,.07);
--sage:#2E5C4F (Mittel-Jade); --sage-deep:#123B33 (LACK-JADE — DER strukturelle Dunkelton: Sidebar-Kabinett, Buttons, Hub, 5★-Lade); --sage-soft:#E7EEE8;
--terra:#A8341F (ZINNOBER — Siegel + stockt/überfällig); --terra-soft:#F5E4DE;
--amber:#96692A; --alert:#A8341F; --raised:#FBF8EF;
--rose:#9E5A50; --rose-soft:#F5E6E0; --petrol:#2E5C4F; --petrol-soft:#E7EEE8;
--azzurro:#5E7B8C (Steel); --slate:#7A7265 (Taupe) — Daten-Hues, nur Charts/Fäden/Tags, nie Flächen;
--jade-line:#2C5A4E; --jade-hair:rgba(18,59,51,.30); --gold-faint:rgba(185,145,73,.28); --gold-soft:rgba(185,145,73,.5);
--ivory-tx:#EFE9D8; --ivory-mut:rgba(239,233,216,.66) (Elfenbein-auf-Lack);
--glass:rgba(246,242,230,.72) / --glass-border / --glass-hi
Achsenfarben: --ortho:#7E6230 --neuro:#4A6478 --geri:#47694F --innere:#2E5C4F --saluto:#86683A --unklar:#6B675A
Schatten (Etiketten): --shadow / --shadow-soft ; Verläufe: --espresso-grad (Lack-Jade), --brass-grad (Gold), --aurora-grad
```
**Papier-Guard** (`/* JADE · PAPIER-GUARD */`-Block): `.rpd-paper` (Dokumente, Weiß, QR s/w) + `.kp-mail`
(Mailing m. Espresso-Kopf, `.kp-marke` `#b29a76` fix) bleiben Papier-Inseln — `color:var(--ink)`-Reset,
Internals tabu. `@media print` weiß.
**Perf-Gesetz:** nie `filter:blur` auf Animiertem; `backdrop-filter` nur Chrome + Overlay-Sheets + 2 Hero-Glas-Chips (Budget 13).
Fonts: Display/Numerale `"Cormorant Garamond",Georgia,serif` (500–700 + Italic) · Body `Inter` · Micro/Daten
`"Fragment Mono"` (uppercase, .12em, 11px, `--muted`; Utilities `.au-display`/`.au-micro`). Referenz: `design-lab/e5d-jade.html`.

---

## 4. Was fertig & live ist
- **WS1–7** (08.07.): Zurück-Navigation, Datenbank-Premium (Kontakte+Radar), Reha-Steuerung + BWL-Panel, Automatisierung (Anfrage→Fall), Kommunikation/Antworten, Mitarbeitercockpit als Top-Level-„Team".
- **Systematisches Design-Upgrade (Fable-Audit, 09.07.), 7 Phasen:** Heute entrümpelt (Duplikate raus, Conversion-Bug 0 %→67 % via 2 geseedete Fälle id 10/11), Mobile-Fixes (Trichter 3→2→1, Tabbar monochrom, relative Fristen), Konvergenz-Hero `.cv-*`, kompakter aufklappbarer Eingang + Ein-CTA-Politik, Board-Zonen (7 Spalten → 3 Trichter-Bänder + „Abgeschlossen"), Fall-Schublade mit Composer-über-Falz + Details-Akkordeon, Netzwerk-Karte 2-spaltig, Hero endet beim Fall.

Alle Cofounder-Bereiche verifiziert intakt. 0 Console-Errors.

## 4b. Programm „Concierge OS" — Bausteine A–D (13.–14.07., alle live)

Strategischer Rahmen: App = **internes Erstsystem** für Patientenakquise/-erfassung/-pflege
(Pilot mit Mitarbeitern), harte KPI = planbare, steigende Privat-/Selbstzahler-Belegung.
Zielbild-Spec: `docs/superpowers-optimized/specs/2026-07-13-concierge-os-zielbild-design.md`.

- **A · Gedächtnis** (`7377fd6`…): zentrale Personen-Registry `personen[]`
  (pid `P01`–`P25`, Laufzeit via `pNew()` → `PR…`; Felder: geb via `gebIn()`,
  lebenszyklus, kt, `einwilligung{status,form,datum,zwecke[]}`, zuweiserRef,
  `historie[{d,typ,text}]`). `personId` additiv auf faelle/eingang/bestand/radar/inReha.
  Akte-UI `paAkte()` (.pa-*) in den drei Detail-Overlays. Helper `person()/pNew()/pHist()`,
  `PA_TYP`/`PA_ZW`. `zuweiserEvents[]`.
- **B · Pflege-Mechanik**: 5-Sterne-Klassifikation `STERNE`/`STERNE_ORDER`
  (**String-Keys `"5"`–`"1"` — nie mit Numbers vergleichen!**), `bucketOf()`
  (Consent orthogonal → Bucket „gesperrt"), `sterneHtml()`. Anlass-Engine `anlaesse()`
  (Geburtstage/Entlass-Jubiläen/Wiederbedarf/Zuweiser-Rhythmen; Session-Set `_arDone`;
  Gesten-Leiter 3★–5★). Kampagnen-Workflow `kp*` (.kp-*). Datenbank als **Kartei**:
  Sterne-Gruppe = Panel (.stg-*), Kontaktzeile = Ledger-Grid (.db-c mit Kontext +
  Letzter Kontakt aus der Personen-Historie).
- **C · Belegungs-Forecast** (`fceaa63`): Kapitel `#belegungChap` auf Heute (nach
  `#anlassChap`), `FC_BETTEN=7`, `fcWochen()` (8 KW, mitternachtsnormalisiert),
  `renderBelegung()` (.fc-*). Liest inReha/faelle/personen nur.
- **D · Arbeitstiefe** (`d2e310c`): Kostenzusage-Kette im Fall-Detail
  (`KZ_STAGES`, `kzChain/kzActions/kzAnfragen/kzZusage/kzAblehnung`, .kz-*;
  „abgelehnt" blockt wie „offen" in `stockt()`/`renderWichtig()`), Sofort-Notiz
  (`kzNotizAdd`), Kostenträger-Select `#dKT` (Guard: leerer Wert überschreibt nie),
  Qualifizierungs-Hook `qualifyIfNeeded()` + `istEinzelperson()` (Sammelnamen
  Familie/Eheleute/Unbekannt bekommen KEINE Person) in `advanceFall()` + `dSpeichern`.

**Design-Prinzip (hart erarbeitet, 5 Kritik-Runden):** Neue UI erfindet **keine neuen
Idiome**. Erst fragen: „Welche bestehende Komponente löst das schon?" — Karten =
radar-card-Familie (Avatar, Frist-Pill, Serifen-h3, `.rk`-Kicker-Sektionen, Ghost-CTA),
Listen-Gruppen = Kartei-Panel (.db-group/.stg-h), Kapitel = #anlassChap-Kopf,
KPI-Kacheln = .radar-kpi. Dünne „Utility-Listen" fallen gegen den Rest der App ab.

---

## 4c. Workflow-Redesign Runden 2–4 (21.–22.07., 73 Commits `c4c7312..5dbb488`, alle live)

Drei Iterationsrunden auf Nutzer-Feedback zum Eingangs/Fall/Netzwerk/Reha-Workflow.
Specs+Pläne: `docs/superpowers-optimized/{specs,plans}/2026-07-21-ux-feinschliff-runde2-*`,
`2026-07-22-workflow-redesign-runde3-*`, `2026-07-22-runde4-vertiefung-*`.

**Was das Programm jetzt kann:** Echtes Status→Aufgabe-Modell — `advanceFallStatus()`
schaltet bei „Erledigt" nicht mehr nur `f.status`, sondern setzt auch Aufgabentext und
Frist der jeweils nächsten Stufe (Neu→Rückruf, Kontaktiert→Qualifizieren, …, Aufnahme
geplant→Anreise organisieren); der Werdegang-Stepper unterscheidet jetzt eindeutig
erledigt (Jade gefüllt) / aktuell (Gold) / zukünftig (hohl/blass). Der Eingang öffnet
pro Zeile ein echtes Detail-Fenster (`#egDetail`, Namespace `.egd-*`) statt eines
Akkordeons — Wer/Woher/Was/Wie-konkret-Zusammenfassung (`.eg-*`) plus eine echte
Team-Zuordnung mit sichtbarer Auslastung je Person statt nacktem `<select>`; „Als Fall
anlegen" springt direkt in den neuen Fall-Drawer, nicht mehr aufs Board. Der Fall-Drawer
hat jetzt eine dynamische Fall-Akte: `#dArbeit` zeigt je nach aktivem Aufgabentyp ein
anderes Werkzeug (Notizfläche bei Rückruf, Kostenzusage-Kette+Demo-Upload bei
Kostenklärung, Dokumente-Checkliste bei Unterlagen, Antwort-Editor bei Angebot,
Checkliste bei Anreise) — Werdegang, Stammdaten/Akte und Verlauf bleiben davon
unabhängig immer sichtbar. Die vollständige Fallakte (`renderFallakte()`) ist ein
Dashboard mit Kennzahl-Kacheln statt einer Textliste. Die Zuweiser-Ansicht ist jetzt
binär (nur „Im Aufbau"/„Ziel-Partner" ist komplett raus) — aktive Partner gerankt #1,
#2, … nach Fallzahl mit Trend-Sparkline, jede Karte trägt ein aus den Zahlen
abgeleitetes Pflege-Feld (Bedanken / Nachfassen / Rhythmus-Geste). Netzwerk heißt jetzt
durchgängig „Zuweiser · Patienten" (vorher „Kontakte"); innerhalb beider Sub-Views
trennt eine neue `.nwt-*`-Tableiste Radar/Anlässe von Stammdaten/Ranking, die vorher
übereinandergestapelt waren. Das Case-Management-Protokoll-Board (`ma-mode`-Reiter
„Protokolle", `.mtp-*`) hat jetzt strukturierte Felder statt eines einzelnen Textfelds:
Barthel/FIM-Zahlen (`p.barthel.akt`/`p.fim.akt`), Kurzbericht mit Textbaustein-Chips,
plus ein neues Feld „Weiterer Verlauf/Plan" (`p.verlaufPlan`) mit eigenen Chips —
die Leitungsansicht (`#rsErfolg`) zeigt „Weiterer Verlauf" zusätzlich zum Kurzbericht,
wenn gesetzt.

**Für den Cofounder wichtig:**
- Seine Namespaces (`.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`, `openReferrer`/`closeReferrer`,
  `#refOverlay`) wurden **nicht** angefasst — verifiziert.
- **Eine chirurgische Ausnahme:** Der Routen-String der Matrix-Kachel „Nachsorge & Radar"
  (`MATRIX`-Array, [index.html:4298](./index.html#L4298)) wurde von `route:["netzwerk","radar"]`
  auf `route:["netzwerk","patienten"]` umgestellt — **nur der String**, die `.mx-*`-Kachel-
  Darstellung selbst ist unverändert.
- Datenmodell nur additiv erweitert: neue Felder `eingang[].wer`/`.notiz`, `inReha[].verlaufPlan`
  (einziges wirklich neues Feld). `faelle[]` strukturell unverändert.
- `p.barthel.akt`/`p.fim.akt` werden jetzt vom Protokoll-Board beschrieben (vorher nur
  Demo-Werte) — Format identisch, die `rsp-*`-Reha-Charts lesen wie bisher.
- `p.kurzbericht` ist jetzt die von der Case-Managerin über das Protokoll-Board gepflegte
  gemeinsame Quelle — `.rp-kurz` im Zuweiser-Portal liest sie unverändert, keine
  Schnittstellenänderung.
- Routen-Aliase fangen alte Links ab: `#netzwerk/kontakte`, `#netzwerk/bestand`,
  `#netzwerk/radar` lösen alle weiterhin zu `netzwerk/patienten` auf (`applyHash()`,
  [index.html:6698-6700](./index.html#L6698)).
- Neue eigene Namespaces (frei bearbeitbar, nichts davon kollidiert mit Cofounder-Code):
  `.fh-*` (Aufgaben-Hero), `.egd-*` (Anfrage-Detail-Fenster), `.nwt-*` (Netzwerk-Tableisten),
  `.mtp-*` (Protokoll-Board), `.eg-*` (Eingangs-Triage-Zeile), `.zw-*`, `.ah-*`.

**Dokumentiert unter:** `docs/superpowers-optimized/specs/` + `plans/`, Paare
`2026-07-21-ux-feinschliff-runde2-*`, `2026-07-22-workflow-redesign-runde3-*`,
`2026-07-22-runde4-vertiefung-*` (je Design-Spec + Umsetzungsplan mit Commit-Zuordnung).

---

## 4d. Workflow-Redesign Runde 5 (22.07., 20 Commits `115398b..cc6aa8f`, live)

Zwei Sprints auf Nutzer-Feedback zum Anfrage-Fenster, zur Fallakte und zum
Zuweiser/Patienten-Pflege-Zyklus. Specs+Pläne: `docs/superpowers-optimized/{specs,plans}/
2026-07-22-runde5-sprint12-*`, `2026-07-22-runde5-sprint3-fallakte-cockpit-*`.

**Sprint 1+2 — Anfrage-Vertiefung & Akte-Collapse:** Das Anfrage-Detail-Fenster
(`#egDetail`) zeigt jetzt eine echte Zusammenfassung statt nur der Rohmail — neues
Seed-Feld `m.zusammenfassung`, `egZusammenfassung()`-Fallback für Anfragen ohne
Seed, die Originalanfrage bleibt darunter optisch abgesetzt in Papier-Optik. Die
Eingangs-Übernahme trägt einen SalutoCare-Toggle + einen Zuordnungs-Hinweis
(`f.zuordnungsHinweis`), sichtbar sowohl im Fall-Drawer-Hero als auch im
Mein-Tag-Sheet. Die Stammdaten-Akte ist in Fall-Drawer und In-Reha-Overlay jetzt
standardmäßig eingeklappt (`<details class="pa-fold">`) — Datenbank-Inspektor und
Fallakte-Vollansicht bleiben davon unberührt offen. Team bekam ein erstes
KPI-Cockpit (`.ts-*`, in Runde 6 wieder ersetzt), Zuweiser ein erstes
After-Sales-Feed (`z.seit`-Feld, `zuweiser-rhythmus`/`-meilenstein`/`-jubilaeum`
statt des alten Kadenz-Blocks, in Runde 6 verfeinert), die Netzwerk-Tableisten
heißen jetzt „Aktionen & Anlässe"/„Aktionen & Pflege". Der manuelle
„Nachsorge vormerken"-Button ist raus (`wiedervorlage()`/`p.wv` als Folge entfernt).

**Sprint 3 — Fallakte als Arbeitsort:** Die größte strukturelle Änderung dieser
Runde: die Seitenschublade (`#ovDetail`) ist **komplett entfernt**, `openDetail()`
ist jetzt nur noch ein Alias auf `openFallakte()`. `#view-fallakte` ist ein
Zwei-Zonen-Cockpit (`.fk-cols`): links Arbeit (Hero-Editierfelder, `#dArbeit`-
Werkbank, Steuerung, Verlauf+Notiz — 1:1 aus der alten Schublade übernommen),
rechts Kontext (Werdegang/Übersicht). Der Kopf trägt jetzt ein horizontales
Prozessband (`stageBandHtml()`) statt des vertikalen Steppers, plus KT-Pille und
SalutoCare-Stern. Ein jahrelang kaputter CSS-Kommentar (Zeile ~1946) hat die
app-weite Etiketten-Doppelring-Regel geschluckt — Bugfix, sichtbar an praktisch
jeder Karte in der App (kein funktionaler Zusammenhang mit der Fallakte, im
selben Nachtrag-Commit mitgefahren).

**Für den Cofounder wichtig:**
- Seine Namespaces/Overlays wurden nicht angefasst — verifiziert.
- `#ovDetail` existiert nicht mehr. Falls irgendwo (Doku, alte Notizen, eigener
  Code) noch darauf verwiesen wird: `openDetail(id)` funktioniert weiter identisch,
  öffnet aber jetzt die Fallakte-View statt einer Schublade.
- Datenmodell nur additiv: `m.zusammenfassung`, `f.zuordnungsHinweis`, `z.seit`.
- Der CSS-Kommentar-Bugfix (Etiketten-Doppelring) wirkt app-weit optisch, ändert
  aber keine Struktur oder Selektoren, die Cofounder-Bereiche nutzen.
- Neue eigene Namespaces: `.ts-*` (Team-Cockpit, siehe §4e — dort ersetzt),
  `.fk-*` (Fallakte-Zwei-Zonen-Layout), `.pa-fold` (Akte-Collapse).

---

## 4e. Workflow-Redesign Runde 6 (23.07., 59 Commits `43cfa24..4888b9f`, live — 8 Punkte)

Acht in sich geschlossene Vertiefungen, je mit eigenem Spec+Plan-Paar unter
`docs/superpowers-optimized/{specs,plans}/2026-07-23-runde6-punkt{1..8}-*`.

**1 · Anfrage-Triage:** `klassifiziereEingang()` sortiert jede eingehende Anfrage
in `auto` / `entscheidung` / `passiv`. Statt Personen-Owner gibt es jetzt zwei
**Belegungs-Teams** (`GRUPPEN = ["Orthopädie","Neuro-Geri"]`), zugeordnet über
`achseZuGruppe()` (Innere → Neuro-Geri; SalutoCare landet immer als Entscheidungsfall
beim Leiter). `renderEingang()` ist jetzt dreizonig (Braucht Entscheidung /
aggregiertes Auto-Verteilungs-Protokoll / Rest), das `#egDetail`-Fenster trägt eine
neue `.egt-*`-Leiste: Zusammenfassung, Original in `<details>`, Vollständigkeits-
Checkliste (`egVollstaendigkeit()` → `f.rueckfragen[]`), 5-Sterne-Override-Widget,
Gruppen-Buttons, echter Backdrop mit `#egdBody`-Scroll. Pull-Prinzip statt
Zuweisung: `renderEgtPool()` im `ma-mode` (zweistufig: eigene Gruppe zuerst).
`egOwner`/`egSetOwner`/`ownerVorschlag()` sind komplett entfernt. `simulateInbound()`
legt keine Fälle mehr automatisch an. Demo-Texte sind jetzt kanal-echt (Website/
E-Mail/Telefonnotiz/Fax lesen sich unterschiedlich).

**2 · Fallakte-Schritt-Werkzeuge:** Jeder `dArbeitHtml`-Zweig zeigt jetzt Kernfakten-
Chips (`fallFakten()`/`fallAbsenderTyp()`). Neue SOP-Checkliste (`SOP_CHECKLISTE`
+ `sopChecklisteHtml`/`sopToggle`, Key-Schema `typ:status:idx`), `advanceFallStatus`
loggt jetzt „Erledigt: …" in den Verlauf. Die Originalanfrage ist als Feld
mitgeführt (`f.originalTxt`/`.originalKanal`, kopiert bei `uebernehmen`) — im
Rückruf-Werkzeug inline gezeigt, sonst über ein eigenes Kontext-Kapitel
(`#faOriginalChap`). Fallnamen sind jetzt sprechend, aus `fallFakten()`/`m.patient`
abgeleitet mit Alter-Guards (`faName()`, `makeBoardCol()`). Neu: Stammdaten-
Bestätigen-Checkbox (`f.stammOk`).

**3 · Team-Führungs-Cockpit (`.tc-*`):** Ersetzt das Runde-5-`.ts-*`-Cockpit
komplett (`teamCockpitHtml`/`.ts-*`/`.tm-intake` entfernt). 4 KPI-Etiketten mit
Seed-Sparklines (`TC_WOCHE`/`TC_ERLEDIGT`), zwei Team-Panels (Pipeline-Segmente +
Mitarbeiter-Zeilen), „Braucht Aufmerksamkeit" springt direkt in `openFallakte()`.
**Wichtig für den Cofounder:** ein app-weiter Begleit-Fix hängt an diesem Punkt —
`fristKlasse()`/`fristText()`/`kennzahlen().ueberf` vergleichen jetzt zeitstabil
per Kalendertag-String (`f.frist < dstr(0)`) statt einem Datums-Vergleich, der
nachmittags kippen konnte und „überfällig" falsch auslöste. Reine Robustheits-
Korrektur derselben Semantik, keine Vertragsänderung — falls der Cofounder diese
Helper selbst aufruft, verhält sich das jetzt nur korrekter, nicht anders.

**4 · In-Reha-BWL-Karten (`.irb-*`):** Verweildauer-Band, Erlös/DB/Zusatzerlös aus
`RS_BILLING` (+Zimmer/Verlängerung additiv), Kostenzusage-Ampel, Meilenstein-
Fußzeile. Dafür wurden ein paar `inReha[]`-Seed-Werte angepasst
(`verweildauer.ist`/`entlassungGeplant` bei Dieter und Elke) — **reine
Anzeigekonsequenz**, sichtbar auch in rp-Einblick/mtp als „Tag 19/21" bzw.
„Tag 20/28", keine Feldnamen oder Struktur geändert. `#inrehaGrid` nutzt jetzt
`minmax(0,1fr)` gegen Overflow.

**5 · Zuweiser-After-Sales-Feinschliff:** `anlaesse()` bekam ein Rework: echtes
Jubiläums-Kriterium (≥350 Tage Partnerschaft + ±14-Tage-Fenster → „Jahres-
Kooperationsgespräch"), zwei neue Anlasstypen `zuweiser-bericht`
(`z.letzterAbschluss`) und `zuweiser-fortbildung` (CME, quartalsweise, ab 3
Fällen), Meilenstein-Schwellen `[50,25,10]`, professionellere Rhythmus-Texte.
Neue `.zwa-*`-Anlass-Karten („Diese Woche"/„Demnächst") mit Session-Erledigt-
Zustand. Der alte Rang ist ersetzt durch `zwSterne()` (1–5, `#zwSterneChips`-
Filter, Archiv zeigt keine Sterne).

**6+7 · Patienten-Automatik:** Neuer Anlass `nachsorge` (42–56 Tage nach
Entlassung, 5★-Premium-Variante). `PAT_REGELN` — vier Automatik-Regeln (`.par-*`)
mit live berechneter Empfängerzahl aus dem Bestand, Session-Toggle, deterministischen
Timezone-sicheren Kalenderankern (`patRegelLaufISO`). `dbDetail` zeigt eine passive
„Automatik-Regeln"-Zeile. `arCard`/`AR_TYP`/`AR_FOTO` sind entfernt, ersetzt durch
Wiederverwendung von `paaKarte()`/`.zwa-*`. Neue Seeds P27/P28.

**8 · Koordination ⇄ Fallakte:** Das `ma-mode`-CSS-Gate lässt die aktive Fallakte
jetzt durch (`:not(#view-fallakte.active)` + eine `:has()`-Regel, Zeile ~1579) —
vorher blockte das Gate versehentlich auch die Fallakte-View selbst. Ein Klick
auf eine Aufgabe vom Typ `fall` springt jetzt direkt in `openFallakte()`, `faZurueck()`
führt mit dynamischem Label „Zurück zu Mein Tag" zurück und stößt ein
`renderMeinTag()`-Refresh an — der Pool-Übernahme-Kreislauf (Anfrage → Pool →
Fallakte → zurück) ist damit geschlossen.

**Für den Cofounder wichtig — geteilte Berührungspunkte:**
- **`fristText()`/`fristKlasse()`-Semantik geändert** (Punkt 3): zeitstabiler
  Kalendertag-Vergleich statt datumsbasiert — falls diese Helper anderswo genutzt
  werden, ist das Verhalten jetzt korrekter, nicht grundsätzlich anders.
- **`inReha[]`-Wert-Tweaks** (Punkt 4): nur zwei Seed-Werte bei Dieter/Elke
  angepasst, keine Feldnamen/Struktur geändert — wirkt sich auf die Tag-Anzeige
  in rp-Einblick/mtp aus (reine Zahlenkonsequenz, kein Contract-Bruch).
- **`f.name`-Konstruktion** (Punkt 2) folgt jetzt dem Muster „Patient/Patientin
  (NN) · Achse" aus `fallFakten()`/`m.patient` + Alter-Guards — relevant, falls
  rp-Ansichten Fallnamen anzeigen.
- Alles andere liegt in eigenen, nicht kollidierenden Namespaces: `.egt-*`,
  `.fkw-*`, `.tc-*`, `.irb-*`, `.zwa-*`, `.par-*`.
- `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`/`#refOverlay` wurden in jeder Runde per CDP
  gegenverifiziert — unangetastet.

**Dokumentiert unter:** `docs/superpowers-optimized/{specs,plans}/2026-07-2[23]-runde5-*`
und `2026-07-23-runde6-punkt{1..8}-*` (je Design-Spec + Umsetzungsplan mit
Commit-Zuordnung).

---

## 5. Verifikation (Preview) — Pflicht vor jedem „fertig"
- Server: `.claude/launch.json` → **`bavaria-proto`** (homebrew python3 `http.server`, Port 8765, `--directory` = Repo). Start via preview-Tool mit `{name:"bavaria-proto"}`.
- Desktop braucht **≥1024px** (sonst sind `dbDetail` etc. gated). Preset „desktop" liefert teils <1024 → **eigene Größe 1440×900** setzen. Mobile-Preset 375/390 für die Mobil-QA.
- Navigation im Eval: `go('faelle','board')`, Overlays `openDetail(1)` / `openRsDetail(0)` / `openDbDetail(0)`, Zuweiserportal `openReferrer('portal','Leopoldina-Krankenhaus')`.
- Checkliste je Änderung: **0 Console-Errors**, **0 horizontaler Overflow @390 und @1440**, betroffene View + Cofounder-Bereiche (Matrix 6 Zellen, `openReferrer`, `rsp`-Charts) rendern, dann Screenshot als Beleg.
- **GOTCHA:** Ein Fable-Subagent, der dieselbe Preview steuert, kann den Tab auf eine Scratch-Datei (`cv-test.html`) umlenken → danach `location.href` zurück auf `…/index.html` setzen. Besser: Subagents keine gemeinsame Preview-Instanz fahren lassen, oder Tab danach zurücksetzen.
- **GOTCHA ProtonDrive (13.07. zweimal passiert):** Der Ordner liegt auf ProtonDrive/File Provider. Bei schnellen Edits überschreibt die Sync die Arbeitskopie NACH Commits mit alten Ständen (erzeugt `index (# Edit conflict … #).html`-Kopien), und ein laufender `http.server` kann veraltete Inhalte servieren, obwohl die Platte korrekt ist. Gegenmittel: nach jedem Implementer-Task Hash-Check `shasum index.html` vs `git show HEAD:index.html | shasum`; bei Drift `git reset` + `git checkout -- index.html` (HEAD = Wahrheit); Konflikt-Kopien aus dem Repo entfernen (nie committen!); nach vielen Edits Preview-Server neu starten und den via `curl` served Hash gegen HEAD prüfen.
- Wahren Deploy-Status prüfen: `gh api repos/aluminiumminimum/bavaria-trichter-prototyp/pages/builds/latest --jq '{status,commit}'` (github.io-CDN cached lokal manchmal → Hard-Reload).

---

## 6. Arbeiten im Orchestrator-Modus (Fable → Lanes)
**Grundhaltung:** Fable ist Architekt. Tipp-Arbeit an die günstigste Lane, die den Fall sicher trägt.

- **`claude-implementer` (Haiku):** gut spezifizierte, mechanische Edits — z. B. „relatives Datum hier, Farb-Token dort, Text ändern, CSS-Klasse ergänzen". Spec muss das Ergebnis vollständig determinieren.
- **`claude-implementer-pro` (Sonnet):** Edits mit echtem Reasoning/Kantenfällen — z. B. Umbau einer Render-Funktion, neue interaktive Komponente, Refactor mit geteilten Daten.
- **`fable-advisor`:** an Commitment-Grenzen fragen (Architekturwahl, Daten-/Feldänderungen an `inReha[]`, größere Umbauten am Hero, Änderungen nahe Cofounder-Namespaces) und wenn ein Problem zwei Anläufe überstanden hat. Berät, implementiert nie.
- **Inline (Fable selbst):** Konversation, Diagnose, das Schreiben präziser Specs, das finale Verifizieren + Push.

**Spec-Vorlage für jede delegierte Aufgabe** (fünf Teile):
1. **Ziel** — was danach sichtbar anders/besser ist (in Nutzer-Begriffen).
2. **Ort** — Funktion(en) + Namespace + welche der 4 Hero-Blöcke / welche View.
3. **Constraints** — die HARTEN REGELN aus §2, die für diese Aufgabe greifen (v. a.: welche Namespaces tabu, geteilte Daten nur erweitern, additive CSS, beide Breiten).
4. **Verifikation** — exakter Check: welche `go(...)`/`open*`-Sequenz, welche Console/Overflow/Screenshot-Belege, welche Cofounder-Bereiche gegenzuprüfen sind.
5. **Nicht-Ziele** — was ausdrücklich NICHT angefasst wird (Matrix, `rp-*`/`rpd-*`/`rsp-*`, Feldnamen).

**Immer in Specs mitgeben:** „Vor Push `git fetch` + FF-Check; kein `--force`; Commit-Message endet mit dem Co-Authored-By-Trailer des arbeitenden Modells (aktuell `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`)." Nur homebrew `/opt/homebrew/bin/python3`.

---

## 7. NÄCHSTE AUFGABE

**Keine beauftragt.** Die zuletzt designte Aufgabe (Mitarbeiter-Dashboard „Mein Tag",
Spec `docs/superpowers-optimized/specs/2026-07-14-mitarbeiter-dashboard-design.md`) ist
UMGESETZT und seit der IA-Restrukturierung über den sichtbaren Rollen-Schalter
`.ds-role` (Sidebar „Leitung ⇄ Koordination" + mobiler Chip im Heute-Greet) erreichbar —
der frühere Topbar-Avatar-Einstieg (`.dt-ava`/`#mtRollmenu`) existiert nicht mehr,
Mobile-Einstieg gibt es inzwischen bewusst DOCH.

Abgeschlossene Programme (je Spec + Plan in `docs/superpowers-optimized/`):
Aurora (14.07.) → Lichtung (15.07.) → Jade-Apotheke (16.07., `2026-07-16-jade-apotheke-overhaul.md`)
→ IA-Restrukturierung „Prozess-Achse" (16.07., Spec `2026-07-16-ia-restructure-design.md`,
Plan `2026-07-16-ia-restructure.md` mit Commit-Map).

Bekannte offene Kleinigkeiten: Radar-Segment trägt redaktionell doppelte Anlässe
(Teaser-Grid + Feed — bewusst, Null-Verlust); echter Lighthouse-Pass offen;
`#E06845` stockt-Ton auf Lack (3.67:1) beobachten.

### Danach denkbar (nichts zugesagt)
- Weitere Personas als Varianten desselben Mein-Tag-Musters (Recovery Manager, M. Belegung).
- Werdegang-Stepper horizontal; Netzwerk-Kontaktkarten verschlanken (Vorsicht `openReferrer`);
  Takeaway-Zeilen unter System-Charts; echte Kommunikation = Backend, außerhalb Prototyp-Scope.

---

## 8. Historie / Referenzen
- Design-Specs & Pläne des Cofounders: `docs/superpowers-optimized/{specs,plans}/`.
- Designlehren (aus früherem Feedback): hell bleiben, keine winzig-skalierte SVG-Typo, Grafiken müssen sich selbst erklären.
- Frühere Deep-Research-Reports (Akquise/Recht/Markt/Wettbewerb) liegen unter `…/SalutoCare/Deep-Research/` — relevant fürs inhaltliche Framing, nicht für die App-Technik.

**Erster Schritt im neuen Thread:** `git pull` → Preview `bavaria-proto` starten → App @1440 und @390 einmal durchklicken (6 Views + je ein Overlay + Zuweiserportal), damit der Ist-Zustand im Kopf ist, bevor irgendetwas geändert wird.
