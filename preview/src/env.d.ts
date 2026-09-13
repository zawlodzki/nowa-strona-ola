import "../worker-configuration.d.ts";

declare global {
  namespace Cloudflare {
    interface Env {
      SANITY_API_READ_TOKEN: string;
      PREVIEW_SESSION_SECRET: string;
    }
  }
}

export {};
