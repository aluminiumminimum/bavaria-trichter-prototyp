# Spec — Design v2: Premium Readability & Polish Pass

**Datum:** 2026-06-30
**Datei:** `index.html` (single self-contained, inline CSS/JS)
**Status:** Autonom freigegeben (User AFK, „nimm immer recommended settings, ohne Rückfragen"). Review-Gates bewusst übersprungen lt. User-Anweisung.

## 1. Ziel & Kontext

Der Prototyp ist visuell bereits „Concierge"-poliert, aber: **viele Mikro-Labels sind zu klein** (27× 11px, 26× 12px, 21× 11.5px — meist uppercase + starkes letter-spacing → schlecht lesbar). Konkret vom User benannt: Matrix-Zeilenlabels „Zuweiser (B2B)" / „Patient direkt (B2C)" (`.mx-rowlbl` 12px) „viel zu klein". Auftrag: **gesamter Design-Overhaul über alle Seiten** — alles besser lesbar, Schriftgrößen systematisch angehoben, Trennlinien zwischen Boxen, next-level/premium/luxury, mehr (tasteful) Animation, alles schicker.

Gilt für ALLE Views: **Heute, Fälle, Netzwerk, Matrix, System** + Referrer-Overlays (Portal/Dashboard). Beide Breiten — **390px (mobil) und 1440px (Desktop)** — müssen top aussehen, lesbar bleiben, **kein horizontaler Overflow**.

## 2. Identität (bleibt)
Cormorant Garamond + Inter; Palette espresso/taupe/sand/brass/sage. **Kein** Font-Wechsel, **kein** Brand-Redesign, **kein** DOM-Umbau der Views (Desktop-Shell + Master-Detail aus letzter Iteration bleiben intakt).

## 3. Die drei Layer

### Layer A — Typografie / Lesbarkeit (Kern)
Ein klarer 6-Stufen-Type-Scale; die vielen Mikro-Labels werden auf lesbare Minima angehoben, übertriebenes letter-spacing reduziert (over-spacing schadet der Lesbarkeit bei kleinen Größen).

| Tier | Verwendung | Vorher (Beispiele) | Ziel |
|------|-----------|--------------------|------|
| Display | Cormorant-Headlines | 26–64px | unverändert |
| Title | Karten-/Sektionstitel | 16–24px | ≥16px (kleine auf 16–17 anheben) |
| Body | Fließtext/Beschreibung | 13–14.5px | **≥14px** |
| Label | sekundär/meta (sentence-case) | 11.5–12.5px | **≥13px** |
| Eyebrow | uppercase Mikro-Labels | 10–12px, ls .12–.32em | **≥12.5px**, ls ≤ .14em |
| Badge/Pill | Chips/Badges | 10–11px | **≥11.5px** (Padding nachziehen) |

**Höchste Priorität (vom User benannt / am sichtbarsten):**
- `.mx-rowlbl` (Zuweiser B2B / Patient B2C): 12px → **16px**, mehr Gewicht, mit Gold-Hairline darunter.
- `.mx-col` (vor/in/nach der Reha): 11px → **13px**.
- `.mx-cell p` (Zellen-Beschreibung): 13px → **14px**; `.mx-cell h4` 16 → 17.

Weitere Eyebrow-Offender (alle → ≥12.5px, ls ≤.14em): `.kicker`, `.ns-l`, `.t-kicker`, `.col h3`, `.zcat .zl`, `.map-title`, `.zstat`, `.zcard .ztyp`, `.zcontact small`, `.bestand-stat .sl`, `.tier-group>h4`, `label`, `.sheet-head .sh-k`, `.help-contact .role`, `.template-card .role`, `.hub-box .kicker`, `.g-stat span`, `.chtag`, `.route-card .rlabel`. Label-Tier (→ ≥13px): `.g-date`, `.res-cell span`, `.zcat .zn`, `.bestand-stat .sn`, `.tier-legend`, `.soft-pill`, `.tr-auto`, `.route-card .rnote`, `.stp small`.

### Layer B — Premium-Polish (Trennlinien, Karten, Akzente)
- **Trennlinien zwischen Boxen** (vom User gewünscht): Hairline-Separatoren zwischen gestapelten Listen-Zeilen (Heute-„wichtig", Datenbank-Zeilen, Zuweiser-Zeilen, Template-/Help-Karten) und **zwischen Matrix-Zellen** + klarer Divider zwischen B2B- und B2C-Zeile.
- **Matrix-Zellen premium:** definierte Borders als saubere Divider, dünne Gold-Top-Hairline (wie `.card::before`-Motiv), Hover-Lift, etwas mehr Innenabstand.
- **Karten konsistent:** dünne Gold-Top-Hairline-Akzente, verfeinerte Schatten, konsistenter Radius/Spacing-Rhythmus.

### Layer C — Animation (tasteful)
- **Staggered Fade-Up Entrance** für Grid-/Listen-Kinder (CSS `@keyframes` + `nth-child`-Delays, kurze Dauer ~.4s, kleiner Offset ~8px) — nur auf View-Ebene, nicht verschachtelt.
- **Hover-Lift** verfeinert auf interaktiven Karten (Matrix-Zellen, Fälle, Zuweiser, Datenbank) — baut auf bestehendem `@media(hover:hover)` auf.
- Flowing-Line-Motiv (vom Heute-Trichter) wo es passt.
- **Alles unter `prefers-reduced-motion`** abgeschaltet (globaler Block existiert bereits).

## 4. Architektur (low-risk, single file)
- Auslieferung als **organisierte, klar kommentierte CSS-Blöcke am Ende von `<style>`** („DESIGN-V2 — Typography / Dividers+Cards / Matrix / Motion"), die per Source-Order überschreiben (funktioniert auch für `font:`-Shorthand-Klassen — späteres explizites `font-size` gewinnt).
- **Source-Edits nur dort**, wo ein Append-Override nicht greift (inline `style=` oder höhere Spezifität) — minimal.
- Jeder Concern = eigener Block → reviewbar, revertierbar, kleiner Blast-Radius.
- **Invariante:** hält bei 390px (kein Overflow, keine geclippten/falsch umbrechenden Labels) UND 1440px.

## 5. Non-Goals
- Kein DOM-/View-Strukturumbau; keine neuen Daten; kein Backend; kein Font-Wechsel; kein Logo/Brand-Redesign.
- 130k-AI-Liste / Klinik-Chefarzt-Cleanup = Pascals Task, out of scope.

## 6. Failure-Modes & Mitigations
1. **390px-Overflow durch größere Fonts (kritisch):** uppercase + letter-spacing kann in schmalen Karten/Pills umbrechen/überlaufen. → Maßvolle Bumps (nicht riesig), letter-spacing gleichzeitig senken, JEDE View bei 390 mit Overflow-Check verifizieren, pro Offender nachtunen.
2. **Override greift nicht (mittel):** inline `style=` / höhere Spezifität schlägt Append-Override. → Audit; betroffene Fälle am Source editieren.
3. **Animation zu viel/janky (mittel):** Stagger auf jeder Liste wirkt busy/langsam. → Subtil (kurze Dauer, kleiner Offset), nur View-Container, reduced-motion respektiert.
4. **Pills/Badges brechen mit größerem Text (mittel):** → Text moderat anheben, Padding anpassen, Umbruch prüfen.

## 7. Testing / Verifikation
- Chrome MCP bei **390px UND 1440px** über alle 5 Views + Referrer-Overlays: Labels lesbar, **0 horizontaler Overflow**, kein geclippter/schlecht umbrechender Text, 0 Console-Errors. Screenshots der Schlüssel-Views (Matrix, Heute, Netzwerk, Fälle, System).
- Pro Task: grep-Marker + (CSS-only → kein JS-Bruch) `node`-Parse-Sanity + Visual-Gate.

## 8. Rollout
- Branch `feat/design-v2`, Tasks via subagent-driven-development. Nach Verifikation **merge→main → live auf Pitch-URL** (User hat Deploy autonom freigegeben).
