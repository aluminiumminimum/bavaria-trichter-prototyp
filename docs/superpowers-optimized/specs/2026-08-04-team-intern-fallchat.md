# Design-Spec: „Team intern" — fallbezogene interne Kommunikation + Nachfrage-Option

**Datum:** 2026-08-04 · **Branch:** `claude/app-threads-visibility-l4c6ed` · **Status:** in Umsetzung
**Grundlage:** Nutzer-Feedback 04.08.: „Es muss erstmal die Option einer internen Kommunikation
geben — dass man die Mitarbeiter fragt: Was ist hier los? … insgesamt ein blinder Fleck:
eine interne Kommunikationsstruktur, am besten fallbezogen."

## 1. Idee

Führung beginnt mit der Frage, nicht mit der Umverteilung. Die Eskalation bekommt als **erste
Option „Nachfragen bei <Mitarbeiter>"**; die Antwort kommt in einen **fallbezogenen internen
Thread („Team intern")**, der in jeder Fallakte lebt — dieselbe Struktur, die das Team auch
ohne Eskalation nutzt, um sich fallbezogen zu schreiben. Nichts verlässt das Haus, alles
bleibt am Fall.

## 2. Bausteine (Namespace `.tmi-*` / `tmi*` — kollisionsgeprüft; „tn/im" verworfen wg. btn-/…-Kollision)

1. **Datenmodell:** `f.chat=[{von,txt,ts}]` — lazy angelegt, läuft über `faelle` automatisch
   durch `demoSave`/`demoRestore` (kein Schema-Bump nötig). Jede Nachricht wird zusätzlich als
   `„💬 intern · <von>: <txt>"` in `f.log` gespiegelt — Doku-Prinzip „nichts verschwindet".
2. **Leitstand · Entscheidungs-Panel** (Fall-Zeilen): zwei Werkzeug-Gruppen (`.tce-pgrp`):
   - **Gruppe 1 (zuerst): NACHFRAGEN BEI <owner>** — Freitext-Eingabe (Default: „Kurzer
     Zwischenstand bitte — die Anfrage liegt über dem Service-Ziel.") + Senden (auch Enter).
   - Gruppe 2: Neu zuweisen an … · oder · Frist neu mit Grund… · Akte öffnen › (wie gehabt).
   Die Zeile zeigt den Dialogstand unter dem Kontext: „Nachfrage gestellt — Antwort ausstehend"
   (Gold) bzw. „💬 <owner>: ‚<Antwort>'" (Jade). Die Eskalation bleibt offen — Nachfragen löst
   den Verstoß nicht, es beginnt die Klärung.
3. **Gescriptete Antwort** (Prototyp, Human-in-the-loop): ~7 s nach der Nachfrage antwortet
   der Mitarbeiter fallbezogen aus `tmiAutoAntwort(f)` — abgeleitet aus dem Fallzustand
   (nicht erreicht ⇒ Wiedervorlage · Kosten offen ⇒ Kassen-Warteschleife · Docs fehlen ⇒
   Zuweiser-Erinnerung · sonst Rückruf-Zusage) + Toast „Antwort von <owner>".
4. **Fallakte · neuer Abschnitt „Team intern"** (Kontext-Spalte, nach „Kommunikation &
   Verlauf"): Thread als Bubbles (eigene rechts/Jade-Hairline, fremde links/Papier, Absender
   als Micro-Label) + Eingabezeile. Absender = aktuelle Rolle (`ma-mode` ⇒ „S. Koordination",
   sonst „Leitung") — der Rollen-Schalter macht das Zwei-Seiten-Erlebnis vorführbar.
   Manuelle Nachrichten scripten KEINE Auto-Antwort (nur die Eskalations-Nachfrage).

## 3. Regeln

CSS additiv im SV-AUSBAU-Block; Welt-Token (Bubbles Papier/Cream2, Radius 4/1px-Ecke,
Micro-Label Inter uppercase brass-deep). Fremdcode-Berührung: 1 HTML-chap in der Fallakte,
1 Render-Zeile in `renderFallakte`. Beide Breiten + 1920, Screenshots gesichtet, 0 Errors.

## 4. Nicht in diesem Schritt (bewusst)

Fallübergreifender Posteingang je Mitarbeiter (Mein-Tag-Badge „2 neue Nachrichten") ·
@-Erwähnungen · Ungelesen-Zähler · echte Mehrbenutzer-Sync. Folge-Iterationen.
