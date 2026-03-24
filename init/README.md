# Schema provisioning

**Template ID:** `aurora-template-store` (Aurora Studio Template Registry).

Provisioning matches **aurora-template-grocery**: marketplace schema from **`init/schema.json`** when the API-key tenant has no tables yet (CLI or startup sync). Same `init/provision.ts` / `init/register.ts` behaviour as grocery — see [When it runs](../aurora-template-grocery/init/README.md#when-it-runs) in the grocery init README. Use `templateId: "aurora-template-store"` when creating the workspace from Studio.

**Content regions:** `pnpm run generate:content-regions` / `prebuild` → `init/content-regions.json` ([starter-core](https://github.com/Purple-Napkin/aurora-starter-core/blob/main/docs/content-regions.md)).
