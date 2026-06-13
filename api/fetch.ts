import { fetchArticleHtml, isAllowedUrl } from "../server/fetch-article";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return Response.json({ error: "Missing url query parameter" }, { status: 400 });
  }

  if (!isAllowedUrl(targetUrl)) {
    return Response.json({ error: "Invalid or disallowed URL" }, { status: 400 });
  }

  const result = await fetchArticleHtml(targetUrl);

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return new Response(result.html, {
    status: result.status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
