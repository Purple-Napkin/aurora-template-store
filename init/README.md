# Schema provisioning

**Template ID:** `aurora-template-store` (Aurora Studio Template Registry).

Provisioning matches **aurora-template-grocery**: marketplace schema from **`init/schema.json`** on first run (CLI or startup sync). See [aurora-template-grocery/init/README.md](../aurora-template-grocery/init/README.md); use `templateId: "aurora-template-store"` when creating the workspace from Studio.

**Content regions:** `pnpm run generate:content-regions` / `prebuild` → `init/content-regions.json` ([starter-core](https://github.com/Purple-Napkin/aurora-starter-core/blob/main/docs/content-regions.md)).
