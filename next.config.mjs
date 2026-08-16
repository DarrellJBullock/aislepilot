/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  transpilePackages: [
    "@aislepilot/domain",
    "@aislepilot/design-tokens",
    "@aislepilot/validation",
  ],
};

export default nextConfig;
