import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import ThemeToggle from "./ThemeToggle";
import { umamiEventProps } from "../lib/analytics";
import { GITHUB_URL, LINKEDIN_URL, NAME } from "../lib/profile";
import { absoluteUrl, PROFILE_IMAGE, SITE_DESCRIPTION } from "../lib/seo";
import styles from "./Layout.module.css";

const NAV = [
  { href: "/writing", label: "Writing", match: "writing" },
  { href: "/#experience", label: "Experience", section: "experience" },
  { href: "/#education", label: "Education", section: "education" },
];

export default function Layout({
  children,
  title,
  description,
  image,
  ogType = "website",
  canonical = true,
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState(null);
  const pageTitle = title ? `${title} — ${NAME}` : NAME;
  const pageDescription = description || SITE_DESCRIPTION;
  const social = image || PROFILE_IMAGE;
  const imageUrl = absoluteUrl(social.src);
  const pageUrl = absoluteUrl(router.asPath || "/");
  const imageAlt = social.alt || PROFILE_IMAGE.alt;
  const imageWidth = Number(social.width);
  const imageHeight = Number(social.height);
  const twitterCard =
    social.card ||
    (imageWidth / imageHeight >= 1.4 ? "summary_large_image" : "summary");
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
        <meta key="description" name="description" content={pageDescription} />
        {canonical ? <link key="canonical" rel="canonical" href={pageUrl} /> : null}
        <meta key="og:type" property="og:type" content={ogType} />
        <meta key="og:site_name" property="og:site_name" content={NAME} />
        <meta key="og:url" property="og:url" content={pageUrl} />
        <meta key="og:title" property="og:title" content={pageTitle} />
        <meta key="og:description" property="og:description" content={pageDescription} />
        <meta key="og:image" property="og:image" content={imageUrl} />
        <meta key="og:image:alt" property="og:image:alt" content={imageAlt} />
        {social.type ? (
          <meta key="og:image:type" property="og:image:type" content={social.type} />
        ) : null}
        {imageWidth > 0 ? (
          <meta key="og:image:width" property="og:image:width" content={String(imageWidth)} />
        ) : null}
        {imageHeight > 0 ? (
          <meta key="og:image:height" property="og:image:height" content={String(imageHeight)} />
        ) : null}
        <meta key="twitter:card" name="twitter:card" content={twitterCard} />
        <meta key="twitter:title" name="twitter:title" content={pageTitle} />
        <meta key="twitter:description" name="twitter:description" content={pageDescription} />
        <meta key="twitter:image" name="twitter:image" content={imageUrl} />
        <meta key="twitter:image:alt" name="twitter:image:alt" content={imageAlt} />
      </Head>
      <a className={styles.skip} href="#content">
        Skip to content
      </a>
      <div className={styles.registration} aria-hidden="true" />
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link href="/" className={styles.wordmark} aria-label={NAME}>
            <span className={styles.prompt} aria-hidden="true">&gt;</span>
            <span className={styles.wordmarkName}>
              <span className={styles.wordmarkFirst}>Eduardo</span>
              <span className={styles.wordmarkMiddle}>Motta</span>
              <span className={styles.wordmarkLast}>de Moraes</span>
            </span>
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
          <p className={styles.credit}>
            <span>© 2026 {NAME}</span>
            <span>Florianópolis, BR</span>
            <span>UTC−3</span>
          </p>
          <p className={styles.footerLinks}>
            <a
              href={GITHUB_URL}
              rel="noreferrer"
              {...umamiEventProps(GITHUB_URL, {
                event: "outbound-github",
                location: "footer",
              })}
            >
              GitHub
            </a>
            <span className={styles.slash} aria-hidden="true">
              /
            </span>
            <a
              href={LINKEDIN_URL}
              rel="noreferrer"
              {...umamiEventProps(LINKEDIN_URL, {
                event: "outbound-linkedin",
                location: "footer",
              })}
            >
              LinkedIn
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
