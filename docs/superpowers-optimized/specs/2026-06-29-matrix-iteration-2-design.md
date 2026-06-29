# Design — Patienten-Matrix Iteration 2 (+ Premium-Luxus-Pass)

**Date:** 2026-06-29
**Repo:** bavaria-trichter-prototyp · single file `index.html` (inline CSS/JS, German, synthetic demo data)
**Source:** Voice memo 2026-06-29 18:27 (transcript in project folder) — Michael's iteration feedback on the shipped Patienten-Matrix.
**Builds on:** `docs/superpowers-optimized/specs/2026-06-29-patienten-matrix-design.md` (iteration 1, live).

## Scope

Large iteration, all approved in one pass. Five modules + a cross-cutting premium design pass:
1. **Matrix re-mapping** — B2C row: vor = Intake, in = Behandlung/Reha-KPIs (new), nach = Nachsorge.
2. **„Patient in der Reha" + Reha-KPIs** — new `inReha[]` model feeding an internal monitoring view *and* the referrer dashboard.
3. **Fälle vs. Datenbank** — typed Anfragen (qualifiziert→Fälle / passiv→Datenbank); Datenbank gets Liste + Kanban-Board.
4. **Fall-Detail-Rework** — Werdegang as second track in the detail (separate tab removed), task-auto-advance, person-assignment on takeover, fewer demo Fälle.
5. **Zuweiserportal-Details** — referrer cockpit „Meine Patienten" (live status: in Reha → KPIs, entlassen → Abschlusspaket).
6. **Premium-Luxus-Design pass** — cross-cutting; applies to every new and touched surface.

## Non-goals

No real backend/auth/email send (automations shown as status). 130k AI-list cleanup out of scope (Pascal). Synthetic demo data only. Desktop secondary but must not break. No new nav item (stay at 5; 390px-safe).

## Premium design language (cross-cutting — applies to all modules)

The base identity (Cormorant Garamond + Inter; espresso `#1F1C1C`, taupe `#9B8573`, sand `#bca37d`, beige `#E3D4C8`, paper, gold accent) stays — this pass *elevates* it:

- **KPI visualisation, not flat bars:** Barthel-Index, FIM and Reha-Ziel render as thin **circular progress rings** (gold stroke on a hairline track) with the value set in **Cormorant Garamond**; the Aufnahme→aktuell delta shown as a small gold ▲. Verweildauer = a refined horizontal track with Ist-fill + a Plan-marker tick + „Rest X Tage".
- **Cards:** layered paper bg, 1px hairline `#E3D4C8`, ~16–18px padding, soft shadow; SalutoCare/Premium cards get a subtle **gold corner crest**. Consistent 8px spacing rhythm.
- **Type discipline:** big numbers/section kickers in Cormorant; labels in Inter, uppercase, letter-spaced; one type scale reused everywhere.
- **Colour discipline:** gold `#bca37d` is the single "premium/aktiv" accent; status colours (green/amber/red) stay muted/desaturated as established. No new hues.
- **Micro-interactions:** 150–200ms ease transitions on overlay open/close, tab switches, the case-detail track reveal, and desktop hover-lift on board cards. Honour `prefers-reduced-motion` (disable transforms).
- **Polish details:** styled empty states (never raw), aligned baseline grids, tabular-nums for KPI figures, hairline dividers instead of heavy borders.

Each module below must meet this bar; "looks acceptable" is not the target — it is a luxury concierge product.

## Architecture & data flow

Additive/refactor within the one file. New data arrays at top of `<script>`; new `render*()` wired through `renderAll()`; live numbers via `data-sync`/ids. Mobile-first 390px; desktop ≥900px enhancement. Verify 390px via Chrome device-emulation (`emulate 390x844x3,mobile`) — the headed window won't shrink below ~500px, so emulation is the source of truth.

### IA changes
- **Fälle** sub-tabs: `anfragen · board · inreha` (new). **Werdegang sub-tab removed** → into `openDetail`.
- **Netzwerk → „Altpatienten"** relabelled **„Datenbank"**, with an internal **Liste / Board** toggle (not a nav sub-tab — a segmented control inside the panel).
- `SEGS.faelle = ["anfragen","board","inreha"]`.
- Matrix `MATRIX` B2C routes: vor→`["faelle","board"]`, in→`["faelle","inreha"]`, nach→`["netzwerk","bestand"]`.

### Data model
- **New `inReha[]`** (absorbs/replaces `tagesberichte[]`): `{name, alter, achse, owner, icd, aufnahme, verweildauer:{ist,plan}, barthel:{auf,akt}, fim:{auf,akt}, ziel (0-100 %), eintraege:[{d,txt}]}`. Demo: Dieter Franke (Ortho, M17.1 Gonarthrose), Elke Sauer (SalutoCare), +1 Neuro.
- **`eingang[]`** gains `typ: "qualifiziert" | "passiv"`. Add ≥2 passive demo items (Broschüre-Download, lose Mail). Passive items route to Datenbank, not Fälle.
- **`bestand[]`** (now "Datenbank") gains `board` (kanban column: `neu | ansprache | reagiert | uebergabe | ruhend`) and keeps `owner`/`stufe`/`quelle`/`auto`.
- **`faelle[]`** reduced 12→~6 (one per pipeline stage + one Verloren; **keep id:3 with `schritte`**). All derived numbers (board counts, Heute, charts) must stay consistent.
- **Team list** const `TEAM = ["S. Koordination","M. Belegung","T. Abrechnung","Recovery Manager"]` for assignment selects.

### Interfaces / functions (new or changed)
- `renderInReha()` — internal In-Reha monitoring cards (KPI rings + Verweildauer + daily reports). New `kpiRing(value,max,label)` helper (inline SVG ring).
- `renderDashboard()` — migrate from `tagesberichte` to `inReha`; "Laufend" now shows the same KPI rings (shared with internal view).
- **Extend `renderBestand()` in place** (keep the function name so `wiedervorlage()` and `renderAll()` stay intact; only the UI label becomes „Datenbank"). Add `dbView` state (`liste|board`) + `setDbView()`: Liste = existing tier cards; Board = kanban by `board` column.
- `uebernehmen(id)` — qualified path; now opens a small assignment step (select owner from `TEAM`) before creating the Fall. New `inDatenbank(id)` — passive path; adds the inbox item to `bestand` as a staged lead.
- `openDetail(id)` — add a Werdegang track (reuse `stepper(f.schritte)`), desktop two-column / mobile stacked `<details>`. Add an interactive **task-advance** control: a primary "Aufgabe erledigt → nächster Schritt" button that advances `f.status` to the next `STATUS`, pushes a log entry, marks the matching `schritt.done`, and re-renders. Status dropdown remains the manual override (single source of truth = `f.status`).
- Remove `renderWerdegang()` and the `werdegang` sub-tab markup.
- `renderPortal()` — add „Meine Patienten" section: per referred patient, live status → in Reha (KPI summary + link to dashboard) or entlassen (Abschlusspaket link).
- `renderAll()` updated: drop `renderWerdegang`, add `renderInReha`; `renderBestand` call stays (now the Datenbank renderer).

### Matrix cell metrics (re-pinned)
- B2C·vor → `offeneFaelle().length` Fälle · B2C·in → `inReha.length` in Reha · B2C·nach → `bestand.filter(b=>b.wv).length` Wiedervorlagen.
- B2B unchanged in source, but B2B·in metric now reads `inReha.length`.

## Error / empty states
Every list/board column renders a styled empty state. Task-advance is a no-op past the final actionable stage (Aufgenommen). Assignment select defaults to the current owner. Overlays keep Esc + scroll-lock.

## Testing strategy (manual, no test runner)
Per task: grep markers + `node` JS-parse, then Chrome 390px-emulation render check. Final whole-branch regression (DOM eval):
1. No regressions: all existing views/sub-tabs render, 0 JS errors, Heute funnel numbers consistent with reduced Fälle.
2. 390px: no horizontal overflow anywhere incl. In-Reha cards, Datenbank board, Fall-Detail two-track (stacked).
3. KPI rings render with correct values; Verweildauer Ist/Plan/Rest correct.
4. Anfragen typing: qualified→Fälle, passive→Datenbank.
5. Datenbank Liste/Board toggle; board columns populated; assignment works.
6. Fall-Detail: Werdegang track visible; task-advance moves status + logs + updates stepper; manual dropdown still works.
7. Referrer dashboard reads `inReha` (no broken `tagesberichte` ref); Portal „Meine Patienten" links resolve.
8. Premium pass: rings/transitions present; `prefers-reduced-motion` respected; desktop ≥900px two-column detail.

## Rollout
Feature branch `feat/matrix-iter2`; commit per module; final regression at 390px; merge→main→Pages on user go-ahead (production pitch URL).

## Failure modes (from adversarial check)
1. **Fall-Detail two-track breaks 390px** (highest). → mobile stacked + collapsible `<details>`; verify at 390px.
2. **`tagesberichte`→`inReha` migration breaks referrer dashboard.** → migrate `renderDashboard`, full regression.
3. **Task-advance vs. status dropdown = two sources of truth.** → both write `f.status`; advance is convenience, dropdown is override.
4. **Fewer Fälle breaks board/charts/Heute numbers.** → keep demo data coherent, re-pin all derived counts, regression-test.
