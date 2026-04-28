/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.computrabajo.com" },
      { protocol: "https", hostname: "**.encuentra24.com" },
      { protocol: "https", hostname: "**.konzerta.com" },
      { protocol: "https", hostname: "**.hiringroom.com" },
      { protocol: "https", hostname: "**.myworkdayjobs.com" },
      { protocol: "https", hostname: "logo.clearbit.com" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
