import Layout from "../components/Layout";
import PostList from "../components/PostList";
import { getSortedPostsData } from "../lib/posts";
import styles from "../styles/writing.module.css";

function groupByYear(posts) {
  const groups = [];
  posts.forEach((post) => {
    const year = String(post.date).slice(0, 4);
    const last = groups[groups.length - 1];
    if (!last || last.year !== year) {
      groups.push({ year, posts: [post] });
    } else {
      last.posts.push(post);
    }
  });
  return groups;
}

export default function Writing({ groups }) {
  return (
    <Layout
      title="Writing"
      description="Notes on data systems, backend engineering, and software design by Eduardo Motta de Moraes."
    >
      <header className={`container ${styles.intro}`}>
        <h1 className={styles.title}>Writing</h1>
      </header>
      <div className={styles.pageEnd}>
        {groups.map((group) => (
          <section key={group.year} className={styles.group} aria-labelledby={`year-${group.year}`}>
            <div className={`container ${styles.groupGrid}`}>
              <h2 id={`year-${group.year}`} className={styles.year}>
                {group.year}
              </h2>
              <PostList posts={group.posts} />
            </div>
          </section>
        ))}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const posts = getSortedPostsData();
  return {
    props: {
      groups: groupByYear(posts),
    },
  };
}
