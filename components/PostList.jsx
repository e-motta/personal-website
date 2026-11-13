import Link from "next/link";
import { formatDotDate } from "../lib/dates";
import styles from "./PostList.module.css";

export default function PostList({ posts }) {
  return (
    <div className={styles.list}>
      {posts.map((post) => (
        <Link key={post.id} href={`/posts/${post.id}`} className={styles.row}>
          <time dateTime={post.date} className={styles.date}>
            {formatDotDate(post.date)}
          </time>
          <span className={styles.title}>{post.title}</span>
        </Link>
      ))}
    </div>
  );
}
