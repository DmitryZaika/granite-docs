# Make.com Integration

How to connect our Granite API with [Make](https://www.make.com) (formerly Integromat) to build automated workflows.

---

## Overview

Our API exposes an OpenAPI 3.x specification that describes all available endpoints, request schemas, and authentication requirements. Make can consume this spec directly to auto-generate modules and mapped actions — no manual HTTP request configuration needed.

| Detail | Value |
|---|---|
| OpenAPI spec URL | `https://cawv6iwjgxpk5fj2fchs6vc5vq0bycwp.lambda-url.us-east-2.on.aws/api-docs/openapi.json` |
| Auth method | _TBD_ |
| Base URL | _TBD_ |

---

## Quick Start

### 1. Create a new connection in Make

1. Open your Make scenario.
2. Add a new module and search for **"API"** → select the **"Make an API Call"** module, or use the **HTTP** app.
3. Alternatively, if you've onboarded our spec into Make's custom app registry, search for **"Granite"** to see pre-mapped endpoints.

### 2. Configure the HTTP module

| Field | Value |
|---|---|
| URL | _endpoint path, e.g. `/api-docs/openapi.json`_ |
| Method | `GET` (or `POST`, `PUT`, etc.) |
| Headers | `Authorization: Bearer {{your_token}}` (if required) |
| Body | _JSON payload when applicable_ |

### 3. Parse the response

Use Make's built-in **JSON** → **Parse JSON** module to extract fields from the API response and pass them to downstream steps (Google Sheets, Slack, email, etc.).

---

## Example Workflow

> _Fill in a real-world automation scenario, e.g.:_
>
> - **Trigger:** Cron schedule (every hour)
> - **Action 1:** Call Granite API endpoint `GET /items`
> - **Action 2:** Filter new items since last run
> - **Action 3:** Post to Slack channel `#api-updates`

```text
Schedule ──► Granite API ──► Filter ──► Slack
  (cron)       GET /items     (new?)     postMessage
```

---

## Authentication

> _Document the auth method once finalized. Common patterns:_
>
> - API Key header: `X-API-Key: {{api_key}}`
> - Bearer token: `Authorization: Bearer {{jwt}}`
> - OAuth 2.0 (client credentials flow)

---

## Webhooks (Inbound to Make)

If the Granite API needs to push events **into** Make, use Make's **Webhook** module:

1. Add a **Webhook** → **Custom webhook** trigger to your scenario.
2. Copy the generated webhook URL.
3. Register that URL as a callback/webhook destination in the Granite API (if supported).

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `401 Unauthorized` | Missing or expired auth token |
| `404 Not Found` | Incorrect endpoint path or method |
| Timeout | Make's default timeout is 40 s; ensure the endpoint responds faster |
| Rate limiting | Check API rate limits and add a **Sleep** module between calls if needed |
