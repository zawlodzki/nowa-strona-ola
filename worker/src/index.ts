import type { LeadSubmission } from "@ola/shared";

export type LeadSubmissionContract = LeadSubmission;

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

export default {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === "GET" && pathname === "/health") {
      return Response.json({ status: "ok" }, { headers: jsonHeaders });
    }

    if (request.method === "POST" && pathname === "/api/leads") {
      return Response.json(
        { error: "not_implemented" },
        { headers: jsonHeaders, status: 501 },
      );
    }

    return Response.json(
      { error: "not_found" },
      { headers: jsonHeaders, status: 404 },
    );
  },
} satisfies ExportedHandler;
