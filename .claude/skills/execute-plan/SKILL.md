---
name: execute-plan
description: Einen freigegebenen Umsetzungsplan Schritt für Schritt abarbeiten — mit Verifikations-Gate nach jedem Schritt und Screenshot-Pflicht vor dem Push. Nutzen bei /execute-plan oder wenn ein Plan aus docs/superpowers-optimized/plans/ umgesetzt werden soll.
---

# Execute-Plan — umsetzen mit Gates

Voraussetzung: Plan in `docs/superpowers-optimized/plans/`. Abarbeitung strikt
in Plan-Reihenfolge; Abweichungen vom Plan im Plan-Dokument nachtragen.

## Je Schritt

1. Implementieren (Konventionen: CSS additiv vor `</style>`, eigener Namespace,
   Views via `go()`, Wiederverwenden statt duplizieren).
2. **Syntax-Gate:** alle `<script>`-Blöcke per `new Function` prüfen — Pflicht
   nach jeder Änderung (ein einziges falsches Anführungszeichen legt die ganze
   App still; 08/2026 passiert).
3. **Playwright-Gate:** 390 UND 1440, `betaClose(true)`, 0 pageerrors,
   0 h-Overflow; betroffene Interaktionen durchklicken.
4. **Screenshot-Gate (nicht verhandelbar):** Screenshots beider Breiten SELBST
   ansehen und fragen: „Würde das im Investor-Pitch bestehen?" Plain-Text-UI,
   kollidierende Labels, abgeschnittene Texte = Fehler, kein Zwischenstand.

## Abschluss

1. Spec/Plan aktualisieren (Status, Abweichungen).
2. Deploy nur auf Zuruf oder wenn bestellt — dann `/deploy`.
3. Dem Nutzer zeigen, was entstanden ist (Screenshots mitliefern), inklusive
   dessen, was bewusst NICHT gebaut wurde.

## Achtung (gebrannte Kinder)

- Typografische Anführungszeichen in JS-Strings („…"), nie gerade `"` im Text.
- `opacity:0`/Transform-Start NUR im Keyframe-`from` (reduced-motion-Regel).
- localStorage-Persistenz: Seed-Änderungen ohne `DEMO_SCHEMA`-Bump zeigen
  Testern alte Stände; Test-Artefakte (persistierter Zustand, Shallow-Copies,
  `history.back()` verlässt file://) nicht mit App-Bugs verwechseln.
