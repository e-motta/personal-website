import Image from "next/image";
import Link from "next/link";
import PostList from "../components/PostList";
import Layout from "../components/Layout";
import { getSortedPostsData } from "../lib/posts";
import {
  earlierRoles,
  education,
  certifications,
  GITHUB_URL,
  GOODREADS_URL,
  LINKEDIN_URL,
  roles,
  STRAVA_URL,
} from "../lib/profile";
import styles from "../styles/home.module.css";

export default function Home({ posts }) {
  return (
    <Layout>
      <section className={`${styles.section} ${styles.about}`} id="about" aria-labelledby="about-label">
        <div className={`container ${styles.grid}`}>
          <h2 id="about-label" className={styles.kicker}>
            01 About
          </h2>
          <div className={styles.hero}>
            <div className={styles.photoFrame}>
              <Image
                src="/images/profile.jpeg"
                alt="Eduardo Motta de Moraes"
                fill
                sizes="120px"
                priority
                className={styles.photo}
              />
            </div>
            <h1 className={styles.title}>
              <span>Senior Software Engineer</span>
              <span>& Tech Lead</span>
            </h1>
            <div className={styles.heroBody}>
              <div className={styles.bio}>
                <p>
                  Hi, I&apos;m a Senior Software Engineer and Tech Lead with 5+ years of
                  experience in software development. I design and lead backend
                  architectures built with Python, FastAPI, PySpark, Kafka, PostgreSQL,
                  Docker, and Kubernetes. I drive system design, technical discovery,
                  cross-team architecture decisions, roadmap planning, and mentoring.
                </p>
                <p>
                  Being a former tax lawyer and law firm partner, I am strong at
                  translating complex regulatory rules into robust technical systems.
                </p>
                <p>
                  In my free time, I enjoy{" "}
                  <a href={GOODREADS_URL} rel="noreferrer">
                    reading
                  </a>{" "}
                  and{" "}
                  <a href={STRAVA_URL} rel="noreferrer">
                    running
                  </a>
                  .
                </p>
              </div>
              <p className={styles.meta}>Florianópolis, BR · UTC−3</p>
              <p className={styles.links}>
                <a href={GITHUB_URL} rel="noreferrer">
                  GitHub
                </a>
                <a href={LINKEDIN_URL} rel="noreferrer">
                  LinkedIn
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="experience" aria-labelledby="experience-label">
        <div className={`container ${styles.grid}`}>
          <h2 id="experience-label" className={styles.kicker}>
            02 Experience
          </h2>
          <div>
            <div className={styles.entries}>
              {roles.map((job) => (
                <article key={job.dates} className={styles.entry}>
                  <p className={styles.when}>
                    {job.current ? (
                      <span className={styles.marker} aria-hidden="true" />
                    ) : null}
                    {job.current ? <span className="sr-only">Current role. </span> : null}
                    {job.dates}
                  </p>
                  <div>
                    <h3 className={styles.roleLine}>
                      <span className={styles.role}>{job.role}</span>
                      {" · "}
                      {job.company}
                    </h3>
                    <ul className={styles.bullets}>
                      {job.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
            <div className={styles.earlier}>
              <p className={styles.earlierLabel}>Before software</p>
              <ul className={styles.earlierList}>
                {earlierRoles.map((job) => (
                  <li key={job.dates} className={styles.earlierItem}>
                    <p className={styles.earlierDate}>{job.dates}</p>
                    <p>{job.line}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="writing" aria-labelledby="writing-label">
        <div className={`container ${styles.grid}`}>
          <h2 id="writing-label" className={styles.kicker}>
            03 Writing
          </h2>
          <div className={styles.writing}>
            <PostList posts={posts} />
            <Link href="/writing" className={styles.more}>
              All writing →
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section} id="education" aria-labelledby="education-label">
        <div className={`container ${styles.grid}`}>
          <h2 id="education-label" className={styles.kicker}>
            04 Education
          </h2>
          <div className={styles.columns}>
            <div>
              <h3 className={styles.groupLabel}>Education</h3>
              {education.map((item) => (
                <article key={item.title} className={styles.credential}>
                  <p className={styles.credentialTitle}>{item.title}</p>
                  <p className={styles.issuer}>{item.issuer}</p>
                  {item.note ? <p className={styles.note}>{item.note}</p> : null}
                  <p className={styles.years}>{item.years}</p>
                </article>
              ))}
            </div>
            <div>
              <h3 className={styles.groupLabel}>Certifications</h3>
              {certifications.map((item) => (
                <article key={item.title} className={styles.credential}>
                  <p className={styles.credentialTitle}>{item.title}</p>
                  <p className={styles.issuer}>{item.issuer}</p>
                  <p className={styles.years}>{item.years}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      posts: allPostsData.slice(0, 5),
    },
  };
}
