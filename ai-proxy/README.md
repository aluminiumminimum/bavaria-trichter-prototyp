# ai-proxy — Kimi-Proxy (Ops-Runbook)

Dependency-freier Node-Proxy (`node:http`/`node:https`), hält `KIMI_API_KEY`
serverseitig. Wegwerf-Demo-Infra für den Klinik-Bavaria-Prototyp, kein
Produktionsanspruch. **Keine echten Secrets in diesem Repo.**
**Live:** https://ai.quintia.de (Hostinger, seit 2026-07-24).

## Deploy-Realität (Stand 2026-07-24)

Der Hostinger-Plan hat **keinen** hPanel-„Node.js"-Menüpunkt, aber LiteSpeed
`lsnode` + Passenger sind aktiv (Node 18/20/22/24 unter
`/opt/alt/alt-nodejsNN/root/bin/node`). Node-Apps laufen deshalb über eine
**Passenger-`.htaccess`** im Web-Root der Subdomain — nicht über einen
hPanel-Node-Selector. (Vorlage war die bestehende `auth.hakim-med.org`-App.)

### a) Subdomain
hPanel → Domains → Subdomänen: `ai` unter `quintia.de` (eigener Ordner, nicht das
geteilte `public_html`). SSL: Hostinger stellt für die Subdomain automatisch ein
Let's-Encrypt-Zertifikat aus (nichts weiter nötig).

### b) App-Ordner (außerhalb des Web-Roots)
`domains/quintia.de/ai-nodejs/` (enthält `server.js` + `tmp/`). Deploy per SSH:
```bash
ssh <host> 'mkdir -p domains/quintia.de/ai-nodejs/tmp && cat > domains/quintia.de/ai-nodejs/server.js' < ai-proxy/server.js
```

### c) Passenger-`.htaccess`
In den Web-Root der Subdomain: `domains/quintia.de/public_html/ai/.htaccess`
```
PassengerAppRoot /home/<USER>/domains/quintia.de/ai-nodejs
PassengerAppType node
PassengerNodejs /opt/alt/alt-nodejs20/root/bin/node
PassengerStartupFile server.js
PassengerBaseURI /
PassengerRestartDir /home/<USER>/domains/quintia.de/ai-nodejs/tmp
SetEnv KI_SHARED_TOKEN "kb-demo"
SetEnv KIMI_API_KEY "<DEIN_KIMI_CODE_KEY>"
SetEnv KIMI_HOST "api.kimi.com"
SetEnv KIMI_PATH "/coding/v1/chat/completions"
SetEnv KIMI_MODEL "kimi-for-coding"
```
`SetEnv` reicht die Werte an `process.env` des Node-Prozesses. Der Key steht NUR
hier auf dem Server, nie im Repo. LiteSpeed serviert `.htaccess` nicht (403).
Platzhalter-`default.php` im `ai/`-Ordner vorher löschen.

### d) (Neu-)Start
```bash
ssh <host> 'touch domains/quintia.de/ai-nodejs/tmp/restart.txt'
```

## Kimi-Code-Besonderheiten (hart erarbeitet — 2026-07-24)
- Key `sk-kim…` = **Kimi Code** (kimi.com), NICHT Moonshot → Endpunkt
  `api.kimi.com/coding/v1`. Gegen `api.moonshot.ai`/`.cn` gibt es 401
  „Invalid Authentication".
- Modelle: `kimi-for-coding` (kann auch **Vision** — F2 läuft damit!),
  `kimi-for-coding-highspeed`, `k3`, `k3-256k`.
- `kimi-for-coding` erlaubt **nur `temperature: 1`** (sonst 400
  „only 1 is allowed for this model").
- Reasoning-Modell: braucht großzügiges `max_tokens` (Default 4096) — sonst frisst
  die Denkphase das Budget und `content` bleibt leer (→ Proxy-502 „empty upstream").
  Fallback auf `reasoning_content` ist im Proxy eingebaut.

## Smoke-Tests
```bash
curl -s https://ai.quintia.de/health
# → {"ok":true,"model":"kimi-for-coding"}

curl -s -X POST https://ai.quintia.de/ai \
  -H 'Content-Type: application/json' -H 'X-KI-Token: kb-demo' \
  -d '{"messages":[{"role":"user","content":"Antworte nur: OK"}]}'
# → {"text":"OK", ...}

curl -s -i -X OPTIONS https://ai.quintia.de/ai \
  -H 'Origin: https://aluminiumminimum.github.io' \
  -H 'Access-Control-Request-Method: POST'
# → 204 mit Access-Control-Allow-Origin: https://aluminiumminimum.github.io
```

## Spend-Cap
Im Kimi-Konto ein Ausgabenlimit setzen — Schutz bei öffentlich erreichbarem Proxy.
