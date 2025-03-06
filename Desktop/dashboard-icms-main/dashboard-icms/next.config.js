/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL: "https://dashboard-icms.onrender.com",
  },
};

module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", 
        destination: "https://dashboard-icms.onrender.com/:path*"
      }
    ];
  },
};

