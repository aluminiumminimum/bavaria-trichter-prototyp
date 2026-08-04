# Design-Spec: Kapazitäts-Abgleich am Fall — „Anfrage trifft Bett"

**Datum:** 2026-08-04 · **Branch:** `claude/app-threads-visibility-l4c6ed` · **Status:** in Umsetzung
**Grundlage:** priorisierter Ausbauplan 04.08., Prio 2 Punkt 4 (Nutzer: „los geht's mach weiter").

## 1. Ziel

Der Moment, der die Maschine erklärt: Beim Führen eines Falls sieht die Koordination **direkt am
Fall**, wann im passenden Fachbereich ein Komfortbett frei ist — ohne Telefonkette zur Belegung.
Ein Klick merkt das Bett vor. Kein neuer Datentopf: Es ist **derselbe `belegung[]`-Seed**, den das
Zuweiserportal als „Freie Plätze" zeigt — Vormerken dekrementiert den gemeinsamen Bestand,
Portal und Fallakte zeigen danach denselben Stand (Konsistenz als Pitch-Punkt).

## 2. Bausteine (Namespace `.kap-*` / `kap*` — kollisionsgeprüft, 0 Treffer)

1. **Fallakte · Übersicht** (`faUebersicht`, 1 Einfüge-Aufruf): Block `kapFallHtml(f)` zwischen
   Aufnahme-Zeile und Stammdaten-Fold.
   - 4 Wochen-Zellen mit **echten KW-Nummern** (`fcIsoWeek`, Mittwochs-Anker wie der Forecast):
     frei = Jade (klickbar), knapp (=1) = Gold (klickbar), belegt = still.
   - Fazit-Zeile: „Nächstes freies Komfortbett: **KW 33** — in 1 Woche." Bei 0/0/0/0:
     Zinnober-Warnung „Kein Komfortbett in 4 Wochen frei — Alternativ-Achse oder Warteliste
     klären, bevor die Anfrage kippt" (Brücke zum Verlustgrund „Zu lange Wartezeit"/Keller).
   - Nur solange der Fall vor der Aufnahme steht (nicht bei Aufnahme geplant/Aufgenommen/
     Verloren — dort beantwortet die bestehende Aufnahme-Zeile die Frage) und nur für Achsen
     mit Belegungszeile (Orthopädie/Neurologie/Geriatrie/SalutoCare; „Innere" etc. → kein Block).
2. **Aktion `kapVormerken(fid,i)`**: dekrementiert `belegung[achse].frei[i]`, stempelt
   `f.bettKw` (echte KW-Nummer), Log-Eintrag + `rpToast`, `renderAll()` + Akte-Refresh.
   Danach zeigt der Block die Bestätigung („Komfortbett vorgemerkt · KW 33"). Keine
   Status-Mutation — der reguläre Aufnahme-Flow bleibt unberührt.
3. **Persistenz**: `belegung` wandert in `demoSave`/`demoRestore` (je 1 Zeile), damit
   Vormerkung und Bestand nach Reload konsistent bleiben. Kein Schema-Bump nötig
   (v7-Stände ohne `belegung`-Key behalten den Seed).

## 3. Demo-Dramaturgie

Anna Muster (Neurologie, A-Eskalation): Neurologie `frei:[1,0,2,2]` → „1 frei · diese Woche"
in Gold (knapp) — die heiße Anfrage trifft das letzte Bett der Woche. Klick: vorgemerkt,
Portal-Grid zählt sichtbar herunter.

## 4. Regeln

CSS additiv im SV-AUSBAU-Block vor `</style>`; Welt-Token (Jade/Gold/Zinnober, Radius 3–4px,
Fragment Mono für KW-Micro). Fremdcode-Berührung: 1 Zeile `renderFallakte`, je 1 Zeile
`demoSave`/`demoRestore`. Beide Breiten, 0 Console-Errors, rendert ohne JS (statisches HTML
der Akte bleibt leer wie bisher).

## 5. Nicht in diesem Schritt (bewusst)

Automatischer Abgleich Wunschtermin ↔ Kapazität beim Anlegen · Belegungs-Mini-Grid auf Heute ·
Warteliste als eigenes Objekt · Verlust-Analyse & Netzwerk-Fällige (nächste Prio-2-Punkte).
