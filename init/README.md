# Schema provisioning

**Template ID:** `aurora-template-store` (Aurora Studio Template Registry).

Provisioning matches **aurora-template-grocery**: marketplace base schema from Studio plus `init/schema.json` / `schema-v2.json` on first run via the SDK. See [aurora-template-grocery/init/README.md](../aurora-template-grocery/init/README.md) for the full flow; use `templateId: "aurora-template-store"` when creating the workspace from Studio.

**Content regions:** `pnpm run generate:content-regions` / `prebuild` → `init/content-regions.json` ([starter-core](https://github.com/Purple-Napkin/aurora-starter-core/blob/main/docs/content-regions.md)).
