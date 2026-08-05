---
name: design-audit
description: Systematisches Design- und UI-Audit des gesamten Prototyps — alle Views screenshotten (390 + 1440), automatische Checks, Screenshots sichten, Befunde fixen. Nutzen bei /design-audit, „Design-Audit machen", „schau ob alles gut aussieht", vor wichtigen Pitch-Terminen oder nach größeren Umbauten.
---

# Design-Audit — der volle Durchlauf

Maßstab: **„Würde das im Investor-Pitch bestehen?"** Referenz-Optik:
`design-lab/e5d-jade.html` + Etiketten-System aus CLAUDE.md.

## 1. Sweep (Playwright, headless `/opt/pw-browsers/chromium`)

Alle Views bei 1440 UND 390 (768 bei Raster-Fragen): `heute` ·
`faelle`(anfragen/board/team) · `inreha` · `netzwerk`(zuweiser/patienten) ·
`auswertung` · `konzept`(idee/matrix/sops) · `telefon` · Fallakte
(`openFallakte`) · Mein Tag (`mtEnter`) · Portal (`openReferrer`).
Vorher `localStorage.clear()` + reload (sonst alte Teststände), dann
`betaClose(true)`.

Automatische Checks je View: pageerrors + Console-Errors · h-Overflow
(inkl. Übeltäter-Elemente) · kaputte Templates im sichtbaren Text
(undefined/NaN/[object Object]) · doppelte IDs (einmal global) ·
reduced-motion (kein Element endet bei opacity≈0) · Ohne-JS-Screenshot.

## 2. Sichtung — der eigentliche Kern

Jeden Screenshot SELBST ansehen (Read-Tool), nicht nur die Checks lesen.
Prüfliste: Label/Wert-Kollisionen · abgeschnittene/ellipsierte Texte ·
umbrechende Zahlen/Werte · rohe ISO-Daten statt `paDate()` · negative oder
unsinnige Zahlen in Pillen („in -13 Tagen") · Trenner am Zeilenanfang ·
gequetschte Panels/Charts · nackter Text, wo Etiketten-Sprache hingehört
(Avatare, Pills, Ampel-Punkte, Cormorant-Numerale, Micro-Labels, Hairlines).

Bekannte Fehl-Alarme: fullPage-Screenshots zeigen lazy-Images leer und können
View-Transitions halb einfrieren; Fonts-Console-Errors kommen aus der
Sandbox — beides keine App-Bugs.

## 3. Smoke-Tests

Nachfrage-Loop (7s-Antwort) · Zeitraffer + Reset · Rollenwechsel + Inbox-
Countdown · Karte→Fallakte→zurück (App-Button, NICHT `history.back()`) ·
Eingang übernehmen · Kapazität vormerken · Verlust melden + reaktivieren ·
Portal · KI-Chat offline.

## 4. Abschluss

Befunde fixen (jeder Fix wieder durch Syntax-/Playwright-/Screenshot-Gate),
Spec `docs/superpowers-optimized/specs/JJJJ-MM-TT-….md` mit Befunde→Fixes und
„geprüft, kein Fehler"-Abgrenzung, dem Nutzer Vorher/Nachher-Screenshots
mitliefern.
