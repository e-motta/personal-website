import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import {
  isUmamiEnabled,
  UMAMI_DOMAINS,
  UMAMI_SCRIPT_SRC,
  UMAMI_WEBSITE_ID,
} from "../lib/analytics";
import "../styles/global.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
      {isUmamiEnabled() ? (
        <Script
          src={UMAMI_SCRIPT_SRC}
          data-website-id={UMAMI_WEBSITE_ID}
          data-domains={UMAMI_DOMAINS}
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
