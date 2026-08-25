# Briefing für alle Dossier-Autoren (intern, geht nicht an Trinidat)

## Was hier entsteht

Ein Übergabe-Dossier für die TriniDat Software-Entwicklung GmbH (Düsseldorf), die den
Prototyp „Klinik Bavaria · Concierge OS" als echte Software nachbaut. Der Prototyp ist
eine einzige selbsttragende Datei `index.html` (~12.400 Zeilen, Deutsch, kein Backend),
live unter https://aluminiumminimum.github.io/bavaria-trichter-prototyp/ .
Leser des Dossiers sind Softwareentwickler ohne Reha-Fachwissen und ohne Kenntnis
unseres Codes. Der Code ist QUELLE, nicht Gegenstand: beschrieben wird das fachliche
Verhalten, nie die JavaScript-Implementierung. Kein Funktionsname, keine Variablen,
keine CSS-Klassen im Dossier-Text — außer im Datenmodell, wo Feldnamen als
Feldbezeichner dienen.

## Tonregeln

- Deutsch, sachlich, vollständige Sätze. Fachbegriffe beim ersten Auftreten kurz erklären.
- Keine Marketing-Sprache, keine Superlative.
- Zahlenbeispiele aus dem Prototyp sind SYNTHETISCH — immer als Beispielwerte kennzeichnen,
  nie als echte Klinikdaten ausgeben.
- Trinidats Stunden/Preise nirgends nennen. Positionsnummern (z. B. „03.09") ja.

## Vorrangregel (steht im README, gilt für alle Kapitel)

Optik und Layout → der Prototyp ist verbindlich. Verhalten, Regeln, Daten → das Dossier
ist verbindlich. Der Prototyp enthält Demo-Kompromisse; die Optik ist mit der
Geschäftsführung abgestimmt.

## Schema STECKBRIEF (Kapitel 00–02, 05–13, je 1–2 Seiten)

```markdown
# Kapitel NN · <Titel wie in der Positionsliste>

**Ansicht im Prototyp:** <Navigationspfad, z. B. „Seitenleiste → In Reha → Reiter Belegung">
· [Live-Ansicht](https://aluminiumminimum.github.io/bavaria-trichter-prototyp/)

## Zweck
<3 Sätze: Wer nutzt das, wofür, was wäre ohne dieses Modul kaputt.>

## Funktionen
| Pos. | Funktion | Verhalten (2–4 Sätze) | Einordnung |
|---|---|---|---|
| NN.01 | … | … | Produkt / Demo (entfällt) / Demo (behalten: Grund) |

## Datenobjekte
<Welche Entitäten liest/schreibt das Modul (Verweis auf datenmodell.md), 3–6 Zeilen.>

## Offene Punkte für Trinidat
<Nur echte Entscheidungen, die der Prototyp offenlässt. Keine erfundenen.>
```

## Schema ABNAHMETIEFE (nur Kapitel 03 und 04)

Steckbrief-Schema PLUS folgende Abschnitte:

```markdown
## Zustandsmodell
<Alle Status einer Anfrage, erlaubte Übergänge, Auslöser, wer darf was. Als Tabelle.>

## Geschäftsregeln
<Jede Regel einzeln: Name, Wenn/Dann in Prosa, Beispiel mit konkreten Werten,
 was bei Grenzfällen passiert.>

## Feldkatalog
| Feld | Typ | Pflicht | Beispiel | Bemerkung |

## KI-Analyse-Kontrakt (nur Kap. 04)
<Eingabe (Rohtext + Kanal), erwartete Ausgabe (Felder), Verhalten bei Nichterkennung,
 Mensch-bestätigt-Prinzip, Sperrschalter „KI gesperrt".>

## Abnahmekriterien (Testprojekt, 20 Stunden)
<Nummerierte Checkliste prüfbarer Sätze: „Eine eingehende E-Mail erscheint binnen X
 als Anfrage mit …". Jedes Kriterium einzeln abhakbar, kein „funktioniert korrekt".>
```

## Demo/Produkt-Einordnung — Entscheidungshilfe

- **Produkt:** alles, was eine Mitarbeiterin im Klinikalltag braucht.
- **Demo (entfällt):** Zeitraffer-Uhren, erfundene Seed-Daten, fest verdrahtete
  KI-Antworttexte, simulierte Live-Zähler.
- **Demo (behalten):** „Anfrage simulieren" — Trinidat hat es selbst als Schulungs-
  und Abnahmewerkzeug eingepreist (03.02). Ähnliche Fälle begründen.
- Der „Zurücksetzen"-Knopf und die localStorage-Persistenz sind Prototyp-Mechanik,
  im Produkt ersetzt durch echte Datenhaltung — als solche kennzeichnen.

## Code-Anker in index.html (Arbeitspfad: bavaria-trichter-prototyp/index.html)

| Was | Zeilen (ungefähr) |
|---|---|
| Design-Token `:root` | ab 15 |
| Fälle-Daten `faelle[]` | ab 5355 |
| Eingang `eingang[]` (Anfragen mit Kanal, Text, Einstufung) | 5390–5478 |
| Zuweiser `zuweiser[]` | 5428 ff. |
| Team + Achsen-Zuordnung | 5479–5490 |
| In-Reha-Fälle `inReha[]` | 5709 ff. |
| Belegung `BEL_STATIONEN`/`BEL_PAT`/Rechenkern/Import | 5778–6560 |
| Personen-Registry `personen[]` (Einwilligung!) | 6565 ff. |
| SLA/Service-Versprechen | 7142 ff. |
| Anlass-Regeln `anlaesse()` | 7849 ff. |
| Belegungs-Forecast `fcWochen()` | 8145–8250 |
| Zuweiserportal `renderPortal()` (Namespace des Cofounders — NUR LESEN) | 9078 ff. |
| Navigation `SEGS`/`go()` | 11630 ff. |
| Persistenz `demoSave`/`DEMO_SCHEMA` | 12162 ff. |
| KI-Anbindung (Kimi via Proxy) + `kiAnalyse()` | 12298 ff. |

## Harte Regeln

- `index.html` wird NICHT verändert. Nur lesen.
- Jede Datei beginnt mit `# Kapitel …` bzw. dem Dokumenttitel, endet mit einer Zeile
  `*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*`
- Positionsnummern exakt aus `uebergabe/quellen/aufwandsschaetzung-positionen.md`.
