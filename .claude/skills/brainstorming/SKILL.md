---
name: brainstorming
description: Strukturiertes Brainstorming VOR jeder größeren Änderung am Prototyp — Problem schärfen, Optionen mit Trade-offs vergleichen, Entscheidung herbeiführen, Design-Spec schreiben. Nutzen bei /brainstorming, „lass uns brainstormen", neuen Feature-Ideen, Verbesserungs-Diskussionen oder wenn unklar ist, WAS gebaut werden soll — immer bevor Code entsteht.
---

# Brainstorming — erst denken, dann bauen

Ziel: Aus einer vagen Idee wird eine belastbare Entscheidung + ein Design-Spec.
Während des Brainstormings wird **kein Code geschrieben**.

## Ablauf

1. **Verstehen.** Das eigentliche Problem hinter dem Wunsch herausarbeiten. Fragen
   stellen — eine nach der anderen, nicht als Fragebogen. Wer nutzt es im Pitch?
   Welche Geschichte erzählt es dem Investor?
2. **Kontext lesen.** Betroffene Stellen in `index.html` ansehen, existierende
   Idiome finden (CLAUDE.md → Konventionen), verwandte Specs in
   `docs/superpowers-optimized/specs/` prüfen — nichts doppelt erfinden.
3. **Optionen entwickeln.** 2–4 echte Alternativen, jede mit: Kern-Idee,
   Trade-offs, Aufwand (S/M/L), Risiko fürs Bestehende. Empfehlung zuerst nennen
   und begründen. Jede Option gegen die harten Regeln prüfen — v. a.:
   **optisch hochwertig ist nicht verhandelbar** (kein Feature als nackter Text),
   nur synthetische Demo-Daten, beide Breiten (390/1440), reduced-motion-safe.
4. **Entscheiden lassen.** Der Nutzer wählt. Nicht vorauseilend implementieren.
5. **Spec schreiben.** `docs/superpowers-optimized/specs/JJJJ-MM-TT-<slug>.md` —
   kurz, hoher Signalwert: Idee · Bausteine (mit Namespace-Plan `.xy-*`) ·
   Regeln · bewusst NICHT in diesem Schritt. Muster: bestehende Specs im Ordner.
6. **Übergabe.** Nach Freigabe des Specs weiter mit `/write-plan` (oder direkt
   umsetzen, wenn der Nutzer „zieh durch" sagt).

## Regeln

- Fragen vor Antworten; Empfehlung vor Katalog; eine Entscheidung pro Runde.
- Wenn der Nutzer schon präzise weiß, was er will: nicht künstlich aufblähen —
  Spec schreiben, bestätigen lassen, fertig.
