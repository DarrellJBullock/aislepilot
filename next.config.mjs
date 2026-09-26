/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next 14 needs this for src/instrumentation.ts (server error reporting).
  experimental: { instrumentationHook: true },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // @sentry/nextjs pulls in OpenTelemetry, whose dynamic requires webpack
  // flags as (harmless) warnings; silence just those.
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /node_modules[\\/]@opentelemetry[\\/]instrumentation/ },
      { module: /node_modules[\\/]@prisma[\\/]instrumentation/ },
      { module: /node_modules[\\/]require-in-the-middle/ },
    ];
    return config;
  },
  transpilePackages: [
    "@aislepilot/domain",
    "@aislepilot/design-tokens",
    "@aislepilot/validation",
  ],
};

export default nextConfig;
