import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import ThemeToggle from "./ThemeToggle";
import { GITHUB_URL, LINKEDIN_URL, NAME } from "../lib/profile";
import styles from "./Layout.module.css";

export const siteTitle = NAME;

const DEFAULT_DESCRIPTION =
  "Senior Software Engineer and Tech Lead in Florianópolis. I design and lead backend architectures with Python, FastAPI, PySpark, Kafka, and Kubernetes.";

const NAV = [
  { href: "/writing", label: "Writing", match: "writing" },
  { href: "/#experience", label: "Experience", section: "experience" },
  { href: "/#education", label: "Education", section: "education" },
];

export default function Layout({ children, title, description }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState(null);
  const pageTitle = title ? `${title} — ${NAME}` : NAME;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const writingActive =
    router.pathname === "/writing" || router.pathname.startsWith("/posts");

  useEffect(() => {
    setMenuOpen(false);
  }, [router.asPath]);

  useEffect(() => {
    if (router.pathname !== "/") {
      setSection(null);
      return undefined;
    }

    const nodes = ["experience", "education"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!nodes.length) return undefined;

    const visible = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible.set(entry.target.id, entry.isIntersecting);
        });
        const current = nodes.find((node) => visible.get(node.id));
        setSection(current ? current.id : null);
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.15, 0.4] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [router.pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={styles.shell}>
      <Head>
        <title>{pageTitle}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURIComponent(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px`}
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <a className={styles.skip} href="#content">
        Skip to content
      </a>
      <div className={styles.registration} aria-hidden="true" />
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link href="/" className={styles.wordmark}>
            {NAME}
          </Link>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
          <nav
            id="site-nav"
            className={styles.nav}
            data-open={menuOpen ? "true" : "false"}
            aria-label="Primary"
          >
            <div className={styles.navLinks}>
              {NAV.map((item) => {
                const current = item.match
                  ? writingActive
                  : section === item.section;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={styles.navLink}
                    aria-current={current ? (item.match ? "page" : "location") : undefined}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {/* TODO: Point CV at a PDF in the repo once one is added. */}
              <a
                className={styles.navLink}
                href={LINKEDIN_URL}
                onClick={closeMenu}
              >
                CV
              </a>
            </div>
            <span className={styles.divider} aria-hidden="true" />
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main id="content" tabIndex={-1} className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <p>© 2026 {NAME}</p>
          <p className={styles.footerLinks}>
            <a href={GITHUB_URL} rel="noreferrer">
              GitHub
            </a>
            <span className={styles.slash} aria-hidden="true">
              /
            </span>
            <a href={LINKEDIN_URL} rel="noreferrer">
              LinkedIn
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
