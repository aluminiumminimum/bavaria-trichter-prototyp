# Runde 6, Punkt 8 — Koordinationsansicht ⇄ Fallakte: Kreislauf schließen

**Bezug:** Sechste Runde, Nutzer-Feedback-Punkt 8. Nutzer wörtlich: „Die Mitarbeiterin bearbeitet die
Fallakte aus der Koordinationsübersicht" — der Kreislauf Mein-Tag → Fallakte → zurück muss sich rund
anfühlen. Bereits umgesetzt (P1): ma-mode-CSS-Gate (`index.html:1541-1543`), Aufgaben-Klick auf
`kind==="fall"` öffnet `openFallakte()`, Pool-Übernahme öffnet die Fallakte.

## 1. Ist-Stand (verifiziert)

**a) Zurück-Button (`index.html:4094`).** Ein einziger Button, geteilt zwischen Leitung und ma-mode:
`onclick="go('faelle','board')"`, Label immer „‹ Zurück zum Board". `go()` toggelt nur `.active`-Klassen
und ruft bei `dest==="fallakte"` `renderFallakte()` — **nicht** `renderMeinTag()` bei `dest==="faelle"`.
Das CSS-Gate zeigt nach dem Klick zwar wieder `#view-meintag` (korrekt), aber dessen DOM (Aufgabenliste,
Fortschritt `doneCount/total`, Pool) bleibt der Stand von vor dem Fallakte-Besuch. Bug bestätigt.

**b) `advanceFall()` (`index.html:6750`).** Ändert `f.status/f.aufgabe/f.frist/f.log` direkt auf dem
Fall-Objekt, ruft `renderAll()+renderFallakte()` — `renderAll()` (`index.html:6538`) enthält kein
`renderMeinTag()`. `mtTodos()` (`index.html:6961`) liest aber live aus dem globalen `faelle[]`-Array,
keine Zwischenspeicherung — sobald `renderMeinTag()` erneut läuft, ist der Stand aktuell. Folgt direkt
aus Fix (a).

**c) Eingang-Aufgaben (`kind==="eingang"`, `mtCard`, `index.html:6998-7000`).** Öffnen aktuell `mtOpen()`
→ `mtSheet` mit Notizfeld + „Erledigt · ins Protokoll"-Button (`mtAbschliessen` setzt `m.done=true`).
`openEgDetail()` (`index.html:4462`) ist ein `.overlay` (`position:fixed;inset:0`, kein `.view`) — vom
ma-mode-CSS-Gate strukturell unberührt, öffnet technisch sauber. **Aber**: für genau die Nachrichten, die
in Mein Tag als „Antwort senden"-Aufgabe erscheinen (`typ==="qualifiziert"`, meist bereits `m.gruppe`
gesetzt), zeigt `openEgDetail()` im `m.gruppe`-Zweig (`index.html:4476`) nur einen **passiven** Text
„wartet auf Übernahme" — **keinen** Abschluss-Weg (kein Notizfeld, kein „Erledigt"-Button). Der einzige
funktionierende Abschluss-Pfad für diese Aufgabenklasse ist weiterhin `mtSheet`/`mtAbschliessen`.
→ **Kein Fix**, Sheet bleibt für `kind==="eingang"` UND `kind==="intern"` unverändert. (Technischer
Overlay-Konflikt: keiner. Funktionaler Bruch: ja — egDetail bietet keinen Erledigt-Pfad für diesen Fall.)

**d) Pool → Übernehmen → Akte → Zurück.** `egUebernehmenAusPool()`→`uebernehmen()` (`index.html:5000`)
setzt `m.done=true`, legt neuen Fall an, ruft `renderAll()+openDetail(fid)` (=`openFallakte`). `renderAll()`
schließt `renderEgtPool()` nicht ein, aber `renderMeinTag()` tut es (`index.html:7085`). Folgt ebenfalls
aus Fix (a): sobald Zurück `renderMeinTag()` aufruft, verschwindet die übernommene Anfrage aus dem Pool
und die neue Fall-Aufgabe erscheint in „Was jetzt dran ist".

## 2. Fix (nur Punkt a, chirurgisch)

- Button bekommt `id="faBackBtn"`, `onclick="faZurueck()"`.
- Neue Funktion `faZurueck()`: ruft `go('faelle','board')` wie bisher, danach zusätzlich
  `renderMeinTag()` **nur wenn** `document.body.classList.contains("ma-mode")` — Leitung-Verhalten
  bleibt exakt unverändert (kein `renderMeinTag()`-Call außerhalb ma-mode).
- `renderFallakte()` setzt bei jedem Aufruf `#faBackBtn`-Label: ma-mode → „‹ Zurück zu Mein Tag",
  sonst „‹ Zurück zum Board".

Kein Fix für (b)/(c)/(d) nötig — sie folgen aus (a) bzw. sind bereits korrekt (c: dokumentiert, keine
Änderung).

## 3. Abnahmekriterien

1. Leitung-Modus: Fallakte-Button zeigt weiterhin „‹ Zurück zum Board", Klick → Board, unverändert.
2. ma-mode: Fallakte-Button zeigt „‹ Zurück zu Mein Tag".
3. Kreislauf Aufgabe→Akte→erledigt (`advanceFall`)→Zurück: Mein-Tag-Liste/Fortschrittszähler zeigen
   danach den neuen Stand (kein Reload nötig).
4. Pool→Übernehmen→Akte→Zurück: Pool zeigt die Anfrage nicht mehr, neue Aufgabe erscheint in „Was
   jetzt dran ist".
5. Eingang-Karte (`kind==="eingang"`) öffnet weiterhin `mtSheet` (unverändert, siehe §1c).
6. 390px + 1440px: 0 Console-Errors, Tabbar/`body.locked` in ma-mode unverändert, `@keyframes`-Anzahl
   unverändert (9 echte Definitionen), `.rp-*`/`.mx-*`/`#refOverlay` unangetastet.
