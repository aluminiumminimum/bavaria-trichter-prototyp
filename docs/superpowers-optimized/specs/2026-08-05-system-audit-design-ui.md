# System-Audit: Design & UI — Befunde und Korrekturen

**Datum:** 2026-08-05 · **Status:** umgesetzt
**Anlass:** Nutzer-Auftrag „systematisches Audit des gesamten Designs und der UI — Fehler,
Bugs und Ähnliches finden und korrigieren."

## Methode

Playwright-Sweep über alle Views/Subviews (heute · anfragen · board · team · inreha ·
netzwerk×2 · auswertung · konzept×3 · telefon · fallakte · meintag · portal-Overlay) bei
1440 **und** 390, plus 768 für Raster-Grenzen. Automatische Checks: pageerrors, h-Overflow,
kaputte Template-Strings (undefined/NaN/[object Object]), doppelte IDs, reduced-motion-
Endzustand, Ohne-JS-Rendering. Danach Sichtung aller Screenshots + Interaktions-Smoke-Tests
(Nachfrage-Loop, Zeitraffer, Rollenwechsel/Inbox, Karte→Akte→zurück, Kapazität vormerken,
Portal, KI-Chat, Verlust/Reaktivieren, Wiedervorlage).

## Befunde → Fixes

1. **Netzwerk · Zuweiser-Jahrestag:** verpasster Jahrestag (diff<0) stand als „in -13 Tagen"
   unter „Demnächst" → urg-Regel `diff<=7 ⇒ jetzt`, Pille nie mit negativen Tagen
   (überfällig/heute/in N Tagen) — `zwaKarte`/`akOpen` vereinheitlicht.
2. **Netzwerk · Nachsorge:** `tage` trug Tage SEIT Entlassung — Karte zeigte „in 45 Tagen"
   für einen seit Tag 42 fälligen Kontakt, ältere rutschten nach „Demnächst" → Feld jetzt
   relativ zur 42-Tage-Marke (negativ = fällig), urg im Fenster immer „jetzt", Pille
   „seit N Tagen fällig" (`paaKarte`).
3. **Anfragen:** passive Kontakte (kein Handlungsbedarf) trugen eine laufende
   Erstkontakt-Uhr → SLA-Chip nur noch für qualifizierte offene Anfragen.
4. **Heute · Trichter-SVG:** „Privatauslastung" kollidierte mit „78 %" (Ergebnis-Spalte)
   → Label-font-size 16 im Instanz-Attribut.
5. **In Reha:** rohe ISO-Daten („2026-08-07", „am 2026-08-07") → `paDate()`; Karten-Zeile
   heißt jetzt „Entlassung 07.08.2026". KPI-Werte („42 %") brachen um → `.irb-bv{nowrap}`.
6. **Team · Trichter-Mini-Charts:** Stufen-Labels ellipsierten („KONT…"), Ursache doppelt:
   (a) Kürzel zu lang → `TCP_KURZ` auf max. 4 Zeichen (voller Name im title-Tooltip),
   (b) Panel-Raster `1fr 1fr auto` quetschte das dritte Panel auf ~200px → ≥900px
   `repeat(3,1fr)`, ≤560px eine Spalte.
7. **Auswertung:** Balken-Labels abgeschnitten („FEHLENDE DOKUME…") → `.blbl` 158px
   (mobil 134px/12.5px).
8. **Eskalations-Meta:** beim Umbruch begann die Folgezeile mit „·" → Meta-Teile als
   `.tce-seg`-Segmente (`tceSeg()`), Trennpunkt hängt per `::after \00a0·` am Vorgänger.
9. **reduced-motion-Regelverstoß:** `.cv-dot` hatte `opacity:0` in der Basisregel (Partikel
   ohne Animation dauerhaft unsichtbar per Zufall statt per Absicht) → opacity raus,
   `display:none` im reduced-motion-Block — dasselbe Idiom wie `.p-dot`/`.fn-dot`.

## Geprüft, kein Fehler (Abgrenzung)

- „Leere" Foto-Karten in fullPage-Screenshots = `loading="lazy"` unterhalb des Folds;
  alle Bilder liegen lokal in `assets/`.
- Leeres „In Reha" im Sweep = View-Transition-Artefakt des fullPage-Captures.
- Forecast-Hero „0/7" = gewollte Pipeline-Pointe (fallende Belegung ohne Neuzugänge).
- `kapVormerken`, Nachfrage-Loop, Zeitraffer ± Reset, Inbox-Countdown, Verlust/Reaktivieren,
  Portal, KI-Offline: alle Smoke-Tests grün; scheinbare Fehlschläge waren Test-Artefakte
  (localStorage-Persistenz früherer Läufe, Shallow-Copy-Aliasing, `history.back()` verließ
  die file://-Seite).
- Fonts-Console-Errors nur in der Sandbox (Proxy blockt Google Fonts) — kein App-Befund.

## Regeln

0 pageerrors · 0 h-Overflow bei 390/768/1440 · Syntax-Gate über alle Script-Blöcke ·
reduced-motion zeigt keinen opacity-0-Endzustand · Screenshots vor Push gesichtet.
