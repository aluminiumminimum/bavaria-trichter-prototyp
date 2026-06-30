# Design v2 — Premium Readability & Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-optimized:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site-weiter Lesbarkeits- & Premium-Lift des Prototyps (alle Views, 390px + 1440px) — Mikro-Labels lesbar, Matrix-Labels groß, Trennlinien, mehr Premium/Animation — ohne DOM-Umbau.

**Architecture:** Single-file `index.html`, **CSS-only**. Jeder Task hängt EINEN klar kommentierten `@media`-freien bzw. gezielten CSS-Block direkt **vor `</style>`** an; späterer Source-Order überschreibt frühere Regeln gleicher Spezifität (greift auch für `font:`-Shorthand-Klassen — späteres explizites `font-size` gewinnt). Selektoren spiegeln exakt die Original-Selektoren (inkl. Deszendant-Selektoren) für korrekte Spezifität.

**Tech Stack:** HTML/CSS3 (Custom Properties, `@keyframes`, `prefers-reduced-motion`). Kein JS-Change, keine Dependencies.

**Assumptions:**
- Assumes die Typo-Offender sind **klassen-basiert** (kein inline `style=` für diese Labels) — Append-Overrides erreichen sie. Will NOT reach inline-styled text → Task 6 auditiert & editiert solche am Source.
- Assumes der globale `prefers-reduced-motion`-Block (`*{animation:none!important}`) neutralisiert neue Animationen; Entrance-Keyframes setzen `opacity:0` NUR im Keyframe-`from`, nie in der Basisregel → unter reduced-motion bleiben Elemente sichtbar (opacity default 1). Will NOT hide content.
- Assumes Mobile 390px ist eng — größere uppercase-Labels können umbrechen/überlaufen; deshalb maßvolle Bumps + letter-spacing-Senkung + Visual-Gate pro Task.

---

## File Structure
- **Modify only:** `/Users/andreschlender/Projects/Arasch/index.html` — fünf neue `/* DESIGN-V2 … */` CSS-Blöcke vor `</style>` (Tasks 1–5), plus evtl. Source-Tweaks in Task 6.

## Verifikations-Helfer
**CSS-Sanity (kein JS verändert → muss weiter parsen):**
```bash
node -e "const fs=require('fs');const h=fs.readFileSync('/Users/andreschlender/Projects/Arasch/index.html','utf8');const m=h.match(/<script>([\s\S]*)<\/script>/);new Function(m[1]);console.log('JS OK')"
```
**Visual-Gate (Orchestrator):** Chrome MCP `emulate 1440x900x1` UND `emulate 390x844x3,mobile,touch`. Pro Task die betroffenen Views: Labels lesbar, **kein H-Scroll**, kein geclippter/falsch umbrechender Text, 0 Console-Errors.

---

### Task 1: Typografie A1 — Eyebrow/Micro-Labels lesbar (≥12.5px, ls ≤.16em)

**Files:** Modify `index.html`

- [ ] **Step 1: CSS-Block vor `</style>` einfügen**

```css
/* ===== DESIGN-V2 A1 — Eyebrow/Micro-Labels lesbarer ===== */
.kicker{font-size:13px;letter-spacing:.16em}
.hub-box .kicker{font-size:12.5px}
.g-stat span{font-size:12px;letter-spacing:.06em}
.ns-l{font-size:12.5px;letter-spacing:.12em}
.t-kicker{font-size:12.5px;letter-spacing:.16em}
.col h3{font-size:12.5px;letter-spacing:.07em}
.col h3 .cnt{font-size:12.5px}
.zcat .zl{font-size:12.5px;letter-spacing:.1em}
.map-title{font-size:13px;letter-spacing:.13em}
.zstat{font-size:12px;letter-spacing:.07em}
.zcard .ztyp{font-size:12.5px;letter-spacing:.06em}
.zcontact small{font-size:11.5px;letter-spacing:.08em}
.bestand-stat .sl{font-size:12.5px;letter-spacing:.1em}
.tier-group>h4{font-size:13.5px;letter-spacing:.04em}
label{font-size:12px;letter-spacing:.08em}
.sheet-head .sh-k{font-size:12px;letter-spacing:.2em}
.help-contact .role,.template-card .role{font-size:12.5px;letter-spacing:.12em}
.route-card .rlabel{font-size:12.5px;letter-spacing:.07em}
.chtag{font-size:12px;letter-spacing:.07em}
.t-kicker,.map-title,.zstat{line-height:1.3}
```

- [ ] **Step 2: Verify Sanity** → Run CSS-Sanity-Befehl. Expected: `JS OK`
- [ ] **Step 3: Verify Marker** → `grep -c 'DESIGN-V2 A1' index.html` → Expected `1`
- [ ] **Step 4: Visual-Gate (Orchestrator)** — 1440 + 390 auf Heute/Netzwerk/System: Eyebrow-Labels deutlich lesbarer, kein H-Scroll, keine umbrechenden Board-Spaltenköpfe (`.col h3`).
- [ ] **Step 5: Commit**
```bash
git add index.html && git commit -m "feat(design-v2): Eyebrow/Micro-Labels lesbarer (≥12.5px)"
```

---

### Task 2: Typografie A2 — Label/Meta + Badges/Pills

**Files:** Modify `index.html`

- [ ] **Step 1: CSS-Block vor `</style>` einfügen**

```css
/* ===== DESIGN-V2 A2 — Label/Meta + Badges/Pills lesbarer ===== */
.g-date{font-size:13px}
.zcat .zn{font-size:13.5px}
.bestand-stat .sn{font-size:13.5px}
.res-cell span{font-size:13px}
.tier-legend{font-size:13px}
.soft-pill{font-size:13px}
.tr-auto{font-size:13px}
.route-card .rnote{font-size:13px}
.stp small{font-size:12.5px}
.tier-group>h4 span{font-size:12.5px}
/* Badges/Pills moderat + Padding nachziehen */
.status-pill{font-size:12px}
.stufe-badge{font-size:11.5px}
.pill-a{font-size:11.5px}
.pill-kt{font-size:11.5px}
.typ-chip{font:600 11px/1 Inter;padding:3px 8px}
.tier-pill{font-size:11.5px}
.due{font-size:12px}
.star{font-size:12.5px}
.segn{font-size:12.5px}
.stock-chip{font-size:13px}
.zw-portal{font-size:13px}
.tier-filter button{font-size:12.5px}
```

- [ ] **Step 2: Verify Sanity** → `JS OK`
- [ ] **Step 3: Verify Marker** → `grep -c 'DESIGN-V2 A2' index.html` → `1`
- [ ] **Step 4: Visual-Gate** — 1440 + 390 auf Fälle/Netzwerk: Status-Pills/Badges lesbar, kein Umbruch in Karten-Headern, kein H-Scroll.
- [ ] **Step 5: Commit**
```bash
git add index.html && git commit -m "feat(design-v2): Label/Meta + Badges/Pills lesbarer"
```

---

### Task 3: Matrix premium + lesbar (rowlbl 16px + Gold-Hairline, col 13px, Zellen)

**Files:** Modify `index.html`

- [ ] **Step 1: CSS-Block vor `</style>` einfügen**

```css
/* ===== DESIGN-V2 B-Matrix — premium + lesbar ===== */
.mx-rowlbl{font-size:16px;letter-spacing:.06em;color:#7e6a55;font-weight:700;
  display:flex;align-items:center;gap:12px;padding-bottom:9px;margin:2px 0 6px}
.mx-rowlbl::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--brass-line),transparent)}
.mx-cell{padding:16px 16px;position:relative;overflow:hidden}
.mx-cell::before{content:"";position:absolute;top:0;left:14px;right:14px;height:2px;border-radius:0 0 3px 3px;
  background:linear-gradient(90deg,transparent,#cdb083 30%,#cdb083 70%,transparent);opacity:.5}
.mx-cell .mx-col{font-size:13px;letter-spacing:.06em;color:#b08f5f}
.mx-cell h4{font-size:17.5px;margin:5px 0 3px}
.mx-cell p{font-size:14px;line-height:1.42}
.mx-metric{font-size:19px}
.mx-chip{font-size:11.5px;padding:4px 9px}
@media(hover:hover){.mx-cell:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(31,28,28,.10);border-color:var(--brass-line)}}
```

- [ ] **Step 2: Verify Sanity** → `JS OK`
- [ ] **Step 3: Verify Marker** → `grep -c 'DESIGN-V2 B-Matrix' index.html` → `1`
- [ ] **Step 4: Visual-Gate** — 1440 + 390 auf **Matrix**: „Zuweiser (B2B)"/„Patient direkt (B2C)" deutlich größer (16px) mit Gold-Trennlinie; vor/in/nach-Labels 13px; Zellen mit Gold-Top-Hairline; B2B↔B2C klar getrennt; Hover-Lift (Desktop); kein H-Scroll bei 390. Screenshot Matrix beide Breiten.
- [ ] **Step 5: Commit**
```bash
git add index.html && git commit -m "feat(design-v2): Matrix premium — größere B2B/B2C-Labels, Gold-Hairlines, Hover-Lift"
```

---

### Task 4: Premium-Surfaces — Gold-Top-Hairlines + verstärkte Trennlinien

**Files:** Modify `index.html`

- [ ] **Step 1: CSS-Block vor `</style>` einfügen**

```css
/* ===== DESIGN-V2 C-Surfaces — Gold-Hairlines + Trennlinien ===== */
/* Hairline-Trenner zwischen gestapelten Karten leicht goldig + sichtbarer */
.hairline{border-top-color:var(--brass-line);opacity:.8}
/* Konsistente Gold-Top-Hairline auf den Premium-Listen-Karten (wie .card::before) */
.patient-card,.zcard{position:relative}
.patient-card::after,.zcard::after{content:"";position:absolute;top:0;left:20px;right:20px;height:2px;
  border-radius:0 0 3px 3px;background:linear-gradient(90deg,transparent,#cdb083 30%,#cdb083 70%,transparent);
  opacity:.45;pointer-events:none}
/* Datenbank-Board-Leads: feiner Trenner unten */
.db-lead{border:1px solid var(--brass-line)}
/* verfeinerte Schatten auf Hauptkarten */
.card{box-shadow:0 1px 2px rgba(40,35,30,.05),0 12px 30px rgba(40,35,30,.06)}
```

- [ ] **Step 2: Verify Sanity** → `JS OK`
- [ ] **Step 3: Verify Marker** → `grep -c 'DESIGN-V2 C-Surfaces' index.html` → `1`
- [ ] **Step 4: Visual-Gate** — 1440 + 390 auf Netzwerk (Zuweiser+Datenbank), Heute: Karten haben dezente Gold-Top-Hairline, Trenner sichtbarer-premium, keine doppelten/zu starken Linien, kein H-Scroll.
- [ ] **Step 5: Commit**
```bash
git add index.html && git commit -m "feat(design-v2): Premium-Surfaces — Gold-Hairlines + verstärkte Trennlinien"
```

---

### Task 5: Motion — staggered Fade-Up Entrance + Hover-Lift (reduced-motion-safe)

**Files:** Modify `index.html`

**Does NOT cover:** Animation gilt nur für sichtbare View-Container-Karten; verschachtelte Listen werden NICHT einzeln gestaffelt (Performance/Busy-Vermeidung). Unter `prefers-reduced-motion` komplett aus (globaler Block).

- [ ] **Step 1: CSS-Block vor `</style>` einfügen**

```css
/* ===== DESIGN-V2 D-Motion — Entrance-Stagger + Hover-Lift ===== */
@keyframes dv2Up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.view.active .chap,.view.active .mx-row,.view.active .bestand-grid>*,.view.active .zgrid>*{animation:dv2Up .45s cubic-bezier(.4,0,.2,1) both}
.view.active .chap:nth-child(2){animation-delay:.04s}
.view.active .chap:nth-child(3){animation-delay:.09s}
.view.active .chap:nth-child(4){animation-delay:.14s}
.view.active .mx-row:nth-child(2){animation-delay:.08s}
.view.active .zgrid>*:nth-child(2),.view.active .bestand-grid>*:nth-child(2){animation-delay:.05s}
.view.active .zgrid>*:nth-child(3),.view.active .bestand-grid>*:nth-child(3){animation-delay:.1s}
.view.active .zgrid>*:nth-child(n+4),.view.active .bestand-grid>*:nth-child(n+4){animation-delay:.14s}
/* verfeinerter Hover-Lift auf interaktiven Karten */
@media(hover:hover){
  .patient-card,.zcard,.db-lead,.template-card{transition:transform .18s ease,box-shadow .18s ease}
  .patient-card:hover,.zcard:hover,.template-card:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(31,28,28,.10)}
}
```

- [ ] **Step 2: Verify Sanity** → `JS OK`
- [ ] **Step 3: Verify Marker** → `grep -c 'DESIGN-V2 D-Motion' index.html` → `1`
- [ ] **Step 4: Visual-Gate (Orchestrator)** — 1440: View-Wechsel zeigt subtiles Fade-Up-Stagger der Karten/Zeilen (nicht träge); Hover-Lift auf Karten; **kritisch:** mit emulierter `prefers-reduced-motion: reduce` prüfen, dass alle Karten SICHTBAR sind (keine bei opacity:0 hängen). 390: Entrance subtil, kein H-Scroll, keine Layout-Sprünge.
- [ ] **Step 5: Commit**
```bash
git add index.html && git commit -m "feat(design-v2): Motion — Entrance-Stagger + Hover-Lift (reduced-motion-safe)"
```

---

### Task 6: Cross-View-Verifikation + Tuning

**Files:** Modify `index.html` (nur falls Tuning nötig)

**Does NOT cover:** Keine neuen Features — nur Audit & gezielte Korrektur von Overflow/Override-Misses, die in Tasks 1–5 sichtbar wurden.

- [ ] **Step 1: Vollständiger Visual-Sweep (Orchestrator)** — Chrome MCP über ALLE 5 Views + Referrer-Portal + Sheet bei **1440** UND **390**:
  - Pro View: kein horizontaler Overflow (`scrollWidth ≤ clientWidth+1`), 0 Console-Errors, Labels lesbar, kein geclippter/umbrochener Text in Pills/Badges/Spaltenköpfen.
  - Notiere konkrete Offender (Klasse + Breite + Symptom).
- [ ] **Step 2: Gezieltes Tuning** — Für jeden Offender einen minimalen Override in einem `/* DESIGN-V2 E-Tuning */`-Block vor `</style>` (z.B. font-size −0.5px, letter-spacing senken, padding anpassen, oder bei 390 via `@media(max-width:430px)` zurücknehmen). Falls Offender inline-styled → am Source editieren (content-anchored).
- [ ] **Step 3: Verify Sanity** → `JS OK`
- [ ] **Step 4: Re-Sweep (Orchestrator)** — beide Breiten erneut: 0 Overflow, 0 Errors, lesbar. Screenshots Matrix/Heute/Netzwerk/Fälle/System @1440 + Matrix/Heute @390 zur Bestätigung.
- [ ] **Step 5: Commit (falls Tuning)**
```bash
git add index.html && git commit -m "fix(design-v2): Cross-View-Tuning — Overflow/Lesbarkeit final"
```

---

## Self-Review
**1. Spec-Coverage:** Layer A Typo → Tasks 1–2 ✓; Matrix (rowlbl 16/col 13/Zellen/Divider) → Task 3 ✓; Layer B Trennlinien/Karten → Task 3 (Matrix) + Task 4 ✓; Layer C Motion (Stagger+Hover, reduced-motion) → Task 5 ✓; Verifikation 390+1440 alle Views → pro Task + Task 6 ✓; Non-Goals (kein DOM/Font/Backend) eingehalten ✓.
**2. Placeholder-Scan:** Keine TBD/TODO; jede CSS-Regel konkret. Task 6 Step 2 ist bewusst datengetrieben (vom Sweep), kein Platzhalter — Vorgehen + Block-Marker konkret.
**3. Konsistenz:** Block-Marker `DESIGN-V2 A1/A2/B-Matrix/C-Surfaces/D-Motion/E-Tuning` eindeutig; Selektoren spiegeln Original-Selektoren (`.mx-cell .mx-col`, `.tier-group>h4`, `.bestand-stat .sl` etc.) für korrekte Spezifität; `dv2Up`-Keyframe konsistent referenziert.
