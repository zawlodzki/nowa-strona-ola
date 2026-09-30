import { describe, expect, it } from "vitest";

import {
  createPreviewSession,
  previewPerspectiveCookie,
  previewSessionCookie,
  previewSessionTtlSeconds,
  verifyPreviewSession,
} from "../../preview/src/lib/session";

const secret = "0123456789abcdef0123456789abcdef";
const now = Date.UTC(2026, 8, 13, 8);

describe("preview session", () => {
  it("accepts a signed session before expiry", async () => {
    const session = await createPreviewSession(secret, now);
    await expect(verifyPreviewSession(session, secret, now)).resolves.toBe(
      true,
    );
  });

  it("rejects tampering, expiry and timestamps beyond the allowed TTL", async () => {
    const session = await createPreviewSession(secret, now);
    const [expiry, signature] = session.split(".");

    await expect(
      verifyPreviewSession(`${expiry}.${signature}x`, secret, now),
    ).resolves.toBe(false);
    await expect(
      verifyPreviewSession(
        session,
        secret,
        now + previewSessionTtlSeconds * 1000,
      ),
    ).resolves.toBe(false);
    await expect(
      verifyPreviewSession(`${Number(expiry) + 1}.${signature}`, secret, now),
    ).resolves.toBe(false);
  });

  it("uses SameSite=None so Presentation can keep the session in a cross-origin iframe", () => {
    expect(previewSessionCookie.sameSite).toBe("none");
    expect(previewSessionCookie.secure).toBe(true);
    expect(previewSessionCookie.httpOnly).toBe(true);
    expect(previewPerspectiveCookie.sameSite).toBe("none");
    expect(previewPerspectiveCookie.secure).toBe(true);
  });

  it("rejects a session secret shorter than 32 characters", async () => {
    await expect(createPreviewSession("too-short", now)).rejects.toThrow(
      "co najmniej 32 znaki",
    );
  });
});
