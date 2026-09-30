export const accessJwtHeader = "cf-access-jwt-assertion";

export interface AccessJwtOptions {
  audience: string;
  now?: number;
  teamDomain: string;
}

interface JsonWebKeySet {
  keys?: AccessJwk[];
}

interface AccessJwk {
  alg?: string;
  e?: string;
  kid?: string;
  kty?: string;
  n?: string;
  use?: string;
}

interface JwtHeader {
  alg?: string;
  kid?: string;
}

interface JwtPayload {
  aud?: string | string[];
  exp?: number;
  iss?: string;
}

export type JwksLoader = (url: string) => Promise<JsonWebKeySet>;

const encoder = new TextEncoder();
const jwksCache = new Map<string, { expiresAt: number; keys: AccessJwk[] }>();
const jwksTtlMs = 60 * 60 * 1000;

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

function decodeJson<T>(part: string): T | null {
  const bytes = base64UrlToBytes(part);
  if (!bytes) return null;
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    return null;
  }
}

function audienceMatches(
  claimed: string | string[] | undefined,
  expected: string,
): boolean {
  if (!claimed) return false;
  return Array.isArray(claimed)
    ? claimed.includes(expected)
    : claimed === expected;
}

function issuerMatches(
  claimed: string | undefined,
  teamDomain: string,
): boolean {
  if (!claimed) return false;
  return claimed.replace(/\/$/, "") === teamDomain.replace(/\/$/, "");
}

async function defaultJwksLoader(url: string): Promise<JsonWebKeySet> {
  const cached = jwksCache.get(url);
  const now = Date.now();
  if (cached && cached.expiresAt > now) return { keys: cached.keys };

  const response = await fetch(url);
  if (!response.ok) return { keys: [] };
  const body = (await response.json()) as JsonWebKeySet;
  const keys = Array.isArray(body.keys) ? body.keys : [];
  jwksCache.set(url, { keys, expiresAt: now + jwksTtlMs });
  return { keys };
}

export function readAccessJwt(request: Request): string | undefined {
  const header = request.headers.get(accessJwtHeader)?.trim();
  return header || undefined;
}

export async function verifyAccessJwt(
  token: string | undefined,
  options: AccessJwtOptions,
  loadJwks: JwksLoader = defaultJwksLoader,
): Promise<boolean> {
  if (!token || !options.audience || !options.teamDomain) return false;

  const [encodedHeader, encodedPayload, encodedSignature, extra] =
    token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature || extra) {
    return false;
  }

  const header = decodeJson<JwtHeader>(encodedHeader);
  const payload = decodeJson<JwtPayload>(encodedPayload);
  const signature = base64UrlToBytes(encodedSignature);
  if (!header || !payload || !signature) return false;
  if (header.alg !== "RS256" || !header.kid) return false;

  const nowSeconds = Math.floor((options.now ?? Date.now()) / 1000);
  if (!Number.isInteger(payload.exp) || (payload.exp ?? 0) <= nowSeconds) {
    return false;
  }
  if (!issuerMatches(payload.iss, options.teamDomain)) return false;
  if (!audienceMatches(payload.aud, options.audience)) return false;

  const certsUrl = `${options.teamDomain.replace(/\/$/, "")}/cdn-cgi/access/certs`;
  const jwks = await loadJwks(certsUrl);
  const jwk = jwks.keys?.find((key) => key.kid === header.kid);
  if (!jwk?.n || !jwk.e) return false;

  try {
    const key = await crypto.subtle.importKey(
      "jwk",
      {
        alg: "RS256",
        e: jwk.e,
        kty: "RSA",
        n: jwk.n,
      },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const data = encoder.encode(`${encodedHeader}.${encodedPayload}`);
    const signatureBuffer = new ArrayBuffer(signature.byteLength);
    new Uint8Array(signatureBuffer).set(signature);
    return crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      signatureBuffer,
      data,
    );
  } catch {
    return false;
  }
}
