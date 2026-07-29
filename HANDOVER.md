# HANDOVER — Klinik Bavaria · Concierge OS

**Für:** neuer Thread mit Fable-als-Orchestrator (delegiert an `claude-implementer` / `claude-implementer-pro`, konsultiert `fable-advisor`) — **den Cofounder**, der die nächste Aufgabe (§7) direkt übernimmt — **oder Codex/ChatGPT** als zweiten, unabhängigen KI-Mitwirkenden (seit 28.07., siehe §6a und §7).
**Stand:** `main` = `f818887`, live. Datum des Handovers: 2026-07-16 (ursprünglich 2026-07-09; seither: Jade-Apotheke-Overhaul 16.07. + IA-Restrukturierung „Prozess-Achse" 16.07. — §3/§7 aktualisiert; 22.07.: Workflow-Redesign Runden 2–4 — 73 Commits, §4c; **28.07.: Runden 13–15b (Beta-Feedback, §4p–§4u) — 6 Commits, DEMO_SCHEMA=6**).

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
| **KI** | `kiComplete()/kiVision()/kiRun()`, `kiAnalyse*`, `kiKurzbericht*`, `kiScan*`, `kiChat*`/`kiSnapshot()` | `.ki-*`, `#kiChat`, `.ki-fab` | additiv: `eingang[].kiVorschlag`, `inReha[]._kiKb`, `faelle[]._kiScan`; Proxy `ai-proxy/` → `ai.quintia.de` |

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

## 4f. KI-Integration (23./24.07., Branch `feat/ki`)

Echte KI im Prototyp: Demo ruft **Kimi (Moonshot)** über einen dünnen Node-Proxy
(`ai-proxy/`, deployt als Hostinger-Node-App auf `ai.quintia.de`; `KIMI_API_KEY` NUR als
Server-Env). Client-Fundament `.ki-*`: `kiComplete()/kiVision()` (fetch+Timeout),
`kiRun()` (Spinner→Ergebnis-Panel mit Übernehmen/Verwerfen), Health-Ping → `KI_ONLINE`,
`KI_FALLBACK`-Registry = gescriptete Pitch-Ergebnisse, falls Proxy/LLM ausfällt.
Vier Funktionen: **F1** Anfrage-Analyse im `#egDetail` (füllt numerische Sterne,
Gruppen-Vorwahl, Hinweis — `egFreigeben` bleibt manuell) · **F3** Kurzbericht-Generator im
Protokoll-Board (füllt NUR die Textareas; Save weiterhin `rsSaveZwischenstand`, dadurch
fließt `p.kurzbericht` unverändert ins Zuweiserportal `.rp-kurz`) · **F2** Dokument-Scan
(Vision) im Kostenklärungs-Werkzeug von `dArbeitHtml()` (Demo-Asset
`assets/demo-bewilligung.png`; erreichbar, sobald ein Fall die Aufgabe „Kostenzusage
anfragen" trägt) · **F4** KI-Copilot (`#kiChat`-Overlay + `.ki-fab`, read-only über
`kiSnapshot()`). Registriert in `_closeSiblingDetailRails` + `_DETAIL_IDS` (`"kiChat"`).
Cofounder-Namespaces unangetastet; einzige Berührungen fremder Funktionen: je 1
String-Einfügung in `openEgDetail`/`renderMtProtokolle`/`dArbeitHtml` + die 2
Array-Einträge. Spec/Plan: `docs/superpowers-optimized/{specs,plans}/2026-07-23-ki-integration*`.

---

## 4g. Runde 7 — Belegungs-Features, Redundanz-Pass & KI-Merge (24.07., `8f0b228`+`1bb55e4`, live)

Basis: Interview mit Belegungsmanagement (Elena) + Nutzer-Feedback + systematisches
Redundanz-Audit. **Neu:** Selbstzahler-Zweig im Kosten-Werkzeug (`kzSelbstzahler()`,
2-Pill-Kette „Offen → Selbstzahlung bestätigt", kein Kassen-Flow) · Kontakt-Einwilligung
als 5. Prüfpunkt in `egVollstaendigkeit()` (erscheint automatisch in F1s `egTriageHtml`-
Checkliste + wird bei Übernahme zur Rückfrage) · Vor-Aufnahme-Checkliste
(`aufnahmeCheckliste()`, 6 Punkte: stamm/kosten/unterlagen abgeleitet, zimmer/transport/tag
manuell via `f.aufnahmeCheck`) — **gated** `advanceFallStatus()` beim Übergang
„Aufnahme geplant"→„Aufgenommen"; Stammdaten-Bestätigung (`fkwStammHtml`) rendert jetzt
auch im Anreise-Schritt · Einladungspaket-Generator (`paketErstellen`, digital/Post) ·
Textbausteine im Angebot-Werkzeug (`bausteinEinfuegen`: Beihilfe 30/70, PKV, Selbstzahler,
Unterlagen — Name/KT automatisch aus `fallFakten()`) · Anlass-Arbeits-Akte `#akDetail`
(`akOpen/akSenden`, `.akd-*`): Zuweiser-/Patienten-Anlässe öffnen ein Overlay mit
Kontaktdaten + vorbefüllter Nachricht je Typ (`AKD_TEMPLATES`) · **Zuweiser-Ranking auf
3 Stufen umgestellt** (`zwTier()`: aktiv/gelegentlich/ruhend nach `letzter`+`faelle`;
`zwSterne()` GELÖSCHT — Patienten-Sterne unberührt) · alle 9 `faelle[]`-Seeds haben jetzt
`originalTxt`/`originalKanal` + angereicherte `log[]`-Kommunikation.

**Redundanz-Pass** (Prinzip: 1 Ort pro Info/Ansicht): `f.log` nur noch 1× — `#dLog` lebt
jetzt IN der Fallakte-Spalte „Kommunikation & Verlauf" (Steuerung-Duplikat entfernt,
vertikaler `stepper()`-Call raus → Funktion ist Orphan); `paAkte(pid,opts)` mit
`{verlauf,einwilligung,sterne}`-Gates (Fallakte/rsDetail: `verlauf:false`, dbDetail:
`einwilligung:false,sterne:false`); Kopfzeile/Hero/Kostenstatus/di-rows/rs-row entdoppelt.

**Merge-Entscheidungen KI×R7** (Commit `1bb55e4`): F2-Scan-Button rendert NUR im
Kassen-Zweig (Selbstzahler scannen keine Kostenzusage); `_DETAIL_IDS` =
`[dbDetail,rsDetail,egDetail,akDetail,kiChat]`; `akDetail` auch in
`_closeSiblingDetailRails` registriert (+ `akOpen()` ruft ihn). `mtAbschliessen()`: bei
geblocktem Statuswechsel (Gate) bleibt die Aufgabe offen statt fälschlich abzuschließen.

---

## 4h. Beta-Test-Infrastruktur (24.07., `d0503d5`, live)

Für Betatester: **localStorage-Persistenz** — `demoSave()` (debounced, Hook am Ende von
`renderAll()`) speichert `faelle/eingang/personen/inReha/zuweiser/zuweiserEvents/bestand/radar`
unter `kbDemoState`; `demoRestore()` läuft beim Start vor dem ersten Render. **WICHTIG: Wer die
STRUKTUR der Seed-Daten ändert (Felder umbenennt/entfernt), muss `DEMO_SCHEMA` (+1) erhöhen** —
sonst laden Tester alte, inkompatible Stände. Additive Felder brauchen keinen Bump.
`demoReset()` = ↺ in Topbar + im Beta-Overlay. **Onboarding** `#betaHilfe` (`.beta-*`):
Erstbesuch-Overlay mit 4 Testaufgaben + Feedback-mailto; Wieder-Öffnen via ?-Button (Topbar)
bzw. `.beta-mob-fab` (<1024px, links unten — Spiegel deines `.ki-fab`). `simulateInbound`-
Autostart hat einen Dedup-Guard gegen Duplikate nach Restore (manueller Demo-Button unverändert).

**Leitfall-Simulation (Fall id:1 Anna Muster):** `LEITFALL_EVENTS`/`simTrigger()`/`simFire()`
— auf Tester-Aktionen antwortet die Gegenseite zeitversetzt (setTimeout, feste Delays ×
`LEITFALL_TEMPO`): Rückruf erledigt → Tochter ruft zurück · Unterlagen angefordert → RHÖN-Fax
(docs[0..1]) + Versicherungsdaten-Mail (docs[2]) · Kostenzusage angefragt → **PKV-Rückfrage**
(Formular V-201, `f.sim.pkvOffen`) · Tester antwortet (sendReply ODER kzNotizAdd) → **Zusage**
(Az., `kosten="Zusage liegt vor"`, docs[3], neue Aufgabe „Angebot Zimmer senden") · Antwort →
Tochter bestätigt Zimmer/Anreise · Einladungspaket → Danke. Fortschritt in `f.sim=
{done,pending,pkvOffen}` (wird via demoSave mitpersistiert; Re-Arm-IIFE im Start-Bereich
liefert pending-Events 3s nach Reload nach). Hooks = je 1 Guard-Zeile in advanceFallStatus/
dArbeitUnterlagenAnfordern/kzAnfragen/kzNotizAdd/sendReply/paketErstellen (`f.id===LEITFALL_ID`).

---

## 4i. Runde 8 — Klärungsfelder-Modell (24.07., `a886f59`, live)

Beta-Feedback am Hoffmann-Fall → Fallakte-Arbeitsfläche komplett umgebaut: **5 Klärungsfelder
statt Status-Werkzeug-Kette** (`kfFelder(f)`, `.kf-*`-Akkordeon in `dArbeitHtml`, jederzeit
bearbeitbar, erstes offenes aufgeklappt): Kontakt & Erstgespräch (Tel/Mail aus Originaltext-
Regex bzw. `personen[]`, Stammdaten, Original, Gesprächsleitfaden, Notiz, Nachricht-Composer) ·
Medizinischer Bedarf (**NEU `f.med`** {diagnose,neben,isolation,schwere}, `kfMedSave`,
Vorschlags-Panel aus `f.medVorschlag`) · Unterlagen · Kostenzusage (kz-Tools + dein KI-Scan,
unverändert eingebettet) · Anreise & Aufnahme. `advanceFallStatus` überspringt erledigte
Felder (Status=Meilenstein, Mapping kontakt→Neu … aufnahme→Aufnahme geplant); `kzActions`
ohne Aufgaben-Gate. **Verlauf**: zentrale `logHtml()` (Datums-Trenner, Absender-Labels,
Systemzeilen `LG_SYS_RE`, deterministische Sitzungs-Uhr `logZeit()` — Laufzeit-Logs sind
jetzt 3-elementig `[datum,text,zeit]`, Seeds bleiben 2-elementig). **Warteschleifen-
Telefonagent (Pilot)** im Kosten-Feld (`.kta-*`, `ktaStart/ktaUebernehmen`, re-render-fest).
**Hoffmann = 4. Leitfall** über `f.simKey`-Resolver (dynamische Fall-Ids aus `uebernehmen`).
Einladungspaket mit Dokumenten-Vorschau `#epkVorschau` (`.epk-*`). `faOriginalChap`
dauerhaft ausgeblendet (Original lebt in K1). ACHTUNG: `sopToggle(typ,i)` hat jetzt 2
Parameter. `DEMO_SCHEMA=3`.

**R8.1 — Auto-Status (27.07., Beta-Bugfix):** Der Fall-Status leitet sich jetzt automatisch
aus dem Arbeitsstand ab: **`kfSyncStatus(f)`** rückt nach jeder feldabschließenden Aktion auf
den Meilenstein des ersten noch offenen Klärungsfelds vor (nie rückwärts, max „Aufnahme
geplant" — das Aufgenommen-Gate in `advanceFallStatus` bleibt). Aufrufstellen:
`fkwStammBestaetigen`, `kfMedSave`, `aufnDocToggle`, `dArbeitKostenUpload`, `kzZusage`,
`kzSelbstzahler`, `aufnahmeToggle` und `simFire` (Sim-Antworten rücken mit). Übersprungene
Stufen feuern ihre `simTrigger("status:…")` trotzdem (auch in `advanceFallStatus`) — sonst
reißen Leitfall-Storylines ab. Wer neue Feld-Abschluss-Aktionen baut: `kfSyncStatus(f)` vor
`renderAll()` aufrufen. Zusätzlich: „Fehlende anfordern" loggt jetzt in den Verlauf, und
Composer-Nachrichten mit Unterlagen/Befund/Einwilligung-Bezug lösen `simTrigger("unterlagen")` aus.

## 4j. Runde 8.2 — Lagebild, Kommunikations-Puls, Verwaltung (27.07., `cbdead1`)

Beta-Feedback (mehrere Mitarbeiter je Fall): Aufgabe/Status müssen sofort erfassbar sein,
Kommunikation nicht im Verlauf vergraben, „Steuerung" war unverständlich. Umbau:
- **Lagebild** (`lagebildHtml/kfAufgabe/lbOeffneFeld` statt `aufgabenHeroHtml` — gelöscht, samt
  `aufgabeIcon`/`AUFGABE_ICON`): Status-Chip + „X von 5 Feldern geklärt" + konkreter
  Jetzt-zu-tun-Satz (Klick öffnet das Klärungsfeld). KEIN „Weiter"-Button mehr; `advanceFall()`
  existiert weiter und hängt am „✓ Aufnahme bestätigen"-Button, der nur bei 5/5 erscheint.
- **Puls** (`lbPulsHtml`): letzte echte Nachricht (via `lgTyp()`) mit Zuständen eingetroffen/
  empfangen/wartet; `_lbFrischId` hält die Hervorhebung bis zur ersten eigenen Aktion.
- **Ungelesen**: `simFire` setzt `f.ungelesen`, wenn die Akte nicht sichtbar ist (`fallImBlick`);
  Gold-Chip `.karte-msg` auf Board-/Mein-Tag-Karte; `renderFallakte` quittiert NUR wenn
  `fallImBlick(f)` — simFire rendert die Akte auch unsichtbar neu, sonst erlischt der Chip ungesehen.
- **Verlauf-Reiter** `.lg-tabs` Nachrichten|Alles (`_lgTab`, Default Nachrichten); `kzNotizAdd`
  prefixt „✎ " → eigene Zeilenart `lg-note` (nur in „Alles").
- **Verwaltung statt Steuerung**: `dSpeichern`/`dStatus`/`dKosten`/`dConsent`/`dNotiz`/
  `toggleVerlust` KOMPLETT entfernt. Kostenträger (`fvwKtSet`, geloggt), SalutoCare
  (`fvwSalutoSet`), „Fall verloren melden…" (`fvwVerlustBestaetigen`, Pflichtgrund). Einwilligung
  lebt als Select im Kontakt-Feld (`kfConsentSet`, geloggt). `dOwner`/`dFrist` speichern direkt
  (Owner-Wechsel geloggt „Verantwortlich: X → Y"). `LG_SYS_RE` um die neuen Präfixe erweitert.
- **ACHTUNG Bug-Klasse (2× getroffen, 1× vorbestehend gefixt):** `*/` in Kommentar-PROSA
  (z. B. „.lb-*/.fvw-*") beendet CSS-Kommentare vorzeitig und frisst die NÄCHSTE Regel.
  Nie Namespace-Globs mit Stern-Slash in CSS-Kommentare schreiben. Der AURORA-PORTAL-Kommentar
  hatte dadurch monatelang die `.rp-bel`-Hover-Regel gefressen (jetzt repariert).

**R8.3 (27.07., Beta-Nachfixes):** `celebratePlanned()` navigiert NICHT mehr (`go("heute")` riss
den Nutzer aus der Akte, seit der Auto-Status es auslöst) — Effekt bleibt, Toast statt Sprung.
**`f.aufnahmeTermin`** (Laufzeit-Datum): Eingabe im Aufnahme-Feld (`aufnTerminSet`), Checklisten-
punkt „Aufnahmetag bestätigt" leitet sich daraus ab (`aufnahmeCheck.tag` ist tot), Übersicht/
Lagebild/Einladungspaket zeigen den Termin. `kzZusage()` setzt `docs[3]` mit; bei
`kt==="Selbstzahler"` entfällt das Kostenzusage-Dokument in Checkliste + Unterlagen-Feld.
Auto-Punkte der Vor-Aufnahme-Checkliste tragen `feld:`-Mapping und rendern „öffnen ›"
(`lbOeffneFeld`) statt toter Disabled-Häkchen.

## 4k. Runde 8.4 — Erstgespräch-Abschluss + agentischer UX-Walkthrough (27.07.)

**Neuer Standard-Prozess (Nutzer-Auftrag „nicht jeden Punkt vordiktieren"):** Nach jeder
Bau-Runde spielt ein Sonnet-Agent (Read-only) die App als naive Case-Managerin durch — jeder
Klick gegen den Code verfolgt, Prüfraster: verfrühte Erledigungen, Sim-Timing, tote Elemente,
Lagebild↔Board-Konsistenz, Sackgassen, ma-mode, Verlaufs-Dubletten. Befunde als P1–P3 mit
Klickfolge+Codebeleg; Fixes in der Implementer-Lane; Fable orchestriert nur.

**R8.4a:** „Kontakt & Erstgespräch" gilt erst mit explizitem **„✓ Erstgespräch abschließen"**
als erledigt (`f.kontaktOk`, `kfKontaktOk()` mit Seed-Fallback stammOk&&status≠Neu) —
Stammdaten bestätigen ist Voraussetzung, kein Abschluss. Erste Sim-Antwort (Anna/Hoffmann)
hängt am Abschluss ODER an einer echten ausgehenden Nachricht. Akkordeon-Gedächtnis
`_kfOffen`/`kfMerkeOffen` (ontoggle) — Re-Renders klappen offene Felder nicht mehr zu.

**R8.4b (6 Audit-Befunde gefixt):** Einladungspaket-Gate (Checkliste vollständig, sonst
disabled + Guard in `paketErstellen`); Ablehnungs-Ausweg (`kzActions`-abgelehnt-Zweig:
Selbstzahlung wechseln / `fvwVerlustOeffnen`; Lagebild-Override „Patient hat abgesagt" via
`kfAufgabe`, feld:"verlust" → `lbOeffneFeld` öffnet die Verlust-Box; „Widerspruch"-Text
entfernt); `kzNotizAdd` triggert KEINE Sim mehr (interne Notiz ≠ ausgehende Nachricht);
**`kostenSetzen(f,wert,logText)`** = einzige Stelle für f.kosten+docs[3]+Sync (nutzen:
kzZusage/kzAblehnung/kzSelbstzahler/dArbeitKostenUpload/mtAbschliessen — NIE wieder
`f.kosten=` direkt setzen!); f.aufgabe wird bei kzAnfragen/kzAblehnung/UnterlagenAnfordern
mitgepflegt; egFreigeben ohne Gruppe → Toast statt stillem No-op.

## 4l. Runde 8.5 — Fall-Dubletten (27.07., Beta-Befund „Anna/Patient 74 mehrfach auf dem Board")

Drei Ursachen, ein Fix-Paket: (1) `simulateInbound()`-Zähler `_inbN`/`_inbId` waren nicht
persistiert → Pool startete nach jedem Reload wieder bei der Hoffmann-Anfrage und vergab
Eingangs-IDs doppelt; jetzt in `demoSave`/`demoRestore` (`inbN`/`inbId`, mit Ableitungs-
Fallback `max(eingang.id)+1` für Alt-Stände). (2) `uebernehmen()` hatte keinen
Dubletten-Schutz → identische Anfrage (gleicher `m.txt` vs. `f.originalTxt`) wurde beliebig
oft zum Fall; jetzt Guard: markiert `done`, verweist auf bestehenden Fall, öffnet dessen
Akte + Toast. (3) `simKey="hoffmann"` wird nur noch vergeben, wenn kein Fall ihn trägt
(Sim-Resolver nimmt sonst immer den ersten). Dazu **`demoRepair()`** (läuft in
`demoRestore`, idempotent): entfernt Fall-Dubletten mit identischem `originalTxt` (behalten
wird der längste Verlauf, Gleichstand kleinste id; `eingang.fallId` wird umgehängt) und
doppelte Eingangs-IDs (erstes Item gewinnt) — bereinigt verseuchte Beta-Stände OHNE
`DEMO_SCHEMA`-Bump (Schema bleibt 3, Tester-Stände überleben). Wichtig fürs Verständnis:
Beta-Tester arbeiten auf der **GitHub-Pages-Origin** — ihr localStorage-Spielstand hängt
dort, Fixes wirken für sie erst nach Push+Pages-Build beim nächsten Laden. QA-Lehren:
`navigate` auf identische URL erzeugt nicht zwingend einen frischen Seiten-Realm →
Reload-Tests immer mit Cache-Buster-Query (`?frisch=N`) + `location.search`-Assert; die
awk-Script-Extraktion bricht bei einzeiligen `<script>…</script>`-Tags (Font-Loader Z. 9/13)
— Haupt-Script-Block stattdessen über letztes `<script>`/`</script>`-Paar per sed schneiden.

**R8.6 (Nachschlag):** Topbar-Reset beschriftet („↺ Zurücksetzen" statt nacktem Icon — Tester
fanden ihn nicht; Reload setzt bewusst NICHT zurück, Beta-Persistenz bleibt). Platzhalter-Namen
(`fkwNameIstPlatzhalter()`: „Patient/Patientin (…", „Neuer Fall (…") werden im Stammdaten-Feld
nicht mehr vorbefüllt → leeres Feld + Placeholder + Hinweis auf Originalnachricht; Bestätigen
ohne Namen → Toast+Focus; Log „Stammdaten im Erstkontakt bestätigt: Name (Alter)"
(LG_SYS_RE-Präfix unverändert); Umbenennung → Toast „Fall umbenannt". Echte Namen bleiben
vorbefüllt.

## 4m. Runde 9 — systematischer Beta-Usability-Test (27.07.)

Auf Nutzer-Auftrag („systematisch auf intuitive Bedienung testen") erstmals **drei parallele
Sonnet-Testläufe mit Personas** statt eines Audits: A = Case-Managerin erster Tag (Anna-Pfad),
B = Verwaltungsleiter (Startseite/Navigation/Eingang/Board/Team), C = Frust-Pfade + Handy
(Werner-Absage, Maria-Preisgespräch, Hoffmann-Übernahme, Reset, 390 px). Prüfraster war
**Intuition** (Weiß ich, was zu tun ist? Verstehe ich die Wörter? Bekomme ich Rückmeldung?
Verirre ich mich?), nicht Logik. Parallel eigener Browser-Rundgang des Orchestrators; **jeder
Befund vor dem Fix im Browser gegen den Code verifiziert** (drei Agenten-Befunde hielten der
Prüfung nur teilweise stand, einer war schwerer als gemeldet).

**Die vier schweren Befunde:** (1) `kfKontaktOk()` verlangte `stammOk` UND Status — die Seeds
setzen `stammOk` nie, also behauptete das Lagebild bei **allen** laufenden Fällen „Erstgespräch
führen · 0 von 5 Feldern", auch bei Ruth Winkler in „Aufnahme geplant"; Fallback jetzt Status
allein (ein Fall kommt nur über „Neu" hinaus, wenn der Erstkontakt lief). (2) `body.ma-mode`
blendete `#inbToast` mit der Leitungs-Chrome aus → **in der Arbeitsrolle quittierte kein
einziger Klick**, auch eingehende Kassen-Antworten blieben unbemerkt; additive Regel
`body.ma-mode #inbToast{display:flex}`. (3) `#fvwVerlustBox` trug `hidden`, aber
`.fvw-verlust-box{display:grid}` schlug das UA-Default → das Verlustgrund-Formular stand in
JEDEM Fall offen (neue Bug-Variante der bekannten CSS-Klasse: **Klassenregel überstimmt
`[hidden]`** — bei jedem `hidden`-Element mit eigener display-Regel prüfen). (4) `kpiCountUp()`
animierte via `rpCount`/rAF; lädt die Seite im Hintergrund-Tab, feuert rAF nie und
`window._kpiCounted` verhindert jede Reparatur → „Vorlauf 0 Tage / Ø Erstreaktion 0 Std. /
Conversion 0 %" dauerhaft neben „2 aufgenommen · 1 verloren". Fix: bei `document.hidden`
Endwerte direkt setzen (ohne Flag), Endwert-Timer als Sicherung, `visibilitychange`-Nachzieher.

**Weitere Fixes:** Verlust bestätigen mit `confirm()` + neuer `fvwFallReaktivieren()`
(Knopf-Umschaltung per Render-Logik in `renderFallakte`, IDs `fvwVerlustBtn`/
`fvwReaktivierenBtn`/`fvwVerlustHinweis`) — vorher war „Verloren" endgültig und nur per
Komplett-Reset umkehrbar, was dem Versprechen „Sie können nichts kaputt machen" widersprach;
Telefonnotizen erscheinen jetzt im Reiter „Gespräche & Nachrichten" (vorher gefiltert → Notiz
wirkte verschwunden); „✓ Erstgespräch abschließen" ist gesperrt mit Klartext-Begründung statt
unsichtbarem Toast; Lagebild-Kontakttext reagiert auf `stammOk`; Selbstzahler-Baustein mit
echten Demo-Preisen; Eingangs-Restliste bekommt Überschrift „Kein Handlungsbedarf" + Erklärung
von „passiv"; „Conversion" → „Aufnahmequote"; „Verloren · gelernt" → „Verloren";
Forecast nennt „Komfort-Kontingent innerhalb der 40 Privatbetten" (40 vs. 7 war unerklärt);
Touch-Ziele am Handy (`.tb-chip`, Checkboxen) ≥ 40 px, `#betaHilfe .mfoot` sticky (der Knopf
„Los geht's" lag 2 px unter der Falz).

**Seed-Nachzug (bei der Abnahme aufgefallen):** Kein `faelle[]`-Seed hatte je `med` gesetzt — nach
dem kfKontaktOk-Fix schickte das Lagebild deshalb auch Ruth Winkler („Aufnahme geplant", alle Docs,
Kostenzusage) zurück zu „Medizinischen Bedarf erfassen". Die sechs Fälle ab „Qualifizierung"
(6/8/9/10/11/13) tragen jetzt `med` mit der Diagnose aus ihrer eigenen Original-Anfrage; Anna (Neu)
und Maria (Kontaktiert) bleiben bewusst ohne — dort SOLL der Tester den Bedarf selbst erfassen.
Kein `DEMO_SCHEMA`-Bump (nur zusätzliche Felder, Alt-Stände bleiben gültig).

## 4o. Runden 11–12 — Textbausteine, Zeitleiste, KI-Ehrlichkeit (27./28.07.)

**R11 (`7933e55`) — Textbausteine kombinierbar.** `bausteinEinfuegen` setzte `el.value` auf einen
kompletten Brief (Anrede + Absatz + Grußformel) — zwei Bausteine zu kombinieren war unmöglich, der
zweite Klick warf den ersten weg (Nutzer: „ich kann nicht Unterlagen UND Beihilfe wählen"). Jetzt
liefert `bausteinBloecke(f)` nur Absätze; Anrede einmal oben, Grußformel einmal unten, jeder weitere
Baustein wird davor eingefügt, eigener Vortext bleibt. Dubletten-Schutz über den ersten Satzteil
(Toast). Die Blöcke sind als Fortsetzung der Anrede formuliert (klein) → ab dem zweiten Absatz wird
großgeschrieben. Platzhalter-Prosa („Das bedeutet …", „Bitte senden Sie uns diese …") durch
vollständige Demo-Texte ersetzt.

**R12 (`a223bb5`) — drei Nutzerwünsche + zwei eigene Funde.** (1) Prozessband aus dem Aktenkopf in
eine **eigene sticky Spalte** links (`.fk-col-zeit`, 168 px, Kicker „Prozess"; `#faStage` per DOM-Umzug
erstes Kind von `.fk-cols`, ID bleibt); aktueller Schritt pulsiert über den **bestehenden**
`lxPulse`-Keyframe (16 Keyframes vor und nach der Änderung — Motion-Set wächst nicht); unter 1024 px
unverändert horizontal. (2) KI-Analyse zeigte ihre Rechenphase nie: der Spinner existierte, aber ohne
Proxy scheitert `kiComplete` in Millisekunden → 700 ms feste Verzögerung im Offline-Zweig.
(3) Erkannte Diagnose als sichtbares Panel „✦ Aus der Anfrage erkannt … noch nicht gespeichert" +
`kfDiagVorschlagUebernehmen()`; **bewusst keine Automatik**, weil gesetzte `f.med.diagnose` das
Klärungsfeld als erledigt gelten lässt und den Status ohne Prüfung vorrücken würde.

**Zwei Funde aus der Abnahme — beide betreffen die KI-Ehrlichkeit:** `KI_FALLBACK.analyse` ist ein
fest formulierter Text über die Hoffmann-Website-Anfrage; **ohne Proxy bekam damit JEDE Anfrage diese
fremde Zusammenfassung** (Fax über 68-Jährigen wurde als Website-Wechselwunsch eines 74-Jährigen
beschrieben — im Pitch fatal). Neu `kiFallbackAnalyse(m)`: leitet Satz und Felder aus den Signalen der
konkreten Anfrage ab, liest **Betreff und Absenderzeile mit** (Fax-Anmeldungen tragen die Diagnose
dort, nicht im Text) und nutzt ein **eigenes volleres Frist-Muster**, weil `erkenneSignale`
„Entlassung in 4 Tagen" nach „Entlassung in" abschneidet (dort dokumentiert). Zweitens: bei
auto-verteilten Anfragen (`m.gruppe`) rendert `egSummaryHtml` statt `egTriageHtml` — dort stand
weiter der Seed-Satz und die fertige KI-Zusammenfassung wurde nicht gezeigt; jetzt beide Pfade
konsistent („Automatisch erkannt" vor der Analyse, KI-Zusammenfassung danach).
**Lehre: Ein Fix am Anzeige-Text muss ALLE Render-Pfade eines Fensters abdecken — `openEgDetail` hat
vier (done / passiv / gruppe / offen).**

---

**Prozess-Lehren:** Persona-Testläufe finden anderes als Logik-Audits (Wortwahl, fehlende
Rückmeldung, Reihenfolge-Frust) — beides braucht es. Spec-Code an Lanes immer selbst
`node --check`-fähig schreiben: ein gerades `"` in einem doppelt gequoteten String hat die Lane
gekostet (sie hat es korrekt gemeldet und escaped). QA-Falle: `offsetParent` ist bei
`position:fixed` immer `null` → Sichtbarkeit über `getComputedStyle` + `getBoundingClientRect`.

## 4n. Runde 10 — Ansprechpartner, Verlauf-Größe, Personen-Verknüpfung (27.07.)

Vier Beta-Punkte des Nutzers, alle vor dem Fix im Browser verifiziert:

**(1) Zusammenfassung ohne KI war eine Lüge.** `egTriageHtml` zeigte im `!m.kiDone`-Zweig den
Seed-Satz `m.zusammenfassung` unter „Zusammenfassung" — ein vollformulierter Satz, den ohne
Analyse niemand erzeugt haben kann. Jetzt: nur regelbasiert Ablesbares („Kostenträger · Dringlichkeit
· Fachbereich") unter „Automatisch erkannt" plus Hinweis, dass die Zusammenfassung mit der
KI-Analyse entsteht. Nur dieser else-Zweig im fremden KI-Code angefasst; `egSummaryHtml`-Kicker
zu „Kurzüberblick".

**(2) Primärer Ansprechpartner mit Auskunftsberechtigung (neu).** Laufzeitfeld `f.ansprech`
{name,bezug,legit}; `ANSPRECH_BEZUG`/`ANSPRECH_LEGIT`, `kfAnsprech(f)` (Default aus `f.rolle`),
`kfAnsprechHtml`/`kfAnsprechSet` im Klärungsfeld Kontakt, plus **Lagebild-Zeile `.lb-ap`**
(„Kommunikation mit: Name (Bezug) · Legitimation", bei `legit==="ungeklärt"` oder fehlendem Namen
rot mit Hinweis, dass keine Gesundheitsauskünfte erlaubt sind; Klick springt ins Kontakt-Feld).
Sync in `person().angehoerige`. `LG_SYS_RE` um „Ansprechpartner:" erweitert.

**(3) Verlauf war ein 150-px-Guckloch.** Gemessen bei 1440: `#dLog` 62 px hoch (globale
`.timeline`-Regel `max-height:150px`), Klärungsfeld-Block 1478 px. Additiv (globale Regel
unangetastet, sie gilt auch für Mein-Tag-Karten): `#view-fallakte #dLog{max-height:min(58vh,560px)}`,
mobil 52vh. Dazu die inhaltsarmen Kontext-Kapitel „Medizinische Kurzfelder", „Abrechnung",
„Dokumente" als `<details class="chap fk-fold">` (zugeklappt je 94 px; innere IDs `faMedizin`/
`faAbrechnung`/`faDokumente` unverändert, JS füllt weiter). „Kommunikation & Verlauf" und
„Übersicht" bleiben offen.

**(4) Stammdaten landeten nicht in der Personen-Akte.** Ein aus dem Eingang übernommener Fall
hat `personId === null` — `uebernehmen()` legt keine Person an, `paAkteSlot` zeigte dauerhaft
„Noch keine Einzelperson qualifiziert". `fkwStammBestaetigen()` legt die Person jetzt mit dem
**echten Namen** an (`pNew` + `pHist`, Telefon/Mail per Regex aus `originalTxt`) bzw. aktualisiert
eine verknüpfte Person; Sammelnamen („Familie …") bleiben bewusst ohne Einzelperson-Akte, die
Akte entsteht also genau mit dem Patientennamen.

**Drei Nachzüge bei der Abnahme (vom Orchestrator selbst gefixt):** (a) `gebIn(0,alter)` als
Geburtsdatum-Ersatz gab **jeder neu erfassten Person heute Geburtstag** und löste sofort einen
Geburtstags-Anlass aus → kein erfundenes Datum mehr, stattdessen Personenfeld `alter` und in
`paAkte` die Zeile „Alter · Geburtsdatum noch offen". (b) `zuweiserRef` wurde blind aus `f.quelle`
gefüllt → bei einer Website-Anfrage der Familie stand der Anfrage-Titel als „Zuweiser" in der
Akte; jetzt nur bei echten Zuweiser-Kanälen. (c) Ein VOR den Stammdaten erfasster Ansprechpartner
wanderte nie in die Person (Reihenfolge-Abhängigkeit, `kfAnsprechSet` syncte nur bei bestehender
`personId`) → `fkwStammBestaetigen` übernimmt ihn beim Anlegen mit.

---

## 4p. Runde 13 — Zuweiser-Anmeldungen, Originalnachricht, Zeitleiste (28.07., `f792b5f`)

Nutzer spielte „Patient/Patientin (68) Neurologie" (Fax RHÖN) durch. Drei Befunde, ausdrücklich
**allgemein** zu lösen, nicht nur für diesen Fall:

**(1) Sozialdienst-Anmeldungen ohne Stammdaten sind unrealistisch.** Die Eingangs-Seeds
101/102/103/109/110 + der Dr.-Kessler-Pool-Eintrag tragen jetzt vollständige Kurzanmeldungen
(Name, Geburtsdatum, Diagnose, Kostenträger, beigefügte Unterlagen, Rückrufnummer) und ein Feld
`patient:{name,alter}`, aus dem `uebernehmen()` direkt den echten Fallnamen zieht. Anna (1), Maria (3),
Hoffmann-Pool, PRIMO MEDICO und die passiven Einträge blieben bewusst unverändert (Leitfall-Dramaturgie).
`fkwStammBestaetigen()` liest zusätzlich ein Geburtsdatum aus dem Text (`geb. TT.MM.JJJJ`).
`DEMO_SCHEMA` auf **4** — Seed-Inhalte haben sich geändert, gespeicherte Tester-Stände einmal verwerfen.

**(2) Kapitel „Originalanfrage" war toter Code.** `renderFallakte` blendete `#faOriginalChap` bei
jedem Rendern aus und aktivierte es nie → die Originalnachricht war unauffindbar. Sichtbar gemacht
(in R14 dann in den Verlauf verschoben, siehe unten), `white-space:pre-line` für Faxe/Formulare.

**(3) Zeitleiste zu klein + Lagebild doppelte Aussage.** `.fk-col-zeit` 168→184 px, Label 13 px/
weight 400, Punkte 9 px, aktueller Schritt weiter über `lxPulse`. `lbPulsHtml` liefert `""`, wenn
`kfAufgabe(f).feld==="kontakt"` — sonst stand „Noch keine Kommunikation" direkt unter dem
inhaltsgleichen „Jetzt zu tun".

**Drei eigene Funde bei der Abnahme:** Telefon-Regex griff das Aktenzeichen („Az. N-0472/26" →
„☎ 0472/26"), Mail-Regex nahm den Satzpunkt mit, und „Absender" war ein halber Anfragetitel.
Daraus zentrale Helfer **`telAusText()`** (Label-Priorität, Az.-Ausschluss, ≥8 Ziffern) und
**`mailAusText()`** — alle drei früheren Inline-Regex-Stellen nutzen sie jetzt.

## 4q. Runde 14 — Kommunikation als Herzstück (28.07., `e6ac338`)

Vier Beta-Befunde, alle vor dem Fix im Browser reproduziert:

**(1) Originalnachricht abrufbar statt Dauer-Kapitel.** Nutzer: „gehört nicht aufgeklappt irgendwo
rechts in der Akte, man muss sie einfach abrufen können". `#faOriginalChap` entfernt; neue
`faOriginalHtml(f)` rendert sie als zugeklapptes `<details class="fa-orig">` **am Anfang des
Nachrichtenverlaufs** (chronologisch korrekt). Innere id `faOriginal` erhalten, damit das
`pre-line`-CSS weiter greift.

**(2) „Kommunikation & Verlauf" ist Arbeitsmaterial.** Kapitel-Markup aus `.fk-col-kontext` in
`.fk-col-arbeit` verschoben (Reihenfolge: Lagebild → `#dArbeit` → Verlauf → Verwaltung); die
R10-Regel `#dLog{max-height:min(58vh,560px)}` durch `max-height:none;overflow:visible;font-size:14px`
ersetzt, Bubbles 10/12 px Padding, in/out ±6 % Einzug, Arbeitsspalte **1.5fr** statt 1fr
(519 px vs. 346 px @1440). Mobil: volle Breite für Eingehende, 13.5 px.

**(3) Ansprechpartner landete nicht „oben in Kommunikation".** Reproduziert: Bezug auf
„Patient selbst" gesetzt → `f.ansprech={name:"",…}` → Lagebild blieb auf „noch nicht festgehalten",
weil nur der Name gerendert wurde. Jetzt (a) `kfAnsprechSet` übernimmt bei „Patient selbst"
automatisch `f.name` (außer Platzhalter) und setzt `legit`, (b) Lagebild fällt auf den Bezug zurück
(„weitere Angehörige — Name offen") und lässt `legit` weg, wenn es dasselbe sagt wie der Bezug,
(c) neue Kopfzeile **`kommPartnerHtml(f)`** im Verlauf: Anmeldende Stelle / Ansprechpartner /
Antworten gehen an (letzte Zeile nur, wenn sie etwas Neues sagt) + Hinweis bei ungeklärter
Auskunftsberechtigung. (d) `kommEmpfaenger(f)` adressiert ausgehende Einträge (`sendReply`,
`dArbeitUnterlagenAnfordern`, `epkSendenBestaetigen`) an den echten Adressaten statt immer an `f.name`.

**(4) Keine Rückmeldungen bei selbst übernommenen Fällen.** `simTrigger` kannte nur die vier
Leitfälle (id 1/3/13 + `simKey:"hoffmann"`) — jeder übernommene Fall blieb nach „Unterlagen
anfordern" für immer still. Neu: **`GEN_EVENTS`** (antwort · unterlagen · versicherung · kosten ·
paket) mit `genAbsender`/`genVon`/`genEvent`, `genSchedule`/`genFire`, `else`-Fallback in
`simTrigger`. Antwortende Partei folgt der realen Arbeitsteilung: **`anmeldStelle(f)`** (Fax/Recare/
Sozialdienst/Entlassmanagement) antwortet auf Unterlagen und Rückfragen, der Patient reicht
Versicherungsdaten nach und bestätigt das Einladungspaket, der Kostenträger meldet die Zusage
(über `kostenSetzen`, nicht `f.kosten=`). Dafür ist `simFire` in **`simFire`/`simApply`** geteilt —
Leitfall- und generische Ereignisse nehmen denselben Weg (Log, `kfSyncStatus`, ungelesen, Toast,
Rerender); die Nachliefer-Zeile am Dateiende unterscheidet `gen:`-Keys von Leitfall-Keys.
Verifiziert: Fax-Fall Friedrich Sander → Sozialdienst (Fax) + Patient (E-Mail) + PKV antworten,
`docs` und Kostenstatus rücken mit, Leitfälle behalten ihr Skript.

**Eigener Fund bei der Abnahme:** die R13-Absender-Herleitung machte aus „Angehörige fragt für
Vater (74) nach Wechsel-Reha" eine Einrichtung. Jetzt gilt der Titelteil nur als Absender, wenn er
wie eine Einrichtung aussieht (Verbteil abgeschnitten, ≥2 Wörter, 6–34 Zeichen, kein Rollenwort,
kein Fragezeichen) — sonst bleibt der Kanal die Quelle. Alle acht offenen Eingänge geprüft:
Website/Telefon/E-Mail bekommen den Kanal, die drei Zuweiser-Anmeldungen ihre Einrichtung.

**Lehre:** Eine Zeile, die den Zustand nur über EIN Feld rendert (hier `ansprech.name`), lügt,
sobald der Nutzer ein anderes Feld pflegt — Fallbacks über die ganze Datenstruktur denken.

## 4r. Breite & Auswertung 2-spaltig (28.07., `721bfb8`)

Nutzer im Vollbild: „rechts ist ein Bereich, der gesperrt ist, wo ich nichts machen kann" —
kein Bug, sondern `.content{max-width:1240px}` zentriert auf einem 1920er-Monitor. Fix: **1640px**
(füllt breite Screens, lässt bei 1440 die bisherige Optik). Folgefund: die Zahlen-Charts unter
„Auswertung" streckten sich dabei auf 1560px Breite; `#view-auswertung.view.active` bekommt ab
**1500px** ein 2-spaltiges Grid (`grid-template-columns:1fr 1fr`).

## 4s. Verlauf-Platzierung — zwei Korrekturrunden (28.07., `04a7cc3` → `184303f`)

R14 (§4q) hatte „Kommunikation & Verlauf" zwar in die Arbeitsspalte verschoben, aber **nach** den
Klärungsfeldern (die bei 1440px 1625px hoch sind) — der Verlauf begann faktisch bei y≈2285. Erste
Reaktion des Nutzers: „du hast es nach ganz ganz unten geschoben???? ist das sinnvoll?" Erste
Korrektur schob den Verlauf direkt unter das Lagebild, blieb aber in derselben Spalte — Ergebnis:
Arbeitsspalte 3232px hoch, Kontextspalte 576px + 2600px Leerraum, alles gestapelt. Zweite,
schärfere Reaktion: „warum hast du das jetzt alles untereinander, das ist extrem nervig und nicht
mehr gut zu arbeiten????" Finale Korrektur: zurück zu **zwei Spalten**, Verlauf als **erstes
Kapitel der Kontext-Spalte**, gleiche Breite wie die Arbeitsspalte (`.fk-cols` bleibt
`184px minmax(0,1fr) minmax(0,1fr)`) — Lagebild/Klärungsfelder links, Verlauf direkt daneben rechts,
beide gleichzeitig im Blick.

**Lehre (wichtig für jede künftige „muss sofort sichtbar sein"-Anforderung):** Ich hatte
„sofort sichtbar" als Positionsfrage **innerhalb einer Spalte** gelesen (wie weit oben steht es?).
Die eigentliche Anforderung war **Parallelität** — den Verlauf lesen, während man in den Feldern
arbeitet, nicht nacheinander scrollen. Bei einem als „Herzstück" bezeichneten Element zuerst
prüfen, ob Nebeneinander statt Reihenfolge gemeint ist.

## 4t. Runde 15 — Die In-Reha-Phase (28.07., `e9b42a8`, via `/brainstorming`)

Nutzerfrage: „wie machen wir das mit medizinischen Daten, wenn der Patient tatsächlich in der
Reha ist?" `inReha[]` war bis dahin ein reines Seed-Array — kein Code-Pfad schrieb hinein. Ein bis
„Aufnahme bestätigen" durchgespielter Fall verschwand ins Nichts: kein Eintrag in „In Reha", die
Fallakte behauptete dauerhaft „noch nicht aufgenommen", der Belegungs-Forecast rechnete pauschal
mit 21 Tagen. Nutzerentscheidung zur medizinischen Tiefe (per AskUserQuestion): **„Steuerung +
Outcome"** (nicht nur Verwaltung, aber auch keine vollständige Klinik-Software-Simulation).

Drei-Teil-Umsetzung:
- **Teil A — Die Schwelle:** `rehaAufnahme(f)` erzeugt an der Statusschwelle „Aufgenommen" den
  Reha-Datensatz aus dem Fall (Diagnose, Achse, Kostenträger, Verantwortliche, Aufnahmedatum,
  geplante Verweildauer aus `REHA_PLAN_TAGE` je Fachbereich). Neues Eingabefeld im
  Aufnahme-Klärungsfeld: die Zimmerkategorie (`aufnZimmerSet`) — daran hängen Tagessatz und
  Zusatzerlöse. **Abrechnungsdaten liegen auf dem Datensatz** (`p.bill`, Zugriff über `rehaBill(p)`
  mit `RS_BILLING`-Fallback für Alt-Seeds) statt in der statischen `RS_BILLING`-Tabelle — sonst
  überlebten sie keinen Reload. Fall und Reha-Akte bleiben über `personId`/`p.fallId` verbunden.
- **Teil B — Messwerte kommen aus der Kliniksoftware:** kurz nach der Aufnahme trifft das
  Aufnahme-Assessment ein (`REHA_ASSESS` je Fachbereich: ICD, Barthel/FIM-Aufnahmewerte, Reha-Ziel,
  Arztbericht-Satz) über dieselbe Sim-Mechanik wie die Rückmeldungen des Sozialdienstes
  (`reha:assessment`-Key, `rehaAssessSchedule`/`rehaAssessFire`), inkl. Nachliefern nach Reload.
  Solange es fehlt, steht ehrlich „Aufnahme-Assessment steht aus" statt erfundener Startwerte —
  mit Guards in Reha-Detail, Karte, Zwischenstand-Reminder und Fallakte.
- **Teil C — Aufenthalt und Entlassung:** `rehaZwischenstandSenden` schickt den Kurzbericht an die
  anmeldende Stelle; `rehaEntlassung` setzt `p.entlassen` (bewusst **kein neuer Status** in
  `STATUS[]` — das hätte Board/Funnel/KPIs rippeln lassen), schreibt einen `pHist`-Eintrag
  „entlassung" (Basis für Nachsorge-Anlass + Entlass-Jubiläum) und nimmt den Patienten aus den
  laufenden Listen, ohne den Datensatz zu löschen.

Eigene Abnahme-Funde: das Cockpit zählte Entlassene weiter als „in Behandlung"
(`inReha.length` → `inReha.filter(p=>!p.entlassen).length`); ISO-Daten in `faMedizin` → `paDate()`.
Verifiziert: Fall 9 und der RHÖN-Fax-Fall bis zur Aufnahme durchgespielt, Assessment trifft ein und
füllt ICD/Barthel/FIM/Ziel, Zwischenstand protokolliert, Entlassung entfernt die Karte korrekt,
Reload behält Zimmer/Werte. `DEMO_SCHEMA=5`.

## 4u. Board-Zone „Im Haus" (28.07., `f818887`)

Nutzerwunsch direkt im Anschluss an R15: „Patient im Haus/aufgenommen" als **eigene, verfolgbare
Board-Spalte**. Neue fünfte Zone `haus-rail` (jadefarben) zwischen den drei Trichter-Bändern und
„Abgeschlossen": `hausFaelle()` (Status „Aufgenommen" && nicht entlassen), `makeHausCol()`-Karten
zeigen Tag X von Y + Fortschrittsbalken, Zimmer, geplante Entlassung, Barthel/FIM-Entwicklung
(oder ehrlich „Aufnahme-Assessment läuft ein"), Sprung-Button „In Reha ansehen ›" (`faZuReha`) und
Klick-zu-Fallakte. „Abgeschlossen" zeigt jetzt `makeEntlassenCol()` (Entlassdatum, tatsächlicher
Aufenthalt) + „Verloren". Die zwei bereits „aufgenommenen" Alt-Fälle (Ludwig Bauer, Elisabeth
Cramer) wurden mit `bill` auf dem Datensatz nachgeseedet, damit sie ohne Bruch erscheinen.
`DEMO_SCHEMA=6`.

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

## 6a. Codex/ChatGPT als zweiter KI-Mitwirkender (seit 28.07.)

Der Nutzer bringt **Codex (ChatGPT)** zusätzlich zu Fable/Claude ins Projekt — als unabhängiger
zweiter Kopf, nicht als Ersatz. Codex arbeitet vermutlich in einem eigenen Terminal/Editor auf
derselben Arbeitskopie. Für Codex gilt exakt dasselbe wie für jeden Mitwirkenden:

- **§1–§2 (CLAUDE.md + HARTE REGELN) sind bindend**, unabhängig davon, welches Modell schreibt:
  Cofounder-Namespaces (`.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `openReferrer`, `#refOverlay`) tabu,
  `inReha[]`/`faelle[]`/`personen[]` nur additiv erweitern, 390px UND ≥1024px verifizieren,
  0 Console-Errors, nur synthetische Demo-Daten, kein `Math.random()`/argloses `new Date()`.
  **Kein Stern-Slash (`*/`) in CSS-Kommentar-Prosa** (§4j) — hat diese Codebase bereits zweimal
  gebissen.
- **Geteilte Datei, jetzt drei Autoren** (Cofounder, Fable/Claude-Lanes, Codex): vor jedem eigenen
  Push `git pull`/`git fetch`+FF-Check, nie `--force`. Commit-Trailer entsprechend anpassen
  (`Co-Authored-By: <Codex-Modellname> <...>`).
- **Erste Rolle: unabhängige Debugging-/Audit-Durchläufe** (§7) — Codex sieht den Code frisch,
  ohne die Vorgeschichte dieses Threads, das ist der Wert eines zweiten Kopfes. Ob Codex danach
  auch Feature-Arbeit übernimmt, ist offen und wird nach dem ersten Durchlauf entschieden.
- Codex hat vermutlich **keinen automatischen Zugriff auf dieses HANDOVER.md** wie Fable/Claude —
  der erste Prompt an Codex muss explizit auf `HANDOVER.md` + `CLAUDE.md` verweisen und zum Lesen
  auffordern, bevor irgendetwas am Code passiert.

---

## 7. NÄCHSTE AUFGABE

**An Codex/ChatGPT delegiert (28.07.), am 29.07. abgeschlossen: systematischer
Debugging-Durchlauf.** Ziel war, unabhängig von
Fable/Claude herausfinden, wo die App noch hakt oder nicht funktioniert — nach den vielen
Iterationsrunden (R1–R15b, siehe §4) ist ein frischer, unvoreingenommener Blick wertvoll. Codex
sollte **zunächst nur berichten, nicht fixen** (Findings-Report mit Datei:Zeile, Reproduktion,
Schweregrad). Dieser Bericht steht vollständig in §7a; Fixes laufen danach in einer eigenen Runde,
damit der Nutzer vor Änderungen sehen kann, was gefunden wurde.

### 7a. Codex-Audit abgeschlossen (29.07.2026, keine Fixes)

Codex hat `CLAUDE.md` und dieses Handover vollständig gelesen, danach einen statischen Audit und
einen echten Laufzeittest mit Playwright/Google Chrome durchgeführt. Getestet wurden 390, 1024 und
1440 px, Reduced Motion sowie der Kernweg Eingang -> Fall -> Klärung -> Aufnahme -> In Reha ->
Entlassung. Zusätzlich geprüft: Board, Netzwerk/Zuweiser, Team/Mein Tag, Zuweiserportal und die
Live-Version auf GitHub Pages. Am Code wurde dabei **nichts geändert oder committed**.

**Befunde, nach Schwere geordnet:**

1. **P1 - Personen-ID-Kollision nach Reload (`index.html:5081-5087`, `9370-9376`,
   `9406-9419`).** `_pidN` startet bei jedem Laden mit 0. `demoSave()` persistiert den Zähler
   nicht und `demoRestore()` rekonstruiert ihn nicht aus `personen[]`. Nach dem ersten neu
   angelegten Patienten (`PR1`), einem Reload und der nächsten Stammdatenbestätigung entsteht ein
   zweiter Patient mit `PR1`; `person("PR1")` kann danach die falsche Akte liefern.
   Reproduktion: Anfrage übernehmen -> Stammdaten bestätigen -> Reload -> zweite neue Anfrage
   übernehmen -> Stammdaten bestätigen.

2. **P1 - Zuweiserportal/Behandlungs-Einblick stürzt mit dem Seed ab
   (`index.html:6974-6988`).** `renderEinblick()` ruft ungeschützt `p.labor.map()` auf. Ludwig
   Bauer und Elisabeth Cramer besitzen kein `labor`; neue Aufnahmen bekommen `labor:null`
   (`index.html:7297-7302`). Klick auf Zuweiserportal -> in der Reha erzeugt
   `Cannot read properties of undefined (reading 'map')` und lässt den alten Portalinhalt stehen.
   Das zeigt zugleich: `DEMO_SCHEMA=6` ist aktuell, aber die `inReha`-Seed-Struktur erfüllt die
   vom Renderer vorausgesetzte Feldinvariante nicht.

3. **P1 - Zuweiserportal ist nicht auf den gewählten Zuweiser begrenzt
   (`index.html:6974-6976`).** `renderEinblick(zName)` benutzt `zName` überhaupt nicht, sondern
   rendert pauschal alle Einträge aus `inReha`. Nach einem reinen Laufzeit-Guard für den Laborfehler
   zeigte das Leopoldina-Portal fünf Patienten; korrekt zugeordnet war nur Ludwig Bauer. Das ist
   im Pitch ein gravierender Mandanten-/Vertraulichkeitsbruch. Achtung: Der Fix liegt im
   Cofounder-Bereich `openReferrer`/`.rp-*` und muss daher mit Cofounder/Fable abgestimmt werden.

4. **P2 - Aufnahme und Entlassung synchronisieren den Personen-Lebenszyklus nicht
   (`index.html:7288-7317`, `7181-7191`).** `rehaAufnahme()` ändert die Person nicht von
   `interessent` zu `patient`; `rehaEntlassung()` setzt sie nicht auf `altpatient`. Im getesteten
   Kernweg blieb die Person vor, während und nach der Reha ein „Interessent“. Dadurch können
   Personenakte, Segmentierung und Kampagnen den falschen Zustand zeigen.

5. **P2 - Entlassene bleiben in anderen Renderpfaden „In Reha“
   (`index.html:6976`, `9719-9724`).** Board, In-Reha-Grid und Cockpit filtern `p.entlassen`.
   Zuweiserportal und `kiSnapshot()` mappen dagegen das komplette `inReha[]`. Nach einer Entlassung
   verschwindet der Patient korrekt aus der Hauptansicht, wird Portal und Copilot aber weiter als
   laufender Reha-Patient übergeben. Ein Entlassungsfix muss alle Render-/Snapshot-Pfade abdecken.

6. **P2 - Entlassung ist ungeprüft und nicht rücknehmbar (`index.html:7126-7129`,
   `7181-7191`).** Der Button ist für jeden nicht entlassenen Patienten sichtbar, auch direkt an
   Reha-Tag 1. Ein Klick setzt sofort `p.entlassen`, ohne Bestätigung, Mindestvoraussetzungen oder
   Undo. Reproduktion: neuen Fall aufnehmen -> In Reha -> Patienten öffnen -> Entlassung
   dokumentieren.

7. **P2 - „Fall wieder öffnen“ ist in aktiven Fällen sichtbar und funktionslos
   (`index.html:84-86`, `4430-4433`, `9024-9026`).** `.btn-ghost {display:inline-flex}`
   überstimmt das HTML-Attribut `hidden`. Deshalb stehen in einer aktiven Fallakte gleichzeitig
   „Fall verloren melden“ und „Fall wieder öffnen“. Der zweite Klick verpufft am Status-Guard.
   Für die Verlustbox existiert bereits eine gezielte `[hidden]`-Regel; für den Button nicht.

8. **P2 - Automatisierungs-Toast blockiert bei 390 px die Tabbar
   (`index.html:1211-1219`, `5277-5288`, `9455`).** Gemessen: 366 x 80 px ab y=742 bei einem
   390x844-Viewport; die Tabbar beginnt bei y=778. Nach dem Anfrage-Autostart liegt der Toast über
   fast allen Navigationszielen, Playwright konnte „Reha“ nicht anklicken. Der Folge-Toast bleibt
   bis zu neun Sekunden sichtbar.

9. **P2 - In-Reha-Karten brechen bei der Pflichtbreite 1024 px
   (`index.html:1144-1147`, `3118-3130`).** Ab 900 px erzwingt das Grid zwei Karten, jede Karte
   erzwingt aber vier BWL-Kacheln. Bei 1024 px ragen die Kacheln in die Nachbarkarte bzw. werden
   abgeschnitten; besonders „Zusatzerlöse/Tag“. Der Dokument-Viewport selbst bleibt 1024 px breit,
   daher erkennt ein bloßer `document.scrollWidth`-Check diesen internen Clip nicht.

10. **P2 - Jeder Start erzeugt Console-Errors (`index.html:9530-9533`).** Der
    `https://ai.quintia.de/health`-Ping wird sowohl von `localhost:8765` als auch von der
    GitHub-Pages-Live-Origin per CORS abgewiesen. Pro Laden erscheinen CORS-Fehler und
    `net::ERR_FAILED`. Der Promise-Catch setzt die UI zwar auf offline, macht den Browserfehler
    aber nicht „leise“. Verstößt gegen den verbindlichen 0-Console-Errors-Vertrag.

11. **P3 - Tote Altpfade plus Determinismus-Verstoß.** Jeweils nur definiert, nie aufgerufen:
    `antwortenEingang` (`5545`), `setDbView` (`5730`), `closeDbDetail` (`6398`),
    `findeOderErstelleZuweiser` (`6453`), `mxMetric` (`6855`), `refToast` (`6973`),
    `rsSpark` (`7221`), `closeDetail` (`8348`), `mtRollToggle` (`8828`) und `stepper`
    (`6896`). `closeDetail()` referenziert sogar das entfernte `#ovDetail`. Außerdem verletzt
    `const heute=new Date()` (`4605`) die für diesen Auftrag ausdrücklich gesetzte Regel gegen
    argumentloses `new Date()` und macht den Demo-Anker laufzeitabhängig.

**Positiv verifiziert:** Der eigentliche Klärungsweg trägt bis zur Aufnahme, das Assessment trifft
deterministisch ein, Team/Mein Tag kehrt korrekt aus der Fallakte zurück, Reduced Motion rendert
alle sechs Hauptviews sichtbar und die Hauptviews erzeugen bei 390/1024/1440 keinen
dokumentweiten horizontalen Overflow. Abgesehen vom KI-Healthcheck und dem Zuweiserportal-Fehler
traten in Board, Netzwerk, Team/Mein Tag, Fallakte und Reha-Detail keine weiteren Console-Errors auf.

**Empfohlene Fix-Reihenfolge für Claude/Fable:**
1. `_pidN` beim Persistieren/Restore eindeutig machen und doppelte `pid` reparieren/validieren.
2. `renderEinblick()` gegen fehlende Reha-Felder härten.
3. Zuweiserportal nach `zName`/echter Fallbeziehung filtern (Cofounder-Abstimmung).
4. Aufnahme/Entlassung als zentralen Zustandsübergang für Person, Board, Portal und KI vereinheitlichen.
5. Danach mobile Toast-Lage, 1024-px-Reha-Karten, Hidden-Button und KI-Healthcheck.

**Wichtig für die nächste Runde:** Noch wurde bewusst nichts gefixt. Vor Implementierung die
P1/P2-Priorisierung kurz mit dem Nutzer bestätigen; Cofounder-Namespaces weiterhin nicht ohne
Abstimmung anfassen.

Davor zuletzt abgeschlossen: Runden 13–15b (§4p–§4u) — Zuweiser-Anmeldungen mit echten Stammdaten,
Kommunikation & Verlauf als Herzstück (inkl. zweier Korrekturrunden zur Platzierung), Breite/
Auswertung 2-spaltig, die In-Reha-Phase (Aufnahme als Übergabe, nicht Abschluss) und die Board-Zone
„Im Haus". Kein Nutzer-Feature-Request offen.

Abgeschlossene Programme (je Spec + Plan in `docs/superpowers-optimized/`):
Aurora (14.07.) → Lichtung (15.07.) → Jade-Apotheke (16.07., `2026-07-16-jade-apotheke-overhaul.md`)
→ IA-Restrukturierung „Prozess-Achse" (16.07.) → Workflow-Redesign Runden 2–9 (21.–27.07., §4c–§4m)
→ Textbausteine/Zeitleiste/KI-Ehrlichkeit Runden 11–12 (§4o) → Zuweiser/Kommunikation Runden 13–14
(§4p–§4q) → Breite/Verlauf/In-Reha/Board Runden 15/15b (§4r–§4u).

Bekannte offene Kleinigkeiten: Radar-Segment trägt redaktionell doppelte Anlässe
(Teaser-Grid + Feed — bewusst, Null-Verlust); echter Lighthouse-Pass offen;
`#E06845` stockt-Ton auf Lack (3.67:1) beobachten; die drei Beta-Personas-Testläufe für
R14/R15/R15b (Standardprozess seit R9, §4m) stehen noch aus.

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
