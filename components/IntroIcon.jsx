import utilStyles from "../styles/utils.module.css";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const icons = {
  bio: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" {...stroke} />
      <circle cx="12" cy="7" r="4" {...stroke} />
    </>
  ),
  expertise: (
    <>
      <path d="m18 16 4-4-4-4" {...stroke} />
      <path d="m6 8-4 4 4 4" {...stroke} />
    </>
  ),
  background: (
    <>
      <path
        d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"
        {...stroke}
      />
      <path d="M9 7V5M15 7V5" {...stroke} />
    </>
  ),
  links: (
    <path
      d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5M14 11a5 5 0 0 0-7.07 0L5.52 12.41a5 5 0 1 0 7.07 7.07L14 17"
      {...stroke}
    />
  ),
  hobbies: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H18" {...stroke} />
      <path
        d="M6.5 2H18v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        {...stroke}
      />
    </>
  ),
};

export default function IntroIcon({ name }) {
  const icon = icons[name];
  if (!icon) return null;

  return (
    <svg
      className={utilStyles.introIcon}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {icon}
    </svg>
  );
}
