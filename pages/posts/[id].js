import Head from "next/head";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote";
import Layout from "../../components/Layout";
import TableOfContents from "../../components/TableOfContents";
import { mdxComponents } from "../../components/mdx";
import { formatMetaDate } from "../../lib/dates";
import { getAllPostIds, getPostData, getSortedPostsData } from "../../lib/posts";
import styles from "../../styles/post.module.css";

export default function Post({ postData, newer, older }) {
  return (
    <Layout title={postData.title} description={postData.excerpt}>
      <Head>
        <meta property="article:published_time" content={postData.date} />
      </Head>
      <div className={styles.article}>
        <TableOfContents headings={postData.headings} />
        <article className={styles.column}>
          <p className={styles.meta}>
            <time dateTime={postData.date}>{formatMetaDate(postData.date)}</time>
            {" · "}
            {postData.minutes} min read
          </p>
          <h1 className={styles.title}>{postData.title}</h1>
          <div className={styles.prose}>
            <MDXRemote {...postData.contentHtml} components={mdxComponents} />
          </div>
          <nav className={styles.pager} aria-label="More posts">
            {older ? (
              <Link href={`/posts/${older.id}`} className={styles.pagerLink}>
                <span className={styles.pagerKicker}>← Previous post</span>
                <span className={styles.pagerTitle}>{older.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {newer ? (
              <Link
                href={`/posts/${newer.id}`}
                className={`${styles.pagerLink} ${styles.pagerNext}`}
              >
                <span className={styles.pagerKicker}>Next post →</span>
                <span className={styles.pagerTitle}>{newer.title}</span>
              </Link>
            ) : null}
          </nav>
        </article>
      </div>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);
  const all = getSortedPostsData();
  const index = all.findIndex((post) => post.id === params.id);

  return {
    props: {
      postData,
      newer: index > 0 ? all[index - 1] : null,
      older: index >= 0 && index < all.length - 1 ? all[index + 1] : null,
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: getAllPostIds(),
    fallback: false,
  };
}
