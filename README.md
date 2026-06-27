# Granite Docs

API documentation site — built with [Scalar](https://scalar.com) + Vite, deployed to AWS (S3 + CloudFront).

## How to make changes and deploy

### 1. Make your changes

Edit any of these:

| What                      | Where                                                      |
| ------------------------- | ---------------------------------------------------------- |
| Add a markdown page       | `app/your-page.md` + add route to `app/scalar.config.json` |
| Edit API reference config | `app/scalar.config.json`                                   |
| Change styles             | `app/style.css`                                            |
| Change page behaviour     | `app/main.js`                                              |
| Change infrastructure     | `template.yaml`                                            |

### 2. Preview locally

```sh
make dev
```

Opens at **http://localhost:5173**. Changes hot-reload automatically.

### 3. Deploy to production

**One command does it all:**

```sh
make deploy
```

This runs: validate → update stack → build → upload to S3 → clear CloudFront cache.

> [!NOTE]
> After deploy, changes take **1–5 minutes** to appear due to CloudFront cache propagation.

### What each Makefile step does

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `make dev`        | Install deps + start local dev server          |
| `make build`      | Install deps + build static files into `dist/` |
| `make sync`       | Upload `dist/` to S3                           |
| `make invalidate` | Clear CloudFront cache                         |
| `make deploy`     | Run **everything** above in correct order      |
| `make stack`      | Create/update the CloudFormation stack only    |
| `make outputs`    | Show stack details (bucket name, URL, etc.)    |

### Quick reference

```sh
# I edited a page or styles — just ship it:
make build && make sync && make invalidate

# I changed the CloudFormation template — redeploy the whole stack:
make deploy

# I want to see what's deployed where:
make outputs
```

## Adding a new markdown page

1. Create `app/my-guide.md`
2. Add the route in `app/scalar.config.json`:

```json
"/my-guide": {
  "title": "My Guide",
  "type": "page",
  "filepath": "my-guide.md"
}
```

3. Deploy: `make deploy`

The page appears at `https://docs.granite-manager.com/my-guide` and a nav link is added automatically.

## Project structure

```
app/
├── index.html            # Entry point
├── main.js               # App logic (routing, API ref, markdown rendering)
├── style.css             # Scalar design tokens + custom styles
├── scalar.config.json    # Site config (nav, routes, title)
└── make-integration.md   # Example markdown page
dist/                     # Built files (uploaded to S3)
template.yaml             # AWS infrastructure (S3, CloudFront, DNS, SSL)
```
