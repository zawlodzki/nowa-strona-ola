import {
  decodeSignatureHeader,
  encodeSignatureHeader,
  SIGNATURE_HEADER_NAME,
} from "@sanity/webhook";

export const MAX_WEBHOOK_BODY_BYTES = 64 * 1024;
export const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1000;

export type PublicationOperation = "create" | "update" | "delete";

export interface PublicationEvent {
  documentId: string;
  documentType: string;
  operation: PublicationOperation;
}

export interface BuildQueueMessage extends PublicationEvent {
  eventId: string;
  receivedAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parsePublicationEvent(value: unknown): PublicationEvent | null {
  if (!isRecord(value)) return null;

  const { documentId, documentType, operation } = value;
  if (
    typeof documentId !== "string" ||
    documentId.length === 0 ||
    documentId.length > 256 ||
    documentId.startsWith("drafts.") ||
    typeof documentType !== "string" ||
    documentType.length === 0 ||
    documentType.length > 128 ||
    (operation !== "create" && operation !== "update" && operation !== "delete")
  ) {
    return null;
  }

  return { documentId, documentType, operation };
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signaturesMatch(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const { timestamp } = decodeSignatureHeader(signature);
    const age = Date.now() - timestamp;
    if (age < -60_000 || age > MAX_SIGNATURE_AGE_MS) return false;

    const expected = await encodeSignatureHeader(body, timestamp, secret);
    const encoder = new TextEncoder();
    const [providedHash, expectedHash] = await Promise.all([
      crypto.subtle.digest("SHA-256", encoder.encode(signature)),
      crypto.subtle.digest("SHA-256", encoder.encode(expected)),
    ]);
    const subtle = crypto.subtle as SubtleCrypto & {
      timingSafeEqual?: (first: BufferSource, second: BufferSource) => boolean;
    };
    if (subtle.timingSafeEqual) {
      return subtle.timingSafeEqual(providedHash, expectedHash);
    }

    const providedBytes = new Uint8Array(providedHash);
    const expectedBytes = new Uint8Array(expectedHash);
    let difference = 0;
    for (let index = 0; index < providedBytes.length; index += 1) {
      difference |= (providedBytes[index] ?? 0) ^ (expectedBytes[index] ?? 0);
    }
    return difference === 0;
  } catch {
    return false;
  }
}

async function readBodyWithinLimit(request: Request): Promise<string | null> {
  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let byteLength = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) return body + decoder.decode();

    byteLength += value.byteLength;
    if (byteLength > MAX_WEBHOOK_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }
}

export async function readSignedPublication(
  request: Request,
  secret: string,
): Promise<
  | { ok: true; message: BuildQueueMessage }
  | {
      ok: false;
      error: "invalid_body" | "invalid_signature";
      status: 400 | 401 | 413;
    }
> {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_WEBHOOK_BODY_BYTES) {
    return { ok: false, error: "invalid_body", status: 413 };
  }

  const body = await readBodyWithinLimit(request);
  if (body === null) {
    return { ok: false, error: "invalid_body", status: 413 };
  }

  const signature = request.headers.get(SIGNATURE_HEADER_NAME) ?? "";
  if (!(await signaturesMatch(body, signature, secret))) {
    return { ok: false, error: "invalid_signature", status: 401 };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return { ok: false, error: "invalid_body", status: 400 };
  }

  const event = parsePublicationEvent(parsed);
  if (!event) return { ok: false, error: "invalid_body", status: 400 };

  return {
    ok: true,
    message: {
      ...event,
      eventId: await sha256Hex(body),
      receivedAt: new Date().toISOString(),
    },
  };
}

export async function triggerBuild(
  messages: readonly BuildQueueMessage[],
  triggerUrl: string,
  triggerToken: string,
  targetEnvironment: "staging" | "production",
): Promise<void> {
  if (messages.length === 0) return;

  const latest = messages.reduce((current, candidate) =>
    candidate.receivedAt > current.receivedAt ? candidate : current,
  );
  const response = await fetch(triggerUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${triggerToken}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json; charset=utf-8",
      "user-agent": "ola-website-publication-worker",
      "x-github-api-version": "2026-03-10",
    },
    body: JSON.stringify({
      event_type: "sanity-content-change",
      client_payload: {
        target_environment: targetEnvironment,
        reason: "sanity-content-change",
        latest_event: latest,
        event_count: messages.length,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Build trigger failed with status ${response.status}.`);
  }
}
