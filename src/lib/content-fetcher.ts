export interface FetchResult {
  title: string;
  content: string;
  error?: string;
}

const CONTENT_SELECTORS = [
  "article",
  "main",
  ".article",
  ".content",
  "#content",
  ".post-content",
  '[role="main"]',
  ".entry-content",
  ".post-body",
  ".story",
  ".page-content",
  ".main-content"
];

function buildProxyUrl(url: string): string {
  return `/api/fetch?url=${encodeURIComponent(url)}`;
}

export async function fetchArticleContent(url: string): Promise<FetchResult> {
  let lastError = "Unable to fetch article";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(buildProxyUrl(url), {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      try {
        const payload = (await response.json()) as { error?: string };
        lastError = payload.error || `Proxy returned ${response.status}`;
      } catch {
        lastError = `Proxy returned ${response.status}`;
      }

      return { title: "Error", content: "", error: lastError };
    }

    const html = await response.text();
    return parseArticleHtml(url, html);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.name === "AbortError"
          ? "Request timed out"
          : error.message
        : lastError;

    return { title: "Error", content: "", error: message };
  }
}

function parseArticleHtml(url: string, html: string): FetchResult {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const title =
      doc.querySelector("title")?.textContent ||
      doc.querySelector("h1")?.textContent ||
      url.split("/").filter(Boolean).pop() ||
      "Untitled";

    let content = "";
    for (const selector of CONTENT_SELECTORS) {
      const element = doc.querySelector(selector);
      if (element) {
        const elementHtml = element.innerHTML.trim();
        if (elementHtml.length > 100) {
          content = elementHtml;
          break;
        }
      }
    }

    if (!content.trim()) {
      const body = doc.body.cloneNode(true) as HTMLElement;

      body
        .querySelectorAll(
          "script, style, nav, footer, [role='navigation'], .navbar, .sidebar"
        )
        .forEach((el) => {
          el.remove();
        });

      content = body.innerHTML;
    }

    const sanitized = sanitizeHtml(content);

    return {
      title: title.substring(0, 200),
      content: sanitized,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to parse content";
    return { title: "Error", content: "", error: msg };
  }
}

function sanitizeHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;

  div.querySelectorAll("*").forEach((el) => {
    ["onclick", "onerror", "onload", "onmouseover", "onmouseout", "onchange", "onsubmit"].forEach(
      (attr) => {
        el.removeAttribute(attr);
      }
    );

    if (el.tagName === "SCRIPT" || el.tagName === "IFRAME") {
      el.remove();
    }
  });

  return div.innerHTML;
}
