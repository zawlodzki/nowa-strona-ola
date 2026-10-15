#!/usr/bin/env python3
"""Verify generated claim SQL against an isolated, labelled PostgreSQL container."""

import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import re
import subprocess
import time
import uuid


def docker(*args, sql=None):
    return subprocess.run(
        ["docker", *args], input=sql, text=True, capture_output=True, timeout=60
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("container")
    parser.add_argument("--proof", type=Path)
    args = parser.parse_args()
    if not re.fullmatch(r"ola-turnstile-replay-proof-[a-f0-9]{10}", args.container):
        raise ValueError("Expected an isolated Turnstile proof container")
    inspected = docker("inspect", args.container)
    inspected.check_returncode()
    container = json.loads(inspected.stdout)[0]
    label = args.container.rsplit("-", 1)[1]
    if (
        container["HostConfig"]["NetworkMode"] != "none"
        or container["Config"]["Labels"].get("com.ola.turnstile.proof") != label
        or not any(
            mount.get("Name") == args.container + "-data"
            and mount["Destination"] == "/var/lib/postgresql/data"
            for mount in container["Mounts"]
        )
    ):
        raise ValueError("Container isolation or owned volume does not match")

    def ready():
        deadline = time.monotonic() + 30
        while time.monotonic() < deadline:
            if docker("exec", args.container, "pg_isready", "-U", "postgres").returncode == 0:
                return
            time.sleep(0.25)
        raise TimeoutError("Isolated database did not become ready")

    def query(sql, user="postgres", require_success=True):
        result = docker(
            "exec", "-i", args.container, "psql", "-X", "-qAt", "-v",
            "ON_ERROR_STOP=1", "-U", user, "-d", "postgres", "-f", "-", sql=sql
        )
        if require_success:
            result.check_returncode()
        return result

    ready()
    root = Path(__file__).resolve().parent
    for environment in ["production", "staging"]:
        role = f"ola_replay_{environment}_runtime"
        query(
            f"DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '{role}') "
            f"THEN CREATE ROLE {role} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION; "
            "END IF; END $$;"
        )
    query((root / "replay-ledger.sql").read_text())
    query("CREATE TABLE IF NOT EXISTS public.ola_proof_private (value text);")
    statements = {}
    for environment in ["production", "staging"]:
        workflow = json.loads((root / f"workflow.{environment}.json").read_text())
        statements[environment] = next(
            node["parameters"]["query"]
            for node in workflow["nodes"] if node["name"] == "Claim verified token"
        )

    def claim(digest, environment="staging"):
        if not re.fullmatch(r"[0-9a-f]{64}", digest):
            raise ValueError("Expected synthetic SHA256 digest")
        result = query(
            "PREPARE claim(text) AS " + statements[environment]
            + f"\nEXECUTE claim('{digest}');",
            f"ola_replay_{environment}_runtime",
        ).stdout.strip()
        if result not in ["t", "f"]:
            raise ValueError("Claim must return exactly one boolean")
        return result == "t"

    run_id = uuid.uuid4().hex
    digest = hashlib.sha256(run_id.encode()).hexdigest()
    with ThreadPoolExecutor(max_workers=8) as pool:
        same = list(pool.map(lambda _: claim(digest), range(32)))
        distinct = list(pool.map(
            lambda index: claim(hashlib.sha256(f"{run_id}:{index}".encode()).hexdigest()),
            range(32),
        ))
    assert sum(same) == 1 and len(same) == 32
    assert all(distinct) and len(distinct) == 32
    assert claim(digest, "production") and not claim(digest, "production")
    assert not claim(digest)

    denied_queries = [
        "DELETE FROM ola_replay_staging.used_tokens;",
        "UPDATE ola_replay_staging.used_tokens SET token_digest = token_digest;",
        "TRUNCATE ola_replay_staging.used_tokens;",
        "CREATE TABLE ola_replay_staging.extra (value text);",
        "SELECT * FROM ola_replay_production.used_tokens;",
        f"INSERT INTO ola_replay_production.used_tokens VALUES ('{digest}');",
        "SELECT * FROM public.ola_proof_private;",
    ]
    denied = [query(sql, "ola_replay_staging_runtime", False).returncode != 0 for sql in denied_queries]
    assert all(denied)
    malformed = query(
        "PREPARE claim(text) AS " + statements["staging"] + "\nEXECUTE claim('invalid');",
        "ola_replay_staging_runtime", False,
    )
    assert malformed.returncode != 0
    persistence = query(
        "SHOW fsync; SHOW synchronous_commit; "
        "SELECT relpersistence FROM pg_class WHERE oid = 'ola_replay_staging.used_tokens'::regclass;"
    ).stdout.strip().splitlines()
    assert persistence == ["on", "on", "p"]
    docker("restart", "--time", "30", args.container).check_returncode()
    ready()
    assert not claim(digest)
    proof = {
        "isolated": True,
        "sameDigestRequests": len(same),
        "concurrency": 8,
        "sameDigestAccepted": sum(same),
        "sameDigestRejected": len(same) - sum(same),
        "distinctAccepted": sum(distinct),
        "environmentIsolation": True,
        "deniedOperations": len(denied),
        "malformedRejected": True,
        "fsync": "on",
        "synchronousCommit": "on",
        "loggedTable": True,
        "replayAfterRestartRejected": True,
    }
    if args.proof:
        args.proof.write_text(json.dumps(proof, indent=2) + "\n")
    print(json.dumps(proof))


if __name__ == "__main__":
    main()
