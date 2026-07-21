# Workflow-Redesign Runde 3 — Design

**Bezug:** Dritte Korrektur-Runde nach [2026-07-21-ux-feinschliff-runde2-design.md](./2026-07-21-ux-feinschliff-runde2-design.md) (die ihrerseits auf [2026-07-21-strategie-runde-eingang-pflege-design.md](./2026-07-21-strategie-runde-eingang-pflege-design.md) folgte). Beide vorherigen Runden haben das wörtliche Nutzer-Feedback nicht getroffen, weil sie überwiegend kosmetisch (CSS-Rahmen, Pills, Button-Texte, Reihenfolge) statt strukturell gearbeitet haben. Das ist keine Vermutung, sondern gegen den aktuellen Code verifiziert: Runde 2s Punkt 1 (Signal-Pills/Sterne/Button-Text), Punkt 2 (Hero-Reihenfolge), Punkt 3 (Premium-Rahmen) und Punkt 6+7 (Leitungs-Lesebereich, Kurzbericht-Kette) sind alle tatsächlich umgesetzt — siehe die jeweiligen Ist-Abschnitte unten. Was in allen vier Fällen fehlt, ist nicht die Optik, sondern das zugrundeliegende Informationsmodell (Status→Aufgabe, Dashboard-Struktur, Vokabular, Board statt Einzel-Sheet). Diese Spec ersetzt bzw. vertieft die entsprechenden Runde-2-Punkte dort, wo sie zu oberflächlich blieben, und ergänzt drei genuin neue Struktur-Punkte: Zuweiser-Binärmodell mit zahlengetriebener Pflege (Punkt 4), Auflösung von Radar in Zuweiser/Kontakte (Punkt 5), Case-Manager-Protokoll-Board (Punkt 6+7).

**Nicht-Ziel:** Kein neues Backend, kein Build-Prozess, keine Bibliotheken. Harte Projektregeln bleiben unverändert in Kraft: Cofounder-Namespaces (`.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`, `openReferrer`/`closeReferrer`, `#refOverlay`) werden nicht angefasst — mit der seit Runde 2 bestehenden, bewussten Ausnahme, dass `p.kurzbericht` die gemeinsame Quelle für Leitung, Case-Management und das (Cofounder-eigene) Zuweiser-Portal ist. Datenarrays (`faelle[]`, `personen[]`, `zuweiser[]`, `inReha[]`, `eingang[]`) nur additiv erweitern. Jede Änderung bei 390px und 1440px verifizieren, 0 Console-Errors, reduced-motion-safe, nur synthetische Demo-Daten, `escapeHtml` für dynamische Inhalte.

---

## Querschnittsanforderung — Ästhetik-Leitplanke

Gilt für jede in dieser Runde neu gebaute oder umgebaute Oberfläche, nicht nur für einen einzelnen Punkt:

- **Etiketten-System:** Doppelrahmen (Jade-Hairline + Gold-Inset-Ring), Gold-Eckwinkel auf Major-Karten, Radius-Familie 4px. Referenzimplementierung: `#view-fallakte .chap`/`::before`/`::after`, [index.html:3014-3019](../../../index.html#L3014) (Jade-Hairline über `--jade-line`, [index.html:33](../../../index.html#L33); Gold-Eckwinkel über `--brass`).
- **Typografie:** Cormorant Garamond für Display/Numerale (`.serif`/`.kicker`/`.chap-h2`/`.dcap`, [index.html:51](../../../index.html#L51)/[65](../../../index.html#L65)/[67](../../../index.html#L67)/[69](../../../index.html#L69)), Inter für Fließtext/Body (z. B. [index.html:334](../../../index.html#L334)).
- **Token statt Freihand-Farbe:** `--sage-deep` (`#123B33`, Lack-Jade — der strukturelle Dunkelton), `--brass`/`--brass-deep` (`#B99149`/`#7E6230`, Gold — Gold nie als Textfarbe außer `--brass-deep`), Zinnober als `--terra`/`--alert` (`#A8341F`) für Siegel/Stockung/Überfällig. Alle Tokendefinitionen in `:root`, [index.html:20-33](../../../index.html#L20).
- **Referenz-Komponenten:** Board-Karten, Radar-Karten (Foto-Strip via `AR_FOTO`, [index.html:4806](../../../index.html#L4806), Avatar, Dringlichkeits-Pille `.radar-due`), rp-Portal (Cofounder — nur visuelle Referenz, nicht anfassen).
- **Keine nackten Selects/Inputs in Hero-Bereichen.** Genau das ist der verifizierte Ist-Zustand in Punkt 1 (Owner-`<select>`) und Punkt 2 (`dOwner`-`<select>`, `dFrist`-`<input type=date>`) — wird durch gestaltete Chips/Pillen ersetzt.
- **Motion:** Keine neuen Keyframes. Verifiziert genau 9 im gesamten Code: `lift` ([index.html:61](../../../index.html#L61)), `rpDrawC`/`rpDrawP`/`rpRing`/`rpGrow` ([index.html:1066-1097](../../../index.html#L1066)), `cv-travel` ([index.html:1385](../../../index.html#L1385)), `auGrow` ([index.html:2062](../../../index.html#L2062)), `lxSweep` ([index.html:2071](../../../index.html#L2071)), `lxPulse` ([index.html:2114](../../../index.html#L2114)). Neue visuelle Zustände (z. B. „zukünftig" im Werdegang-Stepper) sind statische CSS-Regeln, reduced-motion-safe wie gehabt.

---

## 1. Eingang → Triage-Karte

**Ist:** `renderEingang()`, [index.html:4569-4596](../../../index.html#L4569). Runde 2 ist hier bereits umgesetzt: Signal-Pills (`.pill-a`/`.pill-kt`/`.due`, [index.html:4580-4584](../../../index.html#L4580)), Sterne (`sterneHtml()`, [index.html:4585](../../../index.html#L4585), aus `sterneAusSignal()`), Button-Text „Als Fall anlegen & zuordnen" ([index.html:4590](../../../index.html#L4590)).

Was fehlt:
- Kein strukturierter „Wer"-Block. Die Kopfzeile ([index.html:4571-4577](../../../index.html#L4571)) zeigt nur den rohen Titel-String `m.tit` plus Kanal/Zeit. Das Beziehungsmuster steckt bereits als Fließtext, aber uneinheitlich verteilt: bei manchen Einträgen im `tit`-Feld (z. B. „Anruf: Ehefrau fragt für Mann (72) nach Reha nach Herz-OP", [index.html:4114](../../../index.html#L4114)), bei anderen im `txt`-Feld (z. B. „Familie fragt für Vater (64) nach Intensiv-Reha mit Beatmung." im `txt`-Feld von [index.html:4119](../../../index.html#L4119) — `tit` dort lautet nur „PRIMO MEDICO: internationale Premium-Anfrage") — es gibt keine separaten `name`/`alter`/`rolle`-Felder auf `eingang[]`-Einträgen ([index.html:4113-4122](../../../index.html#L4113)), aus denen sich ein Avatar+Name+Alter+Rolle-Block einheitlich bauen ließe.
- Die Zuordnung ist eine nackte Formularzeile: `<select class='eingang-owner' id='eo-…'>` ([index.html:4590](../../../index.html#L4590)) mit reinem `TEAM.map()`-Loop — keine Vorauswahl, keine sichtbare Begründung.
- `ownerVorschlag(achse)` ([index.html:4204-4210](../../../index.html#L4204), Team-Auslastungs-Logik: wählt aus den für die Achse zuständigen Team-Mitgliedern das mit den wenigsten offenen Fällen) existiert und wird bereits aufgerufen — aber nur im automatischen Hintergrund-Simulationspfad für Demo-Nachrichten ([index.html:4556](../../../index.html#L4556), innerhalb eines `setTimeout`, der bei Sterne ≥ 3 automatisch einen Fall anlegt), nie im interaktiven Eingangs-Karten-Pfad, den die Leitung tatsächlich zum Zuordnen benutzt.
- `erkenneSignale()`/`sterneAusSignal()` ([index.html:4502](../../../index.html#L4502)/[4522](../../../index.html#L4522)) liefern die Rohdaten für Kostenträger/Dringlichkeit bereits — `sig.dringlichkeit` wird aber nur als einzelne Pill gezeigt ([index.html:4583](../../../index.html#L4583)), nie zu einem zusammenhängenden Begründungssatz zusammengesetzt.

**Soll:** Die aufgeklappte Anfrage wird eine echte Entscheidungskarte im Etiketten-Stil statt einer nackten Formularzeile:
- **Wer:** Avatar, Name, Alter, Rolle als natürlicher Satz („Tochter fragt für Vater").
- **Woher:** Kanal + Institution als eigene Zeile.
- **Was:** Programm/Achse-Pill (bestehende `.pill-a`-Optik wiederverwenden).
- **Wie konkret:** Sterne + Klartext-Begründung, die die vorhandenen Signale zu einem Satz zusammensetzt („PKV erkannt · Frist Freitag · konkrete Anfrage").
- Darunter die Zuordnung mit vorausgewähltem Vorschlag inkl. Begründung („Vorschlag: S. Koordination — Achse Innere, geringste Auslastung"), gespeist aus dem bereits vorhandenen `ownerVorschlag()`.

**Erfolgskriterium:** Ohne Klick erkennbar: wer fragt (für wen), woher, was, wie konkret/dringend — plus ein nachvollziehbarer, vorausgewählter Zuordnungsvorschlag mit Begründung, den die Leitung übernehmen oder ändern kann.

---

## 2. Fall-Drawer → echtes Aufgaben-Modell

**Ist:** `#ovDetail`, [index.html:3996-4056](../../../index.html#L3996). Der Hero-Block (`fh-hero`, [index.html:4003-4014](../../../index.html#L4003)) steht bereits ganz oben und enthält den `dAdvance`-Button bereits integriert ([index.html:4011](../../../index.html#L4011)) — Runde 2s Reihenfolge-Umbau ist umgesetzt. Trotzdem bleiben die Hero-Felder nackte Formularelemente statt gestalteter Komponenten:
- `dAufgabe` ist ein reines Text-Input ohne Typ/Icon: `<input id="dAufgabe" class="fh-aufgabe">` ([index.html:4005](../../../index.html#L4005)).
- `dFrist` ist ein natives Datums-Input ohne Ampel-Farbe: `<input id="dFrist" type="date">` ([index.html:4007](../../../index.html#L4007)).
- `dOwner` ist ein nacktes `<select>` mit vier hartkodierten Optionen, kein Personen-Chip ([index.html:4008](../../../index.html#L4008)).

Der eigentliche Kernfehler: `advanceFall()`, [index.html:5856-5863](../../../index.html#L5856), schaltet nur `f.status` weiter (Zeile 5862) und markiert ggf. `f.schritte[cur].done=true` (Zeile 5861) — **`f.aufgabe` und `f.frist` werden nie verändert.** Nach „Erledigt" steht im Hero weiterhin der alte Aufgabentext. Es gibt kein Status→Aufgabe-Modell: `deriveSchritte(f)`, [index.html:5804-5807](../../../index.html#L5804), baut die Werdegang-Schritte ausschließlich aus den STATUS-Labels selbst (`STATUS.slice(0,6)`), ohne je eine zugehörige Aufgabe zu kennen. Das STATUS-Array ([index.html:4074](../../../index.html#L4074)): `["Neu","Kontaktiert","Qualifizierung","Unterlagen","Aufnahme geplant","Aufgenommen","Verloren"]` — `advanceFall()`s Guard `cur>=5` ([index.html:5857](../../../index.html#L5857)) begrenzt automatisches Fortschalten auf genau 5 Übergänge, passend zu den 5 Stufe/Aufgabe-Paaren des Zieldesigns.

Folgefehler durch dieselbe Ursache: `kzActions(f)`, [index.html:5817-5824](../../../index.html#L5817), zeigt den Button „Kostenzusage anfragen" nur, wenn `/kosten/i.test(f.aufgabe)` zutrifft ([index.html:5819](../../../index.html#L5819)) — da `f.aufgabe` nach dem ersten Statuswechsel nicht mehr zum tatsächlichen Stand passt, ist diese Prüfung danach nur noch zufällig richtig.

**Werdegang-Stepper-Bug:** `.stp .dot` füllt jeden Punkt standardmäßig mit `background:var(--ink)` ([index.html:330](../../../index.html#L330)); nur `.stp.done .dot` wird jade ([index.html:331](../../../index.html#L331)); `.stp.current .dot` ändert nur `border-color`/`box-shadow`, nicht den Hintergrund ([index.html:332](../../../index.html#L332)) — zukünftige und aktuelle Punkte sehen am Hintergrund identisch „ausgefüllt" aus. Die JS-Funktion `stepper()`, [index.html:5472-5484](../../../index.html#L5472), berechnet `done`/`current` bereits korrekt pro Schritt (Zeilen 5475-5479) — der Fehler liegt rein in der CSS-Basisregel, nicht in der Logik.

**Soll:**
- Echtes Aufgaben-Modell: jede Werdegang-Stufe bekommt eine Standard-Aufgabe — Neu→Rückruf/Erstkontakt, Kontaktiert→Bedarf qualifizieren, Qualifizierung→Unterlagen anfordern, Unterlagen→Kostenzusage anfragen, Aufnahme geplant→Anreise & Zimmer organisieren.
- „Erledigt" (`advanceFall()`) schaltet Status UND Aufgabe weiter und setzt eine neue Frist — danach steht die nächste Aufgabe im Hero.
- Hero zeigt: Aufgabentyp mit Icon, Kontext, Verantwortlichen als gestalteten Personen-Chip (nicht `dOwner`-Dropdown), Frist mit Ampelfarbe (nicht nacktes Datums-Input).
- Werdegang-Semantik durchgängig: erledigt = Jade gefüllt · aktuell = Gold, deutlich · zukünftig = hohl/blass (CSS-Fix an `.stp .dot`/`.stp.current .dot`, kein JS-Änderungsbedarf an `stepper()` selbst).

**Erfolgskriterium:** Der Hero zeigt sofort Aufgabentyp, Kontext, Verantwortlichen (als Chip) und Frist (Ampel-gefärbt); nach „Erledigt" steht dort die nächste Standard-Aufgabe der Folgestufe, nicht die alte. Der Werdegang unterscheidet erledigt/aktuell/zukünftig eindeutig (jade/gold/hohl).

---

## 3. Vollständige Fallakte → Dashboard statt Textliste

**Ist:** `openFallakte(id)`, [index.html:6379](../../../index.html#L6379): ruft bereits `mtCloseOverlays()` vor `go('fallakte')` — der in Runde 2 diagnostizierte Overlay-Bug (Drawer bleibt offen) ist bestätigt behoben, bleibt unverändert.

`renderFallakte()`, [index.html:6380-6417](../../../index.html#L6380). `faUebersicht` ([index.html:6387](../../../index.html#L6387)) besteht ausschließlich aus `.pa-row`-Label:Wert-Paaren innerhalb `.pa-meta`; ebenso `faMedizin` ([index.html:6398-6407](../../../index.html#L6398)) und der `.pa-meta`-Teil von `faAbrechnung` ([index.html:6409-6412](../../../index.html#L6409), nutzt aber bereits `kzChain(f)` davor wieder, [index.html:6408](../../../index.html#L6408)).

CSS `#view-fallakte .chap` ([index.html:3014-3023](../../../index.html#L3014)): Premium-Doppelrahmen (Jade-Hairline über `--jade-line`, Gold-Eckwinkel) und größere Schrift (`.pa-row{font-size:14.5px}`, [index.html:3021](../../../index.html#L3021)) sind aus Runde 2 bereits vorhanden. Das ist die reine Rahmung außenherum — die Content-Struktur darunter blieb eine Liste. Genau das ist die „kosmetisch statt strukturell"-Lücke: Kopfbereich zeigt nur `faName`/`faSub`/`faAva` als Text ([index.html:6384-6386](../../../index.html#L6384), kein Achse-Pill, keine Sterne), es gibt keine Kennzahl-Kacheln und keine zweispaltige Desktop-Anordnung.

Bereits vorhandene, wiederverwendbare Bausteine für ein Dashboard: `kzChain(f)` ([index.html:5810-5816](../../../index.html#L5810), Kostenzusage-Kette, bereits an zwei Stellen im Einsatz — Drawer `#dKZ` und Fallakte `faAbrechnung`), `sterneHtml()` ([index.html:4717](../../../index.html#L4717)), der Aufgaben-Hero aus Punkt 2.

**Soll:** Kopf mit Status-Band, Kennzahl-Kacheln (Frist-Ampel, Kostenzusage-Kette, Sterne — `kzChain()`/`sterneHtml()` wiederverwenden statt neu bauen), dann die Nächste-Aufgabe-Karte (dieselbe Komponente wie im Drawer-Hero aus Punkt 2), dann auf Desktop zweispaltig: links Werdegang + Verlauf, rechts Stammdaten + Dokumente als Status-Chips. Große Serif-Zahlen statt 10px-Label-Listen als Hauptinhalt.

**Erfolgskriterium:** Die Fallakte liest sich wie ein Dashboard — Kennzahlen auf einen Blick, die nächste Aufgabe prominent, Werdegang und Stammdaten sauber getrennt — keine reine Fließ-Textliste mehr als Hauptinhalt.

---

## 4. Zuweiser-Ansicht → binär + Zahlen erzeugen Aufgaben

**Ist:** `renderZuweiser()`, [index.html:5175-5228](../../../index.html#L5175).

- Vokabular-Fundstellen (alle wörtlich zu entfernen):
  - `lbl`-Map: `{aktiv:"Aktiver Partner",aufbau:"Im Aufbau",ziel:"Ziel-Partner (Landkarte)"}`, [index.html:5176](../../../index.html#L5176), angezeigt auf jeder Karte ([index.html:5216](../../../index.html#L5216)).
  - Z_CATS-Note „Zielkategorie im Aufbau": [index.html:5124](../../../index.html#L5124) (innerhalb Z_CATS-Array, [index.html:5120-5126](../../../index.html#L5120)).
  - Schnellerfassung/Newsletter-Sheet `kpRender()`: Status-Filter-Select mit „Status: aktiv"/„Status: im Aufbau"/„Status: Ziel"/„Status: alle", [index.html:4971](../../../index.html#L4971).
  - Empty-State-Karte: `<span class='zstat ziel'>Zielkategorie</span>…„Zielpartner recherchieren…"`, [index.html:5227](../../../index.html#L5227).
  - Zusätzlich (nicht in der ursprünglichen Liste, aber dieselbe Trichotomie): `naechsteAktion(z)`, [index.html:5136-5142](../../../index.html#L5136), verzweigt auf `z.status==="aktiv"`/`"aufbau"`; `networkDot()` färbt Landkarten-Punkte nach demselben Status, [index.html:5166-5168](../../../index.html#L5166) (Farb-Ternary konkret in Zeile 5168).
- Archiv-Split ist bereits korrekt faktenbasiert (nicht status-basiert) und bleibt unverändert: `primaryFiltered=filtered.filter(z=>z.faelle>=1)` ([index.html:5185](../../../index.html#L5185)), gesteuert über `zArchivAnzeigen`-Toggle ([index.html:5187](../../../index.html#L5187)). Die Runde-2-Spec zitierte hierfür noch Zeilen 5122/5132 — seither um ca. 50 Zeilen verschoben, Logik identisch.
- Sortierung sortiert weiterhin primär nach Status-Eimer, erst sekundär nach Fallzahl: `sort((a,b)=>({aktiv:0,aufbau:1,ziel:2}[a.status]-{…}[b.status])||(b.faelle-a.faelle))`, [index.html:5212](../../../index.html#L5212) — keine reine #1/#2/…-Rangfolge nach Fallzahl.
- `verlaufAusFaellen(z)`, [index.html:4739-4744](../../../index.html#L4739) (Befüllung `z.verlauf3M` bei [index.html:4745](../../../index.html#L4745)): 3-Monats-Verlaufswerte sind für jeden Zuweiser bereits berechnet — keine Sparkline im Markup.
- Trend-Text existiert bereits, aber indirekt über zwei Umwege: `anlaesse()` erzeugt „Kontakt suchen — Rückgang klären"/„Kontakt mit Dankeschön/Bestätigung" ([index.html:4778-4787](../../../index.html#L4778)); `renderZuweiser()` blendet das über eine separate `trendMap` ([index.html:5213](../../../index.html#L5213), gefiltert aus unscoped `anlaesse()`) in `znext` ein, sonst Fallback auf `z.next||naechsteAktion(z)` ([index.html:5225](../../../index.html#L5225)).
- `zAnlaesse`-Block existiert bereits innerhalb von Zuweiser (Div [index.html:3681](../../../index.html#L3681), Befüllung über korrekt gescoptes `anlaesse("zuweiser")`, [index.html:5209-5211](../../../index.html#L5209)) — zeigt aber nur die generische Überschrift „Zuweiser-Anlässe", nicht „Zuweiserpflege — anstehende Gesten".

**Soll:** Binäres Modell statt Dreiklang. „Im Aufbau"/„Ziel-Partner" verschwinden komplett aus der Oberfläche. Sichtbar sind nur aktive Zuweiser (haben real geschickt, `faelle>=1` — bestehende Archiv-Logik bleibt Basis), gerankt #1, #2, … rein nach Fallzahl, mit großer Zahl + 3-Monats-Trend-Sparkline (`verlaufAusFaellen()` liefert die Werte bereits). Jede Karte bekommt ein gestaltetes Pflege-Feld aus den Zahlen: Anstieg → „Bedanken (Anruf/Karte)", Einbruch → „⚠ Nachfassen — Rückgang klären", sonst Rhythmus-Pflege („Quartalsgespräch/Newsletter/Broschüre" je nach Draht-Stärke). Nicht-Aktive bleiben im Archiv-Toggle. Oben in der Ansicht: „Zuweiserpflege — anstehende Gesten" (der bestehende `zAnlaesse`-Block wird zu diesem Baustein, B2B-Radar als Unterpunkt genau hier).

**Erfolgskriterium:** Die Zuweiser-Hauptansicht zeigt ausschließlich aktive Partner, klar nach Fallzahl gerankt (#1, #2, …) mit Trend, und jede Karte trägt einen aus den Zahlen abgeleiteten, konkreten Pflegehinweis — „Im Aufbau"/„Ziel-Partner" kommen in der Oberfläche nicht mehr vor.

---

## 5. Radar löst sich auf — B2B/B2C in Zuweiser/Kontakte, kein eigener Tab

**Ist:** `anlaesse(scope)`, [index.html:4746-4794](../../../index.html#L4746), unterstützt bereits `scope==="patienten"`/`"zuweiser"`-Filterung ([index.html:4790-4793](../../../index.html#L4790), Kommentar „§5.1 B2B/B2C-Trennung"). Zwei Verbraucher nutzen den Scope bereits korrekt:
- `renderZuweiser()`: `anlaesse("zuweiser")`, [index.html:5209](../../../index.html#L5209).
- `renderRadar()`, [index.html:5051-5078](../../../index.html#L5051): `anlaesse("patienten").filter(a=>a.typ!=="wiederbedarf")` für Geburtstage/Jubiläen ([index.html:5065](../../../index.html#L5065)) plus ein eigenes, direkt aus `radar[]` gebautes Grid für Wiederbedarf ([index.html:5066-5077](../../../index.html#L5066)) — dieser Teil (`#radarHost`) ist bereits B2C-rein.

Der eigentliche Fehler liegt woanders: `renderAnlaesse()`, [index.html:4825-4834](../../../index.html#L4825), ruft `anlaesse()` bei [index.html:4827](../../../index.html#L4827) **ungefiltert** auf. Das Ergebnis füllt zwei Stellen:
1. Den Zähler `#rlCount` auf der RADAR-Live-Karte in Heute ([index.html:3598](../../../index.html#L3598), innerhalb `#view-heute`, das laut Sektionsgrenzen [index.html:3057-3616](../../../index.html#L3057) reicht — reiner Zahlen-Teaser, keine Liste).
2. Das Grid `#anlassList`/`#anlassSum` ([index.html:3690-3691](../../../index.html#L3690)) — verifiziert über die Sektionsgrenzen liegt das innerhalb `#sub-netzwerk-radar` ([index.html:3685-3693](../../../index.html#L3685), selbst Teil von `#view-netzwerk`, [index.html:3655-3703](../../../index.html#L3655)), **direkt unter** dem bereits korrekten `#radarHost`. Im Radar-Tab existieren also aktuell zwei Anlass-Widgets übereinander: eines B2C-rein (`radarHost`/`renderRadar()`), eines weiterhin gemischt B2B+B2C (`anlassChap`/`anlassList`/`renderAnlaesse()`, Top-3 aus allen Typen inkl. `zuweiser`/`zuweiser-trend`). Das ist die konkrete Fundstelle der Vermischung.

`SEGS.netzwerk`, [index.html:6313](../../../index.html#L6313): `["zuweiser","radar","kontakte"]` — Radar ist ein aktiver Sub-Tab (Segment-Button [index.html:3661](../../../index.html#L3661)). Alias-Konvention bereits etabliert in `applyHash()`, [index.html:6362-6374](../../../index.html#L6362) — z. B. `#netzwerk/bestand`→`netzwerk/kontakte` ([index.html:6368](../../../index.html#L6368)). Für `#netzwerk/radar` existiert noch **kein** Alias.

Weitere direkte `go('netzwerk','radar')`-Aufrufstellen, die beim Entfernen des Sub-Tabs mitgeprüft werden müssen:
- RADAR-Live-Karte in Heute, [index.html:3598](../../../index.html#L3598).
- `setDbView(v)`, [index.html:4705](../../../index.html#L4705): `go("netzwerk",v==="radar"?"radar":"kontakte")`.
- `MATRIX`-Konfigurationszeile „Nachsorge & Radar", [index.html:4170](../../../index.html#L4170): `route:["netzwerk","radar"]`. Das `MATRIX`-Array selbst ist kein `.mx-*`-CSS-Namespace, sondern gemeinsame App-Konfiguration, die auch die Cofounder-Matrix-Darstellung mit Routen verknüpft — die Matrix-Kachel-Optik bleibt unangetastet, aber dieses Routen-Datenfeld zeigt auf eine App-Route, die nach Entfernen des Radar-Sub-Tabs anders aufgelöst werden muss. Bei Umsetzung prüfen, nicht Teil dieser Spec-Entscheidung.

**Soll:** Radar wird kein eigenständiger Tab mehr. Patienten-Anlässe (Geburtstage, Jubiläen, Wiederbedarf) ziehen als Unterpunkt in Kontakte (Bestand-Ansicht, `renderBestand()`); Zuweiser-Gesten stecken in Zuweiser (Punkt 4, bereits als `zAnlaesse` vorhanden). Der Heute-Feed zeigt die zwei Welten nur noch klar getrennt in zwei beschrifteten Reihen — nie in einer gemischten Liste. Alte Route `#netzwerk/radar` leitet auf Kontakte um (Alias in `switchTab()`/`applyHash()`-Konvention; `SEGS.netzwerk` anpassen).

**Erfolgskriterium:** Es gibt keinen Radar-Tab mehr; Patienten-Anlässe stecken in Kontakte, Zuweiser-Anlässe in Zuweiser. Alte `#netzwerk/radar`-Links landen automatisch auf Kontakte. Nirgends mehr eine Liste, die B2B und B2C mischt.

---

## 6+7. Case-Managerin → Protokoll-Board (ma-mode)

**Ist:** `ma-mode`-Gate-CSS, [index.html:1609-1611](../../../index.html#L1609) (Absichts-Kommentar direkt darüber, [index.html:1608](../../../index.html#L1608): „ma-mode blendet die komplette Leitungs-Chrome nur per CSS aus"): `body.ma-mode .dsidebar,…,#rpToast{display:none}` (1609), `body.ma-mode .view:not(#view-meintag){display:none}` (1610), `body.ma-mode #view-meintag{display:block}` (1611) — im Mitarbeitermodus ist ausschließlich `#view-meintag` sichtbar, jede Navigation (Sidebar, Topbar, Tabbar) ist ausgeblendet. Es gibt aktuell **keinen zweiten Bereich** und keine Navigation zu einem „Protokolle"-Bereich innerhalb von ma-mode.

Bereits umgesetzt und unverändert zu lassen:
- Leitungs-Lesebereich ist bereits reiner Read-Only: `rsErfolg` ([index.html:5660-5667](../../../index.html#L5660)) zeigt `p.kurzbericht` nur als Text ([index.html:5665](../../../index.html#L5665)); `rsWirt` ([index.html:5669-5685](../../../index.html#L5669)) enthält keinen `bill.empf`-Block mehr — verifiziert per Volltextsuche: 0 Treffer für `bill.empf` im gesamten Code, die Runde-2-Entfernung ist bestätigt vollzogen; `rsZwischenstand` ([index.html:5688-5692](../../../index.html#L5688)) zeigt nur noch Metadaten „Kurzbericht zuletzt aktualisiert" + Datum/Autor, kein Eingabefeld mehr.
- Schreibkette bereits vereinheitlicht: `rsSaveZwischenstand(i)`, [index.html:5700-5709](../../../index.html#L5700), schreibt direkt in `p.kurzbericht` ([index.html:5703](../../../index.html#L5703)) und aktualisiert nur `zwischenstand.datum`/`.autor` als Metadaten (Zeilen 5704-5705) — dieselbe Quelle, die `rsErfolg` (Leitung, [index.html:5665](../../../index.html#L5665)) und `.rp-kurz` (Zuweiser-Einblick-Tab, [index.html:5558](../../../index.html#L5558)) lesen. **Klarstellung:** `rpDoc('kurzbericht',…)` ([index.html:5567-5595](../../../index.html#L5567), Aufruf u. a. [index.html:5616](../../../index.html#L5616)) liest **nicht** `p.kurzbericht` — dessen `kurzbericht`-Zweig rendert `d.kurz`, wobei `d=entlassDoc` ([index.html:5572](../../../index.html#L5572)) ein statisches Demo-Dokument für den fiktiven „Werner Adler" ist ([index.html:4181](../../../index.html#L4181)), unabhängig von `inReha[]`. Der Code-Kommentar [index.html:5697-5699](../../../index.html#L5697) nennt entsprechend auch nur `rsErfolg` und `.rp-kurz` als Leseziele. `rpDoc`/`.rpd-*` ist Cofounder-Namespace und bleibt außerhalb dieser Spec.

Die eigentliche Lücke: `zwischenstandFaellig(p)`, [index.html:6088-6093](../../../index.html#L6088) — fällig = Datum nie gesetzt ODER älter als 10 Tage (`d<-10`). `mtZwischenstandItem(p,idx)`, [index.html:6094-6098](../../../index.html#L6094), und dessen Einsatz in `mtTodos()` ([index.html:6116](../../../index.html#L6116): `inReha.forEach((p,idx)=>{if(zwischenstandFaellig(p))jetzt.push(…)})`) erzeugen genau **ein** Mein-Tag-Reminder-Item pro überfälligem Patienten. Patienten, die noch nicht überfällig sind, tauchen nirgends auf — es gibt keine Stelle, an der alle `inReha[]`-Patienten gemeinsam sichtbar sind. Editiert wird ausschließlich einzeln über `mtSheetRender()`s Zwischenstand-Zweig ([index.html:6233-6235](../../../index.html#L6233): ein Kurzbericht-Textarea) — kein Board, keine Zeilen-Übersicht an einem Ort für die Teamsitzung.

**Soll — Verortung (festgeschriebene Design-Entscheidung):** Das Board wird **kein neuer Top-Level-`.view`** und ändert die ma-mode-Gate-Logik ([index.html:1609-1611](../../../index.html#L1609)) **nicht**. Begründung: ma-mode blendet die komplette Navigations-Chrome aus (Sidebar, Topbar, Tabbar) — ein neuer Menüpunkt oder eine neue Route wäre dort unerreichbar bzw. bräuchte eine eigene Sonderbehandlung im Gate. Stattdessen: eine kleine Segment-Leiste innerhalb von `#view-meintag` ganz oben — zwei Reiter „Mein Tag" | „Protokolle" (eigener Namespace, z. B. `.mtp-*`), die zwei Sektionen innerhalb derselben View per einfachem `classList`-Toggle umschalten. Kein Routing-Eintrag, kein `SEGS`-Eintrag, kein Hash — reines Client-State-Toggle wie ein einfacher Tab-Umschalter.
- Inhalt des „Protokolle"-Reiters: alle In-Reha-Patienten als strukturierte Zeilen für die Teamsitzung — Patient (Avatar, Achse, Tag X/Y), ein Kurzbericht-Feld (vorbefüllt mit `p.kurzbericht`, direkt editierbar), „zuletzt aktualisiert" mit Fällig-Ampel (`zwischenstandFaellig()` wiederverwenden), Speichern pro Patient (schreibt weiterhin in `p.kurzbericht` — die bestehende Kette zu `rsErfolg`/`.rp-kurz` bleibt unverändert, siehe Ist oben).
- Der Mein-Tag-Zwischenstand-Reminder wechselt beim Klick auf den „Protokolle"-Reiter (statt ein eigenes Sheet zu öffnen).
- Rückweg = derselbe Reiter zurück zu „Mein Tag"; `mtExit` bleibt unverändert der einzige Ausstieg aus ma-mode.
- Leitungs-In-Reha-Overlay bleibt reiner Lesebereich (bereits umgesetzt, siehe oben — keine Änderung).

**Erfolgskriterium:** Die Case-Managerin sieht in ma-mode alle In-Reha-Patienten als Zeilen mit editierbarem Kurzbericht und Fällig-Ampel an einem Ort, erreichbar über einen Reiter innerhalb derselben View (kein neuer Menüpunkt, keine neue Route); Speichern schreibt weiterhin in `p.kurzbericht`, das Leitung und Zuweiser-Portal unverändert lesen. Der Mein-Tag-Reminder wechselt auf diesen Reiter statt ein eigenes Sheet zu öffnen.

---

## 8. Mitarbeiter-Aufgaben-Sheet → mit Fall-Kontext

**Ist:** `mtSheetRender()`, [index.html:6212-6247](../../../index.html#L6212). Der Kopfbereich (`mt-shead`, [index.html:6241-6243](../../../index.html#L6241)) zeigt nur Avatar + Name + Typ-Label (`MT_TYP_LABEL`, [index.html:5991](../../../index.html#L5991)) + Fällig-Pille — keine Achse/KT-Pills, keine Status-Zeile, keine Verlaufsauszüge.

Typspezifisches Eingabefeld existiert bereits (Runde 2, bestätigt): `notizBody` ([index.html:6230-6232](../../../index.html#L6230)) zeigt Notiz-Textarea für rueckruf/angebot/eingang/allgemein (`MT_NOTIZ_LABEL`, [index.html:5992](../../../index.html#L5992)), zusätzlich Kosten-Status-Select für `kosten` ([index.html:6231](../../../index.html#L6231)). `mtAbschliessen(key)`, [index.html:6248-6275](../../../index.html#L6248), schreibt die eingegebene Notiz bereits ins Fall-Protokoll (`f.log`, generischer Zweig [index.html:6268](../../../index.html#L6268)) statt generischem Text — bereits Runde-2-Stand, nicht neu zu bauen.

**Korrektur (Leitfaden nicht einklappbar):** Schritte/Leitfaden werden aus `MT_SCHRITTE`/`MT_LEITFAEDEN` geholt ([index.html:5993](../../../index.html#L5993)/[6003](../../../index.html#L6003), Lookup bei [index.html:6220-6221](../../../index.html#L6220)) und bei [index.html:6237-6238](../../../index.html#L6237) gerendert — sie sind **statisch immer sichtbar, nicht einklappbar**. Verifiziert: `.mt-ssteps`/`.mt-sleitfaden` ([index.html:1650-1654](../../../index.html#L1650), [1873](../../../index.html#L1873), [2597-2599](../../../index.html#L2597)) sind reine Typografie-/Rahmen-Styles ohne Collapse-Mechanik; kein `<details>`-Element, kein Toggle-JS, kein Collapse-CSS.

Was fehlt: derselbe generische Zweig ([index.html:6266-6270](../../../index.html#L6266)) endet mit `item.ref.aufgabe="";item.ref.frist="";` ([index.html:6269](../../../index.html#L6269)) — er **leert** die Aufgabe, statt sie auf die nächste Stufen-Aufgabe zu setzen, aus demselben Grund wie in Punkt 2: es existiert kein Status→Aufgabe-Modell, aus dem sich die nächste Aufgabe ableiten ließe. `mtNext()` ([index.html:6276-6281](../../../index.html#L6276)) springt danach zum nächsten offenen Mein-Tag-Item — das ist die nächste Aufgabe irgendeines Falls in der Warteschlange, nicht zwingend die nächste Aufgabe desselben Falls.

**Soll:** Das Mitarbeiter-Sheet (`mtSheetRender`) zeigt oben eine Mini-Fallakte (Avatar, Name, Achse/KT-Pills, Status-Zeile, letzte 2 Verlaufseinträge), dann die klare Aufgabe mit Typ-Icon, **neu: einklappbarem Leitfaden** (aktuell statisch immer sichtbar, siehe Ist — wird zu echtem Collapse/Toggle), und dem typspezifischen Arbeitsfeld (Notiz/Kostenstatus — existiert bereits, siehe oben). Nach Erledigt erscheint die nächste Aufgabe **des Falls** (gekoppelt an das Aufgaben-Modell aus Punkt 2, nicht an die allgemeine Mein-Tag-Warteschlange von `mtNext()`).

**Erfolgskriterium:** Das Aufgaben-Sheet zeigt oben eine Mini-Fallakte (wer, Achse/KT, Status, letzte Einträge); nach Abschluss einer Aufgabe erscheint direkt die nächste Aufgabe desselben Falls.

---

## Nicht-Ziele dieser Runde

- Keine Änderung an `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`-Namespaces oder `openReferrer`/`closeReferrer`/`#refOverlay` (verifiziert vorhanden: [index.html:3957](../../../index.html#L3957)/[5504](../../../index.html#L5504)/[5512](../../../index.html#L5512)) — Ausnahme unverändert: `p.kurzbericht` bleibt die bewusst gemeinsame Quelle, die `rp` liest.
- Datenarrays (`faelle[]` [index.html:4082](../../../index.html#L4082), `eingang[]` [index.html:4113](../../../index.html#L4113), `zuweiser[]` [index.html:4149](../../../index.html#L4149), `inReha[]` [index.html:4288](../../../index.html#L4288), `personen[]` [index.html:4331](../../../index.html#L4331)) nur additiv erweitern — vor dem Entfernen eines Feldes (z. B. bei Punkt 6+7 oder 8) prüfen, ob andere Stellen es lesen, nicht annehmen.
- Kein neuer Radar-eigener Datentyp und keine neue Detail-Akte für Anlässe — die bestehenden Bausteine `arCard()`, `anlaesse()`, `AR_TYP`/`AR_FOTO` werden verlagert und wiederverwendet, nicht neu erfunden.
- Keine neuen Keyframes — die bestehenden 9 müssen ausreichen; neue visuelle Zustände (z. B. „zukünftig" im Stepper) sind statische CSS-Zustände, keine Animation.
- Keine Änderung an der Matrix-Kachel-Darstellung selbst (Punkt 5s Hinweis auf `MATRIX`-Zeile 4170 betrifft nur ein Routen-Datenfeld, nicht die `.mx-*`-Präsentation).
- Jede Änderung bei 390px UND 1440px verifizieren, 0 Console-Errors, reduced-motion-safe, nur synthetische Demo-Daten, `escapeHtml` für dynamische Inhalte.
