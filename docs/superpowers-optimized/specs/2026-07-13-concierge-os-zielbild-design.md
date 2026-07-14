# Spec — Concierge OS · Zielbild & Aufwertungs-Programm

**Datum:** 2026-07-13
**Datei:** `index.html` (single self-contained, inline CSS/JS)
**Anlass:** Strategie-Brainstorming mit dem User (Neuausrichtung: interner Pilot statt reines Pitch-Artefakt).
**Status:** Zielbild und Programm vom User freigegeben („nein sehr gut, starte").
**Art des Dokuments:** Zielbild-/Programm-Spec. Sie definiert das gemeinsame Nordstern-Bild und schneidet vier Umsetzungs-Bausteine (A–D). **Jeder Baustein bekommt vor seiner Umsetzung eine eigene Iterations-Spec + Plan** (Repo-Konvention `docs/superpowers-optimized/{specs,plans}/`); dieses Dokument ist deren verbindlicher Rahmen.

## 1. Produktthese

Das Concierge OS ist das **führende System für das Privat-/Selbstzahlergeschäft** der Klinik Bavaria: Patientenakquise, Erfassung und Fallbearbeitung laufen vollständig darin. Es ist als **Erstsystem** entworfen — es ersetzt die heutigen Orte dieses Wissens (Postfächer, Excel-Listen, Zettel, Köpfe), es ergänzt sie nicht. Doppelerfassung ist ein Designfehler, kein akzeptierter Zustand.

**Nicht sein Territorium:** medizinische Behandlungsdokumentation, Therapieplanung, Abrechnung.

## 2. Kontext: Was „Pilot" hier heißt

- Zielgruppe der nächsten Ausbaustufe: **Mitarbeiter der Klinik** (nicht primär Investoren).
- Pilot-Tiefe: **Workflow-Validierung.** Die App bleibt Simulation mit synthetischen Daten (`@demo-*.local`), aber die Abläufe werden so realistisch, dass Mitarbeiter sie durchspielen und beurteilen können („so würde ich arbeiten" / „hier klemmt's").
- Kein Backend, keine Persistenz, kein echter Versand — bewusste Entscheidung; echtes Arbeitswerkzeug wäre ein eigenes Folgeprojekt.
- Die bestehende Investor-Demo bleibt jederzeit voll funktionsfähig und vorzeigbar (Deploy = Push auf `main` → GitHub Pages).

## 3. Das Gedächtnis — fünf Objekte, eine Datenbank

Kern des Zielbilds: Es gibt **ein** Gedächtnis, in dem dieselbe Person über ihren gesamten Lebenszyklus eine Akte hat. Heute zerfällt sie in vier getrennte Demo-Listen (`eingang[]`, `faelle[]`, `inReha[]`, `bestand[]`).

| Objekt | Inhalt | Heute in der App |
|---|---|---|
| **Person** | dauerhafte Akte: Stammdaten, Lebenszyklus-Rolle (Interessent → Patient → Altpatient), Kostenträger-Typ, Angehörige, Einwilligungen, Ereignis-Historie | fehlt — Duplikate über 4 Listen |
| **Anfrage** | jedes Signal aus jedem Kanal (E-Mail, Telefon, Fax, Website, Zuweiser, Portale) mit Quelle, Zeitstempel, Verantwortlichem | `eingang[]`, gut gebaut |
| **Fall** | Vorgang Qualifizierung → Unterlagen/Kostenzusage → Aufnahme → Reha → Entlassung; gehört immer zu einer Person, optional zu einem Zuweiser | `faelle[]`/`inReha[]`, gut gebaut, aber ohne Personen-Bezug |
| **Zuweiser** | Organisation + Ansprechpersonen + Beziehungshistorie; jeder vermittelte Fall zahlt sichtbar auf die Beziehung ein | `zuweiser[]`, statisch, ohne Historie |
| **Belegung** | Betten/Zimmerkategorien über die Zeit — das Objekt, auf das alles zuläuft; Vorschau statt Rückspiegel | fehlt (nur Vergangenheits-Charts) |

## 4. Die vier Fähigkeiten

1. **Erfassen** — ein Eingang für alles; jede Anfrage hat binnen Minuten einen Verantwortlichen; nichts versandet.
2. **Bearbeiten** — jeder Fall folgt demselben Stufenweg mit Fristen und Übergaben; Systematik statt Personenabhängigkeit.
3. **Pflegen** — das System erinnert von sich aus (Bring-System statt Hol-System), konkret drei Mechaniken:
   - **Anlass-Radar:** Geburtstage, Entlass-Jubiläen, Zuweiser-Kontaktrhythmen → jeder Anlass mit vorgeschlagener Aktion (Geschenk an Altpatienten, Karte, Anruf).
   - **Kampagnen:** Newsletter aus der Zuweiserdatenbank generieren (Segment wählen → Entwurf aus den Daten → Vorschau → Demo-Versand); gleiches Prinzip später für Altpatienten-Post.
   - **Bindungskanal (Ausblick, kein Auftrag):** Patienten-App im Stil der MEDIAN-Tele-Reha-Nachsorge — wäre architektonisch nur ein weiterer Kanal, der ins selbe Gedächtnis schreibt.
4. **Steuern** — aus Trichter + Bestand entsteht ein Belegungs-Forecast; Führung sieht Zufluss, Conversion, Vorlauf und kann eingreifen, bevor Lücken entstehen.

## 5. KPI-Hierarchie

**Harte KPI:** Privat-/Selbstzahler-Belegung — planbar und steigend.
**Frühindikatoren darauf:** Antwortzeit, Erfassungsquote, Conversion je Trichterstufe, aktive Zuweiser-Beziehungen, Reaktivierungsquote Altpatienten, Belegungsvorlauf (Wochen).
**Einordnung:** Die KPI ist der Nordstern des Produkts, nicht des Piloten — mit synthetischen Daten wird sie nicht real gemessen. Kein Baustein baut Mess-Infrastruktur; die App zeigt die KPI-Logik demonstrativ.

## 6. Delta Ist ↔ Zielbild

- `Erfassen`/`Bearbeiten`: stark gebaut (Eingang, Board, Fall-Schublade) — brauchen **Arbeitstiefe** statt Demo-Politur.
- `Pflegen`: Kulisse (`radar[]`, Netzwerk-View zeigen, aber nichts erinnert/agiert) — braucht **Mechanik**.
- `Steuern`: am dünnsten — Auswertung beschreibt Vergangenheit, plant nichts.
- Gedächtnis: **fehlt strukturell** (vier Listen, keine Personen-Akte).

## 7. Programm: vier Bausteine, Reihenfolge A → B → C → D

Begründung der Reihenfolge: B und C bauen auf der Akte auf (Radar-Anlässe, Newsletter-Segmente, Forecast-Historie); Fundament zuerst vermeidet Doppelbau. User: Reihenfolge sekundär, Sauberkeit primär.

Zuordnung zu den Fähigkeiten (§3/§4): **A** ↔ Gedächtnis (§3) · **B** ↔ Pflegen (§4.3) · **C** ↔ Steuern (§4.4) · **D** ↔ Erfassen/Bearbeiten (§4.1–4.2).

### A — Das Gedächtnis (Fundament)
Neue führende Registry `personen[]` (Stammdaten, Lebenszyklus-Rolle, Kostenträger-Typ, Angehörige, Einwilligung, Ereignis-Historie) + Zuweiser-Akte mit Beziehungs-Ereignissen. **Additive Strategie:** Bestehende Arrays behalten alle Feldnamen und bekommen zusätzlich eine `personId`-Referenz; Cofounder-Code liest unverändert seine alten Felder. **Gate:** Der konkrete Datenvertrag wird in der Baustein-A-Spec entworfen und vor der ersten Code-Zeile vom `fable-advisor` geprüft (Commitment-Grenze: geteilte Daten `inReha[]`).

### B — Pflegen wird Mechanik
Anlass-Radar (aus `personen[]`-Daten generierte Anlässe mit Aktionsvorschlag) + Kampagnen-Workflow (Newsletter-Generator über Zuweiser-Segmente, simulierter Ablauf inkl. Vorschau und Demo-Versand). Der sichtbar größte Neuwert. Das bestehende `radar[]` (heute Altpatienten-Kulisse) wird dabei **erweitert, nicht ersetzt oder umbenannt**.
*Nachtrag 2026-07-14 (User/Klinik-Kollegen):* B umfasst zusätzlich die Umstellung der Kontakt-Einstufung auf eine **5-Sterne-Klassifikation** (ersetzt A/B/C; Anlass-Gesten skalieren mit den Sternen) — Details in der Baustein-B-Spec `2026-07-14-baustein-b-pflege-mechanik-design.md`.

### C — Steuern wird Vorschau
Belegungs-Forecast aus Trichter + Bestand über kommende Wochen, Frühindikatoren-Cockpit gemäß §5 statt reiner Rückschau. **Auflösungsgrenze:** C prognostiziert auf Betten-Ebene, aufgeschlüsselt nach Kostenträger-Typ (PKV/Selbstzahler/GKV — Felder existieren heute schon). Eine Aufschlüsselung nach Zimmerkategorie ist erst möglich, nachdem D das Feld eingeführt hat, und ist ausdrücklich nicht Teil von C.

### D — Arbeitstiefe für die Workflow-Validierung
Echte Formularfelder in Eingang/Fall-Anlage (Kostenträger, Diagnose, Wunschtermin, Zimmerkategorie), Kostenzusage als Status-Workflow (angefragt/liegt vor/abgelehnt), saubere Rollen-Übergaben — das Niveau, auf dem Mitarbeiter validieren können.

## 8. Arbeitsmodell & Leitplanken (gelten für jeden Baustein)

- **Orchestrierung / Token-Ökonomie:** Fable (Architekt) schreibt Specs und verifiziert; Implementierung ausschließlich über `claude-implementer` (Haiku, mechanische Edits) bzw. `claude-implementer-pro` (Sonnet, Renderfunktionen/Datenmodell). `fable-advisor` nur an Commitment-Grenzen (im Programm: Datenvertrag Baustein A). Spec-Reviews laufen auf Sonnet.
- **Spec-Pflicht:** jede delegierte Aufgabe als Fünf-Teile-Spec (Ziel, Ort, Constraints, Verifikation, Nicht-Ziele) gemäß HANDOVER §6.
- **Git-Disziplin:** je Baustein kurzlebiger Branch → verifizieren → `git pull` → Fast-Forward-Merge auf `main` → Push. Nie `--force`. Ein Baustein kommt erst auf `main`, wenn vollständig verifiziert — das Repo ist nach jedem Schritt vorzeigbar.
- **Harte Regeln:** HANDOVER §2 gilt vollumfänglich — insbesondere: Cofounder-Namespaces (`.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `openReferrer`/`#refOverlay`) niemals anfassen; geteilte Daten (v. a. `inReha[]`) nur erweitern, nie umbenennen; CSS additiv in eigenen Namespaces vor `</style>`; Animationen reduced-motion-safe; Identität wahren (Cormorant/Inter, Espresso/Messing/Salbei-Palette, Achsenfarben nur für Fachbereiche).
- **Verifikation je Änderung:** Preview `bavaria-proto` @1440 **und** @390: 0 Console-Errors, 0 horizontaler Overflow, betroffene Views + Cofounder-Bereiche (Matrix-Zellen, Zuweiserportal, `rsp`-Charts) rendern; Screenshot als Beleg.

## 9. Non-Goals

- Kein Backend, keine Persistenz, kein echter E-Mail-/Newsletter-Versand, keine echten Personendaten.
- Keine Therapie-/Patienten-App (nur als Ausblick dokumentiert).
- Kein KIS-, Abrechnungs- oder Mediz.-Doku-Funktionsumfang.
- Keine Umbenennung/Löschung bestehender Datenfelder; keine Änderungen an Cofounder-Bereichen.
- Keine Migration weg von der Single-File-Architektur (`index.html` bleibt die App).

## 10. Erfolgskriterien des Programms

1. **Eine Akte:** Dieselbe Demo-Person ist als Anfrage, Fall, Reha-Patientin und Altpatientin über die Views hinweg als *eine* Person mit Historie erkennbar (A).
2. **Das System erinnert:** Anlass-Radar erzeugt Anlässe aus den Daten (Geburtstag, Jubiläum, Kontaktrhythmus) und bietet Aktionen an; der Newsletter-Workflow ist von Segment bis Demo-Versand durchspielbar (B).
3. **Vorschau statt Rückspiegel:** Eine Belegungs-Vorschau über kommende Wochen existiert und reagiert auf den Trichter-Zustand (C).
4. **Validierbar:** Ein Mitarbeiter (z. B. Rolle S. Koordination) kann den Weg Anfrage → Aufnahme mit realistischen Feldern und Stati vollständig durchspielen (D).
5. **Nichts kaputt:** Nach jedem Baustein-Merge: Investor-Demo intakt, Cofounder-Bereiche verifiziert, 0 Console-Errors @1440/@390.
