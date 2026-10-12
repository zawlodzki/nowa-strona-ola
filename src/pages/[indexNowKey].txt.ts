import type { APIRoute, GetStaticPaths } from "astro";

import { indexNowConfiguration } from "@/lib/seo/indexnow";

export const getStaticPaths: GetStaticPaths = () => {
  const configuration = indexNowConfiguration(process.env);
  return configuration.kind === "enabled"
    ? [{ params: { indexNowKey: configuration.key } }]
    : [];
};

export const GET: APIRoute = ({ params }) => {
  const configuration = indexNowConfiguration(process.env);
  if (
    configuration.kind !== "enabled" ||
    params.indexNowKey !== configuration.key
  )
    return new Response(null, { status: 404 });
  return new Response(configuration.key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
};
