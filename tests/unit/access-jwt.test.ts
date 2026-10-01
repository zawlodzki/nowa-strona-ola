import { describe, expect, it } from "vitest";

import {
  accessJwtHeader,
  readAccessJwt,
  verifyAccessJwt,
} from "../../preview/src/lib/access-jwt";

const encoder = new TextEncoder();
const teamDomain = "https://example.cloudflareaccess.com";
const audience = "test-audience";
const kid = "preview-test-key";

function bytesToBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    "",
  );
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

async function generateKeys(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );
}

async function publicJwk(
  publicKey: CryptoKey,
): Promise<JsonWebKey & { kid: string }> {
  const jwk = await crypto.subtle.exportKey("jwk", publicKey);
  return { ...jwk, alg: "RS256", kid, use: "sig" };
}

async function signJwt(
  privateKey: CryptoKey,
  payload: Record<string, unknown>,
  header: Record<string, unknown> = { kid },
): Promise<string> {
  const encodedHeader = bytesToBase64Url(
    encoder.encode(JSON.stringify({ alg: "RS256", ...header })),
  );
  const encodedPayload = bytesToBase64Url(
    encoder.encode(JSON.stringify(payload)),
  );
  const data = encoder.encode(`${encodedHeader}.${encodedPayload}`);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    data,
  );
  return `${encodedHeader}.${encodedPayload}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

describe("Access JWT", () => {
  it("reads the Cloudflare Access assertion header", () => {
    const request = new Request("https://preview.example.com/", {
      headers: { [accessJwtHeader]: " token " },
    });
    expect(readAccessJwt(request)).toBe("token");
  });

  it("accepts a signed Access token for this application audience", async () => {
    const keys = await generateKeys();
    const jwk = await publicJwk(keys.publicKey);
    const now = Date.UTC(2026, 8, 14, 20);
    const token = await signJwt(keys.privateKey, {
      aud: audience,
      exp: Math.floor(now / 1000) + 60,
      iss: teamDomain,
    });

    await expect(
      verifyAccessJwt(token, { audience, now, teamDomain }, async () => ({
        keys: [jwk],
      })),
    ).resolves.toBe(true);
  });

  it("rejects a missing token, the wrong audience and a tampered payload", async () => {
    const keys = await generateKeys();
    const jwk = await publicJwk(keys.publicKey);
    const now = Date.UTC(2026, 8, 14, 20);
    const token = await signJwt(keys.privateKey, {
      aud: audience,
      exp: Math.floor(now / 1000) + 60,
      iss: teamDomain,
    });
    const [header, payload, signature] = token.split(".");
    const tampered = `${header}.${payload}x.${signature}`;

    await expect(
      verifyAccessJwt(undefined, { audience, now, teamDomain }, async () => ({
        keys: [jwk],
      })),
    ).resolves.toBe(false);
    await expect(
      verifyAccessJwt(
        token,
        { audience: "other", now, teamDomain },
        async () => ({ keys: [jwk] }),
      ),
    ).resolves.toBe(false);
    await expect(
      verifyAccessJwt(tampered, { audience, now, teamDomain }, async () => ({
        keys: [jwk],
      })),
    ).resolves.toBe(false);
  });
});
