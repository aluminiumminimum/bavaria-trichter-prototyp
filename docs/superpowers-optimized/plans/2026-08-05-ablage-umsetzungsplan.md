# Umsetzungsplan: Ablage-Fächer & Eskalations-Doktrin

**Spec:** 2026-08-05-ablage-und-eskalations-doktrin.md · Namespace `.abl-*`/`abl*` (kollisionsfrei geprüft)

## Schritte

1. **Kernlogik** (neuer Block nach den sv-Funktionen):
   `ABL_GRUENDE` (Katalog mit art/wecker/max je Grund) · `ablAktiv(f)` · `ablWeckerInfo(f)`
   (Resttage bis Wecker/Max) · `ablAblegen(fid)` (liest `#ablGrund/#ablNotiz`, setzt
   `f.ablage`, pusht `f.ablHist`, Log+Toast) · `ablReaktivieren(fid,quelle)` (löscht ablage,
   `f.frist=dstr(1)`, Log+Toast) · `ablSpaeter(fid)` (+3 Tage, zyklen++) ·
   `ablArchivieren(fid)` (Status „Archiviert", Radar-Push, Log) · `ablDemoAntwort(fid)`
   (Sim-Idiom: eingehende Log-Zeile + Reaktivierung).
2. **Doktrin-Integration** (chirurgisch): `svFallState` +1 Zeile (ablage⇒null) ·
   `svEskalationen` Fall-Loop +1 Zeile skip · `stockt` +1 Zeile · `offeneFaelle`/`mtTodos`/
   `kfSyncStatus`/`fvw`-Guards um „Archiviert" ergänzen · `STATUS_COL["Archiviert"]` slate ·
   `wvNichtErreicht` setzt zusätzlich `f.ablage` (Grund „Nicht erreicht", wecker=Sterne-Tage,
   zyklen=anrufe) · `simApply` reaktiviert bei eingehender Nachricht (+1 Zeile).
3. **Board**: `makeBoardCol` filtert `ablAktiv`-Fälle aus, Spaltenkopf „+n"-Mono-Hinweis ·
   `renderBoard` ruft `renderAblage()` · HTML: `<div id="ablFaecher">` nach `#board` ·
   Abgeschlossen-Leiste: Archiviert-Spalte (nur wenn vorhanden) + Zähler.
4. **Fallakte** (`lagebildHtml` erweitern): bei ablage → `.abl-band` (Grund/Notiz/Automatik/
   Zyklus + Aktionen Wiederaufnehmen · Demo-Antwort (ereignis) · +3 Tage · Archivieren ab
   Zyklus 3 hervorgehoben); sonst Ghost-Toggle „Extern blockiert — Fall ablegen…" mit
   Formular (Grund-Select mit Automatik-Vorschau, Notiz).
5. **Mein Tag**: `mtTodos` Fall-Loop — abgelegte Fälle liefern statt Fach-Aufgabe nur bei
   fälligem Wecker ein `wiedervorlage`-Item (jetzt-Block); `MT_TYP_LABEL/NOTIZ/SCHRITTE`
   ergänzen.
6. **Auswertung**: Chart „Woran hängen Fälle?" (`#chartAblage`, bar()-Idiom über `ablHist`
   aller Fälle) nach `#chartEngpass` + Hebel-Fazit.
7. **Seeds**: Peter Hofmann (id 8) abgelegt: Grund „Unterlagen ausstehend", art ereignis,
   seit dstr(-7), wecker 7 (⇒ heute fällig), max 14, zyklen 2, ablHist gesetzt — demonstriert
   Fach + fällige Wiedervorlage + Archiv-Vorschlag + Demo-Antwort an EINEM Fall, ohne
   Leitfälle (Anna/Maria/Werner) zu berühren. `DEMO_SCHEMA` 10→11.
8. **CSS** `.abl-*` vor `</style>`: Fächer-Grid (auto-fill minmax 280px), Fach-Karte mit
   Kicker + Cormorant-Zähler, stille Zeilen (Ava/Name/Notiz/Wecker-Mono-Chip, gold bei
   fällig, Ereignis-Badge), Band + Formular in der Fallakte. Zinnober kommt nicht vor.

## Verifikation

Syntax-Gate · Playwright 390/1440 (localStorage.clear!) · Flows: ablegen→Board leert
sich→Fach erscheint→Demo-Antwort→zurück im Board mit neuer Frist · Wiedervorlage fällig →
Mein-Tag-Karte (Fall auf S. Koordination legen) · Archivieren → Abgeschlossen-Leiste +
Radar-Eintrag · Eskalationen enthalten keine abgelegten Fälle · Screenshots sichten · Deploy.
