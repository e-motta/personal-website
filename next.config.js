/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // The certificate files stay available to visitors. noindex tells
        // Google not to index them or use them as a result thumbnail.
        source: "/images/certificates/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
      {
        source: "/certificates/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, noimageindex" }],
      },
    ];
  },
};

module.exports = nextConfig;
