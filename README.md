# ZENO

ZENO is a bilingual Arabic/English mobile-first digital top-up storefront preview.

## Deployment bootstrap

The repository restores the complete editable project from four text payload parts in `.bundle/` using `scripts/restore.js`. Render runs this script before validation and start. The downloadable source ZIP contains ordinary editable files.

## API

- `GET /api/health`
- `GET /api/catalog`
- Checkout remains disabled: `ORDERS_OPEN=false`.

## Supplier integration

The supplier module only performs read-only balance and service checks in this version. It does not submit top-up orders. Put `SUPPLIER_API_KEY` and `ADMIN_API_TOKEN` only in Render Environment settings; never place them in HTML or Git.

## Preview deployment

`render.yaml` requests the free Frankfurt service, no persistent disk, and temporary data storage. This preview is not suitable for real orders or customer payments.
