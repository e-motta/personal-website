import Head from "next/head";
import Link from "next/link";
import Layout from "../../components/Layout";
import styles from "../../styles/certificate.module.css";

export default function Certificate({ certificate }) {
  const description = `${certificate.title} certificate from ${certificate.issuer}.`;
  const { image } = certificate;

  return (
    <Layout title={certificate.title} description={description} canonical={false}>
      <Head>
        <meta name="robots" content="noindex, noimageindex" />
      </Head>
      <article className={styles.page}>
        <div className={styles.column}>
          <p className={styles.meta}>
            {certificate.issuer}
            {" · "}
            {certificate.years}
          </p>
          <h1 className={styles.title}>{certificate.title}</h1>
          {/* Plain img, not next/image: the file URL sends X-Robots-Tag: noindex.
              The optimizer would publish a second URL without that header. */}
          <img
            className={styles.image}
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
          />
          <p className={styles.back}>
            <Link href="/#education">Back to education</Link>
          </p>
        </div>
      </article>
    </Layout>
  );
}

export async function getStaticPaths() {
  const { certificateSlugs } = await import("../../lib/certificates");
  return {
    paths: certificateSlugs().map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { getCertificate } = await import("../../lib/certificates");
  const certificate = getCertificate(params.slug);
  if (!certificate) return { notFound: true };
  return { props: { certificate } };
}
