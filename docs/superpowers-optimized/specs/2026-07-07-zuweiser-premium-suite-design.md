# Spec — Zuweiser-Premium-Suite (B2B-Zeile der Matrix)

**Datum:** 2026-07-07
**Datei:** `index.html` (single self-contained, inline CSS/JS)
**Anlass:** Voice-Memos vom 2026-07-07 (Desktop, 2 Teile). **Investoren-Pitch morgen** — Qualität vor allem, Desktop/Beamer ist die primäre Bühne.
**Status:** Design vom User freigegeben (4× Recommended via AskUserQuestion + „go").

## 1. Ziel

Die drei B2B-Screens der Matrix-Zuweiserzeile (**Zuweiser-Portal / Behandlungs-Einblick / Abschlusspaket** = vor/in/nach der Reha) werden „in einem Rutsch" zu einer **Premium-Zuweiser-Suite** aufgewertet — auf das Qualitätsniveau der B2C-Unterseiten (Anfrage/Reha-Steuerung/Nachsorge-Radar). Memo-Kritik konkret: Portal „sieht ja nicht gut aus", Begrüßung unpersönlich, keine echten Ansprechpartner, Anmeldung nicht niedrigschwellig, Fälle-Liste ist nackter Text.

## 2. Entschiedene Richtung (User-Antworten)

1. **Pitch-Gerät:** Desktop/Beamer primär → Polish-Budget auf 1440; 390 bleibt sauber (kein Overflow, lesbar).
2. **Auslastung klickbar:** Klick auf freie Zelle (Achse × KW) füllt das Anmeldeformular vor (Fachbereich + Wunschtermin), scrollt hin, Gold-Flash.
3. **Begrüßung:** aus dem `zuweiser`-Datensatz personalisiert (Leopoldina → „Dr. Brenner"); Fallback Institution, wenn `ap` fehlt/„noch offen".
4. **Sub-Nav:** gemeinsame Tab-Navigation Portal · Einblick · Abschluss im Hero → fühlt sich wie EIN Zuweiser-Produkt an, gleiche Phasen-Sprache wie die Matrix.

## 3. Architektur (Ansatz A — Premium-Microsite im bestehenden Overlay)

- `#refOverlay`-Mechanismus (Vollbild, z-90, Esc/Zurück-Banner, `body.locked`) bleibt **unangetastet**.
- `openReferrer(screen,zName)` behält Signatur (Aufrufer: Matrix-`mxGo`, Zuweiser-Karten-Button). Intern rendert neu `renderSuite(screen,zName)`: gemeinsamer Hero + Sub-Nav + Screen-Body. Tab-Wechsel re-rendert nur den Body (Cross-Fade), Overlay bleibt offen.
- Die drei Alt-Funktionen `renderPortal/renderEinblick/renderAbschluss` werden durch die neuen Screen-Renderer ersetzt (gleiche Namen OK), Ausgabe nutzt **neuen CSS-Namespace `.rp-*`** (referrer premium) in einem kommentierten Block vor `</style>`. Alte `.ref-*`/`.mp-*`/`.bel-*`-Regeln bleiben stehen (kein Risiko; Cleanup ist Non-Goal).
- Kollisionsvermeidung mit parallel arbeitendem Kollegen (Matrix/Datenbank): Änderungen liegen ausschließlich in Referrer-Renderfunktionen + neuem CSS-Block + kleinen neuen Demo-Datenblöcken. Branch `feat/zuweiser-premium`, kurzlebig (heute mergen), `git pull` vor Merge.

## 4. Gemeinsamer Rahmen („Suite")

- **Hero** (Espresso-Verlauf `--espresso-grad`, Gold-Akzente, Cormorant): kleine Wortmarke „Klinik Bavaria · Zuweiser-Portal", dann groß *„Herzlich willkommen, Dr. Brenner"* (Cormorant italic, ~40px Desktop / 28px mobil) + Unterzeile „Leopoldina-Krankenhaus · Schön, dass Sie bei uns sind."
  - Persona-Ableitung: `zuweiser.find(z=>z.name===zName)`; `ap` → Anrede (Titel-Heuristik: „Hr./Fr./Dr." beibehalten, Zusatz in Klammern weglassen); kein Treffer/`ap:"noch offen"` → „Herzlich willkommen" + Institutionsname.
- **Sub-Nav im Hero:** 3 Tabs mit Phasen-Mikro-Label (vor/in/nach der Reha) + Titel; aktiver Tab Gold-Unterstrich. Matrix-Einstieg setzt den aktiven Tab (`einblick` → Tab 2 etc.).
- **Motion:** Entrance-Stagger der Karten beim Öffnen + sanfter Cross-Fade beim Tab-Wechsel; `opacity:0` NUR im Keyframe-from (etabliertes reduced-motion-safe Muster; globales `*{animation:none}` deckt ab).
- **Desktop ≥900px:** Inhaltsbreite bis ~1080px, definierte 2-Spalten-Zeilen (siehe Screens); mobil alles einspaltig.

## 5. Screens

### 5.1 Portal (vor der Reha) — Reihenfolge wie Memo
1. **Aktuelles von Klinik Bavaria:** neues Demo-Array `portalNews` (3 Einträge: „+4 SalutoCare-Suiten ab September", „AHB-Fast-Lane: Rückmeldung < 24 h", „Neues EPZ-Kooperationsmodul Orthopädie") mit Datums-Chip; als schmale Gold-akzentuierte Zeilenkarte.
2. **Freie Plätze:** Belegungs-Matrix (`belegung`, 4 Achsen × 4 KW) neu inszeniert — größere Farbzellen (frei=Salbei / knapp=Gold / belegt=Terra), Hover-Lift, Legende. **Klick auf Zelle mit >0 Plätzen** → `rpPrefill(achse,kw)`: setzt Fachbereich-Select + Wunschtermin-Input, `scrollIntoView` aufs Formular, ~1.2s Gold-Flash (`box-shadow`-Puls) auf der Formular-Karte. Zellen mit 0 nicht klickbar (kein Cursor, gedimmt).
3. **Ihre Ansprechpartner:** 2 Personen-Karten (Desktop nebeneinander): Initialen-Avatar (Messing-Kreis), Name, Rolle, Direktwahl, Mail + „Rückmeldung < 24 h"-Badge. Neues Demo-Array `portalTeam`, je Zuweiser-Typ leicht variiert: Karte 1 = persönlicher Partner (Leopoldina: „Dr. Miriam Bergmann · Ärztliche Koordination"), Karte 2 = „Tobias Klein · Belegungsmanagement". Synthetische Demo-Daten (@demo-*.local, 0971-Demo-Nummern).
4. **Patient anmelden:** aufgeräumtes Formular — Desktop 2-spaltig (Name+Fachbereich / Wunschtermin+Kostenträger), Checkbox „kommt direkt von mir", verfeinerte Upload-Zone, großer Gold-CTA „Patient anmelden" → bestehender `refToast()`-Demo-Hinweis. `id`s für Prefill: `rpFach`, `rpTermin`.
5. **Meine angemeldeten Fälle:** neues Demo-Array `portalFaelle` (3 Einträge je Status neu/geplant/in Reha — **nicht** aus `faelle` ableiten, dort existiert kein Leopoldina-Fall): Zeilen mit Initialen-Avatar, Name, Achse, Status-Pill (Farbe je Phase), Datum.
6. **Kontakt:** Karte mit Rückruf-CTA („Wir rufen Sie zurück" → `refToast()`), Direktwahl, Mail.

### 5.2 Behandlungs-Einblick (in der Reha)
Pro `inReha`-Patient eine Premium-Karte: Kopf mit Initialen-Avatar + Name/Achse/ICD-frei-Formulierung (keine internen Steuerungs-KPIs — ärztliche Sicht), **Reha-Tag-Fortschrittsbalken** (ist/plan), **Barthel- und FIM-Verlauf als Gold-KPI-Ringe** via bestehender `kpiRing()` (Aufnahme→aktuell als ▲-Delta), Laborwerte als Wertekacheln, letzte Verlaufs-Einträge als Gold-Zeitleiste, Rücksprache-CTA (Salbei). Desktop: Karten 2-spaltig ODER volle Breite mit Ringen rechts — Entscheidung: **volle Breite, Ringe+Balken in einer rechten Spalte ≥900px** (lesbarer auf Beamer).

### 5.3 Abschlusspaket (nach der Reha)
- Kopfkarte: Patient + „entlassen"-Badge (Salbei), Diagnose/Aufenthalt.
- **Ergebnis-Moment:** großes Zahlen-Highlight „Barthel 45 → 85" (Cormorant, Gold-Pfeil) — der Investor sieht Outcome.
- **Dokumente als Kacheln:** Arztbrief / Kurzbericht / Medikationsplan als anklickbare Dokument-Karten (Icon, Titel, „PDF · Demo") → `refToast()`.
- Empfehlungen als Häkchen-Liste, Medikation als Zeile, Rücksprache-Karte (Recovery-Line).

## 6. Non-Goals
- Kein Backend/echtes Absenden (Demo-Toast bleibt), keine echten Personendaten (synthetisch, @demo-*.local).
- Kein Umbau von Matrix, Datenbank, internen Views, Navigation, `#refOverlay`-Mechanik.
- Kein Entfernen alter `.ref-*`-CSS (Cleanup separat, falls je nötig).
- Matrix-Zellen-Status („im Aufbau") bleibt wie vom Kollegen gesetzt.
- 130k-AI-Liste / Klinik-Chefarzt-Cleanup = Pascals Task, out of scope.

## 7. Failure-Modes & Mitigations
1. **Merge-Konflikt mit Kollege (single file, kritisch bei Pitch-Deadline):** Änderungen nur in Referrer-Funktionen + neuem CSS/Datenblock; Branch lebt Stunden; `git pull origin main` unmittelbar vor Merge; bei Konflikt sind unsere Hunks lokal begrenzt.
2. **390px-Overflow durch Desktop-Layouts (mittel):** mobile-first einspaltig, 2-Spalten nur `@media(min-width:900px)`; Gate je Screen bei 390.
3. **Persona-Ableitung bricht (mittel):** Fallback-Kette `ap`→Institution; explizit testen mit „Reha-Technik Müller" (`ap:"noch offen"`) und PRIMO („Portal-Anfragen").
4. **Tab-Einstieg falsch (klein):** `openReferrer('einblick',…)` aus Matrix muss Tab 2 aktiv zeigen — Tab-State ist Parameter, kein globaler Zustand.
5. **Prefill zerbricht Formular (klein):** Prefill setzt nur `value` zweier Felder + Scroll/Flash; keine Validierung/Submit-Logik.

## 8. Verifikation
- Chrome MCP je Screen (Portal/Einblick/Abschluss) bei **1440 (primär)** und **390**: 0 horizontaler Overflow, Labels lesbar, 0 Console-Errors.
- Interaktionen: Belegungs-Klick → Prefill+Scroll+Flash; Tab-Wechsel alle Richtungen; Esc + Zurück-Button schließen; Einstieg aus allen 3 Matrix-Zellen UND vom Zuweiser-Karten-Button (anderer zName → andere Begrüßung); Fallback-Begrüßung.
- JS-Parse-Sanity (Script-Extrakt + `node --check`) nach jedem Task.

## 9. Rollout
Branch `feat/zuweiser-premium` → Tasks via subagent-driven-development → Verifikation → `git pull` → merge→main → GitHub-Pages-Live-Deploy (Pitch-URL). Live-Marker: `rp-hero`.
