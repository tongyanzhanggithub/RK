/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false
  },
  images: {
    remotePatterns: [
      // Vercel Blob storage (product / testimonial images uploaded from admin)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" }
    ]
  },
  async headers() {
    const securityHeaders = [
      // Force HTTPS for 2 years, including subdomains.
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      // Block the site from being framed (clickjacking protection).
      { key: "X-Frame-Options", value: "DENY" },
      // Stop browsers from MIME-sniffing responses.
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Don't leak full URLs to third parties.
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Lock down powerful browser features the site does not use.
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
    ];

    return [
      { source: "/:path*", headers: securityHeaders },
      // Admin pages must never be cached by shared caches or indexed.
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
      }
    ];
  }
};

export default nextConfig;
