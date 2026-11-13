import { format, parse } from "date-fns";

export function parsePostDate(value) {
  return parse(String(value).slice(0, 10), "yyyy-MM-dd", new Date());
}

export function formatDotDate(value) {
  return format(parsePostDate(value), "yyyy.MM.dd");
}

export function formatMetaDate(value) {
  return format(parsePostDate(value), "MMM d, yyyy");
}
