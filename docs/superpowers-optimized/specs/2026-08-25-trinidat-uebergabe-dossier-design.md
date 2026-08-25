# Übergabe-Dossier für Trinidat — Design

**Datum:** 25.08.2026 · **Status:** vom Nutzer freigegeben (Ansatz A, Gerüst komplett / Modul 1 tief)

## Ausgangslage

Trinidat (TriniDat Software-Entwicklung GmbH, Düsseldorf) baut das Concierge-System als
echte Software nach. Aufwandsabschätzung vom 04.08.2026 liegt vor: 15 Kapitel (00–14),
305–376 Std., 30.550–37.600 €, Basis ist das **Juli-Deck (Folien 1–14)** — nicht der
Prototyp. Testprojekt (20 Std.) am 24.08. beauftragt: Postfachanbindung → Anfrageliste →
KI-Analyse → Übernahme in einen Fall (= Kapitel 03+04). Teams-Termin vor Start steht aus.
Trinidat würde das Detailkonzept selbst für 30–40 Std. à 100 € erstellen — dieses Dossier
ersetzt diesen Posten weitgehend und hält die fachliche Hoheit bei uns.

## Entscheidungen

1. **Umfang:** Produktfunktionen. CI/Farben/Darstellungen sind mit dem GF abgestimmt und
   damit verbindliche Anforderung, nicht Inspiration. Demo/Produkt wird je Funktion
   entschieden (Trinidat hat „Anfrage simulieren" selbst als Schulungs-/Abnahmewerkzeug
   eingepreist — Position 03.02).
2. **Unterbau:** Dossier beschreibt WAS (Fachlichkeit, Daten, Regeln, Oberfläche) plus
   Rahmenbedingungen. Technische Lösung schlägt Trinidat vor, wir prüfen.
3. **Staffelung:** Gerüst komplett (Steckbriefe aller Kapitel), Kapitel 03+04 sofort in
   Abnahmetiefe. Übrige Vertiefungen je Etappe, mit Erkenntnissen aus dem Testprojekt.

## Struktur (`uebergabe/` im Repo)

Kapitelnummern = Trinidats Angebotspositionen (00–13), damit Angebot, Spezifikation und
Abnahme dieselbe Sprache sprechen. Zusätzlich `15-delta.md`: was der Prototyp seit dem
Juli-Deck mehr kann (Belegung/Stationsblatt-Import, Call AI, C1-Optik …) — markiert als
„nicht im Angebot vom 04.08.".

- `README.md` — Zweck, Leseanleitung, **Vorrangregel**, Stand
- `00-grundlagen.md` … `13-technik.md` — je Kapitel ein Steckbrief
- `03-eingang.md` + `04-anfrage-detail.md` — Abnahmetiefe (Testprojekt)
- `datenmodell.md`, `geschaeftsregeln.md`, `design-system.md`, `glossar.md`
- `15-delta.md`
- `quellen/aufwandsschaetzung-positionen.md` — Positionsliste aus der Excel (ohne Stunden)

## Zwei Tiefen

**Steckbrief** (1–2 Seiten): Zweck (3 Sätze) → Ansicht im Prototyp (Navigationspfad +
Live-Link) → Funktionen als Tabelle mit Trinidat-Positionsnummer → beteiligte
Datenobjekte → Demo/Produkt-Entscheid je Funktion.

**Abnahmetiefe** (zusätzlich): Zustandsmodell (Status, Übergänge, wer darf was) →
Geschäftsregeln ausformuliert → Feldkatalog (Typ, Pflicht, Beispiel) → KI-Analyse-Kontrakt
(rein/raus/Nichterkennung) → **Abnahmekriterien als Checkliste** für die 20 Stunden.

## Vorrangregel

Optik/Layout → Prototyp (live, versioniert per Commit). Verhalten/Regeln/Daten → Dossier.
Begründung: Der Prototyp enthält Demo-Kompromisse; die Optik ist das Abgestimmte.

## Erste Lieferung (vor dem Teams-Termin)

Steckbrief-Gerüst + 03/04 in Abnahmetiefe + Datenmodell + Design-System + Delta-Liste.
Geschäftsregeln + Glossar in den Tagen danach. Screenshots: Folgeschritt (v1 verweist
auf Live-Ansichten).

## Umsetzung

Schreibarbeit delegiert an claude-implementer-pro (Sonnet) mit Fünf-Teile-Specs;
Architektur, Briefing, Review und Commits beim Architekten. Quelle für alle Agenten:
`uebergabe/quellen/_briefing.md` (Schema-Vorlagen, Positionsliste, Code-Anker, Tonregeln).
