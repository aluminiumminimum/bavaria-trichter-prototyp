---
name: write-plan
description: Aus einem freigegebenen Design-Spec einen konkreten Umsetzungsplan machen — Schritte, betroffene Code-Stellen, Verifikation je Schritt. Nutzen bei /write-plan oder wenn ein Spec existiert und die Umsetzung geplant werden soll.
---

# Write-Plan — vom Spec zum Umsetzungsplan

Voraussetzung: ein freigegebenes Spec in `docs/superpowers-optimized/specs/`.
Ergebnis: `docs/superpowers-optimized/plans/JJJJ-MM-TT-<slug>.md`.

## Plan-Inhalt

1. **Schritte in Umsetzungsreihenfolge** — jeder Schritt klein genug, um ihn
   einzeln zu verifizieren. Je Schritt: Was · Wo (Funktion/Zeilenbereich in
   `index.html`) · neuer/bestehender Namespace.
2. **Wiederverwendung explizit machen:** `escapeHtml`, `initialen`, `kpiRing`,
   `rpPersona`, `dstr`, `paDate`, bestehende Pills/Chips/Ampel-Idiome — erst
   suchen, dann bauen.
3. **Datenmodell:** neue Felder an `faelle`/`personen`/`eingang`/`belegung`?
   Dann klären: läuft es durch `demoSave`/`demoRestore`? Seed-Änderung ⇒
   `DEMO_SCHEMA` erhöhen (alte Browser-Stände verwerfen).
4. **CSS-Plan:** kommentierter Block vor `</style>`, Namespace `.xy-*`,
   welche Welt-Token (Jade/Gold/Zinnober, Cormorant/Inter/Mono).
5. **Verifikation je Schritt:** Syntax-Gate (alle `<script>`-Blöcke per
   `new Function`), Playwright 390 + 1440 (`betaClose(true)`, pageerrors,
   h-Overflow), Screenshots SELBST ansehen („Würde das im Investor-Pitch
   bestehen?"), betroffene Smoke-Flows.
6. **Fremdcode-Kontakt:** Liste der Stellen, die fremden Code berühren —
   nur chirurgische 1-Zeilen-Einfügungen, sonst eigener Namespace.

## Regeln

Plan dem Nutzer zeigen, Freigabe abwarten (außer er hat „in einem Rutsch"
bestellt). Danach `/execute-plan`.
