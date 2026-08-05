---
name: deploy
description: Den aktuellen Stand sicher live bringen — Branch mergen, auf main pushen, GitHub-Pages-Build verifizieren. Nutzen bei /deploy, „mach es live", „push es online" oder nach abgeschlossener, verifizierter Arbeit.
---

# Deploy — verifiziert live bringen

Deploy = Push auf `main` → GitHub Pages baut ~1 min. Mehrere Leute pushen
parallel — deshalb strikt in dieser Reihenfolge:

## Vorbedingung (nie überspringen)

Verifikation ist gelaufen: Syntax-Gate, Playwright 390+1440 (0 Errors,
0 Overflow), Screenshots gesichtet. Ungeprüftes wird nicht deployt.

## Ablauf

```bash
git add <dateien> && git commit -m "…"        # auf dem Arbeits-Branch
git push -u origin <branch>
git checkout main && git pull origin main      # IMMER erst pull
git merge --no-ff <branch> -m "Merge: …"
git push origin main
git checkout -B <branch> origin/main           # Branch neu ausrichten
git push --force-with-lease origin <branch>
```

Bei Merge-Konflikt: Konflikt lösen, Verifikation WIEDERHOLEN, dann pushen.

## Build verifizieren

GitHub-MCP `actions_list` (branch main). Achtung: Ergebnis sprengt das
Token-Limit → wird als Datei gespeichert; auslesen mit
`jq -r '.workflow_runs[0] | [.status,.conclusion,.head_sha[0:7]] | @tsv' <datei>`.
Erst wenn `completed success <merge-sha>` dasteht, ist es live —
`curl` auf github.io funktioniert aus der Sandbox NICHT (Proxy-403).

## Rückmeldung an den Nutzer

Commit-SHA + „Build grün" + Hinweis Hard-Refresh; bei Seed-Änderungen
(`DEMO_SCHEMA`-Bump) erwähnen, dass alte Browser-Teststände verworfen werden.
