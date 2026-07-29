# Global Agent Hub: Codex <-> Claude Code

**Datum:** 2026-07-29  
**Status:** Technisch geprueft und freigegeben
**Anlass:** Projektuebergreifende Zusammenarbeit von Codex und Claude Code, einschliesslich explizit freigegebener autonomer Nachtlaeufe.

## 1. Ziel

Ein lokaler, projektunabhaengiger Hub wird zur gemeinsamen, dauerhaften
Kommunikations- und Aufgabenquelle fuer Codex und Claude Code. Er ersetzt die
bisherigen repo-lokalen Markdown-Mailboxen fuer neue Zusammenarbeit, ohne deren
Historie zu loeschen.

Der Hub muss:

- in beliebigen Projekten und neuen Threads auffindbar sein,
- Nachrichten, Aufgaben, Antworten und Lesestaende nachvollziehbar speichern,
- bei jedem interaktiven Agentenstart offene Arbeit sichtbar machen,
- explizit freigegebene Nachtlaeufe ohne offene UI ausfuehren,
- Codeaenderungen nur isoliert und ohne automatischen Merge, Push oder Deploy
  zulassen,
- bei Unsicherheit, Fehlern oder erreichten Limits sicher stoppen.

Nicht Ziel der ersten Version sind ein Web-UI, Zusammenarbeit ueber mehrere
Computer, Cloud-Synchronisierung oder ein allgemeines Multi-Agent-Framework.

## 2. Betriebsarten

### 2.1 Interaktiver Abgleich

Claude Code erhaelt offene Nachrichten beim Start als Hook-Kontext. Neue
Codex-Aufgaben erhalten automatisch Anzahl, IDs und Projektbezug offener
Nachrichten sowie die verbindliche Anweisung, deren Text ueber die read-only
Inbox zu laden; Nachrichtentexte werden nicht dynamisch in globale
Codex-Instruktionen geschrieben. Antworten werden wieder im Hub gespeichert.
Ist ein Agent nicht geoeffnet, bleibt die Nachricht bis zum naechsten Start
erhalten.

### 2.2 Nachtmodus

Nur ein expliziter Befehl aktiviert einen autonomen Lauf:

```text
agent-hub night start --project bavaria --until 07:00 --goal "..."
```

Der Dispatcher darf dann nichtinteraktive Codex- und Claude-Code-Prozesse
starten. Standardrechte im Nachtmodus:

- analysieren und zwischen den Agenten kommunizieren,
- Dateien ausschliesslich in eigenen isolierten Git-Klonen aendern,
- projektdefinierte Tests und lokale Verifikation ausfuehren,
- vom Supervisor erzeugte lokale Commits auf dem temporaeren Uebergabebranch
  vorbereiten lassen.

Standardmaessig verboten:

- Merge auf `main` oder andere bestehende Nutzerbranches,
- Push, Pull Request, Deployment oder Release,
- externe Nachrichten, E-Mails oder Veraenderungen in Drittsystemen,
- Aenderung von Zugangsdaten, globalen Berechtigungen oder Sicherheitsregeln,
- destruktive Git-Befehle und Bearbeitung ausserhalb registrierter Pfade.

## 3. Globale Ablage

Der Hub lebt lokal unter `~/.agent-hub/` und ist damit unabhaengig vom aktuellen
Repo:

```text
~/.agent-hub/
  bin/agent-hub
  hub/
  config/projects.json
  state/hub.sqlite3
  state/STOP_ALL
  logs/
  transcripts/
  workspaces/
  docs/
```

- Python 3 und SQLite werden verwendet; keine dauerhafte Serverdependency.
- SQLite ist die kanonische Zustandsquelle. Transaktionen verhindern doppelte
  Claims bei gleichzeitigem Start.
- Menschenlesbare Markdown-Transkripte werden pro Projekt und Lauf exportiert.
- Datenbank, Logs und Konfiguration erhalten nur Benutzerzugriff (`0700` fuer
  Verzeichnisse, `0600` fuer zustandsbehaftete Dateien).
- Der SQLite-Zustand liegt bewusst nicht in einem Cloud-Sync-Ordner.
- Detail-Logs und Rohtranskripte werden nach 30 Tagen geloescht; redigierte
  Laufzusammenfassungen bleiben erhalten. Umgebungsvariablen, Auth-Dateien und
  erkannte Token-/Secret-Muster werden nie in Transkripte uebernommen.

## 4. Datenmodell

### Projekt

- stabile Projekt-ID und Anzeigename,
- absoluter Repo-Pfad,
- Standardbranch,
- erlaubte Testbefehle,
- erlaubte Schreibpfade oder ausgeschlossene Pfade,
- maximale Laufzeit und Agentenrunden,
- Nachtmodus standardmaessig deaktiviert.

### Nachricht/Aufgabe

- ID, Projekt-ID, Lauf-ID und Zeitstempel in UTC,
- Absender und Empfaenger (`user`, `codex`, `claude`, `coordinator`),
- Typ (`message`, `task`, `result`, `question`, `decision`, `blocker`),
- Status (`queued`, `claimed`, `running`, `waiting`, `completed`, `failed`,
  `cancelled`, `interrupted`, `needs_review`),
- Prioritaet, Zielbeschreibung und Akzeptanzkriterien,
- Autonomiestufe (`interactive`, `analysis`, `overnight`),
- Claim-Lease, Versuchszahl und parent-ID fuer Antwortketten,
- Ergebniszusammenfassung, Commit-ID und Verifikationsnachweis.

Ein Task kann nur von einem Worker gleichzeitig geclaimt werden. Abgelaufene
Leases werden niemals allein aufgrund der Zeit erneut vergeben. Erst nachdem
der Supervisor die zugehoerige Prozessgruppe nachweislich beendet hat, wird der
Versuch als `interrupted` markiert. Ein unterbrochener Schreibversuch wechselt
immer zu `needs_review` und wird nicht automatisch wiederholt.

### Zustellung und Lesestaende

Eine separate Zustellung verbindet jede Nachricht mit genau einem Empfaenger
und speichert `delivered_at`, `seen_at` und `acknowledged_at`. `ack` bestaetigt
nur Empfang beziehungsweise Kenntnisnahme. Der fachliche Task-Status wird
ausschliesslich durch Claim, Ergebnis oder explizite Stornierung geaendert.
Damit kann eine gelesene Nachricht nicht versehentlich als erledigter Task
gelten.

### Lauf-Freigabe

`night start` erzeugt eine unveraenderliche Freigabe mit Lauf-ID, Projekt,
Ziel-Hash, Ablaufzeit, erlaubten Faehigkeiten und Limits. Der Dispatcher prueft
diese Freigabe vor jedem Claim und vor jeder Folgeaufgabe erneut.

- Agenten duerfen Folgeaufgaben nur innerhalb derselben Lauf-ID erzeugen.
- Folgeaufgaben erben hoechstens eine Teilmenge der bestehenden Rechte.
- Laufzeit, Pfade, Agenten, Versuche und Autonomiestufe koennen durch Agenten
  weder erweitert noch verlaengert werden.
- Freigaben werden ueber den Kontrollkanal des Supervisors erstellt oder
  widerrufen. Worker erhalten keinen Zugriff auf diesen Unix-Socket.
- Abgelaufene oder widerrufene Freigaben koennen keine neuen Claims erzeugen.

## 5. Komponenten

### 5.1 CLI

Die lokale CLI bietet mindestens:

```text
agent-hub status
agent-hub projects
agent-hub project add
agent-hub inbox --as codex|claude
agent-hub send --from ... --to ... --project ... --message ...
agent-hub ack <id>
agent-hub night start ...
agent-hub night status
agent-hub stop
agent-hub resume
```

Jeder schreibende Befehl validiert Projekt, Empfaenger, Autonomiestufe und
Pfadgrenzen vor der Zustandsaenderung.

### 5.2 Dispatcher und Supervisor

Ein macOS-LaunchAgent betreibt den Supervisor. Ohne aktiven Nachtlauf schlaeft
er ereignisgesteuert; waehrend eines Laufs ueberwacht er Worker, Heartbeats,
Deadlines und Prozessgruppen. `launchd` startet ihn nach einem Crash neu.

Jeder Worker laeuft in einer eigenen Prozessgruppe. Der Supervisor speichert
Run-ID, Attempt-ID, PID, PGID, Startzeit und Heartbeat transaktional. Nach einem
Supervisor-Neustart werden vorhandene Prozessgruppen zuerst abgeglichen:

- ein noch lebender verwaister Worker wird beendet,
- nachweislich tote Worker werden als `interrupted` markiert,
- unsichere oder schreibende Versuche gehen zu `needs_review`,
- es erfolgt kein automatischer neuer Schreibversuch.

Ein persistenter Projekt-Lock gilt fuer den gesamten schreibenden Versuch und
wird erst nach bestaetigtem Ende der Prozessgruppe freigegeben. Pro Projekt darf
hoechstens ein schreibender Worker aktiv sein. Reine Analysen duerfen parallel
laufen. Sie erhalten zwingend ein eigenes read-only-Profil ohne Edit-/Write-
Tools, schreibbaren Projektpfad oder Testausfuehrung. Kann das Profil fuer eine
installierte CLI-Version nicht nachgewiesen werden, startet kein Analyse-Worker.

### 5.3 Agentenadapter

**Codex:** Nutzung der vorhandenen offiziellen CLI ueber `codex exec` mit
`workspace-write`-Sandbox, deaktiviertem Tool-Netzwerk, festem
Arbeitsverzeichnis, begrenzter Aufgabe und strukturiertem Ergebnis. Ein
generiertes Permission-Profil beschraenkt lesbare und schreibbare Roots auf die
isolierte Arbeitskopie und gibt keine Unix-Sockets frei.

**Claude Code:** Installation der offiziellen CLI und Nutzung von `claude -p`
mit JSON-Ausgabe, `dontAsk`-Modus, begrenzten Turns und projektspezifischer
Tool-Allowlist. Claudes native Sandbox wird mit
`sandbox.enabled=true`, `failIfUnavailable=true` und
`allowUnsandboxedCommands=false` erzwungen. Tool-Netzwerkzugriffe erhalten
keine erlaubten Domaenen. `--dangerously-skip-permissions`, Computer Use,
WebFetch, WebSearch und nicht registrierte MCP-Tools werden nicht verwendet.
`Read`-/`Edit`-Regeln verweigern den Benutzerordner und erlauben ausschliesslich
die isolierte Arbeitskopie. Der Worker sieht weder Hub-Datenbank noch
Kontrollsocket; Unix-Socket-Zugriff ist im OS-Sandboxprofil nicht erlaubt.

Agenten laufen mit bereinigter Umgebung ohne SSH-, GitHub-, Cloud-,
Deployment- oder Kommunikations-Credentials. Tests werden nicht aus frei
formulierten Agentenbefehlen abgeleitet: Der Supervisor fuehrt ausschliesslich
die registrierten Testbefehle unter derselben Pfad- und Netzisolation, mit
Timeout und deaktivierten Git-Hooks aus.

CLI-Authentifizierung bleibt Aufgabe des jeweiligen kontrollierenden
Clientprozesses. Bevor der Nachtmodus freigeschaltet wird, muss ein Test
nachweisen, dass weder Bash noch eingebaute Lese-/Schreibtools Auth-Dateien,
Hub-Zustand oder Kontrollsocket erreichen. Scheitert dieser Test, bleibt der
betroffene Adapter fuer Nachtlaeufe deaktiviert.

Beide Adapter erhalten nur:

- den konkreten Task,
- relevante vorherige Nachrichten desselben Laufs,
- Projektpfad und Projektrichtlinien,
- klare Ausgabe- und Stop-Anweisungen.

Sie erhalten nicht pauschal die Historie aller Projekte.

### 5.4 Startintegration

- `~/.codex/AGENTS.md` erhaelt eine kurze globale Startregel, die auf
  `agent-hub inbox --as codex` verweist.
- `~/.claude/CLAUDE.md` erhaelt dieselbe Regel fuer Claude.
- Claudes globaler `SessionStart`-Hook ruft einen schnellen, rein lesenden
  Kontextbefehl auf. Dessen stdout wird Claude als Kontext bereitgestellt.
- Fuer Codex pflegt der Hub zusaetzlich atomar einen klar markierten,
  maschinell verwalteten Inbox-Block in `~/.codex/AGENTS.md`. Da diese Datei
  bei jeder neuen Codex-Aufgabe global geladen wird, sind offene IDs und
  Projektbezuege ohne freiwilligen CLI-Aufruf sichtbar. Der Block enthaelt
  keine Nachrichtentexte oder Projektdaten, sondern nur die Aufforderung, die
  passenden Eintraege ueber die read-only Inbox abzurufen. Laufende,
  bereits gestartete Codex-Aufgaben erhalten keine nachtraegliche
  Kontexteinspeisung.
- Automatisches Wecken erfolgt im Nachtmodus direkt ueber den Dispatcher.

Bestehende Inhalte dieser globalen Dateien und vorhandene Hooks werden additiv
erhalten. Der Hub darf nur Inhalt zwischen eigenen, eindeutigen Start- und
Endmarkern atomar ersetzen.

## 6. Koordination und Git

- Nachtlaeufe starten nur bei sauber registriertem Git-Repo.
- Fuer jeden Lauf entstehen ein temporaerer Uebergabebranch
  `agent-hub/<run-id>/handoff` sowie getrennte lokale Vollklone ohne Hardlinks
  und ohne Remotes. Die Klone teilen weder `.git` noch Refs oder Konfiguration
  mit dem Nutzer-Repo.
- Ein Koordinator vergibt Schreibaufgaben standardmaessig sequenziell.
- Ueberlappende Schreibpfade werden nicht gleichzeitig freigegeben.
- Agenten duerfen Arbeitsdateien aendern, erzeugen aber keine vertrauenswuerdigen
  Git-Commits. Aenderungen an ihrem lokalen `.git` werden verworfen.
- Der Supervisor berechnet und validiert den Patch gegen den bekannten
  Ausgangsbaum, wendet ihn in einer eigenen vertrauenswuerdigen
  Integrationsarbeitskopie an, fuehrt dort die registrierten Tests aus und
  erzeugt den Agenten zugeordneten lokalen Commit.
- Nach erfolgreicher Verifikation aktualisiert der Supervisor ausschliesslich
  den temporaeren Uebergabebranch. Bei Konflikt stoppt der Lauf. Der naechste
  isolierte Klon wird erst danach frisch von diesem Stand erzeugt.
- Kein Agent fuehrt selbst Merge, Rebase, Cherry-pick oder Ref-Updates im
  Nutzer-Repo aus.
- Vor jedem Supervisor-Commit werden Status, Patch und Projekt-Tests
  protokolliert.
- Am Ende bleiben Uebergabebranch und isolierte Klone zur menschlichen Pruefung
  bestehen.
- Der Morgenbericht nennt pro Agent geaenderte Dateien, Commits, Tests,
  Blocker und empfohlene Integrationsreihenfolge.

Vor dem Start werden Repo-Root, isolierter Klon und erlaubte Pfade mit
`realpath` kanonisiert. Der Worker darf nur in seinem kanonischen Klon
schreiben. Remotes werden entfernt, Git-Hooks mit
`core.hooksPath=/dev/null` deaktiviert und die globale Git-Konfiguration nicht
geladen. Submodule sind in Version 1 fuer Schreiblaeufe nicht zugelassen.
Symlinks duerfen als Repo-Dateien existieren, aber Pfadvalidierung und
OS-Sandbox folgen ihnen nicht aus dem Klon hinaus. Der Supervisor lehnt Patches
mit Pfaden ausserhalb der Freigabe ab.

### 6.1 Idempotente Uebergabe

Jede Patch-Uebernahme erhaelt eine eindeutige Operation-ID. Vor der Git-
Operation speichert der Supervisor transaktional `operation_id`, Ausgangs-OID,
Patch-Hash und Phase `prepared`. Der vertrauenswuerdige Commit traegt
`Agent-Hub-Operation: <id>` als Trailer. Der Uebergaberef wird mit
`git update-ref <ref> <new> <expected-old>` atomar aktualisiert.

Nach einem Crash gilt:

- zeigt der Ref auf einen Commit mit passender Operation-ID und Patch-Hash,
  wird nur die Datenbankphase auf `applied` nachgezogen,
- steht der Ref unveraendert auf der gespeicherten Ausgangs-OID, darf dieselbe
  vorbereitete Operation fortgesetzt werden,
- jeder andere Ref- oder Hash-Zustand wird `needs_review`,
- dieselbe Operation-ID kann keinen zweiten Commit an den Ref haengen.

## 7. Grenzen und Abbruch

Standardlimits je Nachtlauf:

- vom Nutzer gesetzte Endzeit, sonst maximal acht Stunden,
- maximal vier Uebergaben zwischen den Agenten,
- maximal sechs agentische Turns je Worker-Aufruf,
- maximal zwei Versuche pro Task,
- maximal ein schreibender Worker pro Projekt.

Der Lauf stoppt bei:

- Datei- oder Git-Konflikt,
- fehlender Authentifizierung oder Kontingentfehler,
- nicht erlaubter Aktion oder Pfadverletzung,
- wiederholtem Testfehler ohne neue Diagnose,
- unklarer Produktentscheidung,
- gesetztem globalem `state/STOP_ALL` oder laufbezogenem Stop,
- erreichter Zeit-, Turn- oder Versuchsbeschraenkung.

`agent-hub stop --run <id>` stoppt genau einen Lauf;
`agent-hub stop --project <id>` stoppt aktive Laeufe eines Projekts;
`agent-hub stop --all` setzt zusaetzlich `state/STOP_ALL`. Ohne Zielparameter
ist der Befehl ungueltig. Ein Stop widerruft zuerst die Freigabe und verhindert
neue Claims. Danach erhaelt die gesamte Prozessgruppe `SIGTERM`, nach maximal
30 Sekunden `SIGKILL`. Erst nach bestaetigtem Prozessende werden Locks
freigegeben.

`agent-hub resume --run <id>` kann nur einen explizit genannten, noch nicht
abgelaufenen Lauf reaktivieren. Abgeschlossene, fehlgeschlagene oder
`needs_review`-Tasks werden nicht neu eingeplant. Fuer einen unterbrochenen
Schreibversuch ist ein eigener, vom Nutzer ausgeloester `retry`-Befehl
erforderlich. `STOP_ALL` muss separat durch `resume --all` entfernt werden.

## 8. Installation und Einmalaktionen

1. Eigenstaendiges lokales Hub-Verzeichnis initialisieren.
2. Offizielle Claude-Code-CLI installieren.
3. Falls erforderlich, einmalige interaktive Claude-Anmeldung durch den Nutzer.
4. Versionen und erwartete Sicherheitsoptionen beider CLIs pruefen; bei
   unbekannter oder inkompatibler Version bleibt der Nachtmodus deaktiviert.
5. Codex- und Claude-Adapter jeweils mit einem read-only Smoke-Test pruefen.
6. Globale Instruktionen und Claude-`SessionStart`-Hook additiv eintragen.
7. LaunchAgent installieren, aber Nachtmodus standardmaessig deaktiviert lassen.
8. Bavaria als erstes Projekt registrieren.
9. End-to-End-Test in einem temporaeren Git-Repo ausfuehren.

Bestehende repo-lokale Mailboxen bleiben unangetastet. Ein spaeterer Import ist
eine getrennte, optionale Aufgabe.

## 9. Verifikation

### Automatisierte Tests

- SQLite-Migrationen und Transaktions-Claims,
- Statusuebergaenge und Lease-Ablauf,
- Zustell-, Gelesen- und Bestaetigungsstaende,
- Freigabevererbung und Widerruf,
- Projekt- und Pfadvalidierung,
- `realpath`, Symlink-, Submodule- und Hook-Grenzen,
- Limits, laufbezogener/globaler Stop und Prozessgruppenabbruch,
- Supervisor-Crash und verwaister Worker ohne automatischen Doppelversuch,
- Supervisor-Crash vor und nach atomarem Ref-Update ohne doppelten Commit,
- strikt read-only laufender Analyse-Worker,
- verweigerter Zugriff auf Auth-Dateien, Hub-Zustand und Kontrollsocket,
- Fake-Adapter fuer Erfolg, Fehler, Timeout und ungueltige Ausgabe,
- additive Aenderung bestehender Claude-Hooks,
- Morgenbericht und Markdown-Export.

### Smoke-Tests

- Codex und Claude sehen dieselbe Testnachricht und bestaetigen sie.
- Ein interaktiver Start zeigt nur Nachrichten des passenden Empfaengers.
- Ein Nachtlauf in einem temporaeren Repo erzeugt zwei isolierte Klone,
  einen temporaeren Uebergabebranch, Supervisor-Commits und einen
  Abschlussbericht.
- Ein absichtlich verbotener Push und ein Schreibversuch ausserhalb des
  isolierten Klons werden abgewiesen.
- Ein Agent kann eine Lauf-Freigabe weder verlaengern noch hochstufen.
- `agent-hub stop --run` verhindert weitere Claims und beendet die gesamte
  Test-Prozessgruppe.

## 10. Erfolgskriterien

Die erste Version gilt als einsatzbereit, wenn:

1. Nachrichten ueber Projekt- und Threadgrenzen erhalten bleiben,
2. Claude offene Nachrichten per Start-Hook und neue Codex-Aufgaben sie ueber
   den verwalteten globalen Inbox-Hinweis automatisch sehen,
3. ein expliziter Nachtlauf beide CLIs begrenzt und nachvollziehbar ausfuehrt,
4. parallele Schreibzugriffe auf dasselbe Projekt verhindert werden,
5. keine automatische Integration in Nutzerbranches und keine externe
   Nebenwirkung moeglich ist,
6. Stop, Timeout und Fehler einen verstaendlichen Morgenbericht hinterlassen,
7. alle automatisierten Tests und der isolierte End-to-End-Test erfolgreich
   sind.
