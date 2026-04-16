# integration_service

Spring Boot **4.0.1** / Java **17** service to integrate third‑party APIs using clean boundaries (Controller → Service → Client adapter).

## Run

Put your ApyHub API token in a **local file** (recommended):

```bash
cp application-local.properties.example application-local.properties
# Edit application-local.properties and set: apyhub.token=your_apyhub_token
```

That file is **gitignored**. Do not wrap the token in quotes.

Alternatively: `export APYHUB_TOKEN=your_token` in the shell.

Run from this directory so Spring can load `application-local.properties` (requires Java 17):

```bash
./mvnw spring-boot:run
```

Service default port: `8082`.

## Initial integration: ApyHub Image → PDF

Endpoint (this service):
- `POST /api/convert/image-to-pdf` (multipart)

Example:

```bash
curl --request POST \
  --url "http://localhost:8082/api/convert/image-to-pdf?output=test-sample.pdf&landscape=false" \
  --form "file=@test.png"
```

This calls ApyHub under the hood. The ApyHub token is read from **`application-local.properties`** (`apyhub.token`) or from the **`APYHUB_TOKEN`** environment variable.

### 401 from ApyHub

- **Invalid or revoked token** — create or copy a valid API token from your ApyHub dashboard and run:  
  `export APYHUB_TOKEN='your_token'`  
  then restart the service.
- **Quotes in `application.properties`** — do not wrap the token in `"..."`; in `.properties` files that can send literal quote characters and ApyHub returns **401**.
- Tokens pasted in chats or committed to git should be **rotated** in ApyHub.

