import type { NextConfig } from "next";

type RemotePattern = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>[number];

function getSupabaseRemotePatterns(): RemotePattern[] {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return [];
  try {
    const u = new URL(supabaseUrl);
    const protocol = (u.protocol === "http:" ? "http" : "https") as "http" | "https";
    const hostname = u.hostname;
    return [
      { protocol, hostname, pathname: "/storage/v1/object/public/avatars/**" },
      { protocol, hostname, pathname: "/storage/v1/object/public/**" },
      { protocol, hostname, pathname: "/storage/v1/object/sign/**" },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: getSupabaseRemotePatterns() },
};

export default nextConfig;
