# HANDOVER — Klinik Bavaria · Concierge OS

**Für:** neuer Thread mit Fable-als-Orchestrator (delegiert an `claude-implementer` / `claude-implementer-pro`, konsultiert `fable-advisor`) — **oder den Cofounder**, der die nächste Aufgabe (§7) direkt übernimmt.
**Stand:** `main` = `dd4ff70`, live. Datum des Handovers: 2026-07-14 (ursprünglich 2026-07-09, §4b/§7 aktualisiert).

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

## 7. NÄCHSTE AUFGABE (beauftragt & designt — bereit zur Umsetzung)

**Mitarbeiter-Dashboard „Mein Tag"** — Perspektivenwechsel vom Manager-Cockpit zur
geführten Arbeitsansicht für EINE Person (S. Koordination). Design ist vom User
freigegeben, Spec ist gegen den echten Code reviewt (1 Runde, Befunde eingearbeitet):

→ **`docs/superpowers-optimized/specs/2026-07-14-mitarbeiter-dashboard-design.md`**

Kern in drei Sätzen: (1) Rollen-Umschalter am Topbar-Avatar (`.dt-ava`) setzt
`body.ma-mode`; additives CSS blendet dsidebar/tabbar/dtopbar/alle Views aus, nur
neue View `#view-meintag` (.mt-*) bleibt — Desktop-Feature, Mobile-Einstieg bewusst
nicht. (2) `mtTodos()` leitet To-Dos zur Laufzeit ab (SK-Fall-Aufgaben, Kostenklärung,
qualifizierter Eingang) — Blöcke JETZT / HEUTE / GUT ZU WISSEN, Fortschrittsleiste;
ein zusätzlicher Seed-Fall (Werner Aumann, Unterlagen, kosten offen) macht den Typ
„Kostenklärung" real. (3) Jedes To-Do öffnet eine geführte Arbeitskarte
(WARUM JETZT · SO GEHST DU VOR · LEITFADEN aus `MT_LEITFAEDEN` · Abschluss-Button,
der echt mutiert: log/kosten/aufgabe) mit „Weiter zur nächsten →".

Erwartete Abnahme-Zahlen (nach Auto-Inbound, ~5 s nach Laden): JETZT = 2,
HEUTE/WOCHE = 5, GUT ZU WISSEN = 1, Fortschrittsnenner 7. Details + Optik-Mandate
(radar-card-Familie etc.) stehen in der Spec §5–6.

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
