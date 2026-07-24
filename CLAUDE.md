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
- **KI (einzige Netz-Ausnahme, 07/2026):** `.ki-*`-Features rufen NUR den Proxy `ai.quintia.de`
  (`ai-proxy/`, Kimi-Key ausschließlich serverseitig als Env — nie im Repo). Jede KI-Funktion hat
  ein gescriptetes Pitch-Fallback und degradiert ohne Proxy fehlerfrei („KI offline"); KI schlägt
  nur vor, Übernahme ist immer ein expliziter Klick (Human-in-the-loop).
- **Mobile-first (390px) UND Desktop-App (≥1024px).** Jede Änderung bei **beiden** Breiten prüfen:
  0 horizontaler Overflow, lesbar, **0 Console-Errors**. Desktop 1440 ist die Pitch-Bühne.
- **Animationen reduced-motion-safe:** Start-Zustand (opacity/transform 0) NUR im Keyframe-`from`,
  nie in der Basisregel — der globale `@media(prefers-reduced-motion)`-Block schaltet Animationen ab
  und der Endzustand muss dann sofort korrekt sein.
- **Identität wahren (seit Jade-Apotheke-Overhaul 07/2026):** Cormorant Garamond (Display/Numerale) +
  Inter (Body) + Fragment Mono (Micro); Jade-Apotheke-Palette — Elfenbein-Canvas `#F6F2E6`, Etiketten-Papier
  `#FBF8EF`, Ink `#221E15`, Lack-Jade `#123B33` (DER strukturelle Dunkelton), Gold `#B99149` (NUR
  Grafik/Gravur; Text: `--brass-deep` `#7E6230`), Zinnober `#A8341F` (Siegel + stockt/überfällig),
  Daten-Hues Steel/Taupe nie als Fläche. Token-NAMEN historisch (`--cream` = Elfenbein-Canvas,
  `--sage-deep` = LACK-JADE, `--brass` = GOLD!), Werte in `:root`. **Etiketten-System:** Karten =
  Doppelrahmen (Jade-Hairline + Gold-Inset-Ring) + Gold-Eck-Winkel auf Majors, Radius-Familie 4px,
  Kapitel-Siegel (Zinnober 01 gefüllt, Gold-Ring 02/03). **Funnel = Gold-Gravur auf Lack** (1 cv-Instanz-Paar
  wide+narrow auf Heute; Contract seit IA-Umbau 07/2026: offset-path 12 · cv-travel 2 · data-sync 30).
  **Motion-Welt-Set:** exakt 9 Keyframes (lift · cv-travel · lxSweep · lxPulse · auGrow ·
  rpDrawC/rpDrawP/rpRing/rpGrow); opacity:0 NUR in Keyframes, NIE `filter:blur` auf Animiertem,
  Seite rendert ohne JS. **Papier-Inseln:** `.rpd-paper`/`.kp-mail` (Internals tabu), `@media print`.
  Referenz-Prototyp: `design-lab/e5d-jade.html`.

## Zusammenarbeit / Git
- **Mehrere Leute pushen parallel auf `main`.** IMMER `git pull` vor eigenem Push.
- Deploy = Push auf `main` → GitHub Pages (Root) baut ~1 min. Live:
  https://aluminiumminimum.github.io/bavaria-trichter-prototyp/
  (github.io-CDN kann lokal zeitweise klemmen; wahre Build-Info via `gh api repos/.../pages/builds`).
- Neue Features als kurzlebiger Branch → verifizieren → pull → merge→main. Kleine Politur direkt auf main.

## Konventionen im Code
- CSS additiv per **kommentierten Blöcken vor `</style>`** + klaren Namespaces:
  `.rp-*` Zuweiser-Suite · `.rpd-*` Dokument-Viewer · `.rsp-*` Reha-Charts · `.mx-*` Matrix ·
  `.ds-*` Desktop-Sidebar · `.rs-*`/`.ir-*` Reha-Steuerung · `.db-*` Datenbank · `.tabbar` Mobil-Nav ·
  `.ki-*` KI/Kimi (Panel, FAB, `#kiChat`-Overlay).
- Views schalten via `go(view[,sub])`; Sidebar/Tabbar-Buttons tragen `data-nav`. **IA (seit 07/2026,
  Prozess-Achse):** `heute` · `faelle`(anfragen/board/team) · `inreha` · `netzwerk`(zuweiser/patienten) ·
  `auswertung` · `konzept`(idee/matrix/sops). Alt-Routen (team/matrix/system/…, sowie
  `netzwerk/kontakte`/`bestand`/`radar` → `netzwerk/patienten`) laufen über Aliase in
  `switchTab()`/`applyHash()`. Rollen-Schalter Leitung⇄Koordination (`.ds-role`) = Einstieg in `ma-mode`.
  Das Zuweiser-Portal ist ein **Overlay** (`#refOverlay`, kein View) — bewusst KEIN `data-nav`;
  mobiler Einstieg über die `.nx-entry`-Karten in Netzwerk→Zuweiser.
- Wiederverwenden statt duplizieren: `escapeHtml`, `initialen`, `kpiRing`, `rpPersona`, `dstr`.
- Fremden Code (anderer Mitwirkender) nur **chirurgisch** anfassen (1-Zeilen-Einfügungen),
  eigene Namespaces nutzen — Source-Order-Overrides können fremdes Rendering unbemerkt kaputtmachen.

## Doku
`docs/superpowers-optimized/{specs,plans}/` — je Iteration ein Design-Spec + Umsetzungsplan.
