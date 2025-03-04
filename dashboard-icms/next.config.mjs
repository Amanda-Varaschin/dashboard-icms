/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
      API_BASE_URL: "https://server-icms.onrender.com",
      TESOURO_URL: "https://server-icms.onrender.com/dados-json-tesouro",
      SICONFI_URL: "https://server-icms.onrender.com/dados-json-siconfi"
    }
  };
  
  export default nextConfig;
  