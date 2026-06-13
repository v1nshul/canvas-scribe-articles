const PRIVATE_IPV4_RANGES = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
];

const PRIVATE_IPV6_RANGES = [/^::1$/, /^fc/i, /^fd/i, /^fe80:/i];

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "0.0.0.0",
  "[::1]",
]);

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

export function isAllowedUrl(urlString: string): boolean {
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

export interface FetchArticleResult {
  ok: true;
  html: string;
  status: number;
}

export interface FetchArticleError {
  ok: false;
  error: string;
  status: number;
}

export async function fetchArticleHtml(
  url: string
): Promise<FetchArticleResult | FetchArticleError> {
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
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
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
