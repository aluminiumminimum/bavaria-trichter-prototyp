# Design-Spec: Verlust-Analyse (Ableitung) + Netzwerk-Fällige an der Eskalationsschiene

**Datum:** 2026-08-04 · **Branch:** `claude/app-threads-visibility-l4c6ed` · **Status:** in Umsetzung
**Grundlage:** priorisierter Ausbauplan 04.08., Prio 2 Punkte 5+6 (Nutzer: „zieh durch, alles auf
einmal"). Schließt den ursprünglichen Auftrag: „vor allem, wenn sie fällig sind, müssen sie
bearbeitet werden und dürfen nicht liegengelassen werden."

## 1. Verlust-Analyse — aus Gründen werden Hebel (`.vl-*`)

Der Chart „Warum gehen Fälle verloren?" existiert; neu ist die **Ableitung** darunter
(`vlFazitHtml`, gefüllt aus `renderCharts` mit dem dort bereits berechneten `lossReasons`):

- **Größter Hebel:** häufigster Grund + zugeordnete Gegenmaßnahme aus `VL_HEBEL` — jede
  Maßnahme verweist auf ein existierendes Feature der Maschine (Wartezeit → Kapazitäts-
  Abgleich · Rückmeldung → Service-Uhren/Eskalation · Dokumente → Portal-Upload ·
  Kosten → Warteschleifen-Agent · Kapazität → 8-Wochen-Forecast). Die Maschine erklärt
  sich selbst als Antwort auf ihre Verluste.
- **€-Zeile:** verlorene Fälle × `SV_FALLWERT` („1 verlorener Demo-Fall ≈ 18.800 € — jeder
  Grund ist ein Prozess-Hebel, kein Schicksal").

## 2. Netzwerk-Fällige — Eskalationsschiene erweitert

Gleiche Philosophie wie das Service-Versprechen: kein Zwang, aber Fälliges wird sichtbar und
eskaliert an die Leitung, statt liegen zu bleiben. **Regel (fest, dokumentiert):**

| Anlass-Typ | eskaliert wenn | bewusst NICHT eskaliert |
|---|---|---|
| Wiederbedarf (Radar) | Fälligkeitstermin verstrichen (`tage < 0`) | Geburtstag/Jubiläum/Nachsorge — |
| Zuweiser-Rhythmus | Kadenz ≥ 1,5× gerissen (`urg === "jetzt"`) | Beziehungspflege ist kein Verstoß |

- `svEskalationen()` nimmt diese Anlässe als `typ:"anlass"` mit auf → gleiches Panel auf
  Heute, gleiche „Heute wichtig"-Zeile (Text generalisiert: „Erstkontakt, Frist oder
  Netzwerk-Fälligkeit gerissen").
- Zeilen-Aktionen: **Bearbeiten ›** (`akOpen(key)` — der bestehende Anlass-Detail-Rail mit
  vorbereiteter Nachricht) · bei Wiederbedarf zusätzlich **Wiedervorlage +7 Tage**
  (`svAnlassSpaeter`: setzt `faelligInTagen=7`, Toast) — Erledigen im Rail (`_arDone`)
  oder Verschieben lässt die Zeile verschwinden; keine Doppel-Buchführung.
- **Seed-Anker:** Christa Mohr (Premium/SalutoCare, Recovery Manager) `faelligInTagen`
  25 → **−5**: „Premium-Nachsorge seit 5 Tagen überfällig" — die wertvollste Kundin liegt
  im Radar. Radar-Ansicht verträgt negative Werte (urg „jetzt", Monatslabel = Vormonat).
- SOP-Karte (Konzept): ein Satz ergänzt — Fälliges im Netzwerk eskaliert mit.

## 3. Regeln

Namespaces `.vl-*` (neu, kollisionsgeprüft) und bestehendes `sv*`; CSS additiv im
SV-AUSBAU-Block. Fremdcode-Berührung: 1 Zeile `renderCharts` (vlFazit), 1 Wort-Ergänzung
SOP-Intro, Seed-Wert Christa. Beide Breiten, 0 Console-Errors, rendert ohne JS.

## 4. Nicht in diesem Schritt (bewusst)

Eigene Liegezeit-Uhr je Anlass (keine Zeitstempel im Demo-Datenmodell — Regel bindet an
`faelligInTagen`/Kadenz) · Wert-Score · Antwort-Vorlagen · Entlassung→Radar-Automatik.
