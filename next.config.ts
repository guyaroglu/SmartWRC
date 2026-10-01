import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evidence uploads are capped at 25 MB in src/lib/evidence-file.ts; leave room for form fields.
  experimental: { serverActions: { bodySizeLimit: "26mb" } },
};

export default nextConfig;
