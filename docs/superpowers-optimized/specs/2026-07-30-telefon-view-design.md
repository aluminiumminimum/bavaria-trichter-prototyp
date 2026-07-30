# Design-Spec: View „Telefon" — der assistierte Anruf (Demo)

**Datum:** 2026-07-30 · **Branch:** `feat/telefon` · **Status:** wartet auf User-Review
**Grundlage:** Deep-Research-Berichte 29.07. (*Der assistierte Anruf*, *Selbst der Endpunkt sein*),
Konzeptdokument *AI Phone Support im Selbstbau*, One-Pager „Kein Rückruf verpufft mehr" (07/2026).

## 1. Ziel

Ein neuer Top-Level-Nav-Punkt **„Telefon"** (nach „Fälle") zeigt den KI-Anruf-Assistenten als
voll spielbare Demo: Rückrufliste → Anruf starten → Live-Erkennung (Klingeln/Musik/Bandansage/
Mensch/AB) → Alarm-Moment → Übernahme mit Screen-Pop in die Fallakte bzw. AB-Nachricht mit
Wiedervorlage-Kaskade. Erzählung: **Erkennung läuft lokal, Audio verlässt das Haus nie,
das System wählt NIE selbst** (Human-in-the-loop; Auto-Wahl ist ausdrücklich gestrichen).

## 2. Nutzer-Entscheidungen (fix)

- Demo-Form: **interaktive Szenarien** (Leitfall-Muster), kein Auto-Film.
- Position: **nach „Fälle"** in Sidebar UND Tabbar.
- `.kta-*`-Pilot im Kostenfeld: **unangetastet** (bekannte, akzeptierte Redundanz).
- Kein Selbst-Wählen — jede Wahl stößt ein Mensch an.

## 3. Ort & Namespace

- Neue Section `#view-telefon` (nach `#view-faelle`-Section einfügen), statisches Grundgerüst
  im HTML (Seite rendert ohne JS), Dynamik via `renderTelefon()`.
- CSS-Namespace **`.tel-`**, JS-Präfix **`tel`** — kollisionsgeprüft (0 Treffer).
  CSS als EIN kommentierter Block vor `</style>`. **ACHTUNG Bug-Klasse §4j: kein `*/` in
  Kommentar-Prosa** — Namespace in Kommentaren als „.tel-Klassen" schreiben.
- Nav: Sidebar-Button (Anker: `data-nav="faelle"`-Button im Sidebar-Block, danach einfügen)
  + Tabbar-Button (Anker: tabbar-inner, nach faelle). Telefon-SVG im bestehenden Stil
  (24×24, stroke, linecap round). Routing: `"telefon"` in `switchTab()`/`applyHash()` ergänzen,
  `renderTelefon()` in `renderAll()`.
- **Tabbar-Gate 390px:** Nach Einbau messen (7 Einträge, `getBoundingClientRect`): kein Umbruch,
  kein Overflow, Labels lesbar. Fallback 1: Mobil-Label „Anruf". Fallback 2 (nur wenn 1 scheitert):
  kein Tabbar-Eintrag, mobiler Einstieg über Karte im Heute-View (nx-entry-Muster).

## 4. View-Aufbau (drei Zonen, keine Subtabs)

**Z1 · Hero** (Etiketten-Karte, Doppelrahmen, Gold-Eck-Winkel):
Titel „Kein Rückruf verpufft mehr." · Lokal-Badge: „● LÄUFT LOKAL — Audio verlässt das Haus nie ·
keine Aufzeichnung" (Fragment Mono) · 2 Sitzungs-KPIs: „Warteminuten übernommen" und
„Rückrufe erreicht" (aus TEL_STATE gezählt, Start 0, deterministisch).

**Z2 · Rückrufliste** (Arbeitsvorrat, Kartei-Panel-Idiom .db-group/.stg-h):
`telQueue()` baut zur Laufzeit aus `faelle[]`:
- Rückruf-Einträge: Fälle mit Status Neu/Kontaktiert, Nummer via vorhandenem `telAusText(f.originalTxt)`;
  erwartet: Hoffmann-Fall + Anna (id 1). Fallback-Nummer aus Seed-Konstante, falls Regex leer.
- Kassen-Eintrag: erster Fall mit `kosten==="Zusage angefragt"` → „ARKADIA Kostenzusage nachfassen".
Zeile: Initialen-Avatar (`initialen()`), Name, Anlass, Sterne (`sterneHtml`-Idiom), Versuchszähler
(`f.anrufe`), Einwilligungs-Häkchen „✓ Rückruf erbeten", Button **„Anrufen ›"**.
Während aktivem Anruf: alle anderen Anrufen-Buttons `disabled`.

**Z3 · Live-Bühne** (`#telBuehne`, erscheint nur bei aktivem/beendetem Anruf, scrollIntoView):
- Kopfzeile: Angerufener + Nummer + laufende Uhr (mm:ss, aus Timer-Ticks, deterministisch).
- **Wellenform**: 24 CSS-Balken, Höhen statisch inline variiert, Bewegung via NEUEM Keyframe
  `telWave` (nur `transform:scaleY`, gestaffelte `animation-delay` inline). Reduced Motion:
  globaler RM-Block stoppt Animation → statisches Balkenbild bleibt vollständig sichtbar.
  Kein `opacity:0` in Basisregeln, kein `filter:blur`.
- **Klassifikations-Chip** (Fragment Mono, Farbwechsel): Wählt(--muted) → Klingelt(--muted) →
  Musik erkannt(--azzurro/Steel) → Bandansage(--amber) → ● Mensch(--sage-deep/Jade) bzw.
  Anrufbeantworter(--amber). Alarm-Zustand: Gold-Chip mit bestehendem `lxPulse`.
- **Ereignis-Zeitleiste** unter der Welle (kleine Log-Zeilen mit Zeitstempel der Sitzungs-Uhr).
- Aktionsleiste je Phase (s. Szenarien). „Auflegen" jederzeit sichtbar.
- Zeitraffer-Kennzeichnung: im Kassen-Szenario Chip „ZEITRAFFER — real ~12 Min" (Ehrlichkeitsregel R12).

**Z4 · „So funktioniert's"** (Kapitel im #anlassChap-Kopf-Idiom, unter der Liste):
3 Schritte (Mitarbeiterin wählt → Assistent hört zu und klassifiziert lokal → Mensch übernimmt)
+ Architektur-Zeile (Browser ist Endpunkt · keine Cloud-Inferenz · keine Aufzeichnung · §201-sicher).

## 5. Szenarien (deterministisch, setTimeout-Ketten, `TEL_TEMPO=1`)

Alle Zeiten × TEL_TEMPO. Timer-IDs in TEL_STATE, `telAuflegen()` cleart alle.
**Nach dem Alarm läuft KEIN Timer mehr** — Szenario wartet auf Klick (Human-in-the-loop).

**S1 · Rückruf → Mensch** (Anna/Hoffmann):
0,0s Wählt · 1,2s Klingelt (Welle dezent) · 4,8s „Abgehoben — analysiere …" · 6,3s ALARM
„● Mensch in der Leitung" + Chip „Überbrückungsansage läuft: ‚Hier ist die Klinik Bavaria …'"
+ Button **„Gespräch übernehmen"**. → Übernehmen: `telLog(f,"✆ Rückruf erreicht — Gespräch
übernommen (Erkennung 1,5 s)")`, KPI erreicht+1, **Screen-Pop `openFallakte(f.id)`**, Toast.

**S2 · Rückruf → Anrufbeantworter** (zweiter Rückruf-Eintrag):
0,0 Wählt · 1,2 Klingelt · 6,0 „Abgehoben — analysiere …" · 7,5 „Anrufbeantworter erkannt"
(Amber) + Buttons **„Neutrale Nachricht abspielen"** / **„Auflegen"**.
→ Nachricht: 2s Chip „Nachricht läuft — ohne Gesundheitsbezug", dann `wvNichtErreicht(f.id)`
(bestehende R16-Funktion: Versuchszähler, Kaskade 5★ heute · 4★ morgen · 3★ +2 T, Log, Toast,
kfSyncStatus) + zusätzliche Zeile `telLog(f,"✆ Neutrale Nachricht auf AB hinterlassen")`.
→ Auflegen: nur `wvNichtErreicht(f.id)`.

**S3 · Kasse ARKADIA → Warteschleife** (Kostenzusage-Fall):
0,0 Wählt · 1,2 „Verbunden — Warteschleife · Musik erkannt" (Steel, Welle ruhig-regelmäßig) ·
6,0 „Bandansage erkannt — kein Mensch, weiter warten" (Amber, 3s) · 9,0 zurück zu Musik ·
14,0 „Stimme erkannt — analysiere …" · 15,5 ALARM „● Mitarbeiter:in der ARKADIA in der Leitung"
+ Überbrückungs-Chip + **„Gespräch übernehmen"**. → Übernehmen: `telLog(f,"✆ ARKADIA erreicht —
Warteschleife (~12 Min) vom Assistenten übernommen")`, KPI Warteminuten+12, Screen-Pop Fallakte.
Zeitraffer-Chip während der gesamten Musik-Phase sichtbar.

## 6. Daten & Verträge

- **Keine Seed-Struktur-Änderung, kein DEMO_SCHEMA-Bump.** Nur Laufzeit: `TEL_STATE`
  (nicht persistiert), `f.anrufe` (existiert, R16), `f.log`-Einträge **3-elementig**
  `[dstr(0), text, logZeit()]` via `telLog()` — persistieren automatisch über demoSave.
- **Verboten:** Aufrufe von `sendReply`/`kzNotizAdd`/`simTrigger` aus Telefon-Code
  (Leitfall-Seiteneffekte). `wvNichtErreicht` ist geprüft sim-frei und wird direkt genutzt.
- Wiederverwendung: `telAusText`, `initialen`, `escapeHtml`, `dstr`, `logZeit`, `inbToast`,
  `openFallakte`, `wvNichtErreicht`, `lxPulse`, `lift`.
- Kein `Math.random()`, kein argloses `new Date()`. Uhr/Zeiten aus Timer-Ticks + `logZeit()`.

## 7. Fehlerfälle & Kanten

- Doppelklick „Anrufen": Guard `TEL_STATE.aktiv` → ignorieren.
- View-Wechsel während Anruf: Timer laufen weiter, State-getrieben; Rückkehr rendert korrekten
  Stand. Beim ALARM ohne Nutzer: wartet unbegrenzt (kein Auto-Abbruch).
- „Auflegen" in jeder Phase: Timer clear; vor Abheben → `wvNichtErreicht`; nach Alarm →
  telLog „Anruf beendet ohne Übernahme".
- `telQueue()` leer (alle Fälle durchgespielt/Status weiter): Leer-Zustand-Karte
  „Alle Rückrufe erledigt" + Hinweis auf ↺ Zurücksetzen.
- Kein Kostenzusage-Fall vorhanden: Kassen-Zeile entfällt ersatzlos (kein Fake-Fall).

## 8. Nicht-Ziele

Kein Selbst-Wählen · keine echte Telefonie/WebRTC · keine Aufzeichnung, auch nicht simuliert ·
kein Eingriff in `.rp-/.rpd-/.rsp-/.mx-`-Bereiche, `openReferrer`, `#refOverlay` · `.kta-`-Pilot
unverändert · keine neuen Felder an inReha/personen · kein Proxy-/KI-Netzaufruf (Demo ist
vollständig offline-deterministisch; KI-GESPERRT-Zustand irrelevant).

## 9. Verifikation (Gates)

1. `node --check` auf extrahiertem Script.
2. @1440: View über Sidebar erreichbar, 3 Szenarien vollständig durchgespielt, Screen-Pop
   öffnet Fallakte, `f.log`-Einträge 3-elementig, Reload → Logs persistiert, Queue-Zustand korrekt.
3. @390: **Tabbar-Messung** (7 Einträge, 0 Overflow, kein Umbruch — sonst Fallback-Kaskade §3),
   View 0 horizontaler Overflow, Live-Bühne bedienbar, Toast überdeckt Tabbar nicht.
4. Reduced Motion: View statisch vollständig sichtbar, Welle steht, Chips lesbar.
5. 0 Console-Errors gesamt. Cofounder-Check: Matrix 6 Zellen, `openReferrer` Portal,
   rsp-Charts, kta-Pilot („Agent für mich warten lassen") — alle unverändert funktional.
6. Keyframe-Bilanz: exakt +1 (`telWave`), dokumentiert.

## 10. Failure-Modes (geprüft)

- **Tabbar 390** → Mess-Gate + zweistufiger Fallback (§3). Nicht kritisch.
- **Verwaister State** → State-Objekt + re-render-fest + Timer-Disziplin (§5/§7). Gelöst im Design.
- **Sim-Interferenz** → telLog eigenständig, wv-Funktion verifiziert sim-frei (§6). Gelöst.
- **Demo-Unehrlichkeit Zeitraffer** → sichtbarer Zeitraffer-Chip (§5 S3). Gelöst.
