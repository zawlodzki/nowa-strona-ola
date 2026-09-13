import { encodeSignatureHeader, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MAX_WEBHOOK_BODY_BYTES,
  parsePublicationEvent,
  readSignedPublication,
  triggerBuild,
  type BuildQueueMessage,
} from "../../worker/src/publication";

const webhookSecret = "test-webhook-secret";

async function signedRequest(body: string): Promise<Request> {
  const signature = await encodeSignatureHeader(
    body,
    Date.now(),
    webhookSecret,
  );
  return new Request("https://worker.example/webhooks/sanity", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      [SIGNATURE_HEADER_NAME]: signature,
    },
    body,
  });
}

function message(
  overrides: Partial<BuildQueueMessage> = {},
): BuildQueueMessage {
  return {
    documentId: "page-home",
    documentType: "page",
    operation: "update",
    eventId: "event-1",
    receivedAt: "2026-09-13T10:00:00.000Z",
    ...overrides,
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("publication webhook", () => {
  it.each(["create", "update", "delete"] as const)(
    "accepts a signed %s event",
    async (operation) => {
      const body = JSON.stringify({
        documentId: "page-home",
        documentType: "page",
        operation,
      });
      const result = await readSignedPublication(
        await signedRequest(body),
        webhookSecret,
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.message).toMatchObject({
          operation,
          documentId: "page-home",
        });
        expect(result.message.eventId).toMatch(/^[a-f0-9]{64}$/);
      }
    },
  );

  it("rejects an invalid signature before parsing the payload", async () => {
    const request = await signedRequest("not-json");
    const result = await readSignedPublication(request, "wrong-secret");
    expect(result).toEqual({
      ok: false,
      error: "invalid_signature",
      status: 401,
    });
  });

  it("rejects a replayed signature", async () => {
    const body = JSON.stringify({
      documentId: "page-home",
      documentType: "page",
      operation: "update",
    });
    const signature = await encodeSignatureHeader(
      body,
      Date.now() - 6 * 60 * 1000,
      webhookSecret,
    );
    const request = new Request("https://worker.example/webhooks/sanity", {
      method: "POST",
      headers: { [SIGNATURE_HEADER_NAME]: signature },
      body,
    });

    expect(await readSignedPublication(request, webhookSecret)).toEqual({
      ok: false,
      error: "invalid_signature",
      status: 401,
    });
  });

  it("rejects drafts and unsupported operations", () => {
    expect(
      parsePublicationEvent({
        documentId: "drafts.page-home",
        documentType: "page",
        operation: "update",
      }),
    ).toBeNull();
    expect(
      parsePublicationEvent({
        documentId: "page-home",
        documentType: "page",
        operation: "draft",
      }),
    ).toBeNull();
  });

  it("rejects a declared oversized body without reading it", async () => {
    const result = await readSignedPublication(
      new Request("https://worker.example/webhooks/sanity", {
        method: "POST",
        headers: { "content-length": String(MAX_WEBHOOK_BODY_BYTES + 1) },
        body: "{}",
      }),
      webhookSecret,
    );
    expect(result).toEqual({ ok: false, error: "invalid_body", status: 413 });
  });

  it("stops reading an oversized streamed body", async () => {
    const request = new Request("https://worker.example/webhooks/sanity", {
      method: "POST",
      body: "x".repeat(MAX_WEBHOOK_BODY_BYTES + 1),
    });
    expect(await readSignedPublication(request, webhookSecret)).toEqual({
      ok: false,
      error: "invalid_body",
      status: 413,
    });
  });
});

describe("build trigger", () => {
  it("collapses a batch into one request containing the latest event", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);

    await triggerBuild(
      [
        message(),
        message({
          eventId: "event-2",
          operation: "delete",
          receivedAt: "2026-09-13T10:00:01.000Z",
        }),
      ],
      "https://build.example/trigger",
      "secret-token",
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({
      authorization: "Bearer secret-token",
    });
    expect(JSON.parse(String(init.body))).toMatchObject({
      eventCount: 2,
      latestEvent: { eventId: "event-2", operation: "delete" },
    });
  });

  it("throws when the build endpoint fails so the queue can retry", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
    );
    await expect(
      triggerBuild(
        [message()],
        "https://build.example/trigger",
        "secret-token",
      ),
    ).rejects.toThrow("status 503");
  });
});
