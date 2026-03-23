#!/usr/bin/env node
/**
 * Enrich hardware-store catalog (specs, copy, Pexels, new categories/products).
 * Loads template `.env.local` then monorepo root `.env` (PEXELS_API_KEY).
 */
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { loadRootEnv, loadTemplateDotenv } from "../../scripts/template-seed/root-env.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadTemplateDotenv(join(__dirname, ".."));
loadRootEnv(import.meta.url);

process.argv.push("--vertical", "store");
await import("../../scripts/template-seed/enrich-store-travel-catalog.mjs");
