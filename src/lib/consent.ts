export type ConsentPreferences = Readonly<{
  necessary: true;
  measurement: boolean;
  marketing: boolean;
}>;
export type ConsentView = Readonly<{
  phase: "loading" | "undecided" | "saving" | "settled" | "unavailable";
  preferences: ConsentPreferences;
  error: string | null;
}>;
type Action = "all" | "necessary" | "custom";
type UiSource = "banner" | "dialog";
export type ConsentStorage = {
  readCookie(): string | null;
  writeCookie(value: string, maxAgeSeconds: number): void;
  readMirror(): string | null;
  writeMirror(value: string): void;
};
const KEY = "olesiewicz-consent";
const POLICY = "olesiewicz_global_opt_in_v1";
const YEAR = 365 * 24 * 60 * 60 * 1000;
const DENIED: ConsentPreferences = {
  necessary: true,
  measurement: false,
  marketing: false,
};
type Snapshot = { fingerprint: string; token: string };
type Receipt = {
  version: 1;
  kind: "receipt";
  origin: string;
  policyId: string;
  fingerprint: string;
  subjectId: string;
  consentId: string;
  givenAt: number;
  expiresAt: number;
  preferences: ConsentPreferences;
};
type Pending = {
  version: 1;
  kind: "pending";
  origin: string;
  subjectId: string;
  preferences: ConsentPreferences;
};
type Envelope = Receipt | Pending;
function object(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value))
    : null;
}
function preferences(value: unknown): ConsentPreferences | null {
  const item = object(value);
  if (
    !item ||
    item.necessary !== true ||
    typeof item.measurement !== "boolean" ||
    typeof item.marketing !== "boolean"
  )
    return null;
  return {
    necessary: true,
    measurement: item.measurement,
    marketing: item.marketing,
  };
}
function same(a: ConsentPreferences, b: ConsentPreferences): boolean {
  return a.measurement === b.measurement && a.marketing === b.marketing;
}
function intersection(
  a: ConsentPreferences,
  b: ConsentPreferences,
): ConsentPreferences {
  return {
    necessary: true,
    measurement: a.measurement && b.measurement,
    marketing: a.marketing && b.marketing,
  };
}
function date(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}
function parseSnapshot(value: unknown): Snapshot | null {
  const body = object(value);
  const policy = object(body?.policy);
  const consent = object(policy?.consent);
  const decision = object(body?.policyDecision);
  const categories = consent?.categories;
  if (
    !consent ||
    policy?.id !== POLICY ||
    decision?.policyId !== POLICY ||
    policy?.model !== "opt-in" ||
    consent.expiryDays !== 365 ||
    consent.scopeMode !== "strict" ||
    !Array.isArray(categories) ||
    categories.length !== 3 ||
    !["necessary", "measurement", "marketing"].every((category) =>
      categories.includes(category),
    ) ||
    !Array.isArray(consent.preselectedCategories) ||
    consent.preselectedCategories.length !== 1 ||
    consent.preselectedCategories[0] !== "necessary" ||
    typeof decision.fingerprint !== "string" ||
    !decision.fingerprint ||
    typeof body?.policySnapshotToken !== "string" ||
    !body.policySnapshotToken
  )
    return null;
  return { fingerprint: decision.fingerprint, token: body.policySnapshotToken };
}
function parseEnvelope(raw: string | null, origin: string): Envelope | null {
  if (!raw) return null;
  try {
    const item = object(JSON.parse(raw));
    const choice = preferences(item?.preferences);
    if (
      item?.version !== 1 ||
      item.origin !== origin ||
      !choice ||
      typeof item.subjectId !== "string" ||
      !/^sub_[1-9A-HJ-NP-Za-km-z]{16,64}$/.test(item.subjectId)
    )
      return null;
    if (item.kind === "pending")
      return {
        version: 1,
        kind: "pending",
        origin,
        subjectId: item.subjectId,
        preferences: choice,
      };
    if (
      item.kind !== "receipt" ||
      item.policyId !== POLICY ||
      typeof item.fingerprint !== "string" ||
      !item.fingerprint ||
      typeof item.consentId !== "string" ||
      !item.consentId ||
      typeof item.givenAt !== "number" ||
      !Number.isFinite(item.givenAt) ||
      typeof item.expiresAt !== "number" ||
      item.expiresAt !== item.givenAt + YEAR ||
      item.givenAt > Date.now() + 60_000 ||
      item.expiresAt <= Date.now()
    )
      return null;
    return {
      version: 1,
      kind: "receipt",
      origin,
      policyId: POLICY,
      fingerprint: item.fingerprint,
      subjectId: item.subjectId,
      consentId: item.consentId,
      givenAt: item.givenAt,
      expiresAt: item.expiresAt,
      preferences: choice,
    };
  } catch {
    return null;
  }
}
function browserStorage(): ConsentStorage {
  return {
    readCookie() {
      const item = document.cookie
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${KEY}=`));
      return item ? decodeURIComponent(item.slice(KEY.length + 1)) : null;
    },
    writeCookie(value, maxAgeSeconds) {
      document.cookie = `${KEY}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    },
    readMirror: () => localStorage.getItem(KEY),
    writeMirror: (value) => localStorage.setItem(KEY, value),
  };
}
function subjectId(): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return `sub_${Array.from(crypto.getRandomValues(new Uint8Array(24)), (byte) => alphabet[byte % alphabet.length]).join("")}`;
}
export function createConsentController(options: {
  endpoint: string;
  origin: string;
  storage?: ConsentStorage;
  fetch?: typeof fetch;
  eventTarget?: EventTarget;
}) {
  const origin = new URL(options.origin).origin;
  const hostname = new URL(origin).hostname;
  const endpoint = options.endpoint.replace(/\/$/, "");
  const storage = options.storage ?? browserStorage();
  const request = options.fetch ?? globalThis.fetch;
  const target =
    options.eventTarget ??
    (typeof window === "undefined" ? new EventTarget() : window);
  const listeners = new Set<(view: ConsentView) => void>();
  const aborts = new Set<AbortController>();
  let view: ConsentView = {
    phase: "loading",
    preferences: DENIED,
    error: null,
  };
  let envelope: Envelope | null = null;
  let validated: Receipt | null = null;
  let generation = 0;
  let disposed = false;
  let expiry: ReturnType<typeof setTimeout> | undefined;
  const emit = (
    phase: ConsentView["phase"],
    choice: ConsentPreferences,
    error: string | null = null,
  ) => {
    if (disposed) return;
    view = { phase, preferences: choice, error };
    for (const listener of listeners) listener(view);
  };
  const unavailable = () => {
    validated = null;
    clearTimeout(expiry);
    emit(
      "unavailable",
      DENIED,
      "Nie udało się zapisać lub odczytać ustawień cookies. Opcjonalne narzędzia pozostają wyłączone. Spróbuj ponownie.",
    );
  };
  function read(): Envelope | null {
    let cookie: string | null;
    let mirror: string | null;
    try {
      cookie = storage.readCookie();
    } catch {
      cookie = null;
    }
    try {
      mirror = storage.readMirror();
    } catch {
      mirror = null;
    }
    const mirrored = parseEnvelope(mirror, origin);
    const canonical = parseEnvelope(cookie, origin);
    if (mirrored?.kind === "pending") return mirrored;
    if (canonical?.kind === "pending") return canonical;
    if (!canonical || (mirror !== null && cookie !== mirror)) return null;
    return canonical;
  }
  function persist(value: Envelope): boolean {
    const raw = JSON.stringify(value);
    let cookieStored: boolean;
    let mirrorStored: boolean;
    try {
      storage.writeCookie(
        raw,
        Math.ceil(
          value.kind === "receipt"
            ? (value.expiresAt - Date.now()) / 1000
            : YEAR / 1000,
        ),
      );
      cookieStored = storage.readCookie() === raw;
    } catch {
      cookieStored = false;
    }
    try {
      storage.writeMirror(raw);
      mirrorStored = storage.readMirror() === raw;
    } catch {
      mirrorStored = false;
    }
    return value.kind === "pending"
      ? cookieStored || mirrorStored
      : cookieStored;
  }
  async function json(path: string, body?: unknown): Promise<unknown> {
    const abort = new AbortController();
    aborts.add(abort);
    const timeout = setTimeout(() => abort.abort(), 10_000);
    try {
      const response = await request(`${endpoint}${path}`, {
        method: body === undefined ? "GET" : "POST",
        cache: "no-store",
        credentials: "omit",
        headers: {
          Accept: "application/json",
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: abort.signal,
      });
      if (response.status !== 200)
        throw new Error(
          response.status === 409 ? "policy-conflict" : "unavailable",
        );
      return await response.json();
    } finally {
      clearTimeout(timeout);
      aborts.delete(abort);
    }
  }
  function arm(receipt: Receipt) {
    clearTimeout(expiry);
    expiry = setTimeout(
      () => {
        void start();
      },
      Math.min(receipt.expiresAt - Date.now(), 2_147_483_647),
    );
  }
  async function start(): Promise<void> {
    const current = ++generation;
    clearTimeout(expiry);
    envelope = read();
    if (
      envelope?.kind !== "receipt" ||
      !validated ||
      JSON.stringify(envelope) !== JSON.stringify(validated)
    )
      validated = null;
    if (validated) arm(validated);
    emit("loading", validated?.preferences ?? DENIED);
    try {
      const policy = parseSnapshot(await json("/init"));
      if (!policy) throw new Error("policy");
      if (current !== generation || disposed) return;
      if (envelope?.kind === "pending") {
        await choose(DENIED, "necessary", "dialog");
        return;
      }
      if (!envelope || envelope.fingerprint !== policy.fingerprint) {
        validated = null;
        clearTimeout(expiry);
        emit("undecided", DENIED);
        return;
      }
      const receipt = envelope;
      const body = object(
        await json(
          `/subjects/${encodeURIComponent(receipt.subjectId)}?type=cookie_banner`,
        ),
      );
      const subject = object(body?.subject);
      const records = Array.isArray(body?.consents)
        ? body.consents.map(object).filter((record) => record !== null)
        : [];
      const latest = records
        .filter((record) => record.type === "cookie_banner")
        .sort((a, b) => (date(b.givenAt) ?? 0) - (date(a.givenAt) ?? 0))[0];
      const latestPreferences = object(latest?.preferences);
      const restored: ConsentPreferences = {
        necessary: true,
        measurement: latestPreferences?.measurement === true,
        marketing: latestPreferences?.marketing === true,
      };
      if (current !== generation || disposed) return;
      const reread = read();
      if (
        subject?.id !== receipt.subjectId ||
        body?.isValid !== true ||
        latest?.id !== receipt.consentId ||
        latest.isLatestPolicy !== true ||
        date(latest.givenAt) !== receipt.givenAt ||
        latestPreferences?.necessary !== true ||
        !same(restored, receipt.preferences) ||
        reread?.kind !== "receipt" ||
        JSON.stringify(reread) !== JSON.stringify(receipt)
      ) {
        validated = null;
        clearTimeout(expiry);
        emit("undecided", DENIED);
        return;
      }
      validated = receipt;
      emit("settled", receipt.preferences);
      arm(receipt);
    } catch {
      if (current === generation && !disposed) unavailable();
    }
  }
  async function choose(
    choice: ConsentPreferences,
    action: Action,
    uiSource: UiSource,
  ): Promise<boolean> {
    const parsed = preferences(choice);
    if (
      !parsed ||
      disposed ||
      (action === "all" && (!parsed.measurement || !parsed.marketing)) ||
      (action === "necessary" && (parsed.measurement || parsed.marketing))
    )
      return false;
    const current = ++generation;
    clearTimeout(expiry);
    envelope = read() ?? envelope;
    const prior = view.preferences;
    const restricted = intersection(prior, parsed);
    validated = null;
    const id = envelope?.subjectId ?? subjectId();
    const previous = envelope?.preferences ?? prior;
    const reducing =
      (previous.measurement && !parsed.measurement) ||
      (previous.marketing && !parsed.marketing) ||
      envelope?.kind === "pending";
    let restrictionStored = true;
    if (reducing) {
      envelope = {
        version: 1,
        kind: "pending",
        origin,
        subjectId: id,
        preferences: restricted,
      };
      restrictionStored = persist(envelope);
    }
    const expectedStorage = JSON.stringify(read());
    emit("saving", restricted);
    try {
      const policy = parseSnapshot(await json("/init"));
      if (!policy) throw new Error("policy");
      if (current !== generation || disposed) return false;
      const body = object(
        await json("/subjects", {
          subjectId: id,
          domain: hostname,
          type: "cookie_banner",
          preferences: parsed,
          consentAction: action,
          uiSource,
          givenAt: Date.now(),
          policySnapshotToken: policy.token,
        }),
      );
      const applied = preferences(body?.appliedPreferences);
      const givenAt = date(body?.givenAt);
      if (
        !applied ||
        !same(applied, parsed) ||
        body?.subjectId !== id ||
        body.domain !== hostname ||
        body.type !== "cookie_banner" ||
        typeof body.consentId !== "string" ||
        !body.consentId ||
        givenAt === null ||
        givenAt > Date.now() + 60_000 ||
        givenAt + YEAR <= Date.now()
      )
        throw new Error("receipt");
      if (current !== generation || disposed) return false;
      const stored = read();
      if (JSON.stringify(stored) !== expectedStorage) {
        emit("undecided", DENIED);
        return false;
      }
      const receipt: Receipt = {
        version: 1,
        kind: "receipt",
        origin,
        policyId: POLICY,
        fingerprint: policy.fingerprint,
        subjectId: id,
        consentId: body.consentId,
        givenAt,
        expiresAt: givenAt + YEAR,
        preferences: applied,
      };
      if (!persist(receipt) || read()?.kind !== "receipt")
        throw new Error("storage");
      envelope = receipt;
      validated = receipt;
      emit("settled", applied);
      arm(receipt);
      return true;
    } catch (error) {
      if (current !== generation || disposed) return false;
      if (error instanceof Error && error.message === "policy-conflict") {
        emit(
          "undecided",
          DENIED,
          "Podstawy zgody zmieniły się. Sprawdź ustawienia i ponownie zapisz wybór.",
        );
      } else if (!restrictionStored) {
        emit(
          "unavailable",
          DENIED,
          "Przeglądarka blokuje trwały zapis wycofania zgody. Narzędzia są wyłączone na tej stronie, ale po przejściu dalej wcześniejszy wybór może wrócić. Odblokuj zapisywanie ustawień i spróbuj ponownie.",
        );
      } else unavailable();
      return false;
    }
  }
  const revalidate = () => {
    if (!disposed) void start();
  };
  const onStorage = (event: Event) => {
    if (!("key" in event) || event.key === KEY || event.key === null)
      revalidate();
  };
  target.addEventListener("storage", onStorage);
  target.addEventListener("pageshow", revalidate);
  target.addEventListener("focus", revalidate);
  const visibilityTarget = typeof document === "undefined" ? target : document;
  const onVisibility = () => {
    if (
      typeof document === "undefined" ||
      document.visibilityState === "visible"
    )
      revalidate();
  };
  visibilityTarget.addEventListener("visibilitychange", onVisibility);
  return {
    start,
    choose,
    subscribe(listener: (state: ConsentView) => void) {
      listeners.add(listener);
      listener(view);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose() {
      disposed = true;
      generation++;
      clearTimeout(expiry);
      for (const abort of aborts) abort.abort();
      target.removeEventListener("storage", onStorage);
      target.removeEventListener("pageshow", revalidate);
      target.removeEventListener("focus", revalidate);
      visibilityTarget.removeEventListener("visibilitychange", onVisibility);
      listeners.clear();
    },
  };
}
