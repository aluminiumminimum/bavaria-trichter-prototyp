# Mitarbeiter-Dashboard „Mein Tag" — Design-Spec

**Datum:** 2026-07-14 · **Status:** Design freigegeben; Review-Runde 1 eingearbeitet
**Datei:** index.html (Single-File-App) · **Namespace:** `.mt-*` · **Persona:** S. Koordination

## 1 · Ziel

Perspektivenwechsel: Die App ist bisher ein Manager-Cockpit. Der „einfache Mitarbeiter"
bekommt eine eigene, ruhige Ansicht: seine To-Dos, strukturiert abarbeitbar, mit klarer
Anleitung *was* zu tun ist und *wie*. Präsentierbar als Fallbeispiel für eine Person
(S. Koordination) — ein Klick wechselt zwischen Leitungs- und Mitarbeiter-Sicht,
beide arbeiten auf denselben Daten.

## 2 · Einstieg: Rollen-Umschalter

- Desktop: Der Topbar-Avatar `.dt-ava` (Zeile ~1683, bisher reiner `<span>`) wird
  klickbar (button-Semantik, cursor:pointer) und öffnet ein kleines Dropdown
  (`.mt-rollmenu`): „Ansicht als S. Koordination". Auswahl setzt
  `document.body.classList.add("ma-mode")`, schließt vorher alle offenen Overlays
  (bestehende close-Mechanik / `.open` entfernen) und zeigt `#view-meintag`.
- Im ma-mode blendet **additives CSS** (eigener Block vor `</style>`) die kompletten
  Leisten und alle anderen Views aus: `body.ma-mode .dsidebar`, `body.ma-mode
  nav.tabbar`, `body.ma-mode header.dtopbar`, `body.ma-mode .view:not(#view-meintag)`
  → `display:none`. Ebenso `#inbToast`/`#rpToast` (fixed-Toasts) im ma-mode
  ausblenden. Es wird NICHTS umgebaut — Rückschalten entfernt nur die Klasse.
  Cofounder-Namespaces (.rp-*/.rpd-*/.rsp-*/.mx-*) unberührt.
- Mein Tag bringt seinen eigenen schlichten Kopfstreifen mit (da dtopbar aus ist):
  Begrüßung + Ghost-Link „‹ Zurück zur Leitungsansicht".
- **Mobile-Einstieg: bewusste Limitation.** Auf <1024 px existiert kein Topbar-Avatar;
  der Rollenwechsel ist ein Desktop-/Präsentations-Feature. Mein Tag selbst ist
  voll responsiv (im ma-mode auf 390 px nutzbar, kein Overflow-X).
- **Auto-Demo-Fall:** `simulateInbound()` feuert ~3–5 s nach Laden und erzeugt einen
  neuen SK-Fall („Erstreaktion", Frist heute). Gewollt: In Mein Tag erscheint dann
  live eine neue Aufgabe (Demo-Moment). Verifikationszahlen gelten NACH dem Feuern.
- Kein Login, keine Rechte-Logik — reiner Ansichtsmodus (Demo).

## 3 · Datenableitung `mtTodos()` — ableiten, nicht verwalten

Zur Laufzeit berechnet (Muster: `anlaesse()`), keine neuen persistenten Arrays.
Feldnamen bestehender Arrays sind Vertrag; nichts wird umbenannt.

**Quellen:**
1. **Fall-Aufgaben** (owner === "S. Koordination"): `faelle` mit `status` ∉
   {Aufgenommen, Verloren}, `aufgabe` nicht leer → ein To-Do. Typ-Heuristik über
   `aufgabe`-Text: /rückruf|erstreaktion/i → `rueckruf`, /angebot/i → `angebot`,
   /unterlagen|dokument/i → `unterlagen`, sonst `allgemein`.
2. **Kostenklärung** (owner === "S. Koordination"): Fälle mit `kosten` ∈
   {offen, abgelehnt} und `status` ∈ {Unterlagen, Aufnahme geplant} → To-Do Typ
   `kosten`, ohne eigene Frist → Block HEUTE/WOCHE. Ein Fall darf zwei To-Dos
   liefern (Aufgabe + Kostenklärung sind getrennte Arbeit); stabile Keys
   `"fall:<id>:<typ>"`. **Seed-Ergänzung** (damit der Typ in Daten und Demo
   existiert): ein zusätzlicher SK-Fall, z. B. `{id:13, name:"Werner Aumann",
   alter:72, …, status:"Unterlagen", kosten:"offen", aufgabe:"", frist:""}` —
   additiv am Muster der Nachbarn, mit personId via bestehender Konvention.
3. **Eingang** (Rollenzuständigkeit — `eingang[]` hat kein owner-Feld;
   Eingangsbearbeitung IST die Rolle von S. Koordination): Einträge mit `!done`
   und `typ==="qualifiziert"` → To-Do Typ `eingang`, CTA „Antwort senden"
   (3 Stück im Seed). Passive Einträge sind bewusst KEINE To-Dos (laufen als
   Datenbank-/Newsletter-Strecke).

**Blöcke & Sortierung:** Fristvergleich mitternachtsnormalisiert (paGeb-Falle).
`frist ≤ heute` → Block **JETZT** (Pill „überfällig" in Terra nur bei `frist <
heute`, sonst „heute fällig" in Messing); Rest inkl. fristlose → **HEUTE/WOCHE**;
Block **GUT ZU WISSEN**: reine Info-Karten ohne CTA — geplante Aufnahmen der
Woche aus `faelle` (status „Aufnahme geplant", alle Owner; im Seed: Ruth Winkler),
keine Aktion, zählt nicht in den Fortschritt.

**Erledigt-Zustand:** Session-Set `_mtDone` (Muster `_arDone`, Keys wie oben) +
echte Daten-Mutation (§4). Fortschritt = erledigte / (JETZT+HEUTE)-Gesamt.

## 4 · Geführte Arbeitskarte (Sheet)

Klick auf ein To-Do öffnet ein JS-erzeugtes Sheet (Anatomie des Kampagnen-Sheets
`kpOpen` / ovDetail-Idiom): Kopf mit Avatar, Name/Fall, Frist-Pill. Vier Sektionen
mit `.rk`-Kickern:

1. **WARUM JETZT** — Kontextzeile aus dem Fall (aufgabe, quelle, letzter log-Eintrag).
2. **SO GEHST DU VOR** — 3–5 Schritte als statische Checkliste je Typ (Haken rein
   visuell, kein Zwang).
3. **LEITFADEN** — Textbaustein je Typ aus konstantem Objekt `MT_LEITFAEDEN`
   (6 Vorlagen: rueckruf = Gesprächsleitfaden, angebot = E-Mail-Vorlage,
   unterlagen = Merkliste, kosten = Vorgehen Kostenzusage, eingang =
   Antwort-Baustein, allgemein = generische Arbeitsregeln). Kurz (≤ 6 Zeilen),
   deutsch, Klinik-Ton.
4. **ABSCHLUSS** — primärer Button „Erledigt · ins Protokoll":
   - immer: `f.log.push([dstr(0), "… erledigt (Mein Tag)"])` bzw. bei Eingang
     `done`-Mechanik des Eingangs nutzen,
   - Typ `kosten`: zusätzlich `f.kosten="angefragt"`. Hinweis: für
     `abgelehnt→angefragt` („erneut anfragen") ist Mein Tag bewusst der ERSTE
     UI-Pfad — die kz-Kette aus Baustein D rendert den Zielzustand korrekt,
     bietet diesen Übergang selbst aber nicht an (dort Endzustand),
   - Typ `rueckruf`/`angebot`/`unterlagen`/`allgemein`: `f.aufgabe=""`, `f.frist=""`
     (Manager-Sichten ziehen konsistent mit; renderWichtig/Board/stockt prüfen
     falsy — reviewt, kein Bruch),
   - `_mtDone.add(key)`, Re-Render von Mein Tag + betroffenen Manager-Renders.
   Danach zeigt das Sheet „Weiter zur nächsten →" (öffnet das nächste offene To-Do)
   oder schließt, wenn nichts mehr offen ist („Alles erledigt"-Moment im Kopf).

## 5 · Optik (Design-Messlatte: bestehende Anatomie wiederverwenden)

- **Kopf:** serifige Begrüßung („Guten Morgen" nach Uhrzeit, Datum), Zusammenfassung
  („6 Aufgaben · 1 heute fällig"), Fortschrittsleiste in Messing (Track hairline,
  Füllung brass, Zahl `n/m` in Cormorant). Ghost-Link zurück zur Leitung.
- **To-Do-Karten:** exakt die radar-card-Familie (`.radar-card`-Anatomie: `.ava`,
  Frist-Pill `.radar-due` [Terra NUR überfällig], Serifen-`h3`, `.patient-meta`,
  `.radar-prog` mit `.rk`-Kickern „Fall"/„Nächster Schritt", `.patient-actions`
  mit `.btn-ghost` „Jetzt erledigen ›"). Erledigte Karten bleiben sichtbar:
  gedimmt + Haken statt CTA.
- **Blöcke:** Kapitel-Köpfe wie #anlassChap (Kicker + Serifen-Zeile).
- Palette/Fonts wie App (Espresso/Taupe/Sand/Messing/Salbei, Cormorant+Inter),
  KEIN BLAU (accent-color/outline explizit), reduced-motion-safe,
  390 px ohne Overflow-X (im ma-mode).

## 6 · Verifikation (Zahlen aus Review-Runde 1, NACH Auto-Inbound)

Browser 1440 (+ 390 im ma-mode): Umschalten hin/zurück ohne Layout-Leichen
(dtopbar/dsidebar/tabbar komplett weg, keine Toasts). Erwartung mit Seed +
Auto-Fall: **JETZT = 2** (Anna Muster „heute fällig" + Auto-Fall „Erstreaktion"),
**HEUTE/WOCHE = 5** (Maria Probst angebot + Werner Aumann kosten + 3× Eingang
qualifiziert), Fortschrittsnenner 7, **GUT ZU WISSEN = 1** (Ruth Winkler).
Je ein To-Do der Typen rueckruf, kosten, eingang öffnen; eines abschließen →
log wächst, Fortschritt +1, Karte gedimmt, „Heute wichtig" (Leitung) konsistent;
Konsole 0 Fehler; Syntax-Check (`sed`-Extraktion + `node --check`).
Sync-Wache (ProtonDrive) vor/nach Edits.

## 7 · Nicht-Ziele

Kein Login/Auth, keine Rechte, keine Persistenz über Reload, keine weiteren
Personas (Muster ist wiederholbar), kein Mobile-Einstiegspunkt für den
Rollenwechsel (nur Desktop), keine neuen Datentöpfe außer dem einen additiven
Seed-Fall, keine Änderungen an Manager-Views außer den beschriebenen
Daten-Mutationen.
