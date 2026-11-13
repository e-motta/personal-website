import { useEffect, useState } from "react";
import styles from "./TableOfContents.module.css";

export default function TableOfContents({ headings }) {
  const [active, setActive] = useState(headings[0]?.id || "");

  useEffect(() => {
    if (!headings.length) return undefined;
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter(Boolean);
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "0px 0px -65% 0px", threshold: [0, 1] }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav className={styles.toc} aria-label="On this page">
      <p className={styles.label}>On this page</p>
      <ol className={styles.list}>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={styles.link}
              data-level={heading.level}
              data-active={active === heading.id ? "true" : "false"}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
