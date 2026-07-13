# Spec — Baustein A: Das Gedächtnis (`personen[]`-Registry & Akte)

**Datum:** 2026-07-13
**Datei:** `index.html` (single self-contained, inline CSS/JS)
**Rahmen:** Zielbild-Spec `2026-07-13-concierge-os-zielbild-design.md` §7A. Erste Iteration des Programms A → B → C → D.
**Status:** Datenvertrag vom `fable-advisor` geprüft — **Go mit Auflagen**, alle Auflagen in diese Spec eingearbeitet (pNew, geb-relativ, Einwilligungs-Zwecke, kt-Enum, Entlass-Historie, Sammelnamen-Regel, Boot-Assertion).

## 1. Ziel

Dieselbe Demo-Person ist über Anfrage, Fall, Reha und Bestand hinweg **eine** Akte mit Historie. Sichtbarer Beweis: Ein „Akte"-Abschnitt in den drei Detail-Overlays (Fall-Schublade, Datenbank-Inspektor, Reha-Steuerung) zeigt Lebenszyklus-Rolle, Geburtsdatum, Kostenträger, Einwilligung und die Ereignis-Historie der Person — auch für Personen, die zur Laufzeit über „Anfrage simulieren" entstehen. Fundament für Baustein B (Geburtstage, Entlass-Jubiläen, Newsletter-Segmente) und C (Forecast nach Kostenträger-Typ).

## 2. Datenvertrag

### 2.1 Neue Registry `personen[]`

```js
{
  pid: "P01",                 // String, stabil; Seeds "P01"…; Laufzeit via pNew(): "PR1", "PR2", …
  name: "Anna Muster",
  geb: gebIn(-142, 67),       // ISO "YYYY-MM-DD"; IMMER über Helper gebIn(tageBisGeburtstag, alter)
                              // → Monat/Tag relativ zum heutigen Datum, Jahr aus alter. Demo bleibt immergrün.
  lebenszyklus: "interessent" | "patient" | "altpatient",
                              // BEWUSST NICHT "rolle" genannt: faelle[].rolle existiert bereits und meint
                              // etwas anderes (Kontakt-Typ: "Angehörige"/"Patient selbst"/…). Nicht ableiten!
  kt: "PKV" | "GKV" | "GKV + Komfort" | "Beihilfe" | "Selbstzahler" | "Unklar",
                              // FESTES Enum; Schreibweise "GKV + Komfort" MIT Leerzeichen = wie im Bestandscode.
                              // Alt-Wert "Privat" wird im Seed zu "PKV" normalisiert.
  kontakt: { tel: "0971 …", mail: "…@demo-….local" },  // synthetisch, Pflicht
  angehoerige: [ { name, bezug } ],                    // ggf. leer
  einwilligung: {
    status: "erteilt" | "offen" | "widerruf",
    form: "mündlich" | "schriftlich" | null,
    datum: "YYYY-MM-DD" | null,
    zwecke: [ "behandlung" | "newsletter" | "post" ]   // Marketing getrennt vom Behandlungskontext (Auflage für B)
  },
  zuweiserRef: "Leopoldina-Krankenhaus" | null,        // Namens-String, kompatibel zu zuweiser[].name
  historie: [ { d: "YYYY-MM-DD", typ: "anfrage"|"fall"|"aufnahme"|"entlassung"|"kontakt", text } ]
}
```

Regeln: **Jeder** `lebenszyklus:"altpatient"`-Seed hat einen `historie`-Eintrag `typ:"entlassung"` mit Datum (Entlass-Jubiläen, B). `alter` in den Alt-Arrays bleibt bestehen und muss zum `geb` passen (`gebIn` erhält das per Konstruktion). Mindestens 2 Radar-Personen bekommen `geb` mit Geburtstag in den nächsten 5–14 Tagen (`gebIn(5, …)`, `gebIn(12, …)`).

### 2.2 Verknüpfung der bestehenden Arrays (nur additiv)

- `faelle[]`, `inReha[]`, `bestand[]`, `radar[]`: jedes Element bekommt **zusätzlich** `personId:"P…"`. `eingang[]`: nur Einträge mit identifizierbarer Einzelperson.
- **Sammelnamen-Regel:** `personId` nur für identifizierbare Einzelpersonen. „Familie Hoffmann", „Unbekannt (Website)" u. Ä. bleiben ohne `personId`; UI zeigt dann keinen Akte-Abschnitt (kein Fehler, kein Platzhalter-Zwang).
- **Kein** bestehendes Feld wird umbenannt, entfernt oder in seiner Bedeutung geändert. `RS_BILLING` bleibt name-gekeyt (eigener Bereich, kein Umbau). `zuweiser[]` bleibt feldidentisch.
- Neu: `zuweiserEvents[]` — `{ zName, d: "YYYY-MM-DD", typ: "fall"|"gespraech"|"newsletter"|"besuch"|"rueckmeldung", text }`. Verknüpfung über den bestehenden Namens-String (`zuweiser[].name`, `rpPersona`-kompatibel). Seed: 2–4 Events je aktivem Zuweiser.

### 2.3 Seed-Kuration (statisch im Quelltext, KEIN Boot-Builder)

Handgeschriebene `personen[]`-Literale für alle Einzelpersonen aus `faelle[]` (8), `inReha[]` (3), `bestand[]` (~9 identifizierbare), `radar[]` (5) — Überschneidungen bewusst kuratiert, u. a.:
- **Sabine Vogt** = eine Person: `bestand[0]` + Historie mit früherem Fall (Erstkontakt Telefon). Der ungenutzte `const passivLead` (Zeile ~2469, tote Daten) bleibt unangetastet — nur hier dokumentiert.
- **Dieter Franke** = eine Person: `inReha[0]` + `RS_BILLING`-Key + Historie (anfrage → fall → aufnahme); `lebenszyklus:"patient"`.
- Radar-Personen als `lebenszyklus:"altpatient"` mit Entlass-Historie und teils naher Geburtstag (s. o.).
- Die Zuordnung `pid` → `lebenszyklus`/`kt`/`geb`-Offset je kuratierter Person wird im Umsetzungsplan als vollständige Tabelle ausgeschrieben (nicht mechanisch aus Alt-Feldern ableitbar — s. Namenskollision `rolle`).

### 2.4 Helper & Laufzeit (neuer JS-Block, Präfix `p…`)

- `person(pid)` → Registry-Lookup (find).
- `pNew(name, teil)` → legt Laufzeit-Person an (`pid:"PR"+counter`, Defaults: `lebenszyklus:"interessent"`, `kt:"Unklar"`, `einwilligung.status:"offen"`, leere Historie), gibt `pid` zurück. **Pflicht-Auflage des Advisors:** Ohne pNew wäre die Akte im Live-Demo-Flow leer. **Aufruf-Regel:** `pNew` NUR für identifizierbare Einzelpersonen — niemals mit Platzhalter- oder Sammelnamen aufrufen.
- `pHist(pid, typ, text)` → appendet `{d: dstr(0), typ, text}` an die Historie.
- `gebIn(tage, alter)` → ISO-Datum: Monat/Tag = heute+`tage`, Jahr = heutiges Jahr − `alter` (−1, falls Geburtstag dieses Jahr noch nicht erreicht — `alter` bleibt korrekt).
- Boot-Assertion (einmalig nach Seed-Definition): prüft, dass jede `personId` in allen Arrays auflöst und jede Person `geb`/`kt` trägt; bei Verstoß `console.warn` (im ausgelieferten Seed: still).
- Mutator-Einfügungen (1–3 Zeilen je Stelle, eigener Bereich):
  - `INBOUND_POOL`-Einträge bekommen additiv `einzelperson:boolean` (Kurations-Entscheidung im Plan; „Familie Hoffmann" = `false`). `simulateInbound` ruft `pNew(...)` + setzt `personId` + `pHist(pid,"anfrage"/"fall",…)` **nur wenn** `einzelperson:true` — sonst entsteht der Fall ohne `personId` (Akte-Slot zeigt den Qualifizierungs-Hinweis, s. §3; dokumentiertes Soll-Verhalten, kein Fehler).
  - `uebernehmen` erzeugt Fälle mit Platzhalternamen („Neuer Fall (aus Eingang)") ohne identifizierbare Person → **kein `pNew`, kein `personId`**. Die Personen-Zuordnung bei der Qualifizierung ist Baustein-D-Territorium.
  - `inDatenbank` folgt demselben `einzelperson`-Muster: Die beiden Passiv-Einträge werden kuratiert — `eingang` id 107 (`einzelperson:true`, kuratierter Name im Plan), id 108 („kein Name", `einzelperson:false` → kein `personId`; landet via `consent:"nein"` ohnehin in „gesperrt"). `pNew(...)` + `personId` nur bei `einzelperson:true`. **Beifang-Fix `tier:"C"` in jedem Fall** (behebt: Einträge ohne `tier` sind in `renderBestand` unsichtbar).
  - `advanceFall` → `pHist` bei Statuswechsel (nur wenn `personId` vorhanden).

## 3. Beweis-UI: der „Akte"-Abschnitt (Namespace `.pa-*`)

Ein kompakter, additiver Abschnitt am Ende der Detail-Bodies von `openDetail` (Fall-Schublade), `openDbDetail` (Datenbank-Inspektor), `openRsDetail` (Reha-Steuerung) — alle drei Claude-Bereich. Inhalt (eine gemeinsame Render-Funktion `paAkte(pid)`, überall identisch):
- Kopfzeile „Akte" (Micro-Label-Stil) + Lebenszyklus-Chip (interessent/patient/altpatient) + `kt`-Chip.
- Chip-Anzeige nutzt `person.lebenszyklus`, NIE `fall.rolle` (andere Bedeutungsachse).
- Zeile: Geburtsdatum inkl. „wird X am DD.MM." wenn Geburtstag ≤ 30 Tage entfernt.
- Zeile: Einwilligung (Status + Zwecke-Badges) · Angehörige (falls vorhanden) · Zuweiser (falls `zuweiserRef`).
- Historie als kompakte Zeitleiste (Datum + Typ + Text), neueste zuerst, max. ~6 sichtbar.
- Ohne `personId` am Datensatz: In der **Fall-Schublade** rendert der Akte-Slot stattdessen eine Ein-Zeilen-Notiz „Noch keine Einzelperson qualifiziert — die Akte entsteht bei der Qualifizierung." (`.pa-hint`, Muted-Stil). In Datenbank-/Reha-Detail entfällt der Abschnitt ersatzlos, wenn kein `personId` vorhanden ist (betrifft z. B. „Unbekannt (Website)" im Bestand — regulärer Fall, keine Assertion-Verletzung).

CSS: kommentierter `.pa-*`-Block vor `</style>`, Design-Tokens aus `:root` (Palette/Fonts gemäß HANDOVER §3-Tokens), keine bare Klassen, reduced-motion-safe (keine neuen Animationen nötig).

## 4. Constraints (aus HANDOVER §2, hier greifend)

1. Cofounder-Bereiche tabu: `renderMatrix`, `openReferrer`/`#refOverlay`, `.rp-*`/`.rpd-*` (inkl. `renderEinblick`, das `inReha[]` liest), `.rsp-*`, `.mx-*`. Advisor hat verifiziert: additives `personId`-Feld auf `inReha[]` ist für Cofounder-Code unsichtbar (liest nur benannte Felder, kein `Object.keys`/`for…in`/`JSON.stringify` im File).
2. Geteilte Daten nur erweitern — `inReha[]`-Literale werden editiert (Feld ergänzt), niemals umbenannt/gelöscht. Commit zeitnah pushen (Merge-Konflikt-Fenster mit Cofounder klein halten).
3. Nur synthetische Daten (`@demo-*.local`, 0971-Demo-Nummern).
4. Beide Breiten: 390 und 1440, 0 Console-Errors, 0 horizontaler Overflow.
5. CSS additiv, eigener Namespace `.pa-*`.

## 5. Verifikation (Pflicht vor „fertig")

Preview `bavaria-proto`, Desktop 1440×900 **und** Mobile 390×844:
1. `openDetail(1)` → Akte-Abschnitt zeigt Anna Muster: Chips, geb-Zeile, Einwilligung, Historie.
2. `openDbDetail(0)` → Akte für Sabine Vogt inkl. Fall-Historie (Cross-View-Identität sichtbar).
3. `openRsDetail(0)` → Akte für Dieter Franke (`lebenszyklus:"patient"`, Historie anfrage→fall→aufnahme).
4. Live-Flow A: `simulateInbound()` mit `einzelperson:true`-Pool-Eintrag (z. B. „Herr Reinhardt") → entstandenen Fall öffnen → Akte zeigt Laufzeit-Person (pNew-Beweis) mit Historie. Live-Flow B: Pool-Eintrag „Familie Hoffmann" (`einzelperson:false`) → Fall öffnen → Akte-Slot zeigt den Qualifizierungs-Hinweis (keine Fake-Person).
5. `uebernehmen` auf einem Eingangs-Eintrag → entstandenen Fall öffnen → Akte-Slot zeigt Qualifizierungs-Hinweis, KEINE Person namens „Neuer Fall (aus Eingang)".
6. `go('faelle','eingang')` → „In Datenbank"-Aktion auf dem `einzelperson:true`-Passiv-Eintrag (id 107) → neuer Bestand-Eintrag ist in der Datenbank-View **sichtbar** (tier-Fix) und hat eine Akte. (Hinweis für den Verifizierer: Der Boot-Timer `setTimeout(simulateInbound,3200)` konsumiert Pool-Eintrag 0 „Familie Hoffmann" automatisch — Live-Flow B ist damit schon beim Laden ausgelöst; der erste manuelle Klick liefert Pool-Eintrag 1 „Herr Reinhardt". Pool rotiert `_inbN%3`.)
7. Cofounder-Gegenprobe: `go('matrix')` (6 Zellen rendern), `openReferrer('portal','Leopoldina-Krankenhaus')` + Tab „Behandlungs-Einblick" (liest `inReha[]`!) + Tab „Abschlusspaket", `rsp`-Verlaufscharts in `openRsDetail`.
8. Console: 0 Errors, keine Assertion-Warnungen. Kein horizontaler Overflow @390/@1440. Screenshots als Beleg.

## 6. Nicht-Ziele

- Keine View-Redesigns, keine Änderungen an Board/Eingang/Netzwerk-Layouts über den Akte-Abschnitt hinaus.
- Keine Radar-/Anlass-Logik, keine Newsletter-/Kampagnen-UI, kein Forecast (Bausteine B/C).
- Kein Umbau von `RS_BILLING`, kein Entfernen von totem Code (`passivLead`, `mxMetric` — nur dokumentiert).
- Keine Umbenennung/Löschung bestehender Felder; `zuweiser[]`-Objekte bleiben unverändert.
- Keine Persistenz (localStorage o. Ä.).

## 7. Umsetzungshinweis (für den Plan)

Branch `feat/gedaechtnis`. Arbeitsteilung: Seed-Literale + `personId`-Backfill = mechanisch (Haiku-Lane, von der Spec vollständig determiniert, Liste der Personen wird im Plan ausgeschrieben); Helper + Mutator-Einfügungen + `paAkte()`-UI = `claude-implementer-pro` (Sonnet). Verifikation und Merge: Orchestrator (Fable).
