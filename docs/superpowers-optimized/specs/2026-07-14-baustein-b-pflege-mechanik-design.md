# Spec — Baustein B: Pflegen wird Mechanik (Sterne · Anlass-Radar · Kampagnen)

**Datum:** 2026-07-14
**Datei:** `index.html` (single self-contained, inline CSS/JS)
**Rahmen:** Zielbild-Spec §4.3/§7B. Baut auf Baustein A auf (personen[]-Registry, live seit `944c2f1`).
**Anlass:** User-Auftrag „zieh B durch" + NEUE Anforderung der Klinik-Kollegen: 5-Sterne-Klassifikation (Hotel-Logik) ersetzt die A/B/C-Einstufung; Anlass-Aktionen skalieren mit der Sterne-Kategorie.
**Status:** Vertrag vom `fable-advisor` geprüft — **Go mit Auflagen**, alle eingearbeitet (sauberer Schnitt statt TIERS-Parallelführung, nHot-Neudefinition, stabile Anlass-Keys, Heute-Grid-Regel, sterneGrund, Einwilligungs-Präzisierung).

## 1. Ziel

Die App erinnert von sich aus an Beziehungsarbeit (Bring-System): Ein **Anlass-Feed** zeigt Geburtstage, Wiederbedarfs-Termine und überfällige Zuweiser-Kontakte — mit der zur **Sterne-Kategorie passenden Geste** (5★-VIP → Geschenk; 3★ → Karte/Anruf; 1★ → nichts). Die Kontakt-Datenbank wird auf die **5-Sterne-Klassifikation der Kollegen** umgestellt. Ein **Kampagnen-Workflow** erzeugt aus der Zuweiserdatenbank Newsletter (Segment → Entwurf → Premium-Vorschau → Demo-Versand mit Protokoll).

**Design-Messlatte (verbindlich, Teil der Abnahme):** Referenz sind Konvergenz-Hero und Zuweiserportal — nicht „rendert korrekt". Konkret: Sterne als Messing-Glyphen (★ in `--brass`, leer `--brass-line`), NIEMALS Emoji. Anlass-Karten im Duktus der Akte v2 (Messing-Akzent, Cormorant-Momente, Ein-CTA-Politik). Newsletter-Vorschau sieht aus wie ein edles Klinik-Mailing (Espresso-Kopf, Cormorant-Titel, Gold-Akzente), nicht wie ein Formular. Abnahme = Screenshot-Vergleich gegen die besten Screens der App.

## 2. Die 5-Sterne-Klassifikation (ersetzt A/B/C vollständig)

### 2.1 Definition (Kriterien wörtlich von den Kollegen)

```js
const STERNE={
 5:{label:"Heißester Lead — Wiederkehr / VIP",
    note:"War bereits da & begeistert · aktiver Selbstzahler/Privatpatient · hat aktiv weiterempfohlen",
    auto:"Persönliche Betreuung durch Recovery Manager · bevorzugte Terminvergabe",
    geste:"Geschenk (Stift, Visitenkarte, persönliche Note)"},
 4:{label:"Sehr qualifiziert — Selbstzahler mit Interesse",
    note:"Noch nie da, aber Selbstzahler bestätigt · konkretes Gespräch, echter Bedarf · Angehöriger mit Entscheidungsauftrag",
    auto:"Persönlicher Rückruf + Wiedervorlage",
    geste:"Handgeschriebene Karte + persönlicher Anruf"},
 3:{label:"Qualifiziert — Interesse vorhanden",
    note:"Privat- oder Kassenpatient mit Zusatzversicherung · Gespräch geführt · aktiv recherchierender Angehöriger",
    auto:"Wiedervorlage + Infopaket",
    geste:"Karte oder Anruf"},
 2:{label:"Schwacher Lead — wenig Signale",
    note:"Nur Broschüre heruntergeladen · kurze Anfrage ohne konkrete Details",
    auto:"Automatische Info-/Newsletter-Strecke",
    geste:"Gruß im Newsletter"},
 1:{label:"Nicht qualifiziert — kein Potenzial",
    note:"Nie erreicht · falsche Zielgruppe · reiner Kassenpatient · hat explizit abgesagt",
    auto:"Keine aktive Pflege · Datenhygiene",
    geste:null}
};
const STERNE_ORDER=["5","4","3","2","1"];
```

**Typ-Vertrag (kritisch):** `bucketOf()` v2 gibt Strings zurück (`"5"`…`"1"`, `"gesperrt"`); darum ist `STERNE_ORDER` ein STRING-Array — das bestehende Gruppierungs-Idiom (`filter(p=>bucketOf(p)===g)`) vergleicht strikt, `"5"===5` wäre `false` und alle Gruppen stumm leer. Zugriff auf die Definition per `STERNE[g]` funktioniert mit String-Keys (JS-Objekt-Keys sind Strings). In der gesamten Implementierung gilt: Bucket-Werte sind Strings; `personen[].sterne` bleibt Number (1–5); Übergang ausschließlich in `bucketOf`/`sterneVon` via `String(...)`.

### 2.2 Datenvertrag

- `sterne:1..5` und `sterneGrund:"<kurze Begründung>"` werden **additiv auf `personen[]`** ergänzt (Personen-Attribut: VIP-Status gehört zum Menschen, nicht zum Listen-Eintrag). Kuration je Seed als Tabelle im Plan; `sterneGrund` beantwortet die Mitarbeiter-Frage „warum 5★?" (z. B. „War 2025 in Premium-Reha, hat 2 Empfehlungen gebracht"). „Hat weiterempfohlen" wird als `historie`-Eintrag (`typ:"kontakt"`) belegt, kein eigenes Flag.
- `pNew()`-Default: `sterne:2, sterneGrund:"Neu erfasst — noch nicht qualifiziert"`.
- **Sauberer Schnitt (Advisor-Auflage):** `TIERS`, `TIER_ORDER`, `tierFilter` werden ERSETZT (→ `STERNE`, `STERNE_ORDER`, `sterneFilter`); die `tier:"A|B|C"`-Felder werden aus den `bestand[]`-Literalen UND aus `inDatenbank()` GELÖSCHT. Keine Parallelführung, kein toter Vertrag. (bestand[] ist Claude-Bereich, kein Cofounder-Konsument — verifiziert.)
- `bucketOf(p)` v2: `p.consent!=="ja"` → `"gesperrt"`; sonst `String(sterneVon(p))` mit `sterneVon(p)= p.personId && person(p.personId) ? person(p.personId).sterne : 2`.
- **Konsent bleibt orthogonal:** „Gesperrt" (keine/widerrufene Einwilligung) ist eigene Gruppe unabhängig von Sternen. 1★ ist eine Potenzial-Aussage, kein Rechts-Status. P25 (Widerruf) bleibt gesperrt, egal welcher Stern.
- `nHot`/„Handlungsbedarf" (dbCockpit) NEU definiert: `consent==="ja" && sterne>=4`. „kontaktfähig" bleibt `consent==="ja"`.
- **Verboten (Advisor-Auflage):** Die toten Alt-CSS-Klassen `.tier-pill.s1–s5`, `.stufe-badge.s1–s5`, `.tbadge.*` dürfen NICHT wiederverwendet werden — neue Klassen im eigenen Namespace (`.st-*` für Sterne-Darstellung).
- Sterne-Renderer: `sterneHtml(n)` → 5 ★-Glyphen, gefüllt in `--brass`, leer in `--brass-line`/`--hair`, `aria-label="n von 5 Sternen"`.

### 2.3 Betroffene UI (vollständige Konsumenten-Liste, auditiert)

`dbCockpit()` (Verteilungs-Balken: 5 Segmente 5★→1★ + Gesperrt, neue Legende, Handlungsbedarf neu), `renderBestand()` (Filter-Chips Alle/5★…1★/Gesperrt; Gruppen in `STERNE_ORDER`-Reihenfolge mit `sterneHtml`-Kopf, label/note/auto aus `STERNE`), `openDbDetail()` („Einstufung"-Zeile → Sterne + label + `sterneGrund`), `autoFor()` (liest `STERNE[sterneVon(b)].auto`), `paAkte()` (Akte-Kopf zeigt `sterneHtml(p.sterne)` neben Lebenszyklus-Pill). Die dbc-Segment-Farben werden auf eine Messing-Abstufung umgestellt (5★ kräftig → 1★ blass; Gesperrt neutral-grau), Details im Plan.

## 3. Anlass-Engine (`.ar-*`)

### 3.1 Ableitung — keine gespeicherten Anlässe

`anlaesse()` berechnet zur Renderzeit (n=25 Personen + 11 Zuweiser, trivial performant) eine sortierte Liste aus drei Quellen:

- **(a) Geburtstage:** `personen[]` mit `geb`, `paGeb(...).tage<=30`, `sterne>=2`, Einwilligung erlaubt Ansprache. Aktion = `STERNE[sterne].geste`. Dringlichkeit: ≤7 Tage „jetzt", sonst „bald".
- **(b) Wiederbedarf/Jubiläum:** `radar[]`-Einträge (bestehende Logik `faelligInTagen`: ≤45 „jetzt", ≤120 „bald") — **Sterne skalieren hier nur die GESTE, nie ob der Anlass erscheint** (medizinischer Wiederbedarf ≠ Potenzial; Advisor-Klarstellung).
- **(c) Zuweiser-Rhythmus:** Kadenz je `status` als Konstante `AR_RHYTHMUS={aktiv:45,aufbau:30,ziel:60}` (Tage) gegen `zuweiser.letzter`. **`letzter===""` gilt als überfällig** (Advisor-Auflage — betrifft Helios, Reha-Technik). Aktion aus `zuweiser.next` (Freitext existiert). KEIN neues Feld auf `zuweiser[]`.

### 3.2 Einwilligungs-Gates (Präzisierung des Advisors)

Geschenk/Karte nur wenn `einwilligung.zwecke` enthält `"post"`; Anruf genügt `einwilligung.status==="erteilt"`; Newsletter-Gruß braucht `"newsletter"`. **Abstufungs-Leiter nur für 3★–5★:** Erfüllt eine 3★–5★-Person das Gate ihrer Sterne-Geste nicht, wird abgestuft (Geschenk → Anruf → nichts); ohne jede Erlaubnis erscheint kein Geburtstags-Anlass. **2★ eskaliert NIE:** Fehlt einer 2★-Person der `newsletter`-Zweck, entfällt der Anlass ersatzlos — ein „schwacher Lead" bekommt niemals einen persönlichen Anruf-Vorschlag (2★ = ausschließlich automatisierte Strecke). 1★ erzeugt nie Geburtstags-Anlässe.

### 3.3 Aktionen (Demo-Rahmen)

Jede Anlass-Karte hat EINEN CTA („Geschenk vormerken", „Anruf planen", „Kontakt aufnehmen"). Klick = Demo: `pHist(pid,"kontakt",…)` bzw. `zuweiserEvents.push({…typ:"gespraech"|…})` + Toast (bestehendes `inbToast`-Muster) + Anlass gilt als erledigt. Erledigt-Zustand: Laufzeit-Set `_arDone` mit **stabilen Keys** (`"geb:P14"`, `"radar:P21"`, `"zuw:Leopoldina-Krankenhaus"`) — niemals Array-Indizes (Advisor-Auflage). Kein Persistieren (Pilot-Rahmen).

### 3.4 UI-Flächen

- **Heute-View:** neue full-width Sektion „Anlässe" — der Concierge-Moment. Zeigt die Top-3-Anlässe als Premium-Karten (`.ar-card`: Messing-Akzent, Anlass-Typ als Kapitälchen, Person/Zuweiser mit Sternen, Geste als CTA) + Kopfzeile im Stil „Heute: 2 Geburtstage · 1 Wiederbedarf · 1 Zuweiser wartet". **Einbau-Regel (Advisor-Auflage wegen Grid-Kollision Zeile 1389):** DOM-Einfügung als eigene `.chap` mit `id="anlassChap"` VOR der `ns-card` (nicht vor „Heute wichtig"); Vollbreite über eigene ID-Regel `#anlassChap{grid-column:1/-1}`, NICHT über die `:last-of-type`-Mechanik.
- **Netzwerk → Datenbank → Radar-Tab** wird zu **„Radar & Anlässe"**: voller Anlass-Feed (alle, gruppiert nach Dringlichkeit jetzt/bald/beobachten), die bestehenden Radar-Karten werden um Sterne + gestenbewussten CTA erweitert (`radarPlan`-Alert wird durch die Anlass-Aktion ersetzt).
- `renderWichtig()` bleibt Fälle-fokussiert (kein Umbau).

## 4. Kampagnen-Workflow (`.kp-*`)

Einstieg: CTA „✉ Newsletter erstellen" im Kopf von Netzwerk → Zuweiser. Drei Schritte in einem Overlay/Panel (bestehende Overlay-Muster, KEIN neues `data-nav`):

1. **Segment wählen:** Zuweiser nach Kategorie (`Z_CATS`) und/oder Status (aktiv/aufbau/ziel); zusätzlich Patienten-Segment „Altpatienten & Kontakte ab 3★ mit Newsletter-Einwilligung" (liest `personen[]`: `sterne>=3 && zwecke enthält "newsletter"`). Live-Zähler „N Empfänger".
2. **Entwurf:** wird aus den Daten generiert — Bausteine aus `portalNews` (existiert: neue Suiten, AHB-Fast-Lane, EPZ-Modul) + Anrede je Empfänger (`rpPersona`-Muster für Zuweiser, `person.name` für Patienten). Betreff + 2–3 Bausteine an-/abwählbar.
3. **Premium-Vorschau + Demo-Versand:** Vorschau als edles Mailing (Espresso-Header mit Wortmarke, Cormorant-Titel, Gold-Trennlinien, Fußzeile mit Abmelde-Hinweis — Design-Messlatte §1). „Versand" = Demo: Toast „N Newsletter versendet (Demo)", je Zuweiser-Empfänger `zuweiserEvents.push({typ:"newsletter"})`, je Patienten-Empfänger `pHist(pid,"kontakt","Newsletter …")` — der Versand ist danach in Akten und Zuweiser-Historie nachvollziehbar.

## 5. Constraints (HARTE REGELN + Projekt-Erfahrung)

1. Cofounder-Bereiche tabu: `renderMatrix`, `openReferrer`/`#refOverlay`, `.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`. `rpPersona` darf gelesen/aufgerufen, nie verändert werden.
2. Geteilte/fremde Daten: `inReha[]` unangetastet; `zuweiser[]`-Feldnamen sind Vertrag (nur lesen; `zuweiserEvents` ist unser und darf wachsen); `radar[]`-Feldnamen bleiben.
3. Nur synthetische Daten; kein echter Versand.
4. CSS additiv in `.st-*`/`.ar-*`/`.kp-*` vor `</style>`; verbotene Alt-Klassen s. §2.2; Animationen reduced-motion-safe (Startzustand nur im Keyframe-`from`).
5. Beide Breiten (390/1440): 0 Console-Errors, 0 Overflow.
6. Sync-Wache je Lane-Task (ProtonDrive): Hash-Vergleich Arbeitskopie vs. HEAD nach Commit; „Edit conflict"-Dateien = STOPP.

## 6. Verifikation (Pflicht vor „fertig")

1. **Heute @1440:** Anlass-Sektion sichtbar VOR der Nordstern-Karte, Vollbreite, Grid intakt (ns-card + „Heute wichtig" weiter nebeneinander); Top-Anlass = Margarete Wirth (5★, Geburtstag, Geschenk-CTA — sofern kuratiert).
2. **Datenbank:** Gruppen 5★→1★ + Gesperrt mit Messing-Sternen; Verteilungs-Balken + neue Legende; Filter-Chips funktionieren; `openDbDetail` zeigt Sterne + Grund; kein „A · Warm"-Text mehr irgendwo (`grep`-Beleg).
3. **Radar & Anlässe:** Feed gruppiert jetzt/bald/beobachten; Zuweiser ohne `letzter` (Helios) erscheint als überfällig; Aktion-Klick erzeugt Historie-Eintrag + Toast und lässt den Anlass verschwinden; P25 (Widerruf) erzeugt KEINEN Geburtstags-/Geschenk-Anlass.
4. **Gesten-Gates:** 5★ mit `post` → Geschenk-CTA; 5★ ohne `post` aber erteilt → Anruf-CTA; Person ohne Erlaubnis → kein Geburtstags-Anlass.
5. **Kampagne:** Segment „Aktive Krankenhäuser" → Zähler stimmt; Vorschau im Mailing-Design; Demo-Versand erzeugt `zuweiserEvents`-Einträge (im Zuweiser sichtbar, sofern gerendert) und Toast; Patienten-Segment respektiert `sterne>=3` + Newsletter-Zweck.
6. **Akte:** `paAkte` zeigt Sterne; Live-Flow `simulateInbound` (Herr Reinhardt) → Akte mit 2★-Default.
7. **Cofounder-Gegenprobe:** Matrix 6 Zellen, `openReferrer` alle 3 Tabs, `rsp`-Charts.
8. **Qualität:** 0 Console-Errors, 0 Overflow @390/@1440; Screenshots gegen Design-Messlatte §1 (Abnahme-Kriterium).

## 7. Nicht-Ziele

- Kein echter E-Mail-/Post-Versand, keine Persistenz von `_arDone`.
- Kein UI zum manuellen Hoch-/Abstufen der Sterne (Ein Satz Vertrag: Um-Einstufung erfolgt durch Mitarbeiter-Entscheid und kommt mit der Arbeitstiefe in Baustein D).
- Kein Belegungs-Forecast (C), keine Therapie-App.
- `renderWichtig`, Fall-Board, Eingang, Team-View: unangetastet.
- Tote Altlasten (`.tbadge`, `.tier-pill.s1-s5`, `passivLead`, `mxMetric`) bleiben stehen — nur dokumentiert.

## 8. Umsetzungshinweis (für den Plan)

Bestehende lebende Struktur-CSS-Klassen (`.tier-chips`, `.tchip`, `.db-group*`, `.dbc-*`) behalten ihre Namen und werden weiterverwendet — nur die in §2.2 verbotenen TOTEN Klassen sind tabu; keine Umbenennungs-Pflicht ins `.st-*`-Namespace (das gilt nur für NEUE Sterne-Darstellungs-Klassen).

Branch `feat/pflege`. Lane-Zuschnitt: (1) Daten/STERNE/Engine-Fundament + sauberer TIERS-Schnitt = Sonnet; (2) Datenbank-UI-Umbau = Sonnet; (3) Anlass-Feed Heute + Radar & Anlässe = Sonnet; (4) Kampagnen-Workflow = Sonnet; Sterne-Kuration der 25 Seeds als Tabellen-Edit = Haiku. Verifikation/Merge/Push: Orchestrator. Jeder Task mit Sync-Wache und Syntax-Selbstcheck (sed-basiert, etabliert).
