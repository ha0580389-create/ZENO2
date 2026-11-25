# ZENO

Mobile-first bilingual storefront preview and read-only Node.js API.

## Run locally

```bash
npm run check
npm start
```

Open http://localhost:3000.

## Read-only API

- GET /api/health
- GET /api/catalog

Checkout, payment handling, supplier calls, and order fulfillment are disabled in this preview. No API secret or payment credential is required.

## Render

The repository includes a free Frankfurt web-service configuration in render.yaml. The preview does not store or accept orders and does not require a persistent disk.

## AppCreator24

A standalone HTML wrapper will be prepared once the deployed Render hostname is confirmed. Never place supplier keys or admin secrets in the mobile app.
