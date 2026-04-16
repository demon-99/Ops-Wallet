# OpsWallet

**OpsWallet** is a full-stack app for signing in and running practical file & web utilities (PDF/image tools, barcodes, screenshots) from a clean dashboard.

**Tagline:** *Sign in. Run utilities. Keep provider keys on the server.*

---

## Repository

```bash
git remote add origin https://github.com/<you>/Ops-Wallet.git
```

---

## Features

- Secure sign-in (email/password)
- Dashboard UI for utilities (PDF/image/web helpers)
- Provider API keys stay on the server (never shipped to the browser)

---

## Local development

Prereqs:

- **Java 17**
- **Node.js 20+**
- **MongoDB** (for auth/data)
- A provider API token for integration features

---

### Run (high level)

Start the backend services, then start the web app.

```bash
# backend (from each backend folder)
./mvnw spring-boot:run
```

```bash
# web
cp .env.example .env
npm install
npm run dev
```

---

## Environment variables (summary)

| Variable | Where | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | backend env | Mongo connection |
| `APYHUB_TOKEN` (or `apyhub.token`) | backend env / local props | Provider token used server-side |
| `VITE_USER_SERVICE_URL` | `web/.env` | Backend base URL (auth/user) |
| `VITE_INTEGRATION_SERVICE_URL` | `web/.env` | Backend base URL (utilities/integrations) |

More detail is kept in the respective service/app READMEs.

---

## Security

- Never commit real API tokens. Use **`application-local.properties`** (gitignored) or env vars.
- Rotate any key that was exposed in chat or in git history.
- The browser only talks to **your** backends; it does not receive the ApyHub token.

---

## License

MIT. See `LICENSE`.
