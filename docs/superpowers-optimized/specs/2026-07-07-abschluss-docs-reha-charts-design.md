# Spec — Abschluss-Dokumente + QR + Reha-Verlaufsgrafiken

**Datum:** 2026-07-07 (spät) · **Datei:** `index.html` · **Pitch:** 2026-07-08, Desktop 1440 primär.
**Status:** Design freigegeben („ok"). Quelle: Kollegen-Chat-Log (QR „sieht einfach nice aus", Mock-up-Dokumente „dass man da wirklich reinklickt", Reha-Board-Grafiken) + User-Entscheidungen: QR = Live-Demo-URL; Reha-Grafiken JETZT (Konfliktrisiko mit Kollegen-WS3/WS5 bewusst akzeptiert).
**Basis:** `b96a225` (Kollegen-WS1–WS7 gepullt; Zuweiser-Suite + WOW live).

## 1. Ziel
(a) Die drei Dokument-Kacheln im Abschlusspaket öffnen echte Premium-Mock-Dokumente statt Toast. (b) QR-Code für den Medikationsplan — scanbar, Inhalt = Live-Demo-URL (`https://aluminiumminimum.github.io/bavaria-trichter-prototyp/`), Scan im Pitch öffnet den Prototyp. (c) Verlaufsgrafiken im Reha-Board (Karten-Sparkline) und im Reha-Detail (Liniendiagramm Barthel+FIM).

## 2. Architektur

### 2.1 Dokument-Viewer
- `rpDoc(type,zName)` mit `type ∈ {arztbrief,kurzbericht,mediplan}`; lazy DOM `#rpDocView` (wie `#rpToast`), `position:fixed inset:0`, Backdrop `rgba(31,28,28,.55)`, **z-index 110** (über refOverlay 90, unter Toast 120).
- Papierbogen `.rpd-paper`: max-width 660px, weiß, radius 6px (dokumentenhaft, NICHT Karten-16px), `max-height:88vh` scrollbar, Entrance rpUp-Muster. Briefkopf: KB-Monogramm-Kreis + „Klinik Bavaria" (Cormorant) + „Concierge Rehabilitation · Bad Kissingen" + Gold-Hairline. Diagonales Wasserzeichen „MUSTER" (`position:absolute`, rotate(-28deg), opacity ~.06, pointer-events:none). Fußzeile: Grußformel/Signatur „Dr. med. M. Bergmann · Ärztliche Koordination" + Demo-Hinweiszeile.
- Schließen: ×-Button, Backdrop-Klick (nur wenn Klick-Target = Backdrop), Esc. **Esc-Integration:** der bestehende Listener (`if(e.key==="Escape"&&refOverlay.open) closeReferrer()`) bekommt einen vorangestellten Guard: wenn `#rpDocView.open` → nur `rpDocClose()`, return. Kein neuer Listener (keine Reihenfolge-Races mit WS1-`dismissDetail`).
- `rpDocClose()` entfernt `.open`; Öffnen setzt Fokus auf ×.

### 2.2 Dokument-Inhalte (Demo-Daten)
Neue Felder an `entlassDoc`:
- `medis`: `[{m:"Ramipril",st:"5 mg",mo:1,mi:0,ab:1?…}]` — konkret: Ramipril 5 mg 1-0-0 (RR-Kontrolle), ASS 100 mg 1-0-0, Atorvastatin 20 mg 0-0-1, Colecalciferol 20.000 I.E. 1×/Woche, Ibuprofen 400 mg bei Bedarf max. 3×/Tag.
- `epikrise` (2–3 Sätze Arztbrief-Verlaufstext), `prozeduren` (3 Zeilen Therapieumfang).
Arztbrief-Anrede aus `rpPersona(zName)`: Name vorhanden → „Sehr geehrter Herr Kollege Brenner," (bzw. „Sehr geehrte Frau Kollegin …" bei Frau-Prefix; Dr./Prof. → „Sehr geehrte(r) Herr/Frau Kollege/Kollegin" vereinfacht: `name` beginnt mit „Frau" → Kollegin, sonst Kollege); Fallback „Sehr geehrte Kolleginnen und Kollegen,".
- **Arztbrief:** Empfängerblock (zName), Betreff (Patient, geb.-Jahr aus Alter grob, Aufenthalt), Anrede, Diagnose, Epikrise, Prozeduren, Empfehlungen (`entlassDoc.empfehlungen`), Gruß+Signatur.
- **Kurzbericht:** Patient-Block, Ergebnis-Tabelle (Barthel auf→ent, FIM auf→akt aus letzter inReha-Analogie NICHT nötig — nutze `barthel` + statisch FIM 78→104 als neues Feld `fim:{auf:78,ent:104}`), Verweildauer, 3 Verlaufspunkte.
- **Medikationsplan:** BMP-artige Tabelle (Wirkstoff/Stärke | mo–mi–ab | Hinweis) + **QR oben rechts** + Stand-Datum.

### 2.3 QR-Code (statisch, self-contained)
- Build-Zeit-Generierung (lokal, python `qrcode`, bereits installiert): Matrix für die Live-URL, **Ruhezone 4 Module**, als kompaktes SVG (`<path>` aus Modul-Rechtecken, `shape-rendering:crispEdges`), schwarz auf weiß — **bewusst nicht eingefärbt** (Scan-Sicherheit); Gold-Rahmen liegt AUSSERHALB der Ruhezone.
- Eingebettet als JS-Konstante `RP_QR` (SVG-String), verwendet 2×: (a) Abschluss-Karte — Zeile „Medikationsplan aufs Handy" (QR ~128px + Erklärtext, Desktop rechts neben Medikations-Text), (b) im Medikationsplan-Dokument oben rechts (~110px).
- Verifikation: lokal per Decode gegenprüfen falls Decoder verfügbar (zbar/OpenCV), sonst Bibliotheks-Roundtrip (qrcode.decode existiert nicht — dann: Modul-Anzahl + Sichtprüfung + User-Scan-Test als Gate).

### 2.4 Reha-Verlaufsgrafiken (additiv, `.rsp-*`-Namespace)
- `rsSeries(from,to,n)`: deterministische Reihe (ease-out-Interpolation + kleine `Math.sin(i*2.1)`-Wellung, clamp) — kein `Math.random` (stabil je Render).
- `rsSpark(p)`: Karten-Sparkline, SVG 100%×44 (viewBox 0 0 200 44), Barthel seit Aufnahme: Gold-Linie (#bca37d, 2px) + Verlaufsfläche (Gold→transparent, opacity .18) + Endpunkt-Dot + Mikro-Label „Verlauf seit Aufnahme". **Einfügeort:** in `renderInReha` zwischen `.ir-metrics` und `.ir-stay` (eine Template-Zeile).
- `rsChart(p)`: Detail-Diagramm, SVG 100%×120 (viewBox 0 0 460 120): 2 Linien Barthel (Gold) + FIM (Taupe #9B8573), jeweils auf eigenes Max normiert (100/126), Endwert-Labels an Linienenden, dezente horizontale Gridlines (25/50/75%), x-Beschriftung „Aufnahme … Tag N", Legende (2 Chips). Stroke-Draw-in beim Öffnen (`from{stroke-dashoffset}`-Muster, pathLength=1 normiert). **Einfügeort:** in `openRsDetail` im `rsErfolg`-Block direkt nach `.rs-dev` (eine Einfüge-Zeile).
- Punktzahl: `n = min(verweildauer.ist+1, 12)`, min 3 — Kurz-Lieger ergeben kurze, saubere Linie.

## 3. Non-Goals
- Keine echten PDFs/Downloads; kein Drucklayout. Keine Grafiken in Kollegen-Wirtschaftlichkeits-Spalte. Kein Umbau von `.ir-card`/`rsDetail`-Struktur (nur je 1 Einfüge-Zeile). Portal/Einblick unverändert. Mobile: alles funktioniert bei 390 (Papier full-width, Charts skalieren via viewBox), aber Polish-Fokus 1440.

## 4. Failure-Modes
1. **Merge-Konflikt mit Kollege in renderInReha/openRsDetail (hoch, akzeptiert):** 1-Zeilen-Einfügungen, kurzlebiger Branch, `git pull` unmittelbar vor Merge; bei Konflikt Einfügungen manuell neu setzen (trivial).
2. **QR unscannbar (mittel):** Bibliothek + Ruhezone + s/w + ≥110px; Decode-Gegenprobe falls Tool da; finaler User-Scan-Test empfohlen.
3. **Esc-Kaskade (klein):** Guard IM bestehenden Listener; Test: Doc offen → Esc schließt nur Doc, Suite bleibt; zweites Esc schließt Suite.
4. **Overlay-Stapel (klein):** Doc z-110 < Toast 120; Toast bleibt über Dokument sichtbar (gewollt).
5. **Sparkline verzerrt sein Karten-Layout (klein):** feste Höhe 44px + margin, `.ir-card` ist button mit Spaltenfluss — visuelles Gate 1440+390.

## 5. Verifikation
1440: alle 3 Dokumente öffnen/scrollen/schließen (×, Backdrop, Esc-Kaskade), QR sichtbar in Karte + Mediplan, Sparklines auf 3 Board-Karten, Detail-Chart mit Draw-in, Kollegen-Detail (Wirtschaftlichkeit) unverändert. 390: Papier full-width ohne Overflow, Charts skaliert. 0 Console-Errors, JS-Parse. Live-Marker: `rpDocView`.

## 6. Rollout
Branch `feat/abschluss-docs` → subagent-driven → Gates → pull → merge→main → Live-Deploy (freigegeben).
