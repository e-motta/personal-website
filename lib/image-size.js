import fs from "fs";
import path from "path";
import { PROFILE_IMAGE } from "./seo";

function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) return null;
    let marker = buf[offset + 1];
    while (marker === 0xff && offset + 2 < buf.length) {
      offset += 1;
      marker = buf[offset + 1];
    }
    if (marker === 0xd9 || marker === 0xda) return null;
    if (marker === 0x00 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      offset += 2;
      continue;
    }
    if (offset + 4 > buf.length) return null;
    const length = buf.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > buf.length) return null;
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isSof) {
      return {
        height: buf.readUInt16BE(offset + 5),
        width: buf.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  return null;
}

function pngSize(buf) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 24 || !buf.subarray(0, 8).equals(signature)) return null;
  if (buf.subarray(12, 16).toString("ascii") !== "IHDR") return null;
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

function mimeType(src) {
  const ext = path.extname(src).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  return undefined;
}

export function readPublicImage(src) {
  if (typeof src !== "string" || !src.startsWith("/") || src.includes("..")) {
    throw new Error(`Refusing to read image path: ${src}`);
  }
  const full = path.join(process.cwd(), "public", src.slice(1));
  const buf = fs.readFileSync(full);
  const ext = path.extname(src).toLowerCase();
  const size =
    ext === ".png" ? pngSize(buf) : ext === ".jpg" || ext === ".jpeg" ? jpegSize(buf) : null;
  if (!size || !size.width || !size.height) {
    throw new Error(`Could not read dimensions for ${src}`);
  }
  return { src, width: size.width, height: size.height, type: mimeType(src) };
}

export function assertProfileImage() {
  const measured = readPublicImage(PROFILE_IMAGE.src);
  if (
    measured.width !== PROFILE_IMAGE.width ||
    measured.height !== PROFILE_IMAGE.height ||
    measured.type !== PROFILE_IMAGE.type
  ) {
    throw new Error(
      `public${PROFILE_IMAGE.src} is ${measured.width}x${measured.height} ${measured.type}; update PROFILE_IMAGE in lib/seo.js`
    );
  }
}
