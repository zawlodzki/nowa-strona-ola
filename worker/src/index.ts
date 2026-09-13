import type { LeadSubmission } from "@ola/shared";
import {
  readSignedPublication,
  triggerBuild,
  type BuildQueueMessage,
} from "./publication";

export type LeadSubmissionContract = LeadSubmission;

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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

    if (request.method === "POST" && pathname === "/webhooks/sanity") {
      const result = await readSignedPublication(
        request,
        env.SANITY_WEBHOOK_SECRET,
      );
      if (!result.ok) {
        return Response.json(
          { error: result.error },
          { headers: jsonHeaders, status: result.status },
        );
      }

      await env.BUILD_QUEUE.send(result.message);
      return Response.json(
        { accepted: true, eventId: result.message.eventId },
        { headers: jsonHeaders, status: 202 },
      );
    }

    return Response.json(
      { error: "not_found" },
      { headers: jsonHeaders, status: 404 },
    );
  },

  async queue(batch: MessageBatch<BuildQueueMessage>, env: Env): Promise<void> {
    await triggerBuild(
      batch.messages.map(({ body }) => body),
      env.BUILD_TRIGGER_URL,
      env.BUILD_TRIGGER_TOKEN,
    );
    batch.ackAll();
  },
} satisfies ExportedHandler<Env, BuildQueueMessage>;
