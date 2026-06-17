type VercelRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  send: (body: string) => void;
  setHeader: (name: string, value: string) => void;
};

const PRIVATE_IPV4_RANGES = [/^127\./, /^10\./, /^192\.168\./, /^169\.254\./, /^0\./];
const PRIVATE_IPV6_RANGES = [/^::1$/, /^fc/i, /^fd/i, /^fe80:/i];
const BLOCKED_HOSTNAMES = new Set(["localhost", "0.0.0.0", "[::1]"]);

function isPrivateIpv4(hostname: string): boolean {
  return PRIVATE_IPV4_RANGES.some((pattern) => pattern.test(hostname));
}

function isPrivateIpv6(hostname: string): boolean {
  const normalized = hostname.replace(/^\[|\]$/g, "");
  return PRIVATE_IPV6_RANGES.some((pattern) => pattern.test(normalized));
}

function isPrivateHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(lower)) return true;
  if (lower.endsWith(".local") || lower.endsWith(".internal")) return true;
  return isPrivateIpv4(lower) || isPrivateIpv6(lower);
}

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (url.username || url.password) return false;
    if (isPrivateHostname(url.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

async function fetchArticleHtml(
  url: string
): Promise<{ ok: true; html: string; status: number } | { ok: false; error: string; status: number }> {
  if (!isAllowedUrl(url)) {
    return { ok: false, error: "Invalid or disallowed URL", status: 400 };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        ok: false,
        error: `Upstream returned ${response.status} ${response.statusText}`,
        status: response.status,
      };
    }

    const html = await response.text();
    return { ok: true, html, status: response.status };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.name === "AbortError"
          ? "Request timed out"
          : error.message
        : "Failed to fetch article";

    return { ok: false, error: message, status: 502 };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    let targetUrl = typeof req.query?.url === "string" ? req.query.url : undefined;

    if (!targetUrl && req.url) {
      const parsed = new URL(req.url, "http://localhost");
      targetUrl = parsed.searchParams.get("url") || undefined;
    }

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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
