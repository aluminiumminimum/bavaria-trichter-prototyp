# ai-proxy — Kimi-Proxy (Ops-Runbook)

Dependency-freier Node-Proxy (`node:http`/`node:https`), hält `KIMI_API_KEY`
serverseitig. Wegwerf-Demo-Infra für den Klinik-Bavaria-Prototyp, kein
Produktionsanspruch. **Keine echten Secrets in diesem Repo/Datei.**

## a) hPanel — Node.js Web App anlegen

1. Hostinger hPanel → Websites → Node.js Web App.
2. Subdomain `ai.quintia.de` zuweisen (TLS wird von Hostinger verwaltet).
3. Startdatei: `server.js`.
4. Node-Version: `>=18` (siehe `package.json` `engines`).
5. Environment-Variablen setzen (Werte NIE hier eintragen, nur die Keys —
   siehe `.env.example`):
   - `KIMI_API_KEY`
   - `KI_SHARED_TOKEN`
   - `KIMI_MODEL`
   - `KIMI_VISION_MODEL`
6. App starten (`npm start` bzw. hPanel-„Start"-Button).

## b) Deploy

Aus diesem Repo-Ordner (`ai-proxy/`) per SSH/git auf den Server bringen:
- Entweder `git clone`/`git pull` des Repos auf dem Server und die App auf
  den `ai-proxy/`-Unterordner zeigen lassen, ODER
- `scp -r ai-proxy/ user@server:/pfad/zur/app/` und dort `npm start`.

Nach jedem Deploy die App im hPanel neu starten, damit neue Env-Vars/Code
greifen.

## c) Smoke-Tests

```bash
# Health (kein Token nötig)
curl -s https://ai.quintia.de/health
# → {"ok":true,"model":"..."}

# /ai mit Shared-Token
curl -s -X POST https://ai.quintia.de/ai \
  -H 'Content-Type: application/json' \
  -H 'X-KI-Token: <KI_SHARED_TOKEN-Wert>' \
  -d '{"messages":[{"role":"user","content":"Antworte nur: OK"}]}'
# → {"text":"OK", ...}

# CORS-Preflight
curl -s -i -X OPTIONS https://ai.quintia.de/ai \
  -H 'Origin: https://aluminiumminimum.github.io' \
  -H 'Access-Control-Request-Method: POST'
# → 204 mit Access-Control-Allow-Origin: https://aluminiumminimum.github.io
```

## d) Spend-Cap

Im Kimi/Moonshot-Konto ein Ausgabenlimit (Spend-Cap) setzen, bevor der Key
produktiv verwendet wird — Schutz gegen versehentliche Kostenexplosion bei
einer öffentlich erreichbaren Demo.
