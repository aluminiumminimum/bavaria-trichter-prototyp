# Klinik Bavaria — Privatpatienten-Maschine

Interaktiver Produkt-Prototyp einer Concierge-Software, die den gesamten Weg eines
Privatpatienten steuert: von der ersten Anfrage über die Reha bis zur Nachsorge –
für **Patienten direkt (B2C)** und **Zuweiser (B2B)**.

**▶ Live-Demo:** https://aluminiumminimum.github.io/bavaria-trichter-prototyp/

> Mobile-first (optimiert fürs iPhone) **und** vollwertige Desktop-App ab 1024 px.

---

## Was die Software zeigt

Sechs Bereiche, erreichbar über die Navigation (Sidebar auf Desktop, Tab-Leiste mobil):

- **Heute** — Cockpit: Trichter von Quelle → Aufnahme, Tageskennzahlen, Auslastung.
- **Fälle** — Anfragen-Eingang, Fall-Board (Pipeline), „In Reha" mit Barthel/FIM-KPIs, Verlaufsgrafiken und Wirtschaftlichkeit.
- **Team** — zentraler Eingang aller Kanäle, Zuteilung und Beantwortung, Mitarbeiter-Cockpit.
- **Netzwerk** — Zuweiser-Beziehungen und Patienten-Datenbank (Grading, Wiedervorlagen).
- **Matrix** — die ganze Maschine als 2×3-Raster: B2B/B2C × vor/in/nach der Reha.
- **System** — Idee, Auswertung, SOPs.

### ⭐ Zuweiser-Portal (Premium-Suite)

Die zentrale B2B-Ansicht — was der zuweisende Arzt / das Krankenhaus sieht.
Erreichbar über den Sidebar-Punkt **„Zuweiserportal"** oder die Zuweiser-Zeile der Matrix:

- Persönliche Begrüßung, „Ihre Zusammenarbeit"-Kennzahlen, aktuelle Klinik-News
- Freie-Plätze-Übersicht (Klick füllt die Anmeldung vor)
- Niedrigschwellige Patienten-Anmeldung mit animierter Live-Bestätigung
- Behandlungs-Einblick (Reha-Verlauf mit KPI-Ringen)
- Abschlusspaket mit anklickbaren Mock-Dokumenten (Arztbrief, Kurzbericht, Medikationsplan) und QR-Code

---

## Ausführen

Keine Build-Kette, keine Abhängigkeiten. `index.html` ist die komplette Anwendung
(HTML, CSS und JavaScript inline in einer Datei).

```bash
# einfach im Browser öffnen
open index.html
```

Deployment: **GitHub Pages** aus dem `main`-Branch (Root). Jeder Push aktualisiert
die Live-Demo nach ~1 Minute.

---

## Projektstruktur

| Pfad | Zweck |
|------|-------|
| **`index.html`** | **Die Anwendung.** Alle aktive Arbeit passiert hier. |
| `docs/superpowers-optimized/` | Design-Specs und Implementierungspläne je Iteration |
| `funnel1–3.html`, `v1–v5.html`, `varianten.html` | Historische Design-Explorationen — **veraltet**, nicht die App |

---

## Hinweise

- **Alle Daten sind synthetisch** (Demo-Zwecke). Namen, Kontakte und Kennzahlen sind
  frei erfunden; Kontaktadressen enden auf `@demo-*.local`.
- Kein Backend: Formulare senden nichts ab, Aktionen sind Demo-Feedback.
- Gestaltung respektiert `prefers-reduced-motion` (Animationen werden abgeschaltet).

*Prototyp — kein Produktivsystem, keine Verarbeitung echter Patientendaten.*
