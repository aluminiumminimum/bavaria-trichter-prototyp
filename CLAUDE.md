# CLAUDE.md — Klinik Bavaria Prototyp

Kontext für AI-Assistenten (und neue Mitwirkende). Kurz halten, hoher Signalwert.

## Das Projekt
Interaktiver Produkt-Prototyp („Privatpatienten-Maschine") für einen Investor-Pitch.
**`index.html` IST die App** — eine einzige, self-contained Datei (HTML + CSS + JS inline,
~2900 Zeilen, Deutsch). Kein Build, keine Dependencies, kein Backend.
`funnel*.html`, `v1–v5.html`, `varianten.html` sind **veraltete** Explorationen — nicht anfassen.

## Harte Regeln
- **Nur synthetische Demo-Daten.** Namen/Kontakte/Zahlen frei erfunden, Mails auf `@demo-*.local`.
  Kein echtes Backend, kein Absenden — Aktionen geben Demo-Feedback (`rpToast`/`refToast`).
- **Mobile-first (390px) UND Desktop-App (≥1024px).** Jede Änderung bei **beiden** Breiten prüfen:
  0 horizontaler Overflow, lesbar, **0 Console-Errors**. Desktop 1440 ist die Pitch-Bühne.
- **Animationen reduced-motion-safe:** Start-Zustand (opacity/transform 0) NUR im Keyframe-`from`,
  nie in der Basisregel — der globale `@media(prefers-reduced-motion)`-Block schaltet Animationen ab
  und der Endzustand muss dann sofort korrekt sein.
- **Identität wahren (seit Aurora-Overhaul 07/2026):** Fraunces (Display) + Inter (Body) + Fragment Mono
  (Micro-Labels/Daten); Aurora-Palette — Ink `#0B0D0C` Canvas, Champagner `#C4A97D`, Amber `#D99A5B`,
  Salbei `#7E9B84`, Alert `#D9784F`. Token-NAMEN sind historisch (`--cream` = Canvas dunkel!), Werte in `:root`.
  **Licht-Inseln bleiben hell:** `.rpd-paper` (Dokumente), `.kp-mail` (Mailing-Vorschau), `@media print`.
  **Perf-Gesetz:** NIE `filter:blur` auf Animiertem; `backdrop-filter` NUR Chrome (Sidebar/Topbar/Tabbar)
  + Overlay-Sheets — nie auf Karten/Zeilen. Referenz-Prototyp: `design-lab/d-aurora.html`.

## Zusammenarbeit / Git
- **Mehrere Leute pushen parallel auf `main`.** IMMER `git pull` vor eigenem Push.
- Deploy = Push auf `main` → GitHub Pages (Root) baut ~1 min. Live:
  https://aluminiumminimum.github.io/bavaria-trichter-prototyp/
  (github.io-CDN kann lokal zeitweise klemmen; wahre Build-Info via `gh api repos/.../pages/builds`).
- Neue Features als kurzlebiger Branch → verifizieren → pull → merge→main. Kleine Politur direkt auf main.

## Konventionen im Code
- CSS additiv per **kommentierten Blöcken vor `</style>`** + klaren Namespaces:
  `.rp-*` Zuweiser-Suite · `.rpd-*` Dokument-Viewer · `.rsp-*` Reha-Charts · `.mx-*` Matrix ·
  `.ds-*` Desktop-Sidebar · `.rs-*`/`.ir-*` Reha-Steuerung · `.db-*` Datenbank · `.tabbar` Mobil-Nav.
- Views schalten via `go(view[,sub])`; Sidebar/Tabbar-Buttons tragen `data-nav`.
  Das Zuweiser-Portal ist ein **Overlay** (`#refOverlay`, kein View) — bewusst KEIN `data-nav`.
- Wiederverwenden statt duplizieren: `escapeHtml`, `initialen`, `kpiRing`, `rpPersona`, `dstr`.
- Fremden Code (anderer Mitwirkender) nur **chirurgisch** anfassen (1-Zeilen-Einfügungen),
  eigene Namespaces nutzen — Source-Order-Overrides können fremdes Rendering unbemerkt kaputtmachen.

## Doku
`docs/superpowers-optimized/{specs,plans}/` — je Iteration ein Design-Spec + Umsetzungsplan.
