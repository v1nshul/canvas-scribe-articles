import { fetchArticleHtml, isAllowedUrl } from "./_lib/fetch-article.ts";

type VercelRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  send: (body: string) => void;
  setHeader: (name: string, value: string) => void;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const targetUrl = typeof req.query.url === "string" ? req.query.url : undefined;

  if (!targetUrl) {
    return res.status(400).json({ error: "Missing url query parameter" });
  }

  if (!isAllowedUrl(targetUrl)) {
    return res.status(400).json({ error: "Invalid or disallowed URL" });
  }

  const result = await fetchArticleHtml(targetUrl);

  if (!result.ok) {
    return res.status(result.status).json({ error: result.error });
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(result.status).send(result.html);
}
