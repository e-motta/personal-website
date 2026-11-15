import { GITHUB_URL, LINKEDIN_URL } from "./profile";

export const UMAMI_SCRIPT_SRC = "https://stats.eduardomotta.dev/script.js";
export const UMAMI_WEBSITE_ID = "e3042b44-7ffc-454a-b8d6-2cc77802b884";
export const UMAMI_DOMAINS = "www.eduardomotta.dev,eduardomotta.dev";

const SITE_HOSTS = new Set(["www.eduardomotta.dev", "eduardomotta.dev"]);
const NAMED_EVENTS = new Set([
  "outbound-github",
  "outbound-linkedin",
  "contact-email",
  "resume-download",
  "resume-open",
  "outbound-link",
]);

// Vercel inlines NEXT_PUBLIC_VERCEL_ENV into the client bundle with the same
// value as VERCEL_ENV. Previews and local builds leave it unset or "preview".
export function isUmamiEnabled() {
  return process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
}

function profileKey(href) {
  try {
    return identityOf(new URL(href));
  } catch {
    return "";
  }
}

const GITHUB_PROFILE = profileKey(GITHUB_URL);
const LINKEDIN_PROFILE = profileKey(LINKEDIN_URL);

function identityOf(url) {
  let host = url.hostname.toLowerCase();
  if (host.startsWith("www.")) host = host.slice(4);
  let path = url.pathname;
  try {
    path = decodeURIComponent(path);
  } catch {
    // Keep the raw pathname when it is not valid UTF-8.
  }
  path = path.replace(/\/+$/, "").toLowerCase();
  return `${host}${path}`;
}

function containsEmail(value) {
  return /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(value);
}

function analyticsUrl(href) {
  let url;
  try {
    url = new URL(href, "https://www.eduardomotta.dev");
  } catch {
    return undefined;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
  url.hash = "";
  const value = url.toString();
  if (containsEmail(value)) return undefined;
  try {
    if (containsEmail(decodeURIComponent(value))) return undefined;
  } catch {
    return undefined;
  }
  if (value.length <= 500) return value;
  return `${url.origin}${url.pathname}`.slice(0, 500);
}

function isSameSite(url) {
  return SITE_HOSTS.has(url.hostname.toLowerCase());
}

function isResume(url) {
  const segment = url.pathname.split("/").filter(Boolean).pop() || "";
  let file = segment;
  try {
    file = decodeURIComponent(segment);
  } catch {
    // Keep the raw segment.
  }
  if (/^(resume|cv)$/i.test(file)) return true;
  if (/^(resume|cv)([-_.].+)?\.(pdf|docx?|rtf|odt|html?)$/i.test(file)) return true;
  const stem = file.replace(/\.[^.]+$/, "");
  if (/\.(pdf|docx?|rtf|odt)$/i.test(file) && /(resume|curriculum[-_ ]?vitae|(^|[^a-z])cv([^a-z]|$))/i.test(stem)) {
    return true;
  }
  return false;
}

function resumeEventName(url) {
  return /\.(pdf|docx?|rtf|odt)$/i.test(url.pathname) ? "resume-download" : "resume-open";
}

function parseHttpUrl(href) {
  if (typeof href !== "string") return null;
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  if (/^(javascript|data|blob):/i.test(trimmed)) return null;
  try {
    const url = new URL(trimmed, "https://www.eduardomotta.dev");
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

// mailto clicks record the event name only. The address is never a property.
function describeClick(href, event) {
  if (typeof href !== "string") return null;
  const trimmed = href.trim();
  if (/^mailto:/i.test(trimmed) || event === "contact-email") {
    return { name: "contact-email" };
  }

  const url = parseHttpUrl(trimmed);
  if (!url) return null;

  const safeUrl = analyticsUrl(url.href);
  if (isResume(url) || event === "resume-download" || event === "resume-open") {
    const name =
      event === "resume-download" || event === "resume-open" ? event : resumeEventName(url);
    return { name, url: safeUrl };
  }

  if (isSameSite(url)) return null;

  if (event === "outbound-github" || event === "outbound-linkedin") {
    return { name: event, url: safeUrl };
  }

  const identity = identityOf(url);
  if (identity && identity === GITHUB_PROFILE) {
    return { name: "outbound-github", url: safeUrl };
  }
  if (identity && identity === LINKEDIN_PROFILE) {
    return { name: "outbound-linkedin", url: safeUrl };
  }

  if (event && !NAMED_EVENTS.has(event)) return null;
  return { name: "outbound-link", url: safeUrl };
}

export function umamiEventProps(href, { location, event } = {}) {
  const tracked = describeClick(href, event);
  if (!tracked) return {};
  const props = { "data-umami-event": tracked.name };
  if (location) props["data-umami-event-location"] = location;
  if (tracked.url) props["data-umami-event-url"] = tracked.url;
  return props;
}

export function trackUmamiClick(href, location) {
  if (typeof window === "undefined") return;
  const tracked = describeClick(href);
  if (!tracked) return;
  const track = window.umami && window.umami.track;
  if (typeof track !== "function") return;
  const data = {};
  if (location) data.location = location;
  if (tracked.url) data.url = tracked.url;
  track(tracked.name, data);
}
