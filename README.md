# OpsWallet

**OpsWallet** is a full-stack product: **email/password auth**, a **React** dashboard, and a backend **integration** service that proxies **ApyHub** APIs so API keys never ship to the browser.

**Tagline:** *Sign in. Run file & web utilities. Keep provider keys on the server.*

---

## Repository

Suggested Git remote name:

```bash
git remote add origin https://github.com/<you>/opswallet.git
```

---

## What’s in this repo

| Folder | Role |
| --- | --- |
| **`web/`** | React (Vite): auth UI, **Integrations** dashboard, **Profile**. |
| **`user_service/`** | Spring Boot: `POST /api/auth/login`, `POST /api/auth/signup`, MongoDB. Default port **8081**. |
| **`integration_service/`** | Spring Boot: proxies ApyHub (e.g. image→PDF, remove background, barcode, webpage screenshot). Port **8082**. |

---

## Prerequisites

- **Java 17**
- **MongoDB** (`user_service`)
- **Node.js 20+** (`web/`)
- **ApyHub** API token for integration features

---

## Quick start

### 1. User service — port 8081

```bash
cd user_service
./mvnw spring-boot:run
```

Configure MongoDB via `MONGODB_URI` or defaults in `application.properties`.

### 2. Integration service — port 8082

```bash
cd integration_service
cp application-local.properties.example application-local.properties
# apyhub.token=YOUR_APYHUB_TOKEN   (no quotes)
./mvnw spring-boot:run
```

Run from **`integration_service/`** so local config files load.

### 3. Web app

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

Defaults: `VITE_USER_SERVICE_URL=http://localhost:8081`, `VITE_INTEGRATION_SERVICE_URL=http://localhost:8082`.

Optional: `VITE_USE_MOCK_AUTH=true` for UI-only work without the auth API.

---

## Environment variables (summary)

| Variable | Where | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | `user_service` | Mongo connection |
| `apyhub.token` / `APYHUB_TOKEN` | `integration_service` | ApyHub `apy-token` |
| `VITE_USER_SERVICE_URL` | `web/.env` | Auth API base |
| `VITE_INTEGRATION_SERVICE_URL` | `web/.env` | Integration API base |

More detail: **`web/README.md`**, **`integration_service/README.md`**.

---

## Security

- Never commit real API tokens. Use **`application-local.properties`** (gitignored) or env vars.
- Rotate any key that was exposed in chat or in git history.
- The browser only talks to **your** backends; it does not receive the ApyHub token.

---

## License

MIT. See `LICENSE`.
