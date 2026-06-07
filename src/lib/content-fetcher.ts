export interface FetchResult {
  title: string;
  content: string;
  error?: string;
}

const CORS_PROXIES = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

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

export async function fetchArticleContent(url: string): Promise<FetchResult> {
  let lastError: Error | null = null;
  let html = "";

  // Try each proxy
  for (const proxyFn of CORS_PROXIES) {
    try {
      const proxyUrl = proxyFn(url);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(proxyUrl, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        html = await response.text();
        break;
      }
    } catch (error) {
      lastError = error as Error;
      continue;
    }
  }

  if (!html) {
    const msg = lastError?.message || "Unable to fetch article from any proxy";
    return { title: "Error", content: "", error: msg };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Extract title
    const title = doc.querySelector("title")?.textContent || 
                  doc.querySelector("h1")?.textContent ||
                  url.split("/").filter(Boolean).pop() || 
                  "Untitled";

    // Extract content using multiple selectors
    let content = "";
    for (const selector of CONTENT_SELECTORS) {
      const element = doc.querySelector(selector);
      if (element) {
        const html = element.innerHTML.trim();
        if (html.length > 100) {
          content = html;
          break;
        }
      }
    }

    // Fallback to body
    if (!content.trim()) {
      const body = doc.body.cloneNode(true) as HTMLElement;
      
      // Remove unwanted elements
      body.querySelectorAll("script, style, nav, footer, [role='navigation'], .navbar, .sidebar").forEach(el => {
        el.remove();
      });
      
      content = body.innerHTML;
    }

    // Sanitize content
    const sanitized = sanitizeHtml(content);

    return {
      title: title.substring(0, 200), // Limit title length
      content: sanitized
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to parse content";
    return { title: "Error", content: "", error: msg };
  }
}

function sanitizeHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;

  // Remove dangerous attributes
  div.querySelectorAll("*").forEach(el => {
    // Remove event handlers
    ["onclick", "onerror", "onload", "onmouseover", "onmouseout", "onchange", "onsubmit"].forEach(attr => {
      el.removeAttribute(attr);
    });

    // Remove scripts
    if (el.tagName === "SCRIPT") {
      el.remove();
    }

    // Remove iframes (potential security risk)
    if (el.tagName === "IFRAME") {
      el.remove();
    }
  });

  return div.innerHTML;
}
