import Head from "next/head";
import Link from "next/link";
import FormattedDate from "../components/FormattedDate";
import Layout, { siteTitle } from "../components/Layout";
import { getSortedPostsData } from "../lib/posts";
import utilStyles from "../styles/utils.module.css";

export default function Home({ allPostsData }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.homeIntro}>
        <p>
          Hi, I&apos;m a <strong>Senior Software Engineer</strong> and{" "}
          <strong>Tech Lead</strong> with 4+ years of experience in software
          development. I design and lead backend architectures built with
          Python, FastAPI, PySpark, Kafka, PostgreSQL, Docker, and Kubernetes.
        </p>
        <p>
          I drive system design, technical discovery, cross-team architecture
          decisions, roadmap planning, and mentoring.
        </p>
        <p>
          Being a former tax lawyer and law firm partner, I am strong at
          translating complex regulatory rules into robust technical systems.
        </p>
        <p>
          Check out my <a href="https://github.com/e-motta">GitHub</a> and my{" "}
          <a href="https://www.linkedin.com/in/eduardomottademoraes/">
            LinkedIn
          </a>
          .
        </p>
        <p>
          In my free time, I enjoy{" "}
          <a href="https://www.goodreads.com/user/show/27336946-eduardo-motta-de-moraes">
            reading
          </a>{" "}
          and <a href="https://www.strava.com/athletes/47176614">running</a>.
        </p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${id}`}>{title}</Link>
              <br />
              <small className={utilStyles.lightText}>
                <FormattedDate dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}
