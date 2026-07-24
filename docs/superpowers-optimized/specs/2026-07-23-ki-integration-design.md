# Spec — KI-Integration (Kimi) · Fundament + 4 Funktionen

**Datum:** 2026-07-23
**Datei:** `index.html` (single self-contained App) + neuer Ordner `ai-proxy/` (Node-Proxy)
**Status:** Design vom User freigegeben („grünes licht"); Umfang = Fundament + alle 4 Funktionen in Wellen.
**Anlass:** Neuausrichtung — die App soll perspektivisch Odoo ersetzen; **lokale KI ist der USP** („Herz der CRM"). Diese Runde bringt echte KI in den **Demo**-Prototyp. Demo nutzt **Kimi (Moonshot) via API** über einen Proxy; das echte Klinikprodukt nutzt später **lokale LLMs** (Datenschutz) — nicht Teil dieser Runde.

---

## 1. Scope & Non-Goals

**In Scope:**
- Wiederverwendbares KI-**Fundament** im Client (`.ki-*`-Namespace): `kiComplete()` / `kiVision()`, Ladezustände, Timeout, graceful Degradation, Pitch-Fallback, ein UI-Muster (Panel + Übernehmen/Verwerfen) in der bestehenden Jade-Designsprache.
- Ein **Proxy** (Hostinger Node.js Web App, `ai.quintia.de`), der den Kimi-Key serverseitig hält.
- **Vier Funktionen** (F1–F4, §6), gebaut in Wellen.

**Non-Goals (bewusst):**
- Keine echten Patientendaten — synthetische Demo-Daten bleiben (`@demo-*.local`).
- Kein lokales On-Prem-LLM (das ist die *echte* Klinik-Zukunft, separates Projekt).
- Keine Persistenz/kein Backend über den dünnen Proxy hinaus. Der Proxy ist **Wegwerf-Demo-Infra**.
- Kein Anfassen von Cofounder-Code (`.rp-*`/`.rpd-*`/`.rsp-*`/`.mx-*`, `openReferrer`/`closeReferrer`, `#refOverlay`).
- Keine Umbenennung/Löschung bestehender Datenfelder (geteilte Daten nur ERWEITERN, v. a. `inReha[]`).
- Keine Abkehr von der Single-File-Architektur von `index.html`.

---

## 2. Architektur & Datenfluss

```
index.html (github.io, HTTPS)                 ai.quintia.de (Hostinger Node.js Web App, HTTPS)
  .ki-* Client, KEIN Key ── fetch POST ──▶  Proxy: POST /ai  +  POST /ai/vision
                                              hält KIMI_API_KEY (env) ── HTTPS ──▶ api.moonshot.ai/v1/chat/completions
                            ◀── JSON ────────  reicht Kimi-Antwort durch
```

- Der Client kennt nur den Proxy-Endpunkt (`const KI_ENDPOINT` — konfigurierbare Konstante, **kein Geheimnis**). Der Kimi-Key liegt ausschließlich als Env-Var auf dem Proxy.
- Erster Netzwerk-Call der App überhaupt (bisher nur Font-Loading-Promise). → Alles defensiv: Timeout, try/catch, „KI offline"-Fallback.
- HTTPS auf beiden Seiten (github.io + Cloudflare/Hostinger-TLS auf `ai.quintia.de`) → kein Mixed-Content-Block.

---

## 3. Der Proxy (`ai-proxy/`)

**Tech:** kleine Node-App (~40–80 Zeilen, `http`/`express`/`hono` — an das auth-backend-Muster angelehnt), als **Hostinger Node.js Web App** auf Subdomain `ai.quintia.de`.

**Endpunkte (Contract):**
- `POST /ai` — Body `{messages, json?, model?, temperature?, max_tokens?}` → forwarded an `chat/completions`; Antwort `{text}` (bei `json:true` zusätzlich `{data}` = geparstes JSON).
- `POST /ai/vision` — Body `{image /*data-URL oder base64*/, prompt, json?}` → Vision-Chat; Antwort wie oben.
- `GET /health` — `{ok:true}` (für die Client-Verfügbarkeitsprüfung / „KI offline"-Erkennung).

**Sicherheit (öffentlich erreichbar → Key-Missbrauch verhindern):**
- CORS `Access-Control-Allow-Origin`: `https://aluminiumminimum.github.io` + `http://localhost:8765` (Dev). Kein `*`.
- Origin/Referer-Check (weich) **+** Shared-Token-Header (im Client eingebettet, schwaches Geheimnis, hebt die Hürde) **+** einfaches Rate-Limit pro IP.
- **Spend-Cap am Kimi-Account** als harte Grenze (extern konfiguriert).
- Key nie im Repo; `ai-proxy/.env` gitignored; Env-Var im hPanel gesetzt.

**Ops-Split (wie auth-backend, „operator T0.2"):**
- **User (einmalig, hPanel):** Node.js-Web-App + Subdomain `ai.quintia.de` anlegen, `KIMI_API_KEY` (+ Shared-Token) als Env-Var setzen.
- **Claude (Code):** Proxy-Code schreiben + per SSH/git deployen. SSH-Zugang vorhanden (Hostinger-Account des Users; konkrete Creds außerhalb dieses öffentlichen Specs).

---

## 4. Client-Fundament (`.ki-*`)

- **Helfer:** `kiComplete(messages, {json, model, timeoutMs})` und `kiVision(image, prompt, {json})` — `fetch` an `KI_ENDPOINT`, AbortController-Timeout (Default ~20 s), Fehler → wirft/kehrt sauber zurück.
- **Verfügbarkeit:** einmaliger `/health`-Ping beim Laden → Flag `KI_ONLINE`. Buttons rendern immer; ist KI offline, zeigt das Panel „KI offline (Demo ohne Proxy)" statt zu crashen.
- **Pitch-Fallback:** pro Funktion ein hinterlegtes, plausibles Beispiel-Ergebnis. Wenn der Live-Call fehlschlägt/timeoutet, wird — deutlich, aber unauffällig — das Fallback gezeigt, damit der Wow im Pitch **immer** landet. (Kein stiller Fake: intern als Fallback markiert.)
- **UI-Muster (KEIN neues Idiom):** ein `.ki-panel` in der radar-card-/Kartei-Familie — Spinner während des Calls, Ergebnis-Block, zwei CTAs **„Übernehmen"** (schreibt in die Demo-Daten + re-rendert) / **„Verwerfen"**. Wiederverwendet über alle 4 Funktionen.
- **Human-in-the-loop:** KI **schlägt vor**, der Mensch bestätigt. Nichts wird ohne „Übernehmen" in die Daten geschrieben (Verifikations-Prinzip aus dem Meeting).

---

## 5. Datenmodell-Berührung (rein additiv)

- Keine Umbenennung. Neue Felder nur mit `ki`-Präfix additiv, wo nötig (z. B. `eingang[].kiVorschlag`, `faelle[].kiExtrakt`).
- **Sterne:** F1 gibt Sterne als **String-Key `"1"`–`"5"`** aus (`STERNE`-Kontrakt — nie als Number vergleichen).
- **Geteilt:** F3 schreibt in bestehende Felder `p.kurzbericht` / `p.verlaufPlan` auf `inReha[]`-Objekten — **Füllen erlaubt, Umbenennen/Löschen verboten**; Format identisch, damit `.rsp-*`-Charts & `.rp-kurz` (Cofounder) unverändert lesen.

---

## 6. Die vier Funktionen

### F1 — Anfrage → Felder + Sterne + Zuordnung (Eingang)
- **Surface:** Anfrage-Detail-Fenster `#egDetail` (`.egd-*`). Button „KI: analysieren".
- **Input → Output:** `eingang[].txt` (+ `.tit`, `.kanal`) → JSON `{achse, kt, diagnose?, dringlichkeit, sterne:"1".."5", sterneGrund, zuordnungsvorschlag}`.
- **Wirkung:** befüllt die Triage-Zusammenfassung / schlägt Owner + Sterne mit Begründung vor; „Übernehmen" setzt die Felder, `uebernehmen()` legt wie bisher den Fall an.
- **Ersetzt:** die Heuristiken `erkenneSignale()` / `sterneAusSignal()` durch echtes Verständnis (additiv daneben, nicht gelöscht).

### F2 — Scan/Foto → Falldaten (Vision)
- **Surface:** Datei-/Foto-Upload am Fall (Muster wie `rpUpload`-Demo). Button „KI: Dokument auslesen".
- **Input → Output:** Bild (Bewilligungsbescheid/Arztbrief/Fax-Scan, Demo-Asset) → `kiVision` → JSON `{name?, versicherung, kostentraeger, diagnose, leistung, gueltigBis?}`.
- **Wirkung:** füllt Fall-Felder + Kostenzusage-Kette (`#dKT`, `KZ_STAGES`). Der visuelle Knaller: „eingescannt → sinnvolle Daten".
- **Verify-Gate:** Kimi-Vision-Modell im Account verfügbar? (Modell-ID + Bild-Input bestätigen; sonst F2 in eine spätere Welle.)

### F3 — Kurzbericht-Generator (In-Reha / Protokoll-Board)
- **Surface:** Protokoll-Board (`ma-mode`-Reiter „Protokolle", `.mtp-*`). Button „KI: Kurzbericht entwerfen".
- **Input → Output:** Barthel/FIM-Δ (`p.barthel`/`p.fim`) + `inReha[].eintraege[]` (Tagesnotizen) → `{kurzbericht, verlaufPlan}`.
- **Wirkung:** füllt die bestehenden Textfelder (Übernehmen). Trifft die Meeting-Vision „CGM-Berichte → Kurzbericht" 1:1; kleinster Bauaufwand (Surface existiert).

### F4 — KI-Copilot (Chat über die Demo-Daten)
- **Surface:** eigenes Slide-in-Overlay `.ki-chat` (analog Detail-Overlays, im Verlauf via `pushDetailState`).
- **Input → Output:** Nutzerfrage + serialisierter **Snapshot** der Demo-Daten (`faelle`/`eingang`/`inReha`/`zuweiser` verdichtet) als Kontext → Antwort / Entwurf.
- **Wirkung:** read-only über Daten; kann Entwürfe (z. B. Antwort an einen Patienten) liefern, mutiert nur auf explizites „Übernehmen". Breitester Wow.

**Wellen (jede einzeln vorzeigbar):** Fundament+**F1** → **F3** → **F2** → **F4**.

---

## 7. Error-Handling

- Netzwerk/Timeout/Non-200 → `kiComplete`/`kiVision` fangen sauber, Panel zeigt „KI offline" **oder** Pitch-Fallback.
- `json:true` → defensiver Parse (Regex-Extraktion des JSON-Blocks + `try/catch`); bei Parse-Fehler ein Retry mit verschärftem „nur JSON"-Prompt, sonst Fallback.
- 0 Console-Errors ist Pflicht — jeder KI-Pfad ist try/catch-umschlossen.

---

## 8. Failure-Mode-Check (adversarisch)

| # | Modus | Schwere | Mitigation |
|---|---|---|---|
| 1 | HTTPS-/Mixed-Content-Block | ~~kritisch~~ **gelöst** | Proxy auf `ai.quintia.de` mit Cloudflare/Hostinger-TLS |
| 2 | Live-LLM im Pitch langsam/fehlerhaft | hoch | Timeout + gescriptetes Pitch-Fallback → Wow landet immer |
| 3 | Key-Missbrauch (öffentlicher Proxy) | mittel | CORS-Origin + Shared-Token + Rate-Limit + Spend-Cap |
| 4 | Cofounder-Kollision (paralleles Pushen) | mittel | eigener `.ki-*`-Namespace, additiv, kurzlebiger Branch, `git pull` vor Push, ggf. kurz abstimmen |
| 5 | Vision-Support fehlt (F2) | mittel | Verify-Gate vor F2; sonst F2 verschieben |
| 6 | JSON-Robustheit | niedrig | `response_format:json` + defensiver Parse + Retry + Fallback |
| 7 | Public-Spec/Endpoint-Leak | niedrig | Endpoint ist ohnehin im Client; keine Secrets/SSH-Creds im Repo |

Kritische Modi (1) sind gelöst; (2) hat eine harte Mitigation. Rest dokumentiert/akzeptiert.

---

## 9. Verifikation / Test-Strategie

- Manuell (kein Testframework): Preview `bavaria-proto` @1440 **und** @390 — 0 Console-Errors, 0 horizontaler Overflow, betroffene View + Cofounder-Bereiche (Matrix, `openReferrer`, `rsp`-Charts) rendern.
- Pro Funktion: Live-Call gegen den Proxy **und** Fallback-Pfad (Proxy aus) durchspielen; Screenshot als Beleg.
- Proxy: `curl` gegen `/health` + `/ai` (Mini-Prompt) + CORS-Preflight-Check von der github.io-Origin.
- Nach jeder Welle: Investor-Demo intakt, Cofounder-Bereiche verifiziert.

---

## 10. Rollout / Ops

- Branch `feat/ki` (kurzlebig); je Welle verifizieren → `git pull` → FF-Merge auf `main` → Push. Nie `--force`.
- Proxy-Deploy separat (SSH), unabhängig vom github.io-Deploy. Client degradiert graceful, solange der Proxy nicht steht — Reihenfolge frei.
- HANDOVER §2 (harte Regeln) + §5 (Verifikation) + §6 (Spec-Vorlage für delegierte Tasks) gelten vollumfänglich.

---

## 11. Offene Verify-Gates (vor bzw. in Welle)

1. **Kimi-Vision-Modell** im Account verfügbar (F2) — Modell-ID + Bild-Input bestätigen.
2. **`ai.quintia.de`** in hPanel als Node.js-Web-App + TLS erreichbar (`/health` liefert 200 über HTTPS).
3. **Kimi-Modell-ID + Preise** für Text (F1/F3/F4) bestätigen (Contract via `platform.kimi.ai`).
