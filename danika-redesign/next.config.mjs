/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Optimised variants are kept for 31 days (Next's default is 60 s), so repeat visitors and the CDN rarely re-encode.
    minimumCacheTTL: 60 * 60 * 24 * 31,
    // Original-site photos are loaded remotely until you run `npm run images:fetch`
    // and set NEXT_PUBLIC_LOCAL_IMAGES=1 (see README).
    remotePatterns: [
      { protocol: 'https', hostname: 'danikaplumbing.com', pathname: '/wp-content/uploads/**' },
    ],
  },
  async headers() {
    const longCache = [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }];
    return [
      { source: '/images/:path*', headers: longCache },
      { source: '/brand/:path*', headers: longCache },
      { source: '/video/:path*', headers: longCache },
    ];
  },
};
export default nextConfig;
