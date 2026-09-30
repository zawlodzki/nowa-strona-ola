export const previewSessionCookieName = "ola-preview-session";
export const previewSessionTtlSeconds = 60 * 60;

/** Cross-site iframe (Sanity Presentation) requires SameSite=None; Secure. */
export const previewSessionCookie = {
  httpOnly: true,
  maxAge: previewSessionTtlSeconds,
  path: "/",
  sameSite: "none" as const,
  secure: true,
};

export const previewPerspectiveCookie = {
  maxAge: previewSessionTtlSeconds,
  path: "/",
  sameSite: "none" as const,
  secure: true,
};

const encoder = new TextEncoder();

function assertSecret(secret: string): void {
  if (secret.length < 32) {
    throw new Error("PREVIEW_SESSION_SECRET musi mieć co najmniej 32 znaki.");
  }
}

function bytesToBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    "",
  );
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array | null {
  try {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return Uint8Array.from(atob(padded), (character) =>
      character.charCodeAt(0),
    );
  } catch {
    return null;
  }
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  assertSecret(secret);
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createPreviewSession(
  secret: string,
  now = Date.now(),
): Promise<string> {
  const expiresAt = Math.floor(now / 1000) + previewSessionTtlSeconds;
  const payload = String(expiresAt);
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importHmacKey(secret),
    encoder.encode(payload),
  );
  return `${payload}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

export async function verifyPreviewSession(
  value: string | undefined,
  secret: string,
  now = Date.now(),
): Promise<boolean> {
  if (!value) return false;

  const [payload, encodedSignature, extra] = value.split(".");
  if (!payload || !encodedSignature || extra) return false;

  const expiresAt = Number(payload);
  const currentTime = Math.floor(now / 1000);
  if (!Number.isInteger(expiresAt) || expiresAt <= currentTime) return false;
  if (expiresAt > currentTime + previewSessionTtlSeconds) return false;

  const signature = base64UrlToBytes(encodedSignature);
  if (!signature) return false;
  const signatureBuffer = new ArrayBuffer(signature.byteLength);
  new Uint8Array(signatureBuffer).set(signature);

  return crypto.subtle.verify(
    "HMAC",
    await importHmacKey(secret),
    signatureBuffer,
    encoder.encode(payload),
  );
}
