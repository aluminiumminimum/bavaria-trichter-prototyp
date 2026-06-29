# Design — „Die Patienten-Matrix" Expansion

**Date:** 2026-06-29
**Repo:** bavaria-trichter-prototyp (Klinik Bavaria „Privatpatienten-Maschine" prototype)
**File touched:** `index.html` (single self-contained file — inline CSS/JS, German, synthetic demo data only)
**Source of requirements:** WhatsApp voice message 2026-06-29 (transcript in `~/Projects/transcribe/out/`), relaying founder „Michael's" two concrete work orders.

## Context

The prototype is a clinic-staff dashboard for converting private-pay rehab patients. Today it covers essentially **one cell** of Michael's mental model: the B2C admission funnel (Eingang → Fälle/Board → Aufnahme). Michael reframed the whole product as a **2×3 matrix** and asked to make every cell real, plus a ClickUp-style patient journey, 1–5 lead scoring, and referrer-facing screens.

The matrix (and the gaps it exposes):

|  | vor der Reha | in der Reha | nach der Reha |
|---|---|---|---|
| **B2B** (Zuweiser) | ⚠️ internal-only today → **Zuweiser-Portal** | ❌ → **Dashboard/Tagesberichte** | ❌ → **Dashboard/Abschluss** |
| **B2C** (Patient direkt) | ⚠️ no scoring today → **Lead-Scoring 1–5** | ✅ Fälle/Board (exists) | ❌ → **Nachsorge/Reaktivierung** |

## Scope

Single iteration, full build of all five areas:
1. **Matrix view** — new top-level view; the 2×3 grid as the navigational spine.
2. **Werdegang stepper** — new sub-tab under Fälle; ClickUp-style step timeline with timing, two entry paths.
3. **B2C Lead-Scoring 1–5** — enhance Netzwerk → Bestand with tiers, sources, automations, passive brochure leads.
4. **Zuweiser-Portal** — referrer-facing demo screen (capacity, register, upload).
5. **Zuweiser-Dashboard** — referrer-facing demo screen (Tagesberichte while in-Reha; discharge letters/recommendations after).

## Non-goals

- No real backend, auth, or email sending. Referrer screens are **demo persona overlays** with synthetic data; automations are shown as *status*, never actually sent (consistent with existing Datenschutz/Kontaktfreigabe framing).
- The **130 000-Einträge AI-Liste / Klinik-Chefarzt-Zuordnung** cleanup is **out of scope** — that is Pascal's separate data task, mentioned only as a status update in the voice message.
- Desktop (≥900px) is secondary but must not visibly break.
- No new external dependencies; stay single-file, inline.

## Architecture & data flow

Additive extension of the existing pattern: data arrays at top of `<script>`, per-area `render*()` functions, all wired through `renderAll()`; live numbers mirrored to SVG/HTML via `data-sync="<id>"`. Visual identity preserved (Cormorant Garamond + Inter; taupe `#9B8573` / sand `#bca37d` / beige `#E3D4C8` / espresso `#1F1C1C` / gold). Mobile-first: every new module ships a 390px layout first; desktop grid is the enhancement.

### Navigation
- Add 5th view `view-matrix` to the bottom bar: **Heute · Fälle · Netzwerk · Matrix · System**. Short labels + icons; target ~78px/item at 390px.
- **Fallback if 390px is too tight (build-time gate):** fold System into the Matrix view (Idee/Auswertung/SOPs reachable from matrix cells), returning the bar to 4 visible items.

### Data model extensions
- `bestand[]`: add `stufe` (1–5), `quelle` (`Altpatient` | `Broschüre-Download` | `Website-Mail`), `auto` (next automation text). Add ≥3 brochure-download passive-lead entries (Stufe 1–2).
- `faelle[]`: add `schritte[]` — ordered steps `{label, who, ts, dauerMin, done}`. Populate for ≥2 exemplar cases (one active-inquiry, one passive-brochure); derive a generic stepper for the rest from existing `log`/`status`.
- New `belegung[]` — free places per Achse × week (for Portal Auslastung).
- New `tagesberichte[]` — per active in-Reha patient (for Dashboard).
- New `entlassDoc` — one demo discharge letter + recommendations.
- New `MATRIX` config — 6 cells `{row, col, titel, zweck, metricId, status, route}`.

### Interfaces / new functions
- `renderMatrix()` — builds the 6 cells, fills `data-sync` metrics, wires cell tap → `go(view, sub)` or `openReferrer(screen, zuweiserName)`.
- `renderWerdegang()` — renders exemplar cases as steppers; `stepper(fall)` helper reused in `openDetail`.
- `renderBestand()` — extended: tier-grouped, Stufe legend + filter, per-tier automation note.
- `openReferrer(screen, zName)` / `closeReferrer()` — full-screen persona overlay with banner „Ansicht: Zuweiser-… · <Klinik>" + „Zurück zur Klinik-Ansicht". `screen ∈ {portal, dashboard}`; dashboard has internal tabs Laufend/Abgeschlossen.
- `renderAll()` extended to call `renderMatrix()` and `renderWerdegang()`.

### Matrix cell metric sources (pinned, to avoid double-counting)
- B2B·vor → count of `zuweiser` with `status` aktiv/aufbau · B2B·in → active in-Reha demo patients · B2B·nach → discharged-with-letter count.
- B2C·vor → `bestand` count (all tiers) · B2C·in → `offeneFaelle()` length · B2C·nach → `bestand` with `wv:true` (Wiedervorlage).

## Error / empty states

Static demo, but: every list renders an empty-state string if its array is empty; the referrer overlay is keyboard-dismissible (Esc) and scroll-locks the body (reuse existing `locked` pattern); mock forms are non-submitting (buttons show a toast „Demo — nicht aktiv").

## Testing strategy

Manual, against the live constraints (no automated suite in repo):
1. **No regressions:** all 4 existing views + their sub-tabs still render; `data-sync` numbers on Heute/funnel unchanged.
2. **390px gate:** no horizontal scroll; bottom bar 5 items fit; 44px touch targets; 16px inputs. If failing → apply System-fold fallback.
3. **Matrix routing:** each of 6 cells taps through to the correct view/screen and back.
4. **Werdegang:** both entry paths render with timing; passive-brochure case is consistent with its Bestand Stufe-2 entry (shared persona).
5. **Referrer overlay:** persona banner visible, „Zurück" returns to clinic view, no data leaks between personas.
6. **Desktop ≥900px:** matrix shows true 2×3 grid; nothing overlaps.

## Rollout

Commit incrementally per module (feat: per area). Push to `main`; GitHub Pages rebuilds in ~1–2 min. Verify on the live URL at 390px before declaring done.

## Failure modes (from adversarial check)

1. **5th nav item overflows 390px** — *highest risk* (iPhone-first). Mitigation: short labels + build-time 390px verification; fallback = fold System into Matrix (back to 4 items). Not design-blocking.
2. **Persona overlay reads as clinic screen** — mitigation: strong banner + back button. Minor.
3. **Regressions in 137 KB file** — mitigation: strictly additive, existing functions untouched, full re-test. Minor.
4. **Matrix metrics indefensible** — mitigation: metric sources pinned above. Minor.
