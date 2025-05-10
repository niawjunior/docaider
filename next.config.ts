import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yahuypxwczxcfxrcpudu.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "cdn.bitkubnow.com",
        port: "",
        pathname: "/coins/icon/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
