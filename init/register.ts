/**
 * Next.js instrumentation hook: runs once when the server starts (Node.js only).
 * Merges init/schema via POST /v1/provision-schema, then POST /v1/run-schema-migration (DDL + views).
 */
import { runFirstRunProvision } from "./provision";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  console.log(
    `[aurora] instrumentation: begin pid=${process.pid} ts=${Date.now()}`
  );
  try {
    await runFirstRunProvision();
  } catch (err) {
    console.warn("[aurora] First-run provision skipped:", err instanceof Error ? err.message : err);
  }
}
