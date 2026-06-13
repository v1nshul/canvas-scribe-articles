import type { Plugin } from "vite";
import { fetchArticleHtml, isAllowedUrl } from "../server/fetch-article";

export function fetchProxyPlugin(): Plugin {
  return {
    name: "article-fetch-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/fetch")) {
          next();
          return;
        }

        if (req.method !== "GET") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        const requestUrl = new URL(req.url, "http://localhost");
        const targetUrl = requestUrl.searchParams.get("url");

        if (!targetUrl) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Missing url query parameter" }));
          return;
        }

        if (!isAllowedUrl(targetUrl)) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Invalid or disallowed URL" }));
          return;
        }

        const result = await fetchArticleHtml(targetUrl);

        if (!result.ok) {
          res.statusCode = result.status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: result.error }));
          return;
        }

        res.statusCode = result.status;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        res.end(result.html);
      });
    },
  };
}
