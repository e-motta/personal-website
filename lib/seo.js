export const SITE_URL = "https://www.eduardomotta.dev";

export const SITE_DESCRIPTION =
  "Senior Software Engineer and Tech Lead in Florianópolis. I design and lead backend architectures with Python, FastAPI, PySpark, Kafka, and Kubernetes.";

// public/images/profile.jpeg. Square, so Twitter uses a summary card and
// does not crop the portrait into a 2:1 large image. getStaticProps checks
// these dimensions against the file.
export const PROFILE_IMAGE = {
  src: "/images/profile.jpeg",
  width: 730,
  height: 730,
  alt: "Eduardo Motta de Moraes",
  type: "image/jpeg",
  card: "summary",
};

export function absoluteUrl(pathname = "/") {
  if (typeof pathname !== "string" || pathname.length === 0) return SITE_URL;
  if (/^https?:\/\//i.test(pathname)) return pathname;
  const path = pathname.split(/[?#]/)[0] || "/";
  if (path === "/") return SITE_URL;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function jsonLdScript(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function profileImageObject() {
  return {
    "@type": "ImageObject",
    url: absoluteUrl(PROFILE_IMAGE.src),
    width: PROFILE_IMAGE.width,
    height: PROFILE_IMAGE.height,
    caption: PROFILE_IMAGE.alt,
  };
}
