import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "posts");

function postFiles() {
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".md"));
}

export function getSortedPostsData() {
  const allPostsData = postFiles().map((fileName) => {
    const id = fileName.replace(/\.md$/, "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);

    return {
      id,
      ...matterResult.data,
    };
  });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    }
    return -1;
  });
}

export function getAllPostIds() {
  return postFiles().map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
      },
    };
  });
}

function nodeText(node) {
  if (!node) return "";
  if (node.type === "text") return node.value || "";
  if (!Array.isArray(node.children)) return "";
  return node.children.map(nodeText).join("");
}

function slugify(value) {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

function stampHeadings(tree) {
  const headings = [];
  const seen = new Map();

  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (
      node.type === "element" &&
      (node.tagName === "h2" || node.tagName === "h3")
    ) {
      const text = nodeText(node).replace(/\s+/g, " ").trim();
      const base = slugify(text);
      const count = (seen.get(base) || 0) + 1;
      seen.set(base, count);
      const id = count === 1 ? base : `${base}-${count}`;
      node.properties = { ...(node.properties || {}), id };
      headings.push({
        level: node.tagName === "h2" ? 2 : 3,
        text,
        id,
      });
    }
    if (Array.isArray(node.children)) node.children.forEach(walk);
  };

  walk(tree);
  return headings;
}

function rehypeHeadingIds(onHeadings) {
  return () => (tree) => {
    onHeadings(stampHeadings(tree));
  };
}

function plainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_~`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readingMinutes(markdown) {
  const words = plainText(markdown)
    .split(" ")
    .filter((word) => /[A-Za-z0-9]/.test(word));
  return Math.max(1, Math.round(words.length / 200));
}

function excerpt(markdown) {
  const text = plainText(markdown);
  if (text.length <= 160) return text;
  const cut = text.slice(0, 157);
  const trimmed = cut.replace(/\s+\S*$/, "");
  return `${trimmed}…`;
}

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);

  const { serialize } = await import("next-mdx-remote/serialize");
  const imageSize = (await import("rehype-img-size")).default;
  const remarkGfm = (await import("remark-gfm")).default;

  let headings = [];
  const contentHtml = await serialize(matterResult.content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        [imageSize, { dir: "public" }],
        rehypeHeadingIds((found) => {
          headings = found;
        }),
      ],
    },
  });

  return {
    id,
    contentHtml,
    headings,
    minutes: readingMinutes(matterResult.content),
    excerpt: excerpt(matterResult.content),
    ...matterResult.data,
  };
}
