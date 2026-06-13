import { fetchArticleHtml, isAllowedUrl } from "../server/fetch-article";

interface NetlifyEvent {
  httpMethod: string;
  queryStringParameters?: Record<string, string | undefined> | null;
}

export const handler = async (event: NetlifyEvent) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const targetUrl = event.queryStringParameters?.url;

  if (!targetUrl) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing url query parameter" }),
    };
  }

  if (!isAllowedUrl(targetUrl)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid or disallowed URL" }),
    };
  }

  const result = await fetchArticleHtml(targetUrl);

  if (!result.ok) {
    return {
      statusCode: result.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: result.error }),
    };
  }

  return {
    statusCode: result.status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: result.html,
  };
};
