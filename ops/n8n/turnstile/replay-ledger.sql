BEGIN;

CREATE SCHEMA IF NOT EXISTS ola_replay_production;
CREATE SCHEMA IF NOT EXISTS ola_replay_staging;
REVOKE ALL ON SCHEMA ola_replay_production FROM PUBLIC;
REVOKE ALL ON SCHEMA ola_replay_staging FROM PUBLIC;

CREATE TABLE IF NOT EXISTS ola_replay_production.used_tokens (
  token_digest text PRIMARY KEY CHECK (token_digest ~ '^[0-9a-f]{64}$')
);
CREATE TABLE IF NOT EXISTS ola_replay_staging.used_tokens (
  token_digest text PRIMARY KEY CHECK (token_digest ~ '^[0-9a-f]{64}$')
);
REVOKE ALL ON TABLE ola_replay_production.used_tokens FROM PUBLIC;
REVOKE ALL ON TABLE ola_replay_staging.used_tokens FROM PUBLIC;

REVOKE ALL ON SCHEMA ola_replay_staging FROM ola_replay_production_runtime;
REVOKE ALL ON SCHEMA ola_replay_production FROM ola_replay_staging_runtime;
REVOKE ALL ON TABLE ola_replay_staging.used_tokens FROM ola_replay_production_runtime;
REVOKE ALL ON TABLE ola_replay_production.used_tokens FROM ola_replay_staging_runtime;
REVOKE ALL ON TABLE ola_replay_production.used_tokens FROM ola_replay_production_runtime;
REVOKE ALL ON TABLE ola_replay_staging.used_tokens FROM ola_replay_staging_runtime;
GRANT USAGE ON SCHEMA ola_replay_production TO ola_replay_production_runtime;
GRANT USAGE ON SCHEMA ola_replay_staging TO ola_replay_staging_runtime;
GRANT INSERT (token_digest), SELECT (token_digest)
  ON ola_replay_production.used_tokens TO ola_replay_production_runtime;
GRANT INSERT (token_digest), SELECT (token_digest)
  ON ola_replay_staging.used_tokens TO ola_replay_staging_runtime;

ALTER ROLE ola_replay_production_runtime SET statement_timeout = '10s';
ALTER ROLE ola_replay_staging_runtime SET statement_timeout = '10s';
ALTER ROLE ola_replay_production_runtime SET synchronous_commit = on;
ALTER ROLE ola_replay_staging_runtime SET synchronous_commit = on;

COMMIT;
