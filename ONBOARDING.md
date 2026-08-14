# ONBOARDING — Design-Arbeit in diesem Repo (für Valon & sein Claude)

Willkommen! Dieses Dokument erklärt, wie Design-Arbeit hier abläuft. Es ergänzt die
`CLAUDE.md` (bitte zuerst lesen — die harten Regeln dort gelten vollständig, besonders:
**optisch hochwertig ist nicht verhandelbar**, nur synthetische Demo-Daten, beide
Breiten 390/1440 prüfen, reduced-motion-Regel).

## Das Wichtigste zuerst

- **`index.html` IST die App** (eine einzige self-contained Datei) und läuft live über
  GitHub Pages: https://aluminiumminimum.github.io/bavaria-trichter-prototyp/
- **Jeder Push auf `main` deployt automatisch** (~1 Minute). Mehrere Leute pushen
  parallel — deshalb IMMER `git pull` vor dem eigenen Push.
- Design-Referenz: `design-lab/e5d-jade.html` (Jade-Apotheke-System) + der
  Identitäts-Block in `CLAUDE.md` (Palette, Typo, Etiketten-Sprache, Token-Namen —
  Achtung: Token-NAMEN sind historisch, `--brass` ist GOLD, `--sage-deep` ist LACK-JADE).

## Dein Workflow als Designer (3 Stufen)

### Stufe 1 — Lokal entwerfen (kein Build nötig)

Neue Design-Elemente NICHT direkt in `index.html` entwickeln. Stattdessen:

1. Repo klonen, eine eigene HTML-Datei in **`design-lab/`** anlegen
   (z. B. `design-lab/valon-karten-studie.html`), self-contained wie `e5d-jade.html`.
2. Tokens, Fonts und Basis-CSS aus `index.html` oder `e5d-jade.html` herauskopieren,
   damit du im echten System arbeitest.
3. Datei einfach im Browser öffnen — es gibt keinen Build, kein npm, nichts.
4. Bei **390px UND 1440px** prüfen: kein horizontaler Overflow, 0 Console-Errors,
   und der Blick-Test: „Würde das im Investor-Pitch bestehen?"

### Stufe 2 — Live sehen, ohne die App anzufassen

Eigenständige Dateien in `design-lab/` sind ungefährlich für die App. Der Weg:

```
git checkout -b design/<kurzname>
git add design-lab/<deine-datei>.html
git commit -m "Design-Studie: <was>"
git push -u origin design/<kurzname>
# dann: git checkout main && git pull && git merge --no-ff design/<kurzname> && git push
```

~1 Minute später ist deine Studie live unter:
`https://aluminiumminimum.github.io/bavaria-trichter-prototyp/design-lab/<deine-datei>.html`

**Alternative für volle Isolation:** eigenen Fork anlegen und dort GitHub Pages
aktivieren (Settings → Pages → Branch main). Dann hast du eine eigene Live-URL,
komplett getrennt von diesem Repo, und mergst erst zurück, wenn etwas fertig ist.

### Stufe 3 — In die App übernehmen (nur nach Absprache)

Änderungen an `index.html` bitte erst nach Abstimmung im Team, und dann:

- **Chirurgisch:** eigene CSS-Blöcke als kommentierter Block vor `</style>`, eigener
  Namespace (z. B. `.vl2-*` — vorher per Suche prüfen, dass er frei ist). Fremde
  Blöcke/Funktionen nur mit 1-Zeilen-Einfügungen berühren — Source-Order-Overrides
  können fremdes Rendering unbemerkt kaputtmachen.
- **Verifizieren vor dem Push:** Seite bei 390 und 1440 laden, 0 Console-Errors,
  kein Overflow, Screenshots selbst ansehen. Wer Playwright nutzt: headless Chromium,
  Onboarding-Overlay per `betaClose(true)` schließen.
- **Vorsicht Anführungszeichen:** In JS-Strings nur typografische „…" verwenden —
  ein gerades `"` im Text legt den kompletten Script-Block still (ist passiert).
- Nie direkt auf `main` entwickeln: Branch → verifizieren → `git pull` → Merge → Push.

## Was tabu ist

- `funnel*.html`, `v1–v5.html`, `varianten.html` = veraltete Explorationen, nicht anfassen.
- Keine echten Namen/Kontakte/Daten — alles synthetisch, Mails auf `@demo-*.local`.
- Kein `filter:blur` auf Animiertem, `opacity:0` nur in Keyframes (reduced-motion-Regel).
- Zinnober (`--terra`) ist Signalfarbe für Eskalation/überfällig — nicht dekorativ verwenden.

## Doku & Kontext

- Specs/Pläne je Iteration: `docs/superpowers-optimized/{specs,plans}/` — lesenswert,
  um Entscheidungen nachzuvollziehen (z. B. Etiketten-System, Eskalations-Doktrin).
- Repo-Skills in `.claude/skills/` (lädt dein Claude automatisch): `/brainstorming`,
  `/design-audit`, `/deploy` u. a. — nutz sie, sie kennen die Fallstricke dieses Repos.

Fragen: einfach im Team melden. Lieber einmal fragen als einmal das Rendering von
jemand anderem zerschießen.
