import { NAME, certifications } from "./profile";
import { readPublicImage } from "./image-size";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugFromUrl(url) {
  const prefix = "/certificates/";
  if (typeof url !== "string" || !url.startsWith(prefix)) return null;
  const slug = url.slice(prefix.length);
  if (!SLUG.test(slug)) return null;
  return slug;
}

export function certificateSlugs() {
  return certifications.map((item) => slugFromUrl(item.url)).filter(Boolean);
}

export function getCertificate(slug) {
  if (!SLUG.test(slug)) return null;
  const item = certifications.find((cert) => cert.url === `/certificates/${slug}`);
  if (!item) return null;
  const image = readPublicImage(`/images/certificates/${slug}.png`);
  return {
    title: item.title,
    issuer: item.issuer,
    years: item.years,
    image: {
      ...image,
      alt: `${item.title} certificate from ${item.issuer}, issued to ${NAME}`,
    },
  };
}
