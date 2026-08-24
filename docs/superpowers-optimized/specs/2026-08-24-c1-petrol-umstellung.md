# C1 · Petrol & Sand — Umstellung der gesamten App

**Datum:** 24.08.2026 · **Entscheidung:** Geschäftsführung wählt Entwurf C1 aus Valons
CI-Runde 7 · **Umfang:** Farbwelt **und** Typografie, gesamte `index.html`

---

## 1. Warum das überhaupt ging

Die App ist konsequent über Design-Tokens gebaut: **2.195 `var()`-Aufrufe** gegen
**48 Tokens** in einem einzigen `:root`. Ein Palettenwechsel ist dort ein Wechsel von
48 Zeilen, nicht von 11.464.

Das gilt auch für die fremden Namespaces (`.rp-*`, `.rpd-*`, `.rsp-*`, `.mx-*`, `.kta-*`):
316 CSS-Zeilen gehören dazu, aber nur 20 führen eine fest verdrahtete Farbe. Der Rest zieht
sich die Farbe aus denselben Tokens und **färbt sich mit um, ohne dass eine einzige fremde
Zeile angefasst wurde**.

Valon hat das vorbereitet — in `valon-c1-petrol.html` steht im Quelltext, dass er die
Token-*Namen* der App bewusst beibehalten hat.

## 2. Was geändert wurde

| Schritt | Umfang |
|---|---|
| `:root` auf C1 umgestellt | 48 Tokens |
| Papier-Guard (`.rpd-paper`/`.kp-mail`) mitgezogen | 1 Block, `--paper` bleibt `#FFFFFF` |
| Schrift-Stacks getauscht | 209 Angaben |
| Google-Fonts-Link + Font-Gate | Schibsted Grotesk (inkl. echter Kursive) + IBM Plex Mono |
| Alte Palettenwerte in `rgba()` | 112 Vorkommen |
| Verwaiste Hex-Werte (alte Token-Duplikate) | 90 Vorkommen, 15 Werte |
| Einzelkorrekturen an Bauteilen | 7 Regeln |

**Typografie:** Cormorant Garamond → Schibsted Grotesk · Fragment Mono → IBM Plex Mono ·
Inter unverändert. Die Klassennamen (`.serif`) bleiben historisch, wie die Token-Namen auch.

## 3. Abweichungen vom Entwurf — und warum

C1 ist für Entwurfsseiten mit wenig Text gebaut. Die App ist textlastig. Drei Werte lagen
als Fließtext unter 4.5:1 und wurden nachgeschärft — **Farbton identisch, nur Helligkeit**:

| Token | Valon | App | Grund |
|---|---|---|---|
| `--muted` | `#7D8B8C` | `#586364` | 3.30:1 → 5.41:1 |
| `--brass-deep` | `#8A7550` | `#766445` | 4.14:1 → 4.54:1 (auch auf getönter Fläche) |
| `--azzurro` | `#6E8A8E` | `#5A7175` | 3.45:1 → 4.52:1 |

Ebenfalls nachgeschärft, weil als echter Text im Einsatz: `--faint` (2.19 → 4.55:1),
`--amber` (4.12 → 4.51:1). `--faint`, `--muted`, `--ink-soft` bilden bewusst eine Leiter
(4.55 / 5.41 / 6.51), damit die stille Hierarchie erhalten bleibt.

**Nicht nachgeschärft:** `--brass` `#C2A87C` bleibt Valons Wert. Auf Petrol-Jade ergibt es
5.21:1 und repariert damit einen **bestehenden** Mangel — die goldenen Navigationslabels
lagen vorher bei 3.82:1. Auf hellem Grund ist Gold ab sofort **nie Text**; dort greift
`--brass-deep`.

## 4. Bauteile, die einzeln korrigiert wurden

| Bauteil | vorher | nachher |
|---|---|---|
| `.st.on` Bewertungssterne (gefüllt) | 2.14:1 | 5.19:1 |
| `.zone-no` Zähler-Abzeichen | 1.99:1 | 5.19:1 |
| `.chev` / `.ir-chev` / `.star` Gold-Glyphen auf hell | 2.14:1 | 4.8:1 |

## 5. Fremde Namespaces — eine bewusste Berührung

13 Schrift-Angaben mit einfachen Anführungszeichen lagen in `.rp-*`, `.rpd-*`, `.ref-*`.
Sie **mussten** getauscht werden: Cormorant wird nicht mehr geladen, das Zuweiserportal wäre
sonst auf Georgia zurückgefallen. Geändert wurde ausschließlich der Schriftname innerhalb
bestehender Deklarationen — keine Struktur, keine Logik.

Ergebnis im Portal: vorher 20 Kontrastbefunde bei 2.6–3.8:1, jetzt 16 überwiegend bei
4.2–4.5:1.

## 6. Nachweis

Messung mit einem eigenen Prüfautomaten (effektive Deckkraft über die Elternkette,
Farbverläufe als Fläche gemittelt, Animationen/Übergänge für die Messung stillgelegt,
**Selbsttest bei jedem Lauf** mit je einem Fall, der anschlagen muss, und einem, der nicht
darf). Zwölf Ansichten, beide Breiten, plus Fallakte, Mein Tag und Portal.

| | Ausgangsstand (Jade) | C1 |
|---|---|---|
| Kontrastbefunde (CSS) | **222** | **23** |
| Horizontaler Überlauf 390 px | keiner | keiner |
| Horizontaler Überlauf 1440 px | keiner | keiner |
| Konsolenfehler | keine | keine |
| Keyframes | 17 | 17 |

Die verbliebenen 23 sind: `.btn-brass` (12, siehe unten), leere Bewertungssterne (10,
gewollt zurückhaltend, unverändert gegenüber vorher) und eine Foto-Bildunterschrift
(Fehlalarm — der Prüfer sieht das Bild dahinter nicht). Die 22 SVG-Treffer sind derselbe
Fehlalarm: im Trichter liegt der Hintergrund als `<rect fill>` vor, nicht als CSS-Fläche.

## 7. Offen — eine Entscheidung für GF und Valon

**`.btn-brass`, die Hauptschaltfläche.** Elfenbein auf Gold-Verlauf ergibt 2.41:1
(vorher 2.23:1, also leicht besser, aber weiterhin unter der Schwelle). Helle Schrift auf
Gold kann 4.5:1 nicht erreichen, ohne aufzuhören, Gold zu sein:

| Verlauf | Elfenbein darauf |
|---|---|
| jetzt `#B08F5E → #C9B189` | 1.70 – 2.48:1 |
| `#7A6440 → #94794E` | 3.37 – 4.61:1 |
| `#6E5A3A → #877046` | 3.87 – 5.39:1 |

Das ist eine Gestaltungsfrage, keine Fehlerkorrektur — deshalb bewusst nicht einseitig
entschieden.

## 8. Nicht geändert

Layout, Informationsarchitektur, Abstände, Radien, Motion. Kein Bauteil wurde verschoben,
umbenannt oder entfernt. Valons Entwürfe zeigen noch die Navigation von vor dem IA-Umbau
07/2026 (Team/Datenbank/System statt Call AI/In Reha/Auswertung/Konzept) — davon wurde
nichts übernommen.
