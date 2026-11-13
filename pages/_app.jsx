import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import "../styles/global.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
      <Script
        src="https://stats.eduardomotta.dev/script.js"
        data-website-id="e3042b44-7ffc-454a-b8d6-2cc77802b884"
        strategy="afterInteractive"
      />
    </>
  );
}
