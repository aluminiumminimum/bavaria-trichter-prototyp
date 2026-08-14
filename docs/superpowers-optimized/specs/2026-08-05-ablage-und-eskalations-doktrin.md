# Design-Spec: Ablage-Fächer & Eskalations-Doktrin — Verschulden vs. Umstand

**Datum:** 2026-08-05 · **Status:** Entwurf, wartet auf Freigabe
**Grundlage:** GF-Feedback (via Nutzer, 05.08.): Eskalation nur bei Nicht-Einhaltung des
Service-Versprechens durch Mitarbeiter; externe Blocker brauchen stattdessen eine Ablage mit
Notiz + Automatisierung. Nutzer-Leitplanke: Die Ablage darf sich nicht zu einem
undifferenzierten Sammelbecken summieren — Gründe bleiben getrennt.

## 1. Idee — die neue Doktrin

Der Leitstand kennt heute nur „rot". Künftig trennt die Maschine zwei Welten:

- **Eskalation (Zinnober) = Verschulden.** Nur wenn WIR den Prozess reißen: Erstkontakt-Uhr
  abgelaufen ohne Aktion · Folge-Frist überzogen ohne dokumentierten Grund · Anfrage
  unbeansprucht im Pool · fälliger Netzwerk-Anlass ohne Reaktion. Eskalationen werden
  seltener und dadurch ernster — nur hier greift die Leitung ein.
- **Ablage (kein Alarm) = Umstand.** Externer Blocker, geordnet geparkt: Der Fall verlässt
  das aktive Board und liegt in einem **Grund-Fach** mit Notiz und Automatik. Kein Fall
  kann „einfach liegen bleiben" — jede Ablage hat einen Wecker.

Story fürs Pitch: Das System unterscheidet Führungsproblem von Marktrealität — und
verwandelt „kommt nicht weiter" in einen geordneten, automatischen Kreislauf statt in
rote Panik oder stilles Vergessen.

## 2. Datenmodell (additiv, läuft über `faelle` durch demoSave/demoRestore)

`f.ablage = { grund, notiz, seit, art, weckerTage, maxTage, zyklen }`

- `grund` (Pflicht, Katalog): `"Unterlagen ausstehend"` · `"Nicht erreicht"` ·
  `"Kostenklärung läuft"` · `"Rückruf zugesagt"` · `"Sonstiges"` — speist die Auswertung
  (gleiche Hebel-Logik wie Verlustgründe).
- `art`: `"zeit"` (Wiedervorlage nach `weckerTage`) oder `"ereignis"` (wartet auf
  eingehende Antwort/Unterlage; Zeit-Wecker läuft als Sicherheitsnetz trotzdem).
- `maxTage`: Max-Wartedauer je Grund (Katalog-Default) — läuft sie ab, kommt der Fall
  ZWANGSWEISE zur Wiedervorlage. Nichts verschwindet für immer.
- `zyklen`: Zähler erfolgloser Runden; ab Zyklus 3 schlägt die Wiedervorlage die
  **Archiv-Entscheidung** vor.
- Neuer Endzustand **„Archiviert"** (neben „Verloren"): Potenzial bleibt — Übergabe an den
  Patienten-Radar (`radar`-Eintrag mit Prognose aus Ablage-Grund). Verloren bleibt für
  echte Absagen.
- Status bleibt unverändert (Fall bleibt z. B. „Unterlagen") — `f.ablage` ist ein
  Parkzustand quer zum Status, KEIN neuer Pipeline-Status.

## 3. Verhalten

1. **Ablegen** (Fallakte + Board-Karte): Dialog mit Grund-Katalog (Pflicht), Notiz,
   Automatik-Wahl (vorbelegt je Grund: „Nicht erreicht" → Zeit +3 T; „Unterlagen"/
   „Kostenklärung" → Ereignis; „Rückruf zugesagt" → Zeit +1 T). Log-Eintrag im Verlauf.
2. **SLA-Pause:** `svFallState`/Eskalations-Rechnung überspringen abgelegte Fälle; die
   Uhr pausiert (Beschluss: Versprechen misst UNSERE Reaktion). Bei Reaktivierung startet
   eine neue Reaktions-Uhr („auf Antwort reagieren", Klasse des Falls).
3. **Reaktivierung:** (a) eingehende Sim-Nachricht/Dokument am Fall → sofort zurück aufs
   Board + neue Uhr + Toast; (b) Wecker abgelaufen → Wiedervorlage-Karte in Mein Tag;
   (c) maxTage erreicht → Zwangs-Wiedervorlage mit Hinweis.
4. **Archivieren:** aus der Wiedervorlage (ab Zyklus 3 vorgeschlagen) oder manuell —
   Grund-Pflicht, Radar-Übergabe automatisch, im Verlauf dokumentiert.
5. **Eskalations-Doktrin:** `svEskalationen()` lässt abgelegte Fälle aus. Frist-Eskalation
   feuert nur noch für NICHT abgelegte Fälle — wer einen externen Blocker hat, hat jetzt
   den legitimen Weg; wer einfach liegen lässt, eskaliert wie bisher.

## 4. UI — Etiketten-Sprache (optisch hochwertig, nicht verhandelbar)

- **Ablage-Fächer unter dem Board** (Namespace `.abl-*`, kollisionsfrei geprüft):
  je Grund ein „Schubfach" im Apotheken-Idiom — Karte mit Doppelrahmen, Kicker
  (Grund, Inter-Uppercase), **Cormorant-Zähler**, darin stille Fall-Zeilen (Avatar ·
  Name · Notiz-Snippet · Wecker als Mono-Chip „⏰ 08.08." bzw. Ereignis-Badge
  „wartet auf Antwort"). Leere Fächer werden nicht gerendert — die Leiste kann sich
  nicht aufblähen. Gold-Ton, wenn ein Wecker morgen fällig ist; Zinnober NUR im
  Leitstand, nie in der Ablage.
- **Board-Karte:** abgelegte Fälle verschwinden aus den Spalten (Board = nur aktiv
  Bearbeitbares); Spaltenkopf zeigt „+n abgelegt" als stillen Mono-Hinweis.
- **Fallakte:** Ablage-Zustand als eigenes Band unterm Lagebild (Grund, Notiz, Wecker,
  „Jetzt reaktivieren"-Aktion).
- **Mein Tag:** Wiedervorlagen erscheinen als Aufgaben-Karten (bestehendes mt-Idiom),
  ab Zyklus 3 mit Archiv-Vorschlag.
- **Auswertung:** neues Chart „Woran hängen Fälle?" (Ablage-Gründe, bar()-Idiom) +
  Fazit-Zeile mit Gegenmaßnahme analog VL_HEBEL.

## 5. Seeds & Schema

2 abgelegte Demo-Fälle (Unterlagen/ereignis + Nicht erreicht/zeit, Wecker morgen),
1 archivierter Fall mit Radar-Eintrag; `DEMO_SCHEMA`-Bump. Zeitraffer-Demo (`svZeitraffer`)
spult auch Wecker vor, damit der Kreislauf vorführbar ist.

## 6. Bewusst NICHT in diesem Schritt

Echte E-Mail-/Fax-Ereignisse (bleibt Simulation) · konfigurierbare Kataloge/Fristen im UI ·
Mehrstufen-Genehmigung fürs Archivieren · Ablage für Eingangs-Anfragen (nur Fälle).

## Regeln

Welt-Token strikt (Zinnober nur Leitstand) · beide Breiten + Screenshots vor Push ·
reduced-motion-safe · rendert ohne JS · eigene Namespaces, Fremdcode chirurgisch.
