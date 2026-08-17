/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // Backend origin used by the /api proxy.
    // Priority: BACKEND_URL (origin, no path) -> NEXT_PUBLIC_API_URL (with /api stripped) -> local dev default.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const backendOrigin =
      process.env.BACKEND_URL ||
      apiUrl.replace(/\/api\/?$/, "") ||
      "http://localhost:5000";

    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
