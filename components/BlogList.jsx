"use client";

import { useState } from "react";
import Link from "next/link";
import FormattedDate from "./FormattedDate";
import utilStyles from "../styles/utils.module.css";

const INITIAL_COUNT = 3;

export default function BlogList({ posts = [] }) {
  const [showAll, setShowAll] = useState(false);
  const visiblePosts = showAll ? posts : posts.slice(0, INITIAL_COUNT);
  const hasMore = posts.length > INITIAL_COUNT;

  return (
    <>
      <ul className={utilStyles.list}>
        {visiblePosts.map(({ id, date, title }) => (
          <li className={utilStyles.blogPost} key={id}>
            <Link href={`/posts/${id}`}>{title}</Link>
            <small className={utilStyles.lightText}>
              <FormattedDate dateString={date} />
            </small>
          </li>
        ))}
      </ul>
      {hasMore && !showAll && (
        <button
          type="button"
          className={utilStyles.showMoreButton}
          aria-expanded={false}
          onClick={() => setShowAll(true)}
        >
          Show more
        </button>
      )}
    </>
  );
}
