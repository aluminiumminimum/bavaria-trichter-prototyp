# Design-Spec: „Service-Versprechen" — SLA-Uhren & Eskalation (Anfragen + Fälle)

**Datum:** 2026-07-31 · **Branch:** `claude/app-threads-visibility-l4c6ed` · **Status:** in Umsetzung
**Grundlage:** Brainstorming 31.07. (SLA + Eskalationsleiter). Nutzer-Entscheidungen (fix):
**kein harter Zwang** — Sichtbarkeit + Eskalation als Rahmen, der Dringlichkeit suggeriert ·
**festes, gutes Regelwerk** von uns definiert, fügt sich nahtlos in die Maschinerie ·
**Scope: Anfragen + Fälle** (Netzwerk/Fällige später).

## 1. Ziel

Kein Fall bleibt liegen, kein Fall geht still verloren. Jede Anfrage und jeder Fall trägt eine
sichtbare Uhr aus einem festen Regelwerk („Service-Versprechen"). Läuft sie ab, entsteht
automatisch eine **Eskalation an die Leitung** mit Pflicht-Entscheidung (neu zuweisen /
selbst klären / Frist begründet anpassen) — kein stilles Wegklicken. Erzähl-Anker: Hans
Keller, verloren nach 26 Std. Reaktionszeit.

## 2. Regelwerk (eine Quelle: `SV_REGELN`)

| Klasse | Wer | Erstkontakt | Ton |
|---|---|---|---|
| **A · heiß** | Zuweiser-Kanal (Fax/Recare/direkt/PRIMO) oder 4–5 Sterne | **2 Std.** | Gold ab 50 % Restzeit, Zinnober bei Verstoß |
| **B · warm** | übrige qualifizierte Anfragen | 4 Std. | dito |
| **C · Lead** | passive Kontakte | 24 Std. | leise |

Nach dem Erstkontakt übernimmt die bestehende **Folge-Frist** (`f.frist`, `fristKlasse()`):
überfällige Folgefrist ≥ 1 Tag ⇒ ebenfalls Eskalation. Klassifizierung leitet das System ab
(Signale/Sterne/Kanal) — Mitarbeiter entscheiden nicht selbst über Dringlichkeit.

## 3. Bausteine

1. **JS** `sv*`-Funktionen: `svRegel(kl)`, `svKlasseEingang(m)`, `svKlasseFall(f)`,
   `svElapsedMin(zeitStr)` (parst „vor 25 Min." / „vor 2 Std." / „gestern" / „vor 2 Tagen"),
   `svEingangState(m)` / `svFallState(f)` → `{kl,rest,over}`, `svChipHtml(state)`,
   `svEskalationen()`. Keine Mutation beim Berechnen; Leitungs-Aktion stempelt `f.svAktion`.
2. **Eingang** (`mailRow` + Pool-Karten in Mein Tag): Klassen-Chip + Restzeit-Pille;
   „Braucht Entscheidung" sortiert nach Restzeit (knappste zuerst).
3. **Board** (`makeFallKarte`): Fälle in „Neu" ohne Erstkontakt (`reaktion==null`) zeigen
   die Erstkontakt-Uhr statt nur der Tages-Frist. Neuer Seed-Anker: Anna Muster bekommt
   `eingangZeit:"vor 3 Std."` → A-Verstoß (+1:00) als Demo-Eskalation.
4. **Heute (Leitung)**: neues Panel **„Eskalationen · Service-Versprechen"** (Zinnober-Kicker,
   nur sichtbar wenn n>0) vor „Heute wichtig". Je Zeile: Fall/Anfrage, Verstoß, Owner,
   Pflicht-Aktionen: *Neu zuweisen* (Owner-Select) · *Frist neu mit Grund* (Pflichtfeld) ·
   *Akte öffnen*. Aktion ⇒ Log-Eintrag + `rpToast` + Panel leert sich.
5. **Heute wichtig** (`renderWichtig`): SLA-Verstöße als oberste Priorität (p:-120).
6. **Konzept → SOPs**: statische Regelwerk-Karte (`process-card`) — die Staffel als Tabelle
   plus Eskalationsleiter in 3 Schritten (Nudge → Leitung → Wiedervorlage).

## 4. Namespace & Regeln

- CSS **`.sv-`**, JS-Präfix **`sv`** — kollisionsgeprüft (0 Treffer). CSS als EIN kommentierter
  Block vor `</style>`, kein `*/` in Kommentar-Prosa.
- Farben strikt Welt-Token: ruhig = Papier/Jade-Hairline, Warnung = Gold-Familie
  (`--brass-deep` für Text), Verstoß = Zinnober-Familie. Keine neuen Keyframes, keine Animation
  (statisch berechnete Restzeit — Demo läuft keine Stunden; Zeitraffer-Erzählung existiert in Call AI).
- Beide Breiten prüfen (390 / ≥1024): kein Overflow, 0 Console-Errors. Seite rendert ohne JS
  (Panel ist leer, Chips fehlen — kein Layoutbruch).
- Fremde Funktionen nur chirurgisch erweitern (1 Einfüge-Zeile in `mailRow`, `makeFallKarte`,
  `renderWichtig`, `renderHeute`, Pool-Karte).

## 5. Nicht in diesem Schritt (bewusst)

Team-Ansicht-SLA-Ampel je Mitarbeiter · Auswertung „⌀ Erstkontakt vs. Ziel" · Netzwerk-Fällige
(Radar/Rückrufliste) · tickende Live-Uhren. Alles Folge-Iterationen, Scope-Entscheidung Nutzer.
