import { sql } from "kysely";
import { kysely } from "./database.js";
import { retentionMonths } from "./retention-config.js";
import { removeEvidenceBefore } from "./retention-queries.js";

export { retentionMonths } from "./retention-config.js";

export async function removeExpiredEvidence(): Promise<void> {
  await removeEvidenceBefore(
    kysely,
    sql<Date>`now() - make_interval(months => ${retentionMonths})`,
  );
}
