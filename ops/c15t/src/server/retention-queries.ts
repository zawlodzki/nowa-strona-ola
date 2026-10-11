import { sql, type Kysely, type RawBuilder } from "kysely";

export async function removeEvidenceBefore(
  database: Kysely<Record<string, never>>,
  threshold: RawBuilder<Date | number>,
): Promise<void> {
  await sql`
    delete from "auditLog"
    where "createdAt" < ${threshold}
      and (
        "tenantId" is null
        or (
          "tenantId" in ('ola-production', 'ola-staging')
          and not exists (
            select 1 from "consent" as current_consent
            where current_consent."subjectId" = "auditLog"."subjectId"
              and current_consent."tenantId" = "auditLog"."tenantId"
              and current_consent."givenAt" >= ${threshold}
          )
        )
      )
  `.execute(database);

  await sql`
    delete from "consent"
    where "givenAt" < ${threshold}
      and (
        "tenantId" is null
        or (
          "tenantId" in ('ola-production', 'ola-staging')
          and not exists (
            select 1 from "consent" as current_consent
            where current_consent."subjectId" = "consent"."subjectId"
              and current_consent."tenantId" = "consent"."tenantId"
              and current_consent."givenAt" >= ${threshold}
          )
        )
      )
  `.execute(database);

  await sql`
    delete from "runtimePolicyDecision"
    where "createdAt" < ${threshold}
      and not exists (
        select 1
        from "consent"
        where "consent"."runtimePolicyDecisionId" = "runtimePolicyDecision"."id"
      )
  `.execute(database);

  await sql`
    delete from "subject"
    where "updatedAt" < ${threshold}
      and not exists (
        select 1 from "consent"
        where "consent"."subjectId" = "subject"."id"
      )
      and not exists (
        select 1 from "auditLog"
        where "auditLog"."subjectId" = "subject"."id"
      )
  `.execute(database);
}
