import Image from "next/image";
import styles from "../styles/post.module.css";

function PostImage({ src, alt, width, height }) {
  const w = Number(width);
  const h = Number(height);
  if (!src || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return <img src={src} alt={alt || ""} className={styles.image} />;
  }

  return (
    <Image
      src={src}
      alt={alt || ""}
      width={w}
      height={h}
      sizes="(min-width: 1120px) 680px, 100vw"
      className={styles.image}
      style={{ width: "100%", height: "auto" }}
    />
  );
}

export const mdxComponents = {
  img: PostImage,
  a: ({ href, children, ...props }) => {
    const external = typeof href === "string" && /^https?:/.test(href);
    return (
      <a href={href} {...props} {...(external ? { rel: "noreferrer" } : {})}>
        {children}
      </a>
    );
  },
  table: ({ children, ...props }) => (
    <div className={styles.tableScroll}>
      <table {...props}>{children}</table>
    </div>
  ),
};
